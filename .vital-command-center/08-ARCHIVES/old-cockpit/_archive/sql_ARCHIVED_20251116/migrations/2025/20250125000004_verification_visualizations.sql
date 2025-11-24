-- Verification Visualizations Storage
-- Stores generated verification UI HTML and metadata

CREATE TABLE IF NOT EXISTS public.verification_visualizations (
  id TEXT PRIMARY KEY,

  -- Link to extraction run
  extraction_run_id UUID NOT NULL,

  -- HTML content (can be large)
  html_content TEXT NOT NULL,

  -- Metadata for quick access
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Lifecycle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,

  -- Access tracking
  accessed_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_viz_extraction_run
  ON public.verification_visualizations(extraction_run_id);

CREATE INDEX IF NOT EXISTS idx_verification_viz_expires
  ON public.verification_visualizations(expires_at);

CREATE INDEX IF NOT EXISTS idx_verification_viz_created
  ON public.verification_visualizations(created_at DESC);

-- GIN index for metadata search
CREATE INDEX IF NOT EXISTS idx_verification_viz_metadata
  ON public.verification_visualizations USING GIN(metadata);

-- Comments
COMMENT ON TABLE public.verification_visualizations IS
  'Stores generated verification UI HTML with metadata and access tracking';

COMMENT ON COLUMN public.verification_visualizations.extraction_run_id IS
  'Links to extraction_run_id in extracted_entities table';

COMMENT ON COLUMN public.verification_visualizations.html_content IS
  'Complete HTML content for verification UI';

COMMENT ON COLUMN public.verification_visualizations.metadata IS
  'JSON metadata: {total_entities, avg_confidence, entity_types, created_at}';

COMMENT ON COLUMN public.verification_visualizations.accessed_count IS
  'Number of times this verification UI has been accessed';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Verification visualizations table created successfully';
  RAISE NOTICE '📊 Table: verification_visualizations';
  RAISE NOTICE '🔍 Indexes: 4 performance indexes created';
END $$;
