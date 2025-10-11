import { createClient } from '@supabase/supabase-js';

import { AuditLogger, AuditAction, AuditSeverity } from '@/lib/security/audit-logger';

export interface GovernancePolicy {
  id: string;
  name: string;
  description: string;
  type: 'safety' | 'compliance' | 'performance' | 'cost';
  rules: PolicyRule[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface PolicyRule {
  id: string;
  name: string;
  condition: string; // JSON logic expression
  action: 'allow' | 'deny' | 'require_approval' | 'log';
  parameters: Record<string, any>;
  priority: number;
}

export interface PromptChange {
  id: string;
  promptId: string;
  version: number;
  title: string;
  description: string;
  changes: PromptDiff[];
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'deployed' | 'rolled_back';
  submittedBy: string;
  submittedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  deployedAt?: Date;
  rollbackReason?: string;
  impactAnalysis?: ImpactAnalysis;
}

export interface PromptDiff {
  field: string;
  oldValue: string;
  newValue: string;
  changeType: 'added' | 'modified' | 'removed';
}

export interface ImpactAnalysis {
  affectedModels: string[];
  estimatedCost: number;
  riskScore: number;
  complianceIssues: string[];
  performanceImpact: 'low' | 'medium' | 'high';
  rollbackComplexity: 'simple' | 'moderate' | 'complex';
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description: string;
  steps: ApprovalStep[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface ApprovalStep {
  id: string;
  name: string;
  approvers: string[]; // User IDs or role names
  requiredApprovals: number;
  order: number;
  conditions?: string; // JSON logic for conditional steps
  timeoutHours?: number;
}

export interface ApprovalRequest {
  id: string;
  changeId: string;
  workflowId: string;
  currentStep: number;
  status: 'pending' | 'approved' | 'rejected' | 'timeout';
  submittedAt: Date;
  completedAt?: Date;
  approvals: ApprovalRecord[];
  comments: ApprovalComment[];
}

export interface ApprovalRecord {
  id: string;
  approverId: string;
  action: 'approve' | 'reject';
  comment?: string;
  timestamp: Date;
  stepId: string;
}

export interface ApprovalComment {
  id: string;
  authorId: string;
  content: string;
  timestamp: Date;
  isInternal: boolean;
}

export class LLMGovernanceService {
  private supabase;
  private auditLogger: AuditLogger;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.auditLogger = AuditLogger.getInstance();
  }

  /**
   * Get current user's profile and role
   */
  async getCurrentUser(): Promise<{ user: any; profile: any; isSuperAdmin: boolean }> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data: profile, error: profileError } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      throw new Error('User profile not found');
    }

    const isSuperAdmin = profile.role === 'super_admin';

    return { user, profile, isSuperAdmin };
  }

  /**
   * Create or update governance policy
   */
  async createPolicy(
    policyData: Omit<GovernancePolicy, 'id' | 'createdAt' | 'updatedAt' | 'version'>,
    currentUserId: string
  ): Promise<GovernancePolicy> {
    try {
      const { data, error } = await this.supabase
        .from('governance_policies')
        .insert({
          name: policyData.name,
          description: policyData.description,
          type: policyData.type,
          rules: policyData.rules,
          is_active: policyData.isActive,
          created_by: currentUserId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 1
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create policy: ${error.message}`);
      }

      // Log audit event
      await this.auditLogger.log({
        action: AuditAction.SYSTEM_ACTION,
        resourceType: 'governance_policy',
        resourceId: data.id,
        newValues: {
          name: policyData.name,
          type: policyData.type,
          rulesCount: policyData.rules.length
        },
        success: true,
        severity: AuditSeverity.MEDIUM,
        metadata: {
          action: 'policy_created',
          createdBy: currentUserId
        }
      });

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        type: data.type,
        rules: data.rules,
        isActive: data.is_active,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        version: data.version
      };
    } catch (error) {
      console.error('Error creating policy:', error);
      throw error;
    }
  }

  /**
   * Get all governance policies
   */
  async getPolicies(): Promise<GovernancePolicy[]> {
    try {
      const { data, error } = await this.supabase
        .from('governance_policies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch policies: ${error.message}`);
      }

      return (data || []).map(policy => ({
        id: policy.id,
        name: policy.name,
        description: policy.description,
        type: policy.type,
        rules: policy.rules || [],
        isActive: policy.is_active,
        createdBy: policy.created_by,
        createdAt: new Date(policy.created_at),
        updatedAt: new Date(policy.updated_at),
        version: policy.version
      }));
    } catch (error) {
      console.error('Error fetching policies:', error);
      return [];
    }
  }

