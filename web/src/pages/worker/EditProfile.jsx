import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataState from '../../components/common/DataState';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import SubjectSelector from '../../components/education/SubjectSelector';
import useWorker from '../../hooks/useWorker';
import useAuth from '../../hooks/useAuth';
import { workerApi } from '../../services/workerApi';
import { toast } from '../../store/notificationStore';
import { isPincode } from '../../utils/validators';
import { EDU_SUBJECTS } from '../../utils/verticals';

function Form({ worker }) {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const edu = worker.education || {};
  const [v, setV] = useState({
    name: worker.name || '', city: worker.city || '', pincode: worker.pincode || '', bio: worker.bio || '',
    skills: (worker.skills || []).join(', '), uan: worker.uan || '',
    subjects: edu.subjects || [], qualification: edu.qualification || '', experienceYears: edu.experienceYears ?? '', fee: edu.fee ?? '', mode: edu.mode || '',
  });
  const [avatar, setAvatar] = useState(worker.avatar);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState({});
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const isEdu = worker.vertical === 'education';

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData(); fd.append('avatar', file);
    setUploading(true);
    try { const r = await workerApi.uploadAvatar(fd); setAvatar(r.data?.avatar || URL.createObjectURL(file)); toast.success('Photo updated'); }
    catch (er) { toast.error(er.message); } finally { setUploading(false); }
  };
  const save = async (e) => {
    e.preventDefault();
    if (v.pincode && !isPincode(v.pincode)) return setErr({ pincode: 'Enter a 6-digit pincode' });
    if (v.uan && !/^\d{12}$/.test(v.uan)) return setErr({ uan: 'UAN is 12 digits' });
    setErr({}); setSaving(true);
    try {
      const payload = { name: v.name, city: v.city, pincode: v.pincode, bio: v.bio, uan: v.uan || undefined, skills: v.skills.split(',').map((s) => s.trim()).filter(Boolean) };
      if (isEdu) payload.education = { subjects: v.subjects, qualification: v.qualification, experienceYears: Number(v.experienceYears) || 0, fee: Number(v.fee) || 0, mode: v.mode };
      await workerApi.updateMe(payload);
      setUser({ ...user, name: v.name });
      toast.success('Profile saved');
      navigate('/worker/profile');
    } catch (er) { toast.error(er.message); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={save} className="card max-w-2xl space-y-5" noValidate>
      <div className="flex items-center gap-4">
        <Avatar name={v.name} src={avatar} size={72} />
        <label className="cursor-pointer">
          <span className="inline-flex h-10 items-center rounded-lg border border-line px-4 text-sm font-medium hover:bg-slate-50">{uploading ? 'Uploading…' : 'Change photo'}</span>
          <input type="file" accept="image/*" className="hidden" onChange={upload} />
        </label>
      </div>
      <Input label="Full name" value={v.name} onChange={set('name')} required />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="City / town" value={v.city} onChange={set('city')} />
        <Input label="Service area pincode" inputMode="numeric" maxLength={6} value={v.pincode} onChange={(e) => setV({ ...v, pincode: e.target.value.replace(/\D/g, '') })} error={err.pincode} />
      </div>
      <Textarea label="About you" value={v.bio} onChange={set('bio')} placeholder="Describe your experience and the work you do best." />
      <Input label="Skills" value={v.skills} onChange={set('skills')} hint="Separate skills with commas" />
      <Input label="e-Shram UAN (optional)" inputMode="numeric" maxLength={12} value={v.uan} onChange={(e) => setV({ ...v, uan: e.target.value.replace(/\D/g, '') })} error={err.uan}
        hint="Shows an “e-Shram linked” badge on your profile." />
      {isEdu && (
        <div className="space-y-5 border-t border-line pt-5">
          <h2>Teaching details</h2>
          <SubjectSelector subjects={EDU_SUBJECTS} value={v.subjects} onChange={(subjects) => setV({ ...v, subjects })} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Qualification" value={v.qualification} onChange={set('qualification')} />
            <Input label="Experience (years)" type="number" min="0" value={v.experienceYears} onChange={set('experienceYears')} />
            <Input label="Fee per session" prefix="₹" type="number" min="0" value={v.fee} onChange={set('fee')} />
            <Select label="Mode" value={v.mode} onChange={set('mode')} placeholder="Select" options={[{ value: 'home', label: 'At student’s home' }, { value: 'online', label: 'Online' }, { value: 'centre', label: 'At my centre' }]} />
          </div>
        </div>
      )}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        <Button type="submit" loading={saving}>Save changes</Button>
      </div>
    </form>
  );
}

export default function EditProfile() {
  const res = useWorker();
  return (
    <>
      <PageHeader title="Edit profile" subtitle="Keep your details current" />
      <DataState result={res}>{(w) => <Form worker={w} />}</DataState>
    </>
  );
}
