/**
 * List what databases already exist in Vital Expert Hub
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const HUB_PAGE_ID = '277345b0299e80ceb179eec50f02a23f';

async function listDatabases() {
  console.log('📋 Listing Databases in Vital Expert Hub\n');

  const { results } = await notion.blocks.children.list({ block_id: HUB_PAGE_ID });

  const databases = results.filter(b => b.type === 'child_database');

  console.log(`Found ${databases.length} databases:\n`);

  for (const db of databases) {
    try {
      const dbInfo = await notion.databases.retrieve({ database_id: db.id });
      const title = dbInfo.title?.[0]?.plain_text || 'Untitled';

      console.log(`✅ ${title}`);
      console.log(`   ID: ${db.id}`);
      console.log(`   URL: https://www.notion.so/${db.id.replace(/-/g, '')}\n`);
    } catch (e) {
      console.log(`❌ Database ${db.id}: ${e.message}\n`);
    }
  }

  console.log('\n💡 We can use these existing databases or create new ones.');
}

listDatabases();
