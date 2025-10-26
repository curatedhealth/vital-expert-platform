/**
 * Response Schema Definitions for Schema-Driven Generation
 *
 * Defines structured output formats for different use cases:
 * - Clinical summaries
 * - Regulatory documents
 * - Research reports
 * - Medical affairs communications
 * - Market access documents
 */

import { z } from 'zod';

// ============================================================================
// Base Schema Components
// ============================================================================

/**
 * Source attribution schema - character-level precision
 */
export const SourceAttributionSchema = z.object({
  document_id: z.string().uuid(),
  document_name: z.string(),
  chunk_id: z.string().uuid().optional(),
  char_start: z.number().int().min(0),
  char_end: z.number().int().min(0),
  original_text: z.string(),
  context_before: z.string().optional(),
  context_after: z.string().optional(),
  page_number: z.number().int().positive().optional(),
  confidence: z.number().min(0).max(1)
});

export type SourceAttribution = z.infer<typeof SourceAttributionSchema>;

/**
 * Entity reference schema - links to extracted entities
 */
export const EntityReferenceSchema = z.object({
  entity_id: z.string().uuid(),
  entity_type: z.enum([
    'medication',
    'diagnosis',
    'procedure',
    'condition',
    'lab_result',
    'adverse_event',
    'indication',
    'contraindication',
    'dosage',
    'population',
    'outcome',
    'endpoint'
  ]),
  entity_text: z.string(),
  confidence: z.number().min(0).max(1),
  verification_status: z.enum(['pending', 'approved', 'rejected', 'flagged']),
  sources: z.array(SourceAttributionSchema)
});

export type EntityReference = z.infer<typeof EntityReferenceSchema>;

/**
 * Medical coding schema
 */
export const MedicalCodingSchema = z.object({
  icd10: z.string().optional(),
  snomed: z.string().optional(),
  rxnorm: z.string().optional(),
  cpt: z.string().optional(),
  loinc: z.string().optional(),
  atc: z.string().optional(), // Anatomical Therapeutic Chemical
  mesh: z.string().optional()  // Medical Subject Headings
});

export type MedicalCoding = z.infer<typeof MedicalCodingSchema>;

// ============================================================================
// Clinical Summary Schema
// ============================================================================

export const ClinicalSummarySchema = z.object({
  schema_type: z.literal('clinical_summary'),
  schema_version: z.string().default('1.0'),
  generated_at: z.string().datetime(),

  // Patient demographics (anonymized for privacy)
  patient: z.object({
    age_range: z.string().optional(), // e.g., "45-50"
    gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
    population_group: z.string().optional()
  }).optional(),

  // Chief complaint
  chief_complaint: z.object({
    text: z.string(),
    entities: z.array(EntityReferenceSchema),
    sources: z.array(SourceAttributionSchema)
  }).optional(),

  // Present illness
  history_of_present_illness: z.object({
    summary: z.string(),
    timeline: z.array(z.object({
      date: z.string().optional(),
      event: z.string(),
      entities: z.array(EntityReferenceSchema),
      sources: z.array(SourceAttributionSchema)
    })),
    sources: z.array(SourceAttributionSchema)
  }).optional(),

  // Medications
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string().optional(),
    route: z.string().optional(),
    frequency: z.string().optional(),
    indication: z.string().optional(),
    status: z.enum(['active', 'discontinued', 'completed']).optional(),
    entity: EntityReferenceSchema,
    coding: MedicalCodingSchema.optional()
  })),

  // Diagnoses
  diagnoses: z.array(z.object({
    condition: z.string(),
    type: z.enum(['primary', 'secondary', 'differential']),
    status: z.enum(['confirmed', 'suspected', 'ruled_out']).optional(),
    onset: z.string().optional(),
    entity: EntityReferenceSchema,
    coding: MedicalCodingSchema.optional()
  })),

  // Procedures
  procedures: z.array(z.object({
    name: z.string(),
    date: z.string().optional(),
    indication: z.string().optional(),
    outcome: z.string().optional(),
    entity: EntityReferenceSchema,
    coding: MedicalCodingSchema.optional()
  })),

  // Lab results
  lab_results: z.array(z.object({
    test_name: z.string(),
    value: z.string().optional(),
    unit: z.string().optional(),
    reference_range: z.string().optional(),
    interpretation: z.enum(['normal', 'abnormal', 'critical']).optional(),
    date: z.string().optional(),
    entity: EntityReferenceSchema,
    coding: MedicalCodingSchema.optional()
  })),

  // Assessment
  assessment: z.object({
    summary: z.string(),
    key_findings: z.array(z.string()),
    sources: z.array(SourceAttributionSchema)
  }).optional(),

  // Plan
  plan: z.object({
    summary: z.string(),
    interventions: z.array(z.object({
      type: z.enum(['medication', 'procedure', 'monitoring', 'referral', 'education']),
      description: z.string(),
      rationale: z.string().optional(),
      sources: z.array(SourceAttributionSchema)
    })),
    sources: z.array(SourceAttributionSchema)
  }).optional(),

  // Metadata
  metadata: z.object({
    total_entities: z.number().int().min(0),
    avg_confidence: z.number().min(0).max(1),
    verification_status: z.object({
      approved: z.number().int().min(0),
      pending: z.number().int().min(0),
      rejected: z.number().int().min(0),
      flagged: z.number().int().min(0)
    }),
    source_documents: z.array(z.object({
      id: z.string().uuid(),
      name: z.string(),
      type: z.string()
    }))
  })
});

