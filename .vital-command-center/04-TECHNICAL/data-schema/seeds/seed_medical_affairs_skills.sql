-- =====================================================================
-- SEED MEDICAL AFFAIRS SKILLS
-- Based on existing populate_skills_and_tools.sql
-- Optimized for Medical Affairs agent ecosystem
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'SEEDING MEDICAL AFFAIRS SKILLS';
    RAISE NOTICE '=================================================================';
END $$;

-- Insert skills (using ON CONFLICT to handle existing skills)
INSERT INTO public.skills (name, slug, category, complexity_level, is_core, description) VALUES
-- Scientific & Clinical Skills (Core for Medical Affairs)
('Clinical Research Knowledge', 'clinical-research-knowledge', 'Scientific & Clinical', 'advanced', true, 'Understanding of clinical trial design and execution'),
('Medical Literature Review', 'medical-literature-review', 'Scientific & Clinical', 'intermediate', true, 'Ability to review and synthesize medical literature'),
('Scientific Writing', 'scientific-writing', 'Scientific & Clinical', 'advanced', true, 'Writing scientific and medical documents'),
('Scientific Communication', 'scientific-communication', 'Scientific & Clinical', 'advanced', true, 'Presenting complex scientific information clearly'),
('Evidence Synthesis', 'evidence-synthesis', 'Scientific & Clinical', 'advanced', true, 'Synthesizing clinical and scientific evidence'),
('Clinical Data Analysis', 'clinical-data-analysis', 'Scientific & Clinical', 'advanced', true, 'Analyzing clinical trial data and outcomes'),
('Pharmacology', 'pharmacology', 'Scientific & Clinical', 'expert', true, 'Knowledge of drug mechanisms and pharmacokinetics'),
('Pharmacovigilance', 'pharmacovigilance', 'Scientific & Clinical', 'expert', true, 'Drug safety monitoring and adverse event reporting'),
('Biostatistics', 'biostatistics', 'Scientific & Clinical', 'expert', true, 'Statistical analysis in biomedical research'),
('Epidemiology', 'epidemiology', 'Scientific & Clinical', 'expert', true, 'Disease patterns and population health analysis'),
('Health Economics', 'health-economics', 'Scientific & Clinical', 'expert', true, 'HEOR and cost-effectiveness analysis'),
('Regulatory Knowledge', 'regulatory-knowledge', 'Scientific & Clinical', 'expert', true, 'Understanding of regulatory requirements'),

-- Communication Skills
('Presentation Skills', 'presentation-skills', 'Communication', 'intermediate', true, 'Delivering effective presentations'),
('Public Speaking', 'public-speaking', 'Communication', 'intermediate', false, 'Speaking to large audiences'),
('Medical Writing', 'medical-writing', 'Communication', 'advanced', true, 'Writing for medical audiences'),
('Technical Writing', 'technical-writing', 'Communication', 'intermediate', true, 'Creating technical documentation'),
('Storytelling', 'storytelling', 'Communication', 'intermediate', false, 'Narrative communication of data'),
('Cross-cultural Communication', 'cross-cultural-communication', 'Communication', 'intermediate', false, 'Communicating across cultures'),

-- Interpersonal Skills
('Relationship Building', 'relationship-building', 'Interpersonal', 'intermediate', true, 'Building and maintaining professional relationships'),
('Stakeholder Management', 'stakeholder-management', 'Interpersonal', 'advanced', true, 'Managing diverse stakeholder needs'),
('Negotiation', 'negotiation', 'Interpersonal', 'advanced', false, 'Negotiating agreements and resolutions'),
('Conflict Resolution', 'conflict-resolution', 'Interpersonal', 'intermediate', false, 'Resolving disputes and conflicts'),
('Emotional Intelligence', 'emotional-intelligence', 'Interpersonal', 'intermediate', false, 'Understanding and managing emotions'),
('Active Listening', 'active-listening', 'Interpersonal', 'basic', true, 'Effective listening and comprehension'),
('Collaboration', 'collaboration', 'Interpersonal', 'intermediate', true, 'Working effectively in teams'),
('Mentoring', 'mentoring', 'Interpersonal', 'advanced', false, 'Guiding and developing others'),

