import { Users, User, Building2, FileText } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataState from '../../components/common/DataState';
import WorkerStats from '../../components/worker/WorkerStats';
import useFetch from '../../hooks/useFetch';
import { adminApi } from '../../services/adminApi';

const sum = (o = {}) => Object.values(o).reduce((a, b) => a + b, 0);

export default function Dashboard() {
  const res = useFetch(() => adminApi.stats(), []);
  return (
    <>
      <PageHeader title="Admin dashboard" subtitle="Platform overview" />
      <DataState result={res}>
        {(raw) => {
          const d = raw.data ?? raw;
          return (
            <>
              <WorkerStats stats={[
                { label: 'Users', value: sum(d.users?.byRole), icon: Users },
                { label: 'Workers', value: d.users?.byRole?.worker ?? 0, icon: User, tone: 'text-sky-600 bg-sky-50' },
                { label: 'Organizations', value: d.organizations?.total ?? 0, icon: Building2, tone: 'text-warning bg-amber-50' },
                { label: 'Receipts', value: sum(d.receipts?.byStatus), icon: FileText, tone: 'text-success bg-green-50' },
              ]} />
              <p className="mt-6 text-sm text-ink-muted">
                New users (7 days): {d.users?.newLast7Days ?? 0} · Receipts (7 days): {d.receipts?.createdLast7Days ?? 0} ·
                Orgs awaiting verification: {d.organizations?.awaitingVerification ?? 0} · Hidden ratings: {d.ratings?.hidden ?? 0}
              </p>
            </>
          );
        }}
      </DataState>
    </>
  );
}