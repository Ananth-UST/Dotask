import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateTask from './pages/CreateTask';

function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="app-container">
      <nav className="nav">
        <h1 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.5rem' }}>Task Master</h1>
        <div className="nav-links">
          {token ? (
            <>
              <Link to="/">Dashboard</Link>
              <button 
                className="btn btn-danger" 
                style={{ width: 'auto', padding: '0.5rem 1rem' }} 
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>Register</Link>
            </>
          )}
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={token ? <Dashboard /> : <Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create" element={token ? <CreateTask /> : <Login />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
