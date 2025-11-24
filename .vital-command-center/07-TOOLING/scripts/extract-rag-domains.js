#!/usr/bin/env node
/**
 * Extract RAG Domains from RTF JSON file
 * Converts RTF-wrapped JSON to clean JSON for seeding
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../RAG-Domains.json');
const OUTPUT_FILE = path.join(__dirname, '../RAG-Domains-clean.json');

function extractJSONFromRTF(rtfContent) {
  // Remove RTF formatting and extract JSON
  let jsonContent = rtfContent;
  
  // Remove RTF header
  jsonContent = jsonContent.replace(/{\\rtf1[^}]*}/, '');
  
  // Remove RTF control characters
  jsonContent = jsonContent.replace(/\\[a-z]+\d*\s?/gi, '');
  jsonContent = jsonContent.replace(/\{[^}]*\}/g, (match) => {
    // Keep JSON braces, remove RTF braces
    if (match.includes('"') || match.includes(':')) {
      return match;
    }
    return '';
  });
  
  // Remove RTF formatting
  jsonContent = jsonContent.replace(/\\par/g, '');
  jsonContent = jsonContent.replace(/\\pard/g, '');
  jsonContent = jsonContent.replace(/\\f0/g, '');
  jsonContent = jsonContent.replace(/\\fs\d+/g, '');
  jsonContent = jsonContent.replace(/\\cf\d+/g, '');
  jsonContent = jsonContent.replace(/\\tx\d+/g, '');
  jsonContent = jsonContent.replace(/\\pardirnatural/g, '');
  jsonContent = jsonContent.replace(/\\partightenfactor\d+/g, '');
  jsonContent = jsonContent.replace(/[\n\r]+/g, '\n');
  
  // Extract JSON object (from { to })
  const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in RTF file');
  }
  
  jsonContent = jsonMatch[0];
  
  // Remove comments (single-line // comments)
  jsonContent = jsonContent.replace(/\/\/.*$/gm, '');
  
  // Fix escaped quotes
  jsonContent = jsonContent.replace(/\\'/g, "'");
  
  // Fix trailing commas
  jsonContent = jsonContent.replace(/,\s*([}\]])/g, '$1');
  
  return jsonContent;
}

function main() {
  console.log('📄 Extracting JSON from RTF file...\n');
  
  try {
    // Read RTF file
    const rtfContent = fs.readFileSync(INPUT_FILE, 'utf8');
    console.log(`✅ Read ${INPUT_FILE} (${rtfContent.length} chars)`);
    
    // Extract JSON
    const jsonContent = extractJSONFromRTF(rtfContent);
    console.log(`✅ Extracted JSON (${jsonContent.length} chars)`);
    
    // Validate JSON
    const parsed = JSON.parse(jsonContent);
    console.log(`✅ Valid JSON parsed (${parsed.domains?.length || 0} domains)`);
    
    // Write clean JSON
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(parsed, null, 2), 'utf8');
    console.log(`✅ Written clean JSON to ${OUTPUT_FILE}\n`);
    
    // Print summary
    console.log('📊 Summary:');
    console.log(`   Schema Version: ${parsed.schema_version || 'N/A'}`);
    console.log(`   Generated At: ${parsed.generated_at || 'N/A'}`);
    console.log(`   Total Domains: ${parsed.domains?.length || 0}`);
    
    const scopes = {};
    parsed.domains?.forEach(d => {
      scopes[d.domain_scope] = (scopes[d.domain_scope] || 0) + 1;
    });
    
    console.log('\n   By Scope:');
    Object.entries(scopes).forEach(([scope, count]) => {
      console.log(`     ${scope}: ${count}`);
    });
    
    console.log('\n✅ Extraction complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { extractJSONFromRTF };

