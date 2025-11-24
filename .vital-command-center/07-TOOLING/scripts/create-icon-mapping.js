#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Create a mapping file between database filenames and PNG filenames
 */

console.log('🔗 CREATING ICON FILENAME MAPPING');
console.log('='.repeat(50));

function createIconMapping() {
  try {
    // Get PNG files
    const pngDir = path.join(__dirname, '..', 'public', 'icons', 'png', 'avatars');
    const pngFiles = fs.readdirSync(pngDir).filter(f => f.endsWith('.png'));

    console.log(`📁 Found ${pngFiles.length} PNG files`);

    // Create mapping based on patterns
    const mapping = {};

    pngFiles.forEach(pngFile => {
      // Extract the number at the beginning
      const match = pngFile.match(/^(\d+)/);
      if (match) {
        const number = match[1];

        // Convert PNG name to expected database name
        // From: "01_Arab, male,  people, beard, Islam, avatar, man.png"
        // To: "01arab_male_people_beard_islam_avatar_man.png"
        const dbName = pngFile
          .replace('.png', '') // Remove .png extension first
          .replace(/^(\d+)_/, '$1') // Remove underscore after number
          .replace(/[A-Z]/g, letter => letter.toLowerCase()) // Convert to lowercase
          .replace(/[, ]+/g, '_') // Replace commas and spaces with underscores
          .replace(/_+/g, '_') // Replace multiple underscores with single
          .replace(/^(\d+)/, '$1') // Ensure number is preserved
          + '.png'; // Add .png extension

        mapping[dbName] = pngFile;

        console.log(`${number.padStart(2)}: ${dbName} → ${pngFile}`);
      }
    });

    // Write mapping to a TypeScript file
    const mappingContent = `// Auto-generated icon filename mapping
// Maps database PNG filenames to actual PNG filenames in public/icons/png/avatars/

export const iconFilenameMapping: Record<string, string> = {
${Object.entries(mapping)
  .map(([dbName, pngName]) => `  '${dbName}': '${pngName}'`)
  .join(',\n')}
};

export function getLocalPngFilename(dbFilename: string): string | null {
  const baseName = dbFilename.split('/').pop();
  if (!baseName) return null;

  const pngName = baseName.replace('.svg', '.png');
  return iconFilenameMapping[pngName] || null;
}
`;

    const outputPath = path.join(__dirname, '..', 'src', 'shared', 'utils', 'icon-mapping.ts');

    // Create directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, mappingContent);

    console.log(`\n✅ Created mapping file: ${outputPath}`);
    console.log(`📊 Mapped ${Object.keys(mapping).length} icons`);

    console.log('\n💡 Next: Update IconSelectionModal to use this mapping');

  } catch (error) {
    console.error('❌ Failed to create mapping:', error.message);
  }
}

// Run the script
if (require.main === module) {
  createIconMapping();
}