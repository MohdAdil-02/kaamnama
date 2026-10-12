import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Download } from 'lucide-react';
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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);

  const closeDelete = () => { setDelOpen(false); setCodeSent(false); setOtp(''); };

  const sendCode = async () => {
    setBusy(true);
    try { await workerApi.sendDeleteOtp(); setCodeSent(true); toast.success('Code sent to your phone'); }
    catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  const confirmDelete = async () => {
    if (!/^\d{4,8}$/.test(otp.trim())) return toast.error('Enter the code we sent you');
    setBusy(true);
    try {
      await workerApi.deleteAccount(otp.trim());
      toast.success('Your account has been deleted');
      await signOut();
      navigate('/', { replace: true });
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  const download = async () => {
    try {
      const res = await workerApi.exportData();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'kaamnama-my-data.json';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) { toast.error(e.message); }
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
          <p className="text-sm leading-relaxed text-ink-muted">
            You can download everything we hold about you, or delete your account. Deleting removes your personal details.
            Past job records stay in anonymised form so customers keep their history.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="outline" icon={Download} onClick={download}>Download my data</Button>
            <Button variant="danger" onClick={() => setDelOpen(true)}>Delete my account</Button>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-2">Session</h2>
          <p className="mb-4 text-sm text-ink-muted">Log out of Kaamnama on this device.</p>
          <Button variant="outline" onClick={() => setLogoutOpen(true)}>Log out</Button>
        </div>
      </div>

      <ConfirmDialog open={logoutOpen} onClose={() => setLogoutOpen(false)} title="Log out?"
        message="You will need to verify your phone number to log in again." confirmText="Log out"
        onConfirm={async () => { await signOut(); navigate('/login'); }} />

      <ConfirmDialog open={delOpen} onClose={closeDelete} danger loading={busy} title="Delete your account?"
        confirmText={codeSent ? 'Delete permanently' : 'Send code'}
        message={codeSent ? (
          <span>Enter the code we sent to your phone. This cannot be undone.
            <Input className="mt-3" aria-label="Deletion code" inputMode="numeric" maxLength={8} value={otp} onChange={(e) => setOtp(e.target.value)} />
          </span>
        ) : <span>We will send a code to your phone to confirm it is you.</span>}
        onConfirm={codeSent ? confirmDelete : sendCode} />
    </>
  );
}