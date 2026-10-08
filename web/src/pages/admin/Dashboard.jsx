import { Users, User, Building2, FileText } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataState from '../../components/common/DataState';
import WorkerStats from '../../components/worker/WorkerStats';
import useFetch from '../../hooks/useFetch';
import { adminApi } from '../../services/adminApi';

export default function Dashboard() {
  const res = useFetch(() => adminApi.stats(), []);
  return (
    <>
      <PageHeader title="Admin dashboard" subtitle="Platform overview" />
      <DataState result={res}>
        {(d) => (
          <WorkerStats stats={[
            { label: 'Users', value: d.users, icon: Users },
            { label: 'Workers', value: d.workers, icon: User, tone: 'text-sky-600 bg-sky-50' },
            { label: 'Organizations', value: d.organizations, icon: Building2, tone: 'text-warning bg-amber-50' },
            { label: 'Receipts', value: d.receipts, icon: FileText, tone: 'text-success bg-green-50' },
          ]} />
        )}
      </DataState>
    </>
  );
}
