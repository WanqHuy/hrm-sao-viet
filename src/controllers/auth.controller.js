const User = require('../models/User');
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    const user = await User.create({ username, email, password, role });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      data: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp username và password' });
    }

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' });
    }

    const token = signToken(user._id);
    const employee = await Employee.findOne({ user: user._id }).populate('department position');

    res.status(200).json({
      success: true,
      token,
      data: {
        user: { id: user._id, username: user.username, email: user.email, role: user.role },
        employee
      }
    });
  } catch (error) {
    next(error);
  }
};