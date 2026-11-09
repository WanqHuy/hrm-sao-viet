const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  leaveType: { 
    type: String, 
    enum: ['ANNUAL', 'SICK', 'UNPAID', 'MATERNITY'], 
    default: 'ANNUAL' 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  durationDays: { type: Number, required: true, min: 0.5 },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED'], 
    default: 'PENDING' 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  rejectReason: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);