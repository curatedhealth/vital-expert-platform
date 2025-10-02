-- ===================================================================
-- VITAL Path Platform - Enhanced Phase 1: Clinical Data Models with FHIR
-- Migration: 002_clinical_fhir_models.sql
-- Version: 1.0.0
-- Created: 2025-09-24
-- ===================================================================

-- ===================================================================
-- 1. FHIR-COMPATIBLE CLINICAL DATA MODELS
-- ===================================================================

-- FHIR Patient Resource with Digital Health Extensions
CREATE TABLE fhir_patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    fhir_id VARCHAR(64) UNIQUE NOT NULL, -- FHIR logical id
    identifier JSONB NOT NULL DEFAULT '[]', -- Patient identifiers
    active BOOLEAN DEFAULT TRUE,
    name JSONB NOT NULL DEFAULT '[]', -- HumanName array
    telecom JSONB DEFAULT '[]', -- ContactPoint array
    gender VARCHAR(20), -- male, female, other, unknown
    birth_date DATE,
    deceased JSONB, -- boolean or dateTime
    address JSONB DEFAULT '[]', -- Address array
    marital_status JSONB, -- CodeableConcept
    multiple_birth JSONB, -- boolean or integer
    photo JSONB DEFAULT '[]', -- Attachment array
    contact JSONB DEFAULT '[]', -- Patient.contact array
    communication JSONB DEFAULT '[]', -- Patient.communication array
    general_practitioner JSONB DEFAULT '[]', -- Reference array
    managing_organization JSONB, -- Reference
    link JSONB DEFAULT '[]', -- Patient.link array
    -- Digital Health Extensions
    digital_health_profile JSONB DEFAULT '{}', -- DTx preferences, device compatibility
    intervention_history JSONB DEFAULT '[]', -- Past digital interventions
    compliance_score NUMERIC(3,2), -- 0.00-1.00
    risk_stratification JSONB DEFAULT '{}', -- Clinical risk factors
    consent_status JSONB DEFAULT '{}', -- Digital health consents
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX (organization_id),
    INDEX (fhir_id),
    INDEX USING GIN (identifier),
    INDEX (active),
    INDEX (birth_date),
    INDEX (compliance_score)
);

-- FHIR Observation Resource for Clinical Data
CREATE TABLE fhir_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    fhir_id VARCHAR(64) UNIQUE NOT NULL,
    identifier JSONB DEFAULT '[]',
    based_on JSONB DEFAULT '[]', -- Reference array
    part_of JSONB DEFAULT '[]', -- Reference array
    status VARCHAR(50) NOT NULL, -- registered, preliminary, final, amended, etc.
    category JSONB DEFAULT '[]', -- CodeableConcept array
    code JSONB NOT NULL, -- CodeableConcept - what was observed
    subject JSONB NOT NULL, -- Reference to Patient
    focus JSONB DEFAULT '[]', -- Reference array
    encounter JSONB, -- Reference
    effective_datetime TIMESTAMPTZ,
    effective_period JSONB, -- Period
    issued TIMESTAMPTZ,
    performer JSONB DEFAULT '[]', -- Reference array
    value_quantity JSONB, -- Quantity
    value_codeable_concept JSONB, -- CodeableConcept
    value_string TEXT,
    value_boolean BOOLEAN,
    value_integer INTEGER,
    value_range JSONB, -- Range
    value_ratio JSONB, -- Ratio
    value_sampled_data JSONB, -- SampledData
    value_time TIME,
    value_datetime TIMESTAMPTZ,
    value_period JSONB, -- Period
    data_absent_reason JSONB, -- CodeableConcept
    interpretation JSONB DEFAULT '[]', -- CodeableConcept array
    note JSONB DEFAULT '[]', -- Annotation array
    body_site JSONB, -- CodeableConcept
    method JSONB, -- CodeableConcept
    specimen JSONB, -- Reference
    device JSONB, -- Reference
    reference_range JSONB DEFAULT '[]', -- Observation.referenceRange array
    has_member JSONB DEFAULT '[]', -- Reference array
    derived_from JSONB DEFAULT '[]', -- Reference array
    component JSONB DEFAULT '[]', -- Observation.component array
    -- Digital Health Extensions
    digital_source JSONB, -- App, wearable, sensor data
    intervention_context JSONB, -- Related DTx intervention
    quality_score NUMERIC(3,2), -- Data quality assessment
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX (organization_id),
    INDEX (fhir_id),
    INDEX (status),
    INDEX USING GIN (code),
    INDEX USING GIN (subject),
    INDEX (effective_datetime),
    INDEX (issued)
) PARTITION BY HASH (organization_id);

