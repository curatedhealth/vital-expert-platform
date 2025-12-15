-- ============================================================================
-- Migration 026: Seed Complete Node Library (ALL 148 Nodes)
-- ============================================================================
-- Generated from TaskLibrary.tsx
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'search_pubmed',
  'Search PubMed',
  'Search PubMed',
  'Search medical literature from PubMed database',
  'tool',
  'research',
  '🔬',
  false,
  true,
  '{"model": "gpt-4o-mini", "temperature": 0.7, "tools": ["pubmed"], "systemPrompt": "You are a medical research specialist. Search PubMed for relevant research papers."}',
  ARRAY['research', 'pubmed']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'search_clinical_trials',
  'Search Clinical Trials',
  'Search Clinical Trials',
  'Search for clinical trial data from ClinicalTrials.gov',
  'tool',
  'research',
  '🏥',
  false,
  true,
  '{"model": "gpt-4o-mini", "temperature": 0.7, "tools": ["clinical_trials"], "systemPrompt": "You are a clinical research specialist. Search ClinicalTrials.gov for trial information."}',
  ARRAY['research', 'clinical_trials']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'fda_search',
  'FDA Database Search',
  'FDA Database Search',
  'Search FDA databases for approvals and guidance',
  'tool',
  'regulatory',
  '⚖️',
  false,
  true,
  '{"model": "gpt-4o-mini", "temperature": 0.7, "tools": ["fda"], "systemPrompt": "You are a regulatory affairs specialist. Search FDA databases for official information."}',
  ARRAY['regulatory', 'fda']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'web_search',
  'Web Search',
  'Web Search',
  'Search the web for information',
  'tool',
  'research',
  '🌐',
  false,
  true,
  '{"model": "gpt-4o-mini", "temperature": 0.7, "tools": ["web_search"], "systemPrompt": "You are a research assistant. Search the web for relevant information."}',
  ARRAY['research', 'web_search']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'arxiv_search',
  'Search arXiv',
  'Search arXiv',
  'Search arXiv for academic papers',
  'tool',
  'research',
  '📚',
  false,
  true,
  '{"model": "gpt-4o-mini", "temperature": 0.7, "tools": ["arxiv"], "systemPrompt": "You are an academic research specialist. Search arXiv for relevant papers."}',
  ARRAY['research', 'arxiv']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'rag_query',
  'RAG Query',
  'RAG Query',
  'Query internal knowledge base using RAG',
  'tool',
  'data',
  '💾',
  false,
  true,
  '{"model": "gpt-4o-mini", "temperature": 0.7, "tools": ["rag"], "systemPrompt": "You are a knowledge base specialist. Query the RAG system for relevant information."}',
  ARRAY['data', 'rag']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'rag_archive',
  'RAG Archive',
  'RAG Archive',
  'Archive data to internal knowledge base using RAG',
  'tool',
  'data',
  '📦',
  false,
  true,
  '{"model": "gpt-4o-mini", "temperature": 0.7, "tools": ["rag"], "systemPrompt": "You are a knowledge base specialist. Archive research findings and data to the RAG system for future retrieval."}',
  ARRAY['data', 'rag']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'cache_lookup',
  'Cache Lookup',
  'Cache Lookup',
  'Look up cached results from previous queries',
  'tool',
  'data',
  '🔍',
  false,
  true,
  '{"model": "gpt-4o-mini", "temperature": 0.0, "tools": [], "systemPrompt": "Look up cached results from previous queries to avoid redundant computation."}',
  ARRAY['data']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'data_extraction',
  'Data Extraction',
  'Data Extraction',
  'Extract structured data from documents',
  'tool',
  'data',
  '📄',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.3, "tools": ["scraper"], "systemPrompt": "You are a data extraction specialist. Extract structured data from documents accurately."}',
  ARRAY['data', 'scraper']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'text_analysis',
  'Text Analysis',
  'Text Analysis',
  'Analyze and summarize text content',
  'tool',
  'analysis',
  '📊',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.5, "tools": [], "systemPrompt": "You are a text analysis specialist. Analyze and summarize text content effectively."}',
  ARRAY['analysis']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'if_condition',
  'If / Else',
  'If / Else',
  'Branch execution based on a boolean condition',
  'control',
  'control_flow',
  '🔀',
  false,
  true,
  '{"model": "gpt-4o-mini", "temperature": 0.0, "tools": [], "systemPrompt": "Evaluate a boolean condition and route execution to the true or false branch."}',
  ARRAY['control_flow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'switch_case',
  'Switch',
  'Switch',
  'Route execution based on a value with multiple cases',
  'control',
  'control_flow',
  '⏭️',
  false,
  true,
  '{"model": "gpt-4o-mini", "temperature": 0.0, "tools": [], "systemPrompt": "Evaluate a value and route execution based on matching case labels."}',
  ARRAY['control_flow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'loop_while',
  'Loop (While)',
  'Loop (While)',
  'Repeat tasks while a condition remains true',
  'control',
  'control_flow',
  '🔁',
  false,
  true,
  '{"model": "gpt-4o-mini", "temperature": 0.0, "tools": [], "systemPrompt": "Repeat a body of work while a boolean condition is true. Include iteration cap for safety."}',
  ARRAY['control_flow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'for_each',
  'For Each',
  'For Each',
  'Iterate over a list and run tasks per item',
  'control',
  'control_flow',
  '📦',
  false,
  true,
  '{"model": "gpt-4o-mini", "temperature": 0.0, "tools": [], "systemPrompt": "Iterate over a collection and execute the inner tasks for each element."}',
  ARRAY['control_flow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'parallel',
  'Parallel',
  'Parallel',
  'Run multiple branches concurrently and join',
  'control',
  'control_flow',
  '⧉',
  false,
  true,
  '{"model": "gpt-4o-mini", "temperature": 0.0, "tools": [], "systemPrompt": "Execute branches in parallel and join results when all complete."}',
  ARRAY['control_flow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'merge',
  'Merge',
  'Merge',
  'Join multiple incoming branches into one',
  'control',
  'control_flow',
  '🔗',
  false,
  true,
  '{"model": "gpt-4o-mini", "temperature": 0.0, "tools": [], "systemPrompt": "Merge the outputs of multiple upstream branches into a single downstream path."}',
  ARRAY['control_flow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'moderator',
  'Moderator',
  'Moderator',
  'AI moderator that facilitates panel discussion',
  'agent',
  'panel',
  '🎤',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.7, "tools": [], "systemPrompt": "You are an AI moderator facilitating a structured expert panel discussion. Manage time, pose questions, synthesize inputs, and guide consensus building."}',
  ARRAY['panel']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'expert_agent',
  'Expert',
  'Expert',
  'Domain expert task for panel participation',
  'agent',
  'panel',
  '👤',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.7, "tools": ["rag", "pubmed", "fda"], "systemPrompt": "You are a domain expert participating in a structured panel. Provide expert analysis, respond to moderator questions, and contribute to consensus building."}',
  ARRAY['panel', 'rag', 'pubmed', 'fda']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'clinical_researcher_agent',
  'Clinical Researcher',
  'Clinical Researcher',
  'Expert in clinical trials, protocols, and research methodology',
  'agent',
  'panel',
  '🔬',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.7, "tools": ["pubmed", "clinical_trials", "rag"], "systemPrompt": "You are a clinical research specialist with expertise in clinical trial design, protocol development, statistical analysis, and research methodology. Provide evidence-based insights on clinical research questions."}',
  ARRAY['panel', 'pubmed', 'clinical_trials', 'rag']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'medical_specialist_agent',
  'Medical Specialist',
  'Medical Specialist',
  'Expert in medical diagnosis, treatment protocols, and patient care',
  'agent',
  'panel',
  '🩺',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.7, "tools": ["pubmed", "rag"], "systemPrompt": "You are a medical specialist with deep expertise in clinical medicine, diagnosis, treatment protocols, and patient care. Provide medical insights based on clinical evidence and best practices."}',
  ARRAY['panel', 'pubmed', 'rag']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'regulatory_affairs_agent',
  'Regulatory Affairs Expert',
  'Regulatory Affairs Expert',
  'Expert in FDA/EMA regulations, compliance, and regulatory pathways',
  'agent',
  'panel',
  '📋',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.6, "tools": ["fda", "rag"], "systemPrompt": "You are a regulatory affairs specialist with expertise in FDA, EMA, and global regulatory requirements. Provide guidance on regulatory pathways, compliance, and submission strategies."}',
  ARRAY['panel', 'fda', 'rag']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'pharma_intelligence_agent',
  'Pharma Intelligence Expert',
  'Pharma Intelligence Expert',
  'Expert in pharmaceutical industry insights, market analysis, and drug development',
  'agent',
  'panel',
  '💊',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.7, "tools": ["pubmed", "fda", "web_search", "rag"], "systemPrompt": "You are a pharmaceutical intelligence specialist with expertise in drug development, market analysis, competitive intelligence, and industry trends. Provide strategic insights on pharma-related questions."}',
  ARRAY['panel', 'pubmed', 'fda', 'web_search', 'rag']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'quality_assurance_agent',
  'Quality Assurance Expert',
  'Quality Assurance Expert',
  'Expert in GxP compliance, quality systems, and regulatory quality requirements',
  'agent',
  'panel',
  '✅',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.5, "tools": ["fda", "rag"], "systemPrompt": "You are a quality assurance specialist with expertise in GxP compliance, quality management systems, validation, and regulatory quality requirements. Provide guidance on quality and compliance matters."}',
  ARRAY['panel', 'fda', 'rag']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'market_access_agent',
  'Market Access Expert',
  'Market Access Expert',
  'Expert in payer strategies, reimbursement, HTA, and market access',
  'agent',
  'panel',
  '💰',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.7, "tools": ["web_search", "rag"], "systemPrompt": "You are a market access specialist with expertise in payer strategies, reimbursement models, health technology assessment (HTA), and market access planning. Provide insights on market access and reimbursement."}',
  ARRAY['panel', 'web_search', 'rag']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'medical_writer_agent',
  'Medical Writer',
  'Medical Writer',
  'Expert in medical writing, regulatory documents, and scientific communication',
  'agent',
  'panel',
  '✍️',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.6, "tools": ["rag"], "systemPrompt": "You are a medical writer with expertise in regulatory documents, scientific publications, medical communications, and ICH guidelines. Provide guidance on medical writing and documentation."}',
  ARRAY['panel', 'rag']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'biostatistician_agent',
  'Biostatistician',
  'Biostatistician',
  'Expert in biostatistics, clinical trial analysis, and statistical methodology',
  'agent',
  'panel',
  '📊',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.3, "tools": ["pubmed", "rag"], "systemPrompt": "You are a biostatistician with expertise in clinical trial design, statistical analysis, data interpretation, and regulatory statistics. Provide statistical insights and methodology guidance."}',
  ARRAY['panel', 'pubmed', 'rag']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'pharmacovigilance_agent',
  'Pharmacovigilance Expert',
  'Pharmacovigilance Expert',
  'Expert in drug safety, adverse event reporting, and risk management',
  'agent',
  'panel',
  '⚠️',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.6, "tools": ["fda", "pubmed", "rag"], "systemPrompt": "You are a pharmacovigilance specialist with expertise in drug safety, adverse event reporting, risk management plans, and safety signal detection. Provide guidance on pharmacovigilance and drug safety."}',
  ARRAY['panel', 'fda', 'pubmed', 'rag']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'clinical_operations_agent',
  'Clinical Operations Expert',
  'Clinical Operations Expert',
  'Expert in clinical trial operations, site management, and study execution',
  'agent',
  'panel',
  '🏥',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.7, "tools": ["clinical_trials", "rag"], "systemPrompt": "You are a clinical operations specialist with expertise in clinical trial management, site operations, patient recruitment, and study execution. Provide insights on clinical operations and trial management."}',
  ARRAY['panel', 'clinical_trials', 'rag']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'medical_agent',
  'Medical Agent',
  'Medical Agent',
  'Medical research specialist agent for clinical trials, drug mechanisms, efficacy, safety data',
  'agent',
  'panel',
  '🏥',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.7, "tools": ["pubmed", "clinical_trials", "rag"], "systemPrompt": "You are a medical research specialist. Provide expert analysis on clinical trials, drug mechanisms, efficacy, and safety data."}',
  ARRAY['panel', 'pubmed', 'clinical_trials', 'rag']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'digital_health_agent',
  'Digital Health Agent',
  'Digital Health Agent',
  'Digital health specialist agent for health tech innovations, digital therapeutics, AI/ML',
  'agent',
  'panel',
  '💻',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.7, "tools": ["web_search", "arxiv", "rag"], "systemPrompt": "You are a digital health specialist. Provide expert analysis on health tech innovations, digital therapeutics, and AI/ML applications."}',
  ARRAY['panel', 'web_search', 'arxiv', 'rag']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'regulatory_agent',
  'Regulatory Agent',
  'Regulatory Agent',
  'Regulatory affairs specialist agent for FDA/EMA approvals, compliance, regulatory pathways',
  'agent',
  'panel',
  '⚖️',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.7, "tools": ["fda", "rag"], "systemPrompt": "You are a regulatory affairs specialist. Provide expert analysis on FDA/EMA approvals, compliance, and regulatory pathways."}',
  ARRAY['panel', 'fda', 'rag']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'aggregator_agent',
  'Aggregator Agent',
  'Aggregator Agent',
  'Aggregator agent that synthesizes findings and archives to RAG',
  'agent',
  'panel',
  '📊',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.5, "tools": ["rag_archive"], "systemPrompt": "You are an aggregator agent. Synthesize findings from multiple sources and archive them to the RAG system."}',
  ARRAY['panel', 'rag_archive']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'copywriter_agent',
  'Copywriter Agent',
  'Copywriter Agent',
  'Copywriter agent that generates professional reports and documentation',
  'agent',
  'panel',
  '✍️',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.7, "tools": [], "systemPrompt": "You are a copywriter agent. Generate professional reports, documentation, and written deliverables."}',
  ARRAY['panel']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'opening_statements',
  'Opening Statements',
  'Opening Statements',
  'Sequential opening statements from all experts (60-90s each)',
  'tool',
  'panel',
  '📢',
  false,
  true,
  '{"model": "gpt-4o-mini", "temperature": 0.0, "tools": [], "systemPrompt": "Execute sequential opening statements from all expert agents. Each expert has 60-90 seconds to present their initial perspective."}',
  ARRAY['panel']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'discussion_round',
  'Discussion Round',
  'Discussion Round',
  'Moderated discussion round with Q&A (3-4 minutes)',
  'tool',
  'panel',
  '💬',
  false,
  true,
  '{"model": "gpt-4o-mini", "temperature": 0.0, "tools": [], "systemPrompt": "Execute a moderated discussion round. Moderator poses questions, experts respond sequentially, building on each other\\"}',
  ARRAY['panel']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'consensus_calculator',
  'Consensus Calculator',
  'Consensus Calculator',
  'Calculate consensus level and identify dissent',
  'tool',
  'panel',
  '📊',
  false,
  true,
  '{"model": "gpt-4o-mini", "temperature": 0.0, "tools": [], "systemPrompt": "Calculate consensus level from expert positions. Identify majority view, minority opinions, and overall agreement percentage."}',
  ARRAY['panel']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'qna',
  'Q&A Session',
  'Q&A Session',
  'Question and answer session where moderator fields questions and experts respond',
  'tool',
  'panel',
  '❓',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.7, "tools": [], "systemPrompt": "Facilitate a Q&A session. Field questions from participants, route them to appropriate experts, and ensure comprehensive answers."}',
  ARRAY['panel']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'documentation_generator',
  'Documentation Generator',
  'Documentation Generator',
  'Generate formal panel documentation and deliverables',
  'tool',
  'panel',
  '📄',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.5, "tools": [], "systemPrompt": "Generate formal panel documentation: executive summary, consensus report, voting record, evidence appendix, and action items."}',
  ARRAY['panel']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'initialize',
  'Initialize Panel',
  'Initialize Panel',
  'Initialize panel workflow, extract tasks, and set up state',
  'control',
  'panel_workflow',
  '🚀',
  false,
  true,
  '{"model": "gpt-4o-mini", "temperature": 0.0, "tools": [], "systemPrompt": "Initialize the panel workflow by extracting tasks from the workflow configuration and setting up the initial state."}',
  ARRAY['panel_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'consensus_building',
  'Consensus Building',
  'Consensus Building',
  'Build consensus from expert positions and generate consensus statement',
  'control',
  'panel_workflow',
  '🤝',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.3, "tools": [], "systemPrompt": "Build consensus from expert positions. Calculate final consensus level, identify dissenting opinions, and generate a consensus statement."}',
  ARRAY['panel_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'consensus_assessment',
  'Consensus Assessment',
  'Consensus Assessment',
  'Assess consensus level and decide next steps (continue discussion or proceed)',
  'control',
  'panel_workflow',
  '📊',
  false,
  true,
  '{"model": "gpt-4o-mini", "temperature": 0.0, "tools": [], "systemPrompt": "Assess the current consensus level from expert positions. Determine if consensus is sufficient to proceed or if another discussion round is needed."}',
  ARRAY['panel_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'documentation',
  'Documentation Phase',
  'Documentation Phase',
  'Generate final panel documentation and report',
  'control',
  'panel_workflow',
  '📋',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.5, "tools": [], "systemPrompt": "Generate comprehensive panel documentation including executive summary, consensus report, and action items."}',
  ARRAY['panel_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'opening_round',
  'Opening Round',
  'Opening Round',
  'Initial perspectives from all experts in open panel format',
  'control',
  'panel_workflow',
  '🎯',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.7, "tools": [], "systemPrompt": "Facilitate opening round where experts provide initial, diverse perspectives on the topic."}',
  ARRAY['panel_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'free_dialogue',
  'Free Dialogue',
  'Free Dialogue',
  'Free-form collaborative discussion with idea building',
  'control',
  'panel_workflow',
  '💭',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.8, "tools": [], "systemPrompt": "Facilitate free-form dialogue where experts build on each other\\"}',
  ARRAY['panel_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'theme_clustering',
  'Theme Clustering',
  'Theme Clustering',
  'Identify themes, innovation clusters, and convergence points',
  'control',
  'panel_workflow',
  '🔍',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.5, "tools": [], "systemPrompt": "Analyze the discussion to identify key themes, innovation clusters, convergence points, and divergence points."}',
  ARRAY['panel_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'final_perspectives',
  'Final Perspectives',
  'Final Perspectives',
  'Collect final perspectives from all experts',
  'control',
  'panel_workflow',
  '🎤',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.7, "tools": [], "systemPrompt": "Collect final perspectives from all experts, considering the identified themes and clusters."}',
  ARRAY['panel_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'synthesis',
  'Synthesis',
  'Synthesis',
  'Final synthesis and report generation for open panel',
  'control',
  'panel_workflow',
  '✨',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.5, "tools": [], "systemPrompt": "Generate final synthesis report combining all perspectives, themes, and innovation clusters from the open panel discussion."}',
  ARRAY['panel_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'load_agent_profile',
  'Load Agent Profile',
  'Load Agent Profile',
  'Fetch agent profile, persona, knowledge bases, and sub-agent pool (1-2s)',
  'control',
  'mode_1_workflow',
  '👤',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.0, "tools": [], "systemPrompt": "Load agent profile from database, including persona, knowledge base IDs, and available sub-agents."}',
  ARRAY['mode_1_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'load_conversation_history',
  'Load Conversation History',
  'Load Conversation History',
  'Load conversation history (last 10 turns) and build message history (2-3s)',
  'control',
  'mode_1_workflow',
  '💬',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.0, "tools": [], "systemPrompt": "Load last 10 conversation turns from database and build LangChain message history."}',
  ARRAY['mode_1_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'rag_hybrid_search',
  'RAG Hybrid Search',
  'RAG Hybrid Search',
  'Hybrid RAG search combining semantic (Pinecone) and keyword (PostgreSQL) retrieval (3-5s)',
  'control',
  'mode_1_workflow',
  '🔍',
  false,
  true,
  '{"model": "text-embedding-3-large", "temperature": 0.0, "tools": ["pinecone_search", "postgresql_fts"], "systemPrompt": "Perform hybrid RAG search using semantic vector search and keyword full-text search, then fuse results using Reciprocal Rank Fusion (RRF)."}',
  ARRAY['mode_1_workflow', 'pinecone_search', 'postgresql_fts']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'chain_of_thought_reasoning',
  'Chain-of-Thought Reasoning',
  'Chain-of-Thought Reasoning',
  'Analyze query, determine tool needs, specialist needs, and plan response strategy (3-5s)',
  'control',
  'mode_1_workflow',
  '🧠',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.3, "tools": [], "systemPrompt": "Use chain-of-thought reasoning to analyze the query, determine what tools are needed, whether specialists should be spawned, and plan the response strategy."}',
  ARRAY['mode_1_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'spawn_specialist_agents',
  'Spawn Specialist Agents',
  'Spawn Specialist Agents',
  'Dynamically spawn Level 3 specialist sub-agents for deep analysis (2-3s)',
  'control',
  'mode_1_workflow',
  '🤖',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.0, "tools": [], "systemPrompt": "Initialize specialist sub-agents (e.g., Testing Requirements Specialist, Predicate Search Specialist) and assign them specific tasks for deep analysis."}',
  ARRAY['mode_1_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'execute_tools',
  'Execute Tools',
  'Execute Tools',
  'Execute tools like predicate_device_search, regulatory_database_query, standards_search (3-7s)',
  'control',
  'mode_1_workflow',
  '🛠️',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.0, "tools": ["predicate_device_search", "regulatory_database_query", "standards_search", "web_search", "document_analysis"], "systemPrompt": "Execute required tools in parallel when possible. Tools include FDA API searches, regulatory database queries, standards searches, web searches, and document analysis."}',
  ARRAY['mode_1_workflow', 'predicate_device_search', 'regulatory_database_query', 'standards_search', 'web_search', 'document_analysis']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'generate_streaming_response',
  'Generate Streaming Response',
  'Generate Streaming Response',
  'Synthesize comprehensive expert response with streaming, extract citations (5-10s)',
  'control',
  'mode_1_workflow',
  '✍️',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.7, "tools": [], "systemPrompt": "Generate a comprehensive, expert-level response that synthesizes all context, tool results, and specialist analyses. Stream tokens in real-time and extract source citations."}',
  ARRAY['mode_1_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'persist_conversation',
  'Persist Conversation',
  'Persist Conversation',
  'Save conversation to database, update session statistics, log analytics (1-2s)',
  'control',
  'mode_1_workflow',
  '💾',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.0, "tools": [], "systemPrompt": "Persist user and assistant messages to database, update session statistics (total messages, tokens, cost), and log analytics events."}',
  ARRAY['mode_1_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'query_analysis',
  'Query Analysis',
  'Query Analysis',
  'Analyze user query to determine intent, domains, and complexity (2-3s)',
  'control',
  'mode_2_workflow',
  '🔍',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.3, "tools": [], "systemPrompt": "Parse user query to extract intent, identify required domains, determine complexity level, and identify expertise areas needed."}',
  ARRAY['mode_2_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'automatic_expert_selection',
  'Automatic Expert Selection',
  'Automatic Expert Selection',
  'AI selects best expert(s) from pool based on query analysis (2-3s)',
  'control',
  'mode_2_workflow',
  '🤖',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.2, "tools": [], "systemPrompt": "Query expert profiles, score by relevance, select top 1-2 experts, load expert personas, and initialize expert contexts."}',
  ARRAY['mode_2_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'load_selected_agents',
  'Load Selected Agents',
  'Load Selected Agents',
  'Fetch selected expert profiles, personas, and knowledge bases (1-2s)',
  'control',
  'mode_2_workflow',
  '👤',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.0, "tools": [], "systemPrompt": "Load primary and secondary expert profiles, knowledge_base_ids, sub-agent pools, and create SystemMessages."}',
  ARRAY['mode_2_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'rag_hybrid_search_multi_expert',
  'RAG Multi-Expert Hybrid Search',
  'RAG Multi-Expert Hybrid Search',
  'Hybrid RAG search across multiple expert knowledge bases (3-5s)',
  'control',
  'mode_2_workflow',
  '🔍',
  false,
  true,
  '{"model": "text-embedding-3-large", "temperature": 0.0, "tools": ["pinecone_search", "postgresql_fts"], "systemPrompt": "Perform hybrid RAG search across selected expert knowledge bases using semantic and keyword search, then fuse results."}',
  ARRAY['mode_2_workflow', 'pinecone_search', 'postgresql_fts']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'multi_expert_reasoning',
  'Multi-Expert Reasoning',
  'Multi-Expert Reasoning',
  'Chain-of-thought analysis with multi-expert coordination (4-6s)',
  'control',
  'mode_2_workflow',
  '🧠',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.3, "tools": [], "systemPrompt": "Build reasoning prompts for each expert, analyze query from multiple perspectives, determine tool and specialist needs, check for expert switching, and plan coordinated response."}',
  ARRAY['mode_2_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'spawn_multi_expert_specialists',
  'Spawn Multi-Expert Specialists',
  'Spawn Multi-Expert Specialists',
  'Spawn Level 3 specialists across multiple experts (2-4s)',
  'control',
  'mode_2_workflow',
  '🤖',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.0, "tools": [], "systemPrompt": "Initialize specialists for primary and secondary experts, assign coordinated tasks, register spawned IDs, and set up inter-specialist communication."}',
  ARRAY['mode_2_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'execute_multi_expert_tools',
  'Execute Multi-Expert Tools',
  'Execute Multi-Expert Tools',
  'Execute tools across multiple expert domains (3-7s)',
  'control',
  'mode_2_workflow',
  '🛠️',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.0, "tools": ["predicate_device_search", "regulatory_database_query", "standards_search", "web_search", "document_analysis", "clinical_trials_search", "eu_regulatory_search"], "systemPrompt": "Execute tools for primary and secondary experts in parallel when possible, then merge tool results."}',
  ARRAY['mode_2_workflow', 'predicate_device_search', 'regulatory_database_query', 'standards_search', 'web_search', 'document_analysis', 'clinical_trials_search', 'eu_regulatory_search']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'coordinate_multi_expert_input',
  'Coordinate Multi-Expert Input',
  'Coordinate Multi-Expert Input',
  'Coordinate and merge multi-expert perspectives (2-3s)',
  'control',
  'mode_2_workflow',
  '🤝',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.3, "tools": [], "systemPrompt": "Merge insights from multiple experts, resolve conflicting perspectives, create unified response outline, determine primary responder, and prepare expert attribution."}',
  ARRAY['mode_2_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'generate_multi_expert_response',
  'Generate Multi-Expert Response',
  'Generate Multi-Expert Response',
  'Synthesize unified expert response with attribution (5-10s)',
  'control',
  'mode_2_workflow',
  '✍️',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.7, "tools": [], "systemPrompt": "Build comprehensive multi-expert prompt, generate unified response with streaming, attribute insights to experts, extract citations, and calculate metrics."}',
  ARRAY['mode_2_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'persist_multi_expert_conversation',
  'Persist Multi-Expert Conversation',
  'Persist Multi-Expert Conversation',
  'Persist conversation with expert tracking (1-2s)',
  'control',
  'mode_2_workflow',
  '💾',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.0, "tools": [], "systemPrompt": "INSERT user and assistant messages with expert attribution, UPDATE session stats, track expert usage, log analytics event, and optionally cache response."}',
  ARRAY['mode_2_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'load_autonomous_agent',
  'Load Autonomous Agent',
  'Load Autonomous Agent',
  'Fetch expert profile for autonomous execution (1-2s)',
  'control',
  'mode_3_workflow',
  '👤',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.0, "tools": [], "systemPrompt": "Query agents table, load agent profile, load knowledge_base_ids, load sub-agent pool, and initialize autonomous execution context."}',
  ARRAY['mode_3_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'load_execution_context',
  'Load Execution Context',
  'Load Execution Context',
  'Load historical autonomous executions and artifacts (2-3s)',
  'control',
  'mode_3_workflow',
  '💬',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.0, "tools": [], "systemPrompt": "Query previous autonomous tasks by this expert, load relevant artifacts, load user preferences, and calculate context statistics."}',
  ARRAY['mode_3_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'goal_analysis',
  'Goal Analysis',
  'Goal Analysis',
  'Analyze goal to understand requirements and deliverables (3-5s)',
  'control',
  'mode_3_workflow',
  '🎯',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.3, "tools": [], "systemPrompt": "Parse goal statement, identify deliverables required, determine complexity level, identify domain requirements, and assess feasibility."}',
  ARRAY['mode_3_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'goal_decomposition',
  'Goal Decomposition',
  'Goal Decomposition',
  'Decompose goal into executable sub-tasks with plan (4-6s)',
  'control',
  'mode_3_workflow',
  '📋',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.3, "tools": [], "systemPrompt": "Break goal into sub-tasks, define execution sequence, identify dependencies, estimate time per step, define approval checkpoints, and create execution plan."}',
  ARRAY['mode_3_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'rag_information_gathering',
  'RAG Information Gathering',
  'RAG Information Gathering',
  'Gather all information needed for autonomous execution (5-10s)',
  'control',
  'mode_3_workflow',
  '🔍',
  false,
  true,
  '{"model": "text-embedding-3-large", "temperature": 0.0, "tools": ["pinecone_search", "postgresql_fts", "web_search"], "systemPrompt": "Generate embedding for goal, semantic search across knowledge bases, keyword search for relevant standards, web search for latest guidance, retrieve protocol templates, and build comprehensive context window."}',
  ARRAY['mode_3_workflow', 'pinecone_search', 'postgresql_fts', 'web_search']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'initialize_execution_state',
  'Initialize Execution State',
  'Initialize Execution State',
  'Initialize multi-step execution state (1-2s)',
  'control',
  'mode_3_workflow',
  '⚙️',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.0, "tools": [], "systemPrompt": "Set current_step = 0, initialize execution state, create artifact registry, set up progress tracking, and initialize error handling."}',
  ARRAY['mode_3_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'execute_autonomous_step',
  'Execute Autonomous Step',
  'Execute Autonomous Step',
  'Execute current step of autonomous workflow (10-30s per step)',
  'control',
  'mode_3_workflow',
  '⚡',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.5, "tools": [], "systemPrompt": "Load current step from plan, execute step with tools, generate partial artifacts, update execution state, log progress, and emit status updates."}',
  ARRAY['mode_3_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'spawn_step_specialists',
  'Spawn Step Specialists',
  'Spawn Step Specialists',
  'Spawn specialists for complex step execution (2-4s)',
  'control',
  'mode_3_workflow',
  '🤖',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.0, "tools": [], "systemPrompt": "Determine specialists needed for current step, initialize Protocol Writer Specialist, Statistical Design Specialist, IRB Compliance Specialist, assign step-specific tasks, and register spawned IDs."}',
  ARRAY['mode_3_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'execute_step_tools',
  'Execute Step Tools',
  'Execute Step Tools',
  'Execute tools to complete current step (5-15s per step)',
  'control',
  'mode_3_workflow',
  '🛠️',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.0, "tools": ["clinical_trials_search", "protocol_template_generator", "statistical_calculator", "budget_estimator", "timeline_generator", "document_generator"], "systemPrompt": "Execute tools needed for current step, generate intermediate artifacts, validate outputs, and store results."}',
  ARRAY['mode_3_workflow', 'clinical_trials_search', 'protocol_template_generator', 'statistical_calculator', 'budget_estimator', 'timeline_generator', 'document_generator']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'human_approval_checkpoint',
  'Human Approval Checkpoint',
  'Human Approval Checkpoint',
  'Human-in-the-loop approval checkpoint (User-dependent)',
  'control',
  'mode_3_workflow',
  '✋',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.5, "tools": [], "systemPrompt": "Present current progress, show generated artifacts, request user approval/feedback, wait for user response, process feedback, and update execution plan if needed."}',
  ARRAY['mode_3_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'finalize_deliverables',
  'Finalize Deliverables',
  'Finalize Deliverables',
  'Compile and finalize all artifacts into deliverables (10-20s)',
  'control',
  'mode_3_workflow',
  '📦',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.5, "tools": [], "systemPrompt": "Merge all partial artifacts, format final deliverables, generate executive summary, create artifact metadata, package deliverables, and validate completeness."}',
  ARRAY['mode_3_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'qa_validation',
  'QA Validation',
  'QA Validation',
  'Quality assurance and validation of deliverables (5-10s)',
  'control',
  'mode_3_workflow',
  '✅',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.2, "tools": [], "systemPrompt": "Validate artifact completeness, check regulatory compliance, verify citations and references, run quality checks, generate QA report, and flag issues if any."}',
  ARRAY['mode_3_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'generate_final_report',
  'Generate Final Report',
  'Generate Final Report',
  'Generate comprehensive final report with artifacts (5-10s)',
  'control',
  'mode_3_workflow',
  '📄',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.7, "tools": [], "systemPrompt": "Build executive summary, list all deliverables, provide usage instructions, include next steps, add expert recommendations, and generate report with streaming."}',
  ARRAY['mode_3_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'persist_autonomous_execution',
  'Persist Autonomous Execution',
  'Persist Autonomous Execution',
  'Persist entire autonomous execution and artifacts (2-3s)',
  'control',
  'mode_3_workflow',
  '💾',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.0, "tools": [], "systemPrompt": "INSERT goal/task record, execution plan, each step execution, final response, STORE all artifacts, UPDATE session stats, and log analytics event with execution metrics."}',
  ARRAY['mode_3_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'complex_goal_analysis',
  'Complex Goal Analysis',
  'Complex Goal Analysis',
  'Deep analysis of complex multi-domain goal (4-6s)',
  'control',
  'mode_4_workflow',
  '🎯',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.2, "tools": [], "systemPrompt": "Parse complex multi-domain goal, identify all required domains, determine deliverable types, assess complexity level, identify dependencies, and estimate resource requirements."}',
  ARRAY['mode_4_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'team_assembly',
  'Team Assembly',
  'Team Assembly',
  'AI selects optimal team of 2-4 experts (3-5s)',
  'control',
  'mode_4_workflow',
  '👥',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.2, "tools": [], "systemPrompt": "Query all expert profiles, score experts by domain relevance, consider expert complementarity, select optimal team (2-4 experts), define expert roles, and establish collaboration structure."}',
  ARRAY['mode_4_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'load_all_team_agents',
  'Load All Team Agents',
  'Load All Team Agents',
  'Load all team expert profiles and contexts (2-3s)',
  'control',
  'mode_4_workflow',
  '📚',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.0, "tools": [], "systemPrompt": "Load all selected expert profiles, knowledge_base_ids for each, sub-agent pools for each, create SystemMessages for each, and initialize team coordination context."}',
  ARRAY['mode_4_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'load_collaborative_context',
  'Load Collaborative Context',
  'Load Collaborative Context',
  'Load collaborative execution context (2-3s)',
  'control',
  'mode_4_workflow',
  '💬',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.0, "tools": [], "systemPrompt": "Query previous team executions, load relevant artifacts from all domains, load user preferences, and build team collaboration history."}',
  ARRAY['mode_4_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'expert_task_decomposition',
  'Expert Task Decomposition',
  'Expert Task Decomposition',
  'Decompose goal into expert-specific tasks with dependencies (5-8s)',
  'control',
  'mode_4_workflow',
  '🗂️',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.3, "tools": [], "systemPrompt": "Break goal into expert-specific sub-goals, define deliverables per expert, identify cross-expert dependencies, create execution timeline, define integration points, and establish approval checkpoints."}',
  ARRAY['mode_4_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'collaborative_execution_plan',
  'Collaborative Execution Plan',
  'Collaborative Execution Plan',
  'Create comprehensive collaborative execution plan (3-5s)',
  'control',
  'mode_4_workflow',
  '📋',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.3, "tools": [], "systemPrompt": "Build master execution plan, define parallel execution phases, schedule sequential dependencies, allocate resources per expert, define integration milestones, and set up monitoring."}',
  ARRAY['mode_4_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'multi_expert_rag',
  'Multi-Expert RAG',
  'Multi-Expert RAG',
  'Gather information across all expert domains (8-15s)',
  'control',
  'mode_4_workflow',
  '🔍',
  false,
  true,
  '{"model": "text-embedding-3-large", "temperature": 0.0, "tools": ["pinecone_search", "postgresql_fts", "web_search"], "systemPrompt": "Generate embeddings for all sub-goals, semantic search across all expert KBs, keyword search for all domains, web search for latest guidance, retrieve templates for all deliverables, and build comprehensive multi-domain context."}',
  ARRAY['mode_4_workflow', 'pinecone_search', 'postgresql_fts', 'web_search']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'initialize_collaborative_state',
  'Initialize Collaborative State',
  'Initialize Collaborative State',
  'Initialize collaborative multi-expert execution state (1-2s)',
  'control',
  'mode_4_workflow',
  '⚙️',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.0, "tools": [], "systemPrompt": "Initialize execution state for each expert, set up artifact registries, initialize progress tracking, set up inter-expert communication, and initialize error handling."}',
  ARRAY['mode_4_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'parallel_expert_execution',
  'Parallel Expert Execution',
  'Parallel Expert Execution',
  'Execute parallel tasks across multiple experts (30-90s per phase)',
  'control',
  'mode_4_workflow',
  '⚡',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.5, "tools": [], "systemPrompt": "Identify tasks that can run in parallel, spawn expert execution threads, execute independent tasks concurrently, monitor progress across all experts, collect partial results, and emit status updates."}',
  ARRAY['mode_4_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'spawn_all_specialists',
  'Spawn All Specialists',
  'Spawn All Specialists',
  'Spawn specialists across all team experts (3-6s)',
  'control',
  'mode_4_workflow',
  '🤖',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.0, "tools": [], "systemPrompt": "Spawn specialists for each team expert (up to 4), coordinate specialist tasks, and register all spawned IDs."}',
  ARRAY['mode_4_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'multi_expert_tool_execution',
  'Multi-Expert Tool Execution',
  'Multi-Expert Tool Execution',
  'Execute tools across all expert domains (10-30s per phase)',
  'control',
  'mode_4_workflow',
  '🛠️',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.0, "tools": ["predicate_device_search", "regulatory_database_query", "clinical_trials_search", "quality_standards_search", "reimbursement_codes_search", "risk_analysis_tools", "document_generator", "budget_estimator", "timeline_generator"], "systemPrompt": "Execute tools for each expert in parallel, generate domain-specific artifacts, validate outputs per domain, and store results in artifact registry."}',
  ARRAY['mode_4_workflow', 'predicate_device_search', 'regulatory_database_query', 'clinical_trials_search', 'quality_standards_search', 'reimbursement_codes_search', 'risk_analysis_tools', 'document_generator', 'budget_estimator', 'timeline_generator']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'cross_expert_integration',
  'Cross-Expert Integration',
  'Cross-Expert Integration',
  'Integrate and harmonize multi-expert results (10-20s)',
  'control',
  'mode_4_workflow',
  '🔗',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.3, "tools": [], "systemPrompt": "Collect results from all experts, identify cross-domain dependencies, merge complementary artifacts, resolve conflicts, validate cross-domain consistency, and create integrated intermediate deliverables."}',
  ARRAY['mode_4_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'team_approval_checkpoint',
  'Team Approval Checkpoint',
  'Team Approval Checkpoint',
  'Human-in-the-loop approval for team progress (User-dependent)',
  'control',
  'mode_4_workflow',
  '✋',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.5, "tools": [], "systemPrompt": "Present integrated progress, show artifacts from all experts, highlight key decisions, request user approval/feedback, wait for user response, process feedback across all experts, and update execution plan if needed."}',
  ARRAY['mode_4_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'finalize_collaborative_deliverables',
  'Finalize Collaborative Deliverables',
  'Finalize Collaborative Deliverables',
  'Finalize and package all team deliverables (15-30s)',
  'control',
  'mode_4_workflow',
  '📦',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.5, "tools": [], "systemPrompt": "Collect all artifacts from all experts, perform final integration, format comprehensive deliverables, generate executive summary, create cross-reference index, package complete submission, and validate completeness."}',
  ARRAY['mode_4_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'comprehensive_qa',
  'Comprehensive QA',
  'Comprehensive QA',
  'Comprehensive QA across all domains (10-15s)',
  'control',
  'mode_4_workflow',
  '✅',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.2, "tools": [], "systemPrompt": "Validate all expert deliverables, check cross-domain consistency, verify regulatory compliance, validate citations and references, run comprehensive quality checks, generate QA report, and flag issues if any."}',
  ARRAY['mode_4_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'expert_team_review',
  'Expert Team Review',
  'Expert Team Review',
  'Expert team consensus validation (5-10s)',
  'control',
  'mode_4_workflow',
  '👥',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.3, "tools": [], "systemPrompt": "Each expert reviews final deliverables, identify any concerns or improvements, achieve team consensus, document expert sign-offs, and finalize recommendations."}',
  ARRAY['mode_4_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'generate_team_final_report',
  'Generate Team Final Report',
  'Generate Team Final Report',
  'Generate comprehensive multi-expert final report (10-20s)',
  'control',
  'mode_4_workflow',
  '📄',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.7, "tools": [], "systemPrompt": "Build comprehensive executive summary, list all deliverables by expert, provide usage instructions, include implementation roadmap, add expert recommendations, and generate complete report with streaming."}',
  ARRAY['mode_4_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'persist_team_execution',
  'Persist Team Execution',
  'Persist Team Execution',
  'Persist entire team execution and artifacts (3-5s)',
  'control',
  'mode_4_workflow',
  '💾',
  false,
  true,
  '{"model": "gpt-4-turbo-preview", "temperature": 0.0, "tools": [], "systemPrompt": "INSERT goal/task record, team composition, execution plan, each expert execution, integration milestones, final response, STORE all artifacts, UPDATE session stats, and log comprehensive analytics."}',
  ARRAY['mode_4_workflow']
)
ON CONFLICT (node_slug) DO NOTHING;

INSERT INTO node_library (node_slug, node_name, display_name, description, node_type, node_category, icon, is_builtin, is_public, node_config, tags)
VALUES (
  'agent_node',
  'AI Agent',
  'AI Agent',
  'Drag to add an AI agent to your workflow. Configure which agent to use after placing.',
  'agent',
  'agent',
  '🤖',
  false,
  true,
  '{"model": "gpt-4o", "temperature": 0.7, "tools": [], "systemPrompt": "You are an AI agent in a workflow. Your behavior will be determined by the agent configuration."}',
  ARRAY['agent']
)
ON CONFLICT (node_slug) DO NOTHING;


-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- SELECT node_category, COUNT(*) as count 
-- FROM node_library 
-- WHERE is_builtin = false 
-- GROUP BY node_category 
-- ORDER BY node_category;
