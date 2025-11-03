/**
 * LangGraph Python Code Generator
 * 
 * Generates production-ready LangGraph Python code from workflow definitions
 */

import type { WorkflowDefinition, WorkflowNode, WorkflowEdge, NodeConfig, StateField } from '../../types/workflow';

export interface CodeGenerationResult {
  code: string;
  dependencies: string[];
  entrypoint: string;
  errors: string[];
  warnings: string[];
}

export class LangGraphCodeGenerator {
  /**
   * Generate complete LangGraph Python code
   */
  generate(workflow: WorkflowDefinition): CodeGenerationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const dependencies = this.collectDependencies(workflow);

    try {
      const code = this.generateCode(workflow);
      
      return {
        code,
        dependencies,
        entrypoint: 'app',
        errors,
        warnings,
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Code generation failed');
      return {
        code: '',
        dependencies,
        entrypoint: 'app',
        errors,
        warnings,
      };
    }
  }

  private generateCode(workflow: WorkflowDefinition): string {
    const { nodes, edges, config } = workflow;

    const imports = this.generateImports(workflow);
    const stateClass = this.generateStateClass(config.stateSchema);
    const nodeFunctions = nodes
      .filter(n => n.type !== 'start' && n.type !== 'end')
      .map(node => this.generateNodeFunction(node))
      .join('\n\n');
    const graphBuilder = this.generateGraphBuilder(nodes, edges);
    const mainFunction = this.generateMainFunction();

    return `${imports}

${stateClass}

${nodeFunctions}

${graphBuilder}

${mainFunction}`;
  }

  private generateImports(workflow: WorkflowDefinition): string {
    const { nodes } = workflow;
    
    // Determine required imports based on node types
    const hasAgent = nodes.some(n => n.type === 'agent');
    const hasTool = nodes.some(n => n.type === 'tool');
    const hasCondition = nodes.some(n => n.type === 'condition');
    const hasParallel = nodes.some(n => n.type === 'parallel');

    return `# Auto-generated LangGraph Workflow
# Generated: ${new Date().toISOString()}
# Framework: LangGraph
# Workflow: ${workflow.name}

from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
${hasAgent ? `from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic` : ''}
${hasTool ? `from langchain_core.tools import tool` : ''}
${hasCondition ? `from typing import Literal` : ''}
import os
from datetime import datetime`;
  }

  private generateStateClass(stateSchema?: any): string {
    const fields: StateField[] = stateSchema?.fields || [];
    
    const defaultFields = `    messages: Annotated[Sequence[BaseMessage], add_messages]`;
    
    const customFields = fields.length > 0
      ? fields.map(field => {
          const typeMap: Record<string, string> = {
            string: 'str',
            number: 'float',
            boolean: 'bool',
            object: 'dict',
            array: 'list',
            messages: 'Annotated[Sequence[BaseMessage], add_messages]',
          };
          
          const pythonType = typeMap[field.type] || 'str';
          return `    ${field.name}: ${pythonType}`;
        }).join('\n')
      : '';

    return `# State Definition
class WorkflowState(TypedDict):
    """Workflow state that tracks messages and custom fields"""
${defaultFields}${customFields ? '\n' + customFields : ''}`;
  }

  private generateNodeFunction(node: WorkflowNode): string {
    switch (node.type) {
      case 'agent':
        return this.generateAgentNode(node);
      case 'tool':
        return this.generateToolNode(node);
      case 'condition':
        return this.generateConditionNode(node);
      case 'parallel':
        return this.generateParallelNode(node);
      case 'human':
        return this.generateHumanNode(node);
      default:
        return `# Node: ${node.label}\ndef ${this.sanitizeNodeId(node.id)}(state: WorkflowState) -> WorkflowState:
    """${node.config.description || 'Custom node'}"""
    return state`;
    }
  }

