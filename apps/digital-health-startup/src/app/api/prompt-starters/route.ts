/**
 * API Route: Fetch Prompt Starters for Selected Agents
 * Retrieves prompt starters from dh_agent_prompt_starter table
 * When clicked, the full detailed prompt is fetched from the prompts table
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@vital/sdk/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { agentIds } = await request.json();

    if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
      return NextResponse.json(
        { error: 'Agent IDs are required' },
        { status: 400 }
      );
    }

    // Fetch prompt starters from database with related agent and prompt data
    const { data: promptStarters, error: startersError } = await supabase
      .from('dh_agent_prompt_starter')
      .select(`
        id,
        title,
        description,
        tags,
        position,
        metadata,
        prompt_id,
        agent_id,
        agents:agent_id (
          id,
          name,
          title,
          category,
          expertise
        ),
        prompts:prompt_id (
          id,
          name,
          display_name,
          description,
          domain,
          complexity_level,
          category
        )
      `)
      .in('agent_id', agentIds)
      .order('agent_id', { ascending: true })
      .order('position', { ascending: true })
      .limit(20);

    if (startersError) {
      console.error('Error fetching prompt starters:', startersError);
      return NextResponse.json(
        { error: 'Failed to fetch prompt starters' },
        { status: 500 }
      );
    }

    if (!promptStarters || promptStarters.length === 0) {
      return NextResponse.json({ 
        prompts: [],
        message: 'No prompt starters found for the selected agents'
      });
    }

    // Transform the data to match the expected format
    const prompts = promptStarters.map((starter: any) => ({
      id: starter.id,
      prompt_id: starter.prompt_id, // Include the actual prompt ID to fetch full prompt later
      prompt_starter: starter.title,
      name: starter.prompts?.name || `prompt_${starter.id}`,
      display_name: starter.title,
      description: starter.description,
      domain: starter.prompts?.domain || starter.metadata?.domain || 'general',
      complexity_level: starter.prompts?.complexity_level || starter.metadata?.complexity_level || 'intermediate',
      category: starter.prompts?.category,
      tags: starter.tags || [],
      position: starter.position,
      agent: {
        id: starter.agents?.id,
        name: starter.agents?.name,
        title: starter.agents?.title
      }
    }));

    // Get unique agents and domains
    const uniqueAgents = Array.from(
      new Set(promptStarters.map((s: any) => s.agents?.title || s.agents?.name))
    );
    const uniqueDomains = Array.from(
      new Set(prompts.map((p: any) => p.domain))
    );

    return NextResponse.json({
      prompts: prompts.slice(0, 12), // Return up to 12 prompts
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
