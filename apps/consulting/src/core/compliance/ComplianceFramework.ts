/**
 * Advanced Compliance Framework for VITAL Path
 * Implements HIPAA, GDPR, FDA 21 CFR Part 11, and other healthcare compliance standards
 */

import { createHash } from 'crypto';
import { EventEmitter } from 'events';

import { createClient } from '@supabase/supabase-js';

// Core Compliance Types
export interface ComplianceRule {
  id: string;
  name: string;
  standard: 'HIPAA' | 'GDPR' | 'FDA_21_CFR_11' | 'DICOM' | 'HL7_FHIR' | 'ISO_13485' | 'IEC_62304';
  category: 'data_protection' | 'access_control' | 'audit_trail' | 'data_integrity' | 'risk_management';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  validator: ComplianceValidator;
  remediation?: string;
}

export interface ComplianceValidator {
  validate(context: ComplianceContext): Promise<ComplianceResult>;
}

export interface ComplianceContext {
  operation: string;
  userId?: string;
  userRole?: string;
  dataType: 'PHI' | 'PII' | 'clinical_data' | 'device_data' | 'research_data' | 'public';
  data?: any;
  location?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ComplianceResult {
  compliant: boolean;
  ruleId: string;
  violations: ComplianceViolation[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, unknown>;
}

export interface ComplianceViolation {
  type: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  field?: string;
  value?: any;
  remediation?: string;
}

export interface AuditEvent {
  id: string;
  userId: string;
  userRole: string;
  operation: string;
  resource: string;
  outcome: 'success' | 'failure' | 'warning';
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  dataAccessed?: string[];
  changes?: Record<string, unknown>;
  complianceFlags: {
    hipaa: boolean;
    gdpr: boolean;
    fda21cfr11: boolean;
  };
  metadata?: Record<string, unknown>;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: 'data_processing' | 'data_sharing' | 'marketing' | 'research' | 'clinical_trial';
  status: 'granted' | 'denied' | 'withdrawn' | 'expired';
  timestamp: Date;
  expirationDate?: Date;
  scope: string[];
  legalBasis?: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  metadata?: Record<string, unknown>;
}

export interface DataRetentionPolicy {
  id: string;
  dataType: string;
  retentionPeriod: number; // days
  archivePeriod?: number; // days
  deletionMethod: 'secure_delete' | 'anonymize' | 'pseudonymize';
  exceptions: string[];
  complianceStandards: string[];
}

// HIPAA Compliance Validators
export class HIPAAMinimumNecessaryValidator implements ComplianceValidator {
  async validate(context: ComplianceContext): Promise<ComplianceResult> {
    const violations: ComplianceViolation[] = [];
    let riskLevel: ComplianceResult['riskLevel'] = 'low';

    if (context.dataType === 'PHI') {
      // Check if access is job-related
      if (!context.userRole) {
        violations.push({
          type: 'missing_role',
          description: 'User role not specified for PHI access',
          severity: 'high',
          remediation: 'Implement role-based access control'
        });
        riskLevel = 'high';
      }

      // Check for excessive data exposure
      if (context.data && typeof context.data === 'object') {

          context.data.hasOwnProperty(field) && context.operation !== 'clinical_review'
        );

        if (exposedSensitiveFields.length > 0) {
          violations.push({
            type: 'excessive_phi_exposure',
            description: `Sensitive PHI fields exposed: ${exposedSensitiveFields.join(', ')}`,
            severity: 'critical',
            remediation: 'Limit data exposure to minimum necessary for the operation'
          });
          riskLevel = 'critical';
        }
      }
    }

    return {
      compliant: violations.length === 0,
      ruleId: 'hipaa-minimum-necessary',
      violations,
      recommendations: violations.length === 0 ? [] : ['Implement data minimization', 'Review access patterns'],
      riskLevel
    };
  }
}

export class GDPRLawfulBasisValidator implements ComplianceValidator {
  async validate(context: ComplianceContext): Promise<ComplianceResult> {
    const violations: ComplianceViolation[] = [];
    let riskLevel: ComplianceResult['riskLevel'] = 'low';

    if (context.dataType === 'PII' || context.dataType === 'PHI') {
      // Check for lawful basis

      if (!lawfulBasis) {
        violations.push({
          type: 'missing_lawful_basis',
          description: 'No lawful basis specified for personal data processing',
          severity: 'critical',
          remediation: 'Document and specify lawful basis for data processing'
        });
        riskLevel = 'critical';
      }

      // Check consent validity for consent-based processing
      if (lawfulBasis === 'consent') {

        if (!consentId) {
          violations.push({
            type: 'missing_consent',
            description: 'Consent-based processing without valid consent record',
            severity: 'critical',
            remediation: 'Obtain and record explicit consent'
          });
          riskLevel = 'critical';
        }
      }

      // Check data subject location for GDPR applicability

      if (location && this.isEUResident(location) && violations.length === 0) {
        // Additional GDPR checks for EU residents
        if (!context.metadata?.gdprCompliantProcess) {
          violations.push({
            type: 'gdpr_process_missing',
            description: 'GDPR-compliant process flag missing for EU resident data',
            severity: 'high',
            remediation: 'Implement GDPR-compliant data processing procedures'
          });
          riskLevel = 'high';
        }
      }
    }

    return {
      compliant: violations.length === 0,
      ruleId: 'gdpr-lawful-basis',
      violations,
      recommendations: violations.length === 0 ? [] : ['Review consent mechanisms', 'Update privacy policies'],
      riskLevel
    };
  }

