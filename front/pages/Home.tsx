import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.scss';

const Home = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="home-container">
      {/* Combined navigation bar */}
      <div className="home-nav">
        <div className="container">
          <div className="nav-left">
            <div className="brand-logo">🔄</div>
            <div className="brand-name">RACI SaaS</div>
          </div>
          
          <div className="nav-center">
            <div 
              className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              Home
            </div>
            <div 
              className={`nav-tab ${activeTab === 'dashboards' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboards')}
            >
              Dashboards
            </div>
            <div 
              className={`nav-tab ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              Features
            </div>
            <div 
              className={`nav-tab ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              About
            </div>
          </div>
          
          <div className="nav-right">
            <Link to="/auth/login" className="login-button">
              Login
            </Link>
          </div>
        </div>
      </div>

      {activeTab === 'home' && (
        <div className="tab-content">
          <section className="hero-section">
            <div className="home-content">
              <h1 className="home-title">Welcome to RACI SaaS Platform</h1>
              <p className="home-subtitle">
                Streamline your project management with our Responsible, Accountable, Consulted, and Informed matrix system
              </p>
              <button
                className="cta-button"
                style={{
                  background: 'linear-gradient(90deg, #4f8cff 0%, #1a237e 100%)',
                  color: '#fff',
                  padding: '1rem 2.5rem',
                  fontSize: '1.2rem',
                  border: 'none',
                  borderRadius: '2rem',
                  boxShadow: '0 4px 16px rgba(79, 140, 255, 0.15)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  marginTop: '2rem',
                }}
                onMouseOver={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) scale(1.04)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(79, 140, 255, 0.25)';
                }}
                onMouseOut={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = '';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(79, 140, 255, 0.15)';
                }}
                onClick={() => setActiveTab('dashboards')}
              >
                Get Started
              </button>
            </div>
          </section>
          
          <section className="feature-section">
            <div className="features">
              <div className="feature-card">
                <div className="feature-icon">📝</div>
                <h3>RACI Matrix</h3>
                <p>Create and manage RACI matrices for all your projects. Assign roles and responsibilities with ease.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <h3>Team Management</h3>
                <p>Manage your teams, departments and organizational structure all in one place.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Visual Dashboards</h3>
                <p>Get insights with beautiful visual dashboards that help you track progress and responsibilities.</p>
              </div>
            </div>
          </section>
          
          <section className="cta-section">
            <div className="cta-content">
              <h2>Ready to get started?</h2>
              <p>Join thousands of companies that use our RACI platform to improve project clarity and team alignment.</p>
              <button className="cta-button" onClick={() => setActiveTab('dashboards')}>
                Choose Your Dashboard
              </button>
            </div>
          </section>
        </div>
      )}
      
      {activeTab === 'dashboards' && (
        <div className="tab-content">
          <div style={{ padding: '4rem 2rem' }}>
            <div className="home-content" style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2.5rem', color: '#1a237e', marginBottom: '1rem' }}>
                Select Your Dashboard
              </h2>
              <p style={{ fontSize: '1.2rem', color: '#475569', maxWidth: '800px', margin: '0 auto' }}>
                Choose the dashboard that matches your role in the organization
              </p>
            </div>
            
            <div className="dashboard-links">
              <Link to="/website-admin" className="dashboard-card website-admin">
                <div className="card-icon">👨‍💼</div>
                <div>
                  <h3>Website Admin</h3>
                  <p>Manage companies and admins</p>
                </div>
                <div className="card-arrow">→</div>
              </Link>
              
              <Link to="/company-admin" className="dashboard-card company-admin">
                <div className="card-icon">🏢</div>
                <div>
                  <h3>Company Admin</h3>
                  <p>Manage departments, users and events</p>
                </div>
                <div className="card-arrow">→</div>
              </Link>
              
              <Link to="/user" className="dashboard-card user">
                <div className="card-icon">👤</div>
                <div>
                  <h3>User Dashboard</h3>
                  <p>View and manage your RACI assignments</p>
                </div>
                <div className="card-arrow">→</div>
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'features' && (
        <div className="tab-content">
          <div style={{ padding: '4rem 2rem' }}>
            <div className="home-content">
              <h2 style={{ fontSize: '2.5rem', color: '#1a237e', textAlign: 'center', marginBottom: '3rem' }}>
                Platform Features
              </h2>
              
              <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* List of features */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#1a237e' }}>
                    RACI Matrix Management
                  </h3>
                  <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#475569' }}>
                    Create detailed RACI matrices for your projects, easily assigning team members as Responsible, Accountable, Consulted, or Informed for each task.
                  </p>
                </div>
                
                {/* More features would be listed here */}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'about' && (
        <div className="tab-content">
          <div style={{ padding: '4rem 2rem' }}>
            <div className="home-content">
              <h2 style={{ fontSize: '2.5rem', color: '#1a237e', textAlign: 'center', marginBottom: '3rem' }}>
                About RACI SaaS
              </h2>
              
              <div style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.7', color: '#475569' }}>
                <p style={{ marginBottom: '1.5rem' }}>
                  Our RACI SaaS platform helps organizations clearly define roles and responsibilities across projects and departments.
                </p>
                <p>
                  By implementing the RACI model (Responsible, Accountable, Consulted, Informed), teams gain clarity on who is doing what, reducing confusion and increasing productivity.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
