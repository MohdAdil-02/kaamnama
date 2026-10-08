import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CustomerShell from './CustomerShell';
import CustomerOTP from '../../components/customer/CustomerOTP';
import useT from '../../hooks/useT';
import usePageTitle from '../../hooks/usePageTitle';
import { customerApi } from '../../services/customerApi';

export default function VerifyCustomerOTP() {
  usePageTitle('Enter code');
  const { t } = useT();
  const { receiptId } = useParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true); setError('');
    try { await customerApi.confirm(receiptId, otp); navigate(`/rate/${receiptId}`, { replace: true }); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  };
  const resend = async () => { try { await customerApi.sendOtp(receiptId); setError(''); } catch (e) { setError(e.message); } };

  return (
    <CustomerShell title={t('otp.title', 'Enter the code')} subtitle={t('otp.sub', 'We sent a 6-digit code to your phone.')}>
      <CustomerOTP value={otp} onChange={setOtp} onSubmit={submit} onResend={resend} loading={loading} error={error} submitText={t('otp.confirm', 'Confirm job')} />
    </CustomerShell>
  );
}
