/**
 * API Route: Fetch Prompt Starters for Selected Agents
 * Retrieves prompt starters from dh_agent_prompt_starter table
 * When clicked, the full detailed prompt is fetched from the prompts table
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// SECURITY: Only use environment variables - no fallback credentials
// This ensures we fail safely if .env.local is not configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate that required environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local'
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { agentIds } = await request.json();

    if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
      return NextResponse.json(
        { error: 'Agent IDs are required' },
        { status: 400 }
      );
    }

    console.log('Fetching prompt starters for agents:', agentIds);

    // Fetch prompt starters from database
    const { data: promptStarters, error: startersError } = await supabase
      .from('dh_agent_prompt_starter')
      .select('id, title, description, tags, position, metadata, prompt_id, agent_id')
      .in('agent_id', agentIds)
      .order('position', { ascending: true })
      .limit(20);

    console.log('Supabase query result:', {
      data: promptStarters?.length || 0,
      error: startersError,
      errorDetails: startersError ? JSON.stringify(startersError) : 'none'
    });

    if (startersError) {
      console.error('Error fetching prompt starters:', startersError);
      console.error('Error code:', startersError.code);
      console.error('Error message:', startersError.message);
      console.error('Error details:', startersError.details);
      console.error('Error hint:', startersError.hint);
      return NextResponse.json(
        { 
          error: 'Failed to fetch prompt starters', 
          details: startersError.message,
          code: startersError.code,
          hint: startersError.hint
        },
        { status: 500 }
      );
    }

    console.log('Found prompt starters:', promptStarters?.length || 0);

    if (!promptStarters || promptStarters.length === 0) {
      return NextResponse.json({ 
        prompts: [],
        message: 'No prompt starters found for the selected agents'
      });
    }

    // Get unique agent and prompt IDs
    const uniqueAgentIds = [...new Set(promptStarters.map((s: any) => s.agent_id))];
    const uniquePromptIds = [...new Set(promptStarters.map((s: any) => s.prompt_id))];

    // Fetch agents data
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, name, title, category, expertise')
      .in('id', uniqueAgentIds);

    if (agentsError) {
      console.error('Error fetching agents:', agentsError);
    }

    // Fetch prompts data
    const { data: promptsData, error: promptsError } = await supabase
      .from('prompts')
      .select('id, name, display_name, description, domain, complexity_level, category')
      .in('id', uniquePromptIds);

    if (promptsError) {
      console.error('Error fetching prompts:', promptsError);
    }

    // Create lookup maps
    const agentsMap = new Map((agents || []).map((a: any) => [a.id, a]));
    const promptsMap = new Map((promptsData || []).map((p: any) => [p.id, p]));

    // Transform the data to match the expected format
    const prompts = promptStarters.map((starter: any) => {
      const agent = agentsMap.get(starter.agent_id);
      const prompt = promptsMap.get(starter.prompt_id);

      return {
        id: starter.id,
        prompt_id: starter.prompt_id,
        prompt_starter: starter.title,
        name: prompt?.name || `prompt_${starter.id}`,
        display_name: starter.title,
        description: starter.description,
        domain: prompt?.domain || starter.metadata?.domain || 'general',
        complexity_level: prompt?.complexity_level || starter.metadata?.complexity_level || 'intermediate',
        category: prompt?.category,
        tags: starter.tags || [],
        position: starter.position,
        agent: {
          id: agent?.id,
          name: agent?.name,
          title: agent?.title
        }
      };
    });

    // Get unique agents and domains
    const uniqueAgents = Array.from(
      new Set(prompts.map((p: any) => p.agent?.title || p.agent?.name).filter(Boolean))
    );
    const uniqueDomains = Array.from(
      new Set(prompts.map((p: any) => p.domain).filter(Boolean))
    );

    console.log('Returning prompts:', prompts.length);

    return NextResponse.json({
      prompts: prompts.slice(0, 4), // Return exactly 4 prompts
      agents: uniqueAgents,
      domains: uniqueDomains,
      total: promptStarters.length
    });

  } catch (error) {
    console.error('Error in prompt-starters API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
