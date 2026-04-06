import axios from 'axios';

const API_URL = 'http://localhost:5000/api/analytics/';

const getConfig = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return { headers: { Authorization: `Bearer ${userInfo?.token}` } };
};

const getAnalytics = async () => {
  const response = await axios.get(API_URL, getConfig());
  return response.data;
};

export default { getAnalytics };
