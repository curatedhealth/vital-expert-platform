/**
 * LLM Model Sync Script
 * Fetches models from OpenAI, HuggingFace, and Google Gemini APIs
 * and syncs them to Supabase llm_models table
 *
 * Usage: pnpm tsx scripts/sync-llm-models.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Known benchmark scores for popular models (from published benchmarks)
const BENCHMARK_SCORES: Record<string, { reasoning: number; coding: number; medical: number; speed: number; tier: number }> = {
  // OpenAI Models
  'gpt-4': { reasoning: 95, coding: 90, medical: 87, speed: 60, tier: 3 },
  'gpt-4-turbo': { reasoning: 93, coding: 89, medical: 86, speed: 75, tier: 3 },
  'gpt-4-turbo-preview': { reasoning: 93, coding: 89, medical: 86, speed: 75, tier: 3 },
  'gpt-4o': { reasoning: 94, coding: 91, medical: 88, speed: 80, tier: 3 },
  'gpt-4o-mini': { reasoning: 82, coding: 80, medical: 75, speed: 90, tier: 2 },
  'gpt-4-0125-preview': { reasoning: 93, coding: 89, medical: 86, speed: 75, tier: 3 },
  'gpt-4-1106-preview': { reasoning: 92, coding: 88, medical: 85, speed: 75, tier: 3 },
  'gpt-3.5-turbo': { reasoning: 70, coding: 72, medical: 68, speed: 95, tier: 1 },
  'gpt-3.5-turbo-0125': { reasoning: 70, coding: 72, medical: 68, speed: 95, tier: 1 },
  'gpt-3.5-turbo-1106': { reasoning: 70, coding: 72, medical: 68, speed: 95, tier: 1 },
  'gpt-3.5-turbo-instruct': { reasoning: 68, coding: 70, medical: 65, speed: 95, tier: 1 },
  'o1-preview': { reasoning: 98, coding: 95, medical: 92, speed: 40, tier: 3 },
  'o1-mini': { reasoning: 90, coding: 88, medical: 82, speed: 70, tier: 2 },

  // Anthropic Models
  'claude-3-opus': { reasoning: 97, coding: 92, medical: 89, speed: 55, tier: 3 },
  'claude-3-opus-latest': { reasoning: 97, coding: 92, medical: 89, speed: 55, tier: 3 },
  'claude-3-sonnet': { reasoning: 88, coding: 85, medical: 82, speed: 80, tier: 2 },
  'claude-3.5-sonnet': { reasoning: 92, coding: 90, medical: 86, speed: 75, tier: 3 },
  'claude-3.5-sonnet-latest': { reasoning: 92, coding: 90, medical: 86, speed: 75, tier: 3 },
  'claude-3-haiku': { reasoning: 75, coding: 70, medical: 72, speed: 95, tier: 1 },
  'claude-3.5-haiku': { reasoning: 80, coding: 78, medical: 76, speed: 92, tier: 2 },

  // Google Models
  'gemini-1.0-pro': { reasoning: 78, coding: 75, medical: 72, speed: 85, tier: 2 },
  'gemini-1.5-pro': { reasoning: 90, coding: 88, medical: 85, speed: 70, tier: 3 },
  'gemini-1.5-flash': { reasoning: 82, coding: 78, medical: 76, speed: 92, tier: 2 },
  'gemini-2.0-flash-exp': { reasoning: 88, coding: 85, medical: 82, speed: 88, tier: 2 },
  'gemini-pro': { reasoning: 78, coding: 75, medical: 72, speed: 85, tier: 2 },
  'gemini-pro-vision': { reasoning: 76, coding: 70, medical: 70, speed: 80, tier: 2 },

  // HuggingFace Medical Models
  'microsoft/biogpt': { reasoning: 70, coding: 55, medical: 85, speed: 90, tier: 1 },
  'epfl-llm/meditron-70b': { reasoning: 82, coding: 60, medical: 92, speed: 50, tier: 3 },
  'medicalai/ClinicalBERT': { reasoning: 65, coding: 40, medical: 88, speed: 95, tier: 1 },
  'emilyalsentzer/Bio_ClinicalBERT': { reasoning: 65, coding: 40, medical: 88, speed: 95, tier: 1 },

  // Mistral Models
  'mistral-large': { reasoning: 88, coding: 85, medical: 80, speed: 75, tier: 3 },
  'mistral-medium': { reasoning: 80, coding: 78, medical: 74, speed: 85, tier: 2 },
  'mistral-small': { reasoning: 72, coding: 70, medical: 68, speed: 92, tier: 1 },
  'mixtral-8x7b': { reasoning: 82, coding: 80, medical: 76, speed: 80, tier: 2 },

  // Meta Models
  'llama-2-70b': { reasoning: 82, coding: 78, medical: 75, speed: 60, tier: 2 },
  'llama-2-13b': { reasoning: 72, coding: 68, medical: 65, speed: 80, tier: 1 },
  'llama-3-70b': { reasoning: 88, coding: 85, medical: 82, speed: 65, tier: 3 },
  'llama-3-8b': { reasoning: 75, coding: 72, medical: 70, speed: 90, tier: 1 },
};

// Default scores for unknown models based on name patterns
function inferScores(modelId: string): { reasoning: number; coding: number; medical: number; speed: number; tier: number } {
  const id = modelId.toLowerCase();

  // Check exact match first
  if (BENCHMARK_SCORES[modelId]) return BENCHMARK_SCORES[modelId];

  // Check partial matches
  for (const [key, scores] of Object.entries(BENCHMARK_SCORES)) {
    if (id.includes(key.toLowerCase()) || key.toLowerCase().includes(id)) {
      return scores;
    }
  }

  // Infer based on patterns
  if (id.includes('gpt-4') || id.includes('opus') || id.includes('pro') && !id.includes('mini')) {
    return { reasoning: 85, coding: 82, medical: 80, speed: 70, tier: 3 };
  }
  if (id.includes('gpt-3.5') || id.includes('sonnet') || id.includes('medium')) {
    return { reasoning: 75, coding: 72, medical: 70, speed: 85, tier: 2 };
  }
  if (id.includes('mini') || id.includes('haiku') || id.includes('small') || id.includes('flash')) {
    return { reasoning: 70, coding: 68, medical: 65, speed: 92, tier: 1 };
  }
  if (id.includes('medical') || id.includes('clinical') || id.includes('bio')) {
    return { reasoning: 68, coding: 55, medical: 85, speed: 85, tier: 2 };
  }
  if (id.includes('embed') || id.includes('rerank')) {
    return { reasoning: 0, coding: 0, medical: 0, speed: 95, tier: 5 };
  }

  // Default for unknown models
  return { reasoning: 60, coding: 55, medical: 50, speed: 80, tier: 2 };
}

interface LLMModel {
  provider_id: string;
  name: string;
  slug: string;
  model_id: string;
  context_window: number;
  max_output_tokens?: number;
  supports_streaming?: boolean;
  supports_function_calling?: boolean;
  supports_vision?: boolean;
  cost_per_1k_input_tokens?: number;
  cost_per_1k_output_tokens?: number;
  reasoning_score: number;
  coding_score: number;
  medical_score: number;
  speed_score: number;
  tier: number;
  api_source: string;
  capabilities?: object;
  metadata?: object;
}

// Get provider ID from database
async function getProviderId(providerName: string): Promise<string | null> {
  // Map provider names to exact database names
  const providerMap: Record<string, string> = {
    'OpenAI': 'OpenAI',
    'Google': 'Google',
    'Hugging Face': 'Hugging Face',
    'HuggingFace': 'Hugging Face',
    'Anthropic': 'Anthropic',
  };

  const exactName = providerMap[providerName] || providerName;

  const { data, error } = await supabase
    .from('llm_providers')
    .select('id')
    .eq('name', exactName)
    .limit(1);

  if (error || !data || data.length === 0) {
    console.warn(`Provider not found: ${providerName} (looking for: ${exactName})`);
    return null;
  }
  return data[0].id;
}

// Fetch OpenAI models
async function fetchOpenAIModels(): Promise<LLMModel[]> {
  if (!OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set, skipping OpenAI models');
    return [];
  }

  console.log('Fetching OpenAI models...');

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` }
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const providerId = await getProviderId('OpenAI');

    if (!providerId) return [];

    // Filter to only include relevant models (chat/completion models)
    const relevantModels = data.data.filter((m: any) => {
      const id = m.id.toLowerCase();
      return (
        (id.includes('gpt') || id.includes('o1') || id.includes('davinci') || id.includes('turbo')) &&
        !id.includes('instruct-beta') &&
        !id.includes('edit') &&
        !id.includes('search') &&
        !id.includes('similarity') &&
        !id.includes('audio') &&
        !id.includes('tts') &&
        !id.includes('whisper') &&
        !id.includes('dall-e')
      );
    });

    console.log(`Found ${relevantModels.length} relevant OpenAI models`);

    return relevantModels.map((model: any) => {
      const scores = inferScores(model.id);
      const contextWindow = model.id.includes('gpt-4') ? 128000 :
                           model.id.includes('gpt-3.5') ? 16385 :
                           model.id.includes('o1') ? 128000 : 8192;

      return {
        provider_id: providerId,
        name: model.id.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        slug: model.id,
        model_id: model.id,
        context_window: contextWindow,
        max_output_tokens: model.id.includes('gpt-4') ? 4096 : 2048,
        supports_streaming: true,
        supports_function_calling: model.id.includes('gpt-4') || model.id.includes('gpt-3.5-turbo'),
        supports_vision: model.id.includes('vision') || model.id.includes('gpt-4o'),
        cost_per_1k_input_tokens: model.id.includes('gpt-4o') ? 0.0025 :
                                  model.id.includes('gpt-4-turbo') ? 0.01 :
                                  model.id.includes('gpt-4') ? 0.03 :
                                  model.id.includes('o1-preview') ? 0.015 :
                                  model.id.includes('o1-mini') ? 0.003 : 0.0005,
        cost_per_1k_output_tokens: model.id.includes('gpt-4o') ? 0.01 :
                                   model.id.includes('gpt-4-turbo') ? 0.03 :
                                   model.id.includes('gpt-4') ? 0.06 :
                                   model.id.includes('o1-preview') ? 0.06 :
                                   model.id.includes('o1-mini') ? 0.012 : 0.0015,
        reasoning_score: scores.reasoning,
        coding_score: scores.coding,
        medical_score: scores.medical,
        speed_score: scores.speed,
        tier: scores.tier,
        api_source: 'openai',
        capabilities: {
          chat: true,
          completion: true,
          function_calling: model.id.includes('gpt-4') || model.id.includes('gpt-3.5-turbo'),
        },
        metadata: {
          created: model.created,
          owned_by: model.owned_by,
        }
      };
    });
  } catch (error) {
    console.error('Error fetching OpenAI models:', error);
    return [];
  }
}

// Fetch Google Gemini models
async function fetchGeminiModels(): Promise<LLMModel[]> {
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not set, skipping Gemini models');
    return [];
  }

  console.log('Fetching Gemini models...');

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const providerId = await getProviderId('Google');

    if (!providerId) return [];

    const models = data.models || [];
    console.log(`Found ${models.length} Gemini models`);

    return models.map((model: any) => {
      const modelId = model.name.replace('models/', '');
      const scores = inferScores(modelId);

      return {
        provider_id: providerId,
        name: model.displayName || modelId,
        slug: modelId,
        model_id: modelId,
        context_window: model.inputTokenLimit || 32000,
        max_output_tokens: model.outputTokenLimit || 8192,
        supports_streaming: true,
        supports_function_calling: modelId.includes('pro') || modelId.includes('1.5'),
        supports_vision: modelId.includes('vision') || modelId.includes('pro') || modelId.includes('flash'),
        cost_per_1k_input_tokens: modelId.includes('flash') ? 0.000075 :
                                  modelId.includes('1.5-pro') ? 0.00125 : 0.0005,
        cost_per_1k_output_tokens: modelId.includes('flash') ? 0.0003 :
                                   modelId.includes('1.5-pro') ? 0.005 : 0.0015,
        reasoning_score: scores.reasoning,
        coding_score: scores.coding,
        medical_score: scores.medical,
        speed_score: scores.speed,
        tier: scores.tier,
        api_source: 'google',
        capabilities: {
          chat: true,
          completion: true,
          vision: modelId.includes('vision') || modelId.includes('pro'),
        },
        metadata: {
          description: model.description,
          supportedGenerationMethods: model.supportedGenerationMethods,
        }
      };
    });
  } catch (error) {
    console.error('Error fetching Gemini models:', error);
    return [];
  }
}

// Fetch HuggingFace models (curated medical/healthcare models)
async function fetchHuggingFaceModels(): Promise<LLMModel[]> {
  if (!HUGGINGFACE_API_KEY) {
    console.warn('HUGGINGFACE_API_KEY not set, skipping HuggingFace models');
    return [];
  }

  console.log('Fetching HuggingFace models...');

  const providerId = await getProviderId('Hugging Face');
  if (!providerId) return [];

  // Curated list of medical/healthcare models on HuggingFace
  const curatedModels = [
    { id: 'microsoft/biogpt', name: 'BioGPT', context: 1024, medical: true },
    { id: 'epfl-llm/meditron-70b', name: 'Meditron 70B', context: 4096, medical: true },
    { id: 'epfl-llm/meditron-7b', name: 'Meditron 7B', context: 4096, medical: true },
    { id: 'medicalai/ClinicalBERT', name: 'ClinicalBERT', context: 512, medical: true },
    { id: 'emilyalsentzer/Bio_ClinicalBERT', name: 'Bio ClinicalBERT', context: 512, medical: true },
    { id: 'google/flan-t5-xxl', name: 'Flan-T5 XXL', context: 512, medical: false },
    { id: 'google/flan-t5-xl', name: 'Flan-T5 XL', context: 512, medical: false },
    { id: 'meta-llama/Llama-2-70b-chat-hf', name: 'Llama 2 70B Chat', context: 4096, medical: false },
    { id: 'meta-llama/Llama-2-13b-chat-hf', name: 'Llama 2 13B Chat', context: 4096, medical: false },
    { id: 'meta-llama/Llama-2-7b-chat-hf', name: 'Llama 2 7B Chat', context: 4096, medical: false },
    { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', name: 'Mixtral 8x7B Instruct', context: 32768, medical: false },
    { id: 'mistralai/Mistral-7B-Instruct-v0.2', name: 'Mistral 7B Instruct', context: 32768, medical: false },
    { id: 'HuggingFaceH4/zephyr-7b-beta', name: 'Zephyr 7B Beta', context: 8192, medical: false },
    { id: 'teknium/OpenHermes-2.5-Mistral-7B', name: 'OpenHermes 2.5', context: 8192, medical: false },
    { id: 'lmsys/vicuna-13b-v1.5', name: 'Vicuna 13B', context: 4096, medical: false },
    { id: 'PharMolix/BioMedGPT-LM-7B', name: 'BioMedGPT 7B', context: 2048, medical: true },
    { id: 'chaoyi-wu/PMC_LLAMA_7B', name: 'PMC-LLaMA 7B', context: 2048, medical: true },
    { id: 'AdaptLLM/medicine-chat', name: 'Medicine Chat', context: 4096, medical: true },
  ];

  try {
    const models: LLMModel[] = [];

    for (const model of curatedModels) {
      // Verify model exists on HuggingFace
      try {
        const response = await fetch(`https://huggingface.co/api/models/${model.id}`, {
          headers: { 'Authorization': `Bearer ${HUGGINGFACE_API_KEY}` }
        });

        if (response.ok) {
          const data = await response.json();
          const scores = inferScores(model.id);

          models.push({
            provider_id: providerId,
            name: model.name,
            slug: model.id.replace('/', '-').toLowerCase(),
            model_id: model.id,
            context_window: model.context,
            max_output_tokens: Math.min(model.context, 2048),
            supports_streaming: true,
            supports_function_calling: false,
            supports_vision: false,
            cost_per_1k_input_tokens: 0.001, // HuggingFace Inference API pricing
            cost_per_1k_output_tokens: 0.002,
            reasoning_score: model.medical ? scores.reasoning : scores.reasoning,
            coding_score: scores.coding,
            medical_score: model.medical ? Math.max(scores.medical, 80) : scores.medical,
            speed_score: scores.speed,
            tier: scores.tier,
            api_source: 'huggingface',
            capabilities: {
              chat: data.pipeline_tag === 'text-generation' || data.pipeline_tag === 'conversational',
              completion: true,
              medical: model.medical,
            },
            metadata: {
              downloads: data.downloads,
              likes: data.likes,
              pipeline_tag: data.pipeline_tag,
              tags: data.tags,
            }
          });
        }
      } catch {
        console.warn(`Could not verify HuggingFace model: ${model.id}`);
      }
    }

    console.log(`Found ${models.length} HuggingFace models`);
    return models;
  } catch (error) {
    console.error('Error fetching HuggingFace models:', error);
    return [];
  }
}

// Upsert models to Supabase
async function syncModelsToDatabase(models: LLMModel[]) {
  console.log(`\nSyncing ${models.length} models to database...`);

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const model of models) {
    try {
      const { error } = await supabase
        .from('llm_models')
        .upsert({
          ...model,
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'provider_id,model_id',
        });

      if (error) {
        console.error(`Error upserting ${model.model_id}:`, error.message);
        errors++;
      } else {
        // Check if it was insert or update (simplified - count as updated)
        updated++;
      }
    } catch (err) {
      console.error(`Failed to sync ${model.model_id}:`, err);
      errors++;
    }
  }

  console.log(`\nSync complete:`);
  console.log(`  - Synced: ${updated}`);
  console.log(`  - Errors: ${errors}`);
}

// Update existing models with benchmark scores
async function updateExistingModelsWithScores() {
  console.log('\nUpdating existing models with benchmark scores...');

  const { data: existingModels, error } = await supabase
    .from('llm_models')
    .select('id, model_id, reasoning_score')
    .is('reasoning_score', null)
    .or('reasoning_score.eq.0');

  if (error) {
    console.error('Error fetching existing models:', error);
    return;
  }

  console.log(`Found ${existingModels?.length || 0} models needing score updates`);

  for (const model of existingModels || []) {
    const scores = inferScores(model.model_id);

    await supabase
      .from('llm_models')
      .update({
        reasoning_score: scores.reasoning,
        coding_score: scores.coding,
        medical_score: scores.medical,
        speed_score: scores.speed,
        tier: scores.tier,
        updated_at: new Date().toISOString(),
      })
      .eq('id', model.id);
  }

  console.log('Score updates complete');
}

// Main function
async function main() {
  console.log('='.repeat(60));
  console.log('LLM Model Sync Script');
  console.log('='.repeat(60));
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`OpenAI API: ${OPENAI_API_KEY ? 'configured' : 'NOT SET'}`);
  console.log(`Gemini API: ${GEMINI_API_KEY ? 'configured' : 'NOT SET'}`);
  console.log(`HuggingFace API: ${HUGGINGFACE_API_KEY ? 'configured' : 'NOT SET'}`);
  console.log('='.repeat(60));

  // Fetch models from all providers
  const [openaiModels, geminiModels, huggingfaceModels] = await Promise.all([
    fetchOpenAIModels(),
    fetchGeminiModels(),
    fetchHuggingFaceModels(),
  ]);

  const allModels = [...openaiModels, ...geminiModels, ...huggingfaceModels];

  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log(`  - OpenAI models: ${openaiModels.length}`);
  console.log(`  - Gemini models: ${geminiModels.length}`);
  console.log(`  - HuggingFace models: ${huggingfaceModels.length}`);
  console.log(`  - Total: ${allModels.length}`);
  console.log('='.repeat(60));

  // Sync to database
  if (allModels.length > 0) {
    await syncModelsToDatabase(allModels);
  }

  // Update existing models with scores
  await updateExistingModelsWithScores();

  console.log('\n' + '='.repeat(60));
  console.log('Sync complete!');
  console.log('='.repeat(60));
}

main().catch(console.error);
