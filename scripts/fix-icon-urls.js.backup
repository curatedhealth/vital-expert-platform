#!/usr/bin/env node

/**
 * Fix Icon URLs in Database
 * Updates all icons that have /Assets/Icons/ paths to use proper Supabase Storage URLs
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function fixIconUrls() {
  console.log('🔧 Fixing icon URLs in database...');

  try {
    // Get all icons with /Assets/Icons/ paths
    const { data: icons, error: fetchError } = await supabase
      .from('icons')
      .select('*')
      .like('file_url', '/Assets/Icons/%');

    if (fetchError) {
      throw fetchError;
    }

    console.log(`📋 Found ${icons.length} icons with incorrect paths`);

    let fixed = 0;
    let errors = 0;

    for (const icon of icons) {
      try {
        // Extract filename from current file_url
        const filename = icon.file_url.replace('/Assets/Icons/', '');

        // Create proper Supabase Storage URL
        const newFileUrl = `https://xazinxsiglqokwfmogyk.supabase.co/storage/v1/object/public/icons/icons/${filename}`;

        console.log(`🔄 Updating ${icon.name}: ${icon.file_url} → ${newFileUrl}`);

        // Update the icon
        const { error: updateError } = await supabase
          .from('icons')
          .update({ file_url: newFileUrl })
          .eq('id', icon.id);

        if (updateError) {
          throw updateError;
        }

        fixed++;
      } catch (error) {
        console.error(`❌ Failed to update ${icon.name}:`, error.message);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 ICON URL FIX REPORT');
    console.log('='.repeat(60));
    console.log(`✅ Icons Fixed: ${fixed}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📈 Total Processed: ${fixed + errors}`);
    console.log('='.repeat(60));

    if (errors === 0) {
      console.log('🎉 SUCCESS: All icon URLs have been fixed!');
    } else {
      console.log('⚠️ PARTIAL SUCCESS: Some icons had issues');
    }

    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const { data: remainingBroken, error: verifyError } = await supabase
      .from('icons')
      .select('name, file_url')
      .like('file_url', '/Assets/Icons/%');

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      if (remainingBroken.length === 0) {
        console.log('✅ Verification passed: No more broken icon URLs found');
      } else {
        console.log(`⚠️ Warning: ${remainingBroken.length} icons still have broken URLs:`);
        remainingBroken.forEach(icon => {
          console.log(`  - ${icon.name}: ${icon.file_url}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Failed to fix icon URLs:', error);
    process.exit(1);
  }
}

fixIconUrls().catch(console.error);