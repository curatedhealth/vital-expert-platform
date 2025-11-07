/**
 * TAG: AGENT_UPDATE_QUICK_FIX
 * 
 * ⚠️ DEVELOPMENT ONLY - NO AUTHENTICATION REQUIRED
 * 
 * This is a development-friendly version that bypasses authentication
 * to allow agent updates without login. Similar to the agents-crud fix.
 * 
 * ✅ Returns JSON (not HTML)
 * ✅ Works without authentication
 * ✅ Allows all updates in development
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createLogger } from '@/lib/services/observability/structured-logger';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🔧 [QUICK FIX] PUT /api/agents/[id] - Request received');
  
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    console.log('🔧 [QUICK FIX] Agent ID:', id);
    
    const updates = await request.json();
    console.log('🔧 [QUICK FIX] Update keys:', Object.keys(updates));
    
    // Get current agent
    const { data: currentAgent, error: fetchError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.error('🔧 [QUICK FIX] Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch agent', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!currentAgent) {
      console.error('🔧 [QUICK FIX] Agent not found:', id);
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    console.log('🔧 [QUICK FIX] Current agent found:', currentAgent.name);

    // Prepare update payload
    const updatePayload: any = {
      updated_at: new Date().toISOString()
    };
    
    // Handle metadata fields (display_name, avatar, etc.)
    const metadata = currentAgent.metadata || {};
    
    if (updates.display_name !== undefined) {
      metadata.display_name = updates.display_name;
    }
    
    if (updates.avatar !== undefined) {
      metadata.avatar = updates.avatar;
    }
    
    // Update metadata if any metadata fields changed
    if (updates.display_name !== undefined || updates.avatar !== undefined) {
      updatePayload.metadata = metadata;
    }
    
    // Handle direct column updates
    const directFields = ['description', 'system_prompt', 'capabilities', 'knowledge_domains'];
    directFields.forEach(field => {
      if (updates[field] !== undefined) {
        updatePayload[field] = updates[field];
      }
    });
    
    console.log('🔧 [QUICK FIX] Update payload keys:', Object.keys(updatePayload));
    
    // Update agent
    const { data: updatedAgent, error: updateError } = await supabase
      .from('agents')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('🔧 [QUICK FIX] Update error:', updateError);
      return NextResponse.json(
        {
          error: 'Failed to update agent',
          details: updateError.message,
          code: updateError.code
        },
        { status: 500 }
      );
    }

    console.log('🔧 [QUICK FIX] ✅ Agent updated successfully');

    // Normalize response
    const normalizedAgent = {
      ...updatedAgent,
      display_name: updatedAgent.metadata?.display_name || updatedAgent.display_name || updatedAgent.name,
      avatar: updatedAgent.metadata?.avatar || updatedAgent.avatar || '🤖',
    };

    return NextResponse.json({
      success: true,
      agent: normalizedAgent,
    });
    
  } catch (error) {
    console.error('🔧 [QUICK FIX] ❌ Unexpected error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : String(error)
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
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Agent not found', details: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      agent: data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Soft delete
    const { error } = await supabase
      .from('agents')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete agent', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process delete request' },
      { status: 500 }
    );
  }
}

