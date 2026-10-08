import Button from './Button';
export default function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;
  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <Button variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button>
      <span className="text-sm text-ink-muted">Page {page} of {pages}</span>
      <Button variant="outline" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</Button>
    </div>
  );
}
