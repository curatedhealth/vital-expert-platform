#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

/**
 * Direct database test to map PNG files with database icons
 */

console.log('🧪 DIRECT ICON DATABASE TEST');
console.log('='.repeat(50));

async function testIconDirectly() {
  try {
    // Use environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xazinxsiglqokwfmogyk.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

    console.log('📡 Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get avatar icons
    const { data: icons, error } = await supabase
      .from('icons')
      .select('*')
      .eq('category', 'avatar')
      .eq('is_active', true)
      .order('display_name')
      .limit(10);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`✅ Found ${icons.length} avatar icons in database`);

    // Check PNG directory
    const pngDir = path.join(__dirname, '..', 'public', 'icons', 'png', 'avatars');
    const pngFiles = fs.readdirSync(pngDir).filter(f => f.endsWith('.png'));
    console.log(`📁 Found ${pngFiles.length} PNG files`);

    console.log('\n🔍 Mapping Analysis:');
    console.log('-'.repeat(80));

    for (let i = 0; i < Math.min(5, icons.length); i++) {
      const icon = icons[i];
      console.log(`\n${i + 1}. ${icon.display_name}`);
      console.log(`   Database file: ${icon.file_url}`);

      // Extract filename from URL
      const dbFilename = path.basename(icon.file_url);
      const expectedPng = dbFilename.replace('.svg', '.png');
      console.log(`   Expected PNG: ${expectedPng}`);

      // Check exact match
      const exactMatch = pngFiles.find(f => f === expectedPng);
      if (exactMatch) {
        console.log(`   ✅ FOUND: ${exactMatch}`);
      } else {
        console.log(`   ❌ NOT FOUND`);

        // Try to find similar names
        const baseName = dbFilename.replace('.svg', '').toLowerCase();
        const similar = pngFiles.filter(f => {
          const pngBase = f.replace('.png', '').toLowerCase();
          // Remove numbers and special chars for comparison
          const cleanBase = baseName.replace(/^\d+[_\s]*/, '').replace(/[_\s,]+/g, ' ');
          const cleanPng = pngBase.replace(/^\d+[_\s]*/, '').replace(/[_\s,]+/g, ' ');
          return cleanPng.includes(cleanBase.split(' ')[0]) || cleanBase.includes(cleanPng.split(' ')[0]);
        });

        if (similar.length > 0) {
          console.log(`   🟡 Similar: ${similar[0]}`);
        }
      }
    }

    // Show sample PNG filenames
    console.log('\n📝 Sample PNG filenames:');
    pngFiles.slice(0, 5).forEach((file, i) => {
      console.log(`   ${i + 1}. ${file}`);
    });

    console.log('\n💡 NEXT STEPS:');
    console.log('1. Create mapping between database filenames and PNG filenames');
    console.log('2. Update IconSelectionModal to handle filename variations');
    console.log('3. Test the icon selection modal in the browser');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testIconDirectly();
}