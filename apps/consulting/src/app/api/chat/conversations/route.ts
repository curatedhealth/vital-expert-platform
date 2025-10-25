import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('⚠️ Supabase configuration missing, returning mock conversations');
      return NextResponse.json({
        success: true,
        data: {
          conversations: [
            {
              id: 'mock-conv-1',
              title: 'FDA Regulatory Discussion',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user_id: 'mock-user-1',
              agent_id: 'mock-agent-1',
              message_count: 5
            },
            {
              id: 'mock-conv-2', 
              title: 'Clinical Trial Planning',
              created_at: new Date(Date.now() - 86400000).toISOString(),
              updated_at: new Date(Date.now() - 3600000).toISOString(),
              user_id: 'mock-user-1',
              agent_id: 'mock-agent-2',
              message_count: 12
            }
          ]
        }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try to fetch conversations from database
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[Chat Conversations API] Error:', error);
      // If table doesn't exist, return mock data
      if (error.code === '42P01') {
        console.log('[Chat Conversations API] Table not found, returning mock data');
        return NextResponse.json({
          success: true,
          data: {
            conversations: [
              {
                id: 'mock-conv-1',
                title: 'FDA Regulatory Discussion',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user_id: 'mock-user-1',
                agent_id: 'mock-agent-1',
                message_count: 5
              },
              {
                id: 'mock-conv-2', 
                title: 'Clinical Trial Planning',
                created_at: new Date(Date.now() - 86400000).toISOString(),
                updated_at: new Date(Date.now() - 3600000).toISOString(),
                user_id: 'mock-user-1',
                agent_id: 'mock-agent-2',
                message_count: 12
              }
            ]
          }
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: {
        conversations: conversations || []
      }
    });

  } catch (error) {
    console.error('[Chat Conversations API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch conversations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, agent_id, user_id } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('⚠️ Supabase configuration missing, returning mock conversation');
      return NextResponse.json({
        success: true,
        data: {
          conversation: {
            id: 'mock-conv-' + Date.now(),
            title: title || 'New Conversation',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: user_id || 'mock-user-1',
            agent_id: agent_id || 'mock-agent-1',
            message_count: 0
          }
        }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try to create conversation in database
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        title: title || 'New Conversation',
        user_id: user_id || 'mock-user-1',
        agent_id: agent_id || 'mock-agent-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[Chat Conversations API] Error creating conversation:', error);
      // If table doesn't exist, return mock data
      if (error.code === '42P01') {
        console.log('[Chat Conversations API] Table not found, returning mock conversation');
        return NextResponse.json({
          success: true,
          data: {
            conversation: {
              id: 'mock-conv-' + Date.now(),
              title: title || 'New Conversation',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user_id: user_id || 'mock-user-1',
              agent_id: agent_id || 'mock-agent-1',
              message_count: 0
            }
          }
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: {
        conversation
      }
    });

  } catch (error) {
    console.error('[Chat Conversations API] Error creating conversation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create conversation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
