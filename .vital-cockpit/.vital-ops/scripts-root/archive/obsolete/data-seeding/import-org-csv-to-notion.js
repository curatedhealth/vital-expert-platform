import { Client } from '@notionhq/client';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const DB_IDS = {
  functions: process.env.NOTION_ORG_FUNCTIONS_DB_ID,
  departments: process.env.NOTION_ORG_DEPARTMENTS_DB_ID,
  roles: process.env.NOTION_ORG_ROLES_DB_ID,
  responsibilities: process.env.NOTION_ORG_RESPONSIBILITIES_DB_ID
};

async function importCSV(filePath, dbId, mapper) {
  const records = [];
  
  return new Promise((resolve, reject) => {
    createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row) => records.push(row))
      .on('end', async () => {
        console.log(`📥 Found ${records.length} records in ${filePath.split('/').pop()}`);
        
        let success = 0, failed = 0;
        
        for (const row of records) {
          try {
            const properties = mapper(row);
            await notion.pages.create({
              parent: { database_id: dbId },
              properties
            });
            success++;
            process.stdout.write(`\r✅ Synced: ${success}/${records.length}`);
          } catch (error) {
            failed++;
            console.log(`\n❌ Failed: ${row.Unique_ID || row.Name}: ${error.message}`);
          }
        }
        
        console.log(`\n✅ Complete: ${success} success, ${failed} failed\n`);
        resolve({ success, failed });
      })
      .on('error', reject);
  });
}

// Mappers
const mappers = {
  functions: (row) => ({
    'Name': { title: [{ text: { content: row.Department_Name || 'Untitled' } }] },
    'Description': { rich_text: [{ text: { content: (row.Description || '').substring(0, 2000) } }] },
    'Function Code': { rich_text: [{ text: { content: row.Unique_ID || '' } }] },
    'Is Active': { checkbox: row.Migration_Ready !== 'No' }
  }),
  
  departments: (row) => ({
    'Name': { title: [{ text: { content: row.Department_Name || 'Untitled' } }] },
    'Description': { rich_text: [{ text: { content: (row.Description || '').substring(0, 2000) } }] },
    'Department Code': { rich_text: [{ text: { content: row.Department_ID || row.Unique_ID || '' } }] },
    'Is Active': { checkbox: row.Migration_Ready !== 'No' }
  }),
  
  roles: (row) => ({
    'Name': { title: [{ text: { content: row.Name || 'Untitled' } }] },
    'Description': { rich_text: [{ text: { content: (row.Description || '').substring(0, 2000) } }] },
    'Role Code': { rich_text: [{ text: { content: row.Unique_ID || '' } }] },
    'Level': { select: { name: 'Mid' } },  // Default, can be updated later
    'Is Active': { checkbox: true }
  }),
  
  responsibilities: (row) => ({
    'Name': { title: [{ text: { content: row.Name || 'Untitled' } }] },
    'Description': { rich_text: [{ text: { content: (row.Description || '').substring(0, 2000) } }] },
    'Priority': { select: { name: 'Medium' } },  // Default
    'Is Active': { checkbox: true }
  })
};

async function main() {
  const type = process.argv[2];
  
  if (!type || !['functions', 'departments', 'roles', 'responsibilities'].includes(type)) {
    console.log('Usage: node import-org-csv-to-notion.js <type>');
    console.log('Types: functions, departments, roles, responsibilities');
    process.exit(1);
  }
  
  const files = {
    functions: 'Functions 2753dedf985680178336f15f9342a9a7_all.csv',
    departments: 'Departments 53028d9eb38d4371a2cdf97cc8ec9abe_all.csv',
    roles: 'Roles 2753dedf98568072b94cf2f7028ba0c9_all.csv',
    responsibilities: 'Responsibilities 2753dedf985680ae9c33d5dea3d5a0cf_all.csv'
  };
  
  console.log(`\n🔄 Importing ${type}...\n`);
  
  await importCSV(files[type], DB_IDS[type], mappers[type]);
}

main();
