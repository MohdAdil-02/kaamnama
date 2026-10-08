import { Trash2 } from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatters';

// Membership = worker_id, org_id, role, start_date, end_date (null while active)
export default function MembershipCard({ member, onRemove }) {
  const w = member.worker || member;
  const active = !member.endDate;
  return (
    <div className="card flex items-center gap-3 p-4">
      <Avatar name={w.name} src={w.avatar} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{w.name}</p>
        <p className="truncate text-sm text-ink-muted capitalize">{[member.role, w.category?.name].filter(Boolean).join(' · ')}</p>
        <p className="text-xs text-ink-muted">Since {formatDate(member.startDate)}{member.endDate ? ` to ${formatDate(member.endDate)}` : ''}</p>
      </div>
      <Badge tone={active ? 'success' : 'neutral'}>{active ? 'Active' : 'Ended'}</Badge>
      {onRemove && active && <Button variant="ghost" size="sm" icon={Trash2} onClick={() => onRemove(member)} aria-label="Remove member" />}
    </div>
  );
}
