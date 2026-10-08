import usePageTitle from '../../hooks/usePageTitle';
import TierLadder from '../../components/receipt/TierLadder';

export default function About() {
  usePageTitle('About');
  return (
    <div className="container-page max-w-3xl py-14">
      <h1>About Kaamnama</h1>
      <p className="mt-2 text-lg text-ink-muted">काम + नामा: a written record of work done.</p>
      <div className="mt-8 space-y-4 leading-relaxed text-ink-muted">
        <p>Kaamnama gives every blue-collar worker, whether an electrician, plumber, mechanic or domestic help, a permanent, portable record of the jobs they have actually done, confirmed by the customers they did them for.</p>
        <p>Ratings earned on one platform stay on that platform, and an independent worker who was never on any platform has no record at all. Kaamnama fills that gap: identity is checked by Aadhaar, credentials by universities, and performance by the customers themselves.</p>
      </div>
      <h2 className="mb-4 mt-12">Your history belongs to you</h2>
      <p className="leading-relaxed text-ink-muted">A worker’s history is tied to their identity, not to any app, platform or city. It stays even if they leave a platform or an organization, unless they request deletion, which is their right under India’s data protection law.</p>
      <h2 className="mb-4 mt-12">How a receipt earns trust</h2>
      <TierLadder />
      <h2 className="mb-4 mt-12">One engine, more than one trade</h2>
      <p className="leading-relaxed text-ink-muted">The same customer-confirmed record works for tutors, coaches and trainers, whose ratings also do not follow them from platform to platform.</p>
    </div>
  );
}
