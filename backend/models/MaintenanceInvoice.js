const mongoose = require('mongoose');
const { Schema } = mongoose;

const PaymentSchema = new Schema(
  {
    at: { type: Date, default: Date.now },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE'],
      required: true,
    },
    ref: { type: String, trim: true },
  },
  { _id: false }
);

const MaintenanceInvoiceSchema = new Schema(
  {
    communityId: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
      index: true,
    },
    residentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    period: {
      type: String, // YYYY-MM
      required: true,
      match: /^\d{4}-\d{2}$/,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'OVERDUE', 'WAIVED'],
      default: 'PENDING',
      index: true,
    },
    payments: {
      type: [PaymentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Prevent duplicate invoices
MaintenanceInvoiceSchema.index(
  { communityId: 1, residentId: 1, period: 1 },
  { unique: true }
);

// Helper virtuals
MaintenanceInvoiceSchema.virtual('paidAmount').get(function () {
  return this.payments.reduce((sum, p) => sum + p.amount, 0);
});

MaintenanceInvoiceSchema.virtual('balance').get(function () {
  return Math.max(0, this.amount - this.paidAmount);
});

MaintenanceInvoiceSchema.set('toJSON', { virtuals: true });
MaintenanceInvoiceSchema.set('toObject', { virtuals: true });

module.exports =
  mongoose.models.MaintenanceInvoice ||
  mongoose.model('MaintenanceInvoice', MaintenanceInvoiceSchema);
