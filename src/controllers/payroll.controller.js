const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const ExcelJS = require('exceljs');

// Sinh bảng lương tháng ở server
// Format query: ?month=10-2026
exports.generatePayrolls = async (req, res, next) => {
  try {
    const { month } = req.query;
    if (!month || !/^\d{2}-\d{4}$/.test(month)) {
      return res.status(400).json({ success: false, message: 'Định dạng tháng hợp lệ là MM-YYYY (ví dụ: 10-2026)' });
    }

    const [m, y] = month.split('-');
    const startDateStr = `${y}-${m}-01`;
    const endDateStr = `${y}-${m}-31`;

    const employees = await Employee.find({ status: { $ne: 'TERMINATED' } }).populate('position');
    const payrollResults = [];

    const STANDARD_DAYS = 22;
    const LATE_PENALTY_AMOUNT = 50000; // Phạt 50,000 VND / lần đi muộn

    for (const emp of employees) {
      // Đếm số ngày công và số lần đi muộn
      const attendances = await Attendance.find({
        employee: emp._id,
        date: { $gte: startDateStr, $lte: endDateStr }
      });

      let workingDays = 0;
      let lateDaysCount = 0;

      attendances.forEach(att => {
        if (att.status === 'PRESENT') workingDays += 1;
        if (att.status === 'HALF_DAY') workingDays += 0.5;
        if (att.isLate) lateDaysCount += 1;
      });

      const positionAllowance = emp.position?.allowance || 0;
      const dailySalary = emp.baseSalary / STANDARD_DAYS;
      const actualBaseSalary = dailySalary * workingDays;
      const deductions = lateDaysCount * LATE_PENALTY_AMOUNT;
      const netSalary = Math.round(actualBaseSalary + positionAllowance - deductions);

      const payroll = await Payroll.findOneAndUpdate(
        { employee: emp._id, month },
        {
          baseSalary: emp.baseSalary,
          workingDays,
          standardWorkingDays: STANDARD_DAYS,
          lateDaysCount,
          allowance: positionAllowance,
          deductions,
          netSalary: netSalary > 0 ? netSalary : 0,
          status: 'DRAFT'
        },
        { upsert: true, new: true }
      );

      payrollResults.push(payroll);
    }

    res.status(200).json({
      success: true,
      message: `Đã tính toán bảng lương tháng ${month} cho ${payrollResults.length} nhân viên`,
      data: payrollResults
    });
  } catch (err) { next(err); }
};

// Lấy danh sách bảng lương tháng
exports.getPayrolls = async (req, res, next) => {
  try {
    const { month } = req.query;
    const filter = {};
    if (month) filter.month = month;
    if (req.user.role === 'EMPLOYEE') filter.employee = req.employee._id;

    const payrolls = await Payroll.find(filter)
      .populate({
        path: 'employee',
        select: 'fullName employeeCode department',
        populate: { path: 'department', select: 'name' }
      });

    res.status(200).json({ success: true, count: payrolls.length, data: payrolls });
  } catch (err) { next(err); }
};

// Xuất file Excel bảng lương tháng
exports.exportPayrollExcel = async (req, res, next) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp tham số tháng (?month=MM-YYYY)' });
    }

    const payrolls = await Payroll.find({ month }).populate({
      path: 'employee',
      populate: [{ path: 'department' }, { path: 'position' }]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`BangLuong_${month}`);

    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 6 },
      { header: 'Mã NV', key: 'code', width: 12 },
      { header: 'Họ Và Tên', key: 'fullName', width: 25 },
      { header: 'Phòng Ban', key: 'department', width: 20 },
      { header: 'Chức Vụ', key: 'position', width: 18 },
      { header: 'Lương Cơ Bản', key: 'baseSalary', width: 15 },
      { header: 'Ngày Công', key: 'workingDays', width: 12 },
      { header: 'Đi Muộn (lần)', key: 'lateDays', width: 14 },
      { header: 'Phụ Cấp', key: 'allowance', width: 14 },
      { header: 'Khấu Trừ', key: 'deductions', width: 14 },
      { header: 'Thực Lĩnh (VNĐ)', key: 'netSalary', width: 18 },
      { header: 'Trạng Thái', key: 'status', width: 12 }
    ];

    payrolls.forEach((p, idx) => {
      worksheet.addRow({
        stt: idx + 1,
        code: p.employee?.employeeCode,
        fullName: p.employee?.fullName,
        department: p.employee?.department?.name,
        position: p.employee?.position?.name,
        baseSalary: p.baseSalary.toLocaleString('vi-VN'),
        workingDays: p.workingDays,
        lateDays: p.lateDaysCount,
        allowance: p.allowance.toLocaleString('vi-VN'),
        deductions: p.deductions.toLocaleString('vi-VN'),
        netSalary: p.netSalary.toLocaleString('vi-VN'),
        status: p.status
      });
    });

    // Định dạng header
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center' };
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Bang_Luong_${month}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) { next(err); }
};