import { createClient } from '@supabase/supabase-js';
import { AuditLogger, AuditAction, AuditSeverity } from '@/lib/security/audit-logger';

export interface ComplianceReport {
  id: string;
  type: 'HIPAA' | 'SOC2' | 'FDA' | 'GDPR';
  status: 'compliant' | 'non_compliant' | 'partial' | 'unknown';
  score: number; // 0-100
  generatedAt: Date;
  validUntil: Date;
  findings: ComplianceFinding[];
  recommendations: string[];
  metadata: Record<string, any>;
}

export interface ComplianceFinding {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'false_positive';
  evidence: string[];
  remediation: string;
  dueDate?: Date;
}

export interface IncidentPlaybook {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggers: string[];
  actions: PlaybookAction[];
  estimatedDuration: number; // in minutes
  requiresApproval: boolean;
  isActive: boolean;
}

export interface PlaybookAction {
  id: string;
  name: string;
  description: string;
  type: 'api_call' | 'database_query' | 'notification' | 'manual';
  parameters: Record<string, any>;
  order: number;
  isReversible: boolean;
  rollbackAction?: string;
}

export interface PlaybookExecution {
  id: string;
  playbookId: string;
  triggeredBy: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  actions: PlaybookActionExecution[];
  metadata: Record<string, any>;
}