export type ClinicalSummary = z.infer<typeof ClinicalSummarySchema>;

// ============================================================================
// Regulatory Document Schema (FDA/EMA Submission)
// ============================================================================

export const RegulatoryDocumentSchema = z.object({
  schema_type: z.literal('regulatory_document'),
  schema_version: z.string().default('1.0'),
  generated_at: z.string().datetime(),

  // Document metadata
  document_info: z.object({
    title: z.string(),
    document_type: z.enum([
      'clinical_study_report',
      'investigator_brochure',
      'safety_report',
      'efficacy_summary',
      'risk_management_plan'
    ]),
    protocol_number: z.string().optional(),
    study_phase: z.enum(['phase_1', 'phase_2', 'phase_3', 'phase_4']).optional(),
    submission_type: z.enum(['IND', 'NDA', 'BLA', 'MAA']).optional()
  }),

  // Executive summary
  executive_summary: z.object({
    text: z.string(),
    key_findings: z.array(z.string()),
    sources: z.array(SourceAttributionSchema)
  }),

  // Study design
  study_design: z.object({
    objective: z.string(),
    design_type: z.string(),
    population: z.object({
      description: z.string(),
      inclusion_criteria: z.array(z.string()),
      exclusion_criteria: z.array(z.string()),
      entities: z.array(EntityReferenceSchema)
    }),
    intervention: z.object({
      description: z.string(),
      entities: z.array(EntityReferenceSchema)
    }),
    endpoints: z.object({
      primary: z.array(z.object({
        description: z.string(),
        entity: EntityReferenceSchema
      })),
      secondary: z.array(z.object({
        description: z.string(),
        entity: EntityReferenceSchema
      }))
    }),
    sources: z.array(SourceAttributionSchema)
  }).optional(),

  // Safety data
  safety: z.object({
    summary: z.string(),
    adverse_events: z.array(z.object({
      event: z.string(),
      severity: z.enum(['mild', 'moderate', 'severe', 'life_threatening']),
      frequency: z.string().optional(),
      causality: z.enum(['unrelated', 'unlikely', 'possible', 'probable', 'definite']).optional(),
      entity: EntityReferenceSchema,
      coding: MedicalCodingSchema.optional()
    })),
    serious_adverse_events: z.array(z.object({
      event: z.string(),
      outcome: z.string(),
      entity: EntityReferenceSchema
    })),
    sources: z.array(SourceAttributionSchema)
  }),

  // Efficacy data
  efficacy: z.object({
    summary: z.string(),
    outcomes: z.array(z.object({
      endpoint: z.string(),
      result: z.string(),
      statistical_significance: z.string().optional(),
      entity: EntityReferenceSchema
    })),
    sources: z.array(SourceAttributionSchema)
  }),

  // Conclusions
  conclusions: z.object({
    summary: z.string(),
    benefit_risk_assessment: z.string(),
    sources: z.array(SourceAttributionSchema)
  }),

  // Regulatory compliance
  compliance: z.object({
    gcp_compliance: z.boolean().optional(),
    ich_guidelines: z.array(z.string()).optional(),
    data_integrity_statement: z.string().optional()
  }),

  // Metadata
  metadata: z.object({
    total_sources: z.number().int().min(0),
    character_level_attribution: z.boolean(),
    verification_complete: z.boolean(),
    audit_trail_available: z.boolean()
  })
});

