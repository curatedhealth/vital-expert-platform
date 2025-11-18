/**
 * Framework Adapter Interface
 * 
 * Abstract interface for translating AbstractWorkflow to framework-specific code.
 * Each framework (LangGraph, AutoGen, CrewAI) implements this interface.
 */

import type {
  AbstractWorkflow,
  AbstractNode,
  AbstractEdge,
  ValidationResult,
  ExecutionResult,
  AbstractNodeType,
} from '../core/WorkflowModel';

// ============================================================================
// GENERATED CODE RESULT
// ============================================================================

export interface GeneratedCode {
  code: string;
  language: 'python' | 'typescript' | 'javascript';
  dependencies: string[]; // Package names with versions
  errors: string[];
  warnings: string[];
  metadata: {
    framework: string;
    version: string;
    generatedAt: string;
    nodeCount: number;
    edgeCount: number;
  };
}

// ============================================================================
// NODE TYPE DEFINITION
// ============================================================================

export interface FrameworkNodeType {
  id: string;
  label: string;
  description: string;
  icon: string; // Icon name from lucide-react
  category: 'agent' | 'tool' | 'control' | 'io' | 'other';
  color: string; // Hex color
  bgColor: string; // Background color
  
  // Which abstract node types this maps to
  abstractTypes: AbstractNodeType[];
  
  // Configuration schema (JSON Schema)
  configSchema: Record<string, any>;
  
  // Default configuration
  defaultConfig: Record<string, any>;
  
  // Whether this node type is available in this framework
  available: boolean;
}

// ============================================================================
// EDGE TYPE DEFINITION
// ============================================================================

export interface FrameworkEdgeType {
  id: string;
  label: string;
  description: string;
  animated: boolean;
  style: Record<string, any>;
}

// ============================================================================
// FRAMEWORK ADAPTER ABSTRACT CLASS
// ============================================================================

export abstract class FrameworkAdapter {
  /**
   * Framework identifier (langgraph, autogen, crewai, etc.)
   */
  abstract readonly name: string;
  
  /**
   * Framework display name
   */
  abstract readonly displayName: string;
  
  /**
   * Framework version
   */
  abstract readonly version: string;
  
  /**
   * Framework description
   */
  abstract readonly description: string;
  
  /**
   * Framework logo/icon
   */
  abstract readonly icon: string;
  
  /**
   * Framework documentation URL
   */
  abstract readonly docsUrl: string;
  
  // ==========================================================================
  // CODE GENERATION
  // ==========================================================================
  
  /**
   * Generate executable code from abstract workflow
   */
  abstract generate(workflow: AbstractWorkflow): GeneratedCode;
  
  /**
   * Generate code for a specific node
   */
  abstract generateNodeCode(node: AbstractNode, workflow: AbstractWorkflow): string;
  
  /**
   * Generate code for a specific edge
   */
  abstract generateEdgeCode(edge: AbstractEdge, workflow: AbstractWorkflow): string;
  
  /**
   * Generate imports section
   */
  abstract generateImports(workflow: AbstractWorkflow): string;
  
  /**
   * Generate state definition
   */
  abstract generateStateDefinition(workflow: AbstractWorkflow): string;
  
  /**
   * Generate workflow initialization code
   */
  abstract generateWorkflowInit(workflow: AbstractWorkflow): string;
  
  /**
   * Generate workflow compilation/build code
   */
  abstract generateWorkflowBuild(workflow: AbstractWorkflow): string;
  
  // ==========================================================================
  // VALIDATION
  // ==========================================================================
  
  /**
   * Validate workflow for this framework
   */
  abstract validate(workflow: AbstractWorkflow): ValidationResult;
  
  /**
   * Check if a specific node type is supported
   */
  abstract supportsNodeType(type: AbstractNodeType): boolean;
  
  /**
   * Check if a specific feature is supported
   */
  abstract supportsFeature(feature: string): boolean;
  
  // ==========================================================================
  // NODE & EDGE TYPES
  // ==========================================================================
  
  /**
   * Get all supported node types for this framework
   */
  abstract getNodeTypes(): FrameworkNodeType[];
  
  /**
   * Get all supported edge types for this framework
   */
  abstract getEdgeTypes(): FrameworkEdgeType[];
  
  /**
   * Get node type definition by ID
   */
  getNodeType(id: string): FrameworkNodeType | undefined {
    return this.getNodeTypes().find(type => type.id === id);
  }
  
  /**
   * Get edge type definition by ID
   */
  getEdgeType(id: string): FrameworkEdgeType | undefined {
    return this.getEdgeTypes().find(type => type.id === id);
  }
  
  // ==========================================================================
  // TRANSLATION
  // ==========================================================================
  
  /**
   * Translate abstract node to framework-specific representation
   */
  abstract translateNode(node: AbstractNode): any;
  
  /**
   * Translate abstract edge to framework-specific representation
   */
  abstract translateEdge(edge: AbstractEdge): any;
  
  // ==========================================================================
  // UTILITIES
  // ==========================================================================
  
  /**
   * Get list of required dependencies for this framework
   */
  abstract getDependencies(workflow: AbstractWorkflow): string[];
  
  /**
   * Get Docker template for this framework
   */
  abstract getDockerTemplate(workflow: AbstractWorkflow): string;
  
