/**
 * JTBD Component Types
 *
 * Shared type definitions for Jobs-to-Be-Done components
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

// Color utility functions
export function getPriorityColor(priority?: string): string {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-neutral-100 text-neutral-800 border-neutral-200';
  }
}

export function getStatusColor(status?: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'planned':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'completed':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'draft':
      return 'bg-neutral-100 text-neutral-600 border-neutral-200';
    default:
      return 'bg-neutral-100 text-neutral-800 border-neutral-200';
  }
}

export function getComplexityColor(complexity?: string): string {
  switch (complexity?.toLowerCase()) {
    case 'very_high':
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-neutral-100 text-neutral-800';
  }
}

export function getOdiTierColor(tier?: string): string {
  switch (tier?.toLowerCase()) {
    case 'extreme':
      return 'bg-red-500 text-white';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-neutral-100 text-neutral-800';
  }
}
