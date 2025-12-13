/**
 * VITAL AI UI - Agent Component Design Tokens & Constants
 * 
 * Unified design system for agent cards with:
 * - Level-based color schemes with gradients
 * - Status indicators
 * - Card variant configurations
 * - Animation presets
 * - Avatar system configuration
 * 
 * @packageDocumentation
 */

import { 
  Crown, 
  Star, 
  Shield, 
  Wrench, 
  Cog,
  type LucideIcon 
} from 'lucide-react';
import type { AgentLevelNumber, AgentCardVariant, AgentStatus, AgentAvailability } from './types';

// ============================================================================
// AGENT LEVEL COLORS & CONFIGURATION
// ============================================================================

/**
 * Level icon mapping
 */
export const LEVEL_ICONS: Record<AgentLevelNumber, LucideIcon> = {
  1: Crown,   // Master - Crown for power/authority
  2: Star,    // Expert - Star for excellence
  3: Shield,  // Specialist - Shield for protection/focus
  4: Wrench,  // Worker - Wrench for action/execution
  5: Cog,     // Tool - Cog for utility/integration
} as const;

/**
 * Comprehensive color configuration for each agent level.
 * Includes colors, gradients, shadows, and Tailwind class names.
 */
export const AGENT_LEVEL_COLORS = {
  1: {
    name: 'Master',
    label: 'Orchestrator',
    base: '#8B5CF6',
    light: '#A78BFA',
    dark: '#7C3AED',
    ultraLight: '#EDE9FE',
    contrast: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #D946EF 100%)',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    shadowColor: 'rgba(139, 92, 246, 0.25)',
    bgPattern: 'radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
    description: 'Strategic orchestrators that coordinate complex multi-agent workflows',
    tailwind: {
      bg: 'bg-gradient-to-br from-purple-500 via-purple-600 to-fuchsia-600',
      bgSoft: 'bg-purple-500/10',
      text: 'text-white',
      textSoft: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-400/30',
      borderSolid: 'border-purple-500',
      ring: 'ring-purple-500/30',
      glow: 'shadow-[0_0_30px_rgba(139,92,246,0.3)]',
    },
  },
  2: {
    name: 'Expert',
    label: 'Specialist',
    base: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
    ultraLight: '#DBEAFE',
    contrast: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #0EA5E9 50%, #06B6D4 100%)',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    shadowColor: 'rgba(59, 130, 246, 0.25)',
    bgPattern: 'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
    description: 'Domain experts providing deep specialized knowledge',
    tailwind: {
      bg: 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600',
      bgSoft: 'bg-blue-500/10',
      text: 'text-white',
      textSoft: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-400/30',
      borderSolid: 'border-blue-500',
      ring: 'ring-blue-500/30',
      glow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]',
    },
  },
  3: {
    name: 'Specialist',
    label: 'Analyst',
    base: '#10B981',
    light: '#34D399',
    dark: '#059669',
    ultraLight: '#D1FAE5',
    contrast: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #10B981 0%, #14B8A6 50%, #06B6D4 100%)',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    shadowColor: 'rgba(16, 185, 129, 0.25)',
    bgPattern: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
    description: 'Focused specialists for specific domain tasks',
    tailwind: {
      bg: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600',
      bgSoft: 'bg-emerald-500/10',
      text: 'text-white',
      textSoft: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-400/30',
      borderSolid: 'border-emerald-500',
      ring: 'ring-emerald-500/30',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]',
    },
  },
  4: {
    name: 'Worker',
    label: 'Executor',
    base: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
    ultraLight: '#FEF3C7',
    contrast: '#1F2937',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #F97316 50%, #EF4444 100%)',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    shadowColor: 'rgba(245, 158, 11, 0.25)',
    bgPattern: 'radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)',
    description: 'Stateless workers for high-volume execution tasks',
    tailwind: {
      bg: 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500',
      bgSoft: 'bg-amber-500/10',
      text: 'text-neutral-900',
      textSoft: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-400/30',
      borderSolid: 'border-amber-500',
      ring: 'ring-amber-500/30',
      glow: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]',
    },
  },
  5: {
    name: 'Tool',
    label: 'Utility',
    base: '#6B7280',
    light: '#9CA3AF',
    dark: '#4B5563',
    ultraLight: '#F3F4F6',
    contrast: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #6B7280 0%, #64748B 50%, #475569 100%)',
    glowColor: 'rgba(107, 114, 128, 0.4)',
    shadowColor: 'rgba(107, 114, 128, 0.25)',
    bgPattern: 'radial-gradient(circle at 20% 20%, rgba(107, 114, 128, 0.15) 0%, transparent 50%)',
    description: 'Deterministic tools with no LLM required',
    tailwind: {
      bg: 'bg-gradient-to-br from-neutral-500 via-slate-600 to-neutral-700',
      bgSoft: 'bg-neutral-500/10',
      text: 'text-white',
      textSoft: 'text-neutral-600 dark:text-neutral-400',
      border: 'border-neutral-400/30',
      borderSolid: 'border-neutral-500',
      ring: 'ring-neutral-500/30',
      glow: 'shadow-[0_0_30px_rgba(107,114,128,0.3)]',
    },
  },
} as const;

