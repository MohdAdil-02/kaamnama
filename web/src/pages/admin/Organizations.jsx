import { useState } from 'react';
import ResourceTable from '../../components/common/ResourceTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { adminApi } from '../../services/adminApi';
import { toast } from '../../store/notificationStore';
import { formatDate, formatPhone } from '../../utils/formatters';

export default function Organizations() {
  const [key, setKey] = useState(0);
  const toggle = async (o) => {
    try {
      await (o.isVerified ? adminApi.unverifyOrg(o._id) : adminApi.verifyOrg(o._id));
      toast.success(o.isVerified ? 'Verification removed' : 'Organization verified');
      setKey((k) => k + 1);
    } catch (e) { toast.error(e.message); }
  };
  return (
    <ResourceTable key={key} title="Organizations" subtitle="Verify organizations to give them the badge"
      exportName="organizations" fetcher={adminApi.organizations} dataKey="organizations"
      filters={[{ name: 'verified', placeholder: 'All', options: [{ value: 'true', label: 'Verified' }, { value: 'false', label: 'Not verified' }] }]}
      columns={[
        { key: 'name', header: 'Name' },
        { key: 'city', header: 'City' },
        { key: 'owner', header: 'Owner', render: (o) => o.owner ? `${o.owner.name || ''} ${formatPhone(o.owner.phone)}` : '—' },
        { key: 'isVerified', header: 'Status', render: (o) => o.isVerified ? <Badge tone="success" verified>Verified</Badge> : <Badge tone="warning">Pending</Badge> },
        { key: 'createdAt', header: 'Created', render: (o) => formatDate(o.createdAt) },
        { key: 'actions', header: '', render: (o) => (
          <Button size="sm" variant="outline" onClick={() => toggle(o)}>{o.isVerified ? 'Remove badge' : 'Verify'}</Button>) },
      ]} />
  );
}