import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import AdminWelcomeSection from '../../components/AdminWelcomeSection';
import { adminController } from '../../controllers/adminController';
import StatusBadge from '../../components/StatusBadge';
import '../../styles/Admin.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch statistics
      const statsResponse = await adminController.getStatistics();
      setStatistics(statsResponse.data.statistics);

      // Fetch recent tickets (last 5)
      const recentResponse = await adminController.getTickets({
        page: 1,
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setRecentTickets(recentResponse.data.tickets);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="admin-container">
        <Header />
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <Header />
      
      <div className="admin-content">
        {/* Welcome Section */}
        <AdminWelcomeSection />

        {/* Statistics Grid */}
        {statistics && (
          <div className="statistics-grid admin-stats">
            <div className="stat-card admin-stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-value">{statistics.total}</div>
              <div className="stat-label">Total Tickets</div>
            </div>
            <div className="stat-card admin-stat-card pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-value">{statistics.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card admin-stat-card in-review">
              <div className="stat-icon">👀</div>
              <div className="stat-value">{statistics.inReview}</div>
              <div className="stat-label">In Review</div>
            </div>
            <div className="stat-card admin-stat-card completed">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{statistics.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
            {statistics.onHold > 0 && (
              <div className="stat-card admin-stat-card on-hold">
                <div className="stat-icon">⏸️</div>
                <div className="stat-value">{statistics.onHold}</div>
                <div className="stat-label">On Hold</div>
              </div>
            )}
          </div>
        )}

        {/* Recent Tickets */}
        <div className="admin-widget recent-tickets-widget">
          <div className="widget-header">
            <h3>Recent Tickets</h3>
            <button
              className="widget-action-link"
              onClick={() => navigate('/admin/tickets/all')}
            >
              View All →
            </button>
          </div>
          <div className="widget-content">
            {recentTickets.length > 0 ? (
              <div className="ticket-list-mini">
                {recentTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className="ticket-item-mini"
                    onClick={() => navigate(`/admin/tickets/${ticket._id}`)}
                  >
                    <div className="ticket-item-header">
                      <span className="ticket-number-mini">#{ticket.ticketNumber}</span>
                      <StatusBadge status={ticket.status} />
                    </div>
                    <div className="ticket-title-mini">{ticket.title}</div>
                    <div className="ticket-meta-mini">
                      <span>{ticket.createdBy?.firstName || ticket.createdBy?.username}</span>
                      <span>{formatDate(ticket.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="widget-empty">
                <p>No tickets yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-quick-actions-section">
          <h3>Quick Actions</h3>
          <div className="quick-actions-grid">
            <button
              className="quick-action-card"
              onClick={() => navigate('/admin/tickets/all?status=Pending')}
            >
              <div className="quick-action-icon">⏳</div>
              <div className="quick-action-label">Review Pending</div>
              {statistics?.pending > 0 && (
                <div className="quick-action-badge">{statistics.pending}</div>
              )}
            </button>
            <button
              className="quick-action-card"
              onClick={() => navigate('/admin/tickets/all?status=In Review')}
            >
              <div className="quick-action-icon">👀</div>
              <div className="quick-action-label">In Review</div>
              {statistics?.inReview > 0 && (
                <div className="quick-action-badge">{statistics.inReview}</div>
              )}
            </button>
            <button
              className="quick-action-card"
              onClick={() => navigate('/admin/tickets/all')}
            >
              <div className="quick-action-icon">📋</div>
              <div className="quick-action-label">All Tickets</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

