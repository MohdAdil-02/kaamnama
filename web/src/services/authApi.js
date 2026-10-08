import api from './api';
export const authApi = {
  sendOtp: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOtp: (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
  register: (payload) => api.post('/auth/register', payload),
  me: () => api.get('/auth/me'),
  // payload: { vertical: 'trade' | 'education', categoryIds: [] }
  selectCategory: (payload) => api.post('/auth/select-category', payload),
};
