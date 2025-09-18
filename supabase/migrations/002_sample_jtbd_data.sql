-- Sample JTBD Library Data
-- Populating with realistic Medical Affairs and Commercial JTBDs

-- Insert core JTBDs
INSERT INTO jtbd_library (
  id, title, verb, goal, function, category, description, business_value,
  complexity, time_to_value, implementation_cost, workshop_potential, maturity_level,
  tags, keywords, is_active, usage_count, success_rate, avg_execution_time
) VALUES
-- Medical Affairs JTBDs
(
  'MA001',
  'Identify Emerging Scientific Trends',
  'Identify',
  'emerging scientific trends and research opportunities in therapeutic areas',
  'Medical Affairs',
  'Scientific Intelligence',
  'Continuously monitor and analyze scientific literature, conference proceedings, clinical trial data, and real-world evidence to identify emerging trends, unmet medical needs, and potential therapeutic opportunities. This process involves aggregating data from multiple sources, applying NLP to extract key insights, and using predictive analytics to forecast future research directions.',
  'Enables proactive strategic planning, early identification of competitive threats, and discovery of new research opportunities that could lead to breakthrough therapies.',
  'Medium',
  '3-6 months',
  '$$',
  'High',
  'Production Ready',
  ARRAY['literature-review', 'trend-analysis', 'competitive-intelligence', 'scientific-monitoring'],
  ARRAY['pubmed', 'literature', 'trends', 'scientific', 'research', 'monitoring', 'nlp', 'analysis'],
  true,
  45,
  87.5,
  25
),
(
  'MA002',
  'Accelerate Real-World Evidence Generation',
  'Accelerate',
  'real-world evidence generation from diverse data sources',
  'Medical Affairs',
  'RWE & Analytics',
  'Transform raw real-world data from electronic health records, claims databases, patient registries, and wearables into regulatory-grade evidence. This involves data standardization, quality assessment, statistical analysis, and generation of evidence reports that meet regulatory requirements for submissions.',
  'Reduces time and cost for evidence generation by 60%, improves regulatory submission quality, and enables faster market access through robust RWE packages.',
  'High',
  '6-12 months',
  '$$$',
  'High',
  'Beta',
  ARRAY['real-world-evidence', 'data-analytics', 'regulatory-submission', 'health-outcomes'],
  ARRAY['rwe', 'ehr', 'claims', 'registry', 'outcomes', 'regulatory', 'evidence', 'heor'],
  true,
  23,
  92.3,
  120
),
(
  'MA003',
  'Optimize KOL Engagement Strategy',
  'Optimize',
  'key opinion leader identification and engagement strategies',
  'Medical Affairs',
  'KOL Management',
  'Build comprehensive profiles of Key Opinion Leaders using publication data, clinical trial involvement, social media presence, and conference participation. Generate personalized engagement strategies based on individual KOL interests, influence networks, and collaboration patterns.',
  'Increases engagement effectiveness by 40%, reduces time spent on KOL research by 70%, and improves scientific collaboration outcomes.',
  'Medium',
  '1-3 months',
  '$',
  'Medium',
  'Production Ready',
  ARRAY['kol-management', 'stakeholder-engagement', 'scientific-collaboration', 'influence-mapping'],
  ARRAY['kol', 'opinion-leaders', 'engagement', 'influence', 'scientific', 'collaboration', 'mapping'],
  true,
  67,
  85.2,
  15
),
(
  'MA004',
  'Generate Regulatory-Compliant Medical Information',
  'Generate',
  'accurate and compliant medical information responses',
  'Medical Affairs',
  'Medical Information',
  'Automate the creation of medical information responses, ensuring accuracy, consistency, and compliance with regulatory requirements. System searches approved sources, extracts relevant information, generates draft responses, and maintains audit trails for all medical information activities.',
  'Reduces response time by 80%, ensures 100% compliance with regulatory requirements, and improves response quality and consistency.',
  'Low',
  '1-3 months',
  '$',
  'Medium',
  'Production Ready',
  ARRAY['medical-information', 'compliance', 'automation', 'regulatory-response'],
  ARRAY['medical-info', 'compliance', 'regulatory', 'response', 'automation', 'accuracy'],
  true,
  156,
  94.7,
  8
),

