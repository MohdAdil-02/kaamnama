import { Link } from 'react-router-dom';
import { MapPin, Star, Repeat } from 'lucide-react';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import DistanceBadge from '../directory/DistanceBadge';
import { getVertical } from '../../utils/verticals';

export default function WorkerCard({ worker }) {
  const v = getVertical(worker.vertical);
  return (
    <Link to={`/w/${worker.slug || worker._id}`} className="card block p-5 transition hover:border-primary/40 hover:shadow-md">
      <div className="flex items-center gap-3">
        <Avatar name={worker.name} src={worker.avatar} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate">{worker.name}</h3>
          <p className="truncate text-sm text-ink-muted">{worker.category?.name || worker.skill}</p>
        </div>
        {worker.isVerified && <Badge tone="success" verified>Verified</Badge>}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
        <span className="flex items-center gap-1"><MapPin size={14} />{worker.city || worker.pincode || '—'}</span>
        <span className="flex items-center gap-1"><Star size={14} className="text-warning" />{worker.avgRating?.toFixed?.(1) ?? '—'}</span>
        <DistanceBadge km={worker.distanceKm} />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-sm">
        <span><b>{worker.verifiedJobs ?? worker.verifiedReceipts ?? 0}</b> <span className="text-ink-muted">verified {v.nouns}</span></span>
        <span className="flex items-center gap-1 text-violet-700"><Repeat size={14} /><b>{worker.repeatCustomers ?? 0}</b> repeat</span>
      </div>
    </Link>
  );
}
