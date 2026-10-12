import { Lightbulb } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataState from '../../components/common/DataState';
import TrustScoreCard from '../../components/worker/TrustScoreCard';
import TierLadder from '../../components/receipt/TierLadder';
import useFetch from '../../hooks/useFetch';
import { workerApi } from '../../services/workerApi';
import { nextTierHint } from '../../utils/tiers';

const PARTS = [
  { key: 'jobs', label: 'Verified jobs', max: 35 },
  { key: 'ratings', label: 'Customer ratings', max: 30 },
  { key: 'repeat', label: 'Repeat customers', max: 15 },
  { key: 'reliability', label: 'Reliability (few disputes)', max: 10 },
  { key: 'age', label: 'Time on Kaamnama', max: 10 },
];

export default function TrustScore() {
  const res = useFetch(() => workerApi.trust(), []);
  return (
    <>
      <PageHeader title="Trust score" subtitle="Built only from customer-confirmed work" />
      <DataState result={res}>
        {(raw) => {
          const t = raw.data?.trust ?? raw.trust ?? null;
          if (!t) {
            return <div className="card">Your score is currently under review by our team, so it is not shown. Please contact support if this is unexpected.</div>;
          }
          const b = t.breakdown || {};
          return (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <TrustScoreCard score={t.score} tier={t.tier} />
                <div className="card lg:col-span-2">
                  <h2 className="mb-3">Your record</h2>
                  <dl className="grid gap-3 text-sm sm:grid-cols-3">
                    <div><dt className="text-ink-muted">Verified jobs</dt><dd className="font-medium">{b.verifiedJobs ?? 0}</dd></div>
                    <div><dt className="text-ink-muted">Repeat customers</dt><dd className="font-medium">{b.repeatCustomers ?? 0}</dd></div>
                    <div><dt className="text-ink-muted">Average rating</dt><dd className="font-medium">{b.ratingsCount ? b.averageRating : '-'}</dd></div>
                  </dl>
                  <p className="mt-5 flex gap-2 rounded-lg bg-primary-light p-3 text-sm text-primary">
                    <Lightbulb size={16} className="mt-0.5 shrink-0" />{nextTierHint(t.nextTier)}
                  </p>
                </div>
              </div>
              <div className="card">
                <h2 className="mb-4">Score breakdown</h2>
                <ul className="space-y-4">
                  {PARTS.map((p) => {
                    const pts = t.parts?.[p.key] ?? 0;
                    return (
                      <li key={p.key}>
                        <div className="mb-1 flex justify-between text-sm"><span>{p.label}</span><span className="font-medium">{pts} / {p.max}</span></div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (pts / p.max) * 100)}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div><h2 className="mb-4">How tiers work</h2><TierLadder /></div>
            </div>
          );
        }}
      </DataState>
    </>
  );
}