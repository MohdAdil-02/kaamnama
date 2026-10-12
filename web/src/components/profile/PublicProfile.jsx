import { MapPin, BadgeCheck, Star } from 'lucide-react';
import Avatar from '../common/Avatar';
import TierBadge from '../receipt/TierBadge';
import PrivacyNote from '../common/PrivacyNote';
import { formatDate } from '../../utils/formatters';

const Stat = ({ label, value }) => (
  <div className="card text-center">
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-sm text-ink-muted">{label}</p>
  </div>
);

export default function PublicProfile({ profile, ratings = [] }) {
  const p = profile;
  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-center gap-5">
        <Avatar name={p.displayName} src={p.photoUrl} size={88} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="!text-2xl">{p.displayName}</h1>
            <TierBadge tier={p.tier} />
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-ink-muted">
            <MapPin size={14} />{[p.area, p.city].filter(Boolean).join(', ') || 'Location not set'}
          </p>
          {p.categories?.length > 0 && (
            <p className="mt-1 text-sm">{p.categories.map((c) => c.name).join(' · ')}</p>
          )}
          <p className="mt-1 text-xs text-ink-muted">
            {p.isAvailable ? 'Available for work' : 'Not taking new work'} · Member since {formatDate(p.memberSince)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold">{p.trustScore}</p>
          <p className="text-xs text-ink-muted">Trust score</p>
        </div>
      </div>

      {p.bio && <div className="card"><h2 className="mb-2">About</h2><p className="text-sm leading-relaxed">{p.bio}</p></div>}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Verified jobs" value={p.verifiedJobsCount} />
        <Stat label="Average rating" value={p.ratingsCount ? p.averageRating : '-'} />
        <Stat label="Experience" value={p.experienceYears ? `${p.experienceYears} yrs` : '-'} />
      </div>

      {(p.skills?.length > 0 || p.languages?.length > 0) && (
        <div className="card space-y-3 text-sm">
          {p.skills?.length > 0 && <p><b>Skills:</b> {p.skills.join(', ')}</p>}
          {p.languages?.length > 0 && <p><b>Languages:</b> {p.languages.join(', ')}</p>}
        </div>
      )}

      <div className="card">
        <h2 className="mb-3 flex items-center gap-2"><BadgeCheck size={18} />Customer reviews</h2>
        {ratings.length === 0 ? <p className="text-sm text-ink-muted">No reviews yet.</p> : (
          <ul className="divide-y divide-line">
            {ratings.map((r) => (
              <li key={r._id} className="py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.customerName}</span>
                  <span className="flex items-center gap-1"><Star size={14} className="text-warning" />{r.stars}</span>
                </div>
                {r.comment && <p className="mt-1 text-ink-muted">{r.comment}</p>}
                <p className="mt-1 text-xs text-ink-muted">{formatDate(r.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <PrivacyNote>Every verified job here was confirmed by the customer with an OTP. Phone numbers are never shown. Kaamnama is a directory, so contact the worker directly.</PrivacyNote>
    </div>
  );
}