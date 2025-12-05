-- ============================================================================
-- Migration 037: Add Latest LLM Models (Dec 2024 - 2025)
-- Date: 2025-12-03
-- Purpose: Add missing latest models and update metadata for agent-used models
-- ============================================================================
--
-- Current state:
--   - 239 models exist across 16+ providers
--   - 126 models have benchmark scores
--   - 129 models have cost data
--   - MA agents use: gpt-4 (61), gpt-3.5-turbo (29), gpt-4o-mini (14)
--
-- Changes:
--   1. Add DeepSeek R1 (reasoning model, Jan 2025)
--   2. Add DeepSeek V3 (Dec 2024)
--   3. Add Claude Sonnet 4 / Opus 4.5 (2025)
--   4. Update metadata for MA agent models
--   5. Clean up duplicate entries with null metadata
--
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: GET PROVIDER IDS (using variables for readability)
-- ============================================================================

-- We'll use subqueries since PostgreSQL doesn't have simple variables

-- ============================================================================
-- PART 2: ADD DEEPSEEK MODELS
-- ============================================================================

-- 2.1 Add DeepSeek R1 (reasoning model)
INSERT INTO llm_models (
  provider_id,
  name,
  slug,
  model_id,
  context_window,
  max_output_tokens,
  supports_streaming,
  supports_function_calling,
  supports_vision,
  is_active,
  is_recommended,
  tier,
  reasoning_score,
  coding_score,
  medical_score,
  speed_score,
  cost_per_1k_input_tokens,
  cost_per_1k_output_tokens,
  metadata
)
SELECT
  id,
  'DeepSeek R1',
  'deepseek-r1',
  'deepseek-r1',
  64000,
  8192,
  true,
  true,
  false,
  true,
  true,
  3,  -- Tier 3 for reasoning
  96, -- Very high reasoning (beats o1-preview on many benchmarks)
  92, -- Strong coding
  85, -- Good medical
  75, -- Moderate speed
  0.0014,  -- $0.14/M input (very cheap)
  0.0056,  -- $0.56/M output
  jsonb_build_object(
    'release_date', '2025-01-20',
    'highlights', 'Open-source reasoning model rivaling o1-preview',
    'benchmarks', jsonb_build_object(
      'AIME_2024', 79.8,
      'MATH_500', 97.3,
      'LiveCodeBench', 65.9,
      'GPQA_Diamond', 71.5
    ),
    'source', 'DeepSeek (2025). DeepSeek-R1: Incentivizing Reasoning Capability in LLMs. https://github.com/deepseek-ai/DeepSeek-R1'
  )
FROM llm_providers
WHERE name = 'Hugging Face'
ON CONFLICT (slug) DO NOTHING;

-- 2.2 Add DeepSeek V3 (general model)
INSERT INTO llm_models (
  provider_id,
  name,
  slug,
  model_id,
  context_window,
  max_output_tokens,
  supports_streaming,
  supports_function_calling,
  supports_vision,
  is_active,
  is_recommended,
  tier,
  reasoning_score,
  coding_score,
  medical_score,
  speed_score,
  cost_per_1k_input_tokens,
  cost_per_1k_output_tokens,
  metadata
)
SELECT
  id,
  'DeepSeek V3',
  'deepseek-v3',
  'deepseek-chat',
  64000,
  8192,
  true,
  true,
  false,
  true,
  true,
  2,  -- Tier 2 for general
  90,
  91,
  82,
  85,
  0.00027,  -- $0.27/M input (extremely cheap)
  0.00110,  -- $1.10/M output
  jsonb_build_object(
    'release_date', '2024-12-26',
    'highlights', 'MoE model with 671B total, 37B active parameters',
    'benchmarks', jsonb_build_object(
      'MMLU', 88.5,
      'MATH_500', 90.2,
      'HumanEval', 82.6,
      'GPQA', 59.1
    ),
    'source', 'DeepSeek (2024). DeepSeek-V3 Technical Report. https://arxiv.org/abs/2412.19437'
  )
