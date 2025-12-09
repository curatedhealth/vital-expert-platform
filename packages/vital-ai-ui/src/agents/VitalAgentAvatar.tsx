/**
 * VitalAgentAvatar - Agent Avatar Component
 * 
 * Displays agent avatars with level-based styling, glow effects,
 * and fallback initials. Supports VITAL avatar system.
 * 
 * @packageDocumentation
 */

'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { 
  getAgentLevelColor, 
  getVitalAvatarPath, 
  getSuperAgentAvatarPath 
} from './constants';
import type { AgentLevelNumber, VitalAgent } from './types';
import { getAgentLevelNumber } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface VitalAgentAvatarProps {
  /** The agent to display avatar for */
  agent: VitalAgent;
  
  /** Avatar size in pixels */
  size?: number;
  
  /** Size preset for common use cases */
  sizePreset?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Override level (otherwise computed from agent) */
  level?: AgentLevelNumber;
  
  /** Show level indicator dot */
  showLevelIndicator?: boolean;
  
  /** Show glow effect on hover */
  showGlow?: boolean;
  
  /** Enable hover animations */
  animated?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Click handler */
  onClick?: () => void;
}

// ============================================================================
// SIZE PRESETS
// ============================================================================

const SIZE_PRESETS = {
  xs: 32,
  sm: 40,
  md: 56,
  lg: 80,
  xl: 120,
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * VitalAgentAvatar displays an agent's avatar with level-based styling.
 * 
 * Features:
 * - Automatic VITAL avatar generation based on business function
 * - Super agent avatars for L1 (Master) level
 * - Level-based glow and ring colors
 * - Fallback to initials if image fails
 * - Optional level indicator dot
 * 
 * @example
 * ```tsx
 * <VitalAgentAvatar agent={agent} sizePreset="md" showLevelIndicator />
 * ```
 */
export const VitalAgentAvatar = React.forwardRef<HTMLDivElement, VitalAgentAvatarProps>(
  (
    {
      agent,
      size,
      sizePreset = 'md',
      level,
      showLevelIndicator = true,
      showGlow = true,
      animated = true,
      className,
      onClick,
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);
    
    // Compute level
    const agentLevel = level ?? getAgentLevelNumber(agent);
    const levelConfig = getAgentLevelColor(agentLevel);
    
    // Compute size
    const computedSize = size ?? SIZE_PRESETS[sizePreset];
    
    // Generate avatar source
    const avatarSrc = React.useMemo(() => {
      // Use provided avatar URL if available and no error
      if (agent.avatar_url && !imageError) {
        return agent.avatar_url;
      }
      
      const identifier = agent.id || agent.name;
      
      // For Master level (1), use super agent avatars
      if (agentLevel === 1) {
        return getSuperAgentAvatarPath(identifier);
      }
      
      // For all other levels, use VITAL avatars based on business function
      return getVitalAvatarPath(
        agentLevel, 
        agent.business_function || agent.function_name, 
        identifier
      );
    }, [agent.avatar_url, agent.id, agent.name, agent.business_function, agent.function_name, agentLevel, imageError]);
    
    // Generate initials for fallback
    const initials = React.useMemo(() => {
      const name = agent.display_name || agent.name;
      const words = name.split(/\s+/);
      if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }, [agent.name, agent.display_name]);
    
    // Compute indicator size based on avatar size
    const indicatorSize = Math.max(16, Math.round(computedSize * 0.25));
    
    return (
      <div
        ref={ref}
        className={cn(
          'relative group/avatar',
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
        style={{ width: computedSize, height: computedSize }}
      >
        {/* Glow effect */}
        {showGlow && (
          <div
            className={cn(
              'absolute inset-0 rounded-xl blur-xl transition-opacity duration-500',
              'opacity-0 group-hover/avatar:opacity-40',
              animated && 'group-hover/avatar:opacity-60'
            )}
            style={{ 
              background: levelConfig.gradient,
              transform: 'scale(1.2)',
            }}
            aria-hidden="true"
          />
        )}
        
        {/* Avatar container */}
        <div
          className={cn(
            'relative rounded-xl overflow-hidden',
            'ring-2 ring-offset-2 ring-offset-background',
            'shadow-lg transition-all duration-300',
            animated && 'group-hover/avatar:scale-105',
            levelConfig.tailwind.ring
          )}
          style={{
            width: computedSize,
            height: computedSize,
            boxShadow: showGlow ? `0 8px 24px ${levelConfig.shadowColor}` : undefined,
          }}
        >
          {/* Image or Fallback */}
          {!imageError && avatarSrc ? (
            <>
              {/* Loading placeholder */}
              {!imageLoaded && (
                <div 
                  className="absolute inset-0 bg-muted animate-pulse"
                  aria-hidden="true"
                />
              )}
              
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarSrc}
                alt={agent.avatar_description || `${agent.name} avatar`}
                className={cn(
                  'w-full h-full object-cover transition-opacity duration-300',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                loading="lazy"
              />
            </>
          ) : (
            // Initials fallback
            <div
              className="w-full h-full flex items-center justify-center font-bold"
              style={{
                background: levelConfig.gradient,
                color: levelConfig.contrast,
                fontSize: Math.max(12, computedSize * 0.35),
              }}
            >
              {initials}
            </div>
          )}
          
          {/* Shine effect on hover */}
          {animated && (
            <div 
              className={cn(
                'absolute inset-0 bg-gradient-to-br from-white/20 to-transparent',
                'opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300',
                'pointer-events-none'
              )}
              aria-hidden="true"
            />
          )}
        </div>
        
        {/* Level indicator dot */}
        {showLevelIndicator && (
          <div
            className={cn(
              'absolute flex items-center justify-center',
              'rounded-full font-bold shadow-lg',
              'border-2 border-background'
            )}
            style={{
              width: indicatorSize,
              height: indicatorSize,
              bottom: -indicatorSize * 0.2,
              right: -indicatorSize * 0.2,
              background: levelConfig.gradient,
              color: levelConfig.contrast,
              fontSize: Math.max(8, indicatorSize * 0.55),
            }}
            title={`Level ${agentLevel} - ${levelConfig.name}`}
          >
            {agentLevel}
          </div>
        )}
      </div>
    );
  }
);

VitalAgentAvatar.displayName = 'VitalAgentAvatar';

// ============================================================================
// AVATAR GROUP (for team displays)
// ============================================================================

export interface VitalAgentAvatarGroupProps {
  /** Array of agents */
  agents: VitalAgent[];
  
  /** Maximum avatars to show before "+N" */
  max?: number;
  
  /** Avatar size preset */
  sizePreset?: 'xs' | 'sm' | 'md';
  
  /** Overlap amount in pixels */
  overlap?: number;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Displays a group of agent avatars with overlap
 */
export function VitalAgentAvatarGroup({
  agents,
  max = 5,
  sizePreset = 'sm',
  overlap = 8,
  className,
}: VitalAgentAvatarGroupProps) {
  const visibleAgents = agents.slice(0, max);
  const remainingCount = agents.length - max;
  const size = SIZE_PRESETS[sizePreset];
  
  return (
    <div 
      className={cn('flex items-center', className)}
      style={{ marginLeft: overlap }}
    >
      {visibleAgents.map((agent, index) => (
        <div
          key={agent.id}
          style={{ 
            marginLeft: index === 0 ? 0 : -overlap,
            zIndex: visibleAgents.length - index,
          }}
        >
          <VitalAgentAvatar
            agent={agent}
            sizePreset={sizePreset}
            showLevelIndicator={false}
            showGlow={false}
            animated={false}
          />
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div
          className={cn(
            'flex items-center justify-center',
            'rounded-xl bg-muted border-2 border-background',
            'text-xs font-medium text-muted-foreground'
          )}
          style={{ 
            width: size, 
            height: size,
            marginLeft: -overlap,
            zIndex: 0,
          }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

export default VitalAgentAvatar;
