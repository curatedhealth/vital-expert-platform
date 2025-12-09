/**
 * Design Tokens for Agent Store
 * Aligned with shadcn/ui and VITAL design system
 *
 * @see /apps/vital-system/src/app/globals.css for CSS variable definitions
 * @see /.claude/docs/platform/AGENT_STORE_REDESIGN_SPEC.md for full specification
 */

// ============================================================================
// AGENT LEVEL COLORS (5-Level Hierarchy)
// ============================================================================

export const AGENT_LEVEL_COLORS = {
  1: {
    name: 'Master',
    base: 'hsl(268 68% 62%)',      // Purple - #8B5CF6
    light: 'hsl(266 85% 80%)',     // #A78BFA
    dark: 'hsl(269 71% 56%)',      // #7C3AED
    contrast: 'hsl(0 0% 100%)',    // White
    description: 'Power and Orchestration',
    cssVar: 'var(--agent-level-1)',
    tailwind: 'bg-purple-600 text-white',
    count: 24, // Current count in database
  },
  2: {
    name: 'Expert',
    base: 'hsl(217 91% 60%)',      // Blue - #3B82F6
    light: 'hsl(213 97% 87%)',     // #60A5FA
    dark: 'hsl(221 83% 53%)',      // #2563EB
    contrast: 'hsl(0 0% 100%)',    // White
    description: 'Trust and Expertise',
    cssVar: 'var(--agent-level-2)',
    tailwind: 'bg-blue-600 text-white',
    count: 110,
  },
  3: {
    name: 'Specialist',
    base: 'hsl(160 84% 39%)',      // Green - #10B981
    light: 'hsl(141 79% 85%)',     // #34D399
    dark: 'hsl(160 84% 28%)',      // #059669
    contrast: 'hsl(0 0% 100%)',    // White
    description: 'Growth and Specialization',
    cssVar: 'var(--agent-level-3)',
    tailwind: 'bg-green-600 text-white',
    count: 266,
  },
  4: {
    name: 'Worker',
    base: 'hsl(38 92% 50%)',       // Orange - #F59E0B
    light: 'hsl(43 96% 56%)',      // #FBBF24
    dark: 'hsl(32 95% 44%)',       // #D97706
    contrast: 'hsl(0 0% 0%)',      // Black
    description: 'Action and Execution',
    cssVar: 'var(--agent-level-4)',
    tailwind: 'bg-orange-600 text-black',
    count: 39,
  },
  5: {
    name: 'Tool',
    base: 'hsl(215 16% 47%)',      // Gray - #6B7280
    light: 'hsl(214 32% 64%)',     // #9CA3AF
    dark: 'hsl(215 25% 27%)',      // #4B5563
    contrast: 'hsl(0 0% 100%)',    // White
    description: 'Utility and Integration',
    cssVar: 'var(--agent-level-5)',
    tailwind: 'bg-neutral-600 text-white',
    count: 50,
  },
} as const;

export type AgentLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Get color configuration for an agent level
 * @param level - Agent level (1-5)
 * @returns Color configuration object
 */
export const getAgentLevelColor = (level: AgentLevel) => {
  return AGENT_LEVEL_COLORS[level];
};

/**
 * Get Tailwind CSS classes for agent level
 * @param level - Agent level (1-5)
 * @returns Tailwind class string
 */
export const getAgentLevelTailwind = (level: AgentLevel): string => {
  return AGENT_LEVEL_COLORS[level].tailwind;
};

// ============================================================================
// AGENT STATUS COLORS
// ============================================================================

export const AGENT_STATUS_COLORS = {
  active: {
    color: 'hsl(160 84% 39%)',     // Green
    cssVar: 'var(--agent-status-active)',
    tailwind: 'bg-green-600 text-white',
    label: 'Active',
    description: 'Production-ready agent',
  },
  testing: {
    color: 'hsl(38 92% 50%)',      // Orange
    cssVar: 'var(--agent-status-testing)',
    tailwind: 'bg-orange-600 text-black',
    label: 'Testing',
    description: 'In testing phase',
  },
  development: {
    color: 'hsl(215 16% 47%)',     // Gray
    cssVar: 'var(--agent-status-development)',
    tailwind: 'bg-neutral-600 text-white',
    label: 'Development',
    description: 'Under development',
  },
  inactive: {
    color: 'hsl(0 0% 45%)',        // Dark gray
    cssVar: 'var(--agent-status-inactive)',
    tailwind: 'bg-neutral-700 text-white',
    label: 'Inactive',
    description: 'Not available',
  },
} as const;

export type AgentStatus = keyof typeof AGENT_STATUS_COLORS;

/**
 * Get status color configuration
 * @param status - Agent status
 * @returns Status color configuration
 */
export const getAgentStatusColor = (status: AgentStatus) => {
  return AGENT_STATUS_COLORS[status];
};

// ============================================================================
// SPAWNING RULES (Level Hierarchy)
// ============================================================================

