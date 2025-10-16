import { NextRequest, NextResponse } from 'next/server';
import { HuggingFaceService } from '@/lib/services/huggingface-service';

export async function POST(request: NextRequest) {
  try {
    const { model, message } = await request.json();
    
    if (!model || !message) {
      return NextResponse.json(
        { error: 'Model and message are required' },
        { status: 400 }
      );
    }

    // Initialize Hugging Face service with the provided model
    const hfService = new HuggingFaceService(undefined, model);
    
    // Test the model
    const testMessages = [
      {
        role: 'user' as const,
        content: message
      }
    ];
    
    const response = await hfService.generate(testMessages, {
      temperature: 0.7,
      max_tokens: 500
    });
    
    return NextResponse.json({
      success: true,
      model,
      message,
      response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Hugging Face test error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test Hugging Face model',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return available models
  const availableModels = [
    {
      id: 'CuratedHealth/meditron7b-lora-chat',
      name: 'CH Med 7b',
      description: 'Meditron 7B model with LoRA adapter optimized for medical chat'
    },
    {
      id: 'CuratedHealth/meditron70b-qlora-1gpu',
      name: 'CH Med 70b',
      description: 'Large-scale medical model with QLoRA optimization'
    },
    {
      id: 'CuratedHealth/base_7b',
      name: 'CH Intern 7b',
      description: 'Medical-optimized 7B parameter model'
    },
    {
      id: 'CuratedHealth/Qwen3-8B-SFT-20250917123923',
      name: 'CH Q-SFT 8b',
      description: 'Qwen3 8B model with supervised fine-tuning for medical applications'
    }
  ];
  
  return NextResponse.json({
    success: true,
    models: availableModels,
    apiKeyConfigured: !!process.env.HUGGINGFACE_API_KEY
  });
}
