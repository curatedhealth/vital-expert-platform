import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';



export async function GET(request: NextRequest) {
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);


    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const categories = searchParams.get('categories')?.split(',');
    const search = searchParams.get('search');

    // Special handling for avatar category - query avatars table
    if (category === 'avatar') {
      const { data: avatars, error: avatarsError } = await supabase
        .from('avatars')
        .select('id, icon, name, category, description, sort_order')
        .eq('is_active', true)
        .order('sort_order')
        .order('name');

      if (avatarsError) {
        console.error('Database error:', avatarsError);
        return NextResponse.json(
          { error: 'Failed to fetch avatars', details: avatarsError.message },
          { status: 500 }
        );
      }

      // Transform avatars to match expected format
      const transformedAvatars = (avatars || []).map(avatar => ({
        id: avatar.id,
        name: avatar.name,
        display_name: avatar.name,
        icon: avatar.icon,
        category: avatar.category,
        description: avatar.description,
        sort_order: avatar.sort_order,
        is_active: true
      }));

      return NextResponse.json({
        success: true,
        icons: transformedAvatars,
        total: transformedAvatars.length
      });
    }

    // For all other categories, query icons table (fallback to empty if table doesn't exist)
    let query = supabase
      .from('icons')
      .select('*')
      .eq('is_active', true)
      .order('display_name');

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (categories && categories.length > 0) {
      query = query.in('category', categories);
    }

    if (search) {
      query = query.or(`
        name.ilike.%${search}%,
        display_name.ilike.%${search}%,
        description.ilike.%${search}%,
        tags.cs.{${search}}
      `);
    }

    const { data: icons, error } = await query;

    if (error) {
      console.error('Database error:', error);
      // If icons table doesn't exist, return empty array instead of error
      if (error.message?.includes("Could not find the table 'public.icons'")) {
        return NextResponse.json({
          success: true,
          icons: [],
          total: 0
        });
      }
      return NextResponse.json(
        { error: 'Failed to fetch icons', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      icons: icons || [],
      total: icons?.length || 0
    });

  } catch (error) {
    console.error('Icons API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch icons',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);


    const iconData = await request.json();

    const { data: icon, error } = await supabase
      .from('icons')
      .insert([iconData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create icon', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      icon
    });

  } catch (error) {
    console.error('Icons API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create icon',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}