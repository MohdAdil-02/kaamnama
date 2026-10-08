import usePageTitle from '../../hooks/usePageTitle';
export default function PageHeader({ title, subtitle, action }) {
  usePageTitle(title);
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><h1>{title}</h1>{subtitle && <p className="mt-1 text-ink-muted">{subtitle}</p>}</div>
      {action}
    </div>
  );
}
