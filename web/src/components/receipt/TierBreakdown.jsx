import { TIER_ORDER, TIERS } from '../../utils/tiers';
const bar = { T0: 'bg-slate-300', T1: 'bg-primary', T2: 'bg-success', T3: 'bg-violet-500' };

// counts: { T0, T1, T2, T3 }
export default function TierBreakdown({ counts = {}, vertical = 'trade' }) {
  const total = TIER_ORDER.reduce((s, k) => s + (counts[k] || 0), 0);
  return (
    <div>
      {total === 0 ? <p className="text-sm text-ink-muted">No jobs recorded yet.</p> : (
        <div className="flex h-3 overflow-hidden rounded-full bg-slate-100" role="img" aria-label="Verification tier breakdown">
          {TIER_ORDER.map((k) => counts[k] ? <div key={k} className={bar[k]} style={{ width: `${(counts[k] / total) * 100}%` }} title={`${k}: ${counts[k]}`} /> : null)}
        </div>
      )}
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {TIER_ORDER.map((k) => (
          <li key={k} className="flex items-start gap-3 text-sm">
            <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${bar[k]}`} />
            <div>
              <p className="font-medium">{k} {TIERS[k].label} <span className="text-ink-muted">({counts[k] || 0})</span></p>
              <p className="text-xs text-ink-muted">{TIERS[k].desc[vertical]} Weight {TIERS[k].weight}x</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
