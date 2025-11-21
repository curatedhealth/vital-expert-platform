-- Migration: Create Avatars and LLM Models Tables
-- Description: Creates lookup tables for agent avatars and LLM models
-- Date: 2025-10-06

-- =====================================================
-- AVATARS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon VARCHAR(10) NOT NULL UNIQUE, -- The emoji or icon character
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50), -- e.g., 'medical', 'scientific', 'business', 'technical'
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- LLM MODELS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS llm_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'gpt-4', 'gpt-4-turbo', 'claude-3-opus'
  display_name VARCHAR(150) NOT NULL, -- e.g., 'GPT-4 Turbo'
  provider VARCHAR(50) NOT NULL, -- e.g., 'openai', 'anthropic', 'google'
  version VARCHAR(50), -- e.g., '0613', '20240229'
  context_window INTEGER, -- e.g., 128000
  max_output_tokens INTEGER, -- e.g., 4096
  input_cost_per_1k DECIMAL(10, 6), -- Cost per 1K input tokens
  output_cost_per_1k DECIMAL(10, 6), -- Cost per 1K output tokens
  supports_functions BOOLEAN DEFAULT false,
  supports_vision BOOLEAN DEFAULT false,
  supports_json_mode BOOLEAN DEFAULT false,
  description TEXT,
  tier_recommendation INTEGER, -- Recommended tier for this model (1, 2, or 3)
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- POPULATE AVATARS
-- =====================================================
INSERT INTO avatars (icon, name, category, sort_order) VALUES
-- Medical & Healthcare
('🏥', 'Hospital', 'medical', 1),
('⚕️', 'Medical Symbol', 'medical', 2),
('💊', 'Pill', 'medical', 3),
('💉', 'Syringe', 'medical', 4),
('🩺', 'Stethoscope', 'medical', 5),
('🧬', 'DNA', 'medical', 6),
('🦠', 'Microbe', 'medical', 7),
('🧪', 'Test Tube', 'medical', 8),
('🔬', 'Microscope', 'medical', 9),

-- Scientific
('🧑‍🔬', 'Scientist', 'scientific', 10),
('👨‍⚕️', 'Doctor', 'scientific', 11),
('👩‍⚕️', 'Female Doctor', 'scientific', 12),
('🧠', 'Brain', 'scientific', 13),
('🔭', 'Telescope', 'scientific', 14),
('⚗️', 'Alembic', 'scientific', 15),

-- Business & Professional
('💼', 'Briefcase', 'business', 20),
('📊', 'Chart', 'business', 21),
('📈', 'Trending Up', 'business', 22),
('📉', 'Trending Down', 'business', 23),
('💰', 'Money Bag', 'business', 24),
('💵', 'Dollar', 'business', 25),
('🎯', 'Target', 'business', 26),
('📋', 'Clipboard', 'business', 27),
('📝', 'Memo', 'business', 28),

-- Technical
('🤖', 'Robot', 'technical', 30),
('💻', 'Laptop', 'technical', 31),
('⚙️', 'Gear', 'technical', 32),
('🔧', 'Wrench', 'technical', 33),
('🛠️', 'Tools', 'technical', 34),
('📡', 'Satellite', 'technical', 35),
('🖥️', 'Desktop', 'technical', 36),
('📱', 'Mobile', 'technical', 37),

-- Communication
('📞', 'Phone', 'communication', 40),
('📧', 'Email', 'communication', 41),
('💬', 'Speech Bubble', 'communication', 42),
('🗣️', 'Speaking', 'communication', 43),

-- Symbols
('✅', 'Check Mark', 'symbols', 50),
('⚠️', 'Warning', 'symbols', 51),
('🔒', 'Lock', 'symbols', 52),
('🔓', 'Unlock', 'symbols', 53),
('🔑', 'Key', 'symbols', 54),
('⭐', 'Star', 'symbols', 55),
('🎓', 'Graduation Cap', 'symbols', 56),
('🏆', 'Trophy', 'symbols', 57)

ON CONFLICT (icon) DO NOTHING;

-- =====================================================
-- POPULATE LLM MODELS
-- =====================================================
INSERT INTO llm_models (
  name, display_name, provider, version, context_window, max_output_tokens,
  input_cost_per_1k, output_cost_per_1k, supports_functions, supports_vision,
  supports_json_mode, tier_recommendation, sort_order, description
) VALUES
-- OpenAI Models
('gpt-4-turbo', 'GPT-4 Turbo', 'openai', '0125', 128000, 4096, 0.01, 0.03, true, true, true, 1, 1, 'Most capable GPT-4 model for Tier 1 foundational agents'),
('gpt-4', 'GPT-4', 'openai', '0613', 8192, 4096, 0.03, 0.06, true, false, true, 1, 2, 'Standard GPT-4 model'),
('gpt-4o', 'GPT-4o', 'openai', 'latest', 128000, 16384, 0.0025, 0.01, true, true, true, 1, 3, 'Optimized GPT-4 with vision'),
('gpt-3.5-turbo', 'GPT-3.5 Turbo', 'openai', '0125', 16385, 4096, 0.0005, 0.0015, true, false, true, 2, 10, 'Fast and efficient for Tier 2 specialist agents'),

-- Anthropic Models
('claude-3-opus-20240229', 'Claude 3 Opus', 'anthropic', '20240229', 200000, 4096, 0.015, 0.075, true, true, true, 1, 4, 'Most capable Claude model for complex reasoning'),
('claude-3-sonnet-20240229', 'Claude 3 Sonnet', 'anthropic', '20240229', 200000, 4096, 0.003, 0.015, true, true, true, 2, 5, 'Balanced performance for specialist tasks'),
('claude-3-haiku-20240307', 'Claude 3 Haiku', 'anthropic', '20240307', 200000, 4096, 0.00025, 0.00125, true, true, true, 3, 6, 'Fast and affordable for ultra-specialist focused tasks'),

-- Google Models
('gemini-pro', 'Gemini Pro', 'google', '1.0', 32768, 2048, 0.00025, 0.0005, true, false, true, 2, 20, 'Google advanced language model'),
('gemini-pro-vision', 'Gemini Pro Vision', 'google', '1.0', 16384, 2048, 0.00025, 0.0005, true, true, true, 2, 21, 'Gemini with vision capabilities')

ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_avatars_category ON avatars(category);
CREATE INDEX IF NOT EXISTS idx_avatars_active ON avatars(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_llm_models_provider ON llm_models(provider);
CREATE INDEX IF NOT EXISTS idx_llm_models_tier ON llm_models(tier_recommendation);
CREATE INDEX IF NOT EXISTS idx_llm_models_active ON llm_models(is_active) WHERE is_active = true;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE avatars IS 'Available avatar icons for agents';
COMMENT ON TABLE llm_models IS 'Available LLM models with pricing and capabilities';

COMMENT ON COLUMN llm_models.tier_recommendation IS 'Recommended tier: 1=Foundational, 2=Specialist, 3=Ultra-Specialist';
COMMENT ON COLUMN llm_models.context_window IS 'Maximum context window in tokens';
COMMENT ON COLUMN llm_models.input_cost_per_1k IS 'Cost per 1,000 input tokens in USD';
COMMENT ON COLUMN llm_models.output_cost_per_1k IS 'Cost per 1,000 output tokens in USD';
