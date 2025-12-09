'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Target,
  Lightbulb,
  Sparkles,
  Heart,
  Shield,
  AlertTriangle,
  Users,
  FlaskConical,
  Briefcase,
  Code,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Personality Type following Agent OS Architecture
 * Defines behavioral configuration (NOT named personas)
 * 
 * Reference: AGENT_SCHEMA_SPEC.md Section 0.2
 */
export type PersonalitySlug =
  | 'analytical'
  | 'strategic'
  | 'creative'
  | 'innovator'
  | 'empathetic'
  | 'pragmatic'
  | 'cautious'
  | 'collaborative'
  | 'scientific'
  | 'executive'
  | 'technical'
  | 'educational';

interface PersonalityConfig {
  icon: LucideIcon;
  label: string;
  description: string;
  temperature: number;
  color: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  traits: string[];
}

const personalityConfigs: Record<PersonalitySlug, PersonalityConfig> = {
  analytical: {
    icon: Brain,
    label: 'Analytical',
    description: 'Data-driven, methodical, precise',
    temperature: 0.2,
    color: 'text-indigo-700 dark:text-indigo-300',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/50',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    traits: ['Evidence-based', 'Structured', 'Logical'],
  },
  strategic: {
    icon: Target,
    label: 'Strategic',
    description: 'Long-term thinking, goal-oriented',
    temperature: 0.3,
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-900/50',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    traits: ['Visionary', 'Goal-focused', 'Prioritizing'],
  },
  creative: {
    icon: Lightbulb,
    label: 'Creative',
    description: 'Innovative approaches, novel solutions',
    temperature: 0.7,
    color: 'text-yellow-700 dark:text-yellow-300',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    traits: ['Imaginative', 'Open-minded', 'Inventive'],
  },
  innovator: {
    icon: Sparkles,
    label: 'Innovator',
    description: 'Disruptive thinking, breakthrough ideas',
    temperature: 0.8,
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-100 dark:bg-purple-900/50',
    borderColor: 'border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-600 dark:text-purple-400',
    traits: ['Pioneering', 'Risk-taking', 'Visionary'],
  },
  empathetic: {
    icon: Heart,
    label: 'Empathetic',
    description: 'Patient-centered, relationship-focused',
    temperature: 0.5,
    color: 'text-pink-700 dark:text-pink-300',
    bgColor: 'bg-pink-100 dark:bg-pink-900/50',
    borderColor: 'border-pink-200 dark:border-pink-800',
    iconColor: 'text-pink-600 dark:text-pink-400',
    traits: ['Compassionate', 'Understanding', 'Supportive'],
  },
  pragmatic: {
    icon: Shield,
    label: 'Pragmatic',
    description: 'Practical, solution-oriented, realistic',
    temperature: 0.3,
    color: 'text-slate-700 dark:text-slate-300',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    borderColor: 'border-slate-200 dark:border-slate-700',
    iconColor: 'text-slate-600 dark:text-slate-400',
    traits: ['Realistic', 'Efficient', 'Action-oriented'],
  },
  cautious: {
    icon: AlertTriangle,
    label: 'Cautious',
    description: 'Risk-aware, thorough, conservative',
    temperature: 0.1,
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-100 dark:bg-amber-900/50',
    borderColor: 'border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-600 dark:text-amber-400',
    traits: ['Risk-aware', 'Meticulous', 'Conservative'],
  },
  collaborative: {
    icon: Users,
    label: 'Collaborative',
    description: 'Team-oriented, consensus-building',
    temperature: 0.4,
    color: 'text-teal-700 dark:text-teal-300',
    bgColor: 'bg-teal-100 dark:bg-teal-900/50',
    borderColor: 'border-teal-200 dark:border-teal-800',
    iconColor: 'text-teal-600 dark:text-teal-400',
    traits: ['Team player', 'Inclusive', 'Diplomatic'],
  },
  scientific: {
    icon: FlaskConical,
    label: 'Scientific',
    description: 'Research-focused, hypothesis-driven',
    temperature: 0.2,
    color: 'text-cyan-700 dark:text-cyan-300',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/50',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    traits: ['Evidence-based', 'Systematic', 'Rigorous'],
  },
  executive: {
    icon: Briefcase,
    label: 'Executive',
    description: 'Decisive, results-driven, leadership',
    temperature: 0.4,
    color: 'text-gray-700 dark:text-gray-300',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    borderColor: 'border-gray-200 dark:border-gray-700',
    iconColor: 'text-gray-600 dark:text-gray-400',
    traits: ['Decisive', 'Results-driven', 'Leadership'],
  },
  technical: {
    icon: Code,
    label: 'Technical',
    description: 'Detail-oriented, specification-focused',
    temperature: 0.2,
    color: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/50',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    traits: ['Precise', 'Specification-driven', 'Systematic'],
  },
  educational: {
    icon: GraduationCap,
    label: 'Educational',
    description: 'Teaching-oriented, clear explanations',
    temperature: 0.5,
    color: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-100 dark:bg-orange-900/50',
    borderColor: 'border-orange-200 dark:border-orange-800',
    iconColor: 'text-orange-600 dark:text-orange-400',
    traits: ['Clear', 'Patient', 'Illustrative'],
  },
};

