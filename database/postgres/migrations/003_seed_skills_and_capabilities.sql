-- ============================================================================
-- Migration 003: Seed Skills and Capabilities Library
-- ============================================================================
-- Date: 2025-11-17
-- Purpose: Populate skills and capabilities lookup tables
-- Reference: https://github.com/anthropics/skills
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: SEED SKILLS (Claude Code Skills + Custom VITAL Skills)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1.1 Official Anthropic Skills (from github.com/anthropics/skills)
-- ----------------------------------------------------------------------------

-- Creative & Design Skills
INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, skill_path, is_active) VALUES
('algorithmic-art', 'algorithmic-art', 'Algorithmic Art', 'Create generative art using p5.js with seeded randomness, flow fields, and particle systems', 'built_in', 'generation', 'skill_command', 'algorithmic-art/SKILL.md', true),
('canvas-design', 'canvas-design', 'Canvas Design', 'Design beautiful visual art in .png and .pdf formats using design philosophies', 'built_in', 'generation', 'skill_command', 'canvas-design/SKILL.md', true),
('slack-gif-creator', 'slack-gif-creator', 'Slack GIF Creator', 'Create animated GIFs optimized for Slack''s size constraints', 'built_in', 'generation', 'skill_command', 'slack-gif-creator/SKILL.md', true);

-- Development & Technical Skills
INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, skill_path, is_active) VALUES
('artifacts-builder', 'artifacts-builder', 'Artifacts Builder', 'Build complex claude.ai HTML artifacts using React, Tailwind CSS, and shadcn/ui components', 'built_in', 'generation', 'skill_command', 'artifacts-builder/SKILL.md', true),
('mcp-builder', 'mcp-builder', 'MCP Server Builder', 'Guide for creating high-quality MCP servers to integrate external APIs and services', 'built_in', 'generation', 'skill_command', 'mcp-builder/SKILL.md', true),
('webapp-testing', 'webapp-testing', 'Web App Testing', 'Test local web applications using Playwright for UI verification and debugging', 'built_in', 'execution', 'skill_command', 'webapp-testing/SKILL.md', true);

-- Enterprise & Communication Skills
INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, skill_path, is_active) VALUES
('brand-guidelines', 'brand-guidelines', 'Brand Guidelines', 'Apply Anthropic''s official brand colors and typography to artifacts', 'built_in', 'generation', 'skill_command', 'brand-guidelines/SKILL.md', true),
('internal-comms', 'internal-comms', 'Internal Communications', 'Write internal communications like status reports, newsletters, and FAQs', 'built_in', 'communication', 'skill_command', 'internal-comms/SKILL.md', true),
('theme-factory', 'theme-factory', 'Theme Factory', 'Style artifacts with 10 pre-set professional themes or generate custom themes on-the-fly', 'built_in', 'generation', 'skill_command', 'theme-factory/SKILL.md', true);

-- Document Skills (Reference implementations)
INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, skill_path, is_active, is_experimental) VALUES
('docx-processor', 'docx-processor', 'Word Document Processor', 'Create and edit Microsoft Word documents (.docx) with formatting, tables, and images', 'built_in', 'file_operations', 'skill_command', 'docx/SKILL.md', true, true),
('pdf-processor', 'pdf-processor', 'PDF Processor', 'Extract text, merge PDFs, handle forms, and manipulate PDF documents', 'built_in', 'file_operations', 'skill_command', 'pdf/SKILL.md', true, true),
('pptx-processor', 'pptx-processor', 'PowerPoint Processor', 'Generate and edit PowerPoint presentations with slides, charts, and media', 'built_in', 'file_operations', 'skill_command', 'pptx/SKILL.md', true, true),
('xlsx-processor', 'xlsx-processor', 'Excel Processor', 'Create and manipulate spreadsheets with formulas, charts, and data analysis', 'built_in', 'file_operations', 'skill_command', 'xlsx/SKILL.md', true, true);