-- Commercial JTBDs
(
  'COM001',
  'Personalize HCP Engagement Across Channels',
  'Personalize',
  'healthcare professional engagement across all touchpoints',
  'Commercial',
  'Omnichannel Marketing',
  'Create individualized engagement strategies for healthcare professionals based on their preferences, prescribing patterns, patient populations, and interaction history. Orchestrate consistent, relevant communications across email, web, mobile, and field force channels.',
  'Increases HCP engagement rates by 35%, improves message relevance scores by 50%, and drives 25% higher prescription intent.',
  'Medium',
  '3-6 months',
  '$$',
  'High',
  'Pilot',
  ARRAY['hcp-engagement', 'personalization', 'omnichannel', 'customer-experience'],
  ARRAY['hcp', 'personalization', 'omnichannel', 'engagement', 'marketing', 'customer'],
  true,
  34,
  78.9,
  45
),
(
  'COM002',
  'Optimize Product Launch Strategies',
  'Optimize',
  'product launch plans using predictive analytics',
  'Commercial',
  'Launch Excellence',
  'Develop data-driven launch strategies using market analysis, competitive intelligence, and predictive modeling. Generate launch plans including positioning, messaging, channel mix, and resource allocation while continuously monitoring market response.',
  'Improves launch success rate by 40%, reduces time-to-peak sales by 30%, and optimizes resource allocation for maximum ROI.',
  'High',
  '6-12 months',
  '$$$',
  'High',
  'Concept',
  ARRAY['product-launch', 'market-analysis', 'competitive-intelligence', 'strategic-planning'],
  ARRAY['launch', 'strategy', 'market', 'competitive', 'planning', 'optimization', 'analytics'],
  true,
  12,
  83.3,
  180
),
(
  'COM003',
  'Enhance Sales Forecasting Accuracy',
  'Enhance',
  'sales forecasting with advanced analytics',
  'Commercial',
  'Sales Analytics',
  'Build sophisticated forecasting models that combine historical sales data, market trends, promotional activities, and external factors to predict future sales with high accuracy. Identify early warning signals and recommend corrective actions.',
  'Improves forecast accuracy by 25%, reduces inventory costs by 15%, and enables proactive sales strategy adjustments.',
  'Medium',
  '3-6 months',
  '$$',
  'Medium',
  'Beta',
  ARRAY['sales-forecasting', 'predictive-analytics', 'demand-planning', 'business-intelligence'],
  ARRAY['sales', 'forecasting', 'analytics', 'prediction', 'demand', 'planning', 'accuracy'],
  true,
  28,
  89.1,
  60
),

-- Market Access JTBDs
(
  'MAP001',
  'Streamline HTA Dossier Development',
  'Streamline',
  'health technology assessment submission processes',
  'Market Access',
  'HTA & Reimbursement',
  'Automate the creation of Health Technology Assessment submissions by extracting relevant data from clinical trials, real-world evidence, and economic models. Generate country-specific dossiers that meet local HTA requirements.',
  'Reduces dossier preparation time by 50%, improves submission quality scores by 30%, and accelerates reimbursement timelines.',
  'High',
  '6-12 months',
  '$$$',
  'High',
  'Concept',
  ARRAY['hta', 'reimbursement', 'health-economics', 'market-access'],
  ARRAY['hta', 'dossier', 'reimbursement', 'health-economics', 'market-access', 'submission'],
  true,
  8,
  75.0,
  240
),
(
  'MAP002',
  'Design Value-Based Contracts',
  'Design',
  'innovative value-based pricing and contract models',
  'Market Access',
  'Value-Based Care',
  'Create innovative pricing and reimbursement models that align payment with patient outcomes. Use predictive modeling to simulate contract scenarios, assess financial risk, and optimize terms for both payers and manufacturers.',
  'Enables innovative reimbursement models, reduces financial risk by 40%, and improves payer relationships through shared value creation.',
  'High',
  '>24 mo',
  '$$$',
  'High',
  'Research',
  ARRAY['value-based-care', 'outcomes-contracts', 'risk-sharing', 'health-economics'],
  ARRAY['value-based', 'contracts', 'outcomes', 'risk', 'payer', 'reimbursement', 'modeling'],
  true,
  3,
  66.7,
  360
),

