const { createClient } = require('@supabase/supabase-js');

// Use the production Supabase instance
const supabaseUrl = 'https://xazinxsiglqokwfmogyk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.YourServiceRoleKeyHere';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🚀 Applying workflow admin migration...');
    
    // Create workflow_configurations table
    console.log('📝 Creating workflow_configurations table...');
    const { error: configError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS workflow_configurations (
          id TEXT PRIMARY KEY DEFAULT 'main',
          configuration JSONB NOT NULL,
          is_active BOOLEAN DEFAULT true,
          version TEXT DEFAULT '1.0.0',
          deployment_id TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (configError) {
      console.log('ℹ️ workflow_configurations table may already exist:', configError.message);
    } else {
      console.log('✅ workflow_configurations table created');
    }
    
    // Create workflow_deployments table
    console.log('📝 Creating workflow_deployments table...');
    const { error: deployError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS workflow_deployments (
          id TEXT PRIMARY KEY,
          workflow_id TEXT NOT NULL,
          configuration JSONB NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('deploying', 'deployed', 'failed', 'rolled_back')),
          deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          version TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (deployError) {
      console.log('ℹ️ workflow_deployments table may already exist:', deployError.message);
    } else {
      console.log('✅ workflow_deployments table created');
    }
    
    // Create workflow_executions table
    console.log('📝 Creating workflow_executions table...');
    const { error: execError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS workflow_executions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          workflow_id TEXT NOT NULL DEFAULT 'main',
          status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'paused', 'cancelled')),
          current_node TEXT,
          start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          end_time TIMESTAMP WITH TIME ZONE,
          duration INTEGER,
          error TEXT,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (execError) {
      console.log('ℹ️ workflow_executions table may already exist:', execError.message);
    } else {
      console.log('✅ workflow_executions table created');
    }
    
    // Create workflow_logs table
    console.log('📝 Creating workflow_logs table...');
    const { error: logsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS workflow_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          execution_id UUID REFERENCES workflow_executions(id) ON DELETE CASCADE,
          deployment_id TEXT REFERENCES workflow_deployments(id) ON DELETE CASCADE,
          level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
          message TEXT NOT NULL,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (logsError) {
      console.log('ℹ️ workflow_logs table may already exist:', logsError.message);
    } else {
      console.log('✅ workflow_logs table created');
    }
    
    // Create workflow_node_performance table
    console.log('📝 Creating workflow_node_performance table...');
    const { error: perfError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS workflow_node_performance (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          node_id TEXT NOT NULL,
          workflow_id TEXT NOT NULL DEFAULT 'main',
          execution_count INTEGER DEFAULT 0,
          total_latency INTEGER DEFAULT 0,
          error_count INTEGER DEFAULT 0,
          last_executed TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (perfError) {
      console.log('ℹ️ workflow_node_performance table may already exist:', perfError.message);
    } else {
      console.log('✅ workflow_node_performance table created');
    }
    
    // Insert default workflow configuration
    console.log('📝 Inserting default workflow configuration...');
    const defaultWorkflow = {
      nodes: [
        {
          id: 'start',
          name: 'Start',
          type: 'start',
          position: { x: 50, y: 50 },
          config: {},
          status: 'active',
          executionCount: 0,
          averageLatency: 0
        },
        {
          id: 'routeByMode',
          name: 'Route by Mode',
          type: 'decision',
          position: { x: 200, y: 50 },
          config: {
            condition: 'interactionMode',
            options: ['manual', 'automatic']
          },
          status: 'active',
          executionCount: 0,
          averageLatency: 0
        },
        {
          id: 'suggestAgents',
          name: 'Suggest Agents',
          type: 'process',
          position: { x: 350, y: 50 },
          config: {
            maxSuggestions: 3,
            useRanking: true
          },
          status: 'active',
          executionCount: 0,
          averageLatency: 0
        },
        {
          id: 'suggestTools',
          name: 'Suggest Tools',
          type: 'process',
          position: { x: 350, y: 150 },
          config: {
            availableTools: ['web_search', 'pubmed_search', 'knowledge_base', 'calculator', 'fda_database']
          },
          status: 'active',
          executionCount: 0,
          averageLatency: 0
        },
        {
          id: 'selectAgentAutomatic',
          name: 'Select Agent (Auto)',
          type: 'process',
          position: { x: 500, y: 100 },
          config: {
            useOrchestrator: true
          },
          status: 'active',
          executionCount: 0,
          averageLatency: 0
        },
        {
          id: 'retrieveContext',
          name: 'Retrieve Context',
          type: 'process',
          position: { x: 650, y: 100 },
          config: {
            useRAG: true,
            maxDocuments: 5
          },
          status: 'active',
          executionCount: 0,
          averageLatency: 0
        },
        {
          id: 'processWithAgentNormal',
          name: 'Process (Normal)',
          type: 'process',
          position: { x: 800, y: 50 },
          config: {
            useSelectedTools: true
          },
          status: 'active',
          executionCount: 0,
          averageLatency: 0
        },
        {
          id: 'processWithAgentAutonomous',
          name: 'Process (Autonomous)',
          type: 'process',
          position: { x: 800, y: 150 },
          config: {
            useAllTools: true,
            useMemory: true
          },
          status: 'active',
          executionCount: 0,
          averageLatency: 0
        },
        {
          id: 'synthesizeResponse',
          name: 'Synthesize Response',
          type: 'process',
          position: { x: 950, y: 100 },
          config: {
            includeCitations: true,
            includeMetadata: true
          },
          status: 'active',
          executionCount: 0,
          averageLatency: 0
        },
        {
          id: 'end',
          name: 'End',
          type: 'end',
          position: { x: 1100, y: 100 },
          config: {},
          status: 'active',
          executionCount: 0,
          averageLatency: 0
        }
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'routeByMode', status: 'active' },
        { id: 'e2', source: 'routeByMode', target: 'suggestAgents', condition: 'manual', status: 'active' },
        { id: 'e3', source: 'routeByMode', target: 'suggestTools', condition: 'automatic', status: 'active' },
        { id: 'e4', source: 'suggestAgents', target: 'suggestTools', status: 'active' },
        { id: 'e5', source: 'suggestTools', target: 'selectAgentAutomatic', status: 'active' },
        { id: 'e6', source: 'selectAgentAutomatic', target: 'retrieveContext', status: 'active' },
        { id: 'e7', source: 'retrieveContext', target: 'processWithAgentNormal', condition: 'normal', status: 'active' },
        { id: 'e8', source: 'retrieveContext', target: 'processWithAgentAutonomous', condition: 'autonomous', status: 'active' },
        { id: 'e9', source: 'processWithAgentNormal', target: 'synthesizeResponse', status: 'active' },
        { id: 'e10', source: 'processWithAgentAutonomous', target: 'synthesizeResponse', status: 'active' },
        { id: 'e11', source: 'synthesizeResponse', target: 'end', status: 'active' }
      ],
      metadata: {
        name: 'Mode-Aware Multi-Agent Workflow',
        description: 'LangGraph workflow supporting all 4 mode combinations',
        version: '2.0.0',
        lastModified: new Date().toISOString(),
        status: 'active'
      }
    };
    
    const { error: insertError } = await supabase
      .from('workflow_configurations')
      .upsert({
        id: 'main',
        configuration: defaultWorkflow,
        is_active: true,
        version: '2.0.0'
      });
    
    if (insertError) {
      console.log('ℹ️ Default workflow configuration may already exist:', insertError.message);
    } else {
      console.log('✅ Default workflow configuration inserted');
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
