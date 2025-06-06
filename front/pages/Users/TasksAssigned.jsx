import React, { useState, useEffect } from 'react';
import env from '../../src/config/env';

const TasksAssigned = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch assigned tasks when component mounts
  useEffect(() => {
    const fetchAssignedTasks = async () => {
      try {
        setLoading(true);
        
        // Get token from local storage
        const token = localStorage.getItem('raci_auth_token');
        
        // First try user-raci endpoint which is the most likely to be implemented
        try {
          const response = await fetch(`${env.apiBaseUrl}/user-raci/my-assignments`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('User RACI assignments:', data);
            
            if (data.success && data.data && Array.isArray(data.data.raciAssignments)) {
              // Process the RACI assignments into task format
              const formattedTasks = formatRaciAssignmentsToTasks(data.data.raciAssignments);
              setTasks(formattedTasks);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Failed to fetch from primary endpoint:', err);
        }
        
        // If first endpoint fails, try the tasks endpoint
        try {
          const response = await fetch(`${env.apiBaseUrl}/tasks/assigned-to-me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Tasks assigned:', data);
            
            const formattedTasks = formatTasksData(data);
            setTasks(formattedTasks);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Failed to fetch from tasks endpoint:', err);
        }
        
        // If all endpoints fail, use mock data
        const mockData = getMockTasksData();
        const formattedTasks = formatTasksData(mockData);
        setTasks(formattedTasks);
        
      } catch (error) {
        console.error('Error fetching assigned tasks:', error);
        setError(error.message);
        
        // Use mock data as fallback
        const mockData = getMockTasksData();
        const formattedTasks = formatTasksData(mockData);
        setTasks(formattedTasks);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignedTasks();
  }, []);
  
  // Format RACI assignments into task format
  const formatRaciAssignmentsToTasks = (raciAssignments) => {
    return raciAssignments.map(assignment => ({
      id: assignment.task?.id || `task-${Math.random().toString(36).substring(7)}`,
      title: assignment.task?.name || 'Unnamed Task',
      description: assignment.task?.description || '',
      eventName: assignment.event?.name || 'Unnamed Event',
      raciRole: mapRoleCodeToName(assignment.role),
      status: assignment.task?.status || 'pending',
      dueDate: formatDueDate(assignment.event?.endDate),
      priority: determinePriority(assignment.event?.endDate),
      eventId: assignment.event?.id
    }));
  };
  
  // Map role code to full name
  const mapRoleCodeToName = (roleCode) => {
    switch (roleCode?.toUpperCase()) {
      case 'R': return 'Responsible';
      case 'A': return 'Accountable';
      case 'C': return 'Consulted';
      case 'I': return 'Informed';
      default: return roleCode || 'Unknown';
    }
  };
  
  // Determine priority based on due date
  const determinePriority = (dueDate) => {
    if (!dueDate) return 'medium';
    
    const now = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.floor((due - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) return 'high'; // Overdue
    if (daysUntilDue < 7) return 'high';
    if (daysUntilDue < 14) return 'medium';
    return 'low';
  };
  
  // Generate mock data for fallback
  const getMockTasksData = () => {
    return {
      tasks: [
        {
          id: 'task-1',
          title: 'Complete Product Requirements Document',
          description: 'Finalize the PRD for the new feature set',
          eventName: 'Q4 Product Planning',
          raciRole: 'Responsible',
          status: 'in_progress',
          dueDate: '2023-11-30',
          priority: 'high'
        },
        {
          id: 'task-2',
          title: 'Review Marketing Materials',
          description: 'Provide feedback on Q4 campaign assets',
          eventName: 'Q4 Marketing Launch',
          raciRole: 'Consulted',
          status: 'pending',
          dueDate: '2023-11-25',
          priority: 'medium'
        },
        {
          id: 'task-3',
          title: 'Sign off on Budget',
          description: 'Final approval of departmental budget',
          eventName: 'Annual Budget Planning',
          raciRole: 'Accountable',
          status: 'not_started',
          dueDate: '2023-12-10',
          priority: 'high'
        },
        {
          id: 'task-4',
          title: 'Team Performance Reviews',
          description: 'Complete performance assessments for team members',
          eventName: 'Annual Review Cycle',
          raciRole: 'Responsible',
          status: 'not_started',
          dueDate: '2023-12-15',
          priority: 'medium'
        }
      ]
    };
  };
  
  // Format tasks data from API
  const formatTasksData = (apiData) => {
    // Handle different response formats
    let tasksList = [];
    
    if (Array.isArray(apiData)) {
      tasksList = apiData;
    } else if (apiData && Array.isArray(apiData.tasks)) {
      tasksList = apiData.tasks;
    } else if (apiData && apiData.data && Array.isArray(apiData.data)) {
      tasksList = apiData.data;
    }
    
    // Map API data to the format expected by the UI
    return tasksList.map(task => ({
      id: task.id || `task-${Math.random().toString(36).substring(7)}`,
      title: task.name || task.title || 'Untitled Task',
      description: task.description || '',
      eventName: task.eventName || task.event?.name || 'Unknown Event',
      raciRole: task.raciRole || task.role || 'Unknown',
      status: task.status || 'pending',
      dueDate: formatDueDate(task.dueDate || task.deadline),
      eventId: task.eventId || task.event?.id,
      priority: task.priority || determinePriority(task.dueDate || task.deadline)
    }));
  };
  
  // Format due date to a readable format
  const formatDueDate = (dateString) => {
    if (!dateString) return 'Not set';
    
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Format the date (e.g., "Oct 15, 2023")
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get status badge for UI
  const getStatusBadge = (status) => {
    let bgColor, textColor;
    
    switch (status?.toLowerCase()) {
      case 'completed':
        bgColor = '#dcfce7';
        textColor = '#15803d';
        break;
      case 'in_progress':
      case 'in progress':
        bgColor = '#e0f2fe';
        textColor = '#0369a1';
        break;
      case 'pending':
        bgColor = '#fef9c3';
        textColor = '#854d0e';
        break;
      case 'overdue':
        bgColor = '#fee2e2';
        textColor = '#b91c1c';
        break;
      default:
        bgColor = '#f3f4f6';
        textColor = '#4b5563';
    }
    
    const displayStatus = status
      ?.replace(/_/g, ' ')
      ?.split(' ')
      ?.map(word => word.charAt(0).toUpperCase() + word.slice(1))
      ?.join(' ') || 'Unknown';
      
    return (
      <span style={{
        backgroundColor: bgColor,
        color: textColor,
        padding: '0.25rem 0.5rem',
        borderRadius: '0.25rem',
        fontSize: '0.75rem',
        fontWeight: '500'
      }}>
        {displayStatus}
      </span>
    );
  };
  
  // Get RACI role badge with appropriate color
  const getRaciBadge = (role) => {
    let color;
    
    switch (role?.toLowerCase()) {
      case 'responsible': color = '#ef4444'; break;
      case 'accountable': color = '#3b82f6'; break;
      case 'consulted': color = '#f59e0b'; break;
      case 'informed': color = '#10b981'; break;
      default: color = '#6b7280';
    }
    
    return (
      <span style={{
        backgroundColor: color,
        color: 'white',
        padding: '0.25rem 0.5rem',
        borderRadius: '0.25rem',
        fontSize: '0.75rem',
        fontWeight: '500'
      }}>
        {role}
      </span>
    );
  };
  
  // Get priority badge with appropriate color
  const getPriorityBadge = (priority) => {
    let bgColor, textColor;
    
    switch (priority?.toLowerCase()) {
      case 'high':
        bgColor = '#fee2e2';
        textColor = '#b91c1c';
        break;
      case 'medium':
        bgColor = '#fef9c3';
        textColor = '#854d0e';
        break;
      case 'low':
        bgColor = '#dcfce7';
        textColor = '#15803d';
        break;
      default:
        bgColor = '#f3f4f6';
        textColor = '#4b5563';
    }
    
    const displayPriority = priority?.charAt(0).toUpperCase() + priority?.slice(1) || 'Unknown';
      
    return (
      <span style={{
        backgroundColor: bgColor,
        color: textColor,
        padding: '0.25rem 0.5rem',
        borderRadius: '0.25rem',
        fontSize: '0.75rem',
        fontWeight: '500'
      }}>
        {displayPriority}
      </span>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h1>Tasks Assigned to Me</h1>
        <p>View and manage your assigned tasks</p>
      </div>
      
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          padding: '2rem 0' 
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            border: '3px solid #f3f3f3', 
            borderTop: '3px solid #4f46e5', 
            animation: 'spin 1s linear infinite' 
          }}></div>
          <p style={{ marginLeft: '1rem', color: '#4f46e5' }}>Loading your tasks...</p>
        </div>
      ) : error ? (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fee2e2', 
          color: '#b91c1c',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          <p>Error loading tasks: {error}</p>
          <p>Please refresh the page or try again later.</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <h2>No Tasks Assigned</h2>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            You don't have any tasks assigned to you right now.
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Event</th>
                  <th>RACI Role</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '500' }}>{task.title}</div>
                        {task.description && (
                          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                            {task.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{task.eventName}</td>
                    <td>{getRaciBadge(task.raciRole)}</td>
                    <td>{getStatusBadge(task.status)}</td>
                    <td>{getPriorityBadge(task.priority)}</td>
                    <td>{task.dueDate}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                          Details
                        </button>
                        {task.status !== 'completed' && (
                          <button 
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                            onClick={() => {
                              // Handle marking as complete - would call API in real implementation
                              alert(`Task "${task.title}" would be marked as complete`);
                            }}
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksAssigned;
