/**
 * Sync Prompts from CSV file to Supabase prompts table
 * 
 * This script parses a CSV file exported from Notion and syncs it to Supabase.
 * 
 * CSV Columns Mapping:
 * - Name → name, display_name
 * - Detailed_Prompt → system_prompt
 * - Category → category
 * - Complexity_Level → complexity_level (normalized)
 * - Is_Active → status (active/inactive)
 * - Version → version
 * - Suite, Sub_Suite, Focus_Areas, etc. → stored in metadata
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import { Transform } from 'stream';

const projectRoot = path.resolve(process.cwd(), '../..');
dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Check if prompts table exists
async function checkTableExists(): Promise<boolean> {
  try {
    const { error } = await supabase.from('prompts').select('id').limit(1);
    return !error || error.code !== '42P01';
  } catch {
    return false;
  }
}

/**
 * Normalize complexity level from CSV to Supabase format
 */
function normalizeComplexityLevel(csvLevel: string | undefined): string {
  if (!csvLevel) return 'intermediate';
  
  const level = csvLevel.toLowerCase().trim();
  
  // Map common variations
  if (level.includes('basic') || level.includes('simple') || level === '1') {
    return 'basic';
  }
  if (level.includes('intermediate') || level === '2') {
    return 'intermediate';
  }
  if (level.includes('advanced') || level === '3') {
    return 'advanced';
  }
  if (level.includes('expert') || level === '4') {
    return 'expert';
  }
  
  return 'intermediate';
}

/**
 * Convert CSV row to Supabase prompt format
 */
function convertToSupabasePrompt(row: any) {
  // Handle BOM in column names (CSV exported with BOM)
  const nameKey = Object.keys(row).find(k => k.toLowerCase().includes('name') && k !== 'display_name') || 'Name';
  const name = (row[nameKey] || row.Name || '').trim();
  if (!name) {
    return null; // Skip rows without names
  }
  
  // Create URL-safe name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 255);
  
  const displayName = name;
  
  // Handle column name variations (with/without BOM, spaces, etc.)
  const getValue = (keys: string[]) => {
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
        return row[key];
      }
    }
    return '';
  };
  
  const detailedPrompt = getValue(['Detailed_Prompt', 'Detailed Prompt']) || '';
  const category = (getValue(['Category']) || 'general').trim();
  const complexityLevel = normalizeComplexityLevel(getValue(['Complexity_Level', 'Complexity Level']));
  const isActiveRaw = getValue(['Is_Active', 'Is Active']);
  const isActive = isActiveRaw === 'true' || isActiveRaw === true || isActiveRaw === 'TRUE' || isActiveRaw === '1';
  const version = (getValue(['Version']) || '1.0.0').trim();
  
  // Collect metadata
  const metadata: any = {};
  const suite = getValue(['Suite']);
  const subSuite = getValue(['Sub_Suite', 'Sub-Suite']);
  if (suite) metadata.suite = suite;
  if (subSuite) metadata.sub_suite = subSuite;
  
  const focusAreas = getValue(['Focus_Areas', 'Focus Areas']);
  if (focusAreas) {
    metadata.focus_areas = Array.isArray(focusAreas) 
      ? focusAreas 
      : String(focusAreas).split(',').map((f: string) => f.trim()).filter(Boolean);
  }
  
  const businessFunctions = getValue(['Business_Functions', 'Business Functions']);
  if (businessFunctions) metadata.business_functions = businessFunctions;
  
  const businessRoles = getValue(['Business_Roles', 'Business Roles']);
  if (businessRoles) metadata.business_roles = businessRoles;
  
  const departments = getValue(['Departments']);
  if (departments) metadata.departments = departments;
  
  const orgRoles = getValue(['Organizational Roles', 'Organizational_Roles']);
  if (orgRoles) metadata.organizational_roles = orgRoles;
  
  const promptStarters = getValue(['Prompt_Starters 1', 'Prompt_Starters_1', 'Prompt Starters 1']);
  if (promptStarters) metadata.prompt_starters = promptStarters;
  
  const originalId = getValue(['Original_ID', 'Original ID']);
  if (originalId) metadata.original_id = originalId;
  
  const agent = getValue(['Agent']);
  if (agent) metadata.agent = agent;
  
  // Determine domain from category/suite
  let domain = 'general';
  if (category) {
    const catLower = category.toLowerCase();
    if (catLower.includes('regulatory') || catLower.includes('fda') || catLower.includes('ema')) {
      domain = 'regulatory';
    } else if (catLower.includes('clinical') || catLower.includes('medical')) {
      domain = 'clinical';
    } else if (catLower.includes('commercial') || catLower.includes('market') || catLower.includes('payer')) {
      domain = 'commercial';
    } else if (catLower.includes('heor') || catLower.includes('health economics')) {
      domain = 'heor';
    } else if (catLower.includes('safety') || catLower.includes('pv') || catLower.includes('pharmacovigilance')) {
      domain = 'safety';
    }
  }
  
  // Description from suite/sub-suite or first line of prompt
  let description = '';
  if (metadata.suite && metadata.sub_suite) {
    description = `${metadata.suite} - ${metadata.sub_suite}`;
  } else if (metadata.suite) {
    description = metadata.suite;
  } else {
    // Extract first meaningful line from prompt
    const firstLines = detailedPrompt.split('\n').filter(l => l.trim() && !l.trim().startsWith('#')).slice(0, 3);
    description = firstLines.join(' ').substring(0, 500);
  }
  
  return {
    name: slug,
    display_name: displayName,
    description: description || displayName,
    category: category,
    complexity_level: complexityLevel,
    domain: domain,
    system_prompt: detailedPrompt || `# ${displayName}\n\n${description}`,
    user_prompt_template: detailedPrompt || `# ${displayName}`,
    // Include both status fields - different schemas may use different ones
    validation_status: isActive ? 'active' : 'inactive',
    status: isActive ? 'active' : 'deprecated',
    version: version || '1.0.0',
    metadata: Object.keys(metadata).length > 0 ? metadata : null,
  };
}

