import { useState } from 'react';
import ResourceTable from '../../components/common/ResourceTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';
import { adminApi } from '../../services/adminApi';
import { toast } from '../../store/notificationStore';
import { formatDate, formatPhone } from '../../utils/formatters';
import { ROLES } from '../../utils/constants';

export default function Users() {
  const [target, setTarget] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState(0);
  const suspended = target?.status === 'suspended';

  const close = () => { setTarget(null); setReason(''); };
  const submit = async () => {
    if (!suspended && reason.trim().length < 5) return toast.error('Give a reason (at least 5 characters)');
    setBusy(true);
    try {
      if (suspended) await adminApi.reactivateUser(target._id);
      else await adminApi.suspendUser(target._id, reason.trim());
      toast.success(suspended ? 'User reactivated' : 'User suspended');
      close(); setKey((k) => k + 1);
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <>
      <ResourceTable key={key} title="Users" subtitle="All registered accounts" exportName="users"
        fetcher={adminApi.users} dataKey="users" searchable
        filters={[
          { name: 'role', placeholder: 'All roles', options: Object.values(ROLES).map((r) => ({ value: r, label: r })) },
          { name: 'status', placeholder: 'All statuses', options: ['active', 'suspended', 'deleted'].map((s) => ({ value: s, label: s })) },
        ]}
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'phone', header: 'Phone', render: (u) => formatPhone(u.phone) },
          { key: 'role', header: 'Role' },
          { key: 'status', header: 'Status', render: (u) => <Badge tone={u.status === 'active' ? 'success' : 'danger'}>{u.status}</Badge> },
          { key: 'createdAt', header: 'Joined', render: (u) => formatDate(u.createdAt) },
          { key: 'actions', header: '', render: (u) => (u.role === 'admin' || u.status === 'deleted') ? null :
            <Button size="sm" variant="outline" onClick={() => setTarget(u)}>{u.status === 'suspended' ? 'Reactivate' : 'Suspend'}</Button> },
        ]} />
      <Modal open={!!target} onClose={close} title={suspended ? 'Reactivate user?' : 'Suspend user?'}
        footer={<><Button variant="outline" onClick={close}>Cancel</Button>
          <Button variant={suspended ? 'primary' : 'danger'} loading={busy} onClick={submit}>{suspended ? 'Reactivate' : 'Suspend'}</Button></>}>
        {suspended ? <p className="text-sm">This user will be able to log in again.</p> : (
          <>
            <p className="mb-3 text-sm">The user is blocked immediately and all their sessions end.</p>
            <Textarea label="Reason (recorded in the audit log)" value={reason} onChange={(e) => setReason(e.target.value)} />
          </>
        )}
      </Modal>
    </>
  );
}