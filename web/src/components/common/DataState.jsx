import { PageSkeleton } from './Skeleton';
import ErrorState from './ErrorState';
// Wraps a useFetch result: skeleton while loading, error with retry, else children(data)
export default function DataState({ result, children, skeleton }) {
  if (result.loading && !result.data) return skeleton || <PageSkeleton />;
  if (result.error) return <ErrorState message={result.error} onRetry={result.reload} />;
  if (!result.data) return null;
  return children(result.data);
}
