import { NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';

export async function GET() {
  try {
    const supabase = getServiceSupabaseClient();

    console.log('Fetching all agents from library...');

    const { data: agents, error } = await supabase
      .from('dh_agent')
      .select('*')
      .or('status.eq.active,status.is.null')
      .order('name');

    if (error) {
      console.error('Error fetching agents:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch agents' },
        { status: 500 }
      );
    }

    console.log(`✅ Fetched ${agents?.length || 0} agents for library`);

    return NextResponse.json({
      success: true,
      agents: agents || [],
      count: agents?.length || 0,
    });
  } catch (error) {
    console.error('Error in agents API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

