/**
 * Template Library API
 * Browse, search, and manage templates
 * 
 * Routes:
 *   GET  /api/templates - Browse templates
 *   GET  /api/templates/:id - Get template details
 *   POST /api/templates - Create custom template
 *   PUT  /api/templates/:id - Update template
 *   DELETE /api/templates/:id - Delete template
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/templates
 * Browse and search templates
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const templateType = searchParams.get('type'); // 'prompt', 'workflow', 'agent', 'panel'
    const category = searchParams.get('category');
    const framework = searchParams.get('framework');
    const isFeatured = searchParams.get('featured') === 'true';
    const isBuiltin = searchParams.get('builtin') === 'true';
    const search = searchParams.get('search');
    const tags = searchParams.get('tags')?.split(',');
    const sortBy = searchParams.get('sortBy') || 'created_at'; // 'rating', 'usage', 'created_at'
    const order = searchParams.get('order') || 'desc'; // 'asc' | 'desc'
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('template_library')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .eq('is_enabled', true)
      .eq('is_public', true);

    // Apply filters
    if (templateType) {
      query = query.eq('template_type', templateType);
    }
    if (category) {
      query = query.eq('template_category', category);
    }
    if (framework) {
      query = query.eq('framework', framework);
    }
    if (isFeatured) {
      query = query.eq('is_featured', true);
    }
    if (isBuiltin) {
      query = query.eq('is_builtin', true);
    }
    if (search) {
      query = query.or(`template_name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (tags && tags.length > 0) {
      query = query.contains('tags', tags);
    }

    // Apply sorting
    if (sortBy === 'rating') {
      query = query.order('rating_average', { ascending: order === 'asc', nullsFirst: false });
    } else if (sortBy === 'usage') {
      query = query.order('usage_count', { ascending: order === 'asc' });
    } else {
      query = query.order(sortBy, { ascending: order === 'asc' });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Template query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch templates', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      templates: data,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Template API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates
 * Create a new custom template
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();

    // Get user from auth header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    // Validate required fields
    const {
      template_name,
      template_slug,
      display_name,
      template_type,
      content
    } = body;

    if (!template_name || !template_slug || !display_name || !template_type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: template_name, template_slug, display_name, template_type, content' },
        { status: 400 }
      );
    }

    // Create template
    const { data, error } = await supabase
      .from('template_library')
      .insert({
        ...body,
        created_by: user.id,
        is_builtin: false,
        is_public: body.is_public ?? false
      })
      .select()
      .single();

    if (error) {
      console.error('Template creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create template', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      template: data,
      message: 'Template created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Template creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

