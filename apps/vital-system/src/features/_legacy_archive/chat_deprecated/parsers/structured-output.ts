import { ChatOpenAI } from '@langchain/openai';
import { StructuredOutputParser, OutputFixingParser } from 'langchain/output_parsers';
import { z } from 'zod';

const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: 'gpt-4-turbo-preview',
  temperature: 0,
});

/**
 * Regulatory Analysis Parser
 * Validates and structures regulatory pathway analysis output
 */
export const RegulatoryAnalysisSchema = z.object({
  recommendedPathway: z.enum(['510k', 'pma', 'de_novo', 'exempt']).describe('Recommended FDA pathway'),
  deviceClass: z.enum(['I', 'II', 'III']).describe('Device classification'),
  timeline: z.object({
    preparation: z.number().describe('Preparation time in months'),
    submission: z.number().describe('Submission time in months'),
    review: z.number().describe('FDA review time in months'),
    total: z.number().describe('Total timeline in months'),
  }),
  requirements: z.array(z.string()).describe('List of regulatory requirements'),
  predicateDevices: z.array(z.object({
    name: z.string(),
    k_number: z.string().optional(),
    manufacturer: z.string(),
    similarity_score: z.number().min(0).max(100),
  })).optional().describe('Similar predicate devices for 510(k)'),
  estimatedCost: z.object({
    preparation: z.number().describe('Preparation costs in USD'),
    testing: z.number().describe('Testing and validation costs'),
    submission_fees: z.number().describe('FDA submission fees'),
    total: z.number().describe('Total estimated cost'),
  }),
  risks: z.array(z.object({
    category: z.enum(['technical', 'regulatory', 'clinical', 'commercial']),
    description: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    mitigation: z.string(),
  })),
  recommendations: z.array(z.string()).describe('Strategic recommendations'),
  confidence: z.number().min(0).max(100).describe('Confidence score of analysis'),
});

export const regulatoryAnalysisParser = StructuredOutputParser.fromZodSchema(RegulatoryAnalysisSchema);

/**
 * Clinical Study Design Parser
 * Validates and structures clinical trial design output
 */
export const ClinicalStudySchema = z.object({
  studyType: z.enum(['rct', 'observational', 'single_arm', 'feasibility', 'pilot']).describe('Study design type'),
  phase: z.enum(['pilot', 'feasibility', 'pivotal', 'post_market']).optional(),
  primaryEndpoint: z.object({
    name: z.string(),
    description: z.string(),
    measurement_timepoint: z.string(),
    success_criteria: z.string(),
  }),
  secondaryEndpoints: z.array(z.object({
    name: z.string(),
    description: z.string(),
    measurement_timepoint: z.string(),
  })),
  sampleSize: z.object({
    total: z.number(),
    per_arm: z.number().optional(),
    justification: z.string(),
    power: z.number().min(0).max(100).describe('Statistical power %'),
    alpha: z.number().describe('Significance level'),
  }),
  inclusionCriteria: z.array(z.string()),
  exclusionCriteria: z.array(z.string()),
  duration: z.object({
    enrollment_period: z.number().describe('Enrollment period in months'),
    follow_up_period: z.number().describe('Follow-up period in months'),
    total: z.number().describe('Total study duration in months'),
  }),
  statisticalAnalysis: z.object({
    primary_analysis: z.string(),
    secondary_analyses: z.array(z.string()),
    interim_analyses: z.boolean(),
  }),
  estimatedCost: z.object({
    per_patient: z.number(),
    total: z.number(),
    breakdown: z.record(z.number()).optional(),
  }),
  feasibility: z.object({
    recruitment_rate: z.string(),
    site_requirements: z.number(),
    key_challenges: z.array(z.string()),
  }),
  recommendations: z.array(z.string()),
});

export const clinicalStudyParser = StructuredOutputParser.fromZodSchema(ClinicalStudySchema);

/**
 * Market Access Strategy Parser
 * Validates and structures market access and reimbursement analysis
 */
