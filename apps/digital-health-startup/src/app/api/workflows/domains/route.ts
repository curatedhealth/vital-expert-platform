import { NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';

export async function GET() {
  try {
    const supabase = getServiceSupabaseClient();

    console.log('Fetching all knowledge domains from library...');

    const { data: domains, error } = await supabase
      .from('knowledge_domains')
      .select('domain_id, code, domain_name, slug, domain_description_llm, tier, is_active')
      .eq('is_active', true)
      .order('domain_name');

    if (error) {
      console.error('Error fetching knowledge domains:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch knowledge domains' },
        { status: 500 }
      );
    }

    console.log(`✅ Fetched ${domains?.length || 0} knowledge domains for library`);

    return NextResponse.json({
      success: true,
      domains: domains || [],
      count: domains?.length || 0,
    });
  } catch (error) {
    console.error('Error in knowledge domains API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

