export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
export const formatPhone = (p) => (p ? `+91 ${String(p).replace(/^\+?91/, '')}` : '');
export const maskPhone = (p = '') => { const d = String(p).replace(/\D/g, '').slice(-10); return d.length === 10 ? `${d.slice(0, 2)}******${d.slice(-2)}` : p; };
export const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
export const capitalize = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);
export const initials = (name = '') => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'U';
export const receiptTitle = (r = {}) => r.workType || r.serviceType || r.title || r.category?.name || 'Job';
export const monthsLabel = (m) => (m == null ? '' : m >= 12 ? `${Math.floor(m / 12)} yr ${m % 12} mo` : `${m} months`);
