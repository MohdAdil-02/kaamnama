import { Navigation } from 'lucide-react';
export default function DistanceBadge({ km }) {
  if (km === undefined || km === null) return null;
  return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-ink-muted"><Navigation size={12} />{km < 1 ? '<1' : km.toFixed(0)} km</span>;
}
