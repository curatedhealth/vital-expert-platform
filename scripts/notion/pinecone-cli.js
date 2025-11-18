#!/usr/bin/env node
/**
 * Pinecone CLI Tool
 * 
 * Unified command-line interface for Pinecone operations
 * 
 * Usage:
 *   node scripts/pinecone-cli.js <command> [options]
 * 
 * Commands:
 *   stats                    Show Pinecone index statistics
 *   list-namespaces          List all namespaces in the index
 *   list-domains             List knowledge domains found in vectors
 *   check-agents             Check agent embeddings (uses check-pinecone-agents.ts)
 *   sync-agents              Sync all agents to Pinecone (uses sync-all-agents-to-pinecone.ts)
 *   sync-knowledge           Sync Supabase knowledge base to Pinecone
 *   query <text>             Query vectors by text (semantic search)
 *   delete-namespace <name>  Delete a namespace
 *   help                     Show this help message
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Try to load Pinecone
let Pinecone = null;
try {
  const pineconeModule = require('@pinecone-database/pinecone');
  Pinecone = pineconeModule.Pinecone;
} catch (e) {
  try {
    const pineconeModule = require('../apps/digital-health-startup/node_modules/@pinecone-database/pinecone');
    Pinecone = pineconeModule.Pinecone;
  } catch (e2) {
    console.error('❌ Pinecone package not found. Install: pnpm add @pinecone-database/pinecone');
    process.exit(1);
  }
}

// Configuration
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'vital-knowledge';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

function printHelp() {
  console.log(`
${colors.bright}${colors.cyan}Pinecone CLI Tool${colors.reset}
${'='.repeat(60)}

${colors.bright}Usage:${colors.reset}
  node scripts/pinecone-cli.js <command> [options]

${colors.bright}Commands:${colors.reset}
  ${colors.green}stats${colors.reset}                    Show Pinecone index statistics
  ${colors.green}list-namespaces${colors.reset}          List all namespaces in the index
  ${colors.green}list-domains${colors.reset}             List knowledge domains found in vectors
  ${colors.green}query <text>${colors.reset}             Query vectors by text (semantic search)
  ${colors.green}delete-namespace <name>${colors.reset}  Delete a namespace (⚠️  destructive)
  ${colors.green}check-agents${colors.reset}             Check agent embeddings status
  ${colors.green}sync-agents${colors.reset}              Sync all agents to Pinecone
  ${colors.green}sync-knowledge${colors.reset}            Sync Supabase knowledge base to Pinecone
  ${colors.green}help${colors.reset}                     Show this help message

${colors.bright}Examples:${colors.reset}
  node scripts/pinecone-cli.js stats
  node scripts/pinecone-cli.js list-namespaces
  node scripts/pinecone-cli.js query "regulatory expert"
  node scripts/pinecone-cli.js list-domains
  node scripts/pinecone-cli.js check-agents

${colors.bright}Environment Variables:${colors.reset}
  PINECONE_API_KEY         - Required
  PINECONE_INDEX_NAME       - Default: 'vital-knowledge'
  NEXT_PUBLIC_SUPABASE_URL - For knowledge domain queries
  SUPABASE_SERVICE_ROLE_KEY - For Supabase operations
`);
}

async function getPineconeIndex() {
  if (!PINECONE_API_KEY) {
    console.error(`${colors.red}❌ PINECONE_API_KEY not set${colors.reset}`);
    process.exit(1);
  }
  
  const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
  
  try {
    const indexes = await pinecone.listIndexes();
    const indexExists = indexes.indexes?.some(idx => idx.name === PINECONE_INDEX_NAME);
    
    if (!indexExists) {
      console.error(`${colors.red}❌ Index "${PINECONE_INDEX_NAME}" does not exist${colors.reset}`);
      console.log(`   Available indexes: ${indexes.indexes?.map(i => i.name).join(', ') || 'none'}`);
      process.exit(1);
    }
    
    return pinecone.index(PINECONE_INDEX_NAME);
  } catch (error) {
    console.error(`${colors.red}❌ Error accessing Pinecone: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

async function cmdStats() {
  console.log(`${colors.bright}${colors.blue}📊 Pinecone Index Statistics${colors.reset}\n`);
  
  const index = await getPineconeIndex();
  const stats = await index.describeIndexStats();
  
  console.log(`${colors.bright}Index:${colors.reset} ${PINECONE_INDEX_NAME}`);
  console.log(`${colors.bright}Total Vectors:${colors.reset} ${(stats.totalRecordCount || 0).toLocaleString()}`);
  console.log(`${colors.bright}Dimension:${colors.reset} ${stats.dimension || 'N/A'}`);
  
  if (stats.namespaces && Object.keys(stats.namespaces).length > 0) {
    console.log(`\n${colors.bright}Namespaces:${colors.reset}`);
    Object.entries(stats.namespaces).forEach(([ns, nsStats]) => {
      const count = nsStats.recordCount || 0;
      console.log(`  ${colors.cyan}${ns}${colors.reset}: ${count.toLocaleString()} vectors`);
    });
  } else {
    console.log(`\n${colors.yellow}No namespaces found${colors.reset}`);
  }
  
  console.log('');
}

async function cmdListNamespaces() {
  console.log(`${colors.bright}${colors.blue}📁 Namespaces in Pinecone${colors.reset}\n`);
  
  const index = await getPineconeIndex();
  const stats = await index.describeIndexStats();
  
  if (stats.namespaces && Object.keys(stats.namespaces).length > 0) {
    console.log(`Found ${Object.keys(stats.namespaces).length} namespace(s):\n`);
    Object.entries(stats.namespaces).forEach(([ns, nsStats]) => {
      const count = nsStats.recordCount || 0;
      console.log(`  ${colors.green}${ns}${colors.reset}`);
      console.log(`    Vectors: ${count.toLocaleString()}`);
      console.log('');
    });
  } else {
    console.log(`${colors.yellow}No namespaces found${colors.reset}`);
    console.log(`   (Default namespace has ${(stats.totalRecordCount || 0).toLocaleString()} vectors)\n`);
  }
}

async function cmdListDomains() {
  console.log(`${colors.bright}${colors.blue}📚 Knowledge Domains in Pinecone${colors.reset}\n`);
  console.log(`${colors.cyan}Note: Knowledge is stored in default namespace with domain metadata${colors.reset}\n`);
  
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log(`${colors.yellow}⚠️  Supabase credentials not configured${colors.reset}`);
    console.log('   Cannot check knowledge domains from Supabase\n');
    return;
  }
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Get domains from knowledge_documents
    const { data: documents, error } = await supabase
      .from('knowledge_documents')
      .select('domain')
      .not('domain', 'is', null);
    
    if (error) {
      console.log(`${colors.yellow}⚠️  Could not query knowledge_documents: ${error.message}${colors.reset}\n`);
      return;
    }
    
    if (!documents || documents.length === 0) {
      console.log(`${colors.yellow}No knowledge documents found in Supabase${colors.reset}\n`);
      return;
    }
    
    // Count by domain
    const domainCounts = {};
    documents.forEach(doc => {
      const domain = doc.domain || 'unknown';
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    });
    
    console.log(`Found ${documents.length} documents across ${Object.keys(domainCounts).length} domain(s):\n`);
    
    const sorted = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1]);
    
    sorted.forEach(([domain, count]) => {
      console.log(`  ${colors.green}${domain}${colors.reset}: ${count} document${count !== 1 ? 's' : ''}`);
    });
    
    console.log(`\n${colors.cyan}Storage Strategy: Single namespace (default) with domain in metadata${colors.reset}`);
    console.log(`  This enables efficient cross-domain queries. See docs/PINECONE_KNOWLEDGE_STORAGE_STRATEGY.md\n`);
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}\n`);
  }
}

async function cmdQuery(text) {
  if (!text) {
    console.error(`${colors.red}❌ Please provide a query text${colors.reset}`);
    console.log(`   Usage: node scripts/pinecone-cli.js query "your search text"`);
    process.exit(1);
  }
  
  console.log(`${colors.bright}${colors.blue}🔍 Querying Pinecone: "${text}"${colors.reset}\n`);
  
  // Note: This is a simplified query - in production you'd use embeddings
  console.log(`${colors.yellow}⚠️  Note: Full semantic search requires embedding generation${colors.reset}`);
  console.log(`   For full search, use the API endpoints or GraphRAG service\n`);
  
  console.log(`   To perform a full query, you can:`);
  console.log(`   1. Use the API: POST /api/agents/search-hybrid`);
  console.log(`   2. Use the service directly in code`);
  console.log(`   3. Or install the official Pinecone CLI: pip install pinecone-cli\n`);
}

async function cmdDeleteNamespace(namespace) {
  if (!namespace) {
    console.error(`${colors.red}❌ Please provide a namespace name${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`${colors.bright}${colors.red}⚠️  WARNING: This will delete all vectors in namespace "${namespace}"${colors.reset}\n`);
  console.log(`This action cannot be undone!\n`);
  
  // In a real CLI, you'd add a confirmation prompt
  console.log(`${colors.yellow}Use Pinecone SDK directly to delete namespaces:${colors.reset}`);
  console.log(`  const index = pinecone.index('${PINECONE_INDEX_NAME}');`);
  console.log(`  await index.deleteAll({ deleteAll: true, namespace: '${namespace}' });\n`);
  console.log(`${colors.cyan}Or use the official Pinecone CLI:${colors.reset}`);
  console.log(`  pc index delete-namespace ${PINECONE_INDEX_NAME} --namespace ${namespace}\n`);
}

async function cmdCheckAgents() {
  console.log(`${colors.bright}${colors.blue}Checking agent embeddings...${colors.reset}\n`);
  console.log(`${colors.cyan}Running: npx tsx scripts/check-pinecone-agents.ts${colors.reset}\n`);
  
  const { execSync } = require('child_process');
  try {
    execSync('npx tsx scripts/check-pinecone-agents.ts', { 
      stdio: 'inherit',
      cwd: __dirname + '/..'
    });
  } catch (error) {
    console.error(`${colors.red}Command failed${colors.reset}`);
    process.exit(1);
  }
}

async function cmdSyncAgents() {
  console.log(`${colors.bright}${colors.blue}Syncing agents to Pinecone...${colors.reset}\n`);
  console.log(`${colors.cyan}Running: npx tsx scripts/sync-all-agents-to-pinecone.ts${colors.reset}\n`);
  
  const { execSync } = require('child_process');
  try {
    execSync('npx tsx scripts/sync-all-agents-to-pinecone.ts', { 
      stdio: 'inherit',
      cwd: __dirname + '/..'
    });
  } catch (error) {
    console.error(`${colors.red}Command failed${colors.reset}`);
    process.exit(1);
  }
}

async function cmdSyncKnowledge() {
  console.log(`${colors.bright}${colors.blue}Syncing knowledge base to Pinecone...${colors.reset}\n`);
  console.log(`${colors.cyan}Running: node scripts/sync-supabase-to-pinecone.js${colors.reset}\n`);
  
  const { execSync } = require('child_process');
  try {
    execSync('node scripts/sync-supabase-to-pinecone.js', { 
      stdio: 'inherit',
      cwd: __dirname + '/..'
    });
  } catch (error) {
    console.error(`${colors.red}Command failed${colors.reset}`);
    process.exit(1);
  }
}

// Main CLI handler
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    printHelp();
    process.exit(0);
  }
  
  const command = args[0];
  
  try {
    switch (command) {
      case 'stats':
        await cmdStats();
        break;
      case 'list-namespaces':
        await cmdListNamespaces();
        break;
      case 'list-domains':
        await cmdListDomains();
        break;
      case 'query':
        await cmdQuery(args[1]);
        break;
      case 'delete-namespace':
        await cmdDeleteNamespace(args[1]);
        break;
      case 'check-agents':
        await cmdCheckAgents();
        break;
      case 'sync-agents':
        await cmdSyncAgents();
        break;
      case 'sync-knowledge':
        await cmdSyncKnowledge();
        break;
      default:
        console.error(`${colors.red}❌ Unknown command: ${command}${colors.reset}\n`);
        printHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error(`\n${colors.red}❌ Error: ${error.message}${colors.reset}`);
    if (error.stack) {
      console.error(`${colors.yellow}Stack: ${error.stack}${colors.reset}`);
    }
    process.exit(1);
  }
}

main();