export type AgentLevelColorConfig = typeof AGENT_LEVEL_COLORS[AgentLevelNumber];

// ============================================================================
// STATUS COLORS
// ============================================================================

/**
 * Agent operational status colors
 */
export const STATUS_COLORS: Record<AgentStatus | 'inactive', {
  bg: string;
  text: string;
  border: string;
  dot: string;
  glow: string;
  label: string;
}> = {
  active: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-500',
    glow: 'shadow-[0_0_8px_rgba(16,185,129,0.4)]',
    label: 'Active',
  },
  testing: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20',
    dot: 'bg-amber-500',
    glow: 'shadow-[0_0_8px_rgba(245,158,11,0.4)]',
    label: 'Testing',
  },
  development: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
    dot: 'bg-blue-500',
    glow: 'shadow-[0_0_8px_rgba(59,130,246,0.4)]',
    label: 'Development',
  },
  deprecated: {
    bg: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-500/20',
    dot: 'bg-red-500',
    glow: '',
    label: 'Deprecated',
  },
  inactive: {
    bg: 'bg-stone-500/10',
    text: 'text-stone-500 dark:text-stone-400',
    border: 'border-stone-500/20',
    dot: 'bg-stone-400',
    glow: '',
    label: 'Inactive',
  },
} as const;

/**
 * Agent availability status colors (for real-time status)
 */
export const AVAILABILITY_COLORS: Record<AgentAvailability, {
  bg: string;
  text: string;
  dot: string;
  label: string;
}> = {
  available: {
    bg: 'bg-green-500/10',
    text: 'text-green-600',
    dot: 'bg-green-500',
    label: 'Available',
  },
  busy: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-600',
    dot: 'bg-yellow-500 animate-pulse',
    label: 'Busy',
  },
  offline: {
    bg: 'bg-stone-500/10',
    text: 'text-stone-500',
    dot: 'bg-stone-400',
    label: 'Offline',
  },
  maintenance: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600',
    dot: 'bg-orange-500',
    label: 'Maintenance',
  },
} as const;

// ============================================================================
// CARD VARIANT CONFIGURATIONS
// ============================================================================

/**
 * Dimension and styling configuration for each card variant
 */
export const CARD_VARIANT_CONFIG: Record<AgentCardVariant, {
  height: number | 'auto';
  minHeight?: number;
  avatarSize: number;
  padding: number;
  gap: number;
  borderRadius: string;
  titleSize: string;
  descriptionLines: number;
  showDescription: boolean;
  showCapabilities: boolean;
  showMetrics: boolean;
  showTools: boolean;
  maxCapabilities: number;
}> = {
  minimal: {
    height: 64,
    avatarSize: 40,
    padding: 12,
    gap: 12,
    borderRadius: '0.75rem',
    titleSize: 'text-sm',
    descriptionLines: 0,
    showDescription: false,
    showCapabilities: false,
    showMetrics: false,
    showTools: false,
    maxCapabilities: 0,
  },
  compact: {
    height: 200,
    avatarSize: 56,
    padding: 16,
    gap: 16,
    borderRadius: '1rem',
    titleSize: 'text-base',
    descriptionLines: 2,
    showDescription: true,
    showCapabilities: true,
    showMetrics: false,
    showTools: false,
    maxCapabilities: 3,
  },
  rich: {
    height: 'auto',
    minHeight: 320,
    avatarSize: 80,
    padding: 20,
    gap: 20,
    borderRadius: '1.25rem',
    titleSize: 'text-lg',
    descriptionLines: 0, // No limit
    showDescription: true,
    showCapabilities: true,
    showMetrics: true,
    showTools: true,
    maxCapabilities: 0, // No limit
  },
} as const;

