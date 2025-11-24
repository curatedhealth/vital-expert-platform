-- Insert LLM Providers Data Only
-- This assumes the tables already exist from the migration

-- First, let's check if we have any providers already
DO $$
BEGIN
    -- Only insert if the table is empty
    IF NOT EXISTS (SELECT 1 FROM llm_providers LIMIT 1) THEN

        -- Insert sample LLM providers with real 2024 pricing
        INSERT INTO llm_providers (
            provider_name, provider_type, api_endpoint, model_id, model_version,
            capabilities, cost_per_1k_input_tokens, cost_per_1k_output_tokens,
            max_tokens, temperature_default, rate_limit_rpm, rate_limit_tpm,
            rate_limit_concurrent, priority_level, weight, status, is_active,
            is_hipaa_compliant, is_production_ready, medical_accuracy_score,
            average_latency_ms, uptime_percentage
        ) VALUES

        -- OpenAI Providers
        (
            'OpenAI GPT-4 Turbo', 'openai', 'https://api.openai.com/v1',
            'gpt-4-1106-preview', '1106-preview',
            '{"medical_knowledge": true, "code_generation": true, "image_understanding": false, "function_calling": true, "streaming": true, "context_window": 128000, "supports_phi": true}',
            0.010000, 0.030000, 128000, 0.7, 3500, 150000, 20, 1, 1.0,
            'active', true, true, true, 95.0, 2000, 99.9
        ),
        (
            'OpenAI GPT-4', 'openai', 'https://api.openai.com/v1',
            'gpt-4', '0613',
            '{"medical_knowledge": true, "code_generation": true, "image_understanding": false, "function_calling": true, "streaming": true, "context_window": 8192, "supports_phi": true}',
            0.030000, 0.060000, 8192, 0.7, 3500, 40000, 20, 2, 0.9,
            'active', true, true, true, 92.0, 3000, 99.8
        ),
        (
            'OpenAI GPT-3.5 Turbo', 'openai', 'https://api.openai.com/v1',
            'gpt-3.5-turbo', '0125',
            '{"medical_knowledge": true, "code_generation": true, "image_understanding": false, "function_calling": true, "streaming": true, "context_window": 16385, "supports_phi": false}',
            0.001500, 0.002000, 4096, 0.7, 3500, 90000, 20, 3, 1.2,
            'active', true, true, true, 85.0, 1500, 99.9
        ),

        -- Anthropic Providers
        (
            'Anthropic Claude 3 Opus', 'anthropic', 'https://api.anthropic.com',
            'claude-3-opus-20240229', '20240229',
            '{"medical_knowledge": true, "code_generation": true, "image_understanding": true, "function_calling": true, "streaming": true, "context_window": 200000, "supports_phi": true}',
            0.015000, 0.075000, 4096, 0.7, 4000, 400000, 20, 1, 0.95,
            'active', true, true, true, 96.0, 2500, 99.7
        ),
        (
            'Anthropic Claude 3 Sonnet', 'anthropic', 'https://api.anthropic.com',
            'claude-3-sonnet-20240229', '20240229',
            '{"medical_knowledge": true, "code_generation": true, "image_understanding": true, "function_calling": true, "streaming": true, "context_window": 200000, "supports_phi": true}',
            0.003000, 0.015000, 4096, 0.7, 4000, 400000, 20, 2, 1.1,
            'active', true, true, true, 90.0, 2000, 99.8
        ),
        (
            'Anthropic Claude 3 Haiku', 'anthropic', 'https://api.anthropic.com',
            'claude-3-haiku-20240307', '20240307',
            '{"medical_knowledge": true, "code_generation": true, "image_understanding": true, "function_calling": false, "streaming": true, "context_window": 200000, "supports_phi": false}',
            0.000250, 0.001250, 4096, 0.7, 4000, 400000, 20, 4, 1.3,
            'active', true, true, true, 82.0, 1000, 99.9
        ),

        -- Google Providers
        (
            'Google Gemini Pro', 'google', 'https://generativelanguage.googleapis.com',
            'gemini-pro', 'v1',
            '{"medical_knowledge": true, "code_generation": true, "image_understanding": true, "function_calling": true, "streaming": true, "context_window": 32768, "supports_phi": false}',
            0.000500, 0.001500, 8192, 0.7, 60, 30000, 10, 3, 1.0,
            'active', true, true, true, 86.0, 1800, 99.6
        ),
        (
            'Google Gemini Ultra', 'google', 'https://generativelanguage.googleapis.com',
            'gemini-ultra', 'v1',
            '{"medical_knowledge": true, "code_generation": true, "image_understanding": true, "function_calling": true, "streaming": true, "context_window": 32768, "supports_phi": true}',
            0.008000, 0.024000, 8192, 0.7, 60, 30000, 10, 2, 0.8,
            'active', true, true, true, 89.0, 3000, 99.5
        ),

        -- Enterprise Providers (disabled by default)
        (
            'Azure OpenAI GPT-4', 'azure', 'https://your-resource.openai.azure.com',
            'gpt-4', '0613',
            '{"medical_knowledge": true, "code_generation": true, "image_understanding": false, "function_calling": true, "streaming": true, "context_window": 8192, "supports_phi": true}',
            0.030000, 0.060000, 8192, 0.7, 3500, 40000, 20, 1, 1.0,
            'disabled', false, true, true, 93.0, 2500, 99.9
        ),
        (
            'AWS Bedrock Claude 3 Opus', 'aws_bedrock', 'https://bedrock-runtime.us-east-1.amazonaws.com',
            'anthropic.claude-3-opus-20240229-v1:0', 'v1:0',
            '{"medical_knowledge": true, "code_generation": true, "image_understanding": true, "function_calling": true, "streaming": true, "context_window": 200000, "supports_phi": true}',
            0.015000, 0.075000, 4096, 0.7, 4000, 400000, 20, 1, 0.9,
            'disabled', false, true, true, 91.0, 2800, 99.8
        );

        RAISE NOTICE 'Successfully inserted 10 LLM providers';
    ELSE
        RAISE NOTICE 'LLM providers already exist, skipping insert';
    END IF;
END $$;