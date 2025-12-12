/**
 * VITAL AI UI - Tool Constants
 *
 * Configuration constants for tool components.
 */

import {
  Search,
  Activity,
  Database,
  Shield,
  Microscope,
  FileText,
  Heart,
  Stethoscope,
  Brain,
  Lock,
  BarChart3,
  Image as ImageIcon,
  Dna,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  TrendingUp,
  Beaker,
  Wrench,
  Code,
  Cloud,
  Workflow,
} from 'lucide-react';
import type { ToolCategoryConfig, ToolLifecycleConfig, ToolLifecycleStage, ToolHealthStatus } from './types';

// ============================================================================
// CATEGORY CONFIGURATION
// ============================================================================

export const TOOL_CATEGORIES: Record<string, ToolCategoryConfig> = {
  // Main seeded categories
  'Evidence Research': {
    icon: Microscope,
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    description: 'Search and retrieve evidence from medical literature, clinical trials, and regulatory databases'
  },
  'Regulatory & Standards': {
    icon: Shield,
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    description: 'Access regulatory guidelines, standards, and compliance information'
  },
  'Digital Health': {
    icon: Heart,
    color: 'text-pink-800',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-200',
    description: 'Digital medicine resources, decentralized trials, and digital endpoints'
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
    icon: Search,
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    description: 'Web search and general information retrieval'
  },
  'General': {
    icon: Wrench,
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
    description: 'General purpose tools'
  },
  // Healthcare categories
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
  'Healthcare/Medical Imaging': {
    icon: ImageIcon,
    color: 'text-indigo-800',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-200',
    description: 'Medical imaging AI and analysis'
  },
  'Healthcare/Bioinformatics': {
    icon: Dna,
    color: 'text-teal-800',
    bgColor: 'bg-teal-100',
    borderColor: 'border-teal-200',
    description: 'Genomics and bioinformatics workflows'
  },
  'Healthcare/Data Quality': {
    icon: CheckCircle2,
    color: 'text-emerald-800',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-200',
    description: 'Data validation and quality assurance'
  },
  'Healthcare/CDS': {
    icon: Stethoscope,
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
  // Digital Health tool categories
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
  'AI_ORCHESTRATION': {
    icon: Brain,
    color: 'text-indigo-800',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-200',
    description: 'AI workflow orchestration tools'
  },
  'WORKFLOW_MANAGEMENT': {
    icon: Workflow,
    color: 'text-sky-800',
    bgColor: 'bg-sky-100',
    borderColor: 'border-sky-200',
    description: 'Workflow and task management'
  },
  // Strategic Intelligence
  'Strategic Intelligence': {
    icon: TrendingUp,
    color: 'text-emerald-800',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-200',
    description: 'Strategic intelligence and foresight tools'
  },
  // Academic
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
export const DEFAULT_TOOL_CATEGORY: ToolCategoryConfig = {
  icon: Wrench,
  color: 'text-gray-800',
  bgColor: 'bg-gray-100',
  borderColor: 'border-gray-200',
  description: 'General tool'
};

// ============================================================================
// LIFECYCLE CONFIGURATION
// ============================================================================

export const LIFECYCLE_BADGES: Record<ToolLifecycleStage, ToolLifecycleConfig> = {
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
    icon: AlertCircle,
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    label: 'Development'
  },
};

// ============================================================================
// HEALTH STATUS CONFIGURATION
// ============================================================================

export const HEALTH_STATUS_CONFIG: Record<ToolHealthStatus, { color: string; bgColor: string; label: string }> = {
  healthy: {
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    label: 'Healthy'
  },
  degraded: {
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    label: 'Degraded'
  },
  unhealthy: {
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    label: 'Unhealthy'
  },
  unknown: {
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    label: 'Unknown'
  },
};

// ============================================================================
// TOOL TYPE CONFIGURATION
// ============================================================================

export const TOOL_TYPE_CONFIG = {
  function: {
    icon: Code,
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    label: 'Function'
  },
  api: {
    icon: Cloud,
    color: 'text-purple-800',
    bgColor: 'bg-purple-100',
    label: 'API'
  },
  workflow: {
    icon: Workflow,
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    label: 'Workflow'
  },
  mcp: {
    icon: Brain,
    color: 'text-orange-800',
    bgColor: 'bg-orange-100',
    label: 'MCP'
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get category configuration for a given category name
 */
export function getCategoryConfig(category: string | undefined): ToolCategoryConfig {
  if (!category) return DEFAULT_TOOL_CATEGORY;
  return TOOL_CATEGORIES[category] || DEFAULT_TOOL_CATEGORY;
}

/**
 * Get lifecycle configuration for a given stage
 */
export function getLifecycleConfig(stage: ToolLifecycleStage | undefined): ToolLifecycleConfig {
  if (!stage) return LIFECYCLE_BADGES.development;
  return LIFECYCLE_BADGES[stage] || LIFECYCLE_BADGES.development;
}

/**
 * Get health status configuration
 */
export function getHealthConfig(status: ToolHealthStatus | undefined) {
  if (!status) return HEALTH_STATUS_CONFIG.unknown;
  return HEALTH_STATUS_CONFIG[status] || HEALTH_STATUS_CONFIG.unknown;
}

/**
 * Get tool type configuration
 */
export function getToolTypeConfig(type: string | undefined) {
  if (!type) return TOOL_TYPE_CONFIG.function;
  return TOOL_TYPE_CONFIG[type as keyof typeof TOOL_TYPE_CONFIG] || TOOL_TYPE_CONFIG.function;
}
