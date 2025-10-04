/**
 * Agent RAG Configuration API
 * Manage RAG system assignments and configurations for individual agents
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { agentRAGIntegration } from '@/shared/services/rag/agent-rag-integration';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AgentRAGConfigRequest {
  agentId: string;
  ragSystems: Array<{
    systemId: string;
    systemType: 'medical' | 'enhanced' | 'hybrid' | 'langchain';
    weight: number;
    filters?: any;
  }>;
  defaultRAG: string;
  knowledgeDomains: string[];
  filterPreferences: unknown;
}

// GET /api/agents/rag-config - Get RAG configurations for all agents or specific agent
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (agentId) {
      // Get specific agent configuration
      // Try to get from integration service first
      const config = await agentRAGIntegration.getAgentConfiguration(agentId);

      if (config) {
        return NextResponse.json({
          success: true,
          agentId,
          configuration: config,
          availableRAGSystems: agentRAGIntegration.getAvailableRAGSystems()
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Agent RAG configuration not found'
        }, { status: 404 });
      }
    } else {
      // Get all agent configurations
      // // Get all agents from database
      const { data: agents, error } = await supabase
        .from('agents')
        .select(`
          id,
          name,
          knowledge_domains,
          rag_systems,
          default_rag_system,
          filter_preferences,
          capabilities,
          tier
        `)
        .order('name');

      if (error) {
        // console.error('Failed to fetch agents:', error);
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch agents'
        }, { status: 500 });
      }

      // Get configurations for each agent
      const configurations = await Promise.all(
        (agents || []).map(async (agent) => {
          try {
            const config = await agentRAGIntegration.getAgentConfiguration(agent.id);

            return {
              agentId: agent.id,
              agentName: agent.name,
              tier: agent.tier,
              capabilities: agent.capabilities,
              configuration: config,
              isConfigured: !!config && config.ragSystems.length > 0
            };
          } catch (error) {
            // console.warn(`Failed to get config for agent ${agent.id}:`, error);
            return {
              agentId: agent.id,
              agentName: agent.name,
              tier: agent.tier,
              capabilities: agent.capabilities,
              configuration: null,
              isConfigured: false
            };
          }
        })
      );

      return NextResponse.json({
        success: true,
        totalAgents: configurations.length,
        configurations,
        availableRAGSystems: agentRAGIntegration.getAvailableRAGSystems(),
        summary: {
          configuredAgents: configurations.filter(c => c.isConfigured).length,
          unconfiguredAgents: configurations.filter(c => !c.isConfigured).length,
          ragSystemsInUse: [
            ...new Set(
              configurations
                .filter(c => c.configuration)
                .flatMap(c => c.configuration?.ragSystems.map(r => r.systemId))
            )
          ]
        }
      });
    }

  } catch (error) {
    // console.error('❌ Agent RAG Config API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/agents/rag-config - Update RAG configuration for an agent
export async function POST(request: NextRequest) {
  try {
    const body: AgentRAGConfigRequest = await request.json();

    // Validate required fields
    if (!body.agentId || !body.ragSystems || body.ragSystems.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'agentId and ragSystems are required'
      }, { status: 400 });
    }

    // Validate RAG systems
    const availableSystems = agentRAGIntegration.getAvailableRAGSystems();
    const availableSystemIds = availableSystems.map(s => s.id);

    for (const ragSystem of body.ragSystems) {
      if (!availableSystemIds.includes(ragSystem.systemId)) {
        return NextResponse.json({
          success: false,
          error: `Invalid RAG system: ${ragSystem.systemId}. Available systems: ${availableSystemIds.join(', ')}`
        }, { status: 400 });
      }

      if (ragSystem.weight < 0 || ragSystem.weight > 1) {
        return NextResponse.json({
          success: false,
          error: `Invalid weight for ${ragSystem.systemId}. Must be between 0 and 1.`
        }, { status: 400 });
      }
    }

    // Validate total weights
    const totalWeight = body.ragSystems.reduce((sum, s) => sum + s.weight, 0);

    if (Math.abs(totalWeight - 1.0) > 0.01) {
      return NextResponse.json({
        success: false,
        error: `Total system weights must sum to 1.0. Current total: ${totalWeight}`
      }, { status: 400 });
    }

    // Validate default RAG system
    if (!body.ragSystems.some(s => s.systemId === body.defaultRAG)) {
      return NextResponse.json({
        success: false,
        error: `Default RAG system ${body.defaultRAG} must be included in ragSystems`
      }, { status: 400 });
    }

    // Update configuration
    await agentRAGIntegration.updateAgentRAGConfig(body.agentId, {
      ragSystems: body.ragSystems,
      defaultRAG: body.defaultRAG,
      knowledgeDomains: body.knowledgeDomains || [],
      filterPreferences: body.filterPreferences || { /* TODO: implement */ }
    });

    // Get updated configuration to return
    const updatedConfig = await agentRAGIntegration.getAgentConfiguration(body.agentId);

    return NextResponse.json({
      success: true,
      message: 'Agent RAG configuration updated successfully',
      agentId: body.agentId,
      configuration: updatedConfig,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // console.error('❌ Failed to update agent RAG configuration:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT /api/agents/rag-config - Test agent RAG system
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, testQuery, useMultiRAG = false } = body;

    if (!agentId || !testQuery) {
      return NextResponse.json({
        success: false,
        error: 'agentId and testQuery are required'
      }, { status: 400 });
    }

    // Test the agent's RAG system
    const testStart = Date.now();
    const ragResponse = await agentRAGIntegration.queryAgentRAG({
      query: testQuery,
      agentId,
      context: 'RAG system test',
      useMultiRAG,
      maxResults: 5
    });
    const testTime = Date.now() - testStart;

    return NextResponse.json({
      success: true,
      testResults: {
        agentId,
        testQuery,
        processingTime: testTime,
        ragResponse: {
          sourcesFound: ragResponse.sources.length,
          confidence: ragResponse.confidence,
          ragSystemsUsed: ragResponse.ragSystemsUsed,
          knowledgeDomains: ragResponse.agentContext.knowledgeDomains,
          sources: ragResponse.sources.slice(0, 3).map(source => ({
            title: source.title || source.sourceMetadata?.title || 'Unknown',
            snippet: source.content.substring(0, 200) + '...',
            relevance: source.similarity || source.relevanceScore || 0
          })),
          answer: ragResponse.answer.substring(0, 500) + (ragResponse.answer.length > 500 ? '...' : ''),
          followupSuggestions: ragResponse.followupSuggestions.slice(0, 3)
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // console.error('❌ RAG system test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'RAG system test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/agents/rag-config - Reset agent RAG configuration to default
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json({
        success: false,
        error: 'agentId is required'
      }, { status: 400 });
    }

    // Reset to default configuration
    const defaultConfig = {
      ragSystems: [
        { systemId: 'langchain-general', systemType: 'langchain' as const, weight: 1.0 }
      ],
      defaultRAG: 'langchain-general',
      knowledgeDomains: ['general'],
      filterPreferences: { /* TODO: implement */ }
    };

    await agentRAGIntegration.updateAgentRAGConfig(agentId, defaultConfig);

    return NextResponse.json({
      success: true,
      message: 'Agent RAG configuration reset to default',
      agentId,
      defaultConfiguration: defaultConfig,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // console.error('❌ Failed to reset agent RAG configuration:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to reset configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}