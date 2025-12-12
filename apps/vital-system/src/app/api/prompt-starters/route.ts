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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate that required environment variables are set
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set'
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
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
      .select(`
        id,
        prompt_starter,
        icon,
        category,
        sequence_order,
        is_active,
        agent_id,
        prompt_id,
        prompt:prompt_id (
          id,
          name,
          description,
          detailed_prompt,
          user_template
        )
      `)
      .in('agent_id', agentIds)
      .eq('is_active', true)
      // Filter out system prompts and other junky entries server-side
      .not('prompt_starter', 'ilike', 'system prompt%')
      .not('prompt_starter', 'ilike', 'system prompt for%')
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

    // Basic hygiene filter: drop empty texts and system-prompt placeholders
    const cleanedStarters = (promptStarters || []).filter(
      (starter) =>
        starter?.prompt_starter &&
        !/system prompt/i.test(starter.prompt_starter) &&
        starter.prompt_starter.trim().length > 12
    );

    // Only keep starters that have a linked detailed prompt
    // Type assertion needed because Supabase types don't properly infer joined relations
    const startersWithPrompt = cleanedStarters.filter(
      (starter) => (starter as any).prompt?.detailed_prompt || starter.prompt_id
    );

    // If some starters have prompt_id but the joined prompt is missing detailed_prompt, fetch it explicitly
    const missingDetailIds = startersWithPrompt
      .filter((s: any) => s.prompt_id && !s.prompt?.detailed_prompt)
      .map((s: any) => s.prompt_id);

    let promptDetails: Record<string, any> = {};
    if (missingDetailIds.length > 0) {
      const { data: promptRows, error: promptErr } = await supabase
        .from('prompts')
        .select('id, detailed_prompt, description')
        .in('id', missingDetailIds);
      if (!promptErr && promptRows) {
        promptDetails = Object.fromEntries(
          promptRows.map((r: any) => [r.id, r])
        );
      } else if (promptErr) {
        console.warn('Failed to fetch detailed prompts for starters', promptErr);
      }
    }

    // Format prompts directly from agent_prompt_starters table
    const prompts = startersWithPrompt.map((starter: any, idx: number) => {
      const complexity = inferComplexity(starter.category, starter.sequence_order, idx);
      const fallbackDetail = starter.prompt_id ? promptDetails[starter.prompt_id]?.detailed_prompt : null;
      const fallbackUser = starter.prompt_id ? promptDetails[starter.prompt_id]?.user_template : null;
      const fullPrompt =
        starter?.prompt?.detailed_prompt ||
        starter?.prompt?.user_template ||
        fallbackDetail ||
        fallbackUser ||
        starter.prompt_starter;
      return {
        id: starter.id,
        prompt_starter: starter.prompt_starter,
        name: starter.prompt_starter,
        display_name: starter.prompt_starter,
        description: starter.prompt_starter, // Use text as description
        full_prompt: fullPrompt,
        domain: starter.category || 'general',
        complexity_level: complexity,
        category: starter.category,
        tags: [],
        position: starter.sequence_order,
        icon: starter.icon || '💡',
        color: getCategoryColor(starter.category),
        prompt_id: starter.prompt_id || starter?.prompt?.id || null,
        agent: {
          id: starter.agent_id,
          name: 'Agent',
          title: 'Agent'
        }
      };
    });

    // Get unique categories for domains
    const uniqueDomains = Array.from(
      new Set(startersWithPrompt.map((p: any) => p.category).filter(Boolean))
    );

    console.log('Returning prompts:', prompts.length);

    return NextResponse.json({
      prompts, // return full set (front end can limit if desired)
      domains: uniqueDomains,
      total: startersWithPrompt.length
    });

  } catch (error) {
    console.error('Error in prompt-starters API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
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

// Basic inference for complexity levels if the category encodes it
function inferComplexity(category: string | null, seq?: number | null, idx?: number): string {
  if (category) {
    const value = category.toLowerCase();
    if (['basic', 'intermediate', 'advanced', 'expert'].includes(value)) {
      return value;
    }
  }
  // Use sequence_order when available to distribute across levels
  const position = Number.isFinite(seq) ? Number(seq) : idx ?? 0;
  const levels = ['basic', 'intermediate', 'advanced', 'expert'];
  return levels[position % levels.length];
}
