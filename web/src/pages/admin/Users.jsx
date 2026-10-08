import { useState } from 'react';
import ResourceTable from '../../components/common/ResourceTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { adminApi } from '../../services/adminApi';
import { toast } from '../../store/notificationStore';
import { formatDate, formatPhone } from '../../utils/formatters';
import { ROLES } from '../../utils/constants';

export default function Users() {
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState(0);

  const toggle = async () => {
    setBusy(true);
    const next = target.status === 'suspended' ? 'active' : 'suspended';
    try { await adminApi.setUserStatus(target._id, next); toast.success(`User ${next}`); setTarget(null); setKey((k) => k + 1); }
    catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };
  const suspended = target?.status === 'suspended';

  return (
    <>
      <ResourceTable key={key} title="Users" subtitle="All registered accounts" exportName="users" fetcher={adminApi.users}
        filters={[{ name: 'role', placeholder: 'All roles', options: Object.values(ROLES).map((r) => ({ value: r, label: r[0].toUpperCase() + r.slice(1) })) }]}
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'phone', header: 'Phone', render: (u) => formatPhone(u.phone) },
          { key: 'role', header: 'Role', render: (u) => <span className="capitalize">{u.role}</span> },
          { key: 'status', header: 'Status', render: (u) => <Badge tone={u.status === 'suspended' ? 'danger' : 'success'}>{u.status || 'active'}</Badge> },
          { key: 'createdAt', header: 'Joined', render: (u) => formatDate(u.createdAt) },
          { key: 'actions', header: '', render: (u) => u.role === 'admin' ? null :
            <Button size="sm" variant="outline" onClick={() => setTarget(u)}>{u.status === 'suspended' ? 'Reactivate' : 'Suspend'}</Button> },
        ]} />
      <ConfirmDialog open={!!target} onClose={() => setTarget(null)} loading={busy} danger={!suspended}
        title={suspended ? 'Reactivate user?' : 'Suspend user?'} confirmText={suspended ? 'Reactivate' : 'Suspend'}
        message={suspended ? 'This user will be able to log in again.' : 'This user will be blocked from logging in.'} onConfirm={toggle} />
    </>
  );
}
