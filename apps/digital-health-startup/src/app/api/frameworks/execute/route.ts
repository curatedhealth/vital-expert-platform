/**
 * Shared Framework Execution API
 * Unified endpoint for LangGraph, AutoGen, and CrewAI
 * 
 * Used by: Ask Expert, Ask Panel, Workflow Designer, Solution Builder
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const FrameworkEnum = z.enum(['langgraph', 'autogen', 'crewai']);

const AgentDefinitionSchema = z.object({
  id: z.string(),
  role: z.string(),
  goal: z.string().optional(),
  backstory: z.string().optional(),
  systemPrompt: z.string(),
  model: z.string().optional(),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
  tools: z.array(z.string()).optional(),
  allowDelegation: z.boolean().optional(),
});

const WorkflowConfigSchema = z.object({
  framework: FrameworkEnum,
  mode: z.enum(['sequential', 'parallel', 'conversational', 'hierarchical']),
  agents: z.array(AgentDefinitionSchema),
  maxRounds: z.number().optional(),
  requireConsensus: z.boolean().optional(),
  streaming: z.boolean().optional(),
  checkpoints: z.boolean().optional(),
  timeout: z.number().optional(),
});

const ExecutionRequestSchema = z.object({
  workflow: WorkflowConfigSchema,
  input: z.object({
    message: z.string().optional(),
    messages: z.array(z.any()).optional(),
    context: z.record(z.any()).optional(),
  }),
  metadata: z.object({
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    source: z.enum(['ask-expert', 'ask-panel', 'workflow-designer', 'solution-builder']).optional(),
  }).optional(),
});

// Shared Python AI Engine URL
const PYTHON_AI_ENGINE_URL = process.env.PYTHON_AI_ENGINE_URL || 'http://localhost:8000';

/**
 * POST /api/frameworks/execute
 * Execute workflow using any framework
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ExecutionRequestSchema.parse(body);
    
    console.log(`🎯 [Framework API] Executing ${validated.workflow.framework} workflow`);
    console.log(`📍 [Framework API] Source: ${validated.metadata?.source || 'unknown'}`);
    console.log(`👥 [Framework API] Agents: ${validated.workflow.agents.length}`);
    
    const startTime = Date.now();
    
    // Route to appropriate Python AI Engine endpoint
    const endpoint = `${PYTHON_AI_ENGINE_URL}/frameworks/${validated.workflow.framework}/execute`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validated),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Framework execution failed');
    }
    
    const result = await response.json();
    const duration = Date.now() - startTime;
    
    console.log(`✅ [Framework API] Execution complete in ${duration}ms`);
    
    return NextResponse.json({
      success: true,
      framework: validated.workflow.framework,
      ...result,
      metadata: {
        ...result.metadata,
        duration,
      },
    });
    
  } catch (error) {
    console.error('❌ [Framework API] Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Execution failed' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/frameworks/generate-code
 * Generate code for any framework (for export/preview)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  if (action === 'frameworks') {
    return NextResponse.json({
      frameworks: ['langgraph', 'autogen', 'crewai'],
      modes: ['sequential', 'parallel', 'conversational', 'hierarchical'],
    });
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

