/**
 * Sync Notion Prompts Database to Supabase prompts table
 * 
 * This script connects to your Notion Prompts database and syncs the data
 * to your Supabase prompts table.
 * 
 * Field Mapping:
 * - Notion "Name" → Supabase "name" and "display_name"
 * - Notion "Detailed_Prompt" → Supabase "system_prompt" 
 * - Notion "Category" → Supabase "category"
 * - Notion "Complexity_Level" → Supabase "complexity_level"
 * - Notion "Is_Active" → Supabase "status" (if true: 'active', false: 'inactive')
 * - Notion "Suite" → stored in metadata JSON
 * - Notion "Sub_Suite" → stored in metadata JSON
 * - Notion "Focus Areas", "Business Functions", etc. → stored in metadata JSON
 */

import { Client } from '@notionhq/client';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get project root directory - go up from scripts/ to apps/ to root
// When script runs: process.cwd() = apps/digital-health-startup
// Need to get to root, so go up two levels
const projectRoot = path.resolve(process.cwd(), '../..');

// Load environment variables from project root .env.local
const envPath = path.join(projectRoot, '.env.local');
dotenv.config({ path: envPath });

// Also try loading from current directory as fallback
dotenv.config();

// Initialize Notion Client
let notion: Client;
try {
  notion = new Client({
    auth: process.env.NOTION_TOKEN!,
  });
} catch (error) {
  console.error('❌ Failed to initialize Notion client:', error);
  throw error;
}

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Notion Database ID
const NOTION_DATABASE_ID = '282345b0-299e-8165-833e-000bf89bbd84';

interface NotionPrompt {
  id: string;
  name: string;
  detailed_prompt: string;
  category: string[];
  complexity_level: string;
  is_active: boolean;
  suite: string;
  sub_suite: string;
  focus_areas: string[];
  business_functions: string[];
  departments: string[];
  business_roles: string[];
  prompt_starters: string[];
  version: string;
  organizational_roles: string[];
  original_id: string;
  // ... other fields
}

/**
 * Fetch all prompts from Notion database
 */
async function fetchNotionPrompts(): Promise<NotionPrompt[]> {
  console.log('📥 Fetching prompts from Notion...');
  console.log(`   Database ID: ${NOTION_DATABASE_ID}`);
  
  // First, verify we can access the database
  try {
    const dbInfo = await notion.databases.retrieve({ database_id: NOTION_DATABASE_ID });
    console.log(`   ✅ Database accessible: ${dbInfo.title?.[0]?.plain_text || 'Untitled'}`);
  } catch (error: any) {
    if (error.code === 'object_not_found') {
      console.error('\n❌ Database not found or not shared with integration!');
      console.error('\n📝 To fix this:');
      console.error('1. Open the database: https://www.notion.so/282345b0299e8034bb48c2f26d5faac6');
      console.error('2. Click "..." → "Add connections"');
      console.error('3. Select your Notion integration');
      console.error('4. Confirm the connection\n');
    }
    throw error;
  }
  
  // Use search API to find all pages, then filter for our database
  let allResults: any[] = [];
  let hasMore = true;
  let nextCursor: string | undefined = undefined;
  
  console.log(`   Searching for pages in database...`);
  
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
    
    const searchResponse = await notion.search(searchParams);
    
    // Filter for pages that belong to our database
    const databasePages = searchResponse.results.filter(
      (page: any) => {
        const parent = page.parent;
        return parent?.type === 'database_id' && 
               parent.database_id?.replace(/-/g, '') === NOTION_DATABASE_ID.replace(/-/g, '');
      }
    );
    
    allResults = allResults.concat(databasePages);
    
    hasMore = searchResponse.has_more;
    nextCursor = searchResponse.next_cursor || undefined;
    
    if (hasMore && databasePages.length > 0) {
      console.log(`   Found ${allResults.length} pages so far, continuing...`);
    } else if (!hasMore) {
      console.log(`   Search complete. Total pages found: ${allResults.length}`);
    }
  }
  
  if (allResults.length === 0) {
    console.warn('   ⚠️  No pages found in database. The database might be empty.');
    console.warn('   Make sure the database has entries and is shared with your integration.');
  }
  
  const response = { results: allResults };

  const prompts: NotionPrompt[] = [];

  for (const page of response.results) {
    const properties = page.properties as any;
    
    const prompt: NotionPrompt = {
      id: page.id,
      name: properties.Name?.title?.[0]?.text?.content || 'Untitled',
      detailed_prompt: properties.Detailed_Prompt?.rich_text?.[0]?.text?.content || '',
      category: properties.Category?.multi_select?.map((c: any) => c.name) || [],
      complexity_level: properties.Complexity_Level?.select?.name || 'Intermediate',
      is_active: properties.Is_Active?.checkbox || false,
      suite: properties.Suite?.select?.name || '',
      sub_suite: properties.Sub_Suite?.select?.name || '',
      focus_areas: properties.Focus_Areas?.multi_select?.map((f: any) => f.name) || [],
      business_functions: properties.Business_Functions?.multi_select?.map((b: any) => b.name) || [],
      departments: properties.Departments?.multi_select?.map((d: any) => d.name) || [],
      business_roles: properties.Business_Roles?.multi_select?.map((r: any) => r.name) || [],
      prompt_starters: properties['Prompt_Starters 1']?.multi_select?.map((p: any) => p.name) || [],
      version: properties.Version?.rich_text?.[0]?.text?.content || '1.0.0',
      organizational_roles: properties['Organizational Roles']?.relation || [],
      original_id: properties.Original_ID?.rich_text?.[0]?.text?.content || '',
    };

    prompts.push(prompt);
  }

  console.log(`✅ Fetched ${prompts.length} prompts from Notion`);
  return prompts;
}

