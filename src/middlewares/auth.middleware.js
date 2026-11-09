const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Bạn chưa đăng nhập hoặc token không hợp lệ' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại hoặc đã bị khóa' });
    }

    const employee = await Employee.findOne({ user: user._id });
    req.user = user;
    req.employee = employee; // Có thể null nếu là super admin thuần túy
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token hết hạn hoặc không hợp lệ' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Tài khoản quyền '${req.user.role}' không được phép thực hiện hành động này` 
      });
    }
    next();
  };
};