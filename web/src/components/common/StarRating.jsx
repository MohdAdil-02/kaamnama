import { Star } from 'lucide-react';
export default function StarRating({ value = 0, onChange, size = 20 }) {
  return (
    <div className="flex gap-1" role={onChange ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={!onChange} onClick={() => onChange?.(n)} aria-label={`${n} star`}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}>
          <Star size={size} className={n <= Math.round(value) ? 'fill-warning text-warning' : 'text-slate-300'} />
        </button>
      ))}
    </div>
  );
}