export type RegulatoryDocument = z.infer<typeof RegulatoryDocumentSchema>;

// ============================================================================
// Research Report Schema
// ============================================================================

export const ResearchReportSchema = z.object({
  schema_type: z.literal('research_report'),
  schema_version: z.string().default('1.0'),
  generated_at: z.string().datetime(),

  // Title and abstract
  title: z.string(),
  abstract: z.object({
    text: z.string(),
    sources: z.array(SourceAttributionSchema)
  }),

  // Introduction
  introduction: z.object({
    background: z.string(),
    research_question: z.string(),
    objectives: z.array(z.string()),
    sources: z.array(SourceAttributionSchema)
  }),

  // Methods
  methods: z.object({
    study_design: z.string(),
    population: z.string(),
    interventions: z.array(z.string()),
    outcomes: z.array(z.string()),
    analysis: z.string(),
    sources: z.array(SourceAttributionSchema)
  }),

  // Results
  results: z.object({
    summary: z.string(),
    findings: z.array(z.object({
      category: z.string(),
      description: z.string(),
      entities: z.array(EntityReferenceSchema),
      statistical_data: z.record(z.string(), z.any()).optional()
    })),
    sources: z.array(SourceAttributionSchema)
  }),

  // Discussion
  discussion: z.object({
    interpretation: z.string(),
    comparison_to_literature: z.string().optional(),
    limitations: z.array(z.string()),
    implications: z.string(),
    sources: z.array(SourceAttributionSchema)
  }),

  // Conclusions
  conclusions: z.object({
    summary: z.string(),
    future_research: z.array(z.string()).optional(),
    sources: z.array(SourceAttributionSchema)
  }),

  // References
  references: z.array(z.object({
    citation: z.string(),
    source_id: z.string().uuid().optional()
  })),

  // Metadata
  metadata: z.object({
    authors: z.array(z.string()).optional(),
    institutions: z.array(z.string()).optional(),
    keywords: z.array(z.string()).optional(),
    total_citations: z.number().int().min(0)
  })
});

export type ResearchReport = z.infer<typeof ResearchReportSchema>;

// ============================================================================
// Market Access Document Schema
// ============================================================================

export const MarketAccessDocumentSchema = z.object({
  schema_type: z.literal('market_access'),
  schema_version: z.string().default('1.0'),
  generated_at: z.string().datetime(),

  // Document info
  document_info: z.object({
    title: z.string(),
    document_type: z.enum([
      'value_dossier',
      'payer_brief',
      'formulary_submission',
      'health_economics_report'
    ]),
    target_market: z.string(),
    product_name: z.string()
  }),

  // Clinical value proposition
  clinical_value: z.object({
    summary: z.string(),
    unmet_need: z.string(),
    clinical_benefits: z.array(z.object({
      benefit: z.string(),
      evidence: z.string(),
      entities: z.array(EntityReferenceSchema)
    })),
    sources: z.array(SourceAttributionSchema)
  }),

  // Economic value proposition
  economic_value: z.object({
    summary: z.string(),
    cost_effectiveness: z.string().optional(),
    budget_impact: z.string().optional(),
    sources: z.array(SourceAttributionSchema)
  }),

  // Comparative effectiveness
  comparative_effectiveness: z.object({
    comparators: z.array(z.string()),
    summary: z.string(),
    advantages: z.array(z.string()),
    sources: z.array(SourceAttributionSchema)
  }).optional(),

  // Target population
  target_population: z.object({
    description: z.string(),
    size_estimate: z.string().optional(),
    characteristics: z.array(z.string()),
    entities: z.array(EntityReferenceSchema)
  }),

  // Recommendations
  recommendations: z.object({
    summary: z.string(),
    positioning: z.string(),
    pricing_considerations: z.string().optional()
  }),

  // Metadata
  metadata: z.object({
    evidence_grade: z.enum(['A', 'B', 'C', 'D']).optional(),
    peer_reviewed: z.boolean().optional()
  })
});

