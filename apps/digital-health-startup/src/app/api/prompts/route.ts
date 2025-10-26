import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';



export async function GET(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);


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

    // Post-process to add derived fields and map PRISM suites
    const enrichedPrompts = prompts?.map(prompt => {
      // Map domain to PRISM suite
      let suite = null;
      if (prompt.name?.toLowerCase().includes('prism')) {
        if (prompt.name.toLowerCase().includes('rules') || prompt.domain === 'regulatory_affairs') {
          suite = 'RULES™';
        } else if (prompt.name.toLowerCase().includes('trials') || prompt.domain === 'clinical_research') {
          suite = 'TRIALS™';
        } else if (prompt.name.toLowerCase().includes('guard') || prompt.domain === 'pharmacovigilance') {
          suite = 'GUARD™';
        } else if (prompt.name.toLowerCase().includes('value') || prompt.domain === 'market_access') {
          suite = 'VALUE™';
        } else if (prompt.name.toLowerCase().includes('bridge') || prompt.domain === 'digital_health') {
          suite = 'BRIDGE™';
        } else if (prompt.name.toLowerCase().includes('proof') || prompt.domain === 'clinical_validation') {
          suite = 'PROOF™';
        } else if (prompt.name.toLowerCase().includes('craft') || prompt.domain === 'medical_writing') {
          suite = 'CRAFT™';
        } else if (prompt.name.toLowerCase().includes('scout') || prompt.domain === 'data_analytics') {
          suite = 'SCOUT™';
        } else if (prompt.name.toLowerCase().includes('project') || prompt.domain === 'project_management') {
          suite = 'PROJECT™';
        } else {
          suite = 'RULES™'; // Default to RULES for PRISM prompts
        }
      }
      
      return {
        ...prompt,
        suite: suite,
        is_user_created: prompt.created_by !== null
      };
    }) || [];

    // Apply suite filter
    const filteredPrompts = suite
      ? enrichedPrompts.filter((p: any) => p.suite === suite)
      : enrichedPrompts;

    return NextResponse.json(filteredPrompts);
  } catch (error) {
    // console.error('Error in GET /api/prompts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);


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