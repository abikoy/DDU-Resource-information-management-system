import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

export const getAllResources = async () => {
  try {
    const response = await axios.get(`${API_URL}/resources`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getResource = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/resources/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createResource = async (resourceData) => {
  try {
    const response = await axios.post(`${API_URL}/resources`, resourceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateResource = async (id, resourceData) => {
  try {
    const response = await axios.patch(`${API_URL}/resources/${id}`, resourceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteResource = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/resources/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const transferResource = async (id, newAssigneeId) => {
  try {
    const response = await axios.post(`${API_URL}/resources/${id}/transfer`, { newAssigneeId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
