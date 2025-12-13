/**
 * VITAL AI UI - Asset Constants
 *
 * Configuration constants for unified asset components.
 * Combines tool, skill, and workflow configurations.
 */

import {
  // General
  Wrench,
  Sparkles,
  Workflow,
  MessageSquare,
  Bot,
  FileText,
  Database,
  // Categories
  Target,
  Users,
  BarChart3,
  FileSearch,
  CheckCircle2,
  Cog,
  Layers,
  Lightbulb,
  Code,
  Brain,
  Clock,
  Zap,
  AlertCircle,
  Shield,
  Heart,
  Microscope,
  Activity,
  TrendingUp,
  Lock,
  Beaker,
} from 'lucide-react';
import type {
  AssetType,
  AssetCategoryConfig,
  AssetLifecycleConfig,
  AssetComplexityConfig,
  AssetKanbanColumn,
  VitalAsset,
} from './types';

// ============================================================================
// ASSET TYPE CONFIGURATION
// ============================================================================

export const ASSET_TYPE_CONFIG: Record<AssetType, { icon: typeof Wrench; label: string; color: string; bgColor: string }> = {
  tool: {
    icon: Wrench,
    label: 'Tool',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
  },
  skill: {
    icon: Sparkles,
    label: 'Skill',
    color: 'text-purple-800',
    bgColor: 'bg-purple-100',
  },
  workflow: {
    icon: Workflow,
    label: 'Workflow',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
  },
  prompt: {
    icon: MessageSquare,
    label: 'Prompt',
    color: 'text-orange-800',
    bgColor: 'bg-orange-100',
  },
  agent: {
    icon: Bot,
    label: 'Agent',
    color: 'text-indigo-800',
    bgColor: 'bg-indigo-100',
  },
  template: {
    icon: FileText,
    label: 'Template',
    color: 'text-slate-800',
    bgColor: 'bg-slate-100',
  },
};

// ============================================================================
// CATEGORY CONFIGURATION (Unified from tools + skills)
// ============================================================================

