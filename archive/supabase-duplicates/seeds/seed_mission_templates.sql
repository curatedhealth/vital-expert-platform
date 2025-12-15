-- ============================================================================
-- VITAL Mission Templates Seed File
-- Version: 1.0
-- Date: December 9, 2025
-- 
-- This file seeds the mission_templates table with 24 mission types
-- organized into 8 Logic Families (JTBD Framework)
-- ============================================================================

-- ============================================================================
-- TABLE STRUCTURE (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS mission_templates (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    family VARCHAR(50) NOT NULL CHECK (family IN (
        'DEEP_RESEARCH', 
        'MONITORING', 
        'EVALUATION', 
        'STRATEGY', 
        'INVESTIGATION', 
        'PROBLEM_SOLVING', 
        'PREPARATION', 
        'GENERIC'
    )),
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    long_description TEXT,
    
    -- Complexity & Estimates
    complexity VARCHAR(20) CHECK (complexity IN ('low', 'medium', 'high', 'critical')),
    estimated_duration_min INTEGER,  -- minutes
    estimated_duration_max INTEGER,  -- minutes
    estimated_cost_min DECIMAL(10, 4),
    estimated_cost_max DECIMAL(10, 4),
    
    -- Agent Configuration
    required_agent_tiers JSONB DEFAULT '[]',        -- e.g., ["L2", "L4"]
    recommended_agents JSONB DEFAULT '[]',          -- specific agent IDs or archetypes
    min_agents INTEGER DEFAULT 1,
    max_agents INTEGER DEFAULT 5,
    
    -- Task Structure (TODO items for autonomous execution)
    tasks JSONB DEFAULT '[]',
    
    -- HITL Checkpoints
    checkpoints JSONB DEFAULT '[]',
    
    -- Input/Output Schema
    required_inputs JSONB DEFAULT '[]',
    optional_inputs JSONB DEFAULT '[]',
    outputs JSONB DEFAULT '[]',
    
    -- Discovery & Routing
    tags JSONB DEFAULT '[]',
    use_cases JSONB DEFAULT '[]',
    example_queries JSONB DEFAULT '[]',
    embedding vector(1536),  -- For semantic routing
    
    -- Workflow Configuration
    workflow_config JSONB DEFAULT '{}',
    tool_requirements JSONB DEFAULT '[]',
    
    -- Mode 4 Constraints
    mode_4_constraints JSONB DEFAULT '{
        "max_cost": 5.00,
        "max_iterations": 10,
        "max_wall_time_minutes": 30,
        "max_api_calls": 100,
        "allow_auto_continue": false
    }',
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    version VARCHAR(20) DEFAULT '1.0',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for routing
CREATE INDEX IF NOT EXISTS idx_mission_templates_family ON mission_templates(family);
CREATE INDEX IF NOT EXISTS idx_mission_templates_category ON mission_templates(category);
CREATE INDEX IF NOT EXISTS idx_mission_templates_active ON mission_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_mission_templates_tags ON mission_templates USING GIN(tags);


-- ============================================================================
-- FAMILY 1: DEEP_RESEARCH
-- Mission Templates: Deep Dive, Knowledge Harvest, Comprehensive Analysis
-- ============================================================================

-- Deep Dive (Primary research mission)
INSERT INTO mission_templates (
    id, name, family, category, description, long_description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, recommended_agents, min_agents, max_agents,
    tasks, checkpoints,
    required_inputs, optional_inputs, outputs,
    tags, use_cases, example_queries,
    workflow_config, tool_requirements, mode_4_constraints
) VALUES (
    'deep_dive',
    'Deep Dive Analysis',
    'DEEP_RESEARCH',
    'Research',
    'Comprehensive deep-dive analysis into a specific topic, drug, or therapeutic area with exhaustive evidence gathering.',
    'The Deep Dive mission conducts thorough research across multiple knowledge domains including regulatory databases, clinical trial registries, medical literature, and competitive intelligence sources. It synthesizes findings into actionable insights with full source attribution.',
    'high',
    45, 90,  -- 45-90 minutes
    2.50, 8.00,  -- $2.50-$8.00
    '["L2", "L3", "L4"]',
    '["L2RegulatoryExpert", "L2ClinicalExpert", "L3DomainAnalyst", "L4EvidenceSynthesizer"]',
    2, 5,
    -- Tasks (TODO structure for autonomous execution)
    '[
        {
            "id": "dd_1",
            "name": "scope_definition",
            "description": "Define research scope and key questions",
            "assigned_level": "L2",
            "assigned_archetype": "ARCH_REVIEWER",
            "estimated_minutes": 5,
            "required": true
        },
        {
            "id": "dd_2",
            "name": "literature_search",
            "description": "Search PubMed, clinical trials, regulatory databases",
            "assigned_level": "L4",
            "assigned_archetype": "ARCH_RETRIEVER",
            "estimated_minutes": 15,
            "required": true,
            "tools": ["pubmed_search", "clinical_trials_search", "regulatory_search"]
        },
        {
            "id": "dd_3",
            "name": "evidence_synthesis",
            "description": "Synthesize and grade evidence quality",
            "assigned_level": "L3",
            "assigned_archetype": "ARCH_ANALYST",
            "estimated_minutes": 20,
            "required": true
        },
        {
            "id": "dd_4",
            "name": "competitive_analysis",
            "description": "Analyze competitive landscape if applicable",
            "assigned_level": "L3",
            "assigned_archetype": "ARCH_STRATEGIST",
            "estimated_minutes": 15,
            "required": false
        },
        {
            "id": "dd_5",
            "name": "synthesis_report",
            "description": "Generate comprehensive synthesis report",
            "assigned_level": "L2",
            "assigned_archetype": "ARCH_REVIEWER",
            "estimated_minutes": 15,
            "required": true
        }
    ]',
    -- Checkpoints
    '[
        {
            "id": "cp_scope",
            "name": "Scope Approval",
            "description": "Review and approve research scope before proceeding",
            "after_task": "dd_1",
            "type": "approval",
            "timeout_minutes": 10,
            "options": ["approve", "modify", "abort"]
        },
        {
            "id": "cp_evidence",
            "name": "Evidence Review",
            "description": "Review gathered evidence quality and coverage",
            "after_task": "dd_3",
            "type": "quality",
            "timeout_minutes": 15,
            "options": ["continue", "expand_search", "abort"]
        }
    ]',
    -- Required Inputs
    '[
        {"name": "topic", "type": "string", "description": "Primary research topic or question"},
        {"name": "scope", "type": "string", "description": "Broad or focused scope"}
    ]',
    -- Optional Inputs
    '[
        {"name": "therapeutic_area", "type": "string", "description": "Specific therapeutic area"},
        {"name": "drug_name", "type": "string", "description": "Specific drug or compound"},
        {"name": "competitor_names", "type": "array", "description": "List of competitors to analyze"},
        {"name": "time_range", "type": "string", "description": "Time range for literature search"}
    ]',
    -- Outputs
    '[
        {"name": "executive_summary", "type": "markdown", "description": "High-level findings summary"},
        {"name": "detailed_analysis", "type": "markdown", "description": "Full analysis with citations"},
        {"name": "evidence_table", "type": "table", "description": "Structured evidence with quality grades"},
        {"name": "sources", "type": "array", "description": "All sources with metadata"},
        {"name": "recommendations", "type": "array", "description": "Actionable recommendations"}
    ]',
    -- Tags
    '["research", "analysis", "evidence", "comprehensive", "deep-dive", "literature-review"]',
    -- Use Cases
    '[
        "Preparing for advisory board meetings",
        "Due diligence on acquisition targets",
        "Competitive intelligence gathering",
        "Regulatory strategy development",
        "Clinical development planning",
        "Medical affairs support"
    ]',
    -- Example Queries
    '[
        "Deep dive into GLP-1 agonists competitive landscape",
        "Comprehensive analysis of FDA accelerated approval pathways for oncology",
        "Research the clinical evidence for SGLT2 inhibitors in heart failure",
        "Deep dive into gene therapy manufacturing challenges"
    ]',
    -- Workflow Config
    '{
        "parallel_tasks": false,
        "require_all_checkpoints": true,
        "auto_save_artifacts": true,
        "stream_progress": true,
        "evidence_threshold": 0.7,
        "min_sources": 5
    }',
    -- Tool Requirements
    '[
        {"tool_id": "pubmed_search", "required": true},
        {"tool_id": "clinical_trials_gov", "required": true},
        {"tool_id": "fda_drugs", "required": false},
        {"tool_id": "web_search", "required": false},
        {"tool_id": "document_analyzer", "required": true}
    ]',
    -- Mode 4 Constraints
    '{
        "max_cost": 8.00,
        "max_iterations": 15,
        "max_wall_time_minutes": 90,
        "max_api_calls": 150,
        "allow_auto_continue": false,
        "budget_warning_threshold": 0.5,
        "quality_checkpoint_interval": 3
    }'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    tasks = EXCLUDED.tasks,
    checkpoints = EXCLUDED.checkpoints,
    updated_at = NOW();