-- Meta Skills
INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, skill_path, is_active) VALUES
('skill-creator', 'skill-creator', 'Skill Creator', 'Guide for creating effective skills that extend Claude''s capabilities', 'built_in', 'generation', 'skill_command', 'skill-creator/SKILL.md', true),
('template-skill', 'template-skill', 'Skill Template', 'A basic template to use as a starting point for new skills', 'built_in', 'generation', 'skill_command', 'template-skill/SKILL.md', true);

-- ----------------------------------------------------------------------------
-- 1.2 Custom VITAL Skills (Regulatory, Clinical, Market Access)
-- ----------------------------------------------------------------------------

-- Planning & Orchestration Skills
INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, required_model, is_active) VALUES
('write_todos', 'write-todos', 'Task Decomposition', 'Break down complex tasks into actionable sub-tasks with dependencies and priorities', 'custom', 'planning', 'function_call', 'gpt-4', true),
('delegate_task', 'delegate-task', 'Task Delegation', 'Delegate sub-tasks to appropriate specialist sub-agents based on capabilities', 'custom', 'delegation', 'function_call', 'gpt-4', true),
('spawn_specialist', 'spawn-specialist', 'Spawn Specialist Agent', 'Dynamically spawn specialist sub-agent (Tier 3) for specific domain expertise', 'custom', 'execution', 'function_call', 'gpt-4', true),
('spawn_worker', 'spawn-worker', 'Spawn Worker Agent', 'Dynamically spawn worker agent (Tier 4) for parallel task execution', 'custom', 'execution', 'function_call', 'gpt-4', true);

-- Search & Discovery Skills
INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, required_model, requires_network, is_active) VALUES
('search_agents', 'search-agents', 'Agent Search (GraphRAG)', 'Search for agents by capability, domain, or keywords using hybrid GraphRAG (PostgreSQL 30% + Pinecone 50% + Neo4j 20%)', 'custom', 'search', 'function_call', 'gpt-4', true, true),
('search_knowledge_base', 'search-knowledge-base', 'Knowledge Base Search', 'Search regulatory knowledge base using vector similarity and full-text search', 'custom', 'search', 'function_call', 'gpt-4', true, true),
('literature_search', 'literature-search', 'Literature Search', 'Search medical/scientific literature via PubMed, clinical trial databases', 'custom', 'search', 'function_call', 'gpt-4', true, true);

-- Regulatory Skills
INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, required_model, requires_network, is_active) VALUES
('fda_database_search', 'fda-database-search', 'FDA Database Search', 'Search FDA databases (510k, PMA, recalls, guidances) for regulatory information', 'custom', 'data_retrieval', 'function_call', 'gpt-4', true, true),
('ema_database_search', 'ema-database-search', 'EMA Database Search', 'Search EMA databases for European regulatory information and guidances', 'custom', 'data_retrieval', 'function_call', 'gpt-4', true, true),
('pmda_database_search', 'pmda-database-search', 'PMDA Database Search', 'Search PMDA databases for Japanese regulatory requirements', 'custom', 'data_retrieval', 'function_call', 'gpt-4', true, true),
('predicate_device_search', 'predicate-device-search', 'FDA 510(k) Predicate Search', 'Find appropriate predicate devices for FDA 510(k) substantial equivalence submissions', 'custom', 'search', 'function_call', 'gpt-4', true, true),
('generate_510k_template', 'generate-510k-template', 'Generate 510(k) Template', 'Generate FDA 510(k) premarket notification submission template with required sections', 'custom', 'generation', 'function_call', 'gpt-4', false, true),
('generate_pma_template', 'generate-pma-template', 'Generate PMA Template', 'Generate FDA PMA (Premarket Approval) submission template', 'custom', 'generation', 'function_call', 'gpt-4', false, true),
('regulatory_pathway_analysis', 'regulatory-pathway-analysis', 'Regulatory Pathway Analysis', 'Analyze and recommend optimal regulatory pathway (510k, De Novo, PMA, etc.) based on device characteristics', 'custom', 'analysis', 'function_call', 'gpt-4', false, true);

