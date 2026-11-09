const Position = require('../models/Position');

exports.createPosition = async (req, res, next) => {
  try {
    const position = await Position.create(req.body);
    res.status(201).json({ success: true, data: position });
  } catch (err) { next(err); }
};

exports.getPositions = async (req, res, next) => {
  try {
    const positions = await Position.find();
    res.status(200).json({ success: true, count: positions.length, data: positions });
  } catch (err) { next(err); }
};

exports.updatePosition = async (req, res, next) => {
  try {
    const pos = await Position.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pos) return res.status(404).json({ success: false, message: 'Không tìm thấy chức vụ' });
    res.status(200).json({ success: true, data: pos });
  } catch (err) { next(err); }
};

exports.deletePosition = async (req, res, next) => {
  try {
    const pos = await Position.findByIdAndDelete(req.params.id);
    if (!pos) return res.status(404).json({ success: false, message: 'Không tìm thấy chức vụ' });
    res.status(200).json({ success: true, message: 'Đã xóa chức vụ thành công' });
  } catch (err) { next(err); }
};