export type MarketAccessDocument = z.infer<typeof MarketAccessDocumentSchema>;

// ============================================================================
// Medical Affairs Schema
// ============================================================================

export const MedicalAffairsDocumentSchema = z.object({
  schema_type: z.literal('medical_affairs'),
  schema_version: z.string().default('1.0'),
  generated_at: z.string().datetime(),

  document_info: z.object({
    title: z.string(),
    document_type: z.enum([
      'msl_report',
      'kol_engagement',
      'congress_summary',
      'publications_plan',
      'medical_information_response'
    ]),
    therapeutic_area: z.string(),
    product_name: z.string().optional()
  }),

  scientific_content: z.object({
    key_insights: z.array(z.object({
      insight: z.string(),
      source: z.string(),
      therapeutic_relevance: z.enum(['high', 'medium', 'low']),
      entities: z.array(EntityReferenceSchema)
    })),
    clinical_data: z.object({
      summary: z.string(),
      evidence_level: z.enum(['A', 'B', 'C', 'D']),
      sources: z.array(SourceAttributionSchema)
    }),
    safety_profile: z.object({
      summary: z.string(),
      key_findings: z.array(z.string()),
      sources: z.array(SourceAttributionSchema)
    }).optional()
  }),

  kol_insights: z.array(z.object({
    topic: z.string(),
    sentiment: z.enum(['positive', 'neutral', 'negative']),
    key_quote: z.string().optional(),
    action_items: z.array(z.string())
  })).optional(),

  publications: z.array(z.object({
    title: z.string(),
    journal: z.string(),
    impact_factor: z.number().optional(),
    key_findings: z.array(z.string()),
    relevance: z.enum(['high', 'medium', 'low'])
  })).optional(),

  recommendations: z.object({
    medical_strategy: z.array(z.string()),
    educational_needs: z.array(z.string()),
    publication_opportunities: z.array(z.string()).optional()
  }),

  metadata: z.object({
    congress_name: z.string().optional(),
    kol_name: z.string().optional(),
    engagement_date: z.string().optional()
  })
});

export type MedicalAffairsDocument = z.infer<typeof MedicalAffairsDocumentSchema>;

// ============================================================================
// Business Strategy Schema
// ============================================================================

export const BusinessStrategyDocumentSchema = z.object({
  schema_type: z.literal('business_strategy'),
  schema_version: z.string().default('1.0'),
  generated_at: z.string().datetime(),

  document_info: z.object({
    title: z.string(),
    document_type: z.enum([
      'strategic_plan',
      'market_analysis',
      'competitive_intelligence',
      'business_model',
      'go_to_market_strategy'
    ]),
    time_horizon: z.enum(['1_year', '3_year', '5_year']).optional()
  }),

  market_analysis: z.object({
    market_size: z.object({
      current: z.string(),
      projected: z.string(),
      cagr: z.string().optional()
    }).optional(),
    market_segments: z.array(z.object({
      segment_name: z.string(),
      size_estimate: z.string(),
      growth_rate: z.string().optional(),
      attractiveness: z.enum(['high', 'medium', 'low'])
    })),
    trends: z.array(z.object({
      trend: z.string(),
      impact: z.enum(['high', 'medium', 'low']),
      timeframe: z.string(),
      sources: z.array(SourceAttributionSchema)
    }))
  }).optional(),

  competitive_landscape: z.object({
    competitors: z.array(z.object({
      name: z.string(),
      market_share: z.string().optional(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      strategy: z.string().optional()
    })),
    competitive_advantages: z.array(z.string()),
    threats: z.array(z.string())
  }).optional(),

  swot_analysis: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    opportunities: z.array(z.string()),
    threats: z.array(z.string())
  }).optional(),

  strategic_objectives: z.array(z.object({
    objective: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    timeframe: z.string(),
    key_results: z.array(z.string()),
    metrics: z.array(z.string()).optional()
  })),

  go_to_market: z.object({
    target_segments: z.array(z.string()),
    positioning: z.string(),
    channels: z.array(z.string()),
    pricing_strategy: z.string().optional(),
    launch_timeline: z.string().optional()
  }).optional(),

  financial_projections: z.object({
    revenue_forecast: z.array(z.object({
      period: z.string(),
      amount: z.string(),
      assumptions: z.array(z.string())
    })),
    key_assumptions: z.array(z.string())
  }).optional(),

  metadata: z.object({
    author: z.string().optional(),
    department: z.string().optional(),
    stakeholders: z.array(z.string()).optional()
  })
});

