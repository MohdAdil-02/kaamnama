import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Wrench, GraduationCap } from 'lucide-react';
import AuthShell from '../../components/auth/AuthShell';
import DataState from '../../components/common/DataState';
import Button from '../../components/common/Button';
import useFetch from '../../hooks/useFetch';
import useAuth from '../../hooks/useAuth';
import { directoryApi } from '../../services/directoryApi';
import { authApi } from '../../services/authApi';
import { toast } from '../../store/notificationStore';
import { VERTICALS } from '../../utils/verticals';
import { FEATURES } from '../../utils/constants';

const ICONS = { trade: Wrench, education: GraduationCap };

// Onboarding branch from the product layout: "What do you do?" -> Trade / Teaching, then the skill.
export default function SelectCategory() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [vertical, setVertical] = useState(user?.vertical || '');
  const [step, setStep] = useState(user?.vertical ? 2 : 1);
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);
  const res = useFetch(() => (vertical ? directoryApi.categories(vertical) : Promise.resolve({ data: [] })), [vertical]);
  const options = Object.values(VERTICALS).filter((v) => v.key === 'trade' || FEATURES.education);

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 3 ? [...s, id] : s));
  const save = async () => {
    setSaving(true);
    try {
      await authApi.selectCategory({ vertical, categoryIds: selected });
      setUser({ ...user, vertical, categorySelected: true });
      navigate('/worker/dashboard', { replace: true });
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <AuthShell wide title={step === 1 ? 'What do you do?' : 'Pick your skills'}
      subtitle={step === 1 ? 'This sets the words we use across the app. Your record works the same way either way.' : 'Choose up to 3. You can change this later.'}>
      {step === 1 ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {options.map((v) => {
              const Icon = ICONS[v.key]; const on = vertical === v.key;
              return (
                <button key={v.key} type="button" onClick={() => setVertical(v.key)} aria-pressed={on}
                  className={`rounded-xl border p-5 text-left ${on ? 'border-primary bg-primary-light' : 'border-line hover:bg-slate-50'}`}>
                  <Icon className="mb-3 text-primary" /><p className="font-semibold">{v.name}</p><p className="mt-1 text-sm text-ink-muted">{v.tagline}</p>
                </button>
              );
            })}
          </div>
          <Button size="lg" className="mt-6 w-full" disabled={!vertical} onClick={() => setStep(2)}>Continue</Button>
        </>
      ) : (
        <DataState result={res}>
          {(cats) => (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {(cats.items ?? cats).map((c) => {
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
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button size="lg" className="flex-1" disabled={!selected.length} loading={saving} onClick={save}>Save and continue</Button>
              </div>
            </>
          )}
        </DataState>
      )}
    </AuthShell>
  );
}
