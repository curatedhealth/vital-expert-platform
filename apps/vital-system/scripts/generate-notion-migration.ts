/**
 * Generate SQL migration file from Notion Prompts database
 * This script fetches data from Notion and creates INSERT statements for Supabase
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import path from 'path';
import { writeFileSync } from 'fs';

// Load environment
const projectRoot = path.resolve(process.cwd(), '../..');
dotenv.config({ path: path.join(projectRoot, '.env.local') });

const NOTION_TOKEN = process.env.NOTION_TOKEN!;
const DATABASE_ID = '282345b0-299e-8165-833e-000bf89bbd84';

const notion = new Client({ auth: NOTION_TOKEN });

/**
 * Extract text from Notion rich text or title
 */
function extractText(richText: any): string {
  if (!richText) return '';
  if (Array.isArray(richText)) {
    return richText.map((rt: any) => rt?.text?.content || rt?.plain_text || '').join('').trim();
  }
  return richText?.text?.content || richText?.plain_text || '';
}

/**
 * Extract multi-select values
 */
function extractMultiSelect(select: any): string[] {
  if (!select) return [];
  if (Array.isArray(select)) {
    return select.map((s: any) => s?.name || s).filter(Boolean);
  }
  if (select.multi_select) {
    return select.multi_select.map((s: any) => s.name);
  }
  return [];
}

/**
 * Extract single select value
 */
function extractSelect(select: any): string {
  if (!select) return '';
  if (select.select) return select.select.name || '';
  if (select.name) return select.name;
  if (typeof select === 'string') return select;
  return '';
}

/**
 * Extract checkbox value
 */
function extractCheckbox(checkbox: any): boolean {
  if (typeof checkbox === 'boolean') return checkbox;
  if (checkbox?.checkbox !== undefined) return checkbox.checkbox;
  return false;
}

/**
 * Escape SQL strings
 */