-- Leadership & Management (Critical for Level 1-2 agents)
('Strategic Thinking', 'strategic-thinking', 'Leadership & Management', 'expert', true, 'Long-term strategic planning'),
('Team Leadership', 'team-leadership', 'Leadership & Management', 'advanced', true, 'Leading and motivating teams'),
('People Management', 'people-management', 'Leadership & Management', 'advanced', true, 'Managing team performance'),
('Change Management', 'change-management', 'Leadership & Management', 'advanced', false, 'Leading organizational change'),
('Project Management', 'project-management', 'Leadership & Management', 'advanced', true, 'Managing projects and deliverables'),
('Budget Management', 'budget-management', 'Leadership & Management', 'advanced', false, 'Financial planning and management'),
('Decision Making', 'decision-making', 'Leadership & Management', 'advanced', true, 'Making effective decisions'),
('Vision Setting', 'vision-setting', 'Leadership & Management', 'expert', false, 'Defining strategic vision'),

-- Analytical Skills
('Data Analysis', 'data-analysis', 'Analytical', 'advanced', true, 'Analyzing quantitative and qualitative data'),
('Critical Thinking', 'critical-thinking', 'Analytical', 'advanced', true, 'Evaluating information objectively'),
('Problem Solving', 'problem-solving', 'Analytical', 'advanced', true, 'Identifying and solving complex problems'),
('Research Skills', 'research-skills', 'Analytical', 'advanced', true, 'Conducting systematic research'),
('Competitive Intelligence', 'competitive-intelligence', 'Analytical', 'advanced', false, 'Analyzing competitive landscape'),
('Market Analysis', 'market-analysis', 'Analytical', 'advanced', false, 'Understanding market dynamics'),

-- Digital & Technology
('CRM Systems', 'crm-systems', 'Digital & Technology', 'intermediate', true, 'Using customer relationship management systems'),
('Data Visualization', 'data-visualization', 'Digital & Technology', 'intermediate', true, 'Creating visual representations of data'),
('Microsoft Office Suite', 'microsoft-office-suite', 'Digital & Technology', 'basic', true, 'Proficiency in Word, Excel, PowerPoint'),
('Database Management', 'database-management', 'Digital & Technology', 'intermediate', false, 'Managing and querying databases'),
('Digital Collaboration Tools', 'digital-collaboration-tools', 'Digital & Technology', 'basic', true, 'Using Teams, Slack, Zoom, etc.'),
('AI Tools', 'ai-tools', 'Digital & Technology', 'intermediate', false, 'Using AI-powered tools and platforms'),
('Statistical Software', 'statistical-software', 'Digital & Technology', 'advanced', true, 'Using R, SAS, SPSS, etc.'),
('Medical Information Systems', 'medical-information-systems', 'Digital & Technology', 'intermediate', true, 'Using specialized medical databases'),

-- Business Skills
('Business Acumen', 'business-acumen', 'Business', 'advanced', true, 'Understanding business operations'),
('Financial Analysis', 'financial-analysis', 'Business', 'advanced', false, 'Analyzing financial data'),
('Sales Enablement', 'sales-enablement', 'Business', 'intermediate', false, 'Supporting sales processes'),
('Marketing Knowledge', 'marketing-knowledge', 'Business', 'intermediate', false, 'Understanding marketing principles'),
('Contract Management', 'contract-management', 'Business', 'intermediate', false, 'Managing contracts and agreements'),
('Procurement', 'procurement', 'Business', 'intermediate', false, 'Sourcing and vendor management'),