  private generateAgentNode(node: WorkflowNode): string {
    const config = node.config;
    const nodeId = this.sanitizeNodeId(node.id);
    const systemPrompt = (config.systemPrompt || 'You are a helpful AI assistant.').replace(/"/g, '\\"');
    
    // Model configuration
    const modelConfig = this.getModelConfig(config.model || 'gpt-4', config);

    return `# Agent Node: ${node.label}
def ${nodeId}(state: WorkflowState) -> WorkflowState:
    """
    ${config.description || `Agent: ${node.label}`}
    Model: ${config.model || 'gpt-4'}
    Temperature: ${config.temperature || 0.7}
    """
    # Initialize model
    ${modelConfig}
    
    # Get messages from state
    messages = state["messages"]
    
    # Add system prompt if first message
    if not any(isinstance(msg, AIMessage) for msg in messages):
        system_message = HumanMessage(content="${systemPrompt}")
        messages = [system_message] + list(messages)
    
    # Invoke model
    response = model.invoke(messages)
    
    # Update state
    return {
        "messages": [response],
    }`;
  }

  private generateToolNode(node: WorkflowNode): string {
    const config = node.config;
    const nodeId = this.sanitizeNodeId(node.id);
    const toolName = config.toolName || 'custom_tool';

    return `# Tool Node: ${node.label}
@tool
def ${toolName}(query: str) -> str:
    """${config.description || `Tool: ${node.label}`}"""
    # TODO: Implement tool logic
    return f"Tool {toolName} executed with: {query}"

def ${nodeId}(state: WorkflowState) -> WorkflowState:
    """Execute tool: ${node.label}"""
    messages = state["messages"]
    last_message = messages[-1] if messages else None
    
    if last_message:
        # Extract query from last message
        query = last_message.content if hasattr(last_message, 'content') else str(last_message)
        
        # Execute tool
        result = ${toolName}(query)
        
        # Add result as message
        return {
            "messages": [AIMessage(content=result)],
        }
    
    return state`;
  }

  private generateConditionNode(node: WorkflowNode): string {
    const config = node.config;
    const nodeId = this.sanitizeNodeId(node.id);
    const expression = config.conditionExpression || 'True';

    return `# Condition Node: ${node.label}
def ${nodeId}(state: WorkflowState) -> Literal["true", "false"]:
    """
    ${config.description || `Condition: ${node.label}`}
    Expression: ${expression}
    """
    messages = state["messages"]
    
    # Evaluate condition
    # TODO: Implement condition logic based on state
    condition_result = ${expression}
    
    return "true" if condition_result else "false"`;
  }

  private generateParallelNode(node: WorkflowNode): string {
    const config = node.config;
    const nodeId = this.sanitizeNodeId(node.id);

    return `# Parallel Node: ${node.label}
def ${nodeId}(state: WorkflowState) -> WorkflowState:
    """
    ${config.description || `Parallel execution: ${node.label}`}
    Merge strategy: ${config.mergeStrategy || 'all'}
    """
    # Note: Parallel execution is handled by graph structure
    # This node just passes through
    return state`;
  }

  private generateHumanNode(node: WorkflowNode): string {
    const config = node.config;
    const nodeId = this.sanitizeNodeId(node.id);
    const instructions = (config.humanInstructions || 'Please review').replace(/"/g, '\\"');

    return `# Human-in-the-Loop Node: ${node.label}
def ${nodeId}(state: WorkflowState) -> WorkflowState:
    """
    ${config.description || `Human approval: ${node.label}`}
    Instructions: ${instructions}
    """
    messages = state["messages"]
    
    # Display current state to human
    print("\\n=== Human Approval Required ===")
    print("${instructions}")
    print("\\nCurrent messages:")
    for msg in messages[-3:]:  # Show last 3 messages
        print(f"  {type(msg).__name__}: {msg.content[:100]}...")
    
    # Get human input
    human_response = input("\\nEnter your response (or 'approve' to continue): ")
    
    if human_response and human_response.lower() != 'approve':
        return {
            "messages": [HumanMessage(content=human_response)],
        }
    
    return state`;
  }

  private generateGraphBuilder(nodes: WorkflowNode[], edges: WorkflowEdge[]): string {
    const nodeId = (node: WorkflowNode) => this.sanitizeNodeId(node.id);
    
    // Find start and end nodes
    const startNode = nodes.find(n => n.type === 'start');
    const endNode = nodes.find(n => n.type === 'end');
    const regularNodes = nodes.filter(n => n.type !== 'start' && n.type !== 'end');
    
    // Add nodes
    const addNodesCalls = regularNodes
      .map(node => `workflow.add_node("${node.id}", ${nodeId(node)})`)
      .join('\n');
    
    // Add edges
    const addEdgesCalls = edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return '';
      
      // Handle start node
      if (sourceNode.type === 'start') {
        return `workflow.add_edge(START, "${edge.target}")`;
      }
      
      // Handle end node
      if (targetNode.type === 'end') {
        return `workflow.add_edge("${edge.source}", END)`;
      }
      
      // Handle conditional edges
      if (sourceNode.type === 'condition') {
        return `# Conditional edge from ${edge.source} handled below`;
      }
      
      // Regular edge
      return `workflow.add_edge("${edge.source}", "${edge.target}")`;
    }).filter(Boolean).join('\n');
    
    // Handle conditional edges
    const conditionalNodes = nodes.filter(n => n.type === 'condition');
    const conditionalEdges = conditionalNodes.map(condNode => {
      const outgoingEdges = edges.filter(e => e.source === condNode.id);
      if (outgoingEdges.length < 2) return '';
      
      const trueEdge = outgoingEdges[0];
      const falseEdge = outgoingEdges[1];
      
      return `workflow.add_conditional_edges(
    "${condNode.id}",
    ${nodeId(condNode)},
    {
        "true": "${trueEdge.target}",
        "false": "${falseEdge.target}",
    }
)`;
    }).filter(Boolean).join('\n\n');

    return `# Build Workflow Graph
def build_workflow():
    """Build and compile the workflow graph"""
    workflow = StateGraph(WorkflowState)
    
    # Add nodes
${addNodesCalls}
    
    # Add edges
${addEdgesCalls}
    
    # Add conditional edges
${conditionalEdges}
    
    # Compile with memory checkpointing
    memory = MemorySaver()
    app = workflow.compile(checkpointer=memory)
    
    return app`;
  }

