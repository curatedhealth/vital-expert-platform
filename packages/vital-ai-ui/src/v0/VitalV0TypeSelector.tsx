'use client';

import { memo, useMemo } from 'react';
import { cn } from '../lib/utils';
import {
  Box,
  Users,
  Layers,
  BarChart3,
  Layout,
  FormInput,
  Table,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { V0GenerationType, VitalV0TypeSelectorProps, V0GenerationTypeConfig } from './types';

/**
 * Icon mapping for generation types
 */
const TYPE_ICONS: Record<V0GenerationType, LucideIcon> = {
  'workflow-node': Box,
  'agent-card': Users,
  'panel-ui': Layers,
  'visualization': BarChart3,
  'dashboard': Layout,
  'form': FormInput,
  'table': Table,
};

/**
 * Configuration for each generation type
 */
const TYPE_CONFIGS: Record<V0GenerationType, Omit<V0GenerationTypeConfig, 'examples'>> = {
  'workflow-node': {
    id: 'workflow-node',
    label: 'Workflow Node',
    description: 'Custom node for workflow designer with inputs/outputs',
    iconName: 'Box',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
  },
  'agent-card': {
    id: 'agent-card',
    label: 'Agent Card',
    description: 'AI agent display card with avatar and capabilities',
    iconName: 'Users',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-950',
  },
  'panel-ui': {
    id: 'panel-ui',
    label: 'Panel UI',
    description: 'Multi-expert panel discussion interface',
    iconName: 'Layers',
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-950',
  },
  'visualization': {
    id: 'visualization',
    label: 'Visualization',
    description: 'Data visualization component (charts, graphs)',
    iconName: 'BarChart3',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-950',
  },
  'dashboard': {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Dashboard layout with multiple widgets',
    iconName: 'Layout',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100 dark:bg-indigo-950',
  },
  'form': {
    id: 'form',
    label: 'Form',
    description: 'Custom form component with validation',
    iconName: 'FormInput',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100 dark:bg-pink-950',
  },
  'table': {
    id: 'table',
    label: 'Data Table',
    description: 'Data table with filtering and sorting',
    iconName: 'Table',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100 dark:bg-cyan-950',
  },
};

/**
 * All available generation types in order
 */
const ALL_TYPES: V0GenerationType[] = [
  'workflow-node',
  'agent-card',
  'panel-ui',
  'visualization',
  'dashboard',
  'form',
  'table',
];

/**
 * VitalV0TypeSelector - Generation Type Selection
 * 
 * Allows users to select the type of component they want to generate.
 * Each type has an icon, label, and description shown in tooltip.
 * 
 * @example
 * ```tsx
 * <VitalV0TypeSelector
 *   selectedType="workflow-node"
 *   onTypeChange={setSelectedType}
 *   availableTypes={['workflow-node', 'agent-card', 'visualization']}
 * />
 * ```
 * 
 * @package @vital/ai-ui/v0
 */
export const VitalV0TypeSelector = memo(function VitalV0TypeSelector({
  selectedType,
  onTypeChange,
  availableTypes = ALL_TYPES,
  className,
}: VitalV0TypeSelectorProps) {
  // Filter to only available types
  const types = useMemo(
    () => ALL_TYPES.filter(t => availableTypes.includes(t)),
    [availableTypes]
  );

  return (
    <TooltipProvider>
      <div className={cn('flex flex-wrap gap-2', className)}>
        {types.map((type) => {
          const config = TYPE_CONFIGS[type];
          const Icon = TYPE_ICONS[type];
          const isSelected = selectedType === type;

          return (
            <Tooltip key={type}>
              <TooltipTrigger asChild>
                <Button
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onTypeChange(type)}
                  className={cn(
                    'gap-2 transition-all',
                    isSelected && 'shadow-md',
                    !isSelected && 'hover:border-primary/50'
                  )}
                >
                  <Icon className={cn(
                    'h-4 w-4',
                    isSelected ? 'text-primary-foreground' : config.color
                  )} />
                  <span className="hidden sm:inline">{config.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-medium">{config.label}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {config.description}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
});

/**
 * Get type configuration
 */
export function getV0TypeConfig(type: V0GenerationType) {
  return TYPE_CONFIGS[type];
}

/**
 * Get type icon
 */
export function getV0TypeIcon(type: V0GenerationType): LucideIcon {
  return TYPE_ICONS[type];
}

export default VitalV0TypeSelector;











