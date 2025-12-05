import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Ask Expert Sessions API
 *
 * GET /api/ask-expert?userId=xxx - Fetch user's sessions
 * GET /api/ask-expert?conversationId=xxx - Fetch single conversation
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
                                process.env.NEW_SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('[Ask Expert API] Supabase configuration missing');
      return NextResponse.json({ success: true, sessions: [] });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const conversationId = searchParams.get('conversationId');

    // If conversationId is provided, fetch that single conversation
    if (conversationId) {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select('id, title, metadata, context, created_at, updated_at')
        .eq('id', conversationId)
        .single();

      if (error) {
        console.error('[Ask Expert API] Failed to fetch conversation:', error);
        return NextResponse.json(
          { error: 'Conversation not found', success: false },
          { status: 404 }
        );
      }

      // Fetch agent details if present in metadata
      let agent = null;
      const agentId = conversation?.metadata?.agent_id;
      if (agentId) {
        const { data: agentData } = await supabase
          .from('agents')
          .select('id, name, display_name, description, avatar_url')
          .eq('id', agentId)
          .single();
        agent = agentData;
      }

      return NextResponse.json({
        success: true,
        conversation: { ...conversation, agent }
      });
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // Get user's sessions from CONVERSATIONS table
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('id, title, metadata, context, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[Ask Expert API] Failed to fetch conversations:', error);
      // Return empty sessions on error (graceful degradation)
      return NextResponse.json({ success: true, sessions: [] });
    }

    if (!conversations || conversations.length === 0) {
      return NextResponse.json({ success: true, sessions: [] });
    }

    // Get unique agent IDs from metadata
    const agentIds = [...new Set(
      conversations
        .map((c: any) => c.metadata?.agent_id)
        .filter(Boolean)
    )];

    // Fetch agent details
    let agentMap = new Map();
    if (agentIds.length > 0) {
      const { data: agents } = await supabase
        .from('agents')
        .select('id, name, display_name, description, avatar_url')
        .in('id', agentIds);

      if (agents) {
        agents.forEach((agent: any) => {
          agentMap.set(agent.id, agent);
        });
      }
    }

    // Transform conversations to sessions format
    const sessions = conversations.map((conv: any) => {
      const agentId = conv.metadata?.agent_id;
      const agent = agentId ? agentMap.get(agentId) : null;
      const messagesArray = conv.context?.messages || [];

      return {
        sessionId: conv.id,
        conversationId: conv.id,
        title: conv.title || 'New Consultation',
        agent: agent ? {
          name: agent.display_name || agent.name,
          description: agent.description,
          avatar: agent.avatar_url,
        } : undefined,
        lastMessage: conv.updated_at || conv.created_at,
        messageCount: messagesArray.length,
      };
    });

    return NextResponse.json({ success: true, sessions });
  } catch (error: any) {
    console.error('[Ask Expert API] Unexpected error:', error);
    return NextResponse.json({ success: true, sessions: [] });
  }
}
