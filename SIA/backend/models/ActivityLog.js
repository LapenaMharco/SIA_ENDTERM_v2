const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin user is required'],
    index: true,
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'TICKET_STATUS_UPDATE',
      'TICKET_COMMENT_ADDED',
      'TICKET_RECEIPT_APPROVED',
      'TICKET_RECEIPT_REJECTED',
      'CATEGORY_CREATED',
      'CATEGORY_UPDATED',
      'CATEGORY_DELETED',
      'COURSE_CREATED',
      'COURSE_UPDATED',
      'COURSE_DELETED',
      'OFFICE_CREATED',
      'OFFICE_UPDATED',
      'OFFICE_DELETED',
      'QUEUE_REORDERED',
      'QUEUE_REMOVED',
      'CATEGORY_OFFICE_MAPPING_UPDATED',
    ],
    index: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    default: null,
    index: true,
  },
  ticketNumber: {
    type: String,
    default: null,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Index for better query performance
activityLogSchema.index({ admin: 1, createdAt: -1 });
activityLogSchema.index({ ticketId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

// Populate admin information by default
activityLogSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'admin',
    select: 'username email firstName lastName',
  });
  next();
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);

