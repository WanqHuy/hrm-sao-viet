const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);