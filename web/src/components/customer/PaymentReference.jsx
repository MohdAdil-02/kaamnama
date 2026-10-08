import { CreditCard } from 'lucide-react';
export default function PaymentReference({ mode, reference }) {
  if (!mode && !reference) return null;
  return (
    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm">
      <CreditCard size={18} className="text-ink-muted" />
      <div><p className="font-medium capitalize">{mode || 'Payment'}</p>{reference && <p className="text-xs text-ink-muted">Ref: {reference}</p>}</div>
    </div>
  );
}