-- HR JTBDs
(
  'HR001',
  'Enhance Talent Acquisition Efficiency',
  'Enhance',
  'recruitment processes with AI-powered screening',
  'HR',
  'Talent Management',
  'Streamline recruitment by automating candidate sourcing, screening, and matching. Use AI to identify best-fit candidates, reduce bias, and accelerate time-to-hire while improving quality of hire metrics.',
  'Reduces time-to-hire by 45%, improves quality of hire scores by 30%, and reduces recruitment costs by 35%.',
  'Low',
  '1-3 months',
  '$',
  'Low',
  'Production Ready',
  ARRAY['recruitment', 'talent-acquisition', 'ai-screening', 'hr-automation'],
  ARRAY['recruitment', 'hiring', 'talent', 'screening', 'candidates', 'automation', 'ai'],
  true,
  89,
  91.2,
  20
);

-- Insert pain points for each JTBD
INSERT INTO jtbd_pain_points (jtbd_id, pain_point, impact_score, frequency, solution_approach, current_time_spent, manual_effort_level) VALUES
-- MA001 Pain Points
('MA001', 'Manual literature review takes weeks to complete and often misses relevant studies', 9, 'Weekly', 'Automated literature search with AI-powered relevance scoring', 240, 'High'),
('MA001', 'Difficulty tracking emerging trends across multiple therapeutic areas simultaneously', 8, 'Monthly', 'Cross-therapeutic area trend analysis with pattern recognition', 180, 'High'),
('MA001', 'Inconsistent monitoring of competitor research activities', 7, 'Daily', 'Automated competitor intelligence gathering and analysis', 60, 'Medium'),
('MA001', 'Late identification of breakthrough research that could impact strategy', 9, 'Quarterly', 'Real-time research monitoring with predictive trend analysis', 120, 'Medium'),

-- MA002 Pain Points
('MA002', 'Data integration from multiple RWE sources is complex and time-consuming', 10, 'Monthly', 'Automated data harmonization and standardization pipelines', 480, 'High'),
('MA002', 'Regulatory requirements for RWE vary by region and are constantly changing', 9, 'Quarterly', 'Dynamic regulatory compliance checking and guidance', 360, 'High'),
('MA002', 'Statistical analysis requires specialized expertise and custom coding', 8, 'Monthly', 'Automated statistical analysis with regulatory-compliant reporting', 240, 'High'),

-- MA003 Pain Points
('MA003', 'KOL identification relies on subjective assessments and limited data sources', 8, 'Monthly', 'Multi-source data integration with objective influence scoring', 120, 'Medium'),
('MA003', 'Engagement strategies are generic and not personalized to individual KOLs', 7, 'Weekly', 'AI-powered personalization based on individual profiles and preferences', 45, 'Medium'),
('MA003', 'Tracking engagement effectiveness and ROI is difficult', 6, 'Quarterly', 'Comprehensive engagement analytics and ROI measurement', 180, 'Low'),

-- COM001 Pain Points
('COM001', 'HCP preferences and communication channels are not systematically tracked', 8, 'Daily', 'Comprehensive preference capture and channel optimization', 30, 'Medium'),
('COM001', 'Message consistency across channels is difficult to maintain', 7, 'Weekly', 'Centralized content management with channel-specific adaptation', 90, 'Medium'),
('COM001', 'Limited visibility into HCP engagement across all touchpoints', 9, 'Daily', 'Unified engagement dashboard with real-time insights', 45, 'High'),

-- COM002 Pain Points
('COM002', 'Launch planning relies heavily on historical data and assumptions', 9, 'Quarterly', 'Advanced predictive modeling with real-time market intelligence', 720, 'High'),
('COM002', 'Competitive response scenarios are difficult to model accurately', 8, 'Monthly', 'AI-powered competitive intelligence and scenario planning', 480, 'High'),
('COM002', 'Resource allocation across launch activities lacks optimization', 7, 'Quarterly', 'ROI-based resource optimization with continuous adjustment', 360, 'Medium');

-- Insert AI techniques for each JTBD
INSERT INTO jtbd_ai_techniques (jtbd_id, technique, application_description, complexity_level, required_data_types) VALUES
-- MA001 AI Techniques
('MA001', 'Natural Language Processing', 'Extract key insights from scientific literature and abstracts', 'Intermediate', ARRAY['text', 'pdf', 'xml']),
('MA001', 'Topic Modeling', 'Identify emerging research themes and trending topics', 'Advanced', ARRAY['text', 'structured']),
('MA001', 'Time Series Analysis', 'Detect trend patterns and predict future research directions', 'Intermediate', ARRAY['time-series', 'structured']),
('MA001', 'Network Analysis', 'Map research collaboration networks and identify influential studies', 'Advanced', ARRAY['graph', 'relational']),

