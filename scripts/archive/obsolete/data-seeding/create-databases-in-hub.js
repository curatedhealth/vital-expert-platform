/**
 * Create all 12 VITAL Path databases inside Vital Expert Hub
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const HUB_PAGE_ID = '277345b0299e80ceb179eec50f02a23f';

// Database schemas
const databases = [
  {
    name: 'VITAL Path - Capabilities Registry',
    envKey: 'NOTION_CAPABILITIES_DB_ID',
    properties: {
      'Name': { title: {} },
      'Display Name': { rich_text: {} },
      'Description': { rich_text: {} },
      'Category': { select: { options: [
        { name: 'Clinical', color: 'blue' },
        { name: 'Regulatory', color: 'green' },
        { name: 'Analytics', color: 'purple' }
      ]}},
      'Priority': { select: { options: [
        { name: 'Critical', color: 'red' },
        { name: 'High', color: 'orange' },
        { name: 'Medium', color: 'yellow' },
        { name: 'Low', color: 'gray' }
      ]}},
      'Is New': { checkbox: {} }
    }
  },
  {
    name: 'VITAL Path - Agents Registry',
    envKey: 'NOTION_AGENTS_DB_ID',
    properties: {
      'Name': { title: {} },
      'Display Name': { rich_text: {} },
      'Description': { rich_text: {} },
      'Status': { select: { options: [
        { name: 'Active', color: 'green' },
        { name: 'Inactive', color: 'gray' },
        { name: 'Development', color: 'yellow' },
        { name: 'Testing', color: 'orange' }
      ]}},
      'Tier': { select: { options: [
        { name: 'Core', color: 'purple' },
        { name: 'Tier 1', color: 'blue' },
        { name: 'Tier 2', color: 'green' },
        { name: 'Tier 3', color: 'orange' }
      ]}},
      'Model': { select: { options: [
        { name: 'gpt-4', color: 'blue' },
        { name: 'claude-3-opus', color: 'purple' }
      ]}}
    }
  }
];

async function createDatabase(dbConfig) {
  try {
    console.log(`\nCreating: ${dbConfig.name}...`);

    const response = await notion.databases.create({
      parent: {
        type: 'page_id',
        page_id: HUB_PAGE_ID
      },
      title: [{ text: { content: dbConfig.name } }],
      properties: dbConfig.properties
    });

    console.log(`✅ Created: ${dbConfig.name}`);
    console.log(`   ID: ${response.id}`);
    console.log(`   ${dbConfig.envKey}=${response.id}`);

    return { key: dbConfig.envKey, id: response.id };

  } catch (error) {
    console.log(`❌ Failed: ${dbConfig.name}`);
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

async function createAllDatabases() {
  console.log('🚀 Creating Databases in Vital Expert Hub');
  console.log(`Parent Page: ${HUB_PAGE_ID}\n`);
  console.log('='.repeat(70));

  const created = [];

  for (const db of databases) {
    const result = await createDatabase(db);
    if (result) {
      created.push(result);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n✅ Summary:\n');
  console.log(`Created ${created.length} databases\n`);

  if (created.length > 0) {
    console.log('📝 Add these to .env.local:\n');
    for (const { key, id } of created) {
      console.log(`${key}=${id}`);
    }
  }
}

createAllDatabases();
