import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { TaskDefinition } from '../TaskLibrary';

interface UseTaskOperationsProps {
  apiKeys: {
    openai: string;
    pinecone: string;
    provider: 'openai' | 'ollama';
  };
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  nodes: Node[];
}

/**
 * Hook for task operations in the workflow builder
 * Extracts task combination, drag/drop, and task management logic
 */
export function useTaskOperations({
  apiKeys,
  setNodes,
  setEdges,
  nodes,
}: UseTaskOperationsProps) {
  /**
   * Generate AI name for combined tasks
   */
  const generateCombinedTaskName = useCallback(async (taskNames: string[]): Promise<string> => {
    if (!apiKeys.openai || apiKeys.openai.length < 20) {
      return taskNames.join(' + ');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKeys.openai}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that creates concise, descriptive names for combined workflow tasks. Generate a single, clear name (2-4 words) that captures the essence of the combined tasks.',
            },
            {
              role: 'user',
              content: `Generate a concise name for a combined task that includes these tasks: ${taskNames.join(', ')}. Return only the name, no explanation.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 20,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate name');
      }

      const data = await response.json();
      const generatedName = data.choices[0]?.message?.content?.trim();

      if (generatedName && generatedName.length > 0 && generatedName.length < 50) {
        return generatedName;
      }
    } catch (error) {
      console.warn('Failed to generate AI name, using fallback:', error);
    }

    return taskNames.join(' + ');
  }, [apiKeys.openai]);

  /**
   * Extract base tasks from a node (handles combined tasks)
   */
  const getBaseTasks = useCallback((task: TaskDefinition, node?: Node): TaskDefinition[] => {
    if (node?.data?.combinedTasks && Array.isArray(node.data.combinedTasks)) {
      return node.data.combinedTasks;
    }
    return [task];
  }, []);

  /**
   * Combine two tasks into one
   */
  const combineTasks = useCallback(async (
    task1: TaskDefinition,
    task2: TaskDefinition,
    node1?: Node,
    node2?: Node
  ): Promise<TaskDefinition> => {
    const baseTasks1 = getBaseTasks(task1, node1);
    const baseTasks2 = getBaseTasks(task2, node2);
    const allTasks = [...baseTasks1, ...baseTasks2];

    const taskNames = allTasks.map(t => t.name);
    const combinedName = await generateCombinedTaskName(taskNames);

    const combined: TaskDefinition = {
      id: `combined_${Date.now()}`,
      name: combinedName,
      description: `Combined task: ${allTasks.map(t => t.name).join(', ')}`,
      icon: task1.icon || task2.icon || '🔗',
      category: 'Custom',
      config: {
        model: task1.config?.model || task2.config?.model || 'gpt-4o-mini',
        temperature: allTasks.reduce((sum, t) => sum + (t.config?.temperature ?? 0.7), 0) / allTasks.length,
        systemPrompt: allTasks.map(t => t.config?.systemPrompt || '').filter(Boolean).join('\n\n'),
        tools: [...new Set(allTasks.flatMap(t => t.config?.tools || []))],
        agents: [...new Set(allTasks.flatMap(t => t.config?.agents || []))],
        rags: [...new Set(allTasks.flatMap(t => t.config?.rags || []))],
      },
    };

    return combined;
  }, [getBaseTasks, generateCombinedTaskName]);

  /**
   * Merge combined tasks from two nodes
   */
  const mergeCombinedNodes = useCallback(async (
    draggedNode: Node,
    targetNode: Node
  ): Promise<void> => {
    const task1 = draggedNode.data?.task as TaskDefinition;
    const task2 = targetNode.data?.task as TaskDefinition;

    if (!task1 || !task2) return;

    // Show loading indicator
    setNodes((nds) =>
      nds.map((n) =>
        n.id === targetNode.id
          ? { ...n, data: { ...n.data, _combining: true } }
          : n
      )
    );

    try {
      const combinedTask = await combineTasks(task1, task2, draggedNode, targetNode);

      // Get all combined tasks from both nodes
      const combinedTasks1 = draggedNode.data?.combinedTasks || [task1];
      const combinedTasks2 = targetNode.data?.combinedTasks || [task2];
      const allCombinedTasks = [...combinedTasks1, ...combinedTasks2];

      // Replace target node with combined task
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === targetNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                task: combinedTask,
                combinedTasks: allCombinedTasks,
                _combining: false,
              },
            };
          }
          return node;
        }).filter((node) => node.id !== draggedNode.id)
      );

      // Update edges
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.source === draggedNode.id) {
            return { ...edge, source: targetNode.id };
          }
          if (edge.target === draggedNode.id) {
            return { ...edge, target: targetNode.id };
          }
          return edge;
        }).filter((edge) =>
          edge.source !== draggedNode.id && edge.target !== draggedNode.id
        )
      );

      // Save to localStorage
      const customTasks = JSON.parse(localStorage.getItem('custom_tasks') || '[]');
      if (!customTasks.find((t: TaskDefinition) => t.id === combinedTask.id)) {
        customTasks.push(combinedTask);
        localStorage.setItem('custom_tasks', JSON.stringify(customTasks));
        window.dispatchEvent(new Event('customTasksUpdated'));
      }
    } catch (error) {
      console.error('Failed to combine tasks:', error);
      // Remove loading indicator
      setNodes((nds) =>
        nds.map((n) =>
          n.id === targetNode.id
            ? { ...n, data: { ...n.data, _combining: false } }
            : n
        )
      );
    }
  }, [combineTasks, setNodes, setEdges]);

  /**
   * Create a new task node
   */
  const createTaskNode = useCallback((
    task: TaskDefinition,
    position: { x: number; y: number }
  ): Node => {
    if (task.id === 'agent_node') {
      return {
        id: `agent-${Date.now()}`,
        type: 'agent',
        position,
        data: {
          agentId: null,
          agentName: null,
          label: 'AI Agent',
          configured: false,
          enabled: true,
          _original_type: 'agent',
        },
      };
    }

    return {
      id: `task-${task.id}-${Date.now()}`,
      type: 'task',
      position,
      data: {
        task,
        enabled: false,
      },
    };
  }, []);

  /**
   * Delete a node and its edges
   */
  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);

  /**
   * Update a node's data
   */
  const updateNode = useCallback((nodeId: string, newData: Partial<Node['data']>) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
      )
    );
  }, [setNodes]);

  return {
    generateCombinedTaskName,
    combineTasks,
    mergeCombinedNodes,
    createTaskNode,
    deleteNode,
    updateNode,
    getBaseTasks,
  };
}

export default useTaskOperations;
