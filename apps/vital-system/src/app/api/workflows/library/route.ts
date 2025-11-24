/**
 * Workflow Library API
 * Browse and manage workflow library metadata
 * 
 * Routes:
 *   GET /api/workflows/library - Browse workflow library
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/workflows/library
 * Browse workflow library with marketplace features
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const searchParams = request.nextUrl.searchParams;
    
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const visibility = searchParams.get('visibility') || 'public';
    const isFeatured = searchParams.get('featured') === 'true';
    const isVerified = searchParams.get('verified') === 'true';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('workflow_library')
      .select(`
        *,
        workflow:workflow_id(
          id,
          name,
          description,
          workflow_type,
          created_at,
          created_by
        )
      `, { count: 'exact' })
      .is('deleted_at', null)
      .eq('visibility', visibility);

    if (category) query = query.eq('library_category', category);
    if (difficulty) query = query.eq('difficulty_level', difficulty);
    if (isFeatured) query = query.eq('is_featured', true);
    if (isVerified) query = query.eq('is_verified', true);

    if (sortBy === 'rating') {
      query = query.order('rating_average', { ascending: false, nullsFirst: false });
    } else if (sortBy === 'popularity') {
      query = query.order('view_count', { ascending: false });
    } else {
      query = query.order(sortBy, { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch workflows', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      workflows: data,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Workflow library API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

