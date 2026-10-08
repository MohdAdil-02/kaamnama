import { Link } from 'react-router-dom';
import ResourceTable from '../../components/common/ResourceTable';
import Badge from '../../components/common/Badge';
import { adminApi } from '../../services/adminApi';
import { formatPhone } from '../../utils/formatters';

export default function Workers() {
  return (
    <ResourceTable title="Workers" subtitle="All professional profiles" exportName="workers" fetcher={adminApi.workers}
      columns={[
        { key: 'name', header: 'Name', render: (w) => <Link className="font-medium text-primary" to={`/w/${w.slug || w._id}`}>{w.name}</Link> },
        { key: 'phone', header: 'Phone', render: (w) => formatPhone(w.phone) },
        { key: 'category', header: 'Category', render: (w) => w.category?.name || '—' },
        { key: 'trustScore', header: 'Trust score' },
        { key: 'verifiedReceipts', header: 'Verified jobs' },
        { key: 'isVerified', header: 'Status', render: (w) => w.isVerified ? <Badge tone="success" verified>Verified</Badge> : <Badge>Unverified</Badge> },
      ]} />
  );
}
