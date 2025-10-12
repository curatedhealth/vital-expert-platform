-- VITAL Path Digital Health Platform Database Schema
-- This schema includes all tables referenced in the application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create audit_blocks table for immutable audit logging
CREATE TABLE IF NOT EXISTS public.audit_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    block_hash TEXT NOT NULL UNIQUE,
    previous_hash TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create worm_configs table for Write-Once-Read-Many configurations
CREATE TABLE IF NOT EXISTS public.worm_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_name TEXT NOT NULL UNIQUE,
    config_data JSONB NOT NULL,
    is_immutable BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create siem_exports table for SIEM system exports
CREATE TABLE IF NOT EXISTS public.siem_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    export_type TEXT NOT NULL,
    export_data JSONB NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    exported_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id)
);

-- Create llm_providers table
CREATE TABLE IF NOT EXISTS public.llm_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    provider_type TEXT NOT NULL,
    api_endpoint TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create restore_operations table
CREATE TABLE IF NOT EXISTS public.restore_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backup_id UUID NOT NULL,
    restore_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id)
);

-- Create security_audit_log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prompt_changes table
CREATE TABLE IF NOT EXISTS public.prompt_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id TEXT NOT NULL,
    change_type TEXT NOT NULL,
    old_content TEXT,
    new_content TEXT NOT NULL,
    change_reason TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create approval_workflows table
CREATE TABLE IF NOT EXISTS public.approval_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_name TEXT NOT NULL,
    workflow_type TEXT NOT NULL,
    steps JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create governance_policies table
CREATE TABLE IF NOT EXISTS public.governance_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_name TEXT NOT NULL,
    policy_type TEXT NOT NULL,
    policy_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create slo_configs table for Service Level Objectives
CREATE TABLE IF NOT EXISTS public.slo_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name TEXT NOT NULL,
    slo_name TEXT NOT NULL,
    target_value DECIMAL(5,2) NOT NULL,
    measurement_window INTERVAL NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create incidents table
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    severity TEXT NOT NULL,
    affected_services TEXT[],
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    assignee UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id)
);

-- Create mfa_configs table
CREATE TABLE IF NOT EXISTS public.mfa_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    mfa_type TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT false,
    secret_key TEXT,
    backup_codes TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sso_providers table
CREATE TABLE IF NOT EXISTS public.sso_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name TEXT NOT NULL,
    provider_type TEXT NOT NULL,
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create impersonation_sessions table
CREATE TABLE IF NOT EXISTS public.impersonation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID REFERENCES auth.users(id),
    target_user_id UUID REFERENCES auth.users(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    reason TEXT
);

-- Create access_reviews table
CREATE TABLE IF NOT EXISTS public.access_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    resource TEXT NOT NULL,
    permission TEXT NOT NULL,
    review_status TEXT DEFAULT 'pending',
    reviewer_id UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_announcements table
CREATE TABLE IF NOT EXISTS public.system_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    announcement_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create backup_metadata table
CREATE TABLE IF NOT EXISTS public.backup_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backup_name TEXT NOT NULL,
    backup_type TEXT NOT NULL,
    size_bytes BIGINT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_blocks_timestamp ON public.audit_blocks(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.incidents(severity);
CREATE INDEX IF NOT EXISTS idx_prompt_changes_status ON public.prompt_changes(status);
CREATE INDEX IF NOT EXISTS idx_access_reviews_status ON public.access_reviews(review_status);

-- Insert some default data
INSERT INTO public.llm_providers (name, provider_type, api_endpoint) VALUES
('OpenAI', 'openai', 'https://api.openai.com/v1'),
('Anthropic', 'anthropic', 'https://api.anthropic.com/v1'),
('Google', 'google', 'https://generativelanguage.googleapis.com/v1')
ON CONFLICT (name) DO NOTHING;

-- Insert default SLO configurations
INSERT INTO public.slo_configs (service_name, slo_name, target_value, measurement_window) VALUES
('api', 'availability', 99.9, '1 day'),
('api', 'latency_p95', 200, '1 hour'),
('database', 'availability', 99.95, '1 day'),
('database', 'query_time_p95', 100, '1 hour')
ON CONFLICT DO NOTHING;

-- Insert default system announcement
INSERT INTO public.system_announcements (title, content, announcement_type) VALUES
('Welcome to VITAL Path', 'Welcome to the VITAL Path Digital Health Platform. This is a development environment.', 'info')
ON CONFLICT DO NOTHING;
