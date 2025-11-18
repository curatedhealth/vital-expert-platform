-- Create Organizational Structure Tables for Notion Sync
-- Migration: 20251004120000_create_org_tables.sql

-- 1. Organizational Functions Table
CREATE TABLE IF NOT EXISTS org_functions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    function_code TEXT UNIQUE,
    description TEXT,
    parent_function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
    icon TEXT DEFAULT '📁',
    color TEXT DEFAULT 'gray',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS org_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    department_code TEXT UNIQUE,
    description TEXT,
    function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
    head_of_department TEXT,
    team_size INTEGER DEFAULT 0,
    budget NUMERIC(12, 2),
    location TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Roles Table
CREATE TABLE IF NOT EXISTS org_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    role_code TEXT UNIQUE,
    description TEXT,
    function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
    department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,
    level TEXT CHECK (level IN ('entry', 'mid', 'senior', 'lead', 'principal', 'executive')),
    required_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    salary_range TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Responsibilities Table
CREATE TABLE IF NOT EXISTS org_responsibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role_id UUID REFERENCES org_roles(id) ON DELETE CASCADE,
    category TEXT CHECK (category IN ('leadership', 'execution', 'analysis', 'communication', 'compliance', 'innovation')),
    priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    time_allocation INTEGER CHECK (time_allocation >= 0 AND time_allocation <= 100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Competencies Table
CREATE TABLE IF NOT EXISTS competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT CHECK (category IN ('technical', 'clinical', 'regulatory', 'leadership', 'communication', 'analytics')),
    level_required TEXT CHECK (level_required IN ('beginner', 'intermediate', 'advanced', 'expert')),
    training_resources TEXT[] DEFAULT ARRAY[]::TEXT[],
    assessment_criteria TEXT,
    is_core BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Prompts Table
CREATE TABLE IF NOT EXISTS prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    prompt_text TEXT NOT NULL,
    category TEXT,
    type TEXT CHECK (type IN ('starter', 'template', 'example', 'guide')),
    use_cases TEXT[] DEFAULT ARRAY[]::TEXT[],
    variables TEXT[] DEFAULT ARRAY[]::TEXT[],
    expected_output TEXT,
    complexity TEXT CHECK (complexity IN ('simple', 'moderate', 'complex')),
    usage_count INTEGER DEFAULT 0,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tools Table
CREATE TABLE IF NOT EXISTS tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    type TEXT CHECK (type IN ('api', 'database', 'analysis', 'reporting', 'integration', 'search')),
    category TEXT,
    api_endpoint TEXT,
    configuration JSONB DEFAULT '{}'::jsonb,
    authentication_required BOOLEAN DEFAULT false,
    rate_limit TEXT,
    cost_model TEXT CHECK (cost_model IN ('free', 'per_use', 'subscription', 'enterprise')),
    documentation_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Workflows Table
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    type TEXT,
    steps JSONB DEFAULT '[]'::jsonb,
    trigger_conditions TEXT,
    expected_duration INTEGER, -- in minutes
    success_criteria TEXT,
    status TEXT CHECK (status IN ('active', 'testing', 'deprecated', 'planned')),
    automation_level TEXT CHECK (automation_level IN ('manual', 'semi_automated', 'fully_automated')),
    usage_count INTEGER DEFAULT 0,
    success_rate NUMERIC(5, 2) CHECK (success_rate >= 0 AND success_rate <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. RAG Documents Table
CREATE TABLE IF NOT EXISTS rag_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    document_type TEXT,
    content TEXT,
    source_url TEXT,
    category TEXT,
    document_date DATE,
    version TEXT,
    status TEXT CHECK (status IN ('active', 'archived', 'superseded', 'draft')),
    chunk_count INTEGER DEFAULT 0,
    vector_embedded BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Jobs to Be Done Table
CREATE TABLE IF NOT EXISTS jobs_to_be_done (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_statement TEXT NOT NULL,
    category TEXT,
    user_persona TEXT,
    situation TEXT,
    motivation TEXT,
    expected_outcome TEXT,
    current_solution TEXT,
    pain_points TEXT[] DEFAULT ARRAY[]::TEXT[],
    priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually')),
    complexity TEXT CHECK (complexity IN ('simple', 'moderate', 'complex')),
    success_metrics TEXT,
    is_solved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction Tables for Many-to-Many Relations

-- Responsibilities <-> Competencies
CREATE TABLE IF NOT EXISTS responsibility_competencies (
    responsibility_id UUID REFERENCES org_responsibilities(id) ON DELETE CASCADE,
    competency_id UUID REFERENCES competencies(id) ON DELETE CASCADE,
    PRIMARY KEY (responsibility_id, competency_id)
);

-- Capabilities <-> Competencies
CREATE TABLE IF NOT EXISTS capability_competencies (
    capability_id UUID REFERENCES capabilities(id) ON DELETE CASCADE,
    competency_id UUID REFERENCES competencies(id) ON DELETE CASCADE,
    PRIMARY KEY (capability_id, competency_id)
);

-- Capabilities <-> Tools
CREATE TABLE IF NOT EXISTS capability_tools (
    capability_id UUID REFERENCES capabilities(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
    PRIMARY KEY (capability_id, tool_id)
);

-- Agents <-> Tools
CREATE TABLE IF NOT EXISTS agent_tools (
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
    PRIMARY KEY (agent_id, tool_id)
);

-- Agents <-> Workflows
CREATE TABLE IF NOT EXISTS agent_workflows (
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    PRIMARY KEY (agent_id, workflow_id)
);

-- Agents <-> Prompts
CREATE TABLE IF NOT EXISTS agent_prompts (
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    PRIMARY KEY (agent_id, prompt_id)
);

-- Workflows <-> Capabilities
CREATE TABLE IF NOT EXISTS workflow_capabilities (
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    capability_id UUID REFERENCES capabilities(id) ON DELETE CASCADE,
    PRIMARY KEY (workflow_id, capability_id)
);

-- RAG Documents <-> Agents
CREATE TABLE IF NOT EXISTS rag_agent_links (
    rag_document_id UUID REFERENCES rag_documents(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    PRIMARY KEY (rag_document_id, agent_id)
);

-- RAG Documents <-> Capabilities
CREATE TABLE IF NOT EXISTS rag_capability_links (
    rag_document_id UUID REFERENCES rag_documents(id) ON DELETE CASCADE,
    capability_id UUID REFERENCES capabilities(id) ON DELETE CASCADE,
    PRIMARY KEY (rag_document_id, capability_id)
);

-- Jobs to Be Done <-> Agents
CREATE TABLE IF NOT EXISTS job_agent_links (
    job_id UUID REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, agent_id)
);

-- Jobs to Be Done <-> Workflows
CREATE TABLE IF NOT EXISTS job_workflow_links (
    job_id UUID REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, workflow_id)
);

-- Jobs to Be Done <-> Capabilities
CREATE TABLE IF NOT EXISTS job_capability_links (
    job_id UUID REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    capability_id UUID REFERENCES capabilities(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, capability_id)
);

-- Update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_org_functions_updated_at BEFORE UPDATE ON org_functions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_org_departments_updated_at BEFORE UPDATE ON org_departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_org_roles_updated_at BEFORE UPDATE ON org_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_org_responsibilities_updated_at BEFORE UPDATE ON org_responsibilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competencies_updated_at BEFORE UPDATE ON competencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON tools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rag_documents_updated_at BEFORE UPDATE ON rag_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_to_be_done_updated_at BEFORE UPDATE ON jobs_to_be_done FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraints to agents table for org structure
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_org_functions_parent ON org_functions(parent_function_id);
CREATE INDEX IF NOT EXISTS idx_departments_function ON org_departments(function_id);
CREATE INDEX IF NOT EXISTS idx_roles_department ON org_roles(department_id);
CREATE INDEX IF NOT EXISTS idx_roles_function ON org_roles(function_id);
CREATE INDEX IF NOT EXISTS idx_responsibilities_role ON org_responsibilities(role_id);
CREATE INDEX IF NOT EXISTS idx_agents_department ON agents(department_id);
CREATE INDEX IF NOT EXISTS idx_agents_role ON agents(role_id);
CREATE INDEX IF NOT EXISTS idx_agents_function ON agents(function_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

COMMENT ON TABLE org_functions IS 'Top-level organizational functions';
COMMENT ON TABLE org_departments IS 'Departments within organizational functions';
COMMENT ON TABLE org_roles IS 'Job roles within departments';
COMMENT ON TABLE org_responsibilities IS 'Specific responsibilities for each role';
COMMENT ON TABLE competencies IS 'Required competencies for roles and capabilities';
COMMENT ON TABLE prompts IS 'Reusable prompt templates for agents';
COMMENT ON TABLE tools IS 'External tools and integrations available to agents';
COMMENT ON TABLE workflows IS 'Multi-agent workflows and processes';
COMMENT ON TABLE rag_documents IS 'Knowledge base documents for RAG';
COMMENT ON TABLE jobs_to_be_done IS 'User jobs and use cases';
