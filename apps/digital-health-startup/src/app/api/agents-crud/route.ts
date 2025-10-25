/**
 * SECURED Agents CRUD API Route
 * This is the secured version with all security middleware applied
 *
 * To activate: Rename this file to route.ts and backup the old route.ts
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';

// Security middleware
import { withErrorBoundary } from '@/lib/api/error-boundary';
import { withPooledClient } from '@/lib/supabase/connection-pool';
import { createSuccessResponse, APIErrors } from '@/middleware/error-handler.middleware';
import { withRateLimit } from '@/middleware/rate-limit.middleware';
import { withRLSValidation } from '@/middleware/rls-validation.middleware';
import { withValidation } from '@/middleware/validation.middleware';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const GetAgentsSchema = z.object({
  showAll: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  action: z.enum(['get_org_structure', 'get_agent_org_roles']).optional(),
  agentId: z.string().uuid().optional(),
  status: z.enum(['active', 'testing', 'development', 'deprecated', 'archived']).optional(),
  tier: z.enum(['1', '2', '3']).optional(),
  business_function: z.string().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(50),
});

const AgentCreationSchema = z.object({
  name: z.string()
    .min(1, 'Agent name is required')
    .max(100, 'Agent name too long')
    .regex(/^[a-z0-9-]+$/, 'Name must be lowercase alphanumeric with hyphens'),

  display_name: z.string()
    .min(1, 'Display name is required')
    .max(100, 'Display name too long'),

  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description too long'),

  system_prompt: z.string()
    .min(50, 'System prompt too short')
    .max(5000, 'System prompt too long')
    .optional(),

  model: z.string().default('gpt-4-turbo-preview'),
  avatar: z.string().optional(),
  color: z.string().optional(),

  capabilities: z.array(z.string()).default([]),
  knowledge_domains: z.array(z.string()).default([]),

  rag_enabled: z.boolean().default(false),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.number().int().min(100).max(16000).default(2000),

  status: z.enum(['development', 'testing', 'active', 'deprecated', 'archived']).default('development'),
  tier: z.enum(['1', '2', '3']).optional(),
  priority: z.number().int().optional(),

  business_function: z.string().optional(),
  role: z.string().optional(),
  domain_expertise: z.array(z.string()).optional(),

  // Healthcare compliance fields
  medical_specialty: z.string().optional(),
  validation_status: z.string().optional(),
  hipaa_compliant: z.boolean().default(false),
  gdpr_compliant: z.boolean().default(false),
  pharma_enabled: z.boolean().default(false),
  verify_enabled: z.boolean().default(false),
  regulatory_context: z.array(z.string()).optional(),

  metadata: z.record(z.any()).optional(),
});

// ============================================================================
// GET ENDPOINT - Retrieve Agents
// ============================================================================

export const GET = withErrorBoundary(
  withRateLimit(
    withRLSValidation(
      withValidation(
        async (request: NextRequest, query: z.infer<typeof GetAgentsSchema>, context) => {
          const { showAll, action, agentId, status, tier, business_function, page, pageSize } = query;

          // Handle special actions
          if (action === 'get_org_structure') {
            return await getOrganizationalStructure(context);
          }

          if (action === 'get_agent_org_roles' && agentId) {
            return await getAgentOrgRoles(agentId, context);
          }

          // Main agent retrieval logic
          const offset = (page - 1) * pageSize;

          const result = await withPooledClient(async (supabase) => {
            // Build query with RLS applied
            let query = supabase
              .from('agents')
              .select(`
                id,
                name,
                display_name,
                description,
                system_prompt,
                model,
                avatar,
                color,
                capabilities,
                rag_enabled,
                temperature,
                max_tokens,
                is_custom,
                created_by,
                status,
                tier,
                priority,
                implementation_phase,
                knowledge_domains,
                business_function,
                role,
                domain_expertise,
                medical_specialty,
                validation_status,
                hipaa_compliant,
                gdpr_compliant,
                pharma_enabled,
                verify_enabled,
                regulatory_context,
                metadata,
                created_at,
                updated_at
              `, { count: 'exact' });

            // Apply status filter
            if (!showAll) {
              query = query.in('status', ['active', 'testing']);
            } else if (status) {
              query = query.eq('status', status);
            }

            // Apply additional filters
            if (tier) {
              query = query.eq('tier', tier);
            }

            if (business_function) {
              query = query.eq('business_function', business_function);
            }

            // Pagination and ordering
            const { data, error, count } = await query
              .order('tier', { ascending: true, nullsFirst: false })
              .order('priority', { ascending: true, nullsFirst: false })
              .range(offset, offset + pageSize - 1);

            if (error) throw error;

            return { agents: data || [], total: count || 0 };
          });

          return createSuccessResponse(result, {
            page,
            pageSize,
            totalPages: Math.ceil(result.total / pageSize),
            showAll: showAll || false,
          });
        },
        GetAgentsSchema,
        { validateQuery: true }
      )
    ),
    { requests: 100, window: 60 } // 100 per minute for reads
  ),
  { timeout: 15000 }
);

// ============================================================================
// POST ENDPOINT - Create Agent
// ============================================================================

export const POST = withErrorBoundary(
  withRateLimit(
    withRLSValidation(
      withValidation(
        async (request: NextRequest, agentData: z.infer<typeof AgentCreationSchema>, context) => {
          // Ensure user is authenticated
          if (!context.userId) {
            throw APIErrors.unauthorized();
          }

          const result = await withPooledClient(async (supabase) => {
            // Prepare agent data with user context
            const newAgent = {
              ...agentData,
              is_custom: true,
              created_by: context.userId,
              user_id: context.userId, // Scope to current user for RLS
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            // Check for duplicate name (scoped to user)
            const { data: existing } = await supabase
              .from('agents')
              .select('id, name')
              .eq('name', agentData.name)
              .eq('user_id', context.userId)
              .maybeSingle();

            if (existing) {
              throw APIErrors.validationError(
                'Agent with this name already exists',
                { name: agentData.name, existingId: existing.id }
              );
            }

            // Insert new agent
            const { data, error } = await supabase
              .from('agents')
              .insert([newAgent])
              .select()
              .single();

            if (error) {
              // Handle specific database errors
              if (error.code === '23505') {
                throw APIErrors.validationError('Agent name or display name already exists');
              }
              throw error;
            }

            return data;
          });

          return createSuccessResponse(result, {
            message: 'Agent created successfully',
            agentId: result.id,
          });
        },
        AgentCreationSchema
      ),
      { requireRole: 'user' } // Only authenticated users can create
    ),
    { requests: 20, window: 60 } // 20 per minute for writes
  ),
  { timeout: 10000 }
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get organizational structure
 */
