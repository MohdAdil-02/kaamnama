import { formatDateTime } from '../../utils/formatters';

// Builds a timeline from receipt fields; uses receipt.events[] when the backend provides it.
export function buildEvents(r = {}) {
  if (Array.isArray(r.events) && r.events.length) return r.events.map((e) => ({ label: e.label || e.type, at: e.createdAt || e.at }));
  const ev = [{ label: 'Receipt created', at: r.createdAt }];
  if (r.otpSentAt) ev.push({ label: 'OTP sent to customer', at: r.otpSentAt });
  if (r.confirmedAt || r.verifiedAt) ev.push({ label: 'Confirmed by customer', at: r.confirmedAt || r.verifiedAt });
  if (r.rejectedAt) ev.push({ label: 'Rejected by customer', at: r.rejectedAt });
  if (r.ratedAt) ev.push({ label: 'Customer left a rating', at: r.ratedAt });
  return ev;
}

export default function ReceiptTimeline({ receipt }) {
  const events = buildEvents(receipt);
  return (
    <ol className="relative space-y-5 border-l border-line pl-6">
      {events.map((e, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white bg-primary ring-2 ring-primary/20" />
          <p className="text-sm font-medium">{e.label}</p>
          <p className="text-xs text-ink-muted">{formatDateTime(e.at)}</p>
        </li>
      ))}
    </ol>
  );
}