  private isEUResident(location: string): boolean {

      'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
      'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
      'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'
    ];
    return euCountries.includes(location.toUpperCase());
  }
}

export class FDA21CFR11Validator implements ComplianceValidator {
  async validate(context: ComplianceContext): Promise<ComplianceResult> {
    const violations: ComplianceViolation[] = [];
    let riskLevel: ComplianceResult['riskLevel'] = 'low';

    if (context.dataType === 'clinical_data' || context.dataType === 'device_data') {
      // Check electronic signature requirements
      if (context.operation === 'clinical_data_entry' || context.operation === 'data_modification') {

        if (!hasElectronicSignature) {
          violations.push({
            type: 'missing_electronic_signature',
            description: 'Electronic signature required for clinical data modification',
            severity: 'critical',
            remediation: 'Implement electronic signature system'
          });
          riskLevel = 'critical';
        }

        // Check audit trail completeness

        if (!auditTrail || !auditTrail.complete) {
          violations.push({
            type: 'incomplete_audit_trail',
            description: 'Complete audit trail required for FDA-regulated data',
            severity: 'high',
            remediation: 'Implement comprehensive audit trail system'
          });
          riskLevel = 'high';
        }
      }

      // Check data integrity controls
      if (!context.metadata?.dataIntegrityCheck) {
        violations.push({
          type: 'missing_data_integrity',
          description: 'Data integrity verification required for FDA compliance',
          severity: 'high',
          remediation: 'Implement data integrity verification mechanisms'
        });
        riskLevel = 'high';
      }

      // Check system validation documentation
      if (!context.metadata?.systemValidated) {
        violations.push({
          type: 'system_not_validated',
          description: 'System validation documentation required for FDA compliance',
          severity: 'medium',
          remediation: 'Complete system validation and maintain documentation'
        });
        if (riskLevel === 'low') riskLevel = 'medium';
      }
    }

    return {
      compliant: violations.length === 0,
      ruleId: 'fda-21-cfr-11',
      violations,
      recommendations: violations.length === 0 ? [] : ['Implement electronic signatures', 'Complete system validation'],
      riskLevel
    };
  }
}

