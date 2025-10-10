-- Emergency RLS Policy Implementation
-- This migration addresses critical security vulnerabilities by implementing
-- organization data isolation and proper RLS policies

-- Helper functions for organization isolation
CREATE OR REPLACE FUNCTION get_user_organization_id() RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organization_id
    FROM user_profiles
    WHERE user_id = auth.uid()
    AND is_active = true
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_organization_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'super_admin')
    FROM user_profiles
    WHERE user_id = auth.uid()
    AND is_active = true
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Enable RLS on critical tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create organization isolation policies for user_profiles
CREATE POLICY "org_isolation_user_profiles" ON user_profiles
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for agents
CREATE POLICY "org_isolation_agents" ON agents
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for workflows
CREATE POLICY "org_isolation_workflows" ON workflows
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for knowledge_documents
CREATE POLICY "org_isolation_knowledge_documents" ON knowledge_documents
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for audit_logs
CREATE POLICY "org_isolation_audit_logs" ON audit_logs
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for organizations
CREATE POLICY "org_isolation_organizations" ON organizations
  FOR ALL USING (
    id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for projects
CREATE POLICY "org_isolation_projects" ON projects
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for queries
CREATE POLICY "org_isolation_queries" ON queries
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for documents
CREATE POLICY "org_isolation_documents" ON documents
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for workflow_executions
CREATE POLICY "org_isolation_workflow_executions" ON workflow_executions
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for citations
CREATE POLICY "org_isolation_citations" ON citations
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for milestones
CREATE POLICY "org_isolation_milestones" ON milestones
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for invitations
CREATE POLICY "org_isolation_invitations" ON invitations
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for usage_metrics
CREATE POLICY "org_isolation_usage_metrics" ON usage_metrics
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for notifications
CREATE POLICY "org_isolation_notifications" ON notifications
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_org ON user_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_agents_org ON agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflows_org ON workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_org ON knowledge_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_queries_org ON queries(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_org ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_org ON workflow_executions(organization_id);
CREATE INDEX IF NOT EXISTS idx_citations_org ON citations(organization_id);
CREATE INDEX IF NOT EXISTS idx_milestones_org ON milestones(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_org ON invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_org ON usage_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_org ON notifications(organization_id);

-- Add indexes for user_id lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_user_id ON usage_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION is_organization_admin() TO authenticated;
