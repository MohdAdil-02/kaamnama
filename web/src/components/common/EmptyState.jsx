import { Inbox } from 'lucide-react';
export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-4 rounded-full bg-slate-100 p-4"><Icon className="text-ink-muted" size={28} /></div>
      <h3>{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