-- Clinical Skills
INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, required_model, requires_network, is_active) VALUES
('clinical_trial_lookup', 'clinical-trial-lookup', 'Clinical Trial Lookup', 'Look up clinical trial data from ClinicalTrials.gov by NCT number, condition, or intervention', 'custom', 'data_retrieval', 'function_call', 'gpt-4', true, true),
('endpoint_selection', 'endpoint-selection', 'Clinical Endpoint Selection', 'Recommend appropriate primary and secondary endpoints for clinical trials based on indication and design', 'custom', 'analysis', 'function_call', 'gpt-4', false, true),
('sample_size_calculator', 'sample-size-calculator', 'Sample Size Calculator', 'Calculate required sample size for clinical trials based on statistical parameters', 'custom', 'analysis', 'function_call', 'gpt-4', false, true),
('protocol_generator', 'protocol-generator', 'Protocol Generator', 'Generate clinical trial protocol template with ICH-GCP compliance', 'custom', 'generation', 'function_call', 'gpt-4', false, true);

-- Market Access Skills
INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, required_model, is_active) VALUES
('hta_database_search', 'hta-database-search', 'HTA Database Search', 'Search NICE, HAS, IQWiG, CADTH, PBAC databases for health technology assessment decisions', 'custom', 'data_retrieval', 'function_call', 'gpt-4', true),
('generate_hta_dossier', 'generate-hta-dossier', 'Generate HTA Dossier', 'Generate health technology assessment submission dossier template for NICE, CADTH, etc.', 'custom', 'generation', 'function_call', 'gpt-4', true),
('cost_effectiveness_analysis', 'cost-effectiveness-analysis', 'Cost-Effectiveness Analysis', 'Perform cost-effectiveness analysis and generate ICER calculations', 'custom', 'analysis', 'function_call', 'gpt-4', true),
('budget_impact_model', 'budget-impact-model', 'Budget Impact Model', 'Create budget impact model for payer submissions', 'custom', 'analysis', 'function_call', 'gpt-4', true);

-- Data Analysis Skills
INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, required_model, is_active) VALUES
('statistical_analysis', 'statistical-analysis', 'Statistical Analysis', 'Perform statistical analyses (t-tests, ANOVA, regression, survival analysis)', 'custom', 'analysis', 'function_call', 'gpt-4', true),
('data_visualization', 'data-visualization', 'Data Visualization', 'Create charts, graphs, and visualizations for clinical or HEOR data', 'custom', 'generation', 'function_call', 'gpt-4', true),
('safety_analysis', 'safety-analysis', 'Safety Data Analysis', 'Analyze safety data and generate adverse event summaries', 'custom', 'analysis', 'function_call', 'gpt-4', true);

-- Document Generation Skills
INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, required_model, is_active) VALUES
('generate_qsr_summary', 'generate-qsr-summary', 'Generate QSR Summary', 'Generate Quality System Regulation (QSR) compliance summary', 'custom', 'generation', 'function_call', 'gpt-4', true),
('generate_csr', 'generate-csr', 'Generate Clinical Study Report', 'Generate Clinical Study Report (CSR) template per ICH E3 guidelines', 'custom', 'generation', 'function_call', 'gpt-4', true),
('generate_ib', 'generate-ib', 'Generate Investigator Brochure', 'Generate Investigator Brochure template per ICH E6 guidelines', 'custom', 'generation', 'function_call', 'gpt-4', true);

-- Validation & Quality Skills
INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, required_model, is_active) VALUES
('regulatory_compliance_check', 'regulatory-compliance-check', 'Regulatory Compliance Check', 'Validate submission documents against regulatory requirements (FDA, EMA, PMDA)', 'custom', 'validation', 'function_call', 'gpt-4', true),
('ich_compliance_check', 'ich-compliance-check', 'ICH Compliance Check', 'Validate documents against ICH guidelines (E6, E3, Q-series, etc.)', 'custom', 'validation', 'function_call', 'gpt-4', true),
('quality_review', 'quality-review', 'Quality Review', 'Perform quality review of technical documents for completeness and accuracy', 'custom', 'validation', 'function_call', 'gpt-4', true);

