/**
 * Shared types for persona components
 * Updated to support MECE persona framework
 */

// MECE Archetype types
export type PersonaArchetype = 'AUTOMATOR' | 'ORCHESTRATOR' | 'LEARNER' | 'SKEPTIC';
export type ServiceLayer = 'L1_expert' | 'L2_panel' | 'L3_workflow' | 'L4_solution';

export interface Persona {
  id: string;
  slug: string;
  name: string;
  title?: string;
  tagline?: string;
  one_liner?: string;
  archetype?: string;
  persona_type?: string;
  seniority_level?: string;
  
  // Org structure
  department_id?: string;
  department_slug?: string;
  department_name?: string;
  function_id?: string;
  function_slug?: string;
  function_name?: string;
  role_id?: string;
  role_slug?: string;
  role_name?: string;
  
  // Demographics
  age_range?: string;
  years_of_experience?: string | number;
  education_level?: string;
  geographic_scope?: string;
  
  // MECE Archetype attributes
  ai_readiness_score?: number;
  work_complexity_score?: number;
  derived_archetype?: PersonaArchetype;
  preferred_service_layer?: ServiceLayer;
  
  // Work mix
  project_work_ratio?: number;
  bau_work_ratio?: number;
  work_dominance?: string;
  
  // OKR ownership
  owned_okr_count?: number;
  contributed_okr_count?: number;
  
  // Goals & Challenges (JSONB arrays)
  goals?: string[];
  challenges?: string[];
  motivations?: string[];
  frustrations?: string[];
  
  // Professional context
  daily_activities?: string[];
  tools_used?: string[];
  skills?: string[];
  competencies?: string[];
  success_metrics?: string[];
  
  // Pharma-specific
  gxp_requirements?: string[];
  regulatory_context?: string[];
  therapeutic_areas?: string[];
  
  // Quality
  data_quality_score?: number;
  
  // Metadata
  is_active?: boolean;
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
  
  // Counts
  jtbds_count?: number;
  goals_count?: number;
  challenges_count?: number;
  motivations_count?: number;
  frustrations_count?: number;
}

export interface PersonaStats {
  total: number;
  totalRoles?: number;
  totalDepartments?: number;
  totalFunctions?: number;
  byRole: Record<string, number>;
  byDepartment: Record<string, number>;
  byFunction: Record<string, number>;
  bySeniority: Record<string, number>;
  // MECE stats
  byArchetype?: Record<string, number>;
  byServiceLayer?: Record<string, number>;
  avgAiReadiness?: number;
  avgWorkComplexity?: number;
}

export interface PersonaFiltersType {
  searchQuery: string;
  selectedRole: string;
  selectedDepartment: string;
  selectedFunction: string;
  selectedSeniority: string;
  selectedArchetype?: string;
  selectedServiceLayer?: string;
}

// Backward compatibility alias
export type PersonaFilters = PersonaFiltersType;

// Archetype descriptions for UI
export const ARCHETYPE_INFO: Record<PersonaArchetype, { label: string; description: string; color: string; bgColor: string }> = {
  AUTOMATOR: {
    label: 'Automator',
    description: 'High AI readiness + Low complexity: Efficiency-focused, automation champions',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  ORCHESTRATOR: {
    label: 'Orchestrator', 
    description: 'High AI readiness + High complexity: Strategic leaders, AI power users',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
  },
  LEARNER: {
    label: 'Learner',
    description: 'Low AI readiness + Low complexity: Building skills, needs guidance',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
  },
  SKEPTIC: {
    label: 'Skeptic',
    description: 'Low AI readiness + High complexity: Proof-driven, values multiple perspectives',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
  },
};

export const SERVICE_LAYER_INFO: Record<ServiceLayer, { label: string; description: string }> = {
  L1_expert: {
    label: 'L1 Expert',
    description: 'Quick expert answers with optional human review',
  },
  L2_panel: {
    label: 'L2 Panel',
    description: 'Multi-expert panel for diverse perspectives',
  },
  L3_workflow: {
    label: 'L3 Workflow',
    description: 'Guided workflow with automation and HITL checkpoints',
  },
  L4_solution: {
    label: 'L4 Solution',
    description: 'Full end-to-end solution with orchestration',
  },
};

