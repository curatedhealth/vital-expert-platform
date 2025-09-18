-- JTBD Core Library Schema Extension
-- Building on existing agents and capabilities tables

-- Core JTBD Library
CREATE TABLE jtbd_library (
    id VARCHAR(20) PRIMARY KEY, -- MA001, COM002, etc.
    title VARCHAR(255) NOT NULL,
    verb VARCHAR(50) NOT NULL,
    goal TEXT NOT NULL,
    function VARCHAR(100) NOT NULL, -- Medical Affairs, Commercial, Market Access, HR
    category VARCHAR(100),
    description TEXT,
    business_value TEXT,
    complexity VARCHAR(20) CHECK (complexity IN ('Low', 'Medium', 'High')),
    time_to_value VARCHAR(50),
    implementation_cost VARCHAR(10) CHECK (implementation_cost IN ('$', '$$', '$$$')),

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    avg_execution_time INTEGER, -- in minutes

    -- Search and filtering
    tags TEXT[],
    keywords TEXT[],

    -- Workshop potential
    workshop_potential VARCHAR(20) CHECK (workshop_potential IN ('Low', 'Medium', 'High')),
    maturity_level VARCHAR(50)
);

-- JTBD Process Steps (workflow definition)
CREATE TABLE jtbd_process_steps (
    id SERIAL PRIMARY KEY,
    jtbd_id VARCHAR(20) REFERENCES jtbd_library(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    step_description TEXT,
    agent_id UUID REFERENCES agents(id), -- Link to existing agents table
    is_parallel BOOLEAN DEFAULT false,
    estimated_duration INTEGER, -- in minutes
    required_capabilities TEXT[],
    input_schema JSONB,
    output_schema JSONB,
    error_handling JSONB
);

-- Pain Points
CREATE TABLE jtbd_pain_points (
    id SERIAL PRIMARY KEY,
    jtbd_id VARCHAR(20) REFERENCES jtbd_library(id) ON DELETE CASCADE,
    pain_point TEXT NOT NULL,
    impact_score INTEGER CHECK (impact_score BETWEEN 1 AND 10),
    frequency VARCHAR(50) CHECK (frequency IN ('Daily', 'Weekly', 'Monthly', 'Quarterly')),
    solution_approach TEXT,
    current_time_spent INTEGER, -- minutes per occurrence
    manual_effort_level VARCHAR(20) CHECK (manual_effort_level IN ('Low', 'Medium', 'High'))
);

-- AI Techniques Used
CREATE TABLE jtbd_ai_techniques (
    id SERIAL PRIMARY KEY,
    jtbd_id VARCHAR(20) REFERENCES jtbd_library(id) ON DELETE CASCADE,
    technique VARCHAR(100) NOT NULL,
    application_description TEXT,
    complexity_level VARCHAR(20) CHECK (complexity_level IN ('Basic', 'Intermediate', 'Advanced')),
    required_data_types TEXT[]
);

-- Data Requirements
CREATE TABLE jtbd_data_requirements (
    id SERIAL PRIMARY KEY,
    jtbd_id VARCHAR(20) REFERENCES jtbd_library(id) ON DELETE CASCADE,
    data_type VARCHAR(100) NOT NULL,
    data_source VARCHAR(255),
    source_type VARCHAR(50) CHECK (source_type IN ('Internal', 'External', 'Third-party', 'API')),
    accessibility VARCHAR(50) CHECK (accessibility IN ('Public', 'Licensed', 'Proprietary', 'Protected')),
    data_format VARCHAR(50) CHECK (data_format IN ('Structured', 'Unstructured', 'Semi-structured')),
    is_required BOOLEAN DEFAULT true,
    quality_requirements TEXT,
    refresh_frequency VARCHAR(50),
    estimated_volume VARCHAR(50)
);

-- Tools and APIs Required
CREATE TABLE jtbd_tools (
    id SERIAL PRIMARY KEY,
    jtbd_id VARCHAR(20) REFERENCES jtbd_library(id) ON DELETE CASCADE,
    tool_name VARCHAR(100) NOT NULL,
    tool_type VARCHAR(50) CHECK (tool_type IN ('API', 'Library', 'Service', 'Platform', 'Database')),
    tool_description TEXT,
    is_required BOOLEAN DEFAULT true,
    license_type VARCHAR(50) CHECK (license_type IN ('Open Source', 'Commercial', 'Proprietary', 'Free')),
    integration_status VARCHAR(50) CHECK (integration_status IN ('Integrated', 'Planned', 'Available', 'Required')),
    api_endpoint TEXT,
    credentials_required BOOLEAN DEFAULT false,
    setup_complexity VARCHAR(20) CHECK (setup_complexity IN ('Low', 'Medium', 'High')),
    monthly_cost_estimate VARCHAR(50)
);

-- Persona Mapping (extend existing personas)
CREATE TABLE jtbd_persona_mapping (
    id SERIAL PRIMARY KEY,
    jtbd_id VARCHAR(20) REFERENCES jtbd_library(id) ON DELETE CASCADE,
    persona_name VARCHAR(100) NOT NULL,
    persona_role VARCHAR(100),
    relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 10),
    typical_frequency VARCHAR(50),
    use_case_examples TEXT,
    expected_benefit TEXT,
    adoption_barriers TEXT[]
);

-- Agent Orchestration (links to existing agents table)
CREATE TABLE jtbd_agent_orchestration (
    id SERIAL PRIMARY KEY,
    jtbd_id VARCHAR(20) REFERENCES jtbd_library(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id), -- Link to existing agents
    execution_order INTEGER,
    is_required BOOLEAN DEFAULT true,
    can_run_parallel BOOLEAN DEFAULT false,
    fallback_agent_id UUID REFERENCES agents(id),
    agent_configuration JSONB,
    success_criteria JSONB,
    timeout_minutes INTEGER DEFAULT 30
);

