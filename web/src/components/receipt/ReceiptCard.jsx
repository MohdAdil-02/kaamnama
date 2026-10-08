import { Link } from 'react-router-dom';
import VerificationBadge from './VerificationBadge';
import TierBadge from './TierBadge';
import { formatDate, formatCurrency, receiptTitle, maskPhone } from '../../utils/formatters';
import { tierOf } from '../../utils/tiers';
import { RECEIPT_STATUS as S } from '../../utils/constants';

export default function ReceiptCard({ receipt, to }) {
  const done = receipt.status === S.VERIFIED || receipt.status === S.COMPLETED;
  return (
    <Link to={to || `/worker/receipts/${receipt._id}`} className="card block p-5 transition hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate">{receiptTitle(receipt)}</h3>
          <p className="mt-0.5 truncate text-sm text-ink-muted">{receipt.customerName || maskPhone(receipt.customerPhone)}</p>
        </div>
        {done ? <TierBadge tier={tierOf(receipt)} showLabel={false} /> : <VerificationBadge status={receipt.status} />}
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-ink-muted">
        <span>{formatDate(receipt.createdAt)}</span>
        <span className="font-semibold text-ink">{formatCurrency(receipt.amount)}</span>
      </div>
    </Link>
  );
}
