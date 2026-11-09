const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const departmentRoutes = require('./department.routes');
const positionRoutes = require('./position.routes');
const employeeRoutes = require('./employee.routes');
const attendanceRoutes = require('./attendance.routes');
const leaveRequestRoutes = require('./leaveRequest.routes');
const payrollRoutes = require('./payroll.routes');
const statisticController = require('../controllers/statistic.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Root v1 router
router.use('/auth', authRoutes);
router.use('/departments', departmentRoutes);
router.use('/positions', positionRoutes);
router.use('/employees', employeeRoutes);
router.use('/attendances', attendanceRoutes);
router.use('/leave-requests', leaveRequestRoutes);
router.use('/payrolls', payrollRoutes);
router.get('/statistics', protect, authorize('HR_ADMIN', 'MANAGER'), statisticController.getGeneralStatistics);

module.exports = router;