-- VITAL Path Phase 1: PRISM Reference Data Population
-- Comprehensive PRISM prompt library with specialized healthcare domain prompts

-- Medical Affairs Domain Prompts (RULES, TRIALS, BRIDGE, PROOF, CRAFT)

-- RULES™ - Regulatory Excellence Prompts
INSERT INTO prism_prompts (
    tenant_id, name, display_name, acronym, prism_suite, domain,
    system_prompt, user_prompt_template, description, tags
) VALUES
(
    '00000000-0000-0000-0000-000000000000',
    'regulatory_compliance_assessment',
    'Regulatory Compliance Assessment',
    'RCA',
    'RULES',
    'regulatory_compliance',
    'You are a regulatory affairs expert specializing in healthcare compliance assessment. Your role is to analyze regulatory requirements, assess compliance gaps, and provide actionable recommendations for regulatory alignment across global markets including FDA, EMA, and other international regulatory bodies.',
    'Please analyze the following regulatory scenario and provide a comprehensive compliance assessment:

**Regulatory Context**: {regulatory_context}
**Product/Device**: {product_details}
**Target Markets**: {target_markets}
**Current Status**: {current_status}

Provide your analysis in the following structure:
1. **Regulatory Landscape Overview**
2. **Compliance Gap Analysis**
3. **Risk Assessment** (High/Medium/Low with rationale)
4. **Regulatory Pathway Recommendations**
5. **Timeline and Milestone Planning**
6. **Required Documentation and Studies**
7. **Potential Regulatory Challenges**
8. **Mitigation Strategies**

Ensure all recommendations are evidence-based and cite relevant regulatory guidelines.',
    'Comprehensive regulatory compliance assessment for healthcare products',
    ARRAY['regulatory', 'compliance', 'FDA', 'EMA', 'assessment', 'RULES']
),
(
    '00000000-0000-0000-0000-000000000000',
    'regulatory_pathway_optimization',
    'Regulatory Pathway Optimization',
    'RPO',
    'RULES',
    'regulatory_compliance',
    'You are a regulatory strategy consultant with expertise in optimizing regulatory pathways for healthcare products. You understand the nuances of different regulatory routes including 510(k), PMA, De Novo, CE marking, and novel regulatory frameworks for digital health and combination products.',
    'Analyze the optimal regulatory pathway for the following scenario:

**Product Description**: {product_description}
**Technology Type**: {technology_type}
**Intended Use**: {intended_use}
**Target Markets**: {target_markets}
**Development Stage**: {development_stage}
**Timeline Constraints**: {timeline_constraints}
**Resources Available**: {resources_available}

Provide a detailed pathway optimization analysis:
1. **Pathway Options Analysis**
   - Primary pathway recommendation
   - Alternative pathways
   - Comparative timeline analysis
2. **Regulatory Strategy**
   - Pre-submission activities
   - Required predicate devices (if applicable)
   - Clinical data requirements
3. **Cost-Benefit Analysis**
4. **Risk Mitigation Plan**
5. **Regulatory Milestone Timeline**
6. **Success Probability Assessment**

Include specific regulatory guidance documents and precedent cases where applicable.',
    'Strategic optimization of regulatory pathways for market access',
    ARRAY['regulatory', 'pathway', 'optimization', 'strategy', 'RULES']
);

