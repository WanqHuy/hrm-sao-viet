const express = require('express');
const router = express.Router();
const empCtrl = require('../controllers/employee.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);

// 1. Route lấy danh sách
router.get('/', empCtrl.getEmployees);

// 2. QUAN TRỌNG: Route cụ thể phải đặt TRƯỚC route /:id
router.get('/my-face-descriptor', empCtrl.getMyFaceDescriptor);

// 3. Route có tham số :id đặt ở phía dưới
router.get('/:id', empCtrl.getEmployeeById);

// Các thao tác quản trị dành cho HR
router.post('/', authorize('HR_ADMIN'), empCtrl.createEmployee);
router.put('/:id', authorize('HR_ADMIN'), empCtrl.updateEmployee);
router.delete('/:id', authorize('HR_ADMIN'), empCtrl.deleteEmployee);

module.exports = router;