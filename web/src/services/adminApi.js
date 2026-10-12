import api from './api';

export const adminApi = {
  stats: () => api.get('/admin/stats'),
  users: (params) => api.get('/admin/users', { params }),
  suspendUser: (id, reason) => api.post(`/admin/users/${id}/suspend`, { reason }),
  reactivateUser: (id) => api.post(`/admin/users/${id}/reactivate`),

  flaggedWorkers: (params) => api.get('/admin/workers/flagged', { params }),
  clearFlag: (id, reason) => api.post(`/admin/workers/${id}/clear-flag`, { reason }),
  freezeWorker: (id, reason) => api.post(`/admin/workers/${id}/freeze`, { reason }),
  unfreezeWorker: (id) => api.post(`/admin/workers/${id}/unfreeze`),

  organizations: (params) => api.get('/admin/organizations', { params }),
  verifyOrg: (id) => api.post(`/admin/organizations/${id}/verify`),
  unverifyOrg: (id) => api.post(`/admin/organizations/${id}/unverify`),

  ratings: (params) => api.get('/admin/ratings', { params }),
  hideRating: (id, reason) => api.post(`/admin/ratings/${id}/hide`, { reason }),
  unhideRating: (id) => api.post(`/admin/ratings/${id}/unhide`),

  receipts: (params) => api.get('/admin/receipts', { params }),
  auditLogs: (params) => api.get('/admin/audit-logs', { params }),
};