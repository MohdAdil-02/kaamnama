import { AlertTriangle } from 'lucide-react';
import Button from './Button';
export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-4 rounded-full bg-red-50 p-4"><AlertTriangle className="text-danger" size={28} /></div>
      <h3>Unable to load</h3>
      <p className="mt-1 text-sm text-ink-muted">{message}</p>
      {onRetry && <Button variant="outline" className="mt-5" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