export const ASSET_CATEGORIES: Record<string, AssetCategoryConfig> = {
  // === SKILL CATEGORIES ===
  'Planning': {
    icon: Target,
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    description: 'Strategic planning and task decomposition'
  },
  'Delegation': {
    icon: Users,
    color: 'text-indigo-800',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-200',
    description: 'Work distribution and coordination'
  },
  'Analysis': {
    icon: BarChart3,
    color: 'text-purple-800',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    description: 'Data analysis and insight extraction'
  },
  'Search': {
    icon: FileSearch,
    color: 'text-cyan-800',
    bgColor: 'bg-cyan-100',
    borderColor: 'border-cyan-200',
    description: 'Information retrieval and research'
  },
  'Generation': {
    icon: Sparkles,
    color: 'text-pink-800',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-200',
    description: 'Content creation and synthesis'
  },
  'Validation': {
    icon: CheckCircle2,
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    description: 'Quality assurance and verification'
  },
  'Communication': {
    icon: MessageSquare,
    color: 'text-orange-800',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
    description: 'Information sharing and reporting'
  },
  'Data Retrieval': {
    icon: Database,
    color: 'text-amber-800',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
    description: 'Database and API interactions'
  },
  'Execution': {
    icon: Cog,
    color: 'text-stone-800',
    bgColor: 'bg-stone-100',
    borderColor: 'border-stone-200',
    description: 'Task execution and automation'
  },
  'File Operations': {
    icon: Layers,
    color: 'text-slate-800',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
    description: 'File handling and document processing'
  },
  'Creative & Design': {
    icon: Lightbulb,
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    description: 'Creative and design-related capabilities'
  },
  'Development & Technical': {
    icon: Code,
    color: 'text-emerald-800',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-200',
    description: 'Technical and development capabilities'
  },
  'Coding': {
    icon: Code,
    color: 'text-slate-800',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
    description: 'Software development and programming'
  },
  'Orchestration': {
    icon: Workflow,
    color: 'text-violet-800',
    bgColor: 'bg-violet-100',
    borderColor: 'border-violet-200',
    description: 'Process coordination and workflow management'
  },
  'Reasoning': {
    icon: Brain,
    color: 'text-rose-800',
    bgColor: 'bg-rose-100',
    borderColor: 'border-rose-200',
    description: 'Logical thinking and problem solving'
  },

  // === TOOL CATEGORIES ===
  'Evidence Research': {
    icon: Microscope,
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    description: 'Search and retrieve evidence from medical literature'
  },
  'Regulatory & Standards': {
    icon: Shield,
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    description: 'Access regulatory guidelines and compliance information'
  },
  'Digital Health': {
    icon: Heart,
    color: 'text-pink-800',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-200',
    description: 'Digital medicine resources and digital endpoints'
  },
  'Knowledge Management': {
    icon: Database,
    color: 'text-amber-800',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
    description: 'Internal knowledge bases and documentation'
  },
  'Computation': {
    icon: BarChart3,
    color: 'text-purple-800',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    description: 'Mathematical calculations and data analysis'
  },
  'General Research': {
    icon: FileSearch,
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    description: 'Web search and general information retrieval'
  },
  'General': {
    icon: Wrench,
    color: 'text-stone-800',
    bgColor: 'bg-stone-100',
    borderColor: 'border-stone-200',
    description: 'General purpose tools'
  },

  // === HEALTHCARE CATEGORIES ===
  'Healthcare/FHIR': {
    icon: Activity,
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    description: 'FHIR servers, EHR systems, interoperability'
  },
  'Healthcare/EHR': {
    icon: FileText,
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    description: 'Electronic Health Record platforms'
  },
  'Healthcare/Clinical NLP': {
    icon: Brain,
    color: 'text-purple-800',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    description: 'Clinical text processing and entity extraction'
  },
  'Healthcare/De-identification': {
    icon: Shield,
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    description: 'PHI removal and HIPAA compliance'
  },
  'Healthcare/RWE': {
    icon: BarChart3,
    color: 'text-orange-800',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
    description: 'Real-world evidence and OMOP CDM'
  },
  'Healthcare/CDS': {
    icon: Activity,
    color: 'text-pink-800',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-200',
    description: 'Clinical decision support'
  },
  'Research': {
    icon: Microscope,
    color: 'text-cyan-800',
    bgColor: 'bg-cyan-100',
    borderColor: 'border-cyan-200',
    description: 'Academic and medical literature search'
  },

  // === STRATEGIC INTELLIGENCE ===
  'Strategic Intelligence': {
    icon: TrendingUp,
    color: 'text-emerald-800',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-200',
    description: 'Strategic intelligence and foresight tools'
  },

  // === DIGITAL HEALTH TOOL CATEGORIES ===
  'STATISTICAL_SOFTWARE': {
    icon: BarChart3,
    color: 'text-violet-800',
    bgColor: 'bg-violet-100',
    borderColor: 'border-violet-200',
    description: 'Statistical analysis and data science tools'
  },
  'EDC_SYSTEM': {
    icon: FileText,
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    description: 'Electronic Data Capture systems'
  },
  'CTMS': {
    icon: Activity,
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    description: 'Clinical Trial Management Systems'
  },
  'REGULATORY_SUBMISSION': {
    icon: Shield,
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    description: 'Regulatory submission software'
  },
  'AI_ORCHESTRATION': {
    icon: Brain,
    color: 'text-indigo-800',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-200',
    description: 'AI workflow orchestration tools'
  },

  // === ACADEMIC CATEGORIES ===
  'Academic/Literature': {
    icon: Microscope,
    color: 'text-cyan-800',
    bgColor: 'bg-cyan-100',
    borderColor: 'border-cyan-200',
    description: 'Academic literature search and analysis'
  },
  'Academic/Clinical Trials': {
    icon: Beaker,
    color: 'text-teal-800',
    bgColor: 'bg-teal-100',
    borderColor: 'border-teal-200',
    description: 'Clinical trials databases and registries'
  },
};

// Default category for unknown categories
export const DEFAULT_CATEGORY: AssetCategoryConfig = {
  icon: Database,
  color: 'text-stone-800',
  bgColor: 'bg-stone-100',
  borderColor: 'border-stone-200',
  description: 'General asset'
};

// ============================================================================
// LIFECYCLE CONFIGURATION
// ============================================================================

