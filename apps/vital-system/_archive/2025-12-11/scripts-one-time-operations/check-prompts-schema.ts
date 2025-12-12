/**
 * Check what columns actually exist in the Supabase prompts table
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const projectRoot = path.resolve(process.cwd(), '../..');
dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  // Try to select one row to see what columns are available
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error querying prompts:', JSON.stringify(error, null, 2));
    
    // Try to insert a minimal test record
    const testRecord = {
      name: 'test-prompt-schema-check',
      display_name: 'Test Prompt',
      description: 'Test',
      category: 'general',
      domain: 'general',
      system_prompt: 'Test',
      user_prompt_template: 'Test',
    };
    
    const { error: insertError } = await supabase
      .from('prompts')
      .insert(testRecord);
    
    if (insertError) {
      console.error('Insert error (this shows what columns are expected):', JSON.stringify(insertError, null, 2));
    } else {
      console.log('✅ Test insert succeeded');
      // Delete test record
      await supabase.from('prompts').delete().eq('name', 'test-prompt-schema-check');
    }
  } else {
    console.log('✅ Schema check successful');
    if (data && data.length > 0) {
      console.log('\nSample row columns:', Object.keys(data[0]));
    } else {
      console.log('\nTable exists but is empty');
    }
  }
}

checkSchema();

