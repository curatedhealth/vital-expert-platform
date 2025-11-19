#!/usr/bin/env node
/**
 * Seed Unified RAG Domains from JSON file
 * 
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=<url> \
 *   SUPABASE_SERVICE_ROLE_KEY=<key> \
 *   node scripts/seed-unified-rag-domains.js [json-file]
 * 
 * Default JSON file: RAG-Domains-clean.json
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Default JSON file
const DEFAULT_JSON_FILE = path.join(__dirname, '../RAG-Domains-clean.json');
const jsonFile = process.argv[2] || DEFAULT_JSON_FILE;

async function seedDomains() {
  console.log('🌱 Seeding Unified RAG Domains...\n');
  
  try {
    // Read JSON file
    console.log(`📄 Reading ${jsonFile}...`);
    const jsonContent = fs.readFileSync(jsonFile, 'utf8');
    const data = JSON.parse(jsonContent);
    
    if (!data.domains || !Array.isArray(data.domains)) {
      throw new Error('Invalid JSON format: missing domains array');
    }
    
    console.log(`✅ Loaded ${data.domains.length} domains\n`);
    
    // Check if table exists
    const { data: tableCheck } = await supabase
      .from('knowledge_domains_new')
      .select('domain_id')
      .limit(1);
    
    if (tableCheck === null) {
      console.error('❌ Table knowledge_domains_new does not exist!');
      console.error('   Run migration first: database/sql/migrations/2025/20250131000001_unified_rag_domain_architecture.sql');
      process.exit(1);
    }
    
    // Transform domains for insert
    const domainsToInsert = data.domains.map(domain => ({
      domain_id: domain.domain_id,
      parent_domain_id: domain.parent_domain_id || null,
      function_id: domain.function_id,
      function_name: domain.function_name,
      domain_name: domain.domain_name,
      domain_description_llm: domain.domain_description_llm || null,
      tenants_primary: domain.tenants_primary || [],
      tenants_secondary: domain.tenants_secondary || [],
      is_cross_tenant: domain.is_cross_tenant ?? true,
      domain_scope: domain.domain_scope || 'global',
      enterprise_id: domain.enterprise_id || null,
      owner_user_id: domain.owner_user_id || null,
      tier: domain.tier || 1,
      tier_label: domain.tier_label || null,
      priority: domain.priority || 1,
      maturity_level: domain.maturity_level || 'Established',
      regulatory_exposure: domain.regulatory_exposure || 'Medium',
      pii_sensitivity: domain.pii_sensitivity || 'Low',
      lifecycle_stage: domain.lifecycle_stage || [],
      governance_owner: domain.governance_owner || null,
      last_review_owner_role: domain.last_review_owner_role || null,
      embedding_model: domain.embedding_model || 'text-embedding-3-large',
      rag_priority_weight: domain.rag_priority_weight || 0.9,
      access_policy: domain.access_policy || 'public',
      // Legacy fields for backward compatibility
      code: domain.domain_id.toUpperCase().replace(/\./g, '_'),
      slug: domain.domain_id,
      name: domain.domain_name,
      description: domain.domain_description_llm || null,
      keywords: [],
      sub_domains: [],
      agent_count_estimate: 0,
      color: '#3B82F6',
      icon: 'book',
      is_active: true,
      metadata: {},
      recommended_models: {
        embedding: {
          primary: domain.embedding_model || 'text-embedding-3-large',
          alternatives: ['text-embedding-ada-002'],
          specialized: null
        }
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    console.log('📊 Domain Summary:');
    const scopes = {};
    const functions = {};
    domainsToInsert.forEach(d => {
      scopes[d.domain_scope] = (scopes[d.domain_scope] || 0) + 1;
      functions[d.function_id] = (functions[d.function_id] || 0) + 1;
    });
    
    console.log('\n   By Scope:');
    Object.entries(scopes).forEach(([scope, count]) => {
      console.log(`     ${scope}: ${count}`);
    });
    
    console.log('\n   By Function:');
    Object.entries(functions).forEach(([func, count]) => {
      console.log(`     ${func}: ${count}`);
    });
    
    console.log('\n💾 Inserting domains...\n');
    
    // Insert in batches (Supabase limit: 1000 rows per insert)
    const batchSize = 100;
    let inserted = 0;
    let errors = 0;
    
    for (let i = 0; i < domainsToInsert.length; i += batchSize) {
      const batch = domainsToInsert.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('knowledge_domains_new')
        .upsert(batch, {
          onConflict: 'domain_id',
          ignoreDuplicates: false
        })
        .select('domain_id');
      
      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        errors += batch.length;
      } else {
        inserted += batch.length;
        console.log(`   ✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(domainsToInsert.length / batchSize)} (${inserted} total)`);
      }
    }
    
    console.log(`\n✅ Seeding complete!`);
    console.log(`   Inserted: ${inserted}`);
    if (errors > 0) {
      console.log(`   Errors: ${errors}`);
    }
    
    // Validate hierarchy
    console.log('\n🔍 Validating hierarchy...');
    const { data: hierarchyCheck } = await supabase
      .from('knowledge_domains_new')
      .select('domain_id, parent_domain_id')
      .not('parent_domain_id', 'is', null);
    
    const orphaned = hierarchyCheck?.filter(d => {
      // Check if parent exists
      return !domainsToInsert.find(domain => domain.domain_id === d.parent_domain_id);
    }) || [];
    
    if (orphaned.length > 0) {
      console.log(`   ⚠️  Warning: ${orphaned.length} domains have missing parent_domain_id references`);
      orphaned.forEach(d => {
        console.log(`      - ${d.domain_id} → ${d.parent_domain_id} (missing)`);
      });
    } else {
      console.log('   ✅ All parent references are valid');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDomains();
}

module.exports = { seedDomains };

