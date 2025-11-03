/**
 * AutoGen Framework Adapter (Code Generator)
 * 
 * Translates AbstractWorkflow to AutoGen Python code for export/preview.
 * 
 * NOTE: For runtime execution, use the shared MultiFrameworkOrchestrator
 * at src/lib/orchestration/multi-framework-orchestrator.ts
 * 
 * This adapter is ONLY for code generation/export, not direct execution.
 * AutoGen is a shared resource used by: Ask Expert, Ask Panel, Workflow Designer, Solution Builder
 * 
 * Uses CuratedHealth AutoGen fork: https://github.com/curatedhealth/autogen
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
  validateWorkflowStructure,
} from '../core/WorkflowModel';

export class AutoGenAdapter extends FrameworkAdapter {
  readonly name = 'autogen';
  readonly displayName = 'AutoGen';
  readonly version = '0.2.0';
  readonly description = 'Build multi-agent conversational systems with AutoGen';
  readonly icon = 'MessageSquare';
  readonly docsUrl = 'https://microsoft.github.io/autogen/';

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
      const agentDefinitions = workflow.nodes
        .filter(n => n.type === AbstractNodeType.Agent)
        .map(node => this.generateNodeCode(node, workflow))
        .join('\n\n');
      const workflowInit = this.generateWorkflowInit(workflow);
      const workflowBuild = this.generateWorkflowBuild(workflow);
      const exampleUsage = this.getExampleUsage(workflow);

      const code = `${imports}

${stateDefinition}

${agentDefinitions}

${workflowInit}

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
    return `"""
Auto-generated AutoGen Workflow: ${workflow.config.name}
${workflow.config.description || ''}

Generated: ${new Date().toISOString()}
Framework: AutoGen ${this.version}
"""

import os
from typing import Dict, List, Optional
from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager
from autogen import config_list_from_json
`;
  }

  generateStateDefinition(workflow: AbstractWorkflow): string {
    return `# Configuration
config_list = config_list_from_json(
    env_or_file="OAI_CONFIG_LIST",
    filter_dict={
        "model": ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"]
    }
)

llm_config = {
    "config_list": config_list,
    "temperature": 0.7,
    "timeout": 120,
}
`;
  }

  generateNodeCode(node: AbstractNode, workflow: AbstractWorkflow): string {
    const config = node.config as AgentConfig;
    const agentName = this.sanitizeNodeId(node.id);
    const isHuman = node.type === AbstractNodeType.Human;
    
    if (isHuman) {
      return `# Human Proxy Agent: ${node.label}
${agentName} = UserProxyAgent(
    name="${node.label.replace(/"/g, '\\"')}",
    human_input_mode="ALWAYS",
    max_consecutive_auto_reply=0,
    code_execution_config={
        "work_dir": "coding",
        "use_docker": False
    }
)
`;
    }

    const systemMessage = config.systemPrompt || `You are ${node.label}. ${config.role || config.goal || ''}`;

    return `# Agent: ${node.label}
${agentName} = AssistantAgent(
    name="${node.label.replace(/"/g, '\\"')}",
    system_message="""${systemMessage.replace(/"/g, '\\"')}""",
    llm_config={
        **llm_config,
        "temperature": ${config.temperature ?? 0.7},
        ${config.maxTokens ? `"max_tokens": ${config.maxTokens},` : ''}
    }
)
`;
  }

  generateEdgeCode(edge: AbstractEdge, workflow: AbstractWorkflow): string {
    // AutoGen uses GroupChat for coordination, edges are implicit
    return `# Edge: ${edge.source} -> ${edge.target}`;
  }

  generateWorkflowInit(workflow: AbstractWorkflow): string {
    const agents = workflow.nodes
      .filter(n => n.type === AbstractNodeType.Agent || n.type === AbstractNodeType.Human)
      .map(n => this.sanitizeNodeId(n.id));

    const maxRounds = workflow.config.maxIterations || 10;
    
    return `# Group Chat Setup
agents = [${agents.join(', ')}]

group_chat = GroupChat(
    agents=agents,
    messages=[],
    max_round=${maxRounds},
    speaker_selection_method="auto"  # Can be 'auto', 'manual', or 'round_robin'
)
`;
  }

  generateWorkflowBuild(workflow: AbstractWorkflow): string {
    return `# Group Chat Manager
manager = GroupChatManager(
    groupchat=group_chat,
    llm_config=llm_config
)
`;
  }

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  validate(workflow: AbstractWorkflow): ValidationResult {
    const result = validateWorkflowStructure(workflow);
    
    // AutoGen-specific validations
    const agentNodes = workflow.nodes.filter(n => n.type === AbstractNodeType.Agent);
    
    if (agentNodes.length < 2) {
      result.warnings.push({
        message: 'AutoGen works best with 2+ agents for multi-agent conversations',
        severity: 'warning',
      });
    }
    
    if (agentNodes.length > 10) {
      result.warnings.push({
        message: 'Large number of agents (>10) may lead to coordination complexity',
        severity: 'warning',
      });
    }

    // Check for unsupported features
    const hasParallel = workflow.nodes.some(n => n.type === AbstractNodeType.Parallel);
    if (hasParallel) {
      result.errors.push({
        message: 'AutoGen does not natively support parallel execution nodes',
        severity: 'error',
      });
    }

    return result;
  }

  supportsNodeType(type: AbstractNodeType): boolean {
    return [
      AbstractNodeType.Agent,
      AbstractNodeType.Human,
      AbstractNodeType.Start,
      AbstractNodeType.End,
    ].includes(type);
  }

  supportsFeature(feature: string): boolean {
    const supported = ['human', 'conversation', 'group_chat'];
    return supported.includes(feature);
  }

  // ==========================================================================
  // NODE & EDGE TYPES
  // ==========================================================================

  getNodeTypes(): FrameworkNodeType[] {
    return [
      {
        id: 'agent',
        label: 'Assistant Agent',
        description: 'AI assistant agent for conversations',
        icon: 'Bot',
        category: 'agent',
        color: '#0078d4',
        bgColor: '#e6f2ff',
        abstractTypes: [AbstractNodeType.Agent],
        configSchema: {},
        defaultConfig: {
          model: 'gpt-4',
          temperature: 0.7,
          systemPrompt: 'You are a helpful AI assistant.',
        },
        available: true,
      },
      {
        id: 'human',
        label: 'User Proxy',
        description: 'Human user in the conversation',
        icon: 'User',
        category: 'io',
        color: '#107c10',
        bgColor: '#dff6dd',
        abstractTypes: [AbstractNodeType.Human],
        configSchema: {},
        defaultConfig: {},
        available: true,
      },
    ];
  }

  getEdgeTypes(): FrameworkEdgeType[] {
    return [
      {
        id: 'conversation',
        label: 'Conversation',
        description: 'Conversation flow between agents',
        animated: true,
        style: {},
      },
    ];
  }

  // ==========================================================================
  // TRANSLATION
  // ==========================================================================

  translateNode(node: AbstractNode): any {
    return {
      id: node.id,
      type: node.type === AbstractNodeType.Human ? 'UserProxyAgent' : 'AssistantAgent',
      data: node.config,
    };
  }

  translateEdge(edge: AbstractEdge): any {
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'conversation',
    };
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  getDependencies(workflow: AbstractWorkflow): string[] {
    return [
      // CuratedHealth Fork (healthcare-specific customizations)
      'git+https://github.com/curatedhealth/autogen.git@main',
      'openai>=1.0.0',
    ];
  }

  getDockerTemplate(workflow: AbstractWorkflow): string {
    return `FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY workflow.py .
COPY OAI_CONFIG_LIST .

ENV PYTHONUNBUFFERED=1
CMD ["python", "workflow.py"]
`;
  }

  getRequirementsTxt(workflow: AbstractWorkflow): string {
    return this.getDependencies(workflow).join('\n');
  }

  getExampleUsage(workflow: AbstractWorkflow): string {
    const firstAgent = workflow.nodes.find(n => n.type === AbstractNodeType.Agent);
    const agentName = firstAgent ? this.sanitizeNodeId(firstAgent.id) : 'agents[0]';
    
    return `
# Example Usage
if __name__ == "__main__":
    # Note: Create OAI_CONFIG_LIST file with your OpenAI API keys
    # Example format:
    # [
    #     {
    #         "model": "gpt-4",
    #         "api_key": "sk-..."
    #     }
    # ]
    
    # Start the conversation
    ${agentName}.initiate_chat(
        manager,
        message="Hello! Let's work together to solve this problem."
    )
    
    # The group chat will automatically coordinate between agents
    # based on the configured speaker selection method
`;
  }
}

