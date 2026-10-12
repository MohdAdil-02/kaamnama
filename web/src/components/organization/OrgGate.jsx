import { useState } from 'react';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import ErrorState from '../common/ErrorState';
import { Skeleton } from '../common/Skeleton';
import { organizationApi } from '../../services/organizationApi';
import { toast } from '../../store/notificationStore';

function CreateOrg({ onCreated }) {
  const [v, setV] = useState({ name: '', city: '', description: '' });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    if (v.name.trim().length < 2) return toast.error('Enter the organization name');
    setSaving(true);
    try {
      const body = { name: v.name.trim() };
      if (v.city.trim()) body.city = v.city.trim();
      if (v.description.trim()) body.description = v.description.trim();
      await organizationApi.create(body);
      toast.success('Organization created');
      onCreated();
    } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };
  return (
    <form onSubmit={submit} className="card max-w-xl space-y-4">
      <h2>Create your organization</h2>
      <p className="text-sm text-ink-muted">You need an organization before you can invite workers.</p>
      <Input label="Organization name" value={v.name} onChange={set('name')} />
      <Input label="City" value={v.city} onChange={set('city')} />
      <Textarea label="About" value={v.description} onChange={set('description')} />
      <div className="flex justify-end"><Button type="submit" loading={saving}>Create</Button></div>
    </form>
  );
}

export default function OrgGate({ state, children }) {
  if (state.loading && !state.org) return <Skeleton className="h-40" />;
  if (state.error) return <ErrorState message={state.error} onRetry={state.reload} />;
  if (!state.org) return <CreateOrg onCreated={state.reload} />;
  return children(state.org);
}