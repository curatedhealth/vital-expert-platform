/**
 * List all content in the Master Database Hub page
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Master Database Hub page ID from URL
const MASTER_HUB_PAGE_ID = '2753dedf9856801d8217d2db804de0af';

async function listPageContents() {
  console.log('🔍 Checking Master Database Hub Contents\n');
  console.log('Page: VITAL Path - Master Database Hub');
  console.log(`ID: ${MASTER_HUB_PAGE_ID}\n`);
  console.log('='.repeat(70));

  try {
    // Get the page
    const page = await notion.pages.retrieve({ page_id: MASTER_HUB_PAGE_ID });

    console.log('\n✅ Page Found!');
    console.log(`Title: ${page.properties?.title?.title?.[0]?.plain_text || 'N/A'}`);
    console.log(`Created: ${page.created_time}`);
    console.log(`Last Edited: ${page.last_edited_time}`);

    // Get child blocks/databases
    console.log('\n📋 Contents:');
    const { results } = await notion.blocks.children.list({
      block_id: MASTER_HUB_PAGE_ID
    });

    if (results.length === 0) {
      console.log('   (Empty - no databases or content found)');
    } else {
      results.forEach((block, index) => {
        console.log(`\n   ${index + 1}. Type: ${block.type}`);
        if (block.type === 'child_database') {
          console.log(`      Database ID: ${block.id}`);
          console.log(`      Title: ${block.child_database?.title || 'Untitled'}`);
        } else if (block.type === 'child_page') {
          console.log(`      Page ID: ${block.id}`);
        }
      });
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n💡 Next Steps:\n');
    console.log('If no databases found, we need to create them inside this page.');
    console.log('Parent page ID to use: ' + MASTER_HUB_PAGE_ID);

  } catch (error) {
    console.log('\n❌ Error accessing page:');
    console.log(`   ${error.code}: ${error.message}`);

    if (error.code === 'object_not_found') {
      console.log('\n🔒 The integration cannot access this page.');
      console.log('\n📝 To fix:');
      console.log('   1. Open: https://www.notion.so/curatedhealth/VITAL-Path-Master-Database-Hub-2753dedf9856801d8217d2db804de0af');
      console.log('   2. Click "Share" button');
      console.log('   3. Add "VITAL Expert Sync" integration');
      console.log('   4. Run this script again');
    }
  }
}

listPageContents();
