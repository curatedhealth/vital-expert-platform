export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      agent_audit_log: {
        Row: {
          action: string
          agent_id: string
          changed_at: string | null
          changed_by: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          agent_id: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          agent_id?: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_audit_log_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "admin_agent_tier_lifecycle_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_audit_log_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_capabilities_detailed_view"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_audit_log_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_support_overview"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_audit_log_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_capabilities: {
        Row: {
          agent_id: string
          capability_id: string
          created_at: string
          custom_config: Json | null
          id: string
          is_primary: boolean | null
          last_used_at: string | null
          proficiency_level: string | null
          success_rate: number | null
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          agent_id: string
          capability_id: string
          created_at?: string
          custom_config?: Json | null
          id?: string
          is_primary?: boolean | null
          last_used_at?: string | null
          proficiency_level?: string | null
          success_rate?: number | null
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          agent_id?: string
          capability_id?: string
          created_at?: string
          custom_config?: Json | null
          id?: string
          is_primary?: boolean | null
          last_used_at?: string | null
          proficiency_level?: string | null
          success_rate?: number | null
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_capabilities_capability_id_fkey"
            columns: ["capability_id"]
            isOneToOne: false
            referencedRelation: "agent_capabilities_detailed_view"
            referencedColumns: ["capability_id"]
          },
          {
            foreignKeyName: "agent_capabilities_capability_id_fkey"
            columns: ["capability_id"]
            isOneToOne: false
            referencedRelation: "capabilities"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_organizational_role_support: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          organizational_role_id: string
          proficiency_level: string | null
          support_type: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          organizational_role_id: string
          proficiency_level?: string | null
          support_type?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          organizational_role_id?: string
          proficiency_level?: string | null
          support_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_organizational_role_support_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "admin_agent_tier_lifecycle_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_organizational_role_support_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_capabilities_detailed_view"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_organizational_role_support_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_support_overview"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_organizational_role_support_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_organizational_role_support_organizational_role_id_fkey"
            columns: ["organizational_role_id"]
            isOneToOne: false
            referencedRelation: "organizational_role_support"
            referencedColumns: ["org_role_id"]
          },
          {
            foreignKeyName: "agent_organizational_role_support_organizational_role_id_fkey"
            columns: ["organizational_role_id"]
            isOneToOne: false
            referencedRelation: "organizational_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_roles: {
        Row: {
          capabilities: string[] | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          capabilities?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          capabilities?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      agent_tier_lifecycle_audit: {
        Row: {
          agent_id: string | null
          change_reason: string | null
          changed_at: string
          changed_by: string | null
          id: string
          new_status: string | null
          new_tier: number | null
          old_status: string | null
          old_tier: number | null
        }
        Insert: {
          agent_id?: string | null
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_status?: string | null
          new_tier?: number | null
          old_status?: string | null
          old_tier?: number | null
        }
        Update: {
          agent_id?: string | null
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_status?: string | null
          new_tier?: number | null
          old_status?: string | null
          old_tier?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_tier_lifecycle_audit_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "admin_agent_tier_lifecycle_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_tier_lifecycle_audit_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_capabilities_detailed_view"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_tier_lifecycle_audit_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_support_overview"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_tier_lifecycle_audit_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          accuracy_score: number | null
          agent_role: string | null
          agent_role_id: string | null
          architecture_pattern: string | null
          audit_trail_enabled: boolean | null
          availability_status: string | null
          avatar: string | null
          average_response_time: number | null
          bar_admissions: string[] | null
          business_function: string | null
          business_function_id: string | null
          capabilities: string[]
          citation_requirements: Json | null
          color: string | null
          communication_style: string | null
          communication_tone: string | null
          compatible_agents: string[] | null
          competency_levels: Json | null
          complexity_level: string | null
          compliance_tags: string[] | null
          confidence_thresholds: Json | null
          context_window: number | null
          cost_per_query: number | null
          coverage_determination_types: string[] | null
          created_at: string | null
          created_by: string | null
          customer_segments: string[] | null
          data_classification:
            | Database["public"]["Enums"]["data_classification"]
            | null
          department: string | null
          department_id: string | null
          description: string
          display_name: string
          domain_expertise: Database["public"]["Enums"]["domain_expertise"]
          error_rate: number | null
          escalation_rules: Json | null
          evidence_required: boolean | null
          gdpr_compliant: boolean | null
          geographic_focus: string[] | null
          hipaa_compliant: boolean | null
          hta_experience: string[] | null
          id: string
          implementation_phase: number | null
          incompatible_agents: string[] | null
          input_validation_rules: Json | null
          is_custom: boolean | null
          is_library_agent: boolean | null
          is_public: boolean | null
          jurisdiction_coverage: string[] | null
          knowledge_domains: string[] | null
          knowledge_sources: Json | null
          last_health_check: string | null
          last_interaction: string | null
          last_validation_date: string | null
          legal_domains: string[] | null
          legal_specialties: Json | null
          market_segments: string[] | null
          max_tokens: number | null
          medical_specialty: string | null
          metadata: Json | null
          model: string
          name: string
          output_format_rules: Json | null
          parent_agent_id: string | null
          payer_types: string[] | null
          performance_benchmarks: Json | null
          performance_metrics: Json | null
          pharma_enabled: boolean | null
          prerequisite_agents: string[] | null
          primary_mission: string | null
          priority: number | null
          rag_enabled: boolean | null
          rate_limits: Json | null
          reasoning_method: string | null
          regulatory_context: Json | null
          reimbursement_models: string[] | null
          response_format: string | null
          reviewer_id: string | null
          role: string | null
          role_id: string | null
          sales_methodology: string | null
          search_vector: unknown | null
          status: Database["public"]["Enums"]["agent_status"] | null
          system_prompt: string
          target_users: string[] | null
          temperature: number | null
          test_scenarios: Json | null
          tier: number | null
          tool_configurations: Json | null
          total_interactions: number | null
          updated_at: string | null
          updated_by: string | null
          validation_expiry_date: string | null
          validation_history: Json | null
          validation_metadata: Json | null
          validation_status:
            | Database["public"]["Enums"]["validation_status"]
            | null
          value_proposition: string | null
          verify_enabled: boolean | null
          version: string | null
          workflow_positions: string[] | null
        }
        Insert: {
          accuracy_score?: number | null
          agent_role?: string | null
          agent_role_id?: string | null
          architecture_pattern?: string | null
          audit_trail_enabled?: boolean | null
          availability_status?: string | null
          avatar?: string | null
          average_response_time?: number | null
          bar_admissions?: string[] | null
          business_function?: string | null
          business_function_id?: string | null
          capabilities: string[]
          citation_requirements?: Json | null
          color?: string | null
          communication_style?: string | null
          communication_tone?: string | null
          compatible_agents?: string[] | null
          competency_levels?: Json | null
          complexity_level?: string | null
          compliance_tags?: string[] | null
          confidence_thresholds?: Json | null
          context_window?: number | null
          cost_per_query?: number | null
          coverage_determination_types?: string[] | null
          created_at?: string | null
          created_by?: string | null
          customer_segments?: string[] | null
          data_classification?:
            | Database["public"]["Enums"]["data_classification"]
            | null
          department?: string | null
          department_id?: string | null
          description: string
          display_name: string
          domain_expertise?: Database["public"]["Enums"]["domain_expertise"]
          error_rate?: number | null
          escalation_rules?: Json | null
          evidence_required?: boolean | null
          gdpr_compliant?: boolean | null
          geographic_focus?: string[] | null
          hipaa_compliant?: boolean | null
          hta_experience?: string[] | null
          id?: string
          implementation_phase?: number | null
          incompatible_agents?: string[] | null
          input_validation_rules?: Json | null
          is_custom?: boolean | null
          is_library_agent?: boolean | null
          is_public?: boolean | null
          jurisdiction_coverage?: string[] | null
          knowledge_domains?: string[] | null
          knowledge_sources?: Json | null
          last_health_check?: string | null
          last_interaction?: string | null
          last_validation_date?: string | null
          legal_domains?: string[] | null
          legal_specialties?: Json | null
          market_segments?: string[] | null
          max_tokens?: number | null
          medical_specialty?: string | null
          metadata?: Json | null
          model?: string
          name: string
          output_format_rules?: Json | null
          parent_agent_id?: string | null
          payer_types?: string[] | null
          performance_benchmarks?: Json | null
          performance_metrics?: Json | null
          pharma_enabled?: boolean | null
          prerequisite_agents?: string[] | null
          primary_mission?: string | null
          priority?: number | null
          rag_enabled?: boolean | null
          rate_limits?: Json | null
          reasoning_method?: string | null
          regulatory_context?: Json | null
          reimbursement_models?: string[] | null
          response_format?: string | null
          reviewer_id?: string | null
          role?: string | null
          role_id?: string | null
          sales_methodology?: string | null
          search_vector?: unknown | null
          status?: Database["public"]["Enums"]["agent_status"] | null
          system_prompt: string
          target_users?: string[] | null
          temperature?: number | null
          test_scenarios?: Json | null
          tier?: number | null
          tool_configurations?: Json | null
          total_interactions?: number | null
          updated_at?: string | null
          updated_by?: string | null
          validation_expiry_date?: string | null
          validation_history?: Json | null
          validation_metadata?: Json | null
          validation_status?:
            | Database["public"]["Enums"]["validation_status"]
            | null
          value_proposition?: string | null
          verify_enabled?: boolean | null
          version?: string | null
          workflow_positions?: string[] | null
        }
        Update: {
          accuracy_score?: number | null
          agent_role?: string | null
          agent_role_id?: string | null
          architecture_pattern?: string | null
          audit_trail_enabled?: boolean | null
          availability_status?: string | null
          avatar?: string | null
          average_response_time?: number | null
          bar_admissions?: string[] | null
          business_function?: string | null
          business_function_id?: string | null
          capabilities?: string[]
          citation_requirements?: Json | null
          color?: string | null
          communication_style?: string | null
          communication_tone?: string | null
          compatible_agents?: string[] | null
          competency_levels?: Json | null
          complexity_level?: string | null
          compliance_tags?: string[] | null
          confidence_thresholds?: Json | null
          context_window?: number | null
          cost_per_query?: number | null
          coverage_determination_types?: string[] | null
          created_at?: string | null
          created_by?: string | null
          customer_segments?: string[] | null
          data_classification?:
            | Database["public"]["Enums"]["data_classification"]
            | null
          department?: string | null
          department_id?: string | null
          description?: string
          display_name?: string
          domain_expertise?: Database["public"]["Enums"]["domain_expertise"]
          error_rate?: number | null
          escalation_rules?: Json | null
          evidence_required?: boolean | null
          gdpr_compliant?: boolean | null
          geographic_focus?: string[] | null
          hipaa_compliant?: boolean | null
          hta_experience?: string[] | null
          id?: string
          implementation_phase?: number | null
          incompatible_agents?: string[] | null
          input_validation_rules?: Json | null
          is_custom?: boolean | null
          is_library_agent?: boolean | null
          is_public?: boolean | null
          jurisdiction_coverage?: string[] | null
          knowledge_domains?: string[] | null
          knowledge_sources?: Json | null
          last_health_check?: string | null
          last_interaction?: string | null
          last_validation_date?: string | null
          legal_domains?: string[] | null
          legal_specialties?: Json | null
          market_segments?: string[] | null
          max_tokens?: number | null
          medical_specialty?: string | null
          metadata?: Json | null
          model?: string
          name?: string
          output_format_rules?: Json | null
          parent_agent_id?: string | null
          payer_types?: string[] | null
          performance_benchmarks?: Json | null
          performance_metrics?: Json | null
          pharma_enabled?: boolean | null
          prerequisite_agents?: string[] | null
          primary_mission?: string | null
          priority?: number | null
          rag_enabled?: boolean | null
          rate_limits?: Json | null
          reasoning_method?: string | null
          regulatory_context?: Json | null
          reimbursement_models?: string[] | null
          response_format?: string | null
          reviewer_id?: string | null
          role?: string | null
          role_id?: string | null
          sales_methodology?: string | null
          search_vector?: unknown | null
          status?: Database["public"]["Enums"]["agent_status"] | null
          system_prompt?: string
          target_users?: string[] | null
          temperature?: number | null
          test_scenarios?: Json | null
          tier?: number | null
          tool_configurations?: Json | null
          total_interactions?: number | null
          updated_at?: string | null
          updated_by?: string | null
          validation_expiry_date?: string | null
          validation_history?: Json | null
          validation_metadata?: Json | null
          validation_status?:
            | Database["public"]["Enums"]["validation_status"]
            | null
          value_proposition?: string | null
          verify_enabled?: boolean | null
          version?: string | null
          workflow_positions?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_agent_role_id_fkey"
            columns: ["agent_role_id"]
            isOneToOne: false
            referencedRelation: "agent_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_business_function_id_fkey"
            columns: ["business_function_id"]
            isOneToOne: false
            referencedRelation: "business_functions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_parent_agent_id_fkey"
            columns: ["parent_agent_id"]
            isOneToOne: false
            referencedRelation: "admin_agent_tier_lifecycle_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_parent_agent_id_fkey"
            columns: ["parent_agent_id"]
            isOneToOne: false
            referencedRelation: "agent_capabilities_detailed_view"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agents_parent_agent_id_fkey"
            columns: ["parent_agent_id"]
            isOneToOne: false
            referencedRelation: "agent_support_overview"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agents_parent_agent_id_fkey"
            columns: ["parent_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "organizational_role_support"
            referencedColumns: ["org_role_id"]
          },
          {
            foreignKeyName: "agents_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "organizational_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      avatars: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          display_name: string | null
          icon: string
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          icon: string
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      board_memberships: {
        Row: {
          agent_id: number
          board_id: string
          id: string
          joined_at: string | null
          role: string
          voting_weight: number | null
        }
        Insert: {
          agent_id: number
          board_id: string
          id?: string
          joined_at?: string | null
          role: string
          voting_weight?: number | null
        }
        Update: {
          agent_id?: number
          board_id?: string
          id?: string
          joined_at?: string | null
          role?: string
          voting_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "board_memberships_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "expert_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_memberships_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "virtual_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      business_functions: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      capabilities: {
        Row: {
          average_execution_time: number | null
          capability_key: string
          category: string | null
          color: string | null
          competencies: Json
          complexity_level: string | null
          created_at: string | null
          created_by: string | null
          depends_on: string[] | null
          description: string
          domain: string | null
          enables: string[] | null
          icon: string | null
          id: string
          implementation_timeline: number | null
          is_new: boolean | null
          is_premium: boolean | null
          knowledge_base: Json | null
          maturity: Database["public"]["Enums"]["maturity_level"]
          name: string
          panel_recommended: boolean | null
          prerequisites: Json | null
          priority: Database["public"]["Enums"]["priority_level"]
          requires_api_access: boolean | null
          requires_training: boolean | null
          search_vector: unknown | null
          stage: Database["public"]["Enums"]["lifecycle_stage"]
          status: string
          success_metrics: Json | null
          success_rate: number | null
          tools: Json | null
          updated_at: string | null
          usage_count: number | null
          version: string | null
          vital_component: Database["public"]["Enums"]["vital_framework"]
        }
        Insert: {
          average_execution_time?: number | null
          capability_key: string
          category?: string | null
          color?: string | null
          competencies?: Json
          complexity_level?: string | null
          created_at?: string | null
          created_by?: string | null
          depends_on?: string[] | null
          description: string
          domain?: string | null
          enables?: string[] | null
          icon?: string | null
          id?: string
          implementation_timeline?: number | null
          is_new?: boolean | null
          is_premium?: boolean | null
          knowledge_base?: Json | null
          maturity: Database["public"]["Enums"]["maturity_level"]
          name: string
          panel_recommended?: boolean | null
          prerequisites?: Json | null
          priority: Database["public"]["Enums"]["priority_level"]
          requires_api_access?: boolean | null
          requires_training?: boolean | null
          search_vector?: unknown | null
          stage: Database["public"]["Enums"]["lifecycle_stage"]
          status?: string
          success_metrics?: Json | null
          success_rate?: number | null
          tools?: Json | null
          updated_at?: string | null
          usage_count?: number | null
          version?: string | null
          vital_component: Database["public"]["Enums"]["vital_framework"]
        }
        Update: {
          average_execution_time?: number | null
          capability_key?: string
          category?: string | null
          color?: string | null
          competencies?: Json
          complexity_level?: string | null
          created_at?: string | null
          created_by?: string | null
          depends_on?: string[] | null
          description?: string
          domain?: string | null
          enables?: string[] | null
          icon?: string | null
          id?: string
          implementation_timeline?: number | null
          is_new?: boolean | null
          is_premium?: boolean | null
          knowledge_base?: Json | null
          maturity?: Database["public"]["Enums"]["maturity_level"]
          name?: string
          panel_recommended?: boolean | null
          prerequisites?: Json | null
          priority?: Database["public"]["Enums"]["priority_level"]
          requires_api_access?: boolean | null
          requires_training?: boolean | null
          search_vector?: unknown | null
          stage?: Database["public"]["Enums"]["lifecycle_stage"]
          status?: string
          success_metrics?: Json | null
          success_rate?: number | null
          tools?: Json | null
          updated_at?: string | null
          usage_count?: number | null
          version?: string | null
          vital_component?: Database["public"]["Enums"]["vital_framework"]
        }
        Relationships: []
      }
      capability_agents: {
        Row: {
          agent_id: number
          assigned_at: string | null
          capability_id: string
          contribution_notes: string | null
          expertise_score: number | null
          id: string
          last_review: string | null
          relationship_type: string
        }
        Insert: {
          agent_id: number
          assigned_at?: string | null
          capability_id: string
          contribution_notes?: string | null
          expertise_score?: number | null
          id?: string
          last_review?: string | null
          relationship_type: string
        }
        Update: {
          agent_id?: number
          assigned_at?: string | null
          capability_id?: string
          contribution_notes?: string | null
          expertise_score?: number | null
          id?: string
          last_review?: string | null
          relationship_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "capability_agents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "expert_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capability_agents_capability_id_fkey"
            columns: ["capability_id"]
            isOneToOne: false
            referencedRelation: "agent_capabilities_detailed_view"
            referencedColumns: ["capability_id"]
          },
          {
            foreignKeyName: "capability_agents_capability_id_fkey"
            columns: ["capability_id"]
            isOneToOne: false
            referencedRelation: "capabilities"
            referencedColumns: ["id"]
          },
        ]
      }
      capability_workflows: {
        Row: {
          created_at: string | null
          deliverables: Json | null
          estimated_duration: number | null
          id: string
          name: string
          prerequisites: Json | null
          required_agents: number[]
          required_capabilities: string[]
          stage: Database["public"]["Enums"]["lifecycle_stage"]
          updated_at: string | null
          workflow_steps: Json
        }
        Insert: {
          created_at?: string | null
          deliverables?: Json | null
          estimated_duration?: number | null
          id?: string
          name: string
          prerequisites?: Json | null
          required_agents?: number[]
          required_capabilities?: string[]
          stage: Database["public"]["Enums"]["lifecycle_stage"]
          updated_at?: string | null
          workflow_steps?: Json
        }
        Update: {
          created_at?: string | null
          deliverables?: Json | null
          estimated_duration?: number | null
          id?: string
          name?: string
          prerequisites?: Json | null
          required_agents?: number[]
          required_capabilities?: string[]
          stage?: Database["public"]["Enums"]["lifecycle_stage"]
          updated_at?: string | null
          workflow_steps?: Json
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          context: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_message_at: string | null
          message_count: number | null
          organization_id: string | null
          project_id: string | null
          session_type: string | null
          settings: Json | null
          title: string | null
          total_tokens: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          agent_name?: string | null
          context?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          message_count?: number | null
          organization_id?: string | null
          project_id?: string | null
          session_type?: string | null
          settings?: Json | null
          title?: string | null
          total_tokens?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          agent_name?: string | null
          context?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          message_count?: number | null
          organization_id?: string | null
          project_id?: string | null
          session_type?: string | null
          settings?: Json | null
          title?: string | null
          total_tokens?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_validations: {
        Row: {
          accuracy_score: number | null
          audit_trail: Json | null
          created_at: string | null
          entity_id: string
          entity_type: string
          expiration_date: string | null
          id: string
          is_current: boolean | null
          notes: string | null
          updated_at: string | null
          validation_date: string | null
          validation_result: Json | null
          validation_type: string
          validator_credentials: string | null
          validator_id: string | null
        }
        Insert: {
          accuracy_score?: number | null
          audit_trail?: Json | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          expiration_date?: string | null
          id?: string
          is_current?: boolean | null
          notes?: string | null
          updated_at?: string | null
          validation_date?: string | null
          validation_result?: Json | null
          validation_type: string
          validator_credentials?: string | null
          validator_id?: string | null
        }
        Update: {
          accuracy_score?: number | null
          audit_trail?: Json | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          expiration_date?: string | null
          id?: string
          is_current?: boolean | null
          notes?: string | null
          updated_at?: string | null
          validation_date?: string | null
          validation_result?: Json | null
          validation_type?: string
          validator_credentials?: string | null
          validator_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_validations_validator_id_fkey"
            columns: ["validator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          metadata: Json | null
          session_id: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          session_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          session_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          business_function_id: string | null
          created_at: string | null
          description: string | null
          gdpr_required: boolean | null
          hipaa_required: boolean | null
          id: string
          is_active: boolean | null
          name: string
          parent_department_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          business_function_id?: string | null
          created_at?: string | null
          description?: string | null
          gdpr_required?: boolean | null
          hipaa_required?: boolean | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_department_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          business_function_id?: string | null
          created_at?: string | null
          description?: string | null
          gdpr_required?: boolean | null
          hipaa_required?: boolean | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_department_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_business_function_id_fkey"
            columns: ["business_function_id"]
            isOneToOne: false
            referencedRelation: "business_functions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_parent_department_id_fkey"
            columns: ["parent_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          access_level: string | null
          category: string | null
          content_summary: string | null
          content_text: string | null
          created_at: string | null
          created_by: string | null
          document_type: string
          embedding_model: string | null
          extract_metadata: Json | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          id: string
          is_active: boolean | null
          is_processed: boolean | null
          knowledge_base_id: string | null
          language: string | null
          mime_type: string | null
          name: string
          organization_id: string | null
          page_count: number | null
          processed_at: string | null
          processing_status: string | null
          project_id: string | null
          source_url: string | null
          tags: string[] | null
          updated_at: string | null
          uploaded_at: string | null
          vector_ids: string[] | null
        }
        Insert: {
          access_level?: string | null
          category?: string | null
          content_summary?: string | null
          content_text?: string | null
          created_at?: string | null
          created_by?: string | null
          document_type: string
          embedding_model?: string | null
          extract_metadata?: Json | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          is_processed?: boolean | null
          knowledge_base_id?: string | null
          language?: string | null
          mime_type?: string | null
          name: string
          organization_id?: string | null
          page_count?: number | null
          processed_at?: string | null
          processing_status?: string | null
          project_id?: string | null
          source_url?: string | null
          tags?: string[] | null
          updated_at?: string | null
          uploaded_at?: string | null
          vector_ids?: string[] | null
        }
        Update: {
          access_level?: string | null
          category?: string | null
          content_summary?: string | null
          content_text?: string | null
          created_at?: string | null
          created_by?: string | null
          document_type?: string
          embedding_model?: string | null
          extract_metadata?: Json | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          is_processed?: boolean | null
          knowledge_base_id?: string | null
          language?: string | null
          mime_type?: string | null
          name?: string
          organization_id?: string | null
          page_count?: number | null
          processed_at?: string | null
          processing_status?: string | null
          project_id?: string | null
          source_url?: string | null
          tags?: string[] | null
          updated_at?: string | null
          uploaded_at?: string | null
          vector_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_knowledge_base_id_fkey"
            columns: ["knowledge_base_id"]
            isOneToOne: false
            referencedRelation: "knowledge_base"
            referencedColumns: ["id"]
          },
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
      expert_agents: {
        Row: {
          availability: string | null
          communication_preferences: Json | null
          created_at: string | null
          credentials: Json | null
          domain: Database["public"]["Enums"]["agent_domain"]
          engagement_tier: number | null
          focus_area: string
          id: number
          is_active: boolean | null
          key_expertise: string
          languages: Json | null
          name: string
          organization: string
          publications: Json | null
          search_vector: unknown | null
          specializations: Json | null
          timezone: string | null
          title: string
          updated_at: string | null
          virtual_board_memberships: Json | null
          years_experience: number | null
        }
        Insert: {
          availability?: string | null
          communication_preferences?: Json | null
          created_at?: string | null
          credentials?: Json | null
          domain: Database["public"]["Enums"]["agent_domain"]
          engagement_tier?: number | null
          focus_area: string
          id: number
          is_active?: boolean | null
          key_expertise: string
          languages?: Json | null
          name: string
          organization: string
          publications?: Json | null
          search_vector?: unknown | null
          specializations?: Json | null
          timezone?: string | null
          title: string
          updated_at?: string | null
          virtual_board_memberships?: Json | null
          years_experience?: number | null
        }
        Update: {
          availability?: string | null
          communication_preferences?: Json | null
          created_at?: string | null
          credentials?: Json | null
          domain?: Database["public"]["Enums"]["agent_domain"]
          engagement_tier?: number | null
          focus_area?: string
          id?: number
          is_active?: boolean | null
          key_expertise?: string
          languages?: Json | null
          name?: string
          organization?: string
          publications?: Json | null
          search_vector?: unknown | null
          specializations?: Json | null
          timezone?: string | null
          title?: string
          updated_at?: string | null
          virtual_board_memberships?: Json | null
          years_experience?: number | null
        }
        Relationships: []
      }
      icons: {
        Row: {
          category: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          svg_content: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          svg_content: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          svg_content?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          category: string | null
          content: string | null
          content_format: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          embedding_model: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          knowledge_type: string
          metadata: Json | null
          name: string
          organization_id: string | null
          project_id: string | null
          source_type: string | null
          source_url: string | null
          tags: string[] | null
          updated_at: string | null
          vector_ids: string[] | null
          version: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          content_format?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          embedding_model?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          knowledge_type: string
          metadata?: Json | null
          name: string
          organization_id?: string | null
          project_id?: string | null
          source_type?: string | null
          source_url?: string | null
          tags?: string[] | null
          updated_at?: string | null
          vector_ids?: string[] | null
          version?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          content_format?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          embedding_model?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          knowledge_type?: string
          metadata?: Json | null
          name?: string
          organization_id?: string | null
          project_id?: string | null
          source_type?: string | null
          source_url?: string | null
          tags?: string[] | null
          updated_at?: string | null
          vector_ids?: string[] | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_base_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_base_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_domains: {
        Row: {
          agent_count_estimate: number | null
          code: string
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          metadata: Json | null
          name: string
          priority: number
          recommended_models: Json | null
          slug: string
          sub_domains: string[] | null
          tier: number
          updated_at: string | null
        }
        Insert: {
          agent_count_estimate?: number | null
          code: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          metadata?: Json | null
          name: string
          priority?: number
          recommended_models?: Json | null
          slug: string
          sub_domains?: string[] | null
          tier?: number
          updated_at?: string | null
        }
        Update: {
          agent_count_estimate?: number | null
          code?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          metadata?: Json | null
          name?: string
          priority?: number
          recommended_models?: Json | null
          slug?: string
          sub_domains?: string[] | null
          tier?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      llm_models: {
        Row: {
          context_window: number | null
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          input_cost_per_1k: number | null
          is_active: boolean | null
          max_output_tokens: number | null
          name: string
          output_cost_per_1k: number | null
          provider: string
          sort_order: number | null
          supports_functions: boolean | null
          supports_json_mode: boolean | null
          supports_vision: boolean | null
          tier_recommendation: number | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          context_window?: number | null
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          input_cost_per_1k?: number | null
          is_active?: boolean | null
          max_output_tokens?: number | null
          name: string
          output_cost_per_1k?: number | null
          provider: string
          sort_order?: number | null
          supports_functions?: boolean | null
          supports_json_mode?: boolean | null
          supports_vision?: boolean | null
          tier_recommendation?: number | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          context_window?: number | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          input_cost_per_1k?: number | null
          is_active?: boolean | null
          max_output_tokens?: number | null
          name?: string
          output_cost_per_1k?: number | null
          provider?: string
          sort_order?: number | null
          supports_functions?: boolean | null
          supports_json_mode?: boolean | null
          supports_vision?: boolean | null
          tier_recommendation?: number | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          citations: Json | null
          content: string
          content_type: string | null
          conversation_id: string | null
          created_at: string | null
          feedback: Json | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          metadata: Json | null
          parent_message_id: string | null
          processing_time_ms: number | null
          role: string
          session_id: string | null
          tokens_used: number | null
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          agent_name?: string | null
          citations?: Json | null
          content: string
          content_type?: string | null
          conversation_id?: string | null
          created_at?: string | null
          feedback?: Json | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          metadata?: Json | null
          parent_message_id?: string | null
          processing_time_ms?: number | null
          role: string
          session_id?: string | null
          tokens_used?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          agent_name?: string | null
          citations?: Json | null
          content?: string
          content_type?: string | null
          conversation_id?: string | null
          created_at?: string | null
          feedback?: Json | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          metadata?: Json | null
          parent_message_id?: string | null
          processing_time_ms?: number | null
          role?: string
          session_id?: string | null
          tokens_used?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      organizational_roles: {
        Row: {
          business_function_id: string | null
          created_at: string | null
          department_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          level: string | null
          name: string
          required_capabilities: string[] | null
          responsibilities: string[] | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          business_function_id?: string | null
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          level?: string | null
          name: string
          required_capabilities?: string[] | null
          responsibilities?: string[] | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          business_function_id?: string | null
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          level?: string | null
          name?: string
          required_capabilities?: string[] | null
          responsibilities?: string[] | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_business_function_id_fkey"
            columns: ["business_function_id"]
            isOneToOne: false
            referencedRelation: "business_functions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          max_projects: number | null
          max_users: number | null
          metadata: Json | null
          name: string
          settings: Json | null
          slug: string
          subscription_status: string | null
          subscription_tier: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_projects?: number | null
          max_users?: number | null
          metadata?: Json | null
          name: string
          settings?: Json | null
          slug: string
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          max_projects?: number | null
          max_users?: number | null
          metadata?: Json | null
          name?: string
          settings?: Json | null
          slug?: string
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          clinical_indication: string | null
          created_at: string | null
          created_by: string | null
          current_phase: string | null
          description: string | null
          id: string
          is_archived: boolean | null
          metadata: Json | null
          milestones: Json | null
          name: string
          organization_id: string | null
          patient_population: string | null
          phase_progress: Json | null
          primary_endpoints: string[] | null
          project_type: string
          regulatory_pathway: string | null
          secondary_endpoints: string[] | null
          target_markets: string[] | null
          updated_at: string | null
        }
        Insert: {
          clinical_indication?: string | null
          created_at?: string | null
          created_by?: string | null
          current_phase?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean | null
          metadata?: Json | null
          milestones?: Json | null
          name: string
          organization_id?: string | null
          patient_population?: string | null
          phase_progress?: Json | null
          primary_endpoints?: string[] | null
          project_type: string
          regulatory_pathway?: string | null
          secondary_endpoints?: string[] | null
          target_markets?: string[] | null
          updated_at?: string | null
        }
        Update: {
          clinical_indication?: string | null
          created_at?: string | null
          created_by?: string | null
          current_phase?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean | null
          metadata?: Json | null
          milestones?: Json | null
          name?: string
          organization_id?: string | null
          patient_population?: string | null
          phase_progress?: Json | null
          primary_endpoints?: string[] | null
          project_type?: string
          regulatory_pathway?: string | null
          secondary_endpoints?: string[] | null
          target_markets?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_knowledge_chunks: {
        Row: {
          chunk_index: number
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
          source_id: string
          word_count: number | null
        }
        Insert: {
          chunk_index: number
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
          source_id: string
          word_count?: number | null
        }
        Update: {
          chunk_index?: number
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
          source_id?: string
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
          agent_id: string | null
          category: string | null
          confidence_score: number | null
          content_hash: string | null
          created_at: string | null
          description: string | null
          domain: string | null
          error_message: string | null
          file_path: string | null
          file_size: number | null
          id: string
          is_global: boolean | null
          last_accessed: string | null
          metadata: Json | null
          mime_type: string | null
          name: string
          processed_at: string | null
          processing_status: string | null
          quality_score: number | null
          source_type: string | null
          tags: string[] | null
          tenant_id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          access_count?: number | null
          agent_id?: string | null
          category?: string | null
          confidence_score?: number | null
          content_hash?: string | null
          created_at?: string | null
          description?: string | null
          domain?: string | null
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_global?: boolean | null
          last_accessed?: string | null
          metadata?: Json | null
          mime_type?: string | null
          name: string
          processed_at?: string | null
          processing_status?: string | null
          quality_score?: number | null
          source_type?: string | null
          tags?: string[] | null
          tenant_id: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          access_count?: number | null
          agent_id?: string | null
          category?: string | null
          confidence_score?: number | null
          content_hash?: string | null
          created_at?: string | null
          description?: string | null
          domain?: string | null
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_global?: boolean | null
          last_accessed?: string | null
          metadata?: Json | null
          mime_type?: string | null
          name?: string
          processed_at?: string | null
          processing_status?: string | null
          quality_score?: number | null
          source_type?: string | null
          tags?: string[] | null
          tenant_id?: string
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
          agent_id: string | null
          avg_similarity_score: number | null
          created_at: string | null
          id: string
          query_domain: string | null
          query_embedding: string | null
          query_text: string
          results_count: number | null
          search_time_ms: number | null
          session_id: string | null
          tenant_id: string
          top_similarity_score: number | null
          total_chunks_searched: number | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          avg_similarity_score?: number | null
          created_at?: string | null
          id?: string
          query_domain?: string | null
          query_embedding?: string | null
          query_text: string
          results_count?: number | null
          search_time_ms?: number | null
          session_id?: string | null
          tenant_id: string
          top_similarity_score?: number | null
          total_chunks_searched?: number | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          avg_similarity_score?: number | null
          created_at?: string | null
          id?: string
          query_domain?: string | null
          query_embedding?: string | null
          query_text?: string
          results_count?: number | null
          search_time_ms?: number | null
          session_id?: string | null
          tenant_id?: string
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
          tenant_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: string
          name: string
          settings?: Json | null
          subscription_tier?: string | null
          tenant_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          name?: string
          settings?: Json | null
          subscription_tier?: string | null
          tenant_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          last_seen_at: string | null
          organization_id: string | null
          role: string | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          last_seen_at?: string | null
          organization_id?: string | null
          role?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_seen_at?: string | null
          organization_id?: string | null
          role?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      virtual_boards: {
        Row: {
          board_type: string
          consensus_method: string | null
          created_at: string | null
          focus_areas: Json
          id: string
          is_active: boolean | null
          lead_agent_id: number | null
          name: string
          quorum_requirement: number | null
          updated_at: string | null
        }
        Insert: {
          board_type: string
          consensus_method?: string | null
          created_at?: string | null
          focus_areas?: Json
          id?: string
          is_active?: boolean | null
          lead_agent_id?: number | null
          name: string
          quorum_requirement?: number | null
          updated_at?: string | null
        }
        Update: {
          board_type?: string
          consensus_method?: string | null
          created_at?: string | null
          focus_areas?: Json
          id?: string
          is_active?: boolean | null
          lead_agent_id?: number | null
          name?: string
          quorum_requirement?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "virtual_boards_lead_agent_id_fkey"
            columns: ["lead_agent_id"]
            isOneToOne: false
            referencedRelation: "expert_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_executions: {
        Row: {
          created_at: string | null
          current_step: number | null
          duration_ms: number | null
          error_details: Json | null
          error_message: string | null
          execution_name: string | null
          finished_at: string | null
          id: string
          input_data: Json | null
          metadata: Json | null
          output_data: Json | null
          started_at: string | null
          status: string | null
          step_results: Json | null
          triggered_by: string | null
          workflow_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_step?: number | null
          duration_ms?: number | null
          error_details?: Json | null
          error_message?: string | null
          execution_name?: string | null
          finished_at?: string | null
          id?: string
          input_data?: Json | null
          metadata?: Json | null
          output_data?: Json | null
          started_at?: string | null
          status?: string | null
          step_results?: Json | null
          triggered_by?: string | null
          workflow_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_step?: number | null
          duration_ms?: number | null
          error_details?: Json | null
          error_message?: string | null
          execution_name?: string | null
          finished_at?: string | null
          id?: string
          input_data?: Json | null
          metadata?: Json | null
          output_data?: Json | null
          started_at?: string | null
          status?: string | null
          step_results?: Json | null
          triggered_by?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_triggered_by_fkey"
            columns: ["triggered_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_steps: {
        Row: {
          agent_id: string | null
          configuration: Json | null
          created_at: string | null
          description: string | null
          id: string
          input_schema: Json | null
          is_optional: boolean | null
          output_schema: Json | null
          required_capabilities: string[] | null
          retry_config: Json | null
          step_name: string
          step_order: number
          step_type: string
          timeout_seconds: number | null
          updated_at: string | null
          workflow_id: string | null
        }
        Insert: {
          agent_id?: string | null
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          input_schema?: Json | null
          is_optional?: boolean | null
          output_schema?: Json | null
          required_capabilities?: string[] | null
          retry_config?: Json | null
          step_name: string
          step_order: number
          step_type: string
          timeout_seconds?: number | null
          updated_at?: string | null
          workflow_id?: string | null
        }
        Update: {
          agent_id?: string | null
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          input_schema?: Json | null
          is_optional?: boolean | null
          output_schema?: Json | null
          required_capabilities?: string[] | null
          retry_config?: Json | null
          step_name?: string
          step_order?: number
          step_type?: string
          timeout_seconds?: number | null
          updated_at?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          configuration: Json | null
          created_at: string | null
          created_by: string | null
          definition: Json | null
          description: string | null
          id: string
          is_active: boolean | null
          is_template: boolean | null
          last_run_at: string | null
          last_run_status: string | null
          name: string
          organization_id: string | null
          project_id: string | null
          run_count: number | null
          template_id: string | null
          trigger_conditions: Json | null
          updated_at: string | null
          version: string | null
          workflow_type: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string | null
          created_by?: string | null
          definition?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          last_run_at?: string | null
          last_run_status?: string | null
          name: string
          organization_id?: string | null
          project_id?: string | null
          run_count?: number | null
          template_id?: string | null
          trigger_conditions?: Json | null
          updated_at?: string | null
          version?: string | null
          workflow_type: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string | null
          created_by?: string | null
          definition?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          last_run_at?: string | null
          last_run_status?: string | null
          name?: string
          organization_id?: string | null
          project_id?: string | null
          run_count?: number | null
          template_id?: string | null
          trigger_conditions?: Json | null
          updated_at?: string | null
          version?: string | null
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_agent_tier_lifecycle_view: {
        Row: {
          created_at: string | null
          created_by: string | null
          display_name: string | null
          id: string | null
          lifecycle_stage: Database["public"]["Enums"]["agent_status"] | null
          name: string | null
          tier: number | null
          tier_label: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          display_name?: string | null
          id?: string | null
          lifecycle_stage?: Database["public"]["Enums"]["agent_status"] | null
          name?: string | null
          tier?: number | null
          tier_label?: never
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          display_name?: string | null
          id?: string | null
          lifecycle_stage?: Database["public"]["Enums"]["agent_status"] | null
          name?: string | null
          tier?: number | null
          tier_label?: never
          updated_at?: string | null
        }
        Relationships: []
      }
      agent_capabilities_detailed_view: {
        Row: {
          agent_display_name: string | null
          agent_id: string | null
          agent_name: string | null
          capability_id: string | null
          capability_key: string | null
          capability_name: string | null
          category: string | null
          color: string | null
          complexity_level: string | null
          description: string | null
          domain: string | null
          icon: string | null
          is_primary: boolean | null
          lifecycle_stage: Database["public"]["Enums"]["agent_status"] | null
          linked_at: string | null
          proficiency_level: string | null
          success_rate: number | null
          tier: number | null
          tier_label: string | null
          usage_count: number | null
        }
        Relationships: []
      }
      agent_support_overview: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          agent_role: string | null
          agent_role_category: string | null
          status: Database["public"]["Enums"]["agent_status"] | null
          supported_org_roles: string[] | null
          supported_org_roles_count: number | null
          tier: number | null
        }
        Relationships: []
      }
      organizational_role_support: {
        Row: {
          business_function: string | null
          department: string | null
          level: string | null
          org_role_id: string | null
          org_role_name: string | null
          supporting_agents: string[] | null
          supporting_agents_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_update_agent_lifecycle_stage: {
        Args: { agent_id_param: string; new_status: string }
        Returns: boolean
      }
      admin_update_agent_tier: {
        Args: { agent_id_param: string; new_tier: number }
        Returns: boolean
      }
      admin_update_agent_tier_and_lifecycle: {
        Args: { agent_id_param: string; new_status?: string; new_tier?: number }
        Returns: boolean
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      can_edit_agent: {
        Args: { agent_id: string }
        Returns: boolean
      }
      get_agent_assigned_capabilities: {
        Args: { agent_name_param: string }
        Returns: {
          competencies: Json
          contribution_notes: string
          description: string
          display_name: string
          expertise_score: number
          id: string
          last_review: string
          name: string
          relationship_type: string
          stage: string
          vital_component: string
        }[]
      }
      get_agent_capabilities_detailed: {
        Args: { agent_name_param: string }
        Returns: {
          bullet_points: string[]
          capability_id: string
          category: string
          color: string
          complexity_level: string
          description: string
          display_name: string
          domain: string
          icon: string
          is_primary: boolean
          name: string
          proficiency_level: string
        }[]
      }
      get_available_capabilities: {
        Args: Record<PropertyKey, never>
        Returns: {
          bullet_points: string[]
          category: string
          color: string
          complexity_level: string
          description: string
          display_name: string
          domain: string
          icon: string
          id: string
          name: string
        }[]
      }
      get_available_capabilities_for_agent: {
        Args: { agent_name_param: string }
        Returns: {
          assignment_priority: number
          competencies: Json
          description: string
          display_name: string
          id: string
          is_assigned: boolean
          maturity: string
          name: string
          priority: string
          stage: string
          vital_component: string
        }[]
      }
      get_capabilities_by_stage: {
        Args: { stage_param: string }
        Returns: {
          capability_key: string
          competencies: Json
          description: string
          id: string
          is_new: boolean
          lead_agent_name: string
          lead_agent_org: string
          maturity: string
          name: string
          panel_recommended: boolean
          priority: string
          supporting_agents_count: number
          vital_component: string
        }[]
      }
      get_or_create_user_tenant: {
        Args: { p_user_id: string; p_user_name: string }
        Returns: string
      }
      get_super_admin_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      migrate_agent_capabilities_to_registry: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      search_rag_knowledge: {
        Args: {
          include_global?: boolean
          match_count?: number
          match_threshold?: number
          p_agent_id?: string
          p_domain?: string
          p_tenant_id?: string
          query_embedding: string
        }
        Returns: {
          agent_id: string
          chunk_id: string
          content: string
          domain: string
          is_global: boolean
          metadata: Json
          section_title: string
          similarity: number
          source_id: string
          source_name: string
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      agent_domain:
        | "design_ux"
        | "healthcare_clinical"
        | "technology_engineering"
        | "business_strategy"
        | "global_regulatory"
        | "patient_advocacy"
      agent_status:
        | "development"
        | "testing"
        | "active"
        | "deprecated"
        | "inactive"
        | "planned"
        | "pipeline"
      data_classification: "public" | "internal" | "confidential" | "restricted"
      domain_expertise:
        | "medical"
        | "regulatory"
        | "legal"
        | "financial"
        | "business"
        | "technical"
        | "commercial"
        | "access"
        | "general"
      lifecycle_stage:
        | "unmet_needs_investigation"
        | "solution_design"
        | "prototyping_development"
        | "clinical_validation"
        | "regulatory_pathway"
        | "reimbursement_strategy"
        | "go_to_market"
        | "post_market_optimization"
      maturity_level:
        | "level_1_initial"
        | "level_2_developing"
        | "level_3_advanced"
        | "level_4_leading"
        | "level_5_transformative"
      priority_level:
        | "critical_immediate"
        | "near_term_90_days"
        | "strategic_180_days"
        | "future_horizon"
      risk_level: "low" | "medium" | "high" | "critical"
      validation_status:
        | "validated"
        | "pending"
        | "in_review"
        | "expired"
        | "not_required"
      vital_framework:
        | "V_value_discovery"
        | "I_intelligence_gathering"
        | "T_transformation_design"
        | "A_acceleration_execution"
        | "L_leadership_scale"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      agent_domain: [
        "design_ux",
        "healthcare_clinical",
        "technology_engineering",
        "business_strategy",
        "global_regulatory",
        "patient_advocacy",
      ],
      agent_status: [
        "development",
        "testing",
        "active",
        "deprecated",
        "inactive",
        "planned",
        "pipeline",
      ],
      data_classification: ["public", "internal", "confidential", "restricted"],
      domain_expertise: [
        "medical",
        "regulatory",
        "legal",
        "financial",
        "business",
        "technical",
        "commercial",
        "access",
        "general",
      ],
      lifecycle_stage: [
        "unmet_needs_investigation",
        "solution_design",
        "prototyping_development",
        "clinical_validation",
        "regulatory_pathway",
        "reimbursement_strategy",
        "go_to_market",
        "post_market_optimization",
      ],
      maturity_level: [
        "level_1_initial",
        "level_2_developing",
        "level_3_advanced",
        "level_4_leading",
        "level_5_transformative",
      ],
      priority_level: [
        "critical_immediate",
        "near_term_90_days",
        "strategic_180_days",
        "future_horizon",
      ],
      risk_level: ["low", "medium", "high", "critical"],
      validation_status: [
        "validated",
        "pending",
        "in_review",
        "expired",
        "not_required",
      ],
      vital_framework: [
        "V_value_discovery",
        "I_intelligence_gathering",
        "T_transformation_design",
        "A_acceleration_execution",
        "L_leadership_scale",
      ],
    },
  },
} as const