-- Knowledge Harvest
INSERT INTO mission_templates (
    id, name, family, category, description, long_description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, recommended_agents, min_agents, max_agents,
    tasks, checkpoints,
    required_inputs, optional_inputs, outputs,
    tags, use_cases, example_queries,
    workflow_config, tool_requirements
) VALUES (
    'knowledge_harvest',
    'Knowledge Harvest',
    'DEEP_RESEARCH',
    'Research',
    'Systematic collection and organization of knowledge from multiple sources into a structured knowledge base.',
    'Knowledge Harvest systematically gathers information from internal documents, published literature, regulatory sources, and expert knowledge. It organizes findings into a queryable format with source tracking and gap identification.',
    'high',
    60, 120,
    3.00, 10.00,
    '["L2", "L3", "L4", "L5"]',
    '["L2DomainLead", "L3ContextSpecialist", "L4DataExtractor", "L5LiteratureSearch"]',
    3, 6,
    '[
        {
            "id": "kh_1",
            "name": "source_identification",
            "description": "Identify all relevant knowledge sources",
            "assigned_level": "L3",
            "estimated_minutes": 10
        },
        {
            "id": "kh_2",
            "name": "document_collection",
            "description": "Collect and ingest documents from identified sources",
            "assigned_level": "L4",
            "estimated_minutes": 20,
            "tools": ["document_loader", "pdf_parser", "web_scraper"]
        },
        {
            "id": "kh_3",
            "name": "fact_extraction",
            "description": "Extract key facts, claims, and data points",
            "assigned_level": "L4",
            "estimated_minutes": 25
        },
        {
            "id": "kh_4",
            "name": "quality_assessment",
            "description": "Assess source quality and evidence levels",
            "assigned_level": "L3",
            "estimated_minutes": 15
        },
        {
            "id": "kh_5",
            "name": "gap_analysis",
            "description": "Identify knowledge gaps and contradictions",
            "assigned_level": "L2",
            "estimated_minutes": 15
        },
        {
            "id": "kh_6",
            "name": "knowledge_structuring",
            "description": "Structure knowledge into queryable format",
            "assigned_level": "L3",
            "estimated_minutes": 20
        }
    ]',
    '[
        {
            "id": "cp_sources",
            "name": "Source Review",
            "after_task": "kh_2",
            "type": "quality"
        },
        {
            "id": "cp_gaps",
            "name": "Gap Assessment",
            "after_task": "kh_5",
            "type": "direction"
        }
    ]',
    '[{"name": "topic_domain", "type": "string", "description": "Knowledge domain to harvest"}]',
    '[
        {"name": "internal_docs", "type": "array", "description": "Internal documents to include"},
        {"name": "external_sources", "type": "array", "description": "External sources to search"}
    ]',
    '[
        {"name": "knowledge_base", "type": "structured_data", "description": "Structured knowledge entries"},
        {"name": "source_registry", "type": "table", "description": "All sources with quality scores"},
        {"name": "gap_report", "type": "markdown", "description": "Identified gaps and recommendations"}
    ]',
    '["knowledge-management", "collection", "extraction", "organization", "facts"]',
    '[
        "Building therapeutic area dossiers",
        "Onboarding new team members",
        "Creating training materials",
        "Regulatory submission preparation"
    ]',
    '[
        "Harvest all knowledge about CAR-T manufacturing processes",
        "Collect regulatory guidance documents for biosimilars",
        "Build knowledge base for rare disease X"
    ]',
    '{"parallel_tasks": true, "auto_save_artifacts": true}',
    '[
        {"tool_id": "document_loader", "required": true},
        {"tool_id": "pubmed_search", "required": true},
        {"tool_id": "entity_extractor", "required": true}
    ]'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();


