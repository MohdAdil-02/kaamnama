import { NavLink } from 'react-router-dom';
import useT from '../../hooks/useT';
import { LayoutDashboard, User, FileText, ShieldCheck, QrCode, Settings, Users, Building2, BarChart3, ScrollText, Briefcase } from 'lucide-react';

export const MENU = {
  worker: [
    { to: '/worker/dashboard', key: 'nav.dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/worker/receipts', key: 'nav.receipts', label: 'Job Receipts', icon: FileText },
    { to: '/worker/profile', key: 'nav.profile', label: 'Profile', icon: User },
    { to: '/worker/trust-score', key: 'nav.trust', label: 'Trust Score', icon: ShieldCheck },
    { to: '/worker/qr', key: 'nav.qr', label: 'QR Code', icon: QrCode },
    { to: '/worker/organizations', label: 'My Organizations', icon: Building2, feature: 'organizations' },
    { to: '/worker/settings', key: 'nav.settings', label: 'Settings', icon: Settings },
  ],
  organization: [
    { to: '/organization/dashboard', key: 'nav.dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/organization/members', label: 'Members', icon: Users },
    { to: '/organization/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/organization/profile', key: 'nav.profile', label: 'Profile', icon: Building2 },
  ],
  admin: [
    { to: '/admin/dashboard', key: 'nav.dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/workers', label: 'Workers', icon: User },
    { to: '/admin/organizations', label: 'Organizations', icon: Building2 },
    { to: '/admin/receipts', label: 'Receipts', icon: FileText },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
  ],
};

export default function Sidebar({ items, onNavigate }) {
  const { t } = useT();
  return (
    <nav className="space-y-1 p-3">
      {items.map(({ to, label, key, icon: Icon }) => (
        <NavLink key={to} to={to} onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
             ${isActive ? 'bg-primary-light text-primary' : 'text-ink-muted hover:bg-slate-100 hover:text-ink'}`}>
          <Icon size={18} /> {key ? t(key, label) : label}
        </NavLink>
      ))}
    </nav>
  );
}
