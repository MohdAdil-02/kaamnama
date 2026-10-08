export default function WorkerStats({ stats = [] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, tone = 'text-primary bg-primary-light' }) => (
        <div key={label} className="card p-5">
          <div className={`mb-3 inline-flex rounded-lg p-2 ${tone}`}><Icon size={20} /></div>
          <p className="text-2xl font-bold">{value ?? '—'}</p>
          <p className="text-sm text-ink-muted">{label}</p>
        </div>
      ))}
    </div>
  );
}
