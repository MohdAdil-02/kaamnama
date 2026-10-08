import PageHeader from '../../components/common/PageHeader';
import DataState from '../../components/common/DataState';
import OrganizationStats from '../../components/organization/OrganizationStats';
import ReceiptCard from '../../components/receipt/ReceiptCard';
import EmptyState from '../../components/common/EmptyState';
import useFetch from '../../hooks/useFetch';
import useAuth from '../../hooks/useAuth';
import { organizationApi } from '../../services/organizationApi';

export default function OrganizationDashboard() {
  const { user } = useAuth();
  const res = useFetch(() => organizationApi.dashboard(), []);
  return (
    <>
      <PageHeader title="Dashboard" subtitle={`Overview for ${user?.name || 'your organization'}`} />
      <DataState result={res}>
        {(d) => (
          <>
            <OrganizationStats data={d} />
            <h2 className="mb-4 mt-8">Recent jobs</h2>
            {d.recentJobs?.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{d.recentJobs.map((r) => <ReceiptCard key={r._id} receipt={r} to="/organization/jobs" />)}</div>
            ) : <div className="card"><EmptyState title="No jobs yet" description="Jobs logged by your members will appear here." /></div>}
          </>
        )}
      </DataState>
    </>
  );
}
