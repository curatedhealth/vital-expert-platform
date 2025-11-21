-- Seed capability categories
INSERT INTO capability_categories (name, display_name, description, icon, color, sort_order) VALUES
('regulatory', 'Regulatory Affairs', 'FDA, EMA and global regulatory guidance capabilities', '⚖️', 'text-trust-blue', 1),
('clinical', 'Clinical Research', 'Clinical trial design and evidence generation capabilities', '🔬', 'text-progress-teal', 2),
('market-access', 'Market Access', 'Reimbursement and health economics capabilities', '💰', 'text-clinical-green', 3),
('documentation', 'Documentation', 'Medical writing and document creation capabilities', '📝', 'text-medical-gray', 4),
('analysis', 'Data Analysis', 'Research analysis and evidence synthesis capabilities', '📊', 'text-innovation-purple', 5),
('intelligence', 'Business Intelligence', 'Competitive and market intelligence capabilities', '🧠', 'text-success-emerald', 6),
('compliance', 'Quality & Compliance', 'GxP compliance and quality assurance capabilities', '🛡️', 'text-trust-blue', 7),
('digital-health', 'Digital Health', 'Digital therapeutics and AI/ML device capabilities', '📱', 'text-innovation-purple', 8);

-- Seed core capabilities
INSERT INTO capabilities (name, display_name, description, category, domain, icon, color, complexity_level, prerequisites, is_premium, requires_training) VALUES

-- Regulatory Capabilities
('fda-guidance', 'FDA Guidance Navigation', 'Navigate FDA guidance documents and regulatory pathways', 'regulatory', 'regulatory-affairs', '🇺🇸', 'text-trust-blue', 'expert', '["regulatory-fundamentals"]', true, true),
('ema-guidance', 'EMA Regulatory Guidance', 'European regulatory requirements and MDR compliance', 'regulatory', 'regulatory-affairs', '🇪🇺', 'text-trust-blue', 'expert', '["regulatory-fundamentals"]', true, true),
('regulatory-strategy', 'Regulatory Strategy Development', 'Develop comprehensive regulatory strategies and timelines', 'regulatory', 'regulatory-affairs', '📋', 'text-trust-blue', 'advanced', '["fda-guidance", "ema-guidance"]', true, true),
('regulatory-submission', 'Regulatory Submission Preparation', 'Prepare regulatory submissions and applications', 'regulatory', 'regulatory-affairs', '📤', 'text-trust-blue', 'expert', '["regulatory-strategy"]', true, true),
('global-harmonization', 'Global Regulatory Harmonization', 'Multi-region regulatory strategy coordination', 'regulatory', 'regulatory-affairs', '🌍', 'text-trust-blue', 'expert', '["fda-guidance", "ema-guidance"]', true, true),

-- Clinical Research Capabilities
('protocol-design', 'Clinical Protocol Design', 'Design robust clinical trial protocols', 'clinical', 'clinical-research', '📋', 'text-progress-teal', 'advanced', '["clinical-fundamentals"]', true, true),
('endpoints-selection', 'Clinical Endpoints Selection', 'Select appropriate primary and secondary endpoints', 'clinical', 'clinical-research', '🎯', 'text-progress-teal', 'expert', '["protocol-design"]', true, true),
('biostatistics', 'Biostatistical Analysis', 'Statistical analysis plan development and execution', 'clinical', 'clinical-research', '📈', 'text-progress-teal', 'expert', '["protocol-design"]', true, true),
('rwe-analysis', 'Real-World Evidence Analysis', 'Analyze real-world data for evidence generation', 'clinical', 'clinical-research', '🌐', 'text-progress-teal', 'advanced', '["biostatistics"]', true, true),
('digital-biomarkers', 'Digital Biomarker Validation', 'Validate digital endpoints and biomarkers', 'clinical', 'digital-health', '📊', 'text-innovation-purple', 'expert', '["endpoints-selection", "digital-health-fundamentals"]', true, true),

-- Market Access Capabilities
('health-economics', 'Health Economics Modeling', 'Develop health economic models and analyses', 'market-access', 'market-access', '💹', 'text-clinical-green', 'advanced', '["market-access-fundamentals"]', true, true),
('payer-engagement', 'Payer Engagement Strategy', 'Develop payer value propositions and engagement plans', 'market-access', 'market-access', '🤝', 'text-clinical-green', 'advanced', '["health-economics"]', true, true),
('hta-submission', 'HTA Submission Development', 'Prepare health technology assessment submissions', 'market-access', 'market-access', '📊', 'text-clinical-green', 'expert', '["health-economics", "payer-engagement"]', true, true),
('budget-impact', 'Budget Impact Analysis', 'Conduct budget impact modeling for payers', 'market-access', 'market-access', '💰', 'text-clinical-green', 'advanced', '["health-economics"]', true, true),

-- Documentation Capabilities
('medical-writing', 'Medical Writing', 'Create regulatory-compliant clinical documents', 'documentation', 'medical-communications', '✍️', 'text-medical-gray', 'advanced', '["clinical-fundamentals"]', true, true),
('regulatory-writing', 'Regulatory Document Writing', 'Draft regulatory submissions and communications', 'documentation', 'regulatory-affairs', '📄', 'text-trust-blue', 'expert', '["medical-writing", "regulatory-fundamentals"]', true, true),
('clinical-writing', 'Clinical Study Reports', 'Write comprehensive clinical study reports', 'documentation', 'clinical-research', '📋', 'text-progress-teal', 'expert', '["medical-writing", "protocol-design"]', true, true),
('publication-writing', 'Scientific Publications', 'Draft peer-reviewed scientific publications', 'documentation', 'medical-communications', '📚', 'text-medical-gray', 'expert', '["medical-writing"]', true, true),