export type BusinessStrategyDocument = z.infer<typeof BusinessStrategyDocumentSchema>;

// ============================================================================
// Product Management Schema
// ============================================================================

export const ProductManagementDocumentSchema = z.object({
  schema_type: z.literal('product_management'),
  schema_version: z.string().default('1.0'),
  generated_at: z.string().datetime(),

  document_info: z.object({
    title: z.string(),
    document_type: z.enum([
      'product_roadmap',
      'prd',
      'user_stories',
      'feature_specification',
      'release_notes'
    ]),
    product_name: z.string(),
    version: z.string().optional()
  }),

  product_vision: z.object({
    vision_statement: z.string(),
    target_users: z.array(z.string()),
    value_proposition: z.string(),
    success_metrics: z.array(z.object({
      metric: z.string(),
      target: z.string(),
      current: z.string().optional()
    }))
  }).optional(),

  features: z.array(z.object({
    feature_id: z.string(),
    name: z.string(),
    description: z.string(),
    priority: z.enum(['P0', 'P1', 'P2', 'P3']),
    status: z.enum(['planned', 'in_progress', 'completed', 'deferred']),
    user_stories: z.array(z.object({
      story: z.string(),
      acceptance_criteria: z.array(z.string()),
      effort: z.enum(['XS', 'S', 'M', 'L', 'XL']).optional()
    })).optional(),
    technical_requirements: z.array(z.string()).optional(),
    dependencies: z.array(z.string()).optional(),
    launch_date: z.string().optional()
  })),

  roadmap: z.object({
    quarters: z.array(z.object({
      quarter: z.string(),
      themes: z.array(z.string()),
      features: z.array(z.string()),
      objectives: z.array(z.string())
    }))
  }).optional(),

  user_research: z.object({
    key_findings: z.array(z.string()),
    pain_points: z.array(z.string()),
    feature_requests: z.array(z.object({
      request: z.string(),
      frequency: z.number().optional(),
      priority: z.enum(['high', 'medium', 'low'])
    }))
  }).optional(),

  technical_specs: z.object({
    architecture: z.string().optional(),
    integrations: z.array(z.string()),
    security_requirements: z.array(z.string()),
    performance_requirements: z.array(z.string()).optional()
  }).optional(),

  metadata: z.object({
    product_manager: z.string().optional(),
    engineering_lead: z.string().optional(),
    stakeholders: z.array(z.string()).optional()
  })
});

export type ProductManagementDocument = z.infer<typeof ProductManagementDocumentSchema>;

// ============================================================================
// Marketing & Commercial Schema
// ============================================================================

