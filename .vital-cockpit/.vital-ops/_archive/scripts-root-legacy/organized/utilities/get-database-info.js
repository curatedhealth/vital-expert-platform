/**
 * Get detailed information about Notion databases including their workspace/path
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const DATABASES = {
  'Capabilities': 'c5240705aeb741aba5244e07addc9b6c',
  'Agents': 'b81d88a6dfc2491aba0c5639c6885b2c'
};

async function getDatabaseInfo(name, dbId) {
  try {
    const response = await notion.databases.retrieve({
      database_id: dbId
    });

    console.log(`\n📊 ${name} Database:`);
    console.log(`   Database ID: ${dbId}`);
    console.log(`   URL: https://www.notion.so/${dbId.replace(/-/g, '')}`);

    if (response.parent) {
      console.log(`   Parent Type: ${response.parent.type}`);

      if (response.parent.type === 'workspace') {
        console.log(`   Location: 📍 Workspace (top-level)`);
        console.log(`   Workspace: ${response.parent.workspace ? 'true' : 'Workspace root'}`);
      } else if (response.parent.type === 'page_id') {
        console.log(`   Location: 📄 Inside a page`);
        console.log(`   Parent Page ID: ${response.parent.page_id}`);
      }
    }

    console.log(`   Created: ${response.created_time}`);
    console.log(`   Last Edited: ${response.last_edited_time}`);

  } catch (error) {
    console.log(`\n❌ ${name} Database:`);
    console.log(`   Database ID: ${dbId}`);
    console.log(`   Error: ${error.code || error.message}`);

    if (error.code === 'object_not_found') {
      console.log(`   Status: 🔒 No access (integration not connected)`);
      console.log(`   URL: https://www.notion.so/${dbId.replace(/-/g, '')}`);
    }
  }
}

async function checkIntegration() {
  console.log('🔍 Checking VITAL Expert Sync Integration & Database Locations\n');
  console.log('='.repeat(70));

  try {
    const bot = await notion.users.me();
    console.log(`\n✅ Integration: ${bot.name}`);
    console.log(`   Bot ID: ${bot.id}`);
    console.log(`   Type: ${bot.type}`);
  } catch (error) {
    console.log(`\n❌ Integration Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(70));

  for (const [name, dbId] of Object.entries(DATABASES)) {
    await getDatabaseInfo(name, dbId);
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📝 Summary:\n');
  console.log('If databases show 🔒 "No access":');
  console.log('  → Integration "VITAL Expert Sync" needs permission\n');
  console.log('If "Location: Workspace (top-level)":');
  console.log('  → Database is in workspace root');
  console.log('  → Add via: https://www.notion.so/my-integrations');
  console.log('  → Click integration → "Select pages" → Add databases\n');
  console.log('If "Location: Inside a page":');
  console.log('  → Database is nested inside a page');
  console.log('  → Share the PARENT page with the integration');
  console.log('  → Or move database to workspace root\n');
}

checkIntegration();
