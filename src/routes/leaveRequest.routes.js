const express = require('express');
const router = express.Router();
const leaveCtrl = require('../controllers/leaveRequest.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.post('/', leaveCtrl.createLeaveRequest);
router.get('/', leaveCtrl.getLeaveRequests);
router.patch('/:id/approve', authorize('HR_ADMIN', 'MANAGER'), leaveCtrl.approveOrRejectLeave);

module.exports = router;