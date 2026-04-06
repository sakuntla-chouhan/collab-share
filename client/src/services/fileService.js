import axios from 'axios';

const API_URL = 'http://localhost:5000/api/files/';

const getConfig = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return { headers: { Authorization: `Bearer ${userInfo?.token}` } };
};

const uploadFile = async (projectId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = {
    headers: {
      Authorization: `Bearer ${userInfo?.token}`,
      'Content-Type': 'multipart/form-data',
    },
  };

  const response = await axios.post(API_URL + 'upload/' + projectId, formData, config);
  return response.data;
};

const getProjectFiles = async (projectId) => {
  const response = await axios.get(API_URL + 'project/' + projectId, getConfig());
  return response.data;
};

const deleteFile = async (id) => {
  const response = await axios.delete(API_URL + id, getConfig());
  return response.data;
};

export default { uploadFile, getProjectFiles, deleteFile };
