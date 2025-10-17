import { NextRequest, NextResponse } from 'next/server';
import { autonomousOrchestrator } from '@/features/autonomous/autonomous-orchestrator';
import { taskGenerator } from '@/features/autonomous/task-generator';
import { safetyManager } from '@/features/autonomous/safety-manager';

// In-memory task storage (in production, this would be a database)
const taskStorage = new Map<string, any>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status'); // 'pending', 'in_progress', 'completed', 'failed'

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get tasks for the session
    const sessionTasks = Array.from(taskStorage.values())
      .filter(task => task.sessionId === sessionId)
      .filter(task => !status || task.status === status);

    // Get current execution status
    const executionStatus = autonomousOrchestrator.getStatus();

    return NextResponse.json({
      tasks: sessionTasks,
      executionStatus,
      totalTasks: sessionTasks.length,
      pendingTasks: sessionTasks.filter(t => t.status === 'pending').length,
      inProgressTasks: sessionTasks.filter(t => t.status === 'in_progress').length,
      completedTasks: sessionTasks.filter(t => t.status === 'completed').length,
      failedTasks: sessionTasks.filter(t => t.status === 'failed').length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [Tasks API] GET error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      userId,
      description,
      type = 'general',
      priority = 5,
      dependencies = [],
      estimatedCost = 1.0,
      maxRetries = 3
    } = body;

    // Validate required fields
    if (!sessionId || !description) {
      return NextResponse.json(
        { error: 'Session ID and description are required' },
        { status: 400 }
      );
    }

    // Check safety limits
    const safetyCheck = safetyManager.canExecute(description, estimatedCost);
    if (!safetyCheck.allowed) {
      return NextResponse.json(
        { 
          error: 'Task creation blocked by safety manager',
          violations: safetyCheck.violations,
          warnings: safetyCheck.warnings
        },
        { status: 403 }
      );
    }

    // Create new task
    const task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description,
      type,
      priority,
      status: 'pending',
      dependencies,
      estimatedCost,
      maxRetries,
      retryCount: 0,
      createdAt: new Date().toISOString(),
      sessionId,
      userId,
      assignedAgent: null,
      requiredTools: [],
      requiredEvidence: [],
      result: null,
      error: null,
      startedAt: null,
      completedAt: null,
      duration: 0,
      cost: 0,
      toolsUsed: [],
      executedBy: null,
      success: false,
      confidence: 0
    };

    // Store task
    taskStorage.set(task.id, task);

    console.log('✅ [Tasks API] Task created:', {
      id: task.id,
      description: task.description.substring(0, 100),
      type: task.type,
      priority: task.priority
    });

    return NextResponse.json({
      success: true,
      task,
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('❌ [Tasks API] POST error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, updates } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Get existing task
    const existingTask = taskStorage.get(taskId);
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Validate updates
    const allowedUpdates = [
      'status', 'priority', 'assignedAgent', 'result', 'error', 
      'startedAt', 'completedAt', 'duration', 'cost', 'toolsUsed',
      'executedBy', 'success', 'confidence', 'retryCount'
    ];

    const invalidUpdates = Object.keys(updates).filter(key => !allowedUpdates.includes(key));
    if (invalidUpdates.length > 0) {
      return NextResponse.json(
        { error: `Invalid update fields: ${invalidUpdates.join(', ')}` },
        { status: 400 }
      );
    }

    // Update task
    const updatedTask = {
      ...existingTask,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    taskStorage.set(taskId, updatedTask);

    console.log('✅ [Tasks API] Task updated:', {
      id: taskId,
      updates: Object.keys(updates),
      status: updatedTask.status
    });

    return NextResponse.json({
      success: true,
      task: updatedTask,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('❌ [Tasks API] PATCH error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const sessionId = searchParams.get('sessionId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Get existing task
    const existingTask = taskStorage.get(taskId);
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if task belongs to session (if sessionId provided)
    if (sessionId && existingTask.sessionId !== sessionId) {
      return NextResponse.json(
        { error: 'Task does not belong to this session' },
        { status: 403 }
      );
    }

    // Check if task can be deleted (not in progress)
    if (existingTask.status === 'in_progress') {
      return NextResponse.json(
        { error: 'Cannot delete task that is currently in progress' },
        { status: 400 }
      );
    }

    // Delete task
    taskStorage.delete(taskId);

    console.log('✅ [Tasks API] Task deleted:', {
      id: taskId,
      description: existingTask.description.substring(0, 100)
    });

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('❌ [Tasks API] DELETE error:', error);
    
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
