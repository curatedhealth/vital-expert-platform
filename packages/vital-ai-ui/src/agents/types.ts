/**
 * VITAL AI UI - Agent Component Types
 * 
 * Unified type definitions for the Agent Card system.
 * These types are designed to work with the VITAL database schema
 * while providing flexibility for different data sources.
 * 
 * @packageDocumentation
 */

// ============================================================================
// CORE ENUMS
// ============================================================================

/**
 * Agent hierarchy levels (L1-L5)
 * L1: Master/Orchestrator - Can spawn all lower levels
 * L2: Expert - Domain specialists, can spawn L3-L5
 * L3: Specialist - Focused task agents, can spawn L4-L5
 * L4: Worker - Stateless execution agents
 * L5: Tool - Deterministic tool wrappers (no LLM)
 */
export type AgentLevelNumber = 1 | 2 | 3 | 4 | 5;
export type AgentLevelCode = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
export type AgentLevelName = 'MASTER' | 'EXPERT' | 'SPECIALIST' | 'WORKER' | 'TOOL';

/**
 * Agent operational status
 */
export type AgentStatus = 'active' | 'testing' | 'development' | 'deprecated' | 'inactive';

/**
 * Agent availability status for real-time display
 */
export type AgentAvailability = 'available' | 'busy' | 'offline' | 'maintenance';

/**
 * Domain expertise areas
 */
export type DomainExpertise = 
  | 'medical'
  | 'regulatory'
  | 'legal'
  | 'financial'
  | 'business'
  | 'technical'
  | 'commercial'
  | 'access'
  | 'general';

/**
 * Proficiency levels for capabilities and skills
 */
export type ProficiencyLevel = 'familiar' | 'proficient' | 'expert';

// ============================================================================
// AGENT CARD VARIANTS
// ============================================================================

/**
 * Card display variants
 * - minimal: Compact inline display (sidebars, selectors)
 * - compact: Grid view display (agent boards)
 * - rich: Full detail display (detail pages, comparisons)
 */
export type AgentCardVariant = 'minimal' | 'compact' | 'rich';

/**
 * Expansion behavior for expandable cards
 */
export type ExpansionDirection = 'inline' | 'modal' | 'drawer';

// ============================================================================
// AGENT DATA STRUCTURES
// ============================================================================

/**
 * Agent level information (populated from agent_levels table)
 */
export interface AgentLevelInfo {
  id: string;
  level_number: AgentLevelNumber;
  level_code: AgentLevelCode;
  level_name: AgentLevelName;
  description?: string;
}

/**
 * Agent capability with proficiency
 */
export interface AgentCapability {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  category?: string;
  proficiency_level?: ProficiencyLevel;
  is_primary?: boolean;
}

/**
 * Agent knowledge domain
 */
export interface AgentKnowledgeDomain {
  id: string;
  domain_name: string;
  proficiency_level?: ProficiencyLevel;
  is_primary_domain?: boolean;
  expertise_level?: string;
}

/**
 * Agent tool assignment
 */
export interface AgentTool {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  tool_type?: string;
  is_enabled?: boolean;
  priority?: number;
}

/**
 * Agent performance metrics
 */
export interface AgentMetrics {
  /** Number of completed tasks/interactions */
  tasks_completed?: number;
  /** Success rate as percentage (0-100) */
  success_rate?: number;
  /** Average response time in seconds */
  avg_response_time?: number;
  /** User satisfaction rating (0-5) */
  rating?: number;
  /** Total number of consultations */
  total_consultations?: number;
  /** Confidence score (0-100) */
  confidence_score?: number;
  /** Error rate as percentage */
  error_rate?: number;
}

/**
 * Agent prompt starter
 */
export interface AgentPromptStarter {
  id: string;
  text: string;
  icon?: string;
  category?: string;
  sequence_order?: number;
}

// ============================================================================
// MAIN AGENT INTERFACE
// ============================================================================

/**
 * Core Agent interface for the VitalAgentCard system.
 * 
 * This interface is designed to be flexible and work with:
 * - Full database entities
 * - Simplified API responses
 * - Manually constructed objects
 * 
 * All fields except `id` and `name` are optional to support partial data.
 */
export interface VitalAgent {
  // Core Identity (required)
  id: string;
  name: string;

  // Display Fields
  display_name?: string;
  slug?: string;
  tagline?: string;
  description?: string;
  title?: string;
  
  // Avatar
  avatar_url?: string;
  avatar_description?: string;
  color?: string;
  
  // Level & Status
  /** Numeric tier level (1-5) - legacy field, prefer agent_level */
  tier?: AgentLevelNumber;
  /** Level info populated from join or computed */
  agent_level?: AgentLevelInfo;
  /** Shorthand level number if agent_level not populated */
  level_number?: AgentLevelNumber;
  status?: AgentStatus;
  availability_status?: AgentAvailability;
  
