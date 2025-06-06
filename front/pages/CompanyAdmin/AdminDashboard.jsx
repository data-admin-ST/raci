import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../src/services/auth.service';
import env from '../../src/config/env';
import '../../styles/dashboard.scss';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    company: {
      name: '',
      logoUrl: '',
      domain: '',
      industry: '',
      size: ''
    },
    stats: {
      users: {
        total: 0,
        company_admin: 0,
        hod: 0,
        user: 0
      },
      departments: 0,
      events: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      }
    },
    recentEvents: []
  });

  // Debug flag to show raw data for development
  const [showDebugData, setShowDebugData] = useState(false);
  const [rawResponseData, setRawResponseData] = useState(null);

  useEffect(() => {
    console.log("AdminDashboard component mounted");
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log("Starting dashboard data fetch");
        
        // Get the authentication token
        const token = localStorage.getItem('raci_auth_token');
        if (!token) {
          setError("Authentication token not found. Please log in again.");
          setLoading(false);
          return;
        }

        // First try to get user data to make sure auth is working
        try {
          const userData = await authService.getCurrentUser();
          console.log("Current user data:", userData);
          
          if (!userData || !userData.company) {
            console.warn("User data missing company information");
          }
        } catch (userError) {
          console.error("Error fetching user data:", userError);
          // Continue anyway, as the dashboard API might still work
        }
        
        // Fetch dashboard data from the API endpoint
        console.log(`Fetching dashboard data from: ${env.apiBaseUrl}/dashboard/company-admin`);
        const response = await fetch(`${env.apiBaseUrl}/dashboard/company-admin`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        let data;
        const responseText = await response.text();
        console.log("Raw API response:", responseText);
        
        try {
          data = JSON.parse(responseText);
          setRawResponseData(data); // Store raw data for debugging
        } catch (parseError) {
          console.error("Failed to parse response as JSON:", parseError);
          setError("Invalid response from server. Please try again later.");
          setLoading(false);
          return;
        }
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} - ${data.message || 'Unknown error'}`);
        }
        
        console.log('Parsed dashboard data:', data);

        // Handle different response formats and normalize the data
        const normalizedData = normalizeApiResponse(data);
        setDashboardData(normalizedData);
        
      } catch (error) {
        console.error("Dashboard error:", error);
        setError("Failed to load dashboard data: " + (error.message || "Unknown error"));
        
        // Set minimal fallback data so UI doesn't break completely
        setDashboardData(prev => ({
          ...prev,
          company: {
            ...prev.company,
            name: "Your Company"
          }
        }));
      } finally {
        console.log("Dashboard data fetch complete");
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Return cleanup function
    return () => {
      console.log("AdminDashboard component unmounting");
    };
  }, []);

  // Function to normalize API responses of different formats
  const normalizeApiResponse = (data) => {
    // Initialize with default structure
    const normalized = {
      company: {
        name: 'Your Company',
        logoUrl: '',
        domain: '',
        industry: '',
        size: ''
      },
      stats: {
        users: {
          total: 0,
          company_admin: 0,
          hod: 0,
          user: 0
        },
        departments: 0,
        events: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0
        }
      },
      recentEvents: []
    };

    try {
      // Handle company data
      if (data.company) {
        normalized.company = {
          ...normalized.company,
          ...data.company
        };
      }

      // Handle stats data
      if (data.stats) {
        // Handle users stats
        if (data.stats.users) {
          normalized.stats.users = {
            ...normalized.stats.users,
            ...data.stats.users
          };
        }
        
        // Handle departments count
        if (typeof data.stats.departments === 'number') {
          normalized.stats.departments = data.stats.departments;
        }
        
        // Handle events stats
        if (data.stats.events) {
          normalized.stats.events = {
            ...normalized.stats.events,
            ...data.stats.events
          };
        }
      }

      // Handle recent events
      if (Array.isArray(data.recentEvents)) {
        normalized.recentEvents = data.recentEvents;
      }
    } catch (error) {
      console.error("Error normalizing API response:", error);
    }

    return normalized;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Show a simple loading view
  if (loading) {
    return (
      <div className="admin-dashboard" style={{padding: '2rem'}}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '5rem',
          flexDirection: 'column'
        }}>
          <div style={{ 
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: '3px solid #e5e7eb',
            borderTopColor: '#4f46e5',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading dashboard data...</p>
        </div>
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="admin-dashboard" style={{padding: '2rem'}}>
        <div className="alert alert-error" style={{ 
          padding: '1rem',
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          borderRadius: '8px',
          marginBottom: '1.5rem' 
        }}>
          <h3 style={{marginTop: 0}}>Error Loading Dashboard</h3>
          <p>{error}</p>
          <div style={{marginTop: '1rem'}}>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '0.75rem'
              }}
            >
              Reload Page
            </button>
            <button 
              onClick={() => navigate('/company-admin')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Go to Home
            </button>
          </div>
        </div>
        
        {/* Debug toggle */}
        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={() => setShowDebugData(!showDebugData)}
            style={{
              padding: '0.5rem',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {showDebugData ? 'Hide' : 'Show'} Debug Data
          </button>
          
          {showDebugData && rawResponseData && (
            <div style={{ 
              marginTop: '1rem',
              padding: '1rem',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              <pre>{JSON.stringify(rawResponseData, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="admin-dashboard" style={{padding: '1.5rem'}}>
      {/* Removed title section as requested */}
      
      {/* Debug toggle button repositioned */}
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
        <button
          onClick={() => setShowDebugData(!showDebugData)}
          style={{
            padding: '0.25rem 0.5rem',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
        >
          {showDebugData ? 'Hide' : 'Show'} Debug Info
        </button>
        
        {showDebugData && (
          <div style={{ 
            position: 'absolute',
            right: 0,
            top: '100%',
            width: '300px',
            padding: '0.75rem',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            fontSize: '0.75rem',
            overflow: 'auto',
            maxHeight: '200px',
            zIndex: 100
          }}>
            <pre>{JSON.stringify(rawResponseData || {}, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Company Information Card - Improved layout */}
      <div className="company-info-card" style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column', // changed to column for center alignment
        alignItems: 'center',    // center horizontally
        gap: '1.5rem'
      }}>
        {dashboardData.company.logoUrl ? (
          <img 
            src={dashboardData.company.logoUrl} 
            alt={dashboardData.company.name} 
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain',
              borderRadius: '8px',
              border: '1px solid #f3f4f6',
              flexShrink: 0
            }}
          />
        ) : (
          <div style={{
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#4f46e5',
            color: 'white',
            borderRadius: '8px',
            fontSize: '2rem',
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            {dashboardData.company.name.charAt(0).toUpperCase()}
          </div>
        )}
        
        <div style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', // center text and info
          width: '100%'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '0.5rem', 
            fontWeight: '700',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: 'center', // center the company name
            width: '100%'
          }}>
            {dashboardData.company.name}
          </h2>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '0.75rem', 
            color: '#6b7280',
            fontSize: '0.875rem',
            justifyContent: 'center', // center info tags
            width: '100%'
          }}>
            {dashboardData.company.industry && (
              <span style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '4px'
              }}>
                <strong>Industry:</strong> {dashboardData.company.industry}
              </span>
            )}
            {dashboardData.company.size && (
              <span style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '4px'
              }}>
                <strong>Size:</strong> {dashboardData.company.size}
              </span>
            )}
            {dashboardData.company.domain && (
              <span style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '4px'
              }}>
                <strong>Domain:</strong> {dashboardData.company.domain}
              </span>
            )}
          </div>
        </div>
        
        {/* <button
          onClick={() => navigate('/company-admin/settings')}
          style={{
            padding: '0.5rem 0.75rem',
            backgroundColor: '#4f46e5',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontSize: '0.875rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontWeight: '500',
            flexShrink: 0
          }}
        >
          Company Settings
        </button> */}
      </div>
    
      {/* Statistics Cards - Improved layout and alignment */}
      <div className="stats-cards" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {/* Users Card */}
        <div className="stat-card" style={{
          background: 'linear-gradient(to right, #4f46e5, #6366f1)',
          borderRadius: '8px',
          padding: '1.5rem',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)',
          alignItems: 'center' // center content horizontally
        }}>
          <span style={{ fontSize: '0.875rem', opacity: 0.9, textAlign: 'center' }}>Total Users</span>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            margin: '0.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center', // center the number
            width: '100%',
            textAlign: 'center'
          }}>
            <span>{dashboardData.stats.users.total}</span>
          </div>
          <div style={{ marginTop: 'auto', fontSize: '0.875rem', textAlign: 'center' }}>
            <span style={{ marginRight: '1rem' }}>
              <span style={{ opacity: 0.8 }}>Admins: </span>
              <strong>{dashboardData.stats.users.company_admin}</strong>
            </span>
            <span style={{ marginRight: '1rem' }}>
              <span style={{ opacity: 0.8 }}>HODs: </span>
              <strong>{dashboardData.stats.users.hod}</strong>
            </span>
            <span>
              <span style={{ opacity: 0.8 }}>Users: </span>
              <strong>{dashboardData.stats.users.user}</strong>
            </span>
          </div>
        </div>

        {/* Departments Card */}
        <div className="stat-card" style={{
          background: 'linear-gradient(to right, #0ea5e9, #38bdf8)',
          borderRadius: '8px',
          padding: '1.5rem',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 6px rgba(14, 165, 233, 0.2)',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.875rem', opacity: 0.9, textAlign: 'center' }}>Departments</span>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            margin: '0.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center',
            width: '100%',
            textAlign: 'center'
          }}>
            <span>{dashboardData.stats.departments}</span>
          </div>
          <div style={{ marginTop: 'auto', fontSize: '0.875rem', textAlign: 'center' }}>
            <button 
              onClick={() => navigate('/company-admin/department-management')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                padding: '0.5rem 0.75rem',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}
            >
              View Departments
            </button>
          </div>
        </div>

        {/* Events Card */}
        <div className="stat-card" style={{
          background: 'linear-gradient(to right, #10b981, #34d399)',
          borderRadius: '8px',
          padding: '1.5rem',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.875rem', opacity: 0.9, textAlign: 'center' }}>Total Events</span>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            margin: '0.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center',
            width: '100%',
            textAlign: 'center'
          }}>
            <span>{dashboardData.stats.events.total}</span>
          </div>
          <div style={{ marginTop: 'auto', fontSize: '0.875rem', textAlign: 'center' }}>
            <span style={{ marginRight: '1rem' }}>
              <span style={{ opacity: 0.8 }}>Approved: </span>
              <strong>{dashboardData.stats.events.approved}</strong>
            </span>
            <span>
              <span style={{ opacity: 0.8 }}>Pending: </span>
              <strong>{dashboardData.stats.events.pending}</strong>
            </span>
          </div>
        </div>

        {/* Pending Approvals Card */}
        <div className="stat-card" style={{
          background: 'linear-gradient(to right, #f59e0b, #fbbf24)',
          borderRadius: '8px',
          padding: '1.5rem',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 6px rgba(245, 158, 11, 0.2)',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.875rem', opacity: 0.9, textAlign: 'center' }}>Pending Approvals</span>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            margin: '0.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center',
            width: '100%',
            textAlign: 'center'
          }}>
            <span>{dashboardData.stats.events.pending}</span>
          </div>
          <div style={{ marginTop: 'auto', fontSize: '0.875rem', textAlign: 'center' }}>
            <button 
              onClick={() => navigate('/company-admin/raci-tracker')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                padding: '0.5rem 0.75rem',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}
            >
              View Approvals
            </button>
          </div>
        </div>
      </div>

      {/* Recent Events Section - Improved formatting */}
      <div className="card" style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        marginBottom: '2rem'
      }}>
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>Recent Events</h2>
          {/* <button
            onClick={() => navigate('/company-admin/event-master')}
            style={{
              background: '#4f46e5',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Create New Event
          </button> */}
        </div>

        <div style={{ padding: '0.5rem' }}>
          {dashboardData.recentEvents && dashboardData.recentEvents.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center', padding: '1rem', fontSize: '0.875rem', color: '#6b7280', fontWeight: '500', borderBottom: '2px solid #f3f4f6' }}>Event</th>
                    <th style={{ textAlign: 'center', padding: '1rem', fontSize: '0.875rem', color: '#6b7280', fontWeight: '500', borderBottom: '2px solid #f3f4f6' }}>Department</th>
                    <th style={{ textAlign: 'center', padding: '1rem', fontSize: '0.875rem', color: '#6b7280', fontWeight: '500', borderBottom: '2px solid #f3f4f6' }}>Created On</th>
                    {/* <th style={{ textAlign: 'center', padding: '1rem', fontSize: '0.875rem', color: '#6b7280', fontWeight: '500', borderBottom: '2px solid #f3f4f6' }}>Actions</th> */}
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentEvents.map(event => (
                    <tr key={event.id}>
                      <td style={{ 
                        padding: '0.75rem 1rem', 
                        borderBottom: '1px solid #f3f4f6', 
                        fontWeight: '500',
                        textAlign: 'center',
                        verticalAlign: 'middle'
                      }}>
                        {event.name}
                      </td>
                      <td style={{ 
                        padding: '0.75rem 1rem', 
                        borderBottom: '1px solid #f3f4f6',
                        textAlign: 'center',
                        verticalAlign: 'middle'
                      }}>
                        {/* Handle different department data formats */}
                        {typeof event.department === 'object' 
                          ? event.department?.name 
                          : event.department || 'N/A'}
                      </td>
                      <td style={{ 
                        padding: '0.75rem 1rem', 
                        borderBottom: '1px solid #f3f4f6',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                        verticalAlign: 'middle'
                      }}>
                        {formatDate(event.createdAt)}
                      </td>
                      <td style={{ 
                        padding: '0.75rem 1rem', 
                        borderBottom: '1px solid #f3f4f6', 
                        textAlign: 'center',
                        verticalAlign: 'middle'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          gap: '0.5rem', 
                          justifyContent: 'center' 
                        }}>
                          {/* <button
                            onClick={() => navigate(`/company-admin/events/${event.id}`)}
                            style={{
                              padding: '0.375rem 0.75rem',
                              background: '#f3f4f6',
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px',
                              color: '#374151',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            View
                          </button>
                          {event.status === 'pending' && (
                            <button
                              onClick={() => navigate(`/company-admin/events/${event.id}/approve`)}
                              style={{
                                padding: '0.375rem 0.75rem',
                                background: '#10b981',
                                border: 'none',
                                borderRadius: '6px',
                                color: 'white',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                              }}
                            >
                              Review
                            </button>
                          )} */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '2rem 0', textAlign: 'center', color: '#6b7280' }}>
              <p>No recent events found</p>
              <button 
                onClick={() => navigate('/company-admin/event-master')}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Create Event
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Actions Section - Improved formatting */}
      {/* <div className="card" style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #f3f4f6'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>Quick Actions</h2>
        </div>
        
        <div style={{ 
          padding: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem' 
        }}>
          <button
            onClick={() => navigate('/company-admin/user-creation')}
            style={{
              padding: '1rem',
              backgroundColor: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          >
            <span style={{ fontSize: '1.5rem' }}>👤</span>
            <span style={{ fontWeight: '500' }}>Add New User</span>
          </button>
          
          <button
            onClick={() => navigate('/company-admin/department-management')}
            style={{
              padding: '1rem',
              backgroundColor: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          >
            <span style={{ fontSize: '1.5rem' }}>🏢</span>
            <span style={{ fontWeight: '500' }}>Manage Departments</span>
          </button>
          
          <button
            onClick={() => navigate('/company-admin/event-master')}
            style={{
              padding: '1rem',
              backgroundColor: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          >
            <span style={{ fontSize: '1.5rem' }}>📝</span>
            <span style={{ fontWeight: '500' }}>Create Event</span>
          </button>
          
          <button
            onClick={() => navigate('/company-admin/raci-assignment')}
            style={{
              padding: '1rem',
              backgroundColor: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          >
            <span style={{ fontSize: '1.5rem' }}>📊</span>
            <span style={{ fontWeight: '500' }}>RACI Management</span>
          </button>
        </div>
      </div> */}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .stats-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;