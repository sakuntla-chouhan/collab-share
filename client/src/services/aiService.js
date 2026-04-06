import axios from 'axios';

const API_URL = 'http://localhost:5000/api/ai/';

const getConfig = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return { headers: { Authorization: `Bearer ${userInfo?.token}` } };
};

const processText = async (action, text) => {
  const response = await axios.post(API_URL + 'process', { action, text }, getConfig());
  return response.data;
};

export default { processText };
