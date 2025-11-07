-- ============================================================================
-- Update All Agents with Lucide Icon Names
-- ============================================================================
-- This migration adds lucide_icon to metadata for all 358 agents
-- Frontend will use these icon names to render Lucide React icons
-- ============================================================================

-- Update agents with Lucide icon names based on category and specific roles

-- ============================================================================
-- DEEP AGENTS (Strategic Consultants) → Target Icon
-- ============================================================================
UPDATE agents
SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{lucide_icon}',
    '"target"'
)
WHERE agent_category = 'deep_agent';

-- ============================================================================
-- UNIVERSAL TASK SUBAGENTS (Data Analysts) → Specialized Icons
-- ============================================================================

-- Data Science & Analytics
UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"bar-chart-2"')
WHERE name IN ('Biostatistician', 'Clinical Data Scientist', 'Data Quality Analyst');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"trending-up"')
WHERE name IN ('Data Scientist', 'Predictive Modeling Specialist');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"line-chart"')
WHERE name IN ('Marketing Analytics Director', 'Sales Force Effectiveness Analyst');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"pie-chart"')
WHERE name IN ('Market Research Analyst', 'Customer Insights Analyst');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"bar-chart-3"')
WHERE name IN ('Data Visualization Specialist', 'Access Analytics Manager');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"dollar-sign"')
WHERE name IN ('Pricing Analyst', 'Gross To Net Analyst');

-- Medical Writing & Content
UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"file-text"')
WHERE name IN ('Medical Writer', 'Promotional Material Developer');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"edit-3"')
WHERE name = 'Medical Editor';

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"book-open"')
WHERE name = 'Publication Planner';

-- Technology & Engineering
UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"cpu"')
WHERE name IN ('Machine Learning Engineer', 'AI/ML Model Validator');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"database"')
WHERE name IN ('Database Architect', 'ETL Developer');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"code"')
WHERE name = 'NLP Expert';

-- Health Economics & Analysis
UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"calculator"')
WHERE name IN ('Health Economics Modeler', 'HEOR Analyst');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"activity"')
WHERE name = 'Epidemiologist';

-- Default for remaining universal task subagents
UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"workflow"')
WHERE agent_category = 'universal_task_subagent'
AND metadata->>'lucide_icon' IS NULL;

-- ============================================================================
-- MULTI-EXPERT ORCHESTRATION → Users/Collaboration Icons
-- ============================================================================

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"users"')
WHERE name IN ('Panel Coordinator', 'Advisory Board Organizer', 'KOL Engagement Coordinator');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"handshake"')
WHERE name IN ('Consensus Builder', 'DSMB Liaison');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"git-merge"')
WHERE name = 'Conflict Resolver';

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"calendar"')
WHERE name IN ('Congress Planning Specialist', 'Congress Events Manager');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"link-2"')
WHERE name = 'Endpoint Committee Coordinator';

-- ============================================================================
-- SPECIALIZED KNOWLEDGE → Domain-Specific Icons
-- ============================================================================

-- Medical & Clinical Specialists
UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"activity"')
WHERE name IN ('Clinical Data Manager', 'Clinical Operations Coordinator');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"heart-pulse"')
WHERE name IN ('Cardiology Clinical Specialist', 'Cardiovascular Disease Specialist');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"brain"')
WHERE name IN ('Neurodegenerative Disease Specialist', 'Oncology Clinical Specialist');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"baby"')
WHERE name = 'Pediatric Clinical Specialist';

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"user"')
WHERE name IN ('Geriatric Clinical Specialist', 'Patient Advocacy Liaison');

-- Research & Development
UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"flask-conical"')
WHERE name IN ('Drug Discovery Specialist', 'Formulation Development Scientist');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"microscope"')
WHERE name IN ('Research Scientist', 'Translational Pharmacology Expert');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"dna"')
WHERE name IN ('Gene Therapy Expert', 'Biotech Innovation Specialist', 'Synthetic Biology Specialist', 
               'Oligonucleotide Therapy Specialist', 'Rna Editing Specialist', 'Multi Omics Integration Specialist',
               'Peptide Therapeutics Specialist', 'Recombinant Antibody Specialist', 'Proteic Car T Specialist',
               'Immune Checkpoint Inhibitor Specialist', 'Tumor Immune Engager Expert');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"syringe"')
WHERE name IN ('Rna Vaccine Specialist', 'Cell Therapy Manufacturing Expert');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"scan-eye"')
WHERE name IN ('Radiopharmaceutical Expert', 'Diagnostic Imaging Expert');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"atom"')
WHERE name IN ('Nanomedicine Expert', 'Smart Biomaterial Specialist', 'Polymer Drug Delivery Expert');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"petri-dish"')
WHERE name IN ('Organoid Platform Expert', 'Organ On Chip Specialist', 'Tissue Engineering Specialist');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"virus"')
WHERE name IN ('Oncolytic Virus Expert', 'Antiviral Drug Developer', 'Tuberculosis Drug Developer');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"pill"')
WHERE name IN ('Drug Delivery Specialist', 'Personalized Medicine Assistant', 'Medication Reconciliation Assistant');

-- Regulatory & Compliance
UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"file-check"')
WHERE name IN ('Regulatory Affairs Specialist', 'Regulatory Compliance Manager', 'Nda Bla Coordinator');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"scale"')
WHERE name IN ('Regulatory Strategy Advisor', 'Advanced Therapy Regulatory Expert', 'Breakthrough Therapy Advisor');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"shield-alert"')
WHERE name IN ('Pharmacovigilance Officer', 'Risk Management Plan Developer', 'Benefit Risk Assessor');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"shield-check"')
WHERE name IN ('Quality Assurance Specialist', 'Quality Validator Agent');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"lock"')
WHERE name IN ('Hipaa Compliance Officer', 'Data Privacy Specialist');

