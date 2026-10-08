import { Badge } from '../ui/Badge';

export function ConfidenceBadge({ confidence }: { confidence: number }) {
  const tone = confidence >= 78 ? 'green' : confidence >= 68 ? 'yellow' : 'muted';
  return <Badge tone={tone}>Уверенность {confidence}%</Badge>;
}
