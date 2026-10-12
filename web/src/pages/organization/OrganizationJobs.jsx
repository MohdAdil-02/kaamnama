import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import PrivacyNote from '../../components/common/PrivacyNote';
import Avatar from '../../components/common/Avatar';
import TierBadge from '../../components/receipt/TierBadge';
import OrgGate from '../../components/organization/OrgGate';
import useOrg from '../../hooks/useOrg';
import { organizationApi } from '../../services/organizationApi';

function Team({ org }) {
  const [members, setMembers] = useState(null);

  useEffect(() => {
    organizationApi
      .members(org._id)
      .then((r) => setMembers((r.data?.members ?? []).filter((m) => m.status === 'active')))
      .catch(() => setMembers([]));
  }, [org._id]);

  if (members === null) return null;

  if (members.length === 0) {
    return (
      <div className="card">
        <EmptyState
          title="No active members yet"
          description="Invite workers from the Members page. Their verified jobs will show up here once they accept."
        />
        <div className="mt-4 text-center">
          <Link to="/organization/members" className="text-sm font-medium text-primary">Go to Members</Link>
        </div>
      </div>
    );
  }

  const total = members.reduce((sum, m) => sum + (m.worker?.verifiedJobsCount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="card text-center">
        <p className="text-3xl font-bold">{total}</p>
        <p className="text-sm text-ink-muted">Verified jobs across your team</p>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-ink-muted">
            <tr>
              {['Worker', 'Tier', 'Verified jobs', 'Score'].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m._id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.worker?.displayName} src={m.worker?.photoUrl} size={32} />
                    <span className="font-medium">{m.worker?.displayName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{m.worker?.tier && <TierBadge tier={m.worker.tier} />}</td>
                <td className="px-4 py-3">{m.worker?.verifiedJobsCount ?? 0}</td>
                <td className="px-4 py-3">{m.worker?.trustScore ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function OrganizationJobs() {
  const state = useOrg();
  return (
    <>
      <PageHeader title="Jobs" subtitle="Verified work done by your team" />
      <PrivacyNote className="mb-6">
        Individual receipts belong to each worker and their customers, so they are not listed here.
        This page shows each member's verified totals.
      </PrivacyNote>
      <OrgGate state={state}>{(org) => <Team org={org} />}</OrgGate>
    </>
  );
}