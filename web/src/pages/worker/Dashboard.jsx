import { Link } from 'react-router-dom';
import { CheckCircle2, Star, Plus, Repeat, IndianRupee, Clock, QrCode, Eye, Lightbulb } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import DataState from '../../components/common/DataState';
import EmptyState from '../../components/common/EmptyState';
import BarChart from '../../components/common/BarChart';
import WorkerStats from '../../components/worker/WorkerStats';
import TrustScoreCard from '../../components/worker/TrustScoreCard';
import TierBreakdown from '../../components/receipt/TierBreakdown';
import ReceiptCard from '../../components/receipt/ReceiptCard';
import useFetch from '../../hooks/useFetch';
import useAuth from '../../hooks/useAuth';
import useT from '../../hooks/useT';
import useVertical from '../../hooks/useVertical';
import { workerApi } from '../../services/workerApi';
import { nextTierHint } from '../../utils/tiers';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useT();
  const v = useVertical();
  const res = useFetch(() => workerApi.dashboard(), []);
  return (
    <>
      <PageHeader title={t('nav.dashboard', 'Dashboard')} subtitle={`${t('dash.welcome', 'Welcome back')}, ${user?.name || ''}`}
        action={<Link to="/worker/receipts/new"><Button icon={Plus}>{t('dash.create', 'Create receipt')}</Button></Link>} />
      <DataState result={res}>
        {(d) => (
          <>
            {d.pendingReceipts > 0 && (
              <Link to="/worker/receipts?status=pending" className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <Clock size={18} /><span><b>{d.pendingReceipts}</b> {v.nouns} waiting for customer confirmation. Send a reminder to make them count.</span>
              </Link>
            )}
            <WorkerStats stats={[
              { label: `Verified ${v.nouns}`, value: d.verifiedJobs ?? d.verifiedReceipts, icon: CheckCircle2, tone: 'text-success bg-green-50' },
              { label: 'Payment-linked', value: d.paymentLinkedJobs, icon: IndianRupee },
              { label: v.repeatLabel, value: d.repeatCustomers, icon: Repeat, tone: 'text-violet-600 bg-violet-50' },
              { label: 'Avg rating', value: d.avgRating?.toFixed?.(1), icon: Star, tone: 'text-warning bg-amber-50' },
            ]} />
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div className="card"><h2 className="mb-4">Activity</h2><BarChart data={d.monthly || []} /></div>
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2>Recent receipts</h2><Link to="/worker/receipts" className="text-sm font-medium text-primary">View all</Link>
                  </div>
                  {d.recentReceipts?.length ? (
                    <div className="grid gap-4 sm:grid-cols-2">{d.recentReceipts.map((r) => <ReceiptCard key={r._id} receipt={r} />)}</div>
                  ) : (
                    <div className="card"><EmptyState title="No receipts yet" description={`Log your first ${v.noun} to start building your record.`}
                      action={<Link to="/worker/receipts/new"><Button icon={Plus}>{t('dash.create', 'Create receipt')}</Button></Link>} /></div>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <TrustScoreCard score={d.trustScore} tier={d.tier} />
                <div className="card">
                  <h3 className="mb-3">Verification mix</h3>
                  <TierBreakdown counts={d.tierCounts} vertical={v.key} />
                  <p className="mt-4 flex gap-2 rounded-lg bg-primary-light p-3 text-sm text-primary"><Lightbulb size={16} className="mt-0.5 shrink-0" />{nextTierHint(d.tierCounts, v.key)}</p>
                </div>
                <div className="card grid grid-cols-2 gap-3">
                  <Link to="/worker/qr"><Button variant="outline" icon={QrCode} className="w-full">Share QR</Button></Link>
                  <Link to={d.slug ? `/w/${d.slug}` : '/worker/profile'}><Button variant="outline" icon={Eye} className="w-full">Public view</Button></Link>
                </div>
              </div>
            </div>
          </>
        )}
      </DataState>
    </>
  );
}