// ============================================================================
// RESPONSIVE BREAKPOINTS
// ============================================================================

/**
 * Responsive grid configurations
 */
export const GRID_CONFIG = {
  columns: {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
  },
  gap: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
  maxWidth: '1600px',
} as const;

/**
 * Default responsive variants per breakpoint
 */
export const DEFAULT_RESPONSIVE_VARIANTS = {
  sm: 'minimal' as const,
  md: 'compact' as const,
  lg: 'compact' as const,
  xl: 'compact' as const,
} as const;

// ============================================================================
// AVATAR CONFIGURATION
// ============================================================================

/**
 * Business function to avatar category mapping
 */
export const BUSINESS_FUNCTION_AVATAR_MAP: Record<string, string> = {
  // Analytics & Insights
  analytics: 'analytics_insights',
  analytics_insights: 'analytics_insights',
  data_analytics: 'analytics_insights',
  data_science: 'analytics_insights',
  data: 'analytics_insights',
  business_intelligence: 'analytics_insights',
  bi: 'analytics_insights',
  reporting: 'analytics_insights',
  insights: 'analytics_insights',
  intelligence: 'analytics_insights',
  forecasting: 'analytics_insights',
  prediction: 'analytics_insights',
  modeling: 'analytics_insights',
  statistics: 'analytics_insights',
  
  // Commercial & Marketing
  commercial: 'commercial_marketing',
  commercial_marketing: 'commercial_marketing',
  marketing: 'commercial_marketing',
  sales: 'commercial_marketing',
  sales_marketing: 'commercial_marketing',
  brand: 'commercial_marketing',
  branding: 'commercial_marketing',
  advertising: 'commercial_marketing',
  promotion: 'commercial_marketing',
  communications: 'commercial_marketing',
  digital: 'commercial_marketing',
  content: 'commercial_marketing',
  campaign: 'commercial_marketing',
  customer: 'commercial_marketing',
  crm: 'commercial_marketing',
  
  // Market Access
  market_access: 'market_access',
  access: 'market_access',
  pricing: 'market_access',
  reimbursement: 'market_access',
  health_economics: 'market_access',
  heor: 'market_access',
  payer: 'market_access',
  hta: 'market_access',
  value: 'market_access',
  outcomes: 'market_access',
  policy: 'market_access',
  government: 'market_access',
  tender: 'market_access',
  
  // Medical Affairs
  medical: 'medical_affairs',
  medical_affairs: 'medical_affairs',
  clinical: 'medical_affairs',
  clinical_operations: 'medical_affairs',
  regulatory: 'medical_affairs',
  pharmacovigilance: 'medical_affairs',
  safety: 'medical_affairs',
  compliance: 'medical_affairs',
  legal: 'medical_affairs',
  quality: 'medical_affairs',
  affairs: 'medical_affairs',
  science: 'medical_affairs',
  msl: 'medical_affairs',
  kol: 'medical_affairs',
  trial: 'medical_affairs',
  study: 'medical_affairs',
  
  // Product & Innovation
  product: 'product_innovation',
  product_innovation: 'product_innovation',
  innovation: 'product_innovation',
  r_and_d: 'product_innovation',
  'r&d': 'product_innovation',
  research: 'product_innovation',
  development: 'product_innovation',
  engineering: 'product_innovation',
  technology: 'product_innovation',
  tech: 'product_innovation',
  design: 'product_innovation',
  strategy: 'product_innovation',
  portfolio: 'product_innovation',
  pipeline: 'product_innovation',
  discovery: 'product_innovation',
} as const;

/**
 * Avatar path configuration
 */