// Audit Trail System
export class AuditTrailSystem extends EventEmitter {
  constructor(private supabase: ReturnType<typeof createClient>) {
    super();
  }

  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<string> {
    const auditEvent: AuditEvent = {
      id: this.generateAuditId(),
      timestamp: new Date(),
      ...event
    };

    // Store in database
    try {
      const { error } = await this.supabase.from('audit_events').insert({
        audit_id: auditEvent.id,
        user_id: auditEvent.userId,
        user_role: auditEvent.userRole,
        operation: auditEvent.operation,
        resource: auditEvent.resource,
        outcome: auditEvent.outcome,
        timestamp: auditEvent.timestamp.toISOString(),
        ip_address: auditEvent.ipAddress,
        user_agent: auditEvent.userAgent,
        data_accessed: auditEvent.dataAccessed,
        changes: auditEvent.changes,
        compliance_flags: auditEvent.complianceFlags,
        metadata: auditEvent.metadata,
        created_at: new Date().toISOString()
      } as unknown);

      if (error) {
        // console.error('Failed to store audit event:', error);
        this.emit('auditStorageError', { event: auditEvent, error });
      } else {
        this.emit('auditEventLogged', auditEvent);
      }
    } catch (error) {
      // console.error('Error storing audit event:', error);
      this.emit('auditStorageError', { event: auditEvent, error });
    }

    return auditEvent.id;
  }

  async queryAuditTrail(filters: {
    userId?: string;
    operation?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    outcome?: 'success' | 'failure' | 'warning';
  }): Promise<AuditEvent[]> {

      .from('audit_events')
      .select('*')
      .order('timestamp', { ascending: false });

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.operation) {
      query = query.eq('operation', filters.operation);
    }
    if (filters.resource) {
      query = query.eq('resource', filters.resource);
    }
    if (filters.outcome) {
      query = query.eq('outcome', filters.outcome);
    }
    if (filters.startDate) {
      query = query.gte('timestamp', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      query = query.lte('timestamp', filters.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to query audit trail: ${error.message}`);
    }

    return data?.map(this.mapDatabaseToAuditEvent) || [];
  }

  private mapDatabaseToAuditEvent(row: unknown): AuditEvent {
    return {
      id: row.audit_id,
      userId: row.user_id,
      userRole: row.user_role,
      operation: row.operation,
      resource: row.resource,
      outcome: row.outcome,
      timestamp: new Date(row.timestamp),
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      dataAccessed: row.data_accessed,
      changes: row.changes,
      complianceFlags: row.compliance_flags,
      metadata: row.metadata
    };
  }

  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }
}

// Consent Management System
export class ConsentManagementSystem extends EventEmitter {
  constructor(private supabase: ReturnType<typeof createClient>) {
    super();
  }

  async recordConsent(consent: Omit<ConsentRecord, 'id' | 'timestamp'>): Promise<string> {
    const consentRecord: ConsentRecord = {
      id: this.generateConsentId(),
      timestamp: new Date(),
      ...consent
    };

    try {
      const { error } = await this.supabase.from('consent_records').insert({
        consent_id: consentRecord.id,
        user_id: consentRecord.userId,
        consent_type: consentRecord.consentType,
        status: consentRecord.status,
        timestamp: consentRecord.timestamp.toISOString(),
        expiration_date: consentRecord.expirationDate?.toISOString(),
        scope: consentRecord.scope,
        legal_basis: consentRecord.legalBasis,
        metadata: consentRecord.metadata,
        created_at: new Date().toISOString()
      } as unknown);

      if (error) {
        throw new Error(`Failed to record consent: ${error.message}`);
      }

      this.emit('consentRecorded', consentRecord);
      return consentRecord.id;
    } catch (error) {
      this.emit('consentRecordingError', { consent: consentRecord, error });
      throw error;
    }
  }

  async getConsent(userId: string, consentType?: string): Promise<ConsentRecord[]> {

      .from('consent_records')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (consentType) {
      query = query.eq('consent_type', consentType);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get consent: ${error.message}`);
    }

    return data?.map(this.mapDatabaseToConsentRecord) || [];
  }