export interface PlaybookActionExecution {
  actionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

export class ComplianceReportingService {
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
   * Generate HIPAA compliance report
   */
  async generateHIPAAReport(): Promise<ComplianceReport> {
    try {
      // Check PHI access logs
      const { data: phiAccessLogs } = await this.supabase
        .from('security_audit_log')
        .select('*')
        .ilike('resource_type', '%phi%')
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Check encryption status
      const { data: encryptionStatus } = await this.supabase
        .from('encryption_status')
        .select('*')
        .eq('data_type', 'phi');

      // Check access controls
      const { data: accessControls } = await this.supabase
        .from('access_controls')
        .select('*')
        .eq('data_type', 'phi');

      const findings: ComplianceFinding[] = [];
      let score = 100;

      // Check for PHI exposure
      const unauthorizedAccess = phiAccessLogs?.filter(log => 
        log.outcome === 'denied' || log.outcome === 'failed'
      ) || [];

      if (unauthorizedAccess.length > 0) {
        findings.push({
          id: 'hipaa-001',
          category: 'Access Control',
          severity: 'high',
          title: 'Unauthorized PHI Access Attempts',
          description: `${unauthorizedAccess.length} unauthorized access attempts to PHI data detected`,
          status: 'open',
          evidence: unauthorizedAccess.map(log => `User ${log.user_id} attempted access at ${log.timestamp}`),
          remediation: 'Review and strengthen access controls for PHI data',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        score -= 20;
      }

      // Check encryption status
      const unencryptedPHI = encryptionStatus?.filter(status => 
        !status.is_encrypted
      ) || [];

      if (unencryptedPHI.length > 0) {
        findings.push({
          id: 'hipaa-002',
          category: 'Data Protection',
          severity: 'critical',
          title: 'Unencrypted PHI Data',
          description: `${unencryptedPHI.length} PHI data items found without encryption`,
          status: 'open',
          evidence: unencryptedPHI.map(status => `Data type: ${status.data_type}, Location: ${status.location}`),
          remediation: 'Encrypt all PHI data at rest and in transit',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        });
        score -= 40;
      }

      // Check audit logging completeness
      const totalPHIActions = phiAccessLogs?.length || 0;
      const loggedActions = phiAccessLogs?.filter(log => 
        log.audit_event_type && log.audit_event_type !== 'unknown'
      ).length || 0;

      if (totalPHIActions > 0 && loggedActions / totalPHIActions < 0.95) {
        findings.push({
          id: 'hipaa-003',
          category: 'Audit Logging',
          severity: 'medium',
          title: 'Incomplete Audit Logging',
          description: `Only ${Math.round((loggedActions / totalPHIActions) * 100)}% of PHI actions are properly audited`,
          status: 'open',
          evidence: [`${loggedActions}/${totalPHIActions} actions logged`],
          remediation: 'Ensure 100% audit logging coverage for all PHI operations',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        });
        score -= 15;
      }

      const report: ComplianceReport = {
        id: `hipaa-${Date.now()}`,
        type: 'HIPAA',
        status: score >= 90 ? 'compliant' : score >= 70 ? 'partial' : 'non_compliant',
        score: Math.max(0, score),
        generatedAt: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        findings,
        recommendations: this.generateHIPAARecommendations(findings),
        metadata: {
          phiAccessLogs: phiAccessLogs?.length || 0,
          encryptionStatus: encryptionStatus?.length || 0,
          accessControls: accessControls?.length || 0
        }
      };

      return report;
    } catch (error) {
      console.error('Error generating HIPAA report:', error);
      throw new Error('Failed to generate HIPAA compliance report');
    }
  }

  /**
   * Generate SOC2 compliance report
   */
  async generateSOC2Report(): Promise<ComplianceReport> {
    try {
      const findings: ComplianceFinding[] = [];
      let score = 100;

      // Check access controls
      const { data: userAccess } = await this.supabase
        .from('user_profiles')
        .select('role, is_active, last_seen_at')
        .eq('is_active', true);

      const inactiveUsers = userAccess?.filter(user => 
        !user.last_seen_at || 
        new Date(user.last_seen_at) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      ) || [];

      if (inactiveUsers.length > 0) {
        findings.push({
          id: 'soc2-001',
          category: 'Access Management',
          severity: 'medium',
          title: 'Inactive User Accounts',
          description: `${inactiveUsers.length} user accounts have been inactive for 90+ days`,
          status: 'open',
          evidence: inactiveUsers.map(user => `User ${user.role} last seen: ${user.last_seen_at}`),
          remediation: 'Review and deactivate unused accounts',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
        score -= 10;
      }

      // Check change management
      const { data: recentChanges } = await this.supabase
        .from('security_audit_log')
        .select('*')
        .ilike('operation', '%change%')
        .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const unauthorizedChanges = recentChanges?.filter(change => 
        change.outcome === 'denied' || change.outcome === 'failed'
      ) || [];

      if (unauthorizedChanges.length > 0) {
        findings.push({
          id: 'soc2-002',
          category: 'Change Management',
          severity: 'high',
          title: 'Unauthorized System Changes',
          description: `${unauthorizedChanges.length} unauthorized change attempts detected`,
          status: 'open',
          evidence: unauthorizedChanges.map(change => `Change ${change.operation} at ${change.timestamp}`),
          remediation: 'Strengthen change approval processes',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        });
        score -= 25;
      }

      const report: ComplianceReport = {
        id: `soc2-${Date.now()}`,
        type: 'SOC2',
        status: score >= 90 ? 'compliant' : score >= 70 ? 'partial' : 'non_compliant',
        score: Math.max(0, score),
        generatedAt: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        findings,
        recommendations: this.generateSOC2Recommendations(findings),
        metadata: {
          totalUsers: userAccess?.length || 0,
          inactiveUsers: inactiveUsers.length,
          recentChanges: recentChanges?.length || 0
        }
      };

      return report;
    } catch (error) {
      console.error('Error generating SOC2 report:', error);
      throw new Error('Failed to generate SOC2 compliance report');
    }
  }

  /**
   * Generate FDA compliance report
   */
  async generateFDAReport(): Promise<ComplianceReport> {
    try {
      const findings: ComplianceFinding[] = [];
      let score = 100;

      // Check validation records
      const { data: validationRecords } = await this.supabase
        .from('validation_records')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const failedValidations = validationRecords?.filter(record => 
        record.status === 'failed' || record.status === 'error'
      ) || [];

      if (failedValidations.length > 0) {
        findings.push({
          id: 'fda-001',
          category: 'Validation',
          severity: 'critical',
          title: 'Failed Validation Records',
          description: `${failedValidations.length} validation records failed in the last 30 days`,
          status: 'open',
          evidence: failedValidations.map(record => `Validation ${record.id} failed: ${record.error_message}`),
          remediation: 'Investigate and resolve validation failures',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        });
        score -= 30;
      }

      // Check traceability
      const { data: traceabilityLogs } = await this.supabase
        .from('traceability_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const incompleteTraces = traceabilityLogs?.filter(log => 
        !log.input_hash || !log.output_hash || !log.processing_steps
      ) || [];

      if (incompleteTraces.length > 0) {
        findings.push({
          id: 'fda-002',
          category: 'Traceability',
          severity: 'high',
          title: 'Incomplete Traceability Records',
          description: `${incompleteTraces.length} traceability records are incomplete`,
          status: 'open',
          evidence: incompleteTraces.map(log => `Trace ${log.id} missing required fields`),
          remediation: 'Ensure complete traceability for all processing steps',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        score -= 20;
      }

      const report: ComplianceReport = {
        id: `fda-${Date.now()}`,
        type: 'FDA',
        status: score >= 90 ? 'compliant' : score >= 70 ? 'partial' : 'non_compliant',
        score: Math.max(0, score),
        generatedAt: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        findings,
        recommendations: this.generateFDARecommendations(findings),
        metadata: {
          validationRecords: validationRecords?.length || 0,
          failedValidations: failedValidations.length,
          traceabilityLogs: traceabilityLogs?.length || 0
        }
      };

      return report;
    } catch (error) {
      console.error('Error generating FDA report:', error);
      throw new Error('Failed to generate FDA compliance report');
    }
  }

  /**
   * Get available incident playbooks
   */
  async getIncidentPlaybooks(): Promise<IncidentPlaybook[]> {
    try {
      const { data: playbooks, error } = await this.supabase
        .from('incident_playbooks')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch playbooks: ${error.message}`);
      }

      return (playbooks || []).map(playbook => ({
        id: playbook.id,
        name: playbook.name,
        description: playbook.description,
        severity: playbook.severity,
        triggers: playbook.triggers || [],
        actions: playbook.actions || [],
        estimatedDuration: playbook.estimated_duration_minutes,
        requiresApproval: playbook.requires_approval,
        isActive: playbook.is_active
      }));
    } catch (error) {
      console.error('Error fetching playbooks:', error);
      return [];
    }
  }

  /**
   * Execute incident playbook
   */
  async executePlaybook(
    playbookId: string,
    triggeredBy: string,
    context: Record<string, any> = {}
  ): Promise<PlaybookExecution> {
    try {
      const { data: playbook, error: fetchError } = await this.supabase
        .from('incident_playbooks')
        .select('*')
        .eq('id', playbookId)
        .single();

      if (fetchError || !playbook) {
        throw new Error('Playbook not found');
      }

      const execution: PlaybookExecution = {
        id: `exec-${Date.now()}`,
        playbookId,
        triggeredBy,
        status: 'pending',
        startedAt: new Date(),
        actions: playbook.actions.map((action: any, index: number) => ({
          actionId: action.id || `action-${index}`,
          status: 'pending',
          startedAt: new Date()
        })),
        metadata: {
          context,
          playbookName: playbook.name
        }
      };

      // Log audit event
      await this.auditLogger.log({
        action: AuditAction.SYSTEM_ACTION,
        resourceType: 'incident_playbook',
        resourceId: playbookId,
        newValues: {
          executionId: execution.id,
          playbookName: playbook.name,
          triggeredBy
        },
        success: true,
        severity: AuditSeverity.HIGH,
        metadata: {
          action: 'playbook_execution_started',
          context
        }
      });

      // Store execution record
      const { error: insertError } = await this.supabase
        .from('playbook_executions')
        .insert({
          id: execution.id,
          playbook_id: playbookId,
          triggered_by: triggeredBy,
          status: execution.status,
          started_at: execution.startedAt.toISOString(),
          actions: execution.actions,
          metadata: execution.metadata
        });

      if (insertError) {
        throw new Error(`Failed to store execution: ${insertError.message}`);
      }

      return execution;
    } catch (error) {
      console.error('Error executing playbook:', error);
      throw error;
    }
  }

  private generateHIPAARecommendations(findings: ComplianceFinding[]): string[] {
    const recommendations = [
      'Implement automated PHI detection and classification',
      'Regular access reviews for PHI data',
      'Encrypt all PHI data at rest and in transit',
      'Maintain comprehensive audit logs for all PHI access',
      'Conduct regular security awareness training'
    ];

    if (findings.some(f => f.category === 'Access Control')) {
      recommendations.push('Implement multi-factor authentication for PHI access');
    }

    if (findings.some(f => f.category === 'Data Protection')) {
      recommendations.push('Review and update data encryption policies');
    }

    return recommendations;
  }

  private generateSOC2Recommendations(findings: ComplianceFinding[]): string[] {
    const recommendations = [
      'Implement automated user access reviews',
      'Regular security training for all users',
      'Document all system changes and approvals',
      'Monitor and alert on suspicious activities',
      'Regular penetration testing and vulnerability assessments'
    ];

    if (findings.some(f => f.category === 'Access Management')) {
      recommendations.push('Implement automated account deactivation for inactive users');
    }

    return recommendations;
  }

  private generateFDARecommendations(findings: ComplianceFinding[]): string[] {
    const recommendations = [
      'Implement comprehensive validation testing',
      'Maintain detailed traceability records',
      'Regular validation of all processing steps',
      'Document all changes to validated systems',
      'Implement automated validation monitoring'
    ];

    if (findings.some(f => f.category === 'Validation')) {
      recommendations.push('Implement automated validation failure alerts');
    }

    if (findings.some(f => f.category === 'Traceability')) {
      recommendations.push('Implement automated traceability verification');
    }

    return recommendations;
  }
}
