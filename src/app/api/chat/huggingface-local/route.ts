import { NextRequest, NextResponse } from 'next/server';

import { huggingFaceLocalService } from '@/shared/services/llm/huggingface-local.service';

export async function POST(request: NextRequest) {
  try {

    const { 
      message, 
      model = 'CuratedHealth/base_7b', 
      context,
      domain,
      systemPrompt,
      compareModels = false
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // // Check if model is available

    if (!availableModels.includes(model)) {
      return NextResponse.json(
        { error: `Model ${model} is not available. Available models: ${availableModels.join(', ')}` },
        { status: 400 }
      );
    }

    let response;

    if (compareModels) {
      // Generate responses from multiple models for comparison

        modelsToCompare,
        message,
        systemPrompt
      );

      response = {
        success: true,
        responses,
        metadata: {
          compared_models: modelsToCompare,
          total_models: modelsToCompare.length,
          processing_time: Date.now()
        }
      };
    } else {
      // Single model response

        model,
        message,
        context,
        domain
      );

      response = {
        success: true,
        response: modelResponse.content,
        metadata: {
          model: modelResponse.metadata.model,
          adapter: modelResponse.metadata.adapter,
          usage: modelResponse.usage,
          processing_time_ms: modelResponse.metadata.processing_time_ms,
          finish_reason: modelResponse.finish_reason
        }
      };
    }

    // return NextResponse.json(response);

  } catch (error) {
    // console.error('Hugging Face local API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process request with local model',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for health check and model status
export async function GET() {
  try {

      modelId,
      loaded: huggingFaceLocalService.isModelLoaded(modelId),
      config: huggingFaceLocalService.getModelConfig(modelId)
    }));

    return NextResponse.json({
      success: true,
      available_models: availableModels,
      model_status: modelStatus,
      service: 'Hugging Face Local Models',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to get model status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
