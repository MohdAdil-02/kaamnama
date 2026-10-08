export default function SubjectSelector({ subjects = [], value = [], onChange }) {
  const toggle = (s) => onChange(value.includes(s) ? value.filter((x) => x !== s) : [...value, s]);
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium">Subjects</span>
      <div className="flex flex-wrap gap-2">
        {subjects.map((s) => (
          <button key={s} type="button" onClick={() => toggle(s)} aria-pressed={value.includes(s)}
            className={`rounded-full border px-3 py-1.5 text-sm ${value.includes(s) ? 'border-primary bg-primary-light text-primary' : 'border-line bg-white text-ink-muted hover:bg-slate-50'}`}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
