import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { AutonomousOrchestrator } from '../../../../features/autonomous/autonomous-orchestrator';
import { createEnhancedModeAwareWorkflowGraph } from '../../../../features/autonomous/enhanced-ask-expert-graph';

// Task Management Interface
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  tools: string[];
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

class TaskManager {
  private tasks: Task[] = [];
  private currentTaskIndex = 0;

  createTask(title: string, description: string, priority: 'low' | 'medium' | 'high' = 'medium', tools: string[] = []): Task {
    const task: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      status: 'pending',
      priority,
      tools,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tasks.push(task);
    return task;
  }

  getNextTask(): Task | null {
    const pendingTask = this.tasks.find(task => task.status === 'pending');
    return pendingTask || null;
  }

  updateTaskStatus(taskId: string, status: Task['status'], result?: any, error?: string): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      task.updatedAt = new Date();
      if (result) task.result = result;
      if (error) task.error = error;
    }
  }

  getAllTasks(): Task[] {
    return [...this.tasks];
  }

  getCompletedTasks(): Task[] {
    return this.tasks.filter(task => task.status === 'completed');
  }

  getProgress(): { completed: number; total: number; percentage: number } {
    const completed = this.tasks.filter(task => task.status === 'completed').length;
    const total = this.tasks.length;
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }
}

// Available Tools for ReAct Loop
const createWebSearchTool = () => new Tool({
  name: 'web_search',
  description: 'Search the web for current information about a topic',
  schema: z.object({
    query: z.string().describe('The search query'),
    maxResults: z.number().optional().describe('Maximum number of results to return')
  }),
  func: async ({ query, maxResults = 5 }) => {
    // Simulate web search - in real implementation, use actual search API
    console.log(`🔍 [Tool] Web search for: ${query}`);
    return {
      query,
      results: [
        { title: `Research about ${query}`, url: 'https://example.com/1', snippet: `Latest findings on ${query}...` },
        { title: `Market analysis for ${query}`, url: 'https://example.com/2', snippet: `Market trends and opportunities in ${query}...` },
        { title: `Regulatory guidelines for ${query}`, url: 'https://example.com/3', snippet: `Regulatory requirements and compliance for ${query}...` }
      ].slice(0, maxResults)
    };
  }
});

const createDataAnalysisTool = () => new Tool({
  name: 'data_analysis',
  description: 'Analyze data and generate insights',
  schema: z.object({
    data: z.any().describe('The data to analyze'),
    analysisType: z.string().describe('Type of analysis to perform')
  }),
  func: async ({ data, analysisType }) => {
    console.log(`📊 [Tool] Data analysis: ${analysisType}`);
    return {
      analysisType,
      insights: `Analysis of ${analysisType} reveals key patterns and opportunities...`,
      recommendations: `Based on the analysis, here are strategic recommendations...`
    };
  }
});

const createRegulatoryCheckTool = () => new Tool({
  name: 'regulatory_check',
  description: 'Check regulatory requirements and compliance guidelines',
  schema: z.object({
    domain: z.string().describe('The domain or field to check regulations for'),
    region: z.string().optional().describe('Specific region or jurisdiction')
  }),
  func: async ({ domain, region = 'US' }) => {
    console.log(`⚖️ [Tool] Regulatory check for: ${domain} in ${region}`);
    return {
      domain,
      region,
      requirements: [
        'FDA 510(k) clearance required for medical devices',
        'HIPAA compliance for patient data protection',
        'Clinical trial protocols must be followed',
        'Post-market surveillance requirements'
      ],
      timeline: '6-18 months for regulatory approval',
      cost: '$50,000 - $500,000 depending on complexity'
    };
  }
});

