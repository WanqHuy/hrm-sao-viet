const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: String, required: true }, // Format: MM-YYYY (e.g., 10-2026)
  baseSalary: { type: Number, required: true },
  workingDays: { type: Number, required: true, default: 0 }, // Số ngày công thực tế
  standardWorkingDays: { type: Number, required: true, default: 22 }, // Ngày chuẩn trong tháng
  lateDaysCount: { type: Number, default: 0 },
  allowance: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 }, // Phạt đi muộn, bảo hiểm, v.v.
  netSalary: { type: Number, required: true },
  status: { type: String, enum: ['DRAFT', 'PAID'], default: 'DRAFT' }
}, { timestamps: true });

payrollSchema.index({ employee: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);