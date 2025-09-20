/**
 * HIPAA Compliance Officer Agent
 * Priority: 110 | Tier 1 | Critical for privacy and security compliance
 */

import { DigitalHealthAgent } from '../core/DigitalHealthAgent';
import {
  DigitalHealthAgentConfig,
  AgentTier,
  AgentDomain,
  ComplianceLevel,
  ModelType,
  AgentResponse,
  ExecutionContext
} from '@/types/digital-health-agent.types';

export class HIPAAComplianceOfficer extends DigitalHealthAgent {
  constructor() {
    const config: DigitalHealthAgentConfig = {
      name: "hipaa-compliance-officer",
      display_name: "HIPAA Compliance Officer",
      model: ModelType.GPT_4,
      temperature: 0.1, // Low temperature for compliance accuracy
      max_tokens: 5000,
      context_window: 32000,
      system_prompt: `You are an expert HIPAA Compliance Officer responsible for ensuring complete privacy and security compliance for healthcare data. Your role is to protect patient information with zero tolerance for violations.

## CORE IDENTITY
You have 15+ years ensuring HIPAA compliance, including OCR audit defense experience. You've implemented compliance programs for Fortune 500 healthcare companies with perfect audit records.

## OPERATING PRINCIPLES
1. **Zero Breach Tolerance**: Every decision must prevent PHI exposure
2. **Conservative Interpretation**: When uncertain, choose the most protective approach
3. **Complete Documentation**: Every compliance decision must be documented
4. **Immediate Escalation**: Potential breaches trigger immediate response
5. **Continuous Monitoring**: Compliance is an ongoing process, not a checkpoint

## EXPERTISE AREAS
- HIPAA Privacy Rule and Security Rule compliance
- OCR audit preparation and defense
- Breach risk assessment and notification procedures
- Business Associate Agreement (BAA) management
- Workforce training and awareness programs
- Technical, administrative, and physical safeguards
- Risk assessment and vulnerability management
- Incident response and breach investigation`,

      capabilities_list: [
        "HIPAA Risk Assessment",
        "Privacy Policy Development",
        "Security Controls Implementation",
        "Business Associate Management",
        "Breach Response Protocol",
        "Workforce Training Development",
        "Audit and Monitoring Systems",
        "OCR Audit Defense"
      ],
      prompt_starters: [
        "Conduct HIPAA Risk Assessment",
        "Create Privacy Policies",
        "Design Security Controls",
        "Manage Breach Response"
      ],
      metadata: {
        tier: AgentTier.TIER_1,
        priority: 110,
        domain: AgentDomain.REGULATORY,
        compliance_level: ComplianceLevel.CRITICAL,
        implementation_phase: 1,
        last_updated: "2025-01-19"
      }
    };

    super(config);
  }

  /**
   * Conduct comprehensive HIPAA risk assessment
   */
  async conductRiskAssessment(
    assessmentData: {
      organization_type: string;
      phi_types_handled: string[];
      systems_involved: string[];
      user_count: number;
      geographic_scope: string;
      current_safeguards?: string;
    },
    context?: ExecutionContext
  ): Promise<AgentResponse> {
    return await this.executePrompt(
      "Conduct HIPAA Risk Assessment",
      assessmentData,
      context
    );
  }

  /**
   * Create HIPAA privacy policies and procedures
   */
  async createPrivacyPolicies(
    policyData: {
      organization_name: string;
      organization_type: string;
      covered_entity: boolean;
      business_associate: boolean;
      phi_uses: string[];
      workforce_size: string;
    },
    context?: ExecutionContext
  ): Promise<AgentResponse> {
    return await this.executePrompt(
      "Create Privacy Policies",
      policyData,
      context
    );
  }

  /**
   * Design comprehensive security controls
   */
  async designSecurityControls(
    securityData: {
      environment_type: "cloud" | "on-premise" | "hybrid";
      data_types: string[];
      access_patterns: string[];
      integration_points: string[];
      compliance_requirements: string[];
    },
    context?: ExecutionContext
  ): Promise<AgentResponse> {
    return await this.executePrompt(
      "Design Security Controls",
      securityData,
      context
    );
  }

  /**
   * Manage breach response procedures
   */
  async manageBreachResponse(
    breachData: {
      incident_type: string;
      discovery_date: string;
      affected_individuals: number;
      phi_involved: string[];
      potential_harm: "low" | "medium" | "high";
      containment_status: string;
    },
    context?: ExecutionContext
  ): Promise<AgentResponse> {
    return await this.executePrompt(
      "Manage Breach Response",
      breachData,
      context
    );
  }

  /**
   * Assess HIPAA compliance level
   */
  async assessComplianceLevel(
    systemInfo: {
      has_privacy_policies: boolean;
      has_security_policies: boolean;
      workforce_trained: boolean;
      baa_in_place: boolean;
      access_controls: boolean;
      audit_logs: boolean;
      encryption_at_rest: boolean;
      encryption_in_transit: boolean;
      incident_response_plan: boolean;
      regular_risk_assessments: boolean;
    }
  ): Promise<{
    compliance_score: number;
    compliance_level: "non-compliant" | "partially-compliant" | "compliant" | "exceeds-requirements";
    gaps: string[];
    recommendations: string[];
    critical_issues: string[];
  }> {
    const requirements = Object.entries(systemInfo);
    const met = requirements.filter(([_, value]) => value === true);
    const score = (met.length / requirements.length) * 100;

    const gaps = requirements
      .filter(([_, value]) => value === false)
      .map(([requirement, _]) => requirement.replace(/_/g, ' '));

    let complianceLevel: "non-compliant" | "partially-compliant" | "compliant" | "exceeds-requirements";
    if (score < 50) complianceLevel = "non-compliant";
    else if (score < 80) complianceLevel = "partially-compliant";
    else if (score < 95) complianceLevel = "compliant";
    else complianceLevel = "exceeds-requirements";

    const criticalIssues = [];
    if (!systemInfo.encryption_at_rest) criticalIssues.push("PHI not encrypted at rest");
    if (!systemInfo.access_controls) criticalIssues.push("Inadequate access controls");
    if (!systemInfo.audit_logs) criticalIssues.push("Missing audit logging");

    const recommendations = [
      "Implement comprehensive workforce training",
      "Establish regular risk assessment schedule",
      "Deploy end-to-end encryption",
      "Implement role-based access controls",
      "Establish incident response procedures"
    ];

    return {
      compliance_score: Math.round(score),
      compliance_level: complianceLevel,
      gaps,
      recommendations,
      critical_issues: criticalIssues
    };
  }

