export const ROLES = { WORKER: 'worker', CUSTOMER: 'customer', ORGANIZATION: 'organization', ADMIN: 'admin' };

// Keep in sync with backend constants/statuses.js
export const RECEIPT_STATUS = { PENDING: 'pending', VERIFIED: 'verified', COMPLETED: 'completed', REJECTED: 'rejected' };

export const HOME_BY_ROLE = {
  worker: '/worker/dashboard',
  organization: '/organization/dashboard',
  admin: '/admin/dashboard',
  customer: '/',
};

const flag = (v) => String(v ?? 'true') !== 'false';
// Stage 2 features can be switched off from .env
export const FEATURES = {
  organizations: flag(import.meta.env.VITE_FEATURE_ORGANIZATIONS),
  directory: flag(import.meta.env.VITE_FEATURE_DIRECTORY),
  education: flag(import.meta.env.VITE_FEATURE_EDUCATION),
};

export const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;
export const PAGE_SIZE = 12;
export const ORG_TYPES = [
  { value: 'contractor', label: 'Contractor' },
  { value: 'agency', label: 'Agency' },
  { value: 'firm', label: 'Firm' },
];
export const ORG_ROLES = [
  { value: 'worker', label: 'Worker' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'helper', label: 'Helper' },
];
