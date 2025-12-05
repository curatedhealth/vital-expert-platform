-- ============================================================================
-- VITAL Platform - User Agents Table Migration
-- ============================================================================
-- Purpose: Track which agents each user has added to their personal list
-- Dependencies: Requires auth.users and agents tables
-- ============================================================================

-- Create user_agents table
CREATE TABLE IF NOT EXISTS public.user_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    original_agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
    is_user_copy BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure a user can't add the same agent twice
    CONSTRAINT user_agents_unique UNIQUE (user_id, agent_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_agents_user_id ON public.user_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_agent_id ON public.user_agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_created_at ON public.user_agents(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_agents ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own agent selections
CREATE POLICY "Users can view own agents"
    ON public.user_agents
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can add agents to their list
CREATE POLICY "Users can add agents"
    ON public.user_agents
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can remove agents from their list
CREATE POLICY "Users can remove own agents"
    ON public.user_agents
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to auto-update updated_at timestamp
DROP TRIGGER IF EXISTS set_user_agents_updated_at ON public.user_agents;
CREATE TRIGGER set_user_agents_updated_at
    BEFORE UPDATE ON public.user_agents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, DELETE ON public.user_agents TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.user_agents IS 'Tracks which agents users have added to their personal collection';
COMMENT ON COLUMN public.user_agents.user_id IS 'Reference to the user who added this agent';
COMMENT ON COLUMN public.user_agents.agent_id IS 'Reference to the agent that was added';
COMMENT ON COLUMN public.user_agents.original_agent_id IS 'If this is a copy, reference to the original agent';
COMMENT ON COLUMN public.user_agents.is_user_copy IS 'Whether this is a user-created copy of another agent';
