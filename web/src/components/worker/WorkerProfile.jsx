import { MapPin, IdCard } from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import SkillBadge from './SkillBadge';
import { getVertical } from '../../utils/verticals';

// "Rajesh Kumar · Electrician · Mau, UP"
export default function WorkerProfile({ worker, actions }) {
  const v = getVertical(worker.vertical);
  const skill = worker.category?.name || worker.skill || worker.title;
  return (
    <div className="card">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar name={worker.name} src={worker.avatar} size={88} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="!text-2xl">{worker.name}</h1>
            {worker.isVerified && <Badge tone="success" verified>Verified</Badge>}
            {worker.eShramLinked && <Badge tone="info"><IdCard size={12} />e-Shram linked</Badge>}
          </div>
          <p className="mt-1 text-ink-muted">{[skill, worker.city].filter(Boolean).join(' · ') || v.name}</p>
          {worker.pincode && <p className="mt-1 flex items-center gap-1 text-sm text-ink-muted"><MapPin size={14} />Serves {worker.pincode}</p>}
          {worker.bio && <p className="mt-4 max-w-2xl text-sm leading-relaxed">{worker.bio}</p>}
          {worker.skills?.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{worker.skills.map((s) => <SkillBadge key={s}>{s}</SkillBadge>)}</div>}
        </div>
        {actions && <div className="flex gap-2 sm:w-36 sm:flex-col">{actions}</div>}
      </div>
    </div>
  );
}