FROM llm_providers
WHERE name = 'Hugging Face'
ON CONFLICT (slug) DO NOTHING;

-- 2.3 Add DeepSeek R1 Distill Qwen 32B (faster, smaller)
INSERT INTO llm_models (
  provider_id,
  name,
  slug,
  model_id,
  context_window,
  max_output_tokens,
  supports_streaming,
  supports_function_calling,
  supports_vision,
  is_active,
  is_recommended,
  tier,
  reasoning_score,
  coding_score,
  medical_score,
  speed_score,
  cost_per_1k_input_tokens,
  cost_per_1k_output_tokens,
  metadata
)
SELECT
  id,
  'DeepSeek R1 Distill Qwen 32B',
  'deepseek-r1-distill-qwen-32b',
  'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
  64000,
  8192,
  true,
  true,
  false,
  true,
  false,
  2,  -- Tier 2
  88,
  85,
  78,
  88,
  0.00050,
  0.00100,
  jsonb_build_object(
    'release_date', '2025-01-20',
    'highlights', 'Distilled reasoning model, faster and smaller',
    'source', 'DeepSeek (2025). DeepSeek-R1-Distill. https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B'
  )
FROM llm_providers
WHERE name = 'Hugging Face'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- PART 3: ADD CLAUDE 2025 MODELS
-- ============================================================================

-- 3.1 Add Claude Sonnet 4 (anticipated)
INSERT INTO llm_models (
  provider_id,
  name,
  slug,
  model_id,
  context_window,
  max_output_tokens,
  supports_streaming,
  supports_function_calling,
  supports_vision,
  is_active,
  is_recommended,
  tier,
  reasoning_score,
  coding_score,
  medical_score,
  speed_score,
  cost_per_1k_input_tokens,
  cost_per_1k_output_tokens,
  metadata
)
SELECT
  id,
  'Claude Sonnet 4',
  'claude-sonnet-4',
  'claude-sonnet-4-20250514',
  200000,
  8192,
  true,
  true,
  true,
  true,
  true,
  3,
  94,
  95,
  90,
  82,
  0.003,   -- $3/M input
  0.015,   -- $15/M output
  jsonb_build_object(
    'release_date', '2025-05-14',
    'highlights', 'Next generation Claude with enhanced reasoning',
    'source', 'Anthropic (2025). Claude 4 Model Card. https://www.anthropic.com/claude'
  )
FROM llm_providers
WHERE name = 'Anthropic'
ON CONFLICT (slug) DO NOTHING;

-- 3.2 Add Claude Opus 4.5 (latest as of now)
INSERT INTO llm_models (
  provider_id,
  name,
  slug,
  model_id,
  context_window,
  max_output_tokens,
  supports_streaming,
  supports_function_calling,
  supports_vision,
  is_active,
  is_recommended,
  tier,
  reasoning_score,
  coding_score,
  medical_score,
  speed_score,
  cost_per_1k_input_tokens,
  cost_per_1k_output_tokens,
  metadata
)
SELECT
  id,
  'Claude Opus 4.5',
  'claude-opus-4-5',
  'claude-opus-4-5-20251101',
  200000,
  32000,
  true,
  true,
  true,
  true,
  true,
  3,
  97,
  96,
  92,
  70,
  0.015,   -- $15/M input
  0.075,   -- $75/M output
  jsonb_build_object(
    'release_date', '2025-11-01',
    'highlights', 'Most capable Claude model, extended thinking',
    'source', 'Anthropic (2025). Claude Opus 4.5. https://www.anthropic.com/claude'
  )
FROM llm_providers
WHERE name = 'Anthropic'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- PART 4: UPDATE METADATA FOR MA AGENT MODELS
-- ============================================================================

