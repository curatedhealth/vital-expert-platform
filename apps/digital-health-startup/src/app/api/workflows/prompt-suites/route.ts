import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch active prompt suites with their subsuites
    const { data: suites, error: suitesError } = await supabase
      .from('dh_prompt_suite')
      .select(`
        id,
        unique_id,
        name,
        description,
        category,
        position
      `)
      .eq('is_active', true)
      .order('position');

    if (suitesError) {
      console.error('Error fetching prompt suites:', suitesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch prompt suites' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      suites: suites || [],
    });
  } catch (error) {
    console.error('Error in prompt suites API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

