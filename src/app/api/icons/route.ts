import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const categories = searchParams.get('categories')?.split(',');
    const search = searchParams.get('search');

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