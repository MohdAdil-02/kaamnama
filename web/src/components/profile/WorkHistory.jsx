import { CheckCircle2 } from 'lucide-react';
import StarRating from '../common/StarRating';
import EmptyState from '../common/EmptyState';
import TierBadge from '../receipt/TierBadge';
import { formatDate, receiptTitle } from '../../utils/formatters';
import { tierOf } from '../../utils/tiers';

export default function WorkHistory({ items = [] }) {
  if (!items.length) return <EmptyState title="No verified work yet" description="Customer-confirmed work will appear here." />;
  return (
    <ul className="divide-y divide-line">
      {items.map((j) => (
        <li key={j._id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 font-medium"><CheckCircle2 size={16} className="text-success" />{receiptTitle(j)} <TierBadge tier={tierOf(j)} showLabel={false} /></p>
            {(j.review || j.rating?.comment) && <p className="mt-1 text-sm text-ink-muted">“{j.review || j.rating.comment}”</p>}
            {j.rating?.tags?.length > 0 && <p className="mt-1 text-xs text-ink-muted">{j.rating.tags.join(' · ')}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-4 text-sm text-ink-muted">
            {(j.rating?.value || j.rating) ? <StarRating value={j.rating?.value ?? j.rating} size={14} /> : null}
            <span>{formatDate(j.confirmedAt || j.verifiedAt || j.createdAt)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
