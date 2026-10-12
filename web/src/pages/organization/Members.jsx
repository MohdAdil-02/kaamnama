import { useEffect, useState, useCallback } from 'react';
import { UserPlus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PhoneInput from '../../components/auth/PhoneInput';
import PrivacyNote from '../../components/common/PrivacyNote';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import TierBadge from '../../components/receipt/TierBadge';
import OrgGate from '../../components/organization/OrgGate';
import useOrg from '../../hooks/useOrg';
import { organizationApi } from '../../services/organizationApi';
import { isPhone } from '../../utils/validators';
import { toast } from '../../store/notificationStore';

function List({ org }) {
  const [members, setMembers] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(null);

  const load = useCallback(() =>
    organizationApi.members(org._id).then((r) => setMembers(r.data?.members ?? [])).catch((e) => toast.error(e.message)), [org._id]);
  useEffect(() => { load(); }, [load]);

  const invite = async () => {
    if (!isPhone(phone)) return toast.error('Enter a valid 10-digit mobile number');
    setBusy(true);
    try { await organizationApi.invite(org._id, phone); toast.success('Invitation sent'); setInviteOpen(false); setPhone(''); load(); }
    catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await organizationApi.removeMember(org._id, removing._id); toast.success('Member removed'); setRemoving(null); load(); }
    catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <>
      <div className="mb-4 flex justify-end"><Button icon={UserPlus} onClick={() => setInviteOpen(true)}>Invite worker</Button></div>
      {members === null ? null : members.length === 0 ? (
        <div className="card"><EmptyState title="No members yet" description="Invite workers by phone number. They must already have a Kaamnama worker account." /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {members.map((m) => (
            <div key={m._id} className="card flex items-center gap-3">
              <Avatar name={m.worker?.displayName} src={m.worker?.photoUrl} size={48} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{m.worker?.displayName}</p>
                <p className="text-sm text-ink-muted">Score {m.worker?.trustScore ?? 0}</p>
              </div>
              {m.worker?.tier && <TierBadge tier={m.worker.tier} />}
              <Badge tone={m.status === 'active' ? 'success' : 'warning'}>{m.status === 'active' ? 'Active' : 'Invited'}</Badge>
              <Button variant="ghost" onClick={() => setRemoving(m)}>Remove</Button>
            </div>
          ))}
        </div>
      )}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite a worker"
        footer={<><Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button><Button loading={busy} onClick={invite}>Send invite</Button></>}>
        <PhoneInput label="Worker's phone number" value={phone} onChange={setPhone} />
      </Modal>
      <ConfirmDialog open={!!removing} onClose={() => setRemoving(null)} danger loading={busy} title="Remove member?"
        message="This worker will no longer be part of your organization. Their personal record is not affected."
        confirmText="Remove" onConfirm={remove} />
    </>
  );
}

export default function Members() {
  const state = useOrg();
  return (
    <>
      <PageHeader title="Members" subtitle="Workers linked to your organization" />
      <PrivacyNote className="mb-6">Workers keep their full personal record. Only workers who accept an invite appear on your public page.</PrivacyNote>
      <OrgGate state={state}>{(org) => <List org={org} />}</OrgGate>
    </>
  );
}