/**
 * Delete Favorite API
 * 
 * Routes:
 *   DELETE /api/favorites/[id] - Remove favorite
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type Params = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * DELETE /api/favorites/[id]
 * Remove from favorites
 */
export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { id } = await params;
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to remove favorite', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Removed from favorites'
    });

  } catch (error) {
    console.error('Favorites deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

