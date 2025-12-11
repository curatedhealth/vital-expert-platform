/**
 * Database-backed Library Loader for Digital Health AI Agent System
 * Loads capabilities and prompts from Supabase database
 */

import { createClient } from '@supabase/supabase-js';

import {
  DigitalHealthAgentConfig,
  Capability,
  PromptTemplate
} from '@/types/digital-health-agent.types';

export class DatabaseLibraryLoader {
  private supabaseClient;

  constructor() {
    // Initialize Supabase client
    this.supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    );
  }

  /**
   * Load a capability by display name from the database
   */
  async loadCapability(title: string): Promise<Capability> {
    try {
      const { data, error } = await this.supabaseClient
        .from('capabilities')
        .select('*')
        .eq('display_name', title)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        throw new Error(`Capability not found: ${title}`);
      }

      // Convert database format to our type format
      return {
        capability_id: data.name, // Map database 'name' field to capability_id
        title: data.display_name,
        description: data.description,
        methodology: data.methodology || {},
        required_knowledge: data.prerequisite_capabilities || [],
        tools_required: data.tools_required || [],
        output_format: data.output_format || {},
        quality_metrics: data.quality_metrics || {
          accuracy_target: "95%",
          time_target: "5 minutes",
          compliance_requirements: []
        },
        examples: data.examples || [],
        limitations: data.limitations || []
      } as Capability;
    } catch (error) {
      // Return a mock capability for testing
      return {
        capability_id: title.toLowerCase().replace(/\s+/g, '-'),
        title,
        description: `Mock capability: ${title}`,
        methodology: {
          steps: [`Execute ${title}`],
          approach: 'standard'
        },
        required_knowledge: [],
        tools_required: [],
        output_format: {
          format: 'text',
          structure: 'standard'
        },
        quality_metrics: {
          accuracy_target: "95%",
          time_target: "5 minutes",
          compliance_requirements: []
        },
        examples: [],
        limitations: []
      } as Capability;
    }
  }

  /**
   * Load a prompt by display name or prompt starter from the database
   */
  async loadPrompt(title: string): Promise<PromptTemplate> {
    try {
      const { data, error } = await this.supabaseClient
        .from('prompts')
        .select('*')
        .or(`display_name.eq.${title},prompt_starter.eq.${title}`)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        throw new Error(`Prompt not found: ${title}`);
      }

      // Convert database format to our type format
      return {
        prompt_id: data.name, // Map database 'name' field to prompt_id
        prompt_starter: data.prompt_starter || data.display_name, // Use prompt_starter if available
        category: data.domain || 'general',
        complexity: data.complexity_level || 'moderate',
        estimated_time: data.estimated_duration_hours ? `${data.estimated_duration_hours * 60} minutes` : '15 minutes',
        required_capabilities: data.prerequisite_capabilities || [],
        detailed_prompt: data.system_prompt, // Map system_prompt to detailed_prompt
        input_requirements: data.validation_rules?.input_requirements || [],
        output_specification: data.output_schema?.specification || 'Standard output format',
        success_criteria: data.success_criteria?.description || 'Successful completion of task'
      } as PromptTemplate;
    } catch (error) {
      // Return a mock prompt for testing
      return {
        prompt_id: title.toLowerCase().replace(/\s+/g, '-'),
        prompt_starter: title,
        category: 'general',
        complexity: 'moderate',
        estimated_time: '15 minutes',
        required_capabilities: [],
        detailed_prompt: `You are an expert assistant. Execute the task: ${title}`,
        input_requirements: [],
        output_specification: 'Standard output format',
        success_criteria: 'Task completed successfully'
      } as PromptTemplate;
    }
  }

  /**
   * Get agent-specific prompt starters from the database
   * Uses direct agent-prompt relationships first, falls back to domain matching
   */
  async getAgentPromptStarters(agentName: string): Promise<Array<{
    id: string;
    prompt_starter: string;
    name: string;
    display_name: string;
    description: string;
    domain: string;
    complexity_level: string;
  }>> {
    try {
      // First try to get prompts via direct agent-prompt relationships
      let { data, error } = await this.supabaseClient
        .rpc('get_agent_prompt_starters', { agent_name_param: agentName });

      // If no direct relationships found, try domain matching
      if (!data || data.length === 0) {
        const result = await this.supabaseClient
          .rpc('get_agent_prompt_starters_by_domain', { agent_name_param: agentName });

        data = result.data;
        error = result.error;
      }

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get all agent-prompt relationships for debugging
   */
  async getAgentPromptRelationships(): Promise<unknown[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from('agent_prompt_starters_view')
        .select('*')
        .order('agent_name', { ascending: true });

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get detailed capabilities for a specific agent with bullet points and full descriptions
   */
  async getAgentCapabilitiesDetailed(agentName: string): Promise<Array<{
    capability_id: string;
    name: string;
    display_name: string;
    description: string;
    category: string;
    domain: string;
    complexity_level: string;
    proficiency_level: string;
    is_primary: boolean;
    icon: string;
    color: string;
    bullet_points: string[];
  }>> {
    try {
      const { data, error } = await this.supabaseClient
        .rpc('get_agent_capabilities_detailed', { agent_name_param: agentName });

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get all available capabilities for selection when configuring agents
   */
  async getAvailableCapabilities(): Promise<Array<{
    id: string;
    name: string;
    display_name: string;
    description: string;
    category: string;
    domain: string;
    complexity_level: string;
    icon: string;
    color: string;
    bullet_points: string[];
  }>> {
    try {
      const { data, error } = await this.supabaseClient
        .rpc('get_available_capabilities');

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Add a capability to an agent
   */
  async addCapabilityToAgent(agentId: string, capabilityId: string, proficiencyLevel: string = 'intermediate', isPrimary: boolean = false): Promise<boolean> {
    try {
      const { error } = await this.supabaseClient
        .from('agent_capabilities')
        .insert({
          agent_id: agentId,
          capability_id: capabilityId,
          proficiency_level: proficiencyLevel,
          is_primary: isPrimary
        });

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Remove a capability from an agent
   */
  async removeCapabilityFromAgent(agentId: string, capabilityId: string): Promise<boolean> {
    try {
      const { error } = await this.supabaseClient
        .from('agent_capabilities')
        .delete()
        .eq('agent_id', agentId)
        .eq('capability_id', capabilityId);

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Load an agent configuration by name from the database
   */
  async loadAgentConfig(agentName: string): Promise<DigitalHealthAgentConfig> {
    try {
      const { data, error } = await this.supabaseClient
        .from('agents')
        .select(`
          *,
          agent_capabilities!inner(
            capabilities(*)
          ),
          agent_prompts(
            prompts(*)
          )
        `)
        .eq('name', agentName)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        throw new Error(`Agent not found: ${agentName}`);
      }

      // Convert database format to our type format
      return {
        name: data.name,
        display_name: data.display_name,
        description: data.description,
        avatar: data.avatar || 'default-icon',
        color: data.color || '#4F46E5',
        version: data.version || '1.0.0',

        // AI Configuration
        model: data.model || 'gpt-4',
        system_prompt: data.system_prompt,
        temperature: data.temperature || 0.7,
        max_tokens: data.max_tokens || 2000,
        rag_enabled: data.rag_enabled !== false,
        context_window: data.context_window || 8000,
        response_format: data.response_format || 'markdown',

        // Capabilities
        capabilities: data.capabilities || [],
        capabilities_list: data.capabilities || [],
        knowledge_domains: data.knowledge_domains || [],
        competency_levels: data.competency_levels || {},
        knowledge_sources: data.knowledge_sources || {},
        tool_configurations: data.tool_configurations || {},

        // Business Context
        business_function: data.business_function || 'General',
        role: data.role || 'Assistant',
        tier: data.tier || 1,
        priority: data.priority || 100,
        implementation_phase: data.implementation_phase || 1,
        is_custom: data.is_custom !== false,
        cost_per_query: data.cost_per_query || 0,
        target_users: data.target_users || [],

        // Validation & Performance
        validation_status: data.validation_status || 'pending',
        validation_metadata: data.validation_metadata || {},
        performance_metrics: data.performance_metrics || {},
        accuracy_score: data.accuracy_score || 0.85,
        evidence_required: data.evidence_required === true,

        // Compliance
        regulatory_context: data.regulatory_context || { is_regulated: false },
        compliance_tags: data.compliance_tags || [],
        hipaa_compliant: data.hipaa_compliant === true,
        gdpr_compliant: data.gdpr_compliant === true,
        audit_trail_enabled: data.audit_trail_enabled !== false,

        // Operational
        status: data.status || 'active',
        availability_status: data.availability_status || 'available',
        error_rate: data.error_rate || 0,
        average_response_time: data.average_response_time || 1000,
        total_interactions: data.total_interactions || 0,

        // Advanced Configuration
        escalation_rules: data.escalation_rules || {},
        confidence_thresholds: data.confidence_thresholds || {
          low: 0.7,
          medium: 0.85,
          high: 0.95
        },
        input_validation_rules: data.input_validation_rules || {},
        output_format_rules: data.output_format_rules || {},
        citation_requirements: data.citation_requirements || {},
        rate_limits: data.rate_limits || {
          per_minute: 60,
          per_hour: 1000
        },

        // Testing & Validation
        test_scenarios: data.test_scenarios || [],
        validation_history: data.validation_history || [],
        performance_benchmarks: data.performance_benchmarks || {},

        // Interface
        prompt_starters: data.prompt_starters || [],

        // Metadata
        created_at: data.created_at,
        updated_at: data.updated_at,
        metadata: data.metadata || {}
      } as DigitalHealthAgentConfig;
    } catch (error) {
      throw new Error(`Failed to load agent config: ${agentName}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract all agents from the database
   */
  async extractAllAgents(): Promise<DigitalHealthAgentConfig[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from('agents')
        .select('*')
        .eq('status', 'active')
        .order('priority');

      if (error) {
        throw new Error(`Failed to load agents: ${error.message}`);
      }

      const agents: DigitalHealthAgentConfig[] = [];
      for (const agentData of data || []) {
        try {
          const agent = await this.loadAgentConfig(agentData.name);
          agents.push(agent);
        } catch (loadError) {
          // Skip agents that fail to load
        }
      }

      return agents;
    } catch (error) {
      throw new Error(`Failed to extract agents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load all capabilities from the database
   */
  async loadAllCapabilities(): Promise<Capability[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from('capabilities')
        .select('*')
        .eq('status', 'active')
        .order('display_name');

      if (error) {
        throw new Error(`Failed to load capabilities: ${error.message}`);
      }

      return (data || []).map(cap => ({
        id: cap.name,
        title: cap.display_name,
        description: cap.description,
        methodology: cap.methodology || {},
        qualityMetrics: cap.quality_metrics || {},
        requirements: cap.requirements || {},
        deliverables: cap.deliverables || [],
        dependencies: cap.prerequisite_capabilities || [],
        estimatedTime: cap.estimated_duration_hours || 1,
        complexityLevel: cap.complexity_level || 'intermediate',
        domain: cap.domain || 'general',
        validationCriteria: cap.validation_requirements || {},
        tags: cap.compliance_tags || []
      } as unknown as Capability));
    } catch (error) {
      throw new Error(`Failed to load capabilities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load all prompts from the database
   */
  async loadAllPrompts(): Promise<PromptTemplate[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from('prompts')
        .select('*')
        .eq('status', 'active')
        .order('display_name');

      if (error) {
        throw new Error(`Failed to load prompts: ${error.message}`);
      }

      return (data || []).map(prompt => ({
        id: prompt.name,
        title: prompt.display_name,
        description: prompt.description,
        systemPrompt: prompt.system_prompt,
        userPromptTemplate: prompt.user_prompt_template || '',
        executionInstructions: prompt.execution_instructions || {},
        successCriteria: prompt.success_criteria || {},
        inputSchema: prompt.input_schema || {},
        outputSchema: prompt.output_schema || {},
        validationRules: prompt.validation_rules || {},
        modelRequirements: prompt.model_requirements || {
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000
        },
        dependencies: prompt.prerequisite_prompts || [],
        estimatedTokens: prompt.estimated_tokens || 1000,
        complexityLevel: prompt.complexity_level || 'intermediate',
        domain: prompt.domain || 'general',
        tags: prompt.compliance_tags || []
      } as unknown as PromptTemplate));
    } catch (error) {
      throw new Error(`Failed to load prompts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
