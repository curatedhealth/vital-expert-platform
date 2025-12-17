/**
 * Enhanced Design Tokens for Agent Store v2.0
 * Premium visual system with VITAL brand aesthetics
 *
 * Features:
 * - Glassmorphism effects
 * - Gradient overlays
 * - Premium shadows with color tints
 * - Smooth animations
 * - Typography scale with distinctive fonts
 */

// ============================================================================
// AGENT LEVEL COLORS (5-Level Hierarchy) - Enhanced with Gradients
// ============================================================================

export const AGENT_LEVEL_COLORS = {
  1: {
    name: 'Master',
    label: 'Orchestrator',
    icon: '/assets/vital/super_agents/super_orchestrator.svg',
    base: '#8B5CF6',
    light: '#A78BFA',
    dark: '#7C3AED',
    ultraLight: '#EDE9FE',
    contrast: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #D946EF 100%)',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    shadowColor: 'rgba(139, 92, 246, 0.25)',
    bgPattern: 'radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
    description: 'Power and Orchestration',
    cssVar: 'var(--agent-level-1)',
    tailwind: {
      bg: 'bg-gradient-to-br from-purple-500 via-purple-600 to-fuchsia-600',
      text: 'text-white',
      border: 'border-purple-400/30',
      glow: 'shadow-[0_0_30px_rgba(139,92,246,0.3)]',
    },
  },
  2: {
    name: 'Expert',
    label: 'Specialist',
    icon: '/assets/vital/super_agents/super_reasoner.svg',
    base: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
    ultraLight: '#DBEAFE',
    contrast: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #0EA5E9 50%, #06B6D4 100%)',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    shadowColor: 'rgba(59, 130, 246, 0.25)',
    bgPattern: 'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
    description: 'Trust and Expertise',
    cssVar: 'var(--agent-level-2)',
    tailwind: {
      bg: 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600',
      text: 'text-white',
      border: 'border-blue-400/30',
      glow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]',
    },
  },
  3: {
    name: 'Specialist',
    label: 'Analyst',
    icon: '/assets/vital/super_agents/super_synthesizer.svg',
    base: '#10B981',
    light: '#34D399',
    dark: '#059669',
    ultraLight: '#D1FAE5',
    contrast: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #10B981 0%, #14B8A6 50%, #06B6D4 100%)',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    shadowColor: 'rgba(16, 185, 129, 0.25)',
    bgPattern: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
    description: 'Growth and Specialization',
    cssVar: 'var(--agent-level-3)',
    tailwind: {
      bg: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600',
      text: 'text-white',
      border: 'border-emerald-400/30',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]',
    },
  },
  4: {
    name: 'Worker',
    label: 'Executor',
    icon: '/assets/vital/super_agents/super_architect.svg',
    base: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
    ultraLight: '#FEF3C7',
    contrast: '#1F2937',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #F97316 50%, #EF4444 100%)',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    shadowColor: 'rgba(245, 158, 11, 0.25)',
    bgPattern: 'radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)',
    description: 'Action and Execution',
    cssVar: 'var(--agent-level-4)',
    tailwind: {
      bg: 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500',
      text: 'text-neutral-900',
      border: 'border-amber-400/30',
      glow: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]',
    },
  },
  5: {
    name: 'Tool',
    label: 'Utility',
    icon: '/assets/vital/super_agents/super_critic.svg',
    base: '#6B7280',
    light: '#9CA3AF',
    dark: '#4B5563',
    ultraLight: '#F3F4F6',
    contrast: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #6B7280 0%, #64748B 50%, #475569 100%)',
    glowColor: 'rgba(107, 114, 128, 0.4)',
    shadowColor: 'rgba(107, 114, 128, 0.25)',
    bgPattern: 'radial-gradient(circle at 20% 20%, rgba(107, 114, 128, 0.15) 0%, transparent 50%)',
    description: 'Utility and Integration',
    cssVar: 'var(--agent-level-5)',
    tailwind: {
      bg: 'bg-gradient-to-br from-neutral-500 via-slate-600 to-neutral-700',
      text: 'text-white',
      border: 'border-neutral-400/30',
      glow: 'shadow-[0_0_30px_rgba(107,114,128,0.3)]',
    },
  },
} as const;