  private generateMainFunction(): string {
    return `# Main Execution
if __name__ == "__main__":
    # Build the workflow
    app = build_workflow()
    
    # Example usage
    config = {"configurable": {"thread_id": "example-thread-1"}}
    
    # Initialize state
    initial_state = {
        "messages": [HumanMessage(content="Hello! Please process this workflow.")],
    }
    
    # Run workflow
    print("Starting workflow execution...")
    for output in app.stream(initial_state, config):
        for key, value in output.items():
            print(f"\\n--- Step: {key} ---")
            if "messages" in value:
                for msg in value["messages"]:
                    print(f"{type(msg).__name__}: {msg.content[:200]}")
    
    print("\\n=== Workflow Complete ===")`;
  }

  private getModelConfig(model: string, config: NodeConfig): string {
    const temperature = config.temperature || 0.7;
    const maxTokens = config.maxTokens || 2000;
    
    if (model.startsWith('gpt')) {
      return `model = ChatOpenAI(
        model="${model}",
        temperature=${temperature},
        max_tokens=${maxTokens}
    )`;
    } else if (model.startsWith('claude')) {
      return `model = ChatAnthropic(
        model="${model}",
        temperature=${temperature},
        max_tokens=${maxTokens}
    )`;
    } else {
      return `# Custom model configuration
    model = ChatOpenAI(model="${model}", temperature=${temperature})`;
    }
  }

  private sanitizeNodeId(id: string): string {
    // Convert to valid Python identifier
    return id
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .replace(/^[0-9]/, '_$&')
      .toLowerCase();
  }

  private collectDependencies(workflow: WorkflowDefinition): string[] {
    const deps = new Set<string>([
      'langchain-core>=0.3.0',
      'langgraph>=0.4.0',
    ]);
    
    const { nodes } = workflow;
    
    if (nodes.some(n => n.type === 'agent')) {
      nodes.forEach(node => {
        if (node.type === 'agent') {
          const model = node.config.model || 'gpt-4';
          if (model.startsWith('gpt')) {
            deps.add('langchain-openai>=0.6.0');
          } else if (model.startsWith('claude')) {
            deps.add('langchain-anthropic>=0.3.0');
          }
        }
      });
    }
    
    return Array.from(deps).sort();
  }
}

export const langGraphCodeGenerator = new LangGraphCodeGenerator();

