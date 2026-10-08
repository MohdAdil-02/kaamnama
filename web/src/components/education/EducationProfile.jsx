import { GraduationCap } from 'lucide-react';
import SkillBadge from '../worker/SkillBadge';
export default function EducationProfile({ data }) {
  if (!data) return null;
  return (
    <div className="card">
      <h3 className="mb-3 flex items-center gap-2"><GraduationCap size={18} className="text-primary" />Teaching profile</h3>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        {data.qualification && <div><dt className="text-ink-muted">Qualification</dt><dd className="font-medium">{data.qualification}</dd></div>}
        {data.experienceYears != null && <div><dt className="text-ink-muted">Experience</dt><dd className="font-medium">{data.experienceYears} years</dd></div>}
        {data.mode && <div><dt className="text-ink-muted">Mode</dt><dd className="font-medium capitalize">{data.mode}</dd></div>}
        {data.fee != null && <div><dt className="text-ink-muted">Fee per session</dt><dd className="font-medium">₹{data.fee}</dd></div>}
      </dl>
      {data.subjects?.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{data.subjects.map((s) => <SkillBadge key={s}>{s}</SkillBadge>)}</div>}
    </div>
  );
}
