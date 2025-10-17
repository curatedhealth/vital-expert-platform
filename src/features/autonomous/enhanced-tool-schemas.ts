import { z } from 'zod';

/**
 * Enhanced Tool Schema System with Validation
 * Provides detailed schemas for all autonomous agent tools
 */

// Base tool schema with common properties
const BaseToolSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(500),
  version: z.string().regex(/^\d+\.\d+\.\d+$/).default('1.0.0'),
  category: z.enum(['research', 'analysis', 'generation', 'validation', 'communication', 'data']),
  tags: z.array(z.string()).min(1).max(10),
  requiredPermissions: z.array(z.string()).default([]),
  estimatedCost: z.number().min(0).max(1000).default(0.1),
  estimatedDuration: z.number().min(100).max(300000).default(5000), // milliseconds
  retryable: z.boolean().default(true),
  timeout: z.number().min(1000).max(60000).default(30000), // milliseconds
  rateLimit: z.object({
    requests: z.number().min(1).max(1000),
    window: z.number().min(1000).max(3600000) // milliseconds
  }).optional(),
  dependencies: z.array(z.string()).default([]),
  outputs: z.object({
    type: z.enum(['text', 'json', 'binary', 'structured']),
    schema: z.any().optional(),
    examples: z.array(z.any()).optional()
  }),
  inputs: z.object({
    required: z.array(z.string()).default([]),
    optional: z.array(z.string()).default([]),
    schema: z.any().optional()
  }),
  metadata: z.object({
    author: z.string().optional(),
    lastUpdated: z.string().optional(),
    documentation: z.string().url().optional(),
    supportContact: z.string().email().optional()
  }).optional()
});

// Research Tools
export const ResearchToolSchemas = {
  pubmed_search: BaseToolSchema.extend({
    name: z.literal('pubmed_search'),
    description: z.literal('Search PubMed database for medical literature and research papers'),
    category: z.literal('research'),
    inputs: z.object({
      required: z.array(z.literal('query')),
      optional: z.array(z.literal('max_results'), z.literal('date_range'), z.literal('article_types')),
      schema: z.object({
        query: z.string().min(3).max(500).describe('Search query for PubMed'),
        max_results: z.number().min(1).max(100).default(10).describe('Maximum number of results'),
        date_range: z.object({
          start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
          end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
        }).optional(),
        article_types: z.array(z.enum(['clinical_trial', 'meta_analysis', 'review', 'case_study'])).optional()
      })
    }),
    outputs: z.object({
      type: z.literal('structured'),
      schema: z.object({
        results: z.array(z.object({
          pmid: z.string(),
          title: z.string(),
          authors: z.array(z.string()),
          journal: z.string(),
          publication_date: z.string(),
          abstract: z.string().optional(),
          doi: z.string().optional(),
          impact_factor: z.number().optional(),
          citations: z.number().optional()
        })),
        total_found: z.number(),
        search_time: z.number()
      })
    }),
    estimatedCost: z.number().default(0.05),
    estimatedDuration: z.number().default(3000)
  }),

  clinical_trials_search: BaseToolSchema.extend({
    name: z.literal('clinical_trials_search'),
    description: z.literal('Search ClinicalTrials.gov for ongoing and completed clinical trials'),
    category: z.literal('research'),
    inputs: z.object({
      required: z.array(z.literal('condition')),
      optional: z.array(z.literal('intervention'), z.literal('phase'), z.literal('status')),
      schema: z.object({
        condition: z.string().min(2).max(200).describe('Medical condition or disease'),
        intervention: z.string().max(200).optional().describe('Treatment or intervention'),
        phase: z.enum(['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4']).optional(),
        status: z.enum(['recruiting', 'active', 'completed', 'suspended']).optional()
      })
    }),
    outputs: z.object({
      type: z.literal('structured'),
      schema: z.object({
        trials: z.array(z.object({
          nct_id: z.string(),
          title: z.string(),
          status: z.string(),
          phase: z.string().optional(),
          enrollment: z.number().optional(),
          start_date: z.string().optional(),
          completion_date: z.string().optional(),
          primary_outcome: z.string().optional(),
          location: z.string().optional()
        })),
        total_found: z.number()
      })
    }),
    estimatedCost: z.number().default(0.03),
    estimatedDuration: z.number().default(4000)
  }),

  fda_approvals_search: BaseToolSchema.extend({
    name: z.literal('fda_approvals_search'),
    description: z.literal('Search FDA drug approvals and regulatory information'),
    category: z.literal('research'),
    inputs: z.object({
      required: z.array(z.literal('drug_name')),
      optional: z.array(z.literal('approval_year'), z.literal('indication')),
      schema: z.object({
        drug_name: z.string().min(2).max(100).describe('Name of the drug or active ingredient'),
        approval_year: z.number().min(1990).max(2030).optional(),
        indication: z.string().max(200).optional().describe('Medical indication or use')
      })
    }),
    outputs: z.object({
      type: z.literal('structured'),
      schema: z.object({
        approvals: z.array(z.object({
          drug_name: z.string(),
          generic_name: z.string(),
          approval_date: z.string(),
          indication: z.string(),
          manufacturer: z.string(),
          dosage_form: z.string(),
          route: z.string(),
          ndc: z.string().optional()
        })),
        total_found: z.number()
      })
    }),
    estimatedCost: z.number().default(0.02),
    estimatedDuration: z.number().default(2500)
  })
};

