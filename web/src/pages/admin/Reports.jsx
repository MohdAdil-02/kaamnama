import PageHeader from '../../components/common/PageHeader';
import DataState from '../../components/common/DataState';
import useFetch from '../../hooks/useFetch';
import { adminApi } from '../../services/adminApi';
import { capitalize } from '../../utils/formatters';

function Bars({ title, rows = [] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="card">
      <h2 className="mb-4">{title}</h2>
      {rows.length === 0 ? <p className="text-sm text-ink-muted">No data yet.</p> : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="mb-1 flex justify-between text-sm"><span>{capitalize(String(r.label))}</span><span className="font-medium">{r.value}</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary" style={{ width: `${(r.value / max) * 100}%` }} /></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Expects: { receiptsByStatus: [{label,value}], workersByCategory: [{label,value}], signupsByMonth: [{label,value}] }
export default function Reports() {
  const res = useFetch(() => adminApi.reports(), []);
  return (
    <>
      <PageHeader title="Reports" subtitle="Platform activity at a glance" />
      <DataState result={res}>
        {(d) => (
          <div className="grid gap-6 lg:grid-cols-2">
            <Bars title="Receipts by status" rows={d.receiptsByStatus} />
            <Bars title="Workers by category" rows={d.workersByCategory} />
            <Bars title="Signups by month" rows={d.signupsByMonth} />
          </div>
        )}
      </DataState>
    </>
  );
}
