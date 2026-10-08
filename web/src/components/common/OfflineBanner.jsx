import { WifiOff } from 'lucide-react';
import useOnlineStatus from '../../hooks/useOnlineStatus';
export default function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div role="alert" className="fixed inset-x-0 bottom-16 z-[70] mx-auto flex w-fit max-w-[92vw] items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg lg:bottom-4">
      <WifiOff size={16} /> You are offline. Changes will not be saved.
    </div>
  );
}
