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
      .order('tier', { ascending: true });

    if (error) {
      console.error('❌ [Agents CRUD] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch agents from database', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [Agents CRUD] Successfully fetched ${agents?.length || 0} agents`);
    
    // Normalize capabilities for all agents
    const normalizedAgents = (agents || []).map(agent => {
      let normalizedCapabilities = [];
      if (Array.isArray(agent.capabilities)) {
        normalizedCapabilities = agent.capabilities;
      } else if (typeof agent.capabilities === 'string') {
        // Parse string format like "{cap1,cap2,cap3}" or "cap1,cap2,cap3"
        const cleanString = agent.capabilities.replace(/[{}]/g, '');
        normalizedCapabilities = cleanString.split(',').map(cap => cap.trim()).filter(cap => cap.length > 0);
      } else {
        normalizedCapabilities = ['General assistance'];
      }

      return {
        ...agent,
        capabilities: normalizedCapabilities
      };
    });
    
    return NextResponse.json({
      success: true,
      agents: normalizedAgents,
      count: normalizedAgents.length
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