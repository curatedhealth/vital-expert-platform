-- ============================================================================
-- Create Agent-Tool Assignments Table (If Not Exists)
-- Ensures the table exists before seeding data
-- ============================================================================

-- Create agent_tool_assignments table
CREATE TABLE IF NOT EXISTS public.agent_tool_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,

  -- Assignment configuration
  is_enabled BOOLEAN DEFAULT TRUE,
  auto_use BOOLEAN DEFAULT FALSE, -- Automatically use for relevant queries
  requires_confirmation BOOLEAN DEFAULT FALSE, -- Ask user before using
  priority INTEGER DEFAULT 0, -- Higher priority tools used first

  -- Usage limits for this agent
  max_uses_per_conversation INTEGER,
  max_uses_per_day INTEGER,
  current_day_usage INTEGER DEFAULT 0,

  -- Performance tracking
  times_used INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  avg_user_satisfaction DECIMAL(3, 2),

  -- Assignment metadata
  assigned_by UUID, -- References auth.users(id) but made optional
  assigned_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (agent_id, tool_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agent_tool_assignments_agent ON public.agent_tool_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tool_assignments_tool ON public.agent_tool_assignments(tool_id);
CREATE INDEX IF NOT EXISTS idx_agent_tool_assignments_enabled ON public.agent_tool_assignments(is_enabled);
CREATE INDEX IF NOT EXISTS idx_agent_tool_assignments_priority ON public.agent_tool_assignments(priority);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_agent_tool_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_agent_tool_assignments_updated_at ON public.agent_tool_assignments;
CREATE TRIGGER trigger_update_agent_tool_assignments_updated_at
  BEFORE UPDATE ON public.agent_tool_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_tool_assignments_updated_at();

-- Verification
SELECT 
    'agent_tool_assignments Table Created' as status,
    COUNT(*) as existing_records
FROM agent_tool_assignments;

-- Show schema
SELECT 
    'Table Schema' as section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'agent_tool_assignments'
ORDER BY ordinal_position;

