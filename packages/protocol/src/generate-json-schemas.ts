#!/usr/bin/env tsx
/* eslint-disable no-console */
/* eslint-disable security/detect-non-literal-fs-filename */
/**
 * VITAL Protocol - JSON Schema Generator
 *
 * Exports Zod schemas to JSON Schema format for:
 * 1. Python Pydantic model generation
 * 2. Documentation
 * 3. Runtime validation in other languages
 *
 * Usage: pnpm run generate:json-schemas
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { zodToJsonSchema } from 'zod-to-json-schema';

// Schemas to export
import { EdgeSchema } from './schemas/edges.schema';
import { ExpertRequestSchema, ExpertSyncResponseSchema, ExpertAsyncResponseSchema, ConversationSchema, MessageSchema } from './schemas/expert.schema';
import { JobSchema, JobResultResponseSchema, JobStatusResponseSchema } from './schemas/job.schema';
import { NodeSchema } from './schemas/nodes.schema';
import { WorkflowSchema, CreateWorkflowSchema } from './schemas/workflow.schema';

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output directory
const outputDir = path.join(__dirname, 'json-schemas');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Schemas to export with their names
const schemas = {
  // Workflow schemas
  workflow: WorkflowSchema,
  workflow_create: CreateWorkflowSchema,
  node: NodeSchema,
  edge: EdgeSchema,
  
  // Expert schemas
  expert_request: ExpertRequestSchema,
  expert_sync_response: ExpertSyncResponseSchema,
  expert_async_response: ExpertAsyncResponseSchema,
  conversation: ConversationSchema,
  message: MessageSchema,
  
  // Job schemas
  job: JobSchema,
  job_status_response: JobStatusResponseSchema,
  job_result_response: JobResultResponseSchema,
} as const;

console.log('🔄 Generating JSON Schemas from Zod...\n');

let successCount = 0;
let errorCount = 0;

for (const [name, schema] of Object.entries(schemas)) {
  try {
    const jsonSchema = zodToJsonSchema(schema, {
      name,
      $refStrategy: 'none', // Inline all refs for simpler generation
      target: 'jsonSchema7',
    });
    
    const outputPath = path.join(outputDir, `${name}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(jsonSchema, null, 2));
    
    console.log(`  ✅ ${name}.json`);
    successCount++;
  } catch (error) {
    console.error(`  ❌ ${name}: ${error}`);
    errorCount++;
  }
}

// Generate an index file
const indexContent = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'VITAL Protocol Schemas',
  description: 'Index of all VITAL Protocol JSON Schemas',
  version: '1.0.0',
  generatedAt: new Date().toISOString(),
  schemas: Object.keys(schemas).map(name => ({
    name,
    file: `${name}.json`,
  })),
};

fs.writeFileSync(
  path.join(outputDir, 'index.json'),
  JSON.stringify(indexContent, null, 2)
);

console.log('\n📋 Summary:');
console.log(`  ✅ Generated: ${successCount}`);
console.log(`  ❌ Failed: ${errorCount}`);
console.log(`  📁 Output: ${outputDir}`);

if (errorCount > 0) {
  process.exit(1);
}

console.log('\n✨ JSON Schema generation complete!');






