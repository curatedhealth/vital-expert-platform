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

    // Get current user's tenant_id from the request headers (set by middleware)
    const tenantId = request.headers.get('x-tenant-id');
    const showAll = searchParams.get('showAll') === 'true';

    console.log('Prompts API: Loading prompts...', { tenantId, showAll });

    // Get specific prompt by ID
    if (action === 'get' && id) {
      let promptQuery = supabase
        .from('prompts')
        .select('*')
        .eq('id', id);

      // Apply tenant filter using allowed_tenants array unless showAll is true
      if (!showAll && tenantId) {
        promptQuery = promptQuery.contains('allowed_tenants', [tenantId]);
      }

      const { data: prompt, error } = await promptQuery.single();

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
    const limit = parseInt(searchParams.get('limit') || '10000');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('prompts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply tenant filtering using allowed_tenants array unless showAll is true
    if (!showAll && tenantId) {
      console.log('Prompts API: Applying tenant filter:', tenantId);
      query = query.contains('allowed_tenants', [tenantId]);
    } else {
      console.log('Prompts API: Loading all prompts (showAll=true or no tenant)');
    }

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

    // Post-process to add derived fields and map PRISM suites based on role/function
    const enrichedPrompts = prompts?.map(prompt => {
      let suite = null;
      
      // Get text to analyze for suite classification
      const nameLower = (prompt.name || '').toLowerCase();
      const contentLower = (prompt.content || '').toLowerCase();
      const categoryLower = (prompt.category || '').toLowerCase();
      const titleLower = (prompt.title || '').toLowerCase();
      
      // RULES™ - Regulatory Excellence (FDA, EMA, compliance, regulatory affairs)
      const rulesKeywords = ['regulatory', 'fda', 'ema', 'compliance', 'gmp', 'quality', 'validation', 'audit', 'cmc', 'nda', 'bla', 'ind', 'submission', 'dossier', 'deficiency', 'guidance', 'approval'];
      
      // TRIALS™ - Clinical Development (clinical trials, protocols, investigators)
      const trialsKeywords = ['clinical trial', 'protocol', 'investigator', 'study design', 'endpoint', 'randomization', 'placebo', 'phase i', 'phase ii', 'phase iii', 'clinical operations', 'site selection', 'patient recruitment', 'clinical data', 'cro', 'irb', 'ethics committee', 'informed consent', 'clinical study'];
      
      // GUARD™ - Safety Framework (pharmacovigilance, adverse events, safety)
      const guardKeywords = ['safety', 'pharmacovigilance', 'adverse event', 'signal detection', 'risk management', 'psur', 'pbrer', 'aggregate report', 'safety database', 'medical monitor', 'toxicology', 'genotoxicity', 'carcinogenicity', 'reproductive toxicology'];
      
      // VALUE™ - Market Access (HEOR, pricing, reimbursement, payer)
      const valueKeywords = ['market access', 'heor', 'health economics', 'pricing', 'reimbursement', 'payer', 'formulary', 'hta', 'value dossier', 'cost-effectiveness', 'budget impact', 'outcomes research', 'national account', 'contracting', 'gross-to-net'];
      
      // BRIDGE™ - Stakeholder Engagement (MSL, KOL, medical affairs)
      const bridgeKeywords = ['medical science liaison', 'msl', 'kol', 'key opinion leader', 'medical affairs', 'advisory board', 'speaker program', 'medical information', 'field medical', 'regional medical', 'therapeutic area'];
      
      // PROOF™ - Evidence Analytics (real-world evidence, data analysis, outcomes)
      const proofKeywords = ['real-world evidence', 'rwe', 'evidence synthesis', 'systematic review', 'meta-analysis', 'data analysis', 'biostatistic', 'epidemiolog', 'database analysis', 'patient-reported outcomes', 'pro study'];
      
      // CRAFT™ - Medical Writing (publications, manuscripts, medical writing)
      const craftKeywords = ['medical writer', 'publication', 'manuscript', 'abstract', 'poster', 'medical content', 'medical editor', 'medical communication', 'scientific writing', 'document'];
      
      // SCOUT™ - Competitive Intelligence (market research, competitive analysis)
      const scoutKeywords = ['competitive intelligence', 'market research', 'brand strategy', 'brand manager', 'marketing', 'customer insight', 'omnichannel', 'digital marketing', 'sales force', 'territory design'];
      
      // PROJECT™ - Project Management (project coordination, operations)
      const projectKeywords = ['project', 'operations', 'coordination', 'planning', 'scheduling', 'manufacturing', 'supply chain', 'inventory', 'logistics', 'warehouse', 'production', 'process optimization'];
      
      // FORGE™ - Digital Health (digital therapeutics, AI, software)
      const forgeKeywords = ['digital health', 'digital therapeutic', 'dtx', 'samd', 'software', 'ai ', 'machine learning', 'nlp', 'natural language', 'digital biomarker', 'mobile health', 'telemedicine', 'organ-on-chip', 'organoid', 'in silico', '3d bioprinting'];
      
      // Helper function to check if text contains any keywords
      const containsKeywords = (text: string, keywords: string[]) => 
        keywords.some(keyword => text.includes(keyword));
      
      const combinedText = `${nameLower} ${contentLower} ${titleLower}`;
      
      // Check each suite in priority order
      if (containsKeywords(combinedText, forgeKeywords)) {
        suite = 'FORGE™';
      } else if (containsKeywords(combinedText, guardKeywords)) {
        suite = 'GUARD™';
      } else if (containsKeywords(combinedText, trialsKeywords)) {
        suite = 'TRIALS™';
      } else if (containsKeywords(combinedText, valueKeywords)) {
        suite = 'VALUE™';
      } else if (containsKeywords(combinedText, bridgeKeywords)) {
        suite = 'BRIDGE™';
      } else if (containsKeywords(combinedText, proofKeywords)) {
        suite = 'PROOF™';
      } else if (containsKeywords(combinedText, craftKeywords)) {
        suite = 'CRAFT™';
      } else if (containsKeywords(combinedText, scoutKeywords)) {
        suite = 'SCOUT™';
      } else if (containsKeywords(combinedText, projectKeywords)) {
        suite = 'PROJECT™';
      } else if (containsKeywords(combinedText, rulesKeywords)) {
        suite = 'RULES™';
      } else if (categoryLower === 'clinical') {
        suite = 'TRIALS™';
      } else if (categoryLower === 'regulatory') {
        suite = 'RULES™';
      } else if (categoryLower === 'market-access') {
        suite = 'VALUE™';
      } else if (categoryLower === 'medical-affairs') {
        suite = 'BRIDGE™';
      } else {
        // Default based on common patterns in name
        if (nameLower.includes('analyst') || nameLower.includes('data')) {
          suite = 'PROOF™';
        } else if (nameLower.includes('manager') || nameLower.includes('coordinator')) {
          suite = 'PROJECT™';
        } else {
          suite = 'RULES™';
        }
      }
      
      return {
        ...prompt,
        suite: suite,
        // Use title as display_name if available, otherwise use name
        display_name: prompt.title || prompt.name,
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
