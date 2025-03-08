import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUser = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await axios.patch(`${API_URL}/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const approveUser = async (id) => {
  try {
    const response = await axios.patch(`${API_URL}/users/${id}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateCurrentUser = async (userData) => {
  try {
    const response = await axios.patch(`${API_URL}/users/updateMe`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
