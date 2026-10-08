export default function TrustScoreCard({ score = 0, tier }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 75 ? 'bg-success' : pct >= 40 ? 'bg-warning' : 'bg-danger';
  return (
    <div className="card">
      <p className="text-sm text-ink-muted">Trust Score</p>
      <div className="mt-1 flex items-end gap-2">
        <span className="text-4xl font-bold">{score}</span><span className="pb-1 text-ink-muted">/ 100</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {tier && <p className="mt-3 text-sm font-medium">Tier: {tier}</p>}
    </div>
  );
}
