import { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';

export class CodeAnalysisTools {
  private projectRoot: string;
  private codeCache: Map<string, any> = new Map();

  constructor() {
    this.projectRoot = process.cwd();
  }

  async initialize(): Promise<void> {
    await this.loadCodeStructure();
  }

  getTools(): Tool[] {
    return [
      {
        name: 'code_analyze_file',
        description: 'Analyze a specific code file for complexity, dependencies, and patterns',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the file to analyze',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'code_find_dependencies',
        description: 'Find dependencies and imports for a file or module',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the file to analyze',
            },
            includeTransitive: {
              type: 'boolean',
              description: 'Include transitive dependencies',
              default: false,
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'code_search_patterns',
        description: 'Search for specific code patterns or anti-patterns',
        inputSchema: {
          type: 'object',
          properties: {
            pattern: {
              type: 'string',
              description: 'Pattern to search for (regex supported)',
            },
            filePattern: {
              type: 'string',
              description: 'File pattern to search in',
              default: '**/*.{ts,tsx,js,jsx,py}',
            },
            caseSensitive: {
              type: 'boolean',
              description: 'Case sensitive search',
              default: false,
            },
          },
          required: ['pattern'],
        },
      },
      {
        name: 'code_get_function_info',
        description: 'Get information about functions in a file',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the file to analyze',
            },
            functionName: {
              type: 'string',
              description: 'Specific function name (optional)',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'code_analyze_complexity',
        description: 'Analyze code complexity metrics',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the file to analyze',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'code_find_duplicates',
        description: 'Find duplicate code patterns',
        inputSchema: {
          type: 'object',
          properties: {
            minLines: {
              type: 'number',
              description: 'Minimum lines for duplicate detection',
              default: 5,
            },
            filePattern: {
              type: 'string',
              description: 'File pattern to search in',
              default: '**/*.{ts,tsx,js,jsx}',
            },
          },
        },
      },
      {
        name: 'code_get_architecture_overview',
        description: 'Get high-level architecture overview of the codebase',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'code_analyze_file':
        return await this.analyzeFile(args.filePath);
      case 'code_find_dependencies':
        return await this.findDependencies(args.filePath, args.includeTransitive);
      case 'code_search_patterns':
        return await this.searchPatterns(args.pattern, args.filePattern, args.caseSensitive);
      case 'code_get_function_info':
        return await this.getFunctionInfo(args.filePath, args.functionName);
      case 'code_analyze_complexity':
        return await this.analyzeComplexity(args.filePath);
      case 'code_find_duplicates':
        return await this.findDuplicates(args.minLines, args.filePattern);
      case 'code_get_architecture_overview':
        return await this.getArchitectureOverview();
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async loadCodeStructure(): Promise<void> {
    // This is a placeholder for more sophisticated code analysis
    // In a real implementation, you'd use tools like TypeScript compiler API,
    // AST parsers, or static analysis tools
  }

  private async analyzeFile(filePath: string): Promise<any> {
    const fullPath = path.join(this.projectRoot, filePath);
    
    if (!await fs.pathExists(fullPath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = await fs.readFile(fullPath, 'utf8');
    const stats = await fs.stat(fullPath);
    
    const analysis = {
      filePath,
      size: stats.size,
      lines: content.split('\n').length,
      characters: content.length,
      language: this.detectLanguage(filePath),
      functions: this.extractFunctions(content),
      classes: this.extractClasses(content),
      imports: this.extractImports(content),
      exports: this.extractExports(content),
      complexity: this.calculateComplexity(content),
      patterns: this.detectPatterns(content),
    };

    return analysis;
  }

  private detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap: { [key: string]: string } = {
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.py': 'python',
      '.md': 'markdown',
      '.json': 'json',
      '.sql': 'sql',
      '.css': 'css',
      '.scss': 'scss',
      '.html': 'html',
    };
    return languageMap[ext] || 'unknown';
  }

  private extractFunctions(content: string): any[] {
    const functions = [];
    
    // TypeScript/JavaScript functions
    const functionPatterns = [
      /function\s+(\w+)\s*\([^)]*\)\s*\{/g,
      /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*\{/g,
      /(\w+)\s*\([^)]*\)\s*\{/g,
      /async\s+function\s+(\w+)\s*\([^)]*\)\s*\{/g,
    ];

    for (const pattern of functionPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        functions.push({
          name: match[1],
          type: 'function',
          line: content.substring(0, match.index).split('\n').length,
        });
      }
    }

    return functions;
  }

  private extractClasses(content: string): any[] {
    const classes = [];
    
    // TypeScript/JavaScript classes
    const classPattern = /class\s+(\w+)/g;
    const matches = content.matchAll(classPattern);
    
    for (const match of matches) {
      classes.push({
        name: match[1],
        type: 'class',
        line: content.substring(0, match.index).split('\n').length,
      });
    }

    return classes;
  }

  private extractImports(content: string): any[] {
    const imports = [];
    
    // ES6 imports
    const importPattern = /import\s+(?:{[^}]+}|\w+|\*\s+as\s+\w+)\s+from\s+['"]([^'"]+)['"]/g;
    const matches = content.matchAll(importPattern);
    
    for (const match of matches) {
      imports.push({
        module: match[1],
        type: 'es6',
        line: content.substring(0, match.index).split('\n').length,
      });
    }

    // CommonJS requires
    const requirePattern = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    const requireMatches = content.matchAll(requirePattern);
    
    for (const match of requireMatches) {
      imports.push({
        module: match[1],
        type: 'commonjs',
        line: content.substring(0, match.index).split('\n').length,
      });
    }

    return imports;
  }

  private extractExports(content: string): any[] {
    const exports = [];
    
    // ES6 exports
    const exportPatterns = [
      /export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)/g,
      /export\s*\{\s*([^}]+)\s*\}/g,
    ];

    for (const pattern of exportPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        exports.push({
          name: match[1],
          type: 'es6',
          line: content.substring(0, match.index).split('\n').length,
        });
      }
    }

    return exports;
  }

  private calculateComplexity(content: string): any {
    const lines = content.split('\n');
    let cyclomaticComplexity = 1; // Base complexity
    let nestingLevel = 0;
    let maxNesting = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Count decision points
      if (trimmed.includes('if') || trimmed.includes('else') || 
          trimmed.includes('switch') || trimmed.includes('case') ||
          trimmed.includes('catch') || trimmed.includes('while') ||
          trimmed.includes('for') || trimmed.includes('&&') ||
          trimmed.includes('||') || trimmed.includes('?')) {
        cyclomaticComplexity++;
      }

      // Track nesting
      if (trimmed.includes('{')) {
        nestingLevel++;
        maxNesting = Math.max(maxNesting, nestingLevel);
      }
      if (trimmed.includes('}')) {
        nestingLevel--;
      }
    }

    return {
      cyclomaticComplexity,
      maxNesting,
      linesOfCode: lines.filter(line => line.trim().length > 0).length,
      commentLines: lines.filter(line => line.trim().startsWith('//') || line.trim().startsWith('/*')).length,
    };
  }

  private detectPatterns(content: string): string[] {
    const patterns = [];
    
    // Common patterns
    if (content.includes('useState') || content.includes('useEffect')) {
      patterns.push('React Hooks');
    }
    
    if (content.includes('async') && content.includes('await')) {
      patterns.push('Async/Await');
    }
    
    if (content.includes('Promise')) {
      patterns.push('Promises');
    }
    
    if (content.includes('try') && content.includes('catch')) {
      patterns.push('Error Handling');
    }
    
    if (content.includes('class') && content.includes('extends')) {
      patterns.push('Inheritance');
    }
    
    if (content.includes('interface') || content.includes('type')) {
      patterns.push('TypeScript Types');
    }

    return patterns;
  }

  private async findDependencies(filePath: string, includeTransitive: boolean = false): Promise<any> {
    const analysis = await this.analyzeFile(filePath);
    const dependencies = analysis.imports.map((imp: any) => imp.module);
    
    if (includeTransitive) {
      // In a real implementation, you'd recursively analyze imported files
      // For now, just return direct dependencies
    }

    return {
      filePath,
      dependencies,
      count: dependencies.length,
      includeTransitive,
    };
  }

  private async searchPatterns(pattern: string, filePattern: string, caseSensitive: boolean): Promise<any> {
    const files = await glob(filePattern, { 
      cwd: this.projectRoot,
      nodir: true,
      ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
    });

    const results = [];
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(pattern, flags);

    for (const file of files) {
      try {
        const content = await fs.readFile(path.join(this.projectRoot, file), 'utf8');
        const matches = [...content.matchAll(regex)];
        
        if (matches.length > 0) {
          results.push({
            file,
            matches: matches.map(match => ({
              text: match[0],
              index: match.index,
              line: content.substring(0, match.index).split('\n').length,
              context: this.getContext(content, match.index, 100),
            })),
            matchCount: matches.length,
          });
        }
      } catch (error) {
        continue;
      }
    }

    return {
      pattern,
      filePattern,
      results,
      totalMatches: results.reduce((sum, result) => sum + result.matchCount, 0),
      filesSearched: files.length,
    };
  }

  private getContext(content: string, index: number, contextLength: number): string {
    const start = Math.max(0, index - contextLength);
    const end = Math.min(content.length, index + contextLength);
    return content.substring(start, end);
  }

  private async getFunctionInfo(filePath: string, functionName?: string): Promise<any> {
    const analysis = await this.analyzeFile(filePath);
    let functions = analysis.functions;

    if (functionName) {
      functions = functions.filter((fn: any) => fn.name === functionName);
    }

    return {
      filePath,
      functions: functions.map((fn: any) => ({
        name: fn.name,
        line: fn.line,
        type: fn.type,
      })),
      count: functions.length,
      filter: functionName || 'all',
    };
  }

  private async analyzeComplexity(filePath: string): Promise<any> {
    const analysis = await this.analyzeFile(filePath);
    
    return {
      filePath,
      complexity: analysis.complexity,
      recommendations: this.getComplexityRecommendations(analysis.complexity),
    };
  }

  private getComplexityRecommendations(complexity: any): string[] {
    const recommendations = [];
    
    if (complexity.cyclomaticComplexity > 10) {
      recommendations.push('Consider breaking down complex functions into smaller ones');
    }
    
    if (complexity.maxNesting > 4) {
      recommendations.push('Reduce nesting levels for better readability');
    }
    
    if (complexity.linesOfCode > 200) {
      recommendations.push('Consider splitting large files into smaller modules');
    }
    
    if (complexity.commentLines / complexity.linesOfCode < 0.1) {
      recommendations.push('Add more comments to improve code documentation');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Code complexity is well-balanced');
    }
    
    return recommendations;
  }

  private async findDuplicates(minLines: number, filePattern: string): Promise<any> {
    // This is a simplified duplicate detection
    // In a real implementation, you'd use more sophisticated algorithms
    const files = await glob(filePattern, { 
      cwd: this.projectRoot,
      nodir: true,
      ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
    });

    const codeBlocks = new Map();
    const duplicates = [];

    for (const file of files) {
      try {
        const content = await fs.readFile(path.join(this.projectRoot, file), 'utf8');
        const lines = content.split('\n');
        
        // Simple sliding window approach
        for (let i = 0; i <= lines.length - minLines; i++) {
          const block = lines.slice(i, i + minLines).join('\n');
          const hash = this.simpleHash(block);
          
          if (codeBlocks.has(hash)) {
            duplicates.push({
              hash,
              files: [codeBlocks.get(hash), file],
              lines: i + 1,
              content: block.substring(0, 200) + '...',
            });
          } else {
            codeBlocks.set(hash, file);
          }
        }
      } catch (error) {
        continue;
      }
    }

    return {
      duplicates,
      count: duplicates.length,
      minLines,
      filesSearched: files.length,
    };
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private async getArchitectureOverview(): Promise<any> {
    const patterns = [
      'src/**/*.ts',
      'src/**/*.tsx',
      'src/**/*.js',
      'src/**/*.jsx',
      'backend/**/*.py',
    ];

    const architecture = {
      frontend: { files: 0, lines: 0, components: 0, pages: 0 },
      backend: { files: 0, lines: 0, services: 0, routes: 0 },
      shared: { files: 0, lines: 0, utilities: 0 },
    };

    for (const pattern of patterns) {
      const files = await glob(pattern, { 
        cwd: this.projectRoot,
        nodir: true,
        ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
      });

      for (const file of files) {
        try {
          const content = await fs.readFile(path.join(this.projectRoot, file), 'utf8');
          const lines = content.split('\n').length;
          
          if (file.includes('src/') && !file.includes('backend/')) {
            architecture.frontend.files++;
            architecture.frontend.lines += lines;
            
            if (file.includes('components/')) architecture.frontend.components++;
            if (file.includes('pages/') || file.includes('app/')) architecture.frontend.pages++;
          } else if (file.includes('backend/')) {
            architecture.backend.files++;
            architecture.backend.lines += lines;
            
            if (file.includes('services/')) architecture.backend.services++;
            if (file.includes('routes/') || file.includes('api/')) architecture.backend.routes++;
          } else {
            architecture.shared.files++;
            architecture.shared.lines += lines;
            
            if (file.includes('utils/') || file.includes('lib/')) architecture.shared.utilities++;
          }
        } catch (error) {
          continue;
        }
      }
    }

    return {
      architecture,
      summary: {
        totalFiles: architecture.frontend.files + architecture.backend.files + architecture.shared.files,
        totalLines: architecture.frontend.lines + architecture.backend.lines + architecture.shared.lines,
        frontendRatio: architecture.frontend.files / (architecture.frontend.files + architecture.backend.files),
      },
    };
  }
}