  // Organizational Context
  function_id?: string;
  function_name?: string;
  business_function?: string;
  department_id?: string;
  department_name?: string;
  role_id?: string;
  role_name?: string;
  domain_expertise?: DomainExpertise;
  
  // Capabilities & Knowledge
  capabilities?: string[] | AgentCapability[];
  knowledge_domains?: string[] | AgentKnowledgeDomain[];
  enriched_capabilities?: AgentCapability[];
  enriched_knowledge_domains?: AgentKnowledgeDomain[];
  
  // Tools
  tools_enabled?: string[];
  assigned_tools?: AgentTool[];
  
  // Spawning & Hierarchy
  can_spawn_l2?: boolean;
  can_spawn_l3?: boolean;
  can_spawn_l4?: boolean;
  can_use_worker_pool?: boolean;
  reports_to_agent_id?: string;
  can_escalate_to?: string;
  
  // Performance Metrics
  metrics?: AgentMetrics;
  accuracy_score?: number;
  average_response_time?: number;
  total_interactions?: number;
  error_rate?: number;
  
  // Prompt Starters
  prompt_starters?: AgentPromptStarter[];
  
  // AI Configuration (for rich view)
  base_model?: string;
  model?: string;
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
  rag_enabled?: boolean;
  
  // Timestamps
  created_at?: Date | string;
  updated_at?: Date | string;
  last_interaction?: Date | string;
  
  // Metadata
  metadata?: Record<string, unknown>;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/**
 * Base props shared across all card variants
 */
export interface VitalAgentCardBaseProps {
  /** The agent data to display */
  agent: VitalAgent;
  
  /** Current card variant */
  variant?: AgentCardVariant;
  
  /** Whether the card is selected */
  isSelected?: boolean;
  
  /** Whether the card is bookmarked */
  isBookmarked?: boolean;
  
  /** Whether the card is in comparison mode */
  isInComparison?: boolean;
  
  /** Whether the card is featured/highlighted */
  featured?: boolean;
  
  /** Whether to show action buttons */
  showActions?: boolean;
  
  /** Whether to show performance metrics */
  showMetrics?: boolean;
  
  /** Whether to show capability badges */
  showCapabilities?: boolean;
  
  /** Additional CSS class names */
  className?: string;
  
  /** Inline styles */
  style?: React.CSSProperties;
  
  /** Animation delay for staggered lists (in ms) */
  animationDelay?: number;
}

/**
 * Action callbacks for agent cards
 */
export interface VitalAgentCardActions {
  /** Called when card is clicked/selected */
  onSelect?: (agent: VitalAgent) => void;
  
  /** Called when "Add to Chat" is clicked */
  onAddToChat?: (agent: VitalAgent) => void;
  
  /** Called when bookmark toggle is clicked */
  onBookmark?: (agent: VitalAgent) => void;
  
  /** Called when duplicate is clicked */
  onDuplicate?: (agent: VitalAgent) => void;
  
  /** Called when edit is clicked */
  onEdit?: (agent: VitalAgent) => void;
  
  /** Called when delete is clicked */
  onDelete?: (agent: VitalAgent) => void;
  
  /** Called when compare is clicked */
  onCompare?: (agent: VitalAgent) => void;
  
  /** Called when view details is clicked */
  onViewDetails?: (agent: VitalAgent) => void;
}

/**
 * Authorization flags for card actions
 */
export interface VitalAgentCardPermissions {
  /** Whether user can edit this agent */
  canEdit?: boolean;
  
  /** Whether user can delete this agent */
  canDelete?: boolean;
  
  /** Whether user can duplicate this agent */
  canDuplicate?: boolean;
}

/**
 * Expansion behavior props for expandable cards
 */
export interface VitalAgentCardExpansionProps {
  /** Enable click-to-expand behavior */
  expandable?: boolean;
  
  /** Maximum expansion level */
  expandTo?: 'compact' | 'rich';
  
  /** Expand on hover instead of click */
  expandOnHover?: boolean;
  
  /** How the expanded view is displayed */
  expandDirection?: ExpansionDirection;
  
  /** Called when card is expanded */
  onExpand?: (variant: AgentCardVariant) => void;
  