-- Create partitions for observations
CREATE TABLE fhir_observations_part_0 PARTITION OF fhir_observations FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE fhir_observations_part_1 PARTITION OF fhir_observations FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE fhir_observations_part_2 PARTITION OF fhir_observations FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE fhir_observations_part_3 PARTITION OF fhir_observations FOR VALUES WITH (MODULUS 4, REMAINDER 3);

-- FHIR Condition Resource for Clinical Conditions
CREATE TABLE fhir_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    fhir_id VARCHAR(64) UNIQUE NOT NULL,
    identifier JSONB DEFAULT '[]',
    clinical_status JSONB NOT NULL, -- CodeableConcept
    verification_status JSONB, -- CodeableConcept
    category JSONB DEFAULT '[]', -- CodeableConcept array
    severity JSONB, -- CodeableConcept
    code JSONB, -- CodeableConcept - condition code
    body_site JSONB DEFAULT '[]', -- CodeableConcept array
    subject JSONB NOT NULL, -- Reference to Patient
    encounter JSONB, -- Reference
    onset_datetime TIMESTAMPTZ,
    onset_age JSONB, -- Age
    onset_period JSONB, -- Period
    onset_range JSONB, -- Range
    onset_string TEXT,
    abatement_datetime TIMESTAMPTZ,
    abatement_age JSONB, -- Age
    abatement_period JSONB, -- Period
    abatement_range JSONB, -- Range
    abatement_string TEXT,
    recorded_date TIMESTAMPTZ,
    recorder JSONB, -- Reference
    asserter JSONB, -- Reference
    stage JSONB DEFAULT '[]', -- Condition.stage array
    evidence JSONB DEFAULT '[]', -- Condition.evidence array
    note JSONB DEFAULT '[]', -- Annotation array
    -- Digital Health Extensions
    dtx_eligibility JSONB DEFAULT '{}', -- DTx intervention eligibility
    severity_trend JSONB DEFAULT '[]', -- Historical severity tracking
    digital_biomarkers JSONB DEFAULT '{}', -- Associated digital biomarkers
    intervention_targets JSONB DEFAULT '[]', -- Potential intervention targets
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX (organization_id),
    INDEX (fhir_id),
    INDEX USING GIN (clinical_status),
    INDEX USING GIN (code),
    INDEX USING GIN (subject),
    INDEX (onset_datetime),
    INDEX (recorded_date)
);

-- FHIR Medication Resource for Digital Therapeutics
CREATE TABLE fhir_medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    fhir_id VARCHAR(64) UNIQUE NOT NULL,
    identifier JSONB DEFAULT '[]',
    code JSONB, -- CodeableConcept
    status VARCHAR(50), -- active, inactive, entered-in-error
    manufacturer JSONB, -- Reference
    form JSONB, -- CodeableConcept
    amount JSONB, -- Ratio
    ingredient JSONB DEFAULT '[]', -- Medication.ingredient array
    batch JSONB, -- Medication.batch
    -- Digital Therapeutics Extensions
    dtx_type VARCHAR(50), -- app, device, platform, hybrid
    therapeutic_area JSONB DEFAULT '[]', -- CodeableConcept array
    clinical_evidence JSONB DEFAULT '{}', -- Evidence base
    regulatory_status JSONB DEFAULT '{}', -- FDA, CE mark, etc.
    delivery_mechanism JSONB DEFAULT '{}', -- Mobile app, web, device
    dosing_protocol JSONB DEFAULT '{}', -- Usage frequency, duration
    contraindications JSONB DEFAULT '[]', -- Clinical contraindications
    interactions JSONB DEFAULT '[]', -- Drug-DTx interactions
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX (organization_id),
    INDEX (fhir_id),
    INDEX (status),
    INDEX (dtx_type),
    INDEX USING GIN (therapeutic_area)
);

