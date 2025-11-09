import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: tools, error } = await supabase
      .from('dh_tool')
      .select('id, code, name, category, tool_type, is_active')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching tools:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch tools' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tools: tools || [],
    });
  } catch (error) {
    console.error('Error in tools API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