// Analysis Tools
export const AnalysisToolSchemas = {
  data_analysis: BaseToolSchema.extend({
    name: z.literal('data_analysis'),
    description: z.literal('Perform statistical analysis on provided datasets'),
    category: z.literal('analysis'),
    inputs: z.object({
      required: z.array(z.literal('data'), z.literal('analysis_type')),
      optional: z.array(z.literal('parameters'), z.literal('visualization')),
      schema: z.object({
        data: z.any().describe('Dataset to analyze (JSON, CSV, or structured data)'),
        analysis_type: z.enum(['descriptive', 'correlation', 'regression', 'classification', 'clustering']),
        parameters: z.record(z.any()).optional(),
        visualization: z.boolean().default(false)
      })
    }),
    outputs: z.object({
      type: z.literal('structured'),
      schema: z.object({
        results: z.any(),
        summary: z.string(),
        visualizations: z.array(z.string()).optional(),
        confidence: z.number().min(0).max(1)
      })
    }),
    estimatedCost: z.number().default(0.1),
    estimatedDuration: z.number().default(8000)
  }),

  risk_assessment: BaseToolSchema.extend({
    name: z.literal('risk_assessment'),
    description: z.literal('Assess risks associated with medical treatments or procedures'),
    category: z.literal('analysis'),
    inputs: z.object({
      required: z.array(z.literal('treatment'), z.literal('patient_profile')),
      optional: z.array(z.literal('risk_factors'), z.literal('assessment_type')),
      schema: z.object({
        treatment: z.string().min(5).max(500).describe('Treatment or procedure to assess'),
        patient_profile: z.object({
          age: z.number().min(0).max(120),
          gender: z.enum(['male', 'female', 'other']),
          medical_history: z.array(z.string()).default([]),
          current_medications: z.array(z.string()).default([]),
          allergies: z.array(z.string()).default([])
        }),
        risk_factors: z.array(z.string()).optional(),
        assessment_type: z.enum(['safety', 'efficacy', 'compliance']).default('safety')
      })
    }),
    outputs: z.object({
      type: z.literal('structured'),
      schema: z.object({
        risk_level: z.enum(['low', 'medium', 'high', 'critical']),
        risk_score: z.number().min(0).max(100),
        factors: z.array(z.object({
          factor: z.string(),
          impact: z.enum(['low', 'medium', 'high']),
          mitigation: z.string().optional()
        })),
        recommendations: z.array(z.string()),
        confidence: z.number().min(0).max(1)
      })
    }),
    estimatedCost: z.number().default(0.15),
    estimatedDuration: z.number().default(10000)
  })
};

