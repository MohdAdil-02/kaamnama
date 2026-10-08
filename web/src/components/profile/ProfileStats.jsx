import { FileCheck2, Star, Repeat, ShieldCheck } from 'lucide-react';
import WorkerStats from '../worker/WorkerStats';
import { getVertical } from '../../utils/verticals';

export default function ProfileStats({ profile }) {
  const v = getVertical(profile.vertical);
  return (
    <WorkerStats stats={[
      { label: `Verified ${v.nouns}`, value: profile.verifiedJobs ?? profile.verifiedReceipts, icon: FileCheck2, tone: 'text-success bg-green-50' },
      { label: v.repeatLabel, value: profile.repeatCustomers, icon: Repeat, tone: 'text-violet-600 bg-violet-50' },
      { label: 'Avg rating', value: profile.avgRating?.toFixed?.(1), icon: Star, tone: 'text-warning bg-amber-50' },
      { label: 'Trust score', value: profile.trustScore, icon: ShieldCheck },
    ]} />
  );
}
