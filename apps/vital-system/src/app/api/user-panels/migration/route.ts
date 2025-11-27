import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * GET /api/user-panels/migration
 * Returns the SQL migration script needed to create the user_panels table
 */
export async function GET() {
  try {
    // Read the migration script
    const migrationPath = join(process.cwd(), 'scripts', 'create-user-panels-table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    return NextResponse.json({
      success: true,
      sql: migrationSQL,
      instructions: [
        '1. Go to your Supabase Dashboard: https://supabase.com/dashboard',
        '2. Select your project',
        '3. Click "SQL Editor" in the left sidebar',
        '4. Click "New Query"',
        '5. Copy the SQL below and paste it into the editor',
        '6. Click "Run" (or press Cmd+Enter / Ctrl+Enter)',
        '7. You should see: ✅ user_panels table created successfully!',
      ],
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Could not read migration script',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

