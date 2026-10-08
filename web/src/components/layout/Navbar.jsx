import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Button from '../common/Button';
import Logo from '../common/Logo';
import LanguageToggle from '../common/LanguageToggle';
import useAuth from '../../hooks/useAuth';
import useT from '../../hooks/useT';
import { HOME_BY_ROLE, FEATURES } from '../../utils/constants';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, role } = useAuth();
  const { t } = useT();
  const links = [
    { to: '/how-it-works', label: t('nav.howItWorks', 'How It Works') },
    { to: '/about', label: t('nav.about', 'About') },
    FEATURES.directory && { to: '/directory', label: t('nav.directory', 'Directory') },
  ].filter(Boolean);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-primary' : 'text-ink-muted hover:text-ink'}`}>{l.label}</NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle />
          {isAuthenticated ? (
            <Link to={HOME_BY_ROLE[role] || '/'}><Button>{t('nav.dashboardBtn', 'Dashboard')}</Button></Link>
          ) : (<>
            <Link to="/login"><Button variant="ghost">{t('nav.login', 'Login')}</Button></Link>
            <Link to="/register"><Button>{t('nav.join', 'Join')}</Button></Link>
          </>)}
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="space-y-1 border-t border-line bg-white px-4 py-3 md:hidden">
          {links.map((l) => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50">{l.label}</Link>)}
          <div className="flex items-center gap-2 pt-2">
            <LanguageToggle />
            {isAuthenticated ? (
              <Link to={HOME_BY_ROLE[role] || '/'} className="flex-1"><Button className="w-full">{t('nav.dashboardBtn', 'Dashboard')}</Button></Link>
            ) : (<>
              <Link to="/login" className="flex-1"><Button variant="outline" className="w-full">{t('nav.login', 'Login')}</Button></Link>
              <Link to="/register" className="flex-1"><Button className="w-full">{t('nav.join', 'Join')}</Button></Link>
            </>)}
          </div>
        </div>
      )}
    </header>
  );
}
