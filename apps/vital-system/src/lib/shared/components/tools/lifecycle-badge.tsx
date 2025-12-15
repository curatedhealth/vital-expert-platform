import { Badge } from '@/lib/shared/components/ui/badge';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  XCircle,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type LifecycleStage = 'production' | 'testing' | 'staging' | 'development' | 'deprecated';

interface LifecycleBadgeProps {
  stage?: LifecycleStage | string;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LifecycleBadge({ 
  stage, 
  className, 
  showIcon = true,
  size = 'md' 
}: LifecycleBadgeProps) {
  if (!stage) return null;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const iconSize = iconSizes[size];

  switch (stage) {
    case 'production':
      return (
        <Badge 
          className={cn(
            'bg-green-100 text-green-800 border-green-200',
            sizeClasses[size],
            className
          )}
        >
          {showIcon && <CheckCircle2 className={cn(iconSize, 'mr-1')} />}
          Production
        </Badge>
      );
    case 'testing':
      return (
        <Badge 
          className={cn(
            'bg-yellow-100 text-yellow-800 border-yellow-200',
            sizeClasses[size],
            className
          )}
        >
          {showIcon && <Clock className={cn(iconSize, 'mr-1')} />}
          Testing
        </Badge>
      );
    case 'staging':
      return (
        <Badge 
          className={cn(
            'bg-blue-100 text-blue-800 border-blue-200',
            sizeClasses[size],
            className
          )}
        >
          {showIcon && <Activity className={cn(iconSize, 'mr-1')} />}
          Staging
        </Badge>
      );
    case 'development':
      return (
        <Badge 
          className={cn(
            'bg-neutral-100 text-neutral-800 border-neutral-200',
            sizeClasses[size],
            className
          )}
        >
          {showIcon && <AlertCircle className={cn(iconSize, 'mr-1')} />}
          Development
        </Badge>
      );
    case 'deprecated':
      return (
        <Badge 
          className={cn(
            'bg-red-100 text-red-800 border-red-200',
            sizeClasses[size],
            className
          )}
        >
          {showIcon && <XCircle className={cn(iconSize, 'mr-1')} />}
          Deprecated
        </Badge>
      );
    default:
      return (
        <Badge 
          className={cn(
            'bg-neutral-100 text-neutral-600 border-neutral-200',
            sizeClasses[size],
            className
          )}
        >
          {stage}
        </Badge>
      );
  }
}

export function getLifecycleColor(stage?: string): string {
  switch (stage) {
    case 'production':
      return 'green';
    case 'testing':
      return 'yellow';
    case 'staging':
      return 'blue';
    case 'development':
      return 'gray';
    case 'deprecated':
      return 'red';
    default:
      return 'gray';
  }
}

export function getLifecycleStatus(stage?: string): {
  label: string;
  description: string;
  canUse: boolean;
} {
  switch (stage) {
    case 'production':
      return {
        label: 'Production',
        description: 'Fully tested and ready for production use',
        canUse: true,
      };
    case 'testing':
      return {
        label: 'Testing',
        description: 'Under testing, not production-ready',
        canUse: false,
      };
    case 'staging':
      return {
        label: 'Staging',
        description: 'Pre-production validation in progress',
        canUse: false,
      };
    case 'development':
      return {
        label: 'Development',
        description: 'Defined but not yet implemented',
        canUse: false,
      };
    case 'deprecated':
      return {
        label: 'Deprecated',
        description: 'Being phased out, use alternatives',
        canUse: false,
      };
    default:
      return {
        label: 'Unknown',
        description: 'Status unknown',
        canUse: false,
      };
  }
}

