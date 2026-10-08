import Badge from '../common/Badge';
import { TIERS } from '../../utils/tiers';
export default function TierBadge({ tier = 'T0', showLabel = true }) {
  const t = TIERS[tier] || TIERS.T0;
  return <Badge tone={t.tone} verified={tier !== 'T0'}>{tier}{showLabel ? ` · ${t.label}` : ''}</Badge>;
}
