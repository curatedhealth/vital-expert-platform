import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: agents, error } = await supabase
      .from('dh_agent')
      .select('id, code, name, agent_type, framework, status')
      .or('status.eq.active,status.is.null')
      .order('name');

    if (error) {
      console.error('Error fetching agents:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch agents' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      agents: agents || [],
    });
  } catch (error) {
    console.error('Error in agents API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

