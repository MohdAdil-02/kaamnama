import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Components receive the response body: { success, data, ... }
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const status = err.response?.status;
    if (status === 401 && useAuthStore.getState().token) useAuthStore.getState().logout();
    let message = err.response?.data?.message || err.message || 'Something went wrong';
    if (err.code === 'ERR_NETWORK') message = 'Cannot reach the server. Check your internet connection and that the backend is running.';
    if (status === 429) message = err.response?.data?.message || 'Too many attempts. Please wait a minute and try again.';
    if (status === 403 && !err.response?.data?.message) message = 'You do not have permission to do this.';
    return Promise.reject({ status, message, errors: err.response?.data?.errors });
  }
);

export default api;
