const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generate avatar metadata based on filename
function generateAvatarMetadata(filename) {
  const baseName = path.basename(filename, '.png');
  
  // Handle different naming patterns
  let avatarNumber = '';
  let displayName = '';
  let category = 'casual';
  let description = 'Professional avatar';
  let tags = ['avatar', 'professional'];
  
  if (baseName.startsWith('avatar_')) {
    avatarNumber = baseName.replace('avatar_', '');
    displayName = `Avatar ${avatarNumber}`;
  } else if (baseName.startsWith('noun-')) {
    // Handle noun-project files
    const parts = baseName.split('-');
    if (parts.length >= 3) {
      const type = parts[1]; // e.g., 'man', 'woman', 'boy', 'girl'
      const id = parts[2]; // e.g., '5757356'
      avatarNumber = id;
      displayName = `${type.charAt(0).toUpperCase() + type.slice(1)} Avatar ${id}`;
    } else {
      avatarNumber = baseName;
      displayName = `Avatar ${baseName}`;
    }
  } else {
    avatarNumber = baseName;
    displayName = `Avatar ${baseName}`;
  }
  
  // Determine category based on filename patterns
  const lowerName = baseName.toLowerCase();
  if (lowerName.includes('medical') || lowerName.includes('doctor') || lowerName.includes('nurse')) {
    category = 'medical';
    description = 'Medical professional avatar';
    tags = ['avatar', 'medical', 'professional', 'healthcare'];
  } else if (lowerName.includes('business') || lowerName.includes('man') || lowerName.includes('woman')) {
    category = 'business';
    description = 'Business professional avatar';
    tags = ['avatar', 'business', 'professional', 'corporate'];
  } else if (lowerName.includes('boy') || lowerName.includes('girl') || lowerName.includes('teenager')) {
    category = 'casual';
    description = 'Casual avatar';
    tags = ['avatar', 'casual', 'young'];
  } else if (lowerName.includes('old') || lowerName.includes('elderly')) {
    category = 'professional';
    description = 'Senior professional avatar';
    tags = ['avatar', 'professional', 'senior'];
  }
  
  return {
    name: `avatar_png_${avatarNumber}`,
    display_name: displayName,
    category: 'avatar',
    subcategory: category,
    description: description,
    tags: tags
  };
}

async function convertPngToBase64(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const base64String = fileBuffer.toString('base64');
    return `data:image/png;base64,${base64String}`;
  } catch (error) {
    console.error(`❌ Error converting ${filePath} to base64:`, error.message);
    return null;
  }
}

async function migrateAvatarIcons() {
  console.log('🚀 Starting avatar icons migration to cloud instance (Base64 approach)...\n');
  
  const avatarsDir = path.join(process.cwd(), 'public', 'icons', 'png', 'avatars');
  
  if (!fs.existsSync(avatarsDir)) {
    console.error('❌ Avatars directory not found:', avatarsDir);
    return;
  }
  
  const avatarFiles = fs.readdirSync(avatarsDir)
    .filter(file => file.endsWith('.png'))
    .sort();
  
  console.log(`📁 Found ${avatarFiles.length} avatar PNG files`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  // Process avatars in batches to avoid overwhelming the API
  const batchSize = 5; // Smaller batch size for base64 processing
  for (let i = 0; i < avatarFiles.length; i += batchSize) {
    const batch = avatarFiles.slice(i, i + batchSize);
    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(avatarFiles.length / batchSize)} (${batch.length} files)`);
    
    const batchPromises = batch.map(async (fileName) => {
      try {
        const filePath = path.join(avatarsDir, fileName);
        const metadata = generateAvatarMetadata(fileName);
        
        // Convert PNG to base64
        const base64Data = await convertPngToBase64(filePath);
        if (!base64Data) {
          throw new Error('Base64 conversion failed');
        }
        
        // Insert into icons table with base64 data
        const iconData = {
          name: metadata.name,
          display_name: metadata.display_name,
          category: metadata.category,
          subcategory: metadata.subcategory,
          description: metadata.description,
          file_path: `/icons/png/avatars/${fileName}`, // Keep original path for reference
          file_url: base64Data, // Store base64 data as URL
          svg_content: base64Data, // Also store in svg_content field
          tags: metadata.tags,
          is_active: true
        };
        
        const { error: insertError } = await supabase
          .from('icons')
          .insert([iconData]);
        
        if (insertError) {
          throw new Error(`Database insert failed: ${insertError.message}`);
        }
        
        console.log(`✅ ${fileName} -> ${metadata.display_name}`);
        successCount++;
        return { success: true, fileName, metadata };
        
      } catch (error) {
        console.error(`❌ ${fileName}: ${error.message}`);
        errors.push({ fileName, error: error.message });
        errorCount++;
        return { success: false, fileName, error: error.message };
      }
    });
    
    // Wait for batch to complete
    await Promise.all(batchPromises);
    
    // Small delay between batches
    if (i + batchSize < avatarFiles.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`✅ Successfully migrated: ${successCount} avatars`);
  console.log(`❌ Failed: ${errorCount} avatars`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.slice(0, 10).forEach(({ fileName, error }) => {
      console.log(`  - ${fileName}: ${error}`);
    });
    if (errors.length > 10) {
      console.log(`  ... and ${errors.length - 10} more errors`);
    }
  }
  
  // Verify migration
  console.log('\n🔍 Verifying migration...');
  const { data: avatarIcons, error: verifyError } = await supabase
    .from('icons')
    .select('*')
    .eq('category', 'avatar')
    .like('name', 'avatar_png_%');
  
  if (verifyError) {
    console.error('❌ Verification error:', verifyError.message);
  } else {
    console.log(`✅ Found ${avatarIcons?.length || 0} avatar icons in database`);
    
    // Show sample of migrated avatars
    if (avatarIcons && avatarIcons.length > 0) {
      console.log('\n🎯 Sample migrated avatars:');
      avatarIcons.slice(0, 5).forEach(icon => {
        console.log(`  - ${icon.display_name} (${icon.subcategory})`);
        console.log(`    Base64 length: ${icon.file_url?.length || 0} chars`);
      });
    }
  }
  
  console.log('\n🎉 Avatar icons migration completed!');
  console.log('💡 Note: Avatars are stored as base64 data in the database');
}

// Run migration
migrateAvatarIcons().catch(console.error);
