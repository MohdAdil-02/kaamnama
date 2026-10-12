import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import OrgGate from '../../components/organization/OrgGate';
import Badge from '../../components/common/Badge';
import useOrg from '../../hooks/useOrg';
import { organizationApi } from '../../services/organizationApi';

const Stat = ({ label, value }) => (
  <div className="card text-center"><p className="text-2xl font-bold">{value}</p><p className="text-sm text-ink-muted">{label}</p></div>
);

function Overview({ org }) {
  const [members, setMembers] = useState([]);
  useEffect(() => {
    organizationApi.members(org._id).then((r) => setMembers(r.data?.members ?? [])).catch(() => {});
  }, [org._id]);
  const active = members.filter((m) => m.status === 'active');
  const invited = members.filter((m) => m.status === 'invited');
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h2>{org.name}</h2>
        {org.isVerified ? <Badge tone="success" verified>Verified organization</Badge> : <Badge tone="warning">Verification pending</Badge>}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Active members" value={active.length} />
        <Stat label="Pending invites" value={invited.length} />
        <Stat label="Verified jobs (team)" value={active.reduce((s, m) => s + (m.worker?.verifiedJobsCount || 0), 0)} />
      </div>
      <p className="mt-6 text-sm text-ink-muted">
        Public page: <Link className="text-primary" to={`/o/${org.slug}`}>{`/o/${org.slug}`}</Link> (not built yet)
      </p>
    </>
  );
}

export default function OrganizationDashboard() {
  const state = useOrg();
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of your organization" />
      <OrgGate state={state}>{(org) => <Overview org={org} />}</OrgGate>
    </>
  );
}