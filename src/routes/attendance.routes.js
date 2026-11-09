const express = require('express');
const router = express.Router();
const attCtrl = require('../controllers/attendance.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);
router.post('/check-in', attCtrl.checkIn);
router.post('/check-out', attCtrl.checkOut);
router.get('/my-logs', attCtrl.getMyAttendance);

module.exports = router;