export const MarketingCommercialDocumentSchema = z.object({
  schema_type: z.literal('marketing_commercial'),
  schema_version: z.string().default('1.0'),
  generated_at: z.string().datetime(),

  document_info: z.object({
    title: z.string(),
    document_type: z.enum([
      'marketing_plan',
      'campaign_brief',
      'brand_strategy',
      'sales_enablement',
      'customer_insights'
    ]),
    campaign_name: z.string().optional(),
    launch_date: z.string().optional()
  }),

  target_audience: z.object({
    segments: z.array(z.object({
      segment_name: z.string(),
      demographics: z.string(),
      psychographics: z.string().optional(),
      size_estimate: z.string().optional(),
      value: z.enum(['high', 'medium', 'low'])
    })),
    personas: z.array(z.object({
      name: z.string(),
      role: z.string(),
      goals: z.array(z.string()),
      pain_points: z.array(z.string()),
      messaging: z.string()
    })).optional()
  }),

  brand_positioning: z.object({
    tagline: z.string().optional(),
    key_messages: z.array(z.string()),
    differentiation: z.array(z.string()),
    tone_of_voice: z.string().optional()
  }).optional(),

  campaign_strategy: z.object({
    objectives: z.array(z.object({
      objective: z.string(),
      kpi: z.string(),
      target: z.string()
    })),
    channels: z.array(z.object({
      channel: z.string(),
      tactics: z.array(z.string()),
      budget_allocation: z.string().optional()
    })),
    timeline: z.array(z.object({
      phase: z.string(),
      activities: z.array(z.string()),
      duration: z.string()
    })).optional()
  }).optional(),

  content_strategy: z.object({
    themes: z.array(z.string()),
    content_types: z.array(z.string()),
    editorial_calendar: z.array(z.object({
      date: z.string(),
      content_title: z.string(),
      channel: z.string(),
      owner: z.string().optional()
    })).optional()
  }).optional(),

  sales_enablement: z.object({
    value_proposition: z.string(),
    key_benefits: z.array(z.string()),
    objection_handling: z.array(z.object({
      objection: z.string(),
      response: z.string()
    })).optional(),
    competitive_battlecards: z.array(z.object({
      competitor: z.string(),
      our_advantages: z.array(z.string()),
      their_advantages: z.array(z.string())
    })).optional()
  }).optional(),

  budget: z.object({
    total_budget: z.string(),
    breakdown: z.array(z.object({
      category: z.string(),
      amount: z.string(),
      percentage: z.string().optional()
    }))
  }).optional(),

  metadata: z.object({
    brand_manager: z.string().optional(),
    agency: z.string().optional(),
    approval_status: z.enum(['draft', 'pending', 'approved']).optional()
  })
});

export type MarketingCommercialDocument = z.infer<typeof MarketingCommercialDocumentSchema>;

// ============================================================================
// Clinical Operations Schema
// ============================================================================

export const ClinicalOperationsDocumentSchema = z.object({
  schema_type: z.literal('clinical_operations'),
  schema_version: z.string().default('1.0'),
  generated_at: z.string().datetime(),

  document_info: z.object({
    title: z.string(),
    document_type: z.enum([
      'study_protocol',
      'feasibility_assessment',
      'site_selection',
      'enrollment_strategy',
      'monitoring_plan'
    ]),
    protocol_number: z.string().optional(),
    study_phase: z.enum(['phase_1', 'phase_2', 'phase_3', 'phase_4']).optional()
  }),

  study_design: z.object({
    indication: z.string(),
    study_type: z.string(),
    primary_endpoint: z.string(),
    secondary_endpoints: z.array(z.string()),
    sample_size: z.object({
      total: z.number().int().positive(),
      per_arm: z.number().int().positive().optional(),
      rationale: z.string()
    }),
    duration: z.string(),
    entities: z.array(EntityReferenceSchema)
  }).optional(),

  patient_population: z.object({
    inclusion_criteria: z.array(z.string()),
    exclusion_criteria: z.array(z.string()),
    recruitment_strategy: z.array(z.string()),
    estimated_enrollment_rate: z.string().optional()
  }).optional(),

  site_information: z.array(z.object({
    site_name: z.string(),
    location: z.string(),
    pi_name: z.string().optional(),
    enrollment_target: z.number().int().positive().optional(),
    status: z.enum(['pending', 'activated', 'enrolling', 'completed', 'closed']).optional()
  })).optional(),

  timeline: z.object({
    study_start: z.string().optional(),
    first_patient_in: z.string().optional(),
    last_patient_in: z.string().optional(),
    last_patient_out: z.string().optional(),
    database_lock: z.string().optional(),
    milestones: z.array(z.object({
      milestone: z.string(),
      target_date: z.string(),
      status: z.enum(['not_started', 'in_progress', 'completed']).optional()
    }))
  }).optional(),

  risk_assessment: z.object({
    risks: z.array(z.object({
      risk: z.string(),
      likelihood: z.enum(['high', 'medium', 'low']),
      impact: z.enum(['high', 'medium', 'low']),
      mitigation: z.string()
    })),
    critical_to_quality_factors: z.array(z.string())
  }).optional(),

  metadata: z.object({
    sponsor: z.string().optional(),
    cro: z.string().optional(),
    study_manager: z.string().optional()
  })
});

