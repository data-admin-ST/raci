import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../../styles/dashboard.scss';

const CompanyAdminLayout = ({ children, companyData }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('raci_auth_token');
    navigate('/auth/login');
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="brand" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '15px 12px',
          height: '64px',
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
          {companyData && companyData.logoUrl ? (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '10px',
                flexShrink: 0
              }}>
                <img 
                  src={companyData.logoUrl.startsWith('http') ? 
                    companyData.logoUrl : 
                    `${window.location.protocol}//${window.location.hostname}:5000${companyData.logoUrl}`}
                  alt={companyData.name} 
                  className="company-logo"
                  style={{ 
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    // Replace with first letter of company name inside a colored circle
                    const parent = e.target.parentNode;
                    parent.innerHTML = `<div style="width: 40px; height: 40px; border-radius: 50%; background-color: #4f46e5; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px;">${companyData?.name ? companyData.name.charAt(0).toUpperCase() : 'C'}</div>`;
                  }}
                />
              </div>
              <span style={{ 
                fontWeight: '600', 
                fontSize: '16px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: '#111827'
              }}>
                {companyData?.name || 'Company Dashboard'}
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: '#4f46e5', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '18px',
                marginRight: '10px',
                flexShrink: 0
              }}>
                {companyData?.name ? companyData.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <span style={{ 
                fontWeight: '600', 
                fontSize: '16px',
                color: '#111827'
              }}>
                {companyData?.name || 'Company Dashboard'}
              </span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/company-admin/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
            <span className="icon">📊</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/company-admin/users" className={({ isActive }) => isActive ? "active" : ""}>
            <span className="icon">👥</span>
            <span>Users</span>
          </NavLink>
          <NavLink to="/company-admin/departments" className={({ isActive }) => isActive ? "active" : ""}>
            <span className="icon">🏢</span>
            <span>Departments</span>
          </NavLink>
          <NavLink to="/company-admin/events" className={({ isActive }) => isActive ? "active" : ""}>
            <span className="icon">📅</span>
            <span>Events</span>
          </NavLink>
          <NavLink to="/company-admin/settings" className={({ isActive }) => isActive ? "active" : ""}>
            <span className="icon">⚙️</span>
            <span>Settings</span>
          </NavLink>
          <button onClick={handleLogout} className="sidebar-nav-item" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            color: '#374151',
            textDecoration: 'none',
            borderRadius: '0.375rem',
            marginBottom: '0.25rem',
            border: 'none',
            background: 'none',
            width: '100%',
            textAlign: 'left',
            cursor: 'pointer'
          }}>
            <span className="icon">🚪</span>
            <span>Logout</span>
          </button>
        </nav>
        
      </aside>
      
      <main className="dashboard-content">
        <header className="dashboard-header">
          <div className="dashboard-title">
            {companyData?.name || 'Company'} Admin Panel
          </div>
          <div className="header-actions">
            <div className="user-info">
              <span className="user-name">Admin</span>
              <div className="user-avatar">A</div>
            </div>
            {/* Logout button removed from header as it exists in the sidebar */}
          </div>
        </header>
        
        {children}
      </main>
    </div>
  );
};

export default CompanyAdminLayout;
