import { supabase } from '@/lib/supabase/client';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

// Core JTBD Types
export interface JTBD {
  id: string;
  title: string;
  verb: string;
  goal: string;
  function: 'Medical Affairs' | 'Commercial' | 'Market Access' | 'HR' | 'Operations';
  category: string;
  description: string;
  business_value: string;
  complexity: 'Low' | 'Medium' | 'High';
  time_to_value: string;
  implementation_cost: '$' | '$$' | '$$$';
  workshop_potential: 'Low' | 'Medium' | 'High';
  maturity_level: string;
  tags: string[];
  keywords: string[];
  is_active: boolean;
  usage_count: number;
  success_rate: number;
  avg_execution_time?: number;
  created_at: string;
  updated_at: string;
}

export interface JTBDPainPoint {
  id: number;
  jtbd_id: string;
  pain_point: string;
  impact_score: number;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  solution_approach: string;
  current_time_spent: number;
  manual_effort_level: 'Low' | 'Medium' | 'High';
}

export interface JTBDAITechnique {
  id: number;
  jtbd_id: string;
  technique: string;
  application_description: string;
  complexity_level: 'Basic' | 'Intermediate' | 'Advanced';
  required_data_types: string[];
}

export interface JTBDDataRequirement {
  id: number;
  jtbd_id: string;
  data_type: string;
  data_source: string;
  source_type: 'Internal' | 'External' | 'Third-party' | 'API';
  accessibility: 'Public' | 'Licensed' | 'Proprietary' | 'Protected';
  data_format: 'Structured' | 'Unstructured' | 'Semi-structured';
  is_required: boolean;
  quality_requirements: string;
  refresh_frequency: string;
  estimated_volume: string;
}

export interface JTBDTool {
  id: number;
  jtbd_id: string;
  tool_name: string;
  tool_type: 'API' | 'Library' | 'Service' | 'Platform' | 'Database';
  tool_description: string;
  is_required: boolean;
  license_type: 'Open Source' | 'Commercial' | 'Proprietary' | 'Free';
  integration_status: 'Integrated' | 'Planned' | 'Available' | 'Required';
  api_endpoint?: string;
  credentials_required: boolean;
  setup_complexity: 'Low' | 'Medium' | 'High';
  monthly_cost_estimate?: string;
}

export interface JTBDPersonaMapping {
  id: number;
  jtbd_id: string;
  persona_name: string;
  persona_role: string;
  relevance_score: number;
  typical_frequency: string;
  use_case_examples: string;
  expected_benefit: string;
  adoption_barriers: string[];
}

export interface JTBDProcessStep {
  id: number;
  jtbd_id: string;
  step_number: number;
  step_name: string;
  step_description: string;
  agent_id?: string;
  is_parallel: boolean;
  estimated_duration: number;
  required_capabilities: string[];
  input_schema: any;
  output_schema: any;
  error_handling: any;
}

export interface JTBDExecution {
  id: number;
  jtbd_id: string;
  user_id: string;
  organization_id?: string;
  execution_timestamp: string;
  completion_timestamp?: string;
  status: 'Initializing' | 'Running' | 'Completed' | 'Failed' | 'Cancelled';
  execution_mode: 'Automated' | 'Semi-automated' | 'Manual';
  agents_used: any;
  llms_used: any;
  total_tokens_consumed?: number;
  total_cost?: number;
  outputs: any;
  execution_log: any;
  error_details?: any;
  satisfaction_score?: number;
  feedback?: string;
  execution_metadata: any;
}

export interface DetailedJTBD extends JTBD {
  pain_points: JTBDPainPoint[];
  ai_techniques: JTBDAITechnique[];
  data_requirements: JTBDDataRequirement[];
  tools: JTBDTool[];
  persona_mapping: JTBDPersonaMapping[];
  process_steps: JTBDProcessStep[];
  recent_executions?: JTBDExecution[];
}

export interface JTBDFilters {
  function?: string;
  complexity?: string;
  time_to_value?: string;
  workshop_potential?: string;
  tags?: string[];
  search?: string;
}

