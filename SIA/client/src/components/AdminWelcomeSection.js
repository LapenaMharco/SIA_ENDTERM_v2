import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminQuickActionsDropdown from './AdminQuickActionsDropdown';
import '../styles/Admin.css';

const AdminWelcomeSection = ({ title, subtitle }) => {
  const { user } = useAuth();

  const getUserDisplayName = () => {
    if (user?.firstName) {
      return user.firstName;
    }
    return user?.username || 'Admin';
  };

  const defaultTitle = `Welcome back, ${getUserDisplayName()}!`;
  const defaultSubtitle = "Here's an overview of your ticket management system";

  return (
    <div className="admin-welcome-section">
      <div className="admin-welcome-content">
        <h1>{title || defaultTitle}</h1>
        <p>{subtitle || defaultSubtitle}</p>
      </div>
      <div className="admin-quick-actions">
        <AdminQuickActionsDropdown />
      </div>
    </div>
  );
};

export default AdminWelcomeSection;

