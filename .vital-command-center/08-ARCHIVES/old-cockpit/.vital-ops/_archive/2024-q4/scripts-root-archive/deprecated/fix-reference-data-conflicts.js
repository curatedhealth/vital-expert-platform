#!/usr/bin/env node

/**
 * Fix Reference Data Conflicts
 *
 * This script updates the reference data migration file to handle conflicts
 * by adding ON CONFLICT clauses to all INSERT statements.
 */

const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

const filePath = resolve(__dirname, '..', 'database', 'sql', 'migrations', '2025', '20250920110000_populate_prism_reference_data.sql');

console.log('🔧 Fixing reference data conflicts...');

let content = readFileSync(filePath, 'utf8');

// Fix all category INSERT statements by adding ON CONFLICT clauses
const categoryInsertPattern = /INSERT INTO prompt_categories \(domain_id, name, display_name, description, sort_order\) VALUES\n((?:\(\([^)]+\)[^;]+\),?\n?)+);/g;

content = content.replace(categoryInsertPattern, (match, valuesSection) => {
    return match.replace(/;$/, '\nON CONFLICT (domain_id, name) DO UPDATE SET\n    display_name = EXCLUDED.display_name,\n    description = EXCLUDED.description,\n    sort_order = EXCLUDED.sort_order;');
});

// Fix prompt templates INSERT
const templateInsertPattern = /INSERT INTO prompt_templates \([^)]+\) VALUES\n((?:\([^)]+(?:\([^)]*\)[^)]*)*\),?\n?)+);/g;

content = content.replace(templateInsertPattern, (match) => {
    return match.replace(/;$/, '\nON CONFLICT (name) DO UPDATE SET\n    display_name = EXCLUDED.display_name,\n    description = EXCLUDED.description,\n    template_type = EXCLUDED.template_type,\n    content = EXCLUDED.content,\n    variables = EXCLUDED.variables,\n    usage_instructions = EXCLUDED.usage_instructions,\n    updated_at = NOW();');
});

writeFileSync(filePath, content);

console.log('✅ Reference data conflicts fixed!');
console.log('📁 Updated file:', filePath);
console.log('🔄 All INSERT statements now handle conflicts gracefully');