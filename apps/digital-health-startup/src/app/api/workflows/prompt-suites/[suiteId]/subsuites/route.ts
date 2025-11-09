import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { suiteId: string } }
) {
  try {
    const supabase = await createClient();
    const { suiteId } = params;

    // Fetch subsuites for the given suite
    const { data: subsuites, error } = await supabase
      .from('dh_prompt_subsuite')
      .select('id, unique_id, name, description, position')
      .eq('suite_id', suiteId)
      .eq('is_active', true)
      .order('position');

    if (error) {
      console.error('Error fetching subsuites:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch subsuites' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subsuites: subsuites || [],
    });
  } catch (error) {
    console.error('Error in subsuites API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

