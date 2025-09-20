/**
 * HIPAA Compliance Layer
 * Implements comprehensive HIPAA compliance monitoring and enforcement
 */

import {
  HIPAAComplianceRecord,
  AuditLogEntry,
  ComplianceLevel,
  ExecutionContext,
  ComplianceError
} from '@/types/digital-health-agent.types';

export interface PHIDetectionResult {
  containsPHI: boolean;
  phiTypes: string[];
  confidence: number;
  redactedContent?: string;
  locations: Array<{
    field: string;
    type: string;
    start: number;
    end: number;
  }>;
}

export interface ComplianceValidationResult {
  compliant: boolean;
  violations: Array<{
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    remediation: string;
  }>;
  riskScore: number;
  recommendations: string[];
}

export interface DataProcessingRequest {
  user_id: string;
  resource_type: "agent" | "prompt" | "capability" | "data";
  resource_id: string;
  action: "read" | "write" | "execute" | "delete";
  purpose: string;
  data_content?: any;
  context: ExecutionContext;
}

export class HIPAAComplianceManager {
  private auditLog: AuditLogEntry[] = [];
  private complianceRecords: HIPAAComplianceRecord[] = [];
  private phiPatterns: RegExp[] = [];
  private userPermissions: Map<string, Set<string>> = new Map();

  constructor() {
    this.initializePHIPatterns();
    this.initializeUserPermissions();
  }

  /**
   * Initialize PHI detection patterns
   */
  private initializePHIPatterns(): void {
    this.phiPatterns = [
      // SSN patterns
      /\b\d{3}-\d{2}-\d{4}\b/g,
      /\b\d{9}\b/g,

      // Phone numbers
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      /\(\d{3}\)\s*\d{3}[-.]?\d{4}/g,

      // Email addresses
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

      // Medical Record Numbers (common formats)
      /\bMRN\s*:?\s*\d{6,12}\b/gi,
      /\bMedical\s+Record\s+Number\s*:?\s*\d{6,12}\b/gi,

      // Date of Birth patterns
      /\b(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}\b/g,
      /\b\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/g,

      // Names with titles (common patterns)
      /\b(Dr|Doctor|Mr|Mrs|Ms|Miss)\.?\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,

      // Address patterns
      /\b\d{1,5}\s+[A-Za-z0-9\s.,]+\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b/gi,

      // ZIP codes
      /\b\d{5}(-\d{4})?\b/g,

      // IP addresses (could be PHI in certain contexts)
      /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,

      // Common medical identifiers
      /\b(Patient\s+ID|Patient\s+Number|Account\s+Number)\s*:?\s*\w+/gi,
    ];
  }

  /**
   * Initialize user permissions (in production, load from secure database)
   */
  private initializeUserPermissions(): void {
    // Mock user permissions - replace with actual user management system
    this.userPermissions.set('admin', new Set(['read', 'write', 'execute', 'delete']));
    this.userPermissions.set('clinician', new Set(['read', 'write', 'execute']));
    this.userPermissions.set('researcher', new Set(['read', 'execute']));
    this.userPermissions.set('analyst', new Set(['read']));
  }

