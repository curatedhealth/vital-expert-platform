import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { id } = await params;
    const updates = await request.json();
    
    // Get current agent to merge metadata properly
    const { data: currentAgent, error: fetchError } = await supabaseAdmin
      .from('agents')
      .select('metadata')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Agent API: Error fetching current agent:', fetchError);
    }

    // Prepare update payload
    const updatePayload: any = {};
    
    // Handle display_name - store ONLY in metadata (not as direct column)
    // The agents table doesn't have a display_name column, it's stored in metadata
    if (updates.display_name !== undefined) {
      if (!updatePayload.metadata) {
        updatePayload.metadata = currentAgent?.metadata || {};
      }
      // Store in metadata.display_name only (not as direct column)
      updatePayload.metadata = {
        ...updatePayload.metadata,
        display_name: updates.display_name,
      };
      // Do NOT set updatePayload.display_name - column doesn't exist in schema
    }

    // Handle avatar - store in metadata.avatar
    if (updates.avatar !== undefined) {
      if (!updatePayload.metadata) {
        updatePayload.metadata = currentAgent?.metadata || {};
      }
      updatePayload.metadata = {
        ...updatePayload.metadata,
        avatar: updates.avatar,
      };
      // Also set avatar_url if column exists (for backward compatibility)
      try {
        updatePayload.avatar_url = updates.avatar;
      } catch (e) {
        // Column might not exist, that's okay
      }
    }

    // Handle other direct column updates (exclude display_name, avatar, and metadata fields from top level)
    // Note: display_name, business_function, department, and role should only be in metadata, not as direct columns
    const metadataOnlyFields = ['display_name', 'business_function', 'department', 'role'];
    Object.keys(updates).forEach((key) => {
      if (key !== 'display_name' && key !== 'avatar' && key !== 'metadata' && !metadataOnlyFields.includes(key)) {
        // Only add fields that exist as actual columns in the agents table
        updatePayload[key] = updates[key];
      }
    });

    // Handle metadata updates (including business_function, department, role)
    if (updates.metadata) {
      // Merge with existing metadata
      updatePayload.metadata = {
        ...(currentAgent?.metadata || {}),
        ...updates.metadata,
      };
    }

    console.log(`🔧 [Agent API] Updating agent ${id}:`, {
      display_name: updatePayload.metadata?.display_name,
      avatar: updatePayload.metadata?.avatar,
      otherFields: Object.keys(updatePayload).filter(k => k !== 'metadata'),
    });
    
    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('agents')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Agent API: Supabase error:', error);

      // Provide more specific error messages
      let errorMessage = 'Failed to update agent';
      if (error.code === 'PGRST116') {
        errorMessage = 'Agent not found';
      } else if (error.code === '23505') {
        errorMessage = 'Agent name or display name already exists';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return NextResponse.json({
        error: errorMessage,
        code: error.code,
        details: error.details
      }, { status: 500 });
    }

    // Normalize the returned agent data to match frontend expectations
    // (similar to what agents-crud does)
    const metadata = data.metadata || {};
    const normalizedAgent = {
      ...data,
      display_name: metadata.display_name || data.display_name || data.name,
      avatar: metadata.avatar || data.avatar || data.avatar_url || '🤖',
    };

    console.log('✅ [Agent API] Agent updated:', {
      id: normalizedAgent.id,
      name: normalizedAgent.name,
      display_name: normalizedAgent.display_name,
      avatar: normalizedAgent.avatar,
    });

    // Sync updated agent to Pinecone for GraphRAG (fire and forget)
    try {
      const { agentEmbeddingService } = await import('@/lib/services/agents/agent-embedding-service');
      const { pineconeVectorService } = await import('@/lib/services/vectorstore/pinecone-vector-service');

      const embeddingData = await agentEmbeddingService.generateAgentEmbedding(normalizedAgent);
      await pineconeVectorService.syncAgentToPinecone({
        agentId: embeddingData.agentId,
        embedding: embeddingData.embedding,
        metadata: embeddingData.metadata,
      });

      // Also update in Supabase
      await agentEmbeddingService.storeAgentEmbeddingInSupabase(
        embeddingData.agentId,
        embeddingData.embedding,
        embeddingData.embeddingType,
        embeddingData.text
      );

      console.log(`✅ [Agent API] Updated agent synced to Pinecone for GraphRAG`);
    } catch (error) {
      // Non-critical - log but don't fail
      console.warn('⚠️ [Agent API] Failed to sync updated agent to Pinecone (non-critical):', error);
    }

    return NextResponse.json({
      success: true,
      agent: normalizedAgent
    });

  } catch (error) {
    console.error('❌ Agent API: Request error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ [Agent API Delete] Missing Supabase configuration');
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    // Create both admin client (for deletion) and user client (for permission check)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user session for permission check
    const { createClient: createServerClient } = await import('@supabase/ssr');
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    
    const supabaseUser = createServerClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
    // Check user role for permission (optional - can delete without auth check if using service role)
    if (user && !userError) {
      const { data: userRole } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      console.log('[Agent API Delete] User:', user.email, 'Role:', userRole?.role || 'none');
    } else {
      console.log('[Agent API Delete] No authenticated user - proceeding with admin privileges');
    }

    const { id } = await params;
    console.log('[Agent API Delete] Attempting to delete agent:', id);

    // Check if agent exists
    const { data: agent, error: fetchError } = await supabaseAdmin
      .from('agents')
      .select('id, name, metadata, tenant_id')
      .eq('id', id)
      .single();

    if (fetchError || !agent) {
      console.error('❌ [Agent API Delete] Agent not found:', id, fetchError);
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    console.log('[Agent API Delete] Agent found:', agent.name);

    // Delete the agent (hard delete)
    const { error: deleteError } = await supabaseAdmin
      .from('agents')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('❌ [Agent API Delete] Delete error:', {
        code: deleteError.code,
        message: deleteError.message,
        details: deleteError.details,
        hint: deleteError.hint,
        agentId: id,
        agentName: agent.name
      });
      
      let errorMessage = 'Failed to delete agent';
      if (deleteError.code === '23503') {
        errorMessage = 'Cannot delete agent: it is referenced by other records (e.g., conversations, user_agents, agent_tools). Please remove these references first.';
      } else if (deleteError.message) {
        errorMessage = `Failed to delete agent: ${deleteError.message}`;
      }

      return NextResponse.json({
        error: errorMessage,
        code: deleteError.code,
        details: deleteError.details,
        hint: deleteError.hint
      }, { status: 500 });
    }

    console.log('✅ [Agent API Delete] Agent deleted successfully:', id, agent.name);

    // Delete agent from Pinecone (fire and forget)
    try {
      const { pineconeVectorService } = await import('@/lib/services/vectorstore/pinecone-vector-service');
      await pineconeVectorService.deleteAgentFromPinecone(id);
      console.log(`✅ [Agent API Delete] Agent deleted from Pinecone`);
    } catch (error) {
      // Non-critical - log but don't fail
      console.warn('⚠️ [Agent API Delete] Failed to delete agent from Pinecone (non-critical):', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully'
    });

  } catch (error) {
    console.error('❌ [Agent API Delete] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process delete request', 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Agent API: Get error:', error);
      return NextResponse.json({
        error: 'Agent not found',
        details: error.message
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      agent: data
    });

  } catch (error) {
    console.error('❌ Agent API: Request error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: String(error) },
      { status: 500 }
    );
  }
}