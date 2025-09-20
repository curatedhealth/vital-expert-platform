import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: icon, error } = await supabase
      .from('icons')
      .select('*')
      .eq('id', params.id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Icon not found' },
          { status: 404 }
        );
      }
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch icon', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      icon
    });

  } catch (error) {
    console.error('Icon API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch icon',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();

    const { data: icon, error } = await supabase
      .from('icons')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update icon', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      icon
    });

  } catch (error) {
    console.error('Icon API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update icon',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('icons')
      .update({ is_active: false })
      .eq('id', params.id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete icon', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Icon deleted successfully'
    });

  } catch (error) {
    console.error('Icon API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete icon',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}