import { Lock } from 'lucide-react';
export default function PrivacyNote({ children, className = '' }) {
  return (
    <div className={`flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-ink-muted ${className}`}>
      <Lock size={14} className="mt-0.5 shrink-0" /><p>{children}</p>
    </div>
  );
}
