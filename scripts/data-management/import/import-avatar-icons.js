#!/usr/bin/env node

/**
 * Import Avatar Icons from Public Folder
 * Scans /public/icons/png/avatars and imports all icons to database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importAvatarIcons() {
  console.log('📥 Importing Avatar Icons from Public Folder...\n');

  try {
    const avatarsDir = path.join(__dirname, '../public/icons/png/avatars');
    const files = fs.readdirSync(avatarsDir).filter(f => f.endsWith('.png'));

    console.log(`📊 Found ${files.length} avatar PNG files\n`);

    // Clear existing avatar icons
    console.log('🗑️  Clearing existing avatar icons...');
    const { error: deleteError } = await supabase
      .from('icons')
      .delete()
      .eq('category', 'avatar');

    if (deleteError) {
      console.error('⚠️  Error clearing icons:', deleteError.message);
    } else {
      console.log('✅ Cleared existing avatar icons\n');
    }

    let successCount = 0;
    let errorCount = 0;

    console.log('🚀 Importing avatar icons...\n');

    // Import in batches of 20
    const batchSize = 20;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);

      const iconsToInsert = batch.map((file, index) => {
        const number = i + index + 1;
        const fileName = path.basename(file, '.png');
        const fileUrl = `/icons/png/avatars/${file}`;

        // Parse display name from filename
        let displayName = `Avatar ${number.toString().padStart(3, '0')}`;
        let description = 'Professional avatar icon';
        let tags = ['avatar'];

        // Try to extract meaningful info from filename
        const nameParts = fileName.toLowerCase().split(/[_,\s]+/);
        if (nameParts.includes('male')) tags.push('male');
        if (nameParts.includes('female')) tags.push('female');
        if (nameParts.includes('doctor')) tags.push('doctor');
        if (nameParts.includes('nurse')) tags.push('nurse');
        if (nameParts.includes('professional')) tags.push('professional');
        if (nameParts.includes('business')) tags.push('business');

        return {
          name: `avatar_${number.toString().padStart(4, '0')}`,
          display_name: displayName,
          category: 'avatar',
          subcategory: 'professional',
          description: description,
          file_path: fileUrl,
          file_url: fileUrl,
          tags: tags,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      });

      const { data, error } = await supabase
        .from('icons')
        .insert(iconsToInsert)
        .select();

      if (error) {
        errorCount += batch.length;
        console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, error.message);
      } else {
        successCount += data.length;
        console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}: Imported ${data.length} icons (${successCount}/${files.length})`);
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`✅ Successfully imported: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);

    // Verify final count
    const { count } = await supabase
      .from('icons')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'avatar');

    console.log(`\n✨ Total avatar icons in database: ${count}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

importAvatarIcons();
