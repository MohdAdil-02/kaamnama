import { useSearchParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import DirectoryWorkerCard from '../../components/directory/DirectoryWorkerCard';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { directoryApi } from '../../services/directoryApi';

// Deep-linkable results: /directory/search?q=plumber&category=<slug>
export default function WorkerSearchResults() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const res = useFetch(() => directoryApi.search({
    q: q.trim().length >= 2 ? q.trim() : undefined,
    category: category || undefined,
  }), [q, category]);
  const workers = res.data?.data?.workers ?? res.data?.workers ?? [];

  return (
    <div className="container-page py-10">
      <h1>{q ? `Results for “${q}”` : 'Search results'}</h1>
      <div className="mt-6">
        {res.loading && !res.data ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-40" />)}</div>
        ) : res.error ? <ErrorState message={res.error} onRetry={res.reload} /> : workers.length === 0 ? (
          <div className="card"><EmptyState title="No workers found" description="Try a different search." /></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workers.map((w) => <DirectoryWorkerCard key={w.publicId || w.slug} worker={w} />)}
          </div>
        )}
      </div>
    </div>
  );
}