export const LIFECYCLE_BADGES: Record<string, AssetLifecycleConfig> = {
  production: {
    icon: CheckCircle2,
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    label: 'Production'
  },
  staging: {
    icon: TrendingUp,
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    label: 'Staging'
  },
  testing: {
    icon: Clock,
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    label: 'Testing'
  },
  development: {
    icon: Cog,
    color: 'text-stone-800',
    bgColor: 'bg-stone-100',
    label: 'Development'
  },
  deprecated: {
    icon: AlertCircle,
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    label: 'Deprecated'
  },
};

// ============================================================================
// COMPLEXITY CONFIGURATION (for skills)
// ============================================================================

export const COMPLEXITY_BADGES: Record<string, AssetComplexityConfig> = {
  basic: {
    icon: CheckCircle2,
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    label: 'Basic'
  },
  intermediate: {
    icon: Clock,
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    label: 'Intermediate'
  },
  advanced: {
    icon: Zap,
    color: 'text-orange-800',
    bgColor: 'bg-orange-100',
    label: 'Advanced'
  },
  expert: {
    icon: AlertCircle,
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    label: 'Expert'
  },
};

// ============================================================================
// IMPLEMENTATION TYPE CONFIGURATION
// ============================================================================

export const IMPLEMENTATION_BADGES: Record<string, { color: string; bgColor: string; label: string }> = {
  prompt: {
    color: 'text-purple-800',
    bgColor: 'bg-purple-100',
    label: 'Prompt'
  },
  tool: {
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    label: 'Tool'
  },
  workflow: {
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    label: 'Workflow'
  },
  agent_graph: {
    color: 'text-orange-800',
    bgColor: 'bg-orange-100',
    label: 'Agent Graph'
  },
  function: {
    color: 'text-slate-800',
    bgColor: 'bg-slate-100',
    label: 'Function'
  },
  api: {
    color: 'text-cyan-800',
    bgColor: 'bg-cyan-100',
    label: 'API'
  },
  mcp: {
    color: 'text-indigo-800',
    bgColor: 'bg-indigo-100',
    label: 'MCP'
  },
  langchain_tool: {
    color: 'text-violet-800',
    bgColor: 'bg-violet-100',
    label: 'LangChain'
  },
};

// ============================================================================
// DEFAULT KANBAN COLUMNS (by lifecycle stage)
// ============================================================================

export const DEFAULT_KANBAN_COLUMNS: AssetKanbanColumn[] = [
  {
    id: 'development',
    title: 'Development',
    filter: (asset: VitalAsset) => asset.lifecycle_stage === 'development',
    color: 'text-stone-800',
    bgColor: 'bg-stone-50',
  },
  {
    id: 'testing',
    title: 'Testing',
    filter: (asset: VitalAsset) => asset.lifecycle_stage === 'testing',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-50',
  },
  {
    id: 'staging',
    title: 'Staging',
    filter: (asset: VitalAsset) => asset.lifecycle_stage === 'staging',
    color: 'text-blue-800',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'production',
    title: 'Production',
    filter: (asset: VitalAsset) => asset.lifecycle_stage === 'production',
    color: 'text-green-800',
    bgColor: 'bg-green-50',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get category configuration for a given category name
 */
export function getCategoryConfig(category?: string): AssetCategoryConfig {
  if (!category) return DEFAULT_CATEGORY;
  return ASSET_CATEGORIES[category] || DEFAULT_CATEGORY;
}

/**
 * Get lifecycle configuration for a given stage
 */
export function getLifecycleConfig(stage?: string): AssetLifecycleConfig | null {
  if (!stage) return null;
  return LIFECYCLE_BADGES[stage] || null;
}

/**
 * Get complexity configuration for a given level
 */
export function getComplexityConfig(level?: string): AssetComplexityConfig | null {
  if (!level) return null;
  return COMPLEXITY_BADGES[level] || null;
}

/**
 * Get implementation type configuration
 */
export function getImplementationConfig(type?: string) {
  if (!type) return null;
  return IMPLEMENTATION_BADGES[type] || null;
}

/**
 * Get asset type configuration
 */
export function getAssetTypeConfig(type: AssetType) {
  return ASSET_TYPE_CONFIG[type];
}