ON CONFLICT (skill_name) DO NOTHING;

-- ============================================================================
-- PART 2: SEED CAPABILITIES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 Regulatory Capabilities
-- ----------------------------------------------------------------------------
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, required_model) VALUES
('regulatory_orchestration', 'regulatory-orchestration', 'Regulatory Strategy Orchestration', 'High-level orchestration of regulatory strategies across multiple jurisdictions (FDA, EMA, PMDA, etc.)', 'regulatory', 'expert', 'gpt-4'),
('fda_510k_submission', 'fda-510k-submission', 'FDA 510(k) Submission', 'Expertise in FDA 510(k) premarket notification pathway including predicate selection, substantial equivalence, and submission preparation', 'regulatory', 'advanced', 'gpt-4'),
('fda_pma_submission', 'fda-pma-submission', 'FDA PMA Submission', 'Expertise in FDA Premarket Approval (PMA) pathway for Class III devices', 'regulatory', 'expert', 'gpt-4'),
('fda_de_novo_submission', 'fda-de-novo-submission', 'FDA De Novo Submission', 'Expertise in FDA De Novo classification pathway for novel low-moderate risk devices', 'regulatory', 'advanced', 'gpt-4'),
('ema_mdr_compliance', 'ema-mdr-compliance', 'EMA MDR Compliance', 'Expertise in European Medical Device Regulation (MDR) compliance and CE marking', 'regulatory', 'advanced', 'gpt-4'),
('pmda_sakigake', 'pmda-sakigake', 'PMDA SAKIGAKE Designation', 'Expertise in Japan PMDA SAKIGAKE fast-track designation for innovative devices', 'regulatory', 'advanced', 'gpt-4'),
('global_regulatory_strategy', 'global-regulatory-strategy', 'Global Regulatory Strategy', 'Multi-jurisdictional regulatory strategy across FDA, EMA, PMDA, Health Canada, TGA, NMPA, ANVISA', 'regulatory', 'expert', 'gpt-4');

-- ----------------------------------------------------------------------------
-- 2.2 Clinical Capabilities
-- ----------------------------------------------------------------------------
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, required_model) VALUES
('clinical_orchestration', 'clinical-orchestration', 'Clinical Development Orchestration', 'High-level orchestration of clinical development programs from Phase I through Phase IV', 'clinical', 'expert', 'gpt-4'),
('clinical_trial_design', 'clinical-trial-design', 'Clinical Trial Design', 'Design clinical trial protocols including randomization, blinding, and stratification strategies', 'clinical', 'advanced', 'gpt-4'),
('clinical_endpoint_selection', 'clinical-endpoint-selection', 'Clinical Endpoint Selection', 'Selection and justification of primary and secondary endpoints for clinical trials', 'clinical', 'expert', 'gpt-4'),
('statistical_planning', 'statistical-planning', 'Statistical Planning', 'Statistical analysis plan development including sample size, power calculations, and interim analyses', 'clinical', 'advanced', 'gpt-4'),
('adaptive_trial_design', 'adaptive-trial-design', 'Adaptive Trial Design', 'Design of adaptive clinical trials using Bayesian methods and response-adaptive randomization', 'clinical', 'expert', 'gpt-4'),
('safety_monitoring', 'safety-monitoring', 'Safety Monitoring', 'Design safety monitoring plans and DSMB charters', 'clinical', 'advanced', 'gpt-4'),
('rwe_integration', 'rwe-integration', 'Real-World Evidence Integration', 'Integration of real-world evidence into clinical development programs', 'clinical', 'advanced', 'gpt-4');

