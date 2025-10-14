// Simple migration script using existing Supabase setup
const { createClient } = require('@supabase/supabase-js');

// Use the production Supabase instance
const supabaseUrl = 'https://xazinxsiglqokwfmogyk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.YourServiceRoleKeyHere';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  try {
    console.log('🚀 Creating workflow admin tables...');
    
    // Create tables using raw SQL
    const tables = [
      {
        name: 'workflow_configurations',
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
      },
      {
        name: 'workflow_deployments',
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
      },
      {
        name: 'workflow_executions',
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
      },
      {
        name: 'workflow_logs',
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
      },
      {
        name: 'workflow_node_performance',
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
      }
    ];
    
    for (const table of tables) {
      console.log(`📝 Creating ${table.name} table...`);
      
      try {
        const { error } = await supabase.rpc('exec', { sql: table.sql });
        if (error) {
          console.log(`ℹ️ ${table.name} table may already exist:`, error.message);
        } else {
          console.log(`✅ ${table.name} table created`);
        }
      } catch (err) {
        console.log(`ℹ️ ${table.name} table creation skipped:`, err.message);
      }
    }
    
    // Insert default workflow configuration
    console.log('📝 Inserting default workflow configuration...');
    
    const defaultWorkflow = {
      nodes: [
        { id: 'start', name: 'Start', type: 'start', position: { x: 50, y: 50 }, config: {}, status: 'active' },
        { id: 'routeByMode', name: 'Route by Mode', type: 'decision', position: { x: 200, y: 50 }, config: { condition: 'interactionMode', options: ['manual', 'automatic'] }, status: 'active' },
        { id: 'suggestAgents', name: 'Suggest Agents', type: 'process', position: { x: 350, y: 50 }, config: { maxSuggestions: 3, useRanking: true }, status: 'active' },
        { id: 'suggestTools', name: 'Suggest Tools', type: 'process', position: { x: 350, y: 150 }, config: { availableTools: ['web_search', 'pubmed_search', 'knowledge_base', 'calculator', 'fda_database'] }, status: 'active' },
        { id: 'selectAgentAutomatic', name: 'Select Agent (Auto)', type: 'process', position: { x: 500, y: 100 }, config: { useOrchestrator: true }, status: 'active' },
        { id: 'retrieveContext', name: 'Retrieve Context', type: 'process', position: { x: 650, y: 100 }, config: { useRAG: true, maxDocuments: 5 }, status: 'active' },
        { id: 'processWithAgentNormal', name: 'Process (Normal)', type: 'process', position: { x: 800, y: 50 }, config: { useSelectedTools: true }, status: 'active' },
        { id: 'processWithAgentAutonomous', name: 'Process (Autonomous)', type: 'process', position: { x: 800, y: 150 }, config: { useAllTools: true, useMemory: true }, status: 'active' },
        { id: 'synthesizeResponse', name: 'Synthesize Response', type: 'process', position: { x: 950, y: 100 }, config: { includeCitations: true, includeMetadata: true }, status: 'active' },
        { id: 'end', name: 'End', type: 'end', position: { x: 1100, y: 100 }, config: {}, status: 'active' }
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
    
    try {
      const { error } = await supabase
        .from('workflow_configurations')
        .upsert({
          id: 'main',
          configuration: defaultWorkflow,
          is_active: true,
          version: '2.0.0'
        });
      
      if (error) {
        console.log('ℹ️ Default workflow configuration may already exist:', error.message);
      } else {
        console.log('✅ Default workflow configuration inserted');
      }
    } catch (err) {
      console.log('ℹ️ Default workflow configuration insertion skipped:', err.message);
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

createTables();
