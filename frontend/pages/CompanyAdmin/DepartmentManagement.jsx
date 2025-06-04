import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../../src/services/api';
import authService from '../../src/services/auth.service';
import env from '../../src/config/env';
import '../../styles/dashboard.scss';

const DepartmentManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [showHodManagement, setShowHodManagement] = useState(false);

  // Get current user's company ID
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData && userData.company && userData.company.id) {
          setCompanyId(userData.company.id);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Load departments
  useEffect(() => {
    if (!companyId) return;

    const fetchDepartments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Direct fetch to handle errors better
        const token = localStorage.getItem('raci_auth_token');
        const response = await fetch(`${env.apiBaseUrl}/companies/${companyId}/departments`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Departments data:', data);
        
        // Handle different response formats
        let departmentsList = Array.isArray(data) ? data : [];
        
        setDepartments(departmentsList);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setError('Failed to load departments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchDepartments();
    }
    
    // Check if we need to refresh data when returning from create/edit
    if (location.state?.refreshData) {
      fetchDepartments();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [companyId, location, navigate]);

  const handleDeleteDepartment = async (deptId, deptName) => {
    if (window.confirm(`Are you sure you want to delete department "${deptName}"? This action cannot be undone.`)) {
      try {
        // Send delete request
        const token = localStorage.getItem('raci_auth_token');
        const response = await fetch(`${env.apiBaseUrl}/departments/${deptId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to delete department (${response.status})`);
        }
        
        // Remove department from list
        setDepartments(prev => prev.filter(dept => dept.id !== deptId));
      } catch (error) {
        console.error(`Failed to delete department ${deptId}:`, error);
        alert('Failed to delete department. Please try again.');
      }
    }
  };

  return (
    <div className="content-wrapper fix-wrapper">
      <div className="page-header">
        <h1>{showHodManagement ? 'Head of Department Management' : 'Departments'}</h1>
        
        {!showHodManagement && (
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/company-admin/departments/create')}
            style={{
              padding: '0.5rem 1rem',
              background: 'linear-gradient(90deg, #4f46e5 0%, #6366f1 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            + Add Department
          </button>
        )}
      </div>
      
      {/* Department list card */}
      <div className="card fix-card" style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="section-title">Departments List</h2>
        </div>
        
        {loading ? (
          <div className="loading-spinner" style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto', borderRadius: '50%', border: '3px solid #f3f3f3', borderTop: '3px solid #4f46e5', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ marginTop: '1rem', color: '#4f46e5' }}>Loading departments...</p>
          </div>
        ) : error ? (
          <div className="error-message" style={{ 
            padding: '1rem', 
            backgroundColor: '#fee2e2', 
            color: '#b91c1c',
            borderRadius: '6px',
            textAlign: 'center' 
          }}>
            {error}
          </div>
        ) : departments.length > 0 ? (
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', fontWeight: '500', color: '#6b7280' }}>Department Name</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', fontWeight: '500', color: '#6b7280' }}>Head of Department</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', fontWeight: '500', color: '#6b7280' }}>Employees</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', fontWeight: '500', color: '#6b7280', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept, index) => (
                  <tr key={dept.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', fontWeight: '500' }}>{dept.name}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                      {dept.hod ? dept.hod.name : 'Not Assigned'}
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                      {dept.employeesCount || 0}
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => navigate(`/company-admin/departments/${dept.id}`)}
                          style={{
                            padding: '0.5rem',
                            background: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          title="View Department"
                        >
                          👁️
                        </button>
                        <button 
                          onClick={() => navigate(`/company-admin/departments/edit/${dept.id}`)}
                          style={{
                            padding: '0.5rem',
                            background: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          title="Edit Department"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                          style={{
                            padding: '0.5rem',
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          title="Delete Department"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state" style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
            <h3 style={{ marginBottom: '1rem', fontWeight: '500', color: '#374151' }}>No departments found</h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Create your first department to start organizing your company structure
            </p>
            <button 
              className="btn" 
              onClick={() => navigate('/company-admin/departments/create')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(90deg, #4f46e5 0%, #6366f1 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Add Department
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <style jsx>{`
        .fix-wrapper {
          padding: 1.5rem !important;
          margin: 0 !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        
        .fix-card {
          margin: 0 0 1.5rem 0 !important;
          padding: 1.5rem !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        
        .department-table {
          width: 100% !important;
          border-collapse: collapse !important;
        }
        
        .department-table th,
        .department-table td {
          padding: 0.75rem 1rem !important;
          text-align: left !important;
        }
      `}</style>
    </div>
  );
};

export default DepartmentManagement;

