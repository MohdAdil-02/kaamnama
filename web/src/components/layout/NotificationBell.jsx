import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { notificationApi } from '../../services/notificationApi';
import { formatDateTime } from '../../utils/formatters';

export default function NotificationBell() {
  const { items, setItems } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const load = useCallback(() => {
    notificationApi.list().then((r) => setItems(r.data?.items ?? r.data ?? [])).catch(() => {});
  }, [setItems]);
  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, [load]);
  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const unread = items.filter((n) => !n.read).length;
  const markOne = (n) => { if (n.read) return; setItems(items.map((x) => (x._id === n._id ? { ...x, read: true } : x))); notificationApi.markRead(n._id).catch(() => {}); };
  const markAll = () => { setItems(items.map((x) => ({ ...x, read: true }))); notificationApi.markAllRead().catch(() => {}); };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative rounded-lg p-2 hover:bg-slate-100" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} aria-expanded={open}>
        <Bell size={20} />
        {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-xl border border-line bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="text-sm font-semibold">Notifications</span>
            {unread > 0 && <button onClick={markAll} className="text-xs font-medium text-primary">Mark all read</button>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? <p className="p-6 text-center text-sm text-ink-muted">You are all caught up.</p> :
              items.map((n) => (
                <button key={n._id} onClick={() => markOne(n)} className={`block w-full border-b border-line px-4 py-3 text-left last:border-0 hover:bg-slate-50 ${n.read ? '' : 'bg-primary-light/40'}`}>
                  <p className="text-sm">{n.message || n.title}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{formatDateTime(n.createdAt)}</p>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
