const ActivityLog = require('../models/ActivityLog');

/**
 * Log an admin activity
 * @param {Object} params - Activity log parameters
 * @param {String} params.adminId - Admin user ID
 * @param {String} params.action - Action type (from enum in ActivityLog model)
 * @param {String} params.description - Human-readable description
 * @param {String} params.ticketId - Optional ticket ID
 * @param {String} params.ticketNumber - Optional ticket number
 * @param {Object} params.details - Optional additional details
 */
const logActivity = async ({
  adminId,
  action,
  description,
  ticketId = null,
  ticketNumber = null,
  details = {},
}) => {
  try {
    const activityLog = new ActivityLog({
      admin: adminId,
      action,
      description,
      ticketId,
      ticketNumber,
      details,
    });
    await activityLog.save();
  } catch (error) {
    // Log error but don't throw - activity logging should not break the main flow
    console.error('Error logging activity:', error);
  }
};

module.exports = { logActivity };

