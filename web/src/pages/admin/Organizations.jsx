import ResourceTable from '../../components/common/ResourceTable';
import Badge from '../../components/common/Badge';
import { adminApi } from '../../services/adminApi';
import { formatDate } from '../../utils/formatters';

export default function Organizations() {
  return (
    <ResourceTable title="Organizations" subtitle="All registered organizations" exportName="organizations" fetcher={adminApi.organizations}
      columns={[
        { key: 'name', header: 'Name' },
        { key: 'city', header: 'City' },
        { key: 'members', header: 'Members', render: (o) => o.memberCount ?? o.members ?? '—' },
        { key: 'status', header: 'Status', render: (o) => <Badge tone={o.status === 'suspended' ? 'danger' : 'success'}>{o.status || 'active'}</Badge> },
        { key: 'createdAt', header: 'Created', render: (o) => formatDate(o.createdAt) },
      ]} />
  );
}
