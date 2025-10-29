/**
 * Fetch prompts directly using Notion API - alternative approach
 * This tries multiple methods to access the database
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import path from 'path';
import { writeFileSync } from 'fs';
import https from 'https';

const projectRoot = path.resolve(process.cwd(), '../..');
dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true });

const NOTION_TOKEN = process.env.NOTION_TOKEN!;
const notion = new Client({ auth: NOTION_TOKEN });
// Database ID from URL: 282345b0299e8034bb48c2f26d5faac6
// Formatted as UUID: 8-4-4-4-12
const DATABASE_ID = '282345b0-299e-8034-bb48-c2f26d5faac6';

/**
 * Extract text from Notion properties
 */
function extractText(richText: any): string {
  if (!richText) return '';
  if (Array.isArray(richText)) {
    return richText.map((rt: any) => rt?.text?.content || rt?.plain_text || '').join('').trim();
  }
  return richText?.text?.content || richText?.plain_text || '';
}

function extractMultiSelect(select: any): string[] {
  if (!select) return [];
  if (Array.isArray(select)) return select.map((s: any) => s?.name || s).filter(Boolean);
  if (select.multi_select) return select.multi_select.map((s: any) => s.name);
  return [];
}

function extractSelect(select: any): string {
  if (!select) return '';
  if (select.select) return select.select.name || '';
  if (select.name) return select.name;
  if (typeof select === 'string') return select;
  return '';
}

function extractCheckbox(checkbox: any): boolean {
  if (typeof checkbox === 'boolean') return checkbox;
  if (checkbox?.checkbox !== undefined) return checkbox.checkbox;
  return false;
}

function escapeSql(str: string): string {
  if (!str) return '';
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function queryDatabaseAPI(databaseId: string, startCursor?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      page_size: 100,
      ...(startCursor && { start_cursor: startCursor }),
    });

    const options = {
      hostname: 'api.notion.com',
      port: 443,
      path: `/v1/databases/${databaseId}/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`API Error ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function fetchAllPages() {
  console.log('🔍 Fetching pages from Prompts database...\n');
  
  // First verify database access
  try {
    const db = await notion.databases.retrieve({ database_id: DATABASE_ID });
    console.log(`✅ Database accessible: "${extractText(db.title)}"\n`);
    console.log(`📊 Database has ${Object.keys(db.properties || {}).length} properties\n`);
  } catch (error: any) {
    console.error('❌ Cannot access database:', error.message);
    throw error;
  }
  
  let allPages: any[] = [];
  
  // Use direct API call to query database (client doesn't expose databases.query)
  console.log('Querying database entries via API...');
  let hasMore = true;
  let nextCursor: string | undefined = undefined;
  
  while (hasMore) {
    try {
      const response = await queryDatabaseAPI(DATABASE_ID, nextCursor);
      
      for (const page of response.results || []) {
        allPages.push(page);
        const name = extractText(page.properties?.Name?.title || []);
        console.log(`   ✓ ${allPages.length}. ${name || 'Untitled'}`);
      }
      
      hasMore = response.has_more || false;
      nextCursor = response.next_cursor || undefined;
      
      if (hasMore) {
        console.log(`   ...Found ${allPages.length} entries so far, fetching more...`);
      }
    } catch (error: any) {
      console.error(`\n❌ Error fetching entries: ${error.message}`);
      throw error;
    }
  }
  
  console.log(`\n✅ Total entries found: ${allPages.length}\n`);
  return allPages;
}

async function fetchAllPagesFallback() {
  console.log('Using search fallback method...\n');
  let allPages: any[] = [];
  let hasMore = true;
  let nextCursor: string | undefined = undefined;
  const dbIdNormalized = DATABASE_ID.replace(/-/g, '').toLowerCase();
  let checked = 0;
  
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
    checked += response.results.length;
    
    for (const page of response.results) {
      const parent = page.parent;
      if (parent?.type === 'database_id') {
        const parentId = parent.database_id?.replace(/-/g, '').toLowerCase() || '';
        if (parentId === dbIdNormalized) {
          allPages.push(page);
          const name = extractText(page.properties?.Name?.title || []);
          console.log(`   ✓ ${allPages.length}. ${name || 'Untitled'}`);
        }
      }
    }
    
    hasMore = response.has_more;
    nextCursor = response.next_cursor || undefined;
    
    if (hasMore && checked % 500 === 0) {
      console.log(`   ...Checked ${checked} pages, found ${allPages.length} so far...`);
    }
  }
  
  console.log(`\n✅ Total pages found: ${allPages.length} (checked ${checked} total pages)\n`);
  return allPages;
}

