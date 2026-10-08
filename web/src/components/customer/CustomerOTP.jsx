import { useEffect, useState } from 'react';
import OTPInput from '../auth/OTPInput';
import Button from '../common/Button';

export default function CustomerOTP({ value, onChange, onSubmit, onResend, loading, error, submitText = 'Confirm job' }) {
  const [cooldown, setCooldown] = useState(30);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-5">
      <OTPInput value={value} onChange={onChange} />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" size="lg" loading={loading} className="w-full" disabled={value.length !== 6}>{submitText}</Button>
      <p className="text-center text-sm text-ink-muted">
        {cooldown > 0 ? `Resend code in ${cooldown}s` :
          <button type="button" className="font-medium text-primary" onClick={async () => { await onResend(); setCooldown(30); }}>Resend code</button>}
      </p>
    </form>
  );
}
