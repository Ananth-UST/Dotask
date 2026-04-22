import React, { useState } from 'react';
import { request } from '../api';
import { useNavigate } from 'react-router-dom';

export default function CreateTask() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await request('/tasks', {
        method: 'POST',
        body: JSON.stringify({ title, description, status: 'pending' }),
      });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Create New Task</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Add a new task to your list.</p>
      
      {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
      
      <form onSubmit={handleCreate}>
        <div className="form-group">
          <label>Task Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="e.g. Do laundry"
            required 
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea 
            rows="4"
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Optional details..."
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="button" className="btn" style={{ background: '#e5e7eb', color: '#374151' }} onClick={() => navigate('/')}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
