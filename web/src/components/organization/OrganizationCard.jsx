import { Building2 } from 'lucide-react';
export default function OrganizationCard({ org }) {
  return (
    <div className="card flex items-center gap-4">
      <div className="rounded-xl bg-primary-light p-3 text-primary"><Building2 size={28} /></div>
      <div className="min-w-0">
        <h3 className="truncate">{org.name}</h3>
        <p className="truncate text-sm text-ink-muted">{[org.type, org.city].filter(Boolean).join(', ')}</p>
      </div>
    </div>
  );
}
