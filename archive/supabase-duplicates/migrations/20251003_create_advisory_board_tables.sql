-- Advisory Board Tables for Virtual Panel Sessions
-- Based on LangGraph Implementation Guide for Pharma

-- Board Sessions Table
CREATE TABLE IF NOT EXISTS board_session (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  archetype TEXT NOT NULL, -- 'SAB', 'CAB', 'Market', 'Strategic', 'Ethics', etc.
  fusion_model TEXT NOT NULL, -- 'human_led', 'agent_facilitated', 'symbiotic', 'autonomous', 'continuous'
  mode TEXT NOT NULL, -- 'parallel', 'sequential', 'scripted', 'debate', 'scenario', 'dynamic'
  agenda JSONB NOT NULL DEFAULT '[]',
  evidence_pack_id UUID,
  policy_profile TEXT DEFAULT 'MEDICAL', -- 'MEDICAL', 'COMMERCIAL', 'R&D'
  created_by UUID,
  status TEXT DEFAULT 'draft', -- 'draft', 'active', 'completed', 'archived'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Board Replies (Expert Responses)
CREATE TABLE IF NOT EXISTS board_reply (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES board_session(id) ON DELETE CASCADE,
  turn_no INTEGER NOT NULL,
  persona TEXT NOT NULL, -- 'KOL', 'PAYER', 'REGULATOR', 'BIOSTAT', 'PATIENT', etc.
  agent_id UUID, -- reference to agents table if needed
  answer TEXT NOT NULL,
  citations JSONB DEFAULT '[]', -- [{id, title, url, snippet, citation}]
  confidence NUMERIC(3,2), -- 0.00 to 1.00
  flags TEXT[] DEFAULT '{}', -- ['Needs Human Review', 'Data Ambiguity', etc.]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Board Synthesis (Consensus + Dissent)
CREATE TABLE IF NOT EXISTS board_synthesis (
  session_id UUID NOT NULL REFERENCES board_session(id) ON DELETE CASCADE,
  turn_no INTEGER NOT NULL,
  summary_md TEXT NOT NULL, -- Executive summary in markdown
  consensus TEXT, -- Consensus statement
  dissent TEXT, -- Key disagreements
  risks JSONB DEFAULT '[]', -- [{risk, assumption, data_request}]
  approved BOOLEAN DEFAULT FALSE,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(session_id, turn_no)
);

-- Evidence Packs (for RAG)
CREATE TABLE IF NOT EXISTS evidence_pack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  therapeutic_area TEXT,
  products TEXT[] DEFAULT '{}',
  sources JSONB DEFAULT '[]', -- [{source_id, title, type, url}]
  embeddings_ref TEXT, -- Reference to vector store
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Panel Members (Link agents to sessions)
CREATE TABLE IF NOT EXISTS board_panel_member (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES board_session(id) ON DELETE CASCADE,
  agent_id UUID, -- reference to agents table
  persona TEXT NOT NULL,
  role TEXT DEFAULT 'expert', -- 'expert', 'facilitator', 'observer'
  weight NUMERIC(3,2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_board_session_status ON board_session(status);
CREATE INDEX IF NOT EXISTS idx_board_session_archetype ON board_session(archetype);
CREATE INDEX IF NOT EXISTS idx_board_session_created_at ON board_session(created_at);
CREATE INDEX IF NOT EXISTS idx_board_reply_session_id ON board_reply(session_id);
CREATE INDEX IF NOT EXISTS idx_board_reply_turn_no ON board_reply(session_id, turn_no);
CREATE INDEX IF NOT EXISTS idx_board_synthesis_session_id ON board_synthesis(session_id);
CREATE INDEX IF NOT EXISTS idx_board_panel_member_session_id ON board_panel_member(session_id);

-- Enable RLS
ALTER TABLE board_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_reply ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_synthesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_pack ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_panel_member ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for authenticated users for now)
CREATE POLICY board_session_policy ON board_session
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY board_reply_policy ON board_reply
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY board_synthesis_policy ON board_synthesis
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY evidence_pack_policy ON evidence_pack
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY board_panel_member_policy ON board_panel_member
  FOR ALL USING (auth.role() = 'authenticated');

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_board_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER board_session_updated_at
  BEFORE UPDATE ON board_session
  FOR EACH ROW
  EXECUTE FUNCTION update_board_session_updated_at();

-- Comments
COMMENT ON TABLE board_session IS 'Virtual advisory board sessions with expert panels';
COMMENT ON TABLE board_reply IS 'Individual expert responses within board sessions';
COMMENT ON TABLE board_synthesis IS 'Synthesis of expert responses with consensus and dissent';
COMMENT ON TABLE evidence_pack IS 'Curated evidence packs for RAG retrieval';
COMMENT ON TABLE board_panel_member IS 'Panel composition for each session';
