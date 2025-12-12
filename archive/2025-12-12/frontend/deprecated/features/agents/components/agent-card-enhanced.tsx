/**
 * Enhanced AgentCard Component v2.0
 * Premium card design with glassmorphism, gradients, and smooth animations
 * Uses VITAL avatars and icons
 *
 * @deprecated December 2025 - Use EnhancedAgentCard from @vital/ui instead
 *
 * Migration Guide:
 * - import { EnhancedAgentCard } from '@vital/ui';
 * - The @vital/ui version includes all premium features (animations, gradients, etc.)
 *
 * This file will be removed in a future release.
 * The canonical EnhancedAgentCard is in packages/ui/src/components/enhanced-agent-card.tsx
 */

'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Agent, AgentLevelNumber } from '../types/agent.types';
import {
  AGENT_LEVEL_COLORS,
  STATUS_COLORS,
  CARD_VARIANTS,
  type AgentLevel,
} from '../constants/design-tokens-enhanced';
import {
  Sparkles,
  Zap,
  Building2,
  Briefcase,
  MessageSquarePlus,
  Bookmark,
  Copy,
  Crown,
  Star,
  Shield,
  Wrench,
  Cog,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react';

// ============================================================================
// LEVEL ICONS MAPPING
// ============================================================================

const LEVEL_ICONS: Record<AgentLevel, React.ComponentType<{ className?: string }>> = {
  1: Crown,    // Master - Crown for power
  2: Star,     // Expert - Star for excellence
  3: Shield,   // Specialist - Shield for protection
  4: Wrench,   // Worker - Wrench for action
  5: Cog,      // Tool - Cog for utility
};

// ============================================================================
// TYPES
// ============================================================================

export type CardVariant = 'default' | 'compact' | 'detailed' | 'featured';

export interface AgentCardEnhancedProps {
  agent: Agent;
  variant?: CardVariant;
  onSelect?: (agent: Agent) => void;
  onDuplicate?: (agent: Agent) => void;
  onBookmark?: (agent: Agent) => void;
  onAddToChat?: (agent: Agent) => void;
  isBookmarked?: boolean;
  showActions?: boolean;
  featured?: boolean;
  className?: string;
  style?: React.CSSProperties;
  animationDelay?: number;
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.inactive;
  
  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
      config.bg,
      config.text,
      config.border,
      'border backdrop-blur-sm'
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', config.dot)} />
      {config.label}
    </div>
  );
};

// ============================================================================
// LEVEL BADGE COMPONENT - Enhanced
// ============================================================================

const LevelBadgeEnhanced: React.FC<{
  level: AgentLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ level, showLabel = false, size = 'md' }) => {
  const config = AGENT_LEVEL_COLORS[level];
  const Icon = LEVEL_ICONS[level];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };
  
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center rounded-lg font-semibold',
        'border backdrop-blur-sm transition-all duration-300',
        config.tailwind.bg,
        config.tailwind.text,
        config.tailwind.border,
        sizeClasses[size],
        'hover:scale-105 cursor-default'
      )}
      style={{
        boxShadow: `0 2px 8px ${config.shadowColor}`,
      }}
    >
      <Icon className={iconSizes[size]} />
      <span className="font-bold">L{level}</span>
      {showLabel && (
        <span className="font-medium opacity-90">{config.name}</span>
      )}
    </motion.div>
  );
};

// ============================================================================
// VITAL AVATAR SYSTEM - All agents use VITAL avatars
// ============================================================================