export const AVATAR_PATHS = {
  base: '/assets/vital/avatars/',
  superAgents: '/assets/vital/super_agents/',
  icons: {
    purple: '/assets/vital/icons/purple/',
    black: '/assets/vital/icons/black/',
  },
  // Super agent avatars by level
  byLevel: {
    1: 'super_orchestrator.svg',
    2: 'super_reasoner.svg',
    3: 'super_synthesizer.svg',
    4: 'super_architect.svg',
    5: 'super_critic.svg',
  },
  // Level to avatar style prefix
  levelPrefix: {
    1: 'expert',
    2: 'expert',
    3: 'foresight',
    4: 'pharma',
    5: 'startup',
  },
} as const;

// ============================================================================
// ANIMATION PRESETS
// ============================================================================

/**
 * Framer Motion animation variants
 */
export const CARD_ANIMATIONS = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.95 },
  hover: { y: -4 },
  tap: { scale: 0.98 },
  transition: {
    duration: 0.3,
    ease: [0.25, 0.46, 0.45, 0.94],
  },
  stagger: {
    delayChildren: 0.1,
    staggerChildren: 0.05,
  },
} as const;

/**
 * Expansion animation variants
 */
export const EXPANSION_ANIMATIONS = {
  minimal: {
    height: 64,
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
  compact: {
    height: 200,
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
  rich: {
    height: 'auto',
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get level color configuration
 */
export function getAgentLevelColor(level: AgentLevelNumber): AgentLevelColorConfig {
  return AGENT_LEVEL_COLORS[level];
}

/**
 * Get level icon component
 */
export function getAgentLevelIcon(level: AgentLevelNumber): LucideIcon {
  return LEVEL_ICONS[level];
}

/**
 * Get status color configuration
 */
export function getStatusColor(status: AgentStatus | 'inactive') {
  return STATUS_COLORS[status] || STATUS_COLORS.inactive;
}

/**
 * Get availability color configuration
 */
export function getAvailabilityColor(availability: AgentAvailability) {
  return AVAILABILITY_COLORS[availability];
}

/**
 * Get card variant configuration
 */
export function getCardVariantConfig(variant: AgentCardVariant) {
  return CARD_VARIANT_CONFIG[variant];
}

/**
 * Check if a level can spawn child agents
 */
export function canLevelSpawn(parentLevel: AgentLevelNumber, childLevel?: AgentLevelNumber): boolean {
  const spawningRules: Record<AgentLevelNumber, AgentLevelNumber[]> = {
    1: [2, 3, 4, 5],
    2: [3, 4, 5],
    3: [4, 5],
    4: [5],
    5: [],
  };
  
  if (childLevel) {
    return spawningRules[parentLevel].includes(childLevel);
  }
  return spawningRules[parentLevel].length > 0;
}

/**
 * Get avatar category from business function
 */
export function matchBusinessFunctionCategory(businessFunction: string | undefined | null): string {
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
}

/**
 * Generate deterministic hash for avatar selection
 */
export function getAvatarHash(identifier: string): number {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = ((hash << 5) - hash) + identifier.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Get VITAL avatar path for an agent
 */
export function getVitalAvatarPath(
  level: AgentLevelNumber | undefined,
  businessFunction: string | undefined | null,
  identifier: string
): string {
  const prefix = level 
    ? (AVATAR_PATHS.levelPrefix[level] || 'expert') 
    : 'expert';
  const category = matchBusinessFunctionCategory(businessFunction);
  const avatarNumber = (getAvatarHash(identifier) % 20) + 1;
  const paddedNumber = avatarNumber.toString().padStart(2, '0');
  
  return `${AVATAR_PATHS.base}vital_avatar_${prefix}_${category}_${paddedNumber}.svg`;
}

/**
 * Get super agent avatar path (for L1 agents)
 */
export function getSuperAgentAvatarPath(identifier: string): string {
  const superAgents = [
    'super_orchestrator.svg',
    'super_reasoner.svg',
    'super_synthesizer.svg',
    'super_architect.svg',
    'super_critic.svg',
  ];
  const index = getAvatarHash(identifier) % superAgents.length;
  return `${AVATAR_PATHS.superAgents}${superAgents[index]}`;
}
