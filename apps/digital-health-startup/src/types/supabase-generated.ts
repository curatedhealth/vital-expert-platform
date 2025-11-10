export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agent_industry_mapping: {
        Row: {
          agent_id: string
          avg_response_time_ms: number | null
          created_at: string
          id: string
          industry_config: Json | null
          industry_id: string
          is_primary: boolean | null
          last_used_at: string | null
          performance_metrics: Json | null
          success_rate: number | null
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          agent_id: string
          avg_response_time_ms?: number | null
          created_at?: string
          id?: string
          industry_config?: Json | null
          industry_id: string
          is_primary?: boolean | null
          last_used_at?: string | null
          performance_metrics?: Json | null
          success_rate?: number | null
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          agent_id?: string
          avg_response_time_ms?: number | null
          created_at?: string
          id?: string
          industry_config?: Json | null
          industry_id?: string
          is_primary?: boolean | null
          last_used_at?: string | null
          performance_metrics?: Json | null
          success_rate?: number | null
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      agent_metrics: {
        Row: {
          agent_id: string
          confidence_score: number | null
          conversation_id: string | null
          cost_usd: number | null
          created_at: string
          error_message: string | null
          error_occurred: boolean | null
          error_type: string | null
          graph_traversal_depth: number | null
          graphrag_fallback: boolean | null
          graphrag_hit: boolean | null
          id: string
          metadata: Json | null
          operation_type: string
          query_text: string | null
          relevance_score: number | null
          response_time_ms: number
          satisfaction_score: number | null
          search_method: string | null
          selected_agent_id: string | null
          session_id: string | null
          success: boolean
          tenant_id: string
          tokens_input: number | null
          tokens_output: number | null
          user_id: string | null
        }
        Insert: {
          agent_id: string
          confidence_score?: number | null
          conversation_id?: string | null
          cost_usd?: number | null
          created_at?: string
          error_message?: string | null
          error_occurred?: boolean | null
          error_type?: string | null
          graph_traversal_depth?: number | null
          graphrag_fallback?: boolean | null
          graphrag_hit?: boolean | null
          id?: string
          metadata?: Json | null
          operation_type: string
          query_text?: string | null
          relevance_score?: number | null
          response_time_ms: number
          satisfaction_score?: number | null
          search_method?: string | null
          selected_agent_id?: string | null
          session_id?: string | null
          success?: boolean
          tenant_id: string
          tokens_input?: number | null
          tokens_output?: number | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string
          confidence_score?: number | null
          conversation_id?: string | null
          cost_usd?: number | null
          created_at?: string
          error_message?: string | null
          error_occurred?: boolean | null
          error_type?: string | null
          graph_traversal_depth?: number | null
          graphrag_fallback?: boolean | null
          graphrag_hit?: boolean | null
          id?: string
          metadata?: Json | null
          operation_type?: string
          query_text?: string | null
          relevance_score?: number | null
          response_time_ms?: number
          satisfaction_score?: number | null
          search_method?: string | null
          selected_agent_id?: string | null
          session_id?: string | null
          success?: boolean
          tenant_id?: string
          tokens_input?: number | null
          tokens_output?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_metrics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_full_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_metrics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_metrics_selected_agent_id_fkey"
            columns: ["selected_agent_id"]
            isOneToOne: false
            referencedRelation: "agent_full_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_metrics_selected_agent_id_fkey"
            columns: ["selected_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_persona_mapping: {
        Row: {
          agent_id: string
          context_notes: string | null
          created_at: string
          id: string
          interaction_patterns: Json | null
          persona_id: string
          priority_level: number | null
          relationship_type: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          context_notes?: string | null
          created_at?: string
          id?: string
          interaction_patterns?: Json | null
          persona_id: string
          priority_level?: number | null
          relationship_type?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          context_notes?: string | null
          created_at?: string
          id?: string
          interaction_patterns?: Json | null
          persona_id?: string
          priority_level?: number | null
          relationship_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      agent_prompts: {
        Row: {
          agent_id: string
          assigned_at: string | null
          assigned_by: string | null
          avg_effectiveness_score: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          last_used_at: string | null
          metadata: Json | null
          priority: number | null
          prompt_id: string
          prompt_role: string
          tenant_id: string
          times_used: number | null
          updated_at: string | null
          usage_context: Json | null
          variable_bindings: Json | null
        }
        Insert: {
          agent_id: string
          assigned_at?: string | null
          assigned_by?: string | null
          avg_effectiveness_score?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_used_at?: string | null
          metadata?: Json | null
          priority?: number | null
          prompt_id: string
          prompt_role: string
          tenant_id: string
          times_used?: number | null
          updated_at?: string | null
          usage_context?: Json | null
          variable_bindings?: Json | null
        }
        Update: {
          agent_id?: string
          assigned_at?: string | null
          assigned_by?: string | null
          avg_effectiveness_score?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_used_at?: string | null
          metadata?: Json | null
          priority?: number | null
          prompt_id?: string
          prompt_role?: string
          tenant_id?: string
          times_used?: number | null
          updated_at?: string | null
          usage_context?: Json | null
          variable_bindings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_prompts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_full_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_prompts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_prompts_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompt_full_context"
            referencedColumns: ["prompt_id"]
          },
          {
            foreignKeyName: "agent_prompts_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_prompts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_skills: {
        Row: {
          acquired_at: string | null
          agent_id: string
          applicable_panel_types: string[] | null
          avg_execution_quality: number | null
          created_at: string | null
          demonstrated_count: number | null
          id: string
          is_active: boolean | null
          is_primary_skill: boolean | null
          last_assessment_score: number | null
          last_demonstrated_at: string | null
          metadata: Json | null
          proficiency_level: string
          proficiency_score: number | null
          skill_id: string
          skill_weight: number | null
          success_rate: number | null
          tenant_id: string
          updated_at: string | null
          usage_frequency: string | null
        }
        Insert: {
          acquired_at?: string | null
          agent_id: string
          applicable_panel_types?: string[] | null
          avg_execution_quality?: number | null
          created_at?: string | null
          demonstrated_count?: number | null
          id?: string
          is_active?: boolean | null
          is_primary_skill?: boolean | null
          last_assessment_score?: number | null
          last_demonstrated_at?: string | null
          metadata?: Json | null
          proficiency_level: string
          proficiency_score?: number | null
          skill_id: string
          skill_weight?: number | null
          success_rate?: number | null
          tenant_id: string
          updated_at?: string | null
          usage_frequency?: string | null
        }
        Update: {
          acquired_at?: string | null
          agent_id?: string
          applicable_panel_types?: string[] | null
          avg_execution_quality?: number | null
          created_at?: string | null
          demonstrated_count?: number | null
          id?: string
          is_active?: boolean | null
          is_primary_skill?: boolean | null
          last_assessment_score?: number | null
          last_demonstrated_at?: string | null
          metadata?: Json | null
          proficiency_level?: string
          proficiency_score?: number | null
          skill_id?: string
          skill_weight?: number | null
          success_rate?: number | null
          tenant_id?: string
          updated_at?: string | null
          usage_frequency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_skills_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_full_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_skills_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "dh_skill"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_skills_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_suite_members: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          is_primary: boolean
          position: number
          suite_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          position?: number
          suite_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          position?: number
          suite_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_suite_members_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_full_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_suite_members_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_suite_members_suite_id_fkey"
            columns: ["suite_id"]
            isOneToOne: false
            referencedRelation: "dh_agent_suite"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_tool_assignments: {
        Row: {
          agent_id: string | null
          assigned_at: string | null
          assigned_by: string | null
          auto_use: boolean | null
          avg_user_satisfaction: number | null
          created_at: string | null
          current_day_usage: number | null
          failure_count: number | null
          id: string
          is_enabled: boolean | null
          last_used_at: string | null
          max_uses_per_conversation: number | null
          max_uses_per_day: number | null
          notes: string | null
          priority: number | null
          requires_confirmation: boolean | null
          success_count: number | null
          times_used: number | null
          tool_id: string | null
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          auto_use?: boolean | null
          avg_user_satisfaction?: number | null
          created_at?: string | null
          current_day_usage?: number | null
          failure_count?: number | null
          id?: string
          is_enabled?: boolean | null
          last_used_at?: string | null
          max_uses_per_conversation?: number | null
          max_uses_per_day?: number | null
          notes?: string | null
          priority?: number | null
          requires_confirmation?: boolean | null
          success_count?: number | null
          times_used?: number | null
          tool_id?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          auto_use?: boolean | null
          avg_user_satisfaction?: number | null
          created_at?: string | null
          current_day_usage?: number | null
          failure_count?: number | null
          id?: string
          is_enabled?: boolean | null
          last_used_at?: string | null
          max_uses_per_conversation?: number | null
          max_uses_per_day?: number | null
          notes?: string | null
          priority?: number | null
          requires_confirmation?: boolean | null
          success_count?: number | null
          times_used?: number | null
          tool_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      agent_tools: {
        Row: {
          agent_id: string
          agent_tool_id: string
          allowed_contexts: string[] | null
          assigned_at: string
          assigned_by: string | null
          auto_approve: boolean | null
          created_at: string
          custom_config: Json | null
          fallback_tool_id: string | null
          is_enabled: boolean
          max_cost_per_session: number | null
          max_uses_per_session: number | null
          notes: string | null
          priority: number | null
          require_confirmation: boolean | null
          tool_id: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          agent_tool_id?: string
          allowed_contexts?: string[] | null
          assigned_at?: string
          assigned_by?: string | null
          auto_approve?: boolean | null
          created_at?: string
          custom_config?: Json | null
          fallback_tool_id?: string | null
          is_enabled?: boolean
          max_cost_per_session?: number | null
          max_uses_per_session?: number | null
          notes?: string | null
          priority?: number | null
          require_confirmation?: boolean | null
          tool_id: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          agent_tool_id?: string
          allowed_contexts?: string[] | null
          assigned_at?: string
          assigned_by?: string | null
          auto_approve?: boolean | null
          created_at?: string
          custom_config?: Json | null
          fallback_tool_id?: string | null
          is_enabled?: boolean
          max_cost_per_session?: number | null
          max_uses_per_session?: number | null
          notes?: string | null
          priority?: number | null
          require_confirmation?: boolean | null
          tool_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_tools_fallback_tool_id_fkey"
            columns: ["fallback_tool_id"]
            isOneToOne: false
            referencedRelation: "tool_analytics"
            referencedColumns: ["tool_id"]
          },
          {
            foreignKeyName: "agent_tools_fallback_tool_id_fkey"
            columns: ["fallback_tool_id"]
            isOneToOne: false
            referencedRelation: "tools_legacy"
            referencedColumns: ["tool_id"]
          },
          {
            foreignKeyName: "agent_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "dh_tool"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          access_count: number | null
          agent_category: string | null
          agent_type: string | null
          avatar_url: string | null
          background: string | null
          can_delegate: boolean | null
          capabilities: string[] | null
          category: string | null
          category_color: string | null
          communication_style: string | null
          created_at: string | null
          created_by: string | null
          created_by_user_id: string | null
          description: string | null
          expertise: string[] | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_public: boolean | null
          is_shared: boolean
          last_accessed_at: string | null
          max_tokens: number | null
          metadata: Json | null
          model: string | null
          name: string
          owner_tenant_id: string | null
          personality_traits: string[] | null
          popularity_score: number | null
          rating: number | null
          resource_type: string | null
          shared_with: string[] | null
          sharing_mode: string | null
          slug: string | null
          specialization: string | null
          specialties: string[] | null
          system_prompt: string | null
          tags: string[] | null
          temperature: number | null
          tenant_id: string | null
          title: string | null
          total_consultations: number | null
          updated_at: string | null
        }
        Insert: {
          access_count?: number | null
          agent_category?: string | null
          agent_type?: string | null
          avatar_url?: string | null
          background?: string | null
          can_delegate?: boolean | null
          capabilities?: string[] | null
          category?: string | null
          category_color?: string | null
          communication_style?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_user_id?: string | null
          description?: string | null
          expertise?: string[] | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_public?: boolean | null
          is_shared?: boolean
          last_accessed_at?: string | null
          max_tokens?: number | null
          metadata?: Json | null
          model?: string | null
          name: string
          owner_tenant_id?: string | null
          personality_traits?: string[] | null
          popularity_score?: number | null
          rating?: number | null
          resource_type?: string | null
          shared_with?: string[] | null
          sharing_mode?: string | null
          slug?: string | null
          specialization?: string | null
          specialties?: string[] | null
          system_prompt?: string | null
          tags?: string[] | null
          temperature?: number | null
          tenant_id?: string | null
          title?: string | null
          total_consultations?: number | null
          updated_at?: string | null
        }
        Update: {
          access_count?: number | null
          agent_category?: string | null
          agent_type?: string | null
          avatar_url?: string | null
          background?: string | null
          can_delegate?: boolean | null
          capabilities?: string[] | null
          category?: string | null
          category_color?: string | null
          communication_style?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_user_id?: string | null
          description?: string | null
          expertise?: string[] | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_public?: boolean | null
          is_shared?: boolean
          last_accessed_at?: string | null
          max_tokens?: number | null
          metadata?: Json | null
          model?: string | null
          name?: string
          owner_tenant_id?: string | null
          personality_traits?: string[] | null
          popularity_score?: number | null
          rating?: number | null
          resource_type?: string | null
          shared_with?: string[] | null
          sharing_mode?: string | null
          slug?: string | null
          specialization?: string | null
          specialties?: string[] | null
          system_prompt?: string | null
          tags?: string[] | null
          temperature?: number | null
          tenant_id?: string | null
          title?: string | null
          total_consultations?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          avatar: string | null
          capabilities: string[] | null
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_custom: boolean | null
          is_public: boolean | null
          max_tokens: number | null
          model: string | null
          name: string
          organization_id: string | null
          rag_enabled: boolean | null
          system_prompt: string
          temperature: number | null
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          capabilities?: string[] | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_custom?: boolean | null
          is_public?: boolean | null
          max_tokens?: number | null
          model?: string | null
          name: string
          organization_id?: string | null
          rag_enabled?: boolean | null
          system_prompt: string
          temperature?: number | null
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          capabilities?: string[] | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_custom?: boolean | null
          is_public?: boolean | null
          max_tokens?: number | null
          model?: string | null
          name?: string
          organization_id?: string | null
          rag_enabled?: boolean | null
          system_prompt?: string
          temperature?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_logs: {
        Row: {
          channels_used: string[]
          created_at: string | null
          delivery_status: string | null
          error_message: string | null
          id: string
          rules_applied: string[]
          sent_at: string
          severity: string
          threat_id: string | null
          threat_type: string
        }
        Insert: {
          channels_used: string[]
          created_at?: string | null
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          rules_applied: string[]
          sent_at: string
          severity: string
          threat_id?: string | null
          threat_type: string
        }
        Update: {
          channels_used?: string[]
          created_at?: string | null
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          rules_applied?: string[]
          sent_at?: string
          severity?: string
          threat_id?: string | null
          threat_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_logs_threat_id_fkey"
            columns: ["threat_id"]
            isOneToOne: false
            referencedRelation: "threat_events"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          alert_id: string
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          resolved: boolean | null
          rule_id: string
          severity: string
          timestamp: string
          title: string
        }
        Insert: {
          alert_id: string
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          rule_id: string
          severity: string
          timestamp: string
          title: string
        }
        Update: {
          alert_id?: string
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          rule_id?: string
          severity?: string
          timestamp?: string
          title?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          audit_id: string
          changes: Json | null
          compliance_flags: Json
          created_at: string | null
          data_accessed: string[] | null
          id: string
          ip_address: string | null
          metadata: Json | null
          operation: string
          outcome: string
          resource: string
          timestamp: string
          user_agent: string | null
          user_id: string
          user_role: string
        }
        Insert: {
          audit_id: string
          changes?: Json | null
          compliance_flags: Json
          created_at?: string | null
          data_accessed?: string[] | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          operation: string
          outcome: string
          resource: string
          timestamp: string
          user_agent?: string | null
          user_id: string
          user_role: string
        }
        Update: {
          audit_id?: string
          changes?: Json | null
          compliance_flags?: Json
          created_at?: string | null
          data_accessed?: string[] | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          operation?: string
          outcome?: string
          resource?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string
          user_role?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      avatars: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          icon: string
          id: string
          name: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon: string
          id?: string
          name: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          name?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      beliefs: {
        Row: {
          belief_id: string
          belief_name: string | null
          created_at: string | null
          critical_assumption: string | null
          updated_at: string | null
        }
        Insert: {
          belief_id: string
          belief_name?: string | null
          created_at?: string | null
          critical_assumption?: string | null
          updated_at?: string | null
        }
        Update: {
          belief_id?: string
          belief_name?: string | null
          created_at?: string | null
          critical_assumption?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      board_panel_member: {
        Row: {
          agent_id: string | null
          created_at: string | null
          id: string
          persona: string
          role: string | null
          session_id: string
          weight: number | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          persona: string
          role?: string | null
          session_id: string
          weight?: number | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          persona?: string
          role?: string | null
          session_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "board_panel_member_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "board_session"
            referencedColumns: ["id"]
          },
        ]
      }
      board_reply: {
        Row: {
          agent_id: string | null
          answer: string
          citations: Json | null
          confidence: number | null
          created_at: string | null
          flags: string[] | null
          id: string
          persona: string
          session_id: string
          turn_no: number
        }
        Insert: {
          agent_id?: string | null
          answer: string
          citations?: Json | null
          confidence?: number | null
          created_at?: string | null
          flags?: string[] | null
          id?: string
          persona: string
          session_id: string
          turn_no: number
        }
        Update: {
          agent_id?: string | null
          answer?: string
          citations?: Json | null
          confidence?: number | null
          created_at?: string | null
          flags?: string[] | null
          id?: string
          persona?: string
          session_id?: string
          turn_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "board_reply_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "board_session"
            referencedColumns: ["id"]
          },
        ]
      }
      board_session: {
        Row: {
          agenda: Json
          archetype: string
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          evidence_pack_id: string | null
          fusion_model: string
          id: string
          mode: string
          name: string
          policy_profile: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          agenda?: Json
          archetype: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          evidence_pack_id?: string | null
          fusion_model: string
          id?: string
          mode: string
          name: string
          policy_profile?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          agenda?: Json
          archetype?: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          evidence_pack_id?: string | null
          fusion_model?: string
          id?: string
          mode?: string
          name?: string
          policy_profile?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      board_synthesis: {
        Row: {
          approved: boolean | null
          approved_at: string | null
          approved_by: string | null
          consensus: string | null
          created_at: string | null
          dissent: string | null
          risks: Json | null
          session_id: string
          summary_md: string
          turn_no: number
        }
        Insert: {
          approved?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          consensus?: string | null
          created_at?: string | null
          dissent?: string | null
          risks?: Json | null
          session_id: string
          summary_md: string
          turn_no: number
        }
        Update: {
          approved?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          consensus?: string | null
          created_at?: string | null
          dissent?: string | null
          risks?: Json | null
          session_id?: string
          summary_md?: string
          turn_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "board_synthesis_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "board_session"
            referencedColumns: ["id"]
          },
        ]
      }
      business_functions: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          key_activities: string[] | null
          metadata: Json | null
          name: string
          parent_function_id: string | null
          slug: string
          success_metrics: string[] | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          key_activities?: string[] | null
          metadata?: Json | null
          name: string
          parent_function_id?: string | null
          slug: string
          success_metrics?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          key_activities?: string[] | null
          metadata?: Json | null
          name?: string
          parent_function_id?: string | null
          slug?: string
          success_metrics?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_functions_parent_function_id_fkey"
            columns: ["parent_function_id"]
            isOneToOne: false
            referencedRelation: "business_functions"
            referencedColumns: ["id"]
          },
        ]
      }
      capabilities: {
        Row: {
          average_execution_time: number | null
          category: string
          color: string | null
          complexity_level: string | null
          created_at: string
          description: string
          display_name: string
          domain: string
          icon: string | null
          id: string
          is_premium: boolean | null
          name: string
          prerequisites: Json | null
          requires_api_access: boolean | null
          requires_training: boolean | null
          status: string
          success_rate: number | null
          updated_at: string
          usage_count: number | null
          version: string | null
        }
        Insert: {
          average_execution_time?: number | null
          category?: string
          color?: string | null
          complexity_level?: string | null
          created_at?: string
          description: string
          display_name: string
          domain?: string
          icon?: string | null
          id?: string
          is_premium?: boolean | null
          name: string
          prerequisites?: Json | null
          requires_api_access?: boolean | null
          requires_training?: boolean | null
          status?: string
          success_rate?: number | null
          updated_at?: string
          usage_count?: number | null
          version?: string | null
        }
        Update: {
          average_execution_time?: number | null
          category?: string
          color?: string | null
          complexity_level?: string | null
          created_at?: string
          description?: string
          display_name?: string
          domain?: string
          icon?: string | null
          id?: string
          is_premium?: boolean | null
          name?: string
          prerequisites?: Json | null
          requires_api_access?: boolean | null
          requires_training?: boolean | null
          status?: string
          success_rate?: number | null
          updated_at?: string
          usage_count?: number | null
          version?: string | null
        }
        Relationships: []
      }
      capability_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          display_name: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "capability_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "capability_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          agent_id: string | null
          created_at: string
          id: string
          last_message: string | null
          message_count: number | null
          metadata: Json | null
          organization_id: string | null
          project_id: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          id?: string
          last_message?: string | null
          message_count?: number | null
          metadata?: Json | null
          organization_id?: string | null
          project_id?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          id?: string
          last_message?: string | null
          message_count?: number | null
          metadata?: Json | null
          organization_id?: string | null
          project_id?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_history: {
        Row: {
          content: string
          created_at: string | null
          id: string
          message_index: number
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          message_index: number
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          message_index?: number
          role?: string
          session_id?: string
        }
        Relationships: []
      }
      chat_memory: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          memory_key: string
          memory_value: string
          session_id: string
          strategy: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          memory_key: string
          memory_value: string
          session_id: string
          strategy?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          memory_key?: string
          memory_value?: string
          session_id?: string
          strategy?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          content: string
          created_at: string
          id: string
          metadata: Json | null
          mode: string
          role: string
          session_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          agent_name?: string | null
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          mode?: string
          role: string
          session_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          agent_name?: string | null
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          mode?: string
          role?: string
          session_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_full_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          created_at: string
          id: string
          is_active: boolean
          last_message_at: string
          message_count: number
          metadata: Json | null
          mode: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          agent_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_message_at?: string
          message_count?: number
          metadata?: Json | null
          mode?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          agent_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_message_at?: string
          message_count?: number
          metadata?: Json | null
          mode?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_full_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      complexity_levels: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          name: string
          sort_order: number | null
          typical_time_max: number | null
          typical_time_min: number | null
          user_level: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          name: string
          sort_order?: number | null
          typical_time_max?: number | null
          typical_time_min?: number | null
          user_level?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          name?: string
          sort_order?: number | null
          typical_time_max?: number | null
          typical_time_min?: number | null
          user_level?: string | null
        }
        Relationships: []
      }
      compliance_records: {
        Row: {
          assigned_to: string | null
          completed_date: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          record_type: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          record_type: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          record_type?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_records: {
        Row: {
          consent_id: string
          consent_type: string
          created_at: string | null
          expiration_date: string | null
          id: string
          legal_basis: string | null
          metadata: Json | null
          scope: string[] | null
          status: string
          timestamp: string
          user_id: string
        }
        Insert: {
          consent_id: string
          consent_type: string
          created_at?: string | null
          expiration_date?: string | null
          id?: string
          legal_basis?: string | null
          metadata?: Json | null
          scope?: string[] | null
          status: string
          timestamp: string
          user_id: string
        }
        Update: {
          consent_id?: string
          consent_type?: string
          created_at?: string | null
          expiration_date?: string | null
          id?: string
          legal_basis?: string | null
          metadata?: Json | null
          scope?: string[] | null
          status?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          agent_id: string | null
          created_at: string | null
          id: string
          status: string | null
          tenant_id: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          tenant_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          tenant_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_full_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          agent_id: string | null
          created_at: string | null
          id: string
          last_message_at: string | null
          metadata: Json | null
          status: string | null
          tenant_id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          status?: string | null
          tenant_id: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          status?: string | null
          tenant_id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_full_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      data_retention_tracking: {
        Row: {
          created_at: string | null
          data_id: string
          data_type: string
          id: string
          table_name: string
          tags: string[] | null
        }
        Insert: {
          created_at?: string | null
          data_id: string
          data_type: string
          id?: string
          table_name: string
          tags?: string[] | null
        }
        Update: {
          created_at?: string | null
          data_id?: string
          data_type?: string
          id?: string
          table_name?: string
          tags?: string[] | null
        }
        Relationships: []
      }
      department_roles: {
        Row: {
          created_at: string | null
          department_id: string
          headcount: number | null
          id: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          department_id: string
          headcount?: number | null
          id?: string
          role_id: string
        }
        Update: {
          created_at?: string | null
          department_id?: string
          headcount?: number | null
          id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          compliance_requirements: string[] | null
          created_at: string | null
          created_by: string | null
          critical_systems: string[] | null
          data_classification: string | null
          department_id: string | null
          department_name: string
          department_type: string | null
          description: string | null
          export_format: string | null
          function_area: string | null
          function_id: string | null
          id: string
          metadata: Json | null
          migration_ready: boolean | null
          search_vector: unknown
          unique_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          compliance_requirements?: string[] | null
          created_at?: string | null
          created_by?: string | null
          critical_systems?: string[] | null
          data_classification?: string | null
          department_id?: string | null
          department_name: string
          department_type?: string | null
          description?: string | null
          export_format?: string | null
          function_area?: string | null
          function_id?: string | null
          id?: string
          metadata?: Json | null
          migration_ready?: boolean | null
          search_vector?: unknown
          unique_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          compliance_requirements?: string[] | null
          created_at?: string | null
          created_by?: string | null
          critical_systems?: string[] | null
          data_classification?: string | null
          department_id?: string | null
          department_name?: string
          department_type?: string | null
          description?: string | null
          export_format?: string | null
          function_area?: string | null
          function_id?: string | null
          id?: string
          metadata?: Json | null
          migration_ready?: boolean | null
          search_vector?: unknown
          unique_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "functions"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_agent: {
        Row: {
          agent_type: string
          autonomy_level: string | null
          avg_execution_time_sec: number | null
          can_delegate_to: Json | null
          capabilities: Json | null
          changelog: Json | null
          code: string
          created_at: string
          depends_on_agents: Json | null
          description: string | null
          estimated_cost_per_run: number | null
          framework: string | null
          guardrails: Json | null
          id: string
          last_executed_at: string | null
          max_iterations: number | null
          metadata: Json | null
          model_config: Json | null
          name: string
          output_schema: Json | null
          prompt_templates: Json | null
          rag_sources: Json | null
          status: string | null
          success_rate: number | null
          tags: string[] | null
          tenant_id: string
          timeout_seconds: number | null
          tools: Json | null
          total_cost: number | null
          total_executions: number | null
          unique_id: string
          updated_at: string
          validation_rules: Json | null
          version: string | null
        }
        Insert: {
          agent_type: string
          autonomy_level?: string | null
          avg_execution_time_sec?: number | null
          can_delegate_to?: Json | null
          capabilities?: Json | null
          changelog?: Json | null
          code: string
          created_at?: string
          depends_on_agents?: Json | null
          description?: string | null
          estimated_cost_per_run?: number | null
          framework?: string | null
          guardrails?: Json | null
          id?: string
          last_executed_at?: string | null
          max_iterations?: number | null
          metadata?: Json | null
          model_config?: Json | null
          name: string
          output_schema?: Json | null
          prompt_templates?: Json | null
          rag_sources?: Json | null
          status?: string | null
          success_rate?: number | null
          tags?: string[] | null
          tenant_id: string
          timeout_seconds?: number | null
          tools?: Json | null
          total_cost?: number | null
          total_executions?: number | null
          unique_id: string
          updated_at?: string
          validation_rules?: Json | null
          version?: string | null
        }
        Update: {
          agent_type?: string
          autonomy_level?: string | null
          avg_execution_time_sec?: number | null
          can_delegate_to?: Json | null
          capabilities?: Json | null
          changelog?: Json | null
          code?: string
          created_at?: string
          depends_on_agents?: Json | null
          description?: string | null
          estimated_cost_per_run?: number | null
          framework?: string | null
          guardrails?: Json | null
          id?: string
          last_executed_at?: string | null
          max_iterations?: number | null
          metadata?: Json | null
          model_config?: Json | null
          name?: string
          output_schema?: Json | null
          prompt_templates?: Json | null
          rag_sources?: Json | null
          status?: string | null
          success_rate?: number | null
          tags?: string[] | null
          tenant_id?: string
          timeout_seconds?: number | null
          tools?: Json | null
          total_cost?: number | null
          total_executions?: number | null
          unique_id?: string
          updated_at?: string
          validation_rules?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dh_agent_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_agent_prompt_starter: {
        Row: {
          agent_id: string
          agent_unique_id: string
          created_at: string
          description: string | null
          id: string
          metadata: Json
          position: number
          prompt_id: string
          prompt_unique_id: string
          prompt_version_id: string | null
          tags: string[] | null
          tenant_id: string
          title: string
          unique_id: string
          updated_at: string
          version_preference: string
        }
        Insert: {
          agent_id: string
          agent_unique_id: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          position?: number
          prompt_id: string
          prompt_unique_id: string
          prompt_version_id?: string | null
          tags?: string[] | null
          tenant_id: string
          title: string
          unique_id: string
          updated_at?: string
          version_preference?: string
        }
        Update: {
          agent_id?: string
          agent_unique_id?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          position?: number
          prompt_id?: string
          prompt_unique_id?: string
          prompt_version_id?: string | null
          tags?: string[] | null
          tenant_id?: string
          title?: string
          unique_id?: string
          updated_at?: string
          version_preference?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_agent_prompt_starter_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_full_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_agent_prompt_starter_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_agent_prompt_starter_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompt_full_context"
            referencedColumns: ["prompt_id"]
          },
          {
            foreignKeyName: "dh_agent_prompt_starter_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_agent_prompt_starter_prompt_version_id_fkey"
            columns: ["prompt_version_id"]
            isOneToOne: false
            referencedRelation: "dh_prompt_version"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_agent_prompt_starter_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_agent_subsuite: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          metadata: Json
          name: string
          position: number
          suite_id: string
          tags: string[] | null
          tenant_id: string
          unique_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name: string
          position?: number
          suite_id: string
          tags?: string[] | null
          tenant_id: string
          unique_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name?: string
          position?: number
          suite_id?: string
          tags?: string[] | null
          tenant_id?: string
          unique_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_agent_subsuite_suite_id_fkey"
            columns: ["suite_id"]
            isOneToOne: false
            referencedRelation: "dh_agent_suite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_agent_subsuite_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_agent_suite: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          metadata: Json
          name: string
          position: number
          tags: string[] | null
          tenant_id: string
          unique_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name: string
          position?: number
          tags?: string[] | null
          tenant_id: string
          unique_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name?: string
          position?: number
          tags?: string[] | null
          tenant_id?: string
          unique_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_agent_suite_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_agent_suite_member: {
        Row: {
          agent_id: string
          agent_unique_id: string
          created_at: string
          id: string
          metadata: Json
          position: number
          primary_flag: boolean
          subsuite_id: string | null
          suite_id: string
          tenant_id: string
        }
        Insert: {
          agent_id: string
          agent_unique_id: string
          created_at?: string
          id?: string
          metadata?: Json
          position?: number
          primary_flag?: boolean
          subsuite_id?: string | null
          suite_id: string
          tenant_id: string
        }
        Update: {
          agent_id?: string
          agent_unique_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          position?: number
          primary_flag?: boolean
          subsuite_id?: string | null
          suite_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_agent_suite_member_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "dh_role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_agent_suite_member_subsuite_id_fkey"
            columns: ["subsuite_id"]
            isOneToOne: false
            referencedRelation: "dh_agent_subsuite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_agent_suite_member_suite_id_fkey"
            columns: ["suite_id"]
            isOneToOne: false
            referencedRelation: "dh_agent_suite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_agent_suite_member_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_domain: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          metadata: Json
          name: string
          tenant_id: string
          unique_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          name: string
          tenant_id: string
          unique_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          name?: string
          tenant_id?: string
          unique_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_domain_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_kpi: {
        Row: {
          category: string | null
          code: string
          created_at: string
          description: string | null
          direction: string | null
          id: string
          metadata: Json
          name: string
          tags: string[] | null
          tenant_id: string
          unique_id: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string
          description?: string | null
          direction?: string | null
          id?: string
          metadata?: Json
          name: string
          tags?: string[] | null
          tenant_id: string
          unique_id: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string
          description?: string | null
          direction?: string | null
          id?: string
          metadata?: Json
          name?: string
          tags?: string[] | null
          tenant_id?: string
          unique_id?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_kpi_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_personas: {
        Row: {
          adoption_score: number | null
          ai_relationship: string | null
          background: string | null
          behaviors: Json | null
          biotech_id: string | null
          budget: string | null
          budget_authority: string | null
          certifications: string | null
          created_at: string
          decision_authority: string | null
          decision_cycle: string | null
          digital_health_id: string | null
          dx_id: string | null
          ease_score: number | null
          experience: string | null
          expertise_level: string | null
          focus: string | null
          frustrations: Json | null
          function: string | null
          goals: Json | null
          id: string
          industry_id: string | null
          is_active: boolean | null
          key_need: string | null
          meddev_id: string | null
          motivations: Json | null
          name: string
          needs: Json | null
          network_score: number | null
          notes: string | null
          org_size: string | null
          org_type: string | null
          organization: string | null
          pain_points: Json | null
          pain_score: number | null
          persona_code: string
          pharma_id: string | null
          preferred_channels: Json | null
          primary_role_id: string | null
          priority_score: number | null
          programs_managed: string | null
          projects: string | null
          responsibilities: Json | null
          role_category: string | null
          sector: string | null
          source: string | null
          specialization: string | null
          strategic_score: number | null
          tags: Json | null
          team: string | null
          team_size: string | null
          tech_proficiency: string | null
          therapeutic_areas: string | null
          tier: number | null
          title: string
          typical_titles: Json | null
          unique_id: string
          updated_at: string
          value_score: number | null
        }
        Insert: {
          adoption_score?: number | null
          ai_relationship?: string | null
          background?: string | null
          behaviors?: Json | null
          biotech_id?: string | null
          budget?: string | null
          budget_authority?: string | null
          certifications?: string | null
          created_at?: string
          decision_authority?: string | null
          decision_cycle?: string | null
          digital_health_id?: string | null
          dx_id?: string | null
          ease_score?: number | null
          experience?: string | null
          expertise_level?: string | null
          focus?: string | null
          frustrations?: Json | null
          function?: string | null
          goals?: Json | null
          id?: string
          industry_id?: string | null
          is_active?: boolean | null
          key_need?: string | null
          meddev_id?: string | null
          motivations?: Json | null
          name: string
          needs?: Json | null
          network_score?: number | null
          notes?: string | null
          org_size?: string | null
          org_type?: string | null
          organization?: string | null
          pain_points?: Json | null
          pain_score?: number | null
          persona_code: string
          pharma_id?: string | null
          preferred_channels?: Json | null
          primary_role_id?: string | null
          priority_score?: number | null
          programs_managed?: string | null
          projects?: string | null
          responsibilities?: Json | null
          role_category?: string | null
          sector?: string | null
          source?: string | null
          specialization?: string | null
          strategic_score?: number | null
          tags?: Json | null
          team?: string | null
          team_size?: string | null
          tech_proficiency?: string | null
          therapeutic_areas?: string | null
          tier?: number | null
          title: string
          typical_titles?: Json | null
          unique_id: string
          updated_at?: string
          value_score?: number | null
        }
        Update: {
          adoption_score?: number | null
          ai_relationship?: string | null
          background?: string | null
          behaviors?: Json | null
          biotech_id?: string | null
          budget?: string | null
          budget_authority?: string | null
          certifications?: string | null
          created_at?: string
          decision_authority?: string | null
          decision_cycle?: string | null
          digital_health_id?: string | null
          dx_id?: string | null
          ease_score?: number | null
          experience?: string | null
          expertise_level?: string | null
          focus?: string | null
          frustrations?: Json | null
          function?: string | null
          goals?: Json | null
          id?: string
          industry_id?: string | null
          is_active?: boolean | null
          key_need?: string | null
          meddev_id?: string | null
          motivations?: Json | null
          name?: string
          needs?: Json | null
          network_score?: number | null
          notes?: string | null
          org_size?: string | null
          org_type?: string | null
          organization?: string | null
          pain_points?: Json | null
          pain_score?: number | null
          persona_code?: string
          pharma_id?: string | null
          preferred_channels?: Json | null
          primary_role_id?: string | null
          priority_score?: number | null
          programs_managed?: string | null
          projects?: string | null
          responsibilities?: Json | null
          role_category?: string | null
          sector?: string | null
          source?: string | null
          specialization?: string | null
          strategic_score?: number | null
          tags?: Json | null
          team?: string | null
          team_size?: string | null
          tech_proficiency?: string | null
          therapeutic_areas?: string | null
          tier?: number | null
          title?: string
          typical_titles?: Json | null
          unique_id?: string
          updated_at?: string
          value_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dh_personas_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_personas_primary_role_id_fkey"
            columns: ["primary_role_id"]
            isOneToOne: false
            referencedRelation: "org_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_personas_primary_role_id_fkey"
            columns: ["primary_role_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["role_id"]
          },
        ]
      }
      dh_prompt: {
        Row: {
          category: string | null
          created_at: string
          evals: Json
          guardrails: Json
          id: string
          metadata: Json
          model_config: Json
          name: string
          owner: Json
          pattern: string
          prompt_identifier: string | null
          rollout: string | null
          system_prompt: string
          tags: string[] | null
          task_id: string
          tenant_id: string
          unique_id: string
          updated_at: string
          user_template: string
          version_label: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          evals?: Json
          guardrails?: Json
          id?: string
          metadata?: Json
          model_config?: Json
          name: string
          owner?: Json
          pattern?: string
          prompt_identifier?: string | null
          rollout?: string | null
          system_prompt: string
          tags?: string[] | null
          task_id: string
          tenant_id: string
          unique_id: string
          updated_at?: string
          user_template: string
          version_label?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          evals?: Json
          guardrails?: Json
          id?: string
          metadata?: Json
          model_config?: Json
          name?: string
          owner?: Json
          pattern?: string
          prompt_identifier?: string | null
          rollout?: string | null
          system_prompt?: string
          tags?: string[] | null
          task_id?: string
          tenant_id?: string
          unique_id?: string
          updated_at?: string
          user_template?: string
          version_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dh_prompt_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "dh_task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_prompt_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_prompt_agent_capability: {
        Row: {
          agent_id: string
          agent_unique_id: string
          capability_level: string
          created_at: string
          default_prompt_starter_id: string | null
          id: string
          metadata: Json
          notes: string | null
          prompt_id: string
          prompt_unique_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          agent_unique_id: string
          capability_level?: string
          created_at?: string
          default_prompt_starter_id?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          prompt_id: string
          prompt_unique_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          agent_unique_id?: string
          capability_level?: string
          created_at?: string
          default_prompt_starter_id?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          prompt_id?: string
          prompt_unique_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_prompt_agent_capability_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "dh_role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_prompt_agent_capability_default_prompt_starter_id_fkey"
            columns: ["default_prompt_starter_id"]
            isOneToOne: false
            referencedRelation: "dh_agent_prompt_starter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_prompt_agent_capability_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "dh_prompt"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_prompt_agent_capability_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_prompt_eval: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          notes: string | null
          prompt_version_id: string
          result_metrics: Json
          status: string | null
          tenant_id: string
          test_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          notes?: string | null
          prompt_version_id: string
          result_metrics?: Json
          status?: string | null
          tenant_id: string
          test_name: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          notes?: string | null
          prompt_version_id?: string
          result_metrics?: Json
          status?: string | null
          tenant_id?: string
          test_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_prompt_eval_prompt_version_id_fkey"
            columns: ["prompt_version_id"]
            isOneToOne: false
            referencedRelation: "dh_prompt_version"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_prompt_eval_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_prompt_subsuite: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          metadata: Json
          name: string
          position: number
          suite_id: string
          tags: string[] | null
          tenant_id: string
          unique_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name: string
          position?: number
          suite_id: string
          tags?: string[] | null
          tenant_id: string
          unique_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name?: string
          position?: number
          suite_id?: string
          tags?: string[] | null
          tenant_id?: string
          unique_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_prompt_subsuite_suite_id_fkey"
            columns: ["suite_id"]
            isOneToOne: false
            referencedRelation: "dh_prompt_suite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_prompt_subsuite_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_prompt_suite: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          metadata: Json
          name: string
          position: number
          tags: string[] | null
          tenant_id: string
          unique_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name: string
          position?: number
          tags?: string[] | null
          tenant_id: string
          unique_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name?: string
          position?: number
          tags?: string[] | null
          tenant_id?: string
          unique_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_prompt_suite_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_prompt_suite_prompt: {
        Row: {
          created_at: string
          default_agent_unique_id: string | null
          id: string
          metadata: Json
          position: number
          prompt_id: string
          prompt_unique_id: string
          subsuite_id: string | null
          suite_id: string
          tenant_id: string
          usage_context: string | null
        }
        Insert: {
          created_at?: string
          default_agent_unique_id?: string | null
          id?: string
          metadata?: Json
          position?: number
          prompt_id: string
          prompt_unique_id: string
          subsuite_id?: string | null
          suite_id: string
          tenant_id: string
          usage_context?: string | null
        }
        Update: {
          created_at?: string
          default_agent_unique_id?: string | null
          id?: string
          metadata?: Json
          position?: number
          prompt_id?: string
          prompt_unique_id?: string
          subsuite_id?: string | null
          suite_id?: string
          tenant_id?: string
          usage_context?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dh_prompt_suite_prompt_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "dh_prompt"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_prompt_suite_prompt_subsuite_id_fkey"
            columns: ["subsuite_id"]
            isOneToOne: false
            referencedRelation: "dh_prompt_subsuite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_prompt_suite_prompt_suite_id_fkey"
            columns: ["suite_id"]
            isOneToOne: false
            referencedRelation: "dh_prompt_suite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_prompt_suite_prompt_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_prompt_version: {
        Row: {
          changelog: string | null
          created_at: string
          evals: Json
          guardrails: Json
          id: string
          model_config: Json
          prompt_id: string
          rollout: string | null
          system_prompt: string
          tenant_id: string
          unique_id: string | null
          updated_at: string
          user_template: string
          version: number
        }
        Insert: {
          changelog?: string | null
          created_at?: string
          evals?: Json
          guardrails?: Json
          id?: string
          model_config?: Json
          prompt_id: string
          rollout?: string | null
          system_prompt: string
          tenant_id: string
          unique_id?: string | null
          updated_at?: string
          user_template: string
          version?: number
        }
        Update: {
          changelog?: string | null
          created_at?: string
          evals?: Json
          guardrails?: Json
          id?: string
          model_config?: Json
          prompt_id?: string
          rollout?: string | null
          system_prompt?: string
          tenant_id?: string
          unique_id?: string | null
          updated_at?: string
          user_template?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "dh_prompt_version_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "dh_prompt"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_prompt_version_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_rag_source: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          metadata: Json
          name: string
          source_type: string
          tenant_id: string
          unique_id: string
          updated_at: string
          uri: string | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          name: string
          source_type?: string
          tenant_id: string
          unique_id: string
          updated_at?: string
          uri?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          name?: string
          source_type?: string
          tenant_id?: string
          unique_id?: string
          updated_at?: string
          uri?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dh_rag_source_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_role: {
        Row: {
          agent_type: string
          category_code: string | null
          code: string
          created_at: string
          department: string | null
          description: string | null
          id: string
          metadata: Json
          name: string
          tenant_id: string
          unique_id: string
          updated_at: string
        }
        Insert: {
          agent_type?: string
          category_code?: string | null
          code: string
          created_at?: string
          department?: string | null
          description?: string | null
          id?: string
          metadata?: Json
          name: string
          tenant_id: string
          unique_id: string
          updated_at?: string
        }
        Update: {
          agent_type?: string
          category_code?: string | null
          code?: string
          created_at?: string
          department?: string | null
          description?: string | null
          id?: string
          metadata?: Json
          name?: string
          tenant_id?: string
          unique_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_role_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_role_skill: {
        Row: {
          created_at: string
          id: string
          note: string | null
          proficiency: string
          role_id: string
          skill_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          proficiency?: string
          role_id: string
          skill_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          proficiency?: string
          role_id?: string
          skill_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_role_skill_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "dh_role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_role_skill_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "dh_skill"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_role_skill_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_skill: {
        Row: {
          category: string | null
          code: string
          created_at: string
          description: string | null
          id: string
          input_schema: Json | null
          metadata: Json
          methodology: Json
          name: string
          output_schema: Json | null
          quality_metrics: Json | null
          required_agents: string[] | null
          required_knowledge: string[] | null
          required_tools: string[] | null
          status: string
          tags: string[] | null
          tenant_id: string
          test_cases: Json
          test_results: Json
          unique_id: string
          updated_at: string
          version: string
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string
          description?: string | null
          id?: string
          input_schema?: Json | null
          metadata?: Json
          methodology?: Json
          name: string
          output_schema?: Json | null
          quality_metrics?: Json | null
          required_agents?: string[] | null
          required_knowledge?: string[] | null
          required_tools?: string[] | null
          status?: string
          tags?: string[] | null
          tenant_id: string
          test_cases?: Json
          test_results?: Json
          unique_id: string
          updated_at?: string
          version?: string
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          input_schema?: Json | null
          metadata?: Json
          methodology?: Json
          name?: string
          output_schema?: Json | null
          quality_metrics?: Json | null
          required_agents?: string[] | null
          required_knowledge?: string[] | null
          required_tools?: string[] | null
          status?: string
          tags?: string[] | null
          tenant_id?: string
          test_cases?: Json
          test_results?: Json
          unique_id?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_skill_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_skill_prompt: {
        Row: {
          id: string
          is_required: boolean
          prompt_id: string
          prompt_unique_id: string
          sequence: number
          skill_id: string
          step_number: number | null
          tenant_id: string
        }
        Insert: {
          id?: string
          is_required?: boolean
          prompt_id: string
          prompt_unique_id: string
          sequence?: number
          skill_id: string
          step_number?: number | null
          tenant_id: string
        }
        Update: {
          id?: string
          is_required?: boolean
          prompt_id?: string
          prompt_unique_id?: string
          sequence?: number
          skill_id?: string
          step_number?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_skill_prompt_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "dh_prompt"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_skill_prompt_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "dh_skill"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_skill_prompt_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_skill_rag: {
        Row: {
          id: string
          rag_source_id: string
          rag_unique_id: string
          sections: string[] | null
          skill_id: string
          tenant_id: string
          usage_type: string
        }
        Insert: {
          id?: string
          rag_source_id: string
          rag_unique_id: string
          sections?: string[] | null
          skill_id: string
          tenant_id: string
          usage_type?: string
        }
        Update: {
          id?: string
          rag_source_id?: string
          rag_unique_id?: string
          sections?: string[] | null
          skill_id?: string
          tenant_id?: string
          usage_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_skill_rag_rag_source_id_fkey"
            columns: ["rag_source_id"]
            isOneToOne: false
            referencedRelation: "dh_rag_source"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_skill_rag_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "dh_skill"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_skill_rag_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_skill_tool: {
        Row: {
          id: string
          is_required: boolean
          purpose: string | null
          skill_id: string
          tenant_id: string
          tool_id: string
          tool_unique_id: string
        }
        Insert: {
          id?: string
          is_required?: boolean
          purpose?: string | null
          skill_id: string
          tenant_id: string
          tool_id: string
          tool_unique_id: string
        }
        Update: {
          id?: string
          is_required?: boolean
          purpose?: string | null
          skill_id?: string
          tenant_id?: string
          tool_id?: string
          tool_unique_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_skill_tool_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "dh_skill"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_skill_tool_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_skill_tool_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "dh_tool"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_task: {
        Row: {
          assignees: Json
          code: string
          created_at: string
          duration_estimate_minutes: number | null
          effort_hours: number | null
          extra: Json
          guardrails: Json
          id: string
          integrations: Json
          logs: Json
          model_config: Json
          objective: string | null
          permissions: Json
          position: number
          rollout: string | null
          run_policy: Json
          schedule: Json
          state: string | null
          tenant_id: string
          title: string
          unique_id: string
          updated_at: string
          webhooks: Json
          workflow_id: string
        }
        Insert: {
          assignees?: Json
          code: string
          created_at?: string
          duration_estimate_minutes?: number | null
          effort_hours?: number | null
          extra?: Json
          guardrails?: Json
          id?: string
          integrations?: Json
          logs?: Json
          model_config?: Json
          objective?: string | null
          permissions?: Json
          position?: number
          rollout?: string | null
          run_policy?: Json
          schedule?: Json
          state?: string | null
          tenant_id: string
          title: string
          unique_id: string
          updated_at?: string
          webhooks?: Json
          workflow_id: string
        }
        Update: {
          assignees?: Json
          code?: string
          created_at?: string
          duration_estimate_minutes?: number | null
          effort_hours?: number | null
          extra?: Json
          guardrails?: Json
          id?: string
          integrations?: Json
          logs?: Json
          model_config?: Json
          objective?: string | null
          permissions?: Json
          position?: number
          rollout?: string | null
          run_policy?: Json
          schedule?: Json
          state?: string | null
          tenant_id?: string
          title?: string
          unique_id?: string
          updated_at?: string
          webhooks?: Json
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_task_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "dh_workflow"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_task_agent: {
        Row: {
          agent_id: string
          approval_persona_code: string | null
          approval_stage: string | null
          assignment_type: string
          config_overrides: Json | null
          created_at: string
          execution_count: number | null
          execution_order: number | null
          fallback_agent_id: string | null
          id: string
          is_parallel: boolean | null
          last_executed_at: string | null
          last_execution_duration_sec: number | null
          last_execution_status: string | null
          max_retries: number | null
          metadata: Json | null
          notes: string | null
          on_failure: string | null
          requires_human_approval: boolean | null
          retry_strategy: string | null
          task_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          approval_persona_code?: string | null
          approval_stage?: string | null
          assignment_type?: string
          config_overrides?: Json | null
          created_at?: string
          execution_count?: number | null
          execution_order?: number | null
          fallback_agent_id?: string | null
          id?: string
          is_parallel?: boolean | null
          last_executed_at?: string | null
          last_execution_duration_sec?: number | null
          last_execution_status?: string | null
          max_retries?: number | null
          metadata?: Json | null
          notes?: string | null
          on_failure?: string | null
          requires_human_approval?: boolean | null
          retry_strategy?: string | null
          task_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          approval_persona_code?: string | null
          approval_stage?: string | null
          assignment_type?: string
          config_overrides?: Json | null
          created_at?: string
          execution_count?: number | null
          execution_order?: number | null
          fallback_agent_id?: string | null
          id?: string
          is_parallel?: boolean | null
          last_executed_at?: string | null
          last_execution_duration_sec?: number | null
          last_execution_status?: string | null
          max_retries?: number | null
          metadata?: Json | null
          notes?: string | null
          on_failure?: string | null
          requires_human_approval?: boolean | null
          retry_strategy?: string | null
          task_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_task_agent_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "dh_agent"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_agent_fallback_agent_id_fkey"
            columns: ["fallback_agent_id"]
            isOneToOne: false
            referencedRelation: "dh_agent"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_agent_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "dh_task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_agent_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_task_agent_assignment: {
        Row: {
          agent_id: string
          agent_unique_id: string
          assignment_rationale: string | null
          config_overrides: Json
          created_at: string
          default_prompt_starter_id: string | null
          id: string
          is_required: boolean
          required_expertise: string[] | null
          role_type: string
          sequence: number
          subsuite_id: string | null
          suite_id: string | null
          task_id: string
          task_unique_id: string
          tenant_id: string
        }
        Insert: {
          agent_id: string
          agent_unique_id: string
          assignment_rationale?: string | null
          config_overrides?: Json
          created_at?: string
          default_prompt_starter_id?: string | null
          id?: string
          is_required?: boolean
          required_expertise?: string[] | null
          role_type: string
          sequence?: number
          subsuite_id?: string | null
          suite_id?: string | null
          task_id: string
          task_unique_id: string
          tenant_id: string
        }
        Update: {
          agent_id?: string
          agent_unique_id?: string
          assignment_rationale?: string | null
          config_overrides?: Json
          created_at?: string
          default_prompt_starter_id?: string | null
          id?: string
          is_required?: boolean
          required_expertise?: string[] | null
          role_type?: string
          sequence?: number
          subsuite_id?: string | null
          suite_id?: string | null
          task_id?: string
          task_unique_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_task_agent_assignment_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "dh_role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_agent_assignment_default_prompt_starter_id_fkey"
            columns: ["default_prompt_starter_id"]
            isOneToOne: false
            referencedRelation: "dh_agent_prompt_starter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_agent_assignment_subsuite_id_fkey"
            columns: ["subsuite_id"]
            isOneToOne: false
            referencedRelation: "dh_agent_subsuite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_agent_assignment_suite_id_fkey"
            columns: ["suite_id"]
            isOneToOne: false
            referencedRelation: "dh_agent_suite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_agent_assignment_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "dh_task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_agent_assignment_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_task_ai_tool: {
        Row: {
          created_at: string
          id: string
          is_recommended: boolean | null
          is_required: boolean | null
          max_uses_per_execution: number | null
          priority: number | null
          task_id: string
          task_specific_config: Json | null
          tenant_id: string
          tool_id: string
          updated_at: string
          usage_notes: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_recommended?: boolean | null
          is_required?: boolean | null
          max_uses_per_execution?: number | null
          priority?: number | null
          task_id: string
          task_specific_config?: Json | null
          tenant_id: string
          tool_id: string
          updated_at?: string
          usage_notes?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_recommended?: boolean | null
          is_required?: boolean | null
          max_uses_per_execution?: number | null
          priority?: number | null
          task_id?: string
          task_specific_config?: Json | null
          tenant_id?: string
          tool_id?: string
          updated_at?: string
          usage_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dh_task_ai_tool_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "dh_task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_ai_tool_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_ai_tool_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tool_analytics"
            referencedColumns: ["tool_id"]
          },
          {
            foreignKeyName: "dh_task_ai_tool_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools_legacy"
            referencedColumns: ["tool_id"]
          },
        ]
      }
      dh_task_dependency: {
        Row: {
          created_at: string
          depends_on_task_id: string
          id: string
          note: string | null
          task_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          depends_on_task_id: string
          id?: string
          note?: string | null
          task_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          depends_on_task_id?: string
          id?: string
          note?: string | null
          task_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_task_dependency_depends_on_task_id_fkey"
            columns: ["depends_on_task_id"]
            isOneToOne: false
            referencedRelation: "dh_task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_dependency_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "dh_task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_dependency_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_task_input: {
        Row: {
          content_type: string | null
          created_at: string
          description: string | null
          id: string
          input_type: string
          link: string | null
          link_type: string | null
          metadata: Json
          name: string
          required: boolean
          schema_uri: string | null
          source: Json
          source_task_id: string | null
          task_id: string
          tenant_id: string
          uri: string | null
          validation: Json
          version: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          input_type?: string
          link?: string | null
          link_type?: string | null
          metadata?: Json
          name: string
          required?: boolean
          schema_uri?: string | null
          source?: Json
          source_task_id?: string | null
          task_id: string
          tenant_id: string
          uri?: string | null
          validation?: Json
          version?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          input_type?: string
          link?: string | null
          link_type?: string | null
          metadata?: Json
          name?: string
          required?: boolean
          schema_uri?: string | null
          source?: Json
          source_task_id?: string | null
          task_id?: string
          tenant_id?: string
          uri?: string | null
          validation?: Json
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dh_task_input_source_task_id_fkey"
            columns: ["source_task_id"]
            isOneToOne: false
            referencedRelation: "dh_task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_input_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "dh_task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_input_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_task_kpi_target: {
        Row: {
          created_at: string
          id: string
          kpi_id: string
          kpi_unique_id: string | null
          measurement_method: string | null
          target_note: string | null
          target_value: number | null
          task_id: string
          tenant_id: string
          threshold_type: string | null
          threshold_value: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          kpi_id: string
          kpi_unique_id?: string | null
          measurement_method?: string | null
          target_note?: string | null
          target_value?: number | null
          task_id: string
          tenant_id: string
          threshold_type?: string | null
          threshold_value?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          kpi_id?: string
          kpi_unique_id?: string | null
          measurement_method?: string | null
          target_note?: string | null
          target_value?: number | null
          task_id?: string
          tenant_id?: string
          threshold_type?: string | null
          threshold_value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "dh_task_kpi_target_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "dh_kpi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_kpi_target_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "dh_task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_kpi_target_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_task_link: {
        Row: {
          created_at: string
          id: string
          link_type: string
          note: string | null
          source_task_id: string
          target_task_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_type?: string
          note?: string | null
          source_task_id: string
          target_task_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link_type?: string
          note?: string | null
          source_task_id?: string
          target_task_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_task_link_source_task_id_fkey"
            columns: ["source_task_id"]
            isOneToOne: false
            referencedRelation: "dh_task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_link_target_task_id_fkey"
            columns: ["target_task_id"]
            isOneToOne: false
            referencedRelation: "dh_task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_link_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_task_output: {
        Row: {
          artifact_kind: string | null
          content_type: string | null
          created_at: string
          description: string | null
          format: string | null
          generation_config: Json
          id: string
          link: string | null
          link_type: string | null
          metadata: Json
          name: string
          output_format: string | null
          output_type: string
          output_unique_id: string | null
          schema_uri: string | null
          task_id: string
          template_id: string | null
          tenant_id: string
          uri: string | null
          validation: Json
          version: string | null
        }
        Insert: {
          artifact_kind?: string | null
          content_type?: string | null
          created_at?: string
          description?: string | null
          format?: string | null
          generation_config?: Json
          id?: string
          link?: string | null
          link_type?: string | null
          metadata?: Json
          name: string
          output_format?: string | null
          output_type?: string
          output_unique_id?: string | null
          schema_uri?: string | null
          task_id: string
          template_id?: string | null
          tenant_id: string
          uri?: string | null
          validation?: Json
          version?: string | null
        }
        Update: {
          artifact_kind?: string | null
          content_type?: string | null
          created_at?: string
          description?: string | null
          format?: string | null
          generation_config?: Json
          id?: string
          link?: string | null
          link_type?: string | null
          metadata?: Json
          name?: string
          output_format?: string | null
          output_type?: string
          output_unique_id?: string | null
          schema_uri?: string | null
          task_id?: string
          template_id?: string | null
          tenant_id?: string
          uri?: string | null
          validation?: Json
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dh_task_output_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "dh_task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_output_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_task_output_template: {
        Row: {
          created_at: string
          generation_config: Json
          id: string
          output_format: string
          task_output_id: string
          template_id: string
          template_unique_id: string
          tenant_id: string
          variable_mapping: Json
        }
        Insert: {
          created_at?: string
          generation_config?: Json
          id?: string
          output_format?: string
          task_output_id: string
          template_id: string
          template_unique_id: string
          tenant_id: string
          variable_mapping?: Json
        }
        Update: {
          created_at?: string
          generation_config?: Json
          id?: string
          output_format?: string
          task_output_id?: string
          template_id?: string
          template_unique_id?: string
          tenant_id?: string
          variable_mapping?: Json
        }
        Relationships: [
          {
            foreignKeyName: "dh_task_output_template_task_output_id_fkey"
            columns: ["task_output_id"]
            isOneToOne: false
            referencedRelation: "dh_task_output"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_output_template_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "dh_template"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_output_template_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_task_persona: {
        Row: {
          approval_criteria: string | null
          created_at: string
          escalation_after_hours: number | null
          escalation_notification: boolean | null
          escalation_to_persona_code: string | null
          estimated_time_minutes: number | null
          id: string
          is_blocking: boolean | null
          last_review_duration_minutes: number | null
          last_review_status: string | null
          last_reviewed_at: string | null
          metadata: Json | null
          notes: string | null
          notification_method: string | null
          notification_trigger: string | null
          persona_id: string
          requires_signature: boolean | null
          responsibility: string
          review_count: number | null
          review_timing: string | null
          signature_type: string | null
          sla_hours: number | null
          task_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          approval_criteria?: string | null
          created_at?: string
          escalation_after_hours?: number | null
          escalation_notification?: boolean | null
          escalation_to_persona_code?: string | null
          estimated_time_minutes?: number | null
          id?: string
          is_blocking?: boolean | null
          last_review_duration_minutes?: number | null
          last_review_status?: string | null
          last_reviewed_at?: string | null
          metadata?: Json | null
          notes?: string | null
          notification_method?: string | null
          notification_trigger?: string | null
          persona_id: string
          requires_signature?: boolean | null
          responsibility: string
          review_count?: number | null
          review_timing?: string | null
          signature_type?: string | null
          sla_hours?: number | null
          task_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          approval_criteria?: string | null
          created_at?: string
          escalation_after_hours?: number | null
          escalation_notification?: boolean | null
          escalation_to_persona_code?: string | null
          estimated_time_minutes?: number | null
          id?: string
          is_blocking?: boolean | null
          last_review_duration_minutes?: number | null
          last_review_status?: string | null
          last_reviewed_at?: string | null
          metadata?: Json | null
          notes?: string | null
          notification_method?: string | null
          notification_trigger?: string | null
          persona_id?: string
          requires_signature?: boolean | null
          responsibility?: string
          review_count?: number | null
          review_timing?: string | null
          signature_type?: string | null
          sla_hours?: number | null
          task_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_task_persona_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "org_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_persona_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["persona_id"]
          },
          {
            foreignKeyName: "dh_task_persona_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "v_persona_usecases"
            referencedColumns: ["persona_id"]
          },
          {
            foreignKeyName: "dh_task_persona_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "dh_task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_persona_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_task_prompt_assignment: {
        Row: {
          agent_assignment_id: string | null
          config_overrides: Json
          created_at: string
          id: string
          input_mapping: Json
          is_required: boolean
          output_mapping: Json
          prompt_id: string
          prompt_unique_id: string
          prompt_version_id: string | null
          purpose: string | null
          sequence: number
          task_id: string
          task_unique_id: string
          tenant_id: string
          version_preference: string
        }
        Insert: {
          agent_assignment_id?: string | null
          config_overrides?: Json
          created_at?: string
          id?: string
          input_mapping?: Json
          is_required?: boolean
          output_mapping?: Json
          prompt_id: string
          prompt_unique_id: string
          prompt_version_id?: string | null
          purpose?: string | null
          sequence?: number
          task_id: string
          task_unique_id: string
          tenant_id: string
          version_preference?: string
        }
        Update: {
          agent_assignment_id?: string | null
          config_overrides?: Json
          created_at?: string
          id?: string
          input_mapping?: Json
          is_required?: boolean
          output_mapping?: Json
          prompt_id?: string
          prompt_unique_id?: string
          prompt_version_id?: string | null
          purpose?: string | null
          sequence?: number
          task_id?: string
          task_unique_id?: string
          tenant_id?: string
          version_preference?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_task_prompt_assignment_agent_assignment_id_fkey"
            columns: ["agent_assignment_id"]
            isOneToOne: false
            referencedRelation: "dh_task_agent_assignment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_prompt_assignment_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "dh_prompt"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_prompt_assignment_prompt_version_id_fkey"
            columns: ["prompt_version_id"]
            isOneToOne: false
            referencedRelation: "dh_prompt_version"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_prompt_assignment_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "dh_task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_prompt_assignment_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_task_rag: {
        Row: {
          citation_required: boolean
          created_at: string
          id: string
          is_required: boolean
          max_chunks: number | null
          note: string | null
          prompt_assignment_id: string | null
          query_context: string | null
          rag_source_id: string
          rag_unique_id: string | null
          search_config: Json
          sections: string[] | null
          task_id: string
          task_unique_id: string | null
          tenant_id: string
        }
        Insert: {
          citation_required?: boolean
          created_at?: string
          id?: string
          is_required?: boolean
          max_chunks?: number | null
          note?: string | null
          prompt_assignment_id?: string | null
          query_context?: string | null
          rag_source_id: string
          rag_unique_id?: string | null
          search_config?: Json
          sections?: string[] | null
          task_id: string
          task_unique_id?: string | null
          tenant_id: string
        }
        Update: {
          citation_required?: boolean
          created_at?: string
          id?: string
          is_required?: boolean
          max_chunks?: number | null
          note?: string | null
          prompt_assignment_id?: string | null
          query_context?: string | null
          rag_source_id?: string
          rag_unique_id?: string | null
          search_config?: Json
          sections?: string[] | null
          task_id?: string
          task_unique_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_task_rag_prompt_assignment_id_fkey"
            columns: ["prompt_assignment_id"]
            isOneToOne: false
            referencedRelation: "dh_task_prompt_assignment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_rag_rag_source_id_fkey"
            columns: ["rag_source_id"]
            isOneToOne: false
            referencedRelation: "dh_rag_source"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_rag_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "dh_task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_rag_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_task_role: {
        Row: {
          created_at: string
          id: string
          note: string | null
          responsibility: string
          role_id: string
          task_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          responsibility?: string
          role_id: string
          task_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          responsibility?: string
          role_id?: string
          task_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_task_role_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "dh_role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_role_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "dh_task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_role_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_task_skill_assignment: {
        Row: {
          agent_assignment_id: string | null
          config_overrides: Json
          created_at: string
          id: string
          input_mapping: Json
          is_required: boolean
          output_mapping: Json
          skill_id: string
          skill_unique_id: string
          task_id: string
          task_unique_id: string
          tenant_id: string
        }
        Insert: {
          agent_assignment_id?: string | null
          config_overrides?: Json
          created_at?: string
          id?: string
          input_mapping?: Json
          is_required?: boolean
          output_mapping?: Json
          skill_id: string
          skill_unique_id: string
          task_id: string
          task_unique_id: string
          tenant_id: string
        }
        Update: {
          agent_assignment_id?: string | null
          config_overrides?: Json
          created_at?: string
          id?: string
          input_mapping?: Json
          is_required?: boolean
          output_mapping?: Json
          skill_id?: string
          skill_unique_id?: string
          task_id?: string
          task_unique_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_task_skill_assignment_agent_assignment_id_fkey"
            columns: ["agent_assignment_id"]
            isOneToOne: false
            referencedRelation: "dh_task_agent_assignment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_skill_assignment_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "dh_skill"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_skill_assignment_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "dh_task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_skill_assignment_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_task_tool: {
        Row: {
          connection_config: Json
          created_at: string
          credentials_ref: string | null
          id: string
          is_required: boolean
          max_calls: number | null
          prompt_assignment_id: string | null
          purpose: string | null
          rate_limit_per_hour: number | null
          task_id: string
          task_unique_id: string | null
          tenant_id: string
          tool_id: string
          tool_unique_id: string | null
        }
        Insert: {
          connection_config?: Json
          created_at?: string
          credentials_ref?: string | null
          id?: string
          is_required?: boolean
          max_calls?: number | null
          prompt_assignment_id?: string | null
          purpose?: string | null
          rate_limit_per_hour?: number | null
          task_id: string
          task_unique_id?: string | null
          tenant_id: string
          tool_id: string
          tool_unique_id?: string | null
        }
        Update: {
          connection_config?: Json
          created_at?: string
          credentials_ref?: string | null
          id?: string
          is_required?: boolean
          max_calls?: number | null
          prompt_assignment_id?: string | null
          purpose?: string | null
          rate_limit_per_hour?: number | null
          task_id?: string
          task_unique_id?: string | null
          tenant_id?: string
          tool_id?: string
          tool_unique_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dh_task_tool_prompt_assignment_id_fkey"
            columns: ["prompt_assignment_id"]
            isOneToOne: false
            referencedRelation: "dh_task_prompt_assignment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_tool_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "dh_task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_tool_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_task_tool_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "dh_tool"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_template: {
        Row: {
          code: string
          created_at: string
          description: string | null
          file_format: string | null
          id: string
          is_active: boolean
          metadata: Json
          name: string
          sections: Json
          storage_uri: string | null
          template_type: string
          tenant_id: string
          unique_id: string
          updated_at: string
          variables: Json
          version: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          file_format?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name: string
          sections?: Json
          storage_uri?: string | null
          template_type: string
          tenant_id: string
          unique_id: string
          updated_at?: string
          variables?: Json
          version?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          file_format?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name?: string
          sections?: Json
          storage_uri?: string | null
          template_type?: string
          tenant_id?: string
          unique_id?: string
          updated_at?: string
          variables?: Json
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_template_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_tool: {
        Row: {
          access_level: string | null
          access_requirements: Json
          allowed_roles: string[] | null
          allowed_tenants: string[] | null
          avg_execution_time_seconds: number | null
          bookmark_count: number | null
          business_impact: string | null
          capabilities: string[] | null
          category: string | null
          category_parent: string | null
          code: string
          cost_per_execution: number | null
          created_at: string
          documentation_url: string | null
          error_count: number | null
          estimated_time_saved_hours: number | null
          example_usage: Json | null
          feedback_count: number | null
          function_name: string | null
          health_status: string | null
          id: string
          implementation_path: string | null
          implementation_type: string | null
          input_schema: Json | null
          is_active: boolean
          is_async: boolean | null
          is_verified: boolean | null
          langgraph_compatible: boolean | null
          langgraph_node_name: string | null
          last_error_at: string | null
          last_error_message: string | null
          last_health_check_at: string | null
          last_tested_at: string | null
          last_used_at: string | null
          lifecycle_stage: string | null
          llm_description: string | null
          maintenance_message: string | null
          maintenance_mode: boolean | null
          max_execution_time_seconds: number | null
          metadata: Json
          name: string
          negative_feedback_count: number | null
          notes: string | null
          output_schema: Json | null
          popularity_score: number | null
          positive_feedback_count: number | null
          quality_score: number | null
          rate_limit_per_minute: number | null
          rating: number | null
          required_env_vars: string[] | null
          retry_config: Json | null
          roi_score: number | null
          share_count: number | null
          success_rate: number | null
          tags: string[] | null
          tenant_id: string
          test_results: Json | null
          tool_description: string | null
          tool_type: string | null
          total_cost_incurred: number | null
          total_execution_time_seconds: number | null
          total_ratings: number | null
          trending_score: number | null
          unique_id: string
          updated_at: string
          uptime_percentage: number | null
          usage_count: number | null
          usage_guide: string | null
          vendor: string | null
          verified_at: string | null
          verified_by: string | null
          version: string | null
          view_count: number | null
        }
        Insert: {
          access_level?: string | null
          access_requirements?: Json
          allowed_roles?: string[] | null
          allowed_tenants?: string[] | null
          avg_execution_time_seconds?: number | null
          bookmark_count?: number | null
          business_impact?: string | null
          capabilities?: string[] | null
          category?: string | null
          category_parent?: string | null
          code: string
          cost_per_execution?: number | null
          created_at?: string
          documentation_url?: string | null
          error_count?: number | null
          estimated_time_saved_hours?: number | null
          example_usage?: Json | null
          feedback_count?: number | null
          function_name?: string | null
          health_status?: string | null
          id?: string
          implementation_path?: string | null
          implementation_type?: string | null
          input_schema?: Json | null
          is_active?: boolean
          is_async?: boolean | null
          is_verified?: boolean | null
          langgraph_compatible?: boolean | null
          langgraph_node_name?: string | null
          last_error_at?: string | null
          last_error_message?: string | null
          last_health_check_at?: string | null
          last_tested_at?: string | null
          last_used_at?: string | null
          lifecycle_stage?: string | null
          llm_description?: string | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          max_execution_time_seconds?: number | null
          metadata?: Json
          name: string
          negative_feedback_count?: number | null
          notes?: string | null
          output_schema?: Json | null
          popularity_score?: number | null
          positive_feedback_count?: number | null
          quality_score?: number | null
          rate_limit_per_minute?: number | null
          rating?: number | null
          required_env_vars?: string[] | null
          retry_config?: Json | null
          roi_score?: number | null
          share_count?: number | null
          success_rate?: number | null
          tags?: string[] | null
          tenant_id: string
          test_results?: Json | null
          tool_description?: string | null
          tool_type?: string | null
          total_cost_incurred?: number | null
          total_execution_time_seconds?: number | null
          total_ratings?: number | null
          trending_score?: number | null
          unique_id: string
          updated_at?: string
          uptime_percentage?: number | null
          usage_count?: number | null
          usage_guide?: string | null
          vendor?: string | null
          verified_at?: string | null
          verified_by?: string | null
          version?: string | null
          view_count?: number | null
        }
        Update: {
          access_level?: string | null
          access_requirements?: Json
          allowed_roles?: string[] | null
          allowed_tenants?: string[] | null
          avg_execution_time_seconds?: number | null
          bookmark_count?: number | null
          business_impact?: string | null
          capabilities?: string[] | null
          category?: string | null
          category_parent?: string | null
          code?: string
          cost_per_execution?: number | null
          created_at?: string
          documentation_url?: string | null
          error_count?: number | null
          estimated_time_saved_hours?: number | null
          example_usage?: Json | null
          feedback_count?: number | null
          function_name?: string | null
          health_status?: string | null
          id?: string
          implementation_path?: string | null
          implementation_type?: string | null
          input_schema?: Json | null
          is_active?: boolean
          is_async?: boolean | null
          is_verified?: boolean | null
          langgraph_compatible?: boolean | null
          langgraph_node_name?: string | null
          last_error_at?: string | null
          last_error_message?: string | null
          last_health_check_at?: string | null
          last_tested_at?: string | null
          last_used_at?: string | null
          lifecycle_stage?: string | null
          llm_description?: string | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          max_execution_time_seconds?: number | null
          metadata?: Json
          name?: string
          negative_feedback_count?: number | null
          notes?: string | null
          output_schema?: Json | null
          popularity_score?: number | null
          positive_feedback_count?: number | null
          quality_score?: number | null
          rate_limit_per_minute?: number | null
          rating?: number | null
          required_env_vars?: string[] | null
          retry_config?: Json | null
          roi_score?: number | null
          share_count?: number | null
          success_rate?: number | null
          tags?: string[] | null
          tenant_id?: string
          test_results?: Json | null
          tool_description?: string | null
          tool_type?: string | null
          total_cost_incurred?: number | null
          total_execution_time_seconds?: number | null
          total_ratings?: number | null
          trending_score?: number | null
          unique_id?: string
          updated_at?: string
          uptime_percentage?: number | null
          usage_count?: number | null
          usage_guide?: string | null
          vendor?: string | null
          verified_at?: string | null
          verified_by?: string | null
          version?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dh_tool_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_use_case: {
        Row: {
          approvers: Json
          audit: Json
          change_log: Json
          code: string
          complexity: string
          compliance_flags: Json
          created_at: string
          data_classification: Json
          domain_id: string
          environment: string | null
          id: string
          indication: string | null
          integrations: Json
          kpi_targets: Json
          metadata: Json
          milestones: Json
          org_id: string | null
          owners: Json
          permissions: Json
          phase: string | null
          product_id: string | null
          project_id: string | null
          rag_citations: Json
          rag_sources: Json
          regulatory_references: Json
          reviewers: Json
          risk_register: Json
          sla: Json
          status: string | null
          summary: string | null
          tags: Json
          templates: Json
          tenant_id: string
          therapeutic_area: string | null
          title: string
          unique_id: string
          updated_at: string
          version: string | null
        }
        Insert: {
          approvers?: Json
          audit?: Json
          change_log?: Json
          code: string
          complexity?: string
          compliance_flags?: Json
          created_at?: string
          data_classification?: Json
          domain_id: string
          environment?: string | null
          id?: string
          indication?: string | null
          integrations?: Json
          kpi_targets?: Json
          metadata?: Json
          milestones?: Json
          org_id?: string | null
          owners?: Json
          permissions?: Json
          phase?: string | null
          product_id?: string | null
          project_id?: string | null
          rag_citations?: Json
          rag_sources?: Json
          regulatory_references?: Json
          reviewers?: Json
          risk_register?: Json
          sla?: Json
          status?: string | null
          summary?: string | null
          tags?: Json
          templates?: Json
          tenant_id: string
          therapeutic_area?: string | null
          title: string
          unique_id: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          approvers?: Json
          audit?: Json
          change_log?: Json
          code?: string
          complexity?: string
          compliance_flags?: Json
          created_at?: string
          data_classification?: Json
          domain_id?: string
          environment?: string | null
          id?: string
          indication?: string | null
          integrations?: Json
          kpi_targets?: Json
          metadata?: Json
          milestones?: Json
          org_id?: string | null
          owners?: Json
          permissions?: Json
          phase?: string | null
          product_id?: string | null
          project_id?: string | null
          rag_citations?: Json
          rag_sources?: Json
          regulatory_references?: Json
          reviewers?: Json
          risk_register?: Json
          sla?: Json
          status?: string | null
          summary?: string | null
          tags?: Json
          templates?: Json
          tenant_id?: string
          therapeutic_area?: string | null
          title?: string
          unique_id?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dh_use_case_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "dh_domain"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_use_case_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dh_workflow: {
        Row: {
          created_at: string
          description: string | null
          id: string
          integrations: Json
          metadata: Json
          milestones: Json
          name: string
          position: number
          rag_sources: Json
          risk_register: Json
          sla: Json
          tags: Json
          templates: Json
          tenant_id: string
          unique_id: string
          updated_at: string
          use_case_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          integrations?: Json
          metadata?: Json
          milestones?: Json
          name: string
          position?: number
          rag_sources?: Json
          risk_register?: Json
          sla?: Json
          tags?: Json
          templates?: Json
          tenant_id: string
          unique_id: string
          updated_at?: string
          use_case_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          integrations?: Json
          metadata?: Json
          milestones?: Json
          name?: string
          position?: number
          rag_sources?: Json
          risk_register?: Json
          sla?: Json
          tags?: Json
          templates?: Json
          tenant_id?: string
          unique_id?: string
          updated_at?: string
          use_case_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_workflow_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_workflow_use_case_id_fkey"
            columns: ["use_case_id"]
            isOneToOne: false
            referencedRelation: "dh_use_case"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_workflow_use_case_id_fkey"
            columns: ["use_case_id"]
            isOneToOne: false
            referencedRelation: "v_persona_usecases"
            referencedColumns: ["usecase_id"]
          },
        ]
      }
      dh_workflow_persona: {
        Row: {
          created_at: string
          decision_authority: string | null
          escalation_after_hours: number | null
          escalation_to_persona_id: string | null
          estimated_time_minutes: number | null
          id: string
          is_required: boolean | null
          metadata: Json | null
          notes: string | null
          notification_method: string | null
          notification_trigger: string | null
          persona_id: string
          responsibility: string
          review_stage: string | null
          tenant_id: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          decision_authority?: string | null
          escalation_after_hours?: number | null
          escalation_to_persona_id?: string | null
          estimated_time_minutes?: number | null
          id?: string
          is_required?: boolean | null
          metadata?: Json | null
          notes?: string | null
          notification_method?: string | null
          notification_trigger?: string | null
          persona_id: string
          responsibility: string
          review_stage?: string | null
          tenant_id: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          decision_authority?: string | null
          escalation_after_hours?: number | null
          escalation_to_persona_id?: string | null
          estimated_time_minutes?: number | null
          id?: string
          is_required?: boolean | null
          metadata?: Json | null
          notes?: string | null
          notification_method?: string | null
          notification_trigger?: string | null
          persona_id?: string
          responsibility?: string
          review_stage?: string | null
          tenant_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dh_workflow_persona_escalation_to_persona_id_fkey"
            columns: ["escalation_to_persona_id"]
            isOneToOne: false
            referencedRelation: "org_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_workflow_persona_escalation_to_persona_id_fkey"
            columns: ["escalation_to_persona_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["persona_id"]
          },
          {
            foreignKeyName: "dh_workflow_persona_escalation_to_persona_id_fkey"
            columns: ["escalation_to_persona_id"]
            isOneToOne: false
            referencedRelation: "v_persona_usecases"
            referencedColumns: ["persona_id"]
          },
          {
            foreignKeyName: "dh_workflow_persona_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "org_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_workflow_persona_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["persona_id"]
          },
          {
            foreignKeyName: "dh_workflow_persona_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "v_persona_usecases"
            referencedColumns: ["persona_id"]
          },
          {
            foreignKeyName: "dh_workflow_persona_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dh_workflow_persona_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "dh_workflow"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chunks: {
        Row: {
          access_policy:
            | Database["public"]["Enums"]["access_policy_level"]
            | null
          chunk_index: number
          content: string
          created_at: string | null
          document_id: string | null
          domain_id: string | null
          embedding: string | null
          enterprise_id: string | null
          id: string
          metadata: Json | null
          quality_score: number | null
          rag_priority_weight: number | null
        }
        Insert: {
          access_policy?:
            | Database["public"]["Enums"]["access_policy_level"]
            | null
          chunk_index: number
          content: string
          created_at?: string | null
          document_id?: string | null
          domain_id?: string | null
          embedding?: string | null
          enterprise_id?: string | null
          id?: string
          metadata?: Json | null
          quality_score?: number | null
          rag_priority_weight?: number | null
        }
        Update: {
          access_policy?:
            | Database["public"]["Enums"]["access_policy_level"]
            | null
          chunk_index?: number
          content?: string
          created_at?: string | null
          document_id?: string | null
          domain_id?: string | null
          embedding?: string | null
          enterprise_id?: string | null
          id?: string
          metadata?: Json | null
          quality_score?: number | null
          rag_priority_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "knowledge_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chunks_langchain: {
        Row: {
          content: string
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content: string
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      document_embeddings: {
        Row: {
          chunk_index: number | null
          chunk_text: string
          created_at: string | null
          document_id: string | null
          embedding: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          chunk_index?: number | null
          chunk_text: string
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          chunk_index?: number | null
          chunk_text?: string
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_embeddings_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "knowledge_base_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          content_type: string | null
          created_at: string
          document_type: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string
          metadata: Json | null
          name: string
          organization_id: string | null
          phase: string | null
          project_id: string | null
          status: string | null
          summary: string | null
          tags: string[] | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          content?: string | null
          content_type?: string | null
          created_at?: string
          document_type?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          metadata?: Json | null
          name: string
          organization_id?: string | null
          phase?: string | null
          project_id?: string | null
          status?: string | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          content?: string | null
          content_type?: string | null
          created_at?: string
          document_type?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          organization_id?: string | null
          phase?: string | null
          project_id?: string | null
          status?: string | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      encrypted_api_keys: {
        Row: {
          created_at: string
          created_by: string
          encrypted_key: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_hash: string
          key_name: string
          last_used_at: string | null
          provider_id: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          created_by: string
          encrypted_key: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash: string
          key_name: string
          last_used_at?: string | null
          provider_id: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          encrypted_key?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash?: string
          key_name?: string
          last_used_at?: string | null
          provider_id?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "encrypted_api_keys_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "llm_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      event_beliefs: {
        Row: {
          belief_id: string
          event_id: string
        }
        Insert: {
          belief_id: string
          event_id: string
        }
        Update: {
          belief_id?: string
          event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_beliefs_belief_id_fkey"
            columns: ["belief_id"]
            isOneToOne: false
            referencedRelation: "beliefs"
            referencedColumns: ["belief_id"]
          },
          {
            foreignKeyName: "event_beliefs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      event_signals: {
        Row: {
          event_id: string
          signal_id: string
        }
        Insert: {
          event_id: string
          signal_id: string
        }
        Update: {
          event_id?: string
          signal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_signals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_signals_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["signal_id"]
          },
        ]
      }
      events: {
        Row: {
          confidence: string | null
          created_at: string | null
          description: string | null
          event_date: string | null
          event_id: string
          event_name: string | null
          event_type: string | null
          market_impact: string | null
          source_id: string | null
          strategic_importance: string | null
          updated_at: string | null
        }
        Insert: {
          confidence?: string | null
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          event_id: string
          event_name?: string | null
          event_type?: string | null
          market_impact?: string | null
          source_id?: string | null
          strategic_importance?: string | null
          updated_at?: string | null
        }
        Update: {
          confidence?: string | null
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          event_id?: string
          event_name?: string | null
          event_type?: string | null
          market_impact?: string | null
          source_id?: string | null
          strategic_importance?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["source_id"]
          },
        ]
      }
      evidence: {
        Row: {
          confidence_level: string | null
          created_at: string | null
          evidence_date: string | null
          evidence_id: string
          evidence_text: string | null
          evidence_type: string | null
          notes: string | null
          qualitative_assessment: string | null
          quantitative_value: string | null
          signal_id: string | null
          source_id: string | null
          supports_belief: string | null
          updated_at: string | null
          verification_status: string | null
        }
        Insert: {
          confidence_level?: string | null
          created_at?: string | null
          evidence_date?: string | null
          evidence_id: string
          evidence_text?: string | null
          evidence_type?: string | null
          notes?: string | null
          qualitative_assessment?: string | null
          quantitative_value?: string | null
          signal_id?: string | null
          source_id?: string | null
          supports_belief?: string | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Update: {
          confidence_level?: string | null
          created_at?: string | null
          evidence_date?: string | null
          evidence_id?: string
          evidence_text?: string | null
          evidence_type?: string | null
          notes?: string | null
          qualitative_assessment?: string | null
          quantitative_value?: string | null
          signal_id?: string | null
          source_id?: string | null
          supports_belief?: string | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["signal_id"]
          },
          {
            foreignKeyName: "evidence_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["source_id"]
          },
        ]
      }
      evidence_pack: {
        Row: {
          created_at: string | null
          created_by: string | null
          embeddings_ref: string | null
          id: string
          name: string
          products: string[] | null
          sources: Json | null
          therapeutic_area: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          embeddings_ref?: string | null
          id?: string
          name: string
          products?: string[] | null
          sources?: Json | null
          therapeutic_area?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          embeddings_ref?: string | null
          id?: string
          name?: string
          products?: string[] | null
          sources?: Json | null
          therapeutic_area?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      family_groups: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      family_members: {
        Row: {
          created_at: string | null
          family_id: string | null
          id: string
          profile_id: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          family_id?: string | null
          id?: string
          profile_id?: string | null
          role?: string
        }
        Update: {
          created_at?: string | null
          family_id?: string | null
          id?: string
          profile_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      firms: {
        Row: {
          avg_document_quality: number | null
          category: string | null
          code: string
          created_at: string | null
          credibility_score: number | null
          description: string | null
          firm_type: string | null
          full_name: string | null
          geographic_coverage: Json | null
          headquarters_country: string | null
          headquarters_location: string | null
          id: string
          industries_served: Json | null
          is_active: boolean | null
          is_verified: boolean | null
          last_document_added_at: string | null
          logo_url: string | null
          metadata: Json | null
          name: string
          practice_areas: Json | null
          reputation_tier: string | null
          tags: string[] | null
          total_citations: number | null
          total_documents: number | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          avg_document_quality?: number | null
          category?: string | null
          code: string
          created_at?: string | null
          credibility_score?: number | null
          description?: string | null
          firm_type?: string | null
          full_name?: string | null
          geographic_coverage?: Json | null
          headquarters_country?: string | null
          headquarters_location?: string | null
          id?: string
          industries_served?: Json | null
          is_active?: boolean | null
          is_verified?: boolean | null
          last_document_added_at?: string | null
          logo_url?: string | null
          metadata?: Json | null
          name: string
          practice_areas?: Json | null
          reputation_tier?: string | null
          tags?: string[] | null
          total_citations?: number | null
          total_documents?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          avg_document_quality?: number | null
          category?: string | null
          code?: string
          created_at?: string | null
          credibility_score?: number | null
          description?: string | null
          firm_type?: string | null
          full_name?: string | null
          geographic_coverage?: Json | null
          headquarters_country?: string | null
          headquarters_location?: string | null
          id?: string
          industries_served?: Json | null
          is_active?: boolean | null
          is_verified?: boolean | null
          last_document_added_at?: string | null
          logo_url?: string | null
          metadata?: Json | null
          name?: string
          practice_areas?: Json | null
          reputation_tier?: string | null
          tags?: string[] | null
          total_citations?: number | null
          total_documents?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      function_departments: {
        Row: {
          created_at: string | null
          department_id: string
          function_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          department_id: string
          function_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          department_id?: string
          function_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "function_departments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "function_departments_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "functions"
            referencedColumns: ["id"]
          },
        ]
      }
      function_roles: {
        Row: {
          created_at: string | null
          function_id: string
          id: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          function_id: string
          id?: string
          role_id: string
        }
        Update: {
          created_at?: string | null
          function_id?: string
          id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "function_roles_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "functions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "function_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      functions: {
        Row: {
          created_at: string | null
          created_by: string | null
          department_name: string
          description: string | null
          id: string
          migration_ready: boolean | null
          search_vector: unknown
          unique_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          department_name: string
          description?: string | null
          id?: string
          migration_ready?: boolean | null
          search_vector?: unknown
          unique_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          department_name?: string
          description?: string | null
          id?: string
          migration_ready?: boolean | null
          search_vector?: unknown
          unique_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      health_checks: {
        Row: {
          created_at: string | null
          dependencies: Json | null
          details: Json | null
          id: string
          latency_ms: number
          service: string
          status: string
          timestamp: string
        }
        Insert: {
          created_at?: string | null
          dependencies?: Json | null
          details?: Json | null
          id?: string
          latency_ms: number
          service: string
          status: string
          timestamp: string
        }
        Update: {
          created_at?: string | null
          dependencies?: Json | null
          details?: Json | null
          id?: string
          latency_ms?: number
          service?: string
          status?: string
          timestamp?: string
        }
        Relationships: []
      }
      icons: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          display_name: string
          file_path: string
          file_url: string
          id: string
          is_active: boolean | null
          name: string
          subcategory: string | null
          svg_content: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          display_name: string
          file_path: string
          file_url: string
          id?: string
          is_active?: boolean | null
          name: string
          subcategory?: string | null
          svg_content?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          file_path?: string
          file_url?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subcategory?: string | null
          svg_content?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      industries: {
        Row: {
          created_at: string
          description: string | null
          example_agents: string[] | null
          gics_sector: string | null
          id: string
          industry_code: string
          industry_name: string
          naics_codes: string[] | null
          sub_categories: Json | null
          unique_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          example_agents?: string[] | null
          gics_sector?: string | null
          id?: string
          industry_code: string
          industry_name: string
          naics_codes?: string[] | null
          sub_categories?: Json | null
          unique_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          example_agents?: string[] | null
          gics_sector?: string | null
          id?: string
          industry_code?: string
          industry_name?: string
          naics_codes?: string[] | null
          sub_categories?: Json | null
          unique_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      institution_members: {
        Row: {
          created_at: string | null
          id: string
          institution_id: string | null
          profile_id: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          institution_id?: string | null
          profile_id?: string | null
          role?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          institution_id?: string | null
          profile_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_members_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          created_at: string | null
          domain: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      intelligence_questions: {
        Row: {
          created_at: string
          id: string
          question_text: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_text: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          question_text?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      jtbd_agent_orchestration: {
        Row: {
          agent_configuration: Json | null
          agent_id: string | null
          can_run_parallel: boolean | null
          execution_order: number | null
          fallback_agent_id: string | null
          id: number
          is_required: boolean | null
          jtbd_id: string | null
          success_criteria: Json | null
          timeout_minutes: number | null
        }
        Insert: {
          agent_configuration?: Json | null
          agent_id?: string | null
          can_run_parallel?: boolean | null
          execution_order?: number | null
          fallback_agent_id?: string | null
          id?: number
          is_required?: boolean | null
          jtbd_id?: string | null
          success_criteria?: Json | null
          timeout_minutes?: number | null
        }
        Update: {
          agent_configuration?: Json | null
          agent_id?: string | null
          can_run_parallel?: boolean | null
          execution_order?: number | null
          fallback_agent_id?: string | null
          id?: number
          is_required?: boolean | null
          jtbd_id?: string | null
          success_criteria?: Json | null
          timeout_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jtbd_agent_orchestration_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "jtbd_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_agent_orchestration_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_agent_orchestration_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_high_priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_agent_orchestration_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_org_hierarchy"
            referencedColumns: ["jtbd_id"]
          },
        ]
      }
      jtbd_ai_techniques: {
        Row: {
          application_description: string | null
          complexity_level: string | null
          id: number
          jtbd_id: string | null
          required_data_types: string[] | null
          technique: string
        }
        Insert: {
          application_description?: string | null
          complexity_level?: string | null
          id?: number
          jtbd_id?: string | null
          required_data_types?: string[] | null
          technique: string
        }
        Update: {
          application_description?: string | null
          complexity_level?: string | null
          id?: number
          jtbd_id?: string | null
          required_data_types?: string[] | null
          technique?: string
        }
        Relationships: [
          {
            foreignKeyName: "jtbd_ai_techniques_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "jtbd_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_ai_techniques_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_ai_techniques_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_high_priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_ai_techniques_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_org_hierarchy"
            referencedColumns: ["jtbd_id"]
          },
        ]
      }
      jtbd_benchmarks: {
        Row: {
          company: string | null
          credibility_score: number | null
          id: number
          implementation_description: string | null
          implementation_timeline: string | null
          industry_segment: string | null
          jtbd_id: string | null
          outcome_metrics: Json | null
          quantified_outcome: string | null
          source: string | null
          source_url: string | null
          technologies_used: string[] | null
          year: number | null
        }
        Insert: {
          company?: string | null
          credibility_score?: number | null
          id?: number
          implementation_description?: string | null
          implementation_timeline?: string | null
          industry_segment?: string | null
          jtbd_id?: string | null
          outcome_metrics?: Json | null
          quantified_outcome?: string | null
          source?: string | null
          source_url?: string | null
          technologies_used?: string[] | null
          year?: number | null
        }
        Update: {
          company?: string | null
          credibility_score?: number | null
          id?: number
          implementation_description?: string | null
          implementation_timeline?: string | null
          industry_segment?: string | null
          jtbd_id?: string | null
          outcome_metrics?: Json | null
          quantified_outcome?: string | null
          source?: string | null
          source_url?: string | null
          technologies_used?: string[] | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jtbd_benchmarks_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "jtbd_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_benchmarks_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_benchmarks_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_high_priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_benchmarks_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_org_hierarchy"
            referencedColumns: ["jtbd_id"]
          },
        ]
      }
      jtbd_data_requirements: {
        Row: {
          accessibility: string | null
          data_format: string | null
          data_source: string | null
          data_type: string
          estimated_volume: string | null
          id: number
          is_required: boolean | null
          jtbd_id: string | null
          quality_requirements: string | null
          refresh_frequency: string | null
          source_type: string | null
        }
        Insert: {
          accessibility?: string | null
          data_format?: string | null
          data_source?: string | null
          data_type: string
          estimated_volume?: string | null
          id?: number
          is_required?: boolean | null
          jtbd_id?: string | null
          quality_requirements?: string | null
          refresh_frequency?: string | null
          source_type?: string | null
        }
        Update: {
          accessibility?: string | null
          data_format?: string | null
          data_source?: string | null
          data_type?: string
          estimated_volume?: string | null
          id?: number
          is_required?: boolean | null
          jtbd_id?: string | null
          quality_requirements?: string | null
          refresh_frequency?: string | null
          source_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jtbd_data_requirements_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "jtbd_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_data_requirements_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_data_requirements_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_high_priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_data_requirements_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_org_hierarchy"
            referencedColumns: ["jtbd_id"]
          },
        ]
      }
      jtbd_dependencies: {
        Row: {
          can_run_parallel: boolean | null
          completion_percentage_required: number | null
          dependency_jtbd_id: string | null
          dependency_reason: string | null
          dependency_type: string | null
          id: number
          jtbd_id: string | null
        }
        Insert: {
          can_run_parallel?: boolean | null
          completion_percentage_required?: number | null
          dependency_jtbd_id?: string | null
          dependency_reason?: string | null
          dependency_type?: string | null
          id?: number
          jtbd_id?: string | null
        }
        Update: {
          can_run_parallel?: boolean | null
          completion_percentage_required?: number | null
          dependency_jtbd_id?: string | null
          dependency_reason?: string | null
          dependency_type?: string | null
          id?: number
          jtbd_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jtbd_dependencies_dependency_jtbd_id_fkey"
            columns: ["dependency_jtbd_id"]
            isOneToOne: false
            referencedRelation: "jtbd_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_dependencies_dependency_jtbd_id_fkey"
            columns: ["dependency_jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_dependencies_dependency_jtbd_id_fkey"
            columns: ["dependency_jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_high_priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_dependencies_dependency_jtbd_id_fkey"
            columns: ["dependency_jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_org_hierarchy"
            referencedColumns: ["jtbd_id"]
          },
          {
            foreignKeyName: "jtbd_dependencies_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "jtbd_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_dependencies_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_dependencies_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_high_priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_dependencies_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_org_hierarchy"
            referencedColumns: ["jtbd_id"]
          },
        ]
      }
      jtbd_executions: {
        Row: {
          agents_used: Json | null
          completion_timestamp: string | null
          error_details: Json | null
          execution_log: Json | null
          execution_metadata: Json | null
          execution_mode: string | null
          execution_timestamp: string | null
          feedback: string | null
          id: number
          jtbd_id: string | null
          llms_used: Json | null
          organization_id: string | null
          outputs: Json | null
          satisfaction_score: number | null
          status: string | null
          total_cost: number | null
          total_tokens_consumed: number | null
          user_id: string | null
        }
        Insert: {
          agents_used?: Json | null
          completion_timestamp?: string | null
          error_details?: Json | null
          execution_log?: Json | null
          execution_metadata?: Json | null
          execution_mode?: string | null
          execution_timestamp?: string | null
          feedback?: string | null
          id?: number
          jtbd_id?: string | null
          llms_used?: Json | null
          organization_id?: string | null
          outputs?: Json | null
          satisfaction_score?: number | null
          status?: string | null
          total_cost?: number | null
          total_tokens_consumed?: number | null
          user_id?: string | null
        }
        Update: {
          agents_used?: Json | null
          completion_timestamp?: string | null
          error_details?: Json | null
          execution_log?: Json | null
          execution_metadata?: Json | null
          execution_mode?: string | null
          execution_timestamp?: string | null
          feedback?: string | null
          id?: number
          jtbd_id?: string | null
          llms_used?: Json | null
          organization_id?: string | null
          outputs?: Json | null
          satisfaction_score?: number | null
          status?: string | null
          total_cost?: number | null
          total_tokens_consumed?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jtbd_executions_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "jtbd_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_executions_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_executions_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_high_priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_executions_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_org_hierarchy"
            referencedColumns: ["jtbd_id"]
          },
        ]
      }
      jtbd_library: {
        Row: {
          avg_execution_time: number | null
          business_value: string | null
          category: string | null
          complexity: string | null
          created_at: string | null
          description: string | null
          frequency: string | null
          frequency_category: string | null
          function: string
          goal: string
          has_quantitative_metrics: boolean | null
          id: string
          implementation_cost: string | null
          importance: number | null
          industry_id: string | null
          industry_name: string | null
          is_active: boolean | null
          jtbd_code: string | null
          keywords: string[] | null
          maturity_level: string | null
          metrics_count: number | null
          opportunity_score: number | null
          org_function_id: string | null
          original_id: string | null
          outcome_type: string | null
          persona_context: string | null
          persona_function: string | null
          persona_id: string | null
          persona_name: string | null
          persona_title: string | null
          priority_tier: number | null
          satisfaction: number | null
          sector: string | null
          solution_type: string | null
          source: string | null
          statement: string | null
          success_metrics: Json | null
          success_rate: number | null
          tags: string[] | null
          time_to_value: string | null
          title: string
          unique_id: string | null
          updated_at: string | null
          usage_count: number | null
          use_case_category: string | null
          verb: string
          workshop_potential: string | null
        }
        Insert: {
          avg_execution_time?: number | null
          business_value?: string | null
          category?: string | null
          complexity?: string | null
          created_at?: string | null
          description?: string | null
          frequency?: string | null
          frequency_category?: string | null
          function: string
          goal: string
          has_quantitative_metrics?: boolean | null
          id: string
          implementation_cost?: string | null
          importance?: number | null
          industry_id?: string | null
          industry_name?: string | null
          is_active?: boolean | null
          jtbd_code?: string | null
          keywords?: string[] | null
          maturity_level?: string | null
          metrics_count?: number | null
          opportunity_score?: number | null
          org_function_id?: string | null
          original_id?: string | null
          outcome_type?: string | null
          persona_context?: string | null
          persona_function?: string | null
          persona_id?: string | null
          persona_name?: string | null
          persona_title?: string | null
          priority_tier?: number | null
          satisfaction?: number | null
          sector?: string | null
          solution_type?: string | null
          source?: string | null
          statement?: string | null
          success_metrics?: Json | null
          success_rate?: number | null
          tags?: string[] | null
          time_to_value?: string | null
          title: string
          unique_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
          use_case_category?: string | null
          verb: string
          workshop_potential?: string | null
        }
        Update: {
          avg_execution_time?: number | null
          business_value?: string | null
          category?: string | null
          complexity?: string | null
          created_at?: string | null
          description?: string | null
          frequency?: string | null
          frequency_category?: string | null
          function?: string
          goal?: string
          has_quantitative_metrics?: boolean | null
          id?: string
          implementation_cost?: string | null
          importance?: number | null
          industry_id?: string | null
          industry_name?: string | null
          is_active?: boolean | null
          jtbd_code?: string | null
          keywords?: string[] | null
          maturity_level?: string | null
          metrics_count?: number | null
          opportunity_score?: number | null
          org_function_id?: string | null
          original_id?: string | null
          outcome_type?: string | null
          persona_context?: string | null
          persona_function?: string | null
          persona_id?: string | null
          persona_name?: string | null
          persona_title?: string | null
          priority_tier?: number | null
          satisfaction?: number | null
          sector?: string | null
          solution_type?: string | null
          source?: string | null
          statement?: string | null
          success_metrics?: Json | null
          success_rate?: number | null
          tags?: string[] | null
          time_to_value?: string | null
          title?: string
          unique_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
          use_case_category?: string | null
          verb?: string
          workshop_potential?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jtbd_library_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_library_org_function_id_fkey"
            columns: ["org_function_id"]
            isOneToOne: false
            referencedRelation: "org_functions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_library_org_function_id_fkey"
            columns: ["org_function_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["function_id"]
          },
          {
            foreignKeyName: "jtbd_library_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "dh_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_library_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "v_dh_personas_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      jtbd_org_persona_mapping: {
        Row: {
          adoption_barriers: Json | null
          created_at: string
          expected_benefit: string | null
          id: string
          jtbd_id: string
          persona_dh_id: string | null
          persona_id: string
          relevance_score: number | null
          typical_frequency: string | null
          updated_at: string
          use_case_examples: string | null
        }
        Insert: {
          adoption_barriers?: Json | null
          created_at?: string
          expected_benefit?: string | null
          id?: string
          jtbd_id: string
          persona_dh_id?: string | null
          persona_id: string
          relevance_score?: number | null
          typical_frequency?: string | null
          updated_at?: string
          use_case_examples?: string | null
        }
        Update: {
          adoption_barriers?: Json | null
          created_at?: string
          expected_benefit?: string | null
          id?: string
          jtbd_id?: string
          persona_dh_id?: string | null
          persona_id?: string
          relevance_score?: number | null
          typical_frequency?: string | null
          updated_at?: string
          use_case_examples?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jtbd_org_persona_mapping_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "jtbd_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_org_persona_mapping_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_org_persona_mapping_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_high_priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_org_persona_mapping_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_org_hierarchy"
            referencedColumns: ["jtbd_id"]
          },
          {
            foreignKeyName: "jtbd_org_persona_mapping_persona_dh_id_fkey"
            columns: ["persona_dh_id"]
            isOneToOne: false
            referencedRelation: "dh_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_org_persona_mapping_persona_dh_id_fkey"
            columns: ["persona_dh_id"]
            isOneToOne: false
            referencedRelation: "v_dh_personas_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_org_persona_mapping_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "org_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_org_persona_mapping_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["persona_id"]
          },
          {
            foreignKeyName: "jtbd_org_persona_mapping_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "v_persona_usecases"
            referencedColumns: ["persona_id"]
          },
        ]
      }
      jtbd_pain_points: {
        Row: {
          current_time_spent: number | null
          frequency: string | null
          id: number
          impact_score: number | null
          jtbd_id: string | null
          manual_effort_level: string | null
          pain_point: string
          solution_approach: string | null
        }
        Insert: {
          current_time_spent?: number | null
          frequency?: string | null
          id?: number
          impact_score?: number | null
          jtbd_id?: string | null
          manual_effort_level?: string | null
          pain_point: string
          solution_approach?: string | null
        }
        Update: {
          current_time_spent?: number | null
          frequency?: string | null
          id?: number
          impact_score?: number | null
          jtbd_id?: string | null
          manual_effort_level?: string | null
          pain_point?: string
          solution_approach?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jtbd_pain_points_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "jtbd_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_pain_points_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_pain_points_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_high_priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_pain_points_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_org_hierarchy"
            referencedColumns: ["jtbd_id"]
          },
        ]
      }
      jtbd_persona_mapping: {
        Row: {
          adoption_barriers: string[] | null
          expected_benefit: string | null
          id: number
          jtbd_id: string | null
          persona_name: string
          persona_role: string | null
          relevance_score: number | null
          typical_frequency: string | null
          use_case_examples: string | null
        }
        Insert: {
          adoption_barriers?: string[] | null
          expected_benefit?: string | null
          id?: number
          jtbd_id?: string | null
          persona_name: string
          persona_role?: string | null
          relevance_score?: number | null
          typical_frequency?: string | null
          use_case_examples?: string | null
        }
        Update: {
          adoption_barriers?: string[] | null
          expected_benefit?: string | null
          id?: number
          jtbd_id?: string | null
          persona_name?: string
          persona_role?: string | null
          relevance_score?: number | null
          typical_frequency?: string | null
          use_case_examples?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jtbd_persona_mapping_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "jtbd_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_persona_mapping_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_persona_mapping_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_high_priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_persona_mapping_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_org_hierarchy"
            referencedColumns: ["jtbd_id"]
          },
        ]
      }
      jtbd_process_steps: {
        Row: {
          agent_id: string | null
          error_handling: Json | null
          estimated_duration: number | null
          id: number
          input_schema: Json | null
          is_parallel: boolean | null
          jtbd_id: string | null
          output_schema: Json | null
          required_capabilities: string[] | null
          step_description: string | null
          step_name: string
          step_number: number
        }
        Insert: {
          agent_id?: string | null
          error_handling?: Json | null
          estimated_duration?: number | null
          id?: number
          input_schema?: Json | null
          is_parallel?: boolean | null
          jtbd_id?: string | null
          output_schema?: Json | null
          required_capabilities?: string[] | null
          step_description?: string | null
          step_name: string
          step_number: number
        }
        Update: {
          agent_id?: string | null
          error_handling?: Json | null
          estimated_duration?: number | null
          id?: number
          input_schema?: Json | null
          is_parallel?: boolean | null
          jtbd_id?: string | null
          output_schema?: Json | null
          required_capabilities?: string[] | null
          step_description?: string | null
          step_name?: string
          step_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "jtbd_process_steps_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "jtbd_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_process_steps_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_process_steps_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_high_priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_process_steps_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_org_hierarchy"
            referencedColumns: ["jtbd_id"]
          },
        ]
      }
      jtbd_regulatory_considerations: {
        Row: {
          compliance_approach: string | null
          criticality: string | null
          guidance_document: string | null
          id: number
          jtbd_id: string | null
          last_updated: string | null
          region: string | null
          regulation: string | null
          requirement: string | null
          validation_requirements: string | null
        }
        Insert: {
          compliance_approach?: string | null
          criticality?: string | null
          guidance_document?: string | null
          id?: number
          jtbd_id?: string | null
          last_updated?: string | null
          region?: string | null
          regulation?: string | null
          requirement?: string | null
          validation_requirements?: string | null
        }
        Update: {
          compliance_approach?: string | null
          criticality?: string | null
          guidance_document?: string | null
          id?: number
          jtbd_id?: string | null
          last_updated?: string | null
          region?: string | null
          regulation?: string | null
          requirement?: string | null
          validation_requirements?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jtbd_regulatory_considerations_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "jtbd_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_regulatory_considerations_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_regulatory_considerations_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_high_priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_regulatory_considerations_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_org_hierarchy"
            referencedColumns: ["jtbd_id"]
          },
        ]
      }
      jtbd_success_metrics: {
        Row: {
          baseline_value: string | null
          calculation_formula: string | null
          data_source: string | null
          id: number
          jtbd_id: string | null
          measurement_method: string | null
          metric_name: string
          metric_type: string | null
          reporting_frequency: string | null
          target_value: string | null
        }
        Insert: {
          baseline_value?: string | null
          calculation_formula?: string | null
          data_source?: string | null
          id?: number
          jtbd_id?: string | null
          measurement_method?: string | null
          metric_name: string
          metric_type?: string | null
          reporting_frequency?: string | null
          target_value?: string | null
        }
        Update: {
          baseline_value?: string | null
          calculation_formula?: string | null
          data_source?: string | null
          id?: number
          jtbd_id?: string | null
          measurement_method?: string | null
          metric_name?: string
          metric_type?: string | null
          reporting_frequency?: string | null
          target_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jtbd_success_metrics_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "jtbd_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_success_metrics_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_success_metrics_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_high_priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_success_metrics_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_org_hierarchy"
            referencedColumns: ["jtbd_id"]
          },
        ]
      }
      jtbd_tools: {
        Row: {
          api_endpoint: string | null
          credentials_required: boolean | null
          id: number
          integration_status: string | null
          is_required: boolean | null
          jtbd_id: string | null
          license_type: string | null
          monthly_cost_estimate: string | null
          setup_complexity: string | null
          tool_description: string | null
          tool_name: string
          tool_type: string | null
        }
        Insert: {
          api_endpoint?: string | null
          credentials_required?: boolean | null
          id?: number
          integration_status?: string | null
          is_required?: boolean | null
          jtbd_id?: string | null
          license_type?: string | null
          monthly_cost_estimate?: string | null
          setup_complexity?: string | null
          tool_description?: string | null
          tool_name: string
          tool_type?: string | null
        }
        Update: {
          api_endpoint?: string | null
          credentials_required?: boolean | null
          id?: number
          integration_status?: string | null
          is_required?: boolean | null
          jtbd_id?: string | null
          license_type?: string | null
          monthly_cost_estimate?: string | null
          setup_complexity?: string | null
          tool_description?: string | null
          tool_name?: string
          tool_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jtbd_tools_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "jtbd_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_tools_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_tools_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_high_priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_tools_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "v_jtbd_org_hierarchy"
            referencedColumns: ["jtbd_id"]
          },
        ]
      }
      knowledge_base_documents: {
        Row: {
          content: string
          created_at: string | null
          document_type: string | null
          domain: string | null
          id: string
          metadata: Json | null
          source_name: string | null
          source_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          document_type?: string | null
          domain?: string | null
          id?: string
          metadata?: Json | null
          source_name?: string | null
          source_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          document_type?: string | null
          domain?: string | null
          id?: string
          metadata?: Json | null
          source_name?: string | null
          source_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      knowledge_documents: {
        Row: {
          abstract: string | null
          access_policy:
            | Database["public"]["Enums"]["access_policy_level"]
            | null
          access_type: string | null
          authors: Json | null
          average_read_time_seconds: number | null
          bookmark_count: number | null
          category: string | null
          chunk_count: number | null
          chunk_strategy: string | null
          citation_count: number | null
          citation_format: string | null
          completion_rate: number | null
          compliance_tags: Json | null
          confidence_level: string | null
          contains_pii: boolean | null
          content: string | null
          content_file_type: string | null
          context_window_tokens: number | null
          created_at: string | null
          credibility_score: number | null
          data_classification: string | null
          data_richness_score: number | null
          direct_download: boolean | null
          document_structure: Json | null
          doi: string | null
          domain: string | null
          domain_id: string | null
          download_count: number | null
          download_date: string | null
          edition: string | null
          editorial_review_status: string | null
          embedding: string | null
          embedding_model_version: string | null
          enterprise_id: string | null
          evidence_level: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          firm: string | null
          firm_id: string | null
          forecast_year: number | null
          freshness_score: number | null
          geographic_regions: Json | null
          geographic_scope: string | null
          has_appendices: boolean | null
          has_charts_graphs: boolean | null
          has_data_tables: boolean | null
          has_executive_summary: boolean | null
          has_table_of_contents: boolean | null
          historical_period: string | null
          id: string
          industry_sectors: Json | null
          is_time_sensitive: boolean | null
          isbn: string | null
          language_code: string | null
          last_retrieved_at: string | null
          last_reviewed_date: string | null
          last_verified_date: string | null
          metadata: Json | null
          organization_id: string | null
          owner_user_id: string | null
          page_count: number | null
          paywall_status: string | null
          pdf_link: string | null
          peer_reviewed: boolean | null
          permanent_id: string | null
          pii_sensitivity: Database["public"]["Enums"]["exposure_level"] | null
          practice_areas: Json | null
          processed_at: string | null
          publication_date: string | null
          publication_month: string | null
          publication_year: number | null
          quality_score: number | null
          query_history_count: number | null
          rag_priority_weight: number | null
          readability_score: number | null
          registration_required: boolean | null
          regulatory_exposure:
            | Database["public"]["Enums"]["exposure_level"]
            | null
          related_document_ids: Json | null
          report_type: string | null
          requires_consent: boolean | null
          retention_policy: string | null
          reviewed_by_user_id: string | null
          section_count: number | null
          seniority_level: string | null
          series_name: string | null
          share_count: number | null
          source_metadata: Json | null
          source_name: string | null
          source_url: string | null
          status: string | null
          summarization_available: boolean | null
          superseded_by_document_id: string | null
          supersedes_document_id: string | null
          tags: string[] | null
          target_audience: Json | null
          technical_complexity: string | null
          temporal_coverage: string | null
          title: string
          topics: Json | null
          updated_at: string | null
          upload_url: string | null
          url: string | null
          use_case_category: string | null
          user_id: string | null
          validation_status: string | null
          version: string | null
          view_count: number | null
          visual_content_ratio: number | null
          word_count: number | null
        }
        Insert: {
          abstract?: string | null
          access_policy?:
            | Database["public"]["Enums"]["access_policy_level"]
            | null
          access_type?: string | null
          authors?: Json | null
          average_read_time_seconds?: number | null
          bookmark_count?: number | null
          category?: string | null
          chunk_count?: number | null
          chunk_strategy?: string | null
          citation_count?: number | null
          citation_format?: string | null
          completion_rate?: number | null
          compliance_tags?: Json | null
          confidence_level?: string | null
          contains_pii?: boolean | null
          content?: string | null
          content_file_type?: string | null
          context_window_tokens?: number | null
          created_at?: string | null
          credibility_score?: number | null
          data_classification?: string | null
          data_richness_score?: number | null
          direct_download?: boolean | null
          document_structure?: Json | null
          doi?: string | null
          domain?: string | null
          domain_id?: string | null
          download_count?: number | null
          download_date?: string | null
          edition?: string | null
          editorial_review_status?: string | null
          embedding?: string | null
          embedding_model_version?: string | null
          enterprise_id?: string | null
          evidence_level?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          firm?: string | null
          firm_id?: string | null
          forecast_year?: number | null
          freshness_score?: number | null
          geographic_regions?: Json | null
          geographic_scope?: string | null
          has_appendices?: boolean | null
          has_charts_graphs?: boolean | null
          has_data_tables?: boolean | null
          has_executive_summary?: boolean | null
          has_table_of_contents?: boolean | null
          historical_period?: string | null
          id?: string
          industry_sectors?: Json | null
          is_time_sensitive?: boolean | null
          isbn?: string | null
          language_code?: string | null
          last_retrieved_at?: string | null
          last_reviewed_date?: string | null
          last_verified_date?: string | null
          metadata?: Json | null
          organization_id?: string | null
          owner_user_id?: string | null
          page_count?: number | null
          paywall_status?: string | null
          pdf_link?: string | null
          peer_reviewed?: boolean | null
          permanent_id?: string | null
          pii_sensitivity?: Database["public"]["Enums"]["exposure_level"] | null
          practice_areas?: Json | null
          processed_at?: string | null
          publication_date?: string | null
          publication_month?: string | null
          publication_year?: number | null
          quality_score?: number | null
          query_history_count?: number | null
          rag_priority_weight?: number | null
          readability_score?: number | null
          registration_required?: boolean | null
          regulatory_exposure?:
            | Database["public"]["Enums"]["exposure_level"]
            | null
          related_document_ids?: Json | null
          report_type?: string | null
          requires_consent?: boolean | null
          retention_policy?: string | null
          reviewed_by_user_id?: string | null
          section_count?: number | null
          seniority_level?: string | null
          series_name?: string | null
          share_count?: number | null
          source_metadata?: Json | null
          source_name?: string | null
          source_url?: string | null
          status?: string | null
          summarization_available?: boolean | null
          superseded_by_document_id?: string | null
          supersedes_document_id?: string | null
          tags?: string[] | null
          target_audience?: Json | null
          technical_complexity?: string | null
          temporal_coverage?: string | null
          title: string
          topics?: Json | null
          updated_at?: string | null
          upload_url?: string | null
          url?: string | null
          use_case_category?: string | null
          user_id?: string | null
          validation_status?: string | null
          version?: string | null
          view_count?: number | null
          visual_content_ratio?: number | null
          word_count?: number | null
        }
        Update: {
          abstract?: string | null
          access_policy?:
            | Database["public"]["Enums"]["access_policy_level"]
            | null
          access_type?: string | null
          authors?: Json | null
          average_read_time_seconds?: number | null
          bookmark_count?: number | null
          category?: string | null
          chunk_count?: number | null
          chunk_strategy?: string | null
          citation_count?: number | null
          citation_format?: string | null
          completion_rate?: number | null
          compliance_tags?: Json | null
          confidence_level?: string | null
          contains_pii?: boolean | null
          content?: string | null
          content_file_type?: string | null
          context_window_tokens?: number | null
          created_at?: string | null
          credibility_score?: number | null
          data_classification?: string | null
          data_richness_score?: number | null
          direct_download?: boolean | null
          document_structure?: Json | null
          doi?: string | null
          domain?: string | null
          domain_id?: string | null
          download_count?: number | null
          download_date?: string | null
          edition?: string | null
          editorial_review_status?: string | null
          embedding?: string | null
          embedding_model_version?: string | null
          enterprise_id?: string | null
          evidence_level?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          firm?: string | null
          firm_id?: string | null
          forecast_year?: number | null
          freshness_score?: number | null
          geographic_regions?: Json | null
          geographic_scope?: string | null
          has_appendices?: boolean | null
          has_charts_graphs?: boolean | null
          has_data_tables?: boolean | null
          has_executive_summary?: boolean | null
          has_table_of_contents?: boolean | null
          historical_period?: string | null
          id?: string
          industry_sectors?: Json | null
          is_time_sensitive?: boolean | null
          isbn?: string | null
          language_code?: string | null
          last_retrieved_at?: string | null
          last_reviewed_date?: string | null
          last_verified_date?: string | null
          metadata?: Json | null
          organization_id?: string | null
          owner_user_id?: string | null
          page_count?: number | null
          paywall_status?: string | null
          pdf_link?: string | null
          peer_reviewed?: boolean | null
          permanent_id?: string | null
          pii_sensitivity?: Database["public"]["Enums"]["exposure_level"] | null
          practice_areas?: Json | null
          processed_at?: string | null
          publication_date?: string | null
          publication_month?: string | null
          publication_year?: number | null
          quality_score?: number | null
          query_history_count?: number | null
          rag_priority_weight?: number | null
          readability_score?: number | null
          registration_required?: boolean | null
          regulatory_exposure?:
            | Database["public"]["Enums"]["exposure_level"]
            | null
          related_document_ids?: Json | null
          report_type?: string | null
          requires_consent?: boolean | null
          retention_policy?: string | null
          reviewed_by_user_id?: string | null
          section_count?: number | null
          seniority_level?: string | null
          series_name?: string | null
          share_count?: number | null
          source_metadata?: Json | null
          source_name?: string | null
          source_url?: string | null
          status?: string | null
          summarization_available?: boolean | null
          superseded_by_document_id?: string | null
          supersedes_document_id?: string | null
          tags?: string[] | null
          target_audience?: Json | null
          technical_complexity?: string | null
          temporal_coverage?: string | null
          title?: string
          topics?: Json | null
          updated_at?: string | null
          upload_url?: string | null
          url?: string | null
          use_case_category?: string | null
          user_id?: string | null
          validation_status?: string | null
          version?: string | null
          view_count?: number | null
          visual_content_ratio?: number | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_documents_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_domains: {
        Row: {
          access_policy: string
          agent_count_estimate: number | null
          code: string
          color: string | null
          created_at: string | null
          domain_description_llm: string | null
          domain_id: string
          domain_name: string
          domain_scope: string
          embedding_model: string | null
          enterprise_id: string | null
          function_id: string
          function_name: string
          governance_owner: string | null
          is_active: boolean | null
          is_cross_tenant: boolean
          keywords: string[] | null
          last_review_owner_role: string | null
          lifecycle_stage: string[]
          maturity_level: string
          metadata: Json | null
          owner_user_id: string | null
          parent_domain_id: string | null
          pii_sensitivity: string
          priority: number
          rag_priority_weight: number
          regulatory_exposure: string
          slug: string
          sub_domains: string[] | null
          tenants_primary: string[]
          tenants_secondary: string[]
          tier: number
          tier_label: string | null
          updated_at: string | null
        }
        Insert: {
          access_policy?: string
          agent_count_estimate?: number | null
          code: string
          color?: string | null
          created_at?: string | null
          domain_description_llm?: string | null
          domain_id?: string
          domain_name: string
          domain_scope?: string
          embedding_model?: string | null
          enterprise_id?: string | null
          function_id?: string
          function_name?: string
          governance_owner?: string | null
          is_active?: boolean | null
          is_cross_tenant?: boolean
          keywords?: string[] | null
          last_review_owner_role?: string | null
          lifecycle_stage?: string[]
          maturity_level?: string
          metadata?: Json | null
          owner_user_id?: string | null
          parent_domain_id?: string | null
          pii_sensitivity?: string
          priority?: number
          rag_priority_weight?: number
          regulatory_exposure?: string
          slug: string
          sub_domains?: string[] | null
          tenants_primary?: string[]
          tenants_secondary?: string[]
          tier?: number
          tier_label?: string | null
          updated_at?: string | null
        }
        Update: {
          access_policy?: string
          agent_count_estimate?: number | null
          code?: string
          color?: string | null
          created_at?: string | null
          domain_description_llm?: string | null
          domain_id?: string
          domain_name?: string
          domain_scope?: string
          embedding_model?: string | null
          enterprise_id?: string | null
          function_id?: string
          function_name?: string
          governance_owner?: string | null
          is_active?: boolean | null
          is_cross_tenant?: boolean
          keywords?: string[] | null
          last_review_owner_role?: string | null
          lifecycle_stage?: string[]
          maturity_level?: string
          metadata?: Json | null
          owner_user_id?: string | null
          parent_domain_id?: string | null
          pii_sensitivity?: string
          priority?: number
          rag_priority_weight?: number
          regulatory_exposure?: string
          slug?: string
          sub_domains?: string[] | null
          tenants_primary?: string[]
          tenants_secondary?: string[]
          tier?: number
          tier_label?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_domains_parent_domain_id_fkey"
            columns: ["parent_domain_id"]
            isOneToOne: false
            referencedRelation: "knowledge_domains"
            referencedColumns: ["domain_id"]
          },
        ]
      }
      knowledge_domains_new: {
        Row: {
          access_policy:
            | Database["public"]["Enums"]["access_policy_level"]
            | null
          agent_count_estimate: number | null
          code: string | null
          color: string | null
          created_at: string | null
          description: string | null
          domain_description_llm: string | null
          domain_id: string
          domain_name: string
          domain_scope: Database["public"]["Enums"]["domain_scope"]
          embedding_model: string | null
          enterprise_id: string | null
          function_id: string
          function_name: string
          governance_owner: string | null
          icon: string | null
          is_active: boolean | null
          is_cross_tenant: boolean | null
          keywords: string[] | null
          last_review_owner_role: string | null
          last_reviewed_at: string | null
          lifecycle_stage: string[] | null
          maturity_level: Database["public"]["Enums"]["maturity_level"]
          metadata: Json | null
          name: string | null
          owner_user_id: string | null
          parent_domain_id: string | null
          pii_sensitivity: Database["public"]["Enums"]["exposure_level"] | null
          priority: number
          rag_priority_weight: number | null
          recommended_models: Json | null
          regulatory_exposure:
            | Database["public"]["Enums"]["exposure_level"]
            | null
          slug: string | null
          sub_domains: string[] | null
          tenants_primary: string[] | null
          tenants_secondary: string[] | null
          tier: number
          tier_label: string | null
          updated_at: string | null
        }
        Insert: {
          access_policy?:
            | Database["public"]["Enums"]["access_policy_level"]
            | null
          agent_count_estimate?: number | null
          code?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          domain_description_llm?: string | null
          domain_id: string
          domain_name: string
          domain_scope?: Database["public"]["Enums"]["domain_scope"]
          embedding_model?: string | null
          enterprise_id?: string | null
          function_id?: string
          function_name?: string
          governance_owner?: string | null
          icon?: string | null
          is_active?: boolean | null
          is_cross_tenant?: boolean | null
          keywords?: string[] | null
          last_review_owner_role?: string | null
          last_reviewed_at?: string | null
          lifecycle_stage?: string[] | null
          maturity_level?: Database["public"]["Enums"]["maturity_level"]
          metadata?: Json | null
          name?: string | null
          owner_user_id?: string | null
          parent_domain_id?: string | null
          pii_sensitivity?: Database["public"]["Enums"]["exposure_level"] | null
          priority?: number
          rag_priority_weight?: number | null
          recommended_models?: Json | null
          regulatory_exposure?:
            | Database["public"]["Enums"]["exposure_level"]
            | null
          slug?: string | null
          sub_domains?: string[] | null
          tenants_primary?: string[] | null
          tenants_secondary?: string[] | null
          tier?: number
          tier_label?: string | null
          updated_at?: string | null
        }
        Update: {
          access_policy?:
            | Database["public"]["Enums"]["access_policy_level"]
            | null
          agent_count_estimate?: number | null
          code?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          domain_description_llm?: string | null
          domain_id?: string
          domain_name?: string
          domain_scope?: Database["public"]["Enums"]["domain_scope"]
          embedding_model?: string | null
          enterprise_id?: string | null
          function_id?: string
          function_name?: string
          governance_owner?: string | null
          icon?: string | null
          is_active?: boolean | null
          is_cross_tenant?: boolean | null
          keywords?: string[] | null
          last_review_owner_role?: string | null
          last_reviewed_at?: string | null
          lifecycle_stage?: string[] | null
          maturity_level?: Database["public"]["Enums"]["maturity_level"]
          metadata?: Json | null
          name?: string | null
          owner_user_id?: string | null
          parent_domain_id?: string | null
          pii_sensitivity?: Database["public"]["Enums"]["exposure_level"] | null
          priority?: number
          rag_priority_weight?: number | null
          recommended_models?: Json | null
          regulatory_exposure?:
            | Database["public"]["Enums"]["exposure_level"]
            | null
          slug?: string | null
          sub_domains?: string[] | null
          tenants_primary?: string[] | null
          tenants_secondary?: string[] | null
          tier?: number
          tier_label?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_domains_new_parent_domain_id_fkey"
            columns: ["parent_domain_id"]
            isOneToOne: false
            referencedRelation: "knowledge_domains_new"
            referencedColumns: ["domain_id"]
          },
        ]
      }
      knowledge_sources: {
        Row: {
          access_level: string | null
          authors: string[] | null
          category: string
          confidence_score: number | null
          content_hash: string | null
          created_at: string
          description: string | null
          domain: string
          file_path: string | null
          file_size: number | null
          id: string
          is_public: boolean | null
          last_updated: string | null
          mime_type: string | null
          name: string
          processed_at: string | null
          processing_status: string | null
          publication_date: string | null
          relevance_score: number | null
          restricted_to_agents: string[] | null
          source_type: string
          source_url: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          version: string | null
        }
        Insert: {
          access_level?: string | null
          authors?: string[] | null
          category: string
          confidence_score?: number | null
          content_hash?: string | null
          created_at?: string
          description?: string | null
          domain: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_public?: boolean | null
          last_updated?: string | null
          mime_type?: string | null
          name: string
          processed_at?: string | null
          processing_status?: string | null
          publication_date?: string | null
          relevance_score?: number | null
          restricted_to_agents?: string[] | null
          source_type: string
          source_url?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          access_level?: string | null
          authors?: string[] | null
          category?: string
          confidence_score?: number | null
          content_hash?: string | null
          created_at?: string
          description?: string | null
          domain?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_public?: boolean | null
          last_updated?: string | null
          mime_type?: string | null
          name?: string
          processed_at?: string | null
          processing_status?: string | null
          publication_date?: string | null
          relevance_score?: number | null
          restricted_to_agents?: string[] | null
          source_type?: string
          source_url?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      llm_models: {
        Row: {
          cost_per_token: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          max_tokens: number | null
          model_name: string
          model_type: string | null
          provider_id: string | null
          updated_at: string | null
        }
        Insert: {
          cost_per_token?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model_name: string
          model_type?: string | null
          provider_id?: string | null
          updated_at?: string | null
        }
        Update: {
          cost_per_token?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model_name?: string
          model_type?: string | null
          provider_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "llm_models_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "llm_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_provider_health_checks: {
        Row: {
          check_timestamp: string | null
          error_code: string | null
          error_message: string | null
          error_type: string | null
          http_status_code: number | null
          id: string
          is_healthy: boolean
          metadata: Json | null
          provider_id: string
          response_time_ms: number | null
          test_cost: number | null
          test_prompt: string | null
          test_response: string | null
          test_tokens_used: number | null
        }
        Insert: {
          check_timestamp?: string | null
          error_code?: string | null
          error_message?: string | null
          error_type?: string | null
          http_status_code?: number | null
          id?: string
          is_healthy: boolean
          metadata?: Json | null
          provider_id: string
          response_time_ms?: number | null
          test_cost?: number | null
          test_prompt?: string | null
          test_response?: string | null
          test_tokens_used?: number | null
        }
        Update: {
          check_timestamp?: string | null
          error_code?: string | null
          error_message?: string | null
          error_type?: string | null
          http_status_code?: number | null
          id?: string
          is_healthy?: boolean
          metadata?: Json | null
          provider_id?: string
          response_time_ms?: number | null
          test_cost?: number | null
          test_prompt?: string | null
          test_response?: string | null
          test_tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "llm_provider_health_checks_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "llm_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_providers: {
        Row: {
          api_endpoint: string | null
          api_key_encrypted: string | null
          average_latency_ms: number | null
          capabilities: Json | null
          cost_per_1k_input_tokens: number | null
          cost_per_1k_output_tokens: number | null
          created_at: string | null
          created_by: string | null
          custom_headers: Json | null
          health_check_enabled: boolean | null
          health_check_interval_minutes: number | null
          health_check_timeout_seconds: number | null
          id: string
          is_active: boolean | null
          is_hipaa_compliant: boolean | null
          is_production_ready: boolean | null
          max_tokens: number | null
          medical_accuracy_score: number | null
          metadata: Json | null
          model_id: string
          model_version: string | null
          priority_level: number | null
          provider_name: string
          provider_type: Database["public"]["Enums"]["provider_type"]
          rate_limit_concurrent: number | null
          rate_limit_rpm: number | null
          rate_limit_tpm: number | null
          retry_config: Json | null
          status: Database["public"]["Enums"]["provider_status"] | null
          tags: string[] | null
          temperature_default: number | null
          updated_at: string | null
          updated_by: string | null
          uptime_percentage: number | null
          weight: number | null
        }
        Insert: {
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          average_latency_ms?: number | null
          capabilities?: Json | null
          cost_per_1k_input_tokens?: number | null
          cost_per_1k_output_tokens?: number | null
          created_at?: string | null
          created_by?: string | null
          custom_headers?: Json | null
          health_check_enabled?: boolean | null
          health_check_interval_minutes?: number | null
          health_check_timeout_seconds?: number | null
          id?: string
          is_active?: boolean | null
          is_hipaa_compliant?: boolean | null
          is_production_ready?: boolean | null
          max_tokens?: number | null
          medical_accuracy_score?: number | null
          metadata?: Json | null
          model_id: string
          model_version?: string | null
          priority_level?: number | null
          provider_name: string
          provider_type: Database["public"]["Enums"]["provider_type"]
          rate_limit_concurrent?: number | null
          rate_limit_rpm?: number | null
          rate_limit_tpm?: number | null
          retry_config?: Json | null
          status?: Database["public"]["Enums"]["provider_status"] | null
          tags?: string[] | null
          temperature_default?: number | null
          updated_at?: string | null
          updated_by?: string | null
          uptime_percentage?: number | null
          weight?: number | null
        }
        Update: {
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          average_latency_ms?: number | null
          capabilities?: Json | null
          cost_per_1k_input_tokens?: number | null
          cost_per_1k_output_tokens?: number | null
          created_at?: string | null
          created_by?: string | null
          custom_headers?: Json | null
          health_check_enabled?: boolean | null
          health_check_interval_minutes?: number | null
          health_check_timeout_seconds?: number | null
          id?: string
          is_active?: boolean | null
          is_hipaa_compliant?: boolean | null
          is_production_ready?: boolean | null
          max_tokens?: number | null
          medical_accuracy_score?: number | null
          metadata?: Json | null
          model_id?: string
          model_version?: string | null
          priority_level?: number | null
          provider_name?: string
          provider_type?: Database["public"]["Enums"]["provider_type"]
          rate_limit_concurrent?: number | null
          rate_limit_rpm?: number | null
          rate_limit_tpm?: number | null
          retry_config?: Json | null
          status?: Database["public"]["Enums"]["provider_status"] | null
          tags?: string[] | null
          temperature_default?: number | null
          updated_at?: string | null
          updated_by?: string | null
          uptime_percentage?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      llm_usage_logs: {
        Row: {
          agent_id: string | null
          clinical_validation_status: string | null
          confidence_score: number | null
          contains_phi: boolean | null
          cost_input: number | null
          cost_output: number | null
          created_at: string | null
          error_message: string | null
          error_type: string | null
          id: string
          input_tokens: number
          ip_address: unknown
          latency_ms: number
          llm_provider_id: string
          medical_accuracy_score: number | null
          medical_context: string | null
          output_tokens: number
          parent_request_id: string | null
          patient_context_id: string | null
          processing_time_ms: number | null
          quality_score: number | null
          queue_time_ms: number | null
          request_id: string
          request_metadata: Json | null
          response_metadata: Json | null
          session_id: string | null
          status: string
          total_cost: number | null
          total_tokens: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          clinical_validation_status?: string | null
          confidence_score?: number | null
          contains_phi?: boolean | null
          cost_input?: number | null
          cost_output?: number | null
          created_at?: string | null
          error_message?: string | null
          error_type?: string | null
          id?: string
          input_tokens?: number
          ip_address?: unknown
          latency_ms: number
          llm_provider_id: string
          medical_accuracy_score?: number | null
          medical_context?: string | null
          output_tokens?: number
          parent_request_id?: string | null
          patient_context_id?: string | null
          processing_time_ms?: number | null
          quality_score?: number | null
          queue_time_ms?: number | null
          request_id: string
          request_metadata?: Json | null
          response_metadata?: Json | null
          session_id?: string | null
          status?: string
          total_cost?: number | null
          total_tokens?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          clinical_validation_status?: string | null
          confidence_score?: number | null
          contains_phi?: boolean | null
          cost_input?: number | null
          cost_output?: number | null
          created_at?: string | null
          error_message?: string | null
          error_type?: string | null
          id?: string
          input_tokens?: number
          ip_address?: unknown
          latency_ms?: number
          llm_provider_id?: string
          medical_accuracy_score?: number | null
          medical_context?: string | null
          output_tokens?: number
          parent_request_id?: string | null
          patient_context_id?: string | null
          processing_time_ms?: number | null
          quality_score?: number | null
          queue_time_ms?: number | null
          request_id?: string
          request_metadata?: Json | null
          response_metadata?: Json | null
          session_id?: string | null
          status?: string
          total_cost?: number | null
          total_tokens?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "llm_usage_logs_llm_provider_id_fkey"
            columns: ["llm_provider_id"]
            isOneToOne: false
            referencedRelation: "llm_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          consultation_id: string | null
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          consultation_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          consultation_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics: {
        Row: {
          created_at: string | null
          id: string
          labels: Json | null
          metric_name: string
          timestamp: string
          type: string
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          labels?: Json | null
          metric_name: string
          timestamp: string
          type: string
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          labels?: Json | null
          metric_name?: string
          timestamp?: string
          type?: string
          value?: number
        }
        Relationships: []
      }
      org_department_roles: {
        Row: {
          created_at: string | null
          department_id: string
          headcount: number | null
          id: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          department_id: string
          headcount?: number | null
          id?: string
          role_id: string
        }
        Update: {
          created_at?: string | null
          department_id?: string
          headcount?: number | null
          id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_department_roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "org_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_department_roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "org_department_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "org_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_department_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["role_id"]
          },
        ]
      }
      org_departments: {
        Row: {
          compliance_requirements: string[] | null
          created_at: string | null
          created_by: string | null
          critical_systems: string[] | null
          data_classification: string | null
          department_id: string | null
          department_type: string | null
          description: string | null
          export_format: string | null
          function_area: string | null
          function_id: string | null
          id: string
          metadata: Json | null
          migration_ready: boolean | null
          org_department: string
          search_vector: unknown
          unique_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          compliance_requirements?: string[] | null
          created_at?: string | null
          created_by?: string | null
          critical_systems?: string[] | null
          data_classification?: string | null
          department_id?: string | null
          department_type?: string | null
          description?: string | null
          export_format?: string | null
          function_area?: string | null
          function_id?: string | null
          id?: string
          metadata?: Json | null
          migration_ready?: boolean | null
          org_department: string
          search_vector?: unknown
          unique_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          compliance_requirements?: string[] | null
          created_at?: string | null
          created_by?: string | null
          critical_systems?: string[] | null
          data_classification?: string | null
          department_id?: string | null
          department_type?: string | null
          description?: string | null
          export_format?: string | null
          function_area?: string | null
          function_id?: string | null
          id?: string
          metadata?: Json | null
          migration_ready?: boolean | null
          org_department?: string
          search_vector?: unknown
          unique_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_departments_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "org_functions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_departments_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["function_id"]
          },
        ]
      }
      org_function_departments: {
        Row: {
          created_at: string | null
          department_id: string
          function_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          department_id: string
          function_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          department_id?: string
          function_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_function_departments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "org_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_function_departments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "org_function_departments_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "org_functions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_function_departments_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["function_id"]
          },
        ]
      }
      org_function_roles: {
        Row: {
          created_at: string | null
          function_id: string
          id: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          function_id: string
          id?: string
          role_id: string
        }
        Update: {
          created_at?: string | null
          function_id?: string
          id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_function_roles_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "org_functions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_function_roles_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["function_id"]
          },
          {
            foreignKeyName: "org_function_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "org_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_function_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["role_id"]
          },
        ]
      }
      org_functions: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          migration_ready: boolean | null
          org_function: string
          search_vector: unknown
          unique_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          migration_ready?: boolean | null
          org_function: string
          search_vector?: unknown
          unique_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          migration_ready?: boolean | null
          org_function?: string
          search_vector?: unknown
          unique_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      org_hierarchy_mapping: {
        Row: {
          created_at: string
          created_by: string | null
          department_id: string | null
          department_name: string | null
          department_unique_id: string | null
          function_id: string | null
          function_name: string | null
          function_unique_id: string | null
          hierarchy_level: string | null
          id: string
          industry_id: string | null
          is_primary_path: boolean | null
          mapping_confidence: string
          mapping_source: string | null
          notes: string | null
          persona_code: string | null
          persona_id: string | null
          persona_name: string | null
          reporting_structure: string | null
          role_id: string | null
          role_name: string | null
          role_seniority: string | null
          role_unique_id: string | null
          updated_at: string
          validation_status: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          department_name?: string | null
          department_unique_id?: string | null
          function_id?: string | null
          function_name?: string | null
          function_unique_id?: string | null
          hierarchy_level?: string | null
          id?: string
          industry_id?: string | null
          is_primary_path?: boolean | null
          mapping_confidence?: string
          mapping_source?: string | null
          notes?: string | null
          persona_code?: string | null
          persona_id?: string | null
          persona_name?: string | null
          reporting_structure?: string | null
          role_id?: string | null
          role_name?: string | null
          role_seniority?: string | null
          role_unique_id?: string | null
          updated_at?: string
          validation_status?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          department_name?: string | null
          department_unique_id?: string | null
          function_id?: string | null
          function_name?: string | null
          function_unique_id?: string | null
          hierarchy_level?: string | null
          id?: string
          industry_id?: string | null
          is_primary_path?: boolean | null
          mapping_confidence?: string
          mapping_source?: string | null
          notes?: string | null
          persona_code?: string | null
          persona_id?: string | null
          persona_name?: string | null
          reporting_structure?: string | null
          role_id?: string | null
          role_name?: string | null
          role_seniority?: string | null
          role_unique_id?: string | null
          updated_at?: string
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_hierarchy_mapping_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "org_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_hierarchy_mapping_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "org_hierarchy_mapping_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "org_functions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_hierarchy_mapping_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["function_id"]
          },
          {
            foreignKeyName: "org_hierarchy_mapping_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_hierarchy_mapping_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "org_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_hierarchy_mapping_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["persona_id"]
          },
          {
            foreignKeyName: "org_hierarchy_mapping_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "v_persona_usecases"
            referencedColumns: ["persona_id"]
          },
          {
            foreignKeyName: "org_hierarchy_mapping_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "org_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_hierarchy_mapping_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["role_id"]
          },
        ]
      }
      org_personas: {
        Row: {
          ai_relationship: string | null
          behaviors: Json | null
          biotech_id: string | null
          capabilities: Json | null
          category_code: string | null
          code: string
          created_at: string
          decision_authority: string | null
          department: string | null
          description: string | null
          digital_health_id: string | null
          dx_id: string | null
          education: Json | null
          expertise_level: string | null
          frustrations: Json | null
          goals: Json | null
          id: string
          industry_id: string | null
          key_responsibilities: Json | null
          meddev_id: string | null
          metadata: Json | null
          motivations: Json | null
          name: string
          needs: Json | null
          pain_points: Json | null
          pharma_id: string | null
          preferred_channels: Json | null
          primary_role_id: string | null
          reports_to: string | null
          response_time_sla_hours: number | null
          tech_proficiency: string | null
          tenant_id: string
          typical_availability_hours: number | null
          typical_titles: Json | null
          unique_id: string
          updated_at: string
          years_experience: string | null
        }
        Insert: {
          ai_relationship?: string | null
          behaviors?: Json | null
          biotech_id?: string | null
          capabilities?: Json | null
          category_code?: string | null
          code: string
          created_at?: string
          decision_authority?: string | null
          department?: string | null
          description?: string | null
          digital_health_id?: string | null
          dx_id?: string | null
          education?: Json | null
          expertise_level?: string | null
          frustrations?: Json | null
          goals?: Json | null
          id?: string
          industry_id?: string | null
          key_responsibilities?: Json | null
          meddev_id?: string | null
          metadata?: Json | null
          motivations?: Json | null
          name: string
          needs?: Json | null
          pain_points?: Json | null
          pharma_id?: string | null
          preferred_channels?: Json | null
          primary_role_id?: string | null
          reports_to?: string | null
          response_time_sla_hours?: number | null
          tech_proficiency?: string | null
          tenant_id: string
          typical_availability_hours?: number | null
          typical_titles?: Json | null
          unique_id: string
          updated_at?: string
          years_experience?: string | null
        }
        Update: {
          ai_relationship?: string | null
          behaviors?: Json | null
          biotech_id?: string | null
          capabilities?: Json | null
          category_code?: string | null
          code?: string
          created_at?: string
          decision_authority?: string | null
          department?: string | null
          description?: string | null
          digital_health_id?: string | null
          dx_id?: string | null
          education?: Json | null
          expertise_level?: string | null
          frustrations?: Json | null
          goals?: Json | null
          id?: string
          industry_id?: string | null
          key_responsibilities?: Json | null
          meddev_id?: string | null
          metadata?: Json | null
          motivations?: Json | null
          name?: string
          needs?: Json | null
          pain_points?: Json | null
          pharma_id?: string | null
          preferred_channels?: Json | null
          primary_role_id?: string | null
          reports_to?: string | null
          response_time_sla_hours?: number | null
          tech_proficiency?: string | null
          tenant_id?: string
          typical_availability_hours?: number | null
          typical_titles?: Json | null
          unique_id?: string
          updated_at?: string
          years_experience?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dh_persona_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_personas_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_personas_primary_role_id_fkey"
            columns: ["primary_role_id"]
            isOneToOne: false
            referencedRelation: "org_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_personas_primary_role_id_fkey"
            columns: ["primary_role_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["role_id"]
          },
        ]
      }
      org_responsibilities: {
        Row: {
          category: string | null
          complexity_level: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          mapped_to_use_cases: string[] | null
          metadata: Json | null
          name: string
          priority: number | null
          search_vector: unknown
          unique_id: string
          updated_at: string | null
          use_case_ids: string[] | null
        }
        Insert: {
          category?: string | null
          complexity_level?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          mapped_to_use_cases?: string[] | null
          metadata?: Json | null
          name: string
          priority?: number | null
          search_vector?: unknown
          unique_id: string
          updated_at?: string | null
          use_case_ids?: string[] | null
        }
        Update: {
          category?: string | null
          complexity_level?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          mapped_to_use_cases?: string[] | null
          metadata?: Json | null
          name?: string
          priority?: number | null
          search_vector?: unknown
          unique_id?: string
          updated_at?: string | null
          use_case_ids?: string[] | null
        }
        Relationships: []
      }
      org_role_responsibilities: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          responsibility_id: string
          role_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          responsibility_id: string
          role_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          responsibility_id?: string
          role_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "org_role_responsibilities_responsibility_id_fkey"
            columns: ["responsibility_id"]
            isOneToOne: false
            referencedRelation: "org_responsibilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_role_responsibilities_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "org_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_role_responsibilities_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["role_id"]
          },
        ]
      }
      org_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          department_id: string | null
          department_name: string | null
          description: string | null
          function_area: string | null
          function_id: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          migration_ready: boolean | null
          org_role: string
          reports_to_role_id: string | null
          required_certifications: string[] | null
          required_skills: string[] | null
          role_title: string | null
          search_vector: unknown
          seniority_level: string | null
          unique_id: string
          updated_at: string | null
          updated_by: string | null
          years_experience_max: number | null
          years_experience_min: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          department_name?: string | null
          description?: string | null
          function_area?: string | null
          function_id?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          migration_ready?: boolean | null
          org_role: string
          reports_to_role_id?: string | null
          required_certifications?: string[] | null
          required_skills?: string[] | null
          role_title?: string | null
          search_vector?: unknown
          seniority_level?: string | null
          unique_id: string
          updated_at?: string | null
          updated_by?: string | null
          years_experience_max?: number | null
          years_experience_min?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          department_name?: string | null
          description?: string | null
          function_area?: string | null
          function_id?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          migration_ready?: boolean | null
          org_role?: string
          reports_to_role_id?: string | null
          required_certifications?: string[] | null
          required_skills?: string[] | null
          role_title?: string | null
          search_vector?: unknown
          seniority_level?: string | null
          unique_id?: string
          updated_at?: string | null
          updated_by?: string | null
          years_experience_max?: number | null
          years_experience_min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "org_roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "org_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "org_roles_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "org_functions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_roles_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["function_id"]
          },
          {
            foreignKeyName: "org_roles_reports_to_role_id_fkey"
            columns: ["reports_to_role_id"]
            isOneToOne: false
            referencedRelation: "org_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_roles_reports_to_role_id_fkey"
            columns: ["reports_to_role_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["role_id"]
          },
        ]
      }
      organizational_roles: {
        Row: {
          created_at: string | null
          department_id: string | null
          description: string | null
          id: string
          level: string | null
          metadata: Json | null
          name: string
          required_skills: string[] | null
          responsibilities: string[] | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          level?: string | null
          metadata?: Json | null
          name: string
          required_skills?: string[] | null
          responsibilities?: string[] | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          level?: string | null
          metadata?: Json | null
          name?: string
          required_skills?: string[] | null
          responsibilities?: string[] | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizational_roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          industry: string | null
          name: string
          size: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          industry?: string | null
          name: string
          size?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          industry?: string | null
          name?: string
          size?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      panel_analytics: {
        Row: {
          anomalies_detected: Json | null
          avg_confidence_score: number | null
          avg_cost_per_message: number | null
          avg_cost_per_participant: number | null
          avg_evidence_strength: number | null
          avg_messages_per_round: number | null
          avg_participation_rate: number | null
          avg_round_duration_seconds: number | null
          avg_tool_executions_per_message: number | null
          calculated_at: string | null
          citation_count: number | null
          consensus_improvement: number | null
          consensus_velocity: number | null
          cost_efficiency_score: number | null
          domain_coverage_score: number | null
          expert_diversity_index: number | null
          final_consensus_level: number | null
          id: string
          implementation_success_rate: number | null
          initial_consensus_level: number | null
          last_updated_at: string | null
          least_active_participant_id: string | null
          message_length_avg: number | null
          message_length_std_dev: number | null
          messages_per_consensus_point: number | null
          metadata: Json | null
          models_used: Json | null
          most_active_participant_id: string | null
          panel_id: string
          panel_type_avg_consensus: number | null
          panel_type_avg_duration: number | null
          percentile_rank_consensus: number | null
          percentile_rank_cost: number | null
          percentile_rank_duration: number | null
          performance_vs_type_avg: number | null
          primary_model: string | null
          quality_flags: Json | null
          recommendation_implemented: boolean | null
          response_time_avg_seconds: number | null
          rounds_to_consensus: number | null
          stakeholder_satisfaction_score: number | null
          tenant_id: string
          time_per_consensus_point: number | null
          tool_execution_count: number | null
          tools_used: Json | null
          total_cost_usd: number | null
          total_duration_seconds: number | null
          total_messages: number | null
          total_participants: number | null
          total_tokens_used: number | null
          unique_sources_count: number | null
          viewpoint_diversity_score: number | null
        }
        Insert: {
          anomalies_detected?: Json | null
          avg_confidence_score?: number | null
          avg_cost_per_message?: number | null
          avg_cost_per_participant?: number | null
          avg_evidence_strength?: number | null
          avg_messages_per_round?: number | null
          avg_participation_rate?: number | null
          avg_round_duration_seconds?: number | null
          avg_tool_executions_per_message?: number | null
          calculated_at?: string | null
          citation_count?: number | null
          consensus_improvement?: number | null
          consensus_velocity?: number | null
          cost_efficiency_score?: number | null
          domain_coverage_score?: number | null
          expert_diversity_index?: number | null
          final_consensus_level?: number | null
          id?: string
          implementation_success_rate?: number | null
          initial_consensus_level?: number | null
          last_updated_at?: string | null
          least_active_participant_id?: string | null
          message_length_avg?: number | null
          message_length_std_dev?: number | null
          messages_per_consensus_point?: number | null
          metadata?: Json | null
          models_used?: Json | null
          most_active_participant_id?: string | null
          panel_id: string
          panel_type_avg_consensus?: number | null
          panel_type_avg_duration?: number | null
          percentile_rank_consensus?: number | null
          percentile_rank_cost?: number | null
          percentile_rank_duration?: number | null
          performance_vs_type_avg?: number | null
          primary_model?: string | null
          quality_flags?: Json | null
          recommendation_implemented?: boolean | null
          response_time_avg_seconds?: number | null
          rounds_to_consensus?: number | null
          stakeholder_satisfaction_score?: number | null
          tenant_id: string
          time_per_consensus_point?: number | null
          tool_execution_count?: number | null
          tools_used?: Json | null
          total_cost_usd?: number | null
          total_duration_seconds?: number | null
          total_messages?: number | null
          total_participants?: number | null
          total_tokens_used?: number | null
          unique_sources_count?: number | null
          viewpoint_diversity_score?: number | null
        }
        Update: {
          anomalies_detected?: Json | null
          avg_confidence_score?: number | null
          avg_cost_per_message?: number | null
          avg_cost_per_participant?: number | null
          avg_evidence_strength?: number | null
          avg_messages_per_round?: number | null
          avg_participation_rate?: number | null
          avg_round_duration_seconds?: number | null
          avg_tool_executions_per_message?: number | null
          calculated_at?: string | null
          citation_count?: number | null
          consensus_improvement?: number | null
          consensus_velocity?: number | null
          cost_efficiency_score?: number | null
          domain_coverage_score?: number | null
          expert_diversity_index?: number | null
          final_consensus_level?: number | null
          id?: string
          implementation_success_rate?: number | null
          initial_consensus_level?: number | null
          last_updated_at?: string | null
          least_active_participant_id?: string | null
          message_length_avg?: number | null
          message_length_std_dev?: number | null
          messages_per_consensus_point?: number | null
          metadata?: Json | null
          models_used?: Json | null
          most_active_participant_id?: string | null
          panel_id?: string
          panel_type_avg_consensus?: number | null
          panel_type_avg_duration?: number | null
          percentile_rank_consensus?: number | null
          percentile_rank_cost?: number | null
          percentile_rank_duration?: number | null
          performance_vs_type_avg?: number | null
          primary_model?: string | null
          quality_flags?: Json | null
          recommendation_implemented?: boolean | null
          response_time_avg_seconds?: number | null
          rounds_to_consensus?: number | null
          stakeholder_satisfaction_score?: number | null
          tenant_id?: string
          time_per_consensus_point?: number | null
          tool_execution_count?: number | null
          tools_used?: Json | null
          total_cost_usd?: number | null
          total_duration_seconds?: number | null
          total_messages?: number | null
          total_participants?: number | null
          total_tokens_used?: number | null
          unique_sources_count?: number | null
          viewpoint_diversity_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "panel_analytics_least_active_participant_id_fkey"
            columns: ["least_active_participant_id"]
            isOneToOne: false
            referencedRelation: "panel_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_analytics_most_active_participant_id_fkey"
            columns: ["most_active_participant_id"]
            isOneToOne: false
            referencedRelation: "panel_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_analytics_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: true
            referencedRelation: "panel_performance_summary"
            referencedColumns: ["panel_id"]
          },
          {
            foreignKeyName: "panel_analytics_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: true
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_analytics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_consensus: {
        Row: {
          agreement_matrix: Json | null
          algorithm_used: string | null
          calculated_at: string | null
          calculation_time_ms: number | null
          coefficient_of_variation: number | null
          consensus_level: number
          consensus_type: string | null
          convergence_rate: number | null
          converging_points: Json | null
          dimensions: Json
          diverging_points: Json | null
          id: string
          mean_confidence: number | null
          metadata: Json | null
          panel_id: string
          round_id: string | null
          round_number: number
          std_deviation: number | null
          superposition_states: Json | null
          tenant_id: string
          time_to_consensus_estimate: number | null
          unresolved_issues: Json | null
          vote_distribution: Json | null
        }
        Insert: {
          agreement_matrix?: Json | null
          algorithm_used?: string | null
          calculated_at?: string | null
          calculation_time_ms?: number | null
          coefficient_of_variation?: number | null
          consensus_level: number
          consensus_type?: string | null
          convergence_rate?: number | null
          converging_points?: Json | null
          dimensions?: Json
          diverging_points?: Json | null
          id?: string
          mean_confidence?: number | null
          metadata?: Json | null
          panel_id: string
          round_id?: string | null
          round_number: number
          std_deviation?: number | null
          superposition_states?: Json | null
          tenant_id: string
          time_to_consensus_estimate?: number | null
          unresolved_issues?: Json | null
          vote_distribution?: Json | null
        }
        Update: {
          agreement_matrix?: Json | null
          algorithm_used?: string | null
          calculated_at?: string | null
          calculation_time_ms?: number | null
          coefficient_of_variation?: number | null
          consensus_level?: number
          consensus_type?: string | null
          convergence_rate?: number | null
          converging_points?: Json | null
          dimensions?: Json
          diverging_points?: Json | null
          id?: string
          mean_confidence?: number | null
          metadata?: Json | null
          panel_id?: string
          round_id?: string | null
          round_number?: number
          std_deviation?: number | null
          superposition_states?: Json | null
          tenant_id?: string
          time_to_consensus_estimate?: number | null
          unresolved_issues?: Json | null
          vote_distribution?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "panel_consensus_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panel_performance_summary"
            referencedColumns: ["panel_id"]
          },
          {
            foreignKeyName: "panel_consensus_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_consensus_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "panel_rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_consensus_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_messages: {
        Row: {
          addresses_participant_id: string | null
          citations: Json | null
          confidence_score: number | null
          content: string
          cost_usd: number | null
          created_at: string | null
          evidence_strength: number | null
          id: string
          in_response_to: string | null
          latency_ms: number | null
          message_id: string | null
          message_type: string
          metadata: Json | null
          model_used: string | null
          panel_id: string
          participant_id: string
          rag_sources: Json | null
          reasoning: Json | null
          round_id: string | null
          round_number: number
          sentiment_score: number | null
          stance: string | null
          summary: string | null
          tenant_id: string
          tokens_used: number | null
          tools_used: Json | null
        }
        Insert: {
          addresses_participant_id?: string | null
          citations?: Json | null
          confidence_score?: number | null
          content: string
          cost_usd?: number | null
          created_at?: string | null
          evidence_strength?: number | null
          id?: string
          in_response_to?: string | null
          latency_ms?: number | null
          message_id?: string | null
          message_type: string
          metadata?: Json | null
          model_used?: string | null
          panel_id: string
          participant_id: string
          rag_sources?: Json | null
          reasoning?: Json | null
          round_id?: string | null
          round_number?: number
          sentiment_score?: number | null
          stance?: string | null
          summary?: string | null
          tenant_id: string
          tokens_used?: number | null
          tools_used?: Json | null
        }
        Update: {
          addresses_participant_id?: string | null
          citations?: Json | null
          confidence_score?: number | null
          content?: string
          cost_usd?: number | null
          created_at?: string | null
          evidence_strength?: number | null
          id?: string
          in_response_to?: string | null
          latency_ms?: number | null
          message_id?: string | null
          message_type?: string
          metadata?: Json | null
          model_used?: string | null
          panel_id?: string
          participant_id?: string
          rag_sources?: Json | null
          reasoning?: Json | null
          round_id?: string | null
          round_number?: number
          sentiment_score?: number | null
          stance?: string | null
          summary?: string | null
          tenant_id?: string
          tokens_used?: number | null
          tools_used?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "panel_messages_addresses_participant_id_fkey"
            columns: ["addresses_participant_id"]
            isOneToOne: false
            referencedRelation: "panel_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_messages_in_response_to_fkey"
            columns: ["in_response_to"]
            isOneToOne: false
            referencedRelation: "panel_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_messages_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panel_performance_summary"
            referencedColumns: ["panel_id"]
          },
          {
            foreignKeyName: "panel_messages_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_messages_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "panel_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_messages_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "panel_rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_participants: {
        Row: {
          agent_id: string
          assigned_at: string | null
          avg_confidence: number | null
          confidence_weight: number | null
          contribution_score: number | null
          first_contribution_at: string | null
          id: string
          last_contribution_at: string | null
          messages_count: number | null
          metadata: Json | null
          panel_id: string
          participant_type: string
          role: string
          selection_method: string | null
          selection_reason: string | null
          selection_score: number | null
          sequence_order: number | null
          status: string | null
          team: string | null
          tenant_id: string
          voting_weight: number | null
        }
        Insert: {
          agent_id: string
          assigned_at?: string | null
          avg_confidence?: number | null
          confidence_weight?: number | null
          contribution_score?: number | null
          first_contribution_at?: string | null
          id?: string
          last_contribution_at?: string | null
          messages_count?: number | null
          metadata?: Json | null
          panel_id: string
          participant_type?: string
          role?: string
          selection_method?: string | null
          selection_reason?: string | null
          selection_score?: number | null
          sequence_order?: number | null
          status?: string | null
          team?: string | null
          tenant_id: string
          voting_weight?: number | null
        }
        Update: {
          agent_id?: string
          assigned_at?: string | null
          avg_confidence?: number | null
          confidence_weight?: number | null
          contribution_score?: number | null
          first_contribution_at?: string | null
          id?: string
          last_contribution_at?: string | null
          messages_count?: number | null
          metadata?: Json | null
          panel_id?: string
          participant_type?: string
          role?: string
          selection_method?: string | null
          selection_reason?: string | null
          selection_score?: number | null
          sequence_order?: number | null
          status?: string | null
          team?: string | null
          tenant_id?: string
          voting_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "panel_participants_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_full_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_participants_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_participants_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panel_performance_summary"
            referencedColumns: ["panel_id"]
          },
          {
            foreignKeyName: "panel_participants_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_participants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_recommendations: {
        Row: {
          action_items: Json | null
          actionability_score: number | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          clarity_score: number | null
          completeness_score: number | null
          confidence_level: number
          created_at: string | null
          decision_confidence: string | null
          decision_urgency: string | null
          dissenting_opinions: Json | null
          document_urls: Json | null
          evidence_strength: string | null
          executive_summary: string
          fda_meeting_summary: string | null
          fda_submission_ready: boolean | null
          id: string
          implementation_timeline: string | null
          is_final: boolean | null
          key_findings: Json | null
          metadata: Json | null
          minority_reports: Json | null
          next_steps: Json | null
          panel_id: string
          predicate_devices: Json | null
          recommendation: string
          regulatory_considerations: Json | null
          regulatory_pathway: string | null
          resource_requirements: Json | null
          risks: Json | null
          supersedes_id: string | null
          supporting_evidence: Json
          tenant_id: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          action_items?: Json | null
          actionability_score?: number | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          clarity_score?: number | null
          completeness_score?: number | null
          confidence_level: number
          created_at?: string | null
          decision_confidence?: string | null
          decision_urgency?: string | null
          dissenting_opinions?: Json | null
          document_urls?: Json | null
          evidence_strength?: string | null
          executive_summary: string
          fda_meeting_summary?: string | null
          fda_submission_ready?: boolean | null
          id?: string
          implementation_timeline?: string | null
          is_final?: boolean | null
          key_findings?: Json | null
          metadata?: Json | null
          minority_reports?: Json | null
          next_steps?: Json | null
          panel_id: string
          predicate_devices?: Json | null
          recommendation: string
          regulatory_considerations?: Json | null
          regulatory_pathway?: string | null
          resource_requirements?: Json | null
          risks?: Json | null
          supersedes_id?: string | null
          supporting_evidence?: Json
          tenant_id: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          action_items?: Json | null
          actionability_score?: number | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          clarity_score?: number | null
          completeness_score?: number | null
          confidence_level?: number
          created_at?: string | null
          decision_confidence?: string | null
          decision_urgency?: string | null
          dissenting_opinions?: Json | null
          document_urls?: Json | null
          evidence_strength?: string | null
          executive_summary?: string
          fda_meeting_summary?: string | null
          fda_submission_ready?: boolean | null
          id?: string
          implementation_timeline?: string | null
          is_final?: boolean | null
          key_findings?: Json | null
          metadata?: Json | null
          minority_reports?: Json | null
          next_steps?: Json | null
          panel_id?: string
          predicate_devices?: Json | null
          recommendation?: string
          regulatory_considerations?: Json | null
          regulatory_pathway?: string | null
          resource_requirements?: Json | null
          risks?: Json | null
          supersedes_id?: string | null
          supporting_evidence?: Json
          tenant_id?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "panel_recommendations_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panel_performance_summary"
            referencedColumns: ["panel_id"]
          },
          {
            foreignKeyName: "panel_recommendations_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_recommendations_supersedes_id_fkey"
            columns: ["supersedes_id"]
            isOneToOne: false
            referencedRelation: "panel_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_recommendations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_responses: {
        Row: {
          agent_id: string | null
          confidence_score: number | null
          content: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          model: string | null
          panel_id: string | null
          response_order: number | null
          round_number: number | null
          tokens_used: number | null
        }
        Insert: {
          agent_id?: string | null
          confidence_score?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model?: string | null
          panel_id?: string | null
          response_order?: number | null
          round_number?: number | null
          tokens_used?: number | null
        }
        Update: {
          agent_id?: string | null
          confidence_score?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model?: string | null
          panel_id?: string | null
          response_order?: number | null
          round_number?: number | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "panel_responses_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_full_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_responses_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_responses_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panel_performance_summary"
            referencedColumns: ["panel_id"]
          },
          {
            foreignKeyName: "panel_responses_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_rounds: {
        Row: {
          active_participants: number | null
          completed_at: string | null
          consensus_level: number | null
          convergence_rate: number | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          key_points: Json | null
          metadata: Json | null
          panel_id: string
          round_number: number
          round_type: string
          started_at: string | null
          status: string
          summary: string | null
          tenant_id: string
          total_messages: number | null
          updated_at: string | null
        }
        Insert: {
          active_participants?: number | null
          completed_at?: string | null
          consensus_level?: number | null
          convergence_rate?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          key_points?: Json | null
          metadata?: Json | null
          panel_id: string
          round_number: number
          round_type: string
          started_at?: string | null
          status?: string
          summary?: string | null
          tenant_id: string
          total_messages?: number | null
          updated_at?: string | null
        }
        Update: {
          active_participants?: number | null
          completed_at?: string | null
          consensus_level?: number | null
          convergence_rate?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          key_points?: Json | null
          metadata?: Json | null
          panel_id?: string
          round_number?: number
          round_type?: string
          started_at?: string | null
          status?: string
          summary?: string | null
          tenant_id?: string
          total_messages?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "panel_rounds_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panel_performance_summary"
            referencedColumns: ["panel_id"]
          },
          {
            foreignKeyName: "panel_rounds_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_rounds_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_types: {
        Row: {
          avg_duration_minutes: number | null
          created_at: string | null
          default_config: Json
          description: string
          display_name: string
          id: string
          is_active: boolean | null
          langgraph_workflow_path: string | null
          metadata: Json | null
          orchestration_strategy: string
          type_code: string
          type_name: string
          updated_at: string | null
          use_cases: Json | null
        }
        Insert: {
          avg_duration_minutes?: number | null
          created_at?: string | null
          default_config?: Json
          description: string
          display_name: string
          id?: string
          is_active?: boolean | null
          langgraph_workflow_path?: string | null
          metadata?: Json | null
          orchestration_strategy: string
          type_code: string
          type_name: string
          updated_at?: string | null
          use_cases?: Json | null
        }
        Update: {
          avg_duration_minutes?: number | null
          created_at?: string | null
          default_config?: Json
          description?: string
          display_name?: string
          id?: string
          is_active?: boolean | null
          langgraph_workflow_path?: string | null
          metadata?: Json | null
          orchestration_strategy?: string
          type_code?: string
          type_name?: string
          updated_at?: string | null
          use_cases?: Json | null
        }
        Relationships: []
      }
      panels: {
        Row: {
          actual_duration_seconds: number | null
          agent_ids: string[] | null
          completed_at: string | null
          configuration: Json | null
          consensus_dimensions: Json | null
          consensus_level: number | null
          consensus_reached: boolean | null
          consensus_type: string | null
          context: string | null
          conversation_id: string | null
          created_at: string | null
          current_round: number | null
          deleted_at: string | null
          description: string | null
          dissenting_opinions: Json | null
          duration_seconds: number | null
          estimated_duration_minutes: number | null
          evidence_summary: Json | null
          executive_summary: string | null
          final_recommendation: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          minority_reports: Json | null
          panel_type: string | null
          panel_type_code: string | null
          panel_type_id: string | null
          query: string | null
          regulatory_package: Json | null
          started_at: string | null
          status: string | null
          tenant_id: string
          title: string
          total_rounds: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actual_duration_seconds?: number | null
          agent_ids?: string[] | null
          completed_at?: string | null
          configuration?: Json | null
          consensus_dimensions?: Json | null
          consensus_level?: number | null
          consensus_reached?: boolean | null
          consensus_type?: string | null
          context?: string | null
          conversation_id?: string | null
          created_at?: string | null
          current_round?: number | null
          deleted_at?: string | null
          description?: string | null
          dissenting_opinions?: Json | null
          duration_seconds?: number | null
          estimated_duration_minutes?: number | null
          evidence_summary?: Json | null
          executive_summary?: string | null
          final_recommendation?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          minority_reports?: Json | null
          panel_type?: string | null
          panel_type_code?: string | null
          panel_type_id?: string | null
          query?: string | null
          regulatory_package?: Json | null
          started_at?: string | null
          status?: string | null
          tenant_id: string
          title: string
          total_rounds?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actual_duration_seconds?: number | null
          agent_ids?: string[] | null
          completed_at?: string | null
          configuration?: Json | null
          consensus_dimensions?: Json | null
          consensus_level?: number | null
          consensus_reached?: boolean | null
          consensus_type?: string | null
          context?: string | null
          conversation_id?: string | null
          created_at?: string | null
          current_round?: number | null
          deleted_at?: string | null
          description?: string | null
          dissenting_opinions?: Json | null
          duration_seconds?: number | null
          estimated_duration_minutes?: number | null
          evidence_summary?: Json | null
          executive_summary?: string | null
          final_recommendation?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          minority_reports?: Json | null
          panel_type?: string | null
          panel_type_code?: string | null
          panel_type_id?: string | null
          query?: string | null
          regulatory_package?: Json | null
          started_at?: string | null
          status?: string | null
          tenant_id?: string
          title?: string
          total_rounds?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "panels_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panels_panel_type_id_fkey"
            columns: ["panel_type_id"]
            isOneToOne: false
            referencedRelation: "panel_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panels_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          id: string
          metric_name: string
          metric_unit: string | null
          metric_value: number | null
          recorded_at: string | null
          tags: Json | null
        }
        Insert: {
          id?: string
          metric_name: string
          metric_unit?: string | null
          metric_value?: number | null
          recorded_at?: string | null
          tags?: Json | null
        }
        Update: {
          id?: string
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number | null
          recorded_at?: string | null
          tags?: Json | null
        }
        Relationships: []
      }
      persona_industry_mapping: {
        Row: {
          created_at: string
          id: string
          industry_id: string
          industry_metadata: Json | null
          industry_specific_id: string | null
          industry_title: string | null
          is_primary: boolean | null
          last_used_at: string | null
          persona_id: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          industry_id: string
          industry_metadata?: Json | null
          industry_specific_id?: string | null
          industry_title?: string | null
          is_primary?: boolean | null
          last_used_at?: string | null
          persona_id: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          industry_id?: string
          industry_metadata?: Json | null
          industry_specific_id?: string | null
          industry_title?: string | null
          is_primary?: boolean | null
          last_used_at?: string | null
          persona_id?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      persona_jtbd_mapping: {
        Row: {
          created_at: string
          engagement_metadata: Json | null
          frequency: string | null
          id: string
          impact_level: string | null
          is_primary: boolean | null
          jtbd_id: string
          notes: string | null
          pain_points_count: number | null
          persona_id: string
          responsibility_level: string | null
          role_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          engagement_metadata?: Json | null
          frequency?: string | null
          id?: string
          impact_level?: string | null
          is_primary?: boolean | null
          jtbd_id: string
          notes?: string | null
          pain_points_count?: number | null
          persona_id: string
          responsibility_level?: string | null
          role_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          engagement_metadata?: Json | null
          frequency?: string | null
          id?: string
          impact_level?: string | null
          is_primary?: boolean | null
          jtbd_id?: string
          notes?: string | null
          pain_points_count?: number | null
          persona_id?: string
          responsibility_level?: string | null
          role_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      persona_role_mapping: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_primary_role: boolean | null
          match_confidence: string
          match_score: number | null
          match_type: string
          notes: string | null
          org_role_id: string
          persona_id: string
          role_context: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_primary_role?: boolean | null
          match_confidence: string
          match_score?: number | null
          match_type: string
          notes?: string | null
          org_role_id: string
          persona_id: string
          role_context?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_primary_role?: boolean | null
          match_confidence?: string
          match_score?: number | null
          match_type?: string
          notes?: string | null
          org_role_id?: string
          persona_id?: string
          role_context?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "persona_role_mapping_org_role_id_fkey"
            columns: ["org_role_id"]
            isOneToOne: false
            referencedRelation: "org_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_role_mapping_org_role_id_fkey"
            columns: ["org_role_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["role_id"]
          },
          {
            foreignKeyName: "persona_role_mapping_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "org_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_role_mapping_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["persona_id"]
          },
          {
            foreignKeyName: "persona_role_mapping_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "v_persona_usecases"
            referencedColumns: ["persona_id"]
          },
        ]
      }
      persona_strategic_pillar_mapping: {
        Row: {
          created_at: string
          engagement_metadata: Json | null
          id: string
          is_primary: boolean | null
          jtbd_count: number | null
          notes: string | null
          pain_points_count: number | null
          persona_id: string
          priority_score: number | null
          strategic_pillar_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          engagement_metadata?: Json | null
          id?: string
          is_primary?: boolean | null
          jtbd_count?: number | null
          notes?: string | null
          pain_points_count?: number | null
          persona_id: string
          priority_score?: number | null
          strategic_pillar_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          engagement_metadata?: Json | null
          id?: string
          is_primary?: boolean | null
          jtbd_count?: number | null
          notes?: string | null
          pain_points_count?: number | null
          persona_id?: string
          priority_score?: number | null
          strategic_pillar_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      persona_usecase_mapping: {
        Row: {
          created_at: string
          id: string
          match_reason: string | null
          persona_id: string
          relevance_score: number | null
          updated_at: string
          usecase_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_reason?: string | null
          persona_id: string
          relevance_score?: number | null
          updated_at?: string
          usecase_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_reason?: string | null
          persona_id?: string
          relevance_score?: number | null
          updated_at?: string
          usecase_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "persona_usecase_mapping_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "org_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_usecase_mapping_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["persona_id"]
          },
          {
            foreignKeyName: "persona_usecase_mapping_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "v_persona_usecases"
            referencedColumns: ["persona_id"]
          },
          {
            foreignKeyName: "persona_usecase_mapping_usecase_id_fkey"
            columns: ["usecase_id"]
            isOneToOne: false
            referencedRelation: "dh_use_case"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_usecase_mapping_usecase_id_fkey"
            columns: ["usecase_id"]
            isOneToOne: false
            referencedRelation: "v_persona_usecases"
            referencedColumns: ["usecase_id"]
          },
        ]
      }
      personas: {
        Row: {
          ai_interaction_profile: Json | null
          attributes: Json | null
          communication_style: Json | null
          created_at: string
          created_by: string | null
          decision_authority: string | null
          deleted_at: string | null
          description: string | null
          display_name: string | null
          goals: Json | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_public: boolean | null
          is_verified: boolean | null
          name: string
          owner_tenant_id: string | null
          pain_points: Json | null
          persona_type: string | null
          preferences: Json | null
          profile: Json | null
          responsibilities: Json | null
          seniority_level: string | null
          short_bio: string | null
          tagline: string | null
          tenant_id: string | null
          unique_id: string
          updated_at: string
          updated_by: string | null
          version: number | null
          work_patterns: Json | null
        }
        Insert: {
          ai_interaction_profile?: Json | null
          attributes?: Json | null
          communication_style?: Json | null
          created_at?: string
          created_by?: string | null
          decision_authority?: string | null
          deleted_at?: string | null
          description?: string | null
          display_name?: string | null
          goals?: Json | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_public?: boolean | null
          is_verified?: boolean | null
          name: string
          owner_tenant_id?: string | null
          pain_points?: Json | null
          persona_type?: string | null
          preferences?: Json | null
          profile?: Json | null
          responsibilities?: Json | null
          seniority_level?: string | null
          short_bio?: string | null
          tagline?: string | null
          tenant_id?: string | null
          unique_id: string
          updated_at?: string
          updated_by?: string | null
          version?: number | null
          work_patterns?: Json | null
        }
        Update: {
          ai_interaction_profile?: Json | null
          attributes?: Json | null
          communication_style?: Json | null
          created_at?: string
          created_by?: string | null
          decision_authority?: string | null
          deleted_at?: string | null
          description?: string | null
          display_name?: string | null
          goals?: Json | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_public?: boolean | null
          is_verified?: boolean | null
          name?: string
          owner_tenant_id?: string | null
          pain_points?: Json | null
          persona_type?: string | null
          preferences?: Json | null
          profile?: Json | null
          responsibilities?: Json | null
          seniority_level?: string | null
          short_bio?: string | null
          tagline?: string | null
          tenant_id?: string | null
          unique_id?: string
          updated_at?: string
          updated_by?: string | null
          version?: number | null
          work_patterns?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          preferences: Json | null
          role: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          preferences?: Json | null
          role?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          preferences?: Json | null
          role?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_members: {
        Row: {
          id: string
          joined_at: string
          permissions: Json | null
          project_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string
          permissions?: Json | null
          project_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string
          permissions?: Json | null
          project_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget_allocated: number | null
          budget_spent: number | null
          created_at: string
          created_by: string | null
          current_phase: string | null
          description: string | null
          id: string
          metadata: Json | null
          name: string
          organization_id: string
          project_type: string | null
          regulatory_pathway: string | null
          status: string | null
          target_market: string | null
          timeline_end: string | null
          timeline_start: string | null
          updated_at: string
        }
        Insert: {
          budget_allocated?: number | null
          budget_spent?: number | null
          created_at?: string
          created_by?: string | null
          current_phase?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          organization_id: string
          project_type?: string | null
          regulatory_pathway?: string | null
          status?: string | null
          target_market?: string | null
          timeline_end?: string | null
          timeline_start?: string | null
          updated_at?: string
        }
        Update: {
          budget_allocated?: number | null
          budget_spent?: number | null
          created_at?: string
          created_by?: string | null
          current_phase?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          organization_id?: string
          project_type?: string | null
          regulatory_pathway?: string | null
          status?: string | null
          target_market?: string | null
          timeline_end?: string | null
          timeline_start?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_capabilities: {
        Row: {
          capability_id: string
          created_at: string | null
          id: string
          is_required: boolean | null
          prompt_id: string
        }
        Insert: {
          capability_id: string
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          prompt_id: string
        }
        Update: {
          capability_id?: string
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          prompt_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_capabilities_capability_id_fkey"
            columns: ["capability_id"]
            isOneToOne: false
            referencedRelation: "capabilities"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          domain_id: string
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          domain_id: string
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          domain_id?: string
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_categories_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "prompt_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_domains: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          display_name: string
          icon: string | null
          id: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      prompt_enhancement_config: {
        Row: {
          additional_settings: Json | null
          config_name: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          llm_model: string
          llm_provider: string
          max_tokens: number | null
          temperature: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          additional_settings?: Json | null
          config_name?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          llm_model: string
          llm_provider: string
          max_tokens?: number | null
          temperature?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          additional_settings?: Json | null
          config_name?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          llm_model?: string
          llm_provider?: string
          max_tokens?: number | null
          temperature?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      prompt_industry_mapping: {
        Row: {
          created_at: string | null
          id: string
          industry_id: string
          is_primary: boolean | null
          prompt_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry_id: string
          is_primary?: boolean | null
          prompt_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          industry_id?: string
          is_primary?: boolean | null
          prompt_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_industry_mapping_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_industry_mapping_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompt_full_context"
            referencedColumns: ["prompt_id"]
          },
          {
            foreignKeyName: "prompt_industry_mapping_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_relationships: {
        Row: {
          child_prompt_id: string
          created_at: string | null
          description: string | null
          id: string
          is_required: boolean | null
          parent_prompt_id: string
          relationship_type: string
        }
        Insert: {
          child_prompt_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          parent_prompt_id: string
          relationship_type: string
        }
        Update: {
          child_prompt_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          parent_prompt_id?: string
          relationship_type?: string
        }
        Relationships: []
      }
      prompt_systems: {
        Row: {
          best_for: string | null
          created_at: string | null
          description: string | null
          display_name: string
          execution_mode: string
          format_type: string
          id: string
          name: string
          training_required: string | null
          updated_at: string | null
          variable_format: string
        }
        Insert: {
          best_for?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          execution_mode: string
          format_type: string
          id?: string
          name: string
          training_required?: string | null
          updated_at?: string | null
          variable_format: string
        }
        Update: {
          best_for?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          execution_mode?: string
          format_type?: string
          id?: string
          name?: string
          training_required?: string | null
          updated_at?: string | null
          variable_format?: string
        }
        Relationships: []
      }
      prompt_task_mapping: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          prompt_id: string
          task_code: string | null
          task_id: string
          usage_context: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          prompt_id: string
          task_code?: string | null
          task_id: string
          usage_context?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          prompt_id?: string
          task_code?: string | null
          task_id?: string
          usage_context?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_task_mapping_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompt_full_context"
            referencedColumns: ["prompt_id"]
          },
          {
            foreignKeyName: "prompt_task_mapping_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_task_mapping_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "dh_task"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_templates: {
        Row: {
          content: string
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          name: string
          template_type: string
          updated_at: string | null
          usage_instructions: string | null
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          name: string
          template_type: string
          updated_at?: string | null
          usage_instructions?: string | null
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          name?: string
          template_type?: string
          updated_at?: string | null
          usage_instructions?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      prompt_usage_analytics: {
        Row: {
          completion_status: string | null
          created_at: string | null
          execution_time_seconds: number | null
          feedback: string | null
          id: string
          prompt_id: string
          success_rating: number | null
          user_id: string | null
          variables_used: Json | null
        }
        Insert: {
          completion_status?: string | null
          created_at?: string | null
          execution_time_seconds?: number | null
          feedback?: string | null
          id?: string
          prompt_id: string
          success_rating?: number | null
          user_id?: string | null
          variables_used?: Json | null
        }
        Update: {
          completion_status?: string | null
          created_at?: string | null
          execution_time_seconds?: number | null
          feedback?: string | null
          id?: string
          prompt_id?: string
          success_rating?: number | null
          user_id?: string | null
          variables_used?: Json | null
        }
        Relationships: []
      }
      prompt_variables: {
        Row: {
          created_at: string | null
          default_value: string | null
          description: string | null
          display_name: string | null
          id: string
          is_required: boolean | null
          options: Json | null
          prompt_id: string
          sort_order: number | null
          validation_rules: Json | null
          variable_name: string
          variable_type: string
        }
        Insert: {
          created_at?: string | null
          default_value?: string | null
          description?: string | null
          display_name?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          prompt_id: string
          sort_order?: number | null
          validation_rules?: Json | null
          variable_name: string
          variable_type: string
        }
        Update: {
          created_at?: string | null
          default_value?: string | null
          description?: string | null
          display_name?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          prompt_id?: string
          sort_order?: number | null
          validation_rules?: Json | null
          variable_name?: string
          variable_type?: string
        }
        Relationships: []
      }
      prompt_workflow_mapping: {
        Row: {
          context_notes: string | null
          created_at: string | null
          id: string
          prompt_id: string
          sequence: number | null
          task_id: string | null
          workflow_id: string
        }
        Insert: {
          context_notes?: string | null
          created_at?: string | null
          id?: string
          prompt_id: string
          sequence?: number | null
          task_id?: string | null
          workflow_id: string
        }
        Update: {
          context_notes?: string | null
          created_at?: string | null
          id?: string
          prompt_id?: string
          sequence?: number | null
          task_id?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_workflow_mapping_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompt_full_context"
            referencedColumns: ["prompt_id"]
          },
          {
            foreignKeyName: "prompt_workflow_mapping_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_workflow_mapping_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "dh_task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_workflow_mapping_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "dh_workflow"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          accuracy_threshold: number | null
          category: string
          complexity_level: string | null
          compliance_tags: string[] | null
          created_at: string | null
          created_by: string | null
          description: string
          display_name: string
          domain: string
          estimated_tokens: number | null
          execution_instructions: Json | null
          hipaa_relevant: boolean | null
          id: string
          input_schema: Json | null
          model_requirements: Json | null
          name: string
          output_schema: Json | null
          phi_handling_rules: Json | null
          prerequisite_capabilities: string[] | null
          prerequisite_prompts: string[] | null
          related_capabilities: string[] | null
          required_context: string[] | null
          status: string | null
          success_criteria: Json | null
          system_prompt: string
          testing_scenarios: Json | null
          updated_at: string | null
          user_prompt_template: string | null
          validation_rules: Json | null
          validation_status: string | null
          version: string | null
        }
        Insert: {
          accuracy_threshold?: number | null
          category: string
          complexity_level?: string | null
          compliance_tags?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description: string
          display_name: string
          domain?: string
          estimated_tokens?: number | null
          execution_instructions?: Json | null
          hipaa_relevant?: boolean | null
          id?: string
          input_schema?: Json | null
          model_requirements?: Json | null
          name: string
          output_schema?: Json | null
          phi_handling_rules?: Json | null
          prerequisite_capabilities?: string[] | null
          prerequisite_prompts?: string[] | null
          related_capabilities?: string[] | null
          required_context?: string[] | null
          status?: string | null
          success_criteria?: Json | null
          system_prompt: string
          testing_scenarios?: Json | null
          updated_at?: string | null
          user_prompt_template?: string | null
          validation_rules?: Json | null
          validation_status?: string | null
          version?: string | null
        }
        Update: {
          accuracy_threshold?: number | null
          category?: string
          complexity_level?: string | null
          compliance_tags?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          display_name?: string
          domain?: string
          estimated_tokens?: number | null
          execution_instructions?: Json | null
          hipaa_relevant?: boolean | null
          id?: string
          input_schema?: Json | null
          model_requirements?: Json | null
          name?: string
          output_schema?: Json | null
          phi_handling_rules?: Json | null
          prerequisite_capabilities?: string[] | null
          prerequisite_prompts?: string[] | null
          related_capabilities?: string[] | null
          required_context?: string[] | null
          status?: string | null
          success_criteria?: Json | null
          system_prompt?: string
          testing_scenarios?: Json | null
          updated_at?: string | null
          user_prompt_template?: string | null
          validation_rules?: Json | null
          validation_status?: string | null
          version?: string | null
        }
        Relationships: []
      }
      query_logs: {
        Row: {
          agent_id: string | null
          conversation_context: Json | null
          created_at: string
          embedding_model: string | null
          filters: Json | null
          id: string
          query_domain: string | null
          query_embedding: string | null
          query_text: string
          relevance_score: number | null
          retrieval_strategy: string | null
          retrieval_time_ms: number | null
          retrieved_chunks: string[] | null
          session_id: string | null
          top_k: number | null
          total_results: number | null
          user_feedback: string | null
          user_id: string | null
          user_rating: number | null
        }
        Insert: {
          agent_id?: string | null
          conversation_context?: Json | null
          created_at?: string
          embedding_model?: string | null
          filters?: Json | null
          id?: string
          query_domain?: string | null
          query_embedding?: string | null
          query_text: string
          relevance_score?: number | null
          retrieval_strategy?: string | null
          retrieval_time_ms?: number | null
          retrieved_chunks?: string[] | null
          session_id?: string | null
          top_k?: number | null
          total_results?: number | null
          user_feedback?: string | null
          user_id?: string | null
          user_rating?: number | null
        }
        Update: {
          agent_id?: string | null
          conversation_context?: Json | null
          created_at?: string
          embedding_model?: string | null
          filters?: Json | null
          id?: string
          query_domain?: string | null
          query_embedding?: string | null
          query_text?: string
          relevance_score?: number | null
          retrieval_strategy?: string | null
          retrieval_time_ms?: number | null
          retrieved_chunks?: string[] | null
          session_id?: string | null
          top_k?: number | null
          total_results?: number | null
          user_feedback?: string | null
          user_id?: string | null
          user_rating?: number | null
        }
        Relationships: []
      }
      rag_documents: {
        Row: {
          chunk_count: number | null
          completeness_score: number | null
          compliance_tags: string[] | null
          confidence_score: number | null
          contains_phi: boolean | null
          content_categories: string[] | null
          content_hash: string | null
          created_at: string | null
          document_name: string
          document_type: string | null
          embedding_count: number | null
          extracted_entities: Json | null
          file_path: string | null
          file_size_bytes: number | null
          id: string
          key_topics: string[] | null
          original_filename: string | null
          page_count: number | null
          processed_at: string | null
          processing_status: string | null
          rag_id: string
          readability_score: number | null
          redaction_applied: boolean | null
          relevance_score: number | null
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          word_count: number | null
        }
        Insert: {
          chunk_count?: number | null
          completeness_score?: number | null
          compliance_tags?: string[] | null
          confidence_score?: number | null
          contains_phi?: boolean | null
          content_categories?: string[] | null
          content_hash?: string | null
          created_at?: string | null
          document_name: string
          document_type?: string | null
          embedding_count?: number | null
          extracted_entities?: Json | null
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          key_topics?: string[] | null
          original_filename?: string | null
          page_count?: number | null
          processed_at?: string | null
          processing_status?: string | null
          rag_id: string
          readability_score?: number | null
          redaction_applied?: boolean | null
          relevance_score?: number | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          word_count?: number | null
        }
        Update: {
          chunk_count?: number | null
          completeness_score?: number | null
          compliance_tags?: string[] | null
          confidence_score?: number | null
          contains_phi?: boolean | null
          content_categories?: string[] | null
          content_hash?: string | null
          created_at?: string | null
          document_name?: string
          document_type?: string | null
          embedding_count?: number | null
          extracted_entities?: Json | null
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          key_topics?: string[] | null
          original_filename?: string | null
          page_count?: number | null
          processed_at?: string | null
          processing_status?: string | null
          rag_id?: string
          readability_score?: number | null
          redaction_applied?: boolean | null
          relevance_score?: number | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rag_documents_rag_id_fkey"
            columns: ["rag_id"]
            isOneToOne: false
            referencedRelation: "rag_knowledge_bases"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_knowledge_bases: {
        Row: {
          access_level: string | null
          chunk_overlap: number | null
          chunk_size: number | null
          contains_phi: boolean | null
          content_types: string[] | null
          created_at: string | null
          created_by: string | null
          data_retention_days: number | null
          data_sources: string[] | null
          description: string
          display_name: string
          document_count: number | null
          embedding_model: string | null
          encryption_enabled: boolean | null
          hipaa_compliant: boolean | null
          id: string
          index_status: string | null
          is_public: boolean | null
          knowledge_domains: string[] | null
          last_indexed_at: string | null
          name: string
          performance_metrics: Json | null
          purpose_description: string
          quality_score: number | null
          rag_type: string | null
          similarity_threshold: number | null
          status: string | null
          total_chunks: number | null
          updated_at: string | null
          vector_store_config: Json | null
          version: string | null
        }
        Insert: {
          access_level?: string | null
          chunk_overlap?: number | null
          chunk_size?: number | null
          contains_phi?: boolean | null
          content_types?: string[] | null
          created_at?: string | null
          created_by?: string | null
          data_retention_days?: number | null
          data_sources?: string[] | null
          description: string
          display_name: string
          document_count?: number | null
          embedding_model?: string | null
          encryption_enabled?: boolean | null
          hipaa_compliant?: boolean | null
          id?: string
          index_status?: string | null
          is_public?: boolean | null
          knowledge_domains?: string[] | null
          last_indexed_at?: string | null
          name: string
          performance_metrics?: Json | null
          purpose_description: string
          quality_score?: number | null
          rag_type?: string | null
          similarity_threshold?: number | null
          status?: string | null
          total_chunks?: number | null
          updated_at?: string | null
          vector_store_config?: Json | null
          version?: string | null
        }
        Update: {
          access_level?: string | null
          chunk_overlap?: number | null
          chunk_size?: number | null
          contains_phi?: boolean | null
          content_types?: string[] | null
          created_at?: string | null
          created_by?: string | null
          data_retention_days?: number | null
          data_sources?: string[] | null
          description?: string
          display_name?: string
          document_count?: number | null
          embedding_model?: string | null
          encryption_enabled?: boolean | null
          hipaa_compliant?: boolean | null
          id?: string
          index_status?: string | null
          is_public?: boolean | null
          knowledge_domains?: string[] | null
          last_indexed_at?: string | null
          name?: string
          performance_metrics?: Json | null
          purpose_description?: string
          quality_score?: number | null
          rag_type?: string | null
          similarity_threshold?: number | null
          status?: string | null
          total_chunks?: number | null
          updated_at?: string | null
          vector_store_config?: Json | null
          version?: string | null
        }
        Relationships: []
      }
      rag_knowledge_chunks: {
        Row: {
          chunk_index: number
          clinical_context: Json | null
          content: string
          content_type: string | null
          created_at: string | null
          embedding: string | null
          id: string
          medical_context: Json | null
          page_number: number | null
          quality_score: number | null
          regulatory_context: Json | null
          section_title: string | null
          semantic_density: number | null
          source_id: string | null
          word_count: number | null
        }
        Insert: {
          chunk_index: number
          clinical_context?: Json | null
          content: string
          content_type?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          medical_context?: Json | null
          page_number?: number | null
          quality_score?: number | null
          regulatory_context?: Json | null
          section_title?: string | null
          semantic_density?: number | null
          source_id?: string | null
          word_count?: number | null
        }
        Update: {
          chunk_index?: number
          clinical_context?: Json | null
          content?: string
          content_type?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          medical_context?: Json | null
          page_number?: number | null
          quality_score?: number | null
          regulatory_context?: Json | null
          section_title?: string | null
          semantic_density?: number | null
          source_id?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rag_knowledge_chunks_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "rag_knowledge_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_knowledge_sources: {
        Row: {
          access_count: number | null
          confidence_score: number | null
          content_hash: string | null
          created_at: string | null
          description: string | null
          domain: Database["public"]["Enums"]["knowledge_domain"] | null
          file_path: string | null
          file_size: number | null
          id: string
          last_accessed: string | null
          medical_specialty: string | null
          metadata: Json | null
          mime_type: string | null
          name: string
          prism_suite: Database["public"]["Enums"]["prism_suite"] | null
          processed_at: string | null
          processing_status:
            | Database["public"]["Enums"]["processing_status"]
            | null
          quality_score: number | null
          source_type: string | null
          tags: string[] | null
          tenant_id: string | null
          therapeutic_area: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          access_count?: number | null
          confidence_score?: number | null
          content_hash?: string | null
          created_at?: string | null
          description?: string | null
          domain?: Database["public"]["Enums"]["knowledge_domain"] | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          last_accessed?: string | null
          medical_specialty?: string | null
          metadata?: Json | null
          mime_type?: string | null
          name: string
          prism_suite?: Database["public"]["Enums"]["prism_suite"] | null
          processed_at?: string | null
          processing_status?:
            | Database["public"]["Enums"]["processing_status"]
            | null
          quality_score?: number | null
          source_type?: string | null
          tags?: string[] | null
          tenant_id?: string | null
          therapeutic_area?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          access_count?: number | null
          confidence_score?: number | null
          content_hash?: string | null
          created_at?: string | null
          description?: string | null
          domain?: Database["public"]["Enums"]["knowledge_domain"] | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          last_accessed?: string | null
          medical_specialty?: string | null
          metadata?: Json | null
          mime_type?: string | null
          name?: string
          prism_suite?: Database["public"]["Enums"]["prism_suite"] | null
          processed_at?: string | null
          processing_status?:
            | Database["public"]["Enums"]["processing_status"]
            | null
          quality_score?: number | null
          source_type?: string | null
          tags?: string[] | null
          tenant_id?: string | null
          therapeutic_area?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rag_knowledge_sources_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "rag_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_search_analytics: {
        Row: {
          avg_similarity_score: number | null
          created_at: string | null
          id: string
          query_domain: Database["public"]["Enums"]["knowledge_domain"] | null
          query_embedding: string | null
          query_text: string
          results_count: number | null
          search_time_ms: number | null
          session_id: string | null
          tenant_id: string | null
          top_similarity_score: number | null
          total_chunks_searched: number | null
          user_id: string | null
        }
        Insert: {
          avg_similarity_score?: number | null
          created_at?: string | null
          id?: string
          query_domain?: Database["public"]["Enums"]["knowledge_domain"] | null
          query_embedding?: string | null
          query_text: string
          results_count?: number | null
          search_time_ms?: number | null
          session_id?: string | null
          tenant_id?: string | null
          top_similarity_score?: number | null
          total_chunks_searched?: number | null
          user_id?: string | null
        }
        Update: {
          avg_similarity_score?: number | null
          created_at?: string | null
          id?: string
          query_domain?: Database["public"]["Enums"]["knowledge_domain"] | null
          query_embedding?: string | null
          query_text?: string
          results_count?: number | null
          search_time_ms?: number | null
          session_id?: string | null
          tenant_id?: string | null
          top_similarity_score?: number | null
          total_chunks_searched?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rag_search_analytics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "rag_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_tenants: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          name: string
          settings: Json | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: string
          name: string
          settings?: Json | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          name?: string
          settings?: Json | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rag_usage_analytics: {
        Row: {
          agent_id: string | null
          avg_relevance_score: number | null
          cache_hit: boolean | null
          conversation_id: string | null
          cost_estimate: number | null
          created_at: string | null
          id: string
          query_embedding_model: string | null
          query_intent: string | null
          query_text: string
          query_timestamp: string | null
          rag_id: string
          relevance_confirmed: boolean | null
          response_time_ms: number | null
          results_count: number | null
          tokens_used: number | null
          top_relevance_score: number | null
          user_feedback: string | null
          user_id: string | null
          user_rating: number | null
        }
        Insert: {
          agent_id?: string | null
          avg_relevance_score?: number | null
          cache_hit?: boolean | null
          conversation_id?: string | null
          cost_estimate?: number | null
          created_at?: string | null
          id?: string
          query_embedding_model?: string | null
          query_intent?: string | null
          query_text: string
          query_timestamp?: string | null
          rag_id: string
          relevance_confirmed?: boolean | null
          response_time_ms?: number | null
          results_count?: number | null
          tokens_used?: number | null
          top_relevance_score?: number | null
          user_feedback?: string | null
          user_id?: string | null
          user_rating?: number | null
        }
        Update: {
          agent_id?: string | null
          avg_relevance_score?: number | null
          cache_hit?: boolean | null
          conversation_id?: string | null
          cost_estimate?: number | null
          created_at?: string | null
          id?: string
          query_embedding_model?: string | null
          query_intent?: string | null
          query_text?: string
          query_timestamp?: string | null
          rag_id?: string
          relevance_confirmed?: boolean | null
          response_time_ms?: number | null
          results_count?: number | null
          tokens_used?: number | null
          top_relevance_score?: number | null
          user_feedback?: string | null
          user_id?: string | null
          user_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rag_usage_analytics_rag_id_fkey"
            columns: ["rag_id"]
            isOneToOne: false
            referencedRelation: "rag_knowledge_bases"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_config: {
        Row: {
          burst_limit: number | null
          created_at: string | null
          created_by: string | null
          endpoint_pattern: string | null
          entity_id: string | null
          entity_type: string
          id: string
          is_active: boolean | null
          requests_per_day: number | null
          requests_per_hour: number | null
          requests_per_minute: number | null
          updated_at: string | null
        }
        Insert: {
          burst_limit?: number | null
          created_at?: string | null
          created_by?: string | null
          endpoint_pattern?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          is_active?: boolean | null
          requests_per_day?: number | null
          requests_per_hour?: number | null
          requests_per_minute?: number | null
          updated_at?: string | null
        }
        Update: {
          burst_limit?: number | null
          created_at?: string | null
          created_by?: string | null
          endpoint_pattern?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          is_active?: boolean | null
          requests_per_day?: number | null
          requests_per_hour?: number | null
          requests_per_minute?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_limit_config_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_org_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_limit_config_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_sharing_audit: {
        Row: {
          action: string
          affected_tenant_id: string | null
          created_at: string
          id: string
          ip_address: unknown
          new_shared_with: string[] | null
          new_sharing_mode: string | null
          owner_tenant_id: string
          performed_by_user_id: string | null
          previous_shared_with: string[] | null
          previous_sharing_mode: string | null
          resource_id: string
          resource_name: string | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          affected_tenant_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          new_shared_with?: string[] | null
          new_sharing_mode?: string | null
          owner_tenant_id: string
          performed_by_user_id?: string | null
          previous_shared_with?: string[] | null
          previous_sharing_mode?: string | null
          resource_id: string
          resource_name?: string | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          affected_tenant_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          new_shared_with?: string[] | null
          new_sharing_mode?: string | null
          owner_tenant_id?: string
          performed_by_user_id?: string | null
          previous_shared_with?: string[] | null
          previous_sharing_mode?: string | null
          resource_id?: string
          resource_name?: string | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_sharing_audit_owner_tenant_id_fkey"
            columns: ["owner_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      responsibilities: {
        Row: {
          category: string | null
          complexity_level: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          mapped_to_use_cases: string[] | null
          metadata: Json | null
          name: string
          priority: number | null
          search_vector: unknown
          unique_id: string
          updated_at: string | null
          use_case_ids: string[] | null
        }
        Insert: {
          category?: string | null
          complexity_level?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          mapped_to_use_cases?: string[] | null
          metadata?: Json | null
          name: string
          priority?: number | null
          search_vector?: unknown
          unique_id: string
          updated_at?: string | null
          use_case_ids?: string[] | null
        }
        Update: {
          category?: string | null
          complexity_level?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          mapped_to_use_cases?: string[] | null
          metadata?: Json | null
          name?: string
          priority?: number | null
          search_vector?: unknown
          unique_id?: string
          updated_at?: string | null
          use_case_ids?: string[] | null
        }
        Relationships: []
      }
      retention_actions: {
        Row: {
          action: string
          created_at: string | null
          data_id: string
          id: string
          metadata: Json | null
          policy_id: string
          timestamp: string
        }
        Insert: {
          action: string
          created_at?: string | null
          data_id: string
          id?: string
          metadata?: Json | null
          policy_id: string
          timestamp: string
        }
        Update: {
          action?: string
          created_at?: string | null
          data_id?: string
          id?: string
          metadata?: Json | null
          policy_id?: string
          timestamp?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          action: Database["public"]["Enums"]["permission_action"]
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          scope: Database["public"]["Enums"]["permission_scope"]
        }
        Insert: {
          action: Database["public"]["Enums"]["permission_action"]
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          scope: Database["public"]["Enums"]["permission_scope"]
        }
        Update: {
          action?: Database["public"]["Enums"]["permission_action"]
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          scope?: Database["public"]["Enums"]["permission_scope"]
        }
        Relationships: []
      }
      role_responsibilities: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          responsibility_id: string
          role_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          responsibility_id: string
          role_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          responsibility_id?: string
          role_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "role_responsibilities_responsibility_id_fkey"
            columns: ["responsibility_id"]
            isOneToOne: false
            referencedRelation: "responsibilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_responsibilities_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          department_id: string | null
          department_name: string | null
          description: string | null
          function_area: string | null
          function_id: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          migration_ready: boolean | null
          reports_to_role_id: string | null
          required_certifications: string[] | null
          required_skills: string[] | null
          role_name: string
          role_title: string | null
          search_vector: unknown
          seniority_level: string | null
          unique_id: string
          updated_at: string | null
          updated_by: string | null
          years_experience_max: number | null
          years_experience_min: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          department_name?: string | null
          description?: string | null
          function_area?: string | null
          function_id?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          migration_ready?: boolean | null
          reports_to_role_id?: string | null
          required_certifications?: string[] | null
          required_skills?: string[] | null
          role_name: string
          role_title?: string | null
          search_vector?: unknown
          seniority_level?: string | null
          unique_id: string
          updated_at?: string | null
          updated_by?: string | null
          years_experience_max?: number | null
          years_experience_min?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          department_name?: string | null
          description?: string | null
          function_area?: string | null
          function_id?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          migration_ready?: boolean | null
          reports_to_role_id?: string | null
          required_certifications?: string[] | null
          required_skills?: string[] | null
          role_name?: string
          role_title?: string | null
          search_vector?: unknown
          seniority_level?: string | null
          unique_id?: string
          updated_at?: string | null
          updated_by?: string | null
          years_experience_max?: number | null
          years_experience_min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "functions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_reports_to_role_id_fkey"
            columns: ["reports_to_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_memories: {
        Row: {
          accessed_count: number | null
          content: string
          content_embedding: string | null
          created_at: string
          deleted_at: string | null
          id: string
          importance: number
          last_accessed_at: string | null
          memory_type: string
          metadata: Json | null
          session_id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          accessed_count?: number | null
          content: string
          content_embedding?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          importance?: number
          last_accessed_at?: string | null
          memory_type: string
          metadata?: Json | null
          session_id: string
          tenant_id: string
          user_id: string
        }
        Update: {
          accessed_count?: number | null
          content?: string
          content_embedding?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          importance?: number
          last_accessed_at?: string | null
          memory_type?: string
          metadata?: Json | null
          session_id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_memories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      signal_tags: {
        Row: {
          assigned_by: string | null
          assigned_date: string | null
          relevance_score: number | null
          signal_id: string
          tag_id: string
        }
        Insert: {
          assigned_by?: string | null
          assigned_date?: string | null
          relevance_score?: number | null
          signal_id: string
          tag_id: string
        }
        Update: {
          assigned_by?: string | null
          assigned_date?: string | null
          relevance_score?: number | null
          signal_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signal_tags_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["signal_id"]
          },
          {
            foreignKeyName: "signal_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["tag_id"]
          },
        ]
      }
      signals: {
        Row: {
          acceleration: string | null
          action_required: string | null
          belief_id: string | null
          confidence: string | null
          created_at: string | null
          description: string | null
          first_detected: string | null
          is_critical: boolean | null
          last_updated: string | null
          signal_id: string
          signal_name: string | null
          strategic_impact: string | null
          trend_direction: string | null
          updated_at: string | null
        }
        Insert: {
          acceleration?: string | null
          action_required?: string | null
          belief_id?: string | null
          confidence?: string | null
          created_at?: string | null
          description?: string | null
          first_detected?: string | null
          is_critical?: boolean | null
          last_updated?: string | null
          signal_id: string
          signal_name?: string | null
          strategic_impact?: string | null
          trend_direction?: string | null
          updated_at?: string | null
        }
        Update: {
          acceleration?: string | null
          action_required?: string | null
          belief_id?: string | null
          confidence?: string | null
          created_at?: string | null
          description?: string | null
          first_detected?: string | null
          is_critical?: boolean | null
          last_updated?: string | null
          signal_id?: string
          signal_name?: string | null
          strategic_impact?: string | null
          trend_direction?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signals_belief_id_fkey"
            columns: ["belief_id"]
            isOneToOne: false
            referencedRelation: "beliefs"
            referencedColumns: ["belief_id"]
          },
        ]
      }
      sources: {
        Row: {
          access_date: string | null
          created_at: string | null
          credibility_score: number | null
          geographic_focus: string | null
          reliability_notes: string | null
          source_id: string
          source_name: string
          source_type: string | null
          subscription_required: string | null
          update_frequency: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          access_date?: string | null
          created_at?: string | null
          credibility_score?: number | null
          geographic_focus?: string | null
          reliability_notes?: string | null
          source_id: string
          source_name: string
          source_type?: string | null
          subscription_required?: string | null
          update_frequency?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          access_date?: string | null
          created_at?: string | null
          credibility_score?: number | null
          geographic_focus?: string | null
          reliability_notes?: string | null
          source_id?: string
          source_name?: string
          source_type?: string | null
          subscription_required?: string | null
          update_frequency?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      strategic_priorities: {
        Row: {
          code: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          color_code: string | null
          created_at: string | null
          description: string | null
          priority_level: string | null
          tag_category: string | null
          tag_id: string
          tag_name: string
          updated_at: string | null
        }
        Insert: {
          color_code?: string | null
          created_at?: string | null
          description?: string | null
          priority_level?: string | null
          tag_category?: string | null
          tag_id: string
          tag_name: string
          updated_at?: string | null
        }
        Update: {
          color_code?: string | null
          created_at?: string | null
          description?: string | null
          priority_level?: string | null
          tag_category?: string | null
          tag_id?: string
          tag_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      task_category_ai_tools: {
        Row: {
          category: string
          created_at: string
          id: string
          is_recommended: boolean | null
          is_required: boolean | null
          priority: number | null
          task_objective_pattern: string | null
          task_type: string | null
          tool_id: string
          updated_at: string
          usage_notes: string | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_recommended?: boolean | null
          is_required?: boolean | null
          priority?: number | null
          task_objective_pattern?: string | null
          task_type?: string | null
          tool_id: string
          updated_at?: string
          usage_notes?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_recommended?: boolean | null
          is_required?: boolean | null
          priority?: number | null
          task_objective_pattern?: string | null
          task_type?: string | null
          tool_id?: string
          updated_at?: string
          usage_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_category_ai_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tool_analytics"
            referencedColumns: ["tool_id"]
          },
          {
            foreignKeyName: "task_category_ai_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools_legacy"
            referencedColumns: ["tool_id"]
          },
        ]
      }
      tenants: {
        Row: {
          activated_at: string | null
          archived_at: string | null
          billing_email: string | null
          branding: Json | null
          company_size: string | null
          config: Json | null
          country_code: string | null
          created_at: string
          created_by: string | null
          data_residency: string | null
          deleted_at: string | null
          domain: string | null
          encryption_enabled: boolean | null
          features: Json | null
          gdpr_compliant: boolean | null
          hipaa_compliant: boolean | null
          id: string
          industry: string | null
          metadata: Json | null
          name: string
          parent_tenant_id: string | null
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          quotas: Json | null
          resource_access_config: Json | null
          slug: string
          sox_compliant: boolean | null
          status: string | null
          subscription_ends_at: string | null
          subscription_starts_at: string | null
          subscription_status: string | null
          subscription_tier: string | null
          suspended_at: string | null
          timezone: string | null
          trial_ends_at: string | null
          type: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          activated_at?: string | null
          archived_at?: string | null
          billing_email?: string | null
          branding?: Json | null
          company_size?: string | null
          config?: Json | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          data_residency?: string | null
          deleted_at?: string | null
          domain?: string | null
          encryption_enabled?: boolean | null
          features?: Json | null
          gdpr_compliant?: boolean | null
          hipaa_compliant?: boolean | null
          id?: string
          industry?: string | null
          metadata?: Json | null
          name: string
          parent_tenant_id?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          quotas?: Json | null
          resource_access_config?: Json | null
          slug: string
          sox_compliant?: boolean | null
          status?: string | null
          subscription_ends_at?: string | null
          subscription_starts_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          suspended_at?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          type: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          activated_at?: string | null
          archived_at?: string | null
          billing_email?: string | null
          branding?: Json | null
          company_size?: string | null
          config?: Json | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          data_residency?: string | null
          deleted_at?: string | null
          domain?: string | null
          encryption_enabled?: boolean | null
          features?: Json | null
          gdpr_compliant?: boolean | null
          hipaa_compliant?: boolean | null
          id?: string
          industry?: string | null
          metadata?: Json | null
          name?: string
          parent_tenant_id?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          quotas?: Json | null
          resource_access_config?: Json | null
          slug?: string
          sox_compliant?: boolean | null
          status?: string | null
          subscription_ends_at?: string | null
          subscription_starts_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          suspended_at?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          type?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_parent_tenant_id_fkey"
            columns: ["parent_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      threat_events: {
        Row: {
          created_at: string | null
          details: Json | null
          endpoint: string | null
          false_positive: boolean | null
          id: string
          ip_address: unknown
          organization_id: string | null
          resolution_notes: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          timestamp: string
          type: string
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          endpoint?: string | null
          false_positive?: boolean | null
          id: string
          ip_address: unknown
          organization_id?: string | null
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          timestamp: string
          type: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          endpoint?: string | null
          false_positive?: boolean | null
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          timestamp?: string
          type?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "threat_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threat_events_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "user_org_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threat_events_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threat_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_org_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threat_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tool_executions: {
        Row: {
          agent_id: string | null
          agent_tool_id: string | null
          api_calls_made: number | null
          completed_at: string | null
          conversation_id: string | null
          cost_usd: number | null
          created_at: string
          error_message: string | null
          error_traceback: string | null
          execution_id: string
          execution_time_ms: number | null
          input_params: Json
          iteration_number: number | null
          metadata: Json | null
          node_name: string | null
          output_result: Json | null
          session_id: string | null
          started_at: string
          status: string
          tenant_id: string
          tokens_used: number | null
          tool_id: string
          user_id: string | null
          workflow_run_id: string | null
        }
        Insert: {
          agent_id?: string | null
          agent_tool_id?: string | null
          api_calls_made?: number | null
          completed_at?: string | null
          conversation_id?: string | null
          cost_usd?: number | null
          created_at?: string
          error_message?: string | null
          error_traceback?: string | null
          execution_id?: string
          execution_time_ms?: number | null
          input_params: Json
          iteration_number?: number | null
          metadata?: Json | null
          node_name?: string | null
          output_result?: Json | null
          session_id?: string | null
          started_at?: string
          status: string
          tenant_id: string
          tokens_used?: number | null
          tool_id: string
          user_id?: string | null
          workflow_run_id?: string | null
        }
        Update: {
          agent_id?: string | null
          agent_tool_id?: string | null
          api_calls_made?: number | null
          completed_at?: string | null
          conversation_id?: string | null
          cost_usd?: number | null
          created_at?: string
          error_message?: string | null
          error_traceback?: string | null
          execution_id?: string
          execution_time_ms?: number | null
          input_params?: Json
          iteration_number?: number | null
          metadata?: Json | null
          node_name?: string | null
          output_result?: Json | null
          session_id?: string | null
          started_at?: string
          status?: string
          tenant_id?: string
          tokens_used?: number | null
          tool_id?: string
          user_id?: string | null
          workflow_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_executions_agent_tool_id_fkey"
            columns: ["agent_tool_id"]
            isOneToOne: false
            referencedRelation: "agent_tools"
            referencedColumns: ["agent_tool_id"]
          },
          {
            foreignKeyName: "tool_executions_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tool_analytics"
            referencedColumns: ["tool_id"]
          },
          {
            foreignKeyName: "tool_executions_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools_legacy"
            referencedColumns: ["tool_id"]
          },
        ]
      }
      tool_tag_assignments: {
        Row: {
          created_at: string | null
          tag_id: string
          tool_id: string
        }
        Insert: {
          created_at?: string | null
          tag_id: string
          tool_id: string
        }
        Update: {
          created_at?: string | null
          tag_id?: string
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tool_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      tool_usage_logs: {
        Row: {
          agent_id: string | null
          conversation_id: string | null
          cost: number | null
          created_at: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          input: Json | null
          output: Json | null
          query_context: string | null
          relevance_score: number | null
          success: boolean | null
          tokens_used: number | null
          tool_id: string | null
          user_feedback: number | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          conversation_id?: string | null
          cost?: number | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input?: Json | null
          output?: Json | null
          query_context?: string | null
          relevance_score?: number | null
          success?: boolean | null
          tokens_used?: number | null
          tool_id?: string | null
          user_feedback?: number | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          conversation_id?: string | null
          cost?: number | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input?: Json | null
          output?: Json | null
          query_context?: string | null
          relevance_score?: number | null
          success?: boolean | null
          tokens_used?: number | null
          tool_id?: string | null
          user_feedback?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      tools_legacy: {
        Row: {
          access_level: string
          allowed_roles: string[] | null
          allowed_tenants: string[] | null
          category: string
          cost_per_execution: number | null
          created_at: string
          created_by: string | null
          default_config: Json
          deprecated_by: string | null
          deprecation_date: string | null
          documentation_url: string | null
          example_usage: Json | null
          function_name: string | null
          implementation_path: string
          implementation_type: string
          input_schema: Json
          is_async: boolean
          langgraph_compatible: boolean
          langgraph_node_name: string | null
          max_execution_time_seconds: number | null
          metadata: Json
          output_schema: Json
          rate_limit_per_minute: number | null
          required_env_vars: string[] | null
          retry_config: Json | null
          status: string
          subcategory: string | null
          supports_streaming: boolean | null
          tags: string[] | null
          tool_code: string
          tool_description: string
          tool_id: string
          tool_name: string
          updated_at: string
          updated_by: string | null
          version: string
        }
        Insert: {
          access_level?: string
          allowed_roles?: string[] | null
          allowed_tenants?: string[] | null
          category: string
          cost_per_execution?: number | null
          created_at?: string
          created_by?: string | null
          default_config?: Json
          deprecated_by?: string | null
          deprecation_date?: string | null
          documentation_url?: string | null
          example_usage?: Json | null
          function_name?: string | null
          implementation_path: string
          implementation_type: string
          input_schema?: Json
          is_async?: boolean
          langgraph_compatible?: boolean
          langgraph_node_name?: string | null
          max_execution_time_seconds?: number | null
          metadata?: Json
          output_schema?: Json
          rate_limit_per_minute?: number | null
          required_env_vars?: string[] | null
          retry_config?: Json | null
          status?: string
          subcategory?: string | null
          supports_streaming?: boolean | null
          tags?: string[] | null
          tool_code: string
          tool_description: string
          tool_id?: string
          tool_name: string
          updated_at?: string
          updated_by?: string | null
          version?: string
        }
        Update: {
          access_level?: string
          allowed_roles?: string[] | null
          allowed_tenants?: string[] | null
          category?: string
          cost_per_execution?: number | null
          created_at?: string
          created_by?: string | null
          default_config?: Json
          deprecated_by?: string | null
          deprecation_date?: string | null
          documentation_url?: string | null
          example_usage?: Json | null
          function_name?: string | null
          implementation_path?: string
          implementation_type?: string
          input_schema?: Json
          is_async?: boolean
          langgraph_compatible?: boolean
          langgraph_node_name?: string | null
          max_execution_time_seconds?: number | null
          metadata?: Json
          output_schema?: Json
          rate_limit_per_minute?: number | null
          required_env_vars?: string[] | null
          retry_config?: Json | null
          status?: string
          subcategory?: string | null
          supports_streaming?: boolean | null
          tags?: string[] | null
          tool_code?: string
          tool_description?: string
          tool_id?: string
          tool_name?: string
          updated_at?: string
          updated_by?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "tools_deprecated_by_fkey"
            columns: ["deprecated_by"]
            isOneToOne: false
            referencedRelation: "tool_analytics"
            referencedColumns: ["tool_id"]
          },
          {
            foreignKeyName: "tools_deprecated_by_fkey"
            columns: ["deprecated_by"]
            isOneToOne: false
            referencedRelation: "tools_legacy"
            referencedColumns: ["tool_id"]
          },
        ]
      }
      traces: {
        Row: {
          created_at: string | null
          duration_ms: number | null
          end_time: string | null
          id: string
          logs: Json | null
          operation: string
          parent_span_id: string | null
          service: string
          span_id: string
          start_time: string
          status: string
          tags: Json | null
          trace_id: string
        }
        Insert: {
          created_at?: string | null
          duration_ms?: number | null
          end_time?: string | null
          id?: string
          logs?: Json | null
          operation: string
          parent_span_id?: string | null
          service: string
          span_id: string
          start_time: string
          status: string
          tags?: Json | null
          trace_id: string
        }
        Update: {
          created_at?: string | null
          duration_ms?: number | null
          end_time?: string | null
          id?: string
          logs?: Json | null
          operation?: string
          parent_span_id?: string | null
          service?: string
          span_id?: string
          start_time?: string
          status?: string
          tags?: Json | null
          trace_id?: string
        }
        Relationships: []
      }
      usage_quotas: {
        Row: {
          alert_threshold_percent: number | null
          created_at: string | null
          created_by: string | null
          current_usage: number | null
          entity_id: string | null
          entity_type: string
          grace_requests: number | null
          hard_limit: boolean | null
          id: string
          is_active: boolean | null
          last_reset: string | null
          next_reset: string | null
          period_end: string | null
          period_start: string | null
          quota_limit: number
          quota_period: string
          quota_type: string
          updated_at: string | null
        }
        Insert: {
          alert_threshold_percent?: number | null
          created_at?: string | null
          created_by?: string | null
          current_usage?: number | null
          entity_id?: string | null
          entity_type: string
          grace_requests?: number | null
          hard_limit?: boolean | null
          id?: string
          is_active?: boolean | null
          last_reset?: string | null
          next_reset?: string | null
          period_end?: string | null
          period_start?: string | null
          quota_limit: number
          quota_period: string
          quota_type: string
          updated_at?: string | null
        }
        Update: {
          alert_threshold_percent?: number | null
          created_at?: string | null
          created_by?: string | null
          current_usage?: number | null
          entity_id?: string | null
          entity_type?: string
          grace_requests?: number | null
          hard_limit?: boolean | null
          id?: string
          is_active?: boolean | null
          last_reset?: string | null
          next_reset?: string | null
          period_end?: string | null
          period_start?: string | null
          quota_limit?: number
          quota_period?: string
          quota_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          agent_id: string | null
          cost: number | null
          created_at: string | null
          id: string
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          cost?: number | null
          created_at?: string | null
          id?: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          cost?: number | null
          created_at?: string | null
          id?: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_full_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_tracking_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_agents: {
        Row: {
          agent_id: string
          created_at: string
          is_user_copy: boolean | null
          original_agent_id: string | null
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          is_user_copy?: boolean | null
          original_agent_id?: string | null
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          is_user_copy?: boolean | null
          original_agent_id?: string | null
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_agents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_full_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_agents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_facts: {
        Row: {
          category: string
          confidence: number
          created_at: string | null
          fact: string
          id: string
          source: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          confidence: number
          created_at?: string | null
          fact: string
          id?: string
          source: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          confidence?: number
          created_at?: string | null
          fact?: string
          id?: string
          source?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_long_term_memory: {
        Row: {
          created_at: string | null
          id: string
          memory_data: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          memory_data: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          memory_data?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_memory: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          embedding: string | null
          expires_at: string | null
          id: string
          key: string
          last_accessed_at: string | null
          memory_type: string
          metadata: Json | null
          source: string | null
          tenant_id: string
          updated_at: string | null
          user_id: string
          value: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          embedding?: string | null
          expires_at?: string | null
          id?: string
          key: string
          last_accessed_at?: string | null
          memory_type: string
          metadata?: Json | null
          source?: string | null
          tenant_id: string
          updated_at?: string | null
          user_id: string
          value: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          embedding?: string | null
          expires_at?: string | null
          id?: string
          key?: string
          last_accessed_at?: string | null
          memory_type?: string
          metadata?: Json | null
          source?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_memory_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_organizations: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          permissions: Json | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          permissions?: Json | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          permissions?: Json | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string | null
          department: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          job_title: string | null
          last_login: string | null
          organization_id: string | null
          preferences: Json | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          job_title?: string | null
          last_login?: string | null
          organization_id?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          last_login?: string | null
          organization_id?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: string
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: string
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: string
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tenants: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          invited_at: string | null
          joined_at: string | null
          role: string | null
          status: string | null
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          invited_at?: string | null
          joined_at?: string | null
          role?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          invited_at?: string | null
          joined_at?: string | null
          role?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tenants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vital_milestones: {
        Row: {
          assigned_to: string | null
          completed_date: string | null
          created_at: string
          created_by: string | null
          deliverables: Json | null
          dependencies: string[] | null
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          phase: string
          priority: string | null
          project_id: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          deliverables?: Json | null
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          phase: string
          priority?: string | null
          project_id?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          deliverables?: Json | null
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          phase?: string
          priority?: string | null
          project_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vital_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string | null
          created_by: string | null
          definition: Json
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          organization_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          definition: Json
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          organization_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          definition?: Json
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          organization_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      agent_full_context: {
        Row: {
          agent_category: string | null
          agent_type: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string | null
          industries: string[] | null
          industry_count: number | null
          is_active: boolean | null
          is_featured: boolean | null
          is_public: boolean | null
          name: string | null
          persona_count: number | null
          specialization: string | null
          supported_personas: string[] | null
          updated_at: string | null
        }
        Relationships: []
      }
      agent_metrics_daily: {
        Row: {
          agent_id: string | null
          average_confidence_score: number | null
          average_latency_ms: number | null
          average_satisfaction_score: number | null
          date: string | null
          failed_operations: number | null
          first_operation_at: string | null
          graphrag_fallbacks: number | null
          graphrag_hits: number | null
          last_operation_at: string | null
          p95_latency_ms: number | null
          successful_operations: number | null
          tenant_id: string | null
          total_cost_usd: number | null
          total_operations: number | null
          total_tokens_input: number | null
          total_tokens_output: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_metrics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_full_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_metrics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_prompts_full: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          agent_prompt_id: string | null
          avg_effectiveness_score: number | null
          is_active: boolean | null
          is_default: boolean | null
          last_used_at: string | null
          priority: number | null
          prompt_id: string | null
          prompt_name: string | null
          prompt_pattern: string | null
          prompt_role: string | null
          system_prompt: string | null
          tenant_id: string | null
          times_used: number | null
          usage_context: Json | null
          user_template: string | null
          variable_bindings: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_prompts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_full_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_prompts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_prompts_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompt_full_context"
            referencedColumns: ["prompt_id"]
          },
          {
            foreignKeyName: "agent_prompts_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_prompts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_performance_summary: {
        Row: {
          analytics_duration: number | null
          avg_confidence_score: number | null
          avg_cost_per_message: number | null
          avg_messages_per_round: number | null
          citation_count: number | null
          completed_at: string | null
          consensus_improvement: number | null
          consensus_velocity: number | null
          created_at: string | null
          duration_seconds: number | null
          evidence_strength: string | null
          final_consensus: number | null
          has_recommendation: boolean | null
          initial_consensus_level: number | null
          message_count: number | null
          panel_id: string | null
          panel_type_code: string | null
          participant_count: number | null
          recommendation_confidence: number | null
          rounds_to_consensus: number | null
          status: string | null
          tenant_id: string | null
          title: string | null
          total_cost_usd: number | null
          total_rounds: number | null
        }
        Relationships: [
          {
            foreignKeyName: "panels_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_status_summary: {
        Row: {
          avg_consensus: number | null
          avg_rounds: number | null
          first_panel_date: string | null
          last_panel_date: string | null
          panel_count: number | null
          panel_type_code: string | null
          status: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "panels_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      persona_full_context: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string | null
          id: string | null
          industries: string[] | null
          industry_count: number | null
          is_active: boolean | null
          is_public: boolean | null
          name: string | null
          persona_type: string | null
          role_count: number | null
          roles: string[] | null
          seniority_level: string | null
          unique_id: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      persona_jtbd_summary: {
        Row: {
          critical_jtbds: number | null
          persona_id: string | null
          persona_name: string | null
          persona_unique_id: string | null
          primary_jtbds: number | null
          roles: string[] | null
          total_jtbds: number | null
        }
        Relationships: []
      }
      persona_strategic_summary: {
        Row: {
          persona_id: string | null
          persona_name: string | null
          persona_unique_id: string | null
          pillar_names: string[] | null
          strategic_pillar_count: number | null
          strategic_pillars: string[] | null
          total_jtbds: number | null
          total_pain_points: number | null
        }
        Relationships: []
      }
      prompt_full_context: {
        Row: {
          domain: string | null
          industries: string[] | null
          industry_count: number | null
          prompt_category: string | null
          prompt_id: string | null
          prompt_name: string | null
          task_codes: string[] | null
          workflow_count: number | null
          workflows: string[] | null
        }
        Relationships: []
      }
      tool_analytics: {
        Row: {
          avg_cost_usd: number | null
          avg_execution_time_ms: number | null
          category: string | null
          failed_executions: number | null
          last_used_at: string | null
          p95_execution_time_ms: number | null
          success_rate_percent: number | null
          successful_executions: number | null
          tool_code: string | null
          tool_id: string | null
          tool_name: string | null
          total_cost_usd: number | null
          total_executions: number | null
          unique_agents_using: number | null
          unique_tenants_using: number | null
        }
        Relationships: []
      }
      unified_skills: {
        Row: {
          entity_code: string | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string | null
          is_primary: boolean | null
          is_required: boolean | null
          proficiency_level: string | null
          skill_category: string | null
          skill_code: string | null
          skill_id: string | null
          skill_name: string | null
          tenant_id: string | null
        }
        Relationships: []
      }
      user_org_data: {
        Row: {
          email: string | null
          id: string | null
          is_active: boolean | null
          last_login_at: string | null
          org_name: string | null
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          user_created_at: string | null
          workflow_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_dh_personas_complete: {
        Row: {
          adoption_score: number | null
          ai_relationship: string | null
          behaviors: Json | null
          budget_authority: string | null
          created_at: string | null
          decision_authority: string | null
          decision_cycle: string | null
          department: string | null
          ease_score: number | null
          expertise_level: string | null
          function: string | null
          goals: Json | null
          id: string | null
          industry_name: string | null
          industry_unique_id: string | null
          is_active: boolean | null
          jtbd_count: number | null
          key_need: string | null
          name: string | null
          needs: Json | null
          network_score: number | null
          org_function: string | null
          org_size: string | null
          org_type: string | null
          organization: string | null
          pain_points: Json | null
          pain_score: number | null
          persona_code: string | null
          primary_role: string | null
          priority_score: number | null
          responsibilities: Json | null
          role_category: string | null
          role_unique_id: string | null
          sector: string | null
          strategic_score: number | null
          team_size: string | null
          tech_proficiency: string | null
          tier: number | null
          title: string | null
          unique_id: string | null
          updated_at: string | null
          value_score: number | null
        }
        Relationships: []
      }
      v_jtbd_by_frequency: {
        Row: {
          avg_importance: number | null
          avg_opportunity_score: number | null
          avg_satisfaction: number | null
          frequency_category: string | null
          high_priority_jtbds: Json | null
          jtbd_count: number | null
        }
        Relationships: []
      }
      v_jtbd_by_tier: {
        Row: {
          avg_importance: number | null
          avg_opportunity_score: number | null
          avg_satisfaction: number | null
          jtbd_count: number | null
          priority_tier: number | null
          tier_description: string | null
          unique_personas: number | null
        }
        Relationships: []
      }
      v_jtbd_complete: {
        Row: {
          created_at: string | null
          frequency: string | null
          frequency_category: string | null
          id: string | null
          importance: number | null
          industry_id: string | null
          industry_name: string | null
          is_active: boolean | null
          jtbd_code: string | null
          metrics_count: number | null
          opportunity_score: number | null
          org_function: string | null
          org_function_id: string | null
          original_id: string | null
          outcome_type: string | null
          persona_function: string | null
          persona_id: string | null
          persona_mapping_count: number | null
          persona_name: string | null
          persona_priority: number | null
          persona_sector: string | null
          persona_title: string | null
          priority_tier: number | null
          satisfaction: number | null
          sector: string | null
          solution_type: string | null
          source: string | null
          statement: string | null
          success_metrics: Json | null
          title: string | null
          unique_id: string | null
          updated_at: string | null
          use_case_category: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jtbd_library_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_library_org_function_id_fkey"
            columns: ["org_function_id"]
            isOneToOne: false
            referencedRelation: "org_functions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_library_org_function_id_fkey"
            columns: ["org_function_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["function_id"]
          },
          {
            foreignKeyName: "jtbd_library_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "dh_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_library_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "v_dh_personas_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      v_jtbd_high_priority: {
        Row: {
          frequency: string | null
          id: string | null
          importance: number | null
          industry_name: string | null
          jtbd_code: string | null
          opportunity_score: number | null
          org_function: string | null
          persona_name: string | null
          persona_sector: string | null
          persona_title: string | null
          priority_tier: number | null
          satisfaction: number | null
          statement: string | null
          success_metrics: Json | null
          title: string | null
          unique_id: string | null
        }
        Relationships: []
      }
      v_jtbd_org_hierarchy: {
        Row: {
          business_value: string | null
          category: string | null
          complexity: string | null
          description: string | null
          expected_benefit: string | null
          function_unique_id: string | null
          goal: string | null
          implementation_cost: string | null
          industry_code: string | null
          industry_name: string | null
          industry_unique_id: string | null
          is_active: boolean | null
          jtbd_code: string | null
          jtbd_id: string | null
          jtbd_title: string | null
          jtbd_unique_id: string | null
          keywords: string[] | null
          org_department: string | null
          org_function: string | null
          org_role: string | null
          persona_code: string | null
          persona_id: string | null
          persona_name: string | null
          relevance_score: number | null
          seniority_level: string | null
          success_rate: number | null
          tags: string[] | null
          time_to_value: string | null
          typical_frequency: string | null
          usage_count: number | null
          verb: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jtbd_org_persona_mapping_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "org_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jtbd_org_persona_mapping_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "v_persona_role_hierarchy"
            referencedColumns: ["persona_id"]
          },
          {
            foreignKeyName: "jtbd_org_persona_mapping_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "v_persona_usecases"
            referencedColumns: ["persona_id"]
          },
        ]
      }
      v_persona_role_hierarchy: {
        Row: {
          ai_relationship: string | null
          behaviors: Json | null
          capabilities: Json | null
          decision_authority: string | null
          department_id: string | null
          department_name: string | null
          department_unique_id: string | null
          expertise_level: string | null
          frustrations: Json | null
          function_id: string | null
          function_name: string | null
          function_unique_id: string | null
          goals: Json | null
          key_responsibilities: Json | null
          motivations: Json | null
          needs: Json | null
          pain_points: Json | null
          persona_code: string | null
          persona_department: string | null
          persona_id: string | null
          persona_name: string | null
          persona_unique_id: string | null
          preferred_channels: Json | null
          response_time_sla_hours: number | null
          role_id: string | null
          role_name: string | null
          role_unique_id: string | null
          seniority_level: string | null
          tech_proficiency: string | null
          typical_availability_hours: number | null
          typical_titles: Json | null
        }
        Relationships: []
      }
      v_persona_usecases: {
        Row: {
          ai_relationship: string | null
          decision_authority: string | null
          department_name: string | null
          function_name: string | null
          goals: Json | null
          match_reason: string | null
          needs: Json | null
          pain_points: Json | null
          persona_code: string | null
          persona_id: string | null
          persona_name: string | null
          phase: string | null
          relevance_score: number | null
          role_name: string | null
          tech_proficiency: string | null
          therapeutic_area: string | null
          usecase_code: string | null
          usecase_complexity: string | null
          usecase_id: string | null
          usecase_status: string | null
          usecase_summary: string | null
          usecase_title: string | null
          usecase_unique_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      aggregate_daily_metrics: { Args: never; Returns: undefined }
      assign_user_to_dh_startup: {
        Args: { p_role?: string; p_user_id: string }
        Returns: undefined
      }
      auto_assign_ai_tools_to_task: {
        Args: {
          p_category: string
          p_task_id: string
          p_task_type?: string
          p_tenant_id: string
        }
        Returns: number
      }
      calculate_jtbd_priority_tier: {
        Args: { opp_score: number }
        Returns: number
      }
      can_access_resource: {
        Args: {
          p_is_shared: boolean
          p_requesting_tenant_id: string
          p_resource_tenant_id: string
          p_shared_with: string[]
          p_sharing_mode: string
        }
        Returns: boolean
      }
      categorize_jtbd_frequency: { Args: { freq: string }; Returns: string }
      check_rate_limit: {
        Args: {
          p_endpoint_pattern?: string
          p_entity_id: string
          p_entity_type: string
          p_window_type?: string
        }
        Returns: boolean
      }
      check_user_permission: {
        Args: {
          required_action: Database["public"]["Enums"]["permission_action"]
          required_scope: Database["public"]["Enums"]["permission_scope"]
          user_email: string
        }
        Returns: boolean
      }
      cleanup_old_memories: {
        Args: { p_days?: number; p_tenant_id: string }
        Returns: number
      }
      clear_tenant_context: { Args: never; Returns: undefined }
      count_rls_policies: { Args: never; Returns: number }
      count_success_metrics: { Args: { metrics: Json }; Returns: number }
      dh_base64url_to_jsonb: { Args: { b64url: string }; Returns: Json }
      dh_ingest_workflow: {
        Args: { p_payload: Json; p_tenant_id: string }
        Returns: string
      }
      dh_ingest_workflow_by_slug: {
        Args: { p_payload: Json; p_tenant_slug: string }
        Returns: string
      }
      dh_resolve_agent_prompt_starter_unique_id: {
        Args: { p_tenant: string; p_unique_id: string }
        Returns: string
      }
      dh_resolve_agent_subsuite_unique_id: {
        Args: { p_tenant: string; p_unique_id: string }
        Returns: string
      }
      dh_resolve_agent_suite_unique_id: {
        Args: { p_tenant: string; p_unique_id: string }
        Returns: string
      }
      dh_resolve_agent_unique_id: {
        Args: { p_tenant: string; p_unique_id: string }
        Returns: string
      }
      dh_resolve_domain_unique_id: {
        Args: { p_tenant: string; p_unique_id: string }
        Returns: string
      }
      dh_resolve_kpi_unique_id: {
        Args: { p_tenant: string; p_unique_id: string }
        Returns: string
      }
      dh_resolve_prompt_agent_capability: {
        Args: {
          p_agent_unique_id: string
          p_prompt_unique_id: string
          p_tenant: string
        }
        Returns: string
      }
      dh_resolve_prompt_subsuite_unique_id: {
        Args: { p_tenant: string; p_unique_id: string }
        Returns: string
      }
      dh_resolve_prompt_suite_unique_id: {
        Args: { p_tenant: string; p_unique_id: string }
        Returns: string
      }
      dh_resolve_prompt_unique_id: {
        Args: { p_tenant: string; p_unique_id: string }
        Returns: string
      }
      dh_resolve_prompt_version_unique_id: {
        Args: { p_tenant: string; p_unique_id: string }
        Returns: string
      }
      dh_resolve_rag_unique_id: {
        Args: { p_tenant: string; p_unique_id: string }
        Returns: string
      }
      dh_resolve_skill_unique_id: {
        Args: { p_tenant: string; p_unique_id: string }
        Returns: string
      }
      dh_resolve_task_unique_id: {
        Args: { p_tenant: string; p_unique_id: string }
        Returns: string
      }
      dh_resolve_template_unique_id: {
        Args: { p_tenant: string; p_unique_id: string }
        Returns: string
      }
      dh_resolve_tool_unique_id: {
        Args: { p_tenant: string; p_unique_id: string }
        Returns: string
      }
      dh_resolve_use_case_unique_id: {
        Args: { p_tenant: string; p_unique_id: string }
        Returns: string
      }
      dh_resolve_workflow_unique_id: {
        Args: { p_tenant: string; p_unique_id: string }
        Returns: string
      }
      fn_get_task_agents: {
        Args: { p_task_id: string }
        Returns: {
          agent_code: string
          agent_name: string
          assignment_type: string
          execution_order: number
          requires_human_approval: boolean
        }[]
      }
      fn_get_task_personas: {
        Args: { p_task_id: string }
        Returns: {
          is_blocking: boolean
          persona_code: string
          persona_name: string
          responsibility: string
          review_timing: string
        }[]
      }
      fn_normalize_identifier: { Args: { p_text: string }; Returns: string }
      fn_resolve_agent: {
        Args: { p_identifier: string; p_tenant: string }
        Returns: string
      }
      fn_resolve_persona: {
        Args: { p_identifier: string; p_tenant: string }
        Returns: string
      }
      get_agent_assigned_rag: {
        Args: { agent_name_param: string }
        Returns: {
          custom_prompt_instructions: string
          description: string
          display_name: string
          document_count: number
          id: string
          is_primary: boolean
          last_used_at: string
          name: string
          priority: number
          purpose_description: string
          usage_context: string
        }[]
      }
      get_agent_panel_profile: { Args: { p_agent_id: string }; Returns: Json }
      get_agent_prompt_starters: {
        Args: { agent_name_param: string }
        Returns: {
          complexity_level: string
          description: string
          display_name: string
          domain: string
          id: string
          name: string
          prompt_starter: string
        }[]
      }
      get_agent_prompt_starters_by_domain: {
        Args: { agent_name_param: string }
        Returns: {
          complexity_level: string
          description: string
          display_name: string
          domain: string
          id: string
          name: string
          prompt_starter: string
        }[]
      }
      get_agent_prompts: {
        Args: {
          p_agent_id: string
          p_panel_type?: string
          p_prompt_role?: string
        }
        Returns: {
          priority: number
          prompt_id: string
          prompt_name: string
          prompt_pattern: string
          prompt_role: string
          system_prompt: string
          user_template: string
        }[]
      }
      get_agent_skills_full: {
        Args: { p_agent_id: string; p_panel_type?: string }
        Returns: {
          is_primary_skill: boolean
          proficiency_level: string
          proficiency_score: number
          prompts: Json
          rag_sources: Json
          skill_category: string
          skill_code: string
          skill_id: string
          skill_name: string
          tools: Json
        }[]
      }
      get_agent_stats: {
        Args: { agent_uuid: string }
        Returns: {
          avg_rating: number
          total_consultations: number
          total_messages: number
        }[]
      }
      get_agent_tools: {
        Args: { p_agent_id: string; p_context?: string }
        Returns: {
          category: string
          custom_config: Json
          input_schema: Json
          output_schema: Json
          priority: number
          tool_code: string
          tool_description: string
          tool_id: string
          tool_name: string
        }[]
      }
      get_ai_tools_for_task: {
        Args: { p_task_id: string }
        Returns: {
          category: string
          input_schema: Json
          is_recommended: boolean
          is_required: boolean
          output_schema: Json
          priority: number
          tool_code: string
          tool_description: string
          tool_id: string
          tool_name: string
          usage_notes: string
        }[]
      }
      get_available_rag_for_agent: {
        Args: { agent_name_param: string }
        Returns: {
          assignment_priority: number
          description: string
          display_name: string
          document_count: number
          id: string
          is_assigned: boolean
          knowledge_domains: string[]
          name: string
          purpose_description: string
          rag_type: string
        }[]
      }
      get_current_tenant_id: { Args: never; Returns: string }
      get_current_user_email: { Args: never; Returns: string }
      get_default_rag_tenant_id: { Args: never; Returns: string }
      get_department_roles: {
        Args: { dept_id: string }
        Returns: {
          headcount: number
          role_id: string
          role_name: string
          role_title: string
          seniority_level: string
        }[]
      }
      get_global_rag_databases: {
        Args: never
        Returns: {
          description: string
          display_name: string
          document_count: number
          id: string
          knowledge_domains: string[]
          last_indexed_at: string
          name: string
          purpose_description: string
          quality_score: number
          total_chunks: number
        }[]
      }
      get_least_used_avatar: {
        Args: { avatar_category?: string }
        Returns: string
      }
      get_organizational_hierarchy: {
        Args: never
        Returns: {
          department_id: string
          department_name: string
          function_id: string
          function_name: string
          role_id: string
          role_name: string
          seniority_level: string
        }[]
      }
      get_panel_complete: { Args: { p_panel_id: string }; Returns: Json }
      get_rate_limit_config: {
        Args: {
          p_endpoint_pattern?: string
          p_entity_id?: string
          p_entity_type: string
        }
        Returns: {
          burst_limit: number
          requests_per_day: number
          requests_per_hour: number
          requests_per_minute: number
        }[]
      }
      get_recent_memories: {
        Args: {
          p_days?: number
          p_limit?: number
          p_memory_types?: string[]
          p_tenant_id: string
          p_user_id: string
        }
        Returns: {
          content: string
          created_at: string
          id: string
          importance: number
          memory_type: string
          metadata: Json
          session_id: string
        }[]
      }
      get_recommended_ai_tools: {
        Args: { p_category: string; p_task_type?: string }
        Returns: {
          is_recommended: boolean
          is_required: boolean
          priority: number
          tool_code: string
          tool_id: string
          tool_name: string
          usage_notes: string
        }[]
      }
      get_role_responsibilities: {
        Args: { r_id: string }
        Returns: {
          description: string
          is_primary: boolean
          responsibility_id: string
          responsibility_name: string
          weight: number
        }[]
      }
      get_super_admin_tenant_id: { Args: never; Returns: string }
      get_tenant_by_domain: {
        Args: { p_domain: string }
        Returns: {
          activated_at: string | null
          archived_at: string | null
          billing_email: string | null
          branding: Json | null
          company_size: string | null
          config: Json | null
          country_code: string | null
          created_at: string
          created_by: string | null
          data_residency: string | null
          deleted_at: string | null
          domain: string | null
          encryption_enabled: boolean | null
          features: Json | null
          gdpr_compliant: boolean | null
          hipaa_compliant: boolean | null
          id: string
          industry: string | null
          metadata: Json | null
          name: string
          parent_tenant_id: string | null
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          quotas: Json | null
          resource_access_config: Json | null
          slug: string
          sox_compliant: boolean | null
          status: string | null
          subscription_ends_at: string | null
          subscription_starts_at: string | null
          subscription_status: string | null
          subscription_tier: string | null
          suspended_at: string | null
          timezone: string | null
          trial_ends_at: string | null
          type: string
          updated_at: string
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "tenants"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_tenant_by_slug: {
        Args: { p_slug: string }
        Returns: {
          activated_at: string | null
          archived_at: string | null
          billing_email: string | null
          branding: Json | null
          company_size: string | null
          config: Json | null
          country_code: string | null
          created_at: string
          created_by: string | null
          data_residency: string | null
          deleted_at: string | null
          domain: string | null
          encryption_enabled: boolean | null
          features: Json | null
          gdpr_compliant: boolean | null
          hipaa_compliant: boolean | null
          id: string
          industry: string | null
          metadata: Json | null
          name: string
          parent_tenant_id: string | null
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          quotas: Json | null
          resource_access_config: Json | null
          slug: string
          sox_compliant: boolean | null
          status: string | null
          subscription_ends_at: string | null
          subscription_starts_at: string | null
          subscription_status: string | null
          subscription_tier: string | null
          suspended_at: string | null
          timezone: string | null
          trial_ends_at: string | null
          type: string
          updated_at: string
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "tenants"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_tenant_context: { Args: never; Returns: string }
      get_user_organization_id: { Args: never; Returns: string }
      get_user_role: {
        Args: { user_email: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_tenant_ids: { Args: { p_user_id: string }; Returns: string[] }
      grant_platform_admin: { Args: { p_user_id: string }; Returns: undefined }
      has_panel_access: {
        Args: { panel_id: string; user_id?: string }
        Returns: boolean
      }
      has_tenant_access: {
        Args: { p_tenant_id: string; p_user_id: string }
        Returns: boolean
      }
      hybrid_search: {
        Args: {
          filter_domain?: string
          match_count?: number
          query_embedding: string
          query_text: string
        }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      hybrid_search_rag_knowledge: {
        Args: {
          filter_domain?: Database["public"]["Enums"]["knowledge_domain"]
          filter_prism_suite?: Database["public"]["Enums"]["prism_suite"]
          filter_tenant_id?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
          query_text: string
          text_weight?: number
          vector_weight?: number
        }
        Returns: {
          chunk_id: string
          clinical_context: Json
          content: string
          domain: Database["public"]["Enums"]["knowledge_domain"]
          medical_context: Json
          prism_suite: Database["public"]["Enums"]["prism_suite"]
          regulatory_context: Json
          section_title: string
          similarity: number
          source_id: string
          source_name: string
        }[]
      }
      increment_agent_popularity: {
        Args: { agent_uuid: string }
        Returns: undefined
      }
      increment_jtbd_usage: { Args: { jtbd_id: string }; Returns: undefined }
      is_admin_user: { Args: { user_email: string }; Returns: boolean }
      is_organization_admin: { Args: never; Returns: boolean }
      is_panel_owner: {
        Args: { panel_id: string; user_id?: string }
        Returns: boolean
      }
      is_platform_admin: { Args: { p_user_id: string }; Returns: boolean }
      is_superadmin: { Args: never; Returns: boolean }
      log_tool_execution: {
        Args: {
          p_agent_id: string
          p_error_message?: string
          p_execution_time_ms?: number
          p_input_params: Json
          p_output_result?: Json
          p_session_id?: string
          p_status?: string
          p_tenant_id: string
          p_tool_code: string
          p_workflow_run_id?: string
        }
        Returns: string
      }
      match_documents: {
        Args: {
          filter_domain?: string
          match_count?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_langchain: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      recommend_agents_for_panel: {
        Args: { p_max_agents?: number; p_panel_type?: string; p_query: string }
        Returns: {
          agent_id: string
          agent_name: string
          agent_slug: string
          matching_skills: Json
          reasoning: string
          recommendation_score: number
        }[]
      }
      refresh_materialized_views: { Args: never; Returns: undefined }
      refresh_tool_analytics: { Args: never; Returns: undefined }
      search_knowledge_base: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          content_type: string
          created_at: string
          created_by: string
          id: string
          is_public: boolean
          metadata: Json
          similarity: number
          source: string
          source_url: string
          tags: string[]
          title: string
          updated_at: string
        }[]
      }
      search_knowledge_base_json: {
        Args: { match_count?: number; query_terms: string }
        Returns: {
          content: string
          content_type: string
          created_at: string
          created_by: string
          id: string
          is_public: boolean
          metadata: Json
          similarity: number
          source: string
          source_url: string
          tags: string[]
          title: string
          updated_at: string
        }[]
      }
      search_knowledge_by_embedding: {
        Args: {
          domain_filter?: string
          embedding_model?: string
          max_results?: number
          query_embedding: string
          similarity_threshold?: number
        }
        Returns: {
          chunk_id: string
          content: string
          domain: string
          metadata: Json
          similarity: number
          source_id: string
          source_title: string
        }[]
      }
      search_knowledge_for_agent: {
        Args: {
          agent_id_param: string
          max_results?: number
          query_embedding_param: string
          query_text_param: string
        }
        Returns: {
          chunk_id: string
          content: string
          relevance_boost: number
          similarity: number
          source_title: string
        }[]
      }
      search_memories_by_embedding: {
        Args: {
          p_limit?: number
          p_memory_types?: string[]
          p_min_importance?: number
          p_session_id?: string
          p_tenant_id: string
          p_user_id: string
          query_embedding: string
        }
        Returns: {
          accessed_count: number
          content: string
          created_at: string
          id: string
          importance: number
          memory_type: string
          metadata: Json
          similarity: number
        }[]
      }
      search_personas: {
        Args: {
          filter_industry_id?: string
          limit_count?: number
          search_query: string
        }
        Returns: {
          persona_description: string
          persona_id: string
          persona_name: string
        }[]
      }
      search_rag_knowledge: {
        Args: {
          filter_domain?: Database["public"]["Enums"]["knowledge_domain"]
          filter_prism_suite?: Database["public"]["Enums"]["prism_suite"]
          filter_tenant_id?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          chunk_id: string
          clinical_context: Json
          content: string
          domain: Database["public"]["Enums"]["knowledge_domain"]
          medical_context: Json
          prism_suite: Database["public"]["Enums"]["prism_suite"]
          regulatory_context: Json
          section_title: string
          similarity: number
          source_id: string
          source_name: string
        }[]
      }
      search_rag_knowledge_chunks: {
        Args: {
          filter_domain?: Database["public"]["Enums"]["knowledge_domain"]
          filter_prism_suite?: Database["public"]["Enums"]["prism_suite"]
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          chunk_id: string
          content: string
          domain: Database["public"]["Enums"]["knowledge_domain"]
          medical_context: Json
          prism_suite: Database["public"]["Enums"]["prism_suite"]
          regulatory_context: Json
          section_title: string
          similarity: number
          source_id: string
          source_name: string
        }[]
      }
      set_tenant_context: { Args: { p_tenant_id: string }; Returns: undefined }
      text_to_uuid: { Args: { text_id: string }; Returns: string }
      update_memory_access: {
        Args: { p_memory_id: string }
        Returns: undefined
      }
      verify_critical_domains_mapping: {
        Args: never
        Returns: {
          access_policy: Database["public"]["Enums"]["access_policy_level"]
          chunk_count: number
          document_count: number
          domain_exists: boolean
          domain_id: string
          rag_priority_weight: number
        }[]
      }
    }
    Enums: {
      access_policy_level:
        | "public"
        | "enterprise_confidential"
        | "team_confidential"
        | "personal_draft"
      domain_scope: "global" | "enterprise" | "user"
      exposure_level: "High" | "Medium" | "Low" | "None"
      knowledge_domain:
        | "medical_affairs"
        | "regulatory_compliance"
        | "digital_health"
        | "clinical_research"
        | "market_access"
        | "commercial_strategy"
        | "methodology_frameworks"
        | "technology_platforms"
      maturity_level: "Established" | "Specialized" | "Emerging" | "Draft"
      permission_action:
        | "create"
        | "read"
        | "update"
        | "delete"
        | "execute"
        | "manage"
      permission_scope:
        | "llm_providers"
        | "agents"
        | "workflows"
        | "analytics"
        | "system_settings"
        | "user_management"
        | "audit_logs"
        | "org_functions"
        | "org_departments"
        | "org_roles"
        | "org_responsibilities"
      prism_suite:
        | "RULES"
        | "TRIALS"
        | "GUARD"
        | "VALUE"
        | "BRIDGE"
        | "PROOF"
        | "CRAFT"
        | "SCOUT"
      processing_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "archived"
      provider_status:
        | "initializing"
        | "active"
        | "error"
        | "maintenance"
        | "disabled"
      provider_type:
        | "openai"
        | "anthropic"
        | "google"
        | "azure"
        | "aws_bedrock"
        | "cohere"
        | "huggingface"
        | "custom"
      user_role: "super_admin" | "admin" | "llm_manager" | "user" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      access_policy_level: [
        "public",
        "enterprise_confidential",
        "team_confidential",
        "personal_draft",
      ],
      domain_scope: ["global", "enterprise", "user"],
      exposure_level: ["High", "Medium", "Low", "None"],
      knowledge_domain: [
        "medical_affairs",
        "regulatory_compliance",
        "digital_health",
        "clinical_research",
        "market_access",
        "commercial_strategy",
        "methodology_frameworks",
        "technology_platforms",
      ],
      maturity_level: ["Established", "Specialized", "Emerging", "Draft"],
      permission_action: [
        "create",
        "read",
        "update",
        "delete",
        "execute",
        "manage",
      ],
      permission_scope: [
        "llm_providers",
        "agents",
        "workflows",
        "analytics",
        "system_settings",
        "user_management",
        "audit_logs",
        "org_functions",
        "org_departments",
        "org_roles",
        "org_responsibilities",
      ],
      prism_suite: [
        "RULES",
        "TRIALS",
        "GUARD",
        "VALUE",
        "BRIDGE",
        "PROOF",
        "CRAFT",
        "SCOUT",
      ],
      processing_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "archived",
      ],
      provider_status: [
        "initializing",
        "active",
        "error",
        "maintenance",
        "disabled",
      ],
      provider_type: [
        "openai",
        "anthropic",
        "google",
        "azure",
        "aws_bedrock",
        "cohere",
        "huggingface",
        "custom",
      ],
      user_role: ["super_admin", "admin", "llm_manager", "user", "viewer"],
    },
  },
} as const
A new version of Supabase CLI is available: v2.54.11 (currently installed v2.48.3)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
