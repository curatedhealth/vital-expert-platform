-- Migration: Add tables for Notion sync
-- Description: Create tables to store synced data from Notion databases
-- Date: 2025-01-08

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Core Entity Tables
-- ============================================================================

-- Workflows Table
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notion_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    steps TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workflows_notion_id ON workflows(notion_id);
CREATE INDEX IF NOT EXISTS idx_workflows_is_active ON workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_workflows_name ON workflows(name);

-- Agents Table
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notion_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT,
    description TEXT,
    role TEXT,
    category TEXT,
    tier TEXT,
    lifecycle_stage TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    model TEXT,
    temperature NUMERIC(3, 2),
    max_tokens INTEGER,
    system_prompt TEXT,
    icon TEXT,
    color TEXT,
    success_rate NUMERIC(5, 2),
    usage_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agents_notion_id ON agents(notion_id);
CREATE INDEX IF NOT EXISTS idx_agents_is_active ON agents(is_active);
CREATE INDEX IF NOT EXISTS idx_agents_category ON agents(category);
CREATE INDEX IF NOT EXISTS idx_agents_tier ON agents(tier);
CREATE INDEX IF NOT EXISTS idx_agents_name ON agents(name);

-- AI Agents Registry Table (Detailed agent information)
CREATE TABLE IF NOT EXISTS agents_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notion_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT,
    agent_code TEXT,
    agent_type TEXT,
    description TEXT,
    domain TEXT,
    type TEXT,
    status TEXT,
    tier TEXT,
    model TEXT,
    primary_model TEXT,
    temperature NUMERIC(3, 2),
    max_tokens INTEGER,
    system_prompt TEXT,
    configuration_json TEXT,
    is_active BOOLEAN DEFAULT true,
    rag_enabled BOOLEAN DEFAULT false,
    hipaa_compliant BOOLEAN DEFAULT false,
    gdpr_compliant BOOLEAN DEFAULT false,
    accuracy_rate NUMERIC(5, 2),
    success_rate NUMERIC(5, 2),
    performance_score NUMERIC(5, 2),
    avatar TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agents_registry_notion_id ON agents_registry(notion_id);
CREATE INDEX IF NOT EXISTS idx_agents_registry_domain ON agents_registry(domain);
CREATE INDEX IF NOT EXISTS idx_agents_registry_status ON agents_registry(status);

-- Capabilities Table
CREATE TABLE IF NOT EXISTS capabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notion_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT,
    description TEXT,
    category TEXT,
    domain TEXT,
    vital_component TEXT,
    complexity_level TEXT,
    maturity TEXT,
    priority TEXT,
    stage TEXT,
    is_premium BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    panel_recommended BOOLEAN DEFAULT false,
    success_rate NUMERIC(5, 2),
    usage_count INTEGER DEFAULT 0,
    icon TEXT,
    color TEXT,
    implementation_timeline TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_capabilities_notion_id ON capabilities(notion_id);
CREATE INDEX IF NOT EXISTS idx_capabilities_category ON capabilities(category);
CREATE INDEX IF NOT EXISTS idx_capabilities_domain ON capabilities(domain);
CREATE INDEX IF NOT EXISTS idx_capabilities_priority ON capabilities(priority);

-- Tools Table
CREATE TABLE IF NOT EXISTS tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notion_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    tool_type TEXT,
    configuration TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tools_notion_id ON tools(notion_id);
CREATE INDEX IF NOT EXISTS idx_tools_tool_type ON tools(tool_type);
CREATE INDEX IF NOT EXISTS idx_tools_is_active ON tools(is_active);

-- Prompts Table
CREATE TABLE IF NOT EXISTS prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notion_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    content TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prompts_notion_id ON prompts(notion_id);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_is_active ON prompts(is_active);

-- Organizational Functions Table
CREATE TABLE IF NOT EXISTS organizational_functions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notion_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    function_code TEXT,
    function_type TEXT,
    pharma_criticality TEXT,
    gxp_regulated BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_org_functions_notion_id ON organizational_functions(notion_id);