-- MA002 AI Techniques
('MA002', 'Machine Learning Classification', 'Classify and standardize diverse RWE data sources', 'Intermediate', ARRAY['structured', 'semi-structured']),
('MA002', 'Statistical Modeling', 'Generate robust evidence through advanced statistical methods', 'Advanced', ARRAY['structured', 'time-series']),
('MA002', 'Data Quality Assessment', 'Automatically assess and improve data quality scores', 'Basic', ARRAY['structured', 'metadata']),

-- MA003 AI Techniques
('MA003', 'Influence Scoring', 'Calculate objective influence scores based on multiple data sources', 'Intermediate', ARRAY['graph', 'structured', 'text']),
('MA003', 'Recommendation Systems', 'Personalize content and engagement recommendations', 'Advanced', ARRAY['behavioral', 'structured']),
('MA003', 'Sentiment Analysis', 'Analyze KOL sentiment and engagement patterns', 'Basic', ARRAY['text', 'social-media']),

-- COM001 AI Techniques
('COM001', 'Personalization Algorithms', 'Create individualized engagement strategies', 'Advanced', ARRAY['behavioral', 'structured', 'text']),
('COM001', 'Channel Optimization', 'Optimize message delivery across multiple channels', 'Intermediate', ARRAY['structured', 'behavioral']),
('COM001', 'Predictive Analytics', 'Predict HCP engagement likelihood and preferences', 'Intermediate', ARRAY['structured', 'time-series']);

-- Insert data requirements for each JTBD
INSERT INTO jtbd_data_requirements (jtbd_id, data_type, data_source, source_type, accessibility, data_format, is_required, quality_requirements, refresh_frequency, estimated_volume) VALUES
-- MA001 Data Requirements
('MA001', 'Scientific Literature', 'PubMed/MEDLINE', 'External', 'Public', 'Structured', true, 'High accuracy, complete metadata', 'Daily', '50K articles/month'),
('MA001', 'Clinical Trial Data', 'ClinicalTrials.gov', 'External', 'Public', 'Structured', true, 'Complete trial information', 'Weekly', '5K trials/month'),
('MA001', 'Conference Abstracts', 'Medical Conference APIs', 'External', 'Licensed', 'Semi-structured', false, 'Recent abstracts only', 'Event-based', '10K abstracts/year'),
('MA001', 'Patent Data', 'Patent Databases', 'External', 'Public', 'Structured', false, 'Valid patents only', 'Monthly', '2K patents/month'),

-- MA002 Data Requirements
('MA002', 'Electronic Health Records', 'Hospital Systems', 'External', 'Protected', 'Structured', true, 'HIPAA compliant, complete records', 'Real-time', '1M records/month'),
('MA002', 'Claims Data', 'Insurance Databases', 'Third-party', 'Licensed', 'Structured', true, 'Complete claims, validated codes', 'Monthly', '5M claims/month'),
('MA002', 'Patient Registries', 'Disease-Specific Registries', 'External', 'Licensed', 'Structured', false, 'Validated outcomes data', 'Quarterly', '100K patients'),

-- MA003 Data Requirements
('MA003', 'Publication History', 'Scientific Databases', 'External', 'Public', 'Structured', true, 'Complete author information', 'Monthly', '1M publications'),
('MA003', 'Social Media Activity', 'Twitter/LinkedIn APIs', 'External', 'Public', 'Unstructured', false, 'Professional posts only', 'Daily', '50K posts/day'),
('MA003', 'Conference Participation', 'Conference Databases', 'External', 'Licensed', 'Structured', false, 'Speaker and attendee data', 'Event-based', '10K participants/event');

