#!/usr/bin/env node

/**
 * Import Path Update Script
 * 
 * This script updates import paths throughout the codebase to use
 * clean architecture aliases and ensure consistency.
 */

const fs = require('fs');
const path = require('path');

// Import path mappings
const IMPORT_MAPPINGS = {
  // Clean architecture aliases
  '@/core': 'src/core',
  '@/infrastructure': 'src/infrastructure', 
  '@/application': 'src/application',
  '@/presentation': 'src/presentation',
  '@/shared': 'src/shared',
  
  // Common patterns
  '@/lib': 'src/shared',
  '@/utils': 'src/shared/utils',
  '@/types': 'src/shared/types',
  '@/constants': 'src/shared/constants',
  '@/config': 'src/shared/config',
  '@/validation': 'src/shared/validation',
  
  // Component patterns
  '@/components': 'src/presentation/components',
  '@/hooks': 'src/presentation/hooks',
  '@/stores': 'src/presentation/stores',
  '@/ui': 'src/presentation/ui',
  
  // Service patterns
  '@/services': 'src/core/services',
  '@/api': 'src/application/api',
  '@/middleware': 'src/application/middleware',
  
  // Domain patterns
  '@/domain': 'src/core/domain',
  '@/entities': 'src/core/domain/entities',
  '@/interfaces': 'src/core/domain/interfaces',
  '@/usecases': 'src/core/usecases',
  
  // Infrastructure patterns
  '@/database': 'src/infrastructure/database',
  '@/external': 'src/infrastructure/external',
  '@/repositories': 'src/infrastructure/repositories',
  '@/monitoring': 'src/infrastructure/monitoring',
  '@/logging': 'src/infrastructure/logging',
  
  // Specific file mappings
  '@/supabase': 'src/infrastructure/database/supabase',
  '@/openai': 'src/infrastructure/external/openai',
  '@/agent-orchestrator': 'src/core/services/agent-orchestrator',
  '@/workflow-engine': 'src/core/services/workflow-engine'
};

class ImportPathUpdater {
  constructor() {
    this.srcPath = path.join(process.cwd(), 'src');
    this.updatedFiles = [];
    this.errors = [];
    this.dryRun = process.argv.includes('--dry-run');
  }

  async updateAllImports() {
    console.log('🔗 Updating import paths throughout codebase...\n');
    
    if (this.dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be modified\n');
    }

    const files = await this.getAllSourceFiles();
    console.log(`Found ${files.length} source files to process\n`);

    for (const file of files) {
      try {
        await this.updateFileImports(file);
      } catch (error) {
        this.errors.push({ file, error: error.message });
        console.error(`❌ Error processing ${file}: ${error.message}`);
      }
    }

    this.printSummary();
  }

  async getAllSourceFiles() {
    const files = [];
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    
    const scanDirectory = async (dir) => {
      const items = await fs.promises.readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          // Skip certain directories
          if (!['node_modules', '.next', 'dist', 'build', '__tests__'].includes(item.name)) {
            await scanDirectory(fullPath);
          }
        } else if (extensions.includes(path.extname(item.name))) {
          files.push(fullPath);
        }
      }
    };
    
    await scanDirectory(this.srcPath);
    return files;
  }

  async updateFileImports(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let hasChanges = false;

    // Update import statements
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    const importMatches = [...content.matchAll(importRegex)];
    
    for (const match of importMatches) {
      const originalImport = match[1];
      const updatedImport = this.updateImportPath(originalImport);
      
      if (updatedImport !== originalImport) {
        updatedContent = updatedContent.replace(
          new RegExp(`from\\s+['"]${originalImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
          `from '${updatedImport}'`
        );
        hasChanges = true;
      }
    }

    // Update require statements
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    const requireMatches = [...content.matchAll(requireRegex)];
    
    for (const match of requireMatches) {
      const originalRequire = match[1];
      const updatedRequire = this.updateImportPath(originalRequire);
      
      if (updatedRequire !== originalRequire) {
        updatedContent = updatedContent.replace(
          new RegExp(`require\\s*\\(\\s*['"]${originalRequire.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\s*\\)`, 'g'),
          `require('${updatedRequire}')`
        );
        hasChanges = true;
      }
    }

    // Update dynamic imports
    const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    const dynamicMatches = [...content.matchAll(dynamicImportRegex)];
    
    for (const match of dynamicMatches) {
      const originalImport = match[1];
      const updatedImport = this.updateImportPath(originalImport);
      
      if (updatedImport !== originalImport) {
        updatedContent = updatedContent.replace(
          new RegExp(`import\\s*\\(\\s*['"]${originalImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\s*\\)`, 'g'),
          `import('${updatedImport}')`
        );
        hasChanges = true;
      }
    }

    if (hasChanges) {
      if (!this.dryRun) {
        fs.writeFileSync(filePath, updatedContent);
      }
      
      this.updatedFiles.push({
        file: path.relative(process.cwd(), filePath),
        changes: this.countChanges(content, updatedContent)
      });
      
      console.log(`✅ Updated ${path.relative(process.cwd(), filePath)}`);
    }
  }

  updateImportPath(importPath) {
    // Skip external packages
    if (!importPath.startsWith('@/') && !importPath.startsWith('./') && !importPath.startsWith('../')) {
      return importPath;
    }

    // Handle @/ aliases
    if (importPath.startsWith('@/')) {
      for (const [alias, targetPath] of Object.entries(IMPORT_MAPPINGS)) {
        if (importPath.startsWith(alias)) {
          const remainingPath = importPath.substring(alias.length);
          return `${targetPath}${remainingPath}`;
        }
      }
    }

    // Handle relative imports that should be converted to aliases
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      // This would require more complex logic to determine the current file's location
      // and calculate the appropriate alias. For now, we'll leave relative imports as-is.
      return importPath;
    }

    return importPath;
  }

  countChanges(original, updated) {
    const originalLines = original.split('\n');
    const updatedLines = updated.split('\n');
    
    let changes = 0;
    for (let i = 0; i < Math.min(originalLines.length, updatedLines.length); i++) {
      if (originalLines[i] !== updatedLines[i]) {
        changes++;
      }
    }
    
    return changes;
  }

  printSummary() {
    console.log('\n📊 Import Path Update Summary\n');
    
    if (this.updatedFiles.length > 0) {
      console.log(`✅ Successfully updated ${this.updatedFiles.length} files:`);
      this.updatedFiles.forEach(file => {
        console.log(`  - ${file.file} (${file.changes} changes)`);
      });
    } else {
      console.log('ℹ️  No files needed updating');
    }

    if (this.errors.length > 0) {
      console.log(`\n❌ ${this.errors.length} errors occurred:`);
      this.errors.forEach(error => {
        console.log(`  - ${error.file}: ${error.error}`);
      });
    }

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      dryRun: this.dryRun,
      totalFiles: this.updatedFiles.length,
      totalChanges: this.updatedFiles.reduce((sum, file) => sum + file.changes, 0),
      errors: this.errors.length,
      updatedFiles: this.updatedFiles
    };

    const reportPath = path.join(process.cwd(), 'import-path-update-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  }
}

// Run the updater
if (require.main === module) {
  const updater = new ImportPathUpdater();
  updater.updateAllImports().catch(console.error);
}

module.exports = ImportPathUpdater;