CREATE INDEX IF NOT EXISTS idx_org_functions_type ON organizational_functions(function_type);

-- Domains Table (Industry Categories L1, L2, L3)
CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notion_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    level TEXT NOT NULL, -- L1, L2, or L3
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_domains_notion_id ON domains(notion_id);
CREATE INDEX IF NOT EXISTS idx_domains_level ON domains(level);
CREATE INDEX IF NOT EXISTS idx_domains_name ON domains(name);

-- Use Cases Table (Jobs to Be Done)
CREATE TABLE IF NOT EXISTS use_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notion_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority TEXT,
    status TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_use_cases_notion_id ON use_cases(notion_id);
CREATE INDEX IF NOT EXISTS idx_use_cases_category ON use_cases(category);
CREATE INDEX IF NOT EXISTS idx_use_cases_priority ON use_cases(priority);
CREATE INDEX IF NOT EXISTS idx_use_cases_status ON use_cases(status);

-- Personas Table (Organizational Roles)
CREATE TABLE IF NOT EXISTS personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notion_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    role_type TEXT,
    seniority_level TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_personas_notion_id ON personas(notion_id);
CREATE INDEX IF NOT EXISTS idx_personas_role_type ON personas(role_type);
CREATE INDEX IF NOT EXISTS idx_personas_seniority ON personas(seniority_level);
CREATE INDEX IF NOT EXISTS idx_personas_is_active ON personas(is_active);

-- ============================================================================
-- Relationship Tables (Many-to-Many)
-- ============================================================================

-- Workflow-Agent Relationships
CREATE TABLE IF NOT EXISTS workflow_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workflow_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_workflow_agents_workflow ON workflow_agents(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_agents_agent ON workflow_agents(agent_id);

-- Workflow-Tool Relationships
CREATE TABLE IF NOT EXISTS workflow_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workflow_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_workflow_tools_workflow ON workflow_tools(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tools_tool ON workflow_tools(tool_id);

-- Agent-Capability Relationships
CREATE TABLE IF NOT EXISTS agent_capabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, capability_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_capabilities_agent ON agent_capabilities(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_capability ON agent_capabilities(capability_id);

-- Agent-Prompt Relationships
CREATE TABLE IF NOT EXISTS agent_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, prompt_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_prompts_agent ON agent_prompts(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_prompts_prompt ON agent_prompts(prompt_id);

-- ============================================================================
-- Update Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers for all main tables
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_registry_updated_at BEFORE UPDATE ON agents_registry
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_capabilities_updated_at BEFORE UPDATE ON capabilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizational_functions_updated_at BEFORE UPDATE ON organizational_functions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON domains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_use_cases_updated_at BEFORE UPDATE ON use_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personas_updated_at BEFORE UPDATE ON personas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE workflows IS 'Business workflows synced from Notion';
COMMENT ON TABLE agents IS 'AI agents synced from Notion';
COMMENT ON TABLE agents_registry IS 'Detailed AI agent registry synced from Notion';
COMMENT ON TABLE capabilities IS 'Agent capabilities synced from Notion';
COMMENT ON TABLE tools IS 'Tools and integrations synced from Notion';
COMMENT ON TABLE prompts IS 'AI prompts synced from Notion';
COMMENT ON TABLE organizational_functions IS 'Organizational functions synced from Notion';
COMMENT ON TABLE domains IS 'Industry domains and categories (L1/L2/L3) synced from Notion';
COMMENT ON TABLE use_cases IS 'Use cases and jobs to be done synced from Notion';
COMMENT ON TABLE personas IS 'User personas and roles synced from Notion';

COMMENT ON TABLE workflow_agents IS 'Many-to-many relationship between workflows and agents';
COMMENT ON TABLE workflow_tools IS 'Many-to-many relationship between workflows and tools';
COMMENT ON TABLE agent_capabilities IS 'Many-to-many relationship between agents and capabilities';
COMMENT ON TABLE agent_prompts IS 'Many-to-many relationship between agents and prompts';

