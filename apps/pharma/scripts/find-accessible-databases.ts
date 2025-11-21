/**
 * Find all accessible Notion databases and their IDs
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import path from 'path';

const projectRoot = path.resolve(process.cwd(), '../..');
dotenv.config({ path: path.join(projectRoot, '.env.local') });

const notion = new Client({ auth: process.env.NOTION_TOKEN! });

async function findDatabases() {
  console.log('🔍 Searching for accessible Notion databases...\n');
  
  try {
    const response = await notion.search({
      filter: {
        value: 'page',
        property: 'object',
      },
      page_size: 100,
    });
    
    // Look for database parent pages
    const databases = new Map<string, any>();
    
    for (const page of response.results) {
      if (page.parent?.type === 'database_id') {
        const dbId = page.parent.database_id;
        if (!databases.has(dbId)) {
          try {
            const db = await notion.databases.retrieve({ database_id: dbId });
            const title = extractText(db.title);
            databases.set(dbId, { id: dbId, title, url: `https://www.notion.so/${dbId.replace(/-/g, '')}` });
          } catch (e) {
            // Database not accessible
          }
        }
      }
    }
    
    if (databases.size === 0) {
      console.log('❌ No accessible databases found');
      console.log('\nMake sure you have:');
      console.log('1. Created a Notion integration at https://www.notion.so/my-integrations');
      console.log('2. Shared at least one database with the integration');
      console.log('3. Added the token to .env.local as NOTION_TOKEN\n');
      return;
    }
    
    console.log(`✅ Found ${databases.size} accessible databases:\n`);
    
    for (const [id, db] of databases) {
      console.log(`📊 ${db.title}`);
      console.log(`   ID: ${id}`);
      console.log(`   URL: ${db.url}\n`);
      
      // Check if this is our prompts database
      if (id.replace(/-/g, '') === '282345b0299e8165833e000bf89bbd84') {
        console.log('   ⭐ This matches the Prompts database!\n');
      }
    }
    
    // Also try to search for "Prompts" database specifically
    console.log('\n🔍 Searching for "Prompts" database by name...\n');
    
    const allResults = response.results.filter((p: any) => {
      const title = extractText(p.properties?.Name?.title || []);
      return title.toLowerCase().includes('prompt');
    });
    
    console.log(`Found ${allResults.length} pages with "prompt" in the name`);
    if (allResults.length > 0) {
      console.log('\nSample pages:');
      allResults.slice(0, 5).forEach((page: any) => {
        const title = extractText(page.properties?.Name?.title || []);
        const parent = page.parent;
        console.log(`   - ${title}`);
        if (parent?.type === 'database_id') {
          console.log(`     Database ID: ${parent.database_id}`);
        }
      });
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

function extractText(richText: any): string {
  if (!richText) return '';
  if (Array.isArray(richText)) {
    return richText.map((rt: any) => rt?.text?.content || rt?.plain_text || '').join('');
  }
  return richText?.text?.content || richText?.plain_text || '';
}

findDatabases();