-- Comprehensive Analysis
INSERT INTO mission_templates (
    id, name, family, category, description, long_description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, recommended_agents, min_agents, max_agents,
    tasks, checkpoints,
    required_inputs, outputs,
    tags, use_cases, example_queries,
    workflow_config
) VALUES (
    'comprehensive_analysis',
    'Comprehensive Analysis',
    'DEEP_RESEARCH',
    'Research',
    'Multi-dimensional analysis covering clinical, regulatory, commercial, and strategic aspects of a topic.',
    'Comprehensive Analysis examines a topic from all relevant angles: clinical efficacy/safety, regulatory pathways, commercial viability, competitive positioning, and strategic implications. Ideal for major decisions requiring 360° perspective.',
    'critical',
    90, 180,
    5.00, 15.00,
    '["L1", "L2", "L3", "L4"]',
    '["L1MasterOrchestrator", "L2RegulatoryExpert", "L2ClinicalExpert", "L3DomainAnalyst"]',
    4, 8,
    '[
        {"id": "ca_1", "name": "clinical_analysis", "description": "Analyze clinical evidence and trial data", "assigned_level": "L2", "estimated_minutes": 30},
        {"id": "ca_2", "name": "regulatory_analysis", "description": "Assess regulatory pathways and requirements", "assigned_level": "L2", "estimated_minutes": 25},
        {"id": "ca_3", "name": "commercial_analysis", "description": "Evaluate market potential and positioning", "assigned_level": "L3", "estimated_minutes": 25},
        {"id": "ca_4", "name": "competitive_analysis", "description": "Map competitive landscape", "assigned_level": "L3", "estimated_minutes": 20},
        {"id": "ca_5", "name": "risk_assessment", "description": "Identify and assess key risks", "assigned_level": "L2", "estimated_minutes": 20},
        {"id": "ca_6", "name": "strategic_synthesis", "description": "Synthesize into strategic recommendations", "assigned_level": "L1", "estimated_minutes": 25}
    ]',
    '[
        {"id": "cp_scope", "name": "Analysis Scope", "after_task": "ca_1", "type": "approval"},
        {"id": "cp_risks", "name": "Risk Review", "after_task": "ca_5", "type": "quality"},
        {"id": "cp_final", "name": "Final Review", "after_task": "ca_6", "type": "approval"}
    ]',
    '[
        {"name": "subject", "type": "string", "description": "Drug, company, or strategic question"},
        {"name": "analysis_dimensions", "type": "array", "description": "Which dimensions to analyze"}
    ]',
    '[
        {"name": "360_report", "type": "document", "description": "Comprehensive analysis document"},
        {"name": "swot_analysis", "type": "structured_data", "description": "SWOT matrix"},
        {"name": "risk_register", "type": "table", "description": "Risk assessment table"},
        {"name": "recommendations", "type": "array", "description": "Strategic recommendations"}
    ]',
    '["comprehensive", "strategic", "360-analysis", "multi-dimensional"]',
    '["Investment decisions", "Partnership evaluation", "Product launch strategy", "Portfolio review"]',
    '["Comprehensive analysis of Keytruda in adjuvant melanoma", "360 analysis of mRNA vaccine platform"]',
    '{"parallel_tasks": true, "require_all_checkpoints": true}'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();


-- ============================================================================
-- FAMILY 2: MONITORING
-- Mission Templates: Horizon Scan, Competitive Watch, Trigger Monitoring, Alert Systems
-- ============================================================================

-- Horizon Scan
INSERT INTO mission_templates (
    id, name, family, category, description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, min_agents, max_agents,
    tasks, checkpoints,
    required_inputs, outputs,
    tags, use_cases, example_queries,
    workflow_config
) VALUES (
    'horizon_scan',
    'Horizon Scan',
    'MONITORING',
    'Intelligence',
    'Systematic environmental scanning for emerging trends, technologies, competitors, and regulatory changes.',
    'medium',
    30, 60,
    1.50, 4.00,
    '["L2", "L3", "L4"]',
    2, 4,
    '[
        {"id": "hs_1", "name": "source_monitoring", "description": "Monitor key information sources", "assigned_level": "L4", "estimated_minutes": 15},
        {"id": "hs_2", "name": "signal_detection", "description": "Detect and classify emerging signals", "assigned_level": "L3", "estimated_minutes": 15},
        {"id": "hs_3", "name": "impact_assessment", "description": "Assess potential impact of identified signals", "assigned_level": "L2", "estimated_minutes": 15},
        {"id": "hs_4", "name": "report_generation", "description": "Generate horizon scan report", "assigned_level": "L3", "estimated_minutes": 10}
    ]',
    '[{"id": "cp_signals", "name": "Signal Review", "after_task": "hs_2", "type": "quality"}]',
    '[
        {"name": "scan_domain", "type": "string", "description": "Domain to scan"},
        {"name": "time_horizon", "type": "string", "description": "Near-term, mid-term, or long-term"}
    ]',
    '[
        {"name": "signals_report", "type": "markdown", "description": "Identified signals with impact assessment"},
        {"name": "trend_map", "type": "visualization", "description": "Visual trend mapping"},
        {"name": "watch_list", "type": "array", "description": "Items requiring continued monitoring"}
    ]',
    '["monitoring", "trends", "signals", "emerging", "environmental-scan"]',
    '["Quarterly trend reports", "Technology scouting", "Regulatory monitoring"]',
    '["Horizon scan for gene editing technologies", "Scan emerging competitors in obesity market"]',
    '{"recurring_enabled": true, "default_frequency": "weekly"}'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();


-- Competitive Watch
INSERT INTO mission_templates (
    id, name, family, category, description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, min_agents, max_agents,
    tasks,
    required_inputs, outputs,
    tags, use_cases, example_queries
) VALUES (
    'competitive_watch',
    'Competitive Watch',
    'MONITORING',
    'Intelligence',
    'Continuous monitoring of competitor activities, pipeline updates, and strategic moves.',
    'medium',
    20, 45,
    1.00, 3.00,
    '["L3", "L4"]',
    2, 3,
    '[
        {"id": "cw_1", "name": "news_monitoring", "description": "Monitor news and press releases", "assigned_level": "L4", "estimated_minutes": 10},
        {"id": "cw_2", "name": "pipeline_tracking", "description": "Track pipeline developments", "assigned_level": "L4", "estimated_minutes": 10},
        {"id": "cw_3", "name": "strategic_analysis", "description": "Analyze strategic implications", "assigned_level": "L3", "estimated_minutes": 15},
        {"id": "cw_4", "name": "alert_generation", "description": "Generate competitive alerts", "assigned_level": "L3", "estimated_minutes": 5}
    ]',
    '[
        {"name": "competitors", "type": "array", "description": "List of competitors to monitor"},
        {"name": "therapeutic_areas", "type": "array", "description": "Relevant therapeutic areas"}
    ]',
    '[
        {"name": "competitive_brief", "type": "markdown", "description": "Summary of competitor activities"},
        {"name": "pipeline_updates", "type": "table", "description": "Pipeline status changes"},
        {"name": "alerts", "type": "array", "description": "Priority alerts"}
    ]',
    '["competitive-intelligence", "monitoring", "pipeline", "competitors"]',
    '["Weekly competitive briefings", "Ad-hoc competitor deep dives"]',
    '["Monitor Pfizer oncology pipeline", "Track Novo Nordisk obesity franchise"]'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();


-- Trigger Monitoring
INSERT INTO mission_templates (
    id, name, family, category, description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, min_agents, max_agents,
    tasks,
    required_inputs, outputs,
    tags, workflow_config
) VALUES (
    'trigger_monitoring',
    'Trigger Monitoring',
    'MONITORING',
    'Intelligence',
    'Event-driven monitoring that triggers alerts when specific conditions are met.',
    'low',
    5, 15,
    0.50, 1.50,
    '["L4", "L5"]',
    1, 2,
    '[
        {"id": "tm_1", "name": "condition_check", "description": "Check trigger conditions", "assigned_level": "L5", "estimated_minutes": 5},
        {"id": "tm_2", "name": "alert_dispatch", "description": "Dispatch alerts if triggered", "assigned_level": "L4", "estimated_minutes": 5}
    ]',
    '[
        {"name": "trigger_conditions", "type": "array", "description": "Conditions that trigger alerts"},
        {"name": "data_sources", "type": "array", "description": "Sources to monitor"}
    ]',
    '[
        {"name": "trigger_status", "type": "boolean", "description": "Whether trigger fired"},
        {"name": "alert_details", "type": "object", "description": "Details if triggered"}
    ]',
    '["triggers", "alerts", "automated", "event-driven"]',
    '{"automated": true, "recurring_enabled": true}'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();


