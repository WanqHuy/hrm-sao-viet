const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  employeeCode: { type: String, required: true, unique: true, uppercase: true },
  fullName: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], default: 'OTHER' },
  phone: { type: String },
  address: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  position: { type: mongoose.Schema.Types.ObjectId, ref: 'Position', required: true },
  baseSalary: { type: Number, required: true, default: 5000000 },
  annualLeaveBalance: { type: Number, default: 12 }, // Số ngày phép còn lại
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['ACTIVE', 'PROBATION', 'TERMINATED'], default: 'ACTIVE' },
  faceDescriptor: { type: [Number], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);