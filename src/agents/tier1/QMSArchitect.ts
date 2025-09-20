/**
 * QMS Architect Agent
 * Priority: 120 | Tier 1 | Critical for regulatory compliance and quality
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

export class QMSArchitect extends DigitalHealthAgent {
  constructor() {
    const config: DigitalHealthAgentConfig = {
      name: "qms-architect",
      display_name: "QMS Architect",
      model: ModelType.GPT_4,
      temperature: 0.1,
      max_tokens: 6000,
      context_window: 32000,
      system_prompt: `You are an expert Quality Management System (QMS) Architect with comprehensive knowledge of medical device quality systems. Your mission is to ensure 100% regulatory compliance while optimizing operational efficiency.

## CORE IDENTITY
You have 15+ years implementing QMS for medical device companies, including FDA inspections, ISO 13485 certifications, and MDR compliance. You've built quality systems for 200+ products with zero FDA warning letters.

## OPERATING PRINCIPLES
1. **Risk-Based Quality**: Focus quality efforts where they matter most
2. **Process Excellence**: Build systematic, repeatable quality processes
3. **Continuous Improvement**: Implement CAPA and management review cycles
4. **Regulatory Alignment**: Ensure full compliance with applicable standards
5. **Operational Efficiency**: Balance quality rigor with business agility

## EXPERTISE AREAS
- ISO 13485:2016 Medical Device QMS implementation
- FDA 21 CFR Part 820 Quality System Regulation compliance
- EU MDR (2017/745) and IVDR (2017/746) requirements
- Risk management per ISO 14971
- Design controls and verification/validation protocols
- CAPA (Corrective and Preventive Action) systems
- Supplier quality management and auditing
- Quality metrics and performance monitoring`,

      capabilities_list: [
        "QMS Design and Implementation",
        "Risk Management Planning",
        "Design Controls Framework",
        "CAPA System Design",
        "Supplier Quality Management",
        "Quality Metrics Development",
        "Audit and Inspection Readiness",
        "Documentation Control Systems"
      ],
      prompt_starters: [
        "Design QMS Architecture",
        "Create Risk Management Plan",
        "Develop Design Controls",
        "Build CAPA System"
      ],
      metadata: {
        tier: AgentTier.TIER_1,
        priority: 120,
        domain: AgentDomain.QUALITY,
        compliance_level: ComplianceLevel.CRITICAL,
        implementation_phase: 1,
        last_updated: "2025-01-19"
      }
    };

    super(config);
  }

  /**
   * Design comprehensive QMS architecture
   */
  async designQMSArchitecture(
    qmsData: {
      company_size: "startup" | "small" | "medium" | "large";
      device_types: string[];
      regulatory_markets: string[];
      current_qms_maturity: "none" | "basic" | "intermediate" | "advanced";
      timeline_requirements: string;
      resource_constraints: string;
    },
    context?: ExecutionContext
  ): Promise<AgentResponse> {
    return await this.executePrompt(
      "Design QMS Architecture",
      qmsData,
      context
    );
  }

  /**
   * Create comprehensive risk management plan
   */
  async createRiskManagementPlan(
    riskData: {
      device_name: string;
      intended_use: string;
      device_classification: string;
      known_hazards: string[];
      use_environment: string;
      user_profile: string;
      regulatory_requirements: string[];
    },
    context?: ExecutionContext
  ): Promise<AgentResponse> {
    return await this.executePrompt(
      "Create Risk Management Plan",
      riskData,
      context
    );
  }

  /**
   * Develop design controls framework
   */
  async developDesignControls(
    designData: {
      development_stage: string;
      device_complexity: "low" | "medium" | "high";
      regulatory_pathway: string;
      design_inputs: string[];
      verification_requirements: string[];
      validation_requirements: string[];
    },
    context?: ExecutionContext
  ): Promise<AgentResponse> {
    return await this.executePrompt(
      "Develop Design Controls",
      designData,
      context
    );
  }

  /**
   * Build CAPA system architecture
   */
  async buildCAPASystem(
    capaData: {
      organization_size: string;
      current_issues: string[];
      data_sources: string[];
      investigation_complexity: string;
      approval_workflow: string;
      tracking_requirements: string[];
    },
    context?: ExecutionContext
  ): Promise<AgentResponse> {
    return await this.executePrompt(
      "Build CAPA System",
      capaData,
      context
    );
  }

  /**
   * Assess QMS maturity level
   */
  assessQMSMaturity(
    assessmentData: {
      has_quality_manual: boolean;
      documented_procedures: boolean;
      management_responsibility: boolean;
      resource_management: boolean;
      product_realization: boolean;
      measurement_analysis: boolean;
      improvement_processes: boolean;
      risk_management: boolean;
      design_controls: boolean;
      supplier_controls: boolean;
      corrective_preventive_action: boolean;
      records_control: boolean;
    }
  ): {
    maturity_level: "initial" | "developing" | "defined" | "managed" | "optimizing";
    maturity_score: number;
    strengths: string[];
    gaps: string[];
    priority_improvements: string[];
    implementation_roadmap: Array<{
      phase: string;
      duration_months: number;
      activities: string[];
    }>;
  } {
    const requirements = Object.entries(assessmentData);
    const met = requirements.filter(([_, implemented]) => implemented === true);
    const score = (met.length / requirements.length) * 100;

    let maturityLevel: "initial" | "developing" | "defined" | "managed" | "optimizing";
    if (score < 20) maturityLevel = "initial";
    else if (score < 40) maturityLevel = "developing";
    else if (score < 60) maturityLevel = "defined";
    else if (score < 80) maturityLevel = "managed";
    else maturityLevel = "optimizing";

    const gaps = requirements
      .filter(([_, implemented]) => implemented === false)
      .map(([requirement, _]) => requirement.replace(/_/g, ' '));

    const strengths = requirements
      .filter(([_, implemented]) => implemented === true)
      .map(([requirement, _]) => requirement.replace(/_/g, ' '));

    const priorityImprovements = [];
    if (!assessmentData.management_responsibility) priorityImprovements.push("Establish management responsibility");
    if (!assessmentData.documented_procedures) priorityImprovements.push("Document core procedures");
    if (!assessmentData.design_controls) priorityImprovements.push("Implement design controls");
    if (!assessmentData.risk_management) priorityImprovements.push("Establish risk management");
    if (!assessmentData.corrective_preventive_action) priorityImprovements.push("Build CAPA system");

    const roadmap = [
      {
        phase: "Foundation",
        duration_months: 3,
        activities: ["Quality manual", "Management responsibility", "Document control"]
      },
      {
        phase: "Core Processes",
        duration_months: 6,
        activities: ["Design controls", "Risk management", "Supplier controls"]
      },
      {
        phase: "Advanced Systems",
        duration_months: 4,
        activities: ["CAPA system", "Management review", "Internal audits"]
      },
      {
        phase: "Optimization",
        duration_months: 3,
        activities: ["Process improvement", "Metrics analysis", "Continuous improvement"]
      }
    ];

    return {
      maturity_level: maturityLevel,
      maturity_score: Math.round(score),
      strengths,
      gaps,
      priority_improvements: priorityImprovements,
      implementation_roadmap: roadmap
    };
  }

  /**
   * Generate risk analysis matrix
   */
  generateRiskMatrix(
    hazards: Array<{
      hazard_id: string;
      description: string;
      severity: 1 | 2 | 3 | 4 | 5;
      probability: 1 | 2 | 3 | 4 | 5;
      detectability: 1 | 2 | 3 | 4 | 5;
    }>
  ): {
    risk_assessments: Array<{
      hazard_id: string;
      risk_priority_number: number;
      risk_level: "low" | "medium" | "high" | "critical";
      risk_acceptability: "acceptable" | "as_low_as_reasonably_practicable" | "unacceptable";
      recommended_actions: string[];
    }>;
    overall_risk_profile: string;
    critical_risks: string[];
  } {
    const riskAssessments = hazards.map(hazard => {
      const rpn = hazard.severity * hazard.probability * hazard.detectability;

      let riskLevel: "low" | "medium" | "high" | "critical";
      let riskAcceptability: "acceptable" | "as_low_as_reasonably_practicable" | "unacceptable";

      if (rpn <= 20) {
        riskLevel = "low";
        riskAcceptability = "acceptable";
      } else if (rpn <= 50) {
        riskLevel = "medium";
        riskAcceptability = "as_low_as_reasonably_practicable";
      } else if (rpn <= 100) {
        riskLevel = "high";
        riskAcceptability = "as_low_as_reasonably_practicable";
      } else {
        riskLevel = "critical";
        riskAcceptability = "unacceptable";
      }

      const recommendedActions = [];
      if (hazard.severity >= 4) recommendedActions.push("Reduce severity through design changes");
      if (hazard.probability >= 4) recommendedActions.push("Reduce probability through process controls");
      if (hazard.detectability >= 4) recommendedActions.push("Improve detection through testing/monitoring");
      if (rpn > 50) recommendedActions.push("Implement risk control measures");

      return {
        hazard_id: hazard.hazard_id,
        risk_priority_number: rpn,
        risk_level: riskLevel,
        risk_acceptability: riskAcceptability,
        recommended_actions: recommendedActions
      };
    });

    const criticalRisks = riskAssessments
      .filter(assessment => assessment.risk_level === "critical")
      .map(assessment => assessment.hazard_id);

    const highRiskCount = riskAssessments.filter(a => a.risk_level === "high" || a.risk_level === "critical").length;
    const overallRiskProfile = highRiskCount === 0
      ? "Low overall risk profile"
      : highRiskCount <= 2
      ? "Moderate overall risk profile"
      : "High overall risk profile requiring immediate attention";

    return {
      risk_assessments: riskAssessments,
      overall_risk_profile: overallRiskProfile,
      critical_risks: criticalRisks
    };
  }

  /**
   * Design verification and validation plan
   */
  designVVPlan(
    deviceInfo: {
      device_name: string;
      design_inputs: string[];
      user_needs: string[];
      regulatory_requirements: string[];
      performance_requirements: string[];
      safety_requirements: string[];
    }
  ): {
    verification_plan: Array<{
      requirement: string;
      test_method: string;
      acceptance_criteria: string;
      responsibility: string;
    }>;
    validation_plan: Array<{
      user_need: string;
      validation_method: string;
      success_criteria: string;
      study_design: string;
    }>;
    testing_timeline: string;
    resource_requirements: string[];
  } {
    const verificationPlan = deviceInfo.design_inputs.map(input => ({
      requirement: input,
      test_method: "Laboratory testing per applicable standards",
      acceptance_criteria: "Meets specified performance parameters",
      responsibility: "Design Engineering"
    }));

    const validationPlan = deviceInfo.user_needs.map(need => ({
      user_need: need,
      validation_method: "Clinical evaluation or usability study",
      success_criteria: "Demonstrates intended use effectiveness",
      study_design: "Controlled study with representative users"
    }));

    return {
      verification_plan: verificationPlan,
      validation_plan: validationPlan,
      testing_timeline: "6-12 months depending on complexity",
      resource_requirements: [
        "Test equipment and facilities",
        "Clinical investigation sites",
        "Qualified testing personnel",
        "Statistical analysis support",
        "Regulatory consulting"
      ]
    };
  }

  /**
   * Generate quality metrics dashboard
   */
  generateQualityMetrics(
    organizationData: {
      product_types: string[];
      manufacturing_volume: number;
      quality_events_last_year: number;
      customer_complaints: number;
      supplier_performance_issues: number;
      audit_findings: number;
    }
  ): {
    key_metrics: Array<{
      metric_name: string;
      current_value: number;
      target_value: number;
      trend: "improving" | "stable" | "declining";
      action_required: boolean;
    }>;
    quality_scorecard: {
      overall_score: number;
      grade: "A" | "B" | "C" | "D" | "F";
    };
    improvement_priorities: string[];
  } {
    const metrics = [
      {
        metric_name: "Defect Rate (PPM)",
        current_value: (organizationData.quality_events_last_year / organizationData.manufacturing_volume) * 1000000,
        target_value: 100,
        trend: "stable" as const,
        action_required: false
      },
      {
        metric_name: "Customer Complaints per 1000 units",
        current_value: (organizationData.customer_complaints / organizationData.manufacturing_volume) * 1000,
        target_value: 1,
        trend: "improving" as const,
        action_required: false
      },
      {
        metric_name: "Supplier Quality Score (%)",
        current_value: Math.max(0, 100 - (organizationData.supplier_performance_issues * 10)),
        target_value: 95,
        trend: "stable" as const,
        action_required: false
      },
      {
        metric_name: "Audit Findings per Review",
        current_value: organizationData.audit_findings,
        target_value: 2,
        trend: "declining" as const,
        action_required: organizationData.audit_findings > 5
      }
    ];

    // Update action_required and trends based on targets
    metrics.forEach(metric => {
      if (metric.current_value > metric.target_value * 1.2) {
        metric.action_required = true;
        metric.trend = "declining";
      }
    });

    const totalScore = metrics.reduce((sum, metric) => {
      const achievement = Math.min(100, (metric.target_value / Math.max(metric.current_value, 0.1)) * 100);
      return sum + achievement;
    }, 0);

    const averageScore = totalScore / metrics.length;
    let grade: "A" | "B" | "C" | "D" | "F";
    if (averageScore >= 90) grade = "A";
    else if (averageScore >= 80) grade = "B";
    else if (averageScore >= 70) grade = "C";
    else if (averageScore >= 60) grade = "D";
    else grade = "F";

    const improvementPriorities = [];
    if (metrics[0].action_required) improvementPriorities.push("Reduce manufacturing defects");
    if (metrics[1].action_required) improvementPriorities.push("Improve customer satisfaction");
    if (metrics[2].action_required) improvementPriorities.push("Enhance supplier quality");
    if (metrics[3].action_required) improvementPriorities.push("Address audit findings");

    return {
      key_metrics: metrics,
      quality_scorecard: {
        overall_score: Math.round(averageScore),
        grade
      },
      improvement_priorities: improvementPriorities
    };
  }

  /**
   * Create document control framework
   */
  createDocumentControl(): {
    document_hierarchy: Array<{
      level: number;
      document_type: string;
      examples: string[];
      approval_authority: string;
      review_frequency: string;
    }>;
    control_procedures: string[];
    version_control_strategy: string;
    training_requirements: string[];
  } {
    const documentHierarchy = [
      {
        level: 1,
        document_type: "Quality Manual",
        examples: ["QMS Overview", "Quality Policy"],
        approval_authority: "CEO/President",
        review_frequency: "Annual"
      },
      {
        level: 2,
        document_type: "Procedures",
        examples: ["Design Controls", "CAPA", "Management Review"],
        approval_authority: "Quality Manager",
        review_frequency: "Biennial"
      },
      {
        level: 3,
        document_type: "Work Instructions",
        examples: ["Test Procedures", "Inspection Instructions"],
        approval_authority: "Department Manager",
        review_frequency: "As needed"
      },
      {
        level: 4,
        document_type: "Forms and Records",
        examples: ["Test Records", "Training Records"],
        approval_authority: "Process Owner",
        review_frequency: "As needed"
      }
    ];

    return {
      document_hierarchy: documentHierarchy,
      control_procedures: [
        "Document creation and approval",
        "Distribution and access control",
        "Change control and revision",
        "Review and update cycles",
        "Obsolete document control",
        "External document management"
      ],
      version_control_strategy: "Numerical versioning with change tracking and approval workflow",
      training_requirements: [
        "Document control procedure training",
        "Role-specific document responsibilities",
        "Change control process training",
        "Annual refresher training"
      ]
    };
  }
}