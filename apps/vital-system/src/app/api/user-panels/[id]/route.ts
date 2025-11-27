import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';
import { createServerClient } from '@supabase/ssr';

/**
 * GET /api/user-panels/[id]
 * Get a specific custom panel by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Create server-side Supabase client that can read cookies from request
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
        },
      }
    );
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Try to get service Supabase client, but handle gracefully if not configured
    let serviceSupabase;
    try {
      serviceSupabase = getServiceSupabaseClient();
    } catch (configError: any) {
      console.warn('[User Panels API] Supabase service not configured:', configError.message);
      return NextResponse.json(
        { error: 'Database not configured', message: 'Unable to fetch panel. Please configure Supabase service.' },
        { status: 503 }
      );
    }
    
    const { data: panel, error } = await serviceSupabase
      .from('user_panels')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Panel not found' },
          { status: 404 }
        );
      }
      console.error('[User Panels API] Error fetching panel:', error);
      return NextResponse.json(
        { error: 'Failed to fetch panel', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      panel,
    });

  } catch (error: any) {
    console.error('[User Panels API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user-panels/[id]
 * Update a custom panel
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Create server-side Supabase client that can read cookies from request
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
        },
      }
    );
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const serviceSupabase = getServiceSupabaseClient();

    // Prepare update object
    const updates: any = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    // If updating last_used_at, set it to now
    if (body.update_last_used === true) {
      updates.last_used_at = new Date().toISOString();
      delete updates.update_last_used; // Remove the flag
    }

    // Update the panel
    const { data: panel, error } = await serviceSupabase
      .from('user_panels')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Panel not found' },
          { status: 404 }
        );
      }
      console.error('[User Panels API] Error updating panel:', error);
      return NextResponse.json(
        { error: 'Failed to update panel', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      panel,
    });

  } catch (error: any) {
    console.error('[User Panels API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user-panels/[id]
 * Delete a custom panel
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Create server-side Supabase client that can read cookies from request
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
        },
      }
    );
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Try to get service Supabase client, but handle gracefully if not configured
    let serviceSupabase;
    try {
      serviceSupabase = getServiceSupabaseClient();
    } catch (configError: any) {
      console.warn('[User Panels API] Supabase service not configured:', configError.message);
      return NextResponse.json(
        { error: 'Database not configured', message: 'Unable to fetch panel. Please configure Supabase service.' },
        { status: 503 }
      );
    }

    // Delete the panel
    const { error } = await serviceSupabase
      .from('user_panels')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('[User Panels API] Error deleting panel:', error);
      return NextResponse.json(
        { error: 'Failed to delete panel', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Panel deleted successfully',
    });

  } catch (error: any) {
    console.error('[User Panels API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

