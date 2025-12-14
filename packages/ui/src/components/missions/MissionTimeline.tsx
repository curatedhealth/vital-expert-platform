import { cn } from '../../lib/utils';
import type { MissionCheckpoint } from '../../types/mission.types';
import { Badge } from '../badge';
import { Separator } from '../separator';

export interface MissionTimelineProps {
  checkpoints: MissionCheckpoint[];
  className?: string;
}

const STATUS_TO_COLOR: Record<string, string> = {
  pending: 'bg-stone-200 text-stone-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export function MissionTimeline({ checkpoints, className }: MissionTimelineProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {checkpoints.map((checkpoint, index) => {
        const colorClass = STATUS_TO_COLOR[checkpoint.status || 'pending'] ?? STATUS_TO_COLOR.pending;
        return (
          <div key={checkpoint.id || index} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={cn('h-3 w-3 rounded-full', colorClass)} />
              {index < checkpoints.length - 1 ? <Separator orientation="vertical" className="h-6" /> : null}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium leading-tight">{checkpoint.title}</p>
                {checkpoint.isBlocking ? <Badge variant="outline">Blocking</Badge> : null}
              </div>
              <p className="text-xs text-muted-foreground">{checkpoint.type ?? 'checkpoint'}</p>
              {checkpoint.timestamp ? (
                <p className="text-xs text-muted-foreground">{checkpoint.timestamp}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
