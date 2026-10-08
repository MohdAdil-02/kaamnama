import Logo from '../common/Logo';
import LanguageToggle from '../common/LanguageToggle';
export default function AuthShell({ title, subtitle, children, footer, wide }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="mb-6 flex items-center justify-between"><Logo /><LanguageToggle /></div>
        <div className="card">
          <h2>{title}</h2>
          {subtitle && <p className="mb-6 mt-1 text-sm text-ink-muted">{subtitle}</p>}
          {children}
        </div>
        {footer && <p className="mt-4 text-center text-sm text-ink-muted">{footer}</p>}
      </div>
    </div>
  );
}
