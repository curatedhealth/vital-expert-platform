#!/usr/bin/env node

/**
 * Clean Architecture Migration Script
 * 
 * This script helps migrate the codebase to clean architecture by:
 * 1. Moving files to appropriate layers
 * 2. Updating import paths
 * 3. Creating proper layer structure
 * 4. Generating migration reports
 */

const fs = require('fs');
const path = require('path');

// Clean Architecture configuration
const ARCHITECTURE_CONFIG = {
  layers: {
    core: {
      path: 'src/core',
      subdirs: ['domain/entities', 'domain/interfaces', 'services', 'usecases'],
      patterns: ['entities', 'domain', 'interfaces', 'services', 'usecases']
    },
    infrastructure: {
      path: 'src/infrastructure',
      subdirs: ['database', 'external', 'repositories', 'monitoring', 'logging'],
      patterns: ['database', 'external', 'repositories', 'monitoring', 'logging', 'supabase', 'openai']
    },
    application: {
      path: 'src/application',
      subdirs: ['middleware', 'handlers', 'controllers', 'dto', 'validators'],
      patterns: ['middleware', 'handlers', 'controllers', 'dto', 'validators', 'api']
    },
    presentation: {
      path: 'src/presentation',
      subdirs: ['components', 'pages', 'hooks', 'stores', 'ui'],
      patterns: ['components', 'pages', 'hooks', 'stores', 'ui', 'app']
    },
    shared: {
      path: 'src/shared',
      subdirs: ['utils', 'types', 'constants', 'validation', 'config'],
      patterns: ['utils', 'types', 'constants', 'validation', 'config', 'lib']
    }
  },
  aliases: {
    '@core': 'src/core',
    '@infrastructure': 'src/infrastructure',
    '@application': 'src/application',
    '@presentation': 'src/presentation',
    '@shared': 'src/shared'
  }
};

class CleanArchitectureMigrator {
  constructor() {
    this.srcPath = path.join(process.cwd(), 'src');
    this.migrationLog = [];
    this.dryRun = process.argv.includes('--dry-run');
  }

  async migrate() {
    console.log('🚀 Starting Clean Architecture Migration...\n');
    
    if (this.dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be moved\n');
    }

    await this.createLayerStructure();
    await this.analyzeAndMoveFiles();
    await this.updateImportPaths();
    await this.generateMigrationReport();
    
    console.log('\n✅ Migration completed!');
  }

  async createLayerStructure() {
    console.log('📁 Creating clean architecture layer structure...');
    
    for (const [layerName, config] of Object.entries(ARCHITECTURE_CONFIG.layers)) {
      const layerPath = path.join(this.srcPath, config.path);
      
      // Create main layer directory
      await this.ensureDirectoryExists(layerPath);
      
      // Create subdirectories
      for (const subdir of config.subdirs) {
        const subdirPath = path.join(layerPath, subdir);
        await this.ensureDirectoryExists(subdirPath);
      }
    }
    
    console.log('✅ Layer structure created\n');
  }

