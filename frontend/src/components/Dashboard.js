import React, { useState, useEffect } from 'react';
import {
  getFights,
  createFight,
  updateFight,
  deleteFightById
} from '../api'; // yolunu proje yapına göre ayarla: '../api' ya da './api'
import './Dashboard.css';

const Dashboard = ({ token, onLogout }) => {
  const [fights, setFights] = useState([]);
  const [filteredFights, setFilteredFights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [error, setError] = useState('');

  const [fightDate, setFightDate] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const [fightType, setFightType] = useState('');
  const [notes, setNotes] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editOpponent, setEditOpponent] = useState('');
  const [editType, setEditType] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const fightTypes = ['Sparring', 'Competition', 'Training', 'Exhibition', 'Championship'];

  const [filterSearchType, setFilterSearchType] = useState('');
  const [searchText, setSearchText] = useState('');
  const [fromDate, setFromDate] = useState(''); // yyyy-mm-dd
  const [toDate, setToDate] = useState('');     // yyyy-mm-dd
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [total, setTotal] = useState(2);
  const totalPages = Math.ceil(total / pageSize);

  const fetchFights = async () => {
    try {
      setLoading(true);
      const data = await getFights(token);
      setFights(data.fights || []);
      setFilteredFights(data.fights || []);
      setTotal(data.total ?? (data.fights?.length || 0));
    } catch (err) {
      console.error(err);
      setError('Failed to load fights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFights(); /* eslint-disable-next-line */ }, [token]);

  useEffect(() => {
    if (filterType) setFilteredFights(fights.filter(f => f.fight_type === filterType));
    else setFilteredFights(fights);
  }, [filterType, fights]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createFight(token, {
        fight_date: fightDate,
        opponent_name: opponentName,
        fight_type: fightType,
        notes
      });
      setFightDate(''); setOpponentName(''); setFightType(''); setNotes(''); setShowForm(false);
      await fetchFights();
      alert('Fight log added successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add fight log');
    }
  };

  const toISOIfSet = (d, endOfDay = false) => {
    if (!d) return undefined;
    const dt = new Date(d);
    if (endOfDay) { dt.setHours(23, 59, 59, 999); }
    return dt.toISOString();
  };

  useEffect(() => {
    searchFights();
  }, [token, filterType, searchText, fromDate, toDate, page]);

  useEffect(() => { setPage(0); }, [filterType, searchText, fromDate, toDate]);

  const searchFights = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        q: searchText || undefined,
        from: toISOIfSet(fromDate),
        to: toISOIfSet(toDate, true),
        type: filterType || undefined,
        limit: pageSize,
        offset: page * pageSize
      };
      const data = await getFights(token, params);
      setFights(data.fights || []);
      setTotal(data.total ?? (data.fights?.length || 0));
    } catch (err) {
      console.error(err);
      setError('Failed to load fights');
    } finally {
      setLoading(false);
    }
  };

  // === PATCH ===
  const startEdit = (fight) => {
    setEditingId(fight.id);
    const iso = new Date(fight.fight_date);
    const pad = (n) => String(n).padStart(2, '0');
    const value = `${iso.getFullYear()}-${pad(iso.getMonth()+1)}-${pad(iso.getDate())}T${pad(iso.getHours())}:${pad(iso.getMinutes())}`;
    setEditDate(value);
    setEditOpponent(fight.opponent_name || '');
    setEditType(fight.fight_type || '');
    setEditNotes(fight.notes || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDate(''); setEditOpponent(''); setEditType(''); setEditNotes('');
  };

  const saveEdit = async (id) => {
    try {
      const body = {
        fight_date: editDate ? new Date(editDate).toISOString() : undefined,
        opponent_name: editOpponent,
        fight_type: editType,
        notes: editNotes
      };
      await updateFight(token, id, body);
      await fetchFights();
      cancelEdit();
      alert('✅ Fight updated');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to update fight');
    }
  };

  // === DELETE ===
  const deleteFight = async (id) => {
    if (!window.confirm('Bu kaydı silmek istediğine emin misin?')) return;
    try {
      await deleteFightById(token, id);
      // Optimistic update
      setFights(prev => prev.filter(f => f.id !== id));
      setFilteredFights(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to delete fight');
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🥊 Fight Tracker</h1>
          <div className="user-info">
            <span>👤 {user?.email}</span>
            <button onClick={onLogout} className="btn-logout">Logout</button>
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
                <option key={type} value={type}>{type}</option>
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
                <select value={fightType} onChange={(e) => setFightType(e.target.value)} required>
                  <option value="">Select type...</option>
                  {fightTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
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
              <button type="submit" className="btn-submit">💾 Save Fight Log</button>
            </form>
          </div>
        )}

        {/* Fights List */}
        <div className="fights-section">
          <h3>📋 Your Fight Logs ({filteredFights.length})</h3>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : filteredFights.length === 0 ? (
            <div className="empty-state"><p>📭 No fight logs yet. Add your first one!</p></div>
          ) : (
            <div className="fights-grid">
              {filteredFights.map((fight) => (
                <div key={fight.id} className="fight-card">
                  {editingId === fight.id ? (
                    // === Edit Mode ===
                    <div className="fight-edit">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Date & Time *</label>
                          <input
                            type="datetime-local"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Opponent *</label>
                          <input
                            type="text"
                            value={editOpponent}
                            onChange={(e) => setEditOpponent(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Fight Type *</label>
                        <select value={editType} onChange={(e) => setEditType(e.target.value)} required>
                          <option value="">Select type...</option>
                          {fightTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Notes</label>
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          rows="3"
                        />
                      </div>

                      <div className="edit-actions">
                        <button className="btn-submit" onClick={() => saveEdit(fight.id)}>💾 Save</button>
                        <button className="btn-cancel" onClick={cancelEdit}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    // === View Mode ===
                    <>
                      <div className="fight-card-header">
                        <span className="fight-type-badge">{fight.fight_type}</span>
                        <span className="fight-date">{formatDate(fight.fight_date)}</span>
                      </div>
                      <div className="fight-card-body">
                        <h4>🥊 vs {fight.opponent_name}</h4>
                        {fight.notes && <p className="fight-notes">{fight.notes}</p>}
                      </div>
                      <div className="fight-card-actions">
                        <button className="btn-secondary" onClick={() => startEdit(fight)}>✏️ Edit</button>
                        <button className="btn-danger" onClick={() => deleteFight(fight.id)}>🗑️ Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Pagination (hazır ama şimdilik kapalı) */}
          {/* {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn-secondary"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                ◀ Prev
              </button>
              <span className="page-info">
                Page {page + 1} / {totalPages}
              </span>
              <button
                className="btn-secondary"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next ▶
              </button>
            </div>
          )} */}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;