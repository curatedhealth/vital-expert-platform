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
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_capabilities: {
        Row: {
          agent_id: string
          capability_id: string
          clinical_accuracy_threshold: number | null
          competency_ids: string[] | null
          created_at: string
          custom_config: Json | null
          id: string
          is_primary: boolean | null
          last_used_at: string | null
          medical_validation_required: boolean | null
          pharma_config: Json | null
          proficiency_level: string | null
          success_rate: number | null
          updated_at: string
          usage_count: number | null
          validated_by: string | null
          validation_date: string | null
          verify_config: Json | null
        }
        Insert: {
          agent_id: string
          capability_id: string
          clinical_accuracy_threshold?: number | null
          competency_ids?: string[] | null
          created_at?: string
          custom_config?: Json | null
          id?: string
          is_primary?: boolean | null
          last_used_at?: string | null
          medical_validation_required?: boolean | null
          pharma_config?: Json | null
          proficiency_level?: string | null
          success_rate?: number | null
          updated_at?: string
          usage_count?: number | null
          validated_by?: string | null
          validation_date?: string | null
          verify_config?: Json | null
        }
        Update: {
          agent_id?: string
          capability_id?: string
          clinical_accuracy_threshold?: number | null
          competency_ids?: string[] | null
          created_at?: string
          custom_config?: Json | null
          id?: string
          is_primary?: boolean | null
          last_used_at?: string | null
          medical_validation_required?: boolean | null
          pharma_config?: Json | null
          proficiency_level?: string | null
          success_rate?: number | null
          updated_at?: string
          usage_count?: number | null
          validated_by?: string | null
          validation_date?: string | null
          verify_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_capabilities_capability_id_fkey"
            columns: ["capability_id"]
            isOneToOne: false
            referencedRelation: "capabilities"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_categories: {
        Row: {
          color: string
          created_at: string
          description: string | null
          display_name: string
          icon: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          display_name: string
          icon?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          display_name?: string
          icon?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      agent_category_mapping: {
        Row: {
          agent_id: string | null
          category_id: string | null
          created_at: string
          id: string
        }
        Insert: {
          agent_id?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
        }
        Update: {
          agent_id?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_category_mapping_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "agent_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_collaborations: {
        Row: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          name: string
          primary_agent_id: string | null
          secondary_agents: Json
          success_metrics: Json
          trigger_conditions: Json
          updated_at: string
          workflow_pattern: Json
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          name: string
          primary_agent_id?: string | null
          secondary_agents?: Json
          success_metrics?: Json
          trigger_conditions?: Json
          updated_at?: string
          workflow_pattern: Json
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          name?: string
          primary_agent_id?: string | null
          secondary_agents?: Json
          success_metrics?: Json
          trigger_conditions?: Json
          updated_at?: string
          workflow_pattern?: Json
        }
        Relationships: []
      }
      agent_performance_metrics: {
        Row: {
          accuracy_score: number | null
          agent_id: string | null
          avg_response_time_ms: number
          completeness_score: number | null
          created_at: string
          decisions_supported: number
          documents_generated: number
          id: string
          metric_date: string
          query_count: number
          relevance_score: number | null
          success_rate: number
          time_saved_minutes: number
          user_id: string | null
          user_satisfaction_score: number | null
        }
        Insert: {
          accuracy_score?: number | null
          agent_id?: string | null
          avg_response_time_ms?: number
          completeness_score?: number | null
          created_at?: string
          decisions_supported?: number
          documents_generated?: number
          id?: string
          metric_date?: string
          query_count?: number
          relevance_score?: number | null
          success_rate?: number
          time_saved_minutes?: number
          user_id?: string | null
          user_satisfaction_score?: number | null
        }
        Update: {
          accuracy_score?: number | null
          agent_id?: string | null
          avg_response_time_ms?: number
          completeness_score?: number | null
          created_at?: string
          decisions_supported?: number
          documents_generated?: number
          id?: string
          metric_date?: string
          query_count?: number
          relevance_score?: number | null
          success_rate?: number
          time_saved_minutes?: number
          user_id?: string | null
          user_satisfaction_score?: number | null
        }
        Relationships: []
      }
      agent_prompts: {
        Row: {
          agent_id: string
          created_at: string | null
          customizations: Json | null
          id: string
          is_default: boolean | null
          prompt_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          customizations?: Json | null
          id?: string
          is_default?: boolean | null
          prompt_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          customizations?: Json | null
          id?: string
          is_default?: boolean | null
          prompt_id?: string
        }
        Relationships: [
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
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          accuracy_score: number | null
          audit_trail_enabled: boolean | null
          availability_status: string | null
          avatar: string | null
          average_response_time: number | null
          bar_admissions: string[] | null
          business_function: string | null
          capabilities: string[]
          citation_requirements: Json | null
          color: string | null
          compatible_agents: string[] | null
          competency_levels: Json | null
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
          priority: number | null
          rag_enabled: boolean | null
          rate_limits: Json | null
          regulatory_context: Json | null
          reimbursement_models: string[] | null
          response_format: string | null
          reviewer_id: string | null
          role: string | null
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
          verify_enabled: boolean | null
          version: string | null
          workflow_positions: string[] | null
        }
        Insert: {
          accuracy_score?: number | null
          audit_trail_enabled?: boolean | null
          availability_status?: string | null
          avatar?: string | null
          average_response_time?: number | null
          bar_admissions?: string[] | null
          business_function?: string | null
          capabilities: string[]
          citation_requirements?: Json | null
          color?: string | null
          compatible_agents?: string[] | null
          competency_levels?: Json | null
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
          priority?: number | null
          rag_enabled?: boolean | null
          rate_limits?: Json | null
          regulatory_context?: Json | null
          reimbursement_models?: string[] | null
          response_format?: string | null
          reviewer_id?: string | null
          role?: string | null
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
          verify_enabled?: boolean | null
          version?: string | null
          workflow_positions?: string[] | null
        }
        Update: {
          accuracy_score?: number | null
          audit_trail_enabled?: boolean | null
          availability_status?: string | null
          avatar?: string | null
          average_response_time?: number | null
          bar_admissions?: string[] | null
          business_function?: string | null
          capabilities?: string[]
          citation_requirements?: Json | null
          color?: string | null
          compatible_agents?: string[] | null
          competency_levels?: Json | null
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
          priority?: number | null
          rag_enabled?: boolean | null
          rate_limits?: Json | null
          regulatory_context?: Json | null
          reimbursement_models?: string[] | null
          response_format?: string | null
          reviewer_id?: string | null
          role?: string | null
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
          verify_enabled?: boolean | null
          version?: string | null
          workflow_positions?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_parent_agent_id_fkey"
            columns: ["parent_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      business_functions: {
        Row: {
          created_at: string
          department: string | null
          description: string | null
          healthcare_category: string | null
          id: string
          name: string
          regulatory_requirements: string[] | null
        }
        Insert: {
          created_at?: string
          department?: string | null
          description?: string | null
          healthcare_category?: string | null
          id?: string
          name: string
          regulatory_requirements?: string[] | null
        }
        Update: {
          created_at?: string
          department?: string | null
          description?: string | null
          healthcare_category?: string | null
          id?: string
          name?: string
          regulatory_requirements?: string[] | null
        }
        Relationships: []
      }
      capabilities: {
        Row: {
          accuracy_threshold: number | null
          audit_trail: Json | null
          average_execution_time: number | null
          category: string
          citation_required: boolean | null
          clinical_validation_status: string | null
          color: string | null
          complexity_level: string | null
          created_at: string
          description: string
          display_name: string
          domain: string
          fda_classification: string | null
          hipaa_relevant: boolean | null
          icon: string | null
          id: string
          is_premium: boolean | null
          last_clinical_review: string | null
          medical_domain: string | null
          name: string
          pharma_protocol: Json | null
          prerequisites: Json | null
          requires_api_access: boolean | null
          requires_training: boolean | null
          status: string
          success_rate: number | null
          system_prompt_template: string | null
          updated_at: string
          usage_count: number | null
          validation_rules: Json | null
          verify_protocol: Json | null
          version: string | null
        }
        Insert: {
          accuracy_threshold?: number | null
          audit_trail?: Json | null
          average_execution_time?: number | null
          category?: string
          citation_required?: boolean | null
          clinical_validation_status?: string | null
          color?: string | null
          complexity_level?: string | null
          created_at?: string
          description: string
          display_name: string
          domain?: string
          fda_classification?: string | null
          hipaa_relevant?: boolean | null
          icon?: string | null
          id?: string
          is_premium?: boolean | null
          last_clinical_review?: string | null
          medical_domain?: string | null
          name: string
          pharma_protocol?: Json | null
          prerequisites?: Json | null
          requires_api_access?: boolean | null
          requires_training?: boolean | null
          status?: string
          success_rate?: number | null
          system_prompt_template?: string | null
          updated_at?: string
          usage_count?: number | null
          validation_rules?: Json | null
          verify_protocol?: Json | null
          version?: string | null
        }
        Update: {
          accuracy_threshold?: number | null
          audit_trail?: Json | null
          average_execution_time?: number | null
          category?: string
          citation_required?: boolean | null
          clinical_validation_status?: string | null
          color?: string | null
          complexity_level?: string | null
          created_at?: string
          description?: string
          display_name?: string
          domain?: string
          fda_classification?: string | null
          hipaa_relevant?: boolean | null
          icon?: string | null
          id?: string
          is_premium?: boolean | null
          last_clinical_review?: string | null
          medical_domain?: string | null
          name?: string
          pharma_protocol?: Json | null
          prerequisites?: Json | null
          requires_api_access?: boolean | null
          requires_training?: boolean | null
          status?: string
          success_rate?: number | null
          system_prompt_template?: string | null
          updated_at?: string
          usage_count?: number | null
          validation_rules?: Json | null
          verify_protocol?: Json | null
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
      capability_tools: {
        Row: {
          auto_enabled: boolean | null
          capability_id: string
          configuration: Json | null
          created_at: string
          id: string
          is_required: boolean | null
          tool_id: string
        }
        Insert: {
          auto_enabled?: boolean | null
          capability_id: string
          configuration?: Json | null
          created_at?: string
          id?: string
          is_required?: boolean | null
          tool_id: string
        }
        Update: {
          auto_enabled?: boolean | null
          capability_id?: string
          configuration?: Json | null
          created_at?: string
          id?: string
          is_required?: boolean | null
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "capability_tools_capability_id_fkey"
            columns: ["capability_id"]
            isOneToOne: false
            referencedRelation: "capabilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capability_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
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
      competencies: {
        Row: {
          audit_log: Json | null
          capability_id: string
          clinical_guidelines_reference: string[] | null
          created_at: string
          description: string | null
          evidence_level: string | null
          icd_codes: string[] | null
          id: string
          is_required: boolean | null
          medical_accuracy_requirement: number | null
          name: string
          order_priority: number | null
          prompt_snippet: string | null
          quality_metrics: Json | null
          required_knowledge: Json | null
          requires_medical_review: boolean | null
          snomed_codes: string[] | null
          updated_at: string
        }
        Insert: {
          audit_log?: Json | null
          capability_id: string
          clinical_guidelines_reference?: string[] | null
          created_at?: string
          description?: string | null
          evidence_level?: string | null
          icd_codes?: string[] | null
          id?: string
          is_required?: boolean | null
          medical_accuracy_requirement?: number | null
          name: string
          order_priority?: number | null
          prompt_snippet?: string | null
          quality_metrics?: Json | null
          required_knowledge?: Json | null
          requires_medical_review?: boolean | null
          snomed_codes?: string[] | null
          updated_at?: string
        }
        Update: {
          audit_log?: Json | null
          capability_id?: string
          clinical_guidelines_reference?: string[] | null
          created_at?: string
          description?: string | null
          evidence_level?: string | null
          icd_codes?: string[] | null
          id?: string
          is_required?: boolean | null
          medical_accuracy_requirement?: number | null
          name?: string
          order_priority?: number | null
          prompt_snippet?: string | null
          quality_metrics?: Json | null
          required_knowledge?: Json | null
          requires_medical_review?: boolean | null
          snomed_codes?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competencies_capability_id_fkey"
            columns: ["capability_id"]
            isOneToOne: false
            referencedRelation: "capabilities"
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
      job_dependencies: {
        Row: {
          created_at: string | null
          dependency_type: string | null
          depends_on_job_id: string
          id: string
          job_id: string
        }
        Insert: {
          created_at?: string | null
          dependency_type?: string | null
          depends_on_job_id: string
          id?: string
          job_id: string
        }
        Update: {
          created_at?: string | null
          dependency_type?: string | null
          depends_on_job_id?: string
          id?: string
          job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_dependencies_depends_on_job_id_fkey"
            columns: ["depends_on_job_id"]
            isOneToOne: false
            referencedRelation: "active_jobs_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_dependencies_depends_on_job_id_fkey"
            columns: ["depends_on_job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_dependencies_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "active_jobs_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_dependencies_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_logs: {
        Row: {
          details: Json | null
          id: string
          job_id: string
          log_level: string | null
          logged_at: string | null
          message: string
        }
        Insert: {
          details?: Json | null
          id?: string
          job_id: string
          log_level?: string | null
          logged_at?: string | null
          message: string
        }
        Update: {
          details?: Json | null
          id?: string
          job_id?: string
          log_level?: string | null
          logged_at?: string | null
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "active_jobs_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          actual_duration_minutes: number | null
          agent_id: string | null
          completed_at: string | null
          cpu_usage_percent: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          error_details: Json | null
          error_message: string | null
          estimated_duration_minutes: number | null
          id: string
          input_data: Json | null
          job_config: Json | null
          job_name: string
          job_type: string
          max_retries: number | null
          memory_usage_mb: number | null
          metadata: Json | null
          output_data: Json | null
          priority: number | null
          processing_cost: number | null
          progress: number | null
          retry_count: number | null
          scheduled_at: string | null
          source_id: string | null
          started_at: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          updated_by: string | null
          user_id: string | null
          workflow_id: string | null
        }
        Insert: {
          actual_duration_minutes?: number | null
          agent_id?: string | null
          completed_at?: string | null
          cpu_usage_percent?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          error_details?: Json | null
          error_message?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          input_data?: Json | null
          job_config?: Json | null
          job_name: string
          job_type: string
          max_retries?: number | null
          memory_usage_mb?: number | null
          metadata?: Json | null
          output_data?: Json | null
          priority?: number | null
          processing_cost?: number | null
          progress?: number | null
          retry_count?: number | null
          scheduled_at?: string | null
          source_id?: string | null
          started_at?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
          workflow_id?: string | null
        }
        Update: {
          actual_duration_minutes?: number | null
          agent_id?: string | null
          completed_at?: string | null
          cpu_usage_percent?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          error_details?: Json | null
          error_message?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          input_data?: Json | null
          job_config?: Json | null
          job_name?: string
          job_type?: string
          max_retries?: number | null
          memory_usage_mb?: number | null
          metadata?: Json | null
          output_data?: Json | null
          priority?: number | null
          processing_cost?: number | null
          progress?: number | null
          retry_count?: number | null
          scheduled_at?: string | null
          source_id?: string | null
          started_at?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      jtbd_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      jtbd_core: {
        Row: {
          category_id: string | null
          created_at: string | null
          current_solutions: Json | null
          description: string | null
          desired_outcome: string | null
          id: string
          job_statement: string
          metadata: Json | null
          name: string
          pain_points: Json | null
          priority: string | null
          status: string | null
          success_criteria: Json | null
          tags: string[] | null
          target_personas: string[] | null
          updated_at: string | null
          when_situation: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          current_solutions?: Json | null
          description?: string | null
          desired_outcome?: string | null
          id?: string
          job_statement: string
          metadata?: Json | null
          name: string
          pain_points?: Json | null
          priority?: string | null
          status?: string | null
          success_criteria?: Json | null
          tags?: string[] | null
          target_personas?: string[] | null
          updated_at?: string | null
          when_situation?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          current_solutions?: Json | null
          description?: string | null
          desired_outcome?: string | null
          id?: string
          job_statement?: string
          metadata?: Json | null
          name?: string
          pain_points?: Json | null
          priority?: string | null
          status?: string | null
          success_criteria?: Json | null
          tags?: string[] | null
          target_personas?: string[] | null
          updated_at?: string | null
          when_situation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jtbd_core_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "jtbd_categories"
            referencedColumns: ["id"]
          },
        ]
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
      llm_provider_metrics: {
        Row: {
          auth_error_count: number | null
          avg_confidence_score: number | null
          avg_cost_per_request: number | null
          avg_latency_ms: number | null
          avg_medical_accuracy: number | null
          cancelled_requests: number | null
          clinical_validations_failed: number | null
          clinical_validations_passed: number | null
          created_at: string | null
          error_rate: number | null
          failed_requests: number | null
          health_check_success_rate: number | null
          id: string
          max_latency_ms: number | null
          metric_date: string
          metric_hour: number | null
          p50_latency_ms: number | null
          p95_latency_ms: number | null
          p99_latency_ms: number | null
          peak_concurrent_requests: number | null
          phi_requests_count: number | null
          provider_id: string
          rate_limit_count: number | null
          server_error_count: number | null
          successful_requests: number | null
          timeout_count: number | null
          total_cost: number | null
          total_input_tokens: number | null
          total_output_tokens: number | null
          total_requests: number | null
          total_tokens: number | null
          unique_agents_count: number | null
          unique_users_count: number | null
          uptime_minutes: number | null
        }
        Insert: {
          auth_error_count?: number | null
          avg_confidence_score?: number | null
          avg_cost_per_request?: number | null
          avg_latency_ms?: number | null
          avg_medical_accuracy?: number | null
          cancelled_requests?: number | null
          clinical_validations_failed?: number | null
          clinical_validations_passed?: number | null
          created_at?: string | null
          error_rate?: number | null
          failed_requests?: number | null
          health_check_success_rate?: number | null
          id?: string
          max_latency_ms?: number | null
          metric_date: string
          metric_hour?: number | null
          p50_latency_ms?: number | null
          p95_latency_ms?: number | null
          p99_latency_ms?: number | null
          peak_concurrent_requests?: number | null
          phi_requests_count?: number | null
          provider_id: string
          rate_limit_count?: number | null
          server_error_count?: number | null
          successful_requests?: number | null
          timeout_count?: number | null
          total_cost?: number | null
          total_input_tokens?: number | null
          total_output_tokens?: number | null
          total_requests?: number | null
          total_tokens?: number | null
          unique_agents_count?: number | null
          unique_users_count?: number | null
          uptime_minutes?: number | null
        }
        Update: {
          auth_error_count?: number | null
          avg_confidence_score?: number | null
          avg_cost_per_request?: number | null
          avg_latency_ms?: number | null
          avg_medical_accuracy?: number | null
          cancelled_requests?: number | null
          clinical_validations_failed?: number | null
          clinical_validations_passed?: number | null
          created_at?: string | null
          error_rate?: number | null
          failed_requests?: number | null
          health_check_success_rate?: number | null
          id?: string
          max_latency_ms?: number | null
          metric_date?: string
          metric_hour?: number | null
          p50_latency_ms?: number | null
          p95_latency_ms?: number | null
          p99_latency_ms?: number | null
          peak_concurrent_requests?: number | null
          phi_requests_count?: number | null
          provider_id?: string
          rate_limit_count?: number | null
          server_error_count?: number | null
          successful_requests?: number | null
          timeout_count?: number | null
          total_cost?: number | null
          total_input_tokens?: number | null
          total_output_tokens?: number | null
          total_requests?: number | null
          total_tokens?: number | null
          unique_agents_count?: number | null
          unique_users_count?: number | null
          uptime_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "llm_provider_metrics_provider_id_fkey"
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
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
            foreignKeyName: "llm_usage_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "llm_usage_logs_llm_provider_id_fkey"
            columns: ["llm_provider_id"]
            isOneToOne: false
            referencedRelation: "llm_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_validations: {
        Row: {
          accuracy_score: number | null
          audit_trail: Json | null
          entity_id: string
          entity_type: string
          expiration_date: string | null
          id: string
          notes: string | null
          validation_date: string
          validation_result: Json | null
          validation_type: string | null
          validator_credentials: string | null
          validator_id: string | null
        }
        Insert: {
          accuracy_score?: number | null
          audit_trail?: Json | null
          entity_id: string
          entity_type: string
          expiration_date?: string | null
          id?: string
          notes?: string | null
          validation_date?: string
          validation_result?: Json | null
          validation_type?: string | null
          validator_credentials?: string | null
          validator_id?: string | null
        }
        Update: {
          accuracy_score?: number | null
          audit_trail?: Json | null
          entity_id?: string
          entity_type?: string
          expiration_date?: string | null
          id?: string
          notes?: string | null
          validation_date?: string
          validation_result?: Json | null
          validation_type?: string | null
          validator_credentials?: string | null
          validator_id?: string | null
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
      phi_access_log: {
        Row: {
          access_type: string | null
          agent_id: string | null
          audit_metadata: Json | null
          data_classification: string | null
          id: string
          ip_address: unknown | null
          patient_id_hash: string | null
          purpose: string | null
          session_id: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          access_type?: string | null
          agent_id?: string | null
          audit_metadata?: Json | null
          data_classification?: string | null
          id?: string
          ip_address?: unknown | null
          patient_id_hash?: string | null
          purpose?: string | null
          session_id?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          access_type?: string | null
          agent_id?: string | null
          audit_metadata?: Json | null
          data_classification?: string | null
          id?: string
          ip_address?: unknown | null
          patient_id_hash?: string | null
          purpose?: string | null
          session_id?: string | null
          timestamp?: string
          user_id?: string | null
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
      roles: {
        Row: {
          clinical_title: string | null
          compliance_requirements: string[] | null
          created_at: string
          default_capabilities: Json | null
          department: string | null
          id: string
          name: string
          requires_medical_license: boolean | null
          seniority_level: string | null
        }
        Insert: {
          clinical_title?: string | null
          compliance_requirements?: string[] | null
          created_at?: string
          default_capabilities?: Json | null
          department?: string | null
          id?: string
          name: string
          requires_medical_license?: boolean | null
          seniority_level?: string | null
        }
        Update: {
          clinical_title?: string | null
          compliance_requirements?: string[] | null
          created_at?: string
          default_capabilities?: Json | null
          department?: string | null
          id?: string
          name?: string
          requires_medical_license?: boolean | null
          seniority_level?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_prompts: {
        Row: {
          agent_id: string
          approval_date: string | null
          approved_by: string | null
          audit_log: Json | null
          capability_contributions: Json | null
          clinical_validation_status: string | null
          generated_at: string
          generated_by: string | null
          generated_prompt: string
          id: string
          is_active: boolean | null
          medical_disclaimers: string[] | null
          pharma_protocol_included: boolean | null
          tool_configurations: Json | null
          verify_protocol_included: boolean | null
          version: number | null
        }
        Insert: {
          agent_id: string
          approval_date?: string | null
          approved_by?: string | null
          audit_log?: Json | null
          capability_contributions?: Json | null
          clinical_validation_status?: string | null
          generated_at?: string
          generated_by?: string | null
          generated_prompt: string
          id?: string
          is_active?: boolean | null
          medical_disclaimers?: string[] | null
          pharma_protocol_included?: boolean | null
          tool_configurations?: Json | null
          verify_protocol_included?: boolean | null
          version?: number | null
        }
        Update: {
          agent_id?: string
          approval_date?: string | null
          approved_by?: string | null
          audit_log?: Json | null
          capability_contributions?: Json | null
          clinical_validation_status?: string | null
          generated_at?: string
          generated_by?: string | null
          generated_prompt?: string
          id?: string
          is_active?: boolean | null
          medical_disclaimers?: string[] | null
          pharma_protocol_included?: boolean | null
          tool_configurations?: Json | null
          verify_protocol_included?: boolean | null
          version?: number | null
        }
        Relationships: []
      }
      tools: {
        Row: {
          api_endpoint: string | null
          configuration: Json | null
          created_at: string
          data_classification: string | null
          hipaa_compliant: boolean | null
          id: string
          is_active: boolean | null
          last_validation_check: string | null
          medical_database: string | null
          name: string
          rate_limits: Json | null
          required_permissions: Json | null
          tool_type: string | null
          updated_at: string
          validation_endpoint: string | null
        }
        Insert: {
          api_endpoint?: string | null
          configuration?: Json | null
          created_at?: string
          data_classification?: string | null
          hipaa_compliant?: boolean | null
          id?: string
          is_active?: boolean | null
          last_validation_check?: string | null
          medical_database?: string | null
          name: string
          rate_limits?: Json | null
          required_permissions?: Json | null
          tool_type?: string | null
          updated_at?: string
          validation_endpoint?: string | null
        }
        Update: {
          api_endpoint?: string | null
          configuration?: Json | null
          created_at?: string
          data_classification?: string | null
          hipaa_compliant?: boolean | null
          id?: string
          is_active?: boolean | null
          last_validation_check?: string | null
          medical_database?: string | null
          name?: string
          rate_limits?: Json | null
          required_permissions?: Json | null
          tool_type?: string | null
          updated_at?: string
          validation_endpoint?: string | null
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
      user_profiles: {
        Row: {
          created_at: string
          created_by: string | null
          department: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          last_login: string | null
          organization: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department?: string | null
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_login?: string | null
          organization?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_login?: string | null
          organization?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          session_token?: string
          user_agent?: string | null
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
      active_jobs_view: {
        Row: {
          actual_duration_minutes: number | null
          agent_id: string | null
          agent_name: string | null
          completed_at: string | null
          cpu_usage_percent: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          error_details: Json | null
          error_message: string | null
          estimated_duration_minutes: number | null
          estimated_remaining_minutes: number | null
          id: string | null
          input_data: Json | null
          job_config: Json | null
          job_name: string | null
          job_type: string | null
          max_retries: number | null
          memory_usage_mb: number | null
          metadata: Json | null
          output_data: Json | null
          priority: number | null
          processing_cost: number | null
          progress: number | null
          retry_count: number | null
          running_minutes: number | null
          scheduled_at: string | null
          source_id: string | null
          started_at: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          updated_by: string | null
          user_id: string | null
          workflow_id: string | null
          workflow_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      aggregate_daily_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_user_permission: {
        Args: {
          required_action: Database["public"]["Enums"]["permission_action"]
          required_scope: Database["public"]["Enums"]["permission_scope"]
          user_email: string
        }
        Returns: boolean
      }
      cleanup_old_jobs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin_user: {
        Args: { user_email: string }
        Returns: boolean
      }
    }
    Enums: {
      agent_status: "development" | "testing" | "active" | "deprecated"
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
      risk_level: "low" | "medium" | "high" | "critical"
      user_role: "super_admin" | "admin" | "llm_manager" | "user" | "viewer"
      validation_status:
        | "validated"
        | "pending"
        | "in_review"
        | "expired"
        | "not_required"
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
      agent_status: ["development", "testing", "active", "deprecated"],
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
      risk_level: ["low", "medium", "high", "critical"],
      user_role: ["super_admin", "admin", "llm_manager", "user", "viewer"],
      validation_status: [
        "validated",
        "pending",
        "in_review",
        "expired",
        "not_required",
      ],
    },
  },
} as const