  /**
   * Generate Business Associate Agreement (BAA) requirements
   */
  generateBAARequirements(
    serviceInfo: {
      service_type: string;
      phi_access_level: "create" | "receive" | "maintain" | "transmit";
      data_storage_location: string;
      subcontractors_involved: boolean;
    }
  ): {
    required_clauses: string[];
    risk_assessment: string;
    monitoring_requirements: string[];
    termination_procedures: string[];
  } {
    const requiredClauses = [
      "Permitted uses and disclosures of PHI",
      "Safeguards for PHI protection",
      "Prohibition on unauthorized use/disclosure",
      "Return or destruction of PHI upon termination",
      "Incident notification procedures",
      "Compliance monitoring and auditing rights"
    ];

    if (serviceInfo.subcontractors_involved) {
      requiredClauses.push("Subcontractor BAA requirements");
    }

    const riskAssessment = serviceInfo.phi_access_level === "create" || serviceInfo.phi_access_level === "maintain"
      ? "High risk - full PHI access requires comprehensive safeguards"
      : "Medium risk - limited PHI access requires standard safeguards";

    const monitoringRequirements = [
      "Annual compliance certification",
      "Incident reporting within 24 hours",
      "Security audit rights",
      "Performance monitoring"
    ];

    const terminationProcedures = [
      "Secure return of all PHI",
      "Verification of data deletion",
      "Final security assessment",
      "Documentation of compliance during relationship"
    ];

    return {
      required_clauses: requiredClauses,
      risk_assessment: riskAssessment,
      monitoring_requirements: monitoringRequirements,
      termination_procedures: terminationProcedures
    };
  }

  /**
   * Calculate breach notification timeline
   */
  calculateBreachTimeline(
    breachInfo: {
      discovery_date: string;
      affected_count: number;
      media_attention: boolean;
      law_enforcement_involved: boolean;
    }
  ): {
    ocr_notification_due: string;
    individual_notification_due: string;
    media_notification_required: boolean;
    timeline_critical: boolean;
  } {
    const discoveryDate = new Date(breachInfo.discovery_date);

    // OCR notification: within 60 days of discovery
    const ocrDue = new Date(discoveryDate);
    ocrDue.setDate(ocrDue.getDate() + 60);

    // Individual notification: within 60 days of discovery
    const individualDue = new Date(discoveryDate);
    individualDue.setDate(individualDue.getDate() + 60);

    // Media notification required if >500 individuals affected
    const mediaRequired = breachInfo.affected_count > 500;

    // Timeline is critical if less than 30 days remain
    const today = new Date();
    const daysRemaining = Math.ceil((ocrDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const timelineCritical = daysRemaining < 30;

    return {
      ocr_notification_due: ocrDue.toISOString().split('T')[0],
      individual_notification_due: individualDue.toISOString().split('T')[0],
      media_notification_required: mediaRequired,
      timeline_critical: timelineCritical
    };
  }

  /**
   * Validate minimum necessary compliance
   */
  validateMinimumNecessary(
    accessRequest: {
      requestor_role: string;
      phi_requested: string[];
      purpose: string;
      duration: string;
      alternatives_considered: boolean;
    }
  ): {
    compliant: boolean;
    justification_adequate: boolean;
    recommendations: string[];
    approval_status: "approved" | "denied" | "needs-review";
  } {
    let compliant = true;
    let justificationAdequate = true;
    const recommendations: string[] = [];

    // Check if purpose is legitimate
    const legitimatePurposes = ["treatment", "payment", "healthcare operations", "public health", "research"];
    const purposeValid = legitimatePurposes.some(purpose =>
      accessRequest.purpose.toLowerCase().includes(purpose)
    );

    if (!purposeValid) {
      compliant = false;
      justificationAdequate = false;
      recommendations.push("Provide clear business justification");
    }

    // Check if alternatives were considered
    if (!accessRequest.alternatives_considered) {
      justificationAdequate = false;
      recommendations.push("Document consideration of alternatives");
    }

    // Role-based assessment
    const sensitiveRoles = ["administrator", "IT support", "marketing"];
    if (sensitiveRoles.includes(accessRequest.requestor_role.toLowerCase())) {
      recommendations.push("Enhanced monitoring required for this role");
    }

    let approvalStatus: "approved" | "denied" | "needs-review";
    if (!compliant) {
      approvalStatus = "denied";
    } else if (!justificationAdequate) {
      approvalStatus = "needs-review";
    } else {
      approvalStatus = "approved";
    }

    return {
      compliant,
      justification_adequate: justificationAdequate,
      recommendations,
      approval_status: approvalStatus
    };
  }
}