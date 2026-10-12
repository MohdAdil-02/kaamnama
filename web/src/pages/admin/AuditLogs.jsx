import ResourceTable from '../../components/common/ResourceTable';
import { adminApi } from '../../services/adminApi';
import { formatDateTime } from '../../utils/formatters';

export default function AuditLogs() {
  return (
    <ResourceTable title="Audit logs" subtitle="Who did what, and when" exportName="auditlogs"
      fetcher={adminApi.auditLogs} dataKey="logs"
      columns={[
        { key: 'createdAt', header: 'Time', render: (l) => formatDateTime(l.createdAt), csv: (l) => formatDateTime(l.createdAt) },
        { key: 'actor', header: 'Actor', render: (l) => l.actor?.name || 'System', csv: (l) => l.actor?.name || 'System' },
        { key: 'action', header: 'Action' },
        { key: 'target', header: 'Target', render: (l) => [l.targetType, l.targetId].filter(Boolean).join(' / ') || '—',
          csv: (l) => [l.targetType, l.targetId].filter(Boolean).join(' / ') },
        { key: 'ip', header: 'IP' },
      ]} />
  );
}