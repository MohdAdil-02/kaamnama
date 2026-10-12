import api from './api';

export const authApi = {
  sendOtp: (phone) => api.post('/auth/otp/send', { phone }),

  // New phone numbers also need { name, role: 'worker' | 'customer' | 'org_admin', city? }.
  // Returns { data: { user, isNewUser, accessToken, refreshToken } }
  verifyOtp: (phone, otp, extra = {}) => api.post('/auth/otp/verify', { phone, otp, ...extra }),

  me: () => api.get('/auth/me'),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  logoutAll: () => api.post('/auth/logout-all'),
};