// Business function keyword mapping to avatar categories
const BUSINESS_FUNCTION_AVATAR_MAP: Record<string, string> = {
  // Analytics & Insights
  'analytics': 'analytics_insights',
  'analytics_insights': 'analytics_insights',
  'data_analytics': 'analytics_insights',
  'data_science': 'analytics_insights',
  'data': 'analytics_insights',
  'business_intelligence': 'analytics_insights',
  'bi': 'analytics_insights',
  'reporting': 'analytics_insights',
  'insights': 'analytics_insights',
  'intelligence': 'analytics_insights',
  'forecasting': 'analytics_insights',
  'prediction': 'analytics_insights',
  'modeling': 'analytics_insights',
  'statistics': 'analytics_insights',
  
  // Commercial & Marketing
  'commercial': 'commercial_marketing',
  'commercial_marketing': 'commercial_marketing',
  'marketing': 'commercial_marketing',
  'sales': 'commercial_marketing',
  'sales_marketing': 'commercial_marketing',
  'brand': 'commercial_marketing',
  'branding': 'commercial_marketing',
  'advertising': 'commercial_marketing',
  'promotion': 'commercial_marketing',
  'communications': 'commercial_marketing',
  'digital': 'commercial_marketing',
  'content': 'commercial_marketing',
  'campaign': 'commercial_marketing',
  'customer': 'commercial_marketing',
  'crm': 'commercial_marketing',
  
  // Market Access
  'market_access': 'market_access',
  'access': 'market_access',
  'pricing': 'market_access',
  'reimbursement': 'market_access',
  'health_economics': 'market_access',
  'heor': 'market_access',
  'payer': 'market_access',
  'hta': 'market_access',
  'value': 'market_access',
  'outcomes': 'market_access',
  'policy': 'market_access',
  'government': 'market_access',
  'tender': 'market_access',
  
  // Medical Affairs
  'medical': 'medical_affairs',
  'medical_affairs': 'medical_affairs',
  'clinical': 'medical_affairs',
  'clinical_operations': 'medical_affairs',
  'regulatory': 'medical_affairs',
  'pharmacovigilance': 'medical_affairs',
  'safety': 'medical_affairs',
  'compliance': 'medical_affairs',
  'legal': 'medical_affairs',
  'quality': 'medical_affairs',
  'affairs': 'medical_affairs',
  'science': 'medical_affairs',
  'msl': 'medical_affairs',
  'kol': 'medical_affairs',
  'trial': 'medical_affairs',
  'study': 'medical_affairs',
  
  // Product & Innovation
  'product': 'product_innovation',
  'product_innovation': 'product_innovation',
  'innovation': 'product_innovation',
  'r_and_d': 'product_innovation',
  'r&d': 'product_innovation',
  'research': 'product_innovation',
  'development': 'product_innovation',
  'engineering': 'product_innovation',
  'technology': 'product_innovation',
  'tech': 'product_innovation',
  'design': 'product_innovation',
  'strategy': 'product_innovation',
  'portfolio': 'product_innovation',
  'pipeline': 'product_innovation',
  'discovery': 'product_innovation',
};

// Super Agent avatars for Master level agents (Level 1)
const SUPER_AGENT_AVATARS = [
  '/assets/vital/super_agents/super_orchestrator.svg',
  '/assets/vital/super_agents/super_reasoner.svg',
  '/assets/vital/super_agents/super_synthesizer.svg',
  '/assets/vital/super_agents/super_architect.svg',
  '/assets/vital/super_agents/super_critic.svg',
];

// Level to prefix mapping for avatar files
const LEVEL_AVATAR_PREFIX: Record<number, string> = {
  1: 'expert',    // Master agents use expert style
  2: 'expert',    // Expert
  3: 'foresight', // Specialist
  4: 'pharma',    // Worker
  5: 'startup',   // Tool
};