  /**
   * Submit prompt change for review
   */
  async submitPromptChange(
    changeData: Omit<PromptChange, 'id' | 'submittedAt' | 'status'>,
    currentUserId: string
  ): Promise<PromptChange> {
    try {
      // Analyze impact
      const impactAnalysis = await this.analyzeImpact(changeData);

      const { data, error } = await this.supabase
        .from('prompt_changes')
        .insert({
          prompt_id: changeData.promptId,
          version: changeData.version,
          title: changeData.title,
          description: changeData.description,
          changes: changeData.changes,
          status: 'pending_review',
          submitted_by: currentUserId,
          submitted_at: new Date().toISOString(),
          impact_analysis: impactAnalysis
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to submit change: ${error.message}`);
      }

      // Start approval workflow
      await this.startApprovalWorkflow(data.id, currentUserId);

      // Log audit event
      await this.auditLogger.log({
        action: AuditAction.SYSTEM_ACTION,
        resourceType: 'prompt_change',
        resourceId: data.id,
        newValues: {
          promptId: changeData.promptId,
          version: changeData.version,
          title: changeData.title,
          riskScore: impactAnalysis.riskScore
        },
        success: true,
        severity: AuditSeverity.MEDIUM,
        metadata: {
          action: 'prompt_change_submitted',
          submittedBy: currentUserId
        }
      });

      return {
        id: data.id,
        promptId: data.prompt_id,
        version: data.version,
        title: data.title,
        description: data.description,
        changes: data.changes || [],
        status: data.status,
        submittedBy: data.submitted_by,
        submittedAt: new Date(data.submitted_at),
        impactAnalysis: data.impact_analysis
      };
    } catch (error) {
      console.error('Error submitting prompt change:', error);
      throw error;
    }
  }

  /**
   * Get prompt changes with filters
   */
  async getPromptChanges(
    filters: {
      status?: string;
      submittedBy?: string;
      promptId?: string;
    } = {}
  ): Promise<PromptChange[]> {
    try {
      let query = this.supabase
        .from('prompt_changes')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.submittedBy) {
        query = query.eq('submitted_by', filters.submittedBy);
      }

      if (filters.promptId) {
        query = query.eq('prompt_id', filters.promptId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch prompt changes: ${error.message}`);
      }

      return (data || []).map(change => ({
        id: change.id,
        promptId: change.prompt_id,
        version: change.version,
        title: change.title,
        description: change.description,
        changes: change.changes || [],
        status: change.status,
        submittedBy: change.submitted_by,
        submittedAt: new Date(change.submitted_at),
        reviewedBy: change.reviewed_by,
        reviewedAt: change.reviewed_at ? new Date(change.reviewed_at) : undefined,
        deployedAt: change.deployed_at ? new Date(change.deployed_at) : undefined,
        rollbackReason: change.rollback_reason,
        impactAnalysis: change.impact_analysis
      }));
    } catch (error) {
      console.error('Error fetching prompt changes:', error);
      return [];
    }
  }

