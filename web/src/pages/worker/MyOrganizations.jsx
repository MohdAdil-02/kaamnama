import PageHeader from '../../components/common/PageHeader';
import DataState from '../../components/common/DataState';
import EmptyState from '../../components/common/EmptyState';
import PrivacyNote from '../../components/common/PrivacyNote';
import Badge from '../../components/common/Badge';
import useFetch from '../../hooks/useFetch';
import { workerApi } from '../../services/workerApi';
import { formatDate } from '../../utils/formatters';

export default function MyOrganizations() {
  const res = useFetch(() => workerApi.memberships(), []);
  return (
    <>
      <PageHeader title="My organizations" subtitle="Your career across every contractor, agency or firm" />
      <PrivacyNote className="mb-6">You always keep your full record. An organization only sees jobs done under its name, and only for the period you were a member.</PrivacyNote>
      <DataState result={res}>
        {(d) => {
          const items = d.items ?? d;
          return items.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((m) => (
                <div key={m._id} className="card">
                  <div className="flex items-start justify-between gap-2"><h3>{m.org?.name || m.orgName}</h3><Badge tone={m.endDate ? 'neutral' : 'success'}>{m.endDate ? 'Ended' : 'Active'}</Badge></div>
                  <p className="mt-1 text-sm capitalize text-ink-muted">{[m.role, m.org?.type].filter(Boolean).join(' · ')}</p>
                  <p className="mt-3 text-sm">{formatDate(m.startDate)} to {m.endDate ? formatDate(m.endDate) : 'present'}</p>
                </div>
              ))}
            </div>
          ) : <div className="card"><EmptyState title="Independent so far" description="When an organization adds you, it will appear here." /></div>;
        }}
      </DataState>
    </>
  );
}