-- ===================================================================
-- 2. DIGITAL HEALTH INTERVENTIONS SCHEMA
-- ===================================================================

-- Digital Health Intervention Registry
CREATE TABLE digital_interventions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    intervention_type VARCHAR(50) NOT NULL, -- dtx, app, device, platform, hybrid
    therapeutic_area JSONB NOT NULL DEFAULT '[]', -- CodeableConcept array
    target_population JSONB DEFAULT '{}', -- Demographics, conditions
    clinical_evidence JSONB DEFAULT '{}', -- RCT data, real-world evidence
    regulatory_pathway VARCHAR(50), -- fda_510k, fda_de_novo, ce_mark, none
    regulatory_status VARCHAR(50) DEFAULT 'development', -- development, submitted, approved, marketed
    technology_stack JSONB DEFAULT '{}', -- Platform, frameworks, devices
    delivery_modalities JSONB DEFAULT '[]', -- mobile, web, wearable, sensor
    dosing_regimen JSONB DEFAULT '{}', -- Frequency, duration, intensity
    clinical_endpoints JSONB DEFAULT '[]', -- Primary and secondary endpoints
    safety_profile JSONB DEFAULT '{}', -- Known risks, contraindications
    user_engagement_metrics JSONB DEFAULT '{}', -- Usage patterns, retention
    interoperability JSONB DEFAULT '{}', -- FHIR, HL7, APIs
    privacy_security JSONB DEFAULT '{}', -- HIPAA, encryption, data handling
    health_economics JSONB DEFAULT '{}', -- Cost-effectiveness, reimbursement
    development_stage VARCHAR(50) DEFAULT 'concept', -- concept, prototype, pilot, pivotal, commercial
    version VARCHAR(50) DEFAULT '1.0.0',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    INDEX (organization_id),
    INDEX (intervention_type),
    INDEX USING GIN (therapeutic_area),
    INDEX (regulatory_status),
    INDEX (development_stage)
);

-- Intervention Development Lifecycle
CREATE TABLE intervention_lifecycle (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    intervention_id UUID NOT NULL REFERENCES digital_interventions(id),
    phase VARCHAR(50) NOT NULL, -- design, build, test, deploy, monitor
    stage VARCHAR(100) NOT NULL, -- requirements, prototype, alpha, beta, production
    status VARCHAR(50) DEFAULT 'pending', -- pending, active, completed, blocked, cancelled
    start_date TIMESTAMPTZ,
    target_completion_date TIMESTAMPTZ,
    actual_completion_date TIMESTAMPTZ,
    deliverables JSONB DEFAULT '[]', -- Phase deliverables
    success_criteria JSONB DEFAULT '[]', -- Phase success metrics
    risks JSONB DEFAULT '[]', -- Identified risks
    mitigation_strategies JSONB DEFAULT '[]', -- Risk mitigation plans
    stakeholders JSONB DEFAULT '[]', -- Key stakeholders
    resources_required JSONB DEFAULT '{}', -- Budget, personnel, tools
    compliance_requirements JSONB DEFAULT '[]', -- Regulatory, quality requirements
    quality_gates JSONB DEFAULT '[]', -- Quality checkpoints
    lessons_learned JSONB DEFAULT '[]', -- Post-phase insights
    artifacts JSONB DEFAULT '[]', -- Generated artifacts, documents
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    INDEX (organization_id),
    INDEX (intervention_id),
    INDEX (phase),
    INDEX (status),
    INDEX (target_completion_date)
);