-- ----------------------------------------------------------------------------
-- 2.3 Market Access Capabilities
-- ----------------------------------------------------------------------------
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, required_model) VALUES
('market_access_orchestration', 'market-access-orchestration', 'Market Access Orchestration', 'High-level orchestration of market access strategies across global HTA bodies', 'market_access', 'expert', 'gpt-4'),
('hta_submission', 'hta-submission', 'HTA Submission', 'Health technology assessment submission preparation for NICE, HAS, IQWiG, CADTH, PBAC', 'market_access', 'advanced', 'gpt-4'),
('heor_evidence_generation', 'heor-evidence-generation', 'HEOR Evidence Generation', 'Health economics and outcomes research evidence generation including CEA, CUA, BIM', 'market_access', 'advanced', 'gpt-4'),
('pricing_strategy', 'pricing-strategy', 'Pricing Strategy', 'Global pricing strategy development and optimization', 'market_access', 'advanced', 'gpt-4'),
('payer_engagement', 'payer-engagement', 'Payer Engagement', 'Payer value proposition development and negotiation strategy', 'market_access', 'intermediate', 'gpt-4'),
('value_demonstration', 'value-demonstration', 'Value Demonstration', 'Clinical and economic value demonstration for payers and providers', 'market_access', 'advanced', 'gpt-4');

-- ----------------------------------------------------------------------------
-- 2.4 Technical/CMC Capabilities
-- ----------------------------------------------------------------------------
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, required_model) VALUES
('cmc_orchestration', 'cmc-orchestration', 'CMC Orchestration', 'High-level orchestration of Chemistry, Manufacturing, and Controls development', 'technical_cmc', 'expert', 'gpt-4'),
('process_development', 'process-development', 'Process Development', 'Manufacturing process development and optimization', 'technical_cmc', 'advanced', 'gpt-4'),
('analytical_methods', 'analytical-methods', 'Analytical Methods Development', 'Analytical method development and validation per ICH Q2', 'technical_cmc', 'advanced', 'gpt-4'),
('quality_systems', 'quality-systems', 'Quality Systems', 'Quality management system design and GMP compliance', 'technical_cmc', 'advanced', 'gpt-4'),
('tech_transfer', 'tech-transfer', 'Technology Transfer', 'Manufacturing technology transfer and scale-up', 'technical_cmc', 'intermediate', 'gpt-4');

-- ----------------------------------------------------------------------------
-- 2.5 Strategic Capabilities
-- ----------------------------------------------------------------------------
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, required_model) VALUES
('strategic_orchestration', 'strategic-orchestration', 'Strategic Planning Orchestration', 'High-level orchestration of integrated development strategies across all functions', 'strategic', 'expert', 'gpt-4'),
('portfolio_management', 'portfolio-management', 'Portfolio Management', 'Portfolio prioritization and resource allocation optimization', 'strategic', 'advanced', 'gpt-4'),
('competitive_intelligence', 'competitive-intelligence', 'Competitive Intelligence', 'Competitive landscape analysis and positioning', 'strategic', 'intermediate', 'gpt-4'),
('business_development', 'business-development', 'Business Development', 'In-licensing, partnerships, and M&A opportunity assessment', 'strategic', 'advanced', 'gpt-4'),
('lifecycle_management', 'lifecycle-management', 'Lifecycle Management', 'Post-launch lifecycle planning including line extensions and indication expansion', 'strategic', 'advanced', 'gpt-4');

-- ----------------------------------------------------------------------------
-- 2.6 Operational Capabilities
-- ----------------------------------------------------------------------------
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, required_model) VALUES
('sub_agent_spawning', 'sub-agent-spawning', 'Sub-Agent Spawning', 'Ability to dynamically spawn specialist sub-agents for complex tasks', 'operational', 'expert', 'gpt-4'),
('task_decomposition', 'task-decomposition', 'Task Decomposition', 'Break down complex tasks into actionable sub-tasks with dependencies', 'operational', 'advanced', 'gpt-4'),
('agent_coordination', 'agent-coordination', 'Agent Coordination', 'Coordinate multiple agents for complex multi-step workflows', 'operational', 'expert', 'gpt-4'),
('knowledge_synthesis', 'knowledge-synthesis', 'Knowledge Synthesis', 'Synthesize information from multiple sources into cohesive insights', 'operational', 'advanced', 'gpt-4');

