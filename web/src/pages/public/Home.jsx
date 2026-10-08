import { Link } from 'react-router-dom';
import { FileCheck2, ShieldCheck, Repeat, QrCode, Smartphone, MessageCircle, Search, Check, X } from 'lucide-react';
import Button from '../../components/common/Button';
import SampleProfileCard from '../../components/common/SampleProfileCard';
import TierLadder from '../../components/receipt/TierLadder';
import usePageTitle from '../../hooks/usePageTitle';
import useT from '../../hooks/useT';
import { FEATURES } from '../../utils/constants';

const layers = [
  { layer: 'Identity trust', who: 'Aadhaar, Police', proves: 'Who the person is' },
  { layer: 'Credential trust', who: 'University, NSDC, Skill Passport', proves: 'What the person learned' },
  { layer: 'Performance trust', who: 'Kaamnama, with your customers', proves: 'How the work actually turned out', mine: true },
];
const steps = [
  { icon: Smartphone, title: 'Log the job', text: 'Add the work, amount, a photo and your customer’s phone number.' },
  { icon: MessageCircle, title: 'Customer confirms', text: 'They open a WhatsApp link, enter an OTP and rate the work. No app install.' },
  { icon: QrCode, title: 'Share your record', text: 'Your profile link and QR code show verified work to every new customer.' },
];

export default function Home() {
  usePageTitle('');
  const { t } = useT();
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">काम + नामा · a written record of work done</p>
            <h1 className="text-4xl sm:text-5xl">{t('hero.title', 'Your work, on record. Confirmed by your customers.')}</h1>
            <p className="mt-5 max-w-xl text-lg text-ink-muted">{t('hero.sub', "We don't verify who you are, and we don't verify what you learned. We verify what you did, and someone else confirms it.")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register"><Button size="lg" className="w-full sm:w-auto">{t('hero.cta1', 'Get started')}</Button></Link>
              {FEATURES.directory && <Link to="/directory"><Button size="lg" variant="outline" className="w-full sm:w-auto">{t('hero.cta2', 'Find verified workers')}</Button></Link>}
            </div>
            <p className="mt-4 text-sm text-ink-muted">Free for workers. Customers never install anything.</p>
          </div>
          <SampleProfileCard />
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="mb-2 text-center">The missing layer of trust</h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-ink-muted">A worker’s trust is trapped in the last platform or neighbourhood he worked in. Identity and credentials are covered. Real performance is not.</p>
        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
          {layers.map((l) => (
            <div key={l.layer} className={`card ${l.mine ? 'border-primary ring-2 ring-primary/20' : ''}`}>
              <div className={`mb-3 inline-flex rounded-full p-1.5 ${l.mine ? 'bg-primary text-white' : 'bg-slate-100 text-ink-muted'}`}>{l.mine ? <Check size={16} /> : <X size={16} />}</div>
              <h3>{l.layer}</h3>
              <p className="mt-1 text-sm text-ink-muted">Verified by: {l.who}</p>
              <p className="mt-2 text-sm font-medium">{l.proves}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="container-page py-16">
          <h2 className="mb-10 text-center">How it works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white"><Icon size={22} /></div>
                <h3>{i + 1}. {title}</h3><p className="mx-auto mt-1 max-w-xs text-sm text-ink-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="mb-2 text-center">A score you cannot fake</h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-ink-muted">Every receipt carries a verification tier. Only confirmed work counts, and a returning customer counts the most.</p>
        <TierLadder />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[{ icon: FileCheck2, t: 'Customer-confirmed', d: 'Workers cannot certify their own jobs.' }, { icon: Repeat, t: 'Repeat customers', d: 'The hardest signal to fake, and the strongest.' }, { icon: ShieldCheck, t: 'You own your history', d: 'It stays with you across platforms, cities and employers.' }].map(({ icon: Icon, t: tt, d }) => (
            <div key={tt} className="flex gap-3"><Icon className="mt-0.5 shrink-0 text-primary" size={20} /><div><p className="font-semibold">{tt}</p><p className="text-sm text-ink-muted">{d}</p></div></div>
          ))}
        </div>
      </section>

      {FEATURES.directory && (
        <section className="border-t border-line bg-white">
          <div className="container-page flex flex-col items-center gap-4 py-14 text-center">
            <Search className="text-primary" />
            <h2>Looking to hire?</h2>
            <p className="max-w-xl text-ink-muted">Browse trustworthy workers near you, check their verified record, then call or WhatsApp them directly. No middleman and no commission.</p>
            <Link to="/directory"><Button size="lg" variant="outline">Open the verified directory</Button></Link>
          </div>
        </section>
      )}
    </>
  );
}
