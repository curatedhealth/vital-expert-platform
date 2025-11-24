/**
 * Add Market Access function to org_functions table
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function addMarketAccessFunction() {
  console.log('🚀 Adding Market Access function...\n');

  try {
    // Check if Market Access already exists
    const { data: existing } = await supabase
      .from('org_functions')
      .select('id, department_name')
      .eq('department_name', 'Market Access')
      .single();

    if (existing) {
      console.log('✓ Market Access function already exists');
      console.log(`  ID: ${existing.id}`);
      console.log(`  Name: ${existing.department_name}\n`);
      return;
    }

    // Add Market Access function
    const { data: newFunction, error } = await supabase
      .from('org_functions')
      .insert({
        unique_id: 'FUNC-013',
        department_name: 'Market Access',
        description: 'Ensuring market access, pricing, reimbursement, and payer engagement strategies',
        migration_ready: false,
        created_by: 'Hicham Naim',
        updated_by: 'Hicham Naim'
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Market Access function added successfully!\n');
    console.log('  ID:', newFunction.id);
    console.log('  Unique ID:', newFunction.unique_id);
    console.log('  Name:', newFunction.department_name);
    console.log('  Description:', newFunction.description);

    // Verify total count
    const { data: allFunctions } = await supabase
      .from('org_functions')
      .select('id, department_name')
      .order('department_name');

    console.log('\n📊 Total Business Functions:', allFunctions?.length || 0);
    console.log('\n✨ All Business Functions:');
    allFunctions?.forEach((f, i) => {
      console.log(`${(i + 1).toString().padStart(2)}. ${f.department_name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addMarketAccessFunction();
