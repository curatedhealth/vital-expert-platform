/**
 * User Favorites API
 * Manage user bookmarks
 * 
 * Routes:
 *   GET    /api/favorites - Get user favorites
 *   POST   /api/favorites - Add favorite
 *   DELETE /api/favorites/[id] - Remove favorite
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/favorites
 * Get user's favorites
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    const itemType = request.nextUrl.searchParams.get('type');

    let query = supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', user.id);

    if (itemType) {
      query = query.eq('item_type', itemType);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch favorites', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ favorites: data || [] });

  } catch (error) {
    console.error('Favorites API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/favorites
 * Add to favorites
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    const { item_type, item_id, notes } = body;

    if (!item_type || !item_id) {
      return NextResponse.json(
        { error: 'Missing required fields: item_type, item_id' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: user.id,
        item_type,
        item_id,
        notes
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Item already in favorites' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to add favorite', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      favorite: data,
      message: 'Added to favorites'
    }, { status: 201 });

  } catch (error) {
    console.error('Favorites creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

