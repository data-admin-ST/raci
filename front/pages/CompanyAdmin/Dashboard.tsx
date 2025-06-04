import React from 'react';
import '../../styles/dashboard.scss';

const CompanyAdminDashboard = ({ children }: { children?: React.ReactNode }) => (
  <div className="dashboard-layout">
    <aside className="sidebar">
      <h2>Company Admin</h2>
      <nav>
        <a href="/CompanyAdmin/UserCreation">User Creation</a>
        <a href="/CompanyAdmin/DepartmentManagement">Department Management</a>
        <a href="/CompanyAdmin/UserManagement">User Management</a>
        <a href="/CompanyAdmin/EventMaster">Event Master</a>
        <a href="/CompanyAdmin/RACIAssignment">RACI Assignment</a>
        <a href="/CompanyAdmin/RACITracker">RACI Tracker</a>
        <a href="/Home">Back to Home</a>
      </nav>
    </aside>
    <main className="dashboard-content">
      <h1>Company Admin Dashboard</h1>
      <p>Select an option from the sidebar.</p>
      {children}
    </main>
  </div>
);

export default CompanyAdminDashboard;
