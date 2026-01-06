const fs = require('fs');
const path = require('path');
const Ticket = require('../models/Ticket');

/**
 * Get category-to-office mapping from file
 */
function getCategoryOfficeMapping() {
  try {
    const mappingPath = path.join(__dirname, '../data/category_office_mapping.json');
    if (fs.existsSync(mappingPath)) {
      const mappingFile = fs.readFileSync(mappingPath, 'utf8');
      const mapping = JSON.parse(mappingFile);
      if (Array.isArray(mapping)) {
        return mapping;
      }
      return [];
    }
    return [];
  } catch (error) {
    console.error('Error reading category-office mapping:', error);
    return [];
  }
}

/**
 * Get office assignment for a category
 */
function getOfficeForCategory(category) {
  const mapping = getCategoryOfficeMapping();
  const mappingItem = mapping.find(item => item.category === category);
  
  if (mappingItem) {
    return {
      officeId: mappingItem.officeId,
      officeName: mappingItem.officeName,
    };
  }
  
  return null;
}

/**
 * Get next queue number for an office
 * Queue numbers are based only on Pending and In Review tickets
 */
async function getNextQueueNumber(officeId) {
  try {
    // Count only tickets with status "Pending" or "In Review" for this office
    const activeTicketCount = await Ticket.countDocuments({
      'assignedOffice.officeId': officeId,
      status: { $in: ['Pending', 'In Review'] },
      queueNumber: { $ne: null },
    });

    // Return the count + 1 (next number in sequence)
    return activeTicketCount + 1;
  } catch (error) {
    console.error('Error getting next queue number:', error);
    // Fallback: use timestamp-based number
    return Date.now() % 10000;
  }
}

/**
 * Assign office and queue number to a ticket
 */
async function assignOfficeAndQueue(ticket, category) {
  try {
    const officeAssignment = getOfficeForCategory(category);
    
    if (officeAssignment) {
      ticket.assignedOffice = officeAssignment;
      
      // Get next queue number for this office
      const queueNumber = await getNextQueueNumber(officeAssignment.officeId);
      ticket.queueNumber = queueNumber;
      ticket.queuedAt = new Date();
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error assigning office and queue:', error);
    return false;
  }
}

/**
 * Renumber queue for an office based on current active tickets (Pending and In Review only)
 * This ensures queue numbers are sequential starting from 1
 */
async function renumberQueue(officeId) {
  try {
    // Get all active tickets for this office, sorted by current queue number and creation date
    // MongoDB sorts null queueNumber values last when using ascending sort
    const activeTickets = await Ticket.find({
      'assignedOffice.officeId': officeId,
      status: { $in: ['Pending', 'In Review'] },
    })
      .sort({ queueNumber: 1, createdAt: 1 })
      .select('_id queueNumber createdAt');

    console.log(`Renumbering queue for office ${officeId}: ${activeTickets.length} active tickets found`);

    // Renumber sequentially starting from 1
    const updatePromises = activeTickets.map((ticket, index) => {
      const newQueueNumber = index + 1;
      console.log(`Updating ticket ${ticket._id}: queueNumber ${ticket.queueNumber} -> ${newQueueNumber}`);
      return Ticket.findByIdAndUpdate(
        ticket._id,
        { queueNumber: newQueueNumber, queuedAt: new Date() },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    console.log(`Queue renumbered successfully for office ${officeId}`);
    return { success: true, renumbered: activeTickets.length };
  } catch (error) {
    console.error('Error renumbering queue:', error);
    throw error;
  }
}

module.exports = {
  getCategoryOfficeMapping,
  getOfficeForCategory,
  getNextQueueNumber,
  assignOfficeAndQueue,
  renumberQueue,
};
