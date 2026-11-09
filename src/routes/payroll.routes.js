const express = require('express');
const router = express.Router();
const payrollCtrl = require('../controllers/payroll.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.get('/', payrollCtrl.getPayrolls);
router.post('/generate', authorize('HR_ADMIN'), payrollCtrl.generatePayrolls);
router.get('/export-excel', authorize('HR_ADMIN'), payrollCtrl.exportPayrollExcel);

module.exports = router;