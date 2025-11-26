-- Migration: Create user_agents table for agent library
-- This table stores which agents each user has added to their personal library

-- Create user_agents table
CREATE TABLE IF NOT EXISTS public.user_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    original_agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
    is_user_copy BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure a user can't add the same agent twice
    UNIQUE(user_id, agent_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_agents_user_id ON public.user_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_agent_id ON public.user_agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_created_at ON public.user_agents(created_at DESC);

-- Add RLS policies
ALTER TABLE public.user_agents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own agents
CREATE POLICY "Users can view their own agents"
    ON public.user_agents
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can add agents to their library
CREATE POLICY "Users can add agents to their library"
    ON public.user_agents
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can remove agents from their library
CREATE POLICY "Users can remove agents from their library"
    ON public.user_agents
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_agents_updated_at
    BEFORE UPDATE ON public.user_agents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_agents_updated_at();

-- Add comment
COMMENT ON TABLE public.user_agents IS 'Stores which agents users have added to their personal library for workflow testing';


