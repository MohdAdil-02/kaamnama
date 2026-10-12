import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataState from '../../components/common/DataState';
import EmptyState from '../../components/common/EmptyState';
import PrivacyNote from '../../components/common/PrivacyNote';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import useFetch from '../../hooks/useFetch';
import { workerApi } from '../../services/workerApi';
import { toast } from '../../store/notificationStore';
import { formatDate } from '../../utils/formatters';

export default function MyOrganizations() {
  const res = useFetch(() => workerApi.invites(), []);
  const [busy, setBusy] = useState('');

  const respond = async (id, accept) => {
    setBusy(id);
    try {
      await (accept ? workerApi.acceptInvite(id) : workerApi.declineInvite(id));
      toast.success(accept ? 'You joined the organization' : 'Invite declined');
      res.reload();
    } catch (e) { toast.error(e.message); } finally { setBusy(''); }
  };

  return (
    <>
      <PageHeader title="My organizations" subtitle="Invitations from contractors, agencies and firms" />
      <PrivacyNote className="mb-6">You always keep your full record. Joining an organization adds a badge to its public page.</PrivacyNote>
      <DataState result={res}>
        {(raw) => {
          const items = raw.data?.invites ?? raw.invites ?? [];
          return items.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((m) => (
                <div key={m._id} className="card">
                  <div className="flex items-start justify-between gap-2">
                    <h3>{m.organization?.name}</h3>
                    {m.organization?.isVerified && <Badge tone="success">Verified</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">{m.organization?.city || ''}</p>
                  <p className="mt-1 text-xs text-ink-muted">Invited {formatDate(m.createdAt)}</p>
                  <div className="mt-4 flex gap-2">
                    <Button loading={busy === m._id} onClick={() => respond(m._id, true)}>Accept</Button>
                    <Button variant="outline" onClick={() => respond(m._id, false)}>Decline</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="card"><EmptyState title="No invitations" description="When an organization invites you, it will appear here." /></div>;
        }}
      </DataState>
    </>
  );
}