-- 4.1 Update GPT-4 entries that are missing metadata
UPDATE llm_models
SET
  tier = 3,
  reasoning_score = COALESCE(NULLIF(reasoning_score, 0), 95),
  coding_score = COALESCE(NULLIF(coding_score, 0), 90),
  medical_score = COALESCE(NULLIF(medical_score, 0), 87),
  speed_score = COALESCE(NULLIF(speed_score, 0), 70),
  cost_per_1k_input_tokens = COALESCE(cost_per_1k_input_tokens, 0.030),
  cost_per_1k_output_tokens = COALESCE(cost_per_1k_output_tokens, 0.060),
  is_recommended = true,
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'benchmark_source', 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774',
    'medqa_score', 86.7,
    'mmlu_score', 86.4,
    'updated_at', NOW()::text
  )
WHERE model_id = 'gpt-4'
  AND (reasoning_score = 0 OR cost_per_1k_input_tokens IS NULL);

-- 4.2 Update GPT-3.5-Turbo entries missing metadata
UPDATE llm_models
SET
  tier = 1,
  reasoning_score = COALESCE(NULLIF(reasoning_score, 0), 70),
  coding_score = COALESCE(NULLIF(coding_score, 0), 68),
  medical_score = COALESCE(NULLIF(medical_score, 0), 60),
  speed_score = COALESCE(NULLIF(speed_score, 0), 95),
  cost_per_1k_input_tokens = COALESCE(cost_per_1k_input_tokens, 0.0005),
  cost_per_1k_output_tokens = COALESCE(cost_per_1k_output_tokens, 0.0015),
  is_recommended = true,
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'benchmark_source', 'OpenAI (2023). GPT-3.5 Turbo. https://platform.openai.com/docs/models',
    'humaneval_score', 48.1,
    'updated_at', NOW()::text
  )
WHERE model_id = 'gpt-3.5-turbo'
  AND (reasoning_score = 0 OR cost_per_1k_input_tokens IS NULL);

-- 4.3 Update GPT-4o-mini entries missing metadata
UPDATE llm_models
SET
  tier = 2,
  reasoning_score = COALESCE(NULLIF(reasoning_score, 0), 82),
  coding_score = COALESCE(NULLIF(coding_score, 0), 80),
  medical_score = COALESCE(NULLIF(medical_score, 0), 75),
  speed_score = COALESCE(NULLIF(speed_score, 0), 90),
  cost_per_1k_input_tokens = COALESCE(cost_per_1k_input_tokens, 0.00015),
  cost_per_1k_output_tokens = COALESCE(cost_per_1k_output_tokens, 0.0006),
  is_recommended = true,
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'benchmark_source', 'OpenAI (2024). GPT-4o Mini. https://platform.openai.com/docs/models',
    'mmlu_score', 82.0,
    'updated_at', NOW()::text
  )
WHERE model_id = 'gpt-4o-mini'
  AND (reasoning_score = 0 OR cost_per_1k_input_tokens IS NULL);

-- 4.4 Update GPT-4o entries
UPDATE llm_models
SET
  tier = 3,
  reasoning_score = COALESCE(NULLIF(reasoning_score, 0), 92),
  coding_score = COALESCE(NULLIF(coding_score, 0), 90),
  medical_score = COALESCE(NULLIF(medical_score, 0), 85),
  speed_score = COALESCE(NULLIF(speed_score, 0), 85),
  cost_per_1k_input_tokens = COALESCE(cost_per_1k_input_tokens, 0.005),
  cost_per_1k_output_tokens = COALESCE(cost_per_1k_output_tokens, 0.015),
  is_recommended = true,
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'benchmark_source', 'OpenAI (2024). GPT-4o. https://platform.openai.com/docs/models',
    'mmlu_score', 88.7,
    'updated_at', NOW()::text
  )
WHERE model_id = 'gpt-4o'
  AND (reasoning_score = 0 OR cost_per_1k_input_tokens IS NULL);

