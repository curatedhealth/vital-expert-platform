/**
 * Test Notion API connection and database access
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment
const projectRoot = path.resolve(process.cwd(), '../..');
const envPath = path.join(projectRoot, '.env.local');

// Load with override to ensure we get the latest
dotenv.config({ path: envPath, override: true });
// Also allow env var override
dotenv.config({ override: true });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
console.log(`📁 Loading .env.local from: ${envPath}`);
// Database ID from URL: 282345b0299e8034bb48c2f26d5faac6
const DATABASE_ID = '282345b0-299e-8034-bb48-c2f26d5faac6';

async function testConnection() {
  console.log('🧪 Testing Notion API Connection\n');
  
  if (!NOTION_TOKEN) {
    console.error('❌ NOTION_TOKEN not found in .env.local');
    console.log('\nAdd it to .env.local:');
    console.log('NOTION_TOKEN=your_token_here\n');
    return;
  }
  
  console.log(`✅ Token found: ${NOTION_TOKEN.substring(0, 20)}...`);
  console.log(`📊 Database ID: ${DATABASE_ID}\n`);
  
  const notion = new Client({ auth: NOTION_TOKEN });
  
  // Test 1: Check token is valid
  console.log('Test 1: Validating token...');
  try {
    const user = await notion.users.me();
    console.log(`   ✅ Token valid! Integration: ${user.name || 'Unknown'}`);
    console.log(`   👤 Bot ID: ${user.id}\n`);
  } catch (error: any) {
    console.error(`   ❌ Token invalid: ${error.message}\n`);
    return;
  }
  
  // Test 2: Search for pages (to find accessible content)
  console.log('Test 2: Searching for accessible pages...');
  try {
    const search = await notion.search({
      filter: {
        value: 'page',
        property: 'object',
      },
      page_size: 5,
    });
    console.log(`   ✅ Found ${search.results.length} accessible pages`);
    if (search.results.length > 0) {
      search.results.slice(0, 3).forEach((page: any) => {
        const title = page.properties?.Name?.title?.[0]?.text?.content || 
                     page.properties?.title?.title?.[0]?.text?.content || 
                     'Untitled';
        const parent = page.parent;
        console.log(`   📄 ${title}`);
        if (parent?.type === 'database_id') {
          console.log(`      (in database: ${parent.database_id})`);
        }
      });
    }
    console.log('');
  } catch (error: any) {
    console.error(`   ❌ Search failed: ${error.message}\n`);
  }
  
  // Test 3: Try to access the specific database
  console.log('Test 3: Accessing Prompts database...');
  try {
    const db = await notion.databases.retrieve({ database_id: DATABASE_ID });
    const title = db.title?.[0]?.plain_text || 'Untitled';
    console.log(`   ✅ Database accessible!`);
    console.log(`   📊 Name: ${title}`);
    console.log(`   🆔 ID: ${db.id}\n`);
    
    // Test 4: Try to query pages (if we can get pages)
    console.log('Test 4: Checking for pages...');
    try {
      // Try search to find pages in this database
      const search = await notion.search({
        filter: {
          value: 'page',
          property: 'object',
        },
        page_size: 10,
      });
      
      const pagesInDb = search.results.filter((p: any) => 
        p.parent?.type === 'database_id' && 
        p.parent.database_id?.replace(/-/g, '') === DATABASE_ID.replace(/-/g, '')
      );
      
      console.log(`   ✅ Found ${pagesInDb.length} pages in database\n`);
    } catch (error: any) {
      console.log(`   ⚠️  Could not query pages: ${error.message}\n`);
    }
    
  } catch (error: any) {
    console.error(`   ❌ Database NOT accessible!\n`);
    console.error(`   Error: ${error.message}\n`);
    console.error('🔧 Action Required:\n');
    console.error('1. Go to: https://www.notion.so/282345b0299e8034bb48c2f26d5faac6');
    console.error('2. Click the "..." menu (top right)');
    console.error('3. Click "Add connections"');
    console.error('4. Search for your integration (name might be from https://www.notion.so/my-integrations)');
    console.error('5. Click on the integration to connect it');
    console.error('6. Run this test again\n');
    return;
  }
  
  console.log('✅ All tests passed! You can run the sync script now.\n');
  console.log('Run: pnpm sync:notion\n');
}

testConnection().catch(console.error);

