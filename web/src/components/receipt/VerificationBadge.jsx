import Badge from '../common/Badge';
import { RECEIPT_STATUS as S } from '../../utils/constants';

const map = {
  [S.PENDING]: { tone: 'warning', label: 'Pending' },
  [S.VERIFIED]: { tone: 'success', label: 'Verified', verified: true },
  [S.COMPLETED]: { tone: 'primary', label: 'Completed' },
  [S.REJECTED]: { tone: 'danger', label: 'Rejected' },
};
export default function VerificationBadge({ status }) {
  const m = map[status] || { tone: 'neutral', label: status || 'Unknown' };
  return <Badge tone={m.tone} verified={m.verified}>{m.label}</Badge>;
}
