/**
 * PROMPTS™ Library Type Definitions
 * Comprehensive types for the enhanced prompt dashboard
 */

// ============================================================================
// CORE PROMPT TYPES
// ============================================================================

export interface Prompt {
  id: string;
  name: string;
  display_name: string;
  description: string;
  domain: string;
  system_prompt: string;
  user_prompt_template?: string;
  suite?: string;
  is_favorite?: boolean;
  category?: string;
  complexity_level?: 'simple' | 'moderate' | 'complex' | 'expert';
  status?: 'active' | 'inactive' | 'deprecated';
  metadata?: PromptMetadata;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface PromptMetadata {
  pattern?: PromptPattern;
  tags?: string[];
  source?: 'prompts' | 'dh_prompt';
  unique_id?: string;
  suite?: string;
  workflow?: string;
  sub_suite?: string;
  complexity?: ComplexityLevel;
  task_id_reference?: string;
  task_name?: string;
  [key: string]: any;
}

export type PromptPattern =
  | 'CoT'           // Chain of Thought
  | 'Few-Shot'      // Few-Shot Learning
  | 'ReAct'         // Reasoning + Acting
  | 'Direct'        // Direct Prompting
  | 'RAG'           // Retrieval Augmented Generation
  | 'Zero-Shot'     // Zero-Shot Learning
  | 'Chain'         // Chain Prompting
  | 'Tree'          // Tree of Thoughts
  | 'Other';

export type ComplexityLevel = 'Basic' | 'Intermediate' | 'Advanced' | 'Expert';

// ============================================================================
// PROMPT SUITE TYPES
// ============================================================================

export interface PromptSuite {
  id: string;
  name: string;
  description: string;
  color: string;
  category: string;
  function: SuiteFunction;
  statistics: SuiteStatistics;
  metadata?: SuiteMetadata;
}

export interface SuiteMetadata {
  acronym?: string;
  full_name?: string;
  tagline?: string;
  domain?: string;
  prompt_count?: number;
  complexity_levels?: ComplexityLevel[];
  key_areas?: string[];
  target_roles?: string[];
  dhSuiteId?: string;
  uniqueId?: string;
  [key: string]: any;
}

export interface SuiteStatistics {
  totalPrompts: number;
  subsuites: number;
  avgComplexity?: ComplexityLevel;
  patterns?: Record<PromptPattern, number>;
}

export type SuiteFunction =
  | 'REGULATORY'
  | 'CLINICAL'
  | 'SAFETY'
  | 'HEOR'
  | 'MEDICAL_AFFAIRS'
  | 'DATA_ANALYTICS'
  | 'BUSINESS_DEV'
  | 'OPERATIONS'
  | 'DIGITAL_HEALTH';

// ============================================================================
// PROMPT SUBSUITE TYPES
// ============================================================================

export interface PromptSubsuite {
  id: string;
  suite_id?: string;
  unique_id: string;
  name: string;
  description: string;
  tags?: string[];
  metadata?: SubsuiteMetadata;
  position: number;
  statistics: SubsuiteStatistics;
}

export interface SubsuiteMetadata {
  acronym?: string;
  full_expansion?: string;
  suite?: string;
  key_activities?: string[];
  complexity_range?: ComplexityLevel[];
  [key: string]: any;
}

export interface SubsuiteStatistics {
  promptCount: number;
  avgComplexity?: ComplexityLevel;
  patterns?: Record<PromptPattern, number>;
}

// ============================================================================
// VIEW TYPES
// ============================================================================

export type ViewMode = 'dashboard' | 'suite' | 'board' | 'list' | 'table';

export interface ViewState {
  mode: ViewMode;
  selectedSuite?: string;
  selectedSubsuite?: string;
  searchTerm: string;
  selectedPattern: PromptPattern | 'all';
  selectedComplexity: ComplexityLevel | 'all';
  sortBy: SortOption;
  sortDirection: 'asc' | 'desc';
}

export type SortOption =
  | 'name'
  | 'created_at'
  | 'updated_at'
  | 'complexity'
  | 'pattern'
  | 'popularity';

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface PromptFilters {
  suites: string[];
  subsuites: string[];
  patterns: (PromptPattern | 'all')[];
  complexities: (ComplexityLevel | 'all')[];
  tags: string[];
  domains: string[];
  search: string;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
  icon?: React.ReactNode;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface PromptsResponse {
  success: boolean;
  prompts: Prompt[];
  count: number;
  error?: string;
}

export interface SuitesResponse {
  success: boolean;
  suites: PromptSuite[];
  error?: string;
}

export interface SubsuitesResponse {
  success: boolean;
  suite: {
    id: string;
    unique_id: string;
    name: string;
    description: string;
    metadata: SuiteMetadata;
  };
  subsuites: PromptSubsuite[];
  error?: string;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface PromptCardProps {
  prompt: Prompt;
  onCopy: (prompt: Prompt) => void;
  onFavorite?: (prompt: Prompt) => void;
  onView?: (prompt: Prompt) => void;
  compact?: boolean;
}

export interface SuiteCardProps {
  suite: PromptSuite;
  onClick: (suite: PromptSuite) => void;
  selected?: boolean;
}

export interface SubsuiteCardProps {
  subsuite: PromptSubsuite;
  onClick: (subsuite: PromptSubsuite) => void;
  selected?: boolean;
}

export interface PromptTableRow {
  id: string;
  name: string;
  suite: string;
  subsuite?: string;
  pattern: PromptPattern;
  complexity: ComplexityLevel;
  tags: string[];
  created_at: string;
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface NavigationState {
  breadcrumbs: BreadcrumbItem[];
  canGoBack: boolean;
  canGoForward: boolean;
}

// ============================================================================
// STATISTICS TYPES
// ============================================================================

export interface DashboardStats {
  totalPrompts: number;
  totalSuites: number;
  totalSubsuites: number;
  patternDistribution: Record<PromptPattern, number>;
  complexityDistribution: Record<ComplexityLevel, number>;
  recentlyAdded: number;
  mostPopular: Prompt[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const PRISM_SUITES = [
  { name: 'RULES™', description: 'Regulatory Excellence', color: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600' },
  { name: 'TRIALS™', description: 'Clinical Development', color: 'bg-indigo-500', gradient: 'from-indigo-500 to-indigo-600' },
  { name: 'GUARD™', description: 'Safety Framework', color: 'bg-red-500', gradient: 'from-red-500 to-red-600' },
  { name: 'VALUE™', description: 'Market Access', color: 'bg-green-500', gradient: 'from-green-500 to-green-600' },
  { name: 'BRIDGE™', description: 'Stakeholder Engagement', color: 'bg-cyan-500', gradient: 'from-cyan-500 to-cyan-600' },
  { name: 'PROOF™', description: 'Evidence Analytics', color: 'bg-teal-500', gradient: 'from-teal-500 to-teal-600' },
  { name: 'CRAFT™', description: 'Medical Writing', color: 'bg-orange-500', gradient: 'from-orange-500 to-orange-600' },
  { name: 'SCOUT™', description: 'Competitive Intelligence', color: 'bg-purple-500', gradient: 'from-purple-500 to-purple-600' },
  { name: 'PROJECT™', description: 'Project Management Excellence', color: 'bg-amber-500', gradient: 'from-amber-500 to-amber-600' },
  { name: 'FORGE™', description: 'Digital Health Development', color: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600' },
] as const;

export const PROMPT_PATTERNS: PromptPattern[] = [
  'CoT',
  'Few-Shot',
  'ReAct',
  'Direct',
  'RAG',
  'Zero-Shot',
  'Chain',
  'Tree',
  'Other',
];

export const COMPLEXITY_LEVELS: ComplexityLevel[] = [
  'Basic',
  'Intermediate',
  'Advanced',
  'Expert',
];
