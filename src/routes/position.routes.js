const express = require('express');
const router = express.Router();
const posCtrl = require('../controllers/position.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.get('/', posCtrl.getPositions);
router.post('/', authorize('HR_ADMIN'), posCtrl.createPosition);
router.put('/:id', authorize('HR_ADMIN'), posCtrl.updatePosition);
router.delete('/:id', authorize('HR_ADMIN'), posCtrl.deletePosition);

module.exports = router;