// Generation Tools
export const GenerationToolSchemas = {
  report_generation: BaseToolSchema.extend({
    name: z.literal('report_generation'),
    description: z.literal('Generate comprehensive reports from analysis results'),
    category: z.literal('generation'),
    inputs: z.object({
      required: z.array(z.literal('data'), z.literal('report_type')),
      optional: z.array(z.literal('template'), z.literal('format'), z.literal('sections')),
      schema: z.object({
        data: z.any().describe('Data to include in the report'),
        report_type: z.enum(['clinical', 'regulatory', 'research', 'executive', 'technical']),
        template: z.string().optional(),
        format: z.enum(['pdf', 'docx', 'html', 'markdown']).default('pdf'),
        sections: z.array(z.string()).optional()
      })
    }),
    outputs: z.object({
      type: z.literal('binary'),
      schema: z.object({
        file_url: z.string().url(),
        file_size: z.number(),
        page_count: z.number().optional(),
        sections: z.array(z.string())
      })
    }),
    estimatedCost: z.number().default(0.2),
    estimatedDuration: z.number().default(15000)
  }),

  protocol_generation: BaseToolSchema.extend({
    name: z.literal('protocol_generation'),
    description: z.literal('Generate clinical trial protocols or study protocols'),
    category: z.literal('generation'),
    inputs: z.object({
      required: z.array(z.literal('study_design'), z.literal('objectives')),
      optional: z.array(z.literal('regulatory_requirements'), z.literal('timeline')),
      schema: z.object({
        study_design: z.enum(['randomized_controlled', 'observational', 'pilot', 'feasibility']),
        objectives: z.array(z.string()).min(1).max(10),
        regulatory_requirements: z.array(z.string()).optional(),
        timeline: z.object({
          start_date: z.string().optional(),
          duration_months: z.number().min(1).max(120).optional()
        }).optional()
      })
    }),
    outputs: z.object({
      type: z.literal('structured'),
      schema: z.object({
        protocol: z.object({
          title: z.string(),
          objectives: z.array(z.string()),
          methodology: z.string(),
          inclusion_criteria: z.array(z.string()),
          exclusion_criteria: z.array(z.string()),
          endpoints: z.array(z.string()),
          statistical_plan: z.string(),
          timeline: z.object({
            phases: z.array(z.object({
              name: z.string(),
              duration: z.number(),
              activities: z.array(z.string())
            }))
          })
        }),
        compliance_check: z.object({
          fda_compliant: z.boolean(),
          ich_compliant: z.boolean(),
          gcp_compliant: z.boolean(),
          issues: z.array(z.string())
        })
      })
    }),
    estimatedCost: z.number().default(0.3),
    estimatedDuration: z.number().default(20000)
  })
};

