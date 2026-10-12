import { Link } from 'react-router-dom';
import ReceiptStatusBadge from './VerificationBadge';
import { formatDate, formatCurrency, maskPhone } from '../../utils/formatters';

export default function ReceiptCard({ receipt, to }) {
  return (
    <Link to={to || `/worker/receipts/${receipt._id}`} className="card block p-5 transition hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate">{receipt.title}</h3>
          <p className="mt-0.5 truncate text-sm text-ink-muted">{receipt.customerName || maskPhone(receipt.customerPhone)}</p>
        </div>
        <ReceiptStatusBadge status={receipt.status} />
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-ink-muted">
        <span>{formatDate(receipt.workDate || receipt.createdAt)}</span>
        <span className="font-semibold text-ink">{formatCurrency(receipt.amount)}</span>
      </div>
    </Link>
  );
}