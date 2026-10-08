import ResourceTable from '../../components/common/ResourceTable';
import { adminApi } from '../../services/adminApi';
import { formatDateTime } from '../../utils/formatters';

export default function AuditLogs() {
  return (
    <ResourceTable title="Audit logs" subtitle="Who did what, and when" exportName="auditlogs" fetcher={adminApi.auditLogs}
      columns={[
        { key: 'createdAt', header: 'Time', render: (l) => formatDateTime(l.createdAt) },
        { key: 'actor', header: 'Actor', render: (l) => l.actor?.name || l.actorId || 'System' },
        { key: 'action', header: 'Action' },
        { key: 'entity', header: 'Target', render: (l) => [l.entityType, l.entityId].filter(Boolean).join(' / ') || '—' },
        { key: 'ip', header: 'IP' },
      ]} />
  );
}
