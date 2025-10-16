// src/api/index.js
import axios from 'axios';

const API_BASE = `${process.env.REACT_APP_API_URL}`||'http://localhost:5000';

const withAuth = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

export const getFights = async (token, params) => {
  const res = await axios.get(`${API_BASE}/fights`, {
    ...withAuth(token),
    params
  });
  return res.data; 
};

export const createFight = async (token, payload) => {
  const res = await axios.post(`${API_BASE}/fights`, payload, withAuth(token));
  return res.data;
};

export const updateFight = async (token, id, payload) => {
  const res = await axios.patch(`${API_BASE}/fights/${id}`, payload, withAuth(token));
  return res.data;
};

export const deleteFightById = async (token, id) => {
  const res = await axios.delete(`${API_BASE}/fights/${id}`, withAuth(token));
  return res.data;
};
