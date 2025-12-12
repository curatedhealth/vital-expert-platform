import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { env } from '@/config/environment';
import { createLogger } from '@/lib/services/observability/structured-logger';

// Note: We'll create the Supabase client per request to access cookies

// ============================================================================
// PERFORMANCE OPTIMIZATION: In-memory cache for agents list
// ============================================================================
interface CacheEntry {
  data: any[];
  timestamp: number;
}

const agentsCache: Map<string, CacheEntry> = new Map();
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache TTL

function getCachedAgents(cacheKey: string): any[] | null {
  const entry = agentsCache.get(cacheKey);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  return null;
}

function setCachedAgents(cacheKey: string, data: any[]): void {
  agentsCache.set(cacheKey, { data, timestamp: Date.now() });
}

// ============================================================================
// PERFORMANCE OPTIMIZATION: Batch avatar resolution
// Resolves ALL avatars in a single query instead of per-agent queries
// ============================================================================
async function batchResolveAvatarUrls(
  avatarNames: string[],
  adminSupabase: any
): Promise<Map<string, string>> {
  const avatarMap = new Map<string, string>();

  // Filter out avatars that don't need DB lookup
  const needsLookup: string[] = [];
  for (const avatar of avatarNames) {
    if (!avatar || avatar === '🤖') {
      avatarMap.set(avatar || '', '🤖');
    } else if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/')) {
      avatarMap.set(avatar, avatar);
    } else {
      needsLookup.push(avatar);
    }
  }

  if (needsLookup.length === 0) {
    return avatarMap;
  }

  try {
    // Normalize avatar names for lookup
    const normalizedNames = new Set<string>();
    const avatarToNormalized = new Map<string, string>();

    for (const avatar of needsLookup) {
      // Try to extract and normalize avatar number
      const avatarPattern = /^avatar_(\d{3,4})$/;
      const match = avatar.match(avatarPattern);

      if (match) {
        const paddedNum = match[1].padStart(4, '0');
        const iconName = `avatar_${paddedNum}`;
        normalizedNames.add(iconName);
        avatarToNormalized.set(avatar, iconName);
      } else {
        // Try other patterns
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
          normalizedNames.add(normalizedName);
          avatarToNormalized.set(avatar, normalizedName);
        } else {
          // Try exact name lookup
          normalizedNames.add(avatar);
          avatarToNormalized.set(avatar, avatar);
        }
      }
    }

    // Single batch query for all icons
    const { data: icons, error } = await adminSupabase
      .from('icons')
      .select('name, file_url, file_path')
      .in('name', Array.from(normalizedNames))
      .eq('category', 'avatar')
      .eq('is_active', true);

    if (error) {
      console.warn('[Batch Avatar Resolution] Query error:', error.message);
    }

    // Build lookup map from results
    const iconLookup = new Map<string, string>();
    if (icons) {
      for (const icon of icons) {
        let resolvedUrl = icon.file_url || icon.file_path;
        if (resolvedUrl && !resolvedUrl.startsWith('/') && !resolvedUrl.startsWith('http')) {
          resolvedUrl = `/${resolvedUrl}`;
        }
        if (!resolvedUrl) {
          resolvedUrl = `/icons/png/avatars/${icon.name}.png`;
        }
        iconLookup.set(icon.name, resolvedUrl);
      }
    }

    // Map original avatar names to resolved URLs
    for (const avatar of needsLookup) {
      const normalized = avatarToNormalized.get(avatar);
      if (normalized && iconLookup.has(normalized)) {
        avatarMap.set(avatar, iconLookup.get(normalized)!);
      } else if (normalized) {
        // Fallback to local path
        avatarMap.set(avatar, `/icons/png/avatars/${normalized}.png`);
      } else {
        // Keep original value
        avatarMap.set(avatar, avatar);
      }
    }
  } catch (error) {
    console.warn('[Batch Avatar Resolution] Error:', error);
    // Fallback: set all to default paths
    for (const avatar of needsLookup) {
      avatarMap.set(avatar, avatar);
    }
  }

  return avatarMap;
}