  /**
   * Approve or reject prompt change
   */
  async reviewPromptChange(
    changeId: string,
    action: 'approve' | 'reject',
    reviewerId: string,
    comment?: string
  ): Promise<void> {
    try {
      const { data: change, error: fetchError } = await this.supabase
        .from('prompt_changes')
        .select('*')
        .eq('id', changeId)
        .single();

      if (fetchError || !change) {
        throw new Error('Prompt change not found');
      }

      const { error: updateError } = await this.supabase
        .from('prompt_changes')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', changeId);

      if (updateError) {
        throw new Error(`Failed to update change: ${updateError.message}`);
      }

      // Log audit event
      await this.auditLogger.log({
        action: AuditAction.SYSTEM_ACTION,
        resourceType: 'prompt_change',
        resourceId: changeId,
        oldValues: { status: change.status },
        newValues: { 
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewedBy: reviewerId
        },
        success: true,
        severity: AuditSeverity.HIGH,
        metadata: {
          action: `prompt_change_${action}d`,
          reviewerId,
          comment
        }
      });
    } catch (error) {
      console.error('Error reviewing prompt change:', error);
      throw error;
    }
  }

  /**
   * Deploy approved prompt change
   */
  async deployPromptChange(
    changeId: string,
    deployedBy: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('prompt_changes')
        .update({
          status: 'deployed',
          deployed_at: new Date().toISOString()
        })
        .eq('id', changeId)
        .eq('status', 'approved');

      if (error) {
        throw new Error(`Failed to deploy change: ${error.message}`);
      }

      // Log audit event
      await this.auditLogger.log({
        action: AuditAction.SYSTEM_ACTION,
        resourceType: 'prompt_change',
        resourceId: changeId,
        newValues: { status: 'deployed' },
        success: true,
        severity: AuditSeverity.HIGH,
        metadata: {
          action: 'prompt_change_deployed',
          deployedBy
        }
      });
    } catch (error) {
      console.error('Error deploying prompt change:', error);
      throw error;
    }
  }

  /**
   * Rollback deployed prompt change
   */
  async rollbackPromptChange(
    changeId: string,
    reason: string,
    rolledBackBy: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('prompt_changes')
        .update({
          status: 'rolled_back',
          rollback_reason: reason
        })
        .eq('id', changeId)
        .eq('status', 'deployed');

      if (error) {
        throw new Error(`Failed to rollback change: ${error.message}`);
      }

      // Log audit event
      await this.auditLogger.log({
        action: AuditAction.SYSTEM_ACTION,
        resourceType: 'prompt_change',
        resourceId: changeId,
        newValues: { 
          status: 'rolled_back',
          rollbackReason: reason
        },
        success: true,
        severity: AuditSeverity.HIGH,
        metadata: {
          action: 'prompt_change_rolled_back',
          rolledBackBy,
          reason
        }
      });
    } catch (error) {
      console.error('Error rolling back prompt change:', error);
      throw error;
    }
  }

  /**
   * Analyze impact of prompt change
   */
  private async analyzeImpact(changeData: Omit<PromptChange, 'id' | 'submittedAt' | 'status'>): Promise<ImpactAnalysis> {
    // This would integrate with actual cost and risk analysis
    // For now, return mock analysis
    return {
      affectedModels: ['gpt-4', 'claude-3'],
      estimatedCost: Math.random() * 100,
      riskScore: Math.random() * 10,
      complianceIssues: [],
      performanceImpact: 'low',
      rollbackComplexity: 'simple'
    };
  }

  /**
   * Start approval workflow for prompt change
   */
  private async startApprovalWorkflow(changeId: string, submittedBy: string): Promise<void> {
    // This would integrate with the approval workflow system
    // For now, just log the workflow start
    console.log(`Starting approval workflow for change ${changeId}`);
  }

  /**
   * Get approval workflows
   */
  async getApprovalWorkflows(): Promise<ApprovalWorkflow[]> {
    try {
      const { data, error } = await this.supabase
        .from('approval_workflows')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch workflows: ${error.message}`);
      }

      return (data || []).map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        steps: workflow.steps || [],
        isActive: workflow.is_active,
        createdBy: workflow.created_by,
        createdAt: new Date(workflow.created_at)
      }));
    } catch (error) {
      console.error('Error fetching approval workflows:', error);
      return [];
    }
  }
}
