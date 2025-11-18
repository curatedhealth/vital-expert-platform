import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * GET /api/knowledge-domains
 * Fetches all available RAG knowledge domains from the database
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch knowledge domains from database
    const { data: domains, error } = await supabase
      .from('knowledge_domains')
      .select('code, name, tier, priority')
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching knowledge domains:', error);
      return NextResponse.json(
        { error: 'Failed to fetch knowledge domains', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      domains: domains || [],
      count: domains?.length || 0,
    });
  } catch (error) {
    console.error('Unexpected error in knowledge-domains API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