/**
 * Resolve avatar URL from icons table
 * If avatar is a reference like "avatar_0001", fetch from icons table
 * Otherwise return the avatar as-is (could be emoji, URL, or path)
 * @deprecated Use batchResolveAvatarUrls for better performance
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

// Fast synchronous normalization using pre-resolved avatar map
function normalizeAgentFast(agent: any, avatarMap: Map<string, string>) {
  if (!agent) return null;

  // Normalize specializations (used to be capabilities)
  let normalizedCapabilities: string[] = [];
  if (Array.isArray(agent.specializations)) {
    normalizedCapabilities = agent.specializations;
  } else if (typeof agent.specializations === 'string') {
    const cleanString = agent.specializations.replace(/[{}]/g, '');
    normalizedCapabilities = cleanString
      .split(',')
      .map((cap: string) => cap.trim())
      .filter((cap: string) => cap.length > 0);
  } else {
    normalizedCapabilities = ['General assistance'];
  }

  // Extract data from metadata
  const metadata = agent.metadata || {};

  // Use pre-resolved avatar from batch lookup
  const avatarValue = agent.avatar_url || metadata.avatar || '🤖';
  const resolvedAvatar = avatarMap.get(avatarValue) || avatarValue;

  // Get tier from agent_levels relationship if available, otherwise fallback to metadata
  const agentLevel = agent.agent_levels;
  const tier = agentLevel?.level_number || metadata.tier || 3;

  // Transform enriched junction table data (if present)
  const enrichedCapabilities = (agent.agent_capabilities || []).map((ac: any) => ({
    id: ac.id,
    proficiency_level: ac.proficiency_level,
    is_primary: ac.is_primary,
    capability: ac.capabilities || null,
  }));

  const enrichedSkills = (agent.agent_skill_assignments || []).map((as: any) => ({
    id: as.skill_id,
    proficiency_level: as.proficiency_level,
    is_primary: as.is_primary,
    skill: as.skills || null,
  }));

  const responsibilities = (agent.agent_responsibilities || []).map((ar: any) => ({
    id: ar.id,
    is_primary: ar.is_primary,
    weight: ar.weight,
    responsibility: ar.org_responsibilities || null,
  }));

  const promptStarters = (agent.agent_prompt_starters || [])
    .filter((ps: any) => ps.is_active !== false)
    .sort((a: any, b: any) => (a.sequence_order || 0) - (b.sequence_order || 0))
    .map((ps: any) => ({
      id: ps.id,
      text: ps.text,
      icon: ps.icon,
      category: ps.category,
      sequence_order: ps.sequence_order,
    }));

  const assignedTools = (agent.agent_tool_assignments || [])
    .filter((at: any) => at.is_enabled !== false)
    .sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0))
    .map((at: any) => ({
      id: at.id,
      is_enabled: at.is_enabled,
      priority: at.priority,
      tool: at.tools || null,
    }));

  const enrichedKnowledgeDomains = (agent.agent_knowledge_domains || []).map((kd: any) => ({
    id: kd.id,
    domain_name: kd.domain_name,
    proficiency_level: kd.proficiency_level,
    is_primary_domain: kd.is_primary_domain,
    expertise_level: kd.expertise_level,
  }));

  // Extract personality type data
  const personalityType = agent.personality_types || null;

  return {
    id: agent.id,
    name: agent.name,
    slug: agent.slug,
    display_name: metadata.display_name || agent.title || agent.name,
    tagline: agent.tagline,
    description: agent.description,
    title: agent.title,
    expertise_level: agent.expertise_level,
    system_prompt: agent.system_prompt,
    capabilities: normalizedCapabilities,
    specializations: agent.specializations || [],
    knowledge_domains: metadata.knowledge_domains || [],
    tier: tier,
    model: agent.base_model || metadata.model || 'gpt-4',
    avatar: resolvedAvatar,
    avatar_url: agent.avatar_url,
    color: metadata.color || '#3B82F6',
    temperature: metadata.temperature || 0.7,
    max_tokens: metadata.max_tokens || 2000,
    metadata: metadata,
    tags: agent.tags || [],
    status: agent.status || 'active',
    is_custom: metadata.is_custom || false,
    function_name: agent.function_name || null,
    department_name: agent.department_name || null,
    role_name: agent.role_name || null,
    function_id: agent.function_id || null,
    department_id: agent.department_id || null,
    role_id: agent.role_id || null,
    business_function: agent.function_name || metadata.business_function || null,
    department: agent.department_name || metadata.department || null,
    role: agent.role_name || metadata.role || null,
    created_at: agent.created_at,
    updated_at: agent.updated_at,
    agent_levels: agentLevel || null,
    agent_level_id: agent.agent_level_id || null,
    enriched_capabilities: enrichedCapabilities,
    enriched_skills: enrichedSkills,
    responsibilities: responsibilities,
    prompt_starters: promptStarters,
    assigned_tools: assignedTools,
    enriched_knowledge_domains: enrichedKnowledgeDomains,
    // Personality type for communication style display
    personality_type: personalityType,
    personality_type_id: agent.personality_type_id || null,
  };
}

async function normalizeAgent(agent: any, adminSupabase: any) {
  if (!agent) return null;

  // Normalize specializations (used to be capabilities)
  let normalizedCapabilities: string[] = [];
  if (Array.isArray(agent.specializations)) {
    normalizedCapabilities = agent.specializations;
  } else if (typeof agent.specializations === 'string') {
    const cleanString = agent.specializations.replace(/[{}]/g, '');
    normalizedCapabilities = cleanString
      .split(',')
      .map((cap: string) => cap.trim())
      .filter((cap: string) => cap.length > 0);
  } else {
    normalizedCapabilities = ['General assistance'];
  }

  // Extract data from metadata
  const metadata = agent.metadata || {};

  // Resolve avatar URL from icons table if needed or use avatar_url from agent
  const avatarValue = agent.avatar_url || metadata.avatar || '🤖';
  const resolvedAvatar = await resolveAvatarUrl(avatarValue, adminSupabase);

  // Get tier from agent_levels relationship if available, otherwise fallback to metadata
  const agentLevel = agent.agent_levels;
  const tier = agentLevel?.level_number || metadata.tier || 3; // Default to 3 (Specialist) if not set

  // Transform enriched junction table data
  const enrichedCapabilities = (agent.agent_capabilities || []).map((ac: any) => ({
    id: ac.id,
    proficiency_level: ac.proficiency_level,
    is_primary: ac.is_primary,
    capability: ac.capabilities || null,
  }));

  const enrichedSkills = (agent.agent_skill_assignments || []).map((as: any) => ({
    id: as.skill_id, // skill_id is the unique identifier for this junction table
    proficiency_level: as.proficiency_level,
    is_primary: as.is_primary,
    skill: as.skills || null,
  }));

  const responsibilities = (agent.agent_responsibilities || []).map((ar: any) => ({
    id: ar.id,
    is_primary: ar.is_primary,
    weight: ar.weight,
    responsibility: ar.org_responsibilities || null,
  }));

  const promptStarters = (agent.agent_prompt_starters || [])
    .filter((ps: any) => ps.is_active !== false)
    .sort((a: any, b: any) => (a.sequence_order || 0) - (b.sequence_order || 0))
    .map((ps: any) => ({
      id: ps.id,
      text: ps.text,
      icon: ps.icon,
      category: ps.category,
      sequence_order: ps.sequence_order,
    }));

  const assignedTools = (agent.agent_tool_assignments || [])
    .filter((at: any) => at.is_enabled !== false)
    .sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0))
    .map((at: any) => ({
      id: at.id,
      is_enabled: at.is_enabled,
      priority: at.priority,
      tool: at.tools || null,
    }));

  const enrichedKnowledgeDomains = (agent.agent_knowledge_domains || []).map((kd: any) => ({
    id: kd.id,
    domain_name: kd.domain_name,
    proficiency_level: kd.proficiency_level,
    is_primary_domain: kd.is_primary_domain,
    expertise_level: kd.expertise_level,
  }));

  // Extract personality type data
  const personalityType = agent.personality_types || null;

  return {
    id: agent.id,
    name: agent.name,
    slug: agent.slug,
    display_name: metadata.display_name || agent.title || agent.name,
    tagline: agent.tagline,
    description: agent.description,
    title: agent.title,
    expertise_level: agent.expertise_level,
    system_prompt: agent.system_prompt,
    capabilities: normalizedCapabilities,
    specializations: agent.specializations || [],
    knowledge_domains: metadata.knowledge_domains || [],
    tier: tier,
    model: agent.base_model || metadata.model || 'gpt-4',
    avatar: resolvedAvatar,
    avatar_url: agent.avatar_url,
    color: metadata.color || '#3B82F6',
    temperature: metadata.temperature || 0.7,
    max_tokens: metadata.max_tokens || 2000,
    metadata: metadata,
    tags: agent.tags || [],
    status: agent.status || 'active',
    is_custom: metadata.is_custom || false,
    // Include BOTH naming conventions for compatibility with different stores
    // Database columns: function_name, department_name, role_name
    function_name: agent.function_name || null,
    department_name: agent.department_name || null,
    role_name: agent.role_name || null,
    function_id: agent.function_id || null,
    department_id: agent.department_id || null,
    role_id: agent.role_id || null,
    // Aliased fields for legacy store compatibility
    business_function: agent.function_name || metadata.business_function || null,
    department: agent.department_name || metadata.department || null,
    role: agent.role_name || metadata.role || null,
    created_at: agent.created_at,
    updated_at: agent.updated_at,
    // Include agent_levels for frontend level display
    agent_levels: agentLevel || null,
    agent_level_id: agent.agent_level_id || null,
    // Enriched junction table data
    enriched_capabilities: enrichedCapabilities,
    enriched_skills: enrichedSkills,
    responsibilities: responsibilities,
    prompt_starters: promptStarters,
    assigned_tools: assignedTools,
    enriched_knowledge_domains: enrichedKnowledgeDomains,
    // Personality type for communication style display
    personality_type: personalityType,
    personality_type_id: agent.personality_type_id || null,
  };
}

export const GET = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext
) => {
  const logger = createLogger();
  const operationId = `agents_crud_get_${Date.now()}`;
  const startTime = Date.now();

  // Development bypass mode - use admin client to bypass RLS
  const BYPASS_AUTH = process.env.BYPASS_AUTH === 'true' || process.env.NODE_ENV === 'development';
  const isDevBypass = BYPASS_AUTH && context.user.id === 'dev-user';

  try {
    // Detect tenant from subdomain via cookies/headers
    const tenantKey = request.cookies.get('tenant_key')?.value || 
                      request.headers.get('x-tenant-key') || 
                      'vital-system';
    const isVitalSystemTenant = tenantKey === 'vital-system';
    
    // For vital-system tenant OR dev bypass: use admin client (bypasses RLS, sees all agents)
    // For other tenants: use user session client (RLS filters by tenant)
    let supabase;
    try {
      if (isDevBypass || isVitalSystemTenant) {
        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
        const supabaseConfig = env.getSupabaseConfig();
        if (!supabaseConfig?.url || !supabaseConfig?.serviceRoleKey) {
          throw new Error('Supabase configuration missing');
        }
        supabase = createSupabaseClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);
        logger.info('agents_crud_using_admin_client', { 
          operationId, 
          reason: isDevBypass ? 'dev_bypass' : 'vital_system_tenant',
          tenantKey 
        });
      } else {
        supabase = await createClient();
      }
    } catch (supabaseError) {
      const errorObj = supabaseError instanceof Error ? supabaseError : new Error(String(supabaseError));
      logger.error('agents_crud_supabase_init_failed', errorObj, { operationId });
      // Return empty array instead of 500 error
      return NextResponse.json({
        success: true,
        agents: [],
        count: 0,
        warning: 'Failed to initialize Supabase client.',
      });
    }
    
    const { profile } = context;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('showAll') === 'true';

    logger.info('agents_crud_get_started', {
      operation: 'GET /api/agents-crud',
      operationId,
      userId: context.user.id,
      tenantId: profile.tenant_id,
      tenantKey,
      role: profile.role,
      showAll,
      isVitalSystemTenant,
    });

    // PERFORMANCE OPTIMIZATION: Check cache first
    const viewMode = new URL(request.url).searchParams.get('view') || 'list';
    const cacheKey = `agents_${tenantKey}_${showAll}_${viewMode}`;
    const cachedAgents = getCachedAgents(cacheKey);
    if (cachedAgents) {
      const duration = Date.now() - startTime;
      logger.info('agents_crud_cache_hit', {
        operationId,
        cacheKey,
        count: cachedAgents.length,
        durationMs: duration,
      });
      return NextResponse.json({
        success: true,
        agents: cachedAgents,
        count: cachedAgents.length,
        cached: true,
      });
    }

    // Build query - select all columns with * to avoid missing column errors
    // The database schema may vary, so we use * and let the normalizeAgent function handle the data
    // Try multiple query strategies, starting with the most specific and falling back to simpler ones

    let agents: any[] | null = null;
    let error: any = null;

    // PERFORMANCE OPTIMIZATION: Use simplified query for list view (default)
    // Full query with all junction tables only needed for detail view
    // viewMode is already defined above for caching

    // Simplified query for list/card view - only essential fields for display
    // Removes: agent_skill_assignments, agent_responsibilities, agent_prompt_starters, agent_tool_assignments, agent_knowledge_domains
    // Includes personality_types for list view persona display
    const listSelectQuery = '*, agent_levels(id, name, slug, level_number, can_spawn_lower_levels), agent_capabilities(id, proficiency_level, is_primary, capabilities(id, name, slug, description)), personality_types(id, name, slug, display_name, description, style, icon, color, tone_keywords, communication_style, reasoning_approach)';

    // Full query with all junction tables for detail view
    // Includes personality_types for persona/communication style display
    const detailSelectQuery = '*, agent_levels(id, name, slug, level_number, can_spawn_lower_levels), agent_capabilities(id, proficiency_level, is_primary, capabilities(id, name, slug, description)), agent_skill_assignments(skill_id, proficiency_level, is_primary, skills(id, name, slug, description)), agent_responsibilities(id, is_primary, weight, org_responsibilities(id, name, description)), agent_prompt_starters(id, text, icon, category, sequence_order, is_active), agent_tool_assignments(id, is_enabled, priority, tools(id, name, slug, description, tool_type, integration_name)), agent_knowledge_domains(id, domain_name, proficiency_level, is_primary_domain, expertise_level), personality_types(id, name, slug, display_name, description, style, icon, color, tone_keywords, communication_style, reasoning_approach)';

    const selectQuery = viewMode === 'detail' ? detailSelectQuery : listSelectQuery;

    logger.debug('agents_crud_query_mode', { operationId, viewMode, queryLength: selectQuery.length });

    // Strategy 1: For superadmin, use pagination to bypass 1000 row limit
    try {
      if (isVitalSystemTenant || isDevBypass) {
        // Superadmin sees ALL agents - use pagination to bypass PostgREST 1000 row limit
        logger.debug('agents_crud_get_platform_view', { operationId, tenantKey });

        // Fetch all agents in batches
        let allAgents: any[] = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const start = page * pageSize;
          const end = start + pageSize - 1;

          const { data: batchData, error: batchError } = await supabase
            .from('agents')
            .select(selectQuery)
            .order('name', { ascending: true })
            .range(start, end);

          if (batchError) {
            logger.warn('agents_crud_batch_error', { operationId, page, error: batchError });
            error = batchError;
            break;
          }

          if (batchData && batchData.length > 0) {
            allAgents = [...allAgents, ...batchData];
            hasMore = batchData.length === pageSize;
            page++;
          } else {
            hasMore = false;
          }
        }

        agents = allAgents;
        logger.debug('agents_crud_paginated_fetch_complete', { operationId, totalAgents: agents.length, pages: page });
      } else {
        // For non-superadmin, use normal query
        let query = supabase
          .from('agents')
          .select(selectQuery);

        if (profile?.tenant_id) {
          // Try allowed_tenants first
          try {
            query = query.contains('allowed_tenants', [profile.tenant_id]);
          } catch (e) {
            // Fallback to tenant_id
            query = query.eq('tenant_id', profile.tenant_id);
          }
          query = query.in('status', ['active', 'testing']);
          logger.debug('agents_crud_get_tenant_filtered', { operationId, tenantId: profile.tenant_id });
        } else {
          // No tenant - return empty
          query = query.eq('tenant_id', '00000000-0000-0000-0000-000000000000');
        }

        query = query.order('name', { ascending: true });

        const result = await query;
        agents = result.data;
        error = result.error;
      }

      if (!error && agents) {
        logger.debug('agents_crud_query_success_with_filters', { operationId, count: agents.length });
      }
    } catch (queryError) {
      logger.warn('agents_crud_query_strategy1_failed', { operationId, error: queryError });
      error = queryError;
    }
    
    // Strategy 2: If Strategy 1 failed, try without status filter
    if (error || !agents) {
      try {
        let query = supabase
          .from('agents')
          .select(selectQuery);

        // Apply tenant filtering only
        if (isVitalSystemTenant || isDevBypass) {
          // No filters for platform view
          logger.debug('agents_crud_get_platform_view_no_status', { operationId, tenantKey });
        } else if (profile?.tenant_id) {
          try {
            query = query.contains('allowed_tenants', [profile.tenant_id]);
          } catch (e) {
            query = query.eq('tenant_id', profile.tenant_id);
          }
          logger.debug('agents_crud_get_tenant_filtered_no_status', { operationId, tenantId: profile.tenant_id });
        } else {
          query = query.eq('tenant_id', '00000000-0000-0000-0000-000000000000');
        }
        
        // Try ordering by name, fallback to id
        try {
          query = query.order('name', { ascending: true });
        } catch (e) {
          query = query.order('id', { ascending: true });
        }
        
        const result = await query;
        agents = result.data;
        error = result.error;
        
        if (!error && agents) {
          logger.debug('agents_crud_query_success_no_status', { operationId, count: agents.length });
        }
      } catch (queryError) {
        logger.warn('agents_crud_query_strategy2_failed', { operationId, error: queryError });
        error = queryError;
      }
    }
    
    // Strategy 3: If Strategy 2 failed, try simplest query (no filters, no ordering)
    if (error || !agents) {
      try {
        const result = await supabase
          .from('agents')
          .select(selectQuery)
          .limit(1000);
        
        agents = result.data;
        error = result.error;
        
        if (!error && agents) {
          logger.debug('agents_crud_query_success_simple', { operationId, count: agents.length });
        }
      } catch (queryError) {
        logger.warn('agents_crud_query_strategy3_failed', { operationId, error: queryError });
        error = queryError;
      }
    }

    // If all strategies failed, return empty array with warning
    if (error || !agents) {
      const duration = Date.now() - startTime;
      const errorMessage = error?.message || 'Unknown error';
      
      logger.warn(
        'agents_crud_get_failed_all_strategies',
        {
          operation: 'GET /api/agents-crud',
          operationId,
          duration,
          errorCode: error?.code,
          errorMessage,
        }
      );

      // Return empty array instead of error to allow graceful degradation
      return NextResponse.json({
        success: true,
        agents: [],
        count: 0,
        warning: 'Failed to fetch agents from database. Some columns may be missing.',
      });
    }

    // PERFORMANCE OPTIMIZATION: Use batch avatar resolution instead of per-agent queries
    // This reduces ~1000+ DB calls to a single batch query
    let normalizedAgents: any[] = [];
    try {
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
      const supabaseConfig = env.getSupabaseConfig();
      if (supabaseConfig?.url && supabaseConfig?.serviceRoleKey) {
        const adminSupabase = createSupabaseClient(
          supabaseConfig.url,
          supabaseConfig.serviceRoleKey
        );

        // Collect all unique avatar names for batch resolution
        const avatarNames = new Set<string>();
        for (const agent of agents || []) {
          const avatarValue = agent.avatar_url || agent.metadata?.avatar || '🤖';
          avatarNames.add(avatarValue);
        }

        // Single batch query for all avatars (replaces 1000+ individual queries)
        const avatarResolutionStart = Date.now();
        const avatarMap = await batchResolveAvatarUrls(Array.from(avatarNames), adminSupabase);
        logger.debug('agents_crud_batch_avatar_resolution', {
          operationId,
          uniqueAvatars: avatarNames.size,
          resolvedCount: avatarMap.size,
          durationMs: Date.now() - avatarResolutionStart,
        });

        // Fast synchronous normalization using pre-resolved avatars
        normalizedAgents = (agents || []).map((agent: any) => {
          try {
            return normalizeAgentFast(agent, avatarMap);
          } catch (agentError) {
            logger.warn('agents_crud_normalize_agent_failed', {
              operationId,
              agentId: agent?.id,
              error: agentError instanceof Error ? agentError.message : String(agentError),
            });
            // Return a basic normalized agent without icon resolution
            return {
              id: agent.id,
              name: agent.name,
              display_name: agent.metadata?.display_name || agent.title || agent.name,
              description: agent.description || '',
              system_prompt: agent.system_prompt || '',
              capabilities: agent.capabilities || agent.specializations || [],
              status: agent.status || 'active',
              tier: agent.agent_levels?.level_number || agent.metadata?.tier || 3,
              model: agent.base_model || agent.metadata?.model || 'gpt-4',
              avatar: avatarMap.get(agent.avatar_url || agent.metadata?.avatar || '🤖') || '🤖',
              metadata: agent.metadata || {},
              agent_levels: agent.agent_levels || null,
              agent_level_id: agent.agent_level_id || null,
            };
          }
        });
      } else {
        // If Supabase config is missing, use basic normalization
        logger.warn('agents_crud_supabase_config_missing', { operationId });
        normalizedAgents = (agents || []).map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          display_name: agent.metadata?.display_name || agent.title || agent.name,
          description: agent.description || '',
          system_prompt: agent.system_prompt || '',
          capabilities: agent.capabilities || agent.specializations || [],
          status: agent.status || 'active',
          tier: agent.agent_levels?.level_number || agent.metadata?.tier || 3,
          model: agent.base_model || agent.metadata?.model || 'gpt-4',
          avatar: agent.avatar_url || agent.metadata?.avatar || '🤖',
          metadata: agent.metadata || {},
          agent_levels: agent.agent_levels || null,
          agent_level_id: agent.agent_level_id || null,
        }));
      }
    } catch (normalizeError) {
      const errorObj = normalizeError instanceof Error ? normalizeError : new Error(String(normalizeError));
      logger.error('agents_crud_normalize_failed', errorObj, { operationId });
      // Use basic normalization as fallback
      normalizedAgents = (agents || []).map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        display_name: agent.metadata?.display_name || agent.title || agent.name,
        description: agent.description || '',
        system_prompt: agent.system_prompt || '',
        capabilities: agent.capabilities || agent.specializations || [],
        status: agent.status || 'active',
        tier: agent.agent_levels?.level_number || agent.metadata?.tier || 3,
        model: agent.base_model || agent.metadata?.model || 'gpt-4',
        avatar: agent.avatar_url || agent.metadata?.avatar || '🤖',
        metadata: agent.metadata || {},
        agent_levels: agent.agent_levels || null,
        agent_level_id: agent.agent_level_id || null,
      }));
    }

    const validAgents = normalizedAgents.filter(Boolean);
    const duration = Date.now() - startTime;

    // PERFORMANCE OPTIMIZATION: Cache the results
    setCachedAgents(cacheKey, validAgents);

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
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logger.error(
      'agents_crud_get_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'GET /api/agents-crud',
        operationId,
        duration,
        errorMessage,
        errorStack,
      }
    );

    // Return more specific error information for debugging
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: errorMessage,
        operation: 'GET /api/agents-crud',
        operationId,
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
    // Note: is_custom does NOT exist as a direct column in the agents table
    // It should ONLY be stored in metadata JSONB field
    const { id: _unusedId, display_name, is_custom, ...rest } = agentData;
    const payload = {
      ...rest,
      name: agentData.name.trim(),
      // Set ownership fields
      created_by: user.id,
      tenant_id: profile.tenant_id,
      // is_custom is stored in metadata, NOT as a direct column (column doesn't exist)
      metadata: {
        display_name: display_name || agentData.name,
        is_custom: is_custom !== false, // Store in metadata only
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
      if (pineconeVectorService) {
        await pineconeVectorService.syncAgentToPinecone({
          agentId: embeddingData.agentId,
          embedding: embeddingData.embedding,
          metadata: embeddingData.metadata,
        });
      }

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
