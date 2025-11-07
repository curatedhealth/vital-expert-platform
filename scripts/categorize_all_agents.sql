-- ============================================================================
-- AGENT CATEGORIZATION - Map all 334 agents to 6 categories
-- ============================================================================
-- Categories:
-- 1. deep_agent - High-level orchestrators managing complex reasoning
-- 2. universal_task_subagent - Execution-focused general capabilities
-- 3. multi_expert_orchestration - Coordinate multiple experts simultaneously
-- 4. specialized_knowledge - Domain-specific experts with focused knowledge
-- 5. process_automation - Workflow-focused sequential task execution
-- 6. autonomous_problem_solving - Fully autonomous goal planning agents
-- ============================================================================

BEGIN;

-- Category 1: Deep Agents (Strategic Orchestrators)
UPDATE agents SET agent_category = 'deep_agent' WHERE name IN (
    'Digital Therapeutic Advisor',
    'Digital Therapeutic Specialist',
    'Digital Health Marketing Advisor',
    'Medical Affairs Strategist',
    'Regulatory Strategy Advisor',
    'Brand Strategy Director',
    'Payer Strategy Advisor',
    'Payer Strategy Director',
    'Market Research Analyst',
    'Competitive Intelligence Specialist',
    'Evidence Generation Planner',
    'Publication Strategy Lead',
    'Product Launch Strategist',
    'Medical Excellence Director'
);

-- Category 2: Universal Task-Based Subagents (General Execution)
UPDATE agents SET agent_category = 'universal_task_subagent' WHERE name IN (
    'RAG Retrieval Agent',
    'Web Research Agent', 
    'Data Analysis Agent',
    'Document Generator Agent',
    'Quality Validator Agent',
    'Data Visualization Specialist',
    'Database Architect',
    'ETL Developer',
    'Machine Learning Engineer',
    'NLP Expert',
    'AI/ML Model Validator',
    'Clinical Data Scientist',
    'Biostatistician',
    'Statistical Programmer',
    'Data Quality Analyst',
    'Business Intelligence Analyst',
    'Real World Data Analyst',
    'Predictive Modeling Specialist',
    'Medical Writer',
    'Medical Writer Scientific',
    'Medical Writer Regulatory',
    'Medical Editor',
    'Document Control Specialist',
    'Technical Writer'
);

-- Category 3: Multi-Expert Orchestration (Panel Coordination)
UPDATE agents SET agent_category = 'multi_expert_orchestration' WHERE name IN (
    'Advisory Board Organizer',
    'Kol Engagement Coordinator',
    'Medical Science Liaison Coordinator',
    'Congress Planning Specialist',
    'Congress Events Manager',
    'Medical Review Committee Coordinator',
    'DSMB Liaison',
    'Ethics Committee Liaison',
    'Endpoint Committee Coordinator',
    'Panel Coordinator',
    'Consensus Builder',
    'Conflict Resolver'
);

-- Category 4: Specialized Knowledge Domains (Domain Experts)
-- Regulatory Domain
UPDATE agents SET agent_category = 'specialized_knowledge' WHERE name LIKE '%Regulatory%'
   OR name LIKE '%FDA%'
   OR name LIKE '%Compliance%'
   OR name LIKE '%Submission%';

-- Clinical Domain  
UPDATE agents SET agent_category = 'specialized_knowledge' WHERE name LIKE '%Clinical%'
   OR name LIKE '%Trial%'
   OR name LIKE '%Patient%'
   OR name IN (
       'Adaptive Trial Designer',
       'Biomarker Validation Expert',
       'Clinical Pharmacologist',
       'Medical Monitor',
       'Pharmacovigilance Specialist'
   );

-- Medical Affairs Domain
UPDATE agents SET agent_category = 'specialized_knowledge' WHERE name LIKE '%Medical Affairs%'
   OR name LIKE '%Medical Science Liaison%'
   OR name LIKE '%Medical Information%'
   OR name LIKE '%Medical Education%';

