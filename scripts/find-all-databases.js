/**
 * Find all accessible databases created recently
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function findDatabases() {
  console.log('🔍 Searching for all accessible databases...\n');

  try {
    const response = await notion.search({
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time'
      },
      page_size: 100
    });

    const databases = response.results.filter(item => item.object === 'database');

    console.log(`✅ Found ${databases.length} total databases\n`);

    // Group by parent
    const byParent = {};
    databases.forEach(db => {
      const parentKey = db.parent?.page_id || db.parent?.workspace || 'other';
      if (!byParent[parentKey]) byParent[parentKey] = [];
      byParent[parentKey].push(db);
    });

    for (const [parentId, dbs] of Object.entries(byParent)) {
      console.log(`\n📁 Parent: ${parentId}`);
      console.log(`   Databases: ${dbs.length}\n`);

      dbs.slice(0, 15).forEach(db => {
        const title = db.title?.[0]?.plain_text || 'Untitled';
        const created = new Date(db.created_time).toLocaleString();
        console.log(`   📊 ${title}`);
        console.log(`      ID: ${db.id}`);
        console.log(`      Created: ${created}`);
        console.log(`      URL: ${db.url}\n`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findDatabases();
