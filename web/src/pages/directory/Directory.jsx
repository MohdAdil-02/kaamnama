import { useState } from 'react';
import { Info, LocateFixed } from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';
import useFetch from '../../hooks/useFetch';
import usePageTitle from '../../hooks/usePageTitle';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import { Skeleton } from '../../components/common/Skeleton';
import DirectoryWorkerCard from '../../components/directory/DirectoryWorkerCard';
import { TIER_ORDER, tierLabel } from '../../utils/tiers';
import { directoryApi } from '../../services/directoryApi';
import { toast } from '../../store/notificationStore';

export default function Directory() {
  usePageTitle('Verified directory');
  const [q, setQ] = useState('');
  const [f, setF] = useState({ category: '', city: '', minTier: '', available: false, sort: 'trust', radiusKm: '10' });
  const [geo, setGeo] = useState(null);
  const [page, setPage] = useState(1);
  const dq = useDebounce(q);
  const dcity = useDebounce(f.city, 500);
  const set = (patch) => { setF((p) => ({ ...p, ...patch })); setPage(1); };

  const cats = useFetch(() => directoryApi.categories(), []);
  const res = useFetch(() => directoryApi.search({
    q: dq.trim().length >= 2 ? dq.trim() : undefined,
    category: f.category || undefined,
    city: dcity.trim().length >= 2 ? dcity.trim() : undefined,
    minTier: f.minTier || undefined,
    available: f.available ? 'true' : undefined,
    sort: f.sort,
    lat: geo?.lat, lng: geo?.lng, radiusKm: geo ? f.radiusKm : undefined,
    page, limit: 12,
  }), [dq, f.category, dcity, f.minTier, f.available, f.sort, f.radiusKm, geo, page]);

  const categories = (cats.data?.data?.categories ?? cats.data?.categories ?? []).map((c) => ({ value: c.slug, label: c.name }));
  const workers = res.data?.data?.workers ?? res.data?.workers ?? [];
  const totalPages = res.data?.meta?.totalPages ?? 1;

  const locate = () => {
    if (!navigator.geolocation) return toast.error('Location is not supported on this device');
    navigator.geolocation.getCurrentPosition(
      (p) => { setGeo({ lat: p.coords.latitude, lng: p.coords.longitude }); setPage(1); toast.success('Using your location'); },
      () => toast.error('Could not get your location. Allow access or search by city.'),
      { timeout: 10000 }
    );
  };

  return (
    <div className="container-page py-10">
      <h1>Verified directory</h1>
      <p className="mb-6 mt-1 text-ink-muted">Find trustworthy workers near you.</p>
      <div className="mb-6 flex items-start gap-2 rounded-lg bg-primary-light p-3 text-sm text-primary">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p>Kaamnama is a directory, not a marketplace. Every verified job was confirmed by the customer with an OTP.</p>
      </div>

      <div className="card mb-8 space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Input placeholder="Search name, skill or bio (min 2 letters)" aria-label="Search" value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          </div>
          <Select value={f.sort} onChange={(e) => set({ sort: e.target.value })}
            options={[{ value: 'trust', label: 'Highest trust' }, { value: 'rating', label: 'Highest rated' },
              { value: 'jobs', label: 'Most verified jobs' }, { value: 'newest', label: 'Newest' }]} />
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <Select placeholder="All categories" value={f.category} onChange={(e) => set({ category: e.target.value })} options={categories} />
          <Input placeholder="City" aria-label="City" value={f.city} onChange={(e) => set({ city: e.target.value })} />
          <Select placeholder="Any tier" value={f.minTier} onChange={(e) => set({ minTier: e.target.value })}
            options={TIER_ORDER.slice(1).map((t) => ({ value: t, label: `${tierLabel(t)} or higher` }))} />
          <div className="flex items-center gap-2">
            <Button type="button" variant={geo ? 'primary' : 'outline'} icon={LocateFixed} onClick={locate}>
              {geo ? 'Near me' : 'Use my location'}
            </Button>
            {geo && <Button type="button" variant="ghost" onClick={() => { setGeo(null); setPage(1); }}>Clear</Button>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={f.available} onChange={(e) => set({ available: e.target.checked })} />
            Available now
          </label>
          {geo && (
            <label className="flex items-center gap-2">Within
              <select className="rounded border border-line px-2 py-1" value={f.radiusKm} onChange={(e) => set({ radiusKm: e.target.value })}>
                {['5', '10', '25', '50'].map((r) => <option key={r} value={r}>{r} km</option>)}
              </select>
            </label>
          )}
        </div>
      </div>

      {res.loading && !res.data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : res.error ? <ErrorState message={res.error} onRetry={res.reload} /> : workers.length === 0 ? (
        <div className="card"><EmptyState title="No workers found" description="Try removing a filter or widening the distance." /></div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workers.map((w) => <DirectoryWorkerCard key={w.publicId || w.slug} worker={w} />)}
          </div>
          <Pagination page={page} pages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}