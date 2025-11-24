import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { env } from '@/config/environment';
import { createLogger } from '@/lib/services/observability/structured-logger';

// Note: We'll create the Supabase client per request to access cookies

/**
 * Resolve avatar URL from icons table
 * If avatar is a reference like "avatar_0001", fetch from icons table
 * Otherwise return the avatar as-is (could be emoji, URL, or path)
 */
async function resolveAvatarUrl(avatar: string | undefined, adminSupabase: any): Promise<string> {
  if (!avatar || avatar === '🤖') {
    return '🤖'; // Default emoji fallback
  }

  // If it's already a URL or path, return as-is
  if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/')) {
    return avatar;
  }

  try {
    // Step 1: Try to look up by exact name first (supports original icon names from database)
    const { data: iconByExactName, error: exactNameError } = await adminSupabase
      .from('icons')
      .select('file_url, file_path, name')
      .eq('name', avatar)
      .eq('category', 'avatar')
      .eq('is_active', true)
      .single();
    
    if (!exactNameError && iconByExactName) {
      // Found by exact name - prefer file_url if it's a full URL, otherwise use file_path
      let resolvedUrl = iconByExactName.file_url || iconByExactName.file_path;
      
      // If we have a resolved URL that's already a full path or URL, use it
      if (resolvedUrl && (resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://') || resolvedUrl.startsWith('/'))) {
        return resolvedUrl;
      }
      
      // If file_path exists but doesn't start with /, make it absolute
      if (resolvedUrl && !resolvedUrl.startsWith('/') && !resolvedUrl.startsWith('http')) {
        resolvedUrl = `/${resolvedUrl}`;
      }
      
      // If still no valid path, construct from icon name (original name, not normalized)
      if (!resolvedUrl) {
        const iconName = iconByExactName.name || avatar;
        // Use the actual icon name for path construction
        resolvedUrl = `/icons/png/avatars/${iconName}.png`;
      }
      
      return resolvedUrl;
    }

    // Step 2: If not found by exact name, try normalized pattern (avatar_XXXX)
    const avatarPattern = /^avatar_(\d{3,4})$/;
    const match = avatar.match(avatarPattern);
    
    if (match) {
      // Normalize to 4-digit format for lookup
      const num = match[1];
      const paddedNum = num.padStart(4, '0');
      const iconName = `avatar_${paddedNum}`;
      
      const { data: iconByNormalized, error: normalizedError } = await adminSupabase
        .from('icons')
        .select('file_url, file_path')
        .eq('name', iconName)
        .eq('category', 'avatar')
        .eq('is_active', true)
        .single();
      
      if (!normalizedError && iconByNormalized) {
        // Prefer file_url if it's a full URL, otherwise use file_path
        let resolvedUrl = iconByNormalized.file_url || iconByNormalized.file_path;
        
        if (resolvedUrl && (resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://') || resolvedUrl.startsWith('/'))) {
          return resolvedUrl;
        }
        
        // If file_path doesn't start with /, make it absolute
        if (resolvedUrl && !resolvedUrl.startsWith('/') && !resolvedUrl.startsWith('http')) {
          resolvedUrl = `/${resolvedUrl}`;
        }
        
        return resolvedUrl || `/icons/png/avatars/${iconName}.png`;
      }
      
      // Fallback: try the normalized path, but also log that icon wasn't found
      console.warn(`[Avatar Resolution] Icon "${iconName}" not found in database, using fallback path`);
      return `/icons/png/avatars/${iconName}.png`;
    }

    // Step 3: Try to extract number from various formats and normalize
    // Handle formats like "01arab_male..." or "avatar-011" or "avatar_png_0118"
    const leadingNumMatch = avatar.match(/^(\d{1,4})/);
    const dashMatch = avatar.match(/^avatar-(\d{1,4})$/);
    const pngMatch = avatar.match(/^avatar_png_(\d{3,4})$/);
    
    let extractedNum: string | null = null;
    if (pngMatch) {
      extractedNum = pngMatch[1];
    } else if (dashMatch) {
      extractedNum = dashMatch[1].padStart(3, '0');
    } else if (leadingNumMatch) {
      extractedNum = leadingNumMatch[1].padStart(3, '0');
    }
    
    if (extractedNum) {
      const normalizedName = `avatar_${extractedNum.padStart(4, '0')}`;
      const { data: iconByExtracted, error: extractedError } = await adminSupabase
        .from('icons')
        .select('file_url, file_path')
        .eq('name', normalizedName)
        .eq('category', 'avatar')
        .eq('is_active', true)
        .single();
      
      if (!extractedError && iconByExtracted) {
        return iconByExtracted.file_url || iconByExtracted.file_path || `/icons/png/avatars/${normalizedName}.png`;
      }
      
      // Fallback to local path
      return `/icons/png/avatars/${normalizedName}.png`;
    }
  } catch (error) {
    console.warn(`Failed to resolve avatar ${avatar} from icons table:`, error);
  }

  // Final fallback: return as-is (might be emoji or unknown format)
  return avatar;
}

async function normalizeAgent(agent: any, adminSupabase: any) {
  if (!agent) return null;

  // Normalize capabilities - use actual capabilities field from database
  let normalizedCapabilities: string[] = [];
  if (Array.isArray(agent.capabilities)) {
    normalizedCapabilities = agent.capabilities;
  } else if (typeof agent.capabilities === 'string') {
    const cleanString = agent.capabilities.replace(/[{}]/g, '');
    normalizedCapabilities = cleanString
      .split(',')
      .map((cap: string) => cap.trim())
      .filter((cap: string) => cap.length > 0);
  } else {
    normalizedCapabilities = ['General assistance'];
  }

  // Extract data from metadata
  const metadata = agent.metadata || {};

  // Resolve avatar URL from icons table if needed - use correct field name
  const avatarValue = agent.avatar || metadata.avatar || '🤖';
  const resolvedAvatar = await resolveAvatarUrl(avatarValue, adminSupabase);

  return {
    id: agent.id,
    name: agent.name,
    slug: agent.name?.toLowerCase().replace(/\s+/g, '-') || agent.id, // Generate slug from name
    display_name: metadata.display_name || agent.name, // display_name from metadata
    tagline: agent.description?.substring(0, 100) || '', // Use first 100 chars of description
    description: agent.description,
    title: metadata.display_name || agent.name,
    expertise_level: metadata.tier || metadata.expertise_level || 1, // tier from metadata
    system_prompt: agent.system_prompt,
    capabilities: normalizedCapabilities,
    specializations: metadata.specializations || [],
    knowledge_domains: agent.knowledge_domains || metadata.knowledge_domains || [],
    tier: metadata.tier || metadata.expertise_level || 1, // tier from metadata
    model: agent.model || metadata.model || 'gpt-4',
    avatar: resolvedAvatar,
    avatar_url: resolvedAvatar, // Use same resolved avatar for both fields
    color: metadata.color || '#3B82F6',
    temperature: metadata.temperature || 0.7,
    max_tokens: metadata.max_tokens || 2000,
    metadata: metadata,
    tags: metadata.tags || [],
    status: agent.status || 'active',
    is_custom: metadata.is_custom || false,
    business_function: metadata.business_function || null,
    department: metadata.department || null,
    role: metadata.role || null,
    created_at: agent.created_at,
    updated_at: agent.updated_at,
  };
}

export const GET = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext
) => {
  const logger = createLogger();
  const operationId = `agents_crud_get_${Date.now()}`;
  const startTime = Date.now();

  try {
    // Use user session client (RLS automatically applies tenant filtering)
    const supabase = await createClient();
    const { profile } = context;
    const tenantIds = env.getTenantIds();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('showAll') === 'true';

    logger.info('agents_crud_get_started', {
      operation: 'GET /api/agents-crud',
      operationId,
      userId: context.user.id,
      tenantId: profile.tenant_id,
      role: profile.role,
      showAll,
    });

    // Build query using user session (RLS enabled)
    // Only select columns that actually exist in the database
    let query = supabase
      .from('agents')
      .select(`
        id,
        name,
        description,
        avatar_url,
        system_prompt,
        model,
        status,
        metadata,
        capabilities,
        knowledge_domains,
        domain_expertise,
        created_at,
        updated_at
      `);

    // Apply status filtering - only show active or testing agents
    if (showAll && (profile.role === 'super_admin' || profile.role === 'admin')) {
      // Only super admins/admins with explicit showAll=true can see all agents across all statuses
      logger.debug('agents_crud_get_admin_view_all_tenants', { operationId });
    } else {
      // Everyone else sees only active/testing agents (ready for use)
      query = query.in('status', ['active', 'testing']);
      logger.debug('agents_crud_get_status_filtered', { operationId, tenantId: profile.tenant_id });
    }

    // Add ordering
    query = query.order('name', { ascending: true });

    const { data: agents, error } = await query;

    if (error) {
      const duration = Date.now() - startTime;
      logger.error(
        'agents_crud_get_failed',
        new Error(error.message),
        {
          operation: 'GET /api/agents-crud',
          operationId,
          duration,
          errorCode: error.code,
        }
      );

      return NextResponse.json(
        { error: 'Failed to fetch agents from database', details: error.message },
        { status: 500 }
      );
    }

    // Normalize agents - need admin client for icon resolution
    // This is safe because we're only reading public icon data
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseConfig = env.getSupabaseConfig();
    const adminSupabase = createSupabaseClient(
      supabaseConfig.url,
      supabaseConfig.serviceRoleKey
    );

    const normalizedAgents = await Promise.all(
      (agents || []).map(async (agent: any) => await normalizeAgent(agent, adminSupabase))
    );

    const validAgents = normalizedAgents.filter(Boolean);
    const duration = Date.now() - startTime;

    logger.infoWithMetrics('agents_crud_get_completed', duration, {
      operation: 'GET /api/agents-crud',
      operationId,
      agentCount: validAgents.length,
    });

    return NextResponse.json({
      success: true,
      agents: validAgents,
      count: validAgents.length,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'agents_crud_get_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'GET /api/agents-crud',
        operationId,
        duration,
      }
    );

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});

