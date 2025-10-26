import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@vital/sdk/client';

export async function GET(request: NextRequest) {
  try {
    // Try to get agents table schema
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .limit(1);

    if (error) {
      // console.error('Schema check error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get the columns from the first row (if any)
    const columns = data && data.length > 0 ? Object.keys(data[0]) : [];

    return NextResponse.json({
      success: true,
      columns: columns,
      message: `Found ${columns.length} columns in agents table`
    });

  } catch (error) {
    // console.error('Schema check exception:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check schema',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}