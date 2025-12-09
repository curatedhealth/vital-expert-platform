/**
 * v0 Integration Types for VITAL Platform
 * 
 * Type definitions for v0 AI-powered UI generation integration.
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
 * Workflow context passed to v0 for generating workflow-related components
 */
export interface V0WorkflowContext {
  /** Name of the workflow */
  name: string;
  /** Domain category (e.g., 'MA' for Medical Affairs) */
  domain: string;
  /** Existing node types in the workflow */
  existingNodes: string[];
  /** Current task being worked on (if applicable) */
  currentTask?: string;
  /** Workflow complexity level */
  complexity?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
}

/**
 * Agent context passed to v0 for generating agent-related components
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
 * Example prompts for each generation type
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
 * Configuration for v0 generation type
 */
export interface V0GenerationTypeConfig {
  /** Type ID */
  id: V0GenerationType;
  /** Display label */
  label: string;
  /** Description */
  description: string;
  /** Icon name (lucide-react) */
  icon: string;
  /** Example prompts */
  examples: V0PromptExample[];
  /** System prompt additions for this type */
  systemPromptAdditions: string;
}

/**
 * VITAL-specific prompt enhancements
 */
export const VITAL_DESIGN_CONTEXT = `
You are generating UI components for VITAL, a healthcare/pharma business intelligence platform.

VITAL DESIGN SYSTEM:
- Framework: React 18 + TypeScript + Next.js 14
- Styling: Tailwind CSS
- Components: shadcn/ui (Button, Card, Badge, Input, Dialog, Tabs, etc.)
- Icons: lucide-react
- State: Zustand for global state, React Query for server state
- Colors: Professional healthcare palette
  - Primary: Blue (#2563eb), Purple (#7c3aed)
  - Success: Green (#22c55e)
  - Warning: Orange (#f97316)
  - Clinical Green: #059669
  - Trust Blue: #0ea5e9
  - Regulatory Gold: #eab308
- Typography: Clean, professional, accessible
- Must support dark mode (use Tailwind dark: prefix)
- Must be accessible (WCAG 2.1 AA compliant)

IMPORTANT REQUIREMENTS:
- Generate production-ready TypeScript code
- Include all necessary imports from the correct packages
- Use proper TypeScript interfaces for all props
- Add JSDoc comments for complex functions
- Follow React best practices (hooks, composition)
- Use shadcn/ui components where applicable
- Implement proper loading and error states
`;

/**
 * Medical Affairs specific context for v0
 */
export const MEDICAL_AFFAIRS_CONTEXT = `
MEDICAL AFFAIRS DOMAIN CONTEXT:
This component is for Medical Affairs professionals working on:
- KOL (Key Opinion Leader) engagement and management
- Scientific communications and publications
- Medical information and inquiries
- Field medical team activities
- Advisory board management
- Congress and conference activities
- Evidence generation and dissemination

KEY UI PATTERNS FOR MEDICAL AFFAIRS:
- Expert/KOL cards with influence metrics
- Publication tracking visualizations
- Compliance status indicators (green/yellow/red)
- Engagement timelines and histories
- Network graphs for relationship mapping
- Document/artifact cards with status badges
- Action item trackers with owners and deadlines
`;


