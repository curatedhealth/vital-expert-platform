import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    console.log('🔍 [Agents CRUD] Fetching agents from database...');
    
    const { data: agents, error } = await supabaseAdmin
      .from('agents')
      .select(`
        id,
        name,
        display_name,
        description,
        business_function,
        capabilities,
        knowledge_domains,
        tier,
        status,
        model,
        avatar,
        color,
        metadata
      `)
      .eq('status', 'active')
      .order('tier', { ascending: true });

    if (error) {
      console.error('❌ [Agents CRUD] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch agents from database', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [Agents CRUD] Successfully fetched ${agents?.length || 0} agents`);
    
    return NextResponse.json({
      success: true,
      agents: agents || [],
      count: agents?.length || 0
    });
  } catch (error) {
    console.error('❌ [Agents CRUD] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({ message: 'Agents CRUD API endpoint' });
}