-- Execution Sessions (track JTBD runs)
CREATE TABLE jtbd_executions (
    id SERIAL PRIMARY KEY,
    jtbd_id VARCHAR(20) REFERENCES jtbd_library(id),
    user_id UUID, -- Link to auth.users
    organization_id UUID,
    execution_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_timestamp TIMESTAMP,
    status VARCHAR(50) CHECK (status IN ('Initializing', 'Running', 'Completed', 'Failed', 'Cancelled')),
    execution_mode VARCHAR(50) CHECK (execution_mode IN ('Automated', 'Semi-automated', 'Manual')),

    -- Performance tracking
    agents_used JSONB,
    llms_used JSONB,
    total_tokens_consumed INTEGER,
    total_cost DECIMAL(10,2),

    -- Results
    outputs JSONB,
    execution_log JSONB,
    error_details JSONB,

    -- User feedback
    satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 10),
    feedback TEXT,

    -- Metadata
    execution_metadata JSONB
);

-- Success Metrics Definitions
CREATE TABLE jtbd_success_metrics (
    id SERIAL PRIMARY KEY,
    jtbd_id VARCHAR(20) REFERENCES jtbd_library(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) CHECK (metric_type IN ('Efficiency', 'Quality', 'Cost', 'Time', 'Compliance', 'Satisfaction')),
    baseline_value VARCHAR(100),
    target_value VARCHAR(100),
    measurement_method TEXT,
    data_source VARCHAR(255),
    calculation_formula TEXT,
    reporting_frequency VARCHAR(50) CHECK (reporting_frequency IN ('Real-time', 'Daily', 'Weekly', 'Monthly'))
);

-- Industry Benchmarks
CREATE TABLE jtbd_benchmarks (
    id SERIAL PRIMARY KEY,
    jtbd_id VARCHAR(20) REFERENCES jtbd_library(id) ON DELETE CASCADE,
    company VARCHAR(255),
    industry_segment VARCHAR(100),
    implementation_description TEXT,
    quantified_outcome TEXT,
    implementation_timeline VARCHAR(100),
    technologies_used TEXT[],
    source VARCHAR(500),
    source_url TEXT,
    year INTEGER,
    credibility_score INTEGER CHECK (credibility_score BETWEEN 1 AND 10),
    outcome_metrics JSONB
);

-- Regulatory Considerations
CREATE TABLE jtbd_regulatory_considerations (
    id SERIAL PRIMARY KEY,
    jtbd_id VARCHAR(20) REFERENCES jtbd_library(id) ON DELETE CASCADE,
    region VARCHAR(50) CHECK (region IN ('US', 'EU', 'UK', 'Japan', 'Canada', 'Global')),
    regulation VARCHAR(100),
    requirement TEXT,
    compliance_approach TEXT,
    validation_requirements TEXT,
    guidance_document VARCHAR(255),
    criticality VARCHAR(20) CHECK (criticality IN ('Required', 'Recommended', 'Optional')),
    last_updated DATE DEFAULT CURRENT_DATE
);

-- JTBD Dependencies
CREATE TABLE jtbd_dependencies (
    id SERIAL PRIMARY KEY,
    jtbd_id VARCHAR(20) REFERENCES jtbd_library(id) ON DELETE CASCADE,
    dependency_jtbd_id VARCHAR(20) REFERENCES jtbd_library(id),
    dependency_type VARCHAR(50) CHECK (dependency_type IN ('Required', 'Recommended', 'Optional')),
    dependency_reason TEXT,
    can_run_parallel BOOLEAN DEFAULT false,
    completion_percentage_required INTEGER CHECK (completion_percentage_required BETWEEN 0 AND 100)
);

-- Create indexes for performance
CREATE INDEX idx_jtbd_function ON jtbd_library(function);
CREATE INDEX idx_jtbd_complexity ON jtbd_library(complexity);
CREATE INDEX idx_jtbd_tags ON jtbd_library USING GIN(tags);
CREATE INDEX idx_jtbd_keywords ON jtbd_library USING GIN(keywords);
CREATE INDEX idx_jtbd_active ON jtbd_library(is_active) WHERE is_active = true;

CREATE INDEX idx_execution_user ON jtbd_executions(user_id);
CREATE INDEX idx_execution_status ON jtbd_executions(status);
CREATE INDEX idx_execution_timestamp ON jtbd_executions(execution_timestamp);

CREATE INDEX idx_process_step_jtbd ON jtbd_process_steps(jtbd_id);
CREATE INDEX idx_process_step_order ON jtbd_process_steps(jtbd_id, step_number);

CREATE INDEX idx_agent_orchestration_jtbd ON jtbd_agent_orchestration(jtbd_id);
CREATE INDEX idx_agent_orchestration_order ON jtbd_agent_orchestration(jtbd_id, execution_order);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jtbd_library_updated_at
    BEFORE UPDATE ON jtbd_library
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (if using Row Level Security)
ALTER TABLE jtbd_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE jtbd_executions ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read JTBD library
CREATE POLICY "Allow authenticated read access to jtbd_library"
    ON jtbd_library FOR SELECT
    TO authenticated
    USING (true);

-- Users can only see their own executions
CREATE POLICY "Users can see own executions"
    ON jtbd_executions FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

COMMENT ON TABLE jtbd_library IS 'Core JTBD library with job definitions and metadata';
COMMENT ON TABLE jtbd_process_steps IS 'Workflow steps for each JTBD with agent assignments';
COMMENT ON TABLE jtbd_executions IS 'Track execution sessions and performance metrics';
COMMENT ON TABLE jtbd_agent_orchestration IS 'Links JTBDs to agents with execution configuration';