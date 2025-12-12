/**
 * Shared types for Agent Edit Form tabs
 * Extracted from agent-edit-form-enhanced.tsx for modularity
 */

import type {
  Agent,
  AgentLevelNumber,
  AgentEditFormState,
  AgentSuccessCriteria,
  DataClassification,
  ExpertiseLevel,
  GeographicScope,
  ResponseFormat,
  PersonaArchetypeCode,
  CommunicationStyleCode,
  SubagentHierarchyConfig,
} from '../../types/agent.types';

// ============================================================================
// DROPDOWN OPTIONS
// ============================================================================

export interface DropdownOption {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  category?: string;
  capability_id?: string;
  tenant_id?: string;
  function_id?: string;
  department_id?: string;
}

export interface AvatarOption {
  id: string;
  filename: string;
  public_url: string;
  persona_type?: string;
  business_function?: string;
  display_name?: string;
  primary_color?: string;
}

export interface PersonalityTypeOption {
  id: string;
  name: string;
  slug: string;
  display_name: string;
  description?: string;
  style: string;
  temperature: number;
  icon?: string;
  color?: string;
  category?: string;
  tone_keywords?: string[];
  communication_style?: string;
  reasoning_approach?: string;
}

export interface PromptStarterOption {
  id: string;
  title: string;
  prompt_text: string;
  description?: string;
  category?: string;
  icon?: string;
  sort_order?: number;
}

export interface ToolOption {
  id: string;
  name: string;
  description?: string;
  tool_type?: string;
  category?: string;
}

export interface LevelOption {
  id: string;
  level_number: number;
  name: string;
  description?: string;
  slug?: string;
}

// ============================================================================
// FORM STATE
// ============================================================================

export interface EditFormOptions {
  functions: DropdownOption[];
  departments: DropdownOption[];
  roles: DropdownOption[];
  capabilities: DropdownOption[];
  skills: DropdownOption[];
  knowledgeDomains: DropdownOption[];
  avatars: AvatarOption[];
  personalityTypes: PersonalityTypeOption[];
  promptStarters: PromptStarterOption[];
  tools: ToolOption[];
  levels: LevelOption[];
  /** Available agents for hierarchy selection (simplified type for dropdown compatibility) */
  allAgents: Array<{ id: string; name: string; agent_level_id?: string }>;
}

export interface EditFormTabProps {
  formState: AgentEditFormState;
  updateField: <K extends keyof AgentEditFormState>(field: K, value: AgentEditFormState[K]) => void;
  updateMultipleFields: (updates: Partial<AgentEditFormState>) => void;
  options: EditFormOptions;
  isLoading?: boolean;
  agent?: Agent | null;
}

// ============================================================================
// PERSONALITY PRESETS
// ============================================================================

export const PERSONALITY_STYLE_PRESETS: Record<string, {
  personality_formality: number;
  personality_empathy: number;
  personality_directness: number;
  personality_detail_orientation: number;
  personality_proactivity: number;
  personality_risk_tolerance: number;
  comm_verbosity: number;
  comm_technical_level: number;
  comm_warmth: number;
}> = {
  analytical: {
    personality_formality: 85,
    personality_empathy: 25,
    personality_directness: 75,
    personality_detail_orientation: 90,
    personality_proactivity: 40,
    personality_risk_tolerance: 20,
    comm_verbosity: 60,
    comm_technical_level: 80,
    comm_warmth: 30,
  },
  strategic: {
    personality_formality: 70,
    personality_empathy: 45,
    personality_directness: 65,
    personality_detail_orientation: 70,
    personality_proactivity: 85,
    personality_risk_tolerance: 50,
    comm_verbosity: 55,
    comm_technical_level: 65,
    comm_warmth: 45,
  },
  creative: {
    personality_formality: 40,
    personality_empathy: 55,
    personality_directness: 50,
    personality_detail_orientation: 50,
    personality_proactivity: 75,
    personality_risk_tolerance: 70,
    comm_verbosity: 65,
    comm_technical_level: 40,
    comm_warmth: 65,
  },
  innovator: {
    personality_formality: 30,
    personality_empathy: 45,
    personality_directness: 70,
    personality_detail_orientation: 40,
    personality_proactivity: 95,
    personality_risk_tolerance: 90,
    comm_verbosity: 55,
    comm_technical_level: 50,
    comm_warmth: 55,
  },
  empathetic: {
    personality_formality: 45,
    personality_empathy: 95,
    personality_directness: 35,
    personality_detail_orientation: 55,
    personality_proactivity: 50,
    personality_risk_tolerance: 30,
    comm_verbosity: 65,
    comm_technical_level: 30,
    comm_warmth: 90,
  },
  pragmatic: {
    personality_formality: 60,
    personality_empathy: 35,
    personality_directness: 80,
    personality_detail_orientation: 55,
    personality_proactivity: 75,
    personality_risk_tolerance: 45,
    comm_verbosity: 40,
    comm_technical_level: 55,
    comm_warmth: 40,
  },
  cautious: {
    personality_formality: 80,
    personality_empathy: 40,
    personality_directness: 45,
    personality_detail_orientation: 85,
    personality_proactivity: 30,
    personality_risk_tolerance: 10,
    comm_verbosity: 70,
    comm_technical_level: 70,
    comm_warmth: 35,
  },
  collaborative: {
    personality_formality: 55,
    personality_empathy: 80,
    personality_directness: 40,
    personality_detail_orientation: 55,
    personality_proactivity: 65,
    personality_risk_tolerance: 45,
    comm_verbosity: 60,
    comm_technical_level: 45,
    comm_warmth: 80,
  },
  scientific: {
    personality_formality: 90,
    personality_empathy: 25,
    personality_directness: 70,
    personality_detail_orientation: 95,
    personality_proactivity: 35,
    personality_risk_tolerance: 15,
    comm_verbosity: 75,
    comm_technical_level: 90,
    comm_warmth: 25,
  },
  executive: {
    personality_formality: 75,
    personality_empathy: 30,
    personality_directness: 90,
    personality_detail_orientation: 40,
    personality_proactivity: 90,
    personality_risk_tolerance: 55,
    comm_verbosity: 30,
    comm_technical_level: 60,
    comm_warmth: 35,
  },
  technical: {
    personality_formality: 80,
    personality_empathy: 20,
    personality_directness: 65,
    personality_detail_orientation: 95,
    personality_proactivity: 40,
    personality_risk_tolerance: 25,
    comm_verbosity: 65,
    comm_technical_level: 95,
    comm_warmth: 20,
  },
  educational: {
    personality_formality: 55,
    personality_empathy: 75,
    personality_directness: 45,
    personality_detail_orientation: 80,
    personality_proactivity: 70,
    personality_risk_tolerance: 25,
    comm_verbosity: 75,
    comm_technical_level: 35,
    comm_warmth: 70,
  },
};

// ============================================================================
// MODEL RECOMMENDATIONS
// ============================================================================

export const MODEL_RECOMMENDATIONS = {
  1: { model: 'gpt-4', temperature: 0.3, maxTokens: 4000 },
  2: { model: 'gpt-4', temperature: 0.4, maxTokens: 3000 },
  3: { model: 'gpt-4-turbo', temperature: 0.5, maxTokens: 2500 },
  4: { model: 'gpt-3.5-turbo', temperature: 0.6, maxTokens: 2000 },
  5: { model: 'gpt-3.5-turbo', temperature: 0.7, maxTokens: 1500 },
} as const;

export type AgentLevel = keyof typeof MODEL_RECOMMENDATIONS;
