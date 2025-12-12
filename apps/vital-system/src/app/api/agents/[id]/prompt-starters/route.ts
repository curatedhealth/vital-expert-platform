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

    // Query agent_prompt_starters table (the actual table with data)
    // This table has: id, agent_id, prompt_starter, icon, category, sequence_order, is_active, prompt_id
    // Prompts table has: name, prompt_starter, description, detailed_prompt, category (NOT display_name or user_prompt_template)
    const { data: promptStarters, error } = await supabase
      .from('agent_prompt_starters')
      .select(`
        id,
        prompt_starter,
        icon,
        category,
        sequence_order,
        is_active,
        prompt_id,
        prompts (
          id,
          name,
          prompt_starter,
          description,
          detailed_prompt,
          category
        )
      `)
      .eq('agent_id', agentId)
      .eq('is_active', true)
      .order('sequence_order', { ascending: true });

    if (error) {
      console.error('Error fetching prompt starters:', error);
      // Return empty array on error (table might not have prompts join)
      return NextResponse.json([]);
    }

    // Format the prompt starters for the frontend
    // Primary source: agent_prompt_starters fields
    // Secondary source: joined prompts table for full template
    // Note: Returns Lucide icon names (not emojis) for consistent design system
    const formattedStarters = (promptStarters || []).map((starter: any) => {
      const linkedPrompt = starter.prompts;
      const category = starter.category || linkedPrompt?.category;
      return {
        text: starter.prompt_starter,
        description: linkedPrompt?.description || starter.category || '',
        fullPrompt: linkedPrompt?.detailed_prompt || starter.prompt_starter,
        color: getColorForCategory(category),
        icon: getLucideIconForCategory(category)
      };
    });

    return NextResponse.json(formattedStarters);
  } catch (error) {
    console.error('Error in GET /api/agents/[id]/prompt-starters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to determine color based on category/domain
function getColorForCategory(category: string | null | undefined): string {
  if (!category) return 'blue';

  const colorMap: Record<string, string> = {
    // Categories from agent_prompt_starters
    'analytics': 'cyan',
    'reporting': 'green',
    'research': 'purple',
    'compliance': 'red',
    'strategy': 'orange',
    'operations': 'teal',
    'communication': 'pink',
    'government': 'blue',
    // Legacy domain mappings
    'regulatory': 'blue',
    'clinical': 'purple',
    'reimbursement': 'green',
    'medical-writing': 'orange',
    'quality': 'red',
    'pharmacovigilance': 'pink',
    'health-economics': 'cyan',
    'market-access': 'teal'
  };

  return colorMap[category.toLowerCase()] || 'blue';
}

// Helper function to return Lucide React icon name based on category
// Frontend will use dynamic import to render the icon component
function getLucideIconForCategory(category: string | null | undefined): string {
  if (!category) return 'MessageSquare';

  const iconMap: Record<string, string> = {
    // Categories from agent_prompt_starters
    'analytics': 'BarChart3',
    'reporting': 'FileText',
    'research': 'Search',
    'compliance': 'ShieldCheck',
    'strategy': 'Target',
    'operations': 'Settings',
    'communication': 'MessageCircle',
    'government': 'Building2',
    // Legacy domain mappings
    'regulatory': 'Scale',
    'clinical': 'Stethoscope',
    'reimbursement': 'DollarSign',
    'medical-writing': 'PenTool',
    'quality': 'CheckCircle2',
    'pharmacovigilance': 'AlertTriangle',
    'health-economics': 'TrendingUp',
    'market-access': 'Globe'
  };

  return iconMap[category.toLowerCase()] || 'MessageSquare';
}
