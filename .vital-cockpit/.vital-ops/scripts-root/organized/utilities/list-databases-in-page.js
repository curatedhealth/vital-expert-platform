/**
 * List all databases in the VITAL Expert Sync page
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const PAGE_ID = '282345b0299e806e9cdae3b0f02f0fea';

async function listDatabases() {
  console.log('🔍 Searching for databases in VITAL Expert Sync page...\n');

  try {
    // Search for all items (including databases)
    const response = await notion.search({
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time'
      }
    });

    console.log(`Found ${response.results.length} items total\n`);

    // Filter for databases in our page
    const databases = response.results.filter(item =>
      item.object === 'database' &&
      item.parent?.page_id === PAGE_ID.replace(/-/g, '')
    );

    if (databases.length === 0) {
      console.log('❌ No databases found in the VITAL Expert Sync page');
      console.log(`   Page ID: ${PAGE_ID}\n`);

      // Show what was found
      const allDbs = response.results.filter(item => item.object === 'database');
      console.log(`Total databases accessible: ${allDbs.length}`);
      if (allDbs.length > 0) {
        console.log('\nAccessible databases:');
        allDbs.slice(0, 5).forEach(db => {
          console.log(`   - ${db.title?.[0]?.plain_text || 'Untitled'} (parent: ${db.parent?.type})`);
        });
      }
      return;
    }

    console.log(`✅ Found ${databases.length} databases in VITAL Expert Sync:\n`);

    for (const db of databases) {
      const title = db.title?.[0]?.plain_text || 'Untitled';
      console.log(`📊 ${title}`);
      console.log(`   ID: ${db.id}`);
      console.log(`   URL: ${db.url}`);
      console.log(`   Created: ${new Date(db.created_time).toLocaleString()}\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listDatabases();
