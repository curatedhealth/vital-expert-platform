-- Migration: Create many-to-many tenant-agent mapping
-- This allows agents to belong to multiple tenants and tenants to have multiple agents

-- Create tenant_agents junction table
CREATE TABLE IF NOT EXISTS tenant_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique tenant-agent combinations
  UNIQUE(tenant_id, agent_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenant_agents_tenant_id ON tenant_agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_agents_agent_id ON tenant_agents(agent_id);

-- Enable Row Level Security
ALTER TABLE tenant_agents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view tenant_agents for their tenant" ON tenant_agents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.tenant_id = tenant_agents.tenant_id
    )
  );

CREATE POLICY "Super admins can manage all tenant_agents" ON tenant_agents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'super_admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tenant_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tenant_agents_updated_at
  BEFORE UPDATE ON tenant_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_agents_updated_at();
