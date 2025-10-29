/**
 * Test CSV parsing to understand structure
 */

import fs from 'fs';
import csv from 'csv-parser';

const csvFilePath = '/Users/hichamnaim/Downloads/Private & Shared 23/Prompts 282345b0299e8034bb48c2f26d5faac6_all.csv';

let rowNum = 0;

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row: any) => {
    rowNum++;
    if (rowNum <= 3) {
      console.log(`\nRow ${rowNum}:`);
      console.log('Keys:', Object.keys(row));
      console.log('Name:', row.Name);
      console.log('Detailed_Prompt length:', (row.Detailed_Prompt || '').length);
      console.log('First 200 chars of Detailed_Prompt:', (row.Detailed_Prompt || '').substring(0, 200));
    }
    if (rowNum >= 3) {
      process.exit(0);
    }
  })
  .on('end', () => {
    console.log(`\nTotal rows: ${rowNum}`);
    process.exit(0);
  })
  .on('error', (err) => {
    console.error('Error:', err);
    process.exit(1);
  });

