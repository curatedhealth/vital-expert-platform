/**
 * LangGraph Framework Adapter
 * 
 * Translates AbstractWorkflow to LangGraph Python code.
 * This is the primary adapter and most feature-complete.
 */

import {
  FrameworkAdapter,
  type GeneratedCode,
  type FrameworkNodeType,
  type FrameworkEdgeType,
} from './FrameworkAdapter';
import {
  AbstractWorkflow,
  AbstractNode,
  AbstractEdge,
  AbstractNodeType,
  ValidationResult,
  type AgentConfig,
  type ToolConfig,
  type ConditionConfig,
  validateWorkflowStructure,
} from '../core/WorkflowModel';

export class LangGraphAdapter extends FrameworkAdapter {
  readonly name = 'langgraph';
  readonly displayName = 'LangGraph';
  readonly version = '0.0.40';
  readonly description = 'Build stateful, multi-actor applications with LLMs using LangGraph';
  readonly icon = 'GitBranch';
  readonly docsUrl = 'https://langchain-ai.github.io/langgraph/';

  // ==========================================================================
  // CODE GENERATION
  // ==========================================================================

  generate(workflow: AbstractWorkflow): GeneratedCode {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate first
      const validation = this.validate(workflow);
      errors.push(...validation.errors.map(e => e.message));
      warnings.push(...validation.warnings.map(w => w.message));

      if (!validation.valid) {
        return {
          code: '',
          language: 'python',
          dependencies: [],
          errors,
          warnings,
          metadata: {
            framework: this.name,
            version: this.version,
            generatedAt: new Date().toISOString(),
            nodeCount: workflow.nodes.length,
            edgeCount: workflow.edges.length,
          },
        };
      }

      // Generate code sections
      const imports = this.generateImports(workflow);
      const stateDefinition = this.generateStateDefinition(workflow);
      const nodeFunctions = workflow.nodes
        .filter(n => n.type !== AbstractNodeType.Start && n.type !== AbstractNodeType.End)
        .map(node => this.generateNodeCode(node, workflow))
        .join('\n\n');
      const workflowInit = this.generateWorkflowInit(workflow);
      const edges = workflow.edges.map(edge => this.generateEdgeCode(edge, workflow)).join('\n');
      const workflowBuild = this.generateWorkflowBuild(workflow);
      const exampleUsage = this.getExampleUsage(workflow);

      const code = `${imports}

${stateDefinition}

${nodeFunctions}

${workflowInit}

${edges}

${workflowBuild}

${exampleUsage}`;

      return {
        code: this.formatPythonCode(code),
        language: 'python',
        dependencies: this.getDependencies(workflow),
        errors,
        warnings,
        metadata: {
          framework: this.name,
          version: this.version,
          generatedAt: new Date().toISOString(),
          nodeCount: workflow.nodes.length,
          edgeCount: workflow.edges.length,
        },
      };
    } catch (error) {
      errors.push(`Code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        code: '',
        language: 'python',
        dependencies: [],
        errors,
        warnings,
        metadata: {
          framework: this.name,
          version: this.version,
          generatedAt: new Date().toISOString(),
          nodeCount: workflow.nodes.length,
          edgeCount: workflow.edges.length,
        },
      };
    }
  }

  generateImports(workflow: AbstractWorkflow): string {
    const hasAnthropic = workflow.nodes.some(
      n => n.type === AbstractNodeType.Agent && (n.config as AgentConfig).provider === 'anthropic'
    );

    return `"""
Auto-generated LangGraph Workflow: ${workflow.config.name}
${workflow.config.description || ''}

Generated: ${new Date().toISOString()}
Framework: LangGraph ${this.version}
"""

from typing import TypedDict, Annotated, List
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI
${hasAnthropic ? "from langchain_anthropic import ChatAnthropic" : ""}
import operator
`;
  }

  generateStateDefinition(workflow: AbstractWorkflow): string {
    const { stateSchema } = workflow.config;
    
    const fields = stateSchema.fields.map(field => {
      let typeAnnotation = 'any';
      let reducer = '';
      
      switch (field.type) {
        case 'string':
          typeAnnotation = 'str';
          break;
        case 'number':
          typeAnnotation = 'float';
          break;
        case 'boolean':
          typeAnnotation = 'bool';
          break;
        case 'array':
          typeAnnotation = 'List';
          reducer = field.reducer === 'append' ? ', operator.add' : '';
          break;
        case 'object':
          typeAnnotation = 'dict';
          break;
        case 'messages':
          typeAnnotation = 'List[BaseMessage]';
          reducer = ', add_messages';
          break;
      }
      
      const annotation = reducer ? `Annotated[${typeAnnotation}${reducer}]` : typeAnnotation;
      
      return `    ${field.name}: ${annotation}`;
    });

    // Always include messages if not already present
    if (!stateSchema.fields.some(f => f.name === 'messages') && stateSchema.includeMessages) {
      fields.unshift('    messages: Annotated[List[BaseMessage], add_messages]');
    }

    return `# State Definition
class WorkflowState(TypedDict):
${fields.join('\n')}
`;
  }

  generateNodeCode(node: AbstractNode, workflow: AbstractWorkflow): string {
    const funcName = this.generateFunctionName(node);
    
    switch (node.type) {
      case AbstractNodeType.Agent:
        return this.generateAgentNodeCode(node, funcName);
      case AbstractNodeType.Tool:
        return this.generateToolNodeCode(node, funcName);
      case AbstractNodeType.Condition:
        return this.generateConditionNodeCode(node, funcName);
      case AbstractNodeType.Human:
        return this.generateHumanNodeCode(node, funcName);
      default:
        return `def ${funcName}(state: WorkflowState) -> WorkflowState:
    """${node.label}${node.description ? '\n    ' + node.description : ''}"""
    print(f"Executing: ${node.label}")
    return state
`;
    }
  }

  private generateAgentNodeCode(node: AbstractNode, funcName: string): string {
    const config = node.config as AgentConfig;
    const provider = config.provider || 'openai';
    const model = config.model || 'gpt-4o';
    const temperature = config.temperature ?? 0.7;
    const maxTokens = config.maxTokens ? `, max_tokens=${config.maxTokens}` : '';
    
    const llmClass = provider === 'anthropic' ? 'ChatAnthropic' : 'ChatOpenAI';
    
    return `def ${funcName}(state: WorkflowState) -> WorkflowState:
    """${node.label} - ${config.role || 'AI Agent'}
    
    ${node.description || config.goal || 'Processes messages and generates responses'}
    """
    # Initialize LLM
    llm = ${llmClass}(
        model="${model}",
        temperature=${temperature}${maxTokens}
    )
    
    # Get messages from state
    messages = state.get("messages", [])
    
    # Add system prompt if configured
    ${config.systemPrompt ? `system_prompt = "${config.systemPrompt.replace(/"/g, '\\"')}"
    if not any(isinstance(m, SystemMessage) for m in messages):
        messages = [SystemMessage(content=system_prompt)] + messages
    ` : ''}
    
    # Invoke LLM
    response = llm.invoke(messages)
    
    # Return updated state
    return {"messages": [response]}
`;
  }

  private generateToolNodeCode(node: AbstractNode, funcName: string): string {
    const config = node.config as ToolConfig;
    
    return `def ${funcName}(state: WorkflowState) -> WorkflowState:
    """${node.label} - Tool: ${config.toolName}
    
    ${node.description || config.description || 'Executes a tool'}
    """
    # TODO: Implement tool logic for ${config.toolName}
    # Tool parameters: ${JSON.stringify(config.parameters)}
    
    print(f"Executing tool: ${config.toolName}")
    
    # Placeholder implementation
    result = {
        "tool": "${config.toolName}",
        "status": "success",
        "output": "Tool executed successfully"
    }
    
    return state
`;
  }

  private generateConditionNodeCode(node: AbstractNode, funcName: string): string {
    const config = node.config as ConditionConfig;
    
    const branches = config.branches.map(branch => `
    if ${branch.condition}:
        return "${branch.targetNodeId}"`).join('');
    
    return `def ${funcName}(state: WorkflowState) -> str:
    """${node.label} - Conditional Router
    
    ${node.description || 'Routes workflow based on conditions'}
    """
    ${branches}
    
    # Default branch
    return "${config.defaultBranch || 'END'}"
`;
  }

  private generateHumanNodeCode(node: AbstractNode, funcName: string): string {
    const config = node.config as any;
    
    return `def ${funcName}(state: WorkflowState) -> WorkflowState:
    """${node.label} - Human Input Required
    
    ${node.description || config.prompt || 'Requires human input'}
    """
    # Human-in-the-loop implementation
    user_input = input("${config.prompt || 'Please provide input:'} ")
    
    return {
        "messages": [HumanMessage(content=user_input)]
    }
`;
  }

  generateEdgeCode(edge: AbstractEdge, workflow: AbstractWorkflow): string {
    const sourceNode = workflow.nodes.find(n => n.id === edge.source);
    const targetNode = workflow.nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) {
      return `# Error: Invalid edge ${edge.id}`;
    }
    
    const sourceName = sourceNode.type === AbstractNodeType.Start ? 'START' : `"${this.generateFunctionName(sourceNode)}"`;
    const targetName = targetNode.type === AbstractNodeType.End ? 'END' : `"${this.generateFunctionName(targetNode)}"`;
    
    // Conditional edges
    if (sourceNode.type === AbstractNodeType.Condition) {
      return `workflow.add_conditional_edges(${sourceName}, ${this.generateFunctionName(sourceNode)})`;
    }
    
    return `workflow.add_edge(${sourceName}, ${targetName})`;
  }