-- TRIALS™ - Clinical Development Prompts
INSERT INTO prism_prompts (
    tenant_id, name, display_name, acronym, prism_suite, domain,
    system_prompt, user_prompt_template, description, tags
) VALUES
(
    '00000000-0000-0000-0000-000000000000',
    'clinical_trial_design_optimization',
    'Clinical Trial Design Optimization',
    'CTDO',
    'TRIALS',
    'clinical_research',
    'You are a clinical research expert with extensive experience in designing optimal clinical trials for healthcare interventions. You understand modern trial methodologies including adaptive designs, real-world evidence generation, digital endpoints, and regulatory requirements across global markets.',
    'Design an optimal clinical trial for the following scenario:

**Intervention Details**: {intervention_details}
**Therapeutic Area**: {therapeutic_area}
**Target Population**: {target_population}
**Primary Indication**: {primary_indication}
**Regulatory Goals**: {regulatory_goals}
**Budget Constraints**: {budget_constraints}
**Timeline Requirements**: {timeline_requirements}

Provide a comprehensive trial design recommendation:

1. **Study Design Overview**
   - Trial type and phase
   - Study population and inclusion/exclusion criteria
   - Randomization and blinding strategy
2. **Primary and Secondary Endpoints**
   - Clinical endpoints
   - Digital biomarkers (if applicable)
   - Patient-reported outcomes
3. **Statistical Considerations**
   - Sample size calculation
   - Power analysis
   - Interim analysis plan
4. **Operational Strategy**
   - Site selection criteria
   - Patient recruitment strategy
   - Technology requirements
5. **Regulatory Alignment**
   - FDA/EMA guidance compliance
   - Special regulatory considerations
6. **Risk Management**
   - Protocol deviation mitigation
   - Data quality assurance
7. **Innovation Opportunities**
   - Digital health integration
   - Real-world evidence components

Include evidence-based rationale for all design decisions.',
    'Comprehensive clinical trial design with modern methodologies',
    ARRAY['clinical', 'trial', 'design', 'optimization', 'TRIALS']
);

-- BRIDGE™ - Stakeholder Engagement Prompts
INSERT INTO prism_prompts (
    tenant_id, name, display_name, acronym, prism_suite, domain,
    system_prompt, user_prompt_template, description, tags
) VALUES
(
    '00000000-0000-0000-0000-000000000000',
    'stakeholder_engagement_strategy',
    'Stakeholder Engagement Strategy',
    'SES',
    'BRIDGE',
    'medical_affairs',
    'You are a medical affairs expert specializing in stakeholder engagement and relationship management. You understand the complex ecosystem of healthcare stakeholders including KOLs, payers, regulators, patient advocacy groups, and healthcare providers, and how to develop effective engagement strategies.',
    'Develop a comprehensive stakeholder engagement strategy for:

**Product/Initiative**: {product_initiative}
**Therapeutic Area**: {therapeutic_area}
**Launch Timeline**: {launch_timeline}
**Key Markets**: {key_markets}
**Strategic Objectives**: {strategic_objectives}
**Current Stakeholder Landscape**: {current_landscape}

Create a detailed engagement strategy including:

1. **Stakeholder Mapping and Prioritization**
   - Key Opinion Leaders (KOLs)
   - Regulatory authorities
   - Payer organizations
   - Patient advocacy groups
   - Healthcare providers
   - Academic institutions
2. **Engagement Objectives by Stakeholder**
   - Specific goals and outcomes
   - Value propositions
   - Key messages
3. **Engagement Tactics and Channels**
   - Advisory boards
   - Scientific conferences
   - Publications strategy
   - Digital engagement
4. **Timeline and Milestones**
   - Pre-launch activities
   - Launch support
   - Post-launch maintenance
5. **Success Metrics and KPIs**
   - Engagement quality measures
   - Relationship strength indicators
   - Business impact metrics
6. **Risk Management**
   - Compliance considerations
   - Reputation management
   - Crisis communication plan

Ensure all recommendations align with industry compliance standards and best practices.',
    'Strategic stakeholder engagement planning for medical affairs',
    ARRAY['stakeholder', 'engagement', 'strategy', 'medical-affairs', 'BRIDGE']
);

-- PROOF™ - Evidence Analytics Prompts
INSERT INTO prism_prompts (
    tenant_id, name, display_name, acronym, prism_suite, domain,
    system_prompt, user_prompt_template, description, tags
) VALUES
(
    '00000000-0000-0000-0000-000000000000',
    'evidence_synthesis_analysis',
    'Evidence Synthesis and Analysis',
    'ESA',
    'PROOF',
    'medical_affairs',
    'You are a medical evidence expert with expertise in systematic evidence synthesis, meta-analysis, and real-world evidence generation. You understand how to critically appraise scientific literature, synthesize evidence across studies, and translate findings into actionable insights for medical and commercial decision-making.',
    'Conduct a comprehensive evidence synthesis for:

**Research Question**: {research_question}
**Therapeutic Area**: {therapeutic_area}
**Intervention(s)**: {interventions}
**Comparator(s)**: {comparators}
**Outcomes of Interest**: {outcomes}
**Target Population**: {population}
**Evidence Sources**: {evidence_sources}

Provide a systematic evidence analysis including:

1. **Literature Search Strategy**
   - Database selection and search terms
   - Inclusion/exclusion criteria
   - Quality assessment framework
2. **Evidence Quality Assessment**
   - Study design evaluation
   - Risk of bias assessment
   - Strength of evidence grading
3. **Quantitative Synthesis** (if applicable)
   - Meta-analysis methodology
   - Heterogeneity assessment
   - Sensitivity analyses
4. **Qualitative Evidence Synthesis**
   - Thematic analysis of findings
   - Narrative synthesis approach
   - Evidence gaps identification
5. **Clinical Significance Assessment**
   - Effect size interpretation
   - Clinical relevance evaluation
   - Number needed to treat (if applicable)
6. **Real-World Evidence Integration**
   - RWE study findings
   - Generalizability assessment
   - Practice pattern implications
7. **Evidence-Based Recommendations**
   - Clinical practice implications
   - Future research priorities
   - Regulatory and payer considerations

Ensure all analyses follow established methodological guidelines (PRISMA, Cochrane, etc.).',
    'Systematic evidence synthesis and analysis for medical decision-making',
    ARRAY['evidence', 'synthesis', 'analysis', 'systematic-review', 'PROOF']
);

-- CRAFT™ - Medical Writing Prompts
INSERT INTO prism_prompts (
    tenant_id, name, display_name, acronym, prism_suite, domain,
    system_prompt, user_prompt_template, description, tags
) VALUES
(
    '00000000-0000-0000-0000-000000000000',
    'regulatory_document_creation',
    'Regulatory Document Creation',
    'RDC',
    'CRAFT',
    'medical_affairs',
    'You are a medical writing expert specializing in regulatory documentation. You have extensive experience creating high-quality regulatory submissions, clinical study reports, investigator brochures, and other regulatory documents that meet international standards and guidelines.',
    'Create a high-quality regulatory document section for:

**Document Type**: {document_type}
**Regulatory Authority**: {regulatory_authority}
**Product/Study**: {product_study}
**Section Required**: {section_required}
**Therapeutic Area**: {therapeutic_area}
**Target Audience**: {target_audience}
**Submission Timeline**: {submission_timeline}
**Key Data Sources**: {data_sources}

Develop the document section with:

1. **Document Structure and Organization**
   - Appropriate formatting and numbering
   - Cross-references and navigation
   - Appendix organization
2. **Content Development**
   - Clear, concise scientific writing
   - Appropriate technical detail level
   - Logical flow and argumentation
3. **Data Presentation**
   - Tables and figures design
   - Statistical presentation standards
   - Visual communication optimization
4. **Regulatory Compliance**
   - Guidance adherence (ICH, FDA, EMA)
   - Required elements inclusion
   - Format specifications compliance
5. **Quality Assurance Elements**
   - Internal consistency checks
   - Accuracy verification points
   - Review and approval workflow
6. **Supporting Materials**
   - Reference list compilation
   - Glossary and abbreviations
   - Version control considerations

Ensure the document meets the highest standards of medical writing and regulatory compliance.',
    'Professional regulatory document creation and medical writing',
    ARRAY['medical-writing', 'regulatory', 'documentation', 'CRAFT']
);