export const SPAWNING_RULES = {
  1: { canSpawn: [2, 3, 4, 5], name: 'Master spawns all' },
  2: { canSpawn: [3, 4, 5], name: 'Expert spawns Specialist, Worker, Tool' },
  3: { canSpawn: [4, 5], name: 'Specialist spawns Worker, Tool' },
  4: { canSpawn: [5], name: 'Worker spawns Tool' },
  5: { canSpawn: [], name: 'Tool cannot spawn' },
} as const;

/**
 * Check if a level can spawn another level
 * @param parentLevel - Parent agent level
 * @param childLevel - Child agent level
 * @returns true if parent can spawn child
 */
export const canLevelSpawn = (
  parentLevel: AgentLevel,
  childLevel: AgentLevel
): boolean => {
  return SPAWNING_RULES[parentLevel].canSpawn.includes(childLevel);
};

// ============================================================================
// SPACING (8px base grid)
// ============================================================================

export const SPACING = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '5rem',   // 80px
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const TYPOGRAPHY = {
  display: {
    size: '3rem',        // 48px
    weight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h1: {
    size: '2.25rem',     // 36px
    weight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  h2: {
    size: '1.875rem',    // 30px
    weight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    size: '1.5rem',      // 24px
    weight: 600,
    lineHeight: 1.4,
  },
  h4: {
    size: '1.25rem',     // 20px
    weight: 600,
    lineHeight: 1.5,
  },
  body: {
    size: '1rem',        // 16px
    weight: 400,
    lineHeight: 1.6,
  },
  small: {
    size: '0.875rem',    // 14px
    weight: 400,
    lineHeight: 1.5,
  },
  tiny: {
    size: '0.75rem',     // 12px
    weight: 400,
    lineHeight: 1.4,
  },
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

// ============================================================================
// ANIMATION TIMINGS
// ============================================================================

export const TRANSITIONS = {
  fast: '150ms',
  base: '250ms',
  slow: '350ms',
  slower: '500ms',
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// ============================================================================
// RESPONSIVE BREAKPOINTS (Tailwind defaults)
// ============================================================================

export const BREAKPOINTS = {
  xs: '320px',   // Mobile portrait
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet portrait
  lg: '1024px',  // Tablet landscape / Small desktop
  xl: '1280px',  // Desktop
  '2xl': '1536px', // Large desktop
} as const;

// ============================================================================
// GRID COLUMNS PER BREAKPOINT (for AgentGrid)
// ============================================================================

export const GRID_COLUMNS = {
  xs: 1,   // 1 column on mobile
  sm: 2,   // 2 columns on large mobile
  md: 2,   // 2 columns on tablet
  lg: 3,   // 3 columns on desktop
  xl: 4,   // 4 columns on large desktop
  '2xl': 4, // 4 columns on XL screens (max 4 per row)
} as const;

// ============================================================================
// CARD SIZES (for AgentCard variants)
// ============================================================================

export const CARD_SIZES = {
  compact: {
    height: 180,
    avatarSize: 56,
    titleSize: 'text-base',
    descriptionLines: 2,
  },
  comfortable: {
    height: 200,
    avatarSize: 72,
    titleSize: 'text-lg',
    descriptionLines: 3,
  },
  detailed: {
    height: 240,
    avatarSize: 96,
    titleSize: 'text-xl',
    descriptionLines: 4,
  },
} as const;

export type CardSize = keyof typeof CARD_SIZES;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;

// ============================================================================
// PERFORMANCE CONSTANTS
// ============================================================================

export const PERFORMANCE = {
  // Virtual scrolling
  virtualScrollOverscan: 5, // Extra rows to render
  virtualScrollEstimatedSize: 320, // Estimated row height

  // Debouncing
  searchDebounceMs: 300,
  filterDebounceMs: 200,

  // Pagination
  pageSize: 50,
  infiniteScrollThreshold: 0.8, // Load more at 80% scroll

  // Caching
  cacheTTL: 5 * 60 * 1000, // 5 minutes
} as const;

// ============================================================================
// AGENT CARD VARIANTS (for different views)
// ============================================================================

export const AGENT_CARD_VARIANTS = {
  grid: {
    width: 'full',
    orientation: 'vertical' as const,
    showFullDescription: false,
    showMetadata: true,
  },
  list: {
    width: 'full',
    orientation: 'horizontal' as const,
    showFullDescription: true,
    showMetadata: true,
  },
  minimal: {
    width: 'auto',
    orientation: 'vertical' as const,
    showFullDescription: false,
    showMetadata: false,
  },
} as const;

export type AgentCardVariant = keyof typeof AGENT_CARD_VARIANTS;

// ============================================================================
// EXPORT ALL
// ============================================================================

export const DESIGN_TOKENS = {
  agentLevels: AGENT_LEVEL_COLORS,
  agentStatus: AGENT_STATUS_COLORS,
  spawning: SPAWNING_RULES,
  spacing: SPACING,
  typography: TYPOGRAPHY,
  shadows: SHADOWS,
  transitions: TRANSITIONS,
  breakpoints: BREAKPOINTS,
  gridColumns: GRID_COLUMNS,
  cardSizes: CARD_SIZES,
  zIndex: Z_INDEX,
  performance: PERFORMANCE,
  cardVariants: AGENT_CARD_VARIANTS,
} as const;

export default DESIGN_TOKENS;