/**
 * Process CSV file and sync to Supabase
 */
async function syncCsvToSupabase(csvFilePath: string) {
  console.log('🚀 Starting CSV to Supabase sync...\n');
  
  // Check if table exists
  const tableExists = await checkTableExists();
  if (!tableExists) {
    console.error('❌ The prompts table does not exist in Supabase!');
    console.error('\n📋 Please run this SQL migration first:');
    console.error('   File: database/migrations/009_create_prompts_table_if_not_exists.sql');
    console.error('\n   Or run it directly in your Supabase SQL Editor.\n');
    process.exit(1);
  }
  
  console.log(`📁 Reading CSV file: ${csvFilePath}\n`);
  
  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ CSV file not found: ${csvFilePath}`);
    process.exit(1);
  }
  
  const prompts: any[] = [];
  let rowCount = 0;
  let skippedCount = 0;
  
  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row: any) => {
        rowCount++;
        const prompt = convertToSupabasePrompt(row);
        if (prompt) {
          prompts.push(prompt);
        } else {
          skippedCount++;
        }
        
        // Progress update every 1000 rows
        if (rowCount % 1000 === 0) {
          console.log(`   Processed ${rowCount} rows, ${prompts.length} prompts ready, ${skippedCount} skipped...`);
        }
      })
      .on('end', async () => {
        console.log(`\n✅ CSV parsing complete!`);
        console.log(`   Total rows: ${rowCount}`);
        console.log(`   Valid prompts: ${prompts.length}`);
        console.log(`   Skipped: ${skippedCount}\n`);
        
        if (prompts.length === 0) {
          console.log('⚠️  No prompts to sync.');
          resolve();
          return;
        }
        
        console.log('📤 Syncing to Supabase...\n');
        
        // Upsert in batches of 100
        const batchSize = 100;
        let successCount = 0;
        let errorCount = 0;
        
        // Remove duplicates within the prompts array (keep first occurrence)
        const uniquePrompts = new Map<string, any>();
        let duplicateCount = 0;
        for (const prompt of prompts) {
          if (!uniquePrompts.has(prompt.name)) {
            uniquePrompts.set(prompt.name, prompt);
          } else {
            duplicateCount++;
          }
        }
        const deduplicatedPrompts = Array.from(uniquePrompts.values());
        
        if (duplicateCount > 0) {
          console.log(`⚠️  Found ${duplicateCount} duplicate prompt names, removed duplicates\n`);
        }
        
        for (let i = 0; i < deduplicatedPrompts.length; i += batchSize) {
          const batch = deduplicatedPrompts.slice(i, i + batchSize);
          
          try {
            // Clean up the batch - ensure required fields and proper types
            // Also ensure no duplicates within the batch itself
            const seenNames = new Set<string>();
            const cleanedBatch = batch
              .map(p => {
                // Preserve metadata if present
                const metadata = p.metadata;
                
                // Ensure all required fields are present
                return {
                  name: p.name,
                  display_name: p.display_name,
                  description: p.description || p.display_name || p.name,
                  category: p.category || 'general',
                  domain: p.domain || 'general',
                  system_prompt: p.system_prompt || p.user_prompt_template || `# ${p.display_name || p.name}`,
                  user_prompt_template: p.user_prompt_template || p.system_prompt || '',
                  complexity_level: p.complexity_level,
                  validation_status: p.validation_status,
                  status: p.status,
                  version: p.version || '1.0.0',
                  // Store metadata as JSONB if metadata exists and has content
                  ...(metadata && Object.keys(metadata).length > 0 ? { metadata } : {}),
                };
              })
              .filter(p => {
                if (seenNames.has(p.name)) {
                  return false; // Skip duplicates within batch
                }
                seenNames.add(p.name);
                return true;
              });
            
            if (cleanedBatch.length === 0) {
              console.log(`   ⚠️  Batch ${Math.floor(i / batchSize) + 1} skipped (all duplicates)`);
              continue;
            }
            
            // Upsert one by one to avoid batch conflicts
            let batchSuccess = 0;
            for (const prompt of cleanedBatch) {
              const { error } = await supabase
                .from('prompts')
                .upsert(prompt, {
                  onConflict: 'name',
                  ignoreDuplicates: false,
                });
              
              if (error) {
                console.error(`   ⚠️  Failed to sync "${prompt.name}": ${error.message}`);
                errorCount++;
              } else {
                batchSuccess++;
              }
            }
            
            successCount += batchSuccess;
            console.log(`   ✓ Synced batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(deduplicatedPrompts.length / batchSize)}: ${successCount}/${deduplicatedPrompts.length} prompts`);
          } catch (err: any) {
            console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} exception:`, err?.message || err || JSON.stringify(err));
            errorCount += batch.length;
          }
        }
        
        console.log(`\n📊 Sync Summary:`);
        console.log(`   ✅ Successfully synced: ${successCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log(`   📋 Total: ${prompts.length}\n`);
        
        resolve();
      })
      .on('error', (err: Error) => {
        console.error('❌ CSV parsing error:', err.message);
        reject(err);
      });
  });
}

// Main execution
const csvFilePath = process.argv[2] || '/Users/hichamnaim/Downloads/Private & Shared 23/Prompts 282345b0299e8034bb48c2f26d5faac6_all.csv';

if (!fs.existsSync(csvFilePath)) {
  console.error(`❌ CSV file not found: ${csvFilePath}`);
  console.error('\nUsage: pnpm sync:csv <path-to-csv-file>');
  process.exit(1);
}

syncCsvToSupabase(csvFilePath)
  .then(() => {
    console.log('✅ Sync completed!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Sync failed:', err);
    process.exit(1);
  });

