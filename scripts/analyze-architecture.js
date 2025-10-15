#!/usr/bin/env node

/**
 * Architecture Analysis Script
 * 
 * This script analyzes the current codebase structure and identifies
 * files that need to be migrated to the clean architecture pattern.
 */

const fs = require('fs');
const path = require('path');

// Clean Architecture layers
const LAYERS = {
  CORE: 'core',
  INFRASTRUCTURE: 'infrastructure', 
  APPLICATION: 'application',
  PRESENTATION: 'presentation',
  SHARED: 'shared'
};

// File patterns for each layer
const LAYER_PATTERNS = {
  [LAYERS.CORE]: [
    'entities',
    'services',
    'interfaces',
    'domain',
    'usecases'
  ],
  [LAYERS.INFRASTRUCTURE]: [
    'database',
    'external',
    'repositories',
    'monitoring',
    'logging',
    'cache',
    'queue'
  ],
  [LAYERS.APPLICATION]: [
    'middleware',
    'handlers',
    'controllers',
    'dto',
    'validators'
  ],
  [LAYERS.PRESENTATION]: [
    'components',
    'pages',
    'hooks',
    'stores',
    'ui',
    'app'
  ],
  [LAYERS.SHARED]: [
    'utils',
    'types',
    'constants',
    'validation',
    'config'
  ]
};

// Current problematic patterns
const PROBLEMATIC_PATTERNS = [
  'features/',
  'lib/',
  'components/',
  'hooks/',
  'utils/',
  'types/',
  'services/',
  'api/'
];

class ArchitectureAnalyzer {
  constructor() {
    this.srcPath = path.join(process.cwd(), 'src');
    this.analysis = {
      totalFiles: 0,
      layerDistribution: {},
      problematicFiles: [],
      migrationNeeded: [],
      recommendations: []
    };
  }

  async analyze() {
    console.log('🔍 Analyzing VITAL codebase architecture...\n');
    
    await this.scanDirectory(this.srcPath);
    this.analyzeLayerDistribution();
    this.identifyProblematicFiles();
    this.generateRecommendations();
    this.printReport();
  }

  async scanDirectory(dirPath, relativePath = '') {
    const items = await fs.promises.readdir(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      const itemRelativePath = path.join(relativePath, item.name);
      
      if (item.isDirectory()) {
        // Skip node_modules and other non-source directories
        if (!['node_modules', '.next', 'dist', 'build'].includes(item.name)) {
          await this.scanDirectory(fullPath, itemRelativePath);
        }
      } else if (item.isFile() && this.isSourceFile(item.name)) {
        this.analysis.totalFiles++;
        this.categorizeFile(itemRelativePath);
      }
    }
  }

  isSourceFile(filename) {
    const ext = path.extname(filename);
    return ['.ts', '.tsx', '.js', '.jsx'].includes(ext);
  }

  categorizeFile(filePath) {
    const layer = this.determineLayer(filePath);
    if (!this.analysis.layerDistribution[layer]) {
      this.analysis.layerDistribution[layer] = [];
    }
    this.analysis.layerDistribution[layer].push(filePath);
  }

  determineLayer(filePath) {
    const pathParts = filePath.split('/');
    
    // Check for explicit layer indicators
    for (const [layer, patterns] of Object.entries(LAYER_PATTERNS)) {
      for (const pattern of patterns) {
        if (pathParts.some(part => part.includes(pattern))) {
          return layer;
        }
      }
    }
    
    // Check for problematic patterns
    for (const pattern of PROBLEMATIC_PATTERNS) {
      if (filePath.includes(pattern)) {
        return 'MIXED';
      }
    }
    
    return 'UNKNOWN';
  }

  analyzeLayerDistribution() {
    console.log('📊 Layer Distribution:');
    for (const [layer, files] of Object.entries(this.analysis.layerDistribution)) {
      console.log(`  ${layer}: ${files.length} files`);
    }
    console.log('');
  }

  identifyProblematicFiles() {
    for (const [layer, files] of Object.entries(this.analysis.layerDistribution)) {
      if (layer === 'MIXED' || layer === 'UNKNOWN') {
        this.analysis.problematicFiles.push(...files);
      }
    }
  }

  generateRecommendations() {
    // Core layer recommendations
    if (!this.analysis.layerDistribution[LAYERS.CORE] || 
        this.analysis.layerDistribution[LAYERS.CORE].length === 0) {
      this.analysis.recommendations.push({
        priority: 'HIGH',
        category: 'CORE_LAYER',
        message: 'Create core layer with domain entities and business logic',
        files: []
      });
    }

    // Infrastructure layer recommendations
    if (!this.analysis.layerDistribution[LAYERS.INFRASTRUCTURE] || 
        this.analysis.layerDistribution[LAYERS.INFRASTRUCTURE].length === 0) {
      this.analysis.recommendations.push({
        priority: 'HIGH',
        category: 'INFRASTRUCTURE_LAYER',
        message: 'Create infrastructure layer for external dependencies',
        files: []
      });
    }

    // Mixed layer files
    if (this.analysis.problematicFiles.length > 0) {
      this.analysis.recommendations.push({
        priority: 'MEDIUM',
        category: 'MIXED_LAYERS',
        message: 'Migrate mixed layer files to appropriate clean architecture layers',
        files: this.analysis.problematicFiles.slice(0, 10) // Show first 10
      });
    }

    // Import path recommendations
    this.analysis.recommendations.push({
      priority: 'MEDIUM',
      category: 'IMPORT_PATHS',
      message: 'Update import paths to use clean architecture aliases',
      files: []
    });
  }

  printReport() {
    console.log('📋 Architecture Analysis Report\n');
    console.log(`Total Files Analyzed: ${this.analysis.totalFiles}\n`);
    
    console.log('🎯 Recommendations:');
    this.analysis.recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. [${rec.priority}] ${rec.category}`);
      console.log(`   ${rec.message}`);
      if (rec.files.length > 0) {
        console.log('   Affected files:');
        rec.files.forEach(file => console.log(`     - ${file}`));
      }
    });

    console.log('\n📁 Current Layer Structure:');
    for (const [layer, files] of Object.entries(this.analysis.layerDistribution)) {
      if (files.length > 0) {
        console.log(`\n${layer.toUpperCase()}:`);
        files.slice(0, 5).forEach(file => console.log(`  - ${file}`));
        if (files.length > 5) {
          console.log(`  ... and ${files.length - 5} more files`);
        }
      }
    }

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'architecture-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.analysis, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new ArchitectureAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = ArchitectureAnalyzer;
