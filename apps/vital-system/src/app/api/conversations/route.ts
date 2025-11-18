import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/services/observability/structured-logger';
import {
  DatabaseConnectionError,
  ConversationOperationError,
  serializeError,
  isAgentError,
  getErrorStatusCode,
} from '@/lib/errors/agent-errors';
import { conversationsService } from '@/lib/services/conversations/conversations-service';

/**
 * Generate request ID for tracing
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Extract user ID from request (should be from auth token/session in production)
 */
async function getUserId(request: NextRequest): Promise<string | null> {
  // TODO: Extract from auth token/session
  // For now, expect it in body or query params
  return null;
}

/**
 * GET /api/conversations?userId=xxx
 * Get all conversations for a user
 */
export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || generateRequestId();
  const startTime = Date.now();
  const requestLogger = createLogger({ requestId });

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      requestLogger.warn('conversations_get_validation_failed', {
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
      requestLogger.warn('conversations_get_validation_failed', {
        reason: 'invalid_userId_format',
        userId: userId.substring(0, 20),
      });

      return NextResponse.json(
        { error: 'Invalid userId format. Expected UUID.' },
        { status: 400 }
      );
    }

    requestLogger.info('conversations_get_request', {
      operation: 'get_conversations',
      userId,
    });

    const conversations = await conversationsService.getUserConversations(userId);

    const duration = Date.now() - startTime;
    requestLogger.infoWithMetrics('conversations_fetched', duration, {
      operation: 'get_conversations',
      userId,
      count: conversations.length,
    });

    return NextResponse.json(
      {
        success: true,
        conversations,
        requestId,
        count: conversations.length,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=300', // 5 minutes cache
          'X-Request-ID': requestId,
        },
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    requestLogger.error(
      'conversations_get_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'get_conversations',
        duration,
      }
    );

    const statusCode = getErrorStatusCode(error);
    const serialized = serializeError(error);

    return NextResponse.json(
      {
        ...serialized,
        requestId,
        conversations: [],
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

/**
 * POST /api/conversations
 * Create a new conversation
 */
export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || generateRequestId();
  const startTime = Date.now();
  const requestLogger = createLogger({ requestId });

  try {
    const body = await request.json();
    const { userId, title, messages, agentId, mode, isPinned } = body;

    if (!userId) {
      requestLogger.warn('conversations_create_validation_failed', {
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
      requestLogger.warn('conversations_create_validation_failed', {
        reason: 'invalid_userId_format',
        userId: userId.substring(0, 20),
      });

      return NextResponse.json(
        { error: 'Invalid userId format. Expected UUID.' },
        { status: 400 }
      );
    }

    requestLogger.info('conversation_create_request', {
      operation: 'create_conversation',
      userId,
      title: title || 'New Conversation',
    });

    const conversation = await conversationsService.createConversation(userId, {
      title: title || 'New Conversation',
      messages: messages || [],
      agentId,
      mode,
      isPinned: isPinned || false,
    });

    const duration = Date.now() - startTime;
    requestLogger.infoWithMetrics('conversation_created', duration, {
      operation: 'create_conversation',
      userId,
      conversationId: conversation.id,
    });

    return NextResponse.json(
      {
        success: true,
        conversation,
        requestId,
        message: 'Conversation created successfully',
      },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store',
          'X-Request-ID': requestId,
        },
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    requestLogger.error(
      'conversation_create_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'create_conversation',
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

/**
 * PUT /api/conversations
 * Update an existing conversation
 */
export async function PUT(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || generateRequestId();
  const startTime = Date.now();
  const requestLogger = createLogger({ requestId });

  try {
    const body = await request.json();
    const { userId, conversationId, title, messages, agentId, mode, isPinned } = body;

    if (!userId || !conversationId) {
      requestLogger.warn('conversations_update_validation_failed', {
        reason: 'missing_fields',
        hasUserId: !!userId,
        hasConversationId: !!conversationId,
      });

      return NextResponse.json(
        { error: 'userId and conversationId are required' },
        { status: 400 }
      );
    }

    requestLogger.info('conversation_update_request', {
      operation: 'update_conversation',
      userId,
      conversationId,
    });

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (messages !== undefined) updates.messages = messages;
    if (agentId !== undefined) updates.agentId = agentId;
    if (mode !== undefined) updates.mode = mode;
    if (isPinned !== undefined) updates.isPinned = isPinned;

    const conversation = await conversationsService.updateConversation(
      userId,
      conversationId,
      updates
    );

    const duration = Date.now() - startTime;
    requestLogger.infoWithMetrics('conversation_updated', duration, {
      operation: 'update_conversation',
      userId,
      conversationId,
    });

    return NextResponse.json(
      {
        success: true,
        conversation,
        requestId,
        message: 'Conversation updated successfully',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
          'X-Request-ID': requestId,
        },
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    requestLogger.error(
      'conversation_update_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'update_conversation',
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

/**
 * DELETE /api/conversations
 * Delete a conversation
 */
export async function DELETE(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || generateRequestId();
  const startTime = Date.now();
  const requestLogger = createLogger({ requestId });

  try {
    const body = await request.json();
    const { userId, conversationId } = body;

    if (!userId || !conversationId) {
      requestLogger.warn('conversations_delete_validation_failed', {
        reason: 'missing_fields',
        hasUserId: !!userId,
        hasConversationId: !!conversationId,
      });

      return NextResponse.json(
        { error: 'userId and conversationId are required' },
        { status: 400 }
      );
    }

    requestLogger.info('conversation_delete_request', {
      operation: 'delete_conversation',
      userId,
      conversationId,
    });

    await conversationsService.deleteConversation(userId, conversationId);

    const duration = Date.now() - startTime;
    requestLogger.infoWithMetrics('conversation_deleted', duration, {
      operation: 'delete_conversation',
      userId,
      conversationId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Conversation deleted successfully',
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
  } catch (error) {
    const duration = Date.now() - startTime;
    requestLogger.error(
      'conversation_delete_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'delete_conversation',
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

