export default function Textarea({ label, error, hint, rows = 4, ...rest }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium">{label}</span>}
      <textarea rows={rows} className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30
        ${error ? 'border-danger' : 'border-line focus:border-primary'}`} {...rest} />
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </label>
  );
}
