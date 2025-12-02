import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withPromptAuth, type PromptPermissionContext } from '@/middleware/prompt-auth';
import { createLogger } from '@/lib/services/observability/structured-logger';
import { z } from 'zod';

// Validation schemas
const queryParamsSchema = z.object({
  domain: z.string().optional(),
  search: z.string().optional(),
  suite: z.string().optional(),
  userOnly: z.enum(['true', 'false']).optional(),
  userId: z.string().uuid().optional(),
});

const createPromptSchema = z.object({
  name: z.string().min(1).max(255),
  display_name: z.string().min(1).max(255),
  description: z.string().min(1),
  domain: z.string().min(1),
  system_prompt: z.string().min(1),
  user_prompt_template: z.string().min(1),
  category: z.string().optional(),
  complexity_level: z.enum(['simple', 'moderate', 'complex']).optional(),
  metadata: z.record(z.any()).optional(),
});

export const GET = withPromptAuth(async (
  request: NextRequest,
  context: PromptPermissionContext
) => {
  const logger = createLogger();
  const operationId = `prompts_get_${Date.now()}`;
  const startTime = Date.now();

  try {
    // Use user session client (RLS handles permissions)
    const supabase = await createClient();

    logger.info('prompts_get_started', {
      operation: 'GET /api/prompts',
      operationId,
      userId: context.user.id,
      tenantId: context.profile.tenant_id,
    });

    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const queryParams = queryParamsSchema.parse({
      domain: searchParams.get('domain') || undefined,
      search: searchParams.get('search') || undefined,
      suite: searchParams.get('suite') || undefined,
      userOnly: searchParams.get('userOnly') || undefined,
      userId: searchParams.get('userId') || undefined,
    });

    const suite = searchParams.get('suite');

    let query = supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (queryParams.domain && queryParams.domain !== 'all') {
      query = query.eq('domain', queryParams.domain);
    }

    if (queryParams.search) {
      query = query.or(
        `name.ilike.%${queryParams.search}%,display_name.ilike.%${queryParams.search}%,description.ilike.%${queryParams.search}%`
      );
    }

    if (queryParams.userOnly === 'true' && queryParams.userId) {
      query = query.eq('created_by', queryParams.userId);
    } else if (queryParams.userOnly === 'true') {
      // If userOnly is true but no userId, use context user ID
      query = query.eq('created_by', context.user.id);
    }

    const { data: allPrompts, error } = await query;

    if (error) {
      const duration = Date.now() - startTime;
      logger.error(
        'prompts_get_error',
        new Error(error.message),
        {
          operation: 'GET /api/prompts',
          operationId,
          duration,
          errorCode: error.code,
        }
      );

      return NextResponse.json(
        { error: 'Failed to fetch prompts', details: error.message },
        { status: 500 }
      );
    }
    
    // Filter for active prompts
    const prompts = allPrompts?.filter((p: any) => {
      const status = p.status || p.validation_status;
      // Show if active or no status (backward compatibility)
      return !status || status === 'active';
    }) || [];

    // Post-process to add derived fields and map suites based on role/function
    const enrichedPrompts = prompts?.map(prompt => {
      let suite = null;
      
      // Check if we have metadata with suite information
      if (prompt.metadata && typeof prompt.metadata === 'object') {
        const metadata = prompt.metadata as any;
        suite = metadata.suite || null;
      }
      
      // If no suite in metadata, infer from prompt name, content, and category
      if (!suite) {
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

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('prompts_get_completed', duration, {
      operation: 'GET /api/prompts',
      operationId,
      count: filteredPrompts.length,
    });

    return NextResponse.json({
      success: true,
      prompts: filteredPrompts,
      count: filteredPrompts.length,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof z.ZodError) {
      logger.warn('prompts_get_validation_error', {
        operation: 'GET /api/prompts',
        operationId,
        duration,
        errors: error.errors,
      });

      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    logger.error(
      'prompts_get_unexpected_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'GET /api/prompts',
        operationId,
        duration,
      }
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = withPromptAuth(async (
  request: NextRequest,
  context: PromptPermissionContext
) => {
  const logger = createLogger();
  const operationId = `prompts_post_${Date.now()}`;
  const startTime = Date.now();

  try {
    // Use user session client
    const supabase = await createClient();

    logger.info('prompts_post_started', {
      operation: 'POST /api/prompts',
      operationId,
      userId: context.user.id,
      tenantId: context.profile.tenant_id,
    });

    const body = await request.json();

    // Validate input with Zod
    const validatedData = createPromptSchema.parse(body);

    // Check for duplicate name
    const { data: existingPrompt } = await supabase
      .from('prompts')
      .select('id')
      .eq('name', validatedData.name)
      .single();

    if (existingPrompt) {
      const duration = Date.now() - startTime;
      logger.warn('prompts_post_duplicate_name', {
        operation: 'POST /api/prompts',
        operationId,
        duration,
        name: validatedData.name,
      });

      return NextResponse.json(
        { error: 'Prompt with this name already exists' },
        { status: 409 }
      );
    }

    // Insert prompt with ownership
    const { data: prompt, error } = await supabase
      .from('prompts')
      .insert({
        name: validatedData.name,
        display_name: validatedData.display_name,
        description: validatedData.description,
        domain: validatedData.domain,
        system_prompt: validatedData.system_prompt,
        user_prompt_template: validatedData.user_prompt_template,
        category: validatedData.category,
        complexity_level: validatedData.complexity_level,
        metadata: validatedData.metadata || {},
        created_by: context.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      const duration = Date.now() - startTime;
      logger.error(
        'prompts_post_error',
        new Error(error.message),
        {
          operation: 'POST /api/prompts',
          operationId,
          duration,
          errorCode: error.code,
        }
      );

      return NextResponse.json(
        { error: 'Failed to create prompt', details: error.message },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('prompts_post_completed', duration, {
      operation: 'POST /api/prompts',
      operationId,
      promptId: prompt.id,
    });

    return NextResponse.json(
      {
        success: true,
        prompt,
      },
      { status: 201 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof z.ZodError) {
      logger.warn('prompts_post_validation_error', {
        operation: 'POST /api/prompts',
        operationId,
        duration,
        errors: error.errors,
      });

      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    logger.error(
      'prompts_post_unexpected_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'POST /api/prompts',
        operationId,
        duration,
      }
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});