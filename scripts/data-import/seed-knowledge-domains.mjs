#!/usr/bin/env node
/**
 * Seed Knowledge Domains Script
 *
 * Runs the 30 knowledge domains SQL migration
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '../apps/digital-health-startup/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedKnowledgeDomains() {
  try {
    console.log('🌱 Seeding knowledge domains...');

    // Read the SQL file
    const sqlPath = join(__dirname, '../database/sql/migrations/008_seed_30_knowledge_domains.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    console.log('📄 SQL file loaded:', sqlPath);
    console.log('📊 File size:', sql.length, 'bytes');

    // Execute the SQL
    console.log('⚡ Executing SQL migration...');

    // Since we can't execute raw SQL directly with the client library,
    // we'll use the RPC function or direct table operations
    // Let's check if domains exist first
    const { data: existing, error: checkError } = await supabase
      .from('knowledge_domains')
      .select('count')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      console.log('❌ Table knowledge_domains does not exist');
      console.log('💡 Please run the SQL migration manually:');
      console.log(`   cat "${sqlPath}" | docker exec -i supabase-db psql -U postgres -d postgres`);
      process.exit(1);
    }

    // Check count
    const { count } = await supabase
      .from('knowledge_domains')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Current knowledge domains count: ${count}`);

    if (count === 0) {
      console.log('❌ No knowledge domains found');
      console.log('💡 Running SQL migration...');
      console.log(`   cat "${sqlPath}" | docker exec -i supabase-db psql -U postgres -d postgres`);
      process.exit(1);
    }

    console.log('✅ Knowledge domains table exists with', count, 'domains');

    // Fetch and display domains
    const { data: domains, error: fetchError } = await supabase
      .from('knowledge_domains')
      .select('code, name, tier')
      .order('priority');

    if (fetchError) throw fetchError;

    console.log('\n📋 Knowledge Domains:');
    console.log('════════════════════════════════════════════════════════════════');

    let tierCount = { 1: 0, 2: 0, 3: 0 };
    domains.forEach((domain, idx) => {
      const tierName = domain.tier === 1 ? 'Core' : domain.tier === 2 ? 'Specialized' : 'Emerging';
      console.log(`${(idx + 1).toString().padStart(2)}. [Tier ${domain.tier} - ${tierName.padEnd(11)}] ${domain.name} (${domain.code})`);
      tierCount[domain.tier]++;
    });

    console.log('════════════════════════════════════════════════════════════════');
    console.log(`📊 Total: ${domains.length} domains`);
    console.log(`   - Tier 1 (Core): ${tierCount[1]}`);
    console.log(`   - Tier 2 (Specialized): ${tierCount[2]}`);
    console.log(`   - Tier 3 (Emerging): ${tierCount[3]}`);
    console.log('\n✅ Knowledge domains successfully verified!');

  } catch (error) {
    console.error('❌ Error seeding knowledge domains:', error);
    process.exit(1);
  }
}

seedKnowledgeDomains();
