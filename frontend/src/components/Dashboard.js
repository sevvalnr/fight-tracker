import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = ({ token, onLogout }) => {
  const [fights, setFights] = useState([]);
  const [filteredFights, setFilteredFights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('');
  
  // Form states
  const [fightDate, setFightDate] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const [fightType, setFightType] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));

  const fightTypes = ['Sparring', 'Competition', 'Training', 'Exhibition', 'Championship'];

  const fetchFights = async () => {
    try {
      const response = await axios.get('http://localhost:5000/fights', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFights(response.data.fights);
      setFilteredFights(response.data.fights);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load fights');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFights();
  }, [token]);

  useEffect(() => {
    if (filterType) {
      setFilteredFights(fights.filter(f => f.fight_type === filterType));
    } else {
      setFilteredFights(fights);
    }
  }, [filterType, fights]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post(
        'http://localhost:5000/fights',
        {
          fight_date: fightDate,
          opponent_name: opponentName,
          fight_type: fightType,
          notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFightDate('');
      setOpponentName('');
      setFightType('');
      setNotes('');
      setShowForm(false);

      fetchFights();
      alert('✅ Fight log added successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add fight log');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🥊 Fight Tracker</h1>
          <div className="user-info">
            <span>👤 {user?.email}</span>
            <button onClick={onLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-controls">
          <button onClick={() => setShowForm(!showForm)} className="btn-add">
            {showForm ? '❌ Cancel' : '➕ Add New Fight Log'}
          </button>

          <div className="filter-group">
            <label>Filter by type:</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {fightTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {showForm && (
          <div className="fight-form-container">
            <h3>📝 New Fight Log</h3>
            <form onSubmit={handleSubmit} className="fight-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={fightDate}
                    onChange={(e) => setFightDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Opponent Name *</label>
                  <input
                    type="text"
                    value={opponentName}
                    onChange={(e) => setOpponentName(e.target.value)}
                    required
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Fight Type *</label>
                <select
                  value={fightType}
                  onChange={(e) => setFightType(e.target.value)}
                  required
                >
                  <option value="">Select type...</option>
                  {fightTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this fight..."
                  rows="4"
                />
              </div>

              {error && <div className="error-message">⚠️ {error}</div>}

              <button type="submit" className="btn-submit">
                💾 Save Fight Log
              </button>
            </form>
          </div>
        )}

        {/* Fights List */}
        <div className="fights-section">
          <h3>📋 Your Fight Logs ({filteredFights.length})</h3>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : filteredFights.length === 0 ? (
            <div className="empty-state">
              <p>📭 No fight logs yet. Add your first one!</p>
            </div>
          ) : (
            <div className="fights-grid">
              {filteredFights.map((fight) => (
                <div key={fight.id} className="fight-card">
                  <div className="fight-card-header">
                    <span className="fight-type-badge">{fight.fight_type}</span>
                    <span className="fight-date">{formatDate(fight.fight_date)}</span>
                  </div>
                  <div className="fight-card-body">
                    <h4>🥊 vs {fight.opponent_name}</h4>
                    {fight.notes && <p className="fight-notes">{fight.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;