-- VALUE™ - Market Access Prompts
INSERT INTO prism_prompts (
    tenant_id, name, display_name, acronym, prism_suite, domain,
    system_prompt, user_prompt_template, description, tags
) VALUES
(
    '00000000-0000-0000-0000-000000000000',
    'health_economics_analysis',
    'Health Economics and Outcomes Analysis',
    'HEOA',
    'VALUE',
    'market_access',
    'You are a health economics and outcomes research (HEOR) expert with extensive experience in developing economic models, conducting cost-effectiveness analyses, and creating value propositions for healthcare interventions. You understand payer perspectives and can translate clinical benefits into economic value.',
    'Develop a comprehensive health economics analysis for:

**Intervention**: {intervention}
**Therapeutic Area**: {therapeutic_area}
**Target Population**: {target_population}
**Healthcare Setting**: {healthcare_setting}
**Comparator(s)**: {comparators}
**Target Markets**: {target_markets}
**Payer Perspective**: {payer_perspective}
**Time Horizon**: {time_horizon}

Provide a detailed HEOR analysis including:

1. **Economic Model Structure**
   - Model type selection (decision tree, Markov, etc.)
   - Health states definition
   - Transition probabilities
   - Model validation approach
2. **Clinical Input Parameters**
   - Efficacy data sources
   - Safety profile integration
   - Quality of life impacts
   - Long-term outcomes projection
3. **Economic Input Parameters**
   - Direct medical costs
   - Indirect costs consideration
   - Resource utilization patterns
   - Unit cost sources and assumptions
4. **Cost-Effectiveness Analysis**
   - Incremental cost-effectiveness ratio (ICER)
   - Budget impact analysis
   - Sensitivity analysis results
   - Scenario analysis outcomes
5. **Value Proposition Development**
   - Economic value drivers
   - Clinical differentiation
   - Societal benefit considerations
   - Return on investment calculation
6. **Payer Communication Strategy**
   - Key value messages
   - Evidence package composition
   - Health technology assessment preparation
   - Negotiation support materials

Ensure all analyses follow established HEOR guidelines and are appropriate for the target payer audience.',
    'Comprehensive health economics and outcomes research analysis',
    ARRAY['health-economics', 'cost-effectiveness', 'value', 'market-access', 'VALUE']
);

-- SCOUT™ - Competitive Intelligence Prompts
INSERT INTO prism_prompts (
    tenant_id, name, display_name, acronym, prism_suite, domain,
    system_prompt, user_prompt_template, description, tags
) VALUES
(
    '00000000-0000-0000-0000-000000000000',
    'competitive_landscape_analysis',
    'Competitive Landscape Analysis',
    'CLA',
    'SCOUT',
    'commercial_strategy',
    'You are a competitive intelligence expert specializing in healthcare market analysis. You excel at analyzing competitive landscapes, identifying market opportunities, and developing strategic recommendations based on comprehensive competitive intelligence gathering and analysis.',
    'Conduct a comprehensive competitive landscape analysis for:

**Product/Service**: {product_service}
**Therapeutic Area**: {therapeutic_area}
**Target Market(s)**: {target_markets}
**Analysis Timeframe**: {analysis_timeframe}
**Strategic Objectives**: {strategic_objectives}
**Key Success Factors**: {success_factors}

Develop a detailed competitive analysis including:

1. **Market Definition and Segmentation**
   - Total addressable market (TAM)
   - Serviceable addressable market (SAM)
   - Market segmentation criteria
   - Growth projections and drivers
2. **Competitive Mapping**
   - Direct competitors identification
   - Indirect competitors analysis
   - Emerging threat assessment
   - Competitive positioning matrix
3. **Competitor Deep Dive Analysis**
   - Product portfolio assessment
   - Clinical pipeline evaluation
   - Commercial strategy analysis
   - Strengths and weaknesses evaluation
4. **Market Share and Performance**
   - Current market share distribution
   - Historical performance trends
   - Sales and revenue analysis
   - Market penetration rates
5. **Strategic Intelligence**
   - R&D investment patterns
   - Partnership and acquisition activity
   - Regulatory milestone tracking
   - Patent landscape analysis
6. **Opportunity Assessment**
   - Unmet medical needs identification
   - Market gaps and white spaces
   - Differentiation opportunities
   - Strategic recommendation development
7. **Competitive Response Planning**
   - Scenario planning for competitive moves
   - Defensive strategy development
   - Market entry timing optimization

Provide actionable insights and strategic recommendations based on the competitive intelligence gathered.',
    'Strategic competitive landscape and intelligence analysis',
    ARRAY['competitive-intelligence', 'market-analysis', 'strategy', 'SCOUT']
);

