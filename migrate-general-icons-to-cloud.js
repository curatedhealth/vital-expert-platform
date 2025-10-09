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

// Generate general icon metadata based on filename
function generateGeneralIconMetadata(filename) {
  const baseName = path.basename(filename, '.png');
  
  // Clean up the filename for better display
  let displayName = baseName
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim();
  
  // Determine subcategory based on filename patterns
  let subcategory = 'technology';
  let description = 'General technology icon';
  let tags = ['general', 'technology', 'icon'];
  
  const lowerName = baseName.toLowerCase();
  
  // AI and Machine Learning
  if (lowerName.includes('ai') || lowerName.includes('artificial') || lowerName.includes('intelligence') || 
      lowerName.includes('machine') || lowerName.includes('learning') || lowerName.includes('neural') ||
      lowerName.includes('deep') || lowerName.includes('cognitive') || lowerName.includes('algorithm')) {
    subcategory = 'ai_ml';
    description = 'AI and Machine Learning icon';
    tags = ['general', 'ai', 'machine-learning', 'technology'];
  }
  // Data and Analytics
  else if (lowerName.includes('data') || lowerName.includes('analytics') || lowerName.includes('mining') ||
           lowerName.includes('analysis') || lowerName.includes('database') || lowerName.includes('storage')) {
    subcategory = 'data_analytics';
    description = 'Data and Analytics icon';
    tags = ['general', 'data', 'analytics', 'technology'];
  }
  // Computer Vision and Recognition
  else if (lowerName.includes('vision') || lowerName.includes('recognition') || lowerName.includes('facial') ||
           lowerName.includes('detection') || lowerName.includes('image') || lowerName.includes('visual')) {
    subcategory = 'computer_vision';
    description = 'Computer Vision icon';
    tags = ['general', 'computer-vision', 'recognition', 'technology'];
  }
  // Automation and Robotics
  else if (lowerName.includes('automation') || lowerName.includes('robot') || lowerName.includes('autonomous') ||
           lowerName.includes('vehicle') || lowerName.includes('process')) {
    subcategory = 'automation';
    description = 'Automation and Robotics icon';
    tags = ['general', 'automation', 'robotics', 'technology'];
  }
  // Augmented and Virtual Reality
  else if (lowerName.includes('reality') || lowerName.includes('augmented') || lowerName.includes('virtual') ||
           lowerName.includes('ar') || lowerName.includes('vr')) {
    subcategory = 'ar_vr';
    description = 'AR/VR Technology icon';
    tags = ['general', 'ar', 'vr', 'reality', 'technology'];
  }
  // Search and Knowledge
  else if (lowerName.includes('search') || lowerName.includes('knowledge') || lowerName.includes('graph') ||
           lowerName.includes('intelligent') || lowerName.includes('decision')) {
    subcategory = 'search_knowledge';
    description = 'Search and Knowledge Management icon';
    tags = ['general', 'search', 'knowledge', 'technology'];
  }
  // Ethics and Governance
  else if (lowerName.includes('ethics') || lowerName.includes('governance') || lowerName.includes('compliance') ||
           lowerName.includes('security') || lowerName.includes('privacy')) {
    subcategory = 'ethics_governance';
    description = 'Ethics and Governance icon';
    tags = ['general', 'ethics', 'governance', 'compliance'];
  }
  // General Technology
  else {
    subcategory = 'technology';
    description = 'General technology icon';
    tags = ['general', 'technology', 'icon'];
  }
  
  return {
    name: `general_${baseName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    display_name: displayName,
    category: 'general',
    subcategory: subcategory,
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

async function migrateGeneralIcons() {
  console.log('🚀 Starting general icons migration to cloud instance...\n');
  
  const generalIconsDir = path.join(process.cwd(), 'public', 'icons', 'png', 'general');
  
  if (!fs.existsSync(generalIconsDir)) {
    console.error('❌ General icons directory not found:', generalIconsDir);
    return;
  }
  
  const iconFiles = fs.readdirSync(generalIconsDir)
    .filter(file => file.endsWith('.png'))
    .sort();
  
  console.log(`📁 Found ${iconFiles.length} general icon PNG files`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  // Process icons in batches to avoid overwhelming the API
  const batchSize = 5; // Smaller batch size for base64 processing
  for (let i = 0; i < iconFiles.length; i += batchSize) {
    const batch = iconFiles.slice(i, i + batchSize);
    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(iconFiles.length / batchSize)} (${batch.length} files)`);
    
    const batchPromises = batch.map(async (fileName) => {
      try {
        const filePath = path.join(generalIconsDir, fileName);
        const metadata = generateGeneralIconMetadata(fileName);
        
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
          file_path: `/icons/png/general/${fileName}`, // Keep original path for reference
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
        
        console.log(`✅ ${fileName} -> ${metadata.display_name} (${metadata.subcategory})`);
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
    if (i + batchSize < iconFiles.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`✅ Successfully migrated: ${successCount} icons`);
  console.log(`❌ Failed: ${errorCount} icons`);
  
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
  const { data: generalIcons, error: verifyError } = await supabase
    .from('icons')
    .select('*')
    .eq('category', 'general')
    .like('name', 'general_%');
  
  if (verifyError) {
    console.error('❌ Verification error:', verifyError.message);
  } else {
    console.log(`✅ Found ${generalIcons?.length || 0} general icons in database`);
    
    // Group by subcategory
    const subcategories = {};
    generalIcons?.forEach(icon => {
      const subcategory = icon.subcategory || 'unknown';
      subcategories[subcategory] = (subcategories[subcategory] || 0) + 1;
    });
    
    console.log('\n📊 General icon subcategories:');
    Object.entries(subcategories).forEach(([subcategory, count]) => {
      console.log(`  - ${subcategory}: ${count} icons`);
    });
    
    // Show sample of migrated icons
    if (generalIcons && generalIcons.length > 0) {
      console.log('\n🎯 Sample migrated general icons:');
      generalIcons.slice(0, 5).forEach(icon => {
        console.log(`  - ${icon.display_name} (${icon.subcategory})`);
        console.log(`    Tags: ${icon.tags?.join(', ') || 'None'}`);
        console.log(`    Base64 length: ${icon.file_url?.length || 0} chars`);
        console.log('');
      });
    }
  }
  
  console.log('\n🎉 General icons migration completed!');
  console.log('💡 Note: Icons are stored as base64 data in the database');
}

// Run migration
migrateGeneralIcons().catch(console.error);