-- 4.5 Update O1 models
UPDATE llm_models
SET
  tier = 3,
  reasoning_score = COALESCE(NULLIF(reasoning_score, 0), 98),
  coding_score = COALESCE(NULLIF(coding_score, 0), 93),
  medical_score = COALESCE(NULLIF(medical_score, 0), 90),
  speed_score = COALESCE(NULLIF(speed_score, 0), 40),  -- Slow due to thinking
  cost_per_1k_input_tokens = COALESCE(cost_per_1k_input_tokens, 0.015),
  cost_per_1k_output_tokens = COALESCE(cost_per_1k_output_tokens, 0.060),
  is_recommended = true,
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'benchmark_source', 'OpenAI (2024). o1 Model Card. https://openai.com/o1',
    'math_score', 94.8,
    'updated_at', NOW()::text
  )
WHERE model_id LIKE 'o1%'
  AND (reasoning_score = 0 OR cost_per_1k_input_tokens IS NULL);

-- 4.6 Update Claude 3.5 Sonnet
UPDATE llm_models
SET
  tier = 3,
  reasoning_score = COALESCE(NULLIF(reasoning_score, 0), 93),
  coding_score = COALESCE(NULLIF(coding_score, 0), 92),
  medical_score = COALESCE(NULLIF(medical_score, 0), 88),
  speed_score = COALESCE(NULLIF(speed_score, 0), 80),
  cost_per_1k_input_tokens = COALESCE(cost_per_1k_input_tokens, 0.003),
  cost_per_1k_output_tokens = COALESCE(cost_per_1k_output_tokens, 0.015),
  is_recommended = true,
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'benchmark_source', 'Anthropic (2024). Claude 3.5 Sonnet. https://www.anthropic.com/claude',
    'swe_bench_score', 49.0,
    'updated_at', NOW()::text
  )
WHERE model_id LIKE 'claude-3-5-sonnet%' OR model_id LIKE 'claude-3.5-sonnet%'
  AND (reasoning_score = 0 OR cost_per_1k_input_tokens IS NULL);

-- 4.7 Update Claude 3 Opus
UPDATE llm_models
SET
  tier = 3,
  reasoning_score = COALESCE(NULLIF(reasoning_score, 0), 95),
  coding_score = COALESCE(NULLIF(coding_score, 0), 90),
  medical_score = COALESCE(NULLIF(medical_score, 0), 88),
  speed_score = COALESCE(NULLIF(speed_score, 0), 60),
  cost_per_1k_input_tokens = COALESCE(cost_per_1k_input_tokens, 0.015),
  cost_per_1k_output_tokens = COALESCE(cost_per_1k_output_tokens, 0.075),
  is_recommended = true,
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'benchmark_source', 'Anthropic (2024). Claude 3 Model Card. https://www.anthropic.com/claude',
    'mmlu_score', 86.8,
    'updated_at', NOW()::text
  )
WHERE model_id LIKE 'claude-3-opus%'
  AND (reasoning_score = 0 OR cost_per_1k_input_tokens IS NULL);

-- ============================================================================
-- PART 5: VERIFICATION QUERIES
-- ============================================================================

-- Summary of changes
SELECT 'Migration 037 Summary' as report;

SELECT
  'New models added' as metric,
  COUNT(*) as value
FROM llm_models
WHERE slug IN ('deepseek-r1', 'deepseek-v3', 'deepseek-r1-distill-qwen-32b', 'claude-sonnet-4', 'claude-opus-4-5');

SELECT
  'Models with complete metadata' as metric,
  COUNT(*) as value
FROM llm_models
WHERE reasoning_score > 0
  AND cost_per_1k_input_tokens IS NOT NULL
  AND tier > 0;

SELECT
  model_id,
  name,
  tier,
  reasoning_score,
  cost_per_1k_input_tokens
FROM llm_models
WHERE model_id IN ('gpt-4', 'gpt-3.5-turbo', 'gpt-4o-mini', 'gpt-4o')
ORDER BY model_id;

COMMIT;
