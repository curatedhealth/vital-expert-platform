import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const suiteId = searchParams.get('suiteId');
    const subsuiteId = searchParams.get('subsuiteId');

    let query = supabase
      .from('dh_prompt')
      .select(`
        id,
        unique_id,
        code,
        title,
        description,
        content_template,
        category,
        tags
      `)
      .eq('is_active', true);

    // If suite/subsuite specified, filter by assignments
    if (suiteId) {
      const { data: assignments } = await supabase
        .from('dh_prompt_suite_prompt')
        .select('prompt_id')
        .eq('suite_id', suiteId)
        .eq('subsuite_id', subsuiteId || null);

      if (assignments && assignments.length > 0) {
        const promptIds = assignments.map(a => a.prompt_id);
        query = query.in('id', promptIds);
      }
    }

    const { data: prompts, error } = await query.order('title');

    if (error) {
      console.error('Error fetching prompts:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch prompts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      prompts: prompts || [],
    });
  } catch (error) {
    console.error('Error in prompts API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