// Get a consistent hash for deterministic avatar selection
const getAvatarHash = (identifier: string): number => {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = ((hash << 5) - hash) + identifier.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// Get a consistent super agent avatar based on agent name/id
const getSuperAgentAvatar = (identifier: string): string => {
  const index = getAvatarHash(identifier) % SUPER_AGENT_AVATARS.length;
  return SUPER_AGENT_AVATARS[index];
};

// Match business function to avatar category
const matchBusinessFunctionCategory = (businessFunction: string | undefined | null): string => {
  if (!businessFunction) return 'analytics_insights';
  
  const normalized = businessFunction.toLowerCase().replace(/[\s-]+/g, '_');
  
  // Direct match
  if (BUSINESS_FUNCTION_AVATAR_MAP[normalized]) {
    return BUSINESS_FUNCTION_AVATAR_MAP[normalized];
  }
  
  // Partial match
  for (const [keyword, category] of Object.entries(BUSINESS_FUNCTION_AVATAR_MAP)) {
    if (normalized.includes(keyword) || keyword.includes(normalized)) {
      return category;
    }
  }
  
  // Word-by-word matching
  const words = normalized.split('_');
  for (const word of words) {
    if (word.length >= 3 && BUSINESS_FUNCTION_AVATAR_MAP[word]) {
      return BUSINESS_FUNCTION_AVATAR_MAP[word];
    }
  }
  
  return 'analytics_insights';
};

// Get VITAL avatar path for any agent
const getVitalAvatar = (
  level: number | undefined,
  businessFunction: string | undefined | null,
  identifier: string
): string => {
  const prefix = level ? (LEVEL_AVATAR_PREFIX[level] || 'expert') : 'expert';
  const category = matchBusinessFunctionCategory(businessFunction);
  const avatarNumber = (getAvatarHash(identifier) % 20) + 1;
  const paddedNumber = avatarNumber.toString().padStart(2, '0');
  
  return `/assets/vital/avatars/vital_avatar_${prefix}_${category}_${paddedNumber}.svg`;
};

// ============================================================================
// AVATAR COMPONENT - Enhanced with VITAL Avatars
// ============================================================================

const AgentAvatar: React.FC<{
  agent: Agent;
  size: number;
  level?: AgentLevel;
}> = ({ agent, size, level }) => {
  const levelConfig = level ? AGENT_LEVEL_COLORS[level] : null;
  const [imageError, setImageError] = React.useState(false);
  const identifier = agent.id || agent.name;
  
  // ALWAYS use VITAL avatars for all agents
  const avatarSrc = React.useMemo(() => {
    // For Master level (1), ALWAYS use super agent avatars with hash-based selection
    if (level === 1) {
      return getSuperAgentAvatar(identifier);
    }
    
    // ALL other agents: Use VITAL avatars based on business function
    return getVitalAvatar(level, agent.business_function || agent.function_name, identifier);
  }, [agent.business_function, agent.function_name, level, identifier]);
  
  return (
    <div className="relative group/avatar">
      {/* Glow effect */}
      {levelConfig && (
        <div
          className="absolute inset-0 rounded-xl blur-xl opacity-40 group-hover/avatar:opacity-60 transition-opacity duration-500"
          style={{ background: levelConfig.gradient }}
        />
      )}
      
      {/* Avatar container */}
      <motion.div
        whileHover={{ scale: 1.05, rotate: 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={cn(
          'relative rounded-xl overflow-hidden',
          'ring-2 ring-offset-2 ring-offset-background',
          'shadow-lg transition-shadow duration-300'
        )}
        style={{
          width: size,
          height: size,
          // Use CSS custom property for ring color (Tailwind ring-offset doesn't accept inline styles)
          '--tw-ring-color': levelConfig?.base || 'transparent',
          boxShadow: levelConfig ? `0 8px 24px ${levelConfig.shadowColor}` : undefined,
        } as React.CSSProperties}
      >
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt={agent.avatar_description || agent.name}
            fill
            className="object-cover"
            sizes={`${size}px`}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-2xl font-bold"
            style={{
              background: levelConfig?.gradient || 'linear-gradient(135deg, #6B7280, #4B5563)',
              color: levelConfig?.contrast || '#FFFFFF',
            }}
          >
            {agent.name.substring(0, 2).toUpperCase()}
          </div>
        )}
        
        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300" />
      </motion.div>
      
      {/* Level indicator dot */}
      {level && (
        <div
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg"
          style={{
            background: levelConfig?.gradient,
            color: levelConfig?.contrast,
          }}
        >
          {level}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ACTION BUTTONS COMPONENT
// ============================================================================

const ActionButtons: React.FC<{
  agent: Agent;
  onDuplicate?: (agent: Agent) => void;
  onBookmark?: (agent: Agent) => void;
  onAddToChat?: (agent: Agent) => void;
  isBookmarked?: boolean;
}> = ({ agent, onDuplicate, onBookmark, onAddToChat, isBookmarked }) => {
  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1"
      >
        {onAddToChat && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 w-8 p-0 rounded-lg',
                  'bg-primary/10 hover:bg-primary/20 text-primary',
                  'transition-all duration-200'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToChat(agent);
                }}
              >
                <MessageSquarePlus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Add to Chat</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {onBookmark && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 w-8 p-0 rounded-lg transition-all duration-200',
                  isBookmarked
                    ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark(agent);
                }}
              >
                <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-current')} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{isBookmarked ? 'Remove Bookmark' : 'Bookmark'}</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {onDuplicate && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(agent);
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Duplicate</p>
            </TooltipContent>
          </Tooltip>
        )}
      </motion.div>
    </TooltipProvider>
  );
};

