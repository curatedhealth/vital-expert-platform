/**
 * CrewAI Framework Adapter
 * 
 * Translates AbstractWorkflow to CrewAI Python code.
 * CrewAI focuses on role-based agents working on sequential/parallel tasks.
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
  validateWorkflowStructure,
} from '../core/WorkflowModel';

export class CrewAIAdapter extends FrameworkAdapter {
  readonly name = 'crewai';
  readonly displayName = 'CrewAI';
  readonly version = '0.28.0';
  readonly description = 'Build role-based AI crews with task delegation';
  readonly icon = 'Users';
  readonly docsUrl = 'https://docs.crewai.com/';

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
      const taskDefinitions = this.generateTaskDefinitions(workflow);
      const workflowInit = this.generateWorkflowInit(workflow);
      const workflowBuild = this.generateWorkflowBuild(workflow);
      const exampleUsage = this.getExampleUsage(workflow);

      const code = `${imports}

${stateDefinition}

${agentDefinitions}

${taskDefinitions}

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
    const hasTools = workflow.nodes.some(n => n.type === AbstractNodeType.Tool);
    
    return `"""
Auto-generated CrewAI Workflow: ${workflow.config.name}
${workflow.config.description || ''}

Generated: ${new Date().toISOString()}
Framework: CrewAI ${this.version}
"""

import os
from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI
${hasTools ? "from crewai_tools import SerperDevTool, WebsiteSearchTool" : ""}
`;
  }

  generateStateDefinition(workflow: AbstractWorkflow): string {
    return `# LLM Configuration
llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0.7
)
`;
  }

  generateNodeCode(node: AbstractNode, workflow: AbstractWorkflow): string {
    const config = node.config as AgentConfig;
    const agentName = this.sanitizeNodeId(node.id);
    
    const role = config.role || node.label;
    const goal = config.goal || config.systemPrompt || `Execute tasks as ${role}`;
    const backstory = config.backstory || `You are an expert ${role} with years of experience.`;
    
    // Get tools for this agent
    const tools = config.tools && config.tools.length > 0 
      ? `\n    tools=[${config.tools.map(t => `${t}()`).join(', ')}],`
      : '';

    return `# Agent: ${node.label}
${agentName} = Agent(
    role="${role.replace(/"/g, '\\"')}",
    goal="${goal.replace(/"/g, '\\"')}",
    backstory="""${backstory.replace(/"/g, '\\"')}""",
    llm=llm,
    verbose=True,${tools}
    allow_delegation=${config.allowDelegation ? 'True' : 'False'}
)
`;
  }

  generateEdgeCode(edge: AbstractEdge, workflow: AbstractWorkflow): string {
    // CrewAI uses Tasks to connect agents, edges define task dependencies
    return `# Edge: ${edge.source} -> ${edge.target}`;
  }

  private generateTaskDefinitions(workflow: AbstractWorkflow): string {
    const agentNodes = workflow.nodes.filter(n => n.type === AbstractNodeType.Agent);
    
    const tasks = workflow.edges.map((edge, idx) => {
      const sourceNode = workflow.nodes.find(n => n.id === edge.source);
      const targetNode = workflow.nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || sourceNode.type === AbstractNodeType.Start) {
        return null;
      }
      
      const agentName = this.sanitizeNodeId(sourceNode.id);
      const taskName = `task_${this.sanitizeNodeId(edge.id).slice(0, 8)}`;
      
      const description = sourceNode.description || 
        `Task assigned to ${sourceNode.label}`;
      
      const expectedOutput = `Completion of ${sourceNode.label}'s objectives`;
      
      return `# Task for: ${sourceNode.label}
${taskName} = Task(
    description="${description.replace(/"/g, '\\"')}",
    agent=${agentName},
    expected_output="${expectedOutput.replace(/"/g, '\\"')}"
)
`;
    }).filter(Boolean);

    return `# Tasks
${tasks.join('\n') || '# No tasks defined'}`;
  }

  generateWorkflowInit(workflow: AbstractWorkflow): string {
    const agents = workflow.nodes
      .filter(n => n.type === AbstractNodeType.Agent)
      .map(n => this.sanitizeNodeId(n.id));
    
    // Generate task list from edges
    const taskIds = workflow.edges
      .filter(e => {
        const source = workflow.nodes.find(n => n.id === e.source);
        return source && source.type !== AbstractNodeType.Start;
      })
      .map(e => `task_${this.sanitizeNodeId(e.id).slice(0, 8)}`);

    const hasParallel = workflow.nodes.some(n => n.type === AbstractNodeType.Parallel);
    const process = hasParallel ? 'Process.hierarchical' : 'Process.sequential';

    return `# Crew Setup
agents = [${agents.join(', ')}]
tasks = [${taskIds.join(', ')}]

crew = Crew(
    agents=agents,
    tasks=tasks,
    process=${process},
    verbose=True
)
`;
  }

  generateWorkflowBuild(workflow: AbstractWorkflow): string {
    return `# Crew is ready to execute
# Use crew.kickoff() to start the workflow
`;
  }

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  validate(workflow: AbstractWorkflow): ValidationResult {
    const result = validateWorkflowStructure(workflow);
    
    // CrewAI-specific validations
    const agentNodes = workflow.nodes.filter(n => n.type === AbstractNodeType.Agent);
    
    if (agentNodes.length === 0) {
      result.errors.push({
        message: 'CrewAI requires at least one agent',
        severity: 'error',
      });
    }
    
    // Check that agents have proper role/goal/backstory
    agentNodes.forEach(agent => {
      const config = agent.config as AgentConfig;
      if (!config.role && !agent.label) {
        result.warnings.push({
          nodeId: agent.id,
          message: 'Agent should have a defined role',
          severity: 'warning',
        });
      }
    });

    return result;
  }

  supportsNodeType(type: AbstractNodeType): boolean {
    return [
      AbstractNodeType.Agent,
      AbstractNodeType.Tool,
      AbstractNodeType.Start,
      AbstractNodeType.End,
      AbstractNodeType.Parallel,
    ].includes(type);
  }

  supportsFeature(feature: string): boolean {
    const supported = ['parallel', 'delegation', 'tools', 'hierarchical'];
    return supported.includes(feature);
  }

  // ==========================================================================
  // NODE & EDGE TYPES
  // ==========================================================================

  getNodeTypes(): FrameworkNodeType[] {
    return [
      {
        id: 'agent',
        label: 'Crew Agent',
        description: 'Role-based agent with specific expertise',
        icon: 'UserCircle',
        category: 'agent',
        color: '#ff6b35',
        bgColor: '#ffe8e0',
        abstractTypes: [AbstractNodeType.Agent],
        configSchema: {},
        defaultConfig: {
          role: 'Specialist',
          goal: 'Complete assigned tasks',
          backstory: 'Expert in the field',
          model: 'gpt-4o',
          temperature: 0.7,
          allowDelegation: false,
        },
        available: true,
      },
      {
        id: 'tool',
        label: 'Tool',
        description: 'Tool available to agents',
        icon: 'Wrench',
        category: 'tool',
        color: '#004e89',
        bgColor: '#cce7ff',
        abstractTypes: [AbstractNodeType.Tool],
        configSchema: {},
        defaultConfig: {
          toolName: 'custom_tool',
        },
        available: true,
      },
    ];
  }

  getEdgeTypes(): FrameworkEdgeType[] {
    return [
      {
        id: 'task',
        label: 'Task Flow',
        description: 'Task execution flow',
        animated: false,
        style: { strokeWidth: 2 },
      },
      {
        id: 'delegation',
        label: 'Delegation',
        description: 'Agent delegates to another agent',
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
      type: 'Agent',
      data: node.config,
    };
  }

  translateEdge(edge: AbstractEdge): any {
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'task',
    };
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  getDependencies(workflow: AbstractWorkflow): string[] {
    const deps = [
      'crewai>=0.28.0',
      'langchain-openai>=0.0.5',
    ];

    const hasTools = workflow.nodes.some(n => n.type === AbstractNodeType.Tool);
    if (hasTools) {
      deps.push('crewai-tools>=0.2.0');
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
ENV OPENAI_API_KEY=your_api_key_here

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
    # Set your OpenAI API key
    # os.environ["OPENAI_API_KEY"] = "sk-..."
    
    # Kick off the crew
    result = crew.kickoff()
    
    # Print results
    print("\\n\\n========================")
    print("## Crew Execution Results:")
    print("========================\\n")
    print(result)
`;
  }
}