-- ============================================================================
-- FAMILY 3: EVALUATION
-- Mission Templates: Critique, Benchmark, Risk Assessment, Feasibility Study
-- ============================================================================

-- Critique
INSERT INTO mission_templates (
    id, name, family, category, description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, min_agents, max_agents,
    tasks, checkpoints,
    required_inputs, outputs,
    tags, use_cases, example_queries
) VALUES (
    'critique',
    'Critique & Review',
    'EVALUATION',
    'Quality',
    'Critical evaluation of documents, strategies, or plans with constructive feedback.',
    'medium',
    20, 45,
    1.50, 4.00,
    '["L2", "L3"]',
    2, 3,
    '[
        {"id": "cr_1", "name": "content_review", "description": "Review content for completeness", "assigned_level": "L3", "estimated_minutes": 15},
        {"id": "cr_2", "name": "quality_assessment", "description": "Assess quality and accuracy", "assigned_level": "L2", "estimated_minutes": 15},
        {"id": "cr_3", "name": "gap_identification", "description": "Identify gaps and weaknesses", "assigned_level": "L3", "estimated_minutes": 10},
        {"id": "cr_4", "name": "recommendations", "description": "Provide improvement recommendations", "assigned_level": "L2", "estimated_minutes": 10}
    ]',
    '[{"id": "cp_review", "name": "Review Findings", "after_task": "cr_3", "type": "quality"}]',
    '[
        {"name": "document", "type": "file", "description": "Document or content to critique"},
        {"name": "criteria", "type": "array", "description": "Evaluation criteria"}
    ]',
    '[
        {"name": "critique_report", "type": "markdown", "description": "Detailed critique with scores"},
        {"name": "improvement_list", "type": "array", "description": "Prioritized improvements"},
        {"name": "quality_score", "type": "number", "description": "Overall quality score"}
    ]',
    '["critique", "review", "quality", "feedback", "evaluation"]',
    '["Protocol review", "Manuscript review", "Strategy critique"]',
    '["Critique this clinical development plan", "Review regulatory submission draft"]'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();


-- Benchmark
INSERT INTO mission_templates (
    id, name, family, category, description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, min_agents, max_agents,
    tasks,
    required_inputs, outputs,
    tags, example_queries
) VALUES (
    'benchmark',
    'Benchmark Analysis',
    'EVALUATION',
    'Analysis',
    'Compare and benchmark against competitors, standards, or best practices.',
    'medium',
    30, 60,
    2.00, 5.00,
    '["L2", "L3", "L4"]',
    2, 4,
    '[
        {"id": "bm_1", "name": "data_collection", "description": "Collect benchmark data", "assigned_level": "L4", "estimated_minutes": 15},
        {"id": "bm_2", "name": "comparison_analysis", "description": "Perform comparative analysis", "assigned_level": "L3", "estimated_minutes": 20},
        {"id": "bm_3", "name": "gap_assessment", "description": "Assess gaps vs benchmarks", "assigned_level": "L2", "estimated_minutes": 15},
        {"id": "bm_4", "name": "recommendations", "description": "Generate improvement recommendations", "assigned_level": "L2", "estimated_minutes": 10}
    ]',
    '[
        {"name": "subject", "type": "string", "description": "What to benchmark"},
        {"name": "comparators", "type": "array", "description": "Benchmark comparators"}
    ]',
    '[
        {"name": "benchmark_report", "type": "markdown", "description": "Benchmark analysis report"},
        {"name": "comparison_table", "type": "table", "description": "Side-by-side comparison"},
        {"name": "gap_analysis", "type": "structured_data", "description": "Gap analysis results"}
    ]',
    '["benchmark", "comparison", "best-practices", "competitive"]',
    '["Benchmark our Phase 3 trial design against competitors", "Compare our label vs competitor labels"]'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();


-- Risk Assessment
INSERT INTO mission_templates (
    id, name, family, category, description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, min_agents, max_agents,
    tasks, checkpoints,
    required_inputs, outputs,
    tags, use_cases, example_queries
) VALUES (
    'risk_assessment',
    'Risk Assessment',
    'EVALUATION',
    'Risk',
    'Systematic identification, analysis, and prioritization of risks.',
    'high',
    45, 90,
    3.00, 8.00,
    '["L2", "L3"]',
    2, 4,
    '[
        {"id": "ra_1", "name": "risk_identification", "description": "Identify potential risks", "assigned_level": "L3", "estimated_minutes": 20},
        {"id": "ra_2", "name": "risk_analysis", "description": "Analyze likelihood and impact", "assigned_level": "L3", "estimated_minutes": 20},
        {"id": "ra_3", "name": "risk_prioritization", "description": "Prioritize risks", "assigned_level": "L2", "estimated_minutes": 15},
        {"id": "ra_4", "name": "mitigation_planning", "description": "Develop mitigation strategies", "assigned_level": "L2", "estimated_minutes": 20}
    ]',
    '[{"id": "cp_risks", "name": "Risk Review", "after_task": "ra_3", "type": "approval"}]',
    '[
        {"name": "subject", "type": "string", "description": "Subject of risk assessment"},
        {"name": "risk_categories", "type": "array", "description": "Categories to assess"}
    ]',
    '[
        {"name": "risk_register", "type": "table", "description": "Complete risk register"},
        {"name": "risk_matrix", "type": "visualization", "description": "Risk heat map"},
        {"name": "mitigation_plan", "type": "markdown", "description": "Mitigation strategies"}
    ]',
    '["risk", "assessment", "mitigation", "analysis"]',
    '["Program risk reviews", "Investment due diligence", "Launch readiness"]',
    '["Assess regulatory risks for accelerated approval", "Risk assessment for Phase 3 trial"]'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();


