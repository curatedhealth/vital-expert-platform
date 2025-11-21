/**
 * Chat Sessions API
 * Handles CRUD operations for chat sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL or service role key is not configured for chat sessions API');
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey
);

function normalizeSession(session: any) {
  if (!session) {
    return session;
  }
  const metadata = session.metadata ?? session.context ?? {};
  const mode =
    session.mode ??
    session.settings?.mode ??
    metadata.mode ??
    session.session_type ??
    'manual';
  return {
    ...session,
    metadata,
    mode,
  };
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔍 [Chat Sessions] Fetching sessions for user:', userId);

    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select(`
        id,
        title,
        session_type,
        agent_id,
        agent_name,
        created_at,
        updated_at,
        last_message_at,
        message_count,
        total_tokens,
        is_active,
        context,
        settings
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_message_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ [Chat Sessions] Error fetching sessions:', error);
      
      // If table doesn't exist, return empty array instead of error
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.log('⚠️ [Chat Sessions] Table does not exist, returning empty result');
        return NextResponse.json({ sessions: [] });
      }
      
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    const normalizedSessions = (sessions || []).map(normalizeSession);

    console.log(`✅ [Chat Sessions] Found ${normalizedSessions.length} sessions`);
    return NextResponse.json({ sessions: normalizedSessions });

  } catch (error) {
    console.error('❌ [Chat Sessions] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, mode, agentId, agentName, metadata } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🆕 [Chat Sessions] Creating new session:', { userId, title, mode, agentId });

    const metadataPayload = isPlainObject(metadata) ? metadata : {};
    const settingsPayload = isPlainObject((metadataPayload as any).settings)
      ? (metadataPayload as any).settings
      : {};
    const contextPayload = isPlainObject((metadataPayload as any).context)
      ? (metadataPayload as any).context
      : metadataPayload;

    const sessionPayload: Record<string, any> = {
      user_id: userId,
      title: title || 'New Chat',
      session_type: mode || 'chat',
      agent_id: agentId || null,
      agent_name: agentName || null,
      context: contextPayload,
      settings: {
        ...settingsPayload,
        mode: mode || 'manual',
      },
      is_active: true,
    };

    const { data: session, error } = await supabase
      .from('chat_sessions')
      .insert(sessionPayload)
      .select()
      .single();

    if (error) {
      console.error('❌ [Chat Sessions] Error creating session:', error);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    const normalized = normalizeSession(session);

    console.log('✅ [Chat Sessions] Created session:', normalized.id);
    return NextResponse.json({ session: normalized });

  } catch (error) {
    console.error('❌ [Chat Sessions] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, title, agentId, agentName, metadata, mode } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    console.log('📝 [Chat Sessions] Updating session:', sessionId);

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title;
    if (agentId !== undefined) updateData.agent_id = agentId;
    if (agentName !== undefined) updateData.agent_name = agentName;
    if (metadata !== undefined) {
      const metadataPayload = isPlainObject(metadata) ? metadata : {};
      const contextPayload = isPlainObject((metadataPayload as any).context)
        ? (metadataPayload as any).context
        : metadataPayload;
      updateData.context = contextPayload;
      if (isPlainObject((metadataPayload as any).settings) || mode !== undefined) {
        updateData.settings = {
          ...(isPlainObject((metadataPayload as any).settings)
            ? (metadataPayload as any).settings
            : {}),
          mode: mode ?? (metadataPayload as any).mode ?? 'manual',
        };
      }
    }
    if (mode !== undefined) {
      updateData.session_type = mode;
      updateData.settings = {
        ...(updateData.settings || {}),
        mode,
      };
    }

    const { data: session, error } = await supabase
      .from('chat_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('❌ [Chat Sessions] Error updating session:', error);
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    const normalized = normalizeSession(session);

    console.log('✅ [Chat Sessions] Updated session:', sessionId);
    return NextResponse.json({ session: normalized });

  } catch (error) {
    console.error('❌ [Chat Sessions] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    console.log('🗑️ [Chat Sessions] Deleting session:', sessionId);

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('chat_sessions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) {
      console.error('❌ [Chat Sessions] Error deleting session:', error);
      return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
    }

    console.log('✅ [Chat Sessions] Deleted session:', sessionId);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ [Chat Sessions] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
