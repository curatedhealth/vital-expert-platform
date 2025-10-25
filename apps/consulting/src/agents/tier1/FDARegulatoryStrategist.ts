/**
 * FDA Regulatory Strategist Agent
 * Priority: 100 | Tier 1 | Critical for regulatory compliance
 */

import {
  DigitalHealthAgentConfig,
  AgentTier,
  AgentDomain,
  ComplianceLevel,
  ModelType,
  AgentResponse,
  ExecutionContext
} from '@/types/digital-health-agent.types';

import { DigitalHealthAgent } from '../core/DigitalHealthAgent';

export class FDARegulatoryStrategist extends DigitalHealthAgent {
  constructor() {
    const config: DigitalHealthAgentConfig = {
      name: "fda-regulatory-strategist",
      display_name: "FDA Regulatory Strategist",
      model: ModelType.GPT_4O,
      temperature: 0.2,
      max_tokens: 6000,
      context_window: 128000,
      system_prompt: `You are an expert FDA Regulatory Strategist with 15+ years experience in medical device submissions. Your primary responsibility is to ensure 100% regulatory compliance while optimizing approval timelines.

## EXPERTISE AREAS:
- FDA regulatory pathways (510(k), PMA, De Novo, 513(g))
- Software as Medical Device (SaMD) classification per IMDRF framework
- Predicate device analysis and substantial equivalence arguments
- Pre-Submission strategy and Q-Sub meeting preparation
- FDA guidance interpretation and regulatory intelligence

## CAPABILITY LOADING
You have access to a Capabilities Library. When a user requests a specific capability, retrieve the detailed methodology from the library.

## PROMPT EXECUTION
When users select a prompt starter, retrieve the full workflow from the Prompt Library.

## OPERATING PRINCIPLES
1. **Regulatory Excellence**: Every recommendation must meet FDA standards
2. **Risk Mitigation**: Identify and address regulatory risks proactively
3. **Timeline Optimization**: Balance speed with compliance requirements
4. **Evidence-Based**: All recommendations backed by FDA guidance
5. **Strategic Thinking**: Consider broader market and competitive landscape`,

      capabilities_list: [
        "Regulatory Strategy Development",
        "510(k) Submission Preparation",
        "Pre-Submission Strategy",
        "AI/ML Regulatory Guidance",
        "Clinical Evidence Planning",
        "FDA Response Management",
        "Post-Market Requirements",
        "International Harmonization"
      ],
      prompt_starters: [
        "Create FDA Regulatory Strategy",
        "Prepare 510(k) Submission",
        "Plan Pre-Submission Meeting",
        "Respond to FDA AI Request"
      ],
      metadata: {
        tier: AgentTier.TIER_1,
        priority: 100,
        domain: AgentDomain.REGULATORY,
        compliance_level: ComplianceLevel.CRITICAL,
        implementation_phase: 1,
        last_updated: "2025-01-19"
      }
    };

    super(config);
  }

  /**
   * Specialized method for creating FDA regulatory strategy
   */
  async createRegulatoryStrategy(
    deviceInfo: {
      device_name: string;
      intended_use: string;
      device_description: string;
      technology_type: string;
      target_population: string;
      clinical_setting: string;
      development_stage: string;
      target_submission?: string;
      target_clearance?: string;
    },
    context?: ExecutionContext
  ): Promise<AgentResponse> {
    return await this.executePrompt(
      "Create FDA Regulatory Strategy",
      deviceInfo,
      context
    );
  }

  /**
   * Specialized method for 510(k) submission preparation
   */
  async prepare510k(
    deviceData: {
      device_name: string;
      intended_use: string;
      device_description: string;
      technology_type: string;
      target_population: string;
      development_stage: string;
      target_submission?: string;
    },
    context?: ExecutionContext
  ): Promise<AgentResponse> {
    return await this.executePrompt(
      "Prepare 510(k) Submission",
      deviceData,
      context
    );
  }

  /**
   * Specialized method for Pre-Submission meeting planning
   */
  async planPreSubmissionMeeting(
    meetingData: {
      device_name: string;
      intended_use: string;
      regulatory_questions: string[];
      meeting_type: "Q-Sub" | "Pre-IDE" | "Pre-Submission";
      timeline: string;
    },
    context?: ExecutionContext
  ): Promise<AgentResponse> {
    return await this.executePrompt(
      "Plan Pre-Submission Meeting",
      meetingData,
      context
    );
  }

