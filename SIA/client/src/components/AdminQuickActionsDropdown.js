import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Admin.css';

const AdminQuickActionsDropdown = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.admin-dropdown-wrapper')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleNavigate = (path) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  return (
    <div className="admin-dropdown-wrapper">
      <button
        className="btn-primary-action admin-dropdown-toggle"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        Quick Actions
        <span className="dropdown-arrow" style={{ marginLeft: '8px' }}>
          {isDropdownOpen ? '▲' : '▼'}
        </span>
      </button>
      {isDropdownOpen && (
        <div className="admin-dropdown-menu">
          <button
            className="admin-dropdown-item"
            onClick={() => handleNavigate('/admin/tickets')}
          >
            Dashboard
          </button>
          <button
            className="admin-dropdown-item"
            onClick={() => handleNavigate('/admin/tickets/all')}
          >
            Manage All Tickets
          </button>
          <button
            className="admin-dropdown-item"
            onClick={() => handleNavigate('/admin/categories')}
          >
            Manage Categories
          </button>
          <button
            className="admin-dropdown-item"
            onClick={() => handleNavigate('/admin/courses')}
          >
            Manage Courses
          </button>
          <button
            className="admin-dropdown-item"
            onClick={() => handleNavigate('/admin/offices')}
          >
            Manage Office Locations
          </button>
          <button
            className="admin-dropdown-item"
            onClick={() => handleNavigate('/admin/category-office-mapping')}
          >
            Category-Office Mapping
          </button>
          <button
            className="admin-dropdown-item"
            onClick={() => handleNavigate('/admin/queue')}
          >
            Queue Management
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminQuickActionsDropdown;