-- Clinical Trial Design for Digital Health
CREATE TABLE clinical_trial_designs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    intervention_id UUID NOT NULL REFERENCES digital_interventions(id),
    trial_name VARCHAR(255) NOT NULL,
    trial_type VARCHAR(50) NOT NULL, -- rct, single_arm, observational, registry
    phase VARCHAR(20), -- phase_i, phase_ii, phase_iii, phase_iv
    study_design JSONB NOT NULL DEFAULT '{}', -- Randomization, blinding, crossover
    primary_endpoint JSONB NOT NULL, -- Endpoint definition, measurement
    secondary_endpoints JSONB DEFAULT '[]', -- Secondary endpoint array
    inclusion_criteria JSONB DEFAULT '[]', -- Patient inclusion criteria
    exclusion_criteria JSONB DEFAULT '[]', -- Patient exclusion criteria
    sample_size_calculation JSONB DEFAULT '{}', -- Power analysis, effect size
    statistical_plan JSONB DEFAULT '{}', -- Analysis methods, populations
    digital_endpoints JSONB DEFAULT '[]', -- App usage, engagement metrics
    biomarker_strategy JSONB DEFAULT '{}', -- Digital biomarkers, validation
    data_collection_plan JSONB DEFAULT '{}', -- EDC, mobile data, sensors
    regulatory_strategy JSONB DEFAULT '{}', -- FDA/EMA pathway, guidance
    quality_assurance JSONB DEFAULT '{}', -- GCP compliance, monitoring
    risk_management JSONB DEFAULT '{}', -- DSMB, safety monitoring
    health_economics JSONB DEFAULT '{}', -- Cost-effectiveness endpoints
    patient_engagement JSONB DEFAULT '{}', -- Retention strategies, UX
    status VARCHAR(50) DEFAULT 'design', -- design, approved, recruiting, active, completed
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    INDEX (organization_id),
    INDEX (intervention_id),
    INDEX (trial_type),
    INDEX (phase),
    INDEX (status)
);

-- ===================================================================
-- 3. MEDICAL ONTOLOGIES & TERMINOLOGIES
-- ===================================================================

-- Medical Concept Dictionary (SNOMED CT, ICD-10, LOINC, etc.)
CREATE TABLE medical_concepts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concept_id VARCHAR(100) UNIQUE NOT NULL, -- Original terminology ID
    terminology VARCHAR(50) NOT NULL, -- SNOMED_CT, ICD10, LOINC, RxNorm, etc.
    concept_code VARCHAR(50) NOT NULL,
    display_name VARCHAR(500) NOT NULL,
    definition TEXT,
    concept_type VARCHAR(50), -- disorder, procedure, substance, etc.
    is_active BOOLEAN DEFAULT TRUE,
    parent_concepts JSONB DEFAULT '[]', -- Hierarchical relationships
    child_concepts JSONB DEFAULT '[]', -- Child concept references
    related_concepts JSONB DEFAULT '[]', -- Associated concepts
    synonyms JSONB DEFAULT '[]', -- Alternative terms
    translations JSONB DEFAULT '{}', -- Multi-language support
    clinical_context JSONB DEFAULT '{}', -- Usage context, specialties
    digital_health_relevance JSONB DEFAULT '{}', -- DTx applicability
    embedding_vector vector(3072), -- Semantic embeddings
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (terminology, concept_code),
    INDEX (terminology),
    INDEX (concept_code),
    INDEX (concept_type),
    INDEX (is_active),
    INDEX USING GIN (parent_concepts),
    INDEX USING GIN (synonyms),
    INDEX USING HNSW (embedding_vector vector_cosine_ops)
);

-- Clinical Entity Recognition & Extraction
CREATE TABLE clinical_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    document_id UUID REFERENCES documents(id),
    entity_type VARCHAR(100) NOT NULL, -- condition, medication, procedure, etc.
    entity_text TEXT NOT NULL, -- Original extracted text
    normalized_text TEXT, -- Standardized form
    concept_id UUID REFERENCES medical_concepts(id),
    confidence_score NUMERIC(3,2), -- 0.00-1.00
    start_position INTEGER,
    end_position INTEGER,
    context_window TEXT, -- Surrounding text for context
    extraction_method VARCHAR(50), -- NER, pattern_matching, ml_model
    validation_status VARCHAR(30) DEFAULT 'pending', -- pending, validated, rejected
    clinical_relevance JSONB DEFAULT '{}', -- Severity, acuity, importance
    negation_status BOOLEAN DEFAULT FALSE, -- Negated mention
    temporality VARCHAR(30), -- past, present, future, hypothetical
    certainty VARCHAR(30), -- definite, probable, possible
    subject VARCHAR(30) DEFAULT 'patient', -- patient, family, other
    created_at TIMESTAMPTZ DEFAULT NOW(),
    validated_at TIMESTAMPTZ,
    validated_by UUID REFERENCES users(id),
    INDEX (organization_id),
    INDEX (document_id),
    INDEX (entity_type),
    INDEX (concept_id),
    INDEX (confidence_score),
    INDEX (validation_status)
);

-- ===================================================================
-- 4. DIGITAL HEALTH RAG KNOWLEDGE BASES
-- ===================================================================

-- RAG Knowledge Base for Digital Health Design
CREATE TABLE rag_knowledge_bases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    knowledge_domain VARCHAR(100) NOT NULL, -- design, build, test, deploy, regulatory, clinical
    use_case_focus JSONB NOT NULL DEFAULT '[]', -- DTx development phases
    content_types JSONB DEFAULT '[]', -- guidelines, standards, examples, templates
    target_audience JSONB DEFAULT '[]', -- developers, clinicians, regulators
    quality_level VARCHAR(30) DEFAULT 'validated', -- draft, reviewed, validated, certified
    update_frequency VARCHAR(30) DEFAULT 'monthly', -- daily, weekly, monthly, quarterly
    version VARCHAR(50) DEFAULT '1.0.0',
    curator_info JSONB DEFAULT '{}', -- Curators, subject matter experts
    access_level VARCHAR(30) DEFAULT 'organization', -- public, organization, restricted
    indexing_strategy JSONB DEFAULT '{}', -- Chunking, embedding strategies
    retrieval_config JSONB DEFAULT '{}', -- Search parameters, filters
    performance_metrics JSONB DEFAULT '{}', -- Usage, relevance, feedback
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    INDEX (organization_id),
    INDEX (knowledge_domain),
    INDEX USING GIN (use_case_focus),
    INDEX (quality_level),
    INDEX (access_level)
);

-- Digital Health Design Knowledge
INSERT INTO rag_knowledge_bases (
    organization_id, name, description, knowledge_domain, use_case_focus, content_types, target_audience
)
SELECT
    o.id,
    'Digital Therapeutics Design Framework',
    'Comprehensive knowledge base for DTx design including user research, clinical workflows, regulatory considerations, and evidence generation strategies',
    'design',
    '["user_research", "clinical_workflow", "evidence_strategy", "regulatory_planning", "stakeholder_engagement"]'::jsonb,
    '["guidelines", "frameworks", "templates", "case_studies", "best_practices"]'::jsonb,
    '["product_managers", "clinical_researchers", "regulatory_specialists", "ux_designers"]'::jsonb
FROM organizations o WHERE o.slug = 'vital-demo';

INSERT INTO rag_knowledge_bases (
    organization_id, name, description, knowledge_domain, use_case_focus, content_types, target_audience
)
SELECT
    o.id,
    'Digital Health Development Standards',
    'Technical standards, architectures, and implementation patterns for building clinical-grade digital health solutions',
    'build',
    '["architecture_patterns", "security_implementation", "interoperability", "scalability", "clinical_integration"]'::jsonb,
    '["standards", "code_examples", "reference_architectures", "security_patterns", "api_specifications"]'::jsonb,
    '["software_engineers", "solution_architects", "security_engineers", "clinical_informaticists"]'::jsonb
FROM organizations o WHERE o.slug = 'vital-demo';

INSERT INTO rag_knowledge_bases (
    organization_id, name, description, knowledge_domain, use_case_focus, content_types, target_audience
)
SELECT
    o.id,
    'Clinical Validation & Testing Protocols',
    'Evidence-based testing methodologies, clinical validation frameworks, and quality assurance protocols for digital health interventions',
    'test',
    '["clinical_validation", "usability_testing", "safety_assessment", "efficacy_measurement", "real_world_evidence"]'::jsonb,
    '["protocols", "validation_frameworks", "test_plans", "safety_checklists", "outcome_measures"]'::jsonb,
    '["clinical_researchers", "biostatisticians", "quality_engineers", "regulatory_affairs"]'::jsonb
FROM organizations o WHERE o.slug = 'vital-demo';

INSERT INTO rag_knowledge_bases (
    organization_id, name, description, knowledge_domain, use_case_focus, content_types, target_audience
)
SELECT
    o.id,
    'Digital Health Deployment & Scaling',
    'Implementation strategies, deployment patterns, and scaling frameworks for digital health solutions in healthcare systems',
    'deploy',
    '["implementation_science", "change_management", "provider_adoption", "system_integration", "outcome_monitoring"]'::jsonb,
    '["implementation_guides", "change_frameworks", "integration_patterns", "monitoring_strategies", "success_metrics"]'::jsonb,
    '["implementation_specialists", "healthcare_administrators", "clinical_champions", "system_integrators"]'::jsonb
FROM organizations o WHERE o.slug = 'vital-demo';

-- RAG Content with Digital Health Specialization
CREATE TABLE rag_content_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    knowledge_base_id UUID NOT NULL REFERENCES rag_knowledge_bases(id),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- guideline, standard, example, template, case_study
    source_reference TEXT, -- Original source citation
    author_info JSONB DEFAULT '{}', -- Authors, credentials
    publication_date DATE,
    last_reviewed_date DATE,
    evidence_level VARCHAR(30), -- high, medium, low, expert_opinion
    clinical_specialty JSONB DEFAULT '[]', -- Relevant specialties
    intervention_types JSONB DEFAULT '[]', -- Applicable intervention types
    development_phases JSONB DEFAULT '[]', -- Relevant development phases
    regulatory_context JSONB DEFAULT '[]', -- FDA, EMA, other jurisdictions
    keywords JSONB DEFAULT '[]', -- Searchable keywords
    difficulty_level VARCHAR(30) DEFAULT 'intermediate', -- beginner, intermediate, advanced
    prerequisites JSONB DEFAULT '[]', -- Required background knowledge
    related_items JSONB DEFAULT '[]', -- Related content references
    usage_statistics JSONB DEFAULT '{}', -- View count, ratings, feedback
    quality_score NUMERIC(3,2) DEFAULT 0.80, -- Content quality assessment
    embedding_vector vector(3072), -- Content embeddings
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    INDEX (organization_id),
    INDEX (knowledge_base_id),
    INDEX (content_type),
    INDEX USING GIN (clinical_specialty),
    INDEX USING GIN (intervention_types),
    INDEX USING GIN (development_phases),
    INDEX (evidence_level),
    INDEX (quality_score),
    INDEX USING HNSW (embedding_vector vector_cosine_ops)
) PARTITION BY HASH (knowledge_base_id);

-- Create partitions for RAG content
CREATE TABLE rag_content_items_part_0 PARTITION OF rag_content_items FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE rag_content_items_part_1 PARTITION OF rag_content_items FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE rag_content_items_part_2 PARTITION OF rag_content_items FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE rag_content_items_part_3 PARTITION OF rag_content_items FOR VALUES WITH (MODULUS 4, REMAINDER 3);

-- ===================================================================
-- 5. CLINICAL VALIDATION & SAFETY
-- ===================================================================

-- Clinical Validation Rules Engine
CREATE TABLE clinical_validation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    rule_name VARCHAR(255) NOT NULL,
    rule_description TEXT,
    rule_type VARCHAR(50) NOT NULL, -- safety, efficacy, quality, regulatory
    clinical_domain VARCHAR(100), -- cardiology, diabetes, mental_health, etc.
    intervention_context JSONB DEFAULT '{}', -- Applicable intervention types
    validation_logic JSONB NOT NULL, -- Rule implementation logic
    severity_level VARCHAR(30) DEFAULT 'warning', -- info, warning, error, critical
    evidence_basis TEXT, -- Scientific rationale
    regulatory_source VARCHAR(100), -- FDA guidance, clinical guidelines
    implementation_guide TEXT, -- How to implement the rule
    exception_criteria JSONB DEFAULT '[]', -- Valid exceptions
    performance_metrics JSONB DEFAULT '{}', -- Sensitivity, specificity
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    INDEX (organization_id),
    INDEX (rule_type),
    INDEX (clinical_domain),
    INDEX (severity_level),
    INDEX (is_active)
);

