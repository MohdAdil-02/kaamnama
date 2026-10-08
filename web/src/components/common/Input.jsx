import { forwardRef } from 'react';

const Input = forwardRef(function Input({ label, error, hint, prefix, className = '', ...rest }, ref) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium">{label}</span>}
      <div className={`flex items-center rounded-lg border bg-white transition focus-within:ring-2 focus-within:ring-primary/30
        ${error ? 'border-danger' : 'border-line focus-within:border-primary'}`}>
        {prefix && <span className="flex items-center border-r border-line px-3 text-sm text-ink-muted">{prefix}</span>}
        <input ref={ref} className={`h-10 w-full rounded-lg bg-transparent px-3 text-sm outline-none ${className}`} {...rest} />
      </div>
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </label>
  );
});
export default Input;
