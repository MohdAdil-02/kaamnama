import { useState } from 'react';
import { Download, Search } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import useDebounce from '../../hooks/useDebounce';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import { Skeleton } from './Skeleton';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';
import Pagination from './Pagination';
import PageHeader from './PageHeader';
import { toCsv, downloadCsv } from '../../utils/csv';

/**
 * Generic paginated table for admin / organization lists.
 * fetcher(params) -> api promise; expects res.data = { items, pages } or an array.
 * columns: [{ key, header, render?(row), csv?(row) }]   filters: [{ name, placeholder, options }]
 * exportName: when set, shows an "Export CSV" button for the rows on screen.
 */
export default function ResourceTable({ title, subtitle, fetcher, columns, filters = [], searchable = true, action, rowKey = '_id', emptyTitle = 'Nothing here yet', exportName }) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [f, setF] = useState({});
  const dq = useDebounce(q);
  const res = useFetch(() => fetcher({ q: dq || undefined, page, limit: 15, ...f }), [dq, page, JSON.stringify(f)]);
  const items = res.data?.items ?? (Array.isArray(res.data) ? res.data : []);
  const pages = res.data?.pages ?? 1;
  const exportCols = columns.filter((c) => c.header);

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} action={
        <div className="flex gap-2">
          {exportName && <Button variant="outline" icon={Download} disabled={!items.length} onClick={() => downloadCsv(`${exportName}.csv`, toCsv(items, exportCols))}>Export CSV</Button>}
          {action}
        </div>} />
      {(searchable || filters.length > 0) && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {searchable && <Input placeholder="Search…" prefix={<Search size={16} />} aria-label="Search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />}
          {filters.map((fl) => (
            <Select key={fl.name} placeholder={fl.placeholder} options={fl.options} value={f[fl.name] || ''}
              onChange={(e) => { setF({ ...f, [fl.name]: e.target.value || undefined }); setPage(1); }} />
          ))}
        </div>
      )}
      <div className="card overflow-hidden p-0">
        {res.loading && !res.data ? <div className="space-y-2 p-4">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10" />)}</div> :
          res.error ? <ErrorState message={res.error} onRetry={res.reload} /> :
          items.length === 0 ? <EmptyState title={emptyTitle} description="Try changing your search or filters." /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-line bg-slate-50 text-ink-muted">
                  <tr>{columns.map((c) => <th key={c.key} scope="col" className="px-4 py-3 font-medium">{c.header}</th>)}</tr>
                </thead>
                <tbody>
                  {items.map((row, i) => (
                    <tr key={row[rowKey] ?? i} className="border-b border-line last:border-0 hover:bg-slate-50/60">
                      {columns.map((c) => <td key={c.key} className="px-4 py-3">{c.render ? c.render(row, res.reload) : row[c.key] ?? '—'}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
      <Pagination page={page} pages={pages} onChange={setPage} />
    </>
  );
}
