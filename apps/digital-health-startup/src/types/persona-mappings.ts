/**
 * Persona Mapping Types
 * Type definitions for persona-to-strategic-pillar and persona-to-JTBD mappings
 */

import { Database } from './supabase-generated';

// ============================================================================
// Strategic Priorities
// ============================================================================

export type StrategicPriority = Database['public']['Tables']['strategic_priorities']['Row'];
export type StrategicPriorityInsert = Database['public']['Tables']['strategic_priorities']['Insert'];
export type StrategicPriorityUpdate = Database['public']['Tables']['strategic_priorities']['Update'];

// ============================================================================
// Persona-Strategic Pillar Mappings
// ============================================================================

export type PersonaStrategicPillarMapping = Database['public']['Tables']['persona_strategic_pillar_mapping']['Row'];
export type PersonaStrategicPillarMappingInsert = Database['public']['Tables']['persona_strategic_pillar_mapping']['Insert'];
export type PersonaStrategicPillarMappingUpdate = Database['public']['Tables']['persona_strategic_pillar_mapping']['Update'];

// ============================================================================
// Persona-JTBD Mappings
// ============================================================================

export type PersonaJTBDMapping = Database['public']['Tables']['persona_jtbd_mapping']['Row'];
export type PersonaJTBDMappingInsert = Database['public']['Tables']['persona_jtbd_mapping']['Insert'];
export type PersonaJTBDMappingUpdate = Database['public']['Tables']['persona_jtbd_mapping']['Update'];

// ============================================================================
// View Types (from database views)
// ============================================================================

export type PersonaStrategicSummary = Database['public']['Views']['persona_strategic_summary']['Row'];
export type PersonaJTBDSummary = Database['public']['Views']['persona_jtbd_summary']['Row'];

// ============================================================================
// Extended Types with Joins
// ============================================================================

/**
 * Persona with strategic pillar mappings
 */
export interface PersonaWithStrategicPillars {
  id: string;
  unique_id: string;
  name: string;
  strategic_pillars: Array<{
    strategic_pillar_id: string;
    strategic_pillar_code: string;
    strategic_pillar_name: string;
    pain_points_count: number;
    jtbd_count: number;
    is_primary: boolean;
    priority_score: number | null;
  }>;
}

/**
 * Persona with JTBD mappings
 */
export interface PersonaWithJTBDs {
  id: string;
  unique_id: string;
  name: string;
  jtbds: Array<{
    jtbd_id: string;
    jtbd_code: string;
    job_title: string;
    role_type: string | null;
    is_primary: boolean;
    responsibility_level: string | null;
    impact_level: string | null;
    frequency: string | null;
  }>;
}

/**
 * Strategic pillar with personas
 */
export interface StrategicPillarWithPersonas {
  id: string;
  code: string;
  name: string;
  description: string | null;
  personas: Array<{
    persona_id: string;
    persona_unique_id: string;
    persona_name: string;
    pain_points_count: number;
    jtbd_count: number;
    is_primary: boolean;
  }>;
}

/**
 * JTBD with personas
 */
export interface JTBDWithPersonas {
  id: string;
  jtbd_code: string;
  job_title: string;
  personas: Array<{
    persona_id: string;
    persona_unique_id: string;
    persona_name: string;
    role_type: string | null;
    is_primary: boolean;
    responsibility_level: string | null;
  }>;
}
