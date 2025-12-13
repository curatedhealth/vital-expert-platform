/**
 * JTBD Component Types - Brand Guidelines v6.0
 *
 * Shared type definitions for Jobs-to-Be-Done components
 *
 * Design System:
 * - Primary Accent: #9055E0 (Warm Purple) via Tailwind purple-600
 * - Neutrals: stone-* palette (warm grays)
 * - Status colors: emerald (active), cyan (planned), purple (completed)
 *
 * @since December 2025
 */

export interface JTBD {
  id: string;
  code?: string;
  job_statement: string;
  description?: string;
  category?: string;
  functional_area?: string;
  job_type?: string;
  job_category?: string;
  complexity?: string;
  frequency?: string;
  priority?: 'high' | 'medium' | 'low';
  status?: 'active' | 'planned' | 'completed' | 'draft';
  // ODI scores
  importance_score?: number;
  satisfaction_score?: number;
  opportunity_score?: number;
  odi_tier?: string;
  // Additional attributes
  work_pattern?: string;
  jtbd_type?: string;
  impact_level?: string;
  compliance_sensitivity?: string;
  recommended_service_layer?: string;
  validation_score?: number;
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface JTBDStats {
  total: number;
  byCategory: Record<string, number>;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  byStatus: {
    active: number;
    planned: number;
    completed: number;
    draft: number;
  };
  byComplexity: Record<string, number>;
  byJobCategory: Record<string, number>;
  byOdiTier: Record<string, number>;
  avgOpportunityScore: number;
}

// Color utility functions - Brand v6.0 (stone palette)
export function getPriorityColor(priority?: string): string {
  switch (priority) {
    case 'high':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'medium':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'low':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    default:
      return 'bg-stone-100 text-stone-700 border-stone-200';
  }
}

export function getStatusColor(status?: string): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'planned':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    case 'completed':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'draft':
      return 'bg-stone-100 text-stone-600 border-stone-200';
    default:
      return 'bg-stone-100 text-stone-700 border-stone-200';
  }
}

export function getComplexityColor(complexity?: string): string {
  switch (complexity?.toLowerCase()) {
    case 'very_high':
    case 'high':
      return 'bg-rose-100 text-rose-800';
    case 'medium':
      return 'bg-amber-100 text-amber-800';
    case 'low':
      return 'bg-emerald-100 text-emerald-800';
    default:
      return 'bg-stone-100 text-stone-700';
  }
}

export function getOdiTierColor(tier?: string): string {
  switch (tier?.toLowerCase()) {
    case 'extreme':
      return 'bg-rose-500 text-white';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-amber-100 text-amber-800';
    case 'low':
      return 'bg-emerald-100 text-emerald-800';
    default:
      return 'bg-stone-100 text-stone-700';
  }
}