-- Insert tools and technologies for each JTBD
INSERT INTO jtbd_tools (jtbd_id, tool_name, tool_type, tool_description, is_required, license_type, integration_status, api_endpoint, credentials_required, setup_complexity, monthly_cost_estimate) VALUES
-- MA001 Tools
('MA001', 'PubMed API', 'API', 'Access to MEDLINE/PubMed literature database', true, 'Free', 'Integrated', 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/', false, 'Low', '$0'),
('MA001', 'spaCy NLP Library', 'Library', 'Advanced natural language processing capabilities', true, 'Open Source', 'Integrated', null, false, 'Medium', '$0'),
('MA001', 'Semantic Scholar API', 'API', 'Academic paper search and citation analysis', false, 'Free', 'Available', 'https://api.semanticscholar.org/', true, 'Low', '$0'),
('MA001', 'OpenAI GPT-4', 'Service', 'Large language model for content analysis', true, 'Commercial', 'Integrated', 'https://api.openai.com/v1/', true, 'Low', '$500'),

-- MA002 Tools
('MA002', 'OMOP CDM Tools', 'Platform', 'Observational Medical Outcomes Partnership Common Data Model', true, 'Open Source', 'Planned', null, false, 'High', '$0'),
('MA002', 'R Statistical Environment', 'Platform', 'Statistical analysis and modeling environment', true, 'Open Source', 'Integrated', null, false, 'Medium', '$0'),
('MA002', 'Apache Spark', 'Platform', 'Large-scale data processing and analytics', true, 'Open Source', 'Available', null, false, 'High', '$200'),

-- MA003 Tools
('MA003', 'ORCID API', 'API', 'Researcher identification and profile data', true, 'Free', 'Available', 'https://pub.orcid.org/v3.0/', false, 'Low', '$0'),
('MA003', 'NetworkX Library', 'Library', 'Network analysis and graph algorithms', true, 'Open Source', 'Integrated', null, false, 'Low', '$0'),
('MA003', 'LinkedIn Sales Navigator API', 'API', 'Professional networking and influence data', false, 'Commercial', 'Required', 'https://api.linkedin.com/', true, 'Medium', '$800');

-- Insert persona mappings
INSERT INTO jtbd_persona_mapping (jtbd_id, persona_name, persona_role, relevance_score, typical_frequency, use_case_examples, expected_benefit, adoption_barriers) VALUES
-- MA001 Personas
('MA001', 'Medical Affairs Director', 'Strategic Leadership', 10, 'Monthly', 'Strategic planning, competitive intelligence, research prioritization', 'Faster strategic insights, proactive competitive positioning', ARRAY['Time investment for setup', 'Integration with existing workflows']),
('MA001', 'Scientific Affairs Manager', 'Tactical Execution', 9, 'Weekly', 'Literature monitoring, trend reports, scientific communications', 'Automated monitoring, comprehensive coverage', ARRAY['Learning new tools', 'Data quality concerns']),
('MA001', 'Clinical Research Scientist', 'Research Focus', 8, 'Monthly', 'Research gap identification, protocol development, investigator meetings', 'Evidence-based decision making, research optimization', ARRAY['Technical complexity', 'Integration with research tools']),

-- MA002 Personas
('MA002', 'Real-World Evidence Lead', 'RWE Specialist', 10, 'Weekly', 'RWE study design, data analysis, regulatory submissions', 'Faster evidence generation, improved quality', ARRAY['Data access permissions', 'Regulatory validation']),
('MA002', 'Health Economics Manager', 'HEOR Focus', 9, 'Monthly', 'Outcomes research, cost-effectiveness analysis, HTA submissions', 'Robust evidence packages, regulatory acceptance', ARRAY['Statistical expertise', 'Data standardization']),
('MA002', 'Biostatistician', 'Analytics Expert', 8, 'Weekly', 'Statistical analysis, model validation, evidence synthesis', 'Automated analysis, consistent methodologies', ARRAY['Model validation', 'Interpretation of results']),

-- COM001 Personas
('COM001', 'Commercial Director', 'Strategic Leadership', 9, 'Monthly', 'Channel strategy, customer experience optimization, ROI measurement', 'Improved engagement ROI, strategic insights', ARRAY['Cross-functional alignment', 'Change management']),
('COM001', 'Marketing Manager', 'Campaign Execution', 10, 'Weekly', 'Campaign personalization, content optimization, channel coordination', 'Higher engagement rates, better targeting', ARRAY['Content adaptation', 'Technology integration']),
('COM001', 'Sales Representative', 'Field Execution', 7, 'Daily', 'HCP interaction planning, conversation preparation, relationship building', 'More relevant conversations, stronger relationships', ARRAY['Tool adoption', 'Privacy concerns']);

-- Sample function to increment JTBD usage count
CREATE OR REPLACE FUNCTION increment_jtbd_usage(jtbd_id VARCHAR(20))
RETURNS void AS $$
BEGIN
    UPDATE jtbd_library
    SET usage_count = usage_count + 1
    WHERE id = jtbd_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_jtbd_usage IS 'Increment usage count for a specific JTBD';