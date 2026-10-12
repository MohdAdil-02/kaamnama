import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataState from '../../components/common/DataState';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import useWorker from '../../hooks/useWorker';
import useAuth from '../../hooks/useAuth';
import { workerApi } from '../../services/workerApi';
import { toast } from '../../store/notificationStore';

const list = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);

function Form({ worker }) {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [v, setV] = useState({
    displayName: worker.displayName || '',
    city: worker.city || '',
    area: worker.area || '',
    bio: worker.bio || '',
    skills: (worker.skills || []).join(', '),
    languages: (worker.languages || []).join(', '),
    experienceYears: worker.experienceYears ?? 0,
    isAvailable: worker.isAvailable !== false,
  });
  const [photo, setPhoto] = useState(worker.photoUrl);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState({});
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const r = await workerApi.uploadPhoto(file);
      setPhoto(r.data.photoUrl);
      toast.success('Photo updated');
    } catch (er) { toast.error(er.message); } finally { setUploading(false); }
  };

  const save = async (e) => {
    e.preventDefault();
    if (v.displayName.trim().length < 2) return setErr({ displayName: 'Enter your full name' });
    setErr({}); setSaving(true);
    const payload = {
      displayName: v.displayName.trim(),
      bio: v.bio.trim(),
      skills: list(v.skills),
      languages: list(v.languages),
      experienceYears: Math.max(0, Math.min(60, parseInt(v.experienceYears, 10) || 0)),
      isAvailable: v.isAvailable,
    };
    if (v.city.trim()) payload.city = v.city.trim();
    payload.area = v.area.trim();
    try {
      await workerApi.update(payload);
      setUser({ ...user, name: payload.displayName });
      toast.success('Profile saved');
      navigate('/worker/profile');
    } catch (er) {
      const fe = Array.isArray(er.errors) ? Object.fromEntries(er.errors.map((x) => [x.field, x.message])) : {};
      setErr(fe);
      toast.error(er.message);
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={save} className="card max-w-2xl space-y-5" noValidate>
      <div className="flex items-center gap-4">
        <Avatar name={v.displayName} src={photo} size={72} />
        <label className="cursor-pointer">
          <span className="inline-flex h-10 items-center rounded-lg border border-line px-4 text-sm font-medium hover:bg-slate-50">
            {uploading ? 'Uploading…' : 'Change photo'}
          </span>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={upload} />
        </label>
      </div>
      <Input label="Full name" value={v.displayName} onChange={set('displayName')} error={err.displayName} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="City / town" value={v.city} onChange={set('city')} error={err.city} />
        <Input label="Area / locality" value={v.area} onChange={set('area')} error={err.area} />
      </div>
      <Textarea label="About you" value={v.bio} onChange={set('bio')} error={err.bio}
        placeholder="Describe your experience and the work you do best." />
      <Input label="Skills" value={v.skills} onChange={set('skills')} hint="Separate skills with commas (max 15)" error={err.skills} />
      <Input label="Languages" value={v.languages} onChange={set('languages')} hint="For example: Hindi, English" error={err.languages} />
      <Input label="Years of experience" type="number" min="0" max="60" value={v.experienceYears}
        onChange={set('experienceYears')} error={err.experienceYears} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={v.isAvailable} onChange={(e) => setV({ ...v, isAvailable: e.target.checked })} />
        Available for new work
      </label>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => navigate('/worker/profile')}>Cancel</Button>
        <Button type="submit" loading={saving}>Save</Button>
      </div>
    </form>
  );
}

export default function EditProfile() {
  const res = useWorker();
  return (
    <>
      <PageHeader title="Edit profile" subtitle="This is what customers see on your public profile" />
      <DataState result={res}>
        {(raw) => <Form worker={raw.data?.worker ?? raw.worker ?? raw} />}
      </DataState>
    </>
  );
}