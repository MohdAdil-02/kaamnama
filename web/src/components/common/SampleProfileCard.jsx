import { BadgeCheck, Repeat, Hammer, CalendarClock } from 'lucide-react';
import Avatar from './Avatar';

// Illustrative sample used on the marketing page only (not real data).
export default function SampleProfileCard() {
  return (
    <div className="card mx-auto w-full max-w-md text-left shadow-lg" aria-label="Sample Kaamnama profile">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Sample profile</p>
      <div className="flex items-center gap-3">
        <Avatar name="Rajesh Kumar" size={52} />
        <div><p className="font-semibold">Rajesh Kumar</p><p className="text-sm text-ink-muted">Electrician · Mau, UP</p></div>
      </div>
      <ul className="mt-5 space-y-2.5 text-sm">
        <li className="flex items-center gap-2"><BadgeCheck size={16} className="text-success" /><span><b>47</b> verified jobs (38 payment-linked)</span></li>
        <li className="flex items-center gap-2 rounded-md bg-violet-50 p-1.5"><Repeat size={16} className="text-violet-600" /><span><b>12</b> repeat customers</span></li>
        <li className="flex items-center gap-2"><Hammer size={16} className="text-primary" /><span>Switchboard repair, house wiring</span></li>
        <li className="flex items-center gap-2"><CalendarClock size={16} className="text-primary" /><span>14 months active · e-Shram UAN linked</span></li>
      </ul>
    </div>
  );
}
