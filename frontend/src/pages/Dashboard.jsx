import React, { useEffect, useState } from 'react';
import { request } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await request('/tasks');
      setTasks(data);
    } catch (err) {
      if (err.message === 'Unauthorized' || err.message === 'No token provided') {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (task) => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    try {
      await request(`/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      loadTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await request(`/tasks/${id}`, {
        method: 'DELETE',
      });
      loadTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Your Tasks</h2>
        <button className="btn" style={{ width: 'auto' }} onClick={() => navigate('/create')}>+ New Task</button>
      </div>

      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--card-bg)', borderRadius: '1rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No tasks found. Create one to get started!</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map(task => (
             <div key={task.id} className="task-card">
               <h3>{task.title}</h3>
               <p>{task.description}</p>
               <div className="task-actions">
                 <span 
                    className={`badge ${task.status}`} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleStatusChange(task)}
                 >
                   {task.status}
                 </span>
                 <button className="btn btn-danger" style={{ width: 'auto' }} onClick={() => handleDelete(task.id)}>Delete</button>
               </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
