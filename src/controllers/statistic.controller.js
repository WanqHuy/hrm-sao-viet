const Employee = require('../models/Employee');
const Department = require('../models/Department');

exports.getGeneralStatistics = async (req, res, next) => {
  try {
    // 1. Phân bổ nhân sự theo phòng ban
    const departmentStats = await Employee.aggregate([
      { $match: { status: { $ne: 'TERMINATED' } } },
      {
        $group: {
          _id: '$department',
          totalEmployees: { $sum: 1 },
          avgBaseSalary: { $avg: '$baseSalary' }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'deptInfo'
        }
      },
      { $unwind: '$deptInfo' },
      {
        $project: {
          _id: 1,
          departmentName: '$deptInfo.name',
          totalEmployees: 1,
          avgBaseSalary: { $round: ['$avgBaseSalary', 0] }
        }
      }
    ]);

    // 2. Biến động nhân sự theo trạng thái
    const statusStats = await Employee.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalActive = await Employee.countDocuments({ status: 'ACTIVE' });
    const totalDepartments = await Department.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalActiveEmployees: totalActive,
          totalDepartments
        },
        departmentStats,
        statusStats
      }
    });
  } catch (err) { next(err); }
};