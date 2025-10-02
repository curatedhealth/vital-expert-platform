import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

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
      // console.error('Error fetching prompts:', error);
      return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
    }

    // Post-process to add derived fields

      // Extract acronym from name

      // Determine suite based on acronym

      if (acronym) {
        if (['DRAFT', 'RADAR', 'REPLY', 'GUIDE'].includes(acronym)) suite = 'RULES™';
        else if (['DESIGN', 'QUALIFY', 'MONITOR', 'ENROLL'].includes(acronym)) suite = 'TRIALS™';
        else if (['DETECT', 'ASSESS', 'REPORT', 'SIGNAL'].includes(acronym)) suite = 'GUARD™';
        else if (['WORTH', 'PITCH', 'JUSTIFY', 'BUDGET'].includes(acronym)) suite = 'VALUE™';
        else if (['CONNECT', 'RESPOND', 'EDUCATE', 'ALIGN'].includes(acronym)) suite = 'BRIDGE™';
        else if (['STUDY', 'COMPARE', 'ANALYZE', 'PUBLISH'].includes(acronym)) suite = 'PROOF™';
        else if (['WRITE', 'PLAN', 'REVIEW', 'STYLE'].includes(acronym)) suite = 'CRAFT™';
        else if (['WATCH', 'TRACK', 'ASSESS', 'BRIEF'].includes(acronym)) suite = 'SCOUT™';
      }

      return {
        ...prompt,
        acronym,
        suite,
        is_user_created: prompt.created_by !== null
      };
    }) || [];

    // Apply suite filter after enrichment

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