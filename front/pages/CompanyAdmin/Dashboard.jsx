import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import apiService from '../../src/services/api';
import authService from '../../src/services/auth.service';
import '../../styles/dashboard.scss';
import UserCreation from './UserCreation';
import DepartmentManagement from './DepartmentManagement';
import UserManagement from './UserManagement';
import EventMaster from './EventMaster';
import RACIAssignment from './RACIAssignment';
import RACITracker from './RACITracker';
import MeetingCalendar from './MeetingCalendar';
import CompanySettings from './CompanySettings';
import CreateUser from './CreateUser';
import EditUser from './EditUser';
import CreateDepartment from './CreateDepartment';
import EditDepartment from './EditDepartment';
import env from '../../src/config/env';

const CompanyAdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({});
  
  const [currentUser, setCurrentUser] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  // State for dashboard data
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState({
    departments: true,
    users: true,
    events: true,
    stats: true
  });
  
  // Load user and company data
  useEffect(() => {
    const fetchUserAndCompany = async () => {
      try {
        // Get current user
        const userData = await authService.getCurrentUser();
        setCurrentUser(userData);
        
        // Get company data if user has a company ID
        if (userData && userData.company && userData.company.id) {
          setLoadingCompany(true);
          const companyId = userData.company.id;
          
          try {
            // Use direct fetch to handle errors better
            const token = localStorage.getItem('raci_auth_token');
            const response = await fetch(`${env.apiBaseUrl}/companies/${companyId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            });
            
            if (response.ok) {
              const companyDetails = await response.json();
              setCompanyData(companyDetails);
              console.log('Company details:', companyDetails);
            } else {
              console.warn(`Could not fetch company details, status: ${response.status}`);
              // Still set minimal company data from user object
              setCompanyData({
                id: userData.company.id,
                name: userData.company.name || 'Your Company'
              });
            }
          } catch (error) {
            console.error('Failed to fetch company details:', error);
            // Use fallback data
            setCompanyData({
              id: userData.company.id,
              name: userData.company.name || 'Your Company'
            });
          }
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoadingCompany(false);
      }
    };
    
    fetchUserAndCompany();
  }, []);

  useEffect(() => {
    if (location.pathname === '/company-admin' || location.pathname === '/company-admin/') {
      navigate('/company-admin/user-creation', { replace: true });
    }
  }, [location.pathname]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      navigate('/');
    }
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser || !currentUser.company || !currentUser.company.id) {
        return;
      }

      const companyId = currentUser.company.id;

      // Fetch company stats with better error handling
      try {
        setLoading(prev => ({ ...prev, stats: true }));
        const token = localStorage.getItem('raci_auth_token');
        
        try {
          const response = await fetch(`${env.apiBaseUrl}/dashboard/company-admin`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            const stats = await response.json();
            setDashboardStats(stats);
          } else if (response.status === 501) {
            console.log('Stats API not implemented, using mock data');
            setDashboardStats({
              totalUsers: 0,
              totalDepartments: 0,
              totalEvents: 0,
              pendingApprovals: 0
            });
          }
        } catch (err) {
          console.warn('Stats API error, using mock data:', err);
          setDashboardStats({
            totalUsers: 0,
            totalDepartments: 0,
            totalEvents: 0,
            pendingApprovals: 0
          });
        }
      } catch (error) {
        console.error('Error setting up dashboard stats:', error);
      } finally {
        setLoading(prev => ({ ...prev, stats: false }));
      }

      // Fetch departments
      try {
        setLoading(prev => ({ ...prev, departments: true }));
        const departmentsData = await apiService.get(`/companies/${companyId}/departments`);
        setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
        
        // Update stats with real department count
        setDashboardStats(prev => ({
          ...prev,
          totalDepartments: Array.isArray(departmentsData) ? departmentsData.length : 0
        }));
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setLoading(prev => ({ ...prev, departments: false }));
      }

      // Fetch users in company
      try {
        setLoading(prev => ({ ...prev, users: true }));
        const usersData = await apiService.get(`/users?companyId=${companyId}`);
        
        // Handle different response formats
        let usersList = [];
        if (usersData && usersData.users) {
          usersList = usersData.users;
        } else if (Array.isArray(usersData)) {
          usersList = usersData;
        }
        
        setUsers(usersList);
        
        // Update stats with real user count
        setDashboardStats(prev => ({
          ...prev,
          totalUsers: usersList.length
        }));
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(prev => ({ ...prev, users: false }));
      }

      // Fetch events
      try {
        setLoading(prev => ({ ...prev, events: true }));
        const eventsData = await apiService.get('/events');
        
        // Handle different response formats
        let eventsList = [];
        if (eventsData && eventsData.events) {
          eventsList = eventsData.events;
        } else if (Array.isArray(eventsData)) {
          eventsList = eventsData;
        }
        
        setEvents(eventsList);
        
        // Update stats with real event count and pending approvals
        const pendingEvents = eventsList.filter(event => event.status === 'pending').length;
        setDashboardStats(prev => ({
          ...prev,
          totalEvents: eventsList.length,
          pendingApprovals: pendingEvents
        }));
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(prev => ({ ...prev, events: false }));
      }
    };

    if (currentUser && currentUser.company) {
      fetchDashboardData();
    }
  }, [currentUser]);

  // Add enhanced logo rendering method
  const renderCompanyLogo = () => {
    if (!companyData) return null;
    
    if (companyData.logoUrl) {
      // Make sure the URL is properly formatted
      const logoUrl = companyData.logoUrl.startsWith('http') 
        ? companyData.logoUrl 
        : `${window.location.protocol}//${window.location.hostname}:5000${companyData.logoUrl}`;
      
      console.log("Using logo URL:", logoUrl);
      
      return (
        <div style={{ 
          width: '40px', 
          height: '40px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginRight: '10px',
          flexShrink: 0,
          border: '1px solid #f3f4f6',
          borderRadius: '4px',
          overflow: 'hidden',
          background: '#fff'
        }}>
          <img 
            src={logoUrl}
            alt={companyData?.name || 'Company'} 
            className="company-logo"
            style={{ 
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
            onError={(e) => {
              console.log("Logo failed to load, using fallback");
              // Replace with first letter of company name inside a colored circle
              const parent = e.target.parentNode;
              parent.innerHTML = `<div style="width: 40px; height: 40px; border-radius: 50%; background-color: #4f46e5; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px;">${companyData?.name ? companyData.name.charAt(0).toUpperCase() : 'C'}</div>`;
            }}
          />
        </div>
      );
    }
    
    // Fallback to letter display
    return (
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
    );
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
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {renderCompanyLogo()}
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
        </div>
        
        <nav>
          <div 
            className={`nav-item ${location.pathname.includes('/user-') ? 'active' : ''}`}
            onClick={() => toggleSection('users')}
          >
            <i className="icon">👥</i> 
            <span>User Administration</span>
            <i className={`dropdown-icon ${expandedSections.users ? 'open' : ''}`}>▼</i>
          </div>
          <div className={`sub-nav ${expandedSections.users ? 'open' : ''}`}>
            <NavLink to="/company-admin/user-creation" className="nav-item">
              User Creation
            </NavLink>
            <NavLink to="/company-admin/user-management" className="nav-item">
              User Management
            </NavLink>
          </div>
          
          <div 
            className={`nav-item ${location.pathname.includes('/department') ? 'active' : ''}`}
            onClick={() => toggleSection('departments')}
          >
            <i className="icon">🏢</i> 
            <span>Department Management</span>
            <i className={`dropdown-icon ${expandedSections.departments ? 'open' : ''}`}>▼</i>
          </div>
          <div className={`sub-nav ${expandedSections.departments ? 'open' : ''}`}>
            <NavLink to="/company-admin/department-management" className="nav-item">
              Departments
            </NavLink>
            <NavLink to="/company-admin/hod-management" className="nav-item">
              HOD Management
            </NavLink>
          </div>
          
          <div 
            className={`nav-item ${location.pathname.includes('/event-master') || location.pathname.includes('/raci-') ? 'active' : ''}`}
            onClick={() => toggleSection('raci')}
          >
            <i className="icon">📅</i> 
            <span>RACI Management</span>
            <i className={`dropdown-icon ${expandedSections.raci ? 'open' : ''}`}>▼</i>
          </div>
          <div className={`sub-nav ${expandedSections.raci ? 'open' : ''}`}>
            <NavLink to="/company-admin/event-master" className="nav-item">
              Event Master
            </NavLink>
            <NavLink to="/company-admin/raci-assignment" className="nav-item">
              RACI Assignment
            </NavLink>
            <NavLink to="/company-admin/raci-tracker" className="nav-item">
              RACI Tracker
            </NavLink>
          </div>
          
          <NavLink to="/company-admin/meeting-calendar" className="nav-item">
            <i className="icon">📆</i> Meeting Calendar
          </NavLink>
          
          <NavLink to="/company-admin/settings" className="nav-item">
            <i className="icon">⚙️</i> Company Settings
          </NavLink>
          
          <NavLink to="/" className="nav-item">
            <i className="icon">🏠</i> Back to Home
          </NavLink>
        </nav>
      </aside>
      
      <main className="dashboard-content">
        <header className="dashboard-header">
          <div className="dashboard-title">
            {companyData ? companyData.name : 'Company'} Administration
          </div>
          <div className="header-actions">
            <div className="user-info">
              <div className="user-avatar">{currentUser ? currentUser.name.charAt(0) : 'U'}</div>
              <div className="user-details">
                <div className="user-name">{currentUser ? currentUser.name : 'Loading...'}</div>
                <div className="user-role">{currentUser ? currentUser.role : 'Loading...'}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <span>🚪</span> Logout
            </button>
          </div>
        </header>
        
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={
              <>
                <h1>Dashboard Overview</h1>
                
                {/* Analytics Cards */}
                <div className="dashboard-analytics" style={{ 
                  marginBottom: '2rem',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  {loading.stats ? (
                    <div className="loading-spinner">Loading analytics data...</div>
                  ) : dashboardStats ? (
                    <div className="widget-grid" style={{
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                      gap: '1.5rem',
                      width: '100%'
                    }}>
                      <div className="widget primary">
                        <div className="widget-value">{dashboardStats.totalUsers || 0}</div>
                        <div className="widget-label">Total Users</div>
                      </div>
                      <div className="widget secondary">
                        <div className="widget-value">{dashboardStats.totalDepartments || 0}</div>
                        <div className="widget-label">Departments</div>
                      </div>
                      <div className="widget success">
                        <div className="widget-value">{dashboardStats.totalEvents || 0}</div>
                        <div className="widget-label">Events</div>
                      </div>
                      <div className="widget warning">
                        <div className="widget-value">{dashboardStats.pendingApprovals || 0}</div>
                        <div className="widget-label">Pending Approvals</div>
                      </div>
                    </div>
                  ) : null}
                </div>
                
                {/* Recent Departments */}
                <div className="section card" style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  <div className="section-header" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '1.5rem', 
                    alignItems: 'center' 
                  }}>
                    <h2 className="section-title" style={{ margin: 0 }}>Departments</h2>
                    <button 
                      onClick={() => navigate('/company-admin/departments/create')}
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 1rem', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.375rem' }}
                    >
                      + Add Department
                    </button>
                  </div>
                  
                  {loading.departments ? (
                    <div className="loading-spinner">Loading departments...</div>
                  ) : departments.length > 0 ? (
                    <div className="table-responsive">
                      <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>Head of Department</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>Employees</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {departments.slice(0, 5).map((dept) => (
                            <tr key={dept.id}>
                              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>{dept.name}</td>
                              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>{dept.hod?.name || 'Not assigned'}</td>
                              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>{dept.employeesCount || 0}</td>
                              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
                                <button 
                                  onClick={() => navigate(`/company-admin/departments/${dept.id}`)}
                                  style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '0.25rem', padding: '0.25rem 0.5rem', marginRight: '0.5rem' }}
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-state" style={{ textAlign: 'center', padding: '2rem' }}>
                      <p>No departments found.</p>
                      <button 
                        onClick={() => navigate('/company-admin/departments/create')}
                        className="btn"
                        style={{ padding: '0.5rem 1rem', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.375rem' }}
                      >
                        Create Department
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Recent Events */}
                <div className="section card" style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  <div className="section-header" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '1.5rem', 
                    alignItems: 'center' 
                  }}>
                    <h2 className="section-title" style={{ margin: 0 }}>Recent Events</h2>
                    <button 
                      onClick={() => navigate('/company-admin/events/create')}
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 1rem', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.375rem' }}
                    >
                      + Create Event
                    </button>
                  </div>
                  
                  {loading.events ? (
                    <div className="loading-spinner">Loading events...</div>
                  ) : events.length > 0 ? (
                    <div className="table-responsive">
                      <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>Department</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {events.slice(0, 5).map((event) => (
                            <tr key={event.id}>
                              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>{event.name}</td>
                              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>{event.department?.name || '-'}</td>
                              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                  backgroundColor: 
                                    event.status === 'approved' ? '#dcfce7' : 
                                    event.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                                  color: 
                                    event.status === 'approved' ? '#15803d' : 
                                    event.status === 'rejected' ? '#b91c1c' : '#854d0e'
                                }}>
                                  {event.status?.charAt(0).toUpperCase() + event.status?.slice(1) || 'Pending'}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
                                {new Date(event.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-state" style={{ textAlign: 'center', padding: '2rem' }}>
                      <p>No events found.</p>
                      <button 
                        onClick={() => navigate('/company-admin/events/create')}
                        className="btn"
                        style={{ padding: '0.5rem 1rem', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.375rem' }}
                      >
                        Create Event
                      </button>
                    </div>
                  )}
                </div>
              </>
            } />

            <Route path="/user-creation" element={<CreateUser />} />
            <Route path="/department-management" element={<DepartmentManagement />} />
            <Route path="/hod-management" element={<DepartmentManagement showHodManagement={true} />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/event-master" element={<EventMaster />} />
            <Route path="/raci-assignment" element={<RACIAssignment />} />
            <Route path="/raci-tracker" element={<RACITracker />} />
            <Route path="/meeting-calendar" element={<MeetingCalendar />} />
            <Route path="/settings" element={<CompanySettings />} />
            
            {/* Add routes for department operations */}
            <Route path="/departments/create" element={<CreateDepartment />} />
            <Route path="/departments/edit/:id" element={<EditDepartment />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default CompanyAdminDashboard;
