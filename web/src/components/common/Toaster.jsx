import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';

const styles = {
  success: ['border-green-200 bg-green-50 text-green-800', CheckCircle2],
  error: ['border-red-200 bg-red-50 text-red-800', AlertCircle],
  info: ['border-sky-200 bg-sky-50 text-sky-800', Info],
};
export default function Toaster() {
  const { toasts, dismiss } = useNotificationStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => {
        const [cls, Icon] = styles[t.type];
        return (
          <div key={t.id} role="status" className={`pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg ${cls}`}>
            <Icon size={16} /><span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss"><X size={14} /></button>
          </div>
        );
      })}
    </div>
  );
}