export interface ExecutionRequest {
  jtbd_id: string;
  user_id: string;
  execution_mode: 'Automated' | 'Semi-automated' | 'Manual';
  custom_configuration?: any;
  input_data?: any;
}

export class JTBDService {
  private supabase;

  constructor(customSupabase?: any) {
    this.supabase = customSupabase || supabase;
  }

  // ===== DISCOVERY & BROWSING =====

  /**
   * Get all active JTBDs with filtering
   */
  async getJTBDs(filters: JTBDFilters = {}): Promise<JTBD[]> {
    let query = this.supabase
      .from('jtbd_library')
      .select('*')
      .eq('is_active', true)
      .order('function', { ascending: true })
      .order('complexity', { ascending: true });

    // Apply filters
    if (filters.function) {
      query = query.eq('function', filters.function);
    }
    if (filters.complexity) {
      query = query.eq('complexity', filters.complexity);
    }
    if (filters.time_to_value) {
      query = query.eq('time_to_value', filters.time_to_value);
    }
    if (filters.workshop_potential) {
      query = query.eq('workshop_potential', filters.workshop_potential);
    }
    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,goal.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching JTBDs:', error);
      throw new Error('Failed to fetch JTBDs');
    }

    return data || [];
  }

  /**
   * Get JTBDs by function (Medical Affairs, Commercial, etc.)
   */
  async getJTBDsByFunction(functionName: string): Promise<JTBD[]> {
    const { data, error } = await this.supabase
      .from('jtbd_library')
      .select('*')
      .eq('function', functionName)
      .eq('is_active', true)
      .order('complexity', { ascending: true });

    if (error) {
      console.error('Error fetching JTBDs by function:', error);
      throw new Error('Failed to fetch JTBDs by function');
    }

    return data || [];
  }

  /**
   * Get detailed JTBD with all related data
   */
  async getDetailedJTBD(jtbdId: string): Promise<DetailedJTBD | null> {
    // Get base JTBD
    const { data: jtbd, error: jtbdError } = await this.supabase
      .from('jtbd_library')
      .select('*')
      .eq('id', jtbdId)
      .single();

    if (jtbdError || !jtbd) {
      console.error('Error fetching JTBD:', jtbdError);
      return null;
    }

    // Get all related data in parallel
    const [
      painPointsResult,
      techniquesResult,
      dataRequirementsResult,
      toolsResult,
      personaResult,
      processStepsResult,
      executionsResult
    ] = await Promise.all([
      this.supabase.from('jtbd_pain_points').select('*').eq('jtbd_id', jtbdId),
      this.supabase.from('jtbd_ai_techniques').select('*').eq('jtbd_id', jtbdId),
      this.supabase.from('jtbd_data_requirements').select('*').eq('jtbd_id', jtbdId),
      this.supabase.from('jtbd_tools').select('*').eq('jtbd_id', jtbdId),
      this.supabase.from('jtbd_persona_mapping').select('*').eq('jtbd_id', jtbdId),
      this.supabase.from('jtbd_process_steps').select('*').eq('jtbd_id', jtbdId).order('step_number'),
      this.supabase.from('jtbd_executions').select('*').eq('jtbd_id', jtbdId).order('execution_timestamp', { ascending: false }).limit(5)
    ]);

    return {
      ...jtbd,
      pain_points: painPointsResult.data || [],
      ai_techniques: techniquesResult.data || [],
      data_requirements: dataRequirementsResult.data || [],
      tools: toolsResult.data || [],
      persona_mapping: personaResult.data || [],
      process_steps: processStepsResult.data || [],
      recent_executions: executionsResult.data || []
    };
  }

  /**
   * Search JTBDs with smart text search
   */
  async searchJTBDs(searchQuery: string, filters: JTBDFilters = {}): Promise<JTBD[]> {
    return this.getJTBDs({ ...filters, search: searchQuery });
  }

  /**
   * Get recommended JTBDs for a persona
   */
  async getRecommendedJTBDs(personaRole: string, limit: number = 10): Promise<JTBD[]> {
    const { data, error } = await this.supabase
      .from('jtbd_library')
      .select(`
        *,
        jtbd_persona_mapping!inner(relevance_score)
      `)
      .eq('is_active', true)
      .eq('jtbd_persona_mapping.persona_role', personaRole)
      .order('jtbd_persona_mapping.relevance_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recommended JTBDs:', error);
      throw new Error('Failed to fetch recommended JTBDs');
    }

    return data || [];
  }

  /**
   * Get similar JTBDs based on description
   */
  async getSimilarJTBDs(description: string, excludeId?: string): Promise<JTBD[]> {
    // Simple similarity using keywords - could be enhanced with embeddings
    const keywords = description.toLowerCase().split(' ').filter(word => word.length > 3);

    let query = this.supabase
      .from('jtbd_library')
      .select('*')
      .eq('is_active', true);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    // Search in description and keywords
    if (keywords.length > 0) {
      const searchPattern = keywords.join('|');
      query = query.or(`description.ilike.%${searchPattern}%,keywords.cs.{${keywords.join(',')}}`);
    }

    const { data, error } = await query.limit(5);

    if (error) {
      console.error('Error fetching similar JTBDs:', error);
      throw new Error('Failed to fetch similar JTBDs');
    }

    return data || [];
  }

  // ===== EXECUTION & ORCHESTRATION =====

  /**
   * Start JTBD execution
   */
  async startExecution(request: ExecutionRequest): Promise<JTBDExecution> {
    const executionData = {
      jtbd_id: request.jtbd_id,
      user_id: request.user_id,
      execution_mode: request.execution_mode,
      status: 'Initializing' as const,
      execution_metadata: {
        custom_configuration: request.custom_configuration,
        input_data: request.input_data,
        started_at: new Date().toISOString()
      },
      agents_used: {},
      llms_used: {},
      outputs: {}
    };

    const { data, error } = await this.supabase
      .from('jtbd_executions')
      .insert(executionData)
      .select()
      .single();

    if (error) {
      console.error('Error starting execution:', error);
      throw new Error('Failed to start execution');
    }

    // Increment usage count
    await this.incrementUsageCount(request.jtbd_id);

    return data;
  }

  /**
   * Update execution status
   */
  async updateExecutionStatus(
    executionId: number,
    status: JTBDExecution['status'],
    updates: Partial<JTBDExecution> = {}
  ): Promise<void> {
    // Map execution engine fields to database columns
    const mappedUpdates = { ...updates };

    // Map current_step to execution_metadata.current_step
    if ('current_step' in updates) {
      const existingMetadata = mappedUpdates.execution_metadata || {};
      mappedUpdates.execution_metadata = {
        ...existingMetadata,
        current_step: updates.current_step
      };
      delete mappedUpdates.current_step;
    }

    // Map error_message to error_details
    if ('error_message' in updates) {
      mappedUpdates.error_details = updates.error_message;
      delete mappedUpdates.error_message;
    }

    const updateData = {
      status,
      ...mappedUpdates,
      ...(status === 'Completed' && !updates.completion_timestamp
        ? { completion_timestamp: new Date().toISOString() }
        : {})
    };

    const { error } = await this.supabase
      .from('jtbd_executions')
      .update(updateData)
      .eq('id', executionId);

    if (error) {
      console.error('Error updating execution status:', error);
      throw new Error('Failed to update execution status');
    }
  }

  /**
   * Get execution by ID
   */
  async getExecution(executionId: number): Promise<JTBDExecution | null> {
    const { data, error } = await this.supabase
      .from('jtbd_executions')
      .select('*')
      .eq('id', executionId)
      .single();

    if (error) {
      console.error('Error fetching execution:', error);
      return null;
    }

    return data;
  }

  /**
   * Get user's execution history
   */
  async getUserExecutions(userId: string, limit: number = 20): Promise<JTBDExecution[]> {
    const { data, error } = await this.supabase
      .from('jtbd_executions')
      .select(`
        *,
        jtbd_library(title, function)
      `)
      .eq('user_id', userId)
      .order('execution_timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user executions:', error);
      throw new Error('Failed to fetch user executions');
    }

    return data || [];
  }

  // ===== ANALYTICS & FEEDBACK =====

  /**
   * Record execution feedback
   */
  async recordFeedback(
    executionId: number,
    satisfactionScore: number,
    feedback?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('jtbd_executions')
      .update({
        satisfaction_score: satisfactionScore,
        feedback: feedback
      })
      .eq('id', executionId);

    if (error) {
      console.error('Error recording feedback:', error);
      throw new Error('Failed to record feedback');
    }

    // Update JTBD success rate
    await this.updateSuccessRate(executionId);
  }

  /**
   * Get JTBD analytics
   */
  async getJTBDAnalytics(jtbdId: string): Promise<{
    total_executions: number;
    success_rate: number;
    avg_execution_time: number;
    avg_satisfaction: number;
    monthly_trends: any[];
  }> {
    const { data, error } = await this.supabase
      .from('jtbd_executions')
      .select('status, satisfaction_score, execution_timestamp, completion_timestamp')
      .eq('jtbd_id', jtbdId);

    if (error) {
      console.error('Error fetching analytics:', error);
      throw new Error('Failed to fetch analytics');
    }

    const executions = data || [];
    const totalExecutions = executions.length;
    const completedExecutions = executions.filter(e => e.status === 'Completed');
    const successRate = totalExecutions > 0 ? (completedExecutions.length / totalExecutions) * 100 : 0;

    // Calculate average execution time
    const executionTimes = completedExecutions
      .filter(e => e.completion_timestamp)
      .map(e => {
        const start = new Date(e.execution_timestamp);
        const end = new Date(e.completion_timestamp!);
        return (end.getTime() - start.getTime()) / (1000 * 60); // minutes
      });

    const avgExecutionTime = executionTimes.length > 0
      ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
      : 0;

    // Calculate average satisfaction
    const satisfactionScores = executions
      .filter(e => e.satisfaction_score)
      .map(e => e.satisfaction_score!);

    const avgSatisfaction = satisfactionScores.length > 0
      ? satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length
      : 0;

    return {
      total_executions: totalExecutions,
      success_rate: Math.round(successRate * 100) / 100,
      avg_execution_time: Math.round(avgExecutionTime * 100) / 100,
      avg_satisfaction: Math.round(avgSatisfaction * 100) / 100,
      monthly_trends: [] // TODO: Implement monthly trends calculation
    };
  }

  // ===== UTILITY METHODS =====

  /**
   * Increment usage count for JTBD
   */
  private async incrementUsageCount(jtbdId: string): Promise<void> {
    const { error } = await this.supabase.rpc('increment_jtbd_usage', {
      jtbd_id: jtbdId
    });

    if (error) {
      console.error('Error incrementing usage count:', error);
    }
  }

  /**
   * Update success rate based on recent executions
   */
  private async updateSuccessRate(executionId: number): Promise<void> {
    // Get the JTBD ID from the execution
    const execution = await this.getExecution(executionId);
    if (!execution) return;

    // Calculate new success rate
    const analytics = await this.getJTBDAnalytics(execution.jtbd_id);

    const { error } = await this.supabase
      .from('jtbd_library')
      .update({
        success_rate: analytics.success_rate,
        avg_execution_time: analytics.avg_execution_time
      })
      .eq('id', execution.jtbd_id);

    if (error) {
      console.error('Error updating success rate:', error);
    }
  }

  /**
   * Get all available functions
   */
  async getFunctions(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('jtbd_library')
      .select('function')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching functions:', error);
      return [];
    }

    const functions = [...new Set(data.map(item => item.function))];
    return functions.sort();
  }

  /**
   * Get available complexity levels
   */
  getComplexityLevels(): string[] {
    return ['Low', 'Medium', 'High'];
  }

  /**
   * Get available time to value options
   */
  getTimeToValueOptions(): string[] {
    return ['≤12 mo', '12-24 mo', '>24 mo', 'Immediate', '1-3 months', '3-6 months', '6-12 months'];
  }

  /**
   * Validate execution request
   */
  validateExecutionRequest(request: ExecutionRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.jtbd_id) errors.push('JTBD ID is required');
    if (!request.user_id) errors.push('User ID is required');
    if (!['Automated', 'Semi-automated', 'Manual'].includes(request.execution_mode)) {
      errors.push('Invalid execution mode');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Create singleton instance
export const jtbdService = new JTBDService();