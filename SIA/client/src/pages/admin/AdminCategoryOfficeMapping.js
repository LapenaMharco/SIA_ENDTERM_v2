import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import AdminWelcomeSection from '../../components/AdminWelcomeSection';
import { adminController } from '../../controllers/adminController';
import '../../styles/Admin.css';

const AdminCategoryOfficeMapping = () => {
  const navigate = useNavigate();
  const [mapping, setMapping] = useState([]);
  const [categories, setCategories] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminController.getCategoryOfficeMapping();
      if (response.success && response.data) {
        setMapping(response.data.mapping || []);
        setCategories(response.data.categories || []);
        setOffices(response.data.offices || []);
      } else {
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMappingChange = (category, officeId) => {
    const office = offices.find(o => o.id === officeId);
    const updatedMapping = [...mapping];
    const index = updatedMapping.findIndex(m => m.category === category);
    
    if (index >= 0) {
      updatedMapping[index] = {
        category,
        officeId,
        officeName: office ? office.office_name : '',
      };
    } else {
      updatedMapping.push({
        category,
        officeId,
        officeName: office ? office.office_name : '',
      });
    }
    
    setMapping(updatedMapping);
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await adminController.updateCategoryOfficeMapping(mapping);
      setSuccess('Category-office mapping updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving mapping:', err);
      setError(err.response?.data?.message || 'Failed to save mapping');
    } finally {
      setSubmitting(false);
    }
  };

  const getOfficeForCategory = (category) => {
    const mappingItem = mapping.find(m => m.category === category);
    return mappingItem ? mappingItem.officeId : '';
  };

  if (loading) {
    return (
      <div className="admin-container">
        <Header />
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Loading category-office mapping...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <Header />
      
      <div className="admin-content">
        <AdminWelcomeSection 
          title="Category-Office Mapping"
          subtitle="Configure which office handles each ticket category"
        />

        {error && (
          <div className="error-message-card" style={{ marginBottom: '20px' }}>
            <span className="error-icon">⚠️</span>
            <div style={{ flex: 1 }}>
              <div>{error}</div>
              <button
                onClick={fetchData}
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
            <span style={{ marginRight: '8px' }}>✅</span>
            {success}
          </div>
        )}

        <div className="admin-widget">
          <div className="widget-header">
            <h3>Category-Office Mapping Configuration</h3>
          </div>
          <div className="widget-content">
            {categories.length === 0 ? (
              <div className="widget-empty">
                <p>No categories found. Please add categories first.</p>
              </div>
            ) : (
              <div className="mapping-table">
                <table className="admin-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Assigned Office</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category}>
                        <td style={{ fontWeight: '600' }}>{category}</td>
                        <td>
                          <select
                            value={getOfficeForCategory(category)}
                            onChange={(e) => handleMappingChange(category, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px',
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                  <button
                    className="btn-submit"
                    onClick={handleSave}
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategoryOfficeMapping;

