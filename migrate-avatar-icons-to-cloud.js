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

// Avatar categories and descriptions
const avatarCategories = {
  'medical': 'Medical professionals and healthcare workers',
  'business': 'Business professionals and corporate avatars',
  'casual': 'Casual and everyday avatars',
  'diverse': 'Diverse and inclusive avatars',
  'professional': 'Professional and formal avatars'
};

// Generate avatar metadata based on filename
function generateAvatarMetadata(filename) {
  const baseName = path.basename(filename, '.png');
  const avatarNumber = baseName.replace('avatar_', '');
  
  // Determine category based on avatar number ranges
  let category = 'casual';
  let description = 'Professional avatar';
  let tags = ['avatar', 'professional'];
  
  const num = parseInt(avatarNumber);
  
  if (num >= 1 && num <= 50) {
    category = 'medical';
    description = 'Medical professional avatar';
    tags = ['avatar', 'medical', 'professional', 'healthcare'];
  } else if (num >= 51 && num <= 100) {
    category = 'business';
    description = 'Business professional avatar';
    tags = ['avatar', 'business', 'professional', 'corporate'];
  } else if (num >= 101 && num <= 150) {
    category = 'diverse';
    description = 'Diverse professional avatar';
    tags = ['avatar', 'diverse', 'professional', 'inclusive'];
  } else if (num >= 151 && num <= 201) {
    category = 'professional';
    description = 'Professional avatar';
    tags = ['avatar', 'professional', 'formal'];
  }
  
  return {
    name: `avatar_png_${avatarNumber}`,
    display_name: `Avatar ${avatarNumber}`,
    category: 'avatar',
    subcategory: category,
    description: description,
    tags: tags
  };
}

async function uploadAvatarToSupabaseStorage(filePath, fileName) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    
    const { data, error } = await supabase.storage
      .from('icons')
      .upload(`avatars/png/${fileName}`, fileBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error(`❌ Error uploading ${fileName}:`, error.message);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('icons')
      .getPublicUrl(`avatars/png/${fileName}`);
    
    return {
      file_path: `avatars/png/${fileName}`,
      file_url: urlData.publicUrl
    };
  } catch (error) {
    console.error(`❌ Error processing ${fileName}:`, error.message);
    return null;
  }
}

async function migrateAvatarIcons() {
  console.log('🚀 Starting avatar icons migration to cloud instance...\n');
  
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
  const batchSize = 10;
  for (let i = 0; i < avatarFiles.length; i += batchSize) {
    const batch = avatarFiles.slice(i, i + batchSize);
    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(avatarFiles.length / batchSize)} (${batch.length} files)`);
    
    const batchPromises = batch.map(async (fileName) => {
      try {
        const filePath = path.join(avatarsDir, fileName);
        const metadata = generateAvatarMetadata(fileName);
        
        // Upload to Supabase Storage
        const uploadResult = await uploadAvatarToSupabaseStorage(filePath, fileName);
        if (!uploadResult) {
          throw new Error('Upload failed');
        }
        
        // Insert into icons table
        const iconData = {
          name: metadata.name,
          display_name: metadata.display_name,
          category: metadata.category,
          subcategory: metadata.subcategory,
          description: metadata.description,
          file_path: uploadResult.file_path,
          file_url: uploadResult.file_url,
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
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`✅ Successfully migrated: ${successCount} avatars`);
  console.log(`❌ Failed: ${errorCount} avatars`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(({ fileName, error }) => {
      console.log(`  - ${fileName}: ${error}`);
    });
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
        console.log(`    URL: ${icon.file_url}`);
      });
    }
  }
  
  console.log('\n🎉 Avatar icons migration completed!');
}

// Run migration
migrateAvatarIcons().catch(console.error);
