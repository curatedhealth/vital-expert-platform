import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { id: agentId } = await params;

    // First verify the agent exists
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('name, display_name')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Query agent_prompts table to get linked prompts
    const { data: agentPrompts, error } = await supabase
      .from('agent_prompts')
      .select(`
        prompts (
          id,
          name,
          display_name,
          description,
          user_prompt_template,
          domain,
          category,
          icon_name
        )
      `)
      .eq('agent_id', agentId);

    if (error) {
      console.error('Error fetching prompt starters:', error);
      return NextResponse.json([]);
    }

    // Format the prompt starters for the frontend
    const formattedStarters = agentPrompts
      ?.map((ap: any) => ap.prompts)
      .filter((prompt: any) => prompt !== null)
      .map((prompt: any) => ({
        text: prompt.display_name || prompt.name,
        description: prompt.description || '',
        fullPrompt: prompt.user_prompt_template || '',
        color: getColorForDomain(prompt.domain),
        icon: prompt.icon_name || '📋'
      })) || [];

    return NextResponse.json(formattedStarters);
  } catch (error) {
    console.error('Error in GET /api/agents/[id]/prompt-starters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to determine color based on domain
function getColorForDomain(domain: string): string {
  const colorMap: Record<string, string> = {
    'regulatory': 'blue',
    'clinical': 'purple',
    'reimbursement': 'green',
    'medical-writing': 'orange',
    'quality': 'red',
    'pharmacovigilance': 'pink',
    'health-economics': 'cyan',
    'market-access': 'teal'
  };

  return colorMap[domain] || 'blue';
}
