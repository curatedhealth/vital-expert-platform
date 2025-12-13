'use client';

import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Zap,
  Search,
  Clock,
  Users,
  Workflow,
  Sparkles,
  Boxes,
  type LucideIcon,
} from 'lucide-react';

/**
 * Mode Chip Component
 *
 * Service mode indicators with innovation-focused language.
 * Based on VITALexpert One-Pager service layers.
 */

export type ServiceMode =
  | 'ask-me'
  | 'interactive'
  | 'auto-select'
  | 'deep-research'
  | 'background'
  | 'panel'
  | 'workflow'
  | 'solutions';

export type ModeChipVariant = 'default' | 'compact' | 'minimal';

interface ModeChipProps {
  mode: ServiceMode;
  variant?: ModeChipVariant;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

interface ModeConfig {
  icon: LucideIcon;
  label: string;
  shortLabel: string;
  description: string;
  timing?: string;
  colorClass: string;
  activeColorClass: string;
}

const MODE_CONFIG: Record<ServiceMode, ModeConfig> = {
  'ask-me': {
    icon: Sparkles,
    label: 'Quick Ask',
    shortLabel: 'Quick',
    description: 'Fast, simple queries',
    timing: 'Instant',
    colorClass: 'text-stone-600 bg-stone-100 border-stone-200',
    activeColorClass: 'text-stone-700 bg-stone-200 border-stone-300',
  },
  interactive: {
    icon: MessageSquare,
    label: 'Interactive',
    shortLabel: 'Chat',
    description: 'Real-time dialogue with experts',
    timing: '<3 seconds',
    colorClass: 'text-violet-600 bg-violet-50 border-violet-200',
    activeColorClass: 'text-violet-700 bg-violet-100 border-violet-300',
  },
  'auto-select': {
    icon: Zap,
    label: 'Auto-Select',
    shortLabel: 'Auto',
    description: 'AI chooses optimal expert',
    timing: '<3 seconds',
    colorClass: 'text-amber-600 bg-amber-50 border-amber-200',
    activeColorClass: 'text-amber-700 bg-amber-100 border-amber-300',
  },
  'deep-research': {
    icon: Search,
    label: 'Deep Research',
    shortLabel: 'Research',
    description: 'Comprehensive multi-source analysis',
    timing: '10-30 seconds',
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    activeColorClass: 'text-emerald-700 bg-emerald-100 border-emerald-300',
  },
  background: {
    icon: Clock,
    label: 'Background',
    shortLabel: 'Async',
    description: 'Async processing for complex tasks',
    timing: 'Minutes',
    colorClass: 'text-blue-600 bg-blue-50 border-blue-200',
    activeColorClass: 'text-blue-700 bg-blue-100 border-blue-300',
  },
  panel: {
    icon: Users,
    label: 'Expert Panel',
    shortLabel: 'Panel',
    description: 'Multi-agent deliberation',
    timing: '10-30 seconds',
    colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    activeColorClass: 'text-indigo-700 bg-indigo-100 border-indigo-300',
  },
  workflow: {
    icon: Workflow,
    label: 'Workflow',
    shortLabel: 'Flow',
    description: 'Multi-step with checkpoints',
    timing: 'Minutes to hours',
    colorClass: 'text-pink-600 bg-pink-50 border-pink-200',
    activeColorClass: 'text-pink-700 bg-pink-100 border-pink-300',
  },
  solutions: {
    icon: Boxes,
    label: 'Solutions Builder',
    shortLabel: 'Build',
    description: 'End-to-end orchestration',
    timing: 'Hours to days',
    colorClass: 'text-teal-600 bg-teal-50 border-teal-200',
    activeColorClass: 'text-teal-700 bg-teal-100 border-teal-300',
  },
};

export function ModeChip({
  mode,
  variant = 'default',
  active = false,
  onClick,
  className,
}: ModeChipProps) {
  const config = MODE_CONFIG[mode];
  const Icon = config.icon;

  const isClickable = !!onClick;

  // Minimal variant - just icon
  if (variant === 'minimal') {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!isClickable}
        className={cn(
          'inline-flex items-center justify-center p-1.5 rounded-md transition-colors',
          active ? config.activeColorClass : config.colorClass,
          isClickable && 'cursor-pointer hover:opacity-80',
          !isClickable && 'cursor-default',
          className
        )}
        title={config.label}
      >
        <Icon size={16} />
      </button>
    );
  }

  // Size classes
  const sizeClasses = {
    default: 'px-3 py-1.5 text-sm gap-1.5',
    compact: 'px-2 py-1 text-xs gap-1',
  };

  const iconSize = variant === 'compact' ? 14 : 16;
  const label = variant === 'compact' ? config.shortLabel : config.label;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      className={cn(
        'inline-flex items-center rounded-full border font-medium transition-all',
        sizeClasses[variant],
        active ? config.activeColorClass : config.colorClass,
        active && 'ring-2 ring-offset-1 ring-current/20',
        isClickable && 'cursor-pointer hover:opacity-90',
        !isClickable && 'cursor-default',
        className
      )}
    >
      <Icon size={iconSize} />
      <span>{label}</span>
    </button>
  );
}

// Mode selector component for choosing between modes
interface ModeSelectorProps {
  modes: ServiceMode[];
  selectedMode: ServiceMode;
  onModeChange: (mode: ServiceMode) => void;
  variant?: ModeChipVariant;
  className?: string;
}

export function ModeSelector({
  modes,
  selectedMode,
  onModeChange,
  variant = 'default',
  className,
}: ModeSelectorProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {modes.map((mode) => (
        <ModeChip
          key={mode}
          mode={mode}
          variant={variant}
          active={mode === selectedMode}
          onClick={() => onModeChange(mode)}
        />
      ))}
    </div>
  );
}

// Helper to get mode config
export function getModeConfig(mode: ServiceMode): ModeConfig {
  return MODE_CONFIG[mode];
}

// Get all available modes
export function getAvailableModes(): ServiceMode[] {
  return Object.keys(MODE_CONFIG) as ServiceMode[];
}

// Ask Expert specific modes (Modes 1-4)
export const ASK_EXPERT_MODES: ServiceMode[] = [
  'interactive',
  'auto-select',
  'deep-research',
  'background',
];

// Service layer modes (from One-Pager)
export const SERVICE_LAYER_MODES: ServiceMode[] = [
  'interactive',
  'panel',
  'workflow',
  'solutions',
];

export default ModeChip;
