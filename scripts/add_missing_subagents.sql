-- ============================================================================
-- ADD MISSING SUBAGENTS - Complete Subagent Ecosystem
-- ============================================================================
-- This script adds all missing subagents from the comprehensive taxonomy
-- organized by Tier and agent_category
-- ============================================================================

BEGIN;

-- TIER 1: Universal Task-Based Subagents
INSERT INTO agents (
    name, 
    title, 
    description, 
    category, 
    agent_category,
    model,
    system_prompt,
    is_active,
    metadata
) VALUES
(
    'RAG Retrieval Agent',
    'RAG Retrieval Specialist',
    'Searches internal knowledge bases (Pinecone + Supabase) for relevant information. Efficient semantic search with context isolation.',
    'technical',
    'universal_task_subagent',
    'gpt-4o-mini',
    'You are a RAG retrieval specialist focused on efficient knowledge search. Analyze queries, search vector databases, rank by relevance, and return concise summaries under 300 words.',
    true,
    '{"tier": "1", "tools": ["pinecone_search", "supabase_search", "write_file"], "cost_level": "low"}'::jsonb
),
(
    'Web Research Agent',
    'Web Research Specialist',
    'Searches the web for latest news, updates, and real-time information. Verifies information across multiple sources.',
    'technical',
    'universal_task_subagent',
    'gpt-4o-mini',
    'You are a web research specialist focused on finding current information. Use multiple search tools, verify across sources, prioritize authoritative sources, and return synthesized summaries under 300 words.',
    true,
    '{"tier": "1", "tools": ["tavily_search", "serp_api", "web_scraper", "write_file"], "cost_level": "low"}'::jsonb
),
(
    'Document Summarizer',
    'Document Synthesis Specialist',
    'Creates executive summaries from multiple sources. Identifies themes, flags contradictions, and provides structured synthesis.',
    'technical',
    'universal_task_subagent',
    'claude-sonnet-4',
    'You are a document synthesis specialist. Read multiple sources, identify themes, flag contradictions, create structured summaries, and provide confidence assessments. Keep under 500 words.',
    true,
    '{"tier": "1", "tools": ["read_file", "write_file"], "cost_level": "medium"}'::jsonb
),
(
    'Citation Generator',
    'Citation & Attribution Specialist',
    'Generates properly formatted citations for all sources used. Creates numbered reference lists with inline citations.',
    'technical',
    'universal_task_subagent',
    'gpt-4o-mini',
    'You are a citation specialist focused on accurate source attribution. Extract metadata, format citations in required style, create numbered references, and verify URLs.',
    true,
    '{"tier": "1", "tools": ["read_file"], "cost_level": "low"}'::jsonb
),
(
    'Quality Validator Agent',
    'Quality Assurance Specialist',
    'Reviews outputs for quality, accuracy, and completeness. Validates consistency and identifies gaps before final delivery.',
    'quality_assurance',
    'universal_task_subagent',
    'claude-sonnet-4',
    'You are a quality assurance specialist. Review findings, check logical consistency, verify evidence support, assess confidence levels, and provide quality scores.',
    true,
    '{"tier": "1", "tools": ["read_file"], "cost_level": "medium"}'::jsonb
);

-- TIER 2: Domain Expert Subagents (Ask Expert Mode)
INSERT INTO agents (
    name, 
    title, 
    description, 
    category, 
    agent_category,
    model,
    system_prompt,
    is_active,
    metadata
) VALUES
(
    'FDA Database Specialist',
    'FDA Regulatory Database Expert',
    'Specialized FDA database search (510(k), PMA, recalls, guidance). Finds predicate devices and regulatory precedents.',
    'regulatory',
    'specialized_knowledge',
    'gpt-4o-mini',
    'You are an FDA regulatory database specialist. Search FDA databases, find predicates, analyze approval pathways, identify requirements, and return structured findings under 400 words.',
    true,
    '{"tier": "2", "service_mode": "ask_expert", "tools": ["fda_510k_search", "fda_pma_search", "fda_guidance_search"], "cost_level": "low"}'::jsonb
),
(
    'Pharmacovigilance Specialist',
    'Safety Reporting & Adverse Events Expert',
    'Expert in pharmacovigilance, safety reporting, and adverse event management. Monitors drug safety and risk assessment.',
    'regulatory',
    'specialized_knowledge',
    'claude-sonnet-4',
    'You are a pharmacovigilance specialist focused on safety monitoring, adverse event assessment, signal detection, and risk management plans.',
    true,
    '{"tier": "2", "service_mode": "ask_expert", "domain": "safety", "cost_level": "medium"}'::jsonb
),
(
    'Labeling Specialist',
    'Product Labeling & Requirements Expert',
    'Expert in product labeling requirements, package inserts, and regulatory labeling compliance.',
    'regulatory',
    'specialized_knowledge',
    'gpt-4o-mini',
    'You are a labeling specialist focused on FDA labeling requirements, package insert regulations, and compliant product labeling strategies.',
    true,
    '{"tier": "2", "service_mode": "ask_expert", "domain": "regulatory_labeling", "cost_level": "low"}'::jsonb
);

