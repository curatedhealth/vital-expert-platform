import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir, access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config, dryRun = false, embeddingModel } = body;

    console.log('📥 Pipeline execution request received:', {
      sourcesCount: config?.sources?.length || 0,
      dryRun,
      embeddingModel: embeddingModel || 'default',
    });

    if (!config || !config.sources || config.sources.length === 0) {
      console.error('❌ Invalid configuration: no sources provided');
      return NextResponse.json(
        { error: 'Invalid configuration: sources array is required' },
        { status: 400 }
      );
    }

    // Create temp directory for config
    const tempDir = path.join(process.cwd(), 'temp');
    console.log('📁 Creating temp directory:', tempDir);
    await mkdir(tempDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const configFilename = `pipeline-config-${timestamp}.json`;
    const configPath = path.join(tempDir, configFilename);

    // Write config to file
    console.log('💾 Writing config to:', configPath);
    await writeFile(configPath, JSON.stringify(config, null, 2));

    // Build command - Navigate up from apps/digital-health-startup to project root
    const projectRoot = path.join(process.cwd(), '..', '..');
    const scriptsDir = path.join(projectRoot, 'scripts');
    const pythonScript = path.join(scriptsDir, 'knowledge-pipeline.py');
    
    console.log('🔍 Project root:', projectRoot);
    console.log('🔍 Scripts directory:', scriptsDir);
    console.log('🔍 Python script path:', pythonScript);
    
    // Verify script exists
    try {
      await access(pythonScript, constants.R_OK);
      console.log('✅ Python script found and readable');
    } catch (error) {
      console.error('❌ Python script not found or not readable:', pythonScript);
      return NextResponse.json(
        {
          error: 'Pipeline script not found',
          details: `Cannot find or read: ${pythonScript}`,
          expectedPath: pythonScript,
          cwd: process.cwd(),
          projectRoot: projectRoot,
        },
        { status: 500 }
      );
    }
    
    let command = `python3 "${pythonScript}" --config "${configPath}"`;
    
    if (dryRun) {
      command += ' --dry-run';
    }
    
    if (embeddingModel) {
      command += ` --embedding-model "${embeddingModel}"`;
    }

    console.log('🚀 Executing command:', command);

    // Prepare environment variables for Python script
    const pythonEnv = {
      ...process.env,
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      PINECONE_API_KEY: process.env.PINECONE_API_KEY || '',
      PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT || '',
    };

    console.log('🔐 Environment variables set:', {
      SUPABASE_URL: pythonEnv.SUPABASE_URL ? '✅ Set' : '❌ Missing',
      SUPABASE_SERVICE_ROLE_KEY: pythonEnv.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
      PINECONE_API_KEY: pythonEnv.PINECONE_API_KEY ? '✅ Set (optional)' : '⚠️ Not set (optional)',
    });

    // Execute pipeline (with timeout)
    const { stdout, stderr } = await execAsync(command, {
      timeout: 600000, // 10 minutes
      maxBuffer: 10 * 1024 * 1024, // 10MB
      cwd: scriptsDir, // Run from scripts directory
      env: pythonEnv, // Pass environment variables
    });

    console.log('✅ Pipeline execution completed');
    if (stderr) {
      console.warn('⚠️ Pipeline stderr:', stderr);
    }

    // Parse output for statistics
    const stats = {
      success: true,
      output: stdout,
      errors: stderr || null,
      timestamp: new Date().toISOString(),
      configFile: configFilename,
      sourcesProcessed: config.sources.length,
      dryRun,
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('❌ Pipeline execution error:', {
      message: error.message,
      code: error.code,
      killed: error.killed,
      signal: error.signal,
      stderr: error.stderr,
      stdout: error.stdout,
    });

    // Check if it's a timeout
    if (error.killed && error.signal === 'SIGTERM') {
      return NextResponse.json(
        {
          error: 'Pipeline execution timeout (10 minutes)',
          details: 'The pipeline took too long to execute. Try reducing the number of sources or increasing the timeout.',
        },
        { status: 408 }
      );
    }

    // Return detailed error information
    return NextResponse.json(
      {
        error: 'Pipeline execution failed',
        details: error.message,
        stderr: error.stderr || null,
        stdout: error.stdout || null,
        code: error.code,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check pipeline status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkPython = searchParams.get('check') === 'python';

    if (checkPython) {
      // Check if Python and dependencies are available
      try {
        const { stdout } = await execAsync('python3 --version');
        const pythonVersion = stdout.trim();

        // Check if required modules are installed
        const { stdout: modules } = await execAsync(
          'python3 -c "import aiohttp, bs4, supabase; print(\'OK\')"'
        );

        return NextResponse.json({
          available: true,
          pythonVersion,
          dependencies: modules.trim() === 'OK' ? 'installed' : 'missing',
        });
      } catch (error: any) {
        return NextResponse.json({
          available: false,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      status: 'API ready',
      endpoints: {
        POST: 'Execute pipeline with config',
        'GET?check=python': 'Check Python availability',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

