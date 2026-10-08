import { initials } from '../../utils/formatters';
export default function Avatar({ name, src, size = 48 }) {
  const style = { width: size, height: size, fontSize: size / 2.8 };
  return src ? (
    <img src={src} alt={name} style={style} className="shrink-0 rounded-full object-cover" />
  ) : (
    <div style={style} className="flex shrink-0 items-center justify-center rounded-full bg-primary-light font-semibold text-primary">{initials(name)}</div>
  );
}
