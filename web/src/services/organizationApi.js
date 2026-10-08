import api from './api';
export const organizationApi = {
  dashboard: () => api.get('/organizations/me/dashboard'),
  getMe: () => api.get('/organizations/me'),
  updateMe: (data) => api.put('/organizations/me', data),
  members: (params) => api.get('/organizations/me/members', { params }),
  inviteMember: (phone, role) => api.post('/organizations/me/members', { phone, role }),
  removeMember: (id) => api.delete(`/organizations/me/members/${id}`),
  jobs: (params) => api.get('/organizations/me/jobs', { params }),
};