-- Feasibility Study
INSERT INTO mission_templates (
    id, name, family, category, description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, min_agents, max_agents,
    tasks, checkpoints,
    required_inputs, outputs,
    tags, example_queries
) VALUES (
    'feasibility_study',
    'Feasibility Study',
    'EVALUATION',
    'Analysis',
    'Assess the viability and feasibility of a proposed initiative, trial, or strategy.',
    'high',
    60, 120,
    4.00, 12.00,
    '["L1", "L2", "L3"]',
    3, 5,
    '[
        {"id": "fs_1", "name": "scope_definition", "description": "Define feasibility scope", "assigned_level": "L2", "estimated_minutes": 15},
        {"id": "fs_2", "name": "technical_feasibility", "description": "Assess technical feasibility", "assigned_level": "L3", "estimated_minutes": 25},
        {"id": "fs_3", "name": "operational_feasibility", "description": "Assess operational feasibility", "assigned_level": "L3", "estimated_minutes": 20},
        {"id": "fs_4", "name": "commercial_feasibility", "description": "Assess commercial feasibility", "assigned_level": "L2", "estimated_minutes": 20},
        {"id": "fs_5", "name": "recommendation", "description": "Generate go/no-go recommendation", "assigned_level": "L1", "estimated_minutes": 15}
    ]',
    '[
        {"id": "cp_scope", "name": "Scope Approval", "after_task": "fs_1", "type": "approval"},
        {"id": "cp_findings", "name": "Findings Review", "after_task": "fs_4", "type": "quality"}
    ]',
    '[
        {"name": "initiative", "type": "string", "description": "Initiative to assess"},
        {"name": "success_criteria", "type": "array", "description": "Success criteria"}
    ]',
    '[
        {"name": "feasibility_report", "type": "document", "description": "Comprehensive feasibility report"},
        {"name": "go_nogo_recommendation", "type": "string", "description": "Go/No-Go/Conditional recommendation"},
        {"name": "conditions", "type": "array", "description": "Conditions for go decision"}
    ]',
    '["feasibility", "viability", "assessment", "go-nogo"]',
    '["Feasibility study for adaptive trial design", "Assess feasibility of real-world evidence study"]'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();


-- ============================================================================
-- FAMILY 4: STRATEGY
-- Mission Templates: Decision Framing, Option Exploration, Trade-off Analysis
-- ============================================================================

-- Decision Framing
INSERT INTO mission_templates (
    id, name, family, category, description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, min_agents, max_agents,
    tasks, checkpoints,
    required_inputs, outputs,
    tags, use_cases, example_queries
) VALUES (
    'decision_framing',
    'Decision Framing',
    'STRATEGY',
    'Strategy',
    'Structure complex decisions with clear options, criteria, and evaluation framework.',
    'medium',
    30, 60,
    2.00, 5.00,
    '["L2", "L3"]',
    2, 3,
    '[
        {"id": "df_1", "name": "context_analysis", "description": "Analyze decision context", "assigned_level": "L3", "estimated_minutes": 15},
        {"id": "df_2", "name": "option_identification", "description": "Identify decision options", "assigned_level": "L3", "estimated_minutes": 15},
        {"id": "df_3", "name": "criteria_definition", "description": "Define evaluation criteria", "assigned_level": "L2", "estimated_minutes": 10},
        {"id": "df_4", "name": "framework_creation", "description": "Create decision framework", "assigned_level": "L2", "estimated_minutes": 15}
    ]',
    '[{"id": "cp_options", "name": "Options Review", "after_task": "df_2", "type": "approval"}]',
    '[
        {"name": "decision_question", "type": "string", "description": "The decision to be made"},
        {"name": "stakeholders", "type": "array", "description": "Key stakeholders"}
    ]',
    '[
        {"name": "decision_framework", "type": "markdown", "description": "Structured decision framework"},
        {"name": "options_matrix", "type": "table", "description": "Options vs criteria matrix"},
        {"name": "recommendation", "type": "string", "description": "Preliminary recommendation"}
    ]',
    '["decision", "framework", "options", "criteria", "strategy"]',
    '["Portfolio prioritization", "Partnership decisions", "Development strategy"]',
    '["Frame the decision on whether to pursue accelerated approval", "Structure BD partnership evaluation"]'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();


-- Option Exploration
INSERT INTO mission_templates (
    id, name, family, category, description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, min_agents, max_agents,
    tasks,
    required_inputs, outputs,
    tags, example_queries
) VALUES (
    'option_exploration',
    'Option Exploration',
    'STRATEGY',
    'Strategy',
    'Explore and evaluate multiple strategic options with pros/cons analysis.',
    'medium',
    25, 50,
    1.50, 4.00,
    '["L2", "L3"]',
    2, 3,
    '[
        {"id": "oe_1", "name": "option_generation", "description": "Generate strategic options", "assigned_level": "L3", "estimated_minutes": 15},
        {"id": "oe_2", "name": "pros_cons_analysis", "description": "Analyze pros and cons", "assigned_level": "L3", "estimated_minutes": 15},
        {"id": "oe_3", "name": "feasibility_screening", "description": "Screen for feasibility", "assigned_level": "L2", "estimated_minutes": 10},
        {"id": "oe_4", "name": "recommendation", "description": "Provide recommendation", "assigned_level": "L2", "estimated_minutes": 10}
    ]',
    '[
        {"name": "strategic_question", "type": "string", "description": "Strategic question to explore"},
        {"name": "constraints", "type": "array", "description": "Known constraints"}
    ]',
    '[
        {"name": "options_report", "type": "markdown", "description": "Options analysis report"},
        {"name": "comparison_matrix", "type": "table", "description": "Options comparison"},
        {"name": "recommendation", "type": "object", "description": "Recommended option with rationale"}
    ]',
    '["options", "strategy", "exploration", "alternatives"]',
    '["Explore options for market entry in Japan", "What are our options for Phase 2 design?"]'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();


-- Trade-off Analysis
INSERT INTO mission_templates (
    id, name, family, category, description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, min_agents, max_agents,
    tasks, checkpoints,
    required_inputs, outputs,
    tags, example_queries
) VALUES (
    'tradeoff_analysis',
    'Trade-off Analysis',
    'STRATEGY',
    'Strategy',
    'Analyze trade-offs between competing priorities, approaches, or resources.',
    'high',
    40, 75,
    2.50, 6.00,
    '["L2", "L3"]',
    2, 4,
    '[
        {"id": "ta_1", "name": "factor_identification", "description": "Identify trade-off factors", "assigned_level": "L3", "estimated_minutes": 15},
        {"id": "ta_2", "name": "quantification", "description": "Quantify trade-offs where possible", "assigned_level": "L3", "estimated_minutes": 20},
        {"id": "ta_3", "name": "sensitivity_analysis", "description": "Perform sensitivity analysis", "assigned_level": "L3", "estimated_minutes": 15},
        {"id": "ta_4", "name": "recommendation", "description": "Provide balanced recommendation", "assigned_level": "L2", "estimated_minutes": 15}
    ]',
    '[{"id": "cp_factors", "name": "Factor Review", "after_task": "ta_1", "type": "quality"}]',
    '[
        {"name": "decision_context", "type": "string", "description": "Context for trade-off"},
        {"name": "competing_factors", "type": "array", "description": "Factors in tension"}
    ]',
    '[
        {"name": "tradeoff_analysis", "type": "markdown", "description": "Detailed trade-off analysis"},
        {"name": "sensitivity_results", "type": "table", "description": "Sensitivity analysis results"},
        {"name": "recommendation", "type": "object", "description": "Balanced recommendation"}
    ]',
    '["tradeoffs", "analysis", "optimization", "balance"]',
    '["Analyze speed vs quality trade-offs in development", "Trade-off between broad vs narrow indication"]'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();


