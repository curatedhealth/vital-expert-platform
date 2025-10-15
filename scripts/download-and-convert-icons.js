#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Script to download SVG icons from Supabase and help convert them to PNG
 */

console.log('📥 ICON DOWNLOAD AND CONVERSION HELPER');
console.log('='.repeat(50));

// Test with a small sample first
async function downloadSampleIcons() {
  try {
    // Get icons from API
    const response = await fetch('http://localhost:3001/api/icons?category=avatar');
    const data = await response.json();

    if (!data.success || !data.icons) {
      throw new Error('Failed to fetch icons from API');
    }

    console.log(`📋 Found ${data.icons.length} avatar icons`);

    // Create sample with first 5 icons
    const sampleIcons = data.icons.slice(0, 5);

    console.log('\n📥 Downloading sample SVG icons...');

    for (const icon of sampleIcons) {
      try {
        const filename = path.basename(icon.file_url);
        const category = icon.category || 'general';
        const categoryDir = category === 'avatar' ? 'avatars' : category;
        const svgPath = path.join(__dirname, '..', 'public', 'icons', 'svg-samples', filename);

        // Create directory if it doesn't exist
        const dir = path.dirname(svgPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        console.log(`  Downloading: ${filename}`);
        await downloadFile(icon.file_url, svgPath);

        console.log(`  ✅ Downloaded: ${filename}`);

      } catch (error) {
        console.error(`  ❌ Failed to download ${icon.name}:`, error.message);
      }
    }

    console.log('\n📁 Sample SVG files saved to: public/icons/svg-samples/');
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Check the downloaded SVG files in public/icons/svg-samples/');
    console.log('2. Convert them to PNG using your preferred tool:');
    console.log('   - Online: convertio.co, cloudconvert.com');
    console.log('   - Desktop: GIMP, Photoshop, Sketch');
    console.log('   - Command line: imagemagick, inkscape');
    console.log('3. Save PNG files to public/icons/png/avatars/');
    console.log('4. Use the exact same filename but with .png extension');

    // Generate conversion commands
    console.log('\n💡 ImageMagick conversion commands:');
    sampleIcons.forEach(icon => {
      const filename = path.basename(icon.file_url, '.svg');
      console.log(`convert public/icons/svg-samples/${filename}.svg -resize 64x64 public/icons/png/avatars/${filename}.png`);
    });

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });

      file.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete the file on error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Run if called directly
if (require.main === module) {
  downloadSampleIcons();
}