  generateWorkflowInit(workflow: AbstractWorkflow): string {
    return `# Build Workflow
workflow = StateGraph(WorkflowState)

# Add nodes
${workflow.nodes
  .filter(n => n.type !== AbstractNodeType.Start && n.type !== AbstractNodeType.End)
  .map(node => `workflow.add_node("${this.generateFunctionName(node)}", ${this.generateFunctionName(node)})`)
  .join('\n')}

# Add edges`;
  }

  generateWorkflowBuild(workflow: AbstractWorkflow): string {
    const useCheckpointer = workflow.config.checkpointer === 'memory';
    
    return `# Compile workflow
${useCheckpointer ? 'checkpointer = MemorySaver()' : ''}
app = workflow.compile(${useCheckpointer ? 'checkpointer=checkpointer' : ''})
`;
  }

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  validate(workflow: AbstractWorkflow): ValidationResult {
    return validateWorkflowStructure(workflow);
  }

  supportsNodeType(type: AbstractNodeType): boolean {
    return [
      AbstractNodeType.Agent,
      AbstractNodeType.Tool,
      AbstractNodeType.Condition,
      AbstractNodeType.Human,
      AbstractNodeType.Start,
      AbstractNodeType.End,
    ].includes(type);
  }

  supportsFeature(feature: string): boolean {
    const supported = ['conditional', 'human', 'checkpoints', 'streaming', 'parallel'];
    return supported.includes(feature);
  }

