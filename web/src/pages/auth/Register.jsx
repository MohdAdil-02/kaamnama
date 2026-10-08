import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import PhoneInput from '../../components/auth/PhoneInput';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authApi } from '../../services/authApi';
import { validate, required, isPhone } from '../../utils/validators';
import { ROLES, FEATURES } from '../../utils/constants';
import usePageTitle from '../../hooks/usePageTitle';

const ROLE_OPTIONS = [
  { value: ROLES.WORKER, title: 'Worker / Teacher', text: 'Build a verified record of your work' },
  FEATURES.organizations && { value: ROLES.ORGANIZATION, title: 'Organization', text: 'Contractor, agency or firm' },
].filter(Boolean);

export default function Register() {
  usePageTitle('Create account');
  const navigate = useNavigate();
  const [v, setV] = useState({ name: '', phone: '', role: ROLES.WORKER });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(v, {
      name: (x) => required(x) || (x.trim().length < 2 ? 'Enter your full name' : ''),
      phone: (x) => (isPhone(x) ? '' : 'Enter a valid 10-digit mobile number'),
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await authApi.register({ name: v.name.trim(), phone: v.phone, role: v.role });
      navigate('/verify-otp', { state: { phone: v.phone } });
    } catch (err) { setErrors({ form: err.message, ...(err.errors || {}) }); } finally { setLoading(false); }
  };

  return (
    <AuthShell title="Create your record" subtitle="It takes less than a minute. Free for workers."
      footer={<>Already have an account? <Link to="/login" className="font-medium text-primary">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-5" noValidate>
        {ROLE_OPTIONS.length > 1 && (
          <div className="grid grid-cols-2 gap-3">
            {ROLE_OPTIONS.map((r) => (
              <button key={r.value} type="button" onClick={() => setV({ ...v, role: r.value })} aria-pressed={v.role === r.value}
                className={`rounded-lg border p-3 text-left ${v.role === r.value ? 'border-primary bg-primary-light' : 'border-line bg-white hover:bg-slate-50'}`}>
                <p className="text-sm font-semibold">{r.title}</p><p className="mt-0.5 text-xs text-ink-muted">{r.text}</p>
              </button>
            ))}
          </div>
        )}
        <Input label={v.role === ROLES.ORGANIZATION ? 'Organization name' : 'Full name'} value={v.name} error={errors.name} autoComplete="name"
          onChange={(e) => setV({ ...v, name: e.target.value })} />
        <PhoneInput value={v.phone} onChange={(phone) => setV({ ...v, phone })} error={errors.phone} />
        {errors.form && <p className="text-sm text-danger">{errors.form}</p>}
        <Button type="submit" size="lg" loading={loading} className="w-full">Continue</Button>
      </form>
    </AuthShell>
  );
}
