/**
 * Tool Badge Constants - Brand Guidelines v6.0
 *
 * Shared badge configurations for tool pages
 * Uses stone palette for neutrals, semantic colors for categories
 *
 * @since December 2025
 */

import {
  Wrench,
  Activity,
  Shield,
  Microscope,
  Heart,
  Brain,
  CheckCircle2,
  Code,
  Workflow,
  AlertCircle,
  Clock,
  Zap,
  Server,
  Database,
  Cloud,
  Settings,
  FileCode,
} from 'lucide-react';

// Tool categories with icons and colors - Brand v6.0
export const TOOL_CATEGORIES: Record<
  string,
  { icon: React.ElementType; color: string; description: string }
> = {
  Healthcare: {
    icon: Heart,
    color: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'Healthcare and medical tools',
  },
  'Healthcare/FHIR': {
    icon: Activity,
    color: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'FHIR interoperability tools',
  },
  'Healthcare/Clinical NLP': {
    icon: Brain,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Clinical natural language processing',
  },
  'Healthcare/De-identification': {
    icon: Shield,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'PHI de-identification tools',
  },
  Research: {
    icon: Microscope,
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    description: 'Research and analysis tools',
  },
  General: {
    icon: Wrench,
    color: 'bg-stone-100 text-stone-800 border-stone-200',
    description: 'General purpose tools',
  },
  AI: {
    icon: Brain,
    color: 'bg-violet-100 text-violet-800 border-violet-200',
    description: 'AI and machine learning tools',
  },
  Database: {
    icon: Database,
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Database and data management',
  },
  API: {
    icon: Cloud,
    color: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'API integration tools',
  },
};

// Lifecycle badges - Brand v6.0
export const LIFECYCLE_BADGES: Record<
  string,
  { color: string; icon: React.ElementType; label: string }
> = {
  development: {
    color: 'bg-stone-100 text-stone-800',
    icon: Settings,
    label: 'Development',
  },
  testing: {
    color: 'bg-amber-100 text-amber-800',
    icon: AlertCircle,
    label: 'Testing',
  },
  staging: {
    color: 'bg-sky-100 text-sky-800',
    icon: Clock,
    label: 'Staging',
  },
  production: {
    color: 'bg-emerald-100 text-emerald-800',
    icon: CheckCircle2,
    label: 'Production',
  },
  deprecated: {
    color: 'bg-rose-100 text-rose-800',
    icon: AlertCircle,
    label: 'Deprecated',
  },
};

// Tool type badges - Brand v6.0
export const TOOL_TYPE_BADGES: Record<
  string,
  { color: string; icon: React.ElementType; label: string }
> = {
  ai_function: {
    color: 'bg-purple-100 text-purple-800',
    icon: Brain,
    label: 'AI Function',
  },
  software_reference: {
    color: 'bg-sky-100 text-sky-800',
    icon: Code,
    label: 'Software',
  },
  database: {
    color: 'bg-amber-100 text-amber-800',
    icon: Database,
    label: 'Database',
  },
  saas: {
    color: 'bg-emerald-100 text-emerald-800',
    icon: Cloud,
    label: 'SaaS',
  },
  api: {
    color: 'bg-cyan-100 text-cyan-800',
    icon: Server,
    label: 'API',
  },
  ai_framework: {
    color: 'bg-violet-100 text-violet-800',
    icon: Workflow,
    label: 'AI Framework',
  },
};

// Implementation type badges - Brand v6.0
export const IMPLEMENTATION_BADGES: Record<
  string,
  { color: string; icon: React.ElementType; label: string }
> = {
  custom: {
    color: 'bg-stone-100 text-stone-800',
    icon: Settings,
    label: 'Custom',
  },
  langchain_tool: {
    color: 'bg-orange-100 text-orange-800',
    icon: Zap,
    label: 'LangChain',
  },
  api: {
    color: 'bg-sky-100 text-sky-800',
    icon: Cloud,
    label: 'API',
  },
  function: {
    color: 'bg-emerald-100 text-emerald-800',
    icon: FileCode,
    label: 'Function',
  },
};
