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
      .from('agent_prompt_starters')
      .select('id, text, icon, category, sequence_order, is_active, agent_id')
      .in('agent_id', agentIds)
      .eq('is_active', true)
      .order('sequence_order', { ascending: true })
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

    // Format prompts directly from agent_prompt_starters table
    const prompts = promptStarters.map((starter: any) => ({
      id: starter.id,
      prompt_starter: starter.text,
      name: starter.text,
      display_name: starter.text,
      description: starter.text, // Use text as description
      domain: starter.category || 'general',
      complexity_level: 'intermediate',
      category: starter.category,
      tags: [],
      position: starter.sequence_order,
      icon: starter.icon || '💡',
      color: getCategoryColor(starter.category),
      agent: {
        id: starter.agent_id,
        name: 'Agent',
        title: 'Agent'
      }
    }));

    // Get unique categories for domains
    const uniqueDomains = Array.from(
      new Set(prompts.map((p: any) => p.category).filter(Boolean))
    );

    console.log('Returning prompts:', prompts.length);

    return NextResponse.json({
      prompts: prompts.slice(0, 4), // Return exactly 4 prompts
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

// Helper function to get color based on category
function getCategoryColor(category: string | null): string {
  const colorMap: Record<string, string> = {
    'Analytics': 'blue',
    'Government': 'purple',
    'Regulatory': 'green',
    'Clinical': 'orange',
    'Market': 'cyan',
  };
  return colorMap[category || ''] || 'gray';
}
