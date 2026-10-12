import Badge from '../common/Badge';
import { TIERS } from '../../utils/tiers';

export default function TierBadge({ tier = 'new', showLabel = true }) {
  const t = TIERS[tier] || TIERS.new;
  return <Badge tone={t.tone} verified={tier !== 'new'}>{showLabel ? t.label : t.label[0]}</Badge>;
}