const mongoose = require('mongoose');
const Department = require('../models/Department');
const Position = require('../models/Position');

const seedInitialData = async () => {
  try {
    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      await Department.insertMany([
        { code: 'DEV', name: 'Phòng Phát Triển Phần Mềm', description: 'Lập trình viên, kỹ sư hệ thống' },
        { code: 'QA_QC', name: 'Phòng Kiểm Thử (QA/QC)', description: 'Kiểm thử chất lượng sản phẩm' },
        { code: 'HR', name: 'Phòng Nhân Sự & Hành Chính', description: 'Tuyển dụng, đào tạo, tính lương' },
        { code: 'SALES_MKT', name: 'Phòng Kinh Doanh & Marketing', description: 'Phát triển thị trường và khách hàng' }
      ]);
      console.log('[Seed] -> Đã tự động tạo 4 Phòng ban chuẩn');
    }

    const posCount = await Position.countDocuments();
    if (posCount === 0) {
      await Position.insertMany([
        { code: 'DEV_FULLSTACK', name: 'Lập Trình Viên Fullstack', allowance: 1000000 },
        { code: 'DEV_FRONTEND', name: 'Lập Trình Viên Frontend', allowance: 500000 },
        { code: 'DEV_BACKEND', name: 'Lập Trình Viên Backend', allowance: 800000 },
        { code: 'QA_TESTER', name: 'Kỹ Sư Kiểm Thử (Tester)', allowance: 500000 },
        { code: 'HR_EXECUTIVE', name: 'Chuyên Viên Nhân Sự', allowance: 500000 },
        { code: 'TEAM_LEAD', name: 'Trưởng Nhóm / Quản Lý', allowance: 2500000 }
      ]);
      console.log('[Seed] -> Đã tự động tạo 6 Chức vụ chuẩn');
    }
  } catch (error) {
    console.error('[Seed Error]', error.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    // Tự động kiểm tra và khởi tạo dữ liệu
    await seedInitialData();
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;