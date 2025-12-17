import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Ask Panel Sessions API
 *
 * GET /api/ask-panel?userId=xxx - Fetch user's panel sessions
 * GET /api/ask-panel?conversationId=xxx - Fetch single panel conversation
 * POST /api/ask-panel - Save a new panel session to history
 *
 * Panel sessions are stored in the 'conversations' table with metadata.mode = 'panel'
 */

// Helper to get Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
                              process.env.NEW_SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

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

    // Get user's panel sessions from CONVERSATIONS table
    // Filter by metadata.mode = 'panel'
    // If no userId or userId is 'default-user', get all panel sessions (dev/bypass mode)
    let query = supabase
      .from('conversations')
      .select('id, title, metadata, context, created_at, updated_at')
      .filter('metadata->>mode', 'eq', 'panel')
      .order('updated_at', { ascending: false })
      .limit(50);

    // Only filter by user if a real userId is provided (not bypass mode)
    if (userId && userId !== 'default-user') {
      query = query.eq('user_id', userId);
    }

    const { data: conversations, error } = await query;

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

/**
 * POST /api/ask-panel
 * Save a panel session to history
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('[Ask Panel API] Supabase configuration missing - cannot save panel');
      return NextResponse.json(
        { error: 'Database configuration missing', success: false },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      userId,
      missionId,
      title,
      goal,
      panelType,
      experts,
      responses,
      consensus,
      finalOutput,
      totalCost,
      qualityScore,
      executionTimeMs,
    } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', success: false },
        { status: 400 }
      );
    }

    if (!goal) {
      return NextResponse.json(
        { error: 'goal is required', success: false },
        { status: 400 }
      );
    }

    // Extract agent IDs and names from experts
    const agentIds = experts?.map((e: any) => e.id).filter(Boolean) || [];
    const agentNames = experts?.map((e: any) => e.name).filter(Boolean) || [];

    // Build messages array from responses
    const messages: any[] = [];

    // Add initial user message (the goal/question)
    messages.push({
      role: 'user',
      content: goal,
      timestamp: new Date().toISOString(),
    });

    // Add expert responses as assistant messages
    if (responses && Array.isArray(responses)) {
      responses.forEach((response: any) => {
        messages.push({
          role: 'assistant',
          content: response.content,
          metadata: {
            expertId: response.expertId,
            expertName: response.expertName,
            confidence: response.confidence,
            round: response.round,
            position: response.position,
            vote: response.vote,
          },
          timestamp: response.timestamp || new Date().toISOString(),
        });
      });
    }

    // Add final synthesis if present
    if (finalOutput?.content) {
      messages.push({
        role: 'assistant',
        content: finalOutput.content,
        metadata: {
          type: 'synthesis',
          consensusScore: consensus?.consensusScore,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Create the conversation record
    const conversationData = {
      user_id: userId,
      title: title || `Panel: ${goal.slice(0, 50)}${goal.length > 50 ? '...' : ''}`,
      metadata: {
        mode: 'panel',
        panel_type: panelType || 'structured',
        mission_id: missionId,
        agent_ids: agentIds,
        agent_names: agentNames,
        consensus_score: consensus?.consensusScore,
        consensus_level: consensus?.consensusLevel,
        total_cost: totalCost,
        quality_score: qualityScore,
        expert_count: experts?.length || 0,
      },
      context: {
        messages,
        panel_result: {
          final_output: finalOutput,
          consensus,
          execution_time_ms: executionTimeMs,
          expert_count: experts?.length || 0,
          round_count: finalOutput?.roundCount || 1,
        },
      },
    };

    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert(conversationData)
      .select('id, title, created_at')
      .single();

    if (error) {
      console.error('[Ask Panel API] Failed to save panel session:', error);
      return NextResponse.json(
        { error: 'Failed to save panel session', details: error.message, success: false },
        { status: 500 }
      );
    }

    console.log('[Ask Panel API] Panel session saved:', conversation.id);

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      title: conversation.title,
      message: 'Panel session saved to history',
    });
  } catch (error: any) {
    console.error('[Ask Panel API] Unexpected error saving panel:', error);
    return NextResponse.json(
      { error: 'Failed to save panel session', details: error.message, success: false },
      { status: 500 }
    );
  }
}
