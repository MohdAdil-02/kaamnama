import { useRef } from 'react';

export default function OTPInput({ length = 6, value, onChange }) {
  const refs = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const setDigit = (i, d) => {
    const next = digits.slice(); next[i] = d.slice(-1); onChange(next.join(''));
    if (d && refs.current[i + 1]) refs.current[i + 1].focus();
  };
  const onKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && refs.current[i - 1]) refs.current[i - 1].focus();
  };
  const onPaste = (e) => {
    const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (t) { e.preventDefault(); onChange(t); refs.current[Math.min(t.length, length - 1)]?.focus(); }
  };

  return (
    <div className="flex justify-between gap-2" onPaste={onPaste}>
      {digits.map((d, i) => (
        <input key={i} ref={(el) => (refs.current[i] = el)} value={d} inputMode="numeric" maxLength={1}
          autoComplete={i === 0 ? 'one-time-code' : 'off'} aria-label={`Digit ${i + 1}`}
          onChange={(e) => setDigit(i, e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => onKeyDown(i, e)}
          className="h-12 w-full max-w-[52px] rounded-lg border border-line text-center text-lg font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
      ))}
    </div>
  );
}
