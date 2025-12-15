-- Create user_agents table for storing user-agent relationships
CREATE TABLE IF NOT EXISTS public.user_agents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, agent_id)
);

-- Enable RLS
ALTER TABLE public.user_agents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own agents" ON public.user_agents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add agents to their list" ON public.user_agents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove agents from their list" ON public.user_agents
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_agents_user_id ON public.user_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_agent_id ON public.user_agents(agent_id);