async function getOrganizationalStructure(context: any) {
  const result = await withPooledClient(async (supabase) => {
    // Fetch business functions
    const { data: functionsData, error: functionsError } = await supabase
      .from('business_functions')
      .select('id, name, description, code, icon, color');

    if (functionsError && functionsError.code !== 'PGRST116') {
      console.warn('Business functions table not found:', functionsError);
    }

    // Fetch departments
    const { data: departmentsData, error: departmentsError } = await supabase
      .from('departments')
      .select('id, name, description, business_function_id');

    if (departmentsError && departmentsError.code !== 'PGRST116') {
      console.warn('Departments table not found:', departmentsError);
    }

    // Fetch agent roles
    const { data: agentRolesData, error: rolesError } = await supabase
      .from('agent_roles')
      .select('id, name, description, category');

    if (rolesError && rolesError.code !== 'PGRST116') {
      console.warn('Agent roles table not found:', rolesError);
    }

    // Fetch organizational roles
    const { data: orgRolesData, error: orgRolesError } = await supabase
      .from('organizational_roles')
      .select('id, name, description, level, business_function_id, department_id');

    if (orgRolesError && orgRolesError.code !== 'PGRST116') {
      console.warn('Organizational roles table not found:', orgRolesError);
    }

    return {
      businessFunctions: functionsData || [],
      departments: departmentsData || [],
      agentRoles: agentRolesData || [],
      organizationalRoles: orgRolesData || [],
    };
  });

  return createSuccessResponse(result, {
    message: 'Organizational structure retrieved successfully',
  });
}

/**
 * Get agent organizational roles
 */
async function getAgentOrgRoles(agentId: string, context: any) {
  const result = await withPooledClient(async (supabase) => {
    const { data, error } = await supabase
      .from('agent_organizational_role_support')
      .select(`
        id,
        support_type,
        proficiency_level,
        organizational_roles (
          id,
          name,
          description,
          level,
          business_function_id,
          department_id
        )
      `)
      .eq('agent_id', agentId);

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data || [];
  });

  return createSuccessResponse(result, {
    message: 'Agent organizational roles retrieved successfully',
    agentId,
  });
}