function convertToSupabasePrompt(page: any) {
  const props = page.properties || {};
  
  const name = extractText(props.Name?.title || props.Name);
  const slug = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').substring(0, 50);
  const detailedPrompt = extractText(props.Detailed_Prompt?.rich_text);
  const category = extractMultiSelect(props.Category?.multi_select)?.[0] || 'general';
  const complexityLevel = extractSelect(props.Complexity_Level?.select || props.Level?.select)?.toLowerCase() || 'intermediate';
  const isActive = extractCheckbox(props.Is_Active?.checkbox);
  const suite = extractSelect(props.Suite?.select) || '';
  const subSuite = extractSelect(props.Sub_Suite?.select) || '';
  const version = extractText(props.Version?.rich_text) || '1.0.0';
  
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
    name: slug || 'untitled',
    display_name: name || 'Untitled',
    description: `${suite} - ${subSuite}`.trim() || name || 'No description',
    domain: 'medical_affairs',
    system_prompt: detailedPrompt || '',
    user_prompt_template: detailedPrompt || '',
    category,
    complexity_level: complexityLevel,
    status: isActive ? 'active' : 'inactive',
    version,
    metadata: JSON.stringify(metadata),
    created_at: page.created_time || new Date().toISOString(),
    updated_at: page.last_edited_time || new Date().toISOString(),
  };
}

async function main() {
  try {
    console.log('🚀 Fetching Prompts from Notion\n');
    
    // Test token
    try {
      const user = await notion.users.me();
      console.log(`✅ Connected as: ${user.name}\n`);
    } catch (error: any) {
      console.error('❌ Token invalid:', error.message);
      return;
    }
    
    // Fetch pages
    const pages = await fetchAllPages();
    
    if (pages.length === 0) {
      console.log('⚠️  No pages found.');
      console.log('\nThe database might not be shared with your integration yet.');
      console.log('Share it at: https://www.notion.so/282345b0299e8034bb48c2f26d5faac6');
      return;
    }
    
    // Convert to Supabase format
    console.log('🔄 Converting to Supabase format...');
    const prompts = pages.map(convertToSupabasePrompt);
    
    // Generate SQL
    console.log('📝 Generating SQL migration...\n');
    
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
    const migrationName = `008_notion_prompts_migration_${timestamp}`;
    
    let sql = `-- Migration: Import Prompts from Notion Database
-- Generated: ${new Date().toISOString()}
-- Source: Notion Prompts Database (282345b0-299e-8165-833e-000bf89bbd84)
-- Total prompts: ${prompts.length}

BEGIN;

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

    sql += values + '\n\nCOMMIT;';
    
    // Save file
    const migrationPath = path.join(
      projectRoot,
      'apps/digital-health-startup/database/migrations',
      `${migrationName}.sql`
    );
    
    writeFileSync(migrationPath, sql);
    
    console.log(`✅ Migration file created: ${migrationPath}\n`);
    console.log('📊 Summary:');
    console.log(`   Total prompts: ${prompts.length}`);
    console.log(`   Active: ${prompts.filter(p => p.status === 'active').length}`);
    console.log(`   Inactive: ${prompts.filter(p => p.status === 'inactive').length}\n`);
    console.log('🎯 Next step: Run `pnpm migrate` to apply the migration\n');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

