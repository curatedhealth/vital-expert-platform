import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    console.log('🔍 [Agents CRUD] Fetching agents from database...');

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('showAll') === 'true';

    // Query agents - only select columns that exist in remote schema
    const query = supabase
      .from('agents')
      .select(`
        id,
        name,
        description,
        system_prompt,
        capabilities,
        knowledge_domains,
        tier,
        model,
        avatar,
        color,
        metadata
      `);

    // Add ordering
    if (showAll) {
      query.order('name', { ascending: true });
    } else {
      query.order('tier', { ascending: true });
    }

    const { data: agents, error } = await query;

    if (error) {
      console.error('❌ [Agents CRUD] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch agents from database', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [Agents CRUD] Successfully fetched ${agents?.length || 0} agents`);

    // Normalize agents data
    const normalizedAgents = (agents || []).map(agent => {
      // Normalize capabilities
      let normalizedCapabilities = [];
      if (Array.isArray(agent.capabilities)) {
        normalizedCapabilities = agent.capabilities;
      } else if (typeof agent.capabilities === 'string') {
        const cleanString = agent.capabilities.replace(/[{}]/g, '');
        normalizedCapabilities = cleanString.split(',').map(cap => cap.trim()).filter(cap => cap.length > 0);
      } else {
        normalizedCapabilities = ['General assistance'];
      }

      // Normalize knowledge domains
      let normalizedDomains = [];
      if (Array.isArray(agent.knowledge_domains)) {
        normalizedDomains = agent.knowledge_domains;
      } else if (typeof agent.knowledge_domains === 'string') {
        const cleanString = agent.knowledge_domains.replace(/[{}]/g, '');
        normalizedDomains = cleanString.split(',').map(d => d.trim()).filter(d => d.length > 0);
      }

      return {
        ...agent,
        display_name: agent.name, // Add display_name for compatibility
        capabilities: normalizedCapabilities,
        knowledge_domains: normalizedDomains,
        status: 'active', // Add status for compatibility
        business_function: agent.metadata?.business_function || null,
        department: agent.metadata?.department || null,
        role: agent.metadata?.role || null
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
