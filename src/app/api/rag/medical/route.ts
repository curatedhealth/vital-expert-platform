/**
 * VITAL Path Medical RAG API Endpoint
 * Enhanced medical domain RAG with PRISM prompt integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

import { prismPromptService, PRISMSuite, KnowledgeDomain } from '@/shared/services/prism/prism-prompt-service';
import { medicalRAGService, MedicalSearchFilters } from '@/shared/services/rag/medical-rag-service';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface MedicalRAGRequest {
  query: string;
  context?: string;
  filters?: MedicalSearchFilters;
  prismSuite?: PRISMSuite;
  useOptimalPrompt?: boolean;
  maxResults?: number;
  similarityThreshold?: number;
  tenantId?: string;
}

interface MedicalRAGApiResponse {
  success: boolean;
  answer: string;
  sources: unknown[];
  medicalInsights: {
    therapeuticAreas: string[];
    evidenceLevels: string[];
    studyTypes: string[];
    regulatoryMentions: string[];
  };
  prismContext?: {
    promptUsed: string;
    suite: PRISMSuite;
    domain: KnowledgeDomain;
  };
  searchMetadata: unknown;
  qualityInsights: unknown;
  recommendations: string[];
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: MedicalRAGRequest = await request.json();

    // Validate required parameters
    if (!body.query || body.query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    // Step 1: Search medical knowledge base
    const searchStartTime = Date.now();

    let searchResponse;
    if (body.prismSuite) {
      // Use PRISM-specific search
      searchResponse = await medicalRAGService.searchWithPRISMContext(
        body.query,
        body.prismSuite,
        body.filters
      );
    } else {
      // Use standard medical search
      searchResponse = await medicalRAGService.search(
        body.query,
        body.filters,
        body.maxResults,
        body.similarityThreshold
      );
    }

    const searchTime = Date.now() - searchStartTime;

    // Step 2: Extract medical insights from search results
    const medicalInsights = {
      therapeuticAreas: searchResponse.medicalInsights?.therapeuticAreas || [],
      evidenceLevels: searchResponse.medicalInsights?.evidenceLevels || [],
      studyTypes: searchResponse.medicalInsights?.studyTypes || [],
      regulatoryMentions: searchResponse.medicalInsights?.regulatoryMentions || []
    };

    // Step 3: Prepare context for LLM
    const sources = searchResponse.results || [];
    const ragContext = sources.map((result: any) => ({
      content: result.content,
      metadata: result.metadata,
      score: result.score
    }));

    // Step 4: Generate response using LLM with PRISM prompts
    const llmStartTime = Date.now();
    let answer = '';
    let prismContext;

    if (body.prismSuite && body.useOptimalPrompt) {
      try {
        // Extract context parameters for prompt compilation
        const contextParameters = {
          query: body.query,
          context: body.context || '',
          knowledge_base_results: ragContext,
          search_metadata: JSON.stringify(searchResponse.searchMetadata),
          quality_insights: JSON.stringify(searchResponse.qualityInsights)
        };

        const compiledPrompt = await prismPromptService.compilePrompt(
          body.prismSuite,
          'medical_query_analysis',
          contextParameters
        );

        const systemPrompt = compiledPrompt.compiledSystemPrompt;
        const userPrompt = compiledPrompt.compiledUserPrompt;

        prismContext = {
          promptUsed: compiledPrompt.promptId,
          suite: body.prismSuite,
          domain: 'medical_affairs' as KnowledgeDomain
        };

        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.1,
          max_tokens: 2000
        });

        answer = completion.choices[0]?.message?.content || 'No response generated';

        // Record prompt usage for analytics
        try {
          await prismPromptService.recordPromptUsage(
            compiledPrompt.promptId,
            body.query,
            undefined, // Rating will be provided by user later
            Date.now() - llmStartTime,
            body.tenantId
          );
        } catch (analyticsError) {
          console.warn('Failed to record prompt usage:', analyticsError);
        }

      } catch (promptError) {
        // Use default prompts if compilation fails
        console.warn('Failed to compile PRISM prompt, using default:', promptError);
        
        const defaultSystemPrompt = `You are a medical AI assistant specialized in healthcare and clinical research. 
        Provide accurate, evidence-based responses using the provided medical knowledge base.`;
        
        const defaultUserPrompt = `Query: ${body.query}
        
        Context: ${body.context || 'No additional context provided'}
        
        Medical Knowledge Base Results:
        ${ragContext.map((result: any) => `- ${result.content}`).join('\n')}
        
        Please provide a comprehensive medical response based on the available information.`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: defaultSystemPrompt },
            { role: 'user', content: defaultUserPrompt }
          ],
          temperature: 0.1,
          max_tokens: 2000
        });

        answer = completion.choices[0]?.message?.content || 'No response generated';
      }
    } else {
      // Use standard medical prompt
      const systemPrompt = `You are a medical AI assistant specialized in healthcare and clinical research. 
      Provide accurate, evidence-based responses using the provided medical knowledge base.`;
      
      const userPrompt = `Query: ${body.query}
      
      Context: ${body.context || 'No additional context provided'}
      
      Medical Knowledge Base Results:
      ${ragContext.map((result: any) => `- ${result.content}`).join('\n')}
      
      Please provide a comprehensive medical response based on the available information.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      answer = completion.choices[0]?.message?.content || 'No response generated';
    }

    const llmTime = Date.now() - llmStartTime;
    const totalTime = Date.now() - searchStartTime;

    const response: MedicalRAGApiResponse = {
      success: true,
      answer,
      sources,
      medicalInsights,
      prismContext,
      searchMetadata: {
        ...searchResponse.searchMetadata,
        llmProcessingTime: llmTime,
        totalProcessingTime: totalTime
      },
      qualityInsights: searchResponse.qualityInsights || {},
      recommendations: searchResponse.recommendedFollowUps || []
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('=== MEDICAL RAG API ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');

    const errorResponse: MedicalRAGApiResponse = {
      success: false,
      answer: 'I apologize, but I encountered an error while processing your medical query. Please try again or contact support if the issue persists.',
      sources: [],
      medicalInsights: {
        therapeuticAreas: [],
        evidenceLevels: [],
        studyTypes: [],
        regulatoryMentions: []
      },
      searchMetadata: {},
      qualityInsights: {},
      recommendations: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// GET endpoint for testing and health checks
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get available PRISM suites and domains for testing

    return NextResponse.json({
      success: true,
      message: 'Medical RAG API is operational',
      capabilities: {
        prismSuites: ['RULES', 'TRIALS', 'GUARD', 'VALUE', 'BRIDGE', 'PROOF', 'CRAFT', 'SCOUT'],
        domains: ['regulatory_compliance', 'clinical_research', 'medical_affairs', 'digital_health'],
        totalPrompts: 0
      },
      usage: 'POST /api/rag/medical with { query, filters?, prismSuite?, useOptimalPrompt? }'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}