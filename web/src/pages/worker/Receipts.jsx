import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, LayoutGrid, List } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import { Skeleton } from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import ReceiptCard from '../../components/receipt/ReceiptCard';
import useFetch from '../../hooks/useFetch';
import { receiptApi } from '../../services/receiptApi';
import { RECEIPT_STATUS } from '../../utils/constants';
import { capitalize, formatCurrency, formatDate, maskPhone } from '../../utils/formatters';

const getView = () => { try { return localStorage.getItem('receipts-view') || 'grid'; } catch { return 'grid'; } };

export default function Receipts() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const [page, setPage] = useState(1);
  const [view, setView] = useState(getView);
  const res = useFetch(() => receiptApi.list({ status: status || undefined, page, limit: 12 }), [status, page]);
  const items = res.data?.data?.receipts ?? res.data?.receipts ?? [];
  const totalPages = res.data?.meta?.totalPages ?? 1;

  const setStatus = (s) => { setParams(s ? { status: s } : {}); setPage(1); };
  const changeView = (x) => { setView(x); try { localStorage.setItem('receipts-view', x); } catch { /* ignore */ } };

  return (
    <>
      <PageHeader title="Job receipts" subtitle="Every job you have recorded"
        action={<Link to="/worker/receipts/new"><Button icon={Plus}>Create receipt</Button></Link>} />
      <div className="mb-6 flex gap-3">
        <div className="flex-1 sm:max-w-xs">
          <Select placeholder="All statuses" value={status} onChange={(e) => setStatus(e.target.value)}
            options={Object.values(RECEIPT_STATUS).map((x) => ({ value: x, label: capitalize(x) }))} />
        </div>
        <div className="flex overflow-hidden rounded-lg border border-line">
          {[['grid', LayoutGrid], ['table', List]].map(([k, Icon]) => (
            <button key={k} onClick={() => changeView(k)} aria-label={`${k} view`} aria-pressed={view === k}
              className={`px-3 ${view === k ? 'bg-primary-light text-primary' : 'bg-white text-ink-muted'}`}><Icon size={16} /></button>
          ))}
        </div>
      </div>

      {res.loading && !res.data ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-28" />)}</div> :
        res.error ? <ErrorState message={res.error} onRetry={res.reload} /> :
        items.length === 0 ? <div className="card"><EmptyState title="No receipts found" description="Receipts you create will show up here." /></div> : (
          <>
            {view === 'grid' ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map((r) => <ReceiptCard key={r._id} receipt={r} />)}</div>
            ) : (
              <div className="card overflow-x-auto p-0">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-line bg-slate-50 text-ink-muted">
                    <tr>{['Job', 'Customer', 'Amount', 'Status', 'Date'].map((h) => <th key={h} scope="col" className="px-4 py-3 font-medium">{h}</th>)}</tr>
                  </thead>
                  <tbody>{items.map((r) => (
                    <tr key={r._id} className="border-b border-line last:border-0 hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-medium"><Link className="text-primary" to={`/worker/receipts/${r._id}`}>{r.title}</Link></td>
                      <td className="px-4 py-3">{r.customerName || maskPhone(r.customerPhone)}</td>
                      <td className="px-4 py-3">{formatCurrency(r.amount)}</td>
                      <td className="px-4 py-3">{capitalize(r.status)}</td>
                      <td className="px-4 py-3">{formatDate(r.workDate)}</td>
                    </tr>))}</tbody>
                </table>
              </div>
            )}
            <Pagination page={page} pages={totalPages} onChange={setPage} />
          </>
        )}
    </>
  );
}