export type AgentLevel = 1 | 2 | 3 | 4 | 5;

// ============================================================================
// PREMIUM SHADOWS
// ============================================================================

export const SHADOWS = {
  // Elevation shadows
  xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
  sm: '0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
  md: '0 4px 8px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06)',
  xl: '0 16px 32px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08)',
  '2xl': '0 24px 48px rgba(0, 0, 0, 0.16), 0 12px 24px rgba(0, 0, 0, 0.1)',

  // Card-specific shadows
  card: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
  cardHover: '0 12px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)',
  cardActive: '0 4px 8px rgba(0, 0, 0, 0.1)',

  // Colored shadows (for level-specific cards)
  purple: '0 8px 24px rgba(139, 92, 246, 0.2)',
  blue: '0 8px 24px rgba(59, 130, 246, 0.2)',
  green: '0 8px 24px rgba(16, 185, 129, 0.2)',
  orange: '0 8px 24px rgba(245, 158, 11, 0.2)',
  gray: '0 8px 24px rgba(107, 114, 128, 0.2)',

  // Inner shadows
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  innerLight: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)',
} as const;

// ============================================================================
// GLASSMORPHISM EFFECTS
// ============================================================================

export const GLASS = {
  light: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropBlur: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    shadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
  },
  dark: {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropBlur: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    shadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
  },
  purple: {
    background: 'rgba(139, 92, 246, 0.1)',
    backdropBlur: 'blur(16px)',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    shadow: '0 4px 24px rgba(139, 92, 246, 0.1)',
  },
} as const;

// ============================================================================
// ANIMATIONS
// ============================================================================

export const ANIMATIONS = {
  // Timing functions
  easing: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    snappy: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },

  // Durations
  duration: {
    instant: '100ms',
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
  },

  // Keyframes (CSS)
  keyframes: {
    shimmer: `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `,
    pulse: `
      @keyframes pulse-glow {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `,
    float: `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
    `,
    scaleIn: `
      @keyframes scale-in {
        0% { transform: scale(0.95); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
    `,
  },
} as const;

// ============================================================================
// TYPOGRAPHY - Premium Font Stack
// ============================================================================

