import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
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
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    // Get specific prompt by ID
    if (action === 'get' && id) {
      const { data: prompt, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, prompt });
    }

    // Get all prompts with filtering
    const domain = searchParams.get('domain');
    const search = searchParams.get('search');
    const suite = searchParams.get('suite');
    const complexity = searchParams.get('complexity');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('prompts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (domain && domain !== 'all') {
      query = query.eq('domain', domain);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,display_name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (complexity && complexity !== 'all') {
      query = query.eq('complexity_level', complexity);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: prompts, error, count } = await query
      .range(offset, offset + limit - 1);

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

    return NextResponse.json({
      success: true,
      prompts: filteredPrompts,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/prompts-crud:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
      complexity_level,
      system_prompt,
      user_prompt_template,
      prompt_starter,
      input_schema,
      output_schema,
      success_criteria,
      compliance_tags,
      estimated_tokens,
      model_requirements,
      tags,
      target_users,
      use_cases,
      regulatory_requirements,
      customization_guide,
      quality_assurance,
      created_by
    } = body;

    // Validate required fields
    if (!name || !display_name || !description || !domain || !system_prompt || !user_prompt_template) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, display_name, description, domain, system_prompt, user_prompt_template' 
      }, { status: 400 });
    }

    // Check if prompt name already exists
    const { data: existingPrompt } = await supabase
      .from('prompts')
      .select('id')
      .eq('name', name)
      .single();

    if (existingPrompt) {
      return NextResponse.json({ 
        error: 'Prompt with this name already exists' 
      }, { status: 409 });
    }

    // Generate prompt starter if not provided
    const generatedPromptStarter = prompt_starter || 
      (user_prompt_template ? user_prompt_template.split('\n')[0] + '...' : null);

    const { data: prompt, error } = await supabase
      .from('prompts')
      .insert([{
        name,
        display_name,
        description,
        domain,
        complexity_level: complexity_level || 'simple',
        system_prompt,
        user_prompt_template,
        prompt_starter: generatedPromptStarter,
        input_schema: input_schema || {},
        output_schema: output_schema || {},
        success_criteria: success_criteria || {},
        compliance_tags: compliance_tags || [],
        estimated_tokens: estimated_tokens || 1000,
        model_requirements: model_requirements || {},
        tags: tags || [],
        target_users: target_users || ['healthcare_professionals'],
        use_cases: use_cases || [domain],
        regulatory_requirements: regulatory_requirements || [],
        customization_guide: customization_guide || 'Customize variables in the user prompt template for specific use cases',
        quality_assurance: quality_assurance || 'Review output against success criteria and compliance requirements',
        status: 'active',
        version: '1.0.0',
        is_active: true,
        created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating prompt:', error);
      return NextResponse.json({ 
        error: 'Failed to create prompt',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      prompt 
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/prompts-crud:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
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
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    // Check if prompt exists
    const { data: existingPrompt, error: fetchError } = await supabase
      .from('prompts')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingPrompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // If name is being updated, check for duplicates
    if (updateData.name) {
      const { data: duplicatePrompt } = await supabase
        .from('prompts')
        .select('id')
        .eq('name', updateData.name)
        .neq('id', id)
        .single();

      if (duplicatePrompt) {
        return NextResponse.json({ 
          error: 'Prompt with this name already exists' 
        }, { status: 409 });
      }
    }

    // Generate prompt starter if user_prompt_template is updated
    if (updateData.user_prompt_template && !updateData.prompt_starter) {
      updateData.prompt_starter = updateData.user_prompt_template.split('\n')[0] + '...';
    }

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString();

    const { data: prompt, error } = await supabase
      .from('prompts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating prompt:', error);
      return NextResponse.json({ 
        error: 'Failed to update prompt',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      prompt 
    });

  } catch (error) {
    console.error('Error in PUT /api/prompts-crud:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    // Check if prompt exists
    const { data: existingPrompt, error: fetchError } = await supabase
      .from('prompts')
      .select('id, name')
      .eq('id', id)
      .single();

    if (fetchError || !existingPrompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Delete associated agent-prompt mappings first
    const { error: mappingError } = await supabase
      .from('agent_prompts')
      .delete()
      .eq('prompt_id', id);

    if (mappingError) {
      console.error('Error deleting agent-prompt mappings:', mappingError);
      // Continue with prompt deletion even if mappings fail
    }

    // Delete the prompt
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting prompt:', error);
      return NextResponse.json({ 
        error: 'Failed to delete prompt',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Prompt "${existingPrompt.name}" deleted successfully` 
    });

  } catch (error) {
    console.error('Error in DELETE /api/prompts-crud:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
