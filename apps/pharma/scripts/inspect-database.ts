/**
 * Inspect the Notion database structure and entries
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import path from 'path';

const projectRoot = path.resolve(process.cwd(), '../..');
dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true });

const notion = new Client({ auth: process.env.NOTION_TOKEN! });
const DATABASE_ID = '282345b0-299e-8034-bb48-c2f26d5faac6';

async function inspectDatabase() {
  console.log('🔍 Inspecting Prompts Database\n');
  
  try {
    // Get database info
    const db = await notion.databases.retrieve({ database_id: DATABASE_ID });
    
    console.log('📊 Database Information:');
    console.log(`   Name: ${db.title?.[0]?.plain_text || 'Untitled'}`);
    console.log(`   ID: ${db.id}`);
    console.log(`   Created: ${db.created_time}`);
    console.log(`   Last Edited: ${db.last_edited_time}\n`);
    
    console.log('📋 Properties (Schema):');
    const props = db.properties || {};
    Object.entries(props).forEach(([key, prop]: [string, any]) => {
      console.log(`   - ${key}: ${prop.type}`);
      if (prop.type === 'select' && prop.select?.options) {
        console.log(`     Options: ${prop.select.options.length}`);
      }
      if (prop.type === 'multi_select' && prop.multi_select?.options) {
        console.log(`     Options: ${prop.multi_select.options.length}`);
      }
    });
    
    console.log('\n🔎 Checking for pages...\n');
    
    // Try to find pages - check if database_id format matches
    const search = await notion.search({
      filter: {
        value: 'page',
        property: 'object',
      },
      page_size: 10,
    });
    
    console.log(`Searched ${search.results.length} pages. Checking parent IDs...\n`);
    
    const dbIdVariants = [
      DATABASE_ID,
      DATABASE_ID.replace(/-/g, ''),
      db.id,
      db.id.replace(/-/g, ''),
    ].map(id => id.toLowerCase());
    
    let found = 0;
    search.results.forEach((page: any) => {
      if (page.parent?.type === 'database_id') {
        const parentId = page.parent.database_id.toLowerCase();
        const parentIdNoDashes = parentId.replace(/-/g, '');
        
        if (dbIdVariants.includes(parentId) || dbIdVariants.includes(parentIdNoDashes)) {
          found++;
          const name = page.properties?.Name?.title?.[0]?.text?.content || 'Untitled';
          console.log(`   ✓ Found: ${name}`);
          console.log(`     Page ID: ${page.id}`);
          console.log(`     Parent DB ID: ${page.parent.database_id}`);
        }
      }
    });
    
    if (found === 0) {
      console.log('   ⚠️  No pages found in search results.');
      console.log(`\n💡 The database might be:`);
      console.log(`   1. Empty (no entries yet)`);
      console.log(`   2. Pages not shared with integration`);
      console.log(`   3. Using a different database ID format`);
      console.log(`\n🔍 Database ID variants checked:`);
      dbIdVariants.forEach(v => console.log(`   - ${v}`));
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

inspectDatabase();

