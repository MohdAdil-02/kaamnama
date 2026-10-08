import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LanguageToggle from '../../components/common/LanguageToggle';
import Input from '../../components/common/Input';
import useAuth from '../../hooks/useAuth';
import { workerApi } from '../../services/workerApi';
import { toast } from '../../store/notificationStore';
import { formatPhone } from '../../utils/formatters';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);

  const requestDeletion = async () => {
    setBusy(true);
    try { await workerApi.requestDeletion(); toast.success('Deletion request submitted'); setDelOpen(false); setTyped(''); }
    catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };
  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your account and data" />
      <div className="max-w-2xl space-y-6">
        <div className="card">
          <h2 className="mb-4">Account</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-ink-muted">Name</dt><dd className="font-medium">{user?.name}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-muted">Phone</dt><dd className="font-medium">{formatPhone(user?.phone)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-muted">Role</dt><dd className="font-medium capitalize">{user?.role}</dd></div>
            <div className="flex items-center justify-between"><dt className="text-ink-muted">Language</dt><dd><LanguageToggle /></dd></div>
          </dl>
        </div>
        <div className="card">
          <h2 className="mb-2 flex items-center gap-2"><ShieldCheck size={20} className="text-primary" />Your data</h2>
          <p className="text-sm leading-relaxed text-ink-muted">Your work history is tied to you, not to any app, platform or city. It stays with you if you leave an organization. You can ask us to delete it at any time, which is your right under India’s data protection law.</p>
          <Button variant="danger" className="mt-4" onClick={() => setDelOpen(true)}>Request data deletion</Button>
        </div>
        <div className="card">
          <h2 className="mb-2">Session</h2>
          <p className="mb-4 text-sm text-ink-muted">Log out of Kaamnama on this device.</p>
          <Button variant="outline" onClick={() => setLogoutOpen(true)}>Log out</Button>
        </div>
      </div>
      <ConfirmDialog open={logoutOpen} onClose={() => setLogoutOpen(false)} title="Log out?" message="You will need to verify your phone number to log in again."
        confirmText="Log out" onConfirm={() => { logout(); navigate('/login'); }} />
      <ConfirmDialog open={delOpen} onClose={() => setDelOpen(false)} danger loading={busy} title="Delete all your data?" confirmText="Request deletion"
        message={<span>This permanently removes your profile and verified work history. Type <b>DELETE</b> to confirm.<Input className="mt-3" aria-label="Type DELETE" value={typed} onChange={(e) => setTyped(e.target.value)} /></span>}
        onConfirm={() => (typed === 'DELETE' ? requestDeletion() : toast.error('Type DELETE to confirm'))} />
    </>
  );
}
