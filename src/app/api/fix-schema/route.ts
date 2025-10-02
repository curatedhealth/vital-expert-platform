import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    // Try to add the missing columns by attempting a query that will reveal the schema
    const { data: testData, error: testError } = await supabase
      .from('agents')
      .select('business_function, role')
      .limit(1);

    if (testError) {
      // Check if we can query the table structure
      const { data: tableInfo, error: infoError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'agents')
        .eq('table_schema', 'public');

      if (infoError) {
        console.error('Cannot access table info:', infoError);
      } else {
        const columns = tableInfo?.map(col => col.column_name) || [];
      }

      return NextResponse.json({
        error: 'Missing business_function and/or role columns',
        message: 'Database schema needs to be updated. Please run the migration: 20250919170000_add_healthcare_fields_to_agents.sql',
        testError: testError.message,
        tableInfo: tableInfo
      }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Schema appears to be correct',
      data: testData
    });
  } catch (error) {
    console.error('Schema check error:', error);
    return NextResponse.json(
      { error: 'Failed to check schema', details: String(error) },
      { status: 500 }
    );
  }
}