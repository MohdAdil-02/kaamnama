import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import Avatar from '../common/Avatar';
import TierBadge from '../receipt/TierBadge';

export default function DirectoryWorkerCard({ worker: w }) {
  return (
    <Link to={`/w/${w.slug}`} className="card block p-5 transition hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start gap-3">
        <Avatar name={w.displayName} src={w.photoUrl} size={52} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate">{w.displayName}</h3>
            <TierBadge tier={w.tier} />
          </div>
          <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-ink-muted">
            <MapPin size={13} />{[w.area, w.city].filter(Boolean).join(', ') || 'Location not set'}
            {w.distanceKm !== undefined && <span> · {w.distanceKm} km</span>}
          </p>
          {w.categories?.length > 0 && <p className="mt-1 truncate text-sm">{w.categories.map((c) => c.name).join(' · ')}</p>}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-ink-muted">
        <span>{w.verifiedJobsCount} verified job{w.verifiedJobsCount === 1 ? '' : 's'}</span>
        <span className="flex items-center gap-1">
          <Star size={14} className="text-warning" />{w.ratingsCount ? w.averageRating : '-'}
        </span>
        <span>Score {w.trustScore}</span>
      </div>
    </Link>
  );
}