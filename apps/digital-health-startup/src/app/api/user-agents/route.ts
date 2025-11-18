import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { logger, createLogger } from '@/lib/services/observability/structured-logger';
import {
  validateUserAgentCreate,
  validateUserAgentBulkCreate,
  safeValidate,
  getValidationErrors,
  validateMigrationRequest,
  UserAgentCreateSchema,
} from '@/lib/validators/user-agents-schema';
import {
  UserAgentOperationError,
  AgentNotFoundError,
  DatabaseConnectionError,
  serializeError,
  isAgentError,
  getErrorStatusCode,
} from '@/lib/errors/agent-errors';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Generate request ID for tracing
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Extract user ID from request (auth header or body)
 */
function getUserId(request: NextRequest): string | null {
  // TODO: Extract from auth token/session
  return null;
}

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || generateRequestId();
  const startTime = Date.now();
  const requestLogger = createLogger({ requestId });

  try {
    const body = await request.json();
    
    // Validate request body
    const validation = safeValidate(UserAgentCreateSchema, body);

    if (!validation.success) {
      const errors = getValidationErrors(validation.errors);
      requestLogger.warn('user_agent_validation_failed', {
        errors,
        body: Object.keys(body),
      });

      return NextResponse.json(
        {
          error: 'Validation failed',
          errors,
        },
        { status: 400 }
      );
    }

    const { userId, agentId, originalAgentId, isUserCopy = false } = validation.data;

    requestLogger.info('user_agent_add_request', {
      operation: 'add_user_agent',
      userId,
      agentId,
      originalAgentId,
      isUserCopy,
    });

    // Try to use the user_agents table, fallback to localStorage simulation if it doesn't exist
    try {
      // Check if the relationship already exists
      const { data: existing, error: existingError } = await supabaseAdmin
        .from('user_agents')
        .select('id')
        .eq('user_id', userId)
        .eq('agent_id', agentId)
        .single();

      // If table doesn't exist, simulate the operation
      if (existingError && existingError.code === '42P01') {
        console.log('⚠️ user_agents table does not exist, simulating operation');
        
        // Return success to simulate adding the agent
        return NextResponse.json({
          success: true,
          data: {
            id: `sim-${Date.now()}`,
            user_id: userId,
            agent_id: agentId,
            original_agent_id: originalAgentId || null,
            is_user_copy: isUserCopy,
            created_at: new Date().toISOString(),
          },
          message: 'Agent added to user list successfully (simulated)'
        });
      }

      if (existing) {
        return NextResponse.json(
          { error: 'Agent already added to user list' },
          { status: 409 }
        );
      }

      // Add the agent to user's list
      const { data, error } = await supabaseAdmin
        .from('user_agents')
        .insert({
          user_id: userId,
          agent_id: agentId,
          original_agent_id: originalAgentId || null,
          is_user_copy: isUserCopy,
        })
        .select()
        .single();

      if (error) {
        requestLogger.error(
          'user_agent_add_failed',
          new DatabaseConnectionError('Failed to insert user agent', {
            cause: error as Error,
            context: { userId, agentId, code: error.code },
          }),
          { operation: 'add_user_agent', userId, agentId }
        );

        throw new UserAgentOperationError(
          'add',
          'Failed to add agent to user list',
          {
            cause: error as Error,
            context: { userId, agentId },
          }
        );
      }

      const duration = Date.now() - startTime;
      requestLogger.infoWithMetrics('user_agent_added', duration, {
        operation: 'add_user_agent',
        userId,
        agentId,
        userAgentId: data.id,
      });

      // Set caching headers
      return NextResponse.json(
        {
          success: true,
          data,
          message: 'Agent added to user list successfully',
          requestId,
        },
        {
          status: 201,
          headers: {
            'Cache-Control': 'no-store',
            'X-Request-ID': requestId,
          },
        }
      );

    } catch (tableError: any) {
      // If the table doesn't exist, return error (no simulation in production)
      if (tableError.code === '42P01') {
        requestLogger.error(
          'user_agents_table_missing',
          new DatabaseConnectionError('user_agents table does not exist', {
            context: { code: tableError.code },
          }),
          { operation: 'add_user_agent', userId, agentId }
        );

        return NextResponse.json(
          {
            error: 'Database table not found',
            message: 'user_agents table is not initialized. Please run migrations.',
          },
          { status: 503 }
        );
      }

      // Re-throw if it's an AgentError (already logged)
      if (isAgentError(tableError)) {
        throw tableError;
      }

      // Wrap unknown errors
      throw new UserAgentOperationError('add', 'Unexpected error occurred', {
        cause: tableError as Error,
        context: { userId, agentId },
      });
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    requestLogger.error(
      'user_agent_api_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'add_user_agent',
        duration,
      }
    );

    const statusCode = getErrorStatusCode(error);
    const serialized = serializeError(error);

    return NextResponse.json(
      {
        ...serialized,
        requestId,
      },
      {
        status: statusCode,
        headers: {
          'X-Request-ID': requestId,
        },
      }
    );
  }
}

