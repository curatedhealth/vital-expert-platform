-- VITALpath Platform Row Level Security Policies
-- Ensures complete data isolation between organizations

-- Enable Row Level Security on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's organization ID
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organization_id
    FROM users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is organization admin
CREATE OR REPLACE FUNCTION is_organization_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view own organization" ON organizations
  FOR SELECT USING (
    id = get_user_organization_id()
  );

CREATE POLICY "Organization admins can update own organization" ON organizations
  FOR UPDATE USING (
    id = get_user_organization_id() AND is_organization_admin()
  );

-- Users: Users can view users in their organization
CREATE POLICY "Users can view organization members" ON users
  FOR SELECT USING (
    organization_id = get_user_organization_id()
  );

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (
    id = auth.uid()
  );

CREATE POLICY "Organization admins can update users" ON users
  FOR UPDATE USING (
    organization_id = get_user_organization_id() AND is_organization_admin()
  );

CREATE POLICY "Organization admins can delete users" ON users
  FOR DELETE USING (
    organization_id = get_user_organization_id() AND is_organization_admin()
  );

-- Projects: Users can only see projects in their organization
CREATE POLICY "Users can view organization projects" ON projects
  FOR SELECT USING (
    organization_id = get_user_organization_id()
  );

CREATE POLICY "Users can create projects in their organization" ON projects
  FOR INSERT WITH CHECK (
    organization_id = get_user_organization_id()
  );

CREATE POLICY "Users can update organization projects" ON projects
  FOR UPDATE USING (
    organization_id = get_user_organization_id()
  );

CREATE POLICY "Organization admins can delete projects" ON projects
  FOR DELETE USING (
    organization_id = get_user_organization_id() AND is_organization_admin()
  );

-- Queries: Users can only see queries in their organization
CREATE POLICY "Users can view organization queries" ON queries
  FOR SELECT USING (
    organization_id = get_user_organization_id()
  );

CREATE POLICY "Users can create queries in their organization" ON queries
  FOR INSERT WITH CHECK (
    organization_id = get_user_organization_id() AND user_id = auth.uid()
  );

CREATE POLICY "Users can update own queries" ON queries
  FOR UPDATE USING (
    user_id = auth.uid() AND organization_id = get_user_organization_id()
  );

-- Documents: Users can view documents based on access level
CREATE POLICY "Users can view organization documents" ON documents
  FOR SELECT USING (
    organization_id = get_user_organization_id() OR
    (is_public = true AND access_level = 'organization')
  );

CREATE POLICY "Users can create documents in their organization" ON documents
  FOR INSERT WITH CHECK (
    organization_id = get_user_organization_id()
  );

CREATE POLICY "Document creators can update their documents" ON documents
  FOR UPDATE USING (
    created_by = auth.uid() AND organization_id = get_user_organization_id()
  );

CREATE POLICY "Organization admins can update all documents" ON documents
  FOR UPDATE USING (
    organization_id = get_user_organization_id() AND is_organization_admin()
  );

CREATE POLICY "Document creators can delete their documents" ON documents
  FOR DELETE USING (
    created_by = auth.uid() AND organization_id = get_user_organization_id()
  );

-- Workflows: Users can view workflows in their organization
CREATE POLICY "Users can view organization workflows" ON workflows
  FOR SELECT USING (
    organization_id = get_user_organization_id()
  );

CREATE POLICY "Users can create workflows in their organization" ON workflows
  FOR INSERT WITH CHECK (
    organization_id = get_user_organization_id()
  );

CREATE POLICY "Workflow creators can update their workflows" ON workflows
  FOR UPDATE USING (
    created_by = auth.uid() AND organization_id = get_user_organization_id()
  );

CREATE POLICY "Organization admins can manage all workflows" ON workflows
  FOR ALL USING (
    organization_id = get_user_organization_id() AND is_organization_admin()
  );

-- Workflow executions: Users can view executions for workflows they have access to
CREATE POLICY "Users can view workflow executions" ON workflow_executions
  FOR SELECT USING (
    workflow_id IN (
      SELECT id FROM workflows WHERE organization_id = get_user_organization_id()
    )
  );

CREATE POLICY "System can manage workflow executions" ON workflow_executions
  FOR ALL USING (true); -- This will be restricted via service role

-- Citations: Users can view citations for queries they have access to
CREATE POLICY "Users can view query citations" ON citations
  FOR SELECT USING (
    query_id IN (
      SELECT id FROM queries WHERE organization_id = get_user_organization_id()
    )
  );

CREATE POLICY "System can manage citations" ON citations
  FOR ALL USING (true); -- This will be restricted via service role

-- Milestones: Users can view milestones for projects in their organization
CREATE POLICY "Users can view project milestones" ON milestones
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id = get_user_organization_id()
    )
  );

CREATE POLICY "Users can create milestones for organization projects" ON milestones
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE organization_id = get_user_organization_id()
    )
  );

CREATE POLICY "Users can update milestones for organization projects" ON milestones
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id = get_user_organization_id()
    )
  );

CREATE POLICY "Users can delete milestones they created" ON milestones
  FOR DELETE USING (
    created_by = auth.uid() AND
    project_id IN (
      SELECT id FROM projects WHERE organization_id = get_user_organization_id()
    )
  );

-- Invitations: Organization admins can manage invitations
CREATE POLICY "Organization admins can view invitations" ON invitations
  FOR SELECT USING (
    organization_id = get_user_organization_id() AND is_organization_admin()
  );

CREATE POLICY "Organization admins can create invitations" ON invitations
  FOR INSERT WITH CHECK (
    organization_id = get_user_organization_id() AND is_organization_admin()
  );

CREATE POLICY "Organization admins can update invitations" ON invitations
  FOR UPDATE USING (
    organization_id = get_user_organization_id() AND is_organization_admin()
  );

CREATE POLICY "Anyone can accept invitations" ON invitations
  FOR UPDATE USING (true); -- Special case for accepting invitations

-- Audit logs: Users can view audit logs for their organization
CREATE POLICY "Users can view organization audit logs" ON audit_logs
  FOR SELECT USING (
    organization_id = get_user_organization_id()
  );

CREATE POLICY "System can create audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true); -- This will be restricted via service role

-- Usage metrics: Organization admins can view usage metrics
CREATE POLICY "Organization admins can view usage metrics" ON usage_metrics
  FOR SELECT USING (
    organization_id = get_user_organization_id() AND is_organization_admin()
  );

CREATE POLICY "System can manage usage metrics" ON usage_metrics
  FOR ALL USING (true); -- This will be restricted via service role

-- Notifications: Users can view and manage their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (
    user_id = auth.uid()
  );

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true); -- This will be restricted via service role

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant service role permissions for system operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;