  /**
   * Get requirements.txt content
   */
  abstract getRequirementsTxt(workflow: AbstractWorkflow): string;
  
  /**
   * Get example usage code
   */
  abstract getExampleUsage(workflow: AbstractWorkflow): string;
  
  // ==========================================================================
  // HELPER METHODS (WITH DEFAULT IMPLEMENTATION)
  // ==========================================================================
  
  /**
   * Check if workflow is compatible with this framework
   */
  isCompatible(workflow: AbstractWorkflow): boolean {
    const validation = this.validate(workflow);
    return validation.valid;
  }
  
  /**
   * Get framework capabilities
   */
  getCapabilities(): {
    supportsConditional: boolean;
    supportsParallel: boolean;
    supportsHumanInLoop: boolean;
    supportsSubWorkflows: boolean;
    supportsCheckpoints: boolean;
    supportsStreaming: boolean;
  } {
    return {
      supportsConditional: this.supportsFeature('conditional'),
      supportsParallel: this.supportsFeature('parallel'),
      supportsHumanInLoop: this.supportsFeature('human'),
      supportsSubWorkflows: this.supportsFeature('subworkflow'),
      supportsCheckpoints: this.supportsFeature('checkpoints'),
      supportsStreaming: this.supportsFeature('streaming'),
    };
  }
  
  /**
   * Format Python code with black (via API or local)
   */
  protected formatPythonCode(code: string): string {
    // TODO: Integrate with black formatter
    // For now, just return as-is
    return code;
  }
  
  /**
   * Validate Python syntax
   */
  protected async validatePythonSyntax(code: string): Promise<boolean> {
    // TODO: Integrate with Python AST parser
    // For now, just basic checks
    return code.length > 0 && code.includes('def ') || code.includes('class ');
  }
  
  /**
   * Sanitize node ID for use in code (make valid Python identifier)
   */
  protected sanitizeNodeId(nodeId: string): string {
    return nodeId
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .replace(/^[0-9]/, '_$&'); // Can't start with number
  }
  
  /**
   * Generate function name from node
   */
  protected generateFunctionName(node: AbstractNode): string {
    const sanitizedLabel = node.label
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    
    return `${sanitizedLabel}_${this.sanitizeNodeId(node.id).slice(0, 8)}`;
  }
}

// ============================================================================
// FRAMEWORK REGISTRY
// ============================================================================

export class FrameworkRegistry {
  private static adapters = new Map<string, FrameworkAdapter>();
  
  /**
   * Register a framework adapter
   */
  static register(adapter: FrameworkAdapter): void {
    this.adapters.set(adapter.name, adapter);
  }
  
  /**
   * Get adapter by framework name
   */
  static get(name: string): FrameworkAdapter | undefined {
    return this.adapters.get(name);
  }
  
  /**
   * Get all registered adapters
   */
  static getAll(): FrameworkAdapter[] {
    return Array.from(this.adapters.values());
  }
  
  /**
   * Check if framework is registered
   */
  static has(name: string): boolean {
    return this.adapters.has(name);
  }
  
  /**
   * Get adapter names
   */
  static getNames(): string[] {
    return Array.from(this.adapters.keys());
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get best framework for a workflow based on its characteristics
 */
export function recommendFramework(workflow: AbstractWorkflow): string {
  const hasConditional = workflow.nodes.some(n => n.type === 'condition');
  const hasParallel = workflow.nodes.some(n => n.type === 'parallel');
  const hasHuman = workflow.nodes.some(n => n.type === 'human');
  const nodeCount = workflow.nodes.length;
  
  // Simple heuristics
  if (hasHuman || workflow.config.checkpointer !== 'none') {
    return 'langgraph'; // Best for stateful workflows
  }
  
  if (nodeCount > 10 || hasParallel) {
    return 'crewai'; // Good for complex multi-agent systems
  }
  
  if (workflow.nodes.filter(n => n.type === 'agent').length > 3) {
    return 'autogen'; // Good for multiple conversational agents
  }
  
  return 'langgraph'; // Default
}

/**
 * Compare frameworks for a given workflow
 */
export function compareFrameworks(
  workflow: AbstractWorkflow
): Array<{
  framework: string;
  compatible: boolean;
  score: number;
  reasons: string[];
}> {
  const adapters = FrameworkRegistry.getAll();
  
  return adapters.map(adapter => {
    const validation = adapter.validate(workflow);
    const capabilities = adapter.getCapabilities();
    
    let score = 100;
    const reasons: string[] = [];
    
    // Deduct points for unsupported features
    workflow.nodes.forEach(node => {
      if (!adapter.supportsNodeType(node.type as AbstractNodeType)) {
        score -= 20;
        reasons.push(`Does not support ${node.type} nodes`);
      }
    });
    
    // Add points for good matches
    if (capabilities.supportsCheckpoints && workflow.config.checkpointer !== 'none') {
      score += 10;
      reasons.push('Supports checkpointing');
    }
    
    if (validation.warnings.length > 0) {
      score -= validation.warnings.length * 5;
      reasons.push(`${validation.warnings.length} warnings`);
    }
    
    return {
      framework: adapter.name,
      compatible: validation.valid,
      score: Math.max(0, score),
      reasons,
    };
  }).sort((a, b) => b.score - a.score);
}

