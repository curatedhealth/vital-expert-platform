/**
 * Create complete Capabilities database with all 23 properties
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const HUB_PAGE_ID = '277345b0299e80ceb179eec50f02a23f';

// Delete old capabilities database if exists
const OLD_CAP_ID = '63a730775cf74861b97aa8e3908d4570';

async function createCapabilitiesDatabase() {
  try {
    console.log('🗑️  Archiving old Capabilities database...\n');

    await notion.pages.update({
      page_id: OLD_CAP_ID,
      archived: true
    });

    console.log('✅ Old database archived\n');
  } catch (e) {
    console.log('⚠️  Could not archive old database (may not exist)\n');
  }

  console.log('🚀 Creating complete Capabilities Registry...\n');

  const response = await notion.databases.create({
    parent: {
      type: 'page_id',
      page_id: HUB_PAGE_ID
    },
    title: [{ text: { content: 'VITAL Path - Capabilities Registry' } }],
    properties: {
      'Name': { title: {} },
      'Display Name': { rich_text: {} },
      'Description': { rich_text: {} },
      'Category': { select: { options: [
        { name: 'Clinical', color: 'blue' },
        { name: 'Regulatory', color: 'green' },
        { name: 'Analytics', color: 'purple' },
        { name: 'Research', color: 'orange' },
        { name: 'Compliance', color: 'red' },
        { name: 'Commercial', color: 'yellow' },
        { name: 'Quality', color: 'pink' },
        { name: 'Safety', color: 'brown' },
        { name: 'Education', color: 'gray' }
      ]}},
      'Domain': { select: { options: [
        { name: 'Healthcare', color: 'blue' },
        { name: 'Medical Devices', color: 'green' },
        { name: 'Technology', color: 'purple' },
        { name: 'General', color: 'gray' }
      ]}},
      'Stage': { select: {} },
      'VITAL Component': { select: { options: [
        { name: 'Innovation', color: 'purple' },
        { name: 'Trust', color: 'blue' },
        { name: 'Evidence', color: 'green' },
        { name: 'Market Access', color: 'orange' },
        { name: 'Lifecycle', color: 'pink' }
      ]}},
      'Priority': { select: { options: [
        { name: 'Critical', color: 'red' },
        { name: 'High', color: 'orange' },
        { name: 'Medium', color: 'yellow' },
        { name: 'Low', color: 'gray' }
      ]}},
      'Maturity': { select: { options: [
        { name: 'Concept', color: 'gray' },
        { name: 'Pilot', color: 'yellow' },
        { name: 'Production Ready', color: 'blue' },
        { name: 'Mature', color: 'green' },
        { name: 'Legacy', color: 'red' }
      ]}},
      'Complexity Level': { select: { options: [
        { name: 'Basic', color: 'green' },
        { name: 'Intermediate', color: 'yellow' },
        { name: 'Advanced', color: 'orange' },
        { name: 'Expert', color: 'red' }
      ]}},
      'Is New': { checkbox: {} },
      'Panel Recommended': { checkbox: {} },
      'Is Premium': { checkbox: {} },
      'Usage Count': { number: { format: 'number' } },
      'Success Rate': { number: { format: 'number' } },
      'Implementation Timeline': { number: { format: 'number' } },
      'Icon': { rich_text: {} },
      'Color': { rich_text: {} },
      'Created Date': { created_time: {} },
      'Last Edited': { last_edited_time: {} }
    }
  });

  console.log('✅ Created: VITAL Path - Capabilities Registry');
  console.log(`   ID: ${response.id}`);
  console.log(`   URL: https://www.notion.so/${response.id.replace(/-/g, '')}\n`);
  console.log('📝 Add to .env.local:');
  console.log(`   NOTION_CAPABILITIES_DB_ID=${response.id.replace(/-/g, '')}\n`);

  return response.id;
}

createCapabilitiesDatabase();
