import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Use service role key for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/llm/available-models
 * Returns a list of available LLM models based on configured providers with API keys
 * This is a public endpoint that doesn't require authentication
 */
export async function GET() {
  try {
    const supabase = supabaseAdmin;

    // Fetch active LLM providers that have API keys configured
    const { data: providers, error } = await supabase
      .from('llm_providers')
      .select('id, provider_name, provider_type, model_id, model_version, max_tokens, capabilities')
      .eq('is_active', true)
      .not('api_key_encrypted', 'is', null)
      .order('priority_level', { ascending: true });

    if (error) {
      console.error('Error fetching LLM providers:', error);
      // Return default models if database fetch fails
      return NextResponse.json({
        models: getDefaultModels(),
        source: 'default'
      });
    }

    // If no providers configured, return default models
    if (!providers || providers.length === 0) {
      return NextResponse.json({
        models: getDefaultModels(),
        source: 'default'
      });
    }

    // Transform providers into model options
    const models = providers.map(provider => ({
      id: provider.model_id,
      name: getModelDisplayName(provider.provider_type, provider.model_id),
      description: getModelDescription(provider.provider_type, provider.model_id),
      provider: provider.provider_type,
      maxTokens: provider.max_tokens || 4096,
      capabilities: provider.capabilities || {},
      version: provider.model_version
    }));

    return NextResponse.json({
      models,
      source: 'database'
    });

  } catch (error) {
    console.error('Error in available-models API:', error);
    // Return default models on error
    return NextResponse.json({
      models: getDefaultModels(),
      source: 'default'
    });
  }
}

/**
 * Default models to return when no providers are configured
 */
function getDefaultModels() {
  return [
    // GPT-5 Family (Featured - NEW October 2025!)
    {
      id: 'gpt-5',
      name: 'GPT-5',
      description: 'Best model for coding and agentic tasks across domains',
      provider: 'openai',
      maxTokens: 128000,
      tier: 3
    },
    {
      id: 'gpt-5-mini',
      name: 'GPT-5 mini',
      description: 'Faster, cost-efficient GPT-5 for well-defined tasks',
      provider: 'openai',
      maxTokens: 128000,
      tier: 2
    },
    {
      id: 'gpt-5-nano',
      name: 'GPT-5 nano',
      description: 'Fastest, most cost-efficient GPT-5 variant',
      provider: 'openai',
      maxTokens: 64000,
      tier: 1
    },
    // GPT-4.1 Family
    {
      id: 'gpt-4.1',
      name: 'GPT-4.1',
      description: 'Best for coding with 1M token context, improved instruction following',
      provider: 'openai',
      maxTokens: 1000000,
      tier: 3
    },
    {
      id: 'gpt-4.1-mini',
      name: 'GPT-4.1 mini',
      description: 'Replaces GPT-4o mini with better performance',
      provider: 'openai',
      maxTokens: 128000,
      tier: 2
    },
    {
      id: 'gpt-4.1-nano',
      name: 'GPT-4.1 nano',
      description: 'Smallest, fastest GPT-4.1 variant',
      provider: 'openai',
      maxTokens: 64000,
      tier: 1
    },
    // GPT-4 Legacy
    {
      id: 'gpt-4',
      name: 'GPT-4',
      description: 'Most capable, best for complex reasoning',
      provider: 'openai',
      maxTokens: 8192,
      tier: 3
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      description: 'Faster GPT-4 with 128K context window',
      provider: 'openai',
      maxTokens: 128000,
      tier: 3
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: 'Fast and efficient for most tasks',
      provider: 'openai',
      maxTokens: 16385,
      tier: 1
    },
    // Voice/Image Models
    {
      id: 'gpt-4o-mini-tts',
      name: 'GPT-4o mini TTS',
      description: 'Text-to-speech with voice instructability',
      provider: 'openai',
      maxTokens: 16000,
      tier: 2,
      capabilities: ['voice', 'tts']
    },
    {
      id: 'gpt-image-1',
      name: 'GPT Image 1',
      description: 'Latest image generation model',
      provider: 'openai',
      maxTokens: 4000,
      tier: 2,
      capabilities: ['image-generation']
    },
    {
      id: 'gpt-realtime',
      name: 'GPT Realtime',
      description: 'Speech-to-speech for voice agents',
      provider: 'openai',
      maxTokens: 16000,
      tier: 2,
      capabilities: ['voice', 'realtime']
    },
    // Claude Family
    {
      id: 'claude-opus-4',
      name: 'Claude Opus 4',
      description: 'Best-in-class reasoning and complex analysis',
      provider: 'anthropic',
      maxTokens: 128000,
      tier: 3
    },
    {
      id: 'claude-sonnet-4.5',
      name: 'Claude Sonnet 4.5',
      description: 'Best balance with 200K context and multimodal',
      provider: 'anthropic',
      maxTokens: 200000,
      tier: 2
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      description: 'Most powerful Claude model for complex tasks',
      provider: 'anthropic',
      maxTokens: 200000,
      tier: 3
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      description: 'Balanced performance and speed',
      provider: 'anthropic',
      maxTokens: 200000,
      tier: 2
    },
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      description: 'Fastest Claude model for quick responses',
      provider: 'anthropic',
      maxTokens: 200000,
      tier: 1
    },
    // Gemini Family
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      description: 'Excellent value with 1M context and multimodal',
      provider: 'google',
      maxTokens: 1000000,
      tier: 2
    },
    {
      id: 'gemini-flash',
      name: 'Gemini Flash',
      description: 'Ultra-fast and cost-effective for high-volume',
      provider: 'google',
      maxTokens: 32000,
      tier: 1
    },
    // HuggingFace CuratedHealth (Your fine-tuned models!)
    {
      id: 'CuratedHealth/meditron70b-qlora-1gpu',
      name: 'Meditron 70B QLoRA',
      description: 'Medical fine-tuned 70B for clinical decision support',
      provider: 'huggingface',
      maxTokens: 16384,
      tier: 3
    },
    {
      id: 'CuratedHealth/Qwen3-8B-SFT-20250917123923',
      name: 'Qwen3 8B SFT',
      description: 'Medical SFT for clinical workflows and documentation',
      provider: 'huggingface',
      maxTokens: 8192,
      tier: 2
    },
    {
      id: 'CuratedHealth/base_7b',
      name: 'CuratedHealth Base 7B',
      description: 'Medical foundational for triage and high-volume',
      provider: 'huggingface',
      maxTokens: 4096,
      tier: 1
    }
  ];
}

