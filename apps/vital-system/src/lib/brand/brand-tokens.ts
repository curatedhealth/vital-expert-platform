/**
 * VITAL Platform Brand Tokens v6.0
 *
 * Design System: "Human Genius, Amplified"
 * Visual Philosophy: Warm modernism with atomic geometry
 *
 * Based on:
 * - VITALexpert One-Pager: "Agentic Intelligence Platform for Life Sciences"
 * - Brand Guidelines v6.0: Claude-inspired warm aesthetics
 * - Atomic Geometry: Circle, Square, Triangle, Line, Diamond
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

export const VITAL_COLORS = {
  // Primary Accent: Warm Purple (Claude-inspired)
  purple: {
    50: '#FAF5FF',   // Selected backgrounds
    100: '#F3E8FF',  // Hover backgrounds
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',  // Secondary accent
    600: '#9055E0',  // PRIMARY - buttons, links, focus
    700: '#7C3AED',  // Hover state
    800: '#6B21A8',  // Active/pressed
    900: '#581C87',
  },

  // Canvas: Warm backgrounds (NEVER pure white except modals)
  canvas: {
    primary: '#FAFAF9',   // Main app background
    surface: '#F5F5F4',   // Cards, user messages
    subtle: '#E7E5E4',    // Wells, nested areas, borders
    elevated: '#FFFFFF',  // Modals only
  },

  // Text: Warm stone (NOT cold gray)
  text: {
    heading: '#292524',   // Page headings (stone-800)
    subheading: '#44403C', // Section headings (stone-700)
    body: '#57534E',      // Body text (stone-600)
    secondary: '#78716C', // Secondary text (stone-500)
    muted: '#A8A29E',     // Placeholder, disabled (stone-400)
  },

  // Atomic Geometry Colors
  geometry: {
    circle: '#9055E0',    // Insight, Cognition, Origin - Purple
    square: '#F59E0B',    // Structure, Stability, Container - Amber
    triangle: '#10B981',  // Growth, Direction, Transformation - Emerald
    line: '#6366F1',      // Connection, Logic, Pathway - Indigo
    diamond: '#EC4899',   // Precision, Evaluation, Decision - Pink
  },

  // Tier Colors (Agent hierarchy)
  tier: {
    1: {
      primary: '#9055E0',
      bg: '#FAF5FF',
      border: '#E9D5FF',
      label: 'Foundational',
    },
    2: {
      primary: '#F59E0B',
      bg: '#FFFBEB',
      border: '#FDE68A',
      label: 'Specialist',
    },
    3: {
      primary: '#10B981',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      label: 'Ultra-Specialist',
    },
  },

  // Service Layer Colors
  services: {
    askMe: '#78716C',      // Quick Ask - Stone
    askExpert: '#9055E0',  // Single agent - Purple
    askPanel: '#6366F1',   // Multi-agent - Indigo
    workflows: '#EC4899',  // Multi-step - Pink
    solutions: '#10B981',  // End-to-end - Emerald
  },

  // Semantic Colors
  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
  },

  // Tenant Colors
  tenant: {
    pharma: '#2563EB',
    startups: '#EC4899',
    payers: '#F59E0B',
    consulting: '#64748B',
  },
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const VITAL_TYPOGRAPHY = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, Menlo, Monaco, monospace',
    serif: 'Source Serif Pro, Georgia, serif',
  },

  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },

  lineHeight: {
    tight: '1.25',     // Headings
    normal: '1.5',     // UI elements
    relaxed: '1.625',  // Body text
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// ============================================================================
// SPACING TOKENS (4px base unit)
// ============================================================================

export const VITAL_SPACING = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
} as const;

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export const VITAL_RADIUS = {
  none: '0',
  sm: '4px',      // Subtle
  md: '6px',      // Buttons, inputs
  lg: '8px',      // Cards
  xl: '12px',     // Modals
  '2xl': '16px',  // Message bubbles
  '3xl': '24px',  // Chat input pill (signature)
  full: '9999px', // Circles, pills
} as const;

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const VITAL_SHADOWS = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.05)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  focus: '0 0 0 3px rgba(144, 85, 224, 0.15)', // Purple focus ring
  thinking: '0 0 20px rgba(144, 85, 224, 0.1)', // Thinking pulse
} as const;

// ============================================================================
// ANIMATION TOKENS
// ============================================================================

export const VITAL_ANIMATION = {
  duration: {
    fast: '100ms',
    normal: '150ms',
    slow: '200ms',
    thinking: '1500ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

// ============================================================================
// INNOVATOR PERSONAS (from Brand Guidelines)
// ============================================================================

export const INNOVATOR_PERSONAS = [
  {
    id: 'pattern-seeker',
    name: 'Pattern Seeker',
    description: 'Find cross-domain connections others miss',
    traits: ['Analytical', 'Curious', 'Systems thinker'],
    icon: 'Search',
  },
  {
    id: 'evidence-architect',
    name: 'Evidence Architect',
    description: 'Build rigorous, defensible arguments',
    traits: ['Detail-oriented', 'Methodical', 'Precise'],
    icon: 'Layers',
  },
  {
    id: 'synthesis-conductor',
    name: 'Synthesis Conductor',
    description: 'Orchestrate diverse perspectives into coherence',
    traits: ['Collaborative', 'Integrative', 'Strategic'],
    icon: 'GitBranch',
  },
  {
    id: 'rapid-validator',
    name: 'Rapid Validator',
    description: 'Quickly test hypotheses to separate signal from noise',
    traits: ['Action-oriented', 'Iterative', 'Pragmatic'],
    icon: 'Beaker',
  },
  {
    id: 'knowledge-architect',
    name: 'Knowledge Architect',
    description: 'Build lasting structures of insight',
    traits: ['Long-term thinker', 'Organized', 'Foundational'],
    icon: 'Building',
  },
  {
    id: 'strategic-navigator',
    name: 'Strategic Navigator',
    description: 'Chart paths through uncertainty',
    traits: ['Visionary', 'Risk-aware', 'Decisive'],
    icon: 'Compass',
  },
  {
    id: 'domain-bridger',
    name: 'Domain Bridger',
    description: 'Translate between specialties',
    traits: ['Multilingual', 'Empathetic', 'Connective'],
    icon: 'Map',
  },
  {
    id: 'experiment-designer',
    name: 'Experiment Designer',
    description: 'Create structured tests for hypotheses',
    traits: ['Scientific', 'Hypothesis-driven', 'Controlled'],
    icon: 'FlaskConical',
  },
  {
    id: 'amplifier',
    name: 'Amplifier',
    description: 'Scale insights across teams and organizations',
    traits: ['Communicative', 'Influential', 'Scalable'],
    icon: 'Maximize',
  },
  {
    id: 'frontier-explorer',
    name: 'Frontier Explorer',
    description: 'Push into unknown territory',
    traits: ['Adventurous', 'Resilient', 'Pioneering'],
    icon: 'Mountain',
  },
] as const;

// ============================================================================
// DOMAIN OPTIONS (Multi-vertical positioning)
// ============================================================================

export const DOMAIN_OPTIONS = [
  { id: 'pharma', name: 'Pharmaceuticals & Biotech', icon: 'Pill' },
  { id: 'technology', name: 'Technology & Software', icon: 'Cpu' },
  { id: 'consulting', name: 'Consulting & Strategy', icon: 'Briefcase' },
  { id: 'academia', name: 'Academia & Research', icon: 'GraduationCap' },
  { id: 'enterprise', name: 'Enterprise & Corporate', icon: 'Building2' },
  { id: 'research', name: 'R&D & Innovation Labs', icon: 'FlaskConical' },
  { id: 'finance', name: 'Finance & Investment', icon: 'LineChart' },
  { id: 'government', name: 'Government & Policy', icon: 'Shield' },
] as const;

// ============================================================================
// SERVICE LAYERS (from One-Pager)
// ============================================================================

export const SERVICE_LAYERS = [
  {
    id: 'ask-expert',
    name: 'Ask Expert',
    description: 'Single agent, quick answers',
    timing: '<3 seconds',
    icon: 'Sparkles',
  },
  {
    id: 'expert-panel',
    name: 'Expert Panel',
    description: 'Multi-agent deliberation',
    timing: '10-30 seconds',
    icon: 'Users',
  },
  {
    id: 'workflows',
    name: 'Create Workflows',
    description: 'Multi-step with checkpoints',
    timing: 'Minutes to hours',
    icon: 'Workflow',
  },
  {
    id: 'solutions',
    name: 'Solutions Builder',
    description: 'End-to-end orchestration',
    timing: 'Hours to days',
    icon: 'Boxes',
  },
] as const;

// ============================================================================
// VALUE PROPOSITION (from One-Pager)
// ============================================================================

export const VALUE_CYCLE = [
  {
    id: 'understand',
    label: 'UNDERSTAND',
    description: 'Context-aware AI that knows your domain',
    icon: 'Brain',
  },
  {
    id: 'connect',
    label: 'CONNECT',
    description: 'Link products, diseases & evidence',
    icon: 'Network',
  },
  {
    id: 'automate',
    label: 'AUTOMATE',
    description: 'Routine tasks with human oversight',
    icon: 'Cog',
  },
  {
    id: 'learn',
    label: 'LEARN',
    description: 'Continuously improve with every interaction',
    icon: 'TrendingUp',
  },
] as const;

// ============================================================================
// TAILWIND CLASS HELPERS
// ============================================================================

export const tw = {
  // Backgrounds
  canvas: 'bg-[#FAFAF9]',
  surface: 'bg-[#F5F5F4]',
  subtle: 'bg-[#E7E5E4]',
  elevated: 'bg-white',

  // Text
  textHeading: 'text-stone-800',
  textSubheading: 'text-stone-700',
  textBody: 'text-stone-600',
  textSecondary: 'text-stone-500',
  textMuted: 'text-stone-400',

  // Accent
  accentBg: 'bg-vital-primary-600',
  accentHover: 'hover:bg-vital-primary-700',
  accentText: 'text-vital-primary-600',
  accentBorder: 'border-vital-primary-600',

  // Buttons
  btnPrimary: 'bg-vital-primary-600 hover:bg-vital-primary-700 text-white',
  btnSecondary: 'border border-vital-primary-600 text-vital-primary-600 hover:bg-vital-primary-50',
  btnGhost: 'text-stone-600 hover:text-stone-800 hover:bg-stone-100',

  // Borders
  border: 'border-stone-200',
  borderSubtle: 'border-stone-100',
  borderFocus: 'focus:border-vital-primary-600 focus:ring-2 focus:ring-vital-primary-100',

  // Radius
  rounded: 'rounded-md',
  roundedLg: 'rounded-lg',
  roundedXl: 'rounded-xl',
  roundedPill: 'rounded-3xl',
  roundedFull: 'rounded-full',

  // Focus
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-vital-primary-600/20 focus:ring-offset-2',

  // Transitions
  transition: 'transition-all duration-150 ease-in-out',
} as const;

// ============================================================================
// BRAND MESSAGING
// ============================================================================

export const BRAND_MESSAGING = {
  tagline: 'Human Genius, Amplified',
  subtitle: 'Agentic Intelligence Platform for Life Sciences',
  philosophy: 'Orchestrating expertise, transforming scattered knowledge into compounding structures of insight',
  cta: {
    primary: 'Start Orchestrating',
    secondary: 'Explore Capabilities',
  },
  valueProps: {
    speed: 'Transform Complex Enterprise Intelligence into Actionable Insights - 90% Faster',
    agents: 'The Right AI Agent for Every Task',
    hierarchy: 'Fully customizable AI agents organized in hierarchies with 5 levels of seniority',
  },
} as const;

export type InnovatorPersona = typeof INNOVATOR_PERSONAS[number];
export type DomainOption = typeof DOMAIN_OPTIONS[number];
export type ServiceLayer = typeof SERVICE_LAYERS[number];
export type ValueCycleItem = typeof VALUE_CYCLE[number];