// ============================================================================
// MAIN CARD COMPONENT
// ============================================================================

export const AgentCardEnhanced = React.forwardRef<HTMLDivElement, AgentCardEnhancedProps>(
  (
    {
      agent,
      variant = 'default',
      onSelect,
      onDuplicate,
      onBookmark,
      onAddToChat,
      isBookmarked = false,
      showActions = true,
      featured = false,
      className,
      style,
      animationDelay = 0,
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);
    
    // Get level config - check multiple possible sources for the level
    // Priority: tier (from store), agent_levels?.level_number (from DB join), default to 2
    const agentLevel = (
      agent.tier !== undefined ? agent.tier :
      (agent as any).agent_levels?.level_number !== undefined ? (agent as any).agent_levels.level_number :
      2 // Default to L2 Expert
    ) as AgentLevel;
    const levelConfig = agentLevel ? AGENT_LEVEL_COLORS[agentLevel] : null;
    const variantConfig = CARD_VARIANTS[variant];
    
    // Handle click
    const handleClick = () => {
      if (onSelect) {
        onSelect(agent);
      }
    };
    
    // Handle keyboard
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && onSelect) {
        e.preventDefault();
        onSelect(agent);
      }
    };
    
    return (
      <motion.article
        ref={ref}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.4,
          delay: animationDelay,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        whileHover={{ y: -4 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`${agent.name} - ${levelConfig?.name || 'Agent'} level agent`}
        className={cn(
          'group relative cursor-pointer outline-none',
          'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          className
        )}
        style={{
          height: variantConfig.height,
          ...style,
        }}
      >
        {/* Background with gradient border */}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl transition-opacity duration-500',
            'opacity-0 group-hover:opacity-100'
          )}
          style={{
            background: levelConfig?.gradient,
            padding: '2px',
          }}
        >
          <div className="w-full h-full rounded-2xl bg-background" />
        </div>
        
        {/* Main card */}
        <div
          className={cn(
            'relative h-full rounded-2xl overflow-hidden',
            'bg-card border border-border/50',
            'transition-all duration-500',
            'group-hover:border-transparent',
            'group-hover:shadow-xl'
          )}
          style={{
            boxShadow: isHovered && levelConfig
              ? `0 20px 40px ${levelConfig.shadowColor}`
              : '0 4px 12px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Background pattern */}
          {levelConfig && (
            <div
              className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500"
              style={{ background: levelConfig.bgPattern }}
            />
          )}
          
          {/* Featured badge */}
          {featured && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-3 right-3 z-10"
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-semibold shadow-lg">
                <Sparkles className="w-3 h-3" />
                Featured
              </div>
            </motion.div>
          )}
          
          {/* Content */}
          <div className={cn('relative h-full flex flex-col', `p-[${variantConfig.padding}]`)} style={{ padding: variantConfig.padding }}>
            {/* Header: Avatar + Info */}
            <div className="flex gap-4">
              {/* Avatar */}
              <AgentAvatar
                agent={agent}
                size={variantConfig.avatarSize}
                level={agentLevel}
              />
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                {/* Level Badge */}
                {agentLevel && (
                  <div className="mb-2">
                    <LevelBadgeEnhanced
                      level={agentLevel}
                      showLabel={variant !== 'compact'}
                      size={variant === 'compact' ? 'sm' : 'md'}
                    />
                  </div>
                )}
                
                {/* Name */}
                <h3
                  className={cn(
                    'font-bold leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-300',
                    variantConfig.titleSize
                  )}
                  title={agent.name}
                >
                  {agent.display_name || agent.name}
                </h3>
                
                {/* Tagline */}
                {agent.tagline && variant !== 'compact' && (
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                    {agent.tagline}
                  </p>
                )}
              </div>
              
              {/* Status Badge */}
              <div className="flex-shrink-0">
                <StatusBadge status={agent.status || 'development'} />
              </div>
            </div>
            
            {/* Description */}
            <div className="flex-1 mt-3">
              <p
                className={cn(
                  'text-sm text-muted-foreground leading-relaxed',
                  `line-clamp-${variantConfig.descriptionLines}`
                )}
                title={agent.description}
              >
                {agent.description}
              </p>
            </div>
            
            {/* Footer: Metadata + Actions */}
            <div className="mt-auto pt-3 flex items-end justify-between">
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {agent.function_name && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[120px]">{agent.function_name}</span>
                  </div>
                )}
                {agent.department_name && (
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[120px]">{agent.department_name}</span>
                  </div>
                )}
                {agentLevel && agentLevel <= 3 && (
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Can spawn</span>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              {showActions && (
                <AnimatePresence>
                  {isHovered && (
                    <ActionButtons
                      agent={agent}
                      onDuplicate={onDuplicate}
                      onBookmark={onBookmark}
                      onAddToChat={onAddToChat}
                      isBookmarked={isBookmarked}
                    />
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
          
          {/* Hover shine effect */}
          <div
            className={cn(
              'absolute inset-0 pointer-events-none',
              'bg-gradient-to-br from-white/5 via-transparent to-transparent',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-500'
            )}
          />
        </div>
      </motion.article>
    );
  }
);

AgentCardEnhanced.displayName = 'AgentCardEnhanced';

// ============================================================================
// SKELETON LOADER
// ============================================================================

export const AgentCardSkeleton: React.FC<{
  variant?: CardVariant;
}> = ({ variant = 'default' }) => {
  const config = CARD_VARIANTS[variant];
  
  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-card border border-border/50"
      style={{ height: config.height }}
    >
      <div className="h-full flex flex-col animate-pulse" style={{ padding: config.padding }}>
        {/* Header */}
        <div className="flex gap-4">
          {/* Avatar skeleton */}
          <div
            className="rounded-xl bg-muted"
            style={{ width: config.avatarSize, height: config.avatarSize }}
          />
          
          {/* Info skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-5 w-16 bg-muted rounded-lg" />
            <div className="h-6 w-3/4 bg-muted rounded" />
            <div className="h-4 w-1/2 bg-muted rounded" />
          </div>
        </div>
        
        {/* Description skeleton */}
        <div className="flex-1 mt-4 space-y-2">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
          <div className="h-4 w-4/6 bg-muted rounded" />
        </div>
        
        {/* Footer skeleton */}
        <div className="mt-auto pt-3 flex justify-between">
          <div className="flex gap-3">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
        </div>
      </div>
      
      {/* Shimmer effect */}
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        }}
      />
    </div>
  );
};

AgentCardSkeleton.displayName = 'AgentCardSkeleton';

// ============================================================================
// EXPORTS
// ============================================================================

export default AgentCardEnhanced;

