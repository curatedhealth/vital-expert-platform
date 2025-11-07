// ============================================================================
// Modern Agent Icon Component Library
// ============================================================================
// Copy this entire file to: components/agents/AgentIcon.tsx
// ============================================================================

import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ============================================================================
// Type Definitions
// ============================================================================

export interface Agent {
  id: string;
  name: string;
  title?: string;
  description?: string;
  agent_category: string;
  category_color?: string;
  metadata?: {
    lucide_icon?: string;
    [key: string]: any;
  };
}

export interface AgentIconConfig {
  icon: LucideIcon;
  categoryColor: string;
  categoryLabel: string;
}

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconVariant = 'default' | 'outlined' | 'filled' | 'minimal';

interface AgentIconProps {
  agent: Agent;
  size?: IconSize;
  variant?: IconVariant;
  className?: string;
  showLabel?: boolean;
  onClick?: () => void;
}

// ============================================================================
// Icon Size Configuration
// ============================================================================

const ICON_SIZES = {
  xs: { icon: 16, container: 32, stroke: 1.5 },
  sm: { icon: 18, container: 40, stroke: 1.5 },
  md: { icon: 20, container: 48, stroke: 1.5 },
  lg: { icon: 24, container: 56, stroke: 1.5 },
  xl: { icon: 28, container: 64, stroke: 1.5 },
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

function getAgentIcon(agent: Agent): AgentIconConfig {
  const iconName = agent.metadata?.lucide_icon || getCategoryIcon(agent.agent_category);
  
  // Convert kebab-case to PascalCase (e.g., "bar-chart-2" → "BarChart2")
  const pascalIconName = iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  const icon = (LucideIcons as any)[pascalIconName] || LucideIcons.Bot;
  
  return {
    icon,
    categoryColor: agent.category_color || '#64748B',
    categoryLabel: agent.agent_category?.replace(/_/g, ' ') || 'Agent',
  };
}

function getCategoryIcon(category?: string): string {
  const categoryMap: Record<string, string> = {
    'deep_agent': 'target',
    'universal_task_subagent': 'workflow',
    'multi_expert_orchestration': 'users',
    'specialized_knowledge': 'book-open',
    'process_automation': 'settings',
    'autonomous_problem_solving': 'brain',
  };
  return categoryMap[category || ''] || 'bot';
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================================================
// Main Component
// ============================================================================

export function AgentIcon({
  agent,
  size = 'md',
  variant = 'default',
  className = '',
  showLabel = false,
  onClick,
}: AgentIconProps) {
  const { icon: IconComponent, categoryColor, categoryLabel } = getAgentIcon(agent);
  const sizeConfig = ICON_SIZES[size];

  const containerStyle = React.useMemo(() => {
    const baseStyle = {
      width: `${sizeConfig.container}px`,
      height: `${sizeConfig.container}px`,
    };

    switch (variant) {
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: categoryColor,
          borderWidth: '0',
        };
      
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: '1.5px',
          borderStyle: 'solid',
          borderColor: hexToRgba(categoryColor, 0.4),
        };
      
      case 'minimal':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: '0',
        };
      
      default: // 'default'
        return {
          ...baseStyle,
          backgroundColor: hexToRgba(categoryColor, 0.08),
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: hexToRgba(categoryColor, 0.2),
        };
    }
  }, [variant, categoryColor, sizeConfig]);

  const iconColor = variant === 'filled' ? '#FFFFFF' : categoryColor;

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <div
        className={`
          flex items-center justify-center rounded-lg
          transition-all duration-200 ease-in-out
          ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
        `}
        style={containerStyle}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
        aria-label={agent.title || agent.name}
      >
        <IconComponent
          size={sizeConfig.icon}
          strokeWidth={sizeConfig.stroke}
          style={{ color: iconColor }}
          aria-hidden="true"
        />
      </div>

      {showLabel && (
        <span
          className="text-xs font-medium text-slate-600 dark:text-slate-400 text-center"
          style={{ maxWidth: `${sizeConfig.container * 1.5}px` }}
        >
          {categoryLabel}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// Variant Components
// ============================================================================

export function AgentIconDefault(props: Omit<AgentIconProps, 'variant'>) {
  return <AgentIcon {...props} variant="default" />;
}

export function AgentIconOutlined(props: Omit<AgentIconProps, 'variant'>) {
  return <AgentIcon {...props} variant="outlined" />;
}

export function AgentIconFilled(props: Omit<AgentIconProps, 'variant'>) {
  return <AgentIcon {...props} variant="filled" />;
}

export function AgentIconMinimal(props: Omit<AgentIconProps, 'variant'>) {
  return <AgentIcon {...props} variant="minimal" />;
}

// ============================================================================
// Icon Grid Component (for displaying multiple icons)
// ============================================================================

interface AgentIconGridProps {
  agents: Agent[];
  size?: IconSize;
  variant?: IconVariant;
  showLabels?: boolean;
  onIconClick?: (agent: Agent) => void;
}

export function AgentIconGrid({
  agents,
  size = 'md',
  variant = 'default',
  showLabels = false,
  onIconClick,
}: AgentIconGridProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
      {agents.map((agent) => (
        <AgentIcon
          key={agent.id}
          agent={agent}
          size={size}
          variant={variant}
          showLabel={showLabels}
          onClick={() => onIconClick?.(agent)}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Usage Examples (Remove in production)
// ============================================================================

/*

// Example 1: Simple icon
<AgentIcon agent={agent} size="md" />

// Example 2: Outlined variant with label
<AgentIcon agent={agent} size="lg" variant="outlined" showLabel />

// Example 3: Filled variant with click handler
<AgentIcon 
  agent={agent} 
  size="xl" 
  variant="filled"
  onClick={() => console.log('Icon clicked!')}
/>

// Example 4: Icon grid
<AgentIconGrid 
  agents={agents}
  size="md"
  variant="default"
  showLabels={true}
  onIconClick={(agent) => navigate(`/agent/${agent.id}`)}
/>

// Example 5: Custom className
<AgentIcon 
  agent={agent} 
  size="md"
  className="shadow-lg"
/>

*/

