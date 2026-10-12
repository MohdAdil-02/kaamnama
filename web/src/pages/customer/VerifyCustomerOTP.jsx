import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import CustomerShell from './CustomerShell';
import CustomerOTP from '../../components/customer/CustomerOTP';
import useT from '../../hooks/useT';
import usePageTitle from '../../hooks/usePageTitle';
import { receiptApi } from '../../services/receiptApi';

export default function VerifyCustomerOTP() {
  usePageTitle('Enter code');
  const { t } = useT();
  const { token } = useParams();
  const { state } = useLocation();
  const action = state?.action || 'verify';
  const reason = state?.reason;

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null);

  const submit = async () => {
    if (otp.length !== 6) return setError('Enter the 6-digit code');
    setLoading(true); setError('');
    try {
      const res = await receiptApi.confirm(token, { otp, action, reason, channel: 'link' });
      setDone(res.message);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const resend = async () => {
    try { await receiptApi.sendOtp(token); setError(''); } catch (e) { setError(e.message); }
  };

  if (done) {
    return (
      <CustomerShell title="Done" subtitle={done}>
        <div className="card space-y-3 text-center">
          <p className="text-sm text-ink-muted">
            {action === 'verify'
              ? 'Want to rate this worker? Log in with the same phone number to leave a rating.'
              : 'Thank you. Your response has been recorded.'}
          </p>
          {action === 'verify' && <Link to="/login" className="btn-primary inline-block">Log in to rate</Link>}
        </div>
      </CustomerShell>
    );
  }

  return (
    <CustomerShell title={t('otp.title', 'Enter the code')} subtitle={t('otp.sub', 'We sent a 6-digit code to your phone.')}>
      <CustomerOTP value={otp} onChange={setOtp} onSubmit={submit} onResend={resend} loading={loading} error={error}
        submitText={action === 'verify' ? t('otp.confirm', 'Confirm job') : 'Submit report'} />
    </CustomerShell>
  );
}