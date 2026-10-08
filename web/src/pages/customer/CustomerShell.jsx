import Logo from '../../components/common/Logo';
import LanguageToggle from '../../components/common/LanguageToggle';
export default function CustomerShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-start justify-center bg-canvas px-4 py-8 sm:items-center">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between"><Logo /><LanguageToggle /></div>
        <div className="card">
          <h2>{title}</h2>
          {subtitle && <p className="mb-5 mt-1 text-sm text-ink-muted">{subtitle}</p>}
          {children}
        </div>
        <p className="mt-4 text-center text-xs text-ink-muted">Kaamnama · a written record of work done</p>
      </div>
    </div>
  );
}
