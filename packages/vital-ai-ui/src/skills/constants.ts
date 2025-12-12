/**
 * VITAL AI UI - Skill Constants
 *
 * Configuration constants for skill components.
 */

import {
  Target,
  Users,
  BarChart3,
  FileSearch,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  Database,
  Cog,
  Layers,
  Lightbulb,
  Code,
  Brain,
  Workflow,
  Clock,
  Zap,
  AlertCircle,
} from 'lucide-react';
import type { SkillCategoryConfig, SkillComplexityConfig, SkillImplementationType } from './types';

// ============================================================================
// CATEGORY CONFIGURATION
// ============================================================================

export const SKILL_CATEGORIES: Record<string, SkillCategoryConfig> = {
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
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
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
    description: 'Creative and design-related skills'
  },
  'Development & Technical': {
    icon: Code,
    color: 'text-emerald-800',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-200',
    description: 'Technical and development skills'
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
  'Document Processing': {
    icon: FileSearch,
    color: 'text-orange-800',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
    description: 'Document analysis and manipulation'
  },
  'Communication & Writing': {
    icon: MessageSquare,
    color: 'text-sky-800',
    bgColor: 'bg-sky-100',
    borderColor: 'border-sky-200',
    description: 'Written and verbal communication'
  },
  'Scientific & Research': {
    icon: Brain,
    color: 'text-teal-800',
    bgColor: 'bg-teal-100',
    borderColor: 'border-teal-200',
    description: 'Scientific research and analysis'
  },
};

// Default category for unknown categories
export const DEFAULT_CATEGORY: SkillCategoryConfig = {
  icon: Sparkles,
  color: 'text-gray-800',
  bgColor: 'bg-gray-100',
  borderColor: 'border-gray-200',
  description: 'General skill'
};

// ============================================================================
// COMPLEXITY CONFIGURATION
// ============================================================================

export const COMPLEXITY_BADGES: Record<string, SkillComplexityConfig> = {
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

export const IMPLEMENTATION_BADGES: Record<SkillImplementationType, { color: string; bgColor: string; label: string }> = {
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
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get category configuration for a given category name
 */
export function getCategoryConfig(category: string): SkillCategoryConfig {
  return SKILL_CATEGORIES[category] || DEFAULT_CATEGORY;
}

/**
 * Get complexity configuration for a given level
 */
export function getComplexityConfig(level: string): SkillComplexityConfig {
  return COMPLEXITY_BADGES[level] || COMPLEXITY_BADGES.intermediate;
}

/**
 * Get implementation type configuration
 */
export function getImplementationConfig(type: SkillImplementationType) {
  return IMPLEMENTATION_BADGES[type] || IMPLEMENTATION_BADGES.prompt;
}
