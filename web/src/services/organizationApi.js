import api from './api';

export const organizationApi = {
  // ---- Org admin ----
  mine: () => api.get('/organizations/mine'),                                   // -> { data: { organizations } }
  create: (data) => api.post('/organizations', data),                           // name, description, city, phone, email
  update: (id, data) => api.patch(`/organizations/${id}`, data),
  members: (id) => api.get(`/organizations/${id}/members`),                     // -> { data: { members } }
  invite: (id, phone) => api.post(`/organizations/${id}/invites`, { phone }),
  removeMember: (id, memberId) => api.delete(`/organizations/${id}/members/${memberId}`),

  // ---- Public ----
  publicProfile: (slug) => api.get(`/organizations/public/${slug}`),
};