import { BadgeCheck, Repeat, Hammer, CalendarClock, IdCard } from 'lucide-react';
import { getVertical } from '../../utils/verticals';
import { monthsLabel } from '../../utils/formatters';

// The public profile summary from the product layout, e.g.
// "47 verified jobs (38 payment-linked) / 12 repeat customers - the strongest trust signal / ..."
export default function ProfileHighlights({ profile }) {
  const v = getVertical(profile.vertical);
  const verified = profile.verifiedJobs ?? profile.verifiedReceipts ?? 0;
  const items = [
    { icon: BadgeCheck, text: <><b>{verified}</b> verified {v.nouns} ({profile.paymentLinkedJobs ?? 0} payment-linked)</> },
    { icon: Repeat, text: <><b>{profile.repeatCustomers ?? 0}</b> {v.repeatLabel.toLowerCase()} <span className="text-ink-muted">- the strongest trust signal</span></>, strong: true },
    profile.topWorkTypes?.length ? { icon: Hammer, text: <>Most common work: {profile.topWorkTypes.slice(0, 3).join(', ')}</> } : null,
    (profile.monthsActive != null || profile.eShramLinked) ? { icon: profile.eShramLinked ? IdCard : CalendarClock,
      text: [profile.monthsActive != null && `${monthsLabel(profile.monthsActive)} active`, profile.eShramLinked && 'e-Shram UAN linked'].filter(Boolean).join(' · ') } : null,
  ].filter(Boolean);
  return (
    <ul className="space-y-3">
      {items.map(({ icon: Icon, text, strong }, i) => (
        <li key={i} className={`flex items-start gap-3 rounded-lg p-3 text-sm ${strong ? 'bg-violet-50' : 'bg-slate-50'}`}>
          <Icon size={18} className={`mt-0.5 shrink-0 ${strong ? 'text-violet-600' : 'text-primary'}`} /><span>{text}</span>
        </li>
      ))}
    </ul>
  );
}
