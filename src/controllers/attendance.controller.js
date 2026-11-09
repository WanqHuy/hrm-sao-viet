const Attendance = require('../models/Attendance');

// Quy định giờ làm việc: Check-in muộn sau 08:30, Check-out sớm trước 17:30
const LATE_THRESHOLD_MINUTES = 8 * 60 + 30; // 08:30 AM
const EARLY_LEAVE_MINUTES = 17 * 60 + 30;   // 17:30 PM

exports.checkIn = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(400).json({ success: false, message: 'Hồ sơ nhân viên không tồn tại' });
    }

    const { faceVerified } = req.body;
    if (!faceVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Khuôn mặt chưa được xác thực hoặc không khớp với hồ sơ nhân viên!' 
      });
    }

    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
    const now = new Date();

    let attendance = await Attendance.findOne({ employee: req.employee._id, date: todayStr });
    if (attendance && attendance.checkIn) {
      return res.status(400).json({ success: false, message: 'Hôm nay bạn đã check-in rồi' });
    }

    const vnParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(now);

    const hour = parseInt(vnParts.find(p => p.type === 'hour').value, 10);
    const minute = parseInt(vnParts.find(p => p.type === 'minute').value, 10);
    const currentMinutes = hour * 60 + minute;
    const isLate = currentMinutes > (8 * 60 + 30); // Sau 08:30

    attendance = await Attendance.create({
      employee: req.employee._id,
      date: todayStr,
      checkIn: now,
      isLate,
      status: 'PRESENT'
    });

    res.status(201).json({
      success: true,
      message: `Quét mặt thành công! Vào ca lúc ${now.toLocaleTimeString('vi-VN')}. ${isLate ? '(Đi muộn)' : ''}`,
      data: attendance
    });
  } catch (err) { next(err); }
};

exports.checkOut = async (req, res, next) => {
  try {
    if (!req.employee) {
      return res.status(400).json({ success: false, message: 'Hồ sơ nhân viên không tồn tại' });
    }

    const { faceVerified } = req.body;
    if (!faceVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Khuôn mặt chưa được xác thực hoặc không khớp với hồ sơ nhân viên!' 
      });
    }

    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
    const now = new Date();

    const attendance = await Attendance.findOne({ employee: req.employee._id, date: todayStr });
    
    // Kiểm tra đã check-in chưa
    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ success: false, message: 'Bạn chưa thực hiện check-in hôm nay!' });
    }

    // Chặn check-out lần 2
    if (attendance.checkOut) {
      const checkedOutTime = new Date(attendance.checkOut).toLocaleTimeString('vi-VN');
      return res.status(400).json({ 
        success: false, 
        message: `Hôm nay bạn đã check-out ra ca lúc ${checkedOutTime} rồi!` 
      });
    }

    const vnParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(now);

    const hour = parseInt(vnParts.find(p => p.type === 'hour').value, 10);
    const minute = parseInt(vnParts.find(p => p.type === 'minute').value, 10);
    const currentMinutes = hour * 60 + minute;
    const isEarlyLeave = currentMinutes < (17 * 60 + 30); // Trước 17:30 tính về sớm

    // Tính tổng giờ làm
    const diffMs = now - attendance.checkIn;
    const workHours = +(diffMs / (1000 * 60 * 60)).toFixed(2);

    attendance.checkOut = now;
    attendance.isEarlyLeave = isEarlyLeave;
    attendance.workHours = workHours;
    attendance.status = workHours >= 4 ? (workHours >= 7 ? 'PRESENT' : 'HALF_DAY') : 'ABSENT';

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Quét mặt thành công! Ra ca lúc ${now.toLocaleTimeString('vi-VN')}. Tổng giờ làm: ${workHours}h. ${isEarlyLeave ? '(Về sớm)' : ''}`,
      data: attendance
    });
  } catch (err) { next(err); }
};

exports.getMyAttendance = async (req, res, next) => {
  try {
    const { month } = req.query; // YYYY-MM
    const query = { employee: req.employee._id };
    if (month) {
      query.date = { $regex: `^${month}` };
    }
    const logs = await Attendance.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (err) { next(err); }
};