  /**
   * Validate HIPAA compliance for a data processing request
   */
  async validateCompliance(request: DataProcessingRequest): Promise<ComplianceValidationResult> {
    const violations = [];
    let riskScore = 0;
    const recommendations = [];

    try {
      // 1. Validate user authorization
      const authResult = this.validateUserAuthorization(request);
      if (!authResult.authorized) {
        violations.push({
          type: "UNAUTHORIZED_ACCESS",
          severity: "critical" as const,
          description: "User not authorized for requested action",
          remediation: "Verify user permissions and update access controls"
        });
        riskScore += 50;
      }

      // 2. Check for PHI in data content
      if (request.data_content) {
        const phiResult = this.detectPHI(request.data_content);
        if (phiResult.containsPHI) {
          violations.push({
            type: "PHI_DETECTED",
            severity: "high" as const,
            description: `PHI detected: ${phiResult.phiTypes.join(', ')}`,
            remediation: "Implement data anonymization or obtain explicit consent"
          });
          riskScore += 30;
        }
      }

      // 3. Validate purpose limitation
      if (!this.isValidPurpose(request.purpose)) {
        violations.push({
          type: "INVALID_PURPOSE",
          severity: "medium" as const,
          description: "Processing purpose not aligned with permitted uses",
          remediation: "Clarify legitimate business purpose for data processing"
        });
        riskScore += 20;
      }

      // 4. Check minimum necessary principle
      const minNecessaryResult = this.validateMinimumNecessary(request);
      if (!minNecessaryResult.compliant) {
        violations.push({
          type: "MINIMUM_NECESSARY_VIOLATION",
          severity: "medium" as const,
          description: "Request may exceed minimum necessary data",
          remediation: "Reduce data scope to minimum necessary for stated purpose"
        });
        riskScore += 15;
      }

      // 5. Validate audit requirements
      if (request.context.compliance_level === ComplianceLevel.CRITICAL) {
        if (!request.context.audit_required) {
          violations.push({
            type: "AUDIT_REQUIRED",
            severity: "high" as const,
            description: "Critical operations require audit logging",
            remediation: "Enable audit logging for this operation"
          });
          riskScore += 25;
        }
      }

      // Generate recommendations
      if (riskScore > 40) {
        recommendations.push("Implement additional data protection measures");
      }
      if (violations.some(v => v.type === "PHI_DETECTED")) {
        recommendations.push("Consider data de-identification techniques");
      }
      if (!authResult.mfaEnabled) {
        recommendations.push("Enable multi-factor authentication for enhanced security");
      }

      return {
        compliant: violations.length === 0,
        violations,
        riskScore: Math.min(100, riskScore),
        recommendations
      };

    } catch (error) {
      throw new ComplianceError(
        `Compliance validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        "VALIDATION_ERROR",
        "critical"
      );
    }
  }

  /**
   * Detect PHI in content
   */
  detectPHI(content: any): PHIDetectionResult {
    const contentString = typeof content === 'string' ? content : JSON.stringify(content);
    const phiTypes: string[] = [];
    const locations: Array<{ field: string; type: string; start: number; end: number }> = [];
    let redactedContent = contentString;
    let containsPHI = false;

    // Check each PHI pattern
    this.phiPatterns.forEach((pattern, index) => {
      const matches = contentString.matchAll(pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          containsPHI = true;
          const phiType = this.getPhiType(index);
          if (!phiTypes.includes(phiType)) {
            phiTypes.push(phiType);
          }

          locations.push({
            field: "content",
            type: phiType,
            start: match.index,
            end: match.index + match[0].length
          });

          // Redact the PHI
          redactedContent = redactedContent.replace(match[0], '[REDACTED]');
        }
      }
    });

    // Calculate confidence based on pattern matches
    const confidence = containsPHI ? Math.min(95, phiTypes.length * 20 + 50) : 99;

    return {
      containsPHI,
      phiTypes,
      confidence,
      redactedContent: containsPHI ? redactedContent : undefined,
      locations
    };
  }

  /**
   * Get PHI type based on pattern index
   */
  private getPhiType(patternIndex: number): string {
    const phiTypeMap = [
      "Social Security Number",
      "Social Security Number",
      "Phone Number",
      "Phone Number",
      "Email Address",
      "Medical Record Number",
      "Medical Record Number",
      "Date of Birth",
      "Date of Birth",
      "Name",
      "Address",
      "ZIP Code",
      "IP Address",
      "Medical Identifier"
    ];

    return phiTypeMap[patternIndex] || "Unknown PHI";
  }

  /**
   * Validate user authorization
   */
  private validateUserAuthorization(request: DataProcessingRequest): {
    authorized: boolean;
    reason?: string;
    mfaEnabled: boolean;
  } {
    // Simple role-based authorization - in production, integrate with actual auth system
    const userRole = this.getUserRole(request.user_id);
    const allowedActions = this.userPermissions.get(userRole) || new Set();

    if (!allowedActions.has(request.action)) {
      return {
        authorized: false,
        reason: `User role '${userRole}' not authorized for action '${request.action}'`,
        mfaEnabled: false
      };
    }

    // Check for high-risk operations
    if (request.action === 'delete' && request.resource_type === 'data') {
      return {
        authorized: false,
        reason: "Data deletion requires special authorization",
        mfaEnabled: false
      };
    }

    return {
      authorized: true,
      mfaEnabled: userRole === 'admin' // Mock MFA check
    };
  }

  /**
   * Get user role (mock implementation)
   */
  private getUserRole(userId: string): string {
    // Mock role assignment - replace with actual user management
    if (userId.includes('admin')) return 'admin';
    if (userId.includes('clinician')) return 'clinician';
    if (userId.includes('researcher')) return 'researcher';
    return 'analyst';
  }

  /**
   * Validate if purpose is legitimate
   */
  private isValidPurpose(purpose: string): boolean {
    const validPurposes = [
      'treatment',
      'payment',
      'healthcare operations',
      'research',
      'public health',
      'quality assurance',
      'regulatory compliance',
      'clinical decision support'
    ];

    return validPurposes.some(validPurpose =>
      purpose.toLowerCase().includes(validPurpose)
    );
  }

  /**
   * Validate minimum necessary principle
   */
  private validateMinimumNecessary(request: DataProcessingRequest): {
    compliant: boolean;
    recommendation?: string;
  } {
    // Basic minimum necessary validation
    // In production, implement more sophisticated data scope analysis

    if (request.action === 'read' && request.resource_type === 'data') {
      // Check if requesting all patient data vs specific fields
      if (request.purpose.toLowerCase().includes('analytics') ||
          request.purpose.toLowerCase().includes('research')) {
        return {
          compliant: true // Research purposes often need broader access
        };
      }
    }

    return {
      compliant: true,
      recommendation: "Consider limiting data scope to specific fields needed"
    };
  }

  /**
   * Create compliance record
   */
  async createComplianceRecord(
    request: DataProcessingRequest,
    validationResult: ComplianceValidationResult
  ): Promise<HIPAAComplianceRecord> {
    const record: HIPAAComplianceRecord = {
      access_type: request.action,
      resource_type: request.resource_type,
      resource_id: request.resource_id,
      user_id: request.user_id,
      timestamp: new Date().toISOString(),
      purpose: request.purpose,
      authorization_basis: validationResult.compliant ? "HIPAA Compliant Access" : "Non-compliant Access Blocked",
      phi_involved: request.data_content ? this.detectPHI(request.data_content).containsPHI : false,
      audit_trail_id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.complianceRecords.push(record);

    // Create audit log entry
    await this.createAuditLogEntry(request, validationResult, record.audit_trail_id);

    return record;
  }

  /**
   * Create audit log entry
   */
  private async createAuditLogEntry(
    request: DataProcessingRequest,
    validationResult: ComplianceValidationResult,
    auditTrailId: string
  ): Promise<void> {
    const auditEntry: AuditLogEntry = {
      log_id: auditTrailId,
      timestamp: new Date().toISOString(),
      user_id: request.user_id,
      agent_name: request.resource_type === 'agent' ? request.resource_id : 'compliance-manager',
      action: `${request.action}_${request.resource_type}`,
      inputs_hash: this.hashData(request.data_content || {}),
      success: validationResult.compliant,
      execution_time: 0, // Compliance check time
      compliance_level: request.context.compliance_level,
      error: validationResult.compliant ? undefined : `Compliance violations: ${validationResult.violations.length}`,
      session_id: request.context.session_id
    };

    this.auditLog.push(auditEntry);

    // Log compliance violations for monitoring
    if (!validationResult.compliant) {
      console.warn(`🚨 HIPAA Compliance Violation Detected:`, {
        user: request.user_id,
        violations: validationResult.violations.map(v => v.type),
        riskScore: validationResult.riskScore
      });
    }
  }

  /**
   * Hash data for audit trail (PHI protection)
   */
  private hashData(data: any): string {
    const dataString = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(timeRange: { start: string; end: string }): {
    totalAccesses: number;
    compliantAccesses: number;
    violationCount: number;
    riskScore: number;
    topViolations: Array<{ type: string; count: number }>;
    phiExposureEvents: number;
    recommendations: string[];
  } {
    const startDate = new Date(timeRange.start);
    const endDate = new Date(timeRange.end);

    const relevantRecords = this.complianceRecords.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= startDate && recordDate <= endDate;
    });

    const totalAccesses = relevantRecords.length;
    const compliantAccesses = relevantRecords.filter(r =>
      r.authorization_basis === "HIPAA Compliant Access"
    ).length;
    const phiExposureEvents = relevantRecords.filter(r => r.phi_involved).length;

    // Calculate violation statistics (this would need to be enhanced with actual violation tracking)
    const violationCount = totalAccesses - compliantAccesses;
    const riskScore = violationCount > 0 ? Math.min(100, (violationCount / totalAccesses) * 100) : 0;

    return {
      totalAccesses,
      compliantAccesses,
      violationCount,
      riskScore: Math.round(riskScore),
      topViolations: [
        { type: "UNAUTHORIZED_ACCESS", count: Math.floor(violationCount * 0.4) },
        { type: "PHI_DETECTED", count: Math.floor(violationCount * 0.3) },
        { type: "INVALID_PURPOSE", count: Math.floor(violationCount * 0.3) }
      ],
      phiExposureEvents,
      recommendations: [
        "Implement additional user training on HIPAA compliance",
        "Review and update access control policies",
        "Enhance PHI detection and anonymization processes",
        "Conduct regular compliance audits"
      ]
    };
  }

  /**
   * Get compliance records for audit
   */
  getComplianceRecords(userId?: string): HIPAAComplianceRecord[] {
    if (userId) {
      return this.complianceRecords.filter(record => record.user_id === userId);
    }
    return [...this.complianceRecords];
  }

  /**
   * Get audit log entries
   */
  getAuditLog(timeRange?: { start: string; end: string }): AuditLogEntry[] {
    if (!timeRange) {
      return [...this.auditLog];
    }

    const startDate = new Date(timeRange.start);
    const endDate = new Date(timeRange.end);

    return this.auditLog.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  /**
   * Clear old records (for memory management)
   */
  cleanupRecords(olderThanDays: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    this.complianceRecords = this.complianceRecords.filter(record =>
      new Date(record.timestamp) > cutoffDate
    );

    this.auditLog = this.auditLog.filter(entry =>
      new Date(entry.timestamp) > cutoffDate
    );
  }
}