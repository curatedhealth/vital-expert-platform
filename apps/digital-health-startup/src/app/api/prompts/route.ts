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
      // Filter for active prompts - check both status and validation_status
      .order('created_at', { ascending: false });
    
    // Apply active filter (try status first, then validation_status, then show all if neither exists)
    // We'll filter in post-processing since Supabase query builder doesn't handle OR well with nulls

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

    const { data: allPrompts, error } = await query;

    if (error) {
      console.error('Error fetching prompts:', error);
      return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
    }
    
    // Filter for active prompts
    const prompts = allPrompts?.filter((p: any) => {
      const status = p.status || p.validation_status;
      // Show if active or no status (backward compatibility)
      return !status || status === 'active';
    }) || [];

    // Post-process to add derived fields and map suites from metadata
    const enrichedPrompts = prompts?.map(prompt => {
      // Extract suite from metadata (stored in Supabase)
      // Try to get suite from metadata first (from CSV import)
      let suite = null;
      
      // Check if we have metadata with suite information
      if (prompt.metadata && typeof prompt.metadata === 'object') {
        const metadata = prompt.metadata as any;
        suite = metadata.suite || null;
      }
      
      // If no suite in metadata, try to infer from name/domain/display_name
      if (!suite) {
        const nameLower = (prompt.name || '').toLowerCase();
        const displayNameLower = (prompt.display_name || '').toLowerCase();
        const categoryLower = (prompt.category || '').toLowerCase();
        const domainLower = (prompt.domain || '').toLowerCase();
        
        // Check for suite prefixes (e.g., "GUARD_MANAGE_PV...", "VALUE_BUDGET...")
        // These prompts from CSV have suite prefixes in their names
        if (nameLower.startsWith('rules') || displayNameLower.includes('rules') || nameLower.includes('_rules_') || domainLower.includes('regulatory')) {
          suite = 'RULES™';
        } else if (nameLower.startsWith('trial') || displayNameLower.includes('trial') || nameLower.includes('_trial_') || domainLower.includes('clinical')) {
          suite = 'TRIALS™';
        } else if (nameLower.startsWith('guard') || displayNameLower.includes('guard') || nameLower.includes('_guard_') || nameLower.includes('guard_') || domainLower.includes('safety')) {
          suite = 'GUARD™';
        } else if (nameLower.startsWith('value') || displayNameLower.includes('value') || nameLower.includes('_value_') || nameLower.includes('value_') || domainLower.includes('commercial')) {
          suite = 'VALUE™';
        } else if (nameLower.startsWith('bridge') || displayNameLower.includes('bridge') || nameLower.includes('_bridge_') || nameLower.includes('bridge_')) {
          suite = 'BRIDGE™';
        } else if (nameLower.startsWith('proof') || displayNameLower.includes('proof') || nameLower.includes('_proof_') || nameLower.includes('proof_')) {
          suite = 'PROOF™';
        } else if (nameLower.startsWith('craft') || displayNameLower.includes('craft') || nameLower.includes('_craft_') || nameLower.includes('craft_')) {
          suite = 'CRAFT™';
        } else if (nameLower.startsWith('scout') || displayNameLower.includes('scout') || nameLower.includes('_scout_') || nameLower.includes('scout_')) {
          suite = 'SCOUT™';
        } else if (nameLower.startsWith('project') || displayNameLower.includes('project') || nameLower.includes('_project_') || nameLower.includes('project_') || domainLower.includes('project')) {
          suite = 'PROJECT™';
        } else if (nameLower.startsWith('forge') || displayNameLower.includes('forge') || nameLower.includes('_forge_') || nameLower.includes('forge_')) {
          suite = 'FORGE™';
        } else {
          // Default to RULES if we can't determine
          suite = 'RULES™';
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