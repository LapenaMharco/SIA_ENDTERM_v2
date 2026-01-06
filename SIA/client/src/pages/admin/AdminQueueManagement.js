import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import AdminWelcomeSection from '../../components/AdminWelcomeSection';
import { adminController } from '../../controllers/adminController';
import '../../styles/Admin.css';

const AdminQueueManagement = () => {
  const navigate = useNavigate();
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [queueTickets, setQueueTickets] = useState([]);
  const [queueStats, setQueueStats] = useState(null);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    fetchOffices();
  }, []);

  useEffect(() => {
    if (selectedOffice) {
      fetchQueue(selectedOffice);
    }
  }, [selectedOffice]);

  const fetchOffices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminController.getOffices();
      if (response.success && response.data) {
        setOffices(response.data.offices || []);
      } else {
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error fetching offices:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch offices';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchQueue = async (officeId) => {
    try {
      setLoadingQueue(true);
      const response = await adminController.getQueue(officeId);
      if (response.success && response.data) {
        setQueueTickets(response.data.tickets || []);
        setQueueStats(response.data.statistics || null);
      }
    } catch (err) {
      console.error('Error fetching queue:', err);
      setError(err.response?.data?.message || 'Failed to fetch queue');
    } finally {
      setLoadingQueue(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex || !selectedOffice) {
      setDraggedIndex(null);
      return;
    }

    try {
      setReordering(true);
      setError(null);

      // Create new order
      const items = [...queueTickets];
      const draggedItem = items[draggedIndex];
      items.splice(draggedIndex, 1);
      items.splice(dropIndex, 0, draggedItem);

      // Create ticket orders array with new queue numbers
      const ticketOrders = items.map((ticket, idx) => ({
        ticketId: ticket._id,
        queueNumber: idx + 1,
      }));

      // Send to backend
      await adminController.reorderQueue(selectedOffice, ticketOrders);

      // Refresh queue
      await fetchQueue(selectedOffice);
      setSuccess('Queue reordered successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error reordering queue:', err);
      setError(err.response?.data?.message || 'Failed to reorder queue');
      // Revert on error
      await fetchQueue(selectedOffice);
    } finally {
      setReordering(false);
      setDraggedIndex(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (loading) {
    return (
      <div className="admin-container">
        <Header />
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Loading queue management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <Header />
      
      <div className="admin-content">
        <AdminWelcomeSection 
          title="Queue Management"
          subtitle="View and manage ticket queues for each office"
        />

        {error && (
          <div className="error-message-card" style={{ marginBottom: '20px' }}>
            <span className="error-icon"></span>
            <div style={{ flex: 1 }}>
              <div>{error}</div>
              <button
                onClick={fetchOffices}
                style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  background: 'var(--royal-blue)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="success-message-card" style={{ marginBottom: '20px' }}>
            <span style={{ marginRight: '8px' }}></span>
            {success}
          </div>
        )}

        {/* Queue Viewer */}
        <div className="admin-widget">
          <div className="widget-header">
            <h3>Queue Viewer</h3>
            {selectedOffice && queueTickets.length > 0 && (
              <div style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
                Drag rows to reorder • Tickets will be removed when status is set to "Completed"
              </div>
            )}
          </div>
          <div className="widget-content">
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Select Office to View Queue:
              </label>
              <select
                value={selectedOffice || ''}
                onChange={(e) => setSelectedOffice(e.target.value || null)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid var(--gray-medium)',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">-- Select Office --</option>
                {offices.map((office) => (
                  <option key={office.id} value={office.id}>
                    {office.office_name}
                  </option>
                ))}
              </select>
            </div>

            {selectedOffice && (
              <>
                {loadingQueue ? (
                  <div className="loading-spinner-container">
                    <div className="spinner"></div>
                    <p>Loading queue...</p>
                  </div>
                ) : (
                  <>
                    {queueStats && (
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                        gap: '15px',
                        marginBottom: '20px'
                      }}>
                        <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--royal-blue)' }}>
                            {queueStats.total}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>Total Tickets</div>
                        </div>
                        <div style={{ padding: '15px', background: '#fff3cd', borderRadius: '8px' }}>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#856404' }}>
                            {queueStats.pending}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>Pending</div>
                        </div>
                        <div style={{ padding: '15px', background: '#d1ecf1', borderRadius: '8px' }}>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0c5460' }}>
                            {queueStats.inReview}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>In Review</div>
                        </div>
                        <div style={{ padding: '15px', background: '#d4edda', borderRadius: '8px' }}>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>
                            {queueStats.completed}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>Completed</div>
                        </div>
                      </div>
                    )}

                    {queueTickets.length === 0 ? (
                      <div className="widget-empty">
                        <p>No tickets in queue for this office.</p>
                      </div>
                    ) : (
                      <div className="queue-list">
                        {reordering && (
                          <div style={{ padding: '10px', background: '#fff3cd', borderRadius: '4px', marginBottom: '10px', textAlign: 'center' }}>
                            Reordering queue...
                          </div>
                        )}
                        <table className="admin-table" style={{ width: '100%' }}>
                          <thead>
                            <tr>
                              <th style={{ width: '40px' }}>⋮⋮</th>
                              <th>Queue #</th>
                              <th>Ticket #</th>
                              <th>Title</th>
                              <th>Category</th>
                              <th>Status</th>
                              <th>Priority</th>
                              <th>Created By</th>
                              <th>Created At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {queueTickets.map((ticket, index) => (
                              <tr
                                key={ticket._id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                onDrop={(e) => handleDrop(e, index)}
                                style={{
                                  cursor: 'move',
                                  opacity: draggedIndex === index ? 0.5 : 1,
                                  backgroundColor: draggedIndex === index ? '#f0f0f0' : 'transparent'
                                }}
                              >
                                <td style={{ textAlign: 'center', color: '#999', fontSize: '18px', userSelect: 'none' }}>
                                  ⋮⋮
                                </td>
                                <td style={{ fontWeight: 'bold', color: 'var(--royal-blue)' }}>
                                  {ticket.queueNumber !== null && ticket.queueNumber !== undefined ? ticket.queueNumber : index + 1}
                                </td>
                                <td>
                                  <a
                                    href={`/admin/tickets/${ticket._id}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      navigate(`/admin/tickets/${ticket._id}`);
                                    }}
                                    style={{ color: 'var(--royal-blue)', textDecoration: 'underline' }}
                                  >
                                    {ticket.ticketNumber}
                                  </a>
                                </td>
                                <td>{ticket.title}</td>
                                <td>{ticket.category}</td>
                                <td>
                                  <span className={`status-badge status-${ticket.status.toLowerCase().replace(' ', '-')}`}>
                                    {ticket.status}
                                  </span>
                                </td>
                                <td>
                                  <span className={`priority-badge priority-${ticket.priority.toLowerCase()}`}>
                                    {ticket.priority}
                                  </span>
                                </td>
                                <td>
                                  {ticket.createdBy?.firstName || ticket.createdBy?.username || 'N/A'}
                                </td>
                                <td>
                                  {new Date(ticket.createdAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQueueManagement;