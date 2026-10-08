import { LocateFixed } from 'lucide-react';
import Select from '../common/Select';
import Input from '../common/Input';
import Button from '../common/Button';
import { FEATURES } from '../../utils/constants';
import { VERTICALS } from '../../utils/verticals';

// Skill + area (pincode or radius), as in the product layout. Ranking: tier-weighted trust, distance, recency.
export default function FilterPanel({ f, set, categories, onLocate, locating, located }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {FEATURES.education && (
        <Select placeholder="Any type of work" value={f.vertical} onChange={(e) => set({ vertical: e.target.value, category: '' })}
          options={Object.values(VERTICALS).map((v) => ({ value: v.key, label: v.name }))} />
      )}
      <Select placeholder="All skills" value={f.category} onChange={(e) => set({ category: e.target.value })} options={categories} />
      <Input placeholder="Pincode" inputMode="numeric" maxLength={6} aria-label="Pincode" value={f.pincode} onChange={(e) => set({ pincode: e.target.value.replace(/\D/g, '') })} />
      <div className="flex gap-2">
        <div className="flex-1"><Select placeholder="Any distance" value={f.radius} disabled={!located} onChange={(e) => set({ radius: e.target.value })}
          options={[5, 10, 25, 50].map((k) => ({ value: String(k), label: `Within ${k} km` }))} /></div>
        <Button variant={located ? 'secondary' : 'outline'} icon={LocateFixed} loading={locating} onClick={onLocate} aria-label="Use my location" title="Use my location" />
      </div>
    </div>
  );
}