export const POST = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext
) => {
  const logger = createLogger();
  const operationId = `agents_crud_post_${Date.now()}`;
  const startTime = Date.now();

  try {
    // Use user session client (RLS will enforce tenant isolation)
    const supabase = await createClient();
    const { user, profile } = context;

    logger.info('agents_crud_post_started', {
      operation: 'POST /api/agents-crud',
      operationId,
      userId: user.id,
      tenantId: profile.tenant_id,
    });

    const body = await request.json();
    const agentData = body?.agentData;
    const categoryIds: string[] = Array.isArray(body?.categoryIds) ? body.categoryIds : [];

    // Validate required fields
    if (!agentData || !agentData.name || !agentData.system_prompt) {
      logger.warn('agents_crud_post_validation_failed', {
        operation: 'POST /api/agents-crud',
        operationId,
        reason: 'missing_required_fields',
      });

      return NextResponse.json(
        { success: false, error: 'Missing required agent fields (name and system_prompt)' },
        { status: 400 }
      );
    }

    // Prepare payload with proper ownership
    const { id: _unusedId, display_name, is_custom, ...rest } = agentData;
    const payload = {
      ...rest,
      name: agentData.name.trim(),
      // Set ownership fields
      created_by: user.id,
      tenant_id: profile.tenant_id,
      is_custom: is_custom !== false, // Default to true for user-created agents
      metadata: {
        display_name: display_name || agentData.name,
        is_custom: is_custom !== false,
        ...rest.metadata,
      },
    };

    // Insert using user session (RLS will enforce tenant isolation)
    const { data, error } = await supabase
      .from('agents')
      .insert(payload)
      .select()
      .single();

    if (error) {
      const duration = Date.now() - startTime;
      logger.error(
        'agents_crud_post_failed',
        new Error(error.message),
        {
          operation: 'POST /api/agents-crud',
          operationId,
          duration,
          errorCode: error.code,
        }
      );

      return NextResponse.json(
        { success: false, error: error.message || 'Failed to create agent' },
        { status: 500 }
      );
    }

    // Link categories if provided
    if (categoryIds.length > 0) {
      const mappings = categoryIds.map((categoryId) => ({
        agent_id: data.id,
        category_id: categoryId,
      }));

      const { error: categoryError } = await supabase
        .from('agent_category_mapping')
        .insert(mappings);

      if (categoryError) {
        const duration = Date.now() - startTime;
        logger.warn('agents_crud_post_category_failed', {
          operation: 'POST /api/agents-crud',
          operationId,
          duration,
          error: categoryError.message,
        });

        // Category link failure is non-critical - agent was created successfully
      }
    }

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('agents_crud_post_completed', duration, {
      operation: 'POST /api/agents-crud',
      operationId,
      agentId: data.id,
      agentName: data.name,
    });

    // Sync agent to Pinecone for GraphRAG (fire and forget - don't block response)
    try {
      const { agentEmbeddingService } = await import(
        '@/lib/services/agents/agent-embedding-service'
      );
      const { pineconeVectorService } = await import(
        '@/lib/services/vectorstore/pinecone-vector-service'
      );

      const embeddingData = await agentEmbeddingService.generateAgentEmbedding(data);
      await pineconeVectorService.syncAgentToPinecone({
        agentId: embeddingData.agentId,
        embedding: embeddingData.embedding,
        metadata: embeddingData.metadata,
      });

      // Also store in Supabase
      await agentEmbeddingService.storeAgentEmbeddingInSupabase(
        embeddingData.agentId,
        embeddingData.embedding,
        embeddingData.embeddingType,
        embeddingData.text
      );

      logger.debug('agents_crud_post_pinecone_synced', {
        operation: 'POST /api/agents-crud',
        operationId,
        agentId: data.id,
      });
    } catch (error) {
      // Non-critical - log but don't fail
      logger.warn('agents_crud_post_pinecone_failed', {
        operation: 'POST /api/agents-crud',
        operationId,
        agentId: data.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return NextResponse.json({
      success: true,
      agent: data,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'agents_crud_post_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'POST /api/agents-crud',
        operationId,
        duration,
      }
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});