-- GUARD™ - Safety Framework Prompts
INSERT INTO prism_prompts (
    tenant_id, name, display_name, acronym, prism_suite, domain,
    system_prompt, user_prompt_template, description, tags
) VALUES
(
    '00000000-0000-0000-0000-000000000000',
    'pharmacovigilance_assessment',
    'Pharmacovigilance Risk Assessment',
    'PRA',
    'GUARD',
    'regulatory_compliance',
    'You are a pharmacovigilance expert with extensive experience in drug safety assessment, risk management planning, and regulatory safety reporting. You understand global pharmacovigilance regulations and can develop comprehensive safety strategies for healthcare products.',
    'Develop a comprehensive pharmacovigilance assessment for:

**Product**: {product_name}
**Therapeutic Area**: {therapeutic_area}
**Development Stage**: {development_stage}
**Known Safety Profile**: {safety_profile}
**Target Population**: {target_population}
**Regulatory Markets**: {regulatory_markets}
**Risk Factors**: {risk_factors}

Provide a detailed safety assessment including:

1. **Safety Profile Characterization**
   - Known adverse events summary
   - Severity and frequency analysis
   - Population-specific considerations
   - Long-term safety considerations
2. **Risk Assessment and Categorization**
   - Important identified risks
   - Important potential risks
   - Missing information identification
   - Risk-benefit evaluation
3. **Risk Management Strategy**
   - Risk minimization measures
   - Additional monitoring requirements
   - Healthcare provider education
   - Patient communication strategy
4. **Pharmacovigilance Plan**
   - Routine surveillance activities
   - Enhanced monitoring requirements
   - Signal detection strategy
   - Periodic safety reporting plan
5. **Regulatory Compliance Framework**
   - Global reporting requirements
   - Risk evaluation and mitigation strategies (REMS)
   - Periodic benefit-risk evaluation reports (PBER)
   - Regulatory communication plan
6. **Safety Data Management**
   - Data collection systems
   - Quality assurance procedures
   - Database specifications
   - Audit trail requirements

Ensure all recommendations align with international pharmacovigilance guidelines and regulations.',
    'Comprehensive pharmacovigilance and safety risk assessment',
    ARRAY['pharmacovigilance', 'safety', 'risk-management', 'GUARD']
);

-- Digital Health Domain Prompts
INSERT INTO prism_prompts (
    tenant_id, name, display_name, acronym, prism_suite, domain,
    system_prompt, user_prompt_template, description, tags
) VALUES
(
    '00000000-0000-0000-0000-000000000000',
    'digital_health_validation',
    'Digital Health Technology Validation',
    'DHTV',
    'PROOF',
    'digital_health',
    'You are a digital health expert specializing in the validation and evidence generation for digital health technologies. You understand the unique challenges of demonstrating clinical validity, analytical validity, and clinical utility for digital biomarkers, AI/ML algorithms, and digital therapeutics.',
    'Develop a comprehensive validation strategy for the digital health technology:

**Technology Description**: {technology_description}
**Clinical Application**: {clinical_application}
**Target Population**: {target_population}
**Intended Use**: {intended_use}
**Technology Maturity**: {technology_maturity}
**Regulatory Pathway**: {regulatory_pathway}
**Validation Timeline**: {validation_timeline}

Create a detailed validation framework including:

1. **Analytical Validation**
   - Algorithm performance metrics
   - Technical validation studies
   - Precision and accuracy assessment
   - Robustness testing requirements
2. **Clinical Validation**
   - Clinical utility demonstration
   - Outcome measure selection
   - Study design considerations
   - Real-world validation approach
3. **Regulatory Strategy**
   - FDA digital health guidance alignment
   - Software as Medical Device (SaMD) classification
   - Quality management system requirements
   - 510(k) or De Novo pathway considerations
4. **Evidence Generation Plan**
   - Real-world evidence collection
   - Post-market surveillance requirements
   - Continuous learning framework
   - Algorithm update validation
5. **Quality and Risk Management**
   - Software development lifecycle
   - Risk management processes
   - Cybersecurity considerations
   - Data privacy and protection
6. **Implementation Strategy**
   - User acceptance testing
   - Healthcare integration planning
   - Training and support requirements
   - Adoption barrier mitigation

Ensure alignment with FDA digital health guidance and international standards.',
    'Comprehensive validation strategy for digital health technologies',
    ARRAY['digital-health', 'validation', 'AI-ML', 'SaMD', 'PROOF']
);

