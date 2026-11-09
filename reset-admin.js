require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[MongoDB] Đã kết nối cơ sở dữ liệu...');

    // Xóa tài khoản hradmin cũ nếu có
    await User.deleteOne({ username: 'hradmin' });

    // Tạo lại tài khoản qua User.create để Mongoose pre('save') tự băm bcrypt chuẩn
    const user = await User.create({
      username: 'hradmin',
      email: 'hradmin@saoviet.com',
      password: '123123',
      role: 'HR_ADMIN',
      isActive: true
    });

    console.log('----------------------------------------------------');
    console.log(' TẠO TÀI KHOẢN HR ADMIN THÀNH CÔNG:');
    console.log(' - Username:', user.username);
    console.log(' - Password:  123123');
    console.log(' - Role:     ', user.role);
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Lỗi khởi tạo:', error);
    process.exit(1);
  }
}

createAdmin();