ON CONFLICT (capability_name) DO NOTHING;

-- ============================================================================
-- PART 3: LINK CAPABILITIES TO SKILLS (capability_skills)
-- ============================================================================

-- Regulatory Orchestration → Skills
INSERT INTO capability_skills (capability_id, skill_id, relationship_type, importance_level, usage_context) VALUES
((SELECT id FROM capabilities WHERE capability_slug = 'regulatory-orchestration'), (SELECT id FROM skills WHERE skill_slug = 'write-todos'), 'required', 'critical', 'Decompose complex multi-jurisdictional regulatory strategies'),
((SELECT id FROM capabilities WHERE capability_slug = 'regulatory-orchestration'), (SELECT id FROM skills WHERE skill_slug = 'delegate-task'), 'required', 'critical', 'Delegate tasks to Tier 2 regulatory expert agents'),
((SELECT id FROM capabilities WHERE capability_slug = 'regulatory-orchestration'), (SELECT id FROM skills WHERE skill_slug = 'spawn-specialist'), 'required', 'high', 'Spawn jurisdiction-specific specialists'),
((SELECT id FROM capabilities WHERE capability_slug = 'regulatory-orchestration'), (SELECT id FROM skills WHERE skill_slug = 'search-agents'), 'optional', 'medium', 'Find appropriate expert agents for delegation');

-- FDA 510(k) Submission → Skills
INSERT INTO capability_skills (capability_id, skill_id, relationship_type, importance_level, usage_context) VALUES
((SELECT id FROM capabilities WHERE capability_slug = 'fda-510k-submission'), (SELECT id FROM skills WHERE skill_slug = 'fda-database-search'), 'required', 'critical', 'Search FDA 510k database for predicates and guidances'),
((SELECT id FROM capabilities WHERE capability_slug = 'fda-510k-submission'), (SELECT id FROM skills WHERE skill_slug = 'predicate-device-search'), 'required', 'high', 'Find appropriate predicate devices'),
((SELECT id FROM capabilities WHERE capability_slug = 'fda-510k-submission'), (SELECT id FROM skills WHERE skill_slug = 'generate-510k-template'), 'optional', 'medium', 'Generate submission template'),
((SELECT id FROM capabilities WHERE capability_slug = 'fda-510k-submission'), (SELECT id FROM skills WHERE skill_slug = 'regulatory-compliance-check'), 'optional', 'high', 'Validate submission completeness');

-- Clinical Trial Design → Skills
INSERT INTO capability_skills (capability_id, skill_id, relationship_type, importance_level, usage_context) VALUES
((SELECT id FROM capabilities WHERE capability_slug = 'clinical-trial-design'), (SELECT id FROM skills WHERE skill_slug = 'clinical-trial-lookup'), 'optional', 'medium', 'Research similar trials'),
((SELECT id FROM capabilities WHERE capability_slug = 'clinical-trial-design'), (SELECT id FROM skills WHERE skill_slug = 'endpoint-selection'), 'required', 'high', 'Select appropriate endpoints'),
((SELECT id FROM capabilities WHERE capability_slug = 'clinical-trial-design'), (SELECT id FROM skills WHERE skill_slug = 'sample-size-calculator'), 'required', 'high', 'Calculate required sample size'),
((SELECT id FROM capabilities WHERE capability_slug = 'clinical-trial-design'), (SELECT id FROM skills WHERE skill_slug = 'protocol-generator'), 'optional', 'medium', 'Generate protocol template');