-- TIER 2: Multi-Expert Orchestration (Ask Panel Mode)
INSERT INTO agents (
    name, 
    title, 
    description, 
    category, 
    agent_category,
    model,
    system_prompt,
    is_active,
    metadata
) VALUES
(
    'Panel Coordinator',
    'Multi-Expert Panel Coordinator',
    'Manages multi-expert collaboration, coordinates panel discussions, and facilitates consensus building.',
    'medical_affairs',
    'multi_expert_orchestration',
    'claude-sonnet-4',
    'You are a panel coordinator managing multi-expert collaboration. Facilitate discussions, coordinate inputs, identify consensus areas, and synthesize diverse expert opinions.',
    true,
    '{"tier": "2", "service_mode": "ask_panel", "role": "orchestrator", "cost_level": "medium"}'::jsonb
),
(
    'Consensus Builder',
    'Expert Consensus & Synthesis Agent',
    'Synthesizes diverse expert opinions, identifies areas of agreement, and builds consensus across panel members.',
    'medical_affairs',
    'multi_expert_orchestration',
    'claude-sonnet-4',
    'You are a consensus builder synthesizing diverse expert opinions. Identify agreement areas, highlight disagreements, find common ground, and create unified recommendations.',
    true,
    '{"tier": "2", "service_mode": "ask_panel", "role": "synthesizer", "cost_level": "medium"}'::jsonb
),
(
    'Conflict Resolver',
    'Expert Disagreement Resolution Agent',
    'Handles disagreements between experts, facilitates resolution, and provides balanced perspectives.',
    'medical_affairs',
    'multi_expert_orchestration',
    'claude-sonnet-4',
    'You are a conflict resolver handling expert disagreements. Analyze conflicting viewpoints, identify root causes, facilitate resolution, and provide balanced syntheses.',
    true,
    '{"tier": "2", "service_mode": "ask_panel", "role": "resolver", "cost_level": "medium"}'::jsonb
);

-- TIER 2: Workflow Process Automation (Workflow Mode)
INSERT INTO agents (
    name, 
    title, 
    description, 
    category, 
    agent_category,
    model,
    system_prompt,
    is_active,
    metadata
) VALUES
(
    'Task Router',
    'Workflow Task Router',
    'Determines workflow paths and sequencing. Routes tasks to appropriate agents based on requirements.',
    'healthcare_it',
    'process_automation',
    'gpt-4o-mini',
    'You are a task routing specialist. Analyze requirements, determine optimal workflow paths, route to appropriate agents, and manage task sequencing.',
    true,
    '{"tier": "2", "service_mode": "workflow", "role": "router", "cost_level": "low"}'::jsonb
),
(
    'State Manager',
    'Workflow State Management Agent',
    'Tracks workflow progress, maintains context, and manages state transitions across process steps.',
    'healthcare_it',
    'process_automation',
    'gpt-4o-mini',
    'You are a state management specialist. Track workflow progress, maintain context across steps, manage state transitions, and ensure continuity.',
    true,
    '{"tier": "2", "service_mode": "workflow", "role": "state_tracker", "cost_level": "low"}'::jsonb
),
(
    'Integration Coordinator',
    'External System Integration Agent',
    'Manages external system connections, API integrations, and data exchange between platforms.',
    'healthcare_it',
    'process_automation',
    'gpt-4o-mini',
    'You are an integration coordinator managing external system connections. Handle API calls, manage data exchange, ensure connectivity, and coordinate integrations.',
    true,
    '{"tier": "2", "service_mode": "workflow", "role": "integrator", "cost_level": "low"}'::jsonb
),
(
    'Approval Manager',
    'Review & Approval Workflow Agent',
    'Handles review checkpoints, approval workflows, and stakeholder sign-offs in process execution.',
    'legal_compliance',
    'process_automation',
    'gpt-4o-mini',
    'You are an approval manager handling review workflows. Manage approval checkpoints, track stakeholder sign-offs, enforce approval rules, and coordinate reviews.',
    true,
    '{"tier": "2", "service_mode": "workflow", "role": "approval_handler", "cost_level": "low"}'::jsonb
),
(
    'Notification Agent',
    'Status Update & Alert Agent',
    'Sends status updates, notifications, and alerts to stakeholders throughout workflow execution.',
    'healthcare_it',
    'process_automation',
    'gpt-4o-mini',
    'You are a notification specialist managing status updates and alerts. Send timely notifications, track stakeholder communications, and manage alert escalations.',
    true,
    '{"tier": "2", "service_mode": "workflow", "role": "notifier", "cost_level": "low"}'::jsonb
);