-- Technology Platforms Domain Prompts
INSERT INTO prism_prompts (
    tenant_id, name, display_name, acronym, prism_suite, domain,
    system_prompt, user_prompt_template, description, tags
) VALUES
(
    '00000000-0000-0000-0000-000000000000',
    'ai_implementation_strategy',
    'AI Implementation Strategy for Healthcare',
    'AISH',
    'SCOUT',
    'technology_platforms',
    'You are an AI implementation expert specializing in healthcare technology deployment. You understand the complexities of implementing AI solutions in healthcare environments, including technical, regulatory, ethical, and operational considerations.',
    'Develop a comprehensive AI implementation strategy for:

**AI Solution**: {ai_solution}
**Healthcare Setting**: {healthcare_setting}
**Clinical Use Case**: {clinical_use_case}
**Target Users**: {target_users}
**Implementation Timeline**: {implementation_timeline}
**Technical Infrastructure**: {technical_infrastructure}
**Regulatory Requirements**: {regulatory_requirements}

Provide a detailed implementation strategy including:

1. **Technical Architecture**
   - System integration requirements
   - Data pipeline design
   - Model deployment architecture
   - Performance monitoring framework
2. **Regulatory and Compliance Framework**
   - FDA AI/ML guidance compliance
   - GDPR and data privacy considerations
   - Clinical governance requirements
   - Audit trail specifications
3. **Change Management Strategy**
   - Stakeholder engagement plan
   - Training and education program
   - User adoption strategy
   - Resistance management approach
4. **Quality Assurance Framework**
   - Model validation procedures
   - Continuous monitoring protocols
   - Performance degradation detection
   - Update and maintenance procedures
5. **Risk Management and Mitigation**
   - Technical risk assessment
   - Clinical safety considerations
   - Cybersecurity measures
   - Business continuity planning
6. **Success Metrics and KPIs**
   - Clinical outcome measures
   - Operational efficiency metrics
   - User satisfaction indicators
   - ROI measurement framework

Ensure the strategy addresses both technical excellence and practical healthcare implementation challenges.',
    'Strategic AI implementation planning for healthcare environments',
    ARRAY['AI-implementation', 'healthcare-technology', 'strategy', 'SCOUT']
);

-- Update usage counts and set active status
UPDATE prism_prompts SET
    is_active = true,
    version = '1.0',
    created_at = NOW()
WHERE tenant_id = '00000000-0000-0000-0000-000000000000';

-- Create prompt usage tracking
CREATE TABLE IF NOT EXISTS prompt_usage_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID REFERENCES prism_prompts(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID,

    -- Usage context
    query_text TEXT,
    response_quality_rating INTEGER CHECK (response_quality_rating >= 1 AND response_quality_rating <= 5),
    processing_time_ms INTEGER,
    tokens_used INTEGER,

    -- Session context
    session_id UUID,
    domain_context knowledge_domain,
    use_case_category VARCHAR(200),

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prompt_usage_analytics_prompt_id ON prompt_usage_analytics(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_analytics_tenant_id ON prompt_usage_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_analytics_created_at ON prompt_usage_analytics(created_at);

COMMENT ON TABLE prism_prompts IS 'PRISM specialized prompt library for healthcare domains';
COMMENT ON TABLE prompt_usage_analytics IS 'Detailed analytics for prompt usage and performance tracking';