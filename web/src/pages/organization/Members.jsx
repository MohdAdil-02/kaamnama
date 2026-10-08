import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataState from '../../components/common/DataState';
import EmptyState from '../../components/common/EmptyState';
import MembershipCard from '../../components/organization/MembershipCard';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PhoneInput from '../../components/auth/PhoneInput';
import Select from '../../components/common/Select';
import PrivacyNote from '../../components/common/PrivacyNote';
import Button from '../../components/common/Button';
import useFetch from '../../hooks/useFetch';
import { organizationApi } from '../../services/organizationApi';
import { isPhone } from '../../utils/validators';
import { ORG_ROLES } from '../../utils/constants';
import { toast } from '../../store/notificationStore';

export default function Members() {
  const res = useFetch(() => organizationApi.members(), []);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('worker');
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(null);

  const invite = async () => {
    if (!isPhone(phone)) return toast.error('Enter a valid 10-digit mobile number');
    setBusy(true);
    try { await organizationApi.inviteMember(phone, role); toast.success('Invitation sent'); setInviteOpen(false); setPhone(''); res.reload(); }
    catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await organizationApi.removeMember(removing._id); toast.success('Membership ended'); setRemoving(null); res.reload(); }
    catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };
  return (
    <>
      <PageHeader title="Members" subtitle="Workers linked to your organization" action={<Button icon={UserPlus} onClick={() => setInviteOpen(true)}>Invite worker</Button>} />
      <PrivacyNote className="mb-6">You see only jobs done under your organization’s name, for the period each worker was a member. Workers keep their full personal history.</PrivacyNote>
      <DataState result={res}>
        {(d) => {
          const items = d.items ?? d;
          return items.length ? <div className="grid gap-4 md:grid-cols-2">{items.map((m) => <MembershipCard key={m._id} member={m} onRemove={setRemoving} />)}</div>
            : <div className="card"><EmptyState title="No members yet" description="Invite workers by phone number to add them to your team." /></div>;
        }}
      </DataState>
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite a worker"
        footer={<><Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button><Button loading={busy} onClick={invite}>Send invite</Button></>}>
        <div className="space-y-4">
          <PhoneInput label="Worker’s phone number" value={phone} onChange={setPhone} />
          <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Select role" options={ORG_ROLES} />
        </div>
      </Modal>
      <ConfirmDialog open={!!removing} onClose={() => setRemoving(null)} danger loading={busy} title="End membership?"
        message="This worker will no longer be part of your organization. Their personal history is not affected." confirmText="End membership" onConfirm={remove} />
    </>
  );
}
