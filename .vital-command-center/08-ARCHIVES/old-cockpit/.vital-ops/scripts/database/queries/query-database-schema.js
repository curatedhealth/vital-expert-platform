/**
 * Query database to see its actual schema
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_ID = '65d01208452c4caa8df456bfe27098fe';

async function querySchema() {
  console.log(`🔍 Testing RAG Documents database schema...\n`);

  try {
    // Try adding a minimal test page to discover properties
    const testPage = await notion.pages.create({
      parent: { database_id: DB_ID },
      properties: {
        'Name': {
          title: [{ text: { content: 'Test Document' } }]
        }
      }
    });

    console.log('✅ Test page created successfully!\n');
    console.log('Properties in database:\n');

    for (const [name, prop] of Object.entries(testPage.properties)) {
      console.log(`   - ${name} (${prop.type})`);
    }

    console.log(`\n📊 Database ID: ${DB_ID}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nThis tells us which properties the database actually has.');
  }
}

querySchema();
