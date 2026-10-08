import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h2 className="mt-2">Page not found</h2>
      <p className="mt-1 text-ink-muted">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="mt-6"><Button>Go home</Button></Link>
    </div>
  );
}
