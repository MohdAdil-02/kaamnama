import EmptyState from '../common/EmptyState';
import WorkerCard from '../worker/WorkerCard';
export default function WorkerResults({ items = [] }) {
  if (!items.length) return <EmptyState title="No workers found" description="Try a different search or category." />;
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((w) => <WorkerCard key={w._id} worker={w} />)}</div>;
}