-- ============================================================================
-- FAMILY 5: INVESTIGATION
-- Mission Templates: Failure Forensics, Signal Chasing, Due Diligence
-- ============================================================================

-- Failure Forensics
INSERT INTO mission_templates (
    id, name, family, category, description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, min_agents, max_agents,
    tasks, checkpoints,
    required_inputs, outputs,
    tags, use_cases, example_queries
) VALUES (
    'failure_forensics',
    'Failure Forensics',
    'INVESTIGATION',
    'Analysis',
    'Root cause analysis of failures, setbacks, or unexpected outcomes.',
    'high',
    45, 90,
    3.00, 8.00,
    '["L2", "L3", "L4"]',
    3, 5,
    '[
        {"id": "ff_1", "name": "incident_documentation", "description": "Document the failure/incident", "assigned_level": "L4", "estimated_minutes": 15},
        {"id": "ff_2", "name": "timeline_reconstruction", "description": "Reconstruct timeline of events", "assigned_level": "L4", "estimated_minutes": 15},
        {"id": "ff_3", "name": "root_cause_analysis", "description": "Perform root cause analysis", "assigned_level": "L3", "estimated_minutes": 25},
        {"id": "ff_4", "name": "contributing_factors", "description": "Identify contributing factors", "assigned_level": "L3", "estimated_minutes": 15},
        {"id": "ff_5", "name": "lessons_learned", "description": "Document lessons learned", "assigned_level": "L2", "estimated_minutes": 15}
    ]',
    '[
        {"id": "cp_timeline", "name": "Timeline Validation", "after_task": "ff_2", "type": "quality"},
        {"id": "cp_root_cause", "name": "Root Cause Review", "after_task": "ff_3", "type": "approval"}
    ]',
    '[
        {"name": "failure_description", "type": "string", "description": "Description of the failure"},
        {"name": "available_data", "type": "array", "description": "Available data sources"}
    ]',
    '[
        {"name": "forensics_report", "type": "document", "description": "Complete forensics report"},
        {"name": "root_causes", "type": "array", "description": "Identified root causes"},
        {"name": "lessons_learned", "type": "array", "description": "Lessons learned"},
        {"name": "prevention_recommendations", "type": "array", "description": "Prevention strategies"}
    ]',
    '["forensics", "root-cause", "failure", "investigation", "lessons-learned"]',
    '["Trial failures", "Regulatory rejections", "Safety signals"]',
    '["Why did the Phase 3 trial fail to meet primary endpoint?", "Root cause analysis of CRL"]'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();


-- Signal Chasing
INSERT INTO mission_templates (
    id, name, family, category, description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, min_agents, max_agents,
    tasks,
    required_inputs, outputs,
    tags, example_queries
) VALUES (
    'signal_chasing',
    'Signal Chasing',
    'INVESTIGATION',
    'Intelligence',
    'Investigate and validate potential signals from various data sources.',
    'medium',
    25, 50,
    1.50, 4.00,
    '["L3", "L4"]',
    2, 3,
    '[
        {"id": "sc_1", "name": "signal_characterization", "description": "Characterize the signal", "assigned_level": "L4", "estimated_minutes": 10},
        {"id": "sc_2", "name": "data_gathering", "description": "Gather supporting/refuting data", "assigned_level": "L4", "estimated_minutes": 15},
        {"id": "sc_3", "name": "validation", "description": "Validate signal authenticity", "assigned_level": "L3", "estimated_minutes": 15},
        {"id": "sc_4", "name": "implications", "description": "Assess implications if validated", "assigned_level": "L3", "estimated_minutes": 10}
    ]',
    '[
        {"name": "signal_description", "type": "string", "description": "The signal to investigate"},
        {"name": "source", "type": "string", "description": "Where signal was detected"}
    ]',
    '[
        {"name": "validation_report", "type": "markdown", "description": "Signal validation report"},
        {"name": "confidence_level", "type": "string", "description": "Confidence in signal validity"},
        {"name": "recommended_actions", "type": "array", "description": "Recommended next steps"}
    ]',
    '["signal", "investigation", "validation", "intelligence"]',
    '["Investigate rumored competitor acquisition", "Validate signal on competitor trial failure"]'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();


-- Due Diligence
INSERT INTO mission_templates (
    id, name, family, category, description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, min_agents, max_agents,
    tasks, checkpoints,
    required_inputs, outputs,
    tags, use_cases, example_queries
) VALUES (
    'due_diligence',
    'Due Diligence',
    'INVESTIGATION',
    'Analysis',
    'Comprehensive due diligence investigation for investments, partnerships, or acquisitions.',
    'critical',
    120, 240,
    8.00, 25.00,
    '["L1", "L2", "L3", "L4"]',
    4, 8,
    '[
        {"id": "dd_1", "name": "scope_definition", "description": "Define DD scope and focus areas", "assigned_level": "L2", "estimated_minutes": 20},
        {"id": "dd_2", "name": "public_data_collection", "description": "Collect public information", "assigned_level": "L4", "estimated_minutes": 30},
        {"id": "dd_3", "name": "scientific_assessment", "description": "Assess scientific validity", "assigned_level": "L2", "estimated_minutes": 45},
        {"id": "dd_4", "name": "regulatory_assessment", "description": "Assess regulatory pathway", "assigned_level": "L2", "estimated_minutes": 30},
        {"id": "dd_5", "name": "commercial_assessment", "description": "Assess commercial potential", "assigned_level": "L3", "estimated_minutes": 30},
        {"id": "dd_6", "name": "risk_identification", "description": "Identify key risks", "assigned_level": "L2", "estimated_minutes": 25},
        {"id": "dd_7", "name": "synthesis", "description": "Synthesize findings", "assigned_level": "L1", "estimated_minutes": 30}
    ]',
    '[
        {"id": "cp_scope", "name": "Scope Approval", "after_task": "dd_1", "type": "approval"},
        {"id": "cp_interim", "name": "Interim Findings", "after_task": "dd_5", "type": "quality"},
        {"id": "cp_final", "name": "Final Review", "after_task": "dd_7", "type": "approval"}
    ]',
    '[
        {"name": "target", "type": "string", "description": "Company, asset, or technology"},
        {"name": "dd_type", "type": "string", "description": "Type of due diligence"},
        {"name": "focus_areas", "type": "array", "description": "Specific focus areas"}
    ]',
    '[
        {"name": "dd_report", "type": "document", "description": "Comprehensive DD report"},
        {"name": "risk_matrix", "type": "table", "description": "Risk assessment matrix"},
        {"name": "valuation_inputs", "type": "structured_data", "description": "Key valuation inputs"},
        {"name": "recommendation", "type": "object", "description": "Go/No-Go recommendation"}
    ]',
    '["due-diligence", "investment", "acquisition", "partnership", "assessment"]',
    '["M&A evaluation", "Licensing assessment", "Investment decisions"]',
    '["Due diligence on biotech X gene therapy platform", "Evaluate partnership with company Y"]'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();