export const MarketAccessSchema = z.object({
  targetMarkets: z.array(z.object({
    country: z.string(),
    market_size: z.number().describe('Market size in USD'),
    growth_rate: z.number().describe('Annual growth rate %'),
    competitive_landscape: z.string(),
  })),
  pricingStrategy: z.object({
    recommended_price: z.number().describe('Recommended price in USD'),
    pricing_model: z.enum(['value_based', 'cost_plus', 'competitive', 'bundled']),
    justification: z.string(),
    price_range: z.object({
      min: z.number(),
      max: z.number(),
    }),
  }),
  reimbursement: z.object({
    pathways: z.array(z.object({
      payer_type: z.enum(['medicare', 'medicaid', 'private', 'international']),
      coverage_likelihood: z.enum(['high', 'medium', 'low']),
      reimbursement_rate: z.number().optional(),
      requirements: z.array(z.string()),
    })),
    coding_recommendations: z.array(z.object({
      code_type: z.enum(['cpt', 'hcpcs', 'icd10', 'drg']),
      code: z.string(),
      description: z.string(),
    })),
  }),
  valueProposition: z.object({
    clinical_benefits: z.array(z.string()),
    economic_benefits: z.array(z.string()),
    patient_benefits: z.array(z.string()),
    differentiation: z.string(),
  }),
  evidenceRequirements: z.array(z.object({
    evidence_type: z.enum(['clinical', 'economic', 'real_world', 'comparative']),
    description: z.string(),
    priority: z.enum(['critical', 'high', 'medium', 'low']),
    timeline: z.string(),
  })),
  barriers: z.array(z.object({
    category: z.enum(['regulatory', 'reimbursement', 'competitive', 'adoption']),
    description: z.string(),
    mitigation: z.string(),
  })),
  goToMarketStrategy: z.object({
    timeline: z.string(),
    key_milestones: z.array(z.string()),
    initial_targets: z.array(z.string()),
  }),
});

export const marketAccessParser = StructuredOutputParser.fromZodSchema(MarketAccessSchema);

/**
 * Literature Review Summary Parser
 * Validates and structures research literature review output
 */
export const LiteratureReviewSchema = z.object({
  searchQuery: z.string(),
  totalArticles: z.number(),
  articlesReviewed: z.number(),
  keyFindings: z.array(z.object({
    finding: z.string(),
    supporting_studies: z.array(z.string()),
    evidence_level: z.enum(['high', 'moderate', 'low']),
  })),
  clinicalEvidence: z.object({
    efficacy: z.object({
      summary: z.string(),
      key_metrics: z.array(z.object({
        metric: z.string(),
        value: z.string(),
        studies: z.number(),
      })),
    }),
    safety: z.object({
      summary: z.string(),
      adverse_events: z.array(z.object({
        event: z.string(),
        frequency: z.string(),
        severity: z.string(),
      })),
    }),
  }),
  gaps: z.array(z.object({
    area: z.string(),
    description: z.string(),
    recommendation: z.string(),
  })),
  topCitations: z.array(z.object({
    title: z.string(),
    authors: z.string(),
    journal: z.string(),
    year: z.number(),
    doi: z.string().optional(),
    relevance_score: z.number().min(0).max(100),
  })),
  recommendations: z.array(z.string()),
});

export const literatureReviewParser = StructuredOutputParser.fromZodSchema(LiteratureReviewSchema);

/**
 * Risk Assessment Parser
 * Validates and structures risk analysis output
 */
export const RiskAssessmentSchema = z.object({
  overallRiskLevel: z.enum(['low', 'moderate', 'high', 'critical']),
  riskCategories: z.array(z.object({
    category: z.enum(['clinical', 'regulatory', 'technical', 'commercial', 'operational', 'financial']),
    risks: z.array(z.object({
      id: z.string(),
      description: z.string(),
      probability: z.enum(['rare', 'unlikely', 'possible', 'likely', 'almost_certain']),
      impact: z.enum(['negligible', 'minor', 'moderate', 'major', 'catastrophic']),
      risk_score: z.number().min(1).max(25).describe('Probability x Impact score'),
      current_controls: z.array(z.string()),
      residual_risk: z.enum(['low', 'moderate', 'high', 'critical']),
      mitigation_actions: z.array(z.object({
        action: z.string(),
        owner: z.string().optional(),
        timeline: z.string(),
        expected_impact: z.string(),
      })),
    })),
  })),
  riskMatrix: z.object({
    critical_risks: z.number(),
    high_risks: z.number(),
    moderate_risks: z.number(),
    low_risks: z.number(),
  }),
  recommendations: z.array(z.string()),
  nextReviewDate: z.string(),
});

export const riskAssessmentParser = StructuredOutputParser.fromZodSchema(RiskAssessmentSchema);

/**
 * Competitive Analysis Parser
 * Validates and structures competitive landscape analysis
 */
