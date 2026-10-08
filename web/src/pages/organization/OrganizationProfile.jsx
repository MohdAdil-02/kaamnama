import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataState from '../../components/common/DataState';
import OrganizationCard from '../../components/organization/OrganizationCard';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import { ORG_TYPES } from '../../utils/constants';
import Button from '../../components/common/Button';
import useFetch from '../../hooks/useFetch';
import { organizationApi } from '../../services/organizationApi';
import { toast } from '../../store/notificationStore';

function Form({ org, onSaved }) {
  const [v, setV] = useState({ name: '', type: '', city: '', description: '' });
  const [saving, setSaving] = useState(false);
  useEffect(() => setV({ name: org.name || '', type: org.type || '', city: org.city || '', description: org.description || '' }), [org]);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await organizationApi.updateMe(v); toast.success('Organization saved'); onSaved(); }
    catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };
  return (
    <form onSubmit={save} className="card max-w-2xl space-y-5">
      <Input label="Organization name" value={v.name} onChange={set('name')} required />
      <div className="grid gap-5 sm:grid-cols-2">
        <Select label="Type" placeholder="Select type" value={v.type} onChange={set('type')} options={ORG_TYPES} />
        <Input label="City" value={v.city} onChange={set('city')} />
      </div>
      <Textarea label="About" value={v.description} onChange={set('description')} />
      <div className="flex justify-end"><Button type="submit" loading={saving}>Save changes</Button></div>
    </form>
  );
}

export default function OrganizationProfile() {
  const res = useFetch(() => organizationApi.getMe(), []);
  return (
    <>
      <PageHeader title="Organization profile" subtitle="Details shown to your members and customers" />
      <DataState result={res}>
        {(org) => <div className="space-y-6"><div className="flex flex-wrap items-center gap-3"><OrganizationCard org={org} />{org.verifiedStatus === 'verified' ? <Badge tone="success" verified>Verified organization</Badge> : <Badge tone="warning">Verification pending</Badge>}</div><Form org={org} onSaved={res.reload} /></div>}
      </DataState>
    </>
  );
}