-- Analysis Capabilities
('literature-review', 'Systematic Literature Review', 'Conduct comprehensive literature reviews', 'analysis', 'research', '📚', 'text-innovation-purple', 'intermediate', '[]', false, false),
('meta-analysis', 'Meta-Analysis', 'Perform meta-analyses of clinical data', 'analysis', 'research', '🔬', 'text-innovation-purple', 'expert', '["literature-review", "biostatistics"]', true, true),
('evidence-synthesis', 'Evidence Synthesis', 'Synthesize clinical evidence across studies', 'analysis', 'research', '🔍', 'text-innovation-purple', 'advanced', '["literature-review"]', true, false),
('competitive-analysis', 'Competitive Landscape Analysis', 'Analyze competitive products and strategies', 'analysis', 'business-intelligence', '🏆', 'text-success-emerald', 'intermediate', '[]', false, false),

-- Intelligence Capabilities
('market-intelligence', 'Market Intelligence Gathering', 'Monitor market trends and competitive intelligence', 'intelligence', 'business-intelligence', '📊', 'text-success-emerald', 'intermediate', '[]', false, false),
('kol-identification', 'KOL Identification & Mapping', 'Identify and map key opinion leaders', 'intelligence', 'stakeholder-engagement', '👥', 'text-success-emerald', 'intermediate', '[]', false, true),
('partnership-scouting', 'Partnership Opportunity Scouting', 'Identify strategic partnership opportunities', 'intelligence', 'business-development', '🤝', 'text-success-emerald', 'advanced', '["market-intelligence"]', true, false),
('regulatory-intelligence', 'Regulatory Intelligence Monitoring', 'Track regulatory changes and updates globally', 'intelligence', 'regulatory-affairs', '📡', 'text-trust-blue', 'advanced', '["regulatory-fundamentals"]', true, true),

-- Compliance Capabilities
('gxp-compliance', 'GxP Compliance Assessment', 'Assess and ensure GxP compliance requirements', 'compliance', 'quality-assurance', '✅', 'text-trust-blue', 'expert', '["compliance-fundamentals"]', true, true),
('quality-auditing', 'Quality System Auditing', 'Conduct quality system audits and assessments', 'compliance', 'quality-assurance', '🔍', 'text-trust-blue', 'expert', '["gxp-compliance"]', true, true),
('pharmacovigilance', 'Pharmacovigilance & Safety', 'Monitor adverse events and safety signals', 'compliance', 'drug-safety', '⚠️', 'text-warning-amber', 'expert', '["compliance-fundamentals"]', true, true),
('risk-assessment', 'Risk Assessment & Management', 'Conduct comprehensive risk assessments', 'compliance', 'risk-management', '⚖️', 'text-trust-blue', 'advanced', '["compliance-fundamentals"]', true, false),

-- Digital Health Capabilities
('dtx-guidance', 'Digital Therapeutics Development', 'Guide DTx development and validation processes', 'digital-health', 'digital-therapeutics', '💊', 'text-clinical-green', 'expert', '["digital-health-fundamentals", "clinical-fundamentals"]', true, true),
('ai-ml-validation', 'AI/ML Medical Device Validation', 'Validate AI/ML algorithms for medical devices', 'digital-health', 'artificial-intelligence', '🤖', 'text-innovation-purple', 'expert', '["digital-health-fundamentals", "regulatory-fundamentals"]', true, true),
('patient-engagement', 'Patient Engagement Design', 'Design patient-centric digital experiences', 'digital-health', 'user-experience', '👤', 'text-clinical-green', 'intermediate', '["digital-health-fundamentals"]', false, false),
('digital-endpoints', 'Digital Endpoints Development', 'Develop and validate digital clinical endpoints', 'digital-health', 'clinical-research', '📱', 'text-progress-teal', 'expert', '["digital-biomarkers", "endpoints-selection"]', true, true),

-- Foundational Capabilities
('regulatory-fundamentals', 'Regulatory Fundamentals', 'Basic regulatory knowledge and principles', 'regulatory', 'regulatory-affairs', '📖', 'text-medical-gray', 'basic', '[]', false, false),
('clinical-fundamentals', 'Clinical Research Fundamentals', 'Basic clinical research principles', 'clinical', 'clinical-research', '📖', 'text-medical-gray', 'basic', '[]', false, false),
('market-access-fundamentals', 'Market Access Fundamentals', 'Basic market access and health economics', 'market-access', 'market-access', '📖', 'text-medical-gray', 'basic', '[]', false, false),
('digital-health-fundamentals', 'Digital Health Fundamentals', 'Basic digital health and technology principles', 'digital-health', 'digital-health', '📖', 'text-medical-gray', 'basic', '[]', false, false),
('compliance-fundamentals', 'Compliance Fundamentals', 'Basic compliance and quality principles', 'compliance', 'quality-assurance', '📖', 'text-medical-gray', 'basic', '[]', false, false);