-- ============================================================================
-- FAMILY 6: PROBLEM_SOLVING
-- Mission Templates: Get Unstuck, Alternative Finding, Path Finding
-- ============================================================================

-- Get Unstuck
INSERT INTO mission_templates (
    id, name, family, category, description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, min_agents, max_agents,
    tasks,
    required_inputs, outputs,
    tags, use_cases, example_queries
) VALUES (
    'get_unstuck',
    'Get Unstuck',
    'PROBLEM_SOLVING',
    'Problem Solving',
    'Help overcome obstacles, blockers, or challenges with creative problem-solving.',
    'medium',
    20, 45,
    1.50, 4.00,
    '["L2", "L3"]',
    2, 3,
    '[
        {"id": "gu_1", "name": "problem_clarification", "description": "Clarify the problem/blocker", "assigned_level": "L3", "estimated_minutes": 10},
        {"id": "gu_2", "name": "constraint_analysis", "description": "Analyze constraints", "assigned_level": "L3", "estimated_minutes": 10},
        {"id": "gu_3", "name": "solution_brainstorm", "description": "Brainstorm solutions", "assigned_level": "L3", "estimated_minutes": 15},
        {"id": "gu_4", "name": "recommendation", "description": "Recommend path forward", "assigned_level": "L2", "estimated_minutes": 10}
    ]',
    '[
        {"name": "problem", "type": "string", "description": "The problem or blocker"},
        {"name": "constraints", "type": "array", "description": "Known constraints"},
        {"name": "attempts", "type": "array", "description": "What has been tried"}
    ]',
    '[
        {"name": "analysis", "type": "markdown", "description": "Problem analysis"},
        {"name": "solutions", "type": "array", "description": "Potential solutions"},
        {"name": "recommended_path", "type": "object", "description": "Recommended approach"}
    ]',
    '["problem-solving", "unblock", "creative", "solutions"]',
    '["Stuck on trial design", "Regulatory strategy unclear", "Technical challenges"]',
    '["How do we get unstuck on the biomarker strategy?", "Help me think through this enrollment challenge"]'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();


-- Alternative Finding
INSERT INTO mission_templates (
    id, name, family, category, description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, min_agents, max_agents,
    tasks,
    required_inputs, outputs,
    tags, example_queries
) VALUES (
    'alternative_finding',
    'Alternative Finding',
    'PROBLEM_SOLVING',
    'Problem Solving',
    'Find alternative approaches, suppliers, methods, or solutions.',
    'medium',
    25, 50,
    1.50, 4.00,
    '["L3", "L4"]',
    2, 3,
    '[
        {"id": "af_1", "name": "current_state", "description": "Document current approach", "assigned_level": "L4", "estimated_minutes": 10},
        {"id": "af_2", "name": "alternative_search", "description": "Search for alternatives", "assigned_level": "L4", "estimated_minutes": 15},
        {"id": "af_3", "name": "comparison", "description": "Compare alternatives", "assigned_level": "L3", "estimated_minutes": 15},
        {"id": "af_4", "name": "recommendation", "description": "Recommend best alternatives", "assigned_level": "L3", "estimated_minutes": 10}
    ]',
    '[
        {"name": "current_approach", "type": "string", "description": "Current approach/method"},
        {"name": "requirements", "type": "array", "description": "Must-have requirements"}
    ]',
    '[
        {"name": "alternatives_report", "type": "markdown", "description": "Alternatives analysis"},
        {"name": "comparison_table", "type": "table", "description": "Comparison of alternatives"},
        {"name": "recommendations", "type": "array", "description": "Recommended alternatives"}
    ]',
    '["alternatives", "options", "suppliers", "methods"]',
    '["Find alternative CROs for rare disease trials", "What are alternatives to the current assay?"]'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();


-- Path Finding
INSERT INTO mission_templates (
    id, name, family, category, description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, min_agents, max_agents,
    tasks, checkpoints,
    required_inputs, outputs,
    tags, example_queries
) VALUES (
    'path_finding',
    'Path Finding',
    'PROBLEM_SOLVING',
    'Strategy',
    'Chart a path from current state to desired goal with concrete steps.',
    'high',
    35, 70,
    2.50, 6.00,
    '["L2", "L3"]',
    2, 4,
    '[
        {"id": "pf_1", "name": "current_state", "description": "Assess current state", "assigned_level": "L3", "estimated_minutes": 15},
        {"id": "pf_2", "name": "goal_clarification", "description": "Clarify desired end state", "assigned_level": "L2", "estimated_minutes": 10},
        {"id": "pf_3", "name": "gap_analysis", "description": "Identify gaps to bridge", "assigned_level": "L3", "estimated_minutes": 15},
        {"id": "pf_4", "name": "path_design", "description": "Design path with milestones", "assigned_level": "L2", "estimated_minutes": 20}
    ]',
    '[{"id": "cp_goal", "name": "Goal Alignment", "after_task": "pf_2", "type": "approval"}]',
    '[
        {"name": "current_state", "type": "string", "description": "Where we are now"},
        {"name": "desired_state", "type": "string", "description": "Where we want to be"}
    ]',
    '[
        {"name": "roadmap", "type": "document", "description": "Step-by-step roadmap"},
        {"name": "milestones", "type": "array", "description": "Key milestones"},
        {"name": "timeline", "type": "visualization", "description": "Timeline view"}
    ]',
    '["roadmap", "path", "milestones", "planning"]',
    '["Chart path from Phase 2 to BLA submission", "How do we get from preclinical to IND?"]'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();


-- ============================================================================
-- FAMILY 7: PREPARATION
-- Mission Templates: Meeting Prep, Case Building, Pre-work Assembly
-- ============================================================================

-- Meeting Prep
INSERT INTO mission_templates (
    id, name, family, category, description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, min_agents, max_agents,
    tasks,
    required_inputs, outputs,
    tags, use_cases, example_queries
) VALUES (
    'meeting_prep',
    'Meeting Preparation',
    'PREPARATION',
    'Preparation',
    'Prepare comprehensive briefing materials for important meetings.',
    'medium',
    25, 50,
    1.50, 4.00,
    '["L2", "L3", "L4"]',
    2, 4,
    '[
        {"id": "mp_1", "name": "context_gathering", "description": "Gather meeting context", "assigned_level": "L4", "estimated_minutes": 10},
        {"id": "mp_2", "name": "stakeholder_analysis", "description": "Analyze attendees/stakeholders", "assigned_level": "L3", "estimated_minutes": 10},
        {"id": "mp_3", "name": "topic_research", "description": "Research meeting topics", "assigned_level": "L4", "estimated_minutes": 15},
        {"id": "mp_4", "name": "briefing_creation", "description": "Create briefing document", "assigned_level": "L2", "estimated_minutes": 15}
    ]',
    '[
        {"name": "meeting_type", "type": "string", "description": "Type of meeting"},
        {"name": "attendees", "type": "array", "description": "Meeting attendees"},
        {"name": "agenda", "type": "array", "description": "Meeting agenda items"}
    ]',
    '[
        {"name": "briefing_doc", "type": "document", "description": "Meeting briefing document"},
        {"name": "talking_points", "type": "array", "description": "Key talking points"},
        {"name": "anticipated_questions", "type": "array", "description": "Anticipated questions with answers"},
        {"name": "background_materials", "type": "array", "description": "Supporting materials"}
    ]',
    '["meeting", "preparation", "briefing", "stakeholder"]',
    '["Advisory board prep", "FDA meeting prep", "Board presentation prep"]',
    '["Prepare for FDA Type B meeting on accelerated approval", "Brief me for advisory board on pain management"]'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();


