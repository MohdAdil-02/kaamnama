import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, Plus, Search, X } from 'lucide-react';
import Sidebar, { MENU } from './Sidebar';
import NotificationBell from './NotificationBell';
import Avatar from '../common/Avatar';
import Logo from '../common/Logo';
import LanguageToggle from '../common/LanguageToggle';
import OfflineBanner from '../common/OfflineBanner';
import useAuth from '../../hooks/useAuth';
import useT from '../../hooks/useT';
import { FEATURES } from '../../utils/constants';

export default function DashboardLayout() {
  const { user, role, logout } = useAuth();
  const { t } = useT();
  const [drawer, setDrawer] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const items = (MENU[role] || []).filter((i) => !i.feature || FEATURES[i.feature]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const search = (e) => { e.preventDefault(); if (q.trim()) navigate(`/directory/search?q=${encodeURIComponent(q.trim())}`); };
  const showFab = role === 'worker' && !pathname.endsWith('/receipts/new');

  return (
    <div className="min-h-screen bg-canvas">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white px-4 sm:px-6">
        <button className="lg:hidden" onClick={() => setDrawer(true)} aria-label="Open menu"><Menu /></button>
        <Logo className="lg:w-[226px]" />
        {FEATURES.directory && (
          <form onSubmit={search} className="relative ml-4 hidden max-w-md flex-1 md:block" role="search">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a verified worker…" aria-label="Search directory"
              className="h-10 w-full rounded-lg border border-line bg-canvas pl-9 pr-3 text-sm outline-none focus:border-primary" />
          </form>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden sm:block"><LanguageToggle /></span>
          <NotificationBell />
          <div className="flex items-center gap-2 pl-2">
            <Avatar name={user?.name} src={user?.avatar} size={36} />
            <span className="hidden text-sm font-medium sm:block">{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="rounded-lg p-2 text-ink-muted hover:bg-slate-100" aria-label="Logout"><LogOut size={18} /></button>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-16 hidden w-[250px] overflow-y-auto border-r border-line bg-white lg:block"><Sidebar items={items} /></aside>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <span className="font-bold">{t('nav.menu', 'Menu')}</span>
              <div className="flex items-center gap-2"><LanguageToggle /><button onClick={() => setDrawer(false)} aria-label="Close menu"><X /></button></div>
            </div>
            <Sidebar items={items} onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <main id="main" className="pb-24 pt-16 lg:pb-8 lg:pl-[250px]">
        <div className="mx-auto max-w-[1400px] p-4 sm:p-8"><Outlet /></div>
      </main>

      {showFab && (
        <Link to="/worker/receipts/new" aria-label="Create receipt"
          className="no-print fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark lg:hidden"><Plus size={26} /></Link>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-white lg:hidden" aria-label="Primary">
        {items.slice(0, 4).map(({ to, label, key, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${isActive ? 'text-primary' : 'text-ink-muted'}`}>
            <Icon size={20} />{key ? t(key, label) : label}
          </NavLink>
        ))}
      </nav>
      <OfflineBanner />
    </div>
  );
}