export type ClinicalOperationsDocument = z.infer<typeof ClinicalOperationsDocumentSchema>;

// ============================================================================
// Digital Health / Technical Schema
// ============================================================================

export const DigitalHealthTechnicalSchema = z.object({
  schema_type: z.literal('digital_health_technical'),
  schema_version: z.string().default('1.0'),
  generated_at: z.string().datetime(),

  document_info: z.object({
    title: z.string(),
    document_type: z.enum([
      'technical_architecture',
      'integration_spec',
      'data_model',
      'api_documentation',
      'security_assessment'
    ]),
    product_name: z.string()
  }),

  system_architecture: z.object({
    overview: z.string(),
    components: z.array(z.object({
      name: z.string(),
      type: z.string(),
      description: z.string(),
      technologies: z.array(z.string())
    })),
    data_flow: z.string().optional(),
    infrastructure: z.string().optional()
  }).optional(),

  integrations: z.array(z.object({
    system_name: z.string(),
    integration_type: z.enum(['API', 'HL7', 'FHIR', 'file_transfer', 'database']),
    direction: z.enum(['inbound', 'outbound', 'bidirectional']),
    data_elements: z.array(z.string()),
    frequency: z.string().optional(),
    security: z.string().optional()
  })),

  data_model: z.object({
    entities: z.array(z.object({
      entity_name: z.string(),
      attributes: z.array(z.object({
        name: z.string(),
        type: z.string(),
        required: z.boolean(),
        description: z.string().optional()
      })),
      relationships: z.array(z.string()).optional()
    }))
  }).optional(),

  security_privacy: z.object({
    compliance_frameworks: z.array(z.enum(['HIPAA', 'GDPR', 'FDA_21_CFR_Part_11', 'SOC2', 'ISO27001'])),
    authentication: z.string(),
    authorization: z.string(),
    encryption: z.object({
      at_rest: z.string(),
      in_transit: z.string()
    }),
    audit_logging: z.string(),
    data_privacy_measures: z.array(z.string())
  }),

  performance_requirements: z.object({
    response_time: z.string(),
    throughput: z.string().optional(),
    availability: z.string(),
    scalability: z.string().optional()
  }).optional(),

  deployment: z.object({
    environment: z.enum(['cloud', 'on_premise', 'hybrid']),
    cloud_provider: z.string().optional(),
    ci_cd_pipeline: z.string().optional(),
    monitoring: z.array(z.string()).optional()
  }).optional(),

  metadata: z.object({
    technical_lead: z.string().optional(),
    version: z.string().optional(),
    last_updated: z.string().optional()
  })
});

export type DigitalHealthTechnical = z.infer<typeof DigitalHealthTechnicalSchema>;

// ============================================================================
// Schema Registry - Maps schema types to validators
// ============================================================================

export const SCHEMA_REGISTRY = {
  // Clinical & Regulatory
  clinical_summary: ClinicalSummarySchema,
  regulatory_document: RegulatoryDocumentSchema,
  research_report: ResearchReportSchema,
  clinical_operations: ClinicalOperationsDocumentSchema,

  // Market Access & Medical Affairs
  market_access: MarketAccessDocumentSchema,
  medical_affairs: MedicalAffairsDocumentSchema,

  // Business & Strategy
  business_strategy: BusinessStrategyDocumentSchema,
  marketing_commercial: MarketingCommercialDocumentSchema,

  // Product & Technical
  product_management: ProductManagementDocumentSchema,
  digital_health_technical: DigitalHealthTechnicalSchema
} as const;

export type SchemaType = keyof typeof SCHEMA_REGISTRY;

/**
 * Validate response against schema
 */
export function validateResponse<T extends SchemaType>(
  schemaType: T,
  data: unknown
): { valid: boolean; data?: any; errors?: z.ZodError } {
  try {
    const schema = SCHEMA_REGISTRY[schemaType];
    const validated = schema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error };
    }
    return { valid: false };
  }
}

/**
 * Get schema by type
 */
export function getSchema(schemaType: SchemaType) {
  return SCHEMA_REGISTRY[schemaType];
}

/**
 * List all available schemas
 */
export function listSchemas(): SchemaType[] {
  return Object.keys(SCHEMA_REGISTRY) as SchemaType[];
}
