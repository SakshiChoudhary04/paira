import axios from 'axios';

const api = axios.create({
  baseURL: 'https://paira-fl4j.onrender.com/api',
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('paira_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('paira_token');
      localStorage.removeItem('paira_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
