import { NextRequest, NextResponse } from 'next/server';

/**
 * Value Investigator API - Proxy to AI Engine
 *
 * This endpoint connects the frontend AIPoweredInsight component to the
 * Value Investigator LangGraph workflow running in the ai-engine service.
 *
 * The Value Investigator uses a 5-tier LLM fallback:
 * 1. Claude Opus 4.5 (extended reasoning)
 * 2. OpenAI o1 (chain-of-thought)
 * 3. Gemini 2.5 Pro (multimodal reasoning)
 * 4. HuggingFace models (MedGemma, DeepSeek-R1, Meditron)
 * 5. GPT-4o (fallback)
 */

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

interface InvestigateRequest {
  query: string;
  tenant_id?: string;
  context_type?: 'jtbd' | 'role' | 'function' | 'category' | 'driver';
  context_id?: string;
}

interface RecommendationItem {
  text: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface CitationItem {
  source: string;
  type: string;
  timestamp?: string;
}

interface InvestigatorResponse {
  success: boolean;
  response: string;
  analysis_type?: string;
  recommendations: RecommendationItem[];
  citations: CitationItem[];
  confidence: number;
  model_used: string;
  reasoning_steps: string[];
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: InvestigateRequest = await request.json();

    if (!body.query || body.query.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Query must be at least 3 characters' },
        { status: 400 }
      );
    }

    // Default to Pharma Enterprise tenant if not specified
    const tenantId = body.tenant_id || 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';

    // Call the Value Investigator agent via ai-engine service
    const response = await fetch(`${AI_ENGINE_URL}/v1/value-investigator/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: body.query,
        tenant_id: tenantId,
        context_type: body.context_type || null,
        context_id: body.context_id || null,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Engine error:', errorText);

      // Return graceful fallback response
      return NextResponse.json({
        success: false,
        response: 'The Value Investigator agent is temporarily unavailable. Please try again later or check if the ai-engine service is running.',
        analysis_type: 'error',
        recommendations: [],
        citations: [],
        confidence: 0,
        model_used: 'none',
        reasoning_steps: ['AI Engine service unavailable'],
        timestamp: new Date().toISOString(),
        error: `AI Engine returned ${response.status}: ${errorText.substring(0, 200)}`
      });
    }

    const data: InvestigatorResponse = await response.json();

    return NextResponse.json({
      success: data.success,
      response: data.response,
      analysis_type: data.analysis_type,
      recommendations: data.recommendations || [],
      citations: data.citations || [],
      confidence: data.confidence,
      model_used: data.model_used,
      reasoning_steps: data.reasoning_steps || [],
      timestamp: data.timestamp || new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error calling Value Investigator:', error);

    return NextResponse.json({
      success: false,
      response: 'Failed to connect to the Value Investigator agent. Ensure the ai-engine service is running at ' + AI_ENGINE_URL,
      analysis_type: 'error',
      recommendations: [],
      citations: [],
      confidence: 0,
      model_used: 'none',
      reasoning_steps: ['Connection error'],
      timestamp: new Date().toISOString(),
      error: String(error)
    }, { status: 503 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get suggested questions from the Value Investigator
    const response = await fetch(`${AI_ENGINE_URL}/v1/value-investigator/suggestions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Return default suggestions if ai-engine is unavailable
      return NextResponse.json({
        suggestions: [
          {
            question: "What's our overall value coverage and where are the gaps?",
            category: 'overview',
            description: 'Get a comprehensive dashboard summary'
          },
          {
            question: 'Show me the top 5 value drivers and their impact',
            category: 'overview',
            description: 'Identify highest-impact value drivers'
          },
          {
            question: 'How can we make our Medical Affairs workflows FASTER?',
            category: 'category',
            description: 'Analyze speed and efficiency opportunities'
          },
          {
            question: "What's driving our SMARTER value category? How can we improve?",
            category: 'category',
            description: 'Analyze decision intelligence drivers'
          },
          {
            question: 'What optimization opportunities are we missing?',
            category: 'gap',
            description: 'Find hidden value opportunities'
          }
        ],
        source: 'fallback'
      });
    }

    const data = await response.json();
    return NextResponse.json({ ...data, source: 'ai-engine' });

  } catch (error) {
    console.error('Error fetching suggestions:', error);

    // Return default suggestions on error
    return NextResponse.json({
      suggestions: [
        {
          question: "What's our overall value coverage and where are the gaps?",
          category: 'overview',
          description: 'Get a comprehensive dashboard summary'
        },
        {
          question: 'Calculate the total ROI potential for this year',
          category: 'roi',
          description: 'Get comprehensive ROI analysis'
        },
        {
          question: 'Which JTBDs have the highest ROI and why?',
          category: 'roi',
          description: 'Identify top ROI contributors'
        }
      ],
      source: 'fallback',
      error: String(error)
    });
  }
}