-- TIER 2: Autonomous Problem-Solving (Solution Mode)
INSERT INTO agents (
    name, 
    title, 
    description, 
    category, 
    agent_category,
    model,
    system_prompt,
    is_active,
    metadata
) VALUES
(
    'Goal Planner',
    'Strategic Goal Planning Agent',
    'Strategic planning and objective decomposition for autonomous problem-solving. Breaks down complex goals into achievable steps.',
    'analytical',
    'autonomous_problem_solving',
    'claude-sonnet-4',
    'You are a goal planning specialist. Decompose complex objectives, create strategic plans, identify dependencies, and define success criteria.',
    true,
    '{"tier": "2", "service_mode": "solution", "role": "planner", "cost_level": "medium"}'::jsonb
),
(
    'Resource Optimizer',
    'Resource Allocation & Optimization Agent',
    'Allocates agents and resources, manages constraints, and optimizes resource utilization for efficient execution.',
    'analytical',
    'autonomous_problem_solving',
    'o4-mini',
    'You are a resource optimization specialist. Allocate resources efficiently, manage constraints, optimize utilization, and balance competing demands.',
    true,
    '{"tier": "2", "service_mode": "solution", "role": "optimizer", "cost_level": "medium"}'::jsonb
),
(
    'Adaptive Learner',
    'Adaptive Learning & Strategy Agent',
    'Learns from outcomes, adjusts strategies dynamically, and improves performance through experience.',
    'technical',
    'autonomous_problem_solving',
    'claude-sonnet-4',
    'You are an adaptive learning specialist. Analyze outcomes, identify patterns, adjust strategies, and continuously improve performance based on learnings.',
    true,
    '{"tier": "2", "service_mode": "solution", "role": "learner", "cost_level": "medium"}'::jsonb
),
(
    'Solution Validator',
    'End-to-End Solution Validation Agent',
    'Validates complete solutions end-to-end, verifies goal achievement, and ensures quality standards.',
    'quality_assurance',
    'autonomous_problem_solving',
    'claude-sonnet-4',
    'You are a solution validation specialist. Verify end-to-end solutions, validate goal achievement, assess quality, and ensure completeness.',
    true,
    '{"tier": "2", "service_mode": "solution", "role": "validator", "cost_level": "medium"}'::jsonb
);

-- TIER 3: Advanced Capability Subagents
INSERT INTO agents (
    name, 
    title, 
    description, 
    category, 
    agent_category,
    model,
    system_prompt,
    is_active,
    metadata
) VALUES
(
    'Document Generator Agent',
    'Professional Document Generation Specialist',
    'Creates professional documents including reports, protocols, regulatory submissions, and presentations.',
    'technical',
    'universal_task_subagent',
    'claude-sonnet-4',
    'You are a technical document generation specialist. Create professional, publication-ready documents following industry standards. Generate multiple formats (MD, DOCX, PDF).',
    true,
    '{"tier": "3", "tools": ["read_file", "write_file", "document_generator", "pdf_generator"], "cost_level": "medium"}'::jsonb
),
(
    'Code Interpreter',
    'Python Code Execution Specialist',
    'Executes Python code for complex calculations, data analysis, and visualizations. Handles computational tasks.',
    'technical',
    'universal_task_subagent',
    'o4-mini',
    'You are a Python code execution specialist. Write clean code for analysis, create visualizations, perform calculations, and interpret results in plain language.',
    true,
    '{"tier": "3", "tools": ["python_repl", "write_file", "read_file"], "cost_level": "medium"}'::jsonb
),
(
    'Timeline Planner',
    'Project Timeline & Planning Agent',
    'Creates project timelines, Gantt charts, milestone plans, and identifies critical paths.',
    'clinical_operations',
    'process_automation',
    'claude-sonnet-4',
    'You are a project planning specialist. Create realistic timelines, identify dependencies, build contingency buffers, and generate Gantt charts.',
    true,
    '{"tier": "3", "tools": ["timeline_generator", "gantt_chart", "write_file"], "cost_level": "medium"}'::jsonb
),
(
    'Cost Budget Analyst',
    'Financial Analysis & Budget Planning Agent',
    'Performs cost analysis, budget planning, ROI calculations, and financial modeling.',
    'market_access',
    'autonomous_problem_solving',
    'o4-mini',
    'You are a healthcare financial analysis specialist. Estimate costs, model budgets, calculate ROI, and identify cost optimization opportunities.',
    true,
    '{"tier": "3", "tools": ["calculator", "financial_modeler", "write_file"], "cost_level": "medium"}'::jsonb
);

COMMIT;

-- Verify new agents were added
SELECT 
    agent_category,
    COUNT(*) as count
FROM agents
WHERE name IN (
    'RAG Retrieval Agent',
    'Web Research Agent',
    'Document Summarizer',
    'Citation Generator',
    'Quality Validator Agent',
    'FDA Database Specialist',
    'Pharmacovigilance Specialist',
    'Labeling Specialist',
    'Panel Coordinator',
    'Consensus Builder',
    'Conflict Resolver',
    'Task Router',
    'State Manager',
    'Integration Coordinator',
    'Approval Manager',
    'Notification Agent',
    'Goal Planner',
    'Resource Optimizer',
    'Adaptive Learner',
    'Solution Validator',
    'Document Generator Agent',
    'Code Interpreter',
    'Timeline Planner',
    'Cost Budget Analyst'
)
GROUP BY agent_category
ORDER BY count DESC;

