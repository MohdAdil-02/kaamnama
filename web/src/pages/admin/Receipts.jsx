import ResourceTable from '../../components/common/ResourceTable';
import VerificationBadge from '../../components/receipt/VerificationBadge';
import { adminApi } from '../../services/adminApi';
import { RECEIPT_STATUS } from '../../utils/constants';
import { formatCurrency, formatDate, capitalize, maskPhone } from '../../utils/formatters';

export default function Receipts() {
  return (
    <ResourceTable title="Receipts" subtitle="All job receipts. Filter by Disputed to review complaints."
      fetcher={adminApi.receipts} dataKey="receipts" exportName="receipts"
      filters={[{ name: 'status', placeholder: 'All statuses',
        options: Object.values(RECEIPT_STATUS).map((v) => ({ value: v, label: capitalize(v) })) }]}
      columns={[
        { key: 'receiptNumber', header: 'Number' },
        { key: 'title', header: 'Job' },
        { key: 'worker', header: 'Worker', render: (r) => r.worker?.displayName, csv: (r) => r.worker?.displayName },
        { key: 'customerPhone', header: 'Customer', render: (r) => r.customerName || maskPhone(r.customerPhone) },
        { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount), csv: (r) => r.amount },
        { key: 'status', header: 'Status', render: (r) => <VerificationBadge status={r.status} /> },
        { key: 'disputeReason', header: 'Customer note' },
        { key: 'createdAt', header: 'Date', render: (r) => formatDate(r.createdAt), csv: (r) => formatDate(r.createdAt) },
      ]} />
  );
}