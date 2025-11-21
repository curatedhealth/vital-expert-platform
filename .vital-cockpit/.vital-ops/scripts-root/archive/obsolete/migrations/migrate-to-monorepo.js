#!/usr/bin/env node

/**
 * Migration script to help transition to the new monorepo structure
 * This script helps update import paths and configurations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function updateImportPaths(filePath, oldPath, newPath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Update import paths
    content = content.replace(
      new RegExp(`from ['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'),
      `from '${newPath}'`
    );
    
    content = content.replace(
      new RegExp(`import ['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'),
      `import '${newPath}'`
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      return true;
    }
    return false;
  } catch (error) {
    log(`Error updating ${filePath}: ${error.message}`, 'red');
    return false;
  }
}

function updateTsConfigPaths(tsConfigPath) {
  try {
    const content = fs.readFileSync(tsConfigPath, 'utf8');
    const config = JSON.parse(content);
    
    // Update paths for monorepo structure
    config.compilerOptions = config.compilerOptions || {};
    config.compilerOptions.paths = {
      '@/*': ['./src/*'],
      '@/ui/*': ['../../packages/ui/src/*'],
      '@/core/*': ['../../packages/core/src/*'],
      '@/shared/*': ['./src/shared/*'],
      '@/components/*': ['./src/components/*'],
      '@/lib/*': ['./src/lib/*'],
      '@/types/*': ['./src/types/*'],
      '@/hooks/*': ['./src/hooks/*'],
      '@/utils/*': ['./src/utils/*'],
      '@/features/*': ['./src/features/*'],
      '@/app/*': ['./src/app/*'],
      '@/config/*': ['./src/config/*']
    };
    
    fs.writeFileSync(tsConfigPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    log(`Error updating ${tsConfigPath}: ${error.message}`, 'red');
    return false;
  }
}

function migrateFrontend() {
  log('🔄 Migrating frontend app...', 'blue');
  
  const frontendDir = path.join(__dirname, '..', 'apps', 'frontend');
  
  // Update TypeScript config
  const tsConfigPath = path.join(frontendDir, 'tsconfig.json');
  if (fs.existsSync(tsConfigPath)) {
    updateTsConfigPaths(tsConfigPath);
    log('✅ Updated frontend tsconfig.json', 'green');
  }
  
  // Update import paths in source files
  const srcDir = path.join(frontendDir, 'src');
  if (fs.existsSync(srcDir)) {
    const files = getAllFiles(srcDir, ['.ts', '.tsx', '.js', '.jsx']);
    let updatedCount = 0;
    
    files.forEach(file => {
      if (updateImportPaths(file, '@/shared', '@/shared')) {
        updatedCount++;
      }
    });
    
    if (updatedCount > 0) {
      log(`✅ Updated ${updatedCount} frontend files`, 'green');
    }
  }
}

function migrateNodeGateway() {
  log('🔄 Migrating node gateway...', 'blue');
  
  const gatewayDir = path.join(__dirname, '..', 'apps', 'node-gateway');
  
  // Update package.json if needed
  const packageJsonPath = path.join(gatewayDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.name = 'node-gateway';
    packageJson.private = true;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    log('✅ Updated node gateway package.json', 'green');
  }
}

function migratePythonServices() {
  log('🔄 Migrating python services...', 'blue');
  
  const pythonDir = path.join(__dirname, '..', 'apps', 'python-services');
  
  // Create requirements.txt if it doesn't exist
  const requirementsPath = path.join(pythonDir, 'requirements.txt');
  if (!fs.existsSync(requirementsPath)) {
    const requirements = `# Python dependencies for VITAL Path services
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
openai==1.3.0
anthropic==0.7.0
langchain==0.0.350
langchain-openai==0.0.2
langchain-community==0.0.10
pytest==7.4.3
pytest-asyncio==0.21.1
ruff==0.1.6
black==23.11.0
mypy==1.7.1
`;
    fs.writeFileSync(requirementsPath, requirements);
    log('✅ Created requirements.txt', 'green');
  }
  
  // Create pyproject.toml for modern Python packaging
  const pyprojectPath = path.join(pythonDir, 'pyproject.toml');
  if (!fs.existsSync(pyprojectPath)) {
    const pyproject = `[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "vital-path-python-services"
version = "1.0.0"
description = "Python AI services for VITAL Path platform"
authors = [{name = "VITAL Path Team", email = "team@vitalpath.ai"}]
readme = "README.md"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.104.1",
    "uvicorn>=0.24.0",
    "pydantic>=2.5.0",
    "sqlalchemy>=2.0.23",
    "psycopg2-binary>=2.9.9",
    "openai>=1.3.0",
    "anthropic>=0.7.0",
    "langchain>=0.0.350",
    "langchain-openai>=0.0.2",
    "langchain-community>=0.0.10",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.3",
    "pytest-asyncio>=0.21.1",
    "ruff>=0.1.6",
    "black>=23.11.0",
    "mypy>=1.7.1",
]

[tool.ruff]
line-length = 88
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "W", "C90", "I", "N", "UP", "YTT", "S", "BLE", "FBT", "B", "A", "COM", "C4", "DTZ", "T10", "EM", "EXE", "FA", "ISC", "ICN", "G", "INP", "PIE", "T20", "PYI", "PT", "Q", "RSE", "RET", "SLF", "SLOT", "SIM", "TID", "TCH", "INT", "ARG", "PTH", "TD", "FIX", "ERA", "PD", "PGH", "PL", "TRY", "FLY", "NPY", "AIR", "PERF", "FURB", "LOG", "RUF"]
ignore = ["E501", "W503"]

[tool.black]
line-length = 88
target-version = ['py311']

[tool.mypy]
python_version = "3.11"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
`;
    fs.writeFileSync(pyprojectPath, pyproject);
    log('✅ Created pyproject.toml', 'green');
  }
}

function getAllFiles(dirPath, extensions) {
  let files = [];
  
  function traverse(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dirPath);
  return files;
}

function cleanupOldStructure() {
  log('🧹 Cleaning up old structure...', 'yellow');
  
  const oldDirs = [
    'src',
    'backend',
    'coverage',
    'checkpoints.sqlite',
    'checkpoints.sqlite-shm',
    'checkpoints.sqlite-wal'
  ];
  
  oldDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(fullPath)) {
      try {
        if (fs.statSync(fullPath).isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
          log(`✅ Removed old directory: ${dir}`, 'green');
        } else {
          fs.unlinkSync(fullPath);
          log(`✅ Removed old file: ${dir}`, 'green');
        }
      } catch (error) {
        log(`⚠️  Could not remove ${dir}: ${error.message}`, 'yellow');
      }
    }
  });
}

function main() {
  log('🚀 Starting VITAL Path monorepo migration...', 'cyan');
  log('', 'reset');
  
  try {
    migrateFrontend();
    migrateNodeGateway();
    migratePythonServices();
    
    log('', 'reset');
    log('✅ Migration completed successfully!', 'green');
    log('', 'reset');
    
    log('Next steps:', 'bright');
    log('1. Run: pnpm install', 'blue');
    log('2. Run: make bootstrap', 'blue');
    log('3. Update your IDE settings for the new structure', 'blue');
    log('4. Test the applications: make dev', 'blue');
    log('', 'reset');
    
    // Ask if user wants to cleanup old structure
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Do you want to cleanup the old structure? (y/N): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        cleanupOldStructure();
      }
      rl.close();
    });
    
  } catch (error) {
    log(`❌ Migration failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  migrateFrontend,
  migrateNodeGateway,
  migratePythonServices,
  cleanupOldStructure
};
