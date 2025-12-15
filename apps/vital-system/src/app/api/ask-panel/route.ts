import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Ask Panel Sessions API
 *
 * GET /api/ask-panel?userId=xxx - Fetch user's panel sessions
 * GET /api/ask-panel?conversationId=xxx - Fetch single panel conversation
 *
 * Panel sessions are stored in the 'conversations' table with metadata.mode = 'panel'
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
                                process.env.NEW_SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('[Ask Panel API] Supabase configuration missing');
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
        console.error('[Ask Panel API] Failed to fetch conversation:', error);
        return NextResponse.json(
          { error: 'Conversation not found', success: false },
          { status: 404 }
        );
      }

      // Get agent details if present in metadata
      let agents: any[] = [];
      const agentIds = conversation?.metadata?.agent_ids;
      if (agentIds && Array.isArray(agentIds) && agentIds.length > 0) {
        const { data: agentsData } = await supabase
          .from('agents')
          .select('id, name, display_name, description, avatar_url')
          .in('id', agentIds);
        agents = agentsData || [];
      }

      return NextResponse.json({
        success: true,
        conversation: { ...conversation, agents }
      });
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // Get user's panel sessions from CONVERSATIONS table
    // Filter by metadata.mode = 'panel'
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('id, title, metadata, context, created_at, updated_at')
      .eq('user_id', userId)
      .filter('metadata->>mode', 'eq', 'panel')
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[Ask Panel API] Failed to fetch panel sessions:', error);
      // Return empty sessions on error (graceful degradation)
      return NextResponse.json({ success: true, sessions: [] });
    }

    if (!conversations || conversations.length === 0) {
      return NextResponse.json({ success: true, sessions: [] });
    }

    // Get unique agent IDs from metadata
    const allAgentIds = new Set<string>();
    conversations.forEach((c: any) => {
      const ids = c.metadata?.agent_ids;
      if (Array.isArray(ids)) {
        ids.forEach((id: string) => allAgentIds.add(id));
      }
    });

    // Fetch agent details
    let agentMap = new Map();
    if (allAgentIds.size > 0) {
      const { data: agents } = await supabase
        .from('agents')
        .select('id, name, display_name, description, avatar_url')
        .in('id', Array.from(allAgentIds));

      if (agents) {
        agents.forEach((agent: any) => {
          agentMap.set(agent.id, agent);
        });
      }
    }

    // Transform conversations to sessions format
    const sessions = conversations.map((conv: any) => {
      const agentIds = conv.metadata?.agent_ids || [];
      const agentNames = conv.metadata?.agent_names || [];
      const messagesArray = conv.context?.messages || [];
      const panelResult = conv.context?.panel_result;

      // Get agent details
      const agents = agentIds.map((id: string, index: number) => {
        const agent = agentMap.get(id);
        return agent ? {
          id: agent.id,
          name: agent.display_name || agent.name,
          description: agent.description,
          avatar: agent.avatar_url,
        } : {
          id,
          name: agentNames[index] || 'Expert',
        };
      });

      // Extract first user message for preview
      const firstUserMessage = messagesArray.find((m: any) => m.role === 'user');
      const questionPreview = firstUserMessage?.content?.slice?.(0, 100) || '';

      return {
        sessionId: conv.id,
        conversationId: conv.id,
        title: conv.title || 'Panel Discussion',
        questionPreview,
        panelType: conv.metadata?.panel_type || 'structured',
        agents,
        agentCount: agents.length,
        // Panel-specific data
        consensusScore: conv.metadata?.consensus_score || panelResult?.consensus_score,
        executionTimeMs: panelResult?.execution_time_ms,
        // Metadata for navigation
        metadata: conv.metadata || undefined,
        lastMessage: conv.updated_at || conv.created_at,
        messageCount: messagesArray.length,
      };
    });

    return NextResponse.json({ success: true, sessions });
  } catch (error: any) {
    console.error('[Ask Panel API] Unexpected error:', error);
    return NextResponse.json({ success: true, sessions: [] });
  }
}
