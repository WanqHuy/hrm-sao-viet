const Department = require('../models/Department');

exports.createDepartment = async (req, res, next) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json({ success: true, data: department });
  } catch (err) { next(err); }
};

exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('manager', 'fullName employeeCode');
    res.status(200).json({ success: true, count: departments.length, data: departments });
  } catch (err) { next(err); }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!department) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng ban' });
    res.status(200).json({ success: true, data: department });
  } catch (err) { next(err); }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng ban' });
    res.status(200).json({ success: true, message: 'Đã xóa phòng ban thành công' });
  } catch (err) { next(err); }
};