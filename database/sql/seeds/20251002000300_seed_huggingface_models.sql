-- =====================================================================
-- Seed Hugging Face LLM Models
-- Adds popular Hugging Face models including medical-specific models
-- =====================================================================

INSERT INTO llm_providers (
  provider_name,
  provider_type,
  model_id,
  model_version,
  api_endpoint,
  capabilities,
  max_tokens,
  cost_per_1k_input_tokens,
  cost_per_1k_output_tokens,
  temperature_default,
  status,
  is_active,
  is_production_ready,
  is_hipaa_compliant
) VALUES
-- Medical-Specific Models
(
  'BioGPT',
  'huggingface',
  'microsoft/biogpt',
  'latest',
  'https://api-inference.huggingface.co/models/microsoft/biogpt',
  jsonb_build_object(
    'streaming', false,
    'function_calling', false,
    'context_window', 1024,
    'medical_knowledge', true,
    'code_generation', false,
    'supports_phi', true
  ),
  1024,
  0.0,
  0.0,
  0.7,
  'active',
  false,
  false,
  true
),
(
  'PubMedBERT',
  'huggingface',
  'microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext',
  'latest',
  'https://api-inference.huggingface.co/models/microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext',
  jsonb_build_object(
    'streaming', false,
    'function_calling', false,
    'context_window', 512,
    'medical_knowledge', true,
    'code_generation', false,
    'supports_phi', true
  ),
  512,
  0.0,
  0.0,
  0.7,
  'active',
  false,
  false,
  true
),
(
  'ClinicalBERT',
  'huggingface',
  'emilyalsentzer/Bio_ClinicalBERT',
  'latest',
  'https://api-inference.huggingface.co/models/emilyalsentzer/Bio_ClinicalBERT',
  jsonb_build_object(
    'streaming', false,
    'function_calling', false,
    'context_window', 512,
    'medical_knowledge', true,
    'code_generation', false,
    'supports_phi', true
  ),
  512,
  0.0,
  0.0,
  0.7,
  'active',
  false,
  false,
  true
),
(
  'Med-PaLM',
  'huggingface',
  'google/flan-t5-xxl',
  'latest',
  'https://api-inference.huggingface.co/models/google/flan-t5-xxl',
  jsonb_build_object(
    'streaming', false,
    'function_calling', false,
    'context_window', 2048,
    'medical_knowledge', true,
    'code_generation', false,
    'supports_phi', false
  ),
  2048,
  0.0,
  0.0,
  0.7,
  'active',
  false,
  false,
  false
),
-- General Purpose Open Models
(
  'Llama 2 70B',
  'huggingface',
  'meta-llama/Llama-2-70b-chat-hf',
  'latest',
  'https://api-inference.huggingface.co/models/meta-llama/Llama-2-70b-chat-hf',
  jsonb_build_object(
    'streaming', true,
    'function_calling', false,
    'context_window', 4096,
    'medical_knowledge', false,
    'code_generation', true,
    'supports_phi', false
  ),
  4096,
  0.0,
  0.0,
  0.7,
  'active',
  false,
  true,
  false
),
(
  'Mistral 7B Instruct',
  'huggingface',
  'mistralai/Mistral-7B-Instruct-v0.2',
  'v0.2',
  'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
  jsonb_build_object(
    'streaming', true,
    'function_calling', false,
    'context_window', 8192,
    'medical_knowledge', false,
    'code_generation', true,
    'supports_phi', false
  ),
  8192,
  0.0,
  0.0,
  0.7,
  'active',
  false,
  true,
  false
),
(
  'Mixtral 8x7B',
  'huggingface',
  'mistralai/Mixtral-8x7B-Instruct-v0.1',
  'v0.1',
  'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
  jsonb_build_object(
    'streaming', true,
    'function_calling', false,
    'context_window', 32768,
    'medical_knowledge', false,
    'code_generation', true,
    'supports_phi', false
  ),
  32768,
  0.0,
  0.0,
  0.7,
  'active',
  false,
  true,
  false
),
(
  'Falcon 180B',
  'huggingface',
  'tiiuae/falcon-180B-chat',
  'latest',
  'https://api-inference.huggingface.co/models/tiiuae/falcon-180B-chat',
  jsonb_build_object(
    'streaming', true,
    'function_calling', false,
    'context_window', 2048,
    'medical_knowledge', false,
    'code_generation', true,
    'supports_phi', false
  ),
  2048,
  0.0,
  0.0,
  0.7,
  'active',
  false,
  true,
  false
),
(
  'Zephyr 7B Beta',
  'huggingface',
  'HuggingFaceH4/zephyr-7b-beta',
  'beta',
  'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
  jsonb_build_object(
    'streaming', true,
    'function_calling', false,
    'context_window', 8192,
    'medical_knowledge', false,
    'code_generation', true,
    'supports_phi', false
  ),
  8192,
  0.0,
  0.0,
  0.7,
  'active',
  false,
  true,
  false
),
(
  'CodeLlama 34B',
  'huggingface',
  'codellama/CodeLlama-34b-Instruct-hf',
  'latest',
  'https://api-inference.huggingface.co/models/codellama/CodeLlama-34b-Instruct-hf',
  jsonb_build_object(
    'streaming', true,
    'function_calling', false,
    'context_window', 16384,
    'medical_knowledge', false,
    'code_generation', true,
    'supports_phi', false
  ),
  16384,
  0.0,
  0.0,
  0.7,
  'active',
  false,
  true,
  false
);

-- Add comment
COMMENT ON COLUMN llm_providers.provider_type IS 'Provider type: openai, anthropic, google, meta, huggingface, azure, etc.';
