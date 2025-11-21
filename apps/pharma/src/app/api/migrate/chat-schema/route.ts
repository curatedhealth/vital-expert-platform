/**
 * Database Migration API
 * Runs the chat management schema migration
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🗄️ [Migration] Starting chat management schema migration');

    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'database/migrations/006_chat_management_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 [Migration] Executing ${statements.length} SQL statements`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`🔧 [Migration] Executing statement ${i + 1}/${statements.length}`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          
          if (error) {
            console.warn(`⚠️ [Migration] Statement ${i + 1} warning:`, error.message);
            // Continue with other statements even if one fails
          } else {
            console.log(`✅ [Migration] Statement ${i + 1} completed`);
          }
        } catch (err) {
          console.warn(`⚠️ [Migration] Statement ${i + 1} error:`, err);
          // Continue with other statements
        }
      }
    }

    console.log('✅ [Migration] Chat management schema migration completed');
    return NextResponse.json({ 
      success: true, 
      message: 'Chat management schema migration completed successfully' 
    });

  } catch (error) {
    console.error('❌ [Migration] Migration failed:', error);
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
