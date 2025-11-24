/**
 * User Ratings API
 * Manage ratings and reviews
 * 
 * Routes:
 *   GET  /api/ratings - Get ratings for item
 *   POST /api/ratings - Add/update rating
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/ratings
 * Get ratings for an item
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const searchParams = request.nextUrl.searchParams;
    
    const itemType = searchParams.get('itemType');
    const itemId = searchParams.get('itemId');

    if (!itemType || !itemId) {
      return NextResponse.json(
        { error: 'Missing required parameters: itemType, itemId' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('user_ratings')
      .select('*')
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .order('helpful_count', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch ratings', details: error.message },
        { status: 500 }
      );
    }

    // Calculate stats
    const ratings = data || [];
    const totalRatings = ratings.length;
    const avgRating = totalRatings > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;
    
    const distribution = [1, 2, 3, 4, 5].map(star => ({
      star,
      count: ratings.filter(r => r.rating === star).length
    }));

    return NextResponse.json({
      ratings,
      stats: {
        totalRatings,
        averageRating: Math.round(avgRating * 100) / 100,
        distribution
      }
    });

  } catch (error) {
    console.error('Ratings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ratings
 * Add or update rating
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

    const { item_type, item_id, rating, review } = body;

    if (!item_type || !item_id || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields: item_type, item_id, rating' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Use upsert to handle insert or update
    const { data, error } = await supabase
      .from('user_ratings')
      .upsert({
        user_id: user.id,
        item_type,
        item_id,
        rating,
        review
      }, {
        onConflict: 'user_id,item_type,item_id'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save rating', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      rating: data,
      message: 'Rating saved successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Ratings creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

