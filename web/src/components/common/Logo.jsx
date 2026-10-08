import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
export default function Logo({ to = '/', className = '' }) {
  return (
    <Link to={to} className={`flex items-center gap-2 font-bold ${className}`} aria-label="Kaamnama home">
      <ShieldCheck className="text-primary" />
      <span className="text-lg leading-none">Kaamnama <span className="ml-1 text-xs font-medium text-ink-muted">कामनामा</span></span>
    </Link>
  );
}
