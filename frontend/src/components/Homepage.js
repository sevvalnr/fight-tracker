import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Homepage = ({ token, onLogout }) => {
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
  const navigate = useNavigate();

  const handleProfile = () => navigate('/dashboard');

  return (
    <div style={{
      background: 'linear-gradient(180deg,#111013 0%, #1a1a1f 100%)',
      color: '#eee',
      minHeight: '100vh',
      padding: '3rem 1rem'
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Hero */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.2rem', letterSpacing: '0.03em' }}>🥊 Fight Tracker</h1>
            <p style={{ marginTop: 6, color: '#bdbdbd' }}>Track training. Win days.</p>
          </div>
        </header>

        {/* Main Hero (stacked headline left, large image right) */}
        <main style={{ marginTop: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
            {/* Left: large stacked headline and CTA */}
            <section style={{ padding: '2rem 1rem' }}>
              <h2 style={{
                margin: 0,
                fontSize: '4rem',
                lineHeight: 0.9,
                letterSpacing: '-0.02em',
                color: '#fff'
              }}>
                FIGHT
                <br />
                TRACKING
              </h2>
              <p style={{ marginTop: 18, color: '#cfcfcf', maxWidth: 520 }}>
                Get the full FightTracker experience — tracking, session logs. Train with intention.
              </p>

              <div style={{ marginTop: 22 }}>
                <Link to="/dashboard" className="btn-primary" style={{ marginRight: 12 }}>Get Started</Link>
                {!token && <Link to="/login" className="btn-primary">Login</Link>}
              </div>
            </section>

            <section style={{ height: 420, borderRadius: 10, overflow: 'hidden', boxShadow: '0 6px 30px rgba(0,0,0,0.6)' }}>
              <div style={{
                width: '100%',
                height: '100%',
                backgroundImage: "url('/public/hero-boxing.jpg')",
                backgroundPosition: 'center right',
                backgroundSize: 'cover',
                backgroundColor: '#000'
              }} />
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer style={{ marginTop: 42, color: '#9a9a9a', textAlign: 'center', fontSize: 13 }}>
          © {new Date().getFullYear()} Fight Tracker
        </footer>
      </div>
    </div>
  );
};

function StatCard({ label, value }) {
  return (
    <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 8, border: '1px solid rgba(255,255,255,0.03)' }}>
      <div style={{ fontSize: 18, fontWeight: '700' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#bdbdbd', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default Homepage;
