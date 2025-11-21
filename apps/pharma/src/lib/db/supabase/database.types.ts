/**
 * Supabase Database Types
 *
 * Auto-generated TypeScript types for Supabase database schema.
 * These types are generated from the database schema and should not be manually edited.
 *
 * To regenerate:
 * npx supabase gen types typescript --project-id <project-id> > src/lib/db/supabase/database.types.ts
 *
 * @module lib/db/supabase/database.types
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          domain: string | null;
          compliance_level: 'standard' | 'hipaa' | 'gdpr' | 'fda' | 'soc2' | 'ccpa';
          is_active: boolean;
          settings: Json;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          domain?: string | null;
          compliance_level?: 'standard' | 'hipaa' | 'gdpr' | 'fda' | 'soc2' | 'ccpa';
          is_active?: boolean;
          settings?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          domain?: string | null;
          compliance_level?: 'standard' | 'hipaa' | 'gdpr' | 'fda' | 'soc2' | 'ccpa';
          is_active?: boolean;
          settings?: Json;
          metadata?: Json;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          tenant_id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          preferences: Json;
          metadata: Json;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
        };
        Insert: {
          id: string;
          tenant_id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          preferences?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
        };
        Update: {
          tenant_id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          preferences?: Json;
          metadata?: Json;
          updated_at?: string;
          last_login_at?: string | null;
        };
      };
      agents: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          description: string;
          avatar: string | null;
          color: string | null;
          system_prompt: string;
          model: string | null;
          temperature: number | null;
          max_tokens: number | null;
          context_window: number | null;
          capabilities: string[];
          business_function: string | null;
          department: string | null;
          role: string | null;
          tier: number | null;
          status: string | null;
          is_public: boolean | null;
          is_custom: boolean | null;
          created_by: string | null;
          organization_id: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_name?: string | null;
          description?: string | null;
          avatar?: string | null;
          color?: string | null;
          system_prompt?: string | null;
          model?: string | null;
          temperature?: number | null;
          max_tokens?: number | null;
          context_window?: number | null;
          capabilities?: string[];
          business_function?: string | null;
          department?: string | null;
          role?: string | null;
          tier?: number | null;
          status?: string | null;
          is_public?: boolean | null;
          is_custom?: boolean | null;
          created_by?: string | null;
          organization_id?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          display_name?: string | null;
          description?: string | null;
          avatar?: string | null;
          color?: string | null;
          system_prompt?: string | null;
          model?: string | null;
          temperature?: number | null;
          max_tokens?: number | null;
          context_window?: number | null;
          capabilities?: string[];
          business_function?: string | null;
          department?: string | null;
          role?: string | null;
          tier?: number | null;
          status?: string | null;
          is_public?: boolean | null;
          is_custom?: boolean | null;
          created_by?: string | null;
          organization_id?: string | null;
          metadata?: Json;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          title: string;
          mode: 'query_automatic' | 'query_manual' | 'chat_automatic' | 'chat_manual' | 'agent';
          status: 'active' | 'archived' | 'deleted';
          compliance_level: 'standard' | 'hipaa' | 'gdpr' | 'fda' | 'soc2' | 'ccpa';
          persistent_agent_id: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
          archived_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          title: string;
          mode: 'query_automatic' | 'query_manual' | 'chat_automatic' | 'chat_manual' | 'agent';
          status?: 'active' | 'archived' | 'deleted';
          compliance_level?: 'standard' | 'hipaa' | 'gdpr' | 'fda' | 'soc2' | 'ccpa';
          persistent_agent_id?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          title?: string;
          mode?: 'query_automatic' | 'query_manual' | 'chat_automatic' | 'chat_manual' | 'agent';
          status?: 'active' | 'archived' | 'deleted';
          compliance_level?: 'standard' | 'hipaa' | 'gdpr' | 'fda' | 'soc2' | 'ccpa';
          persistent_agent_id?: string | null;
          metadata?: Json;
          updated_at?: string;
          archived_at?: string | null;
          deleted_at?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          agent_id: string | null;
          reasoning: string[] | null;
          citations: string[] | null;
          confidence: number | null;
          tokens_prompt: number | null;
          tokens_completion: number | null;
          tokens_total: number | null;
          estimated_cost: number | null;
          latency_ms: number | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          agent_id?: string | null;
          reasoning?: string[] | null;
          citations?: string[] | null;
          confidence?: number | null;
          tokens_prompt?: number | null;
          tokens_completion?: number | null;
          tokens_total?: number | null;
          estimated_cost?: number | null;
          latency_ms?: number | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          agent_id?: string | null;
          reasoning?: string[] | null;
          citations?: string[] | null;
          confidence?: number | null;
          tokens_prompt?: number | null;
          tokens_completion?: number | null;
          tokens_total?: number | null;
          estimated_cost?: number | null;
          latency_ms?: number | null;
          metadata?: Json;
        };
      };
      sources: {
        Row: {
          id: string;
          message_id: string;
          title: string;
          url: string;
          excerpt: string;
          similarity: number;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          title: string;
          url: string;
          excerpt: string;
          similarity: number;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          title?: string;
          url?: string;
          excerpt?: string;
          similarity?: number;
          metadata?: Json;
        };
      };
      agent_metrics: {
        Row: {
          id: string;
          agent_id: string;
          tenant_id: string;
          usage_count: number;
          average_latency_ms: number | null;
          satisfaction_score: number | null;
          last_used_at: string | null;
          date: string;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          tenant_id: string;
          usage_count?: number;
          average_latency_ms?: number | null;
          satisfaction_score?: number | null;
          last_used_at?: string | null;
          date?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          usage_count?: number;
          average_latency_ms?: number | null;
          satisfaction_score?: number | null;
          last_used_at?: string | null;
          metadata?: Json;
          updated_at?: string;
        };
      };
      intent_classifications: {
        Row: {
          id: string;
          conversation_id: string;
          query: string;
          primary_intent: 'question' | 'task' | 'consultation' | 'analysis' | 'generation';
          primary_domain: string;
          domains: string[];
          confidence: number;
          complexity: 'low' | 'medium' | 'high' | 'very_high';
          urgency: 'low' | 'standard' | 'high' | 'urgent';
          requires_multiple_experts: boolean;
          reasoning: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          query: string;
          primary_intent: 'question' | 'task' | 'consultation' | 'analysis' | 'generation';
          primary_domain: string;
          domains: string[];
          confidence: number;
          complexity: 'low' | 'medium' | 'high' | 'very_high';
          urgency: 'low' | 'standard' | 'high' | 'urgent';
          requires_multiple_experts?: boolean;
          reasoning: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          query?: string;
          primary_intent?: 'question' | 'task' | 'consultation' | 'analysis' | 'generation';
          primary_domain?: string;
          domains?: string[];
          confidence?: number;
          complexity?: 'low' | 'medium' | 'high' | 'very_high';
          urgency?: 'low' | 'standard' | 'high' | 'urgent';
          requires_multiple_experts?: boolean;
          reasoning?: string;
          metadata?: Json;
        };
      };
      checkpoints: {
        Row: {
          id: string;
          conversation_id: string;
          type: 'approval' | 'review' | 'decision' | 'safety';
          description: string;
          status: 'pending' | 'approved' | 'rejected';
          approved_by: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          type: 'approval' | 'review' | 'decision' | 'safety';
          description: string;
          status?: 'pending' | 'approved' | 'rejected';
          approved_by?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          type?: 'approval' | 'review' | 'decision' | 'safety';
          description?: string;
          status?: 'pending' | 'approved' | 'rejected';
          approved_by?: string | null;
          metadata?: Json;
          updated_at?: string;
          resolved_at?: string | null;
        };
      };
      task_plans: {
        Row: {
          id: string;
          conversation_id: string;
          goal: string;
          current_step: number;
          metadata: Json;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          goal: string;
          current_step?: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          goal?: string;
          current_step?: number;
          metadata?: Json;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
      task_steps: {
        Row: {
          id: string;
          task_plan_id: string;
          step_number: number;
          description: string;
          status: string;
          requires_approval: boolean;
          checkpoint_id: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          task_plan_id: string;
          step_number: number;
          description: string;
          status?: string;
          requires_approval?: boolean;
          checkpoint_id?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          step_number?: number;
          description?: string;
          status?: string;
          requires_approval?: boolean;
          checkpoint_id?: string | null;
          metadata?: Json;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          action: string;
          resource: string;
          resource_id: string;
          ip_address: string;
          user_agent: string;
          phi_accessed: string[];
          pii_accessed: string[];
          compliance_level: 'standard' | 'hipaa' | 'gdpr' | 'fda' | 'soc2' | 'ccpa';
          justification: string | null;
          session_id: string;
          request_id: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          action: string;
          resource: string;
          resource_id: string;
          ip_address: string;
          user_agent: string;
          phi_accessed?: string[];
          pii_accessed?: string[];
          compliance_level: 'standard' | 'hipaa' | 'gdpr' | 'fda' | 'soc2' | 'ccpa';
          justification?: string | null;
          session_id: string;
          request_id: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          // Audit logs are immutable
        };
      };
      data_subject_requests: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          type: 'access' | 'deletion' | 'portability' | 'rectification';
          status: 'pending' | 'processing' | 'completed' | 'rejected';
          regulation: 'GDPR' | 'CCPA' | 'HIPAA';
          requested_at: string;
          completed_at: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          type: 'access' | 'deletion' | 'portability' | 'rectification';
          status?: 'pending' | 'processing' | 'completed' | 'rejected';
          regulation: 'GDPR' | 'CCPA' | 'HIPAA';
          requested_at?: string;
          completed_at?: string | null;
          metadata?: Json;
        };
        Update: {
          status?: 'pending' | 'processing' | 'completed' | 'rejected';
          completed_at?: string | null;
          metadata?: Json;
        };
      };
      consent_records: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          purpose: string;
          granted: boolean;
          regulation: 'GDPR' | 'CCPA';
          version: string;
          granted_at: string;
          revoked_at: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          purpose: string;
          granted: boolean;
          regulation: 'GDPR' | 'CCPA';
          version: string;
          granted_at?: string;
          revoked_at?: string | null;
          metadata?: Json;
        };
        Update: {
          granted?: boolean;
          revoked_at?: string | null;
          metadata?: Json;
        };
      };
      user_agents: {
        Row: {
          id: string;
          user_id: string;
          agent_id: string;
          original_agent_id: string | null;
          is_user_copy: boolean;
          added_at: string;
          last_used_at: string | null;
          usage_count: number;
          is_active: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_id: string;
          original_agent_id?: string | null;
          is_user_copy?: boolean;
          added_at?: string;
          last_used_at?: string | null;
          usage_count?: number;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          original_agent_id?: string | null;
          is_user_copy?: boolean;
          last_used_at?: string | null;
          usage_count?: number;
          is_active?: boolean;
          metadata?: Json;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      search_agents_by_embedding: {
        Args: {
          query_embedding: string; // vector passed as string
          match_threshold?: number;
          match_count?: number;
          filter_tenant_id?: string;
        };
        Returns: {
          id: string;
          name: string;
          display_name: string;
          tier: 'tier_1' | 'tier_2' | 'tier_3';
          similarity: number;
        }[];
      };
    };
    Enums: {
      orchestration_mode: 'query_automatic' | 'query_manual' | 'chat_automatic' | 'chat_manual' | 'agent';
      agent_tier: 'tier_1' | 'tier_2' | 'tier_3';
      agent_status: 'active' | 'inactive' | 'testing';
      compliance_level: 'standard' | 'hipaa' | 'gdpr' | 'fda' | 'soc2' | 'ccpa';
      message_role: 'user' | 'assistant' | 'system';
      conversation_status: 'active' | 'archived' | 'deleted';
      intent_type: 'question' | 'task' | 'consultation' | 'analysis' | 'generation';
      complexity_level: 'low' | 'medium' | 'high' | 'very_high';
      urgency_level: 'low' | 'standard' | 'high' | 'urgent';
      checkpoint_type: 'approval' | 'review' | 'decision' | 'safety';
      checkpoint_status: 'pending' | 'approved' | 'rejected';
      dsr_type: 'access' | 'deletion' | 'portability' | 'rectification';
      dsr_status: 'pending' | 'processing' | 'completed' | 'rejected';
      regulation_type: 'GDPR' | 'CCPA' | 'HIPAA';
    };
  };
}
