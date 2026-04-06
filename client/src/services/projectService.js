import axios from 'axios';

const API_URL = 'http://localhost:5000/api/projects/';

// Helper to set config with token
const getConfig = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return {
    headers: {
      Authorization: `Bearer ${userInfo?.token}`
    }
  };
};

const getProjects = async () => {
  const response = await axios.get(API_URL, getConfig());
  return response.data;
};

const createProject = async (projectData) => {
  const response = await axios.post(API_URL, projectData, getConfig());
  return response.data;
};

const getProjectById = async (id) => {
  const response = await axios.get(API_URL + id, getConfig());
  return response.data;
};

const deleteProject = async (id) => {
  const response = await axios.delete(API_URL + id, getConfig());
  return response.data;
};

const addMember = async (id, email) => {
  const response = await axios.post(API_URL + id + '/members', { email }, getConfig());
  return response.data;
};

const removeMember = async (id, memberId) => {
  const response = await axios.delete(API_URL + id + '/members/' + memberId, getConfig());
  return response.data;
};

export default { getProjects, createProject, getProjectById, deleteProject, addMember, removeMember };
