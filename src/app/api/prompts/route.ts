import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const search = searchParams.get('search');
    const suite = searchParams.get('suite');
    const userOnly = searchParams.get('userOnly') === 'true';
    const userId = searchParams.get('userId');

    let query = supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (domain && domain !== 'all') {
      query = query.eq('domain', domain);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,display_name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (userOnly && userId) {
      query = query.eq('created_by', userId);
    }

    const { data: prompts, error } = await query;

    if (error) {
      console.error('Error fetching prompts:', error);
      return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
    }

    // Post-process to add derived fields
    const enrichedPrompts = prompts?.map(prompt => {
      return {
        ...prompt,
        suite: prompt.prism_suite || null,
        is_user_created: prompt.created_by !== null
      };
    }) || [];

    // Apply suite filter
    const filteredPrompts = suite
      ? enrichedPrompts.filter(p => p.suite === suite)
      : enrichedPrompts;

    return NextResponse.json(filteredPrompts);
  } catch (error) {
    // console.error('Error in GET /api/prompts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      display_name,
      description,
      domain,
      system_prompt,
      user_prompt_template,
      created_by
    } = body;

    // Validate required fields
    if (!name || !display_name || !description || !domain || !system_prompt || !user_prompt_template) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: prompt, error } = await supabase
      .from('prompts')
      .insert([{
        name,
        display_name,
        description,
        domain,
        system_prompt,
        user_prompt_template,
        created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      // console.error('Error creating prompt:', error);
      return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 });
    }

    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    // console.error('Error in POST /api/prompts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}