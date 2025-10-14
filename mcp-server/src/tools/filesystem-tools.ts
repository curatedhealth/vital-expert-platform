import { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';

export class FileSystemTools {
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  async initialize(): Promise<void> {
    // Ensure we're in the right directory
    if (!await fs.pathExists(path.join(this.projectRoot, 'package.json'))) {
      throw new Error('Not in VITAL platform root directory');
    }
  }

  getTools(): Tool[] {
    return [
      {
        name: 'filesystem_list_directory',
        description: 'List files and directories in a given path',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Directory path to list (relative to project root)',
            },
            includeHidden: {
              type: 'boolean',
              description: 'Include hidden files and directories',
              default: false,
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'filesystem_read_file',
        description: 'Read the contents of a file',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'File path to read (relative to project root)',
            },
            encoding: {
              type: 'string',
              description: 'File encoding',
              default: 'utf8',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'filesystem_find_files',
        description: 'Find files matching a glob pattern',
        inputSchema: {
          type: 'object',
          properties: {
            pattern: {
              type: 'string',
              description: 'Glob pattern to match files',
            },
            directory: {
              type: 'string',
              description: 'Directory to search in (relative to project root)',
              default: '.',
            },
          },
          required: ['pattern'],
        },
      },
      {
        name: 'filesystem_get_file_info',
        description: 'Get detailed information about a file or directory',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'File or directory path (relative to project root)',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'filesystem_search_content',
        description: 'Search for content within files',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query (regex supported)',
            },
            pattern: {
              type: 'string',
              description: 'File pattern to search in',
              default: '**/*.{ts,tsx,js,jsx,py,md,json}',
            },
            caseSensitive: {
              type: 'boolean',
              description: 'Case sensitive search',
              default: false,
            },
          },
          required: ['query'],
        },
      },
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'filesystem_list_directory':
        return await this.listDirectory(args.path, args.includeHidden);
      case 'filesystem_read_file':
        return await this.readFile(args.path, args.encoding);
      case 'filesystem_find_files':
        return await this.findFiles(args.pattern, args.directory);
      case 'filesystem_get_file_info':
        return await this.getFileInfo(args.path);
      case 'filesystem_search_content':
        return await this.searchContent(args.query, args.pattern, args.caseSensitive);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async listDirectory(dirPath: string, includeHidden: boolean = false): Promise<any> {
    const fullPath = path.join(this.projectRoot, dirPath);
    
    if (!await fs.pathExists(fullPath)) {
      throw new Error(`Directory not found: ${dirPath}`);
    }

    const stats = await fs.stat(fullPath);
    if (!stats.isDirectory()) {
      throw new Error(`Path is not a directory: ${dirPath}`);
    }

    const items = await fs.readdir(fullPath);
    const result = [];

    for (const item of items) {
      if (!includeHidden && item.startsWith('.')) {
        continue;
      }

      const itemPath = path.join(fullPath, item);
      const itemStats = await fs.stat(itemPath);
      
      result.push({
        name: item,
        path: path.relative(this.projectRoot, itemPath),
        type: itemStats.isDirectory() ? 'directory' : 'file',
        size: itemStats.size,
        modified: itemStats.mtime,
        created: itemStats.birthtime,
      });
    }

    return {
      path: dirPath,
      items: result.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      }),
    };
  }

  private async readFile(filePath: string, encoding: string = 'utf8'): Promise<any> {
    const fullPath = path.join(this.projectRoot, filePath);
    
    if (!await fs.pathExists(fullPath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const stats = await fs.stat(fullPath);
    if (stats.isDirectory()) {
      throw new Error(`Path is a directory, not a file: ${filePath}`);
    }

    const content = await fs.readFile(fullPath, { encoding: encoding as BufferEncoding });
    
    return {
      path: filePath,
      content,
      size: stats.size,
      encoding,
      modified: stats.mtime,
      created: stats.birthtime,
    };
  }

  private async findFiles(pattern: string, directory: string = '.'): Promise<any> {
    const searchPath = path.join(this.projectRoot, directory, pattern);
    const files = await glob(searchPath, { 
      cwd: this.projectRoot,
      nodir: true,
    });

    const result = [];
    for (const file of files) {
      const fullPath = path.join(this.projectRoot, file);
      const stats = await fs.stat(fullPath);
      
      result.push({
        path: file,
        size: stats.size,
        modified: stats.mtime,
        created: stats.birthtime,
      });
    }

    return {
      pattern,
      directory,
      files: result,
      count: result.length,
    };
  }

  private async getFileInfo(filePath: string): Promise<any> {
    const fullPath = path.join(this.projectRoot, filePath);
    
    if (!await fs.pathExists(fullPath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const stats = await fs.stat(fullPath);
    
    return {
      path: filePath,
      type: stats.isDirectory() ? 'directory' : 'file',
      size: stats.size,
      modified: stats.mtime,
      created: stats.birthtime,
      permissions: stats.mode,
      isSymbolicLink: stats.isSymbolicLink(),
    };
  }

  private async searchContent(query: string, pattern: string, caseSensitive: boolean): Promise<any> {
    const searchPath = path.join(this.projectRoot, pattern);
    const files = await glob(searchPath, { 
      cwd: this.projectRoot,
      nodir: true,
    });

    const results = [];
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(query, flags);

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
            })),
            matchCount: matches.length,
          });
        }
      } catch (error) {
        // Skip files that can't be read as text
        continue;
      }
    }

    return {
      query,
      pattern,
      results,
      totalMatches: results.reduce((sum, result) => sum + result.matchCount, 0),
      filesSearched: files.length,
    };
  }
}