-- Clinical Safety Monitoring
CREATE TABLE safety_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    intervention_id UUID REFERENCES digital_interventions(id),
    patient_reference JSONB, -- FHIR Patient reference
    event_type VARCHAR(100) NOT NULL, -- adverse_event, device_malfunction, usability_issue
    severity VARCHAR(30) NOT NULL, -- mild, moderate, severe, life_threatening
    event_description TEXT NOT NULL,
    onset_datetime TIMESTAMPTZ,
    resolution_datetime TIMESTAMPTZ,
    outcome VARCHAR(50), -- recovered, ongoing, permanent, death, unknown
    causality_assessment VARCHAR(50), -- definite, probable, possible, unlikely, unrelated
    clinical_impact JSONB DEFAULT '{}', -- Patient impact assessment
    technical_factors JSONB DEFAULT '{}', -- Technical contributing factors
    mitigation_actions JSONB DEFAULT '[]', -- Actions taken
    regulatory_reporting JSONB DEFAULT '{}', -- FDA, notified body reporting
    lessons_learned TEXT,
    status VARCHAR(30) DEFAULT 'open', -- open, investigating, resolved, closed
    reported_by UUID REFERENCES users(id),
    investigated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX (organization_id),
    INDEX (intervention_id),
    INDEX (event_type),
    INDEX (severity),
    INDEX (status),
    INDEX (onset_datetime)
);

-- ===================================================================
-- 6. ENHANCED FUNCTIONS FOR DIGITAL HEALTH
-- ===================================================================

-- Digital Health Semantic Search
CREATE OR REPLACE FUNCTION digital_health_similarity_search(
    org_id UUID,
    query_embedding vector(3072),
    domain_filter VARCHAR DEFAULT NULL,
    phase_filter TEXT[] DEFAULT NULL,
    similarity_threshold FLOAT DEFAULT 0.8,
    max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
    content_id UUID,
    title TEXT,
    content TEXT,
    similarity FLOAT,
    content_type VARCHAR,
    evidence_level VARCHAR,
    clinical_specialty JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        rci.id,
        rci.title,
        rci.content,
        (1 - (rci.embedding_vector <=> query_embedding)) as similarity,
        rci.content_type,
        rci.evidence_level,
        rci.clinical_specialty
    FROM rag_content_items rci
    JOIN rag_knowledge_bases rkb ON rci.knowledge_base_id = rkb.id
    WHERE rci.organization_id = org_id
      AND (domain_filter IS NULL OR rkb.knowledge_domain = domain_filter)
      AND (phase_filter IS NULL OR rci.development_phases ?| phase_filter)
      AND (1 - (rci.embedding_vector <=> query_embedding)) > similarity_threshold
    ORDER BY rci.embedding_vector <=> query_embedding
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Clinical Concept Matching
CREATE OR REPLACE FUNCTION match_clinical_concepts(
    input_text TEXT,
    terminology_filter VARCHAR DEFAULT NULL,
    confidence_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
    concept_id UUID,
    concept_code VARCHAR,
    display_name VARCHAR,
    terminology VARCHAR,
    confidence FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        mc.id,
        mc.concept_code,
        mc.display_name,
        mc.terminology,
        greatest(
            similarity(mc.display_name, input_text),
            (
                SELECT max(similarity(syn.value::text, input_text))
                FROM jsonb_array_elements_text(mc.synonyms) AS syn
            )
        ) as confidence
    FROM medical_concepts mc
    WHERE mc.is_active = TRUE
      AND (terminology_filter IS NULL OR mc.terminology = terminology_filter)
      AND greatest(
          similarity(mc.display_name, input_text),
          COALESCE((
              SELECT max(similarity(syn.value::text, input_text))
              FROM jsonb_array_elements_text(mc.synonyms) AS syn
          ), 0)
      ) > confidence_threshold
    ORDER BY confidence DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers for clinical tables
CREATE TRIGGER update_fhir_patients_updated_at BEFORE UPDATE ON fhir_patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fhir_observations_updated_at BEFORE UPDATE ON fhir_observations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fhir_conditions_updated_at BEFORE UPDATE ON fhir_conditions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_digital_interventions_updated_at BEFORE UPDATE ON digital_interventions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- MIGRATION COMPLETE
-- ===================================================================

DO $$
BEGIN
    RAISE NOTICE 'Clinical Data Models with FHIR Migration Complete';
    RAISE NOTICE 'Features: FHIR Resources, Digital Health Extensions, Medical Ontologies';
    RAISE NOTICE 'RAG: Specialized knowledge bases for design, build, test, deploy phases';
    RAISE NOTICE 'Safety: Clinical validation rules, safety event monitoring';
END $$;