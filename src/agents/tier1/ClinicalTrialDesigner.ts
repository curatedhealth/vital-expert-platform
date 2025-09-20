/**
 * Clinical Trial Designer Agent
 * Priority: 105 | Tier 1 | Critical for evidence generation
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

export class ClinicalTrialDesigner extends DigitalHealthAgent {
  constructor() {
    const config: DigitalHealthAgentConfig = {
      name: "clinical-trial-designer",
      display_name: "Clinical Trial Designer",
      model: ModelType.GPT_4,
      temperature: 0.3,
      max_tokens: 5000,
      context_window: 32000,
      system_prompt: `You are an expert Clinical Trial Designer with deep expertise in medical device clinical investigations. Your role is to design trials that generate compelling evidence while meeting regulatory requirements.

## CORE IDENTITY
You have 12+ years designing pivotal trials with expertise in FDA IDE regulations, ISO 14155, and ICH GCP. You've designed 50+ successful trials with 95% regulatory acceptance rate.

## OPERATING PRINCIPLES
1. **Patient Safety First**: Every decision prioritizes participant safety
2. **Scientific Rigor**: Ensure statistical validity and clinical relevance
3. **Regulatory Alignment**: Meet all applicable GCP and regulatory standards
4. **Operational Feasibility**: Balance ideal design with practical constraints
5. **Evidence Quality**: Generate data that changes clinical practice

## EXPERTISE AREAS
- Clinical study design and protocol development
- Statistical planning and sample size calculations
- Endpoint selection and validation
- Site selection and management
- Patient recruitment and retention strategies
- Risk assessment and mitigation
- Data management and quality assurance
- Regulatory compliance (FDA IDE, ISO 14155, ICH GCP)`,

      capabilities_list: [
        "Clinical Protocol Development",
        "Statistical Planning",
        "Endpoint Selection",
        "Site Selection Strategy",
        "Patient Recruitment Planning",
        "Risk Mitigation Planning",
        "Data Management Planning",
        "Safety Monitoring Design"
      ],
      prompt_starters: [
        "Design Pivotal Trial Protocol",
        "Calculate Sample Size",
        "Develop Recruitment Strategy",
        "Create Safety Monitoring Plan"
      ],
      metadata: {
        tier: AgentTier.TIER_1,
        priority: 105,
        domain: AgentDomain.CLINICAL,
        compliance_level: ComplianceLevel.CRITICAL,
        implementation_phase: 1,
        last_updated: "2025-01-19"
      }
    };

    super(config);
  }

  /**
   * Design a pivotal clinical trial protocol
   */
  async designPivotalTrial(
    trialData: {
      device_name: string;
      indication: string;
      intended_use: string;
      comparator: string;
      primary_endpoint: string;
      study_duration: string;
      target_population: string;
      exclusion_criteria?: string;
      regulatory_path: "510k" | "PMA" | "De Novo";
    },
    context?: ExecutionContext
  ): Promise<AgentResponse> {
    return await this.executePrompt(
      "Design Pivotal Trial Protocol",
      trialData,
      context
    );
  }

  /**
   * Calculate sample size for clinical trial
   */
  async calculateSampleSize(
    statisticalData: {
      study_type: "superiority" | "non-inferiority" | "equivalence";
      primary_endpoint_type: "continuous" | "binary" | "time-to-event";
      expected_effect_size: number;
      control_rate?: number;
      alpha: number;
      power: number;
      dropout_rate: number;
      one_sided?: boolean;
    },
    context?: ExecutionContext
  ): Promise<AgentResponse> {
    return await this.executePrompt(
      "Calculate Sample Size",
      statisticalData,
      context
    );
  }

  /**
   * Develop patient recruitment strategy
   */
  async developRecruitmentStrategy(
    recruitmentData: {
      target_population: string;
      inclusion_criteria: string;
      exclusion_criteria: string;
      target_enrollment: number;
      enrollment_duration: string;
      geographic_scope: string;
      competing_studies?: string;
    },
    context?: ExecutionContext
  ): Promise<AgentResponse> {
    return await this.executePrompt(
      "Develop Recruitment Strategy",
      recruitmentData,
      context
    );
  }

  /**
   * Create safety monitoring plan
   */
  async createSafetyMonitoringPlan(
    safetyData: {
      device_risk_profile: "low" | "medium" | "high";
      known_risks: string[];
      monitoring_frequency: string;
      dsmb_required: boolean;
      stopping_rules: string;
      adverse_event_reporting: string;
    },
    context?: ExecutionContext
  ): Promise<AgentResponse> {
    return await this.executePrompt(
      "Create Safety Monitoring Plan",
      safetyData,
      context
    );
  }

  /**
   * Get study design recommendations based on device characteristics
   */
  async getStudyDesignRecommendation(
    deviceInfo: {
      device_type: string;
      intended_use: string;
      risk_class: "I" | "II" | "III";
      novel_technology: boolean;
      comparator_available: boolean;
    }
  ): Promise<{
    study_design: string;
    primary_endpoint: string;
    study_duration: string;
    sample_size_estimate: string;
    key_considerations: string[];
  }> {
    let studyDesign = "Prospective, controlled study";
    let primaryEndpoint = "Safety and effectiveness";
    let studyDuration = "12 months";
    let sampleSizeEstimate = "100-300 subjects";

    // Customize based on device characteristics
    if (deviceInfo.risk_class === "III" || deviceInfo.novel_technology) {
      studyDesign = "Prospective, randomized controlled trial";
      studyDuration = "18-24 months";
      sampleSizeEstimate = "300-500 subjects";
    }

    if (!deviceInfo.comparator_available) {
      studyDesign = "Single-arm study with performance goals";
      primaryEndpoint = "Performance against objective performance criteria";
    }

    const keyConsiderations = [
      "FDA guidance alignment",
      "Statistical power optimization",
      "Patient safety monitoring",
      "Operational feasibility",
      "Regulatory precedent review"
    ];

    return {
      study_design: studyDesign,
      primary_endpoint: primaryEndpoint,
      study_duration: studyDuration,
      sample_size_estimate: sampleSizeEstimate,
      key_considerations: keyConsiderations
    };
  }

  /**
   * Calculate statistical power for given parameters
   */
  calculatePower(
    params: {
      effect_size: number;
      sample_size: number;
      alpha: number;
      test_type: "two-sample" | "one-sample" | "paired";
    }
  ): {
    power: number;
    recommendation: string;
    confidence: "low" | "medium" | "high";
  } {
    // Simplified power calculation (in production, use proper statistical libraries)
    const { effect_size, sample_size, alpha } = params;

    // Mock calculation - replace with proper statistical analysis
    const z_alpha = alpha === 0.05 ? 1.96 : 2.58;
    const estimated_power = Math.min(0.99, 0.5 + (effect_size * Math.sqrt(sample_size)) / 4);

    let recommendation = "Sample size appears adequate";
    let confidence: "low" | "medium" | "high" = "medium";

    if (estimated_power < 0.8) {
      recommendation = "Consider increasing sample size for adequate power";
      confidence = "low";
    } else if (estimated_power > 0.9) {
      recommendation = "Excellent power for detecting meaningful differences";
      confidence = "high";
    }

    return {
      power: Math.round(estimated_power * 100) / 100,
      recommendation,
      confidence
    };
  }

  /**
   * Assess feasibility of recruitment timeline
   */
  assessRecruitmentFeasibility(
    params: {
      target_enrollment: number;
      number_of_sites: number;
      enrollment_period_months: number;
      population_prevalence: number;
      eligibility_rate: number;
    }
  ): {
    feasible: boolean;
    patients_per_site_per_month: number;
    recommendations: string[];
    risk_factors: string[];
  } {
    const { target_enrollment, number_of_sites, enrollment_period_months } = params;

    const patientsPerSitePerMonth = target_enrollment / (number_of_sites * enrollment_period_months);
    const feasible = patientsPerSitePerMonth <= 2; // Rule of thumb: ≤2 patients/site/month is feasible

    const recommendations = [];
    const riskFactors = [];

    if (!feasible) {
      recommendations.push("Increase number of sites");
      recommendations.push("Extend enrollment period");
      recommendations.push("Broaden inclusion criteria");
      riskFactors.push("Aggressive enrollment timeline");
    }

    if (patientsPerSitePerMonth > 5) {
      riskFactors.push("Unrealistic site expectations");
    }

    if (params.eligibility_rate < 0.1) {
      riskFactors.push("Very restrictive eligibility criteria");
      recommendations.push("Review inclusion/exclusion criteria");
    }

    return {
      feasible,
      patients_per_site_per_month: Math.round(patientsPerSitePerMonth * 10) / 10,
      recommendations,
      risk_factors: riskFactors
    };
  }

  /**
   * Generate protocol synopsis
   */
  async generateProtocolSynopsis(
    studyParams: {
      title: string;
      objective: string;
      design: string;
      population: string;
      sample_size: number;
      primary_endpoint: string;
      duration: string;
    }
  ): Promise<{
    synopsis: string;
    key_elements: string[];
    regulatory_considerations: string[];
  }> {
    const synopsis = `
**Study Title:** ${studyParams.title}

**Objective:** ${studyParams.objective}

**Study Design:** ${studyParams.design}

**Study Population:** ${studyParams.population}

**Sample Size:** ${studyParams.sample_size} subjects

**Primary Endpoint:** ${studyParams.primary_endpoint}

**Study Duration:** ${studyParams.duration}

**Study Type:** Prospective clinical investigation to evaluate safety and effectiveness
`;

    const keyElements = [
      "Primary and secondary endpoints",
      "Inclusion/exclusion criteria",
      "Statistical analysis plan",
      "Safety monitoring procedures",
      "Data management plan"
    ];

    const regulatoryConsiderations = [
      "FDA IDE application required",
      "IRB approval at each site",
      "Informed consent process",
      "GCP compliance monitoring",
      "Adverse event reporting"
    ];

    return {
      synopsis: synopsis.trim(),
      key_elements: keyElements,
      regulatory_considerations: regulatoryConsiderations
    };
  }
}