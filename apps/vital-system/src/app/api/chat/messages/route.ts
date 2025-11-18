/**
 * Chat Messages API
 * Handles CRUD operations for chat messages
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
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    console.log('🔍 [Chat Messages] Fetching messages for session:', sessionId);

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select(`
        id,
        session_id,
        role,
        content,
        agent_id,
        agent_name,
        mode,
        metadata,
        created_at,
        updated_at
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ [Chat Messages] Error fetching messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    console.log(`✅ [Chat Messages] Found ${messages?.length || 0} messages`);
    return NextResponse.json({ messages: messages || [] });

  } catch (error) {
    console.error('❌ [Chat Messages] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, role, content, agentId, agentName, mode, metadata } = body;

    if (!sessionId || !role || !content) {
      return NextResponse.json({ 
        error: 'Session ID, role, and content are required' 
      }, { status: 400 });
    }

    if (!['user', 'assistant', 'system'].includes(role)) {
      return NextResponse.json({ 
        error: 'Role must be user, assistant, or system' 
      }, { status: 400 });
    }

    console.log('💬 [Chat Messages] Adding message to session:', sessionId);

    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role,
        content,
        agent_id: agentId || null,
        agent_name: agentName || null,
        mode: mode || 'manual',
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [Chat Messages] Error adding message:', error);
      return NextResponse.json({ error: 'Failed to add message' }, { status: 500 });
    }

    console.log('✅ [Chat Messages] Added message:', message.id);
    return NextResponse.json({ message });

  } catch (error) {
    console.error('❌ [Chat Messages] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, content, metadata } = body;

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    console.log('📝 [Chat Messages] Updating message:', messageId);

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (content !== undefined) updateData.content = content;
    if (metadata !== undefined) updateData.metadata = metadata;

    const { data: message, error } = await supabase
      .from('chat_messages')
      .update(updateData)
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      console.error('❌ [Chat Messages] Error updating message:', error);
      return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
    }

    console.log('✅ [Chat Messages] Updated message:', messageId);
    return NextResponse.json({ message });

  } catch (error) {
    console.error('❌ [Chat Messages] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    console.log('🗑️ [Chat Messages] Deleting message:', messageId);

    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('❌ [Chat Messages] Error deleting message:', error);
      return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
    }

    console.log('✅ [Chat Messages] Deleted message:', messageId);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ [Chat Messages] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
