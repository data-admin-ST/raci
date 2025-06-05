import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import '../../styles/dashboard.scss';
import RACIDashboard from './RACIDashboard';
import UserProfile from './UserProfile';
import TasksAssigned from './TasksAssigned';
import TaskCalendar from './TaskCalendar';
import HelpSupport from './HelpSupport';
import authService from '../../src/services/auth.service';

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({});
  
  // Replace mock user data with state and fetch real user data
  const [user, setUser] = useState({
    name: "Loading...",
    role: "Loading...",
    company: "Loading...",
    email: "",
    phone: "",
    designation: "",
    employeeId: "",
    department: { name: "Loading..." }
  });
  
  const [loading, setLoading] = useState(true);
  
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await authService.getCurrentUser();
        console.log("Current user data:", userData);
        
        if (userData) {
          setUser({
            name: userData.name || "User",
            role: userData.role || "User",
            company: userData.company?.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            designation: userData.designation || "",
            employeeId: userData.employeeId || "",
            // Make sure department is properly handled to avoid "Not Assigned" text
            department: {
              name: userData.department?.name || ""
            },
            profileImage: userData.profileImage || null
          });
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  useEffect(() => {
    if (location.pathname === '/user' || location.pathname === '/user/') {
      navigate('/user/raci-dashboard', { replace: true });
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
      // Clear authentication data
      authService.logout();
      navigate('/');
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-logo">🔄</span>
          <span className="brand-name">RACI SaaS</span>
        </div>
        
        <div className="sidebar-user-info" style={{
          padding: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div className="user-avatar" style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#4f46e5',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-name" style={{
            fontWeight: '600',
            fontSize: '1rem',
            color: 'white',
            textAlign: 'center'
          }}>
            {user.name}
          </div>
          <div className="user-role" style={{
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center'
          }}>
            {user.role}{user.department?.name ? ` - ${user.department.name}` : ''}
          </div>
        </div>
        
        <nav>
          <NavLink to="/user/raci-dashboard" className="nav-item">
            <i className="icon">📊</i> RACI Dashboard
          </NavLink>
          
          <div 
            className={`nav-item ${location.pathname.includes('/tasks') || location.pathname.includes('/calendar') ? 'active' : ''}`}
            onClick={() => toggleSection('tasks')}
          >
            <i className="icon">📝</i> 
            <span>My Tasks</span>
            <i className={`dropdown-icon ${expandedSections.tasks ? 'open' : ''}`}>▼</i>
          </div>
          <div className={`sub-nav ${expandedSections.tasks ? 'open' : ''}`}>
            <NavLink to="/user/tasks/assigned" className="nav-item">
              Assigned to Me
            </NavLink>
            <NavLink to="/user/tasks/calendar" className="nav-item">
              Task Calendar
            </NavLink>
          </div>
          
          <NavLink to="/user/profile" className="nav-item">
            <i className="icon">👤</i> My Profile
          </NavLink>
          
          <NavLink to="/user/help" className="nav-item">
            <i className="icon">❓</i> Help & Support
          </NavLink>
        </nav>
        
        <button className="logout-btn" onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>
      </aside>
      
      <main className="dashboard-content">
        <header className="dashboard-header">
          <div className="dashboard-title">{user.company || "Dashboard"}</div>
          <div className="header-actions">
            <div className="user-info">
              <div className="user-avatar">{user.name.charAt(0)}</div>
              <div className="user-details">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role}{user.department?.name ? ` • ${user.department.name}` : ''}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <span>🚪</span> Logout
            </button>
          </div>
        </header>
        
        <div className="content-wrapper">
          <Routes>
            <Route path="/raci-dashboard" element={<RACIDashboard />} />
            <Route path="/profile" element={<UserProfile userData={user} />} />
            <Route path="/tasks/assigned" element={<TasksAssigned />} />
            <Route path="/tasks/calendar" element={<TaskCalendar />} />
            <Route path="/help" element={<HelpSupport />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
