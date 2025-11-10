import { NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';

export async function GET() {
  try {
    const supabase = getServiceSupabaseClient();

    console.log('Fetching all tools from library...');

    const { data: tools, error } = await supabase
      .from('dh_tool')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching tools:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch tools' },
        { status: 500 }
      );
    }

    console.log(`✅ Fetched ${tools?.length || 0} tools for library`);

    return NextResponse.json({
      success: true,
      tools: tools || [],
      count: tools?.length || 0,
    });
  } catch (error) {
    console.error('Error in tools API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

