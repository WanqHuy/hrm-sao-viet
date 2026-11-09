const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  checkIn: { type: Date },
  checkOut: { type: Date },
  isLate: { type: Boolean, default: false },
  isEarlyLeave: { type: Boolean, default: false },
  workHours: { type: Number, default: 0 },
  status: { type: String, enum: ['PRESENT', 'HALF_DAY', 'ABSENT'], default: 'PRESENT' }
}, { timestamps: true });

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);