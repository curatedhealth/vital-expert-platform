import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { SupabaseRAGService } from '@/features/chat/services/supabase-rag-service';
import { llmOrchestrator } from '@/lib/llm/orchestrator';
import { createClient } from '@supabase/supabase-js';
import { ModelType } from '@/types';

const querySchema = z.object({
  question: z.string().min(10).max(1000),
  projectId: z.string().uuid().optional(),
  phase: z.enum(['vision', 'integrate', 'test', 'activate', 'learn']),
  queryType: z.enum(['regulatory', 'clinical', 'market', 'general']),
  includeSystemDocs: z.boolean().default(true),
  useConsensus: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await request.json();
    const { question, projectId, phase, queryType, includeSystemDocs, useConsensus } =
      querySchema.parse(body);

    // Get user and organization from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile and organization
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const organizationId = userProfile.organization_id;

    // Validate project access if projectId is provided
    if (projectId) {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('organization_id', organizationId)
        .single();

      if (projectError || !project) {
        return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
      }
    }

    // Step 1: Retrieve relevant context from Supabase RAG
    const ragService = new SupabaseRAGService();

    const searchResults = await ragService.enhancedSearch(question, {
      agentType: queryType,
      phase,
      maxResults: 5,
      similarityThreshold: 0.7,
      includeMetadata: true,
    });

    // Step 2: Build context from search results
    const context = searchResults.context;

    // Step 3: Select appropriate model(s)
    let llmResponse;
    let modelsUsed: string[] = [];

    if (useConsensus && queryType !== 'general') {
      // Use consensus approach for critical queries
      const models: ModelType[] = [];

      // Always include the primary specialist
      const primaryModel = llmOrchestrator.selectBestModel(queryType, phase);
      models.push(primaryModel);

      // Add complementary models for consensus
      if (queryType === 'regulatory') {
        models.push('clinical-specialist');
      } else if (queryType === 'clinical') {
        models.push('regulatory-expert');
      } else if (queryType === 'market') {
        models.push('regulatory-expert');
      }

      // Add citation validator for high-stakes queries
      models.push('citation-validator');

      const consensusResult = await llmOrchestrator.consensusQuery(
        question,
        context,
        models
      );

      llmResponse = consensusResult.primaryResponse;
      modelsUsed = consensusResult.allResponses.map((r: { model: string }) => r.model);

      // Include consensus metadata
      llmResponse.consensus = {
        agreementScore: consensusResult.agreementScore,
        conflictingPoints: consensusResult.conflictingPoints,
        allResponses: consensusResult.allResponses.length,
        finalConfidence: llmResponse.confidence,
      };

    } else {
      // Single model approach
      const modelType = llmOrchestrator.selectBestModel(queryType, phase);
      llmResponse = await llmOrchestrator.query(question, context, modelType);
      modelsUsed = [llmResponse.model];
    }

    // Step 4: Merge citations from RAG and LLM
    const ragCitations = searchResults.sources.map((source: { metadata: Record<string, unknown>; content: string; similarity: number }) => ({
      source: source.metadata.title || source.metadata.source || 'Unknown',
      url: source.metadata.source || '',
      pageNumber: source.metadata.page_number,
      section: source.metadata.section,
      quote: source.content.substring(0, 200) + '...',
      confidenceScore: source.similarity,
    }));

    const allCitations = [
      ...ragCitations,
      ...llmResponse.citations,
    ];

    // Remove duplicate citations
    const uniqueCitations = allCitations.filter((citation, index, self) =>
      index === self.findIndex(c => c.source === citation.source && c.quote === citation.quote)
    );

    // Step 5: Store query in database
    const { data: queryRecord, error: insertError } = await supabase
      .from('queries')
      .insert({
        organization_id: organizationId,
        project_id: projectId,
        user_id: user.id,
        phase,
        query_text: question,
        query_type: queryType,
        response: {
          content: llmResponse.content,
          model: llmResponse.model,
          confidence: llmResponse.confidence,
          consensus: llmResponse.consensus,
        },
        citations: uniqueCitations,
        confidence_score: llmResponse.confidence,
        models_used: modelsUsed,
        processing_time_ms: llmResponse.processingTime,
        tokens_used: llmResponse.tokensUsed,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error storing query:', insertError);
      // Continue anyway - the response is still valid
    }

    // Step 6: Store citations separately for audit trail
    if (queryRecord && uniqueCitations.length > 0) {
      const citationInserts = uniqueCitations.map(citation => ({
        query_id: queryRecord.id,
        source_type: queryType,
        source_name: citation.source,
        source_url: citation.url,
        page_number: citation.pageNumber,
        section: citation.section,
        quote: citation.quote,
        confidence_score: citation.confidenceScore,
        relevance_score: citation.confidenceScore, // Using same value for now
      }));

      await supabase
        .from('citations')
        .insert(citationInserts);
    }

    // Step 7: Update usage metrics (for billing)
    await updateUsageMetrics(supabase, organizationId, {
      queries: 1,
      tokens: llmResponse.tokensUsed,
    });

    return NextResponse.json({
      id: queryRecord?.id,
      response: llmResponse.content,
      citations: uniqueCitations,
      confidence: llmResponse.confidence,
      consensus: llmResponse.consensus,
      processingTime: llmResponse.processingTime,
      tokensUsed: llmResponse.tokensUsed,
      modelsUsed,
      searchResults: searchResults.sources.length,
    });

  } catch (error) {
    console.error('Query processing error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}

// Helper function to update usage metrics
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateUsageMetrics(
  supabase: ReturnType<typeof createClient<any>>,
  organizationId: string,
  metrics: { queries?: number; tokens?: number }
) {
  try {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Update or insert usage metrics for current month
    if (metrics.queries) {
      await supabase
        .from('usage_metrics')
        .upsert({
          organization_id: organizationId,
          metric_type: 'queries',
          metric_value: metrics.queries,
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
        }, {
          onConflict: 'organization_id,metric_type,period_start',
          ignoreDuplicates: false,
        });
    }

    // Store token usage as well
    if (metrics.tokens) {
      await supabase
        .from('usage_metrics')
        .insert({
          organization_id: organizationId,
          metric_type: 'queries',
          metric_value: metrics.tokens,
          period_start: now.toISOString(),
          period_end: now.toISOString(),
          metadata: { type: 'tokens', value: metrics.tokens },
        });
    }
  } catch (error) {
    console.error('Error updating usage metrics:', error);
    // Don't throw - this is not critical for the main query flow
  }
}