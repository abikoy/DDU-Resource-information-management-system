import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

// Add authorization header to all requests
const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPendingUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/pending`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getApprovedUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/approved`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUser = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/users/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await axios.patch(`${API_URL}/users/${id}`, userData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/users/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const approveUser = async (id) => {
  try {
    const response = await axios.patch(`${API_URL}/users/${id}/approve`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateCurrentUser = async (userData) => {
  try {
    const response = await axios.patch(`${API_URL}/users/updateMe`, userData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
