import { useSearchParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import WorkerResults from '../../components/directory/WorkerResults';
import Spinner from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import { directoryApi } from '../../services/directoryApi';

// Deep-linkable results: /directory/search?q=plumber&category=<id>
export default function WorkerSearchResults() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const res = useFetch(() => directoryApi.search({ q: q || undefined, category: category || undefined }), [q, category]);
  const items = res.data?.items ?? (Array.isArray(res.data) ? res.data : []);
  return (
    <div className="container-page py-10">
      <h1>{q ? `Results for “${q}”` : 'Search results'}</h1>
      <div className="mt-8">
        {res.loading ? <Spinner center /> : res.error ? <ErrorState message={res.error} onRetry={res.reload} /> : <WorkerResults items={items} />}
      </div>
    </div>
  );
}
