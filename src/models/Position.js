const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  baseSalaryGrade: { type: Number, default: 1 },
  allowance: { type: Number, default: 0 } // Phụ cấp chức vụ
}, { timestamps: true });

module.exports = mongoose.model('Position', positionSchema);