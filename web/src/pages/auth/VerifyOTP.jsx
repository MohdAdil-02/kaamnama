import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import OTPInput from '../../components/auth/OTPInput';
import Button from '../../components/common/Button';
import { authApi } from '../../services/authApi';
import useAuth from '../../hooks/useAuth';
import useT from '../../hooks/useT';
import usePageTitle from '../../hooks/usePageTitle';
import { HOME_BY_ROLE } from '../../utils/constants';

export default function VerifyOTP() {
  usePageTitle('Verify number');
  const { t } = useT();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(30);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  if (!state?.phone) return <Navigate to="/login" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setError('Enter the 6-digit code');
    setLoading(true); setError('');
    try {
      const { data } = await authApi.verifyOtp(state.phone, otp);
      setSession({ token: data.token, user: data.user });
      const u = data.user;
      if (u?.role === 'worker' && (!u.vertical || u.categorySelected === false)) return navigate('/select-category', { replace: true });
      navigate(state.from?.pathname || HOME_BY_ROLE[u.role] || '/', { replace: true });
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  const resend = async () => {
    try { await authApi.sendOtp(state.phone); setCooldown(30); setError(''); } catch (err) { setError(err.message); }
  };

  return (
    <AuthShell title={t('verify.title', 'Verify your number')} subtitle={`${t('verify.sub', 'Enter the code sent to')} +91 ${state.phone}`}>
      <form onSubmit={submit} className="space-y-5">
        <OTPInput value={otp} onChange={setOtp} />
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        <Button type="submit" size="lg" loading={loading} className="w-full">{t('verify.btn', 'Verify and continue')}</Button>
        <p className="text-center text-sm text-ink-muted">
          {cooldown > 0 ? `${t('verify.resendIn', 'Resend code in')} ${cooldown}s`
            : <button type="button" onClick={resend} className="font-medium text-primary">{t('verify.resend', 'Resend code')}</button>}
        </p>
      </form>
    </AuthShell>
  );
}