  // ==========================================================================
  // NODE & EDGE TYPES
  // ==========================================================================

  getNodeTypes(): FrameworkNodeType[] {
    return [
      {
        id: 'agent',
        label: 'Agent',
        description: 'AI agent with LLM',
        icon: 'Brain',
        category: 'agent',
        color: '#8b5cf6',
        bgColor: '#f3e8ff',
        abstractTypes: [AbstractNodeType.Agent],
        configSchema: {},
        defaultConfig: {
          model: 'gpt-4o',
          temperature: 0.7,
          systemPrompt: 'You are a helpful AI assistant.',
        },
        available: true,
      },
      {
        id: 'tool',
        label: 'Tool',
        description: 'Execute a tool or function',
        icon: 'Wrench',
        category: 'tool',
        color: '#3b82f6',
        bgColor: '#dbeafe',
        abstractTypes: [AbstractNodeType.Tool],
        configSchema: {},
        defaultConfig: { toolName: 'custom_tool' },
        available: true,
      },
      {
        id: 'condition',
        label: 'Condition',
        description: 'Conditional routing',
        icon: 'GitFork',
        category: 'control',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        abstractTypes: [AbstractNodeType.Condition],
        configSchema: {},
        defaultConfig: { expression: 'True', branches: [] },
        available: true,
      },
      {
        id: 'human',
        label: 'Human Input',
        description: 'Require human intervention',
        icon: 'User',
        category: 'io',
        color: '#10b981',
        bgColor: '#d1fae5',
        abstractTypes: [AbstractNodeType.Human],
        configSchema: {},
        defaultConfig: { prompt: 'Please provide input:' },
        available: true,
      },
    ];
  }

  getEdgeTypes(): FrameworkEdgeType[] {
    return [
      {
        id: 'default',
        label: 'Default',
        description: 'Standard edge',
        animated: false,
        style: {},
      },
      {
        id: 'conditional',
        label: 'Conditional',
        description: 'Conditional routing',
        animated: true,
        style: { strokeDasharray: '5,5' },
      },
    ];
  }

  // ==========================================================================
  // TRANSLATION
  // ==========================================================================

  translateNode(node: AbstractNode): any {
    return {
      id: node.id,
      type: node.type,
      data: node.config,
    };
  }

  translateEdge(edge: AbstractEdge): any {
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
    };
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  getDependencies(workflow: AbstractWorkflow): string[] {
    const deps = [
      'langgraph>=0.0.40',
      'langchain>=0.1.0',
      'langchain-core>=0.1.0',
      'langchain-openai>=0.0.5',
    ];

    const hasAnthropic = workflow.nodes.some(
      n => n.type === AbstractNodeType.Agent && (n.config as AgentConfig).provider === 'anthropic'
    );

    if (hasAnthropic) {
      deps.push('langchain-anthropic>=0.1.0');
    }

    if (workflow.config.checkpointer === 'postgres') {
      deps.push('psycopg2-binary>=2.9.0');
    } else if (workflow.config.checkpointer === 'redis') {
      deps.push('redis>=4.0.0');
    }

    return deps;
  }

  getDockerTemplate(workflow: AbstractWorkflow): string {
    return `FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY workflow.py .

ENV PYTHONUNBUFFERED=1
CMD ["python", "workflow.py"]
`;
  }

  getRequirementsTxt(workflow: AbstractWorkflow): string {
    return this.getDependencies(workflow).join('\n');
  }

  getExampleUsage(workflow: AbstractWorkflow): string {
    return `
# Example Usage
if __name__ == "__main__":
    # Prepare input
    config = {"configurable": {"thread_id": "conversation-1"}}
    inputs = {"messages": [HumanMessage(content="Hello! How can you help me?")]}
    
    # Run workflow
    result = app.invoke(inputs, config)
    
    # Print results
    print("Final state:")
    print(result)
`;
  }
}

