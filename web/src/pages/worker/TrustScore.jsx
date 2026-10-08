import { Lightbulb } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataState from '../../components/common/DataState';
import TrustScoreCard from '../../components/worker/TrustScoreCard';
import TierBreakdown from '../../components/receipt/TierBreakdown';
import TierLadder from '../../components/receipt/TierLadder';
import useFetch from '../../hooks/useFetch';
import useVertical from '../../hooks/useVertical';
import { workerApi } from '../../services/workerApi';
import { nextTierHint, weightedJobs } from '../../utils/tiers';

export default function TrustScore() {
  const v = useVertical();
  const res = useFetch(() => workerApi.trustScore(), []);
  return (
    <>
      <PageHeader title="Trust score" subtitle="Built only from customer-confirmed work" />
      <DataState result={res}>
        {(d) => (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <TrustScoreCard score={d.score} tier={d.tier} />
              <div className="card lg:col-span-2">
                <h2 className="mb-1">Your verification mix</h2>
                <p className="mb-4 text-sm text-ink-muted">Weighted total: <b>{weightedJobs(d.tierCounts)}</b> points. Higher tiers count for much more.</p>
                <TierBreakdown counts={d.tierCounts} vertical={v.key} />
                <p className="mt-5 flex gap-2 rounded-lg bg-primary-light p-3 text-sm text-primary"><Lightbulb size={16} className="mt-0.5 shrink-0" />{nextTierHint(d.tierCounts, v.key)}</p>
              </div>
            </div>
            {d.breakdown?.length > 0 && (
              <div className="card">
                <h2 className="mb-4">Score breakdown</h2>
                <ul className="space-y-4">
                  {d.breakdown.map((b) => (
                    <li key={b.label}>
                      <div className="mb-1 flex justify-between text-sm"><span>{b.label}</span><span className="font-medium">{b.points} / {b.max}</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (b.points / (b.max || 1)) * 100)}%` }} /></div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div><h2 className="mb-4">How tiers work</h2><TierLadder vertical={v.key} /></div>
          </div>
        )}
      </DataState>
    </>
  );
}