-- Clinical Operations
UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"clipboard-list"')
WHERE name IN ('Clinical Trial Manager', 'Clinical Project Manager', 'Study Closeout Specialist');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"clipboard-check"')
WHERE name IN ('Clinical Trial Coordinator', 'Site Selection Advisor');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"stethoscope"')
WHERE name IN ('Medical Affairs Operations Manager', 'Medical Science Liaison Coordinator');

-- Strategic & Business
UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"briefcase"')
WHERE name IN ('Brand Strategy Director', 'Pharma Business Development Manager');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"monitor"')
WHERE name IN ('Digital Strategy Director', 'Digital Health Marketing Advisor');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"search"')
WHERE name IN ('Competitive Intelligence Specialist', 'Market Research Specialist');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"globe"')
WHERE name IN ('Market Access Director', 'National Account Director', 'Payer Strategy Director', 
               'Global Pricing Lead', 'Market Access Operations Director');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"rocket"')
WHERE name = 'Product Launch Strategist';

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"megaphone"')
WHERE name IN ('Market Access Communications Lead', 'Scientific Communications Advisor');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"info"')
WHERE name = 'Medical Information Specialist';

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"user-check"')
WHERE name IN ('Patient Access Coordinator', 'Prior Authorization Manager', 'Copay Program Manager');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"heart"')
WHERE name = 'Hub Services Manager';

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"search-check"')
WHERE name = 'Post Market Surveillance Coordinator';

-- Manufacturing & Supply Chain
UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"factory"')
WHERE name IN ('Smart Manufacturing Expert', 'Production Scheduler', 'Technology Transfer Coordinator');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"package"')
WHERE name IN ('Supply Chain Risk Manager', 'Materials Management Coordinator');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"warehouse"')
WHERE name IN ('Inventory Optimization Specialist', 'Warehouse Operations Specialist');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"truck"')
WHERE name = 'Transportation Manager';

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"trending-up"')
WHERE name = 'Demand Forecaster';

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"file-signature"')
WHERE name IN ('Contract Analyst', 'Procurement Strategist');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"handshake"')
WHERE name IN ('Supplier Relationship Manager', 'Supplier Quality Manager');

-- Toxicology & Safety
UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"flask-round"')
WHERE name IN ('Genotoxicity Specialist', 'Immunotoxicology Expert', 'Protein Degradation Expert');

-- Therapeutic Specialties
UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"cross"')
WHERE name IN ('Rare Disease Program Manager', 'Orphan Drug Specialist');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"droplet"')
WHERE name = 'Microbiome Therapeutics Expert';

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"test-tube"')
WHERE name IN ('Stem Cell Therapy Expert', 'Cell Therapy Expert');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"chart-bar"')
WHERE name = 'Tumor Mutation Burden Analyst';

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"zap"')
WHERE name IN ('Senolytic Drug Developer', 'Macrocycle Therapeutics Specialist');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"gauge"')
WHERE name IN ('Pharmacokinetics Modeler', 'Protein Stability Expert');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"bot"')
WHERE name = 'Synthetic Biology Al Expert';

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"layers"')
WHERE name = 'Digital Therapeutic Advisor';

-- Default for remaining specialized knowledge agents
UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"book-open"')
WHERE agent_category = 'specialized_knowledge'
AND metadata->>'lucide_icon' IS NULL;

-- ============================================================================
-- PROCESS AUTOMATION → Settings/Workflow Icons
-- ============================================================================

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"git-branch"')
WHERE name = 'Task Router';

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"database"')
WHERE name = 'State Manager';

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"link"')
WHERE name = 'Integration Coordinator';

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"bell"')
WHERE name = 'Notification Agent';

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"check-circle"')
WHERE name = 'Approval Manager';

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"clipboard-check"')
WHERE name IN ('CAPA Coordinator', 'Change Control Manager');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"folder"')
WHERE name = 'Document Control Specialist';

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"graduation-cap"')
WHERE name = 'Training Coordinator';

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"rotate-cw"')
WHERE name IN ('Post Approval Change Manager', 'Post Marketing Commitment Coordinator', 
               'Post Marketing Surveillance Coordinator');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"map"')
WHERE name = 'Territory Design Specialist';

-- Default for remaining process automation agents
UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"settings"')
WHERE agent_category = 'process_automation'
AND metadata->>'lucide_icon' IS NULL;

-- ============================================================================
-- AUTONOMOUS PROBLEM SOLVING → Brain/Intelligence Icons
-- ============================================================================

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"target"')
WHERE name = 'Goal Planner';

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"gauge"')
WHERE name = 'Resource Optimizer';

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"lightbulb"')
WHERE name = 'Adaptive Learner';

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"alert-triangle"')
WHERE name IN ('Risk Assessor', 'Risk Management Plan Developer', 'Risk Benefit Assessment Expert');

UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"check-square"')
WHERE name = 'Solution Validator';

-- Default for remaining autonomous problem solving agents
UPDATE agents
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{lucide_icon}', '"brain"')
WHERE agent_category = 'autonomous_problem_solving'
AND metadata->>'lucide_icon' IS NULL;

-- ============================================================================
-- Verification Query
-- ============================================================================

SELECT 
    agent_category,
    metadata->>'lucide_icon' as lucide_icon,
    COUNT(*) as agent_count,
    array_agg(name ORDER BY name) FILTER (WHERE name IS NOT NULL) as sample_agents
FROM agents
GROUP BY agent_category, metadata->>'lucide_icon'
ORDER BY agent_category, agent_count DESC;

-- Show agents without icons (should be none)
SELECT name, agent_category, metadata
FROM agents
WHERE metadata->>'lucide_icon' IS NULL;