export const TYPOGRAPHY = {
  fontFamily: {
    display: '"Cal Sans", "Inter", system-ui, sans-serif',
    heading: '"Inter", system-ui, sans-serif',
    body: '"Inter", system-ui, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  
  scale: {
    hero: { size: '4rem', weight: 800, lineHeight: 1.1, tracking: '-0.03em' },
    display: { size: '3rem', weight: 700, lineHeight: 1.15, tracking: '-0.025em' },
    h1: { size: '2.25rem', weight: 700, lineHeight: 1.2, tracking: '-0.02em' },
    h2: { size: '1.875rem', weight: 600, lineHeight: 1.25, tracking: '-0.015em' },
    h3: { size: '1.5rem', weight: 600, lineHeight: 1.3, tracking: '-0.01em' },
    h4: { size: '1.25rem', weight: 600, lineHeight: 1.4 },
    body: { size: '1rem', weight: 400, lineHeight: 1.6 },
    bodyLarge: { size: '1.125rem', weight: 400, lineHeight: 1.6 },
    small: { size: '0.875rem', weight: 400, lineHeight: 1.5 },
    tiny: { size: '0.75rem', weight: 500, lineHeight: 1.4 },
    micro: { size: '0.625rem', weight: 600, lineHeight: 1.3, tracking: '0.05em' },
  },
} as const;

// ============================================================================
// CARD VARIANTS - Enhanced
// ============================================================================

export const CARD_VARIANTS = {
  default: {
    height: 280,
    avatarSize: 80,
    padding: '1.25rem',
    borderRadius: '1rem',
    titleSize: 'text-lg',
    descriptionLines: 3,
  },
  compact: {
    height: 200,
    avatarSize: 56,
    padding: '1rem',
    borderRadius: '0.75rem',
    titleSize: 'text-base',
    descriptionLines: 2,
  },
  detailed: {
    height: 340,
    avatarSize: 96,
    padding: '1.5rem',
    borderRadius: '1.25rem',
    titleSize: 'text-xl',
    descriptionLines: 4,
  },
  featured: {
    height: 400,
    avatarSize: 120,
    padding: '2rem',
    borderRadius: '1.5rem',
    titleSize: 'text-2xl',
    descriptionLines: 5,
  },
} as const;

// ============================================================================
// RESPONSIVE GRID
// ============================================================================

export const GRID = {
  columns: {
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
    '2xl': 4,
  },
  gap: {
    xs: '0.75rem',
    sm: '1rem',
    md: '1.25rem',
    lg: '1.5rem',
  },
  maxWidth: '1600px',
} as const;

// ============================================================================
// VITAL AVATAR PATHS
// ============================================================================

export const AVATAR_PATHS = {
  base: '/assets/vital/avatars/',
  superAgents: '/assets/vital/super_agents/',
  icons: {
    purple: '/assets/vital/icons/purple/',
    black: '/assets/vital/icons/black/',
  },
  
  // Pre-defined avatar mappings by function
  byFunction: {
    'Analytics & Insights': 'vital_avatar_expert_analytics_insights_',
    'Commercial & Marketing': 'vital_avatar_expert_commercial_marketing_',
    'Market Access': 'vital_avatar_expert_market_access_',
    'Medical Affairs': 'vital_avatar_expert_medical_affairs_',
    'Product Innovation': 'vital_avatar_expert_product_innovation_',
  },
  
  // Super agent icons for levels
  byLevel: {
    1: 'super_orchestrator.svg',
    2: 'super_reasoner.svg',
    3: 'super_synthesizer.svg',
    4: 'super_architect.svg',
    5: 'super_critic.svg',
  },
} as const;

// ============================================================================
// STATUS COLORS - Enhanced
// ============================================================================

export const STATUS_COLORS = {
  active: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-500',
    glow: 'shadow-[0_0_8px_rgba(16,185,129,0.4)]',
    label: 'Active',
  },
  testing: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600',
    border: 'border-amber-500/20',
    dot: 'bg-amber-500',
    glow: 'shadow-[0_0_8px_rgba(245,158,11,0.4)]',
    label: 'Testing',
  },
  development: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600',
    border: 'border-blue-500/20',
    dot: 'bg-blue-500',
    glow: 'shadow-[0_0_8px_rgba(59,130,246,0.4)]',
    label: 'Development',
  },
  inactive: {
    bg: 'bg-stone-500/10',
    text: 'text-stone-500',
    border: 'border-stone-500/20',
    dot: 'bg-stone-400',
    glow: '',
    label: 'Inactive',
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getAgentLevelColor = (level: AgentLevel) => AGENT_LEVEL_COLORS[level];

export const getAgentLevelGradient = (level: AgentLevel) => AGENT_LEVEL_COLORS[level].gradient;

export const getAgentLevelIcon = (level: AgentLevel) => 
  `${AVATAR_PATHS.superAgents}${AVATAR_PATHS.byLevel[level]}`;

export const getAgentAvatar = (functionName: string, index: number = 1) => {
  const prefix = AVATAR_PATHS.byFunction[functionName as keyof typeof AVATAR_PATHS.byFunction];
  if (prefix) {
    const paddedIndex = String(index).padStart(2, '0');
    return `${AVATAR_PATHS.base}${prefix}${paddedIndex}.svg`;
  }
  return null;
};

export const canLevelSpawn = (parentLevel: AgentLevel, childLevel: AgentLevel): boolean => {
  const spawningRules: Record<AgentLevel, AgentLevel[]> = {
    1: [2, 3, 4, 5],
    2: [3, 4, 5],
    3: [4, 5],
    4: [5],
    5: [],
  };
  return spawningRules[parentLevel].includes(childLevel);
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export const DESIGN_TOKENS = {
  levels: AGENT_LEVEL_COLORS,
  shadows: SHADOWS,
  glass: GLASS,
  animations: ANIMATIONS,
  typography: TYPOGRAPHY,
  cardVariants: CARD_VARIANTS,
  grid: GRID,
  avatarPaths: AVATAR_PATHS,
  statusColors: STATUS_COLORS,
} as const;

export default DESIGN_TOKENS;