  /** Called when card is collapsed */
  onCollapse?: () => void;
}

/**
 * Responsive variant configuration
 */
export interface ResponsiveVariants {
  /** Mobile (< 640px) */
  sm?: 'minimal' | 'compact';
  /** Tablet (640-768px) */
  md?: 'minimal' | 'compact';
  /** Desktop (768-1024px) */
  lg?: 'compact' | 'rich';
  /** Large Desktop (> 1024px) */
  xl?: 'compact' | 'rich';
}

/**
 * Complete props for the main VitalAgentCard component
 */
export interface VitalAgentCardProps 
  extends VitalAgentCardBaseProps, 
          VitalAgentCardActions,
          VitalAgentCardPermissions,
          VitalAgentCardExpansionProps {
  /** Responsive variant overrides */
  responsiveVariants?: ResponsiveVariants;
}

/**
 * Props for the minimal card variant
 */
export interface VitalAgentCardMinimalProps 
  extends VitalAgentCardBaseProps,
          Pick<VitalAgentCardActions, 'onSelect' | 'onAddToChat'> {}

/**
 * Props for the compact card variant
 */
export interface VitalAgentCardCompactProps
  extends VitalAgentCardBaseProps,
          VitalAgentCardActions,
          VitalAgentCardPermissions {}

/**
 * Props for the rich card variant
 */
export interface VitalAgentCardRichProps
  extends VitalAgentCardBaseProps,
          VitalAgentCardActions,
          VitalAgentCardPermissions {
  /** Whether to show tools section */
  showTools?: boolean;
  
  /** Whether to show system prompt preview */
  showSystemPrompt?: boolean;
  
  /** Whether to collapse sections by default */
  collapsedByDefault?: boolean;
}

// ============================================================================
// SKELETON PROPS
// ============================================================================

/**
 * Props for skeleton loading states
 */
export interface VitalAgentCardSkeletonProps {
  /** Variant to render skeleton for */
  variant?: AgentCardVariant;
  
  /** Number of skeleton cards to render */
  count?: number;
  
  /** Additional CSS class names */
  className?: string;
}

// ============================================================================
// GRID & LIST PROPS
// ============================================================================

/**
 * Props for the agent card grid container
 */
export interface VitalAgentCardGridProps {
  /** Array of agents to display */
  agents: VitalAgent[];
  
  /** Minimum card width for responsive columns */
  minCardWidth?: number;
  
  /** Gap between cards in pixels */
  gap?: number;
  
  /** Responsive variant configuration */
  responsiveVariants?: ResponsiveVariants;
  
  /** Enable expandable cards */
  expandable?: boolean;
  
  /** Enable virtual scrolling for large lists */
  virtualized?: boolean;
  
  /** Height for virtualized container */
  virtualizedHeight?: number;
  
  /** Agent card event handlers */
  onAgentSelect?: (agent: VitalAgent) => void;
  onAgentAddToChat?: (agent: VitalAgent) => void;
  onAgentBookmark?: (agent: VitalAgent) => void;
  onAgentEdit?: (agent: VitalAgent) => void;
  onAgentDelete?: (agent: VitalAgent) => void;
  onAgentCompare?: (agent: VitalAgent) => void;
  
  /** Selected agent IDs */
  selectedIds?: string[];
  
  /** Bookmarked agent IDs */
  bookmarkedIds?: string[];
  
  /** Agent IDs in comparison */
  comparisonIds?: string[];
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Empty state message */
  emptyMessage?: string;
  
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the agent card list container
 */
export interface VitalAgentCardListProps 
  extends Omit<VitalAgentCardGridProps, 'minCardWidth'> {
  /** Whether to use minimal variant for list items */
  useMinimalVariant?: boolean;
  
  /** Whether to show dividers between items */
  showDividers?: boolean;
}

// ============================================================================
// HELPER TYPE EXPORTS
// ============================================================================

/**
 * Extract agent level number from various sources
 */
export function getAgentLevelNumber(agent: VitalAgent): AgentLevelNumber {
  if (agent.agent_level?.level_number) {
    return agent.agent_level.level_number;
  }
  if (agent.level_number) {
    return agent.level_number;
  }
  if (agent.tier) {
    return agent.tier;
  }
  return 2; // Default to L2 Expert
}

/**
 * Check if agent has spawning capabilities
 */
export function canAgentSpawn(agent: VitalAgent): boolean {
  const level = getAgentLevelNumber(agent);
  return level <= 3; // L1-L3 can spawn
}

/**
 * Get capabilities as strings (handles both formats)
 */
export function getAgentCapabilities(agent: VitalAgent): string[] {
  if (agent.enriched_capabilities?.length) {
    return agent.enriched_capabilities
      .filter(c => c.name)
      .map(c => c.name);
  }
  if (Array.isArray(agent.capabilities)) {
    if (typeof agent.capabilities[0] === 'string') {
      return agent.capabilities as string[];
    }
    return (agent.capabilities as AgentCapability[])
      .filter(c => c.name)
      .map(c => c.name);
  }
  return [];
}

/**
 * Get knowledge domains as strings (handles both formats)
 */
export function getAgentKnowledgeDomains(agent: VitalAgent): string[] {
  if (agent.enriched_knowledge_domains?.length) {
    return agent.enriched_knowledge_domains
      .filter(d => d.domain_name)
      .map(d => d.domain_name);
  }
  if (Array.isArray(agent.knowledge_domains)) {
    if (typeof agent.knowledge_domains[0] === 'string') {
      return agent.knowledge_domains as string[];
    }
    return (agent.knowledge_domains as AgentKnowledgeDomain[])
      .filter(d => d.domain_name)
      .map(d => d.domain_name);
  }
  return [];
}