/**
 * Map Notion prompt to Supabase format
 */
function mapNotionToSupabase(notionPrompt: NotionPrompt) {
  return {
    name: notionPrompt.name.toLowerCase().replace(/\s+/g, '_'),
    display_name: notionPrompt.name,
    description: `${notionPrompt.suite} - ${notionPrompt.sub_suite}`,
    domain: 'medical_affairs', // Default domain, you can enhance this
    system_prompt: notionPrompt.detailed_prompt,
    user_prompt_template: notionPrompt.detailed_prompt,
    category: notionPrompt.category[0] || 'general',
    complexity_level: notionPrompt.complexity_level.toLowerCase(),
    status: notionPrompt.is_active ? 'active' : 'inactive',
    version: notionPrompt.version,
    
    // Store additional metadata
    metadata: {
      notion_id: notionPrompt.id,
      suite: notionPrompt.suite,
      sub_suite: notionPrompt.sub_suite,
      focus_areas: notionPrompt.focus_areas,
      business_functions: notionPrompt.business_functions,
      departments: notionPrompt.departments,
      business_roles: notionPrompt.business_roles,
      prompt_starters: notionPrompt.prompt_starters,
      organizational_roles: notionPrompt.organizational_roles,
      original_id: notionPrompt.original_id,
      synced_at: new Date().toISOString(),
    },
  };
}

/**
 * Sync prompts to Supabase
 */
async function syncToSupabase(prompts: NotionPrompt[]) {
  console.log('\n📤 Syncing to Supabase...');

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const notionPrompt of prompts) {
    try {
      const supabaseData = mapNotionToSupabase(notionPrompt);
      
      // Check if prompt already exists by notion_id in metadata
      const { data: existing } = await supabase
        .from('prompts')
        .select('id')
        .eq('metadata->>notion_id', notionPrompt.id)
        .single();

      if (existing) {
        // Update existing prompt
        const { error } = await supabase
          .from('prompts')
          .update({
            ...supabaseData,
            metadata: supabaseData.metadata,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) {
          console.error(`❌ Error updating prompt "${notionPrompt.name}":`, error.message);
          errors++;
        } else {
          updated++;
          console.log(`🔄 Updated: ${notionPrompt.name}`);
        }
      } else {
        // Create new prompt
        const { error } = await supabase
          .from('prompts')
          .insert({
            ...supabaseData,
            metadata: supabaseData.metadata,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error(`❌ Error creating prompt "${notionPrompt.name}":`, error.message);
          errors++;
        } else {
          created++;
          console.log(`✨ Created: ${notionPrompt.name}`);
        }
      }
    } catch (error: any) {
      console.error(`❌ Error processing "${notionPrompt.name}":`, error.message);
      errors++;
    }
  }

  console.log('\n📊 Sync Summary:');
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
}

/**
 * Main sync function
 */
async function main() {
  try {
    console.log('🚀 Starting Notion to Supabase sync...\n');

    // Validate environment variables
    if (!process.env.NOTION_TOKEN) {
      console.error('❌ Missing NOTION_TOKEN in .env.local');
      console.log('\n📝 To fix this:');
      console.log('1. Get your Notion integration token from https://www.notion.so/my-integrations');
      console.log('2. Add it to .env.local: NOTION_TOKEN=secret_xxxxxxxxx');
      throw new Error('NOTION_TOKEN is not set in environment variables');
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set in environment variables');
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
    }

    console.log('✅ Environment variables validated\n');

    // Fetch from Notion
    const notionPrompts = await fetchNotionPrompts();

    if (notionPrompts.length === 0) {
      console.log('⚠️  No prompts found in Notion database');
      return;
    }

    // Sync to Supabase
    await syncToSupabase(notionPrompts);

    console.log('\n✅ Sync completed successfully!');
  } catch (error: any) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

// Run the sync
main();

