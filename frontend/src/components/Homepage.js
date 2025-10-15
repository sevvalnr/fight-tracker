import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Homepage = ({ token, onLogout }) => {
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
  const navigate = useNavigate();

  const handleProfile = () => {
    navigate('/dashboard');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>🥊 Fight Tracker</h1>
          <p style={{ marginTop: 4, color: '#666' }}>Track fights, training sessions and progress.</p>
        </div>
        <div>
          {!token ? (
            <Link to="/login" className="btn-primary">Login</Link>
          ) : (
            <>
              <button onClick={handleProfile} className="btn-secondary" style={{ marginRight: 8 }}>
                {user?.name ? `Profile (${user.name})` : 'Profile'}
              </button>
              <button onClick={onLogout} className="btn-danger">Logout</button>
            </>
          )}
        </div>
      </header>

      <main style={{ marginTop: 24 }}>
        <section style={{ background: '#fafafa', padding: 20, borderRadius: 8 }}>
          <h2>Welcome{user?.name ? `, ${user.name}` : ''}!</h2>
          <p>
            This is the Fight Tracker app — a lightweight tool to log training, record sparring and
            view your progress over time. Use the Login button to sign in, or register a new account.
          </p>
          <div style={{ marginTop: 12 }}>
            <Link to="/register" className="btn-outline">Create an account</Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Homepage;
