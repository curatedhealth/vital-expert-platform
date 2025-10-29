/**
 * Chat Sessions API
 * Handles CRUD operations for chat sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
        mode,
        agent_id,
        agent_name,
        created_at,
        updated_at,
        last_message_at,
        message_count,
        is_active,
        metadata
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

    console.log(`✅ [Chat Sessions] Found ${sessions?.length || 0} sessions`);
    return NextResponse.json({ sessions: sessions || [] });

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

    const { data: session, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        title: title || 'New Chat',
        mode: mode || 'manual',
        agent_id: agentId || null,
        agent_name: agentName || null,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [Chat Sessions] Error creating session:', error);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    console.log('✅ [Chat Sessions] Created session:', session.id);
    return NextResponse.json({ session });

  } catch (error) {
    console.error('❌ [Chat Sessions] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, title, agentId, agentName, metadata } = body;

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
    if (metadata !== undefined) updateData.metadata = metadata;

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

    console.log('✅ [Chat Sessions] Updated session:', sessionId);
    return NextResponse.json({ session });

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
