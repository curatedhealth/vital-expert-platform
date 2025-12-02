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
              id: '550e8400-e29b-41d4-a716-446655440001',
              title: 'FDA Regulatory Discussion',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user_id: '550e8400-e29b-41d4-a716-446655440000',
              agent_id: '550e8400-e29b-41d4-a716-446655440002',
              message_count: 5
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440003', 
              title: 'Clinical Trial Planning',
              created_at: new Date(Date.now() - 86400000).toISOString(),
              updated_at: new Date(Date.now() - 3600000).toISOString(),
              user_id: '550e8400-e29b-41d4-a716-446655440000',
              agent_id: '550e8400-e29b-41d4-a716-446655440004',
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
                id: '550e8400-e29b-41d4-a716-446655440001',
                title: 'FDA Regulatory Discussion',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user_id: '550e8400-e29b-41d4-a716-446655440000',
                agent_id: '550e8400-e29b-41d4-a716-446655440002',
                message_count: 5
              },
              {
                id: '550e8400-e29b-41d4-a716-446655440003', 
                title: 'Clinical Trial Planning',
                created_at: new Date(Date.now() - 86400000).toISOString(),
                updated_at: new Date(Date.now() - 3600000).toISOString(),
                user_id: '550e8400-e29b-41d4-a716-446655440000',
                agent_id: '550e8400-e29b-41d4-a716-446655440004',
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

    console.log('🆕 [Chat Conversations API] POST request:', {
      title,
      agent_id,
      user_id: user_id ? `${user_id.substring(0, 8)}...` : 'missing',
    });

    if (!user_id) {
      console.error('❌ [Chat Conversations API] Missing user_id');
      return NextResponse.json(
        {
          success: false,
          error: 'user_id is required',
          details: 'User ID must be provided to create a conversation'
        },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('⚠️ [Chat Conversations API] Supabase configuration missing, returning mock conversation');
      const mockConversation = {
        id: '550e8400-e29b-41d4-a716-' + Date.now().toString().slice(-12),
        title: title || 'New Conversation',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user_id,
        agent_id: agent_id || null,
        message_count: 0
      };
      return NextResponse.json({
        success: true,
        data: {
          conversation: mockConversation
        }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔍 [Chat Conversations API] Attempting to insert into conversations table...');
    
    // Get user's tenant_id from profile
    let tenantId: string | null = null;
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user_id)
      .maybeSingle();

    tenantId = profile?.tenant_id || null;
    
    // Fallback to platform tenant if no tenant_id found - VITAL System tenant
    const PLATFORM_TENANT_ID = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244';
    const STARTUP_TENANT_ID = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'; // Same as platform for VITAL
    
    // Use user's tenant, or fallback to platform tenant
    const finalTenantId = tenantId || PLATFORM_TENANT_ID;
    
    console.log('🔍 [Chat Conversations API] Tenant ID:', {
      fromProfile: tenantId,
      finalTenantId,
      userId: user_id.substring(0, 8) + '...'
    });
    
    // Try to create conversation in database
    // Use existing schema: context (JSONB) and metadata (JSONB) columns
    // agent_id and tenant_id are stored in metadata, not as direct columns
    const now = new Date().toISOString();
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        title: title || 'New Conversation',
        user_id: user_id,
        context: { messages: [] },
        metadata: {
          agent_id: agent_id || null,
          tenant_id: finalTenantId,
          is_pinned: false
        },
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [Chat Conversations API] Database error creating conversation:');
      console.error('   Error code:', error.code);
      console.error('   Error message:', error.message);
      console.error('   Error details:', error.details);
      console.error('   Error hint:', error.hint);
      
      // If table doesn't exist, return mock data
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('⚠️ [Chat Conversations API] Table not found, returning mock conversation');
        const mockConversation = {
          id: '550e8400-e29b-41d4-a716-' + Date.now().toString().slice(-12),
          title: title || 'New Conversation',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: user_id,
          agent_id: agent_id || null,
          message_count: 0
        };
        return NextResponse.json({
          success: true,
          data: {
            conversation: mockConversation
          }
        });
      }
      
      // Return error response instead of throwing
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create conversation',
          details: error.message || 'Database error',
          code: error.code
        },
        { status: 500 }
      );
    }

    if (!conversation) {
      console.error('❌ [Chat Conversations API] No conversation returned from database');
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create conversation',
          details: 'No conversation data returned from database'
        },
        { status: 500 }
      );
    }

    console.log('✅ [Chat Conversations API] Conversation created successfully:', conversation.id);
    
    return NextResponse.json({
      success: true,
      data: {
        conversation
      }
    });

  } catch (error) {
    console.error('❌ [Chat Conversations API] Unexpected error creating conversation:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
    }
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
