-- Create session store table for Vercel-compatible session persistence
-- This replaces SQLite-based session storage

CREATE TABLE IF NOT EXISTS session_store (
  thread_id TEXT PRIMARY KEY,
  state JSONB NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_session_store_timestamp ON session_store(timestamp);
CREATE INDEX IF NOT EXISTS idx_session_store_user_id ON session_store(user_id);
CREATE INDEX IF NOT EXISTS idx_session_store_created_at ON session_store(created_at);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_session_store_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_session_store_updated_at ON session_store;
CREATE TRIGGER trigger_update_session_store_updated_at
  BEFORE UPDATE ON session_store
  FOR EACH ROW
  EXECUTE FUNCTION update_session_store_updated_at();

-- Create RPC function for table creation (used by the service)
CREATE OR REPLACE FUNCTION create_session_store_table()
RETURNS void AS $$
BEGIN
  -- This function is called by the service to ensure table exists
  -- The table creation is handled above, so this is just a placeholder
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL ON session_store TO authenticated;
GRANT ALL ON session_store TO service_role;
