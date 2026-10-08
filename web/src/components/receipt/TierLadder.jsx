import { TIER_ORDER, TIERS } from '../../utils/tiers';
import TierBadge from './TierBadge';

// Explainer: how a receipt climbs from T0 to T3
export default function TierLadder({ vertical = 'trade' }) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {TIER_ORDER.map((k) => (
        <li key={k} className="card p-5">
          <TierBadge tier={k} showLabel={false} />
          <h3 className="mt-3">{TIERS[k].label}</h3>
          <p className="mt-1 text-sm text-ink-muted">{TIERS[k].desc[vertical]}</p>
          <p className="mt-3 text-sm font-semibold">{TIERS[k].weight === 0 ? 'Not counted' : `${TIERS[k].weight}x weight`}</p>
        </li>
      ))}
    </ol>
  );
}
