import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={!token ? <Login setToken={setToken} /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/register"
            element={!token ? <Register /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/dashboard"
            element={token ? <Dashboard token={token} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;