import { TIER_ORDER, TIERS } from '../../utils/tiers';
import TierBadge from './TierBadge';

// Explainer: how a worker climbs from New to Platinum
export default function TierLadder() {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {TIER_ORDER.map((k) => (
        <li key={k} className="card p-5">
          <TierBadge tier={k} />
          <p className="mt-3 text-sm text-ink-muted">{TIERS[k].desc}</p>
          <p className="mt-3 text-sm font-semibold">
            {TIERS[k].minJobs === 0 ? 'Starting tier' : `${TIERS[k].minJobs}+ jobs, score ${TIERS[k].minScore}+`}
          </p>
        </li>
      ))}
    </ol>
  );
}