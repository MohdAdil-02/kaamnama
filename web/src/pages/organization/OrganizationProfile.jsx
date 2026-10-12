import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import OrgGate from '../../components/organization/OrgGate';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import useOrg from '../../hooks/useOrg';
import { organizationApi } from '../../services/organizationApi';
import { toast } from '../../store/notificationStore';

function Form({ org, onSaved }) {
  const [v, setV] = useState({ name: '', city: '', description: '', phone: '', email: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  useEffect(() => setV({
    name: org.name || '', city: org.city || '', description: org.description || '',
    phone: org.phone || '', email: org.email || '',
  }), [org]);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault(); setSaving(true); setErrors({});
    const body = { name: v.name.trim() };
    for (const k of ['city', 'description', 'phone', 'email']) if (v[k].trim()) body[k] = v[k].trim();
    try { await organizationApi.update(org._id, body); toast.success('Organization saved'); onSaved(); }
    catch (err) {
      setErrors(Array.isArray(err.errors) ? Object.fromEntries(err.errors.map((x) => [x.field, x.message])) : {});
      toast.error(err.message);
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={save} className="card max-w-2xl space-y-5" noValidate>
      <div className="flex items-center gap-3">
        <h2>{org.name}</h2>
        {org.isVerified ? <Badge tone="success" verified>Verified organization</Badge> : <Badge tone="warning">Verification pending</Badge>}
      </div>
      <Input label="Organization name" value={v.name} onChange={set('name')} error={errors.name} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="City" value={v.city} onChange={set('city')} error={errors.city} />
        <Input label="Phone" value={v.phone} onChange={set('phone')} error={errors.phone} />
      </div>
      <Input label="Email" type="email" value={v.email} onChange={set('email')} error={errors.email} />
      <Textarea label="About" value={v.description} onChange={set('description')} error={errors.description} />
      <div className="flex justify-end"><Button type="submit" loading={saving}>Save changes</Button></div>
    </form>
  );
}

export default function OrganizationProfile() {
  const state = useOrg();
  return (
    <>
      <PageHeader title="Organization profile" subtitle="Details shown on your public page" />
      <OrgGate state={state}>{(org) => <Form org={org} onSaved={state.reload} />}</OrgGate>
    </>
  );
}