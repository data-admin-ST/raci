import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../src/services/api';
import '../../styles/dashboard.scss';

const EditCompanyAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    employeeId: '',
  });
  
  // Load admin data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await apiService.get(`/users/${id}`);
        console.log('User data:', data);
        
        // Set form data from user
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          designation: data.designation || '',
          employeeId: data.employeeId || '',
        });
      } catch (err) {
        console.error('Failed to load user:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // Send update request
      const response = await apiService.put(`/users/${id}`, formData);
      console.log('User updated:', response);
      
      setSuccess('Company admin updated successfully!');
      
      // Navigate back to dashboard after short delay
      setTimeout(() => {
        navigate('/website-admin/dashboard', {
          state: { refreshData: true }
        });
      }, 1500);
    } catch (err) {
      console.error('Error updating company admin:', err);
      setError(err.message || 'Failed to update company admin');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="content-wrapper">
        <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #f3f3f3', borderTop: '3px solid #4f46e5', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginLeft: '15px' }}>Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1>Edit Company Admin</h1>
      </div>
      
      {error && (
        <div className="alert alert-error" style={{ 
          padding: '0.75rem 1rem',
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          borderRadius: '8px',
          marginBottom: '1.5rem' 
        }}>
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success" style={{ 
          padding: '0.75rem 1rem',
          backgroundColor: '#dcfce7',
          color: '#15803d',
          borderRadius: '8px',
          marginBottom: '1.5rem' 
        }}>
          <span>{success}</span>
        </div>
      )}
      
      <div className="card" style={{ 
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div className="card-header" style={{ 
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h2>Edit Admin Information</h2>
        </div>
      
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label htmlFor="name" style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter full name"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email" style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              required
              disabled
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: '#f9fafb'
              }}
            />
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>Email cannot be changed</p>
          </div>
          
          <div className="form-group">
            <label htmlFor="phone" style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>Phone</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="designation" style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>Designation</label>
            <input
              type="text"
              id="designation"
              name="designation"
              value={formData.designation}
              onChange={handleInputChange}
              placeholder="Enter designation"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="employeeId" style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>Employee ID</label>
            <input
              type="text"
              id="employeeId"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              placeholder="Enter employee ID"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div className="form-actions" style={{ 
            marginTop: '20px', 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '1.25rem',
            gridColumn: '1 / -1'
          }}>
            <button 
              type="button" 
              onClick={() => navigate('/website-admin/dashboard')}
              style={{ 
                padding: '0.75rem 1.25rem', 
                background: '#f3f4f6', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving}
              style={{ 
                padding: '0.75rem 1.5rem', 
                background: '#4f46e5', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px',
                fontWeight: '500',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCompanyAdmin;
