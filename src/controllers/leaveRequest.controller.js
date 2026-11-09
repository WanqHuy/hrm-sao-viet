const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');
const { sendEmail } = require('../utils/email.util');

exports.createLeaveRequest = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, durationDays, reason } = req.body;
    const employee = await Employee.findById(req.employee._id);

    if (leaveType === 'ANNUAL' && employee.annualLeaveBalance < durationDays) {
      return res.status(400).json({
        success: false,
        message: `Số ngày phép năm còn lại (${employee.annualLeaveBalance}) không đủ cho yêu cầu (${durationDays} ngày).`
      });
    }

    const leave = await LeaveRequest.create({
      employee: employee._id,
      leaveType,
      startDate,
      endDate,
      durationDays,
      reason
    });

    res.status(201).json({ success: true, message: 'Đã gửi đơn xin nghỉ phép thành công', data: leave });
  } catch (err) { next(err); }
};

exports.getLeaveRequests = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'EMPLOYEE') {
      filter.employee = req.employee._id;
    } else if (req.user.role === 'MANAGER') {
      // Trưởng phòng xem đơn của nhân viên cùng phòng ban
      const deptEmployees = await Employee.find({ department: req.employee.department }).select('_id');
      filter.employee = { $in: deptEmployees.map(e => e._id) };
    }

    const requests = await LeaveRequest.find(filter)
      .populate('employee', 'fullName employeeCode')
      .populate('approvedBy', 'fullName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (err) { next(err); }
};

exports.approveOrRejectLeave = async (req, res, next) => {
  try {
    const { status, rejectReason } = req.body; // status: 'APPROVED' | 'REJECTED'
    const leave = await LeaveRequest.findById(req.params.id).populate({
      path: 'employee',
      populate: { path: 'user', select: 'email fullName' }
    });

    if (!leave) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn xin nghỉ' });
    if (leave.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Đơn này đã được duyệt hoặc từ chối trước đó' });
    }

    leave.status = status;
    leave.approvedBy = req.employee ? req.employee._id : null;

    if (status === 'APPROVED') {
      if (leave.leaveType === 'ANNUAL') {
        const emp = await Employee.findById(leave.employee._id);
        emp.annualLeaveBalance = Math.max(0, emp.annualLeaveBalance - leave.durationDays);
        await emp.save();
      }
    } else if (status === 'REJECTED') {
      leave.rejectReason = rejectReason || 'Không được phê duyệt';
    }

    await leave.save();

    // Gửi email thông báo cho nhân viên
    if (leave.employee?.user?.email) {
      const emailContent = `
        <h3>Chào ${leave.employee.fullName},</h3>
        <p>Đơn nghỉ phép của bạn (từ ngày ${new Date(leave.startDate).toLocaleDateString()} đến ${new Date(leave.endDate).toLocaleDateString()}) đã được <b>${status === 'APPROVED' ? 'CHẤP THUẬN' : 'TỪ CHỐI'}</b>.</p>
        ${status === 'REJECTED' ? `<p><b>Lý do:</b> ${leave.rejectReason}</p>` : ''}
        <br/>
        <p>Trân trọng,<br/>Phòng Nhân Sự Công Ty Sao Việt</p>
      `;
      sendEmail({
        to: leave.employee.user.email,
        subject: `[Sao Việt HRM] Kết quả duyệt đơn nghỉ phép - ${status}`,
        html: emailContent
      });
    }

    res.status(200).json({ success: true, message: `Đơn xin nghỉ phép đã được chuyển sang trạng thái: ${status}`, data: leave });
  } catch (err) { next(err); }
};