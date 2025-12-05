import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const fallbackLevels = [
  { id: '1', name: 'L1 - Orchestrator', level_number: 1, slug: 'orchestrator', description: 'Top-level orchestration agents' },
  { id: '2', name: 'L2 - Supervisor', level_number: 2, slug: 'supervisor', description: 'Supervising and coordinating agents' },
  { id: '3', name: 'L3 - Specialist', level_number: 3, slug: 'specialist', description: 'Domain specialist agents' },
  { id: '4', name: 'L4 - Worker', level_number: 4, slug: 'worker', description: 'Task execution agents' },
  { id: '5', name: 'L5 - Tool', level_number: 5, slug: 'tool', description: 'Tool-level agents' },
];

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('[Agent Levels API] Supabase configuration missing, using fallback');
      return NextResponse.json({ success: true, data: fallbackLevels });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: levels, error } = await supabase
      .from('agent_levels')
      .select('id, name, slug, description, level_number, can_spawn_lower_levels')
      .order('level_number');

    if (error) {
      console.warn('[Agent Levels API] Database error, using fallback:', error.code);
      return NextResponse.json({ success: true, data: fallbackLevels });
    }

    console.log('[Agent Levels API] Loaded', levels?.length || 0, 'levels');

    return NextResponse.json({
      success: true,
      data: levels || fallbackLevels,
    });
  } catch (error) {
    console.error('[Agent Levels API] Error:', error);
    return NextResponse.json({ success: true, data: fallbackLevels });
  }
}