-- Compliance & Quality
('Regulatory Compliance', 'regulatory-compliance', 'Compliance & Quality', 'expert', true, 'Ensuring regulatory adherence'),
('Quality Assurance', 'quality-assurance', 'Compliance & Quality', 'advanced', true, 'Maintaining quality standards'),
('SOPs & Governance', 'sops-governance', 'Compliance & Quality', 'advanced', true, 'Following standard operating procedures'),
('Audit Readiness', 'audit-readiness', 'Compliance & Quality', 'advanced', false, 'Preparing for audits and inspections'),
('Risk Management', 'risk-management', 'Compliance & Quality', 'advanced', true, 'Identifying and mitigating risks'),

-- Specialized Pharma Skills (Medical Affairs specific)
('Product Launch', 'product-launch', 'Pharma Specialized', 'expert', false, 'Planning and executing product launches'),
('Payer Relations', 'payer-relations', 'Pharma Specialized', 'advanced', false, 'Working with payers and health plans'),
('KOL Management', 'kol-management', 'Pharma Specialized', 'advanced', true, 'Managing key opinion leader relationships'),
('Advisory Board Management', 'advisory-board-management', 'Pharma Specialized', 'advanced', true, 'Organizing and running advisory boards'),
('Congress Management', 'congress-management', 'Pharma Specialized', 'advanced', true, 'Managing medical congress activities'),
('Field Force Training', 'field-force-training', 'Pharma Specialized', 'advanced', false, 'Training field-based teams'),
('Publication Planning', 'publication-planning', 'Pharma Specialized', 'advanced', true, 'Strategic publication planning'),

-- Additional Medical Affairs Skills
('MSL Operations', 'msl-operations', 'Pharma Specialized', 'advanced', true, 'Managing medical science liaison activities'),
('Insights Generation', 'insights-generation', 'Analytical', 'advanced', true, 'Generating actionable insights from data'),
('Scientific Exchange', 'scientific-exchange', 'Communication', 'advanced', true, 'Facilitating scientific discussions with KOLs'),
('Medical Information Management', 'medical-information-management', 'Digital & Technology', 'advanced', true, 'Managing medical inquiry responses'),
('Real-World Evidence', 'real-world-evidence', 'Scientific & Clinical', 'expert', true, 'Generating and analyzing RWE studies'),
('Health Technology Assessment', 'health-technology-assessment', 'Scientific & Clinical', 'expert', false, 'Evaluating health technologies for payers'),
('Clinical Protocol Development', 'clinical-protocol-development', 'Scientific & Clinical', 'expert', true, 'Designing clinical trial protocols'),
('Medical Monitoring', 'medical-monitoring', 'Scientific & Clinical', 'expert', true, 'Monitoring patient safety in clinical trials'),
('Label Optimization', 'label-optimization', 'Regulatory', 'expert', false, 'Optimizing product labeling'),
('Therapeutic Area Expertise', 'therapeutic-area-expertise', 'Scientific & Clinical', 'expert', true, 'Deep knowledge in specific therapeutic areas')

ON CONFLICT (name) DO NOTHING;

-- Verification
DO $$ 
DECLARE 
    skill_count INTEGER;
    category_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO skill_count FROM public.skills WHERE deleted_at IS NULL;
    SELECT COUNT(DISTINCT category) INTO category_count FROM public.skills WHERE deleted_at IS NULL;
    
    RAISE NOTICE '✓ Total skills in database: %', skill_count;
    RAISE NOTICE '✓ Total categories: %', category_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Skills by category:';
END $$;

SELECT 
    category,
    COUNT(*) as skill_count,
    COUNT(CASE WHEN is_core = true THEN 1 END) as core_skills,
    COUNT(CASE WHEN complexity_level = 'expert' THEN 1 END) as expert_level,
    COUNT(CASE WHEN complexity_level = 'advanced' THEN 1 END) as advanced_level,
    COUNT(CASE WHEN complexity_level = 'intermediate' THEN 1 END) as intermediate_level,
    COUNT(CASE WHEN complexity_level = 'basic' THEN 1 END) as basic_level
FROM public.skills
WHERE deleted_at IS NULL
GROUP BY category
ORDER BY skill_count DESC;

