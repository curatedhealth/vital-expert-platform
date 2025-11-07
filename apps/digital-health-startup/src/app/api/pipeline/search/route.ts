import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 1 minute timeout for searches

interface SearchRequest {
  query: string;
  sources: string[];
  maxResults?: number;
  sortBy?: 'relevance' | 'date' | 'citations';
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { query, sources, maxResults = 20, sortBy = 'relevance' } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    if (!sources || sources.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one source is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Searching ${sources.join(', ')} for: "${query}"`);

    // Locate Python script
    const projectRoot = path.join(process.cwd(), '..', '..');
    const scriptsDir = path.join(projectRoot, 'scripts');
    const pythonScript = path.join(scriptsDir, 'knowledge_search.py');

    // Build Python command
    const sourcesArg = sources.map((s) => `'${s}'`).join(',');
    const command = `python3 -c "
import asyncio
import sys
sys.path.insert(0, '${scriptsDir}')

from knowledge_search import search_knowledge_sources
import json

async def main():
    results = await search_knowledge_sources(
        query='${query.replace(/'/g, "\\'")}',
        sources=[${sourcesArg}],
        max_results_per_source=${maxResults},
        sort_by='${sortBy}'
    )
    print(json.dumps(results, default=str))

asyncio.run(main())
"`;

    console.log('🚀 Executing search command...');

    // Execute search
    const { stdout, stderr } = await execAsync(command, {
      timeout: 60000, // 1 minute
      maxBuffer: 10 * 1024 * 1024, // 10MB
      cwd: scriptsDir,
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1',
      },
    });

    if (stderr && !stderr.includes('INFO') && !stderr.includes('ℹ️')) {
      console.warn('⚠️ Search stderr:', stderr);
    }

    // Parse results
    let results;
    try {
      results = JSON.parse(stdout);
    } catch (parseError) {
      console.error('❌ Failed to parse search results:', parseError);
      console.error('Raw output:', stdout.substring(0, 500));
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to parse search results',
          details: stdout.substring(0, 200),
        },
        { status: 500 }
      );
    }

    // Count total results
    const totalResults = Object.values(results).reduce(
      (sum: number, items: any) => sum + (Array.isArray(items) ? items.length : 0),
      0
    );

    console.log(`✅ Search complete: ${totalResults} results found`);

    return NextResponse.json({
      success: true,
      query,
      sources,
      results,
      totalResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Search error:', error);

    // Handle timeout
    if (error.code === 'ETIMEDOUT' || error.killed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search timeout (60 seconds)',
          details: 'The search took too long. Try reducing the number of sources or results.',
        },
        { status: 408 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Search failed',
        details: error.stderr || error.stdout || '',
      },
      { status: 500 }
    );
  }
}