  /**
   * Specialized method for FDA Additional Information responses
   */
  async respondToFDARequest(
    requestData: {
      submission_type: "510(k)" | "De Novo" | "PMA";
      fda_questions: string;
      deadline: string;
      main_concerns: string;
      original_submission?: string;
      available_data?: string;
    },
    context?: ExecutionContext
  ): Promise<AgentResponse> {
    return await this.executePrompt(
      "Respond to FDA AI Request",
      requestData,
      context
    );
  }

  /**
   * Get regulatory pathway recommendation
   */
  async getPathwayRecommendation(
    deviceInfo: {
      device_type: string;
      intended_use: string;
      risk_level: "low" | "medium" | "high";
      novelty: "incremental" | "substantial" | "breakthrough";
    }
  ): Promise<{
    pathway: "510k" | "De Novo" | "PMA" | "513g";
    confidence: number;
    rationale: string;
    timeline_estimate: string;
    key_requirements: string[];
  }> {
    const result = await this.executePrompt(
      "Create FDA Regulatory Strategy",
      deviceInfo
    );

    // Extract structured data from response
    if (result.success && result.data) {
      return {
        pathway: result.data.pathway || "510k",
        confidence: result.data.success_probability || 0.8,
        rationale: result.content?.substring(0, 200) + "..." || "Regulatory analysis complete",
        timeline_estimate: result.data.timeline_months ? `${result.data.timeline_months} months` : "6-12 months",
        key_requirements: [
          "Predicate device identification",
          "Substantial equivalence demonstration",
          "Performance testing",
          "Risk analysis"
        ]
      };
    }

    throw new Error("Failed to generate pathway recommendation");
  }

  /**
   * Calculate regulatory timeline
   */
  async calculateTimeline(
    pathway: "510k" | "De Novo" | "PMA",
    complexity: "simple" | "moderate" | "complex"
  ): Promise<{
    total_months: number;
    phases: Array<{
      phase: string;
      duration_months: number;
      dependencies: string[];
    }>;
    critical_path: string[];
    risk_factors: string[];
  }> {
    const baseTimelines = {
      "510k": { simple: 6, moderate: 9, complex: 12 },
      "De Novo": { simple: 12, moderate: 15, complex: 18 },
      "PMA": { simple: 18, moderate: 24, complex: 30 }
    };

    // Validate pathway and complexity to prevent object injection
    const validPathways = ['510k', 'De Novo', 'PMA'] as const;
    const validComplexities = ['simple', 'moderate', 'complex'] as const;
    
    if (!validPathways.includes(pathway as unknown) || !validComplexities.includes(complexity as unknown)) {
      throw new Error('Invalid pathway or complexity level');
    }
    
    const totalMonths = baseTimelines[pathway as keyof typeof baseTimelines][complexity as keyof typeof baseTimelines[keyof typeof baseTimelines]];

    return {
      total_months: totalMonths,
      phases: [
        {
          phase: "Pre-submission preparation",
          duration_months: Math.ceil(totalMonths * 0.3),
          dependencies: ["Product development", "Testing completion"]
        },
        {
          phase: "Submission preparation",
          duration_months: Math.ceil(totalMonths * 0.2),
          dependencies: ["Documentation", "Quality review"]
        },
        {
          phase: "FDA review",
          duration_months: Math.ceil(totalMonths * 0.3),
          dependencies: ["FDA workload", "Response quality"]
        },
        {
          phase: "Response and clearance",
          duration_months: Math.ceil(totalMonths * 0.2),
          dependencies: ["AI requests", "Final review"]
        }
      ],
      critical_path: [
        "Predicate device analysis",
        "Clinical evidence generation",
        "Submission quality",
        "FDA interaction management"
      ],
      risk_factors: [
        "Novel technology concerns",
        "Inadequate predicate",
        "Clinical data gaps",
        "Quality system deficiencies"
      ]
    };
  }

  /**
   * Validate submission readiness
   */
  validateSubmissionReadiness(
    submissionData: {
      device_description: boolean;
      intended_use: boolean;
      substantial_equivalence: boolean;
      performance_data: boolean;
      risk_analysis: boolean;
      labeling: boolean;
      quality_system: boolean;
    }
  ): {
    ready: boolean;
    score: number;
    missing_elements: string[];
    recommendations: string[];
  } {
    const elements = Object.entries(submissionData);
    const completedElements = elements.filter(([_, completed]) => completed);
    const score = (completedElements.length / elements.length) * 100;

    const missingElements = elements
      .filter(([_, completed]) => !completed)
      .map(([element, _]) => element.replace(/_/g, ' '));

    return {
      ready: score >= 95,
      score: Math.round(score),
      missing_elements: missingElements,
      recommendations: [
        "Complete all required sections before submission",
        "Conduct internal quality review",
        "Validate all cross-references",
        "Prepare for potential FDA questions"
      ]
    };
  }
}