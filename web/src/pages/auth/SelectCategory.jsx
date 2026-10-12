import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import AuthShell from '../../components/auth/AuthShell';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { toast } from '../../store/notificationStore';

export default function SelectCategory() {
  const navigate = useNavigate();
  const [cats, setCats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/directory/categories')
      .then((res) => setCats(res.data.categories))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 3 ? [...s, id] : s));

  const save = async () => {
    setSaving(true);
    try {
      await api.patch('/workers/me', { categories: selected });
      navigate('/worker/dashboard', { replace: true });
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <AuthShell wide title="Pick your skills" subtitle="Choose up to 3. You can change this later.">
      {loading ? <p className="text-sm text-ink-muted">Loading…</p> : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {cats.map((c) => {
              const on = selected.includes(c._id);
              return (
                <button key={c._id} type="button" onClick={() => toggle(c._id)} aria-pressed={on}
                  className={`flex items-center justify-between rounded-lg border p-4 text-left text-sm font-medium ${on ? 'border-primary bg-primary-light text-primary' : 'border-line hover:bg-slate-50'}`}>
                  {c.name}{on && <Check size={16} />}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => navigate('/worker/dashboard', { replace: true })}>Skip</Button>
            <Button size="lg" className="flex-1" disabled={!selected.length} loading={saving} onClick={save}>Save and continue</Button>
          </div>
        </>
      )}
    </AuthShell>
  );
}