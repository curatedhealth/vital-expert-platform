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
  // try {
    const body: MedicalRAGRequest = await request.json();
    // ,
    //   filters: body.filters,
    //   prismSuite: body.prismSuite,
    //   useOptimalPrompt: body.useOptimalPrompt
    // });

    // Validate required parameters
    if (!body.query || body.query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    // Step 1: Search medical knowledge base
    // const __searchStartTime = Date.now();

    let searchResponse;
    if (body.prismSuite) {
      // Use PRISM-specific search
      searchResponse = await medicalRAGService.searchWithPRISMContext(
        body.query,
        body.prismSuite,
        body.filters
      );
    } else {
      // Use general medical search
      searchResponse = await medicalRAGService.searchMedicalKnowledge(
        body.query,
        body.filters || { /* TODO: implement */ },
        {
          maxResults: body.maxResults || 10,
          similarityThreshold: body.similarityThreshold || 0.7,
          tenantId: body.tenantId,
          includeMetadata: true
        }
      );
    }

    // // Step 2: Select optimal PRISM prompt if requested

    let prismContext: { promptUsed: string; suite: PRISMSuite; domain: KnowledgeDomain; } | undefined = undefined;

    if (body.useOptimalPrompt || body.prismSuite) {
      const promptSelectionCriteria = {
        domain: body.filters?.domain,
        prismSuite: body.prismSuite,
        query: body.query,
        context: body.context || ''
      };

      prismPrompt = await prismPromptService.selectOptimalPrompt(
        body.query,
        body.context || '',
        promptSelectionCriteria
      );

      if (prismPrompt) {
        // `);

        prismContext = {
          promptUsed: prismPrompt.displayName,
          suite: prismPrompt.prismSuite,
          domain: prismPrompt.domain
        };
      }
    }

    // Step 3: Prepare context from search results
    const contextFromResults = searchResults
      .map((result, index) =>
        `[${index + 1}] ${result.content}\n` +
        `Source: ${result.sourceMetadata.title}\n` +
        `Evidence Level: ${result.sourceMetadata.evidenceLevel}\n` +
        `Therapeutic Areas: ${result.medicalContext.therapeuticAreas.join(', ')}\n`
      )
      .join('\n---\n');

    // Step 4: Generate response using LLM
    // const __llmStartTime = Date.now();
    let systemPrompt = `You are a clinical AI assistant with expertise in evidence-based medicine.

Your responses should:
- Be evidence-based and cite relevant sources
- Include clinical relevance and practical implications
- Address regulatory and safety considerations when applicable
- Highlight evidence quality and limitations
- Provide actionable recommendations where appropriate

Always maintain scientific rigor and acknowledge uncertainties.`;

    let userPrompt = `**User Question:** ${body.query}

**Context:** ${body.context || 'General medical inquiry'}

**Knowledge Base Results:**
${ragContext}

**Search Metadata:**
- Total results found: ${searchResponse.results.length}
- Average quality score: ${searchResponse.qualityInsights.averageQualityScore.toFixed(2)}
- Evidence level distribution: ${Object.entries(searchResponse.qualityInsights.evidenceLevelDistribution).map(([level, count]) => `${level}: ${count}`).join(', ')}

Please provide a detailed response that:
1. Directly answers the user's question
2. Synthesizes information from multiple sources
3. Highlights the strength of evidence
4. Includes relevant citations [1], [2], etc.
5. Notes any limitations or gaps in the evidence
6. Provides actionable insights when appropriate

Use citation numbers [1], [2], etc. to reference the sources provided above.`;

    // Use PRISM prompt if available
    if (prismPrompt) {
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
          prismPrompt.id,
          contextParameters,
          body.tenantId
        );

        systemPrompt = compiledPrompt.compiledSystemPrompt;
        userPrompt = compiledPrompt.compiledUserPrompt;

        // } catch (promptError) {
        // console.warn('Failed to compile PRISM prompt, using default:', promptError);
      } catch (promptError) {
        // Use default prompts if compilation fails
        console.warn('Failed to compile PRISM prompt, using default:', promptError);
      }
    }

    // Generate response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    // // Step 5: Extract medical insights
    const medicalInsights = {
      therapeuticAreas: [...new Set(searchResponse.results.flatMap(r => r.medicalContext.therapeuticAreas))],
      evidenceLevels: [...new Set(searchResponse.results.map(r => r.sourceMetadata.evidenceLevel))],
      studyTypes: [...new Set(searchResponse.results.flatMap(r => r.medicalContext.studyTypes))],
      regulatoryMentions: [...new Set(searchResponse.results.flatMap(r => r.medicalContext.regulatoryMentions))]
    };

    // Step 6: Prepare response sources
    const sources = searchResponse.results.map((result) => ({
      id: result.chunkId,
      title: result.sourceMetadata.title,
      excerpt: result.content.substring(0, 200) + '...',
      similarity: result.similarity,
      relevanceScore: result.relevanceScore,
      qualityScore: result.qualityScore,
      evidenceLevel: result.sourceMetadata.evidenceLevel,
      therapeuticAreas: result.medicalContext.therapeuticAreas,
      citation: `[${index + 1}]`,
      metadata: {
        authors: result.sourceMetadata.authors,
        publicationDate: result.sourceMetadata.publicationDate,
        journal: result.sourceMetadata.journal,
        doi: result.sourceMetadata.doi
      }
    }));

    // Step 7: Record usage analytics
    if (prismPrompt) {
      try {
        await prismPromptService.recordPromptUsage(
          prismPrompt.id,
          body.query,
          undefined, // Rating will be provided by user later
          llmTime,
          body.tenantId
        );
      } catch (analyticsError) {
        // console.warn('Failed to record prompt usage:', analyticsError);
      }
    }

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
      qualityInsights: searchResponse.qualityInsights,
      recommendations: searchResponse.recommendedFollowUps
    };

    return NextResponse.json(response);

  } catch (error) {
    // console.error('=== MEDICAL RAG API ERROR ===');
    // console.error('Error details:', error);
    // console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');

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
      searchMetadata: { /* TODO: implement */ },
      qualityInsights: { /* TODO: implement */ },
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
        prismSuites: Object.keys(analytics.suiteDistribution),
        domains: Object.keys(analytics.domainDistribution),
        totalPrompts: analytics.totalPrompts
      },
      usage: 'POST /api/rag/medical with { query, filters?, prismSuite?, useOptimalPrompt? }'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Service unavailable',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}