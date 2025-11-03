import { Badge } from '@/shared/components/ui/badge';
import { 
  Zap,
  Code,
  Database,
  Cloud,
  Wrench,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToolType = 'ai_function' | 'api' | 'database' | 'saas' | 'software_reference' | 'ai_framework';

interface ToolTypeBadgeProps {
  type?: ToolType | string;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ToolTypeBadge({ 
  type, 
  className, 
  showIcon = true,
  size = 'md' 
}: ToolTypeBadgeProps) {
  if (!type) return null;

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

  const getIcon = () => {
    if (!showIcon) return null;
    
    switch (type) {
      case 'ai_function':
        return <Zap className={cn(iconSize, 'mr-1')} />;
      case 'api':
        return <Code className={cn(iconSize, 'mr-1')} />;
      case 'database':
        return <Database className={cn(iconSize, 'mr-1')} />;
      case 'saas':
        return <Cloud className={cn(iconSize, 'mr-1')} />;
      case 'ai_framework':
        return <TrendingUp className={cn(iconSize, 'mr-1')} />;
      default:
        return <Wrench className={cn(iconSize, 'mr-1')} />;
    }
  };

  const getColorClass = () => {
    switch (type) {
      case 'ai_function':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'api':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'database':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'saas':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'software_reference':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'ai_framework':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'ai_function':
        return 'AI Function';
      case 'api':
        return 'API';
      case 'database':
        return 'Database';
      case 'saas':
        return 'SaaS';
      case 'software_reference':
        return 'Software';
      case 'ai_framework':
        return 'AI Framework';
      default:
        return type.replace('_', ' ');
    }
  };

  return (
    <Badge 
      className={cn(
        getColorClass(),
        sizeClasses[size],
        'capitalize',
        className
      )}
    >
      {getIcon()}
      {getLabel()}
    </Badge>
  );
}

export function getToolTypeColor(type?: string): string {
  switch (type) {
    case 'ai_function':
      return 'purple';
    case 'api':
      return 'blue';
    case 'database':
      return 'cyan';
    case 'saas':
      return 'indigo';
    case 'software_reference':
      return 'gray';
    case 'ai_framework':
      return 'pink';
    default:
      return 'gray';
  }
}

