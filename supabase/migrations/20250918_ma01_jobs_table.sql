-- MA01 Medical Intelligence Jobs Table Migration
-- This migration adds the jobs table for medical intelligence processing

-- Jobs table for MA01 medical intelligence system
CREATE TABLE IF NOT EXISTS ma01_jobs (
  job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  configuration JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- MA01 specific fields
  query_text TEXT,
  result_data JSONB,
  ai_agent_used TEXT,
  processing_time_ms INTEGER,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),

  -- Constraints
  CONSTRAINT valid_configuration CHECK (configuration IS NOT NULL),
  CONSTRAINT valid_status_timestamps CHECK (
    (status = 'pending' OR started_at IS NOT NULL) AND
    (status != 'completed' OR completed_at IS NOT NULL)
  )
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ma01_jobs_status ON ma01_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ma01_jobs_created_by ON ma01_jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_ma01_jobs_created_at ON ma01_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ma01_jobs_updated_at ON ma01_jobs(updated_at DESC);

-- Add comments for documentation
COMMENT ON TABLE ma01_jobs IS 'Jobs table for MA01 medical intelligence processing system';
COMMENT ON COLUMN ma01_jobs.job_id IS 'Unique identifier for the job';
COMMENT ON COLUMN ma01_jobs.name IS 'Human-readable name for the job';
COMMENT ON COLUMN ma01_jobs.description IS 'Detailed description of what the job does';
COMMENT ON COLUMN ma01_jobs.status IS 'Current status of the job execution';
COMMENT ON COLUMN ma01_jobs.configuration IS 'JSON configuration parameters for the job';
COMMENT ON COLUMN ma01_jobs.query_text IS 'The medical query being processed';
COMMENT ON COLUMN ma01_jobs.result_data IS 'JSON result data from the AI processing';
COMMENT ON COLUMN ma01_jobs.ai_agent_used IS 'Which AI agent was used for processing';
COMMENT ON COLUMN ma01_jobs.processing_time_ms IS 'Total processing time in milliseconds';
COMMENT ON COLUMN ma01_jobs.confidence_score IS 'AI confidence score between 0 and 1';

-- Enable Row Level Security
ALTER TABLE ma01_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own jobs" ON ma01_jobs
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create jobs" ON ma01_jobs
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own jobs" ON ma01_jobs
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own jobs" ON ma01_jobs
  FOR DELETE USING (created_by = auth.uid());

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_ma01_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER trigger_ma01_jobs_updated_at
  BEFORE UPDATE ON ma01_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_ma01_jobs_updated_at();