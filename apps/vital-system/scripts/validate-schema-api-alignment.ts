#!/usr/bin/env ts-node
/**
 * Schema-API Alignment Validator
 *
 * This script validates that all API endpoints reference valid database tables.
 * Run this in CI/CD to catch schema-API mismatches before deployment.
 *
 * Usage:
 *   npm run validate:schema
 *   ts-node scripts/validate-schema-api-alignment.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

// Known table name mappings (from SCHEMA_REGISTRY.md)
const KNOWN_TABLE_RENAMES: Record<string, string> = {
  'tool_categories': 'REMOVED (now tools.category column)',
  'knowledge_documents': 'knowledge_sources',
  'business_functions': 'suite_functions',
  'departments': 'org_departments',
  'organizational_roles': 'organizational_levels',
};

const DEPRECATED_TABLES = Object.keys(KNOWN_TABLE_RENAMES);

interface ValidationResult {
  file: string;
  line: number;
  tableName: string;
  status: 'valid' | 'deprecated' | 'unknown';
  suggestion?: string;
}

/**
 * Extract table names from API route files
 */
function extractTableReferences(filePath: string): Array<{ tableName: string; line: number }> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const references: Array<{ tableName: string; line: number }> = [];

  // Regex patterns to match Supabase queries
  const patterns = [
    /\.from\(['"]([a-z_]+)['"]\)/g,           // .from('table_name')
    /\.schema\(['"]([a-z_]+)['"]\)/g,         // .schema('schema_name')
  ];

  lines.forEach((line, index) => {
    patterns.forEach((pattern) => {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        const tableName = match[1];

        // Skip common false positives
        if (tableName === 'public' || tableName === 'auth') {
          continue;
        }

        references.push({
          tableName,
          line: index + 1,
        });
      }
    });
  });

  return references;
}

/**
 * Validate table reference against actual database schema
 */
async function validateTableExists(tableName: string, supabase: any): Promise<boolean> {
  try {
    // Query pg_tables to check if table exists
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .single();

    return !error && !!data;
  } catch {
    return false;
  }
}

/**
 * Main validation function
 */
async function validateSchemaApiAlignment() {
  console.log('🔍 VITAL Schema-API Alignment Validator\n');

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERROR: Supabase credentials not configured');
    console.error('   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Find all API route files
  const apiFiles = glob.sync('src/app/api/**/route.ts', {
    cwd: process.cwd(),
    absolute: true,
  });

  console.log(`📁 Found ${apiFiles.length} API route files\n`);

  const results: ValidationResult[] = [];
  let deprecatedCount = 0;
  let unknownCount = 0;

  // Validate each file
  for (const file of apiFiles) {
    const relativePath = path.relative(process.cwd(), file);
    const references = extractTableReferences(file);

    for (const ref of references) {
      let status: 'valid' | 'deprecated' | 'unknown' = 'valid';
      let suggestion: string | undefined;

      // Check if deprecated
      if (DEPRECATED_TABLES.includes(ref.tableName)) {
        status = 'deprecated';
        suggestion = `Use ${KNOWN_TABLE_RENAMES[ref.tableName]} instead`;
        deprecatedCount++;
      } else {
        // Check if table exists in database
        const exists = await validateTableExists(ref.tableName, supabase);
        if (!exists) {
          status = 'unknown';
          suggestion = 'Table not found in database schema';
          unknownCount++;
        }
      }

      if (status !== 'valid') {
        results.push({
          file: relativePath,
          line: ref.line,
          tableName: ref.tableName,
          status,
          suggestion,
        });
      }
    }
  }

  // Print results
  if (results.length === 0) {
    console.log('✅ All API endpoints reference valid database tables!\n');
    return;
  }

  console.log('⚠️  Schema-API Misalignment Detected\n');
  console.log('━'.repeat(80));

  // Group by status
  const deprecatedResults = results.filter((r) => r.status === 'deprecated');
  const unknownResults = results.filter((r) => r.status === 'unknown');

  if (deprecatedResults.length > 0) {
    console.log('\n🔶 DEPRECATED TABLE REFERENCES:\n');
    deprecatedResults.forEach((result) => {
      console.log(`  ${result.file}:${result.line}`);
      console.log(`    Table: "${result.tableName}"`);
      console.log(`    Fix: ${result.suggestion}\n`);
    });
  }

  if (unknownResults.length > 0) {
    console.log('\n❌ UNKNOWN TABLE REFERENCES:\n');
    unknownResults.forEach((result) => {
      console.log(`  ${result.file}:${result.line}`);
      console.log(`    Table: "${result.tableName}"`);
      console.log(`    Issue: ${result.suggestion}\n`);
    });
  }

  console.log('━'.repeat(80));
  console.log(`\n📊 Summary:`);
  console.log(`   Total Issues: ${results.length}`);
  console.log(`   Deprecated: ${deprecatedCount}`);
  console.log(`   Unknown: ${unknownCount}`);
  console.log(`\n💡 Tip: Update SCHEMA_REGISTRY.md when making schema changes\n`);

  // Exit with error code if issues found
  process.exit(1);
}

// Run validator
validateSchemaApiAlignment().catch((error) => {
  console.error('❌ Validation failed with error:', error);
  process.exit(1);
});
