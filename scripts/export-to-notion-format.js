/**
 * Export VITAL Path data from Supabase to Notion-compatible JSON format
 * Exports all 12 databases with proper field mapping
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Field mappings: Supabase → Notion
const FIELD_MAPPINGS = {
  agents: {
    name: 'Name',
    display_name: 'Display Name',
    description: 'Description',
    avatar: 'Avatar',
    status: 'Status',
    tier: 'Tier',
    model: 'Model',
    temperature: 'Temperature',
    max_tokens: 'Max Tokens',
    system_prompt: 'System Prompt',
    domain_expertise: 'Domain Expertise',
    medical_specialty: 'Medical Specialty',
    hipaa_compliant: 'HIPAA Compliant',
    gdpr_compliant: 'GDPR Compliant',
    pharma_enabled: 'Pharma Enabled',
    data_classification: 'Data Classification',
    accuracy_score: 'Accuracy Score',
    priority: 'Priority',
    cost_per_query: 'Cost per Query',
    total_interactions: 'Total Interactions',
    is_public: 'Is Public',
    is_custom: 'Is Custom'
  },
  capabilities: {
    name: 'Name',
    display_name: 'Display Name',
    description: 'Description',
    category: 'Category',
    domain: 'Domain',
    stage: 'Stage',
    vital_component: 'VITAL Component',
    priority: 'Priority',
    maturity: 'Maturity',
    complexity_level: 'Complexity Level',
    is_new: 'Is New',
    panel_recommended: 'Panel Recommended',
    is_premium: 'Is Premium',
    usage_count: 'Usage Count',
    success_rate: 'Success Rate',
    implementation_timeline: 'Implementation Timeline',
    icon: 'Icon',
    color: 'Color'
  },
  org_functions: {
    name: 'Name',
    function_code: 'Function Code',
    description: 'Description',
    icon: 'Icon',
    color: 'Color',
    is_active: 'Is Active',
    sort_order: 'Sort Order'
  },
  org_departments: {
    name: 'Name',
    department_code: 'Department Code',
    description: 'Description',
    head_of_department: 'Head of Department',
    team_size: 'Team Size',
    budget: 'Budget',
    location: 'Location',
    is_active: 'Is Active'
  },
  org_roles: {
    name: 'Name',
    role_code: 'Role Code',
    description: 'Description',
    level: 'Level',
    required_skills: 'Required Skills',
    salary_range: 'Salary Range',
    is_active: 'Is Active'
  },
  org_responsibilities: {
    name: 'Name',
    category: 'Category',
    priority: 'Priority',
    time_allocation: 'Time Allocation',
    is_active: 'Is Active'
  },
  competencies: {
    name: 'Name',
    description: 'Description',
    category: 'Category',
    level_required: 'Level Required',
    training_resources: 'Training Resources',
    assessment_criteria: 'Assessment Criteria',
    is_core: 'Is Core'
  },
  prompts: {
    name: 'Name',
    prompt_text: 'Prompt Text',
    category: 'Category',
    type: 'Type',
    use_cases: 'Use Cases',
    variables: 'Variables',
    expected_output: 'Expected Output',
    complexity: 'Complexity',
    usage_count: 'Usage Count',
    rating: 'Rating',
    is_active: 'Is Active'
  },
  rag_documents: {
    name: 'Name',
    document_type: 'Document Type',
    content: 'Content',
    source_url: 'Source URL',
    category: 'Category',
    document_date: 'Document Date',
    version: 'Version',
    status: 'Status',
    chunk_count: 'Chunk Count',
    vector_embedded: 'Vector Embedded',
    tags: 'Tags',
    file_url: 'File URL'
  },
  tools: {
    name: 'Name',
    description: 'Description',
    type: 'Type',
    category: 'Category',
    api_endpoint: 'API Endpoint',
    configuration: 'Configuration',
    authentication_required: 'Authentication Required',
    rate_limit: 'Rate Limit',
    cost_model: 'Cost Model',
    documentation_url: 'Documentation URL',
    is_active: 'Is Active'
  },
  workflows: {
    name: 'Name',
    description: 'Description',
    type: 'Type',
    steps: 'Steps',
    trigger_conditions: 'Trigger Conditions',
    expected_duration: 'Expected Duration',
    success_criteria: 'Success Criteria',
    status: 'Status',
    automation_level: 'Automation Level',
    usage_count: 'Usage Count',
    success_rate: 'Success Rate'
  },
  jobs_to_be_done: {
    job_statement: 'Job Statement',
    category: 'Category',
    user_persona: 'User Persona',
    situation: 'Situation',
    motivation: 'Motivation',
    expected_outcome: 'Expected Outcome',
    current_solution: 'Current Solution',
    pain_points: 'Pain Points',
    priority: 'Priority',
    frequency: 'Frequency',
    complexity: 'Complexity',
    success_metrics: 'Success Metrics',
    is_solved: 'Is Solved'
  }
};

// Value transformations for Notion compatibility
function transformValue(tableName, fieldName, value) {
  if (value === null || value === undefined) return null;

  // Transform tier numbers to labels
  if (tableName === 'agents' && fieldName === 'tier') {
    const tierMap = { 0: 'Core', 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3' };
    return tierMap[value] || 'Tier 1';
  }

  // Transform status to proper case
  if ((tableName === 'agents' || tableName === 'capabilities') && fieldName === 'status') {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value;
  }

  // Handle JSONB
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return value;
}

// Map Supabase row to Notion-compatible format
function mapToNotionFormat(tableName, row, fieldMapping) {
  const notionRow = {};

  for (const [supabaseField, notionField] of Object.entries(fieldMapping)) {
    if (row.hasOwnProperty(supabaseField)) {
      notionRow[notionField] = transformValue(tableName, supabaseField, row[supabaseField]);
    }
  }

  return notionRow;
}

// Export single table
async function exportTable(tableName, fieldMapping) {
  console.log(`\n📥 Exporting ${tableName}...`);

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      console.error(`❌ Error exporting ${tableName}:`, error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log(`⚠️  No data found in ${tableName}`);
      return [];
    }

    // Map to Notion format
    const notionData = data.map(row => mapToNotionFormat(tableName, row, fieldMapping));

    console.log(`✅ Exported ${notionData.length} records from ${tableName}`);
    return notionData;

  } catch (error) {
    console.error(`❌ Exception exporting ${tableName}:`, error);
    return null;
  }
}

// Main export function
async function exportAllTables() {
  console.log('🚀 Starting VITAL Path → Notion Export');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Create exports directory
  const exportsDir = path.join(process.cwd(), 'exports', 'notion');
  await fs.mkdir(exportsDir, { recursive: true });

  const results = {};
  let totalRecords = 0;

  // Export all tables in dependency order
  const exportOrder = [
    'org_functions',
    'org_departments',
    'org_roles',
    'org_responsibilities',
    'competencies',
    'capabilities',
    'tools',
    'prompts',
    'agents',
    'workflows',
    'rag_documents',
    'jobs_to_be_done'
  ];

  for (const tableName of exportOrder) {
    const fieldMapping = FIELD_MAPPINGS[tableName];

    if (!fieldMapping) {
      console.log(`⚠️  No field mapping defined for ${tableName}, skipping...`);
      continue;
    }

    const data = await exportTable(tableName, fieldMapping);

    if (data !== null) {
      results[tableName] = data;
      totalRecords += data.length;

      // Write individual file
      const filename = path.join(exportsDir, `${tableName}.json`);
      await fs.writeFile(filename, JSON.stringify(data, null, 2));
      console.log(`💾 Saved to ${filename}`);
    }
  }

  // Write combined export
  const combinedFilename = path.join(exportsDir, 'all_tables.json');
  await fs.writeFile(combinedFilename, JSON.stringify(results, null, 2));

  // Write export metadata
  const metadata = {
    export_date: new Date().toISOString(),
    total_tables: Object.keys(results).length,
    total_records: totalRecords,
    tables: Object.fromEntries(
      Object.entries(results).map(([name, data]) => [name, data.length])
    )
  };

  const metadataFilename = path.join(exportsDir, 'export_metadata.json');
  await fs.writeFile(metadataFilename, JSON.stringify(metadata, null, 2));

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Export Complete!');
  console.log(`📊 Total Tables: ${metadata.total_tables}`);
  console.log(`📊 Total Records: ${metadata.total_records}`);
  console.log(`📂 Export Directory: ${exportsDir}`);
  console.log('\n📋 Table Summary:');

  for (const [tableName, count] of Object.entries(metadata.tables)) {
    console.log(`   ${tableName.padEnd(25)} ${count.toString().padStart(4)} records`);
  }

  return metadata;
}

// Run export
exportAllTables()
  .then(() => {
    console.log('\n✅ Export process completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Export process failed:', error);
    process.exit(1);
  });
