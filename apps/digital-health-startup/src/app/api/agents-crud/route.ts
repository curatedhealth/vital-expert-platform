import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

  // Normalize capabilities
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
  
  // Resolve avatar URL from icons table if needed
  const avatarValue = metadata.avatar || '🤖';
  const resolvedAvatar = await resolveAvatarUrl(avatarValue, adminSupabase);
  
  return {
    id: agent.id,
    name: agent.name, // Keep unique ID for internal use
    display_name: metadata.display_name || agent.display_name || agent.name, // Prefer display_name, fallback to name
    description: agent.description,
    system_prompt: agent.system_prompt,
    capabilities: normalizedCapabilities,
    knowledge_domains: metadata.knowledge_domains || [],
    tier: metadata.tier || 1,
    model: metadata.model || 'gpt-4',
    avatar: resolvedAvatar, // Resolved avatar URL/path
    color: metadata.color || '#3B82F6',
    temperature: metadata.temperature || 0.7,
    max_tokens: metadata.max_tokens || 2000,
    metadata: metadata,
    status: metadata.status || 'active',
    is_custom: metadata.is_custom || false,
    business_function: metadata.business_function || null,
    department: metadata.department || null,
    role: metadata.role || null,
    created_at: agent.created_at,
    updated_at: agent.updated_at,
  };
}

export async function GET(request: Request) {
  try {
    // Create Supabase client for this request
    const supabase = await createClient();
    
    // Try to get user from session (optional - for tenant filtering)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    let userTenantId: string | null = null;
    let userRole: string = 'user';
    
    // If user is authenticated, get their tenant
    if (user && !userError) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single();

      userTenantId = profile?.tenant_id || null;
      userRole = profile?.role || 'user';
    }
    
    console.log(`🔍 [Agents CRUD] Fetching agents - User: ${user?.email || 'unauthenticated'}, Tenant: ${userTenantId || 'none'}, Role: ${userRole}`);

    const PLATFORM_TENANT_ID = '00000000-0000-0000-0000-000000000001';
    const STARTUP_TENANT_ID = '11111111-1111-1111-1111-111111111111';

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('showAll') === 'true';

    // Query agents - use minimal set of columns that definitely exist
    // Create admin client for query since we're using service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const adminSupabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);
    
    const query = adminSupabase
      .from('agents')
      .select(`
        id,
        name,
        description,
        system_prompt,
        capabilities,
        metadata,
        tenant_id,
        created_at,
        updated_at
      `);

    // Add ordering by name
    query.order('name', { ascending: true });

    // TENANT FILTERING: Show tenant-specific agents + global shared agents
    if (showAll || userRole === 'admin') {
      // Admin users can see all agents
      console.log(`📊 [Agents CRUD] Admin view - showing all agents`);
    } else if (userTenantId) {
      // User has a tenant: show their tenant's agents + platform agents
      if (userTenantId === STARTUP_TENANT_ID || userTenantId !== PLATFORM_TENANT_ID) {
        query.or(`tenant_id.eq.${userTenantId},tenant_id.eq.${PLATFORM_TENANT_ID}`);
        console.log(`📊 [Agents CRUD] Showing tenant-specific + platform agents`);
      } else {
        // User is on Platform tenant: only show global/platform agents
        query.eq('tenant_id', PLATFORM_TENANT_ID);
        console.log(`📊 [Agents CRUD] Showing only platform agents`);
      }
    } else {
      // No user or no tenant: show all agents (fallback for development)
      console.log(`📊 [Agents CRUD] No tenant info - showing all agents`);
    }

    const { data: agents, error } = await query;

    if (error) {
      console.error('❌ [Agents CRUD] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch agents from database', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [Agents CRUD] Successfully fetched ${agents?.length || 0} agents`);

    // Normalize agents data to match frontend expectations
    // Resolve avatars from icons table
    const normalizedAgents = await Promise.all(
      (agents || []).map(async (agent: any) => await normalizeAgent(agent, adminSupabase))
    );
    
    // Filter out any null values
    const validAgents = normalizedAgents.filter(Boolean);

    return NextResponse.json({
      success: true,
      agents: validAgents,
      count: validAgents.length
    });
  } catch (error) {
    console.error('❌ [Agents CRUD] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Create admin client for database operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const adminSupabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);
    
    const body = await request.json();
    const agentData = body?.agentData;
    const categoryIds: string[] = Array.isArray(body?.categoryIds) ? body.categoryIds : [];

    if (!agentData || !agentData.name || !agentData.system_prompt) {
      return NextResponse.json(
        { success: false, error: 'Missing required agent fields' },
        { status: 400 }
      );
    }

    const { id: _unusedId, display_name, is_custom, ...rest } = agentData;
    const payload = {
      ...rest,
      name: agentData.name.trim(),
      metadata: {
        display_name: display_name || agentData.name,
        is_custom: is_custom || false,
        ...rest.metadata,
      },
    };

    const { data, error } = await adminSupabase
      .from('agents')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('❌ [Agents CRUD] Failed to create agent:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to create agent' },
        { status: 500 }
      );
    }

    if (categoryIds.length > 0) {
      const mappings = categoryIds.map(categoryId => ({
        agent_id: data.id,
        category_id: categoryId,
      }));

      const { error: categoryError } = await adminSupabase
        .from('agent_category_mapping')
        .insert(mappings);

      if (categoryError) {
        console.error('❌ [Agents CRUD] Failed to link categories:', categoryError);
        return NextResponse.json(
          {
            success: false,
            error: categoryError.message || 'Failed to attach categories to agent',
          },
          { status: 500 }
        );
      }
    }

    // Sync agent to Pinecone for GraphRAG (fire and forget - don't block response)
    try {
      const { agentEmbeddingService } = await import('@/lib/services/agents/agent-embedding-service');
      const { pineconeVectorService } = await import('@/lib/services/vectorstore/pinecone-vector-service');

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

      console.log(`✅ [Agents CRUD] Agent synced to Pinecone for GraphRAG`);
    } catch (error) {
      // Non-critical - log but don't fail
      console.warn('⚠️ [Agents CRUD] Failed to sync agent to Pinecone (non-critical):', error);
    }

    return NextResponse.json({
      success: true,
      agent: data,
    });
  } catch (error) {
    console.error('❌ [Agents CRUD] Unexpected error (POST):', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
