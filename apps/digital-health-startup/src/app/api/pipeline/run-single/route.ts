import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// Increase timeout for long-running pipeline operations
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source, dryRun = false, embeddingModel, domainIds = [] } = body;

    console.log('📥 Single source execution request:', {
      url: source?.url,
      dryRun,
      embeddingModel: embeddingModel || 'default',
      domainIds: domainIds.length > 0 ? domainIds : 'none',
    });

    if (!source || !source.url) {
      console.error('❌ Invalid source: no URL provided');
      return NextResponse.json(
        { error: 'Invalid source: URL is required' },
        { status: 400 }
      );
    }

    // Create temp directory for config
    const tempDir = path.join(process.cwd(), 'temp');
    await mkdir(tempDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const configFilename = `pipeline-single-${timestamp}.json`;
    const configPath = path.join(tempDir, configFilename);

    // Create single-source config
    const config = {
      sources: [{
        ...source,
        domain_ids: domainIds, // Add selected domains to the source
      }],
      scraping_settings: {
        timeout: 60,
        max_retries: 3,
        delay_between_requests: 1,
        wait_for_js: source.wait_for_js || false,
        use_playwright: source.use_playwright || false,
      },
      processing_settings: {
        chunk_size: 1000,
        chunk_overlap: 200,
        min_word_count: 100,
        max_content_length: 1000000,
      },
      upload_settings: {
        enable_supabase: !dryRun,
        enable_pinecone: !dryRun,
        batch_size: 100,
        skip_duplicates: true,
      },
      output_settings: {
        create_subdirectories: true,
        include_metadata: true,
        markdown_format: true,
      },
      embedding_model: embeddingModel || 'sentence-transformers/all-MiniLM-L6-v2',
    };

    // Write config to file
    console.log('💾 Writing single source config to:', configPath);
    await writeFile(configPath, JSON.stringify(config, null, 2));

    // Build command
    const projectRoot = path.join(process.cwd(), '..', '..');
    const scriptsDir = path.join(projectRoot, 'scripts');
    const pythonScript = path.join(scriptsDir, 'knowledge-pipeline.py');

    let command = `python3 "${pythonScript}" --config "${configPath}"`;

    if (dryRun) {
      command += ' --dry-run';
    }

    if (embeddingModel) {
      command += ` --embedding-model "${embeddingModel}"`;
    }

    console.log('🚀 Executing single source command:', command);

    // Prepare environment variables
    const pythonEnv = {
      ...process.env,
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      PINECONE_API_KEY: process.env.PINECONE_API_KEY || '',
      PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT || '',
    };

    console.log('🔐 Environment variables:', {
      SUPABASE_URL: pythonEnv.SUPABASE_URL ? `✅ Set (${pythonEnv.SUPABASE_URL.substring(0, 20)}...)` : '❌ Missing',
      SUPABASE_SERVICE_ROLE_KEY: pythonEnv.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
      PINECONE_API_KEY: pythonEnv.PINECONE_API_KEY ? '✅ Set' : '❌ Missing',
    });

    // Early validation - return error immediately if env vars are missing
    if (!pythonEnv.SUPABASE_URL || !pythonEnv.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Critical: Environment variables missing!');
      console.error('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
      console.error('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
      
      return NextResponse.json({
        success: false,
        error: 'Environment variables not configured',
        details: 'Missing required environment variables. Please check your .env.local file and restart the server.',
        stdout: '',
        stderr: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in environment',
        missing_vars: [
          !pythonEnv.SUPABASE_URL ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
          !pythonEnv.SUPABASE_SERVICE_ROLE_KEY ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
        ].filter(Boolean),
      });
    }

    // Execute pipeline (with timeout)
    const startTime = Date.now();
    const { stdout, stderr } = await execAsync(command, {
      timeout: 300000, // 5 minutes per source (increased from 2)
      maxBuffer: 10 * 1024 * 1024,
      cwd: scriptsDir,
      env: pythonEnv,
    });
    const duration = Date.now() - startTime;

    console.log('✅ Single source execution completed');

    // Parse output for word count
    const wordCountMatch = stdout.match(/Total Words:\s*(\d+)/);
    const wordCount = wordCountMatch ? parseInt(wordCountMatch[1], 10) : 0;

    // Extract error details from output
    let errorDetails = null;
    
    // Check for missing environment variables error
    if (stdout.includes('Missing required environment variables') || stderr.includes('Missing required environment variables')) {
      const envErrorMatch = (stdout + stderr).match(/Missing required environment variables: (.+)/);
      if (envErrorMatch) {
        errorDetails = `Missing environment variables: ${envErrorMatch[1]}. Check your .env.local file.`;
      }
    }
    
    // Check for scraping errors
    if (!errorDetails) {
      const errorMatch = stdout.match(/❌ Error scraping[^:]*: (.+)/);
      if (errorMatch) {
        errorDetails = errorMatch[1].trim();
      } else if (stderr) {
        errorDetails = stderr.split('\n').find(line => line.includes('Error') || line.includes('❌')) || stderr.substring(0, 200);
      }
    }
    
    // If still no error details, check for any ERROR log lines
    if (!errorDetails && (stdout.includes('ERROR') || stderr.includes('ERROR'))) {
      const errorLines = (stdout + '\n' + stderr).split('\n').filter(line => line.includes('ERROR'));
      if (errorLines.length > 0) {
        errorDetails = errorLines.join('\n');
      }
    }

    // Check for success
    const isSuccess = !stderr.includes('Error') && !stdout.includes('❌') && !stdout.includes('Failed') && wordCount > 0;

    const result = {
      success: isSuccess,
      url: source.url,
      wordCount,
      duration,
      output: stdout,
      errors: errorDetails || stderr || null,
      stdout: stdout.substring(0, 5000), // Include first 5000 chars for debugging
      stderr: stderr ? stderr.substring(0, 5000) : null,
      timestamp: new Date().toISOString(),
      configFile: configFilename,
      dryRun,
    };

    console.log('✅ Single source result:', {
      success: isSuccess,
      wordCount,
      errorDetails: errorDetails || 'none',
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('❌ Single source execution error:', {
      message: error.message,
      code: error.code,
      killed: error.killed,
      signal: error.signal,
    });

    // Check if it's a timeout
    if (error.killed && error.signal === 'SIGTERM') {
      return NextResponse.json(
        {
          success: false,
          error: 'Source execution timeout (5 minutes)',
          details: 'This source took too long to process. Try again or check the URL.',
        },
        { status: 408 }
      );
    }

    // Return detailed error information
    return NextResponse.json(
      {
        success: false,
        error: 'Source execution failed',
        details: error.message,
        stderr: error.stderr || null,
        stdout: error.stdout || null,
      },
      { status: 500 }
    );
  }
}

