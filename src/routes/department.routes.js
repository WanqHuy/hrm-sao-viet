const express = require('express');
const router = express.Router();
const deptCtrl = require('../controllers/department.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.get('/', deptCtrl.getDepartments);
router.post('/', authorize('HR_ADMIN'), deptCtrl.createDepartment);
router.put('/:id', authorize('HR_ADMIN'), deptCtrl.updateDepartment);
router.delete('/:id', authorize('HR_ADMIN'), deptCtrl.deleteDepartment);

module.exports = router;