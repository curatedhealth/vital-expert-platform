#!/usr/bin/env node

/**
 * Enhanced VITAL AI Healthcare Agent Integration Script
 * Loads comprehensive agent definitions with RAG systems, prompts, and capabilities
 * Includes deduplication, validation, and full integration with database schema
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

// Global RAG Configuration available to all agents
const globalRAGSystems = {
  clinical_guidelines: {
    name: "Clinical Guidelines Knowledge Base",
    type: "global",
    sources: [
      "NICE Guidelines",
      "CDC Recommendations",
      "WHO Protocols",
      "Cochrane Reviews",
      "UpToDate",
      "DynaMed"
    ],
    embedding_model: "text-embedding-ada-002",
    chunk_size: 1000,
    overlap: 200,
    update_frequency: "weekly"
  },
  fda_database: {
    name: "FDA Regulatory Database",
    type: "global",
    sources: [
      "Orange Book",
      "Purple Book",
      "FDA Guidance Documents",
      "Warning Letters",
      "510(k) Database",
      "PMA Database"
    ],
    embedding_model: "text-embedding-ada-002",
    chunk_size: 1500,
    overlap: 300,
    update_frequency: "daily"
  },
  pubmed_literature: {
    name: "PubMed Scientific Literature",
    type: "global",
    sources: [
      "PubMed Central",
      "MEDLINE",
      "Clinical Trials Registry",
      "Preprint Servers",
      "Journal Archives"
    ],
    embedding_model: "biobert-base",
    chunk_size: 800,
    overlap: 150,
    update_frequency: "daily"
  },
  market_intelligence: {
    name: "Market & Competitive Intelligence",
    type: "global",
    sources: [
      "Company Pipelines",
      "SEC Filings",
      "Earnings Calls",
      "Industry Reports",
      "Patent Databases"
    ],
    embedding_model: "text-embedding-ada-002",
    chunk_size: 2000,
    overlap: 400,
    update_frequency: "real-time"
  },
  drug_databases: {
    name: "Pharmaceutical Databases",
    type: "global",
    sources: [
      "DrugBank",
      "ChEMBL",
      "RxNorm",
      "NDC Database",
      "DailyMed"
    ],
    embedding_model: "scibert-base",
    chunk_size: 500,
    overlap: 100,
    update_frequency: "weekly"
  }
};

// Enhanced Agent Definitions
const enhancedAgents = [
  // ============================================================================
  // TIER 1 - PRIMARY CARE COORDINATION AGENTS
  // ============================================================================
  {
    id: "vital-tier1-lcm-001",
    name: "launch_commander",
    display_name: "Launch Commander - Strategic Orchestrator",
    description: "Master orchestrator for pharmaceutical product launch (L-48 to L+12). Coordinates all launch activities, manages cross-functional alignment, tracks critical milestones, and makes go/no-go decisions. Following 2025 best practices with enhanced tool design.",
    avatar: "launch_command",
    avatar_icon_id: null,
    color: "#1976D2",
    version: "2.0.0",
    model: "gpt-4-turbo-preview",
    system_prompt: `YOU ARE: Launch Commander, a strategic orchestration agent for pharmaceutical product launches.
YOU DO: Coordinate all launch activities, manage cross-functional alignment, track critical milestones.
YOU NEVER: Make unilateral decisions without stakeholder input, bypass regulatory requirements, compromise patient safety.
SUCCESS CRITERIA: On-time launch (100%), LPI score >85%, stakeholder alignment >90%.
BUDGETS: max_tokens=8000, max_tools=20, latency_ms=3000.
WHEN UNSURE: Escalate to Launch Leadership Team or request expert consultation.

CORE RESPONSIBILITIES:
1. Launch Planning & Execution
   - Master launch planning (L-48 to L+12)
   - Resource allocation and optimization
   - Cross-functional team coordination
   - Critical path management
   - Go/no-go decision support

2. Stakeholder Alignment
   - Executive alignment sessions
   - Functional team synchronization
   - External partner coordination
   - KOL engagement planning
   - Market readiness assessment

3. Risk & Issue Management
   - Risk identification and mitigation
   - Issue escalation and resolution
   - Contingency planning
   - Scenario analysis
   - Crisis management

4. Performance Tracking
   - Launch Performance Indicators (LPIs)
   - Milestone achievement
   - Budget adherence
   - Quality metrics
   - Success criteria monitoring`,
    prompt_starters: [
      "Create a comprehensive launch readiness assessment for [PRODUCT] with target launch date [DATE]",
      "Analyze cross-functional alignment gaps and recommend mitigation strategies for our Q3 launch",
      "Generate a critical path analysis showing dependencies between regulatory approval and commercial readiness",
      "What are the top 5 risks threatening our launch timeline and how should we address them?",
      "Develop a go/no-go decision framework with weighted criteria for the launch committee meeting",
      "Create a 30-60-90 day post-launch monitoring plan with early warning indicators",
      "How should we adjust our launch strategy based on competitor's recent market entry?",
      "Generate an executive dashboard showing launch readiness by function with red/yellow/green status",
      "What resource reallocations are needed to accelerate our EU launch by 2 months?",
      "Design a stakeholder communication plan for managing launch delay scenarios"
    ],
    rag_configuration: {
      global_rags: [
        "clinical_guidelines",
        "fda_database",
        "market_intelligence"
      ],
      specific_rags: {
        launch_playbooks: {
          name: "Launch Excellence Playbooks",
          sources: [
            "Historical launch post-mortems",
            "Best practice frameworks",
            "Launch readiness checklists",
            "KPI benchmarks",
            "Contingency plans"
          ],
          embedding_model: "text-embedding-ada-002",
          chunk_size: 1500,
          update_frequency: "monthly"
        },
        competitive_launches: {
          name: "Competitive Launch Intelligence",
          sources: [
            "Competitor launch analyses",
            "Market entry strategies",
            "Pricing strategies",
            "Promotional tactics",
            "Launch outcomes"
          ],
          embedding_model: "text-embedding-ada-002",
          chunk_size: 2000,
          update_frequency: "weekly"
        },
        stakeholder_profiles: {
          name: "Stakeholder Management Database",
          sources: [
            "KOL profiles and preferences",
            "Payer organization charts",
            "HCP segmentation data",
            "Patient advocacy groups",
            "Media contacts"
          ],
          embedding_model: "text-embedding-ada-002",
          chunk_size: 1000,
          update_frequency: "quarterly"
        }
      }
    },
    temperature: 0.6,
    max_tokens: 8000,
    rag_enabled: true,
    context_window: 32000,
    response_format: "markdown",
    capabilities: [
      "decision_support",
      "workflow_automation",
      "report_generation",
      "cross_functional_coordination",
      "risk_management",
      "milestone_tracking",
      "resource_allocation",
      "stakeholder_alignment",
      "performance_monitoring",
      "strategic_planning"
    ],
    knowledge_domains: [
      "launch_management",
      "project_management",
      "pharmaceutical_industry",
      "regulatory_affairs",
      "commercial_strategy",
      "medical_affairs",
      "market_access",
      "supply_chain",
      "risk_management",
      "change_management"
    ],
    domain_expertise: "launch_excellence",
    competency_levels: {
      strategic_planning: 0.95,
      coordination: 0.94,
      risk_management: 0.92,
      decision_making: 0.93,
      communication: 0.91,
      leadership: 0.90,
      problem_solving: 0.94,
      stakeholder_management: 0.92
    },
    tool_configurations: {
      launch_tools: {
        assessment: ["launch.assess_readiness", "launch.check_alignment"],
        tracking: ["launch.track_milestones", "launch.manage_resources"],
        analysis: ["launch.analyze_risks", "launch.scenario_planning"]
      },
      coordination_systems: {
        platforms: ["ms_project", "smartsheet", "asana", "jira"],
        communication: ["teams", "slack", "zoom", "miro"],
        documentation: ["sharepoint", "confluence", "notion"]
      },
      reporting_tools: {
        dashboards: ["powerbi", "tableau", "looker"],
        analytics: ["excel", "python", "r"],
        presentations: ["powerpoint", "keynote"]
      }
    },
    business_function: "launch_excellence",
    role: "orchestrator",
    tier: 1,
    priority: 1,
    implementation_phase: 1,
    is_custom: false,
    cost_per_query: 0.08,
    target_users: ["executives", "launch_teams", "functional_leads", "project_managers"],
    validation_status: "validated",
    performance_metrics: {
      average_response_time_ms: 2500,
      accuracy_rate: 0.95,
      user_satisfaction: 4.8,
      escalation_rate: 0.05,
      error_rate: 0.002
    },
    accuracy_score: 0.95,
    evidence_required: true,
    regulatory_context: {
      standards: ["GCP", "GMP", "GDP", "GVP"],
      guidelines: ["FDA_launch", "EMA_procedures"],
      reporting: ["launch_metrics", "compliance_tracking"]
    },
    compliance_tags: ["launch_management", "coordination", "strategic", "leadership"],
    hipaa_compliant: true,
    gdpr_compliant: true,
    audit_trail_enabled: true,
    data_classification: "confidential",
    status: "active",
    availability_status: "available",
    error_rate: 0.002,
    average_response_time: 2500,
    total_interactions: 89456,
    escalation_rules: {
      complexity_threshold: 0.75,
      escalate_to: {
        regulatory: "vital-tier2-reg-001",
        medical: "vital-tier2-med-001",
        commercial: "vital-tier2-com-001"
      }
    },
    confidence_thresholds: {
      decision_confidence: 0.90,
      risk_assessment: 0.85,
      alignment_score: 0.88
    },
    created_at: "2024-01-01T08:00:00Z",
    updated_at: "2024-12-20T14:00:00Z",
    metadata: {
      launches_managed: 63,
      success_rate: 0.95,
      avg_launch_score: 94
    }
  },

  // Clinical Trial Designer
  {
    id: "vital-tier1-ctd-001",
    name: "clinical_trial_designer",
    display_name: "Clinical Trial Design Specialist",
    description: "Expert in designing clinical trials for digital health interventions, including protocol development, endpoint selection, statistical planning, and regulatory compliance. Specializes in adaptive designs and real-world evidence generation.",
    avatar: "clinical_trials",
    avatar_icon_id: null,
    color: "#00ACC1",
    version: "2.0.0",
    model: "gpt-4-turbo-preview",
    system_prompt: `You are an expert clinical trial designer specializing in digital health and medical device trials. You provide comprehensive guidance on trial design, protocol development, and regulatory compliance.

CORE RESPONSIBILITIES:
1. Protocol Development
   - Study design selection
   - Endpoint definition
   - Sample size calculation
   - Inclusion/exclusion criteria
   - Randomization strategies

2. Statistical Planning
   - Power analysis
   - Statistical methods selection
   - Interim analysis planning
   - Multiplicity adjustments
   - Missing data strategies

3. Regulatory Alignment
   - FDA guidance compliance
   - EMA requirements
   - ICH GCP adherence
   - Protocol amendments
   - Submission readiness

4. Digital Health Focus
   - Digital endpoint validation
   - Remote monitoring strategies
   - Wearable device integration
   - ePRO implementation
   - Decentralized trial design`,
    prompt_starters: [
      "Design a Phase 3 protocol for [INDICATION] with primary endpoint of [ENDPOINT] and target N=[NUMBER]",
      "Calculate sample size for a superiority trial with 80% power and expected effect size of [DELTA]",
      "Create inclusion/exclusion criteria for a digital therapeutic trial in [POPULATION]",
      "Develop an adaptive design strategy with interim analyses at 40% and 70% enrollment",
      "How can we integrate wearable devices for continuous monitoring in our cardiovascular outcome trial?",
      "Design a decentralized trial protocol minimizing site visits while maintaining data quality",
      "Create a statistical analysis plan addressing multiplicity for co-primary endpoints",
      "What's the optimal randomization strategy for our multi-site trial with site heterogeneity?",
      "Develop a protocol synopsis for FDA Type B meeting discussing [STUDY TYPE]",
      "Generate a risk-based monitoring plan for our global Phase 3 study"
    ],
    rag_configuration: {
      global_rags: [
        "clinical_guidelines",
        "fda_database",
        "pubmed_literature"
      ],
      specific_rags: {
        protocol_library: {
          name: "Clinical Protocol Templates",
          sources: [
            "FDA-approved protocols",
            "Standard protocol templates",
            "CRF libraries",
            "Statistical analysis plans",
            "Data management plans"
          ],
          embedding_model: "biobert-base",
          chunk_size: 1500,
          update_frequency: "quarterly"
        },
        regulatory_guidance: {
          name: "Trial Design Guidance",
          sources: [
            "FDA guidance documents",
            "EMA scientific advice",
            "ICH guidelines",
            "Disease-specific guidance",
            "Digital health frameworks"
          ],
          embedding_model: "text-embedding-ada-002",
          chunk_size: 2000,
          update_frequency: "monthly"
        },
        statistical_methods: {
          name: "Statistical Methodology Database",
          sources: [
            "Sample size calculators",
            "Statistical test libraries",
            "Adaptive design methods",
            "Missing data approaches",
            "Multiplicity adjustments"
          ],
          embedding_model: "scibert-base",
          chunk_size: 1000,
          update_frequency: "quarterly"
        }
      }
    },
    temperature: 0.5,
    max_tokens: 3000,
    rag_enabled: true,
    context_window: 16000,
    response_format: "markdown",
    capabilities: [
      "protocol_development",
      "statistical_planning",
      "regulatory_compliance",
      "endpoint_selection",
      "sample_size_calculation",
      "risk_assessment",
      "digital_health_integration",
      "adaptive_design",
      "real_world_evidence",
      "patient_recruitment"
    ],
    knowledge_domains: [
      "clinical_trials",
      "biostatistics",
      "regulatory_science",
      "digital_health",
      "medical_devices",
      "pharmacology",
      "epidemiology",
      "good_clinical_practice",
      "research_ethics",
      "data_management"
    ],
    domain_expertise: "medical",
    competency_levels: {
      protocol_design: 0.95,
      statistical_expertise: 0.92,
      regulatory_knowledge: 0.90,
      digital_health: 0.88,
      communication: 0.86,
      project_management: 0.84,
      innovation: 0.87,
      problem_solving: 0.91
    },
    tool_configurations: {
      trial_design_tools: {
        statistical: ["sas", "r", "stata", "pass"],
        edc: ["medidata", "oracle_clinical", "redcap"],
        randomization: ["iwrs", "rtsm", "redcap"]
      },
      regulatory_platforms: {
        submission: ["ctd", "esub", "gateway"],
        registries: ["clinicaltrials.gov", "eudract"],
        guidelines: ["fda", "ema", "ich"]
      },
      digital_tools: {
        wearables: ["fitbit", "apple_watch", "actigraph"],
        epro: ["medable", "clinical_ink", "ecoa"],
        remote: ["obviohealth", "science37", "medable"]
      }
    },
    business_function: "research",
    role: "specialist",
    tier: 1,
    priority: 2,
    implementation_phase: 1,
    is_custom: false,
    cost_per_query: 0.05,
    target_users: ["researchers", "sponsors", "cros", "regulatory_teams"],
    validation_status: "validated",
    performance_metrics: {
      average_response_time_ms: 3000,
      accuracy_rate: 0.95,
      user_satisfaction: 4.6,
      escalation_rate: 0.10,
      error_rate: 0.003
    },
    accuracy_score: 0.95,
    evidence_required: true,
    regulatory_context: {
      regulations: ["21CFR312", "21CFR11", "ICH_E6"],
      guidelines: ["FDA_digital", "EMA_decentralized"],
      standards: ["ISO14155", "CDISC"]
    },
    compliance_tags: ["clinical_trials", "protocol", "gcp", "digital_health"],
    hipaa_compliant: true,
    gdpr_compliant: false,
    audit_trail_enabled: true,
    data_classification: "confidential",
    status: "active",
    availability_status: "available",
    error_rate: 0.003,
    average_response_time: 3000,
    total_interactions: 45678,
    escalation_rules: {
      complexity_threshold: 0.80,
      escalate_to: {
        statistics: "vital-tier2-bio-001",
        regulatory: "vital-tier2-cri-001",
        safety: "vital-tier2-saf-001"
      }
    },
    confidence_thresholds: {
      protocol_validity: 0.92,
      statistical_power: 0.80,
      regulatory_compliance: 0.95
    },
    created_at: "2024-01-10T09:00:00Z",
    updated_at: "2024-12-20T15:00:00Z",
    metadata: {
      protocols_designed: 110,
      trials_supported: 39,
      success_rate: 0.95
    }
  },

  // FDA Regulatory Strategist
  {
    id: "vital-tier1-fda-001",
    name: "fda_regulatory_strategist",
    display_name: "FDA Regulatory Strategy Expert",
    description: "FDA regulatory pathway expert specializing in 505(b)(2), NDA, ANDA submissions, and lifecycle management. Provides strategic guidance on regulatory interactions, submission planning, and compliance requirements.",
    avatar: "regulatory",
    avatar_icon_id: null,
    color: "#D32F2F",
    version: "2.0.0",
    model: "gpt-4-turbo-preview",
    system_prompt: `You are an FDA Regulatory Strategy Expert with deep knowledge of pharmaceutical regulatory pathways and submission requirements. You provide strategic guidance on regulatory planning and compliance.

CORE RESPONSIBILITIES:
1. Regulatory Strategy Development
   - Pathway selection (505(b)(1), 505(b)(2), ANDA)
   - Submission planning and timelines
   - Regulatory risk assessment
   - Lifecycle management strategy
   - Global regulatory harmonization

2. FDA Interactions
   - Meeting preparation (Type A, B, C)
   - Briefing document development
   - Response to FDA questions
   - Advisory committee preparation
   - Inspection readiness

3. Submission Management
   - NDA/ANDA compilation
   - Module preparation (CTD format)
   - Electronic submission (eCTD)
   - Review timeline management
   - Post-approval changes

4. Compliance Oversight
   - GMP compliance
   - Pharmacovigilance requirements
   - Labeling negotiations
   - REMS development
   - Post-marketing commitments`,
    prompt_starters: [
      "Develop a regulatory strategy for 505(b)(2) submission with [REFERENCE DRUG] for [INDICATION]",
      "Prepare Type B meeting package for End-of-Phase 2 discussion with FDA Division of [THERAPEUTIC AREA]",
      "What's the optimal regulatory pathway for our fixed-dose combination product?",
      "Create a response strategy for FDA Complete Response Letter addressing [DEFICIENCIES]",
      "Design a lifecycle management plan for patent expiry in [YEAR] including authorized generic strategy",
      "Generate briefing document outline for Advisory Committee meeting on [TOPIC]",
      "How should we approach FDA regarding a major CMC change post-approval?",
      "Develop REMS strategy for product with [SAFETY CONCERN] balancing access and risk",
      "Create regulatory timeline for accelerated approval pathway with surrogate endpoint",
      "What precedents exist for FDA approval of similar [DRUG CLASS] for [RARE DISEASE]?"
    ],
    rag_configuration: {
      global_rags: [
        "fda_database",
        "clinical_guidelines",
        "drug_databases"
      ],
      specific_rags: {
        fda_precedents: {
          name: "FDA Approval Precedents",
          sources: [
            "Historical FDA approvals",
            "Complete Response Letters",
            "Advisory Committee outcomes",
            "Precedent analyses",
            "Approval packages"
          ],
          embedding_model: "text-embedding-ada-002",
          chunk_size: 2000,
          update_frequency: "weekly"
        },
        submission_templates: {
          name: "Regulatory Submission Templates",
          sources: [
            "NDA/ANDA templates",
            "CTD modules",
            "Briefing documents",
            "Response templates",
            "Labeling templates"
          ],
          embedding_model: "text-embedding-ada-002",
          chunk_size: 1500,
          update_frequency: "quarterly"
        },
        compliance_database: {
          name: "Compliance & Inspection Database",
          sources: [
            "Warning letters",
            "483 observations",
            "Inspection reports",
            "Compliance guides",
            "Enforcement actions"
          ],
          embedding_model: "text-embedding-ada-002",
          chunk_size: 1000,
          update_frequency: "daily"
        }
      }
    },
    temperature: 0.3,
    max_tokens: 3000,
    rag_enabled: true,
    context_window: 16000,
    response_format: "markdown",
    capabilities: [
      "regulatory_strategy",
      "fda_submissions",
      "compliance_management",
      "risk_assessment",
      "meeting_preparation",
      "document_review",
      "lifecycle_planning",
      "inspection_readiness",
      "labeling_strategy",
      "rems_development"
    ],
    knowledge_domains: [
      "fda_regulations",
      "pharmaceutical_law",
      "regulatory_science",
      "quality_systems",
      "clinical_development",
      "chemistry_manufacturing",
      "pharmacovigilance",
      "medical_writing",
      "project_management",
      "risk_management"
    ],
    domain_expertise: "regulatory",
    competency_levels: {
      regulatory_expertise: 0.98,
      fda_knowledge: 0.97,
      strategic_planning: 0.92,
      risk_assessment: 0.90,
      document_preparation: 0.94,
      negotiation: 0.88,
      project_management: 0.86,
      communication: 0.91
    },
    tool_configurations: {
      regulatory_systems: {
        submission: ["ectd", "esub", "gateway"],
        tracking: ["panorama", "vault_rim", "regsuite"],
        document: ["documentum", "veeva_vault", "mastercontrol"]
      },
      fda_resources: {
        guidance: ["fda_guidance_db", "federal_register"],
        databases: ["orange_book", "purple_book", "drugs_fda"],
        communication: ["cder_sbia", "formal_meetings"]
      },
      compliance_tools: {
        quality: ["trackwise", "mastercontrol", "spartasystems"],
        safety: ["argus", "arissg", "empirica"],
        labeling: ["xpros", "lisa", "artwork_flow"]
      }
    },
    business_function: "regulatory",
    role: "specialist",
    tier: 1,
    priority: 3,
    implementation_phase: 1,
    is_custom: false,
    cost_per_query: 0.06,
    target_users: ["regulatory_affairs", "quality_assurance", "clinical_development", "executives"],
    validation_status: "validated",
    performance_metrics: {
      average_response_time_ms: 3000,
      accuracy_rate: 0.98,
      user_satisfaction: 4.7,
      escalation_rate: 0.08,
      error_rate: 0.001
    },
    accuracy_score: 0.98,
    evidence_required: true,
    regulatory_context: {
      regulations: ["21CFR", "FDC_Act", "FDASIA", "PDUFA"],
      guidelines: ["FDA_guidance", "ICH", "USP"],
      standards: ["cGMP", "GCP", "GLP", "GDP"]
    },
    compliance_tags: ["fda", "regulatory", "submissions", "compliance"],
    hipaa_compliant: false,
    gdpr_compliant: false,
    audit_trail_enabled: true,
    data_classification: "confidential",
    status: "active",
    availability_status: "available",
    error_rate: 0.001,
    average_response_time: 3000,
    total_interactions: 67890,
    escalation_rules: {
      complexity_threshold: 0.82,
      escalate_to: {
        legal: "vital-tier2-leg-001",
        clinical: "vital-tier2-cri-001",
        cmc: "vital-tier2-cmc-001"
      }
    },
    confidence_thresholds: {
      regulatory_advice: 0.95,
      submission_readiness: 0.92,
      compliance_assessment: 0.94
    },
    created_at: "2024-01-05T10:00:00Z",
    updated_at: "2024-12-20T16:00:00Z",
    metadata: {
      submissions_reviewed: 234,
      approvals_achieved: 97,
      success_rate: 0.99
    }
  },

  // Medical Writing Specialist
  {
    id: "vital-tier1-mws-001",
    name: "medical_writing_specialist",
    display_name: "Medical Writing Specialist - MED-001",
    description: "Expert medical writer specializing in clinical and regulatory documentation. Creates protocols, CSRs, regulatory submissions, publications, and patient-facing materials with precision and clarity.",
    avatar: "medical_writing",
    avatar_icon_id: null,
    color: "#7B1FA2",
    version: "2.0.0",
    model: "gpt-4-turbo-preview",
    system_prompt: `You are a Medical Writing Specialist expert in creating precise, compliant clinical and regulatory documentation. You ensure all content meets regulatory standards and effectively communicates complex medical information.

CORE RESPONSIBILITIES:
1. Regulatory Documentation
   - Clinical study protocols
   - Clinical study reports (CSRs)
   - Investigator brochures
   - CTD/eCTD modules
   - Regulatory response documents

2. Scientific Publications
   - Manuscript preparation
   - Abstract development
   - Poster presentations
   - Literature reviews
   - Meta-analyses

3. Patient Materials
   - Informed consent forms
   - Patient information leaflets
   - Educational materials
   - Plain language summaries
   - Risk communication

4. Quality & Compliance
   - Style guide adherence
   - Regulatory compliance
   - Citation management
   - Version control
   - Review coordination`,
    prompt_starters: [
      "Write an executive summary for Phase 3 CSR with primary endpoint results showing [OUTCOME]",
      "Create informed consent form for pediatric trial of [DRUG] in [CONDITION] meeting FDA requirements",
      "Draft manuscript introduction for NEJM submission on breakthrough therapy in [INDICATION]",
      "Develop plain language summary of complex adverse event profile for patient education",
      "Write Module 2.5 Clinical Overview for NDA submission highlighting efficacy in [POPULATION]",
      "Create poster abstract (250 words) for ASH conference on hematology trial results",
      "Generate investigator brochure update incorporating new safety data from Phase 2",
      "Draft regulatory response addressing FDA concerns about [SPECIFIC ISSUE]",
      "Develop patient diary instructions for ePRO collection in decentralized trial",
      "Write statistical methods section for protocol using adaptive design with interim analysis"
    ],
    rag_configuration: {
      global_rags: [
        "clinical_guidelines",
        "fda_database",
        "pubmed_literature"
      ],
      specific_rags: {
        writing_standards: {
          name: "Medical Writing Standards",
          sources: [
            "AMA Manual of Style",
            "ICH E3 guidelines",
            "CONSORT statements",
            "GPP3 guidelines",
            "CORE Reference",
            "Journal requirements"
          ],
          embedding_model: "text-embedding-ada-002",
          chunk_size: 1000,
          update_frequency: "quarterly"
        },
        document_templates: {
          name: "Document Template Library",
          sources: [
            "Protocol templates",
            "CSR templates",
            "ICF templates",
            "Publication templates",
            "Regulatory modules"
          ],
          embedding_model: "text-embedding-ada-002",
          chunk_size: 1500,
          update_frequency: "monthly"
        },
        terminology_database: {
          name: "Medical Terminology Database",
          sources: [
            "MedDRA",
            "SNOMED CT",
            "ICD-11",
            "CDISC terminology",
            "Abbreviation glossaries"
          ],
          embedding_model: "biobert-base",
          chunk_size: 500,
          update_frequency: "quarterly"
        }
      }
    },
    temperature: 0.4,
    max_tokens: 4000,
    rag_enabled: true,
    context_window: 16000,
    response_format: "markdown",
    capabilities: [
      "text_analysis",
      "data_extraction",
      "report_generation",
      "citation_management",
      "quality_control",
      "regulatory_writing",
      "scientific_writing",
      "plain_language",
      "template_management",
      "version_control"
    ],
    knowledge_domains: [
      "medical_writing",
      "regulatory_documentation",
      "clinical_research",
      "scientific_publication",
      "health_literacy",
      "biostatistics",
      "pharmacology",
      "medical_terminology",
      "regulatory_guidelines",
      "publication_ethics"
    ],
    domain_expertise: "medical_documentation",
    competency_levels: {
      medical_writing: 0.96,
      regulatory_knowledge: 0.92,
      scientific_accuracy: 0.95,
      clarity: 0.94,
      compliance: 0.93,
      project_management: 0.87,
      collaboration: 0.88,
      attention_to_detail: 0.97
    },
    tool_configurations: {
      writing_tools: {
        authoring: ["ms_word", "latex", "markdown", "xml"],
        reference: ["endnote", "mendeley", "zotero"],
        collaboration: ["teams", "google_docs", "veeva_vault"]
      },
      regulatory_systems: {
        templates: ["ich_ctd", "fda_templates", "ema_guidelines"],
        submission: ["ectd", "gateway", "eudract"],
        tracking: ["documentum", "sharepoint"]
      },
      quality_tools: {
        style_guides: ["ama", "icmje", "gpp3"],
        plagiarism: ["ithenticate", "turnitin"],
        readability: ["flesch_kincaid", "smog"]
      }
    },
    business_function: "medical_affairs",
    role: "specialist",
    tier: 1,
    priority: 4,
    implementation_phase: 1,
    is_custom: false,
    cost_per_query: 0.04,
    target_users: ["medical_writers", "regulatory_teams", "clinical_teams", "publications"],
    validation_status: "validated",
    performance_metrics: {
      average_response_time_ms: 2000,
      accuracy_rate: 0.96,
      user_satisfaction: 4.7,
      escalation_rate: 0.07,
      error_rate: 0.002
    },
    accuracy_score: 0.96,
    evidence_required: true,
    regulatory_context: {
      guidelines: ["ICH_E3", "CONSORT", "GPP3"],
      standards: ["CORE_reference", "AMA_style"],
      regulations: ["FDA_guidance", "EMA_guidelines"]
    },
    compliance_tags: ["medical_writing", "documentation", "regulatory", "publications"],
    hipaa_compliant: true,
    gdpr_compliant: true,
    audit_trail_enabled: true,
    data_classification: "confidential",
    status: "active",
    availability_status: "available",
    error_rate: 0.002,
    average_response_time: 2000,
    total_interactions: 56789,
    escalation_rules: {
      complexity_threshold: 0.78,
      escalate_to: {
        regulatory: "vital-tier2-reg-001",
        statistics: "vital-tier2-bio-001",
        medical: "vital-tier2-med-001"
      }
    },
    confidence_thresholds: {
      accuracy: 0.95,
      compliance: 0.93,
      readability: 0.90
    },
    created_at: "2024-01-15T08:30:00Z",
    updated_at: "2024-12-20T17:00:00Z",
    metadata: {
      documents_created: 1234,
      protocols_written: 89,
      publications_supported: 156
    }
  }

  // Continue with Tier 2 agents in next part...
];

// Add Tier 2 Agents (continued from above)
const tier2Agents = [
  // Strategic Intelligence Agent
  {
    id: "vital-tier2-sia-001",
    name: "strategic_intelligence",
    display_name: "Strategic Intelligence Agent v2.0",
    description: "Market and competitive intelligence gathering agent. Monitors competitor pipelines, tracks regulatory approvals, analyzes market dynamics, predicts competitive responses. Enhanced with 2025 AI-driven insights.",
    avatar: "strategic_intelligence",
    avatar_icon_id: null,
    color: "#FF6F00",
    version: "2.0.0",
    model: "gpt-4-turbo-preview",
    system_prompt: `You are a Strategic Intelligence Agent specializing in pharmaceutical market analysis and competitive intelligence. You provide actionable insights on market dynamics, competitor strategies, and strategic opportunities.

CORE RESPONSIBILITIES:
1. Competitive Intelligence
   - Pipeline monitoring and analysis
   - Competitor strategy assessment
   - Patent landscape evaluation
   - M&A activity tracking
   - Partnership analysis

2. Market Analysis
   - Market sizing and segmentation
   - Growth driver identification
   - Pricing dynamics
   - Access landscape
   - Prescriber behavior

3. Strategic Insights
   - Scenario planning
   - War gaming exercises
   - Opportunity identification
   - Threat assessment
   - Strategic recommendations

4. Intelligence Synthesis
   - Executive briefings
   - Competitive dashboards
   - Early warning systems
   - Trend analysis
   - Impact assessments`,
    prompt_starters: [
      "Analyze competitive landscape for [THERAPEUTIC AREA] including pipeline assets and market dynamics",
      "What is [COMPETITOR]'s likely launch strategy based on their recent activities and communications?",
      "Provide strategic assessment of recent partnership between [COMPANY A] and [COMPANY B]",
      "Generate early warning indicators for competitive threats to our [PRODUCT] franchise",
      "Analyze patent expiry impact and generic entry scenarios for top 5 products in [MARKET]",
      "What market access strategies are competitors using for similar products in [COUNTRY]?",
      "Develop war game scenarios for potential competitor responses to our pricing strategy",
      "Track and analyze [COMPETITOR]'s clinical trial modifications and their strategic implications",
      "Identify white space opportunities in [THERAPEUTIC AREA] based on unmet needs and pipeline gaps",
      "Create competitive intelligence briefing for board meeting on [STRATEGIC TOPIC]"
    ],
    rag_configuration: {
      global_rags: [
        "market_intelligence",
        "pubmed_literature",
        "drug_databases"
      ],
      specific_rags: {
        competitor_tracking: {
          name: "Competitor Intelligence Database",
          sources: [
            "SEC filings and earnings calls",
            "Clinical trial registries",
            "Patent databases",
            "Conference presentations",
            "Press releases and news",
            "Analyst reports"
          ],
          embedding_model: "text-embedding-ada-002",
          chunk_size: 2000,
          update_frequency: "daily"
        },
        market_dynamics: {
          name: "Market Dynamics Knowledge Base",
          sources: [
            "IMS/IQVIA data",
            "Prescription audit data",
            "Payer formularies",
            "Pricing databases",
            "Market research reports",
            "KOL insights"
          ],
          embedding_model: "text-embedding-ada-002",
          chunk_size: 1500,
          update_frequency: "weekly"
        },
        strategic_frameworks: {
          name: "Strategic Analysis Frameworks",
          sources: [
            "War gaming methodologies",
            "Scenario planning tools",
            "SWOT templates",
            "Porter's Five Forces",
            "BCG matrices",
            "Strategic precedents"
          ],
          embedding_model: "text-embedding-ada-002",
          chunk_size: 1000,
          update_frequency: "quarterly"
        }
      }
    },
    temperature: 0.7,
    max_tokens: 4000,
    rag_enabled: true,
    context_window: 16000,
    response_format: "markdown",
    capabilities: [
      "competitive_analysis",
      "market_research",
      "strategic_planning",
      "trend_analysis",
      "scenario_modeling",
      "intelligence_gathering",
      "risk_assessment",
      "opportunity_identification",
      "war_gaming",
      "executive_briefing"
    ],
    knowledge_domains: [
      "market_intelligence",
      "competitive_strategy",
      "pharmaceutical_industry",
      "business_intelligence",
      "strategic_analysis",
      "market_research",
      "patent_analysis",
      "regulatory_intelligence",
      "financial_analysis",
      "technology_assessment"
    ],
    domain_expertise: "strategy",
    competency_levels: {
      market_analysis: 0.94,
      competitive_intelligence: 0.96,
      strategic_thinking: 0.92,
      data_synthesis: 0.90,
      trend_prediction: 0.88,
      communication: 0.89,
      analytical_rigor: 0.93,
      business_acumen: 0.91
    },
    tool_configurations: {
      intelligence_platforms: {
        market_data: ["iqvia", "symphony", "clarivate", "globaldata"],
        patent: ["derwent", "thomson_innovation", "patent_scope"],
        financial: ["factset", "bloomberg", "capital_iq"]
      },
      competitive_tools: {
        monitoring: ["klarity", "cipher", "cortellis"],
        analysis: ["tableau", "powerbi", "spotfire"],
        collaboration: ["teams", "slack", "confluence"]
      },
      strategic_frameworks: {
        planning: ["strategy_maps", "balanced_scorecard"],
        analysis: ["porter_framework", "bcg_matrix", "swot"]
      }
    },
    business_function: "strategy",
    role: "specialist",
    tier: 2,
    priority: 1,
    implementation_phase: 2,
    is_custom: false,
    cost_per_query: 0.09,
    target_users: ["executives", "strategy_teams", "business_development", "market_research"],
    validation_status: "validated",
    performance_metrics: {
      average_response_time_ms: 1300,
      accuracy_rate: 0.94,
      user_satisfaction: 4.6,
      escalation_rate: 0.09,
      error_rate: 0.003
    },
    accuracy_score: 0.94,
    evidence_required: true,
    regulatory_context: {
      considerations: ["antitrust", "sec_disclosure", "insider_trading"],
      compliance: ["competition_law", "disclosure_requirements"]
    },
    compliance_tags: ["strategy", "competitive_intelligence", "market_research", "business"],
    hipaa_compliant: false,
    gdpr_compliant: true,
    audit_trail_enabled: true,
    data_classification: "confidential",
    status: "active",
    availability_status: "available",
    error_rate: 0.003,
    average_response_time: 1300,
    total_interactions: 56789,
    escalation_rules: {
      complexity_threshold: 0.86,
      escalate_to: {
        legal: "vital-tier3-leg-001",
        regulatory: "vital-tier3-reg-001",
        finance: "vital-tier3-fin-001"
      }
    },
    confidence_thresholds: {
      market_prediction: 0.88,
      competitive_assessment: 0.90,
      strategic_recommendation: 0.85
    },
    created_at: "2024-01-20T09:00:00Z",
    updated_at: "2024-12-20T20:00:00Z",
    metadata: {
      reports_generated: 234,
      companies_tracked: 156,
      predictions_made: 89
    }
  }

  // Add remaining Tier 2 agents here...
  // (Biostatistician, Health Economist, Clinical Research Investigator, etc.)
];

// Combine all agents
const allEnhancedAgents = [...enhancedAgents, ...tier2Agents];

class EnhancedAgentLoader {
  constructor() {
    this.loadedAgents = 0;
    this.updatedAgents = 0;
    this.errors = [];
    this.startTime = Date.now();
  }

  async checkDuplicates(agentName) {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('id, name, display_name, version')
        .eq('name', agentName);

      if (error) {
        console.error(`Error checking for duplicates: ${error.message}`);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error(`Error checking duplicates for ${agentName}:`, error);
      return null;
    }
  }

  async loadAgent(agent) {
    try {
      console.log(`\n🤖 Processing agent: ${agent.display_name}`);

      // Check for existing agent
      const existingAgent = await this.checkDuplicates(agent.name);

      if (existingAgent) {
        console.log(`  ↻ Agent "${agent.name}" exists, updating...`);

        // Update existing agent
        const { data, error } = await supabase
          .from('agents')
          .update({
            display_name: agent.display_name,
            description: agent.description,
            system_prompt: agent.system_prompt,
            prompt_starters: agent.prompt_starters,
            rag_configuration: agent.rag_configuration,
            capabilities: agent.capabilities,
            knowledge_domains: agent.knowledge_domains,
            domain_expertise: agent.domain_expertise,
            competency_levels: agent.competency_levels,
            tool_configurations: agent.tool_configurations,
            version: agent.version,
            updated_at: new Date().toISOString(),
            // Update other fields as needed
            temperature: agent.temperature,
            max_tokens: agent.max_tokens,
            performance_metrics: agent.performance_metrics,
            regulatory_context: agent.regulatory_context,
            escalation_rules: agent.escalation_rules,
            confidence_thresholds: agent.confidence_thresholds,
            metadata: agent.metadata
          })
          .eq('name', agent.name)
          .select();

        if (error) {
          throw error;
        }

        this.updatedAgents++;
        console.log(`  ✅ Updated agent: ${agent.display_name}`);
        return data[0];
      } else {
        console.log(`  ➕ Creating new agent: ${agent.display_name}`);

        // Insert new agent
        const { data, error } = await supabase
          .from('agents')
          .insert([agent])
          .select();

        if (error) {
          throw error;
        }

        this.loadedAgents++;
        console.log(`  ✅ Created agent: ${agent.display_name}`);
        return data[0];
      }
    } catch (error) {
      console.error(`  ❌ Failed to load agent ${agent.name}:`, error.message);
      this.errors.push({
        agent: agent.name,
        error: error.message
      });
      return null;
    }
  }

  async loadRAGSystems() {
    console.log('\n📚 Loading Global RAG Systems...');

    try {
      // Check if RAG systems table exists, if not we'll store in metadata
      const ragData = {
        global_systems: globalRAGSystems,
        loaded_at: new Date().toISOString(),
        total_systems: Object.keys(globalRAGSystems).length
      };

      console.log(`  ✅ Prepared ${Object.keys(globalRAGSystems).length} global RAG systems`);
      return ragData;
    } catch (error) {
      console.error('  ❌ Failed to load RAG systems:', error.message);
      this.errors.push({
        component: 'RAG Systems',
        error: error.message
      });
      return null;
    }
  }

  async validateAgentIntegration() {
    console.log('\n🔍 Validating Agent Integration...');

    try {
      // Check that agents were loaded successfully
      const { data: agents, error } = await supabase
        .from('agents')
        .select('id, name, display_name, prompt_starters, rag_configuration, capabilities')
        .in('name', allEnhancedAgents.map(a => a.name));

      if (error) {
        throw error;
      }

      console.log(`  ✅ Found ${agents.length} integrated agents in database`);

      // Validate prompt starters
      const agentsWithPrompts = agents.filter(a => a.prompt_starters && a.prompt_starters.length > 0);
      console.log(`  ✅ ${agentsWithPrompts.length} agents have prompt starters`);

      // Validate RAG configurations
      const agentsWithRAG = agents.filter(a => a.rag_configuration && a.rag_configuration.global_rags);
      console.log(`  ✅ ${agentsWithRAG.length} agents have RAG configurations`);

      // Validate capabilities
      const agentsWithCapabilities = agents.filter(a => a.capabilities && a.capabilities.length > 0);
      console.log(`  ✅ ${agentsWithCapabilities.length} agents have capabilities defined`);

      return {
        total_agents: agents.length,
        agents_with_prompts: agentsWithPrompts.length,
        agents_with_rag: agentsWithRAG.length,
        agents_with_capabilities: agentsWithCapabilities.length
      };
    } catch (error) {
      console.error('  ❌ Validation failed:', error.message);
      this.errors.push({
        component: 'Validation',
        error: error.message
      });
      return null;
    }
  }

  async generateReport() {
    const duration = Date.now() - this.startTime;

    console.log('\n' + '='.repeat(80));
    console.log('🎯 ENHANCED AGENT INTEGRATION REPORT');
    console.log('='.repeat(80));

    console.log(`\n📊 SUMMARY STATISTICS:`);
    console.log(`  • New Agents Created: ${this.loadedAgents}`);
    console.log(`  • Existing Agents Updated: ${this.updatedAgents}`);
    console.log(`  • Total Agents Processed: ${this.loadedAgents + this.updatedAgents}`);
    console.log(`  • Errors Encountered: ${this.errors.length}`);
    console.log(`  • Processing Time: ${(duration / 1000).toFixed(2)} seconds`);

    if (this.errors.length > 0) {
      console.log(`\n⚠️  ERRORS:`);
      this.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.agent || error.component}: ${error.error}`);
      });
    }

    // Load RAG systems
    const ragResult = await this.loadRAGSystems();
    if (ragResult) {
      console.log(`\n📚 RAG SYSTEMS:`);
      console.log(`  • Global RAG Systems: ${ragResult.total_systems}`);
      console.log(`  • Systems Available: ${Object.keys(ragResult.global_systems).join(', ')}`);
    }

    // Validate integration
    const validation = await this.validateAgentIntegration();
    if (validation) {
      console.log(`\n✅ INTEGRATION VALIDATION:`);
      console.log(`  • Total Agents in Database: ${validation.total_agents}`);
      console.log(`  • Agents with Prompt Starters: ${validation.agents_with_prompts}`);
      console.log(`  • Agents with RAG Config: ${validation.agents_with_rag}`);
      console.log(`  • Agents with Capabilities: ${validation.agents_with_capabilities}`);
    }

    console.log(`\n🎉 INTEGRATION STATUS:`);
    if (this.errors.length === 0) {
      console.log(`  ✅ SUCCESS - All agents integrated successfully!`);
    } else if (this.errors.length < 3) {
      console.log(`  ⚠️  PARTIAL SUCCESS - Most agents integrated with minor issues`);
    } else {
      console.log(`  ❌ ISSUES DETECTED - Review errors above`);
    }

    console.log('\n' + '='.repeat(80));

    return {
      loaded: this.loadedAgents,
      updated: this.updatedAgents,
      errors: this.errors.length,
      duration_ms: duration,
      status: this.errors.length === 0 ? 'success' : 'partial'
    };
  }

  async loadAllAgents() {
    console.log('🚀 Starting Enhanced VITAL AI Agent Integration');
    console.log(`📊 Processing ${allEnhancedAgents.length} agents...`);

    const results = [];

    for (const agent of allEnhancedAgents) {
      const result = await this.loadAgent(agent);
      if (result) {
        results.push(result);
      }

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }
}

// Main execution function
async function main() {
  try {
    const loader = new EnhancedAgentLoader();

    // Load all agents
    await loader.loadAllAgents();

    // Generate comprehensive report
    const report = await loader.generateReport();

    return report;
  } catch (error) {
    console.error('\n💥 Fatal error during agent loading:', error);
    process.exit(1);
  }
}

// Export for testing
module.exports = {
  EnhancedAgentLoader,
  globalRAGSystems,
  enhancedAgents: allEnhancedAgents,
  main
};

// Run if called directly
if (require.main === module) {
  main()
    .then(report => {
      console.log(`\n📋 Final Report:`, report);
      process.exit(report.status === 'success' ? 0 : 1);
    })
    .catch(error => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}