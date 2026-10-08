import api from './api';
export const adminApi = {
  stats: () => api.get('/admin/stats'),
  users: (params) => api.get('/admin/users', { params }),
  setUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  workers: (params) => api.get('/admin/workers', { params }),
  organizations: (params) => api.get('/admin/organizations', { params }),
  receipts: (params) => api.get('/admin/receipts', { params }),
  reports: (params) => api.get('/admin/reports', { params }),
  auditLogs: (params) => api.get('/admin/audit-logs', { params }),
};
