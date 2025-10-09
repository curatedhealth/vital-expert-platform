#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xazinxsiglqokwfmogyk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function fixIconUrls() {
  console.log('🔧 Finding and fixing broken icon URLs...');

  try {
    // Get all icons
    const { data: icons, error: fetchError } = await supabase
      .from('icons')
      .select('*');

    if (fetchError) {
      throw fetchError;
    }

    console.log(`📋 Total icons found: ${icons.length}`);

    // Find icons with /Assets/Icons/ URLs
    const brokenIcons = icons.filter(icon =>
      icon.file_url && icon.file_url.startsWith('/Assets/Icons/')
    );

    console.log(`🔍 Found ${brokenIcons.length} icons with broken URLs`);

    let fixed = 0;
    let errors = 0;

    for (const icon of brokenIcons) {
      try {
        // Extract filename from current file_url
        const filename = icon.file_url.replace('/Assets/Icons/', '');

        // Create proper Supabase Storage URL
        const newFileUrl = `https://xazinxsiglqokwfmogyk.supabase.co/storage/v1/object/public/icons/icons/${filename}`;

        console.log(`🔄 Updating ${icon.name}:`);
        console.log(`   FROM: ${icon.file_url}`);
        console.log(`   TO: ${newFileUrl}`);

        // Update the icon
        const { error: updateError } = await supabase
          .from('icons')
          .update({ file_url: newFileUrl })
          .eq('id', icon.id);

        if (updateError) {
          throw updateError;
        }

        fixed++;
        console.log(`   ✅ Updated successfully`);
      } catch (error) {
        console.error(`   ❌ Failed: ${error.message}`);
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

  } catch (error) {
    console.error('❌ Failed to fix icon URLs:', error);
    process.exit(1);
  }
}

fixIconUrls().catch(console.error);