export const CompetitiveAnalysisSchema = z.object({
  marketOverview: z.object({
    market_size: z.number().describe('Total addressable market in USD'),
    growth_rate: z.number().describe('CAGR %'),
    key_trends: z.array(z.string()),
  }),
  competitors: z.array(z.object({
    name: z.string(),
    product: z.string(),
    market_share: z.number().optional().describe('Market share %'),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    pricing: z.string(),
    regulatory_status: z.string(),
    clinical_evidence: z.string(),
  })),
  competitiveAdvantages: z.array(z.object({
    advantage: z.string(),
    description: z.string(),
    sustainability: z.enum(['low', 'medium', 'high']),
  })),
  threats: z.array(z.object({
    threat: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    timeframe: z.string(),
    mitigation: z.string(),
  })),
  marketPositioning: z.object({
    recommended_position: z.string(),
    target_segments: z.array(z.string()),
    differentiation_strategy: z.string(),
  }),
  swotAnalysis: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    opportunities: z.array(z.string()),
    threats: z.array(z.string()),
  }),
});

export const competitiveAnalysisParser = StructuredOutputParser.fromZodSchema(CompetitiveAnalysisSchema);

/**
 * Output Fixing Parser Wrapper
 * Automatically fixes malformed JSON outputs using LLM
 */
export async function createFixingParser<T extends z.ZodTypeAny>(
  baseParser: StructuredOutputParser<T>
): Promise<OutputFixingParser<T>> {
  return OutputFixingParser.fromLLM(llm, baseParser);
}

/**
 * Parse with Auto-Fixing
 * Attempts to parse output, automatically fixes if malformed
 */
export async function parseWithAutoFix<T>(
  output: string,
  parser: StructuredOutputParser<z.ZodType<T>>
): Promise<T> {
  try {
    // Try direct parse first
    return await parser.parse(output);
  } catch (error) {
    console.log('⚠️ Initial parse failed, attempting auto-fix...');

    // Use output fixing parser
    const fixingParser = await createFixingParser(parser);
    return await fixingParser.parse(output);
  }
}

/**
 * Get Format Instructions for Prompts
 * Returns markdown format instructions for each parser
 */
export function getFormatInstructions(
  parserType: 'regulatory' | 'clinical' | 'market_access' | 'literature' | 'risk' | 'competitive'
): string {
  const parsers = {
    regulatory: regulatoryAnalysisParser,
    clinical: clinicalStudyParser,
    market_access: marketAccessParser,
    literature: literatureReviewParser,
    risk: riskAssessmentParser,
    competitive: competitiveAnalysisParser,
  };

  return parsers[parserType].getFormatInstructions();
}

/**
 * Example Usage Template
 */
export async function parseRegulatoryAnalysis(llmOutput: string) {
  return await parseWithAutoFix(llmOutput, regulatoryAnalysisParser);
}

export async function parseClinicalStudy(llmOutput: string) {
  return await parseWithAutoFix(llmOutput, clinicalStudyParser);
}

export async function parseMarketAccess(llmOutput: string) {
  return await parseWithAutoFix(llmOutput, marketAccessParser);
}

export async function parseLiteratureReview(llmOutput: string) {
  return await parseWithAutoFix(llmOutput, literatureReviewParser);
}

export async function parseRiskAssessment(llmOutput: string) {
  return await parseWithAutoFix(llmOutput, riskAssessmentParser);
}

export async function parseCompetitiveAnalysis(llmOutput: string) {
  return await parseWithAutoFix(llmOutput, competitiveAnalysisParser);
}

// Export parsers with expected names
export const RegulatoryAnalysisParser = regulatoryAnalysisParser;
export const ClinicalTrialDesignParser = clinicalStudyParser;
export const MarketAccessStrategyParser = marketAccessParser;
export const LiteratureReviewParser = literatureReviewParser;
export const RiskAssessmentParser = riskAssessmentParser;
export const CompetitiveAnalysisParser = competitiveAnalysisParser;

// Export all schemas for type inference
export type RegulatoryAnalysis = z.infer<typeof RegulatoryAnalysisSchema>;
export type ClinicalTrialDesign = z.infer<typeof ClinicalStudySchema>;
export type MarketAccessStrategy = z.infer<typeof MarketAccessSchema>;
export type LiteratureReview = z.infer<typeof LiteratureReviewSchema>;
export type RiskAssessment = z.infer<typeof RiskAssessmentSchema>;
export type CompetitiveAnalysis = z.infer<typeof CompetitiveAnalysisSchema>;
