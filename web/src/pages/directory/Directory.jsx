import { useState } from 'react';
import { Info } from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';
import useFetch from '../../hooks/useFetch';
import usePageTitle from '../../hooks/usePageTitle';
import SearchBar from '../../components/directory/SearchBar';
import FilterPanel from '../../components/directory/FilterPanel';
import WorkerResults from '../../components/directory/WorkerResults';
import Select from '../../components/common/Select';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import { Skeleton } from '../../components/common/Skeleton';
import { directoryApi } from '../../services/directoryApi';
import { toast } from '../../store/notificationStore';

export default function Directory() {
  usePageTitle('Verified directory');
  const [q, setQ] = useState('');
  const [f, setF] = useState({ vertical: '', category: '', pincode: '', radius: '', sort: '' });
  const [geo, setGeo] = useState(null);
  const [locating, setLocating] = useState(false);
  const [page, setPage] = useState(1);
  const dq = useDebounce(q);
  const dpin = useDebounce(f.pincode, 500);
  const set = (patch) => { setF((p) => ({ ...p, ...patch })); setPage(1); };

  const cats = useFetch(() => directoryApi.categories(f.vertical || undefined), [f.vertical]);
  const res = useFetch(() => directoryApi.search({
    q: dq || undefined, vertical: f.vertical || undefined, category: f.category || undefined,
    pincode: dpin.length === 6 ? dpin : undefined, sort: f.sort || undefined,
    lat: geo?.lat, lng: geo?.lng, radius: geo && f.radius ? f.radius : undefined, page, limit: 12,
  }), [dq, f.vertical, f.category, dpin, f.sort, f.radius, geo, page]);

  const locate = () => {
    if (!navigator.geolocation) return toast.error('Location is not supported on this device');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setGeo({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocating(false); toast.success('Using your location'); },
      () => { setLocating(false); toast.error('Could not get your location. Allow location access or use a pincode.'); },
      { timeout: 10000 }
    );
  };
  const categories = (cats.data?.items ?? cats.data ?? []).map((c) => ({ value: c._id, label: c.name }));
  const items = res.data?.items ?? (Array.isArray(res.data) ? res.data : []);

  return (
    <div className="container-page py-10">
      <h1>Verified directory</h1>
      <p className="mb-6 mt-1 text-ink-muted">Find trustworthy workers near you, then contact them directly.</p>
      <div className="mb-6 flex items-start gap-2 rounded-lg bg-primary-light p-3 text-sm text-primary">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p>Kaamnama is a directory, not a marketplace. There is no job posting, commission or in-app payment. Results are ranked by verified trust score, then distance, then recent verified work.</p>
      </div>
      <div className="card mb-8 space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2"><SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} /></div>
          <Select placeholder="Best match" value={f.sort} onChange={(e) => set({ sort: e.target.value })}
            options={[{ value: 'rating', label: 'Highest rated' }, { value: 'repeat', label: 'Most repeat customers' }, { value: 'jobs', label: 'Most verified jobs' }]} />
        </div>
        <FilterPanel f={f} set={set} categories={categories} onLocate={locate} locating={locating} located={!!geo} />
      </div>
      {res.loading && !res.data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : res.error ? <ErrorState message={res.error} onRetry={res.reload} /> : (
        <>
          <WorkerResults items={items} />
          <Pagination page={page} pages={res.data?.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