// Validation Tools
export const ValidationToolSchemas = {
  evidence_validation: BaseToolSchema.extend({
    name: z.literal('evidence_validation'),
    description: z.literal('Validate evidence quality and credibility using VERIFY protocol'),
    category: z.literal('validation'),
    inputs: z.object({
      required: z.array(z.literal('evidence')),
      optional: z.array(z.literal('validation_level'), z.literal('requirements')),
      schema: z.object({
        evidence: z.object({
          source: z.string(),
          content: z.string(),
          type: z.enum(['study', 'guideline', 'approval', 'case_study']),
          metadata: z.record(z.any()).optional()
        }),
        validation_level: z.enum(['basic', 'standard', 'medical_grade']).default('standard'),
        requirements: z.array(z.string()).optional()
      })
    }),
    outputs: z.object({
      type: z.literal('structured'),
      schema: z.object({
        validation_result: z.object({
          is_valid: z.boolean(),
          confidence_score: z.number().min(0).max(1),
          credibility_score: z.number().min(0).max(1),
          impact_factor: z.number().optional(),
          verification_status: z.enum(['verified', 'pending', 'failed']),
          issues: z.array(z.string()),
          recommendations: z.array(z.string())
        }),
        proof: z.object({
          hash: z.string(),
          timestamp: z.string(),
          validator: z.string(),
          verification_chain: z.array(z.string())
        })
      })
    }),
    estimatedCost: z.number().default(0.1),
    estimatedDuration: z.number().default(5000)
  }),

  compliance_check: BaseToolSchema.extend({
    name: z.literal('compliance_check'),
    description: z.literal('Check compliance with regulatory requirements and standards'),
    category: z.literal('validation'),
    inputs: z.object({
      required: z.array(z.literal('content'), z.literal('standards')),
      optional: z.array(z.literal('jurisdiction'), z.literal('severity_level')),
      schema: z.object({
        content: z.string().min(10).max(10000).describe('Content to check for compliance'),
        standards: z.array(z.enum(['fda', 'ich', 'iso', 'hipaa', 'gdpr', 'sox'])),
        jurisdiction: z.string().optional(),
        severity_level: z.enum(['low', 'medium', 'high', 'critical']).default('medium')
      })
    }),
    outputs: z.object({
      type: z.literal('structured'),
      schema: z.object({
        compliance_result: z.object({
          overall_compliant: z.boolean(),
          compliance_score: z.number().min(0).max(100),
          violations: z.array(z.object({
            standard: z.string(),
            severity: z.enum(['low', 'medium', 'high', 'critical']),
            description: z.string(),
            recommendation: z.string(),
            line_number: z.number().optional()
          })),
          recommendations: z.array(z.string())
        })
      })
    }),
    estimatedCost: z.number().default(0.08),
    estimatedDuration: z.number().default(6000)
  })
};

// Communication Tools
export const CommunicationToolSchemas = {
  stakeholder_notification: BaseToolSchema.extend({
    name: z.literal('stakeholder_notification'),
    description: z.literal('Send notifications to stakeholders about project updates'),
    category: z.literal('communication'),
    inputs: z.object({
      required: z.array(z.literal('message'), z.literal('recipients')),
      optional: z.array(z.literal('priority'), z.literal('channels')),
      schema: z.object({
        message: z.string().min(10).max(2000).describe('Notification message'),
        recipients: z.array(z.object({
          name: z.string(),
          email: z.string().email(),
          role: z.string(),
          preferences: z.record(z.any()).optional()
        })),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
        channels: z.array(z.enum(['email', 'sms', 'slack', 'teams'])).default(['email'])
      })
    }),
    outputs: z.object({
      type: z.literal('structured'),
      schema: z.object({
        delivery_status: z.array(z.object({
          recipient: z.string(),
          channel: z.string(),
          status: z.enum(['sent', 'delivered', 'failed', 'pending']),
          timestamp: z.string(),
          error: z.string().optional()
        })),
        total_sent: z.number(),
        success_rate: z.number().min(0).max(1)
      })
    }),
    estimatedCost: z.number().default(0.02),
    estimatedDuration: z.number().default(2000)
  })
};

// Data Tools
export const DataToolSchemas = {
  data_extraction: BaseToolSchema.extend({
    name: z.literal('data_extraction'),
    description: z.literal('Extract structured data from unstructured sources'),
    category: z.literal('data'),
    inputs: z.object({
      required: z.array(z.literal('source'), z.literal('extraction_type')),
      optional: z.array(z.literal('schema'), z.literal('filters')),
      schema: z.object({
        source: z.union([
          z.string().url(),
          z.string().describe('Text content'),
          z.object({ file: z.string(), content: z.string() })
        ]),
        extraction_type: z.enum(['entities', 'relationships', 'facts', 'metrics', 'custom']),
        schema: z.any().optional(),
        filters: z.record(z.any()).optional()
      })
    }),
    outputs: z.object({
      type: z.literal('structured'),
      schema: z.object({
        extracted_data: z.any(),
        confidence: z.number().min(0).max(1),
        extraction_metadata: z.object({
          source_type: z.string(),
          extraction_method: z.string(),
          processing_time: z.number(),
          entities_found: z.number().optional()
        })
      })
    }),
    estimatedCost: z.number().default(0.05),
    estimatedDuration: z.number().default(4000)
  })
};

