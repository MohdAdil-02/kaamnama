export default function BarChart({ data = [], height = 140, unit = '' }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (!data.length) return <p className="py-8 text-center text-sm text-ink-muted">No activity yet.</p>;
  return (
    <div className="flex items-end gap-2" style={{ height }} role="img" aria-label="Bar chart">
      {data.map((d) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
          <span className="text-[11px] font-medium text-ink-muted">{d.value}{unit}</span>
          <div className="w-full max-w-[36px] rounded-t-md bg-primary/80" style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }} title={`${d.label}: ${d.value}`} />
          <span className="text-[11px] text-ink-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
