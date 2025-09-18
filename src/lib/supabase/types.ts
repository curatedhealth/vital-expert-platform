// Generated TypeScript types for Supabase database
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string
          avatar: string
          color: string
          system_prompt: string
          model: string
          temperature: number
          max_tokens: number
          capabilities: Json
          specializations: Json
          tools: Json
          tier: number
          priority: number
          implementation_phase: number
          rag_enabled: boolean
          knowledge_domains: Json
          data_sources: Json
          roi_metrics: Json
          use_cases: Json
          target_users: Json
          required_integrations: Json
          security_level: string
          compliance_requirements: Json
          status: 'active' | 'inactive' | 'development' | 'deprecated'
          is_custom: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description: string
          avatar?: string
          color?: string
          system_prompt: string
          model?: string
          temperature?: number
          max_tokens?: number
          capabilities?: Json
          specializations?: Json
          tools?: Json
          tier?: number
          priority?: number
          implementation_phase?: number
          rag_enabled?: boolean
          knowledge_domains?: Json
          data_sources?: Json
          roi_metrics?: Json
          use_cases?: Json
          target_users?: Json
          required_integrations?: Json
          security_level?: string
          compliance_requirements?: Json
          status?: 'active' | 'inactive' | 'development' | 'deprecated'
          is_custom?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string
          avatar?: string
          color?: string
          system_prompt?: string
          model?: string
          temperature?: number
          max_tokens?: number
          capabilities?: Json
          specializations?: Json
          tools?: Json
          tier?: number
          priority?: number
          implementation_phase?: number
          rag_enabled?: boolean
          knowledge_domains?: Json
          data_sources?: Json
          roi_metrics?: Json
          use_cases?: Json
          target_users?: Json
          required_integrations?: Json
          security_level?: string
          compliance_requirements?: Json
          status?: 'active' | 'inactive' | 'development' | 'deprecated'
          is_custom?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      agent_categories: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string | null
          color: string
          icon: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description?: string | null
          color?: string
          icon?: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string | null
          color?: string
          icon?: string
          sort_order?: number
          created_at?: string
        }
      }
      agent_category_mapping: {
        Row: {
          id: string
          agent_id: string
          category_id: string
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          category_id: string
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          category_id?: string
          created_at?: string
        }
      }
      agent_collaborations: {
        Row: {
          id: string
          name: string
          description: string
          workflow_pattern: Json
          primary_agent_id: string | null
          secondary_agents: Json
          trigger_conditions: Json
          success_metrics: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          workflow_pattern: Json
          primary_agent_id?: string | null
          secondary_agents?: Json
          trigger_conditions?: Json
          success_metrics?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          workflow_pattern?: Json
          primary_agent_id?: string | null
          secondary_agents?: Json
          trigger_conditions?: Json
          success_metrics?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      agent_performance_metrics: {
        Row: {
          id: string
          agent_id: string
          user_id: string | null
          query_count: number
          success_rate: number
          avg_response_time_ms: number
          user_satisfaction_score: number | null
          time_saved_minutes: number
          documents_generated: number
          decisions_supported: number
          accuracy_score: number | null
          relevance_score: number | null
          completeness_score: number | null
          metric_date: string
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          user_id?: string | null
          query_count?: number
          success_rate?: number
          avg_response_time_ms?: number
          user_satisfaction_score?: number | null
          time_saved_minutes?: number
          documents_generated?: number
          decisions_supported?: number
          accuracy_score?: number | null
          relevance_score?: number | null
          completeness_score?: number | null
          metric_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          user_id?: string | null
          query_count?: number
          success_rate?: number
          avg_response_time_ms?: number
          user_satisfaction_score?: number | null
          time_saved_minutes?: number
          documents_generated?: number
          decisions_supported?: number
          accuracy_score?: number | null
          relevance_score?: number | null
          completeness_score?: number | null
          metric_date?: string
          created_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          subscription_tier: 'starter' | 'professional' | 'enterprise'
          subscription_status: 'active' | 'inactive' | 'trial' | 'cancelled'
          trial_ends_at: string | null
          max_projects: number
          max_users: number
          settings: Json
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          subscription_tier?: 'starter' | 'professional' | 'enterprise'
          subscription_status?: 'active' | 'inactive' | 'trial' | 'cancelled'
          trial_ends_at?: string | null
          max_projects?: number
          max_users?: number
          settings?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          subscription_tier?: 'starter' | 'professional' | 'enterprise'
          subscription_status?: 'active' | 'inactive' | 'trial' | 'cancelled'
          trial_ends_at?: string | null
          max_projects?: number
          max_users?: number
          settings?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          organization_id: string
          email: string
          full_name: string | null
          role: 'admin' | 'clinician' | 'researcher' | 'member'
          avatar_url: string | null
          settings: Json
          last_seen_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'clinician' | 'researcher' | 'member'
          avatar_url?: string | null
          settings?: Json
          last_seen_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'clinician' | 'researcher' | 'member'
          avatar_url?: string | null
          settings?: Json
          last_seen_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          project_type: 'digital_therapeutic' | 'ai_diagnostic' | 'clinical_decision_support' | 'remote_monitoring' | 'telemedicine_platform' | 'health_analytics'
          current_phase: 'vision' | 'integrate' | 'test' | 'activate' | 'learn'
          phase_progress: Json
          milestones: Json
          regulatory_pathway: string | null
          target_markets: string[] | null
          clinical_indication: string | null
          patient_population: string | null
          primary_endpoints: string[] | null
          secondary_endpoints: string[] | null
          metadata: Json
          is_archived: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          project_type: 'digital_therapeutic' | 'ai_diagnostic' | 'clinical_decision_support' | 'remote_monitoring' | 'telemedicine_platform' | 'health_analytics'
          current_phase?: 'vision' | 'integrate' | 'test' | 'activate' | 'learn'
          phase_progress?: Json
          milestones?: Json
          regulatory_pathway?: string | null
          target_markets?: string[] | null
          clinical_indication?: string | null
          patient_population?: string | null
          primary_endpoints?: string[] | null
          secondary_endpoints?: string[] | null
          metadata?: Json
          is_archived?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          project_type?: 'digital_therapeutic' | 'ai_diagnostic' | 'clinical_decision_support' | 'remote_monitoring' | 'telemedicine_platform' | 'health_analytics'
          current_phase?: 'vision' | 'integrate' | 'test' | 'activate' | 'learn'
          phase_progress?: Json
          milestones?: Json
          regulatory_pathway?: string | null
          target_markets?: string[] | null
          clinical_indication?: string | null
          patient_population?: string | null
          primary_endpoints?: string[] | null
          secondary_endpoints?: string[] | null
          metadata?: Json
          is_archived?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      queries: {
        Row: {
          id: string
          organization_id: string
          project_id: string | null
          user_id: string | null
          phase: 'vision' | 'integrate' | 'test' | 'activate' | 'learn'
          query_text: string
          query_type: 'regulatory' | 'clinical' | 'market' | 'general' | null
          response: Json | null
          citations: Json
          confidence_score: number | null
          models_used: string[] | null
          processing_time_ms: number | null
          tokens_used: number | null
          feedback_rating: number | null
          feedback_text: string | null
          is_bookmarked: boolean
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          project_id?: string | null
          user_id?: string | null
          phase: 'vision' | 'integrate' | 'test' | 'activate' | 'learn'
          query_text: string
          query_type?: 'regulatory' | 'clinical' | 'market' | 'general' | null
          response?: Json | null
          citations?: Json
          confidence_score?: number | null
          models_used?: string[] | null
          processing_time_ms?: number | null
          tokens_used?: number | null
          feedback_rating?: number | null
          feedback_text?: string | null
          is_bookmarked?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          project_id?: string | null
          user_id?: string | null
          phase?: 'vision' | 'integrate' | 'test' | 'activate' | 'learn'
          query_text?: string
          query_type?: 'regulatory' | 'clinical' | 'market' | 'general' | null
          response?: Json | null
          citations?: Json
          confidence_score?: number | null
          models_used?: string[] | null
          processing_time_ms?: number | null
          tokens_used?: number | null
          feedback_rating?: number | null
          feedback_text?: string | null
          is_bookmarked?: boolean
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          organization_id: string
          project_id: string | null
          name: string
          file_name: string | null
          file_size: number | null
          mime_type: string | null
          type: 'regulatory_guidance' | 'clinical_protocol' | 'market_research' | 'internal' | 'sop' | 'template'
          source: string | null
          url: string | null
          content: string | null
          summary: string | null
          metadata: Json
          vector_ids: string[] | null
          indexed_at: string | null
          is_public: boolean
          access_level: 'organization' | 'project' | 'private'
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          project_id?: string | null
          name: string
          file_name?: string | null
          file_size?: number | null
          mime_type?: string | null
          type: 'regulatory_guidance' | 'clinical_protocol' | 'market_research' | 'internal' | 'sop' | 'template'
          source?: string | null
          url?: string | null
          content?: string | null
          summary?: string | null
          metadata?: Json
          vector_ids?: string[] | null
          indexed_at?: string | null
          is_public?: boolean
          access_level?: 'organization' | 'project' | 'private'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          project_id?: string | null
          name?: string
          file_name?: string | null
          file_size?: number | null
          mime_type?: string | null
          type?: 'regulatory_guidance' | 'clinical_protocol' | 'market_research' | 'internal' | 'sop' | 'template'
          source?: string | null
          url?: string | null
          content?: string | null
          summary?: string | null
          metadata?: Json
          vector_ids?: string[] | null
          indexed_at?: string | null
          is_public?: boolean
          access_level?: 'organization' | 'project' | 'private'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workflows: {
        Row: {
          id: string
          organization_id: string
          project_id: string | null
          name: string
          description: string | null
          workflow_type: 'regulatory_submission' | 'clinical_protocol_review' | 'market_access_assessment' | 'rwe_data_collection' | 'compliance_check' | 'document_generation'
          template_id: string | null
          n8n_workflow_id: string | null
          configuration: Json
          is_active: boolean
          trigger_conditions: Json
          last_run_at: string | null
          last_run_status: 'success' | 'error' | 'running' | 'cancelled' | null
          run_count: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          project_id?: string | null
          name: string
          description?: string | null
          workflow_type: 'regulatory_submission' | 'clinical_protocol_review' | 'market_access_assessment' | 'rwe_data_collection' | 'compliance_check' | 'document_generation'
          template_id?: string | null
          n8n_workflow_id?: string | null
          configuration?: Json
          is_active?: boolean
          trigger_conditions?: Json
          last_run_at?: string | null
          last_run_status?: 'success' | 'error' | 'running' | 'cancelled' | null
          run_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          project_id?: string | null
          name?: string
          description?: string | null
          workflow_type?: 'regulatory_submission' | 'clinical_protocol_review' | 'market_access_assessment' | 'rwe_data_collection' | 'compliance_check' | 'document_generation'
          template_id?: string | null
          n8n_workflow_id?: string | null
          configuration?: Json
          is_active?: boolean
          trigger_conditions?: Json
          last_run_at?: string | null
          last_run_status?: 'success' | 'error' | 'running' | 'cancelled' | null
          run_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workflow_executions: {
        Row: {
          id: string
          workflow_id: string
          n8n_execution_id: string | null
          status: 'running' | 'success' | 'error' | 'cancelled'
          input_data: Json | null
          output_data: Json | null
          error_message: string | null
          started_at: string
          finished_at: string | null
          duration_ms: number | null
        }
        Insert: {
          id?: string
          workflow_id: string
          n8n_execution_id?: string | null
          status?: 'running' | 'success' | 'error' | 'cancelled'
          input_data?: Json | null
          output_data?: Json | null
          error_message?: string | null
          started_at?: string
          finished_at?: string | null
          duration_ms?: number | null
        }
        Update: {
          id?: string
          workflow_id?: string
          n8n_execution_id?: string | null
          status?: 'running' | 'success' | 'error' | 'cancelled'
          input_data?: Json | null
          output_data?: Json | null
          error_message?: string | null
          started_at?: string
          finished_at?: string | null
          duration_ms?: number | null
        }
      }
      citations: {
        Row: {
          id: string
          query_id: string
          document_id: string | null
          source_type: 'regulatory' | 'clinical' | 'market' | 'academic' | 'internal'
          source_name: string
          source_url: string | null
          page_number: number | null
          section: string | null
          quote: string
          confidence_score: number | null
          relevance_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          query_id: string
          document_id?: string | null
          source_type: 'regulatory' | 'clinical' | 'market' | 'academic' | 'internal'
          source_name: string
          source_url?: string | null
          page_number?: number | null
          section?: string | null
          quote: string
          confidence_score?: number | null
          relevance_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          query_id?: string
          document_id?: string | null
          source_type?: 'regulatory' | 'clinical' | 'market' | 'academic' | 'internal'
          source_name?: string
          source_url?: string | null
          page_number?: number | null
          section?: string | null
          quote?: string
          confidence_score?: number | null
          relevance_score?: number | null
          created_at?: string
        }
      }
      milestones: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          phase: 'vision' | 'integrate' | 'test' | 'activate' | 'learn'
          milestone_type: 'regulatory' | 'clinical' | 'technical' | 'business' | null
          status: 'pending' | 'in_progress' | 'completed' | 'blocked'
          priority: 'low' | 'medium' | 'high' | 'critical'
          due_date: string | null
          completed_at: string | null
          assigned_to: string | null
          dependencies: string[] | null
          metadata: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          phase: 'vision' | 'integrate' | 'test' | 'activate' | 'learn'
          milestone_type?: 'regulatory' | 'clinical' | 'technical' | 'business' | null
          status?: 'pending' | 'in_progress' | 'completed' | 'blocked'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          due_date?: string | null
          completed_at?: string | null
          assigned_to?: string | null
          dependencies?: string[] | null
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          phase?: 'vision' | 'integrate' | 'test' | 'activate' | 'learn'
          milestone_type?: 'regulatory' | 'clinical' | 'technical' | 'business' | null
          status?: 'pending' | 'in_progress' | 'completed' | 'blocked'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          due_date?: string | null
          completed_at?: string | null
          assigned_to?: string | null
          dependencies?: string[] | null
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          organization_id: string
          email: string
          role: 'admin' | 'clinician' | 'researcher' | 'member'
          invited_by: string | null
          token: string
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          role?: 'admin' | 'clinician' | 'researcher' | 'member'
          invited_by?: string | null
          token: string
          expires_at: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          role?: 'admin' | 'clinician' | 'researcher' | 'member'
          invited_by?: string | null
          token?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          organization_id: string
          user_id: string | null
          action: string
          resource_type: string | null
          resource_id: string | null
          old_values: Json | null
          new_values: Json | null
          details: Json
          ip_address: string | null
          user_agent: string | null
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id?: string | null
          action: string
          resource_type?: string | null
          resource_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string | null
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
          created_at?: string
        }
      }
      usage_metrics: {
        Row: {
          id: string
          organization_id: string
          metric_type: 'queries' | 'documents' | 'workflows' | 'storage'
          metric_value: number
          period_start: string
          period_end: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          metric_type: 'queries' | 'documents' | 'workflows' | 'storage'
          metric_value: number
          period_start: string
          period_end: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          metric_type?: 'queries' | 'documents' | 'workflows' | 'storage'
          metric_value?: number
          period_start?: string
          period_end?: string
          metadata?: Json
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'milestone' | 'workflow' | 'system' | 'collaboration'
          title: string
          message: string
          data: Json
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'milestone' | 'workflow' | 'system' | 'collaboration'
          title: string
          message: string
          data?: Json
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'milestone' | 'workflow' | 'system' | 'collaboration'
          title?: string
          message?: string
          data?: Json
          read_at?: string | null
          created_at?: string
        }
      }
      capabilities: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string
          category: string
          icon: string
          color: string
          complexity_level: 'basic' | 'intermediate' | 'advanced' | 'expert'
          domain: string
          prerequisites: Json
          usage_count: number
          success_rate: number
          average_execution_time: number
          is_premium: boolean
          requires_training: boolean
          requires_api_access: boolean
          status: 'active' | 'inactive' | 'beta' | 'deprecated'
          version: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description: string
          category?: string
          icon?: string
          color?: string
          complexity_level?: 'basic' | 'intermediate' | 'advanced' | 'expert'
          domain?: string
          prerequisites?: Json
          usage_count?: number
          success_rate?: number
          average_execution_time?: number
          is_premium?: boolean
          requires_training?: boolean
          requires_api_access?: boolean
          status?: 'active' | 'inactive' | 'beta' | 'deprecated'
          version?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string
          category?: string
          icon?: string
          color?: string
          complexity_level?: 'basic' | 'intermediate' | 'advanced' | 'expert'
          domain?: string
          prerequisites?: Json
          usage_count?: number
          success_rate?: number
          average_execution_time?: number
          is_premium?: boolean
          requires_training?: boolean
          requires_api_access?: boolean
          status?: 'active' | 'inactive' | 'beta' | 'deprecated'
          version?: string
          created_at?: string
          updated_at?: string
        }
      }
      agent_capabilities: {
        Row: {
          id: string
          agent_id: string
          capability_id: string
          proficiency_level: 'basic' | 'intermediate' | 'advanced' | 'expert'
          custom_config: Json
          is_primary: boolean
          usage_count: number
          success_rate: number
          last_used_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          capability_id: string
          proficiency_level?: 'basic' | 'intermediate' | 'advanced' | 'expert'
          custom_config?: Json
          is_primary?: boolean
          usage_count?: number
          success_rate?: number
          last_used_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          capability_id?: string
          proficiency_level?: 'basic' | 'intermediate' | 'advanced' | 'expert'
          custom_config?: Json
          is_primary?: boolean
          usage_count?: number
          success_rate?: number
          last_used_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      capability_categories: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string | null
          icon: string
          color: string
          sort_order: number
          parent_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description?: string | null
          icon?: string
          color?: string
          sort_order?: number
          parent_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string | null
          icon?: string
          color?: string
          sort_order?: number
          parent_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      knowledge_sources: {
        Row: {
          id: string
          name: string
          source_type: string
          source_url: string | null
          file_path: string | null
          file_size: number | null
          mime_type: string | null
          title: string
          description: string | null
          authors: string[] | null
          publication_date: string | null
          last_updated: string | null
          version: string | null
          domain: string
          category: string
          tags: string[]
          content_hash: string | null
          processing_status: string
          processed_at: string | null
          confidence_score: number
          relevance_score: number
          is_public: boolean
          access_level: string
          restricted_to_agents: string[]
          status: 'active' | 'inactive' | 'archived' | 'deprecated'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          source_type: string
          source_url?: string | null
          file_path?: string | null
          file_size?: number | null
          mime_type?: string | null
          title: string
          description?: string | null
          authors?: string[] | null
          publication_date?: string | null
          last_updated?: string | null
          version?: string | null
          domain: string
          category: string
          tags?: string[]
          content_hash?: string | null
          processing_status?: string
          processed_at?: string | null
          confidence_score?: number
          relevance_score?: number
          is_public?: boolean
          access_level?: string
          restricted_to_agents?: string[]
          status?: 'active' | 'inactive' | 'archived' | 'deprecated'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          source_type?: string
          source_url?: string | null
          file_path?: string | null
          file_size?: number | null
          mime_type?: string | null
          title?: string
          description?: string | null
          authors?: string[] | null
          publication_date?: string | null
          last_updated?: string | null
          version?: string | null
          domain?: string
          category?: string
          tags?: string[]
          content_hash?: string | null
          processing_status?: string
          processed_at?: string | null
          confidence_score?: number
          relevance_score?: number
          is_public?: boolean
          access_level?: string
          restricted_to_agents?: string[]
          status?: 'active' | 'inactive' | 'archived' | 'deprecated'
          created_at?: string
          updated_at?: string
        }
      }
      document_chunks: {
        Row: {
          id: string
          knowledge_source_id: string
          content: string
          content_length: number
          chunk_index: number
          section_title: string | null
          page_number: number | null
          table_data: Json | null
          figure_captions: string[] | null
          embedding_openai: string | null
          embedding_clinical: string | null
          embedding_legal: string | null
          embedding_scientific: string | null
          embedding_model_versions: Json
          embedding_created_at: string
          keywords: string[]
          entities: Json
          sentiment_score: number | null
          chunk_quality_score: number
          retrieval_count: number
          feedback_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          knowledge_source_id: string
          content: string
          content_length: number
          chunk_index: number
          section_title?: string | null
          page_number?: number | null
          table_data?: Json | null
          figure_captions?: string[] | null
          embedding_openai?: string | null
          embedding_clinical?: string | null
          embedding_legal?: string | null
          embedding_scientific?: string | null
          embedding_model_versions?: Json
          embedding_created_at?: string
          keywords?: string[]
          entities?: Json
          sentiment_score?: number | null
          chunk_quality_score?: number
          retrieval_count?: number
          feedback_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          knowledge_source_id?: string
          content?: string
          content_length?: number
          chunk_index?: number
          section_title?: string | null
          page_number?: number | null
          table_data?: Json | null
          figure_captions?: string[] | null
          embedding_openai?: string | null
          embedding_clinical?: string | null
          embedding_legal?: string | null
          embedding_scientific?: string | null
          embedding_model_versions?: Json
          embedding_created_at?: string
          keywords?: string[]
          entities?: Json
          sentiment_score?: number | null
          chunk_quality_score?: number
          retrieval_count?: number
          feedback_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      knowledge_domains: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string | null
          preferred_embedding_model: string
          retrieval_strategy: string
          total_sources: number
          total_chunks: number
          total_size_mb: number
          last_updated: string | null
          average_quality_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description?: string | null
          preferred_embedding_model: string
          retrieval_strategy?: string
          total_sources?: number
          total_chunks?: number
          total_size_mb?: number
          last_updated?: string | null
          average_quality_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string | null
          preferred_embedding_model?: string
          retrieval_strategy?: string
          total_sources?: number
          total_chunks?: number
          total_size_mb?: number
          last_updated?: string | null
          average_quality_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      agent_knowledge_access: {
        Row: {
          id: string
          agent_id: string
          knowledge_source_id: string
          access_count: number
          last_accessed_at: string
          average_retrieval_time_ms: number
          success_rate: number
          relevance_feedback: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          knowledge_source_id: string
          access_count?: number
          last_accessed_at?: string
          average_retrieval_time_ms?: number
          success_rate?: number
          relevance_feedback?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          knowledge_source_id?: string
          access_count?: number
          last_accessed_at?: string
          average_retrieval_time_ms?: number
          success_rate?: number
          relevance_feedback?: Json
          created_at?: string
          updated_at?: string
        }
      }
      query_logs: {
        Row: {
          id: string
          agent_id: string | null
          user_id: string | null
          query_text: string
          query_embedding: string | null
          query_domain: string | null
          embedding_model: string | null
          retrieval_strategy: string | null
          top_k: number | null
          filters: Json
          retrieved_chunks: string[]
          total_results: number | null
          retrieval_time_ms: number | null
          user_rating: number | null
          user_feedback: string | null
          relevance_score: number | null
          session_id: string | null
          conversation_context: Json
          created_at: string
        }
        Insert: {
          id?: string
          agent_id?: string | null
          user_id?: string | null
          query_text: string
          query_embedding?: string | null
          query_domain?: string | null
          embedding_model?: string | null
          retrieval_strategy?: string | null
          top_k?: number | null
          filters?: Json
          retrieved_chunks?: string[]
          total_results?: number | null
          retrieval_time_ms?: number | null
          user_rating?: number | null
          user_feedback?: string | null
          relevance_score?: number | null
          session_id?: string | null
          conversation_context?: Json
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string | null
          user_id?: string | null
          query_text?: string
          query_embedding?: string | null
          query_domain?: string | null
          embedding_model?: string | null
          retrieval_strategy?: string | null
          top_k?: number | null
          filters?: Json
          retrieved_chunks?: string[]
          total_results?: number | null
          retrieval_time_ms?: number | null
          user_rating?: number | null
          user_feedback?: string | null
          relevance_score?: number | null
          session_id?: string | null
          conversation_context?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organization_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_organization_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}