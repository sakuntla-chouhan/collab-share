import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notes/';

const getConfig = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return { headers: { Authorization: `Bearer ${userInfo?.token}` } };
};

const getProjectNotes = async (projectId) => {
  const response = await axios.get(API_URL + 'project/' + projectId, getConfig());
  return response.data;
};

const createNote = async (noteData) => {
  const response = await axios.post(API_URL, noteData, getConfig());
  return response.data;
};

const updateNote = async (id, noteData) => {
  const response = await axios.put(API_URL + id, noteData, getConfig());
  return response.data;
};

const deleteNote = async (id) => {
  const response = await axios.delete(API_URL + id, getConfig());
  return response.data;
};

export default { getProjectNotes, createNote, updateNote, deleteNote };
