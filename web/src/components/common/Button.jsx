import Spinner from './Spinner';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-slate-100 text-ink hover:bg-slate-200',
  outline: 'border border-line bg-white text-ink hover:bg-slate-50',
  ghost: 'text-ink-muted hover:bg-slate-100',
  danger: 'bg-danger text-white hover:bg-red-700',
  success: 'bg-success text-white hover:bg-green-700',
};
const sizes = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-base' };

export default function Button({ variant = 'primary', size = 'md', loading, icon: Icon, children, className = '', disabled, type = 'button', ...rest }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading ? <Spinner size={16} /> : Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
