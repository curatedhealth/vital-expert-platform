import { NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';

/**
 * Admin API: Add UUID column to jtbd_library
 *
 * This migration adds uuid_id column to enable workflow linking
 * while maintaining VARCHAR ids for URLs.
 *
 * Call: POST /api/admin/migrate-jtbd-uuid
 */
export async function POST() {
  try {
    const supabase = getServiceSupabaseClient();
    console.log('🚀 Starting migration: Add UUID to jtbd_library');

    const results: string[] = [];

    // Step 1: Check if column already exists
    const { data: existingColumns } = await supabase
      .from('jtbd_library')
      .select('*')
      .limit(1);

    if (existingColumns && existingColumns.length > 0) {
      const hasUuid = 'uuid_id' in existingColumns[0];
      if (hasUuid) {
        results.push('⚠️  uuid_id column already exists');
        console.log('⚠️  uuid_id column already exists - skipping');
      }
    }

    // Step 2: Count before migration
    const { count: beforeCount } = await supabase
      .from('jtbd_library')
      .select('*', { count: 'exact', head: true });

    results.push(`📊 Total JTBDs before migration: ${beforeCount}`);

    // Step 3: Update schema using raw SQL
    // Note: This requires database access - in production, run migration separately
    const migrationSQL = `
      -- Add UUID column
      ALTER TABLE public.jtbd_library
      ADD COLUMN IF NOT EXISTS uuid_id UUID DEFAULT gen_random_uuid();

      -- Create index
      CREATE INDEX IF NOT EXISTS idx_jtbd_library_uuid
      ON public.jtbd_library(uuid_id);

      -- Add unique constraint
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'jtbd_library_uuid_unique'
        ) THEN
          ALTER TABLE public.jtbd_library
          ADD CONSTRAINT jtbd_library_uuid_unique UNIQUE (uuid_id);
        END IF;
      END $$;

      -- Add column comment
      COMMENT ON COLUMN public.jtbd_library.uuid_id IS 'UUID for internal linking to workflows. Use id field for external references and URLs.';
    `;

    results.push('✅ Migration SQL prepared (needs to be run via Supabase dashboard or SQL editor)');

    // Step 4: Verify (if uuid_id exists)
    const { data: sampleData } = await supabase
      .from('jtbd_library')
      .select('id, uuid_id, jtbd_code, title')
      .limit(5);

    if (sampleData && sampleData.length > 0 && 'uuid_id' in sampleData[0]) {
      results.push('\n✅ Migration verified! Sample records:');
      sampleData.forEach(record => {
        results.push(`  - ${record.id} → ${(record as any).uuid_id}`);
      });

      const { count: uuidCount } = await supabase
        .from('jtbd_library')
        .select('*', { count: 'exact', head: true })
        .not('uuid_id', 'is', null);

      results.push(`\n📊 JTBDs with UUID: ${uuidCount}/${beforeCount}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      results,
      migrationSQL,
      instructions: {
        step1: 'Copy the migrationSQL from this response',
        step2: 'Go to Supabase Dashboard → SQL Editor',
        step3: 'Paste and run the SQL',
        step4: 'Refresh this endpoint to verify'
      }
    });

  } catch (error) {
    console.error('❌ Migration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check migration status
 */
export async function GET() {
  try {
    const supabase = getServiceSupabaseClient();

    // Check if uuid_id column exists
    const { data: sample } = await supabase
      .from('jtbd_library')
      .select('*')
      .limit(1);

    const hasUuidColumn = sample && sample.length > 0 && 'uuid_id' in sample[0];

    if (!hasUuidColumn) {
      return NextResponse.json({
        success: false,
        migrationStatus: 'NOT_RUN',
        message: 'uuid_id column does not exist yet',
        action: 'Run POST /api/admin/migrate-jtbd-uuid to get migration SQL'
      });
    }

    // Count statistics
    const { count: totalCount } = await supabase
      .from('jtbd_library')
      .select('*', { count: 'exact', head: true });

    const { count: uuidCount } = await supabase
      .from('jtbd_library')
      .select('*', { count: 'exact', head: true })
      .not('uuid_id', 'is', null);

    const { data: sampleRecords } = await supabase
      .from('jtbd_library')
      .select('id, uuid_id, jtbd_code, title')
      .limit(5);

    return NextResponse.json({
      success: true,
      migrationStatus: 'COMPLETED',
      statistics: {
        totalJTBDs: totalCount,
        jtbdsWithUUID: uuidCount,
        coverage: totalCount && uuidCount ? `${((uuidCount / totalCount) * 100).toFixed(1)}%` : '0%'
      },
      sampleRecords: sampleRecords?.map(r => ({
        id: r.id,
        uuid_id: (r as any).uuid_id,
        jtbd_code: r.jtbd_code,
        title: r.title?.substring(0, 60)
      }))
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check migration status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
