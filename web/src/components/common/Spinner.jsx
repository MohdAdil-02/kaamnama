import { Loader2 } from 'lucide-react';
export default function Spinner({ size = 24, center }) {
  const el = <Loader2 size={size} className="animate-spin text-primary" aria-label="Loading" />;
  return center ? <div className="flex justify-center py-16">{el}</div> : el;
}
