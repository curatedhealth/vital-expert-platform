/**
 * Database Types - Based on Actual Supabase Schema
 * Auto-generated types for Ask Panel multi-tenant database
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================================================
// ENUMS
// ============================================================================

export type PanelType = 
  | 'structured'   // Sequential, moderated discussion
  | 'open'         // Parallel exploration
  | 'socratic'     // Iterative questioning
  | 'adversarial'  // Structured debate
  | 'delphi'       // Anonymous iterative rounds
  | 'hybrid'       // Combined human-AI

export type PanelStatus = 
  | 'created'      // Panel configured, not started
  | 'running'      // Currently executing
  | 'completed'    // Successfully finished
  | 'failed'       // Error occurred
  | 'cancelled'    // User cancelled

export type TenantStatus = 
  | 'active'       // Full access
  | 'suspended'    // Temporarily disabled
  | 'trial'        // Trial period
  | 'cancelled'    // Subscription ended

export type SubscriptionTier = 
  | 'basic'        // $500/month
  | 'professional' // $2K/month
  | 'enterprise'   // $10K/month

export type UserRole = 
  | 'owner'        // Full admin access
  | 'admin'        // Manage team & settings
  | 'member'       // Create & view panels
  | 'guest'        // View only

export type UserStatus = 
  | 'active'       // Active user
  | 'inactive'     // Deactivated
  | 'invited'      // Pending invitation

export type ResponseType = 
  | 'analysis'     // Initial analysis
  | 'statement'    // Position statement
  | 'rebuttal'     // Counter-argument
  | 'question'     // Question to panel

// ============================================================================
// CONFIGURATION INTERFACES
// ============================================================================

export interface TenantSettings {
  max_panels_per_month: number;
  max_experts_per_panel: number;
  enable_streaming: boolean;
  enable_consensus: boolean;
  enable_exports: boolean;
  enable_api_access: boolean;
}

export interface TenantBranding {
  primary_color: string;
  logo_url?: string;
  font_family: string;
  custom_css?: string;
}

export interface TenantFeatures {
  structured_panel: boolean;
  open_panel: boolean;
  socratic_panel: boolean;
  adversarial_panel: boolean;
  delphi_panel: boolean;
  hybrid_panel: boolean;
}

export interface PanelConfiguration {
  max_rounds?: number;
  time_limit_minutes?: number;
  consensus_threshold?: number;
  enable_dissent?: boolean;
  moderator_agent?: string;
  custom_prompt?: string;
}

export interface DissentingOpinion {
  agent_id: string;
  agent_name: string;
  opinion: string;
  reasoning: string;
  confidence_score?: number;
}

// ============================================================================
// DATABASE SCHEMA
// ============================================================================

export interface Database {
  public: {
    Tables: {
      // ------------------------------------------------------------------
      // TENANTS
      // ------------------------------------------------------------------
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          subdomain: string;
          status: TenantStatus;
          subscription_tier: SubscriptionTier;
          settings: TenantSettings;
          branding: TenantBranding;
          features: TenantFeatures;
          created_at: string;
          updated_at: string;
          metadata: Json;
        };
        Insert: Omit<Database['public']['Tables']['tenants']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>;
      };

      // ------------------------------------------------------------------
      // TENANT_USERS
      // ------------------------------------------------------------------
      tenant_users: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          role: UserRole;
          status: UserStatus;
          created_at: string;
          last_active_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['tenant_users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['tenant_users']['Insert']>;
      };

      // ------------------------------------------------------------------
      // PANELS
      // ------------------------------------------------------------------
      panels: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          query: string;
          panel_type: PanelType;
          status: PanelStatus;
          configuration: PanelConfiguration;
          agents: Json; // JSONB[] in Postgres
          created_at: string;
          updated_at: string;
          started_at: string | null;
          completed_at: string | null;
          metadata: Json;
        };
        Insert: Omit<Database['public']['Tables']['panels']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['panels']['Insert']>;
      };

      // ------------------------------------------------------------------
      // PANEL_RESPONSES
      // ------------------------------------------------------------------
      panel_responses: {
        Row: {
          id: string;
          tenant_id: string;
          panel_id: string;
          agent_id: string;
          agent_name: string;
          round_number: number;
          response_type: ResponseType;
          content: string;
          confidence_score: number | null;
          created_at: string;
          metadata: Json;
        };
        Insert: Omit<Database['public']['Tables']['panel_responses']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['panel_responses']['Insert']>;
      };

      // ------------------------------------------------------------------
      // PANEL_CONSENSUS
      // ------------------------------------------------------------------
      panel_consensus: {
        Row: {
          id: string;
          tenant_id: string;
          panel_id: string;
          round_number: number;
          consensus_level: number;
          agreement_points: Json;
          disagreement_points: Json;
          recommendation: string;
          dissenting_opinions: DissentingOpinion[] | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['panel_consensus']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['panel_consensus']['Insert']>;
      };

      // ------------------------------------------------------------------
      // AGENT_USAGE
      // ------------------------------------------------------------------
      agent_usage: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          agent_id: string;
          panel_id: string;
          tokens_used: number;
          execution_time_ms: number;
          cost_usd: number;
          created_at: string;
          metadata: Json;
        };
        Insert: Omit<Database['public']['Tables']['agent_usage']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['agent_usage']['Insert']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Convenience type exports
export type Tenant = Tables<'tenants'>;
export type TenantUser = Tables<'tenant_users'>;
export type Panel = Tables<'panels'>;
export type PanelResponse = Tables<'panel_responses'>;
export type PanelConsensus = Tables<'panel_consensus'>;
export type AgentUsage = Tables<'agent_usage'>;

// Insert types
export type TenantInsert = Database['public']['Tables']['tenants']['Insert'];
export type TenantUserInsert = Database['public']['Tables']['tenant_users']['Insert'];
export type PanelInsert = Database['public']['Tables']['panels']['Insert'];
export type PanelResponseInsert = Database['public']['Tables']['panel_responses']['Insert'];
export type PanelConsensusInsert = Database['public']['Tables']['panel_consensus']['Insert'];
export type AgentUsageInsert = Database['public']['Tables']['agent_usage']['Insert'];

// Update types
export type TenantUpdate = Database['public']['Tables']['tenants']['Update'];
export type TenantUserUpdate = Database['public']['Tables']['tenant_users']['Update'];
export type PanelUpdate = Database['public']['Tables']['panels']['Update'];
export type PanelResponseUpdate = Database['public']['Tables']['panel_responses']['Update'];
export type PanelConsensusUpdate = Database['public']['Tables']['panel_consensus']['Update'];
export type AgentUsageUpdate = Database['public']['Tables']['agent_usage']['Update'];

