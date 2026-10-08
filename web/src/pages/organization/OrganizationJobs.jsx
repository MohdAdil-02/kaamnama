import ResourceTable from '../../components/common/ResourceTable';
import VerificationBadge from '../../components/receipt/VerificationBadge';
import { organizationApi } from '../../services/organizationApi';
import { RECEIPT_STATUS } from '../../utils/constants';
import { formatCurrency, formatDate, capitalize, receiptTitle } from '../../utils/formatters';
import TierBadge from '../../components/receipt/TierBadge';
import { tierOf } from '../../utils/tiers';

export default function OrganizationJobs() {
  return (
    <ResourceTable title="Jobs" subtitle="Jobs done under your name, during each member’s time with you" exportName="organization-jobs" fetcher={organizationApi.jobs}
      filters={[{ name: 'status', placeholder: 'All statuses', options: Object.values(RECEIPT_STATUS).map((v) => ({ value: v, label: capitalize(v) })) }]}
      columns={[
        { key: 'title', header: 'Job', render: (r) => receiptTitle(r), csv: (r) => receiptTitle(r) },
        { key: 'worker', header: 'Worker', render: (r) => r.worker?.name, csv: (r) => r.worker?.name },
        { key: 'tier', header: 'Tier', render: (r) => <TierBadge tier={tierOf(r)} showLabel={false} />, csv: (r) => tierOf(r) },
        { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount), csv: (r) => r.amount },
        { key: 'status', header: 'Status', render: (r) => <VerificationBadge status={r.status} /> },
        { key: 'createdAt', header: 'Date', render: (r) => formatDate(r.createdAt), csv: (r) => formatDate(r.createdAt) },
      ]} />
  );
}