-- HTA Submission → Skills
INSERT INTO capability_skills (capability_id, skill_id, relationship_type, importance_level, usage_context) VALUES
((SELECT id FROM capabilities WHERE capability_slug = 'hta-submission'), (SELECT id FROM skills WHERE skill_slug = 'hta-database-search'), 'required', 'high', 'Research prior HTA decisions'),
((SELECT id FROM capabilities WHERE capability_slug = 'hta-submission'), (SELECT id FROM skills WHERE skill_slug = 'generate-hta-dossier'), 'required', 'high', 'Generate submission template'),
((SELECT id FROM capabilities WHERE capability_slug = 'hta-submission'), (SELECT id FROM skills WHERE skill_slug = 'cost-effectiveness-analysis'), 'required', 'critical', 'Perform CEA'),
((SELECT id FROM capabilities WHERE capability_slug = 'hta-submission'), (SELECT id FROM skills WHERE skill_slug = 'budget-impact-model'), 'required', 'high', 'Create BIM');

-- Sub-Agent Spawning → Skills
INSERT INTO capability_skills (capability_id, skill_id, relationship_type, importance_level, usage_context) VALUES
((SELECT id FROM capabilities WHERE capability_slug = 'sub-agent-spawning'), (SELECT id FROM skills WHERE skill_slug = 'spawn-specialist'), 'required', 'critical', 'Spawn Tier 3 specialist sub-agents'),
((SELECT id FROM capabilities WHERE capability_slug = 'sub-agent-spawning'), (SELECT id FROM skills WHERE skill_slug = 'spawn-worker'), 'required', 'critical', 'Spawn Tier 4 worker agents'),
((SELECT id FROM capabilities WHERE capability_slug = 'sub-agent-spawning'), (SELECT id FROM skills WHERE skill_slug = 'search-agents'), 'optional', 'medium', 'Find appropriate agent templates');

-- Task Decomposition → Skills
INSERT INTO capability_skills (capability_id, skill_id, relationship_type, importance_level, usage_context) VALUES
((SELECT id FROM capabilities WHERE capability_slug = 'task-decomposition'), (SELECT id FROM skills WHERE skill_slug = 'write-todos'), 'required', 'critical', 'Break down complex tasks into sub-tasks');

-- Agent Coordination → Skills
INSERT INTO capability_skills (capability_id, skill_id, relationship_type, importance_level, usage_context) VALUES
((SELECT id FROM capabilities WHERE capability_slug = 'agent-coordination'), (SELECT id FROM skills WHERE skill_slug = 'delegate-task'), 'required', 'critical', 'Delegate tasks to multiple agents'),
((SELECT id FROM capabilities WHERE capability_slug = 'agent-coordination'), (SELECT id FROM skills WHERE skill_slug = 'search-agents'), 'required', 'high', 'Find appropriate agents for coordination');

ON CONFLICT (capability_id, skill_id) DO NOTHING;

COMMIT;

-- ============================================================================
-- Verification
-- ============================================================================

DO $$
DECLARE
    v_skills_count INTEGER;
    v_capabilities_count INTEGER;
    v_links_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_skills_count FROM skills;
    SELECT COUNT(*) INTO v_capabilities_count FROM capabilities;
    SELECT COUNT(*) INTO v_links_count FROM capability_skills;

    RAISE NOTICE '✅ Migration 003 completed successfully';
    RAISE NOTICE 'Seeded % skills (Anthropic official + VITAL custom)', v_skills_count;
    RAISE NOTICE 'Seeded % capabilities across all categories', v_capabilities_count;
    RAISE NOTICE 'Created % capability-skill relationships', v_links_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Skill Categories:';
    RAISE NOTICE '  - Planning & Orchestration';
    RAISE NOTICE '  - Search & Discovery';
    RAISE NOTICE '  - Regulatory (FDA, EMA, PMDA)';
    RAISE NOTICE '  - Clinical Development';
    RAISE NOTICE '  - Market Access & HEOR';
    RAISE NOTICE '  - Data Analysis';
    RAISE NOTICE '  - Document Generation';
    RAISE NOTICE '  - Validation & Quality';
    RAISE NOTICE '  - Official Anthropic Skills (Creative, Development, Enterprise)';
END $$;
