// src/api/index.js
import axios from 'axios';

const API_BASE = 'https://fight-tracker-backend.onrender.com'|| 'http://localhost:3000';

const withAuth = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

// GET /fights  (liste + arama + sayfalama)
export const getFights = async (token, params) => {
  const res = await axios.get(`${API_BASE}/api/fights`, {
    ...withAuth(token),
    params
  });
  return res.data; // { fights, total } bekleniyor
};

// POST /fights (oluştur)
export const createFight = async (token, payload) => {
  const res = await axios.post(`${API_BASE}/api/fights`, payload, withAuth(token));
  return res.data;
};

// PATCH /fights/:id (güncelle)
export const updateFight = async (token, id, payload) => {
  const res = await axios.patch(`${API_BASE}/fights/${id}`, payload, withAuth(token));
  return res.data;
};

// DELETE /fights/:id (sil)
export const deleteFightById = async (token, id) => {
  const res = await axios.delete(`${API_BASE}/fights/${id}`, withAuth(token));
  return res.data;
};
