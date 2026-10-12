import api from './api';

export const workerApi = {
  getMe: () => api.get('/workers/me'),                       // -> { data: { worker } }
  update: (payload) => api.patch('/workers/me', payload),    // categories, skills, bio, latitude+longitude...
  trust: () => api.get('/workers/me/trust'),                 // -> { data: { trust } } (null if frozen)
  uploadPhoto: (file) => {
    const fd = new FormData();
    fd.append('photo', file);
    return api.post('/workers/me/photo', fd);
  },
  removePhoto: () => api.delete('/workers/me/photo'),

  // Invites from organizations
  invites: () => api.get('/organizations/invites/mine'),
  acceptInvite: (id) => api.post(`/organizations/invites/${id}/accept`),
  declineInvite: (id) => api.post(`/organizations/invites/${id}/decline`),
  leaveOrg: (orgId) => api.post(`/organizations/leave/${orgId}`),

  // Composed from real endpoints: the backend has no single dashboard route
  dashboard: async () => {
    const [me, trust, recent, pending] = await Promise.all([
      api.get('/workers/me'),
      api.get('/workers/me/trust'),
      api.get('/receipts', { params: { limit: 4 } }),
      api.get('/receipts', { params: { status: 'pending', limit: 1 } }),
    ]);
    const w = me.data.worker;
    const t = trust.data.trust;
    return {
      data: {
        slug: w.slug,
        trustScore: w.trustScore,
        tier: w.tier,
        verifiedJobs: w.verifiedJobsCount,
        repeatCustomers: w.repeatCustomersCount,
        avgRating: w.averageRating,
        ratingsCount: w.ratingsCount,
        pendingReceipts: pending.meta?.total ?? 0,
        recentReceipts: recent.data.receipts,
        nextTier: t?.nextTier ?? null,
      },
    };
  },
};