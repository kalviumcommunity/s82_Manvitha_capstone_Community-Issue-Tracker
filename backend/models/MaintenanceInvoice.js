const mongoose = require('mongoose');
const { Schema } = mongoose;

const MaintenanceInvoiceSchema = new Schema({
  communityId: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
  residentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  period: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: Date,
  status: { type: String, enum: ['PENDING', 'PAID', 'OVERDUE', 'WAIVED'], default: 'PENDING' },
  payments: [{ at: Date, amount: Number, method: String, ref: String }]
}, { timestamps: true });

module.exports = mongoose.models.MaintenanceInvoice || mongoose.model('MaintenanceInvoice', MaintenanceInvoiceSchema);