// Combined tool schemas
export const AllToolSchemas = {
  ...ResearchToolSchemas,
  ...AnalysisToolSchemas,
  ...GenerationToolSchemas,
  ...ValidationToolSchemas,
  ...CommunicationToolSchemas,
  ...DataToolSchemas
};

// Tool registry for validation and discovery
export class ToolSchemaRegistry {
  private schemas: Map<string, z.ZodSchema> = new Map();
  private categories: Map<string, string[]> = new Map();

  constructor() {
    this.registerSchemas();
  }

  private registerSchemas() {
    Object.entries(AllToolSchemas).forEach(([name, schema]) => {
      this.schemas.set(name, schema);
      
      const category = schema.shape.category._def.value;
      if (!this.categories.has(category)) {
        this.categories.set(category, []);
      }
      this.categories.get(category)!.push(name);
    });
  }

  /**
   * Validate tool configuration against schema
   */
  validateTool(toolName: string, toolConfig: any): { valid: boolean; errors?: string[] } {
    const schema = this.schemas.get(toolName);
    if (!schema) {
      return { valid: false, errors: [`Unknown tool: ${toolName}`] };
    }

    try {
      schema.parse(toolConfig);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        };
      }
      return { valid: false, errors: ['Unknown validation error'] };
    }
  }

  /**
   * Get tool schema
   */
  getToolSchema(toolName: string): z.ZodSchema | undefined {
    return this.schemas.get(toolName);
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: string): string[] {
    return this.categories.get(category) || [];
  }

  /**
   * Get all available tools
   */
  getAllTools(): string[] {
    return Array.from(this.schemas.keys());
  }

  /**
   * Get tool metadata
   */
  getToolMetadata(toolName: string): any {
    const schema = this.schemas.get(toolName);
    if (!schema) return null;

    const shape = schema.shape;
    return {
      name: shape.name._def.value,
      description: shape.description._def.value,
      category: shape.category._def.value,
      tags: shape.tags._def.value,
      estimatedCost: shape.estimatedCost._def.value,
      estimatedDuration: shape.estimatedDuration._def.value,
      retryable: shape.retryable._def.value,
      timeout: shape.timeout._def.value
    };
  }

  /**
   * Validate tool input
   */
  validateToolInput(toolName: string, input: any): { valid: boolean; errors?: string[] } {
    const schema = this.schemas.get(toolName);
    if (!schema) {
      return { valid: false, errors: [`Unknown tool: ${toolName}`] };
    }

    try {
      const inputSchema = schema.shape.inputs.shape.schema;
      if (inputSchema) {
        inputSchema.parse(input);
      }
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map(err => `Input ${err.path.join('.')}: ${err.message}`)
        };
      }
      return { valid: false, errors: ['Unknown input validation error'] };
    }
  }

  /**
   * Get tool cost estimate
   */
  getToolCostEstimate(toolName: string): number {
    const metadata = this.getToolMetadata(toolName);
    return metadata?.estimatedCost || 0.1;
  }

  /**
   * Get tool duration estimate
   */
  getToolDurationEstimate(toolName: string): number {
    const metadata = this.getToolMetadata(toolName);
    return metadata?.estimatedDuration || 5000;
  }
}

// Export singleton instance
export const toolSchemaRegistry = new ToolSchemaRegistry();

// Export types
export type ToolSchema = z.infer<typeof BaseToolSchema>;
export type ResearchTool = z.infer<typeof ResearchToolSchemas[keyof typeof ResearchToolSchemas]>;
export type AnalysisTool = z.infer<typeof AnalysisToolSchemas[keyof typeof AnalysisToolSchemas]>;
export type GenerationTool = z.infer<typeof GenerationToolSchemas[keyof typeof GenerationToolSchemas]>;
export type ValidationTool = z.infer<typeof ValidationToolSchemas[keyof typeof ValidationToolSchemas]>;
export type CommunicationTool = z.infer<typeof CommunicationToolSchemas[keyof typeof CommunicationToolSchemas]>;
export type DataTool = z.infer<typeof DataToolSchemas[keyof typeof DataToolSchemas]>;
