-- Create jobs table for background processing and workflow execution
-- This table tracks processing jobs, document processing, and workflow executions

CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Job identification
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN (
        'document_processing',
        'workflow_execution',
        'agent_training',
        'data_sync',
        'embedding_generation',
        'compliance_check',
        'batch_operation'
    )),
    job_name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Job status and progress
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending',
        'queued',
        'processing',
        'completed',
        'failed',
        'cancelled',
        'paused'
    )),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),

    -- Associated resources
    source_id UUID, -- Reference to knowledge_sources, workflows, etc.
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    user_id UUID, -- User who initiated the job
    workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,

    -- Job configuration and data
    job_config JSONB, -- Job-specific configuration
    input_data JSONB, -- Input parameters for the job
    output_data JSONB, -- Results/output from the job

    -- Error handling
    error_message TEXT,
    error_details JSONB,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    -- Timing and performance
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_duration_minutes INTEGER,
    actual_duration_minutes INTEGER,

    -- Priority and scheduling
    priority INTEGER DEFAULT 100 CHECK (priority >= 1 AND priority <= 1000),
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Resource usage tracking
    cpu_usage_percent DECIMAL(5,2),
    memory_usage_mb INTEGER,
    processing_cost DECIMAL(10,4),

    -- Metadata and tags
    tags TEXT[],
    metadata JSONB,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Create supporting table for job dependencies
CREATE TABLE IF NOT EXISTS job_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    depends_on_job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    dependency_type VARCHAR(20) DEFAULT 'prerequisite' CHECK (dependency_type IN (
        'prerequisite',
        'trigger',
        'resource_lock'
    )),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(job_id, depends_on_job_id)
);

-- Create job logs table for detailed tracking
CREATE TABLE IF NOT EXISTS job_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    log_level VARCHAR(10) DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warn', 'error')),
    message TEXT NOT NULL,
    details JSONB,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority);
CREATE INDEX IF NOT EXISTS idx_jobs_agent_id ON jobs(agent_id);
CREATE INDEX IF NOT EXISTS idx_jobs_workflow_id ON jobs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_at ON jobs(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_tags ON jobs USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_jobs_source_id ON jobs(source_id);

CREATE INDEX IF NOT EXISTS idx_job_dependencies_job_id ON job_dependencies(job_id);
CREATE INDEX IF NOT EXISTS idx_job_dependencies_depends_on ON job_dependencies(depends_on_job_id);

CREATE INDEX IF NOT EXISTS idx_job_logs_job_id ON job_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_job_logs_level ON job_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_job_logs_logged_at ON job_logs(logged_at);

-- Create triggers for updated_at
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically calculate duration when job completes
CREATE OR REPLACE FUNCTION calculate_job_duration()
RETURNS TRIGGER AS $$
BEGIN
    -- If job is completing and we have start time, calculate duration
    IF NEW.status IN ('completed', 'failed') AND OLD.status = 'processing' AND NEW.started_at IS NOT NULL THEN
        NEW.completed_at = NOW();
        NEW.actual_duration_minutes = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) / 60;
    END IF;

    -- If job is starting, set started_at
    IF NEW.status = 'processing' AND OLD.status IN ('pending', 'queued') THEN
        NEW.started_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_job_duration_trigger
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION calculate_job_duration();

-- Create function to clean up old completed jobs (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_jobs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM jobs
    WHERE status IN ('completed', 'failed')
    AND completed_at < NOW() - INTERVAL '30 days';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON jobs FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for job owners" ON jobs FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON job_dependencies FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON job_logs FOR SELECT USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON job_dependencies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON job_logs TO authenticated;

-- Insert sample jobs for testing
INSERT INTO jobs (job_name, job_type, description, status, progress, job_config, tags, priority)
VALUES
    (
        'Process Clinical Guidelines Document',
        'document_processing',
        'Process uploaded clinical guidelines PDF and generate embeddings',
        'completed',
        100,
        '{"chunk_size": 1000, "overlap": 200, "embedding_model": "clinical"}'::jsonb,
        ARRAY['document-processing', 'clinical', 'embeddings'],
        200
    ),
    (
        'Compliance Workflow Execution',
        'workflow_execution',
        'Execute HIPAA compliance check workflow for new agent',
        'processing',
        65,
        '{"workflow_steps": ["validate_phi_handling", "check_encryption", "audit_trail"]}'::jsonb,
        ARRAY['compliance', 'hipaa', 'workflow'],
        500
    ),
    (
        'Agent Training Pipeline',
        'agent_training',
        'Train specialized pharmaceutical agent with new regulatory data',
        'pending',
        0,
        '{"training_data_sources": ["fda_guidelines", "pharma_protocols"], "model_config": {"temperature": 0.3}}'::jsonb,
        ARRAY['training', 'pharmaceutical', 'fda'],
        300
    )
ON CONFLICT (id) DO NOTHING;

-- Create a view for active jobs with enhanced information
CREATE OR REPLACE VIEW active_jobs_view AS
SELECT
    j.*,
    a.display_name as agent_name,
    w.name as workflow_name,
    CASE
        WHEN j.status = 'processing' AND j.started_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (NOW() - j.started_at)) / 60
        ELSE NULL
    END as running_minutes,
    COALESCE(j.estimated_duration_minutes, 0) - COALESCE(
        CASE WHEN j.status = 'processing' THEN EXTRACT(EPOCH FROM (NOW() - j.started_at)) / 60 ELSE 0 END,
        0
    ) as estimated_remaining_minutes
FROM jobs j
LEFT JOIN agents a ON j.agent_id = a.id
LEFT JOIN workflows w ON j.workflow_id = w.id
WHERE j.status NOT IN ('completed', 'failed', 'cancelled')
ORDER BY j.priority DESC, j.scheduled_at ASC;