interface VitalPersonalityBadgeProps {
  personality: PersonalitySlug | string;
  variant?: 'default' | 'compact' | 'detailed' | 'icon-only';
  showTooltip?: boolean;
  showIcon?: boolean;
  showTemperature?: boolean;
  className?: string;
}

/**
 * VitalPersonalityBadge - Displays agent personality type
 * 
 * Personality types define behavioral configuration:
 * - Temperature (creativity vs consistency)
 * - Response style and tone
 * - Reasoning approach
 * 
 * Reference: AGENT_SCHEMA_SPEC.md Section 0.2
 */
export function VitalPersonalityBadge({
  personality,
  variant = 'default',
  showTooltip = true,
  showIcon = true,
  showTemperature = false,
  className,
}: VitalPersonalityBadgeProps) {
  // Handle unknown personality types gracefully
  const slug = personality.toLowerCase() as PersonalitySlug;
  const config = personalityConfigs[slug] || {
    icon: Brain,
    label: personality,
    description: 'Custom personality type',
    temperature: 0.3,
    color: 'text-gray-700 dark:text-gray-300',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    borderColor: 'border-gray-200 dark:border-gray-700',
    iconColor: 'text-gray-600 dark:text-gray-400',
    traits: [],
  };

  const Icon = config.icon;

  const badgeContent = (
    <Badge
      variant="outline"
      className={cn(
        config.bgColor,
        config.borderColor,
        config.color,
        'font-medium transition-colors',
        variant === 'compact' && 'text-xs px-1.5 py-0',
        variant === 'detailed' && 'text-sm px-3 py-1',
        variant === 'icon-only' && 'p-1',
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            config.iconColor,
            variant === 'compact' ? 'h-3 w-3' : 'h-4 w-4',
            variant !== 'icon-only' && 'mr-1'
          )}
        />
      )}
      {variant !== 'icon-only' && (
        <>
          {config.label}
          {showTemperature && (
            <span className="ml-1 opacity-70 text-xs">
              T:{config.temperature}
            </span>
          )}
        </>
      )}
    </Badge>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon className={cn('h-4 w-4', config.iconColor)} />
            <span className="font-semibold">{config.label}</span>
          </div>
          <p className="text-xs text-muted-foreground">{config.description}</p>
          
          {config.traits.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {config.traits.map((trait) => (
                <span
                  key={trait}
                  className="text-xs px-1.5 py-0.5 rounded bg-muted"
                >
                  {trait}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-2 pt-1 border-t text-xs">
            <span className="text-muted-foreground">Temperature:</span>
            <span className="font-medium">{config.temperature}</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full', config.bgColor)}
                style={{ width: `${config.temperature * 100}%` }}
              />
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Helper to get personality configuration
 */
export function getPersonalityConfig(
  personality: PersonalitySlug
): PersonalityConfig {
  return personalityConfigs[personality];
}

/**
 * Helper to get personality icon component
 */
export function getPersonalityIcon(personality: PersonalitySlug): LucideIcon {
  return personalityConfigs[personality]?.icon || Brain;
}

/**
 * Get all available personality types
 */
export function getAllPersonalityTypes(): PersonalitySlug[] {
  return Object.keys(personalityConfigs) as PersonalitySlug[];
}

export default VitalPersonalityBadge;
