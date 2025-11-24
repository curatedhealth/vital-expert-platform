import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

/**
 * GET /api/nodes
 * Fetch nodes from node_library
 * 
 * Query Parameters:
 * - category: Filter by node_category
 * - type: Filter by node_type
 * - search: Search in name/description
 * - is_builtin: Filter by is_builtin (true/false)
 * - is_public: Filter by is_public (true/false)
 * - limit: Number of results (default: 100)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const isBuiltin = searchParams.get('is_builtin');
    const isPublic = searchParams.get('is_public');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('node_library')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .eq('is_enabled', true);

    // Apply filters
    if (category) {
      query = query.eq('node_category', category);
    }
    if (type) {
      query = query.eq('node_type', type);
    }
    if (isBuiltin !== null) {
      query = query.eq('is_builtin', isBuiltin === 'true');
    }
    if (isPublic !== null) {
      query = query.eq('is_public', isPublic === 'true');
    }
    if (search) {
      query = query.or(`node_name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply pagination
    query = query
      .order('node_category', { ascending: true })
      .order('node_name', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching nodes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch nodes', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      nodes: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Error in nodes API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/nodes
 * Create a new custom node
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();

    const {
      node_name,
      node_slug,
      display_name,
      description,
      node_type,
      node_category,
      icon,
      node_config,
      tags,
    } = body;

    // Validate required fields
    if (!node_name || !node_slug || !display_name || !node_type || !node_config) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('node_library')
      .insert({
        node_name,
        node_slug,
        display_name,
        description,
        node_type,
        node_category,
        icon,
        node_config,
        tags,
        is_builtin: false,
        is_public: false,
        is_enabled: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating node:', error);
      return NextResponse.json(
        { error: 'Failed to create node', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ node: data }, { status: 201 });
  } catch (error) {
    console.error('Error in nodes API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
