import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import usePageTitle from '../../hooks/usePageTitle';

const steps = [
  ['Worker', 'Sign up with your phone', 'Verify with an OTP, then add your name, skill and city.'],
  ['Worker', 'Log a finished job', 'Add the work, amount, a before/after photo and your customer’s phone number.'],
  ['Worker', 'Send the confirmation link', 'Share it with the customer on WhatsApp in one tap.'],
  ['Customer', 'Confirm with an OTP', 'They open the link in their browser, no app install, enter an OTP and rate the work.'],
  ['System', 'Your receipt is verified', 'It becomes T1, or T2 if a payment reference is attached. Your trust score updates.'],
  ['System', 'Repeat customers upgrade it', 'When the same customer confirms a second job, the receipt becomes T3, the strongest tier.'],
  ['Worker', 'Share your profile or QR', 'New customers see your verified job count and repeat-customer count.'],
  ['Customer', 'Hire with confidence', 'They check the record, then call or WhatsApp you directly.'],
];
const tone = { Worker: 'bg-primary text-white', Customer: 'bg-success text-white', System: 'bg-slate-700 text-white' };

export default function HowItWorks() {
  usePageTitle('How it works');
  return (
    <div className="container-page max-w-3xl py-14">
      <h1>How it works</h1>
      <p className="mt-2 text-ink-muted">Eight steps from finished job to trusted reputation.</p>
      <ol className="mt-10 space-y-4">
        {steps.map(([who, t, d], i) => (
          <li key={t} className="card flex gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold">{i + 1}</span>
            <div>
              <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone[who]}`}>{who}</span>
              <h3>{t}</h3><p className="mt-1 text-sm text-ink-muted">{d}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-10 text-center"><Link to="/register"><Button size="lg">Get started</Button></Link></div>
    </div>
  );
}
