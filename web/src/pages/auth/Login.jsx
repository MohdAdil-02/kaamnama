import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import PhoneInput from '../../components/auth/PhoneInput';
import Button from '../../components/common/Button';
import { authApi } from '../../services/authApi';
import { isPhone } from '../../utils/validators';
import usePageTitle from '../../hooks/usePageTitle';
import useT from '../../hooks/useT';

export default function Login() {
  usePageTitle('Login');
  const { t } = useT();
  const { state } = useLocation();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!isPhone(phone)) return setError('Enter a valid 10-digit mobile number');
    setLoading(true); setError('');
    try {
      await authApi.sendOtp(phone);
      navigate('/verify-otp', { state: { phone, from: state?.from } });
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <AuthShell title={t('login.title', 'Welcome back')} subtitle={t('login.sub', 'Log in with your phone number')}
      footer={<>{t('login.new', 'New here?')} <Link to="/register" className="font-medium text-primary">{t('login.create', 'Create an account')}</Link></>}>
      <form onSubmit={submit} className="space-y-5" noValidate>
        <PhoneInput value={phone} onChange={setPhone} error={error} />
        <Button type="submit" size="lg" loading={loading} className="w-full">{t('login.send', 'Send OTP')}</Button>
      </form>
    </AuthShell>
  );
}
