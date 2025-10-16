import type { NextApiRequest, NextApiResponse } from 'next';
import { streamModeAwareWorkflow } from '@/features/chat/services/ask-expert-graph';
import { reasoningEmitter } from '@/features/chat/services/reasoning-emitter';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      message,
      userId,
      sessionId,
      agent,
      interactionMode = 'automatic',
      autonomousMode = false,
      selectedTools = [],
      chatHistory = []
    } = req.body;

    console.log(`🚀 Pages Router Chat API: ${interactionMode} + ${autonomousMode ? 'Autonomous' : 'Normal'} mode`);
    console.log(`🔍 [Pages API] Agent: ${agent?.name || 'none'}`);

    // Validate required fields
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Start reasoning visualization
    reasoningEmitter.startReasoning();
    
    // Add initial step
    reasoningEmitter.addStep({
      type: 'planning',
      title: 'Query Analysis',
      description: 'Understanding user intent and requirements',
      status: 'running'
    });

    // Set up streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Use LangGraph workflow
    const stream = await streamModeAwareWorkflow({
      query: message,
      chatHistory: chatHistory || [],
      selectedAgent: agent,
      interactionMode: interactionMode || 'automatic',
      autonomousMode: autonomousMode || false,
      selectedTools: selectedTools || [],
      // Add reasoning callback
      onStateUpdate: (state) => {
        if (state.workflowStep) {
          const stepTypeMap = {
            'agent_selected': 'agent_selection',
            'knowledge_retrieved': 'rag_retrieval',
            'tools_executed': 'tool_use',
            'response_generated': 'synthesis'
          };

          reasoningEmitter.addStep({
            type: stepTypeMap[state.workflowStep] || 'planning',
            title: state.workflowStep.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: state.metadata?.description || '',
            status: 'completed',
            tokens: state.metadata?.tokens,
            cost: state.metadata?.cost
          });
        }
      }
    });

    // Stream the response
    const reader = stream.getReader();
    const encoder = new TextEncoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Write chunk to response
        res.write(value);
      }
    } finally {
      reader.releaseLock();
    }

    // End the response
    res.end();

  } catch (error) {
    console.error('Pages Router API Error:', error);
    reasoningEmitter.addStep({
      type: 'validation',
      title: 'Error',
      description: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
    
    return res.status(500).json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Configure API route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: false,
  },
}