/**
 * Get display name for a model based on provider type and model ID
 */
function getModelDisplayName(providerType: string, modelId: string): string {
  // Handle common model ID patterns
  if (modelId.includes('gpt-4-turbo')) return 'GPT-4 Turbo';
  if (modelId.includes('gpt-4')) return 'GPT-4';
  if (modelId.includes('gpt-3.5')) return 'GPT-3.5 Turbo';
  if (modelId.includes('claude-3-opus')) return 'Claude 3 Opus';
  if (modelId.includes('claude-3-sonnet')) return 'Claude 3 Sonnet';
  if (modelId.includes('claude-3-haiku')) return 'Claude 3 Haiku';
  if (modelId.includes('gemini-pro')) return 'Gemini Pro';
  if (modelId.includes('llama')) return 'Llama';

  // Fallback: capitalize and clean up model ID
  return modelId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get description for a model based on provider type and model ID
 */
function getModelDescription(providerType: string, modelId: string): string {
  const descriptions: Record<string, string> = {
    'gpt-4': 'Most capable, best for complex reasoning',
    'gpt-4-turbo': 'Faster GPT-4 with 128K context window',
    'gpt-3.5-turbo': 'Fast and efficient for most tasks',
    'claude-3-opus': 'Most powerful Claude model for complex tasks',
    'claude-3-sonnet': 'Balanced performance and speed',
    'claude-3-haiku': 'Fastest Claude model for quick responses',
    'gemini-pro': 'Google\'s most capable AI model',
  };

  // Try exact match first
  if (descriptions[modelId]) {
    return descriptions[modelId];
  }

  // Try partial match
  for (const [key, desc] of Object.entries(descriptions)) {
    if (modelId.includes(key)) {
      return desc;
    }
  }

  // Default description based on provider
  switch (providerType) {
    case 'openai':
      return 'OpenAI language model';
    case 'anthropic':
      return 'Anthropic Claude model';
    case 'google':
      return 'Google Gemini model';
    case 'meta':
      return 'Meta Llama model';
    default:
      return 'AI language model';
  }
}