function escapeSql(str: string): string {
  if (!str) return '';
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

/**
 * Generate UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Fetch all pages from Notion database using search API
 */
async function fetchAllPages(): Promise<any[]> {
  console.log('📥 Fetching pages from Notion database...');
  
  let allPages: any[] = [];
  let hasMore = true;
  let nextCursor: string | undefined = undefined;
  
  while (hasMore) {
    const searchParams: any = {
      filter: {
        value: 'page',
        property: 'object',
      },
      page_size: 100,
    };
    
    if (nextCursor) {
      searchParams.start_cursor = nextCursor;
    }
    
    const response = await notion.search(searchParams);
    
    // Filter for pages in our database
    const databasePages = response.results.filter(
      (page: any) => {
        const parent = page.parent;
        return parent?.type === 'database_id' && 
               parent.database_id?.replace(/-/g, '') === DATABASE_ID.replace(/-/g, '');
      }
    );
    
    // Fetch full page details with properties
    for (const page of databasePages) {
      try {
        const fullPage = await notion.pages.retrieve({ page_id: page.id });
        allPages.push(fullPage);
      } catch (error) {
        console.warn(`   ⚠️  Could not fetch page ${page.id}`);
      }
    }
    
    hasMore = response.has_more;
    nextCursor = response.next_cursor || undefined;
    
    if (hasMore && databasePages.length > 0) {
      console.log(`   Fetched ${allPages.length} pages so far, continuing...`);
    }
  }
  
  console.log(`✅ Fetched ${allPages.length} pages total\n`);
  return allPages;
}

/**
 * Convert Notion page to Supabase prompt data
 */
function convertToSupabasePrompt(page: any): any {
  const props = page.properties || {};
  
  const name = extractText(props.Name?.title || props.Name);
  const slug = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const detailedPrompt = extractText(props.Detailed_Prompt?.rich_text);
  const category = extractMultiSelect(props.Category?.multi_select)?.[0] || 'general';
  const complexityLevel = extractSelect(props.Complexity_Level?.select || props.Level?.select)?.toLowerCase() || 'intermediate';
  const isActive = extractCheckbox(props.Is_Active?.checkbox);
  const suite = extractSelect(props.Suite?.select) || '';
  const subSuite = extractSelect(props.Sub_Suite?.select) || '';
  const version = extractText(props.Version?.rich_text) || '1.0.0';
  
  // Build metadata JSON
  const metadata = {
    notion_id: page.id,
    suite,
    sub_suite: subSuite,
    focus_areas: extractMultiSelect(props['Focus_Areas']?.multi_select || props['Focus Area 1']?.multi_select),
    business_functions: extractMultiSelect(props.Business_Functions?.multi_select),
    departments: extractMultiSelect(props.Departments?.multi_select),
    business_roles: extractMultiSelect(props.Business_Roles?.multi_select),
    prompt_starters: extractMultiSelect(props['Prompt_Starters 1']?.multi_select),
    organizational_roles: props['Organizational Roles']?.relation?.map((r: any) => r.id) || [],
    original_id: extractText(props.Original_ID?.rich_text),
    synced_at: new Date().toISOString(),
  };
  
  return {
    id: generateUUID(),
    name: slug,
    display_name: name,
    description: `${suite} - ${subSuite}`.trim() || name,
    domain: 'medical_affairs', // Default domain
    system_prompt: detailedPrompt,
    user_prompt_template: detailedPrompt,
    category,
    complexity_level: complexityLevel,
    status: isActive ? 'active' : 'inactive',
    version,
    metadata: JSON.stringify(metadata),
    created_at: page.created_time || new Date().toISOString(),
    updated_at: page.last_edited_time || new Date().toISOString(),
  };
}

/**
 * Generate SQL migration file
 */
function generateMigration(prompts: any[]): string {
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
  const migrationName = `008_notion_prompts_migration_${timestamp}`;
  
  let sql = `-- Migration: Import Prompts from Notion Database
-- Generated: ${new Date().toISOString()}
-- Source: Notion Prompts Database (282345b0-299e-8165-833e-000bf89bbd84)
-- Total prompts: ${prompts.length}

BEGIN;

-- Insert prompts
INSERT INTO prompts (
  id,
  name,
  display_name,
  description,
  domain,
  system_prompt,
  user_prompt_template,
  category,
  complexity_level,
  status,
  version,
  metadata,
  created_at,
  updated_at
) VALUES
`;

  const values = prompts.map((p, index) => {
    const comma = index < prompts.length - 1 ? ',' : ';';
    return `  (
    '${p.id}',
    '${escapeSql(p.name)}',
    '${escapeSql(p.display_name)}',
    '${escapeSql(p.description)}',
    '${escapeSql(p.domain)}',
    '${escapeSql(p.system_prompt)}',
    '${escapeSql(p.user_prompt_template)}',
    '${escapeSql(p.category)}',
    '${escapeSql(p.complexity_level)}',
    '${escapeSql(p.status)}',
    '${escapeSql(p.version)}',
    '${escapeSql(p.metadata)}'::jsonb,
    '${p.created_at}',
    '${p.updated_at}'
  )${comma}`;
  }).join('\n');

  sql += values;
  sql += '\n\nCOMMIT;';
  
  return { name: migrationName, content: sql };
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Generating Notion to Supabase Migration\n');
    
    // Verify access
    try {
      await notion.databases.retrieve({ database_id: DATABASE_ID });
      console.log('✅ Database accessible\n');
    } catch (error: any) {
      console.error('❌ Cannot access database. Make sure it\'s shared with your integration.\n');
      console.error('Run: pnpm test:notion to verify connection\n');
      throw error;
    }
    
    // Fetch all pages
    const pages = await fetchAllPages();
    
    if (pages.length === 0) {
      console.log('⚠️  No pages found in database');
      return;
    }
    
    // Convert to Supabase format
    console.log('🔄 Converting to Supabase format...');
    const prompts = pages.map(convertToSupabasePrompt);
    console.log(`✅ Converted ${prompts.length} prompts\n`);
    
    // Generate migration
    console.log('📝 Generating SQL migration...');
    const migration = generateMigration(prompts);
    
    // Save migration file
    const migrationPath = path.join(
      projectRoot,
      'apps/digital-health-startup/database/migrations',
      `${migration.name}.sql`
    );
    
    writeFileSync(migrationPath, migration.content);
    console.log(`✅ Migration file created: ${migrationPath}\n`);
    
    console.log('📊 Summary:');
    console.log(`   Prompts: ${prompts.length}`);
    console.log(`   Active: ${prompts.filter(p => p.status === 'active').length}`);
    console.log(`   Inactive: ${prompts.filter(p => p.status === 'inactive').length}\n`);
    
    console.log('🎯 Next steps:');
    console.log(`   1. Review the migration file: ${migrationPath}`);
    console.log(`   2. Run the migration: pnpm migrate`);
    console.log(`   3. Or apply manually in Supabase SQL editor\n`);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

