import { Badge } from '../badge';
import type { MissionStatus } from '../../types/mission.types';

const STATUS_VARIANTS: Record<MissionStatus, string> = {
  pending: 'outline',
  in_progress: 'default',
  completed: 'secondary',
  failed: 'destructive',
};

export interface MissionStatusBadgeProps {
  status: MissionStatus;
  className?: string;
}

export function MissionStatusBadge({ status, className }: MissionStatusBadgeProps) {
  const variant = STATUS_VARIANTS[status] ?? 'outline';

  return (
    <Badge variant={variant as never} className={className}>
      {status.replace('_', ' ')}
    </Badge>
  );
}
