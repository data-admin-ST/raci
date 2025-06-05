import React, { useState, useEffect } from 'react';
import env from '../../src/config/env';

const RACITracker = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRole, setFilterRole] = useState('');
  const [filterEvent, setFilterEvent] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [eventOptions, setEventOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('raci_auth_token');
        
        // Updated according to API documentation
        const response = await fetch(`${env.apiBaseUrl}/raci-tracker/my-assignments`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch assignments: ${response.status}`);
        }

        const result = await response.json();
        console.log('My RACI assignments data:', result);
        
        // Process response based on API documentation structure
        if (result.success && result.data) {
          // API returns data array directly
          const assignmentsData = Array.isArray(result.data) ? result.data : [];
          setAssignments(assignmentsData);
          
          // Extract unique event and department names for filters
          const events = new Set();
          const departments = new Set();
          const statuses = new Set();
          
          assignmentsData.forEach(assignment => {
            if (assignment.event && assignment.event.name) {
              events.add(assignment.event.name);
            }
            if (assignment.department && assignment.department.name) {
              departments.add(assignment.department.name);
            }
            if (assignment.status) {
              statuses.add(assignment.status);
            } else if (assignment.task?.status) {
              statuses.add(assignment.task.status);
            }
          });
          
          setEventOptions(Array.from(events));
          setDepartmentOptions(Array.from(departments));
          setStatusOptions(Array.from(statuses));
        } else {
          setAssignments([]);
        }
      } catch (err) {
        console.error('Error fetching RACI assignments:', err);
        setError(err.message || 'Failed to load your RACI assignments');
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [page]);

  // Function to get role badge style
  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'R':
        return { 
          backgroundColor: '#eff6ff', 
          color: '#2563eb', 
          border: '1px solid #2563eb' 
        };
      case 'A':
        return { 
          backgroundColor: '#f0fdfa', 
          color: '#059669', 
          border: '1px solid #059669' 
        };
      case 'C':
        return { 
          backgroundColor: '#fef3c7', 
          color: '#d97706', 
          border: '1px solid #d97706' 
        };
      case 'I':
        return { 
          backgroundColor: '#f5f3ff', 
          color: '#7c3aed', 
          border: '1px solid #7c3aed' 
        };
      default:
        return { 
          backgroundColor: '#f3f4f6', 
          color: '#6b7280', 
          border: '1px solid #6b7280' 
        };
    }
  };

  // Function to get status badge style
  const getStatusBadgeStyle = (status) => {
    if (!status) return null;
    
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus.includes('complete') || normalizedStatus.includes('done') || normalizedStatus === 'completed') {
      return { 
        backgroundColor: '#dcfce7', 
        color: '#14532d', 
        border: '1px solid #15803d' 
      };
    } else if (normalizedStatus.includes('progress') || normalizedStatus === 'in_progress' || normalizedStatus === 'in progress') {
      return { 
        backgroundColor: '#eff6ff', 
        color: '#1e40af', 
        border: '1px solid #3b82f6' 
      };
    } else if (normalizedStatus.includes('pending') || normalizedStatus === 'not_started' || normalizedStatus === 'not started') {
      return { 
        backgroundColor: '#fef9c3', 
        color: '#854d0e', 
        border: '1px solid #eab308' 
      };
    } else if (normalizedStatus.includes('review') || normalizedStatus === 'under_review' || normalizedStatus === 'under review') {
      return { 
        backgroundColor: '#fae8ff', 
        color: '#86198f', 
        border: '1px solid #d946ef' 
      };
    } else if (normalizedStatus.includes('cancel') || normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') {
      return { 
        backgroundColor: '#fee2e2', 
        color: '#991b1b', 
        border: '1px solid #ef4444' 
      };
    } else {
      return { 
        backgroundColor: '#f3f4f6', 
        color: '#6b7280', 
        border: '1px solid #9ca3af' 
      };
    }
  };

  // Function to format status display name
  const formatStatusName = (status) => {
    if (!status) return 'Not Set';
    
    // Convert snake_case or camelCase to Title Case
    return status
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^\w/, c => c.toUpperCase())
      .trim();
  };

  // Function to get full role name
  const getRoleName = (role) => {
    switch (role) {
      case 'R': return 'Responsible';
      case 'A': return 'Accountable';
      case 'C': return 'Consulted';
      case 'I': return 'Informed';
      default: return 'Unknown';
    }
  };

  // Format currency for financial limits
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Function to view assignment details
  const viewAssignmentDetails = (assignment) => {
    setSelectedAssignment(assignment);
    setShowDetailsModal(true);
  };

  // Reset filters function
  const resetFilters = () => {
    setFilterRole('');
    setFilterEvent('');
    setFilterDepartment('');
    setFilterStatus('');
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Apply filters
  const applyFilters = () => {
    // This would normally make a new API request with filters
    // For now, we'll just filter the current data
    setPage(1); // Reset to page 1 when applying filters
  };

  // Filter assignments based on selected filters
  const filteredAssignments = assignments.filter(assignment => {
    if (filterRole && assignment.role !== filterRole) return false;
    
    if (filterEvent && assignment.event && assignment.event.name !== filterEvent) return false;
    
    if (filterDepartment && assignment.department && assignment.department.name !== filterDepartment) return false;
    
    if (filterStatus) {
      const assignmentStatus = assignment.status || assignment.task?.status;
      if (!assignmentStatus || assignmentStatus.toLowerCase() !== filterStatus.toLowerCase()) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="raci-tracker-container">
      <div className="page-header">
        <h1>My RACI Assignments</h1>
        <p>View and track your responsibilities across all events</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your assignments...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="filters-container">
            <div className="filters-grid">
              <div className="filter-item">
                <label htmlFor="role-filter">Role</label>
                <select 
                  id="role-filter" 
                  value={filterRole} 
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="R">Responsible (R)</option>
                  <option value="A">Accountable (A)</option>
                  <option value="C">Consulted (C)</option>
                  <option value="I">Informed (I)</option>
                </select>
              </div>
              
              <div className="filter-item">
                <label htmlFor="event-filter">Event</label>
                <select 
                  id="event-filter" 
                  value={filterEvent} 
                  onChange={(e) => setFilterEvent(e.target.value)}
                >
                  <option value="">All Events</option>
                  {eventOptions.map((event, index) => (
                    <option key={index} value={event}>{event}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-item">
                <label htmlFor="department-filter">Department</label>
                <select 
                  id="department-filter" 
                  value={filterDepartment} 
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departmentOptions.map((dept, index) => (
                    <option key={index} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-item">
                <label htmlFor="status-filter">Status</label>
                <select 
                  id="status-filter" 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map((status, index) => (
                    <option key={index} value={status}>
                      {formatStatusName(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="filter-actions">
              <button 
                className="filter-button apply"
                onClick={applyFilters}
              >
                Apply Filters
              </button>
              <button 
                className="filter-button reset"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>

          {filteredAssignments.length === 0 ? (
            <div className="no-assignments">
              <p>No RACI assignments found matching your filters.</p>
            </div>
          ) : (
            <div className="assignments-container">
              <div className="assignments-count">
                <p>Showing {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''}</p>
              </div>
              
              <div className="assignments-grid">
                {filteredAssignments.map((assignment, index) => (
                  <div key={index} className="assignment-card">
                    <div className="assignment-header">
                      <div 
                        className="role-badge" 
                        style={getRoleBadgeStyle(assignment.role)}
                      >
                        {getRoleName(assignment.role)} ({assignment.role})
                      </div>
                      
                      {assignment.department && (
                        <div className="department-badge">
                          {assignment.department.name}
                        </div>
                      )}
                    </div>
                    
                    <div className="assignment-body">
                      <h3 className="task-name">
                        {assignment.task?.name || 'Unnamed Task'}
                        
                        {(assignment.status || assignment.task?.status) && (
                          <span 
                            className="status-badge"
                            style={getStatusBadgeStyle(assignment.status || assignment.task?.status)}
                          >
                            {formatStatusName(assignment.status || assignment.task?.status)}
                          </span>
                        )}
                      </h3>
                      
                      {assignment.task?.description && (
                        <p className="task-description">
                          {assignment.task.description.length > 120 
                            ? `${assignment.task.description.substring(0, 120)}...` 
                            : assignment.task.description}
                        </p>
                      )}
                      
                      <div className="event-details">
                        <h4>Event:</h4>
                        <p>{assignment.event?.name || 'Unknown Event'}</p>
                        
                        {assignment.event?.startDate && assignment.event?.endDate && (
                          <p className="event-dates">
                            {new Date(assignment.event.startDate).toLocaleDateString()} to {new Date(assignment.event.endDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      
                      {assignment.financialLimits && (
                        <div className="financial-limits">
                          <h4>Financial Limits:</h4>
                          <div className="limits-details">
                            <p><strong>Min:</strong> {formatCurrency(assignment.financialLimits.min)}</p>
                            <p><strong>Max:</strong> {formatCurrency(assignment.financialLimits.max)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="assignment-footer">
                      <button 
                        className="view-details-btn"
                        onClick={() => viewAssignmentDetails(assignment)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Assignment Details Modal */}
      {showDetailsModal && selectedAssignment && (
        <div className="modal-overlay">
          <div className="details-modal">
            <div className="modal-header">
              <h2>Assignment Details</h2>
              <button 
                className="close-button"
                onClick={() => setShowDetailsModal(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              {/* Task Information Section */}
              <div className="detail-section">
                <h3>Task Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Task ID:</span>
                    <span className="detail-value">{selectedAssignment.task?.id || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Task Name:</span>
                    <span className="detail-value">{selectedAssignment.task?.name || 'Unnamed Task'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span 
                      className="status-pill"
                      style={getStatusBadgeStyle(selectedAssignment.status || selectedAssignment.task?.status)}
                    >
                      {formatStatusName(selectedAssignment.status || selectedAssignment.task?.status || 'Not Set')}
                    </span>
                  </div>
                  
                  {selectedAssignment.task?.description && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Description:</span>
                      <span className="detail-value description">{selectedAssignment.task.description}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Assignment Information Section */}
              <div className="detail-section">
                <h3>Assignment Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Assignment ID:</span>
                    <span className="detail-value">{selectedAssignment.id || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Your Role:</span>
                    <span 
                      className="role-pill"
                      style={getRoleBadgeStyle(selectedAssignment.role)}
                    >
                      {getRoleName(selectedAssignment.role)} ({selectedAssignment.role})
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Department:</span>
                    <span className="detail-value">
                      {selectedAssignment.department?.name || 'Not Assigned'}
                    </span>
                  </div>
                  
                  {selectedAssignment.financialLimits && (
                    <>
                      <div className="detail-item">
                        <span className="detail-label">Min Financial Limit:</span>
                        <span className="detail-value highlight">
                          {formatCurrency(selectedAssignment.financialLimits.min)}
                        </span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-label">Max Financial Limit:</span>
                        <span className="detail-value highlight">
                          {formatCurrency(selectedAssignment.financialLimits.max)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Event Information Section */}
              <div className="detail-section">
                <h3>Event Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Event ID:</span>
                    <span className="detail-value">{selectedAssignment.event?.id || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Event Name:</span>
                    <span className="detail-value">{selectedAssignment.event?.name || 'Unknown Event'}</span>
                  </div>
                  
                  {selectedAssignment.event?.startDate && (
                    <div className="detail-item">
                      <span className="detail-label">Start Date:</span>
                      <span className="detail-value">
                        {new Date(selectedAssignment.event.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {selectedAssignment.event?.endDate && (
                    <div className="detail-item">
                      <span className="detail-label">End Date:</span>
                      <span className="detail-value">
                        {new Date(selectedAssignment.event.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {selectedAssignment.event?.description && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Event Description:</span>
                      <span className="detail-value description">{selectedAssignment.event.description}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="close-modal-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .raci-tracker-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem;
        }
        
        .page-header {
          margin-bottom: 2rem;
        }
        
        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        
        .page-header p {
          font-size: 1rem;
          color: #6b7280;
        }
        
        .loading-container, .error-container, .no-assignments {
          padding: 2rem;
          text-align: center;
          background-color: #f9fafb;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top-color: #3b82f6;
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .error-container {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        
        .retry-button {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background-color: #dc2626;
          color: white;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
        }
        
        .retry-button:hover {
          background-color: #b91c1c;
        }
        
        .filters-container {
          background-color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
        }
        
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }
        
        .filter-item label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #4b5563;
        }
        
        .filter-item select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          background-color: white;
          font-size: 0.875rem;
        }
        
        .filter-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .filter-button {
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
        }
        
        .filter-button.apply {
          background-color: #3b82f6;
          color: white;
          border: none;
        }
        
        .filter-button.apply:hover {
          background-color: #2563eb;
        }
        
        .filter-button.reset {
          background-color: transparent;
          color: #6b7280;
          border: 1px solid #d1d5db;
        }
        
        .filter-button.reset:hover {
          background-color: #f3f4f6;
        }
        
        .assignments-count {
          margin-bottom: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .assignments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .assignment-card {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .assignment-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .assignment-header {
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .role-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .department-badge {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .assignment-body {
          padding: 1rem;
          flex-grow: 1;
        }
        
        .task-name {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #111827;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.625rem;
          font-weight: 500;
          white-space: nowrap;
        }
        
        .task-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 1rem;
        }
        
        .event-details, .financial-limits {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .event-details h4, .financial-limits h4 {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #4b5563;
        }
        
        .event-details p {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .event-dates {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 0.25rem;
        }
        
        .limits-details {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }
        
        .assignment-footer {
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
          text-align: right;
        }
        
        .view-details-btn {
          padding: 0.5rem 1rem;
          background-color: #f9fafb;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .view-details-btn:hover {
          background-color: #f3f4f6;
          color: #111827;
        }
        
        .pagination-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .pagination-button {
          padding: 0.5rem 1rem;
          background-color: #f9fafb;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #4b5563;
          cursor: pointer;
        }
        
        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .pagination-button:not(:disabled):hover {
          background-color: #f3f4f6;
          color: #111827;
        }
        
        .pagination-info {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        /* Modal styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 50;
        }
        
        .details-modal {
          background-color: white;
          border-radius: 0.5rem;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        
        .modal-header {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .modal-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #6b7280;
          cursor: pointer;
        }
        
        .close-button:hover {
          color: #111827;
        }
        
        .modal-body {
          padding: 1rem;
          flex-grow: 1;
        }
        
        .detail-section {
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 1rem;
        }
        
        .detail-section:last-child {
          border-bottom: none;
        }
        
        .detail-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 1rem;
        }
        
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }
        
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .detail-item.full-width {
          grid-column: 1 / -1;
        }
        
        .detail-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
        }
        
        .detail-value {
          font-size: 0.875rem;
          color: #111827;
        }
        
        .detail-value.description {
          white-space: pre-wrap;
        }
        
        .status-pill, .role-pill {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          margin-top: 0.25rem;
        }
        
        .team-members-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .team-member-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background-color: #f9fafb;
          border-radius: 0.25rem;
        }
        
        .member-name {
          font-size: 0.875rem;
          color: #111827;
        }
        
        .member-role {
          font-size: 0.75rem;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
        }
        
        .modal-footer {
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
        }
        
        .close-modal-btn {
          padding: 0.5rem 1rem;
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #4b5563;
          cursor: pointer;
        }
        
        .close-modal-btn:hover {
          background-color: #e5e7eb;
        }
        
        @media (max-width: 768px) {
          .assignments-grid {
            grid-template-columns: 1fr;
          }
          
          .detail-grid {
            grid-template-columns: 1fr;
          }
        }

        .detail-value.highlight {
          color: #4f46e5;
          font-weight: 600;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
};

export default RACITracker;
       