import { NextRequest, NextResponse } from 'next/server';

interface HuggingFaceResponse {
  generated_text?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, model } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get token from environment or request
    const accessToken = process.env.HUGGINGFACE_API_KEY || request.headers.get('x-huggingface-token');
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Hugging Face API token is required' },
        { status: 400 }
      );
    }

    // Medical AI System Prompt for Hugging Face models
    const systemPrompt = `🚀 Medical AI System Prompt for Hugging Face models

## Core Medical Expertise:
- Clinical diagnosis and treatment protocols
- Pharmaceutical development and drug discovery
- Medical research and evidence-based practice
- Healthcare technology and digital therapeutics
- Regulatory compliance and medical ethics
- Patient safety and clinical best practices

## Response Guidelines:
- Provide accurate, current medical information
- Emphasize evidence-based recommendations
- Always recommend consulting healthcare professionals for medical decisions
- Maintain patient safety as the highest priority
- Use clear, professional medical terminology
- Reference current medical guidelines when applicable

## Important Disclaimers:
This AI provides educational information only and should not replace professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical decisions.`;

    // Use new Hugging Face Router API (OpenAI-compatible)
    const response = await fetch('https://api.huggingface.co/models/router', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        model: model || 'microsoft/Phi-3-mini-4k-instruct',
        max_tokens: 1000,
        temperature: 0.3,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // console.error('🚨 Hugging Face API error:', response.status, errorText);

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid Hugging Face access token' },
          { status: 401 }
        );
      }

      if (response.status === 503) {
        return NextResponse.json(
          { error: 'Model is loading, please try again in a few moments' },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: `Hugging Face API error: ${response.status}` },
        { status: response.status }
      );
    }

    // Extract the response text from OpenAI-compatible format
    const result = await response.json();
    let aiResponse = '';
    if (result.choices && result.choices.length > 0) {
      aiResponse = result.choices[0].message?.content || '';
    }

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'No response generated from Hugging Face model' },
        { status: 500 }
      );
    }

    // + '...');

    return NextResponse.json({
      success: true,
      response: aiResponse,
      metadata: {
        model: model,
        provider: 'huggingface',
        apiType: 'router-v1',
        processingTime: Date.now(),
        usage: result.usage || { /* TODO: implement */ }
      }
    });

  } catch (error) {
    // console.error('Hugging Face chat API error:', error);

    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return NextResponse.json(
          { error: 'Failed to connect to Hugging Face API. Please check your internet connection.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to process chat message with Hugging Face model',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'operational',
    service: 'VITAL AI Hugging Face Chat',
    version: '1.0.0',
    provider: 'huggingface'
  });
}