-- Market Access Domain
UPDATE agents SET agent_category = 'specialized_knowledge' WHERE name LIKE '%HEOR%'
   OR name LIKE '%Market Access%'
   OR name LIKE '%Reimbursement%'
   OR name LIKE '%Payer%'
   OR name LIKE '%Pricing%'
   OR name LIKE '%Formulary%'
   OR name IN (
       'Health Economics Specialist',
       'Health Economics Modeler',
       'Health Economics Manager',
       'Outcomes Research Manager',
       'Outcomes Research Specialist',
       'Real World Evidence Specialist',
       'Evidence Synthesis Specialist'
   );

-- Manufacturing & Quality Domain
UPDATE agents SET agent_category = 'specialized_knowledge' WHERE name LIKE '%Manufacturing%'
   OR name LIKE '%Quality%'
   OR name LIKE '%GMP%'
   OR name LIKE '%Validation%'
   OR name LIKE '%CMC%'
   OR name IN (
       'Batch Record Reviewer',
       'Process Development Engineer',
       'Equipment Qualification Specialist',
       'Cleaning Validation Specialist',
       'Change Control Manager'
   );

-- Safety & Pharmacovigilance Domain
UPDATE agents SET agent_category = 'specialized_knowledge' WHERE name LIKE '%Safety%'
   OR name LIKE '%Pharmacovigilance%'
   OR name LIKE '%Adverse%'
   OR name LIKE '%Signal%'
   OR name LIKE '%PSUR%';

-- Specialized Therapy Areas
UPDATE agents SET agent_category = 'specialized_knowledge' WHERE name LIKE '%Gene Therapy%'
   OR name LIKE '%Cell Therapy%'
   OR name LIKE '%Oncology%'
   OR name LIKE '%Pediatric%'
   OR name LIKE '%Geriatric%'
   OR name LIKE '%Rare Disease%'
   OR name LIKE '%Orphan Drug%'
   OR name LIKE '%Vaccine%'
   OR name IN (
       'Biomarker Strategy Advisor',
       'Companion Diagnostic Developer',
       'Personalized Medicine Specialist',
       'Pharmacogenomics Expert'
   );

-- Category 5: Process Automation (Workflow Management)
UPDATE agents SET agent_category = 'process_automation' WHERE name IN (
    'Task Router',
    'State Manager',
    'Integration Coordinator',
    'Approval Manager',
    'Notification Agent',
    'Workflow Orchestrator',
    'Clinical Operations Coordinator',
    'Contract Analyst',
    'Contracting Strategy Lead',
    'Project Manager',
    'Change Control Manager',
    'Deviation Investigator',
    'CAPA Coordinator',
    'Training Coordinator',
    'Supplier Relationship Manager',
    'Contract Manufacturing Manager',
    'Materials Management Coordinator',
    'Inventory Optimization Specialist',
    'Demand Forecaster',
    'Production Scheduler',
    'Supply Planning Analyst',
    'Transportation Manager',
    'Warehouse Operations Specialist',
    'Distribution Network Designer',
    'Cold Chain Specialist',
    'Import Export Compliance Specialist',
    'Global Trade Compliance Specialist',
    'Returns Recall Coordinator',
    'Serialization Track Trace Expert'
);

-- Category 6: Autonomous Problem-Solving (Goal Planning & Optimization)
UPDATE agents SET agent_category = 'autonomous_problem_solving' WHERE name IN (
    'Goal Planner',
    'Resource Optimizer',
    'Adaptive Learner',
    'Risk Assessor',
    'Solution Validator',
    'Risk Management Plan Developer',
    'Risk Benefit Assessment Expert',
    'Benefit Risk Assessor',
    'Risk Assessment Specialist',
    'Supply Chain Risk Manager',
    'Territory Design Specialist',
    'Market Research Analyst',
    'Competitive Intelligence Specialist',
    'Sales Force Effectiveness Analyst',
    'Customer Insights Analyst'
);

-- Catch remaining agents as specialized knowledge (most domain experts)
UPDATE agents SET agent_category = 'specialized_knowledge' 
WHERE agent_category IS NULL;

COMMIT;

-- Verify categorization
SELECT 
    agent_category,
    COUNT(*) as agent_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM agents), 1) as percentage
FROM agents
GROUP BY agent_category
ORDER BY agent_count DESC;