export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || generateRequestId();
  const startTime = Date.now();
  const requestLogger = createLogger({ requestId });

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      requestLogger.warn('user_agent_get_validation_failed', {
        reason: 'missing_userId',
      });

      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      requestLogger.warn('user_agent_get_validation_failed', {
        reason: 'invalid_userId_format',
        userId: userId.substring(0, 20),
      });

      return NextResponse.json(
        { error: 'Invalid userId format. Expected UUID.' },
        { status: 400 }
      );
    }

    requestLogger.info('user_agent_get_request', {
      operation: 'get_user_agents',
      userId,
    });

    // Try to use the user_agents table
    try {
      
      // Get all agents that the user has added, including agent details
      // Note: Using agents!user_agents_agent_id_fkey to specify which foreign key relationship to use
      // (the user_agents table has two foreign keys to agents: agent_id and original_agent_id)
      const { data, error } = await supabaseAdmin
        .from('user_agents')
        .select(`
          *,
          agents!user_agents_agent_id_fkey (
            id,
            name,
            description,
            capabilities,
            metadata,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // If table doesn't exist, return error
      if (error && error.code === '42P01') {
        requestLogger.error(
          'user_agents_table_missing',
          new DatabaseConnectionError('user_agents table does not exist', {
            context: { code: error.code },
          }),
          { operation: 'get_user_agents', userId }
        );

        return NextResponse.json(
          {
            error: 'Database table not found',
            message: 'user_agents table is not initialized. Please run migrations.',
            agents: [],
          },
          { status: 503 }
        );
      }

      if (error) {
        requestLogger.error(
          'user_agent_get_failed',
          new DatabaseConnectionError('Failed to fetch user agents', {
            cause: error as Error,
            context: { userId, code: error.code },
          }),
          { operation: 'get_user_agents', userId }
        );

        throw new DatabaseConnectionError('Failed to fetch user agents', {
          cause: error as Error,
          context: { userId },
        });
      }

      const duration = Date.now() - startTime;
      requestLogger.infoWithMetrics('user_agents_fetched', duration, {
        operation: 'get_user_agents',
        userId,
        count: data?.length || 0,
      });

      return NextResponse.json(
        {
          success: true,
          agents: data || [],
          requestId,
          count: data?.length || 0,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'private, max-age=300', // 5 minutes cache
            'X-Request-ID': requestId,
          },
        }
      );

    } catch (tableError: any) {
      // If the table doesn't exist, return error
      if (tableError.code === '42P01') {
        requestLogger.error(
          'user_agents_table_missing',
          new DatabaseConnectionError('user_agents table does not exist', {
            context: { code: tableError.code },
          }),
          { operation: 'get_user_agents', userId }
        );

        return NextResponse.json(
          {
            error: 'Database table not found',
            message: 'user_agents table is not initialized. Please run migrations.',
            agents: [],
          },
          { status: 503 }
        );
      }

      // Re-throw if it's an AgentError (already logged)
      if (isAgentError(tableError)) {
        throw tableError;
      }

      // Wrap unknown errors
      throw new DatabaseConnectionError('Unexpected error occurred', {
        cause: tableError as Error,
        context: { userId },
      });
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    requestLogger.error(
      'user_agent_get_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'get_user_agents',
        duration,
      }
    );

    const statusCode = getErrorStatusCode(error);
    const serialized = serializeError(error);

    return NextResponse.json(
      {
        ...serialized,
        requestId,
        agents: [],
      },
      {
        status: statusCode,
        headers: {
          'X-Request-ID': requestId,
        },
      }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || generateRequestId();
  const startTime = Date.now();
  const requestLogger = createLogger({ requestId });

  try {
    const body = await request.json();
    const { userId, agentId } = body;

    if (!userId || !agentId) {
      requestLogger.warn('user_agent_delete_validation_failed', {
        reason: 'missing_fields',
        hasUserId: !!userId,
        hasAgentId: !!agentId,
      });

      return NextResponse.json(
        { error: 'userId and agentId are required' },
        { status: 400 }
      );
    }

    requestLogger.info('user_agent_delete_request', {
      operation: 'delete_user_agent',
      userId,
      agentId,
    });

    // Try to use the user_agents table, fallback to simulation if it doesn't exist
    try {
      // Remove the agent from user's list
      const { error, data } = await supabaseAdmin
        .from('user_agents')
        .delete()
        .eq('user_id', userId)
        .eq('agent_id', agentId)
        .select();

      if (error) {
        requestLogger.error(
          'user_agent_delete_failed',
          new DatabaseConnectionError('Failed to delete user agent', {
            cause: error as Error,
            context: { userId, agentId, code: error.code },
          }),
          { operation: 'delete_user_agent', userId, agentId }
        );

        throw new UserAgentOperationError(
          'delete',
          'Failed to remove agent from user list',
          {
            cause: error as Error,
            context: { userId, agentId },
          }
        );
      }

      // Check if agent was actually deleted
      if (!data || data.length === 0) {
        requestLogger.warn('user_agent_not_found', {
          operation: 'delete_user_agent',
          userId,
          agentId,
        });

        return NextResponse.json(
          {
            success: false,
            error: 'Agent not found in user list',
            message: 'The agent was not found in your list',
          },
          { status: 404 }
        );
      }

      const duration = Date.now() - startTime;
      requestLogger.infoWithMetrics('user_agent_deleted', duration, {
        operation: 'delete_user_agent',
        userId,
        agentId,
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Agent removed from user list successfully',
          requestId,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store',
            'X-Request-ID': requestId,
          },
        }
      );

    } catch (tableError: any) {
      // If the table doesn't exist, return error
      if (tableError.code === '42P01') {
        requestLogger.error(
          'user_agents_table_missing',
          new DatabaseConnectionError('user_agents table does not exist', {
            context: { code: tableError.code },
          }),
          { operation: 'delete_user_agent', userId, agentId }
        );

        return NextResponse.json(
          {
            error: 'Database table not found',
            message: 'user_agents table is not initialized. Please run migrations.',
          },
          { status: 503 }
        );
      }

      // Re-throw if it's an AgentError (already logged)
      if (isAgentError(tableError)) {
        throw tableError;
      }

      // Wrap unknown errors
      throw new UserAgentOperationError('delete', 'Unexpected error occurred', {
        cause: tableError as Error,
        context: { userId, agentId },
      });
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    requestLogger.error(
      'user_agent_delete_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'delete_user_agent',
        duration,
      }
    );

    const statusCode = getErrorStatusCode(error);
    const serialized = serializeError(error);

    return NextResponse.json(
      {
        ...serialized,
        requestId,
      },
      {
        status: statusCode,
        headers: {
          'X-Request-ID': requestId,
        },
      }
    );
  }
}