-- Case Building
INSERT INTO mission_templates (
    id, name, family, category, description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, min_agents, max_agents,
    tasks, checkpoints,
    required_inputs, outputs,
    tags, example_queries
) VALUES (
    'case_building',
    'Case Building',
    'PREPARATION',
    'Preparation',
    'Build a compelling case or argument with evidence and supporting materials.',
    'high',
    40, 80,
    3.00, 7.00,
    '["L2", "L3", "L4"]',
    3, 5,
    '[
        {"id": "cb_1", "name": "thesis_definition", "description": "Define the case thesis", "assigned_level": "L2", "estimated_minutes": 10},
        {"id": "cb_2", "name": "evidence_gathering", "description": "Gather supporting evidence", "assigned_level": "L4", "estimated_minutes": 20},
        {"id": "cb_3", "name": "counter_arguments", "description": "Identify counter-arguments", "assigned_level": "L3", "estimated_minutes": 15},
        {"id": "cb_4", "name": "argument_structuring", "description": "Structure the argument", "assigned_level": "L2", "estimated_minutes": 20},
        {"id": "cb_5", "name": "presentation_creation", "description": "Create presentation materials", "assigned_level": "L3", "estimated_minutes": 15}
    ]',
    '[{"id": "cp_evidence", "name": "Evidence Review", "after_task": "cb_2", "type": "quality"}]',
    '[
        {"name": "position", "type": "string", "description": "Position to argue for"},
        {"name": "audience", "type": "string", "description": "Target audience"}
    ]',
    '[
        {"name": "case_document", "type": "document", "description": "Complete case document"},
        {"name": "evidence_table", "type": "table", "description": "Evidence summary"},
        {"name": "counter_arguments", "type": "array", "description": "Counter-arguments with rebuttals"},
        {"name": "presentation", "type": "file", "description": "Presentation materials"}
    ]',
    '["case", "argument", "evidence", "persuasion"]',
    '["Build case for accelerated approval", "Make the case for investing in biomarker program"]'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();


-- Pre-work Assembly
INSERT INTO mission_templates (
    id, name, family, category, description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, min_agents, max_agents,
    tasks,
    required_inputs, outputs,
    tags, example_queries
) VALUES (
    'prework_assembly',
    'Pre-work Assembly',
    'PREPARATION',
    'Preparation',
    'Assemble and organize pre-reading materials and background information.',
    'low',
    15, 30,
    1.00, 2.50,
    '["L3", "L4"]',
    1, 2,
    '[
        {"id": "pa_1", "name": "requirements_review", "description": "Review pre-work requirements", "assigned_level": "L4", "estimated_minutes": 5},
        {"id": "pa_2", "name": "material_collection", "description": "Collect required materials", "assigned_level": "L4", "estimated_minutes": 15},
        {"id": "pa_3", "name": "summary_creation", "description": "Create executive summaries", "assigned_level": "L3", "estimated_minutes": 10}
    ]',
    '[
        {"name": "context", "type": "string", "description": "What the pre-work is for"},
        {"name": "materials_needed", "type": "array", "description": "Types of materials needed"}
    ]',
    '[
        {"name": "prework_package", "type": "file", "description": "Assembled pre-work package"},
        {"name": "reading_guide", "type": "markdown", "description": "Guide to the materials"},
        {"name": "key_takeaways", "type": "array", "description": "Key points from each document"}
    ]',
    '["prework", "preparation", "materials", "assembly"]',
    '["Assemble pre-read for portfolio review", "Gather background materials for new hire onboarding"]'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();


-- ============================================================================
-- FAMILY 8: GENERIC
-- Mission Template: Generic Query (Fallback)
-- ============================================================================

INSERT INTO mission_templates (
    id, name, family, category, description,
    complexity, estimated_duration_min, estimated_duration_max,
    estimated_cost_min, estimated_cost_max,
    required_agent_tiers, min_agents, max_agents,
    tasks,
    required_inputs, outputs,
    tags, workflow_config
) VALUES (
    'generic_query',
    'Generic Query',
    'GENERIC',
    'General',
    'Fallback for queries that do not match specific mission templates.',
    'low',
    10, 30,
    0.50, 2.00,
    '["L2", "L3"]',
    1, 2,
    '[
        {"id": "gq_1", "name": "query_analysis", "description": "Analyze and understand query", "assigned_level": "L3", "estimated_minutes": 5},
        {"id": "gq_2", "name": "information_gathering", "description": "Gather relevant information", "assigned_level": "L3", "estimated_minutes": 15},
        {"id": "gq_3", "name": "response_generation", "description": "Generate response", "assigned_level": "L2", "estimated_minutes": 10}
    ]',
    '[{"name": "query", "type": "string", "description": "User query"}]',
    '[
        {"name": "response", "type": "markdown", "description": "Response to query"},
        {"name": "sources", "type": "array", "description": "Sources consulted"}
    ]',
    '["general", "fallback", "query"]',
    '{"flexible": true, "can_upgrade": true}'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();


-- ============================================================================
-- CREATE SEMANTIC ROUTING INDEX
-- ============================================================================

-- Create function to update embeddings (placeholder - requires external embedding service)
CREATE OR REPLACE FUNCTION update_template_embedding()
RETURNS TRIGGER AS $$
BEGIN
    -- Placeholder: In production, call embedding service
    -- NEW.embedding = get_embedding(NEW.description || ' ' || NEW.name || ' ' || array_to_string(NEW.tags::text[], ' '));
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for embedding updates
DROP TRIGGER IF EXISTS update_template_embedding_trigger ON mission_templates;
CREATE TRIGGER update_template_embedding_trigger
    BEFORE INSERT OR UPDATE OF description, name, tags
    ON mission_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_template_embedding();


-- ============================================================================
-- SUMMARY
-- ============================================================================

-- View to show template summary by family
CREATE OR REPLACE VIEW mission_template_summary AS
SELECT 
    family,
    COUNT(*) as template_count,
    AVG(estimated_duration_min) as avg_min_duration,
    AVG(estimated_duration_max) as avg_max_duration,
    AVG(estimated_cost_min) as avg_min_cost,
    AVG(estimated_cost_max) as avg_max_cost
FROM mission_templates
WHERE is_active = true
GROUP BY family
ORDER BY family;

-- Output summary
SELECT 
    '✅ Mission Templates Seeded' as status,
    COUNT(*) as total_templates,
    COUNT(DISTINCT family) as families
FROM mission_templates;
