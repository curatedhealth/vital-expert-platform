/**
 * v0 Integration Types for VITAL AI UI
 * 
 * Type definitions for v0 AI-powered UI generation components.
 * Used across all v0 integration features in the VITAL platform.
 * 
 * @package @vital/ai-ui/v0
 */

/**
 * Types of UI components that can be generated with v0
 */
export type V0GenerationType = 
  | 'workflow-node'     // Custom node for workflow designer
  | 'agent-card'        // AI agent display card
  | 'panel-ui'          // Multi-expert panel interface
  | 'visualization'     // Data visualization component
  | 'dashboard'         // Dashboard layout
  | 'form'              // Custom form component
  | 'table';            // Data table component

/**
 * Generation status for tracking progress
 */
export type V0GenerationStatus = 
  | 'idle'
  | 'generating'
  | 'success'
  | 'error'
  | 'refining';

/**
 * Workflow context for generating workflow-related components
 */
export interface V0WorkflowContext {
  /** Name of the workflow */
  name: string;
  /** Domain category (e.g., 'MA' for Medical Affairs) */
  domain: string;
  /** Existing node types in the workflow */
  existingNodes: string[];
  /** Current task being worked on */
  currentTask?: string;
  /** Workflow complexity level */
  complexity?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
}

/**
 * Agent context for generating agent-related components
 */
export interface V0AgentContext {
  /** Agent name */
  name: string;
  /** Agent tier (1, 2, or 3) */
  tier: string;
  /** Agent capabilities */
  capabilities: string[];
  /** Knowledge domains */
  knowledgeDomains?: string[];
  /** Agent description */
  description?: string;
}

/**
 * Panel context for generating panel discussion UIs
 */
export interface V0PanelContext {
  /** Panel topic */
  topic: string;
  /** Number of experts */
  expertCount: number;
  /** Expert specializations */
  specializations: string[];
  /** Discussion type */
  discussionType?: 'debate' | 'consensus' | 'analysis';
}

/**
 * Full context object passed to v0 generation
 */
export interface V0GenerationContext {
  /** Workflow context (for workflow-node type) */
  workflow?: V0WorkflowContext;
  /** Agent context (for agent-card type) */
  agent?: V0AgentContext;
  /** Panel context (for panel-ui type) */
  panel?: V0PanelContext;
  /** Chat ID for refinement iterations */
  chatId?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Request payload for v0 generation API
 */
export interface V0GenerationRequest {
  /** Type of component to generate */
  type: V0GenerationType;
  /** User's natural language prompt */
  prompt: string;
  /** Optional context for better generation */
  context?: V0GenerationContext;
}

/**
 * Response from v0 generation API
 */
export interface V0GenerationResponse {
  /** Whether generation was successful */
  success: boolean;
  /** v0 chat ID for this generation session */
  chatId: string;
  /** URL to preview the generated component */
  previewUrl: string;
  /** Type of generation performed */
  generationType: V0GenerationType;
  /** Timestamp of generation */
  timestamp: string;
  /** Error message if generation failed */
  error?: string;
  /** Generated code (if extracted) */
  code?: string;
}

/**
 * History entry for tracking generations
 */
export interface V0GenerationHistoryEntry {
  /** Unique ID for this entry */
  id: string;
  /** v0 chat ID */
  chatId: string;
  /** Original prompt */
  prompt: string;
  /** Generation type */
  type: V0GenerationType;
  /** Preview URL */
  previewUrl: string;
  /** Timestamp */
  timestamp: string;
  /** Status */
  status: 'success' | 'error';
  /** Number of refinement iterations */
  refinementCount: number;
  /** Whether this was added to the workflow/project */
  applied: boolean;
}

/**
 * Example prompts for a generation type
 */
export interface V0PromptExample {
  /** Short label for the example */
  label: string;
  /** Full prompt text */
  prompt: string;
  /** Category/domain */
  category: string;
}

/**
 * Configuration for a generation type
 */
export interface V0GenerationTypeConfig {
  /** Type ID */
  id: V0GenerationType;
  /** Display label */
  label: string;
  /** Description */
  description: string;
  /** Icon name from lucide-react */
  iconName: string;
  /** Color class for text */
  color: string;
  /** Background color class */
  bgColor: string;
  /** Example prompts */
  examples: V0PromptExample[];
}

/**
 * State for v0 generation hook
 */
export interface V0GenerationState {
  /** Current status */
  status: V0GenerationStatus;
  /** Current result (if any) */
  result: V0GenerationResponse | null;
  /** Error message (if any) */
  error: string | null;
  /** Generation history for current session */
  history: V0GenerationHistoryEntry[];
}

/**
 * Props for VitalV0PreviewFrame component
 */
export interface VitalV0PreviewFrameProps {
  /** URL to preview (from v0 chat.demo) */
  previewUrl: string;
  /** Chat ID for this session */
  chatId?: string;
  /** Title for the preview */
  title?: string;
  /** Whether the preview is loading */
  isLoading?: boolean;
  /** Whether to show in fullscreen mode */
  fullscreen?: boolean;
  /** Callback when fullscreen state changes */
  onFullscreenChange?: (fullscreen: boolean) => void;
  /** Callback when external open is clicked */
  onOpenExternal?: (url: string) => void;
  /** Callback when refresh is clicked */
  onRefresh?: () => void;
  /** Custom class name */
  className?: string;
}

/**
 * Props for VitalV0GeneratorPanel component
 */
export interface VitalV0GeneratorPanelProps {
  /** Default generation type */
  defaultType?: V0GenerationType;
  /** Workflow context for generation */
  workflowContext?: V0WorkflowContext;
  /** Agent context for generation */
  agentContext?: V0AgentContext;
  /** Panel context for generation */
  panelContext?: V0PanelContext;
  /** Callback when generation completes */
  onGenerationComplete?: (result: V0GenerationResponse) => void;
  /** Callback when code is extracted */
  onCodeExtracted?: (code: string) => void;
  /** Custom API endpoint */
  apiEndpoint?: string;
  /** Custom class name */
  className?: string;
}

/**
 * Props for VitalV0PromptInput component
 */
export interface VitalV0PromptInputProps {
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Submit handler */
  onSubmit: () => void;
  /** Generation type for context-aware placeholder */
  generationType: V0GenerationType;
  /** Whether currently generating */
  isGenerating?: boolean;
  /** Example prompts to show */
  examples?: V0PromptExample[];
  /** Custom class name */
  className?: string;
}

/**
 * Props for VitalV0TypeSelector component
 */
export interface VitalV0TypeSelectorProps {
  /** Currently selected type */
  selectedType: V0GenerationType;
  /** Change handler */
  onTypeChange: (type: V0GenerationType) => void;
  /** Available types (defaults to all) */
  availableTypes?: V0GenerationType[];
  /** Custom class name */
  className?: string;
}

/**
 * Props for VitalV0HistoryPanel component
 */
export interface VitalV0HistoryPanelProps {
  /** History entries */
  history: V0GenerationHistoryEntry[];
  /** Currently selected entry */
  selectedId?: string;
  /** Selection handler */
  onSelect?: (entry: V0GenerationHistoryEntry) => void;
  /** Delete handler */
  onDelete?: (id: string) => void;
  /** Apply handler */
  onApply?: (entry: V0GenerationHistoryEntry) => void;
  /** Custom class name */
  className?: string;
}