  async ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      if (!this.dryRun) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      this.logMigration('CREATE_DIR', dirPath, 'Created directory');
    }
  }

  async analyzeAndMoveFiles() {
    console.log('📋 Analyzing and moving files to appropriate layers...');
    
    const filesToMove = await this.findFilesToMove();
    
    for (const fileInfo of filesToMove) {
      await this.moveFileToLayer(fileInfo);
    }
    
    console.log(`✅ Analyzed ${filesToMove.length} files\n`);
  }

  async findFilesToMove() {
    const filesToMove = [];
    
    // Find files in problematic locations
    const problematicDirs = ['features', 'lib', 'components', 'hooks', 'utils', 'types', 'services'];
    
    for (const dir of problematicDirs) {
      const dirPath = path.join(this.srcPath, dir);
      if (fs.existsSync(dirPath)) {
        const files = await this.getAllFiles(dirPath);
        for (const file of files) {
          const targetLayer = this.determineTargetLayer(file);
          if (targetLayer) {
            filesToMove.push({
              source: file,
              target: this.generateTargetPath(file, targetLayer),
              layer: targetLayer
            });
          }
        }
      }
    }
    
    return filesToMove;
  }

  async getAllFiles(dirPath) {
    const files = [];
    const items = await fs.promises.readdir(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        files.push(...await this.getAllFiles(fullPath));
      } else if (this.isSourceFile(item.name)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  isSourceFile(filename) {
    const ext = path.extname(filename);
    return ['.ts', '.tsx', '.js', '.jsx'].includes(ext);
  }

  determineTargetLayer(filePath) {
    const relativePath = path.relative(this.srcPath, filePath);
    
    for (const [layerName, config] of Object.entries(ARCHITECTURE_CONFIG.layers)) {
      for (const pattern of config.patterns) {
        if (relativePath.includes(pattern)) {
          return layerName;
        }
      }
    }
    
    // Default to shared for utility files
    if (relativePath.includes('utils') || relativePath.includes('lib')) {
      return 'shared';
    }
    
    return null;
  }

  generateTargetPath(sourcePath, targetLayer) {
    const relativePath = path.relative(this.srcPath, sourcePath);
    const fileName = path.basename(sourcePath);
    const targetDir = ARCHITECTURE_CONFIG.layers[targetLayer].path;
    
    // Determine appropriate subdirectory
    let subdir = '';
    if (relativePath.includes('entities') || relativePath.includes('domain')) {
      subdir = 'domain/entities';
    } else if (relativePath.includes('services')) {
      subdir = 'services';
    } else if (relativePath.includes('utils')) {
      subdir = 'utils';
    } else if (relativePath.includes('types')) {
      subdir = 'types';
    } else if (relativePath.includes('components')) {
      subdir = 'components';
    } else if (relativePath.includes('hooks')) {
      subdir = 'hooks';
    } else if (relativePath.includes('middleware')) {
      subdir = 'middleware';
    }
    
    return path.join(this.srcPath, targetDir, subdir, fileName);
  }

  async moveFileToLayer(fileInfo) {
    const { source, target, layer } = fileInfo;
    
    // Ensure target directory exists
    const targetDir = path.dirname(target);
    await this.ensureDirectoryExists(targetDir);
    
    if (!this.dryRun) {
      // Move the file
      fs.renameSync(source, target);
    }
    
    this.logMigration('MOVE_FILE', source, `Moved to ${layer} layer`, target);
  }

  async updateImportPaths() {
    console.log('🔗 Updating import paths...');
    
    const allFiles = await this.getAllFiles(this.srcPath);
    let updatedFiles = 0;
    
    for (const file of allFiles) {
      if (await this.updateFileImports(file)) {
        updatedFiles++;
      }
    }
    
    console.log(`✅ Updated imports in ${updatedFiles} files\n`);
  }

  async updateFileImports(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    let newContent = content;
    
    // Update import paths to use clean architecture aliases
    for (const [alias, targetPath] of Object.entries(ARCHITECTURE_CONFIG.aliases)) {
      const regex = new RegExp(`from ['"]@/${targetPath.replace('src/', '')}([^'"]*)['"]`, 'g');
      const replacement = `from '${alias}$1'`;
      
      if (regex.test(newContent)) {
        newContent = newContent.replace(regex, replacement);
        updated = true;
      }
    }
    
    // Update relative imports that cross layer boundaries
    const relativeImportRegex = /from ['"]\.\.\/\.\.\/([^'"]+)['"]/g;
    newContent = newContent.replace(relativeImportRegex, (match, importPath) => {
      // Determine appropriate alias based on import path
      for (const [alias, targetPath] of Object.entries(ARCHITECTURE_CONFIG.aliases)) {
        if (importPath.startsWith(targetPath.replace('src/', ''))) {
          return `from '${alias}${importPath.replace(targetPath.replace('src/', ''), '')}'`;
        }
      }
      return match;
    });
    
    if (updated && !this.dryRun) {
      fs.writeFileSync(filePath, newContent);
      this.logMigration('UPDATE_IMPORTS', filePath, 'Updated import paths');
    }
    
    return updated;
  }

  logMigration(type, file, message, target = null) {
    const logEntry = {
      type,
      file: path.relative(process.cwd(), file),
      message,
      target: target ? path.relative(process.cwd(), target) : null,
      timestamp: new Date().toISOString()
    };
    
    this.migrationLog.push(logEntry);
    
    if (this.dryRun) {
      console.log(`[DRY RUN] ${type}: ${file} -> ${message}`);
    } else {
      console.log(`${type}: ${file} -> ${message}`);
    }
  }

  async generateMigrationReport() {
    console.log('📊 Generating migration report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      dryRun: this.dryRun,
      totalOperations: this.migrationLog.length,
      operationsByType: {},
      layerDistribution: {},
      recommendations: []
    };
    
    // Analyze operations by type
    for (const log of this.migrationLog) {
      if (!report.operationsByType[log.type]) {
        report.operationsByType[log.type] = 0;
      }
      report.operationsByType[log.type]++;
    }
    
    // Analyze layer distribution
    for (const log of this.migrationLog) {
      if (log.type === 'MOVE_FILE' && log.target) {
        const layer = this.extractLayerFromPath(log.target);
        if (layer) {
          if (!report.layerDistribution[layer]) {
            report.layerDistribution[layer] = 0;
          }
          report.layerDistribution[layer]++;
        }
      }
    }
    
    // Generate recommendations
    report.recommendations = [
      'Review moved files to ensure they are in the correct layers',
      'Update any remaining hardcoded import paths',
      'Run tests to ensure migration didn\'t break functionality',
      'Update documentation to reflect new architecture',
      'Consider adding layer-specific linting rules'
    ];
    
    // Save report
    const reportPath = path.join(process.cwd(), 'clean-architecture-migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`✅ Migration report saved to: ${reportPath}`);
    console.log(`\n📈 Migration Summary:`);
    console.log(`  Total Operations: ${report.totalOperations}`);
    console.log(`  Operations by Type:`);
    for (const [type, count] of Object.entries(report.operationsByType)) {
      console.log(`    ${type}: ${count}`);
    }
    console.log(`  Files moved to layers:`);
    for (const [layer, count] of Object.entries(report.layerDistribution)) {
      console.log(`    ${layer}: ${count}`);
    }
  }

  extractLayerFromPath(filePath) {
    for (const [layerName, config] of Object.entries(ARCHITECTURE_CONFIG.layers)) {
      if (filePath.includes(config.path)) {
        return layerName;
      }
    }
    return null;
  }
}

// Run the migration
if (require.main === module) {
  const migrator = new CleanArchitectureMigrator();
  migrator.migrate().catch(console.error);
}

module.exports = CleanArchitectureMigrator;