  async isConsentValid(userId: string, consentType: string): Promise<boolean> {

      c.status === 'granted' &&
      (!c.expirationDate || c.expirationDate > new Date())
    );
    return !!validConsent;
  }

  private mapDatabaseToConsentRecord(row: unknown): ConsentRecord {
    return {
      id: row.consent_id,
      userId: row.user_id,
      consentType: row.consent_type,
      status: row.status,
      timestamp: new Date(row.timestamp),
      expirationDate: row.expiration_date ? new Date(row.expiration_date) : undefined,
      scope: row.scope,
      legalBasis: row.legal_basis,
      metadata: row.metadata
    };
  }

  private generateConsentId(): string {
    return `consent_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }
}

// Data Retention Management
export class DataRetentionManager extends EventEmitter {
  private retentionPolicies: Map<string, DataRetentionPolicy> = new Map();

  constructor(private supabase: ReturnType<typeof createClient>) {
    super();
    this.initializeDefaultPolicies();
  }

  private initializeDefaultPolicies(): void {
    // HIPAA retention policy
    this.addRetentionPolicy({
      id: 'hipaa-phi',
      dataType: 'PHI',
      retentionPeriod: 2555, // 7 years
      deletionMethod: 'secure_delete',
      exceptions: ['research_data', 'legal_hold'],
      complianceStandards: ['HIPAA']
    });

    // GDPR retention policy
    this.addRetentionPolicy({
      id: 'gdpr-personal',
      dataType: 'PII',
      retentionPeriod: 1095, // 3 years default
      deletionMethod: 'secure_delete',
      exceptions: ['legal_obligation', 'vital_interests'],
      complianceStandards: ['GDPR']
    });

    // Clinical trial data
    this.addRetentionPolicy({
      id: 'fda-clinical',
      dataType: 'clinical_data',
      retentionPeriod: 5475, // 15 years for FDA
      archivePeriod: 3650, // 10 years active
      deletionMethod: 'secure_delete',
      exceptions: ['ongoing_trial', 'regulatory_review'],
      complianceStandards: ['FDA_21_CFR_11']
    });
  }

  addRetentionPolicy(policy: DataRetentionPolicy): void {
    this.retentionPolicies.set(policy.id, policy);
    this.emit('retentionPolicyAdded', policy);
  }

  async evaluateRetention(): Promise<void> {
    for (const policy of this.retentionPolicies.values()) {
      await this.enforceRetentionPolicy(policy);
    }
  }

  private async enforceRetentionPolicy(policy: DataRetentionPolicy): Promise<void> {

    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionPeriod);

    // Find data eligible for deletion/archival
    const { data: eligibleData, error } = await this.supabase
      .from('data_retention_tracking')
      .select('*')
      .eq('data_type', policy.dataType)
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      // console.error('Failed to query retention data:', error);
      return;
    }

    for (const item of eligibleData || []) {
      if (!policy.exceptions.some(exception => (item as unknown).tags?.includes(exception))) {
        await this.processRetentionAction(item, policy);
      }
    }
  }

  private async processRetentionAction(item: unknown, policy: DataRetentionPolicy): Promise<void> {
    try {
      switch (policy.deletionMethod) {
        case 'secure_delete':
          await this.secureDelete(item);
          break;
        case 'anonymize':
          await this.anonymizeData(item);
          break;
        case 'pseudonymize':
          await this.pseudonymizeData(item);
          break;
      }

      // Log retention action
      await this.supabase.from('retention_actions').insert({
        data_id: item.id,
        policy_id: policy.id,
        action: policy.deletionMethod,
        timestamp: new Date().toISOString(),
        metadata: { originalDataType: policy.dataType }
      } as unknown);

      this.emit('retentionActionCompleted', { item, policy, action: policy.deletionMethod });
    } catch (error) {
      // console.error('Failed to process retention action:', error);
      this.emit('retentionActionError', { item, policy, error });
    }
  }

  private async secureDelete(item: unknown): Promise<void> {
    // Implement secure deletion logic
    // This would involve multiple overwrite passes for sensitive data
    await (this.supabase.from(item.table_name) as unknown).delete().eq('id', item.data_id);
  }

  private async anonymizeData(item: unknown): Promise<void> {
    // Implement anonymization logic
    // Remove all personally identifiable information

    await (this.supabase
      .from(item.table_name) as unknown)
      .update({ data: anonymizedData, anonymized: true })
      .eq('id', item.data_id);
  }

  private async pseudonymizeData(item: unknown): Promise<void> {
    // Implement pseudonymization logic
    // Replace identifiers with pseudonyms

    await (this.supabase
      .from(item.table_name) as unknown)
      .update({ data: pseudonymizedData, pseudonymized: true })
      .eq('id', item.data_id);
  }

  private removeIdentifiers(data: unknown): unknown {
    // Implementation would remove PII fields

    for (const field of sensitiveFields) {
      if (field in anonymized) {
        // eslint-disable-next-line security/detect-object-injection
        delete anonymized[field];
      }
    }

    return anonymized;
  }

  private replacePseudonyms(data: unknown): unknown {
    // Implementation would replace identifiers with pseudonyms

    if (pseudonymized.email) {
      pseudonymized.email = this.generatePseudonym(pseudonymized.email);
    }
    if (pseudonymized.name) {
      pseudonymized.name = this.generatePseudonym(pseudonymized.name);
    }

    return pseudonymized;
  }

  private generatePseudonym(originalValue: string): string {
    return createHash('sha256').update(originalValue + 'salt').digest('hex').substring(0, 16);
  }
}

// Main Compliance Framework
export class ComplianceFramework extends EventEmitter {
  private rules: Map<string, ComplianceRule> = new Map();
  public readonly auditTrail: AuditTrailSystem;
  public readonly consentManagement: ConsentManagementSystem;
  public readonly dataRetention: DataRetentionManager;

  constructor(private supabase: ReturnType<typeof createClient>) {
    super();

    this.auditTrail = new AuditTrailSystem(supabase);
    this.consentManagement = new ConsentManagementSystem(supabase);
    this.dataRetention = new DataRetentionManager(supabase);

    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    // HIPAA Rules
    this.addRule({
      id: 'hipaa-minimum-necessary',
      name: 'HIPAA Minimum Necessary Standard',
      standard: 'HIPAA',
      category: 'data_protection',
      severity: 'critical',
      description: 'Ensure only minimum necessary PHI is accessed and disclosed',
      validator: new HIPAAMinimumNecessaryValidator()
    });

    // GDPR Rules
    this.addRule({
      id: 'gdpr-lawful-basis',
      name: 'GDPR Lawful Basis for Processing',
      standard: 'GDPR',
      category: 'data_protection',
      severity: 'critical',
      description: 'Ensure lawful basis exists for personal data processing',
      validator: new GDPRLawfulBasisValidator()
    });

    // FDA 21 CFR Part 11 Rules
    this.addRule({
      id: 'fda-21-cfr-11',
      name: 'FDA 21 CFR Part 11 Electronic Records',
      standard: 'FDA_21_CFR_11',
      category: 'data_integrity',
      severity: 'critical',
      description: 'Ensure electronic records and signatures meet FDA requirements',
      validator: new FDA21CFR11Validator()
    });
  }

  addRule(rule: ComplianceRule): void {
    this.rules.set(rule.id, rule);
    this.emit('ruleAdded', rule);
  }

  async validateCompliance(context: ComplianceContext): Promise<ComplianceResult[]> {
    const results: ComplianceResult[] = [];

    for (const rule of this.rules.values()) {
      try {

        results.push(result);

        if (!result.compliant) {
          this.emit('complianceViolation', { rule, result, context });

          // Log audit event for compliance violation
          await this.auditTrail.logEvent({
            userId: context.userId || 'system',
            userRole: context.userRole || 'unknown',
            operation: 'compliance_check',
            resource: rule.id,
            outcome: 'warning',
            complianceFlags: {
              hipaa: rule.standard === 'HIPAA',
              gdpr: rule.standard === 'GDPR',
              fda21cfr11: rule.standard === 'FDA_21_CFR_11'
            },
            metadata: { violations: result.violations, riskLevel: result.riskLevel }
          });
        }
      } catch (error) {
        // console.error(`Compliance rule ${rule.id} validation failed:`, error);
        results.push({
          compliant: false,
          ruleId: rule.id,
          violations: [{
            type: 'validation_error',
            description: error instanceof Error ? error.message : 'Unknown error',
            severity: 'high'
          }],
          recommendations: ['Review compliance rule implementation'],
          riskLevel: 'high'
        });
      }
    }

    return results;
  }

  async generateComplianceReport(
    startDate: Date,
    endDate: Date,
    standards?: string[]
  ): Promise<ComplianceReport> {
    // Get audit events for the period

      startDate,
      endDate
    });

    // Filter rules by standards if specified

      !standards || standards.includes(rule.standard)
    );

    // Calculate compliance metrics

      e.operation === 'compliance_check' && e.outcome === 'warning'
    ).length;

    return {
      period: { startDate, endDate },
      standards: standards || ['HIPAA', 'GDPR', 'FDA_21_CFR_11'],
      metrics: {
        totalChecks,
        violations,
        complianceRate,
        riskLevel: this.calculateOverallRiskLevel(auditEvents)
      },
      rulesSummary: relevantRules.map(rule => ({
        id: rule.id,
        name: rule.name,
        standard: rule.standard,
        category: rule.category,
        severity: rule.severity
      })),
      recentViolations: auditEvents
        .filter(e => e.operation === 'compliance_check' && e.outcome === 'warning')
        .slice(0, 10)
        .map(this.mapAuditEventToViolationSummary),
      recommendations: this.generateRecommendations(auditEvents),
      generatedAt: new Date()
    };
  }

  private calculateOverallRiskLevel(auditEvents: AuditEvent[]): 'low' | 'medium' | 'high' | 'critical' {

      e.metadata?.riskLevel === 'critical'
    ).length;

      e.metadata?.riskLevel === 'high'
    ).length;

    if (criticalViolations > 0) return 'critical';
    if (highViolations > 2) return 'high';
    if (highViolations > 0) return 'medium';
    return 'low';
  }

  private mapAuditEventToViolationSummary(event: AuditEvent): unknown {
    return {
      timestamp: event.timestamp,
      rule: event.resource,
      userId: event.userId,
      violations: event.metadata?.violations?.length || 0,
      riskLevel: event.metadata?.riskLevel
    };
  }

  private generateRecommendations(auditEvents: AuditEvent[]): string[] {

    auditEvents.forEach(event => {
      if (event.metadata?.violations) {
        event.metadata.violations.forEach((violation: unknown) => {

          violationTypes.set(violation.type, count + 1);
        });
      }
    });

    // Generate recommendations based on violation patterns
    if (violationTypes.get('missing_consent') && violationTypes.get('missing_consent')! > 3) {
      recommendations.add('Implement automated consent collection system');
    }

    if (violationTypes.get('excessive_phi_exposure')) {
      recommendations.add('Review and implement data minimization practices');
    }

    if (violationTypes.get('missing_electronic_signature')) {
      recommendations.add('Deploy electronic signature system for clinical data');
    }

    return Array.from(recommendations);
  }

  getRules(standard?: string): ComplianceRule[] {

    return standard ? rules.filter(rule => rule.standard === standard) : rules;
  }

  // Create compliance middleware for API routes
  createComplianceMiddleware() {
    return async (context: ComplianceContext) => {

      if (violations.some(v => v.severity === 'critical')) {
        throw new Error('Critical compliance violations detected');
      }

      return {
        compliant: violations.length === 0,
        violations,
        riskLevel: this.calculateRiskLevel(results)
      };
    };
  }

  private calculateRiskLevel(results: ComplianceResult[]): 'low' | 'medium' | 'high' | 'critical' {

    if (riskLevels.includes('critical')) return 'critical';
    if (riskLevels.includes('high')) return 'high';
    if (riskLevels.includes('medium')) return 'medium';
    return 'low';
  }
}

// Compliance Report Interface
export interface ComplianceReport {
  period: { startDate: Date; endDate: Date };
  standards: string[];
  metrics: {
    totalChecks: number;
    violations: number;
    complianceRate: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  rulesSummary: Array<{
    id: string;
    name: string;
    standard: string;
    category: string;
    severity: string;
  }>;
  recentViolations: unknown[];
  recommendations: string[];
  generatedAt: Date;
}

// Export singleton instance
export const __complianceFramework = new ComplianceFramework(
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
);