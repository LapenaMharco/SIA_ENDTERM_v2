import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import { adminController } from '../../controllers/adminController';
import '../../styles/AdminActivityLogs.css';

const AdminActivityLogs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    action: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchActivityLogs();
  }, [pagination.page, filters]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminController.getActivityLogs({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });

      if (!response || !response.data || !response.data.activityLogs) {
        throw new Error('Invalid response format from server');
      }

      setActivityLogs(response.data.activityLogs);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination,
      }));
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatAction = (action) => {
    return action
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getActionColor = (action) => {
    if (action.includes('CREATE')) return '#2ECC71';
    if (action.includes('UPDATE')) return '#3498DB';
    if (action.includes('DELETE')) return '#E74C3C';
    if (action.includes('APPROVED')) return '#27AE60';
    if (action.includes('REJECTED')) return '#E74C3C';
    return '#95A5A6';
  };

  if (loading && activityLogs.length === 0) {
    return (
      <div className="admin-activity-logs-container">
        <Header />
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-activity-logs-container">
      <Header />

      <div className="admin-activity-logs-content">
        <div className="activity-logs-header">
          <div className="header-left">
            <h1>Admin Activity Logs</h1>
            <p>Track all administrative actions and changes</p>
          </div>
          <button
            className="btn-secondary"
            onClick={() => navigate('/admin/analytics')}
          >
            Back to Analytics
          </button>
        </div>

        {/* Filters */}
        <div className="activity-logs-filters">
          <div className="filter-group">
            <label htmlFor="action">Action Type:</label>
            <select
              id="action"
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
            >
              <option value="">All Actions</option>
              <option value="TICKET_STATUS_UPDATE">Ticket Status Update</option>
              <option value="TICKET_COMMENT_ADDED">Ticket Comment Added</option>
              <option value="TICKET_RECEIPT_APPROVED">Receipt Approved</option>
              <option value="TICKET_RECEIPT_REJECTED">Receipt Rejected</option>
              <option value="CATEGORY_CREATED">Category Created</option>
              <option value="CATEGORY_UPDATED">Category Updated</option>
              <option value="CATEGORY_DELETED">Category Deleted</option>
              <option value="COURSE_CREATED">Course Created</option>
              <option value="COURSE_UPDATED">Course Updated</option>
              <option value="COURSE_DELETED">Course Deleted</option>
              <option value="OFFICE_CREATED">Office Created</option>
              <option value="OFFICE_UPDATED">Office Updated</option>
              <option value="OFFICE_DELETED">Office Deleted</option>
              <option value="QUEUE_REORDERED">Queue Reordered</option>
              <option value="QUEUE_REMOVED">Queue Removed</option>
              <option value="CATEGORY_OFFICE_MAPPING_UPDATED">Category-Office Mapping Updated</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="startDate">Start Date:</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="endDate">End Date:</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              setFilters({ action: '', startDate: '', endDate: '' });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
          >
            Clear Filters
          </button>
        </div>

        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button className="btn-primary" onClick={fetchActivityLogs}>
              Try Again
            </button>
          </div>
        )}

        {/* Activity Logs Table */}
        <div className="activity-logs-table-container">
          {activityLogs.length === 0 ? (
            <div className="empty-state">
              <p>No activity logs found</p>
            </div>
          ) : (
            <>
              <table className="activity-logs-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Description</th>
                    <th>Ticket</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.map((log) => (
                    <tr key={log._id}>
                      <td className="date-cell">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="admin-cell">
                        {log.admin ? (
                          <div>
                            <div className="admin-name">
                              {log.admin.firstName && log.admin.lastName
                                ? `${log.admin.firstName} ${log.admin.lastName}`
                                : log.admin.username}
                            </div>
                            <div className="admin-email">{log.admin.email}</div>
                          </div>
                        ) : (
                          'Unknown'
                        )}
                      </td>
                      <td className="action-cell">
                        <span
                          className="action-badge"
                          style={{ backgroundColor: getActionColor(log.action) }}
                        >
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td className="description-cell">
                        {log.description}
                      </td>
                      <td className="ticket-cell">
                        {log.ticketNumber ? (
                          <button
                            className="ticket-link"
                            onClick={() => navigate(`/admin/tickets/${log.ticketId}`)}
                          >
                            {log.ticketNumber}
                          </button>
                        ) : (
                          <span className="no-ticket">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminActivityLogs;

