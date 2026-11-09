const Employee = require('../models/Employee');
const User = require('../models/User');

exports.createEmployee = async (req, res, next) => {
  try {
    const { username, email, password, role, faceDescriptor, ...empData } = req.body;
    
    const user = await User.create({
      username,
      email,
      password: password || 'SaoViet@123',
      role: role || 'EMPLOYEE'
    });

    const employee = await Employee.create({
      ...empData,
      faceDescriptor: faceDescriptor || [],
      user: user._id
    });

    res.status(201).json({ success: true, data: employee });
  } catch (err) { next(err); }
};

exports.getMyFaceDescriptor = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(404).json({ success: false, message: 'Hồ sơ nhân viên không tồn tại' });
    }
    // Lấy đầy đủ mảng faceDescriptor
    const emp = await Employee.findById(req.employee._id).select('faceDescriptor fullName employeeCode');
    
    res.status(200).json({ 
      success: true, 
      data: {
        employeeCode: emp.employeeCode,
        fullName: emp.fullName,
        faceDescriptor: emp.faceDescriptor || []
      }
    });
  } catch (err) { next(err); }
};

exports.getEmployees = async (req, res, next) => {
  try {
    const { department, search, status } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { employeeCode: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(filter)
      .populate('department', 'name code')
      .populate('position', 'name allowance')
      .populate('user', 'username email role isActive');

    res.status(200).json({ success: true, count: employees.length, data: employees });
  } catch (err) { next(err); }
};

exports.getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department position user');
    if (!employee) return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
    res.status(200).json({ success: true, data: employee });
  } catch (err) { next(err); }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!employee) return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
    res.status(200).json({ success: true, data: employee });
  } catch (err) { next(err); }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
    
    // Cập nhật trạng thái nghỉ việc (Soft delete) hoặc xóa liên kết
    employee.status = 'TERMINATED';
    await employee.save();
    await User.findByIdAndUpdate(employee.user, { isActive: false });

    res.status(200).json({ success: true, message: 'Đã vô hiệu hóa tài khoản và cập nhật nhân viên thôi việc' });
  } catch (err) { next(err); }
};