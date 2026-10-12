import { Link } from 'react-router-dom';
import { CheckCircle2, Star, Plus, Repeat, Clock, QrCode, Eye, Lightbulb } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import DataState from '../../components/common/DataState';
import EmptyState from '../../components/common/EmptyState';
import WorkerStats from '../../components/worker/WorkerStats';
import TrustScoreCard from '../../components/worker/TrustScoreCard';
import ReceiptCard from '../../components/receipt/ReceiptCard';
import useFetch from '../../hooks/useFetch';
import useAuth from '../../hooks/useAuth';
import useT from '../../hooks/useT';
import { workerApi } from '../../services/workerApi';

const nextTierText = (n) => {
  if (!n) return 'You are at the highest tier.';
  const parts = [];
  if (n.jobsGap > 0) parts.push(`${n.jobsGap} more verified job${n.jobsGap > 1 ? 's' : ''}`);
  if (n.scoreGap > 0) parts.push(`${n.scoreGap} more score points`);
  return parts.length ? `To reach ${n.tier}: ${parts.join(' and ')}.` : `You qualify for ${n.tier} on the next update.`;
};

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useT();
  const res = useFetch(() => workerApi.dashboard(), []);

  return (
    <>
      <PageHeader title={t('nav.dashboard', 'Dashboard')} subtitle={`${t('dash.welcome', 'Welcome back')}, ${user?.name || ''}`}
        action={<Link to="/worker/receipts/new"><Button icon={Plus}>{t('dash.create', 'Create receipt')}</Button></Link>} />
      <DataState result={res}>
        {(raw) => {
          const d = raw.data ?? raw;
          return (
            <>
              {d.pendingReceipts > 0 && (
                <Link to="/worker/receipts?status=pending" className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <Clock size={18} /><span><b>{d.pendingReceipts}</b> job{d.pendingReceipts > 1 ? 's' : ''} waiting for customer confirmation.</span>
                </Link>
              )}
              <WorkerStats stats={[
                { label: 'Verified jobs', value: d.verifiedJobs, icon: CheckCircle2, tone: 'text-success bg-green-50' },
                { label: 'Repeat customers', value: d.repeatCustomers, icon: Repeat, tone: 'text-violet-600 bg-violet-50' },
                { label: 'Avg rating', value: d.ratingsCount ? Number(d.avgRating).toFixed(1) : '-', icon: Star, tone: 'text-warning bg-amber-50' },
              ]} />
              <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <div className="mb-4 flex items-center justify-between">
                    <h2>Recent receipts</h2><Link to="/worker/receipts" className="text-sm font-medium text-primary">View all</Link>
                  </div>
                  {d.recentReceipts?.length ? (
                    <div className="grid gap-4 sm:grid-cols-2">{d.recentReceipts.map((r) => <ReceiptCard key={r._id} receipt={r} />)}</div>
                  ) : (
                    <div className="card"><EmptyState title="No receipts yet" description="Log your first job to start building your record."
                      action={<Link to="/worker/receipts/new"><Button icon={Plus}>{t('dash.create', 'Create receipt')}</Button></Link>} /></div>
                  )}
                </div>
                <div className="space-y-6">
                  <TrustScoreCard score={d.trustScore} tier={d.tier} />
                  <p className="flex gap-2 rounded-lg bg-primary-light p-3 text-sm text-primary">
                    <Lightbulb size={16} className="mt-0.5 shrink-0" />{nextTierText(d.nextTier)}
                  </p>
                  <div className="card grid grid-cols-2 gap-3">
                    <Link to="/worker/qr"><Button variant="outline" icon={QrCode} className="w-full">Share QR</Button></Link>
                    <Link to={d.slug ? `/w/${d.slug}` : '/worker/profile'}><Button variant="outline" icon={Eye} className="w-full">Public view</Button></Link>
                  </div>
                </div>
              </div>
            </>
          );
        }}
      </DataState>
    </>
  );
}