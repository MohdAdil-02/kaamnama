import { Clock, CheckCircle2, XCircle, BadgeCheck } from 'lucide-react';
import { RECEIPT_STATUS as S } from '../../utils/constants';

const cfg = {
  [S.PENDING]: { icon: Clock, cls: 'bg-amber-50 text-amber-700', title: 'Waiting for customer', text: 'The customer needs to confirm this job with an OTP.' },
  [S.VERIFIED]: { icon: BadgeCheck, cls: 'bg-green-50 text-success', title: 'Verified by customer', text: 'This job was confirmed and counts toward your trust score.' },
  [S.COMPLETED]: { icon: CheckCircle2, cls: 'bg-primary-light text-primary', title: 'Completed', text: 'This job is complete.' },
  [S.REJECTED]: { icon: XCircle, cls: 'bg-red-50 text-danger', title: 'Rejected by customer', text: 'The customer did not confirm this job.' },
};
export default function ReceiptStatus({ status }) {
  const c = cfg[status] || cfg[S.PENDING];
  const Icon = c.icon;
  return (
    <div className={`flex items-start gap-3 rounded-lg p-4 ${c.cls}`}>
      <Icon size={22} className="mt-0.5 shrink-0" />
      <div><p className="font-semibold">{c.title}</p><p className="text-sm opacity-90">{c.text}</p></div>
    </div>
  );
}
