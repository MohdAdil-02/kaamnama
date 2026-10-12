import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const baseURL = import.meta.env.VITE_API_URL || '/api/v1';
const api = axios.create({ baseURL, timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh tokens are single-use, so parallel 401s must share ONE refresh call.
let refreshing = null;
const refreshSession = () => {
  if (!refreshing) {
    const { refreshToken } = useAuthStore.getState();
    refreshing = axios
      .post(`${baseURL}/auth/refresh`, { refreshToken }, { timeout: 20000 })
      .then((res) => {
        const { accessToken, refreshToken: next, user } = res.data.data;
        useAuthStore.getState().setSession({ token: accessToken, refreshToken: next, user });
        return accessToken;
      })
      .finally(() => { refreshing = null; });
  }
  return refreshing;
};

const AUTH_PATHS = ['/auth/otp/send', '/auth/otp/verify', '/auth/refresh'];

api.interceptors.response.use(
  (res) => res.data, // components receive { success, data, meta }
  async (err) => {
    const status = err.response?.status;
    const original = err.config;
    const { refreshToken, token } = useAuthStore.getState();

    const canRefresh =
      status === 401 && token && refreshToken && original &&
      !original._retried && !AUTH_PATHS.some((p) => original.url?.includes(p));

    if (canRefresh) {
      original._retried = true;
      try {
        const newToken = await refreshSession();
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
      }
    } else if (status === 401 && token && !AUTH_PATHS.some((p) => original?.url?.includes(p))) {
      useAuthStore.getState().logout();
    }

    let message = err.response?.data?.message || err.message || 'Something went wrong';
    if (err.code === 'ERR_NETWORK') message = 'Cannot reach the server. Check your internet connection and that the backend is running.';
    if (status === 429) message = err.response?.data?.message || 'Too many attempts. Please wait a minute and try again.';
    if (status === 403 && !err.response?.data?.message) message = 'You do not have permission to do this.';
    return Promise.reject({
      status, message,
      errors: err.response?.data?.errors,
      requestId: err.response?.data?.requestId,
    });
  }
);

export default api;