import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return a list of available AI models
    const models = [
      {
        id: 'gpt-4',
        name: 'GPT-4',
        description: 'Most capable GPT-4 model for complex tasks',
        provider: 'openai',
        maxTokens: 8192,
        category: 'general'
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: 'Faster and more efficient GPT-4 model',
        provider: 'openai',
        maxTokens: 128000,
        category: 'general'
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and efficient model for most tasks',
        provider: 'openai',
        maxTokens: 16384,
        category: 'general'
      },
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        description: 'Most powerful Claude model for complex reasoning',
        provider: 'anthropic',
        maxTokens: 200000,
        category: 'general'
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        description: 'Balanced Claude model for most tasks',
        provider: 'anthropic',
        maxTokens: 200000,
        category: 'general'
      },
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        description: 'Fast and efficient Claude model',
        provider: 'anthropic',
        maxTokens: 200000,
        category: 'general'
      }
    ];

    return NextResponse.json({
      success: true,
      models,
      source: 'static-config',
      count: models.length
    });
  } catch (error) {
    console.error('Error fetching available models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available models' },
      { status: 500 }
    );
  }
}
