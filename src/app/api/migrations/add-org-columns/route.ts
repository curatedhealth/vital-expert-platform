import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST() {
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('Adding organizational columns to agents table...');

    // We'll use a workaround: try to select the columns, and if they don't exist,
    // the error will tell us. For now, let's verify they exist by checking the schema

    // Check if columns exist
    const { data: columnCheck } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'agents')
      .in('column_name', ['function_id', 'department_id', 'role_id']);

    console.log('Existing org columns:', columnCheck);

    // For now, let's just verify we can read agents with these columns
    const { data: testAgent, error: testError } = await supabaseAdmin
      .from('agents')
      .select('id, function_id, department_id, role_id')
      .limit(1)
      .single();

    if (testError) {
      return NextResponse.json({
        success: false,
        error: 'Columns do not exist yet',
        details: testError.message,
        sqlToRun: `
-- Run this SQL in Supabase SQL Editor:

ALTER TABLE agents
ADD COLUMN IF NOT EXISTS function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_agents_function_id ON agents(function_id);
CREATE INDEX IF NOT EXISTS idx_agents_department_id ON agents(department_id);
CREATE INDEX IF NOT EXISTS idx_agents_role_id ON agents(role_id);
        `
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Organizational columns already exist',
      testAgent
    });

  } catch (error) {
    console.error('[Add Org Columns] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add organizational columns',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
