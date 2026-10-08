import { Users, FileCheck2, Star, Briefcase } from 'lucide-react';
import WorkerStats from '../worker/WorkerStats';
export default function OrganizationStats({ data }) {
  return (
    <WorkerStats stats={[
      { label: 'Members', value: data.members, icon: Users },
      { label: 'Total Jobs', value: data.totalJobs, icon: Briefcase, tone: 'text-sky-600 bg-sky-50' },
      { label: 'Verified Jobs', value: data.verifiedJobs, icon: FileCheck2, tone: 'text-success bg-green-50' },
      { label: 'Avg Rating', value: data.avgRating?.toFixed?.(1), icon: Star, tone: 'text-warning bg-amber-50' },
    ]} />
  );
}