// ReAct Loop Implementation
async function runReActLoop(query: string, controller: ReadableStreamDefaultController, encoder: TextEncoder) {
  const llm = new ChatOpenAI({
    modelName: 'gpt-4o',
    temperature: 0.3,
    streaming: false, // We'll handle streaming manually
  });

  const taskManager = new TaskManager();
  const tools = [
    createWebSearchTool(),
    createDataAnalysisTool(),
    createRegulatoryCheckTool()
  ];

  // Step 1: REASON - Analyze the problem and create tasks
  console.log('🧠 [ReAct] Step 1: Reasoning about the problem...');
  
  const reasoningPrompt = `You are an autonomous digital health strategy expert. Analyze this query and create a comprehensive task plan.

Query: "${query}"

Create 3-5 specific tasks that need to be completed to provide a thorough response. Each task should be actionable and use specific tools.

Format your response as JSON with this structure:
{
  "analysis": "Your analysis of the problem",
  "tasks": [
    {
      "title": "Task title",
      "description": "Detailed task description",
      "priority": "high|medium|low",
      "tools": ["tool1", "tool2"]
    }
  ]
}`;

  const reasoningResponse = await llm.invoke(reasoningPrompt);
  const reasoningData = JSON.parse(reasoningResponse.content as string);
  
  // Send reasoning analysis
  const reasoningEvent = {
    type: 'reasoning',
    step: 'analysis',
    status: 'completed',
    description: reasoningData.analysis,
    timestamp: new Date().toISOString()
  };
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(reasoningEvent)}\n\n`));

  // Create tasks
  console.log('📋 [ReAct] Creating tasks...');
  for (const taskData of reasoningData.tasks) {
    const task = taskManager.createTask(
      taskData.title,
      taskData.description,
      taskData.priority,
      taskData.tools
    );
    
    const taskEvent = {
      type: 'task_created',
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        tools: task.tools
      },
      timestamp: new Date().toISOString()
    };
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(taskEvent)}\n\n`));
  }

  // Step 2: ACT - Execute tasks using tools
  console.log('⚡ [ReAct] Step 2: Executing tasks...');
  
  let currentTask = taskManager.getNextTask();
  while (currentTask) {
    console.log(`🔄 [ReAct] Executing task: ${currentTask.title}`);
    
    // Update task status to in_progress
    taskManager.updateTaskStatus(currentTask.id, 'in_progress');
    
    const taskUpdateEvent = {
      type: 'task_update',
      taskId: currentTask.id,
      status: 'in_progress',
      timestamp: new Date().toISOString()
    };
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(taskUpdateEvent)}\n\n`));

    try {
      // Execute tools for this task
      let taskResult = '';
      for (const toolName of currentTask.tools) {
        const tool = tools.find(t => t.name === toolName);
        if (tool) {
          console.log(`🔧 [ReAct] Using tool: ${toolName}`);
          
          const toolEvent = {
            type: 'tool_usage',
            tool: toolName,
            taskId: currentTask.id,
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(toolEvent)}\n\n`));

          // Simulate tool execution with query context
          const toolResult = await tool.func({ 
            query: query,
            domain: query,
            analysisType: currentTask.title
          });
          
          taskResult += `\n\n**${toolName} Results:**\n${JSON.stringify(toolResult, null, 2)}`;
        }
      }

      // Mark task as completed
      taskManager.updateTaskStatus(currentTask.id, 'completed', taskResult);
      
      const taskCompleteEvent = {
        type: 'task_completed',
        taskId: currentTask.id,
        result: taskResult,
        timestamp: new Date().toISOString()
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(taskCompleteEvent)}\n\n`));

      // Send progress update
      const progress = taskManager.getProgress();
      const progressEvent = {
        type: 'progress_update',
        completed: progress.completed,
        total: progress.total,
        percentage: progress.percentage,
        timestamp: new Date().toISOString()
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(progressEvent)}\n\n`));

    } catch (error) {
      console.error(`❌ [ReAct] Task failed: ${currentTask.title}`, error);
      taskManager.updateTaskStatus(currentTask.id, 'failed', null, error instanceof Error ? error.message : 'Unknown error');
      
      const taskFailedEvent = {
        type: 'task_failed',
        taskId: currentTask.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(taskFailedEvent)}\n\n`));
    }

    // Get next task
    currentTask = taskManager.getNextTask();
  }

  // Step 3: SYNTHESIZE - Generate final response based on all task results
  console.log('📝 [ReAct] Step 3: Synthesizing final response...');
  
  const synthesisPrompt = `Based on the completed tasks and their results, provide a comprehensive response to the user's query: "${query}"

Task Results:
${taskManager.getAllTasks().map(task => 
  `Task: ${task.title}\nStatus: ${task.status}\nResult: ${task.result || 'N/A'}\n`
).join('\n')}

Provide a well-structured, comprehensive response that addresses the user's query using insights from all completed tasks.`;

  const synthesisResponse = await llm.invoke(synthesisPrompt);
  
  // Stream the final response
  const finalContent = synthesisResponse.content as string;
  const contentChunks = finalContent.split('\n');
  
  for (const chunk of contentChunks) {
    const contentEvent = {
      type: 'content',
      content: chunk + '\n',
      timestamp: new Date().toISOString()
    };
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(contentEvent)}\n\n`));
  }

  console.log('✅ [ReAct] Loop completed successfully');
}

export async function POST(request: NextRequest) {
  console.log('🚀 [Autonomous API] POST request received');
  
  try {
    const body = await request.json();
    console.log('📥 [Autonomous API] Request body:', { 
      query: body.query, 
      mode: body.mode,
      isAutonomousMode: body.isAutonomousMode 
    });

    const { query, mode = 'automatic' } = body;

    // Validate required fields
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Create a streaming response with reasoning steps
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        
        // Send initial reasoning step
        const initialStep = {
          type: 'reasoning',
          step: 1,
          status: 'in_progress',
          description: `Analyzing your request for "${query}" and developing a comprehensive strategy...`,
          timestamp: new Date().toISOString()
        };
        
        console.log('🧠 [API] Sending initial reasoning step:', initialStep);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialStep)}\n\n`));

        // Simulate reasoning steps with delays - INTELLIGENT ANALYSIS
        const reasoningSteps = [
          {
            type: 'reasoning',
            step: 2,
            status: 'in_progress',
            description: 'Analyzing query context and extracting key requirements...',
            timestamp: new Date().toISOString()
          },
          {
            type: 'reasoning',
            step: 3,
            status: 'in_progress',
            description: 'Researching relevant digital health technologies and approaches...',
            timestamp: new Date().toISOString()
          },
          {
            type: 'reasoning',
            step: 4,
            status: 'in_progress',
            description: 'Evaluating regulatory and compliance considerations...',
            timestamp: new Date().toISOString()
          },
          {
            type: 'reasoning',
            step: 5,
            status: 'completed',
            description: 'Generating comprehensive AI-powered strategy analysis...',
            timestamp: new Date().toISOString()
          }
        ];

        // Send reasoning steps with delays
        let stepIndex = 0;
        const sendNextStep = () => {
          if (stepIndex < reasoningSteps.length) {
            const step = reasoningSteps[stepIndex];
            console.log('🧠 [API] Sending reasoning step:', step);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(step)}\n\n`));
            stepIndex++;
            setTimeout(sendNextStep, 2000); // 2 second delay between steps
          } else {
            // Wait a bit before starting ReAct loop after reasoning is complete
            console.log('🧠 [API] All reasoning steps complete, starting ReAct loop...');
            setTimeout(async () => {
              // Implement ReAct Loop with tool usage
              try {
                await runReActLoop(query, controller, encoder);
              } catch (reactError) {
                console.error('❌ [API] ReAct loop failed:', reactError);
                
                // Fallback response if ReAct fails
                const fallbackContent = `I apologize, but I encountered an issue while processing your query: "${query}". 

Please try rephrasing your question or contact support if the issue persists.`;
                
                const contentEvent = {
                  type: 'content',
                  content: fallbackContent,
                  timestamp: new Date().toISOString()
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(contentEvent)}\n\n`));
              }

              // Send completion event after AI analysis
              const completionEvent = {
                type: 'complete',
                message: 'AI analysis completed successfully',
                timestamp: new Date().toISOString()
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(completionEvent)}\n\n`));
            controller.close();
              
            }, 3000); // Wait 3 seconds after reasoning is complete
          }
        };
        
        setTimeout(sendNextStep, 500); // Start reasoning steps after 500ms
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('❌ [Autonomous API] Error:', error);
    console.error('❌ [Autonomous API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}