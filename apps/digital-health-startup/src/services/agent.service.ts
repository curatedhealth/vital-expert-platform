import { createClient, SupabaseClient } from '@supabase/supabase-js';

import {
  Agent,
  AgentBulkImport,
  AgentStatus,
  DomainExpertise,
  ValidationStatus,
  AgentFilters,
  AgentSort,
  BulkImportResponse,
  ImportError,
  ImportWarning,
  ImportSummary,
  AgentCreateInput,
  AgentUpdateInput,
  ACCURACY_THRESHOLDS,
  AgentAuditLog
} from '@/types/agent.types';

export class AgentService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // Get all agents with filtering and sorting
  async getAgents(
    filters?: AgentFilters,
    sort?: AgentSort,
    page?: number,
    limit?: number
  ) {
    let query = this.supabase.from('agents').select('*', { count: 'exact' });

    // Apply filters
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
      if (filters.domain_expertise && filters.domain_expertise.length > 0) {
        query = query.in('domain_expertise', filters.domain_expertise);
      }
      if (filters.tier && filters.tier.length > 0) {
        query = query.in('tier', filters.tier);
      }
      if (filters.business_function && filters.business_function.length > 0) {
        query = query.in('business_function', filters.business_function);
      }
      if (filters.validation_status && filters.validation_status.length > 0) {
        query = query.in('validation_status', filters.validation_status);
      }
      if (filters.search) {
        query = query.textSearch('search_vector', filters.search);
      }
      if (filters.compliance_tags && filters.compliance_tags.length > 0) {
        query = query.overlaps('compliance_tags', filters.compliance_tags);
      }
      if (filters.created_after) {
        query = query.gte('created_at', filters.created_after);
      }
      if (filters.created_before) {
        query = query.lte('created_at', filters.created_before);
      }
      if (filters.accuracy_min !== undefined) {
        query = query.gte('accuracy_score', filters.accuracy_min);
      }
      if (filters.is_custom !== undefined) {
        query = query.eq('is_custom', filters.is_custom);
      }
    }

    // Apply sorting
    if (sort) {
      query = query.order(sort.field, { ascending: sort.direction === 'asc' });
    } else {
      // Default sorting
      query = query.order('tier', { ascending: true })
                   .order('priority', { ascending: true });
    }

    // Apply pagination
    if (page !== undefined && limit !== undefined) {
      const start = page * limit;
      const end = start + limit - 1;
      query = query.range(start, end);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      limit
    };
  }

  // Get single agent
  async getAgent(id: string): Promise<Agent> {
    const { data, error } = await this.supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Agent not found');

    return data as Agent;
  }

  // Create new agent
  async createAgent(agent: AgentCreateInput): Promise<Agent> {
    // Validate based on domain expertise
    await this.validateAgentByDomain(agent as Agent);

    // Set defaults
    const agentData = {
      ...agent,
      created_by: (await this.supabase.auth.getUser()).data.user?.id,
      updated_by: (await this.supabase.auth.getUser()).data.user?.id,
      accuracy_score: agent.accuracy_score || ACCURACY_THRESHOLDS[agent.domain_expertise],
      is_custom: agent.is_custom !== undefined ? agent.is_custom : true,
      status: agent.status || AgentStatus.DEVELOPMENT,
      validation_status: agent.validation_status || ValidationStatus.PENDING
    };

    const { data, error } = await this.supabase
      .from('agents')
      .insert(agentData)
      .select()
      .single();

    if (error) throw error;

    // Log to audit
    await this.logAudit(data.id, 'create', null, data);

    return data as Agent;
  }

  // Update agent
  async updateAgent(id: string, updates: AgentUpdateInput): Promise<Agent> {
    // Get current agent for audit
    const current = await this.getAgent(id);

    // Validate updates
    if (updates.domain_expertise || Object.keys(updates).some(key =>
      ['medical_specialty', 'legal_domains', 'accuracy_score'].includes(key)
    )) {
      await this.validateAgentByDomain({ ...current, ...updates } as Agent);
    }

    const updateData = {
      ...updates,
      updated_by: (await this.supabase.auth.getUser()).data.user?.id
    };

    const { data, error } = await this.supabase
      .from('agents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log to audit
    await this.logAudit(id, 'update', current, data);

    return data as Agent;
  }

  // Delete agent
  async deleteAgent(id: string): Promise<void> {
    const current = await this.getAgent(id);

    const { error } = await this.supabase
      .from('agents')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log to audit
    await this.logAudit(id, 'delete', current, null);
  }

  // Bulk import agents
  async bulkImportAgents(importData: AgentBulkImport): Promise<BulkImportResponse> {
    const { agents, metadata } = importData;
    const errors: ImportError[] = [];
    const warnings: ImportWarning[] = [];
    let imported = 0;

    // Validate all agents first
    for (const agent of agents) {
      try {
        await this.validateAgentByDomain(agent);
      } catch (error) {
        errors.push({
          agent: agent.name,
          error: error instanceof Error ? error.message : 'Validation failed',
          severity: 'error'
        });
      }
    }

    // If there are validation errors and mode is strict, stop
    if (errors.length > 0 && metadata.import_mode !== 'upsert') {
      return {
        success: false,
        imported: 0,
        total: agents.length,
        errors,
        warnings,
        summary: this.generateImportSummary([], agents)
      };
    }

    // Process import based on mode
    const successfulImports: Agent[] = [];
    const importMode = metadata.import_mode || 'create';

    for (const agent of agents) {
      // Skip agents with validation errors
      if (errors.some((e: any) => e.agent === agent.name)) {
        continue;
      }

      try {
        let result: Agent;

        if (importMode === 'create') {
          result = await this.createAgent(agent);
        } else if (importMode === 'update') {
          const existing = await this.findAgentByName(agent.name);
          if (existing) {
            result = await this.updateAgent(existing.id!, agent);
          } else {
            warnings.push({
              agent: agent.name,
              warning: 'Agent not found for update, skipping',
              recommendation: 'Use upsert mode or create mode'
            });
            continue;
          }
        } else if (importMode === 'upsert') {
          result = await this.upsertAgent(agent);
        } else {
          throw new Error(`Invalid import mode: ${importMode}`);
        }

        successfulImports.push(result);
        imported++;

      } catch (error) {
        errors.push({
          agent: agent.name,
          error: error instanceof Error ? error.message : 'Import failed',
          severity: 'error'
        });
      }
    }

    return {
      success: errors.filter((e: any) => e.severity === 'error').length === 0,
      imported,
      total: agents.length,
      errors,
      warnings,
      summary: this.generateImportSummary(successfulImports, agents)
    };
  }

  // Upsert agent (create or update)
  private async upsertAgent(agent: Agent): Promise<Agent> {
    const existing = await this.findAgentByName(agent.name);

    if (existing) {
      return await this.updateAgent(existing.id!, agent);
    } else {
      return await this.createAgent(agent);
    }
  }

  // Find agent by name
  private async findAgentByName(name: string): Promise<Agent | null> {
    const { data, error } = await this.supabase
      .from('agents')
      .select('*')
      .eq('name', name)
      .maybeSingle();

    if (error) throw error;
    return data as Agent | null;
  }

  // Domain-specific validation
  private async validateAgentByDomain(agent: Agent): Promise<void> {
    const errors: string[] = [];

    // Universal validations
    if (!agent.name || !agent.display_name || !agent.description) {
      errors.push('Missing required identity fields (name, display_name, description)');
    }

    if (!agent.system_prompt || agent.system_prompt.trim().length < 10) {
      errors.push('System prompt must be at least 10 characters');
    }

    if (!agent.capabilities || agent.capabilities.length === 0) {
      errors.push('At least one capability is required');
    }

    if (agent.accuracy_score !== undefined && (agent.accuracy_score < 0 || agent.accuracy_score > 1)) {
      errors.push('Accuracy score must be between 0 and 1');
    }

    // Domain-specific validations
    const requiredAccuracy = ACCURACY_THRESHOLDS[agent.domain_expertise];

    switch (agent.domain_expertise) {
      case DomainExpertise.MEDICAL:
        if (!agent.medical_specialty) {
          errors.push('Medical agents require medical_specialty');
        }
        if (agent.accuracy_score && agent.accuracy_score < requiredAccuracy) {
          errors.push(`Medical agents require accuracy >= ${requiredAccuracy}`);
        }
        if (!agent.pharma_enabled && !agent.verify_enabled) {
          // warnings.push('Medical agents should have PHARMA or VERIFY protocols enabled');
        }
        if (!agent.hipaa_compliant) {
          errors.push('Medical agents must be HIPAA compliant');
        }
        break;

      case DomainExpertise.REGULATORY:
        if (!agent.regulatory_context?.is_regulated) {
          errors.push('Regulatory agents should have regulatory context defined');
        }
        if (agent.accuracy_score && agent.accuracy_score < requiredAccuracy) {
          errors.push(`Regulatory agents require accuracy >= ${requiredAccuracy}`);
        }
        if (!agent.audit_trail_enabled) {
          errors.push('Regulatory agents must have audit trail enabled');
        }
        break;

      case DomainExpertise.LEGAL:
        if (!agent.jurisdiction_coverage || agent.jurisdiction_coverage.length === 0) {
          errors.push('Legal agents require jurisdiction coverage');
        }
        if (!agent.legal_domains || agent.legal_domains.length === 0) {
          errors.push('Legal agents require legal domain specialization');
        }
        if (agent.accuracy_score && agent.accuracy_score < requiredAccuracy) {
          errors.push(`Legal agents require accuracy >= ${requiredAccuracy}`);
        }
        if (!agent.citation_requirements) {
          // warnings.push('Legal agents should have citation requirements defined');
        }
        break;

      case DomainExpertise.FINANCIAL:
        if (!agent.performance_metrics?.calculation_precision) {
          // warnings.push('Financial agents should have calculation precision metric');
        }
        if (agent.accuracy_score && agent.accuracy_score < requiredAccuracy) {
          errors.push(`Financial agents require accuracy >= ${requiredAccuracy}`);
        }
        if (!agent.audit_trail_enabled) {
          errors.push('Financial agents must have audit trail enabled');
        }
        break;

      case DomainExpertise.COMMERCIAL:
        if (!agent.market_segments || agent.market_segments.length === 0) {
          errors.push('Commercial agents require market segments');
        }
        if (!agent.sales_methodology) {
          errors.push('Commercial agents require sales methodology');
        }
        if (agent.accuracy_score && agent.accuracy_score < requiredAccuracy) {
          errors.push(`Commercial agents require accuracy >= ${requiredAccuracy}`);
        }
        break;

      case DomainExpertise.ACCESS:
        if (!agent.payer_types || agent.payer_types.length === 0) {
          errors.push('Market Access agents require payer types');
        }
        if (!agent.reimbursement_models || agent.reimbursement_models.length === 0) {
          errors.push('Market Access agents require reimbursement models');
        }
        if (agent.accuracy_score && agent.accuracy_score < requiredAccuracy) {
          errors.push(`Market Access agents require accuracy >= ${requiredAccuracy}`);
        }
        break;

      case DomainExpertise.TECHNICAL:
        if (!agent.tool_configurations || Object.keys(agent.tool_configurations).length === 0) {
          // warnings.push('Technical agents should have tool configurations');
        }
        break;

      case DomainExpertise.BUSINESS:
        if (agent.accuracy_score && agent.accuracy_score < requiredAccuracy) {
          errors.push(`Business agents require accuracy >= ${requiredAccuracy}`);
        }
        break;
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
  }

  // Generate import summary
  private generateImportSummary(successful: Agent[], total: Agent[]): ImportSummary {
    const byDomain: Record<DomainExpertise, number> = {
      [DomainExpertise.MEDICAL]: 0,
      [DomainExpertise.REGULATORY]: 0,
      [DomainExpertise.LEGAL]: 0,
      [DomainExpertise.FINANCIAL]: 0,
      [DomainExpertise.BUSINESS]: 0,
      [DomainExpertise.TECHNICAL]: 0,
      [DomainExpertise.COMMERCIAL]: 0,
      [DomainExpertise.ACCESS]: 0,
      [DomainExpertise.GENERAL]: 0
    };

    const byTier: Record<string, number> = { '1': 0, '2': 0, '3': 0 };
    const validationStatus: Record<ValidationStatus, number> = {
      [ValidationStatus.VALIDATED]: 0,
      [ValidationStatus.PENDING]: 0,
      [ValidationStatus.IN_REVIEW]: 0,
      [ValidationStatus.EXPIRED]: 0,
      [ValidationStatus.NOT_REQUIRED]: 0
    };

    let hipaaCompliant = 0;
    let gdprCompliant = 0;
    let regulated = 0;

    successful.forEach(agent => {
      byDomain[agent.domain_expertise]++;
      if (agent.tier) byTier[agent.tier.toString()]++;
      if (agent.validation_status) validationStatus[agent.validation_status]++;
      if (agent.hipaa_compliant) hipaaCompliant++;
      if (agent.gdpr_compliant) gdprCompliant++;
      if (agent.regulatory_context?.is_regulated) regulated++;
    });

    return {
      by_domain: byDomain,
      by_tier: byTier,
      validation_status: validationStatus,
      compliance_summary: {
        hipaa_compliant: hipaaCompliant,
        gdpr_compliant: gdprCompliant,
        regulated
      }
    };
  }

  // Audit logging
  private async logAudit(
    agentId: string,
    action: string,
    oldValues: unknown,
    newValues: unknown
  ): Promise<void> {
    try {
      await this.supabase.from('agent_audit_log').insert({
        agent_id: agentId,
        action,
        old_values: oldValues,
        new_values: newValues,
        changed_by: (await this.supabase.auth.getUser()).data.user?.id
      });
    } catch (error) {
      console.error('Failed to log audit entry:', error);
      // Don't throw - audit logging failure shouldn't break the main operation
    }
  }

  // Get agents by domain
  async getAgentsByDomain(domain: DomainExpertise): Promise<Agent[]> {
    const { data, error } = await this.supabase
      .from('agents')
      .select('*')
      .eq('domain_expertise', domain)
      .eq('status', AgentStatus.ACTIVE)
      .order('priority');

    if (error) throw error;
    return data as Agent[];
  }

  // Search agents
  async searchAgents(query: string, limit: number = 20): Promise<Agent[]> {
    const { data, error } = await this.supabase
      .from('agents')
      .select('*')
      .textSearch('search_vector', query)
      .limit(limit);

    if (error) throw error;
    return data as Agent[];
  }

  // Get agent performance metrics
  async getAgentMetrics(id: string) {
    const agent = await this.getAgent(id);

    return {
      ...agent.performance_metrics,
      total_interactions: agent.total_interactions,
      average_response_time: agent.average_response_time,
      error_rate: agent.error_rate,
      last_interaction: agent.last_interaction,
      uptime: this.calculateUptime(agent.last_health_check),
      domain_compliance: this.checkDomainCompliance(agent)
    };
  }

  // Calculate uptime
  private calculateUptime(lastHealthCheck?: Date | string): number {
    if (!lastHealthCheck) return 0;

    const now = new Date();
    const lastCheck = new Date(lastHealthCheck);
    const diff = now.getTime() - lastCheck.getTime();
    const maxHealthCheckInterval = 5 * 60 * 1000; // 5 minutes

    return diff < maxHealthCheckInterval ? 100 : 0;
  }

  // Check domain compliance
  private checkDomainCompliance(agent: Agent): Record<string, boolean> {
    const compliance: Record<string, boolean> = { /* TODO: implement */ };

    switch (agent.domain_expertise) {
      case DomainExpertise.MEDICAL:
        compliance.hipaa = agent.hipaa_compliant || false;
        compliance.pharma_protocol = agent.pharma_enabled || false;
        compliance.accuracy_threshold = (agent.accuracy_score || 0) >= ACCURACY_THRESHOLDS.medical;
        break;
      case DomainExpertise.LEGAL:
        compliance.accuracy_threshold = (agent.accuracy_score || 0) >= ACCURACY_THRESHOLDS.legal;
        compliance.jurisdiction_defined = (agent.jurisdiction_coverage?.length || 0) > 0;
        break;
      case DomainExpertise.FINANCIAL:
        compliance.audit_trail = agent.audit_trail_enabled || false;
        compliance.accuracy_threshold = (agent.accuracy_score || 0) >= ACCURACY_THRESHOLDS.financial;
        break;
    }

    return compliance;
  }

  // Export agents
  async exportAgents(filters?: AgentFilters): Promise<AgentBulkImport> {
    const result = await this.getAgents(filters);
// const user = // Unused variable await this.supabase.auth.getUser();

    return {
      agents: result.data,
      metadata: {
        version: '2.0',
        created_date: new Date().toISOString(),
        created_by: user.data.user?.email || 'system',
        total_agents: result.data.length,
        deployment_phase: 'export',
        validation_status: 'validated',
        import_mode: 'upsert'
      }
    };
  }

  // Get audit log for an agent
  async getAgentAuditLog(agentId: string): Promise<AgentAuditLog[]> {
    const { data, error } = await this.supabase
      .from('agent_audit_log')
      .select('*')
      .eq('agent_id', agentId)
      .order('changed_at', { ascending: false });

    if (error) throw error;
    return data as AgentAuditLog[];
  }

  // Activate agent (move to active status with validation)
  async activateAgent(id: string): Promise<Agent> {
    const agent = await this.getAgent(id);

    // Validate agent meets activation requirements
    await this.validateAgentByDomain(agent);

    if (agent.validation_status !== ValidationStatus.VALIDATED) {
      throw new Error('Agent must be validated before activation');
    }

    return await this.updateAgent(id, {
      status: AgentStatus.ACTIVE,
      availability_status: 'available'
    });
  }

  // Deactivate agent
  async deactivateAgent(id: string): Promise<Agent> {
    return await this.updateAgent(id, {
      status: AgentStatus.DEPRECATED,
      availability_status: 'unavailable'
    });
  }
}