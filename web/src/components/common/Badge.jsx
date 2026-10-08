import { CheckCircle2 } from 'lucide-react';

const tones = {
  success: 'bg-green-50 text-success border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-danger border-red-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  neutral: 'bg-slate-100 text-ink-muted border-line',
  primary: 'bg-primary-light text-primary border-blue-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
};

export default function Badge({ tone = 'neutral', verified, children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {verified && <CheckCircle2 size={12} />}
      {children}
    </span>
  );
}
