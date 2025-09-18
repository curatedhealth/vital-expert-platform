# JTBD Workflow Configuration & Management System Analysis

**Comprehensive analysis of the current JTBD workflow configuration system and recommendations for enhanced dynamic workflow creation, agent assignment, and customization capabilities.**

**Date:** January 17, 2025
**Purpose:** Understand current workflow configuration architecture and design enhanced system

---

## PART 1: CURRENT STATE ANALYSIS

### 1.1 Database Schema Discovery

#### **Core JTBD Tables**

```sql
-- Primary workflow configuration tables
jtbd_process_steps (
  id: number,
  jtbd_id: string,              -- Links to workflow definition
  step_number: number,          -- Sequential ordering
  step_name: string,            -- Human-readable step name
  step_description: string,     -- Detailed step description
  agent_id: string | null,      -- Optional agent assignment
  is_parallel: boolean,         -- Parallel execution flag
  estimated_duration: number,   -- Duration in minutes
  required_capabilities: string[], -- Required agent capabilities
  input_schema: JSON,           -- Expected input format
  output_schema: JSON,          -- Expected output format
  error_handling: JSON          -- Error handling strategy
);

jtbd_executions (
  id: number,
  jtbd_id: string,
  user_id: string,
  organization_id: string | null,
  execution_timestamp: string,
  completion_timestamp: string | null,
  status: 'Initializing' | 'Running' | 'Completed' | 'Failed' | 'Cancelled',
  execution_mode: 'Automated' | 'Semi-automated' | 'Manual',
  agents_used: JSON,            -- Track which agents were used
  llms_used: JSON,              -- Track LLM usage
  total_tokens_consumed: number | null,
  total_cost: number | null,
  outputs: JSON,                -- Final execution outputs
  execution_log: JSON,          -- Detailed execution log
  error_details: JSON | null,   -- Error information
  satisfaction_score: number | null,
  feedback: string | null,
  execution_metadata: JSON      -- Additional execution data
);

agents (
  id: string,
  name: string,                 -- Technical name
  display_name: string,         -- Human-readable name
  description: string,          -- Agent description
  avatar: string,               -- Avatar URL
  color: string,                -- UI color theme
  system_prompt: string,        -- LLM system prompt
  model: string,                -- LLM model (gpt-4, claude-3, etc.)
  temperature: number,          -- LLM temperature setting
  max_tokens: number,           -- Token limit
  capabilities: JSON,           -- Agent capabilities array
  specializations: JSON,        -- Domain specializations
  tools: JSON,                  -- Available tools
  tier: number,                 -- Priority tier (1-3)
  priority: number,             -- Execution priority
  implementation_phase: number, -- Development phase
  rag_enabled: boolean,         -- RAG capability
  knowledge_domains: JSON,      -- Knowledge areas
  data_sources: JSON,           -- Data source access
  roi_metrics: JSON,            -- ROI tracking
  use_cases: JSON,              -- Use case examples
  target_users: JSON,           -- Target user types
  required_integrations: JSON,  -- Integration requirements
  security_level: string,       -- Security classification
  compliance_requirements: JSON, -- Compliance needs
  status: 'active' | 'inactive' | 'development' | 'deprecated',
  is_custom: boolean,           -- User-created agent
  created_by: string | null,
  created_at: string,
  updated_at: string
);
```

#### **Agent Management Tables**

```sql
agent_categories (
  id: string,
  name: string,                 -- Category identifier
  display_name: string,         -- Human-readable name
  description: string | null,   -- Category description
  color: string,                -- UI color
  icon: string,                 -- Icon identifier
  sort_order: number,           -- Display order
  created_at: string
);

agent_category_mapping (
  id: string,
  agent_id: string,             -- FK to agents
  category_id: string,          -- FK to agent_categories
  created_at: string
);

agent_collaborations (
  id: string,
  name: string,                 -- Collaboration name
  description: string,          -- Description
  workflow_pattern: JSON,       -- Workflow execution pattern
  primary_agent_id: string | null, -- Primary agent
  secondary_agents: JSON,       -- Supporting agents
  trigger_conditions: JSON,     -- When to activate
  success_metrics: JSON,        -- Success measurement
  is_active: boolean,
  created_at: string,
  updated_at: string
);
```

### 1.2 TypeScript Data Models

#### **Core JTBD Interfaces**

```typescript
// Primary JTBD definition
export interface JTBD {
  id: string;
  title: string;
  verb: string;
  goal: string;
  function: 'Medical Affairs' | 'Commercial' | 'Market Access' | 'HR' | 'Operations';
  category: string;
  description: string;
  business_value: string;
  complexity: 'Low' | 'Medium' | 'High';
  time_to_value: string;
  implementation_cost: '$' | '$$' | '$$$';
  workshop_potential: 'Low' | 'Medium' | 'High';
  maturity_level: string;
  tags: string[];
  keywords: string[];
  is_active: boolean;
  usage_count: number;
  success_rate: number;
  avg_execution_time?: number;
  created_at: string;
  updated_at: string;
}

// Workflow step definition
export interface JTBDProcessStep {
  id: number;
  jtbd_id: string;
  step_number: number;
  step_name: string;
  step_description: string;
  agent_id?: string;                    // Current: Optional agent assignment
  is_parallel: boolean;                 // Current: Basic parallel flag
  estimated_duration: number;          // Current: Duration in minutes
  required_capabilities: string[];     // Current: Capability requirements
  input_schema: any;                   // Current: Input data structure
  output_schema: any;                  // Current: Output data structure
  error_handling: any;                 // Current: Error handling config
}

// Enhanced execution context with agent assignments
export interface ExecutionContext {
  execution_id: number;
  jtbd_id: string;
  user_id: string;
  execution_mode: 'Automated' | 'Semi-automated' | 'Manual';
  input_data?: any;
  current_step: number;
  total_steps: number;
  accumulated_results: any[];
  error_count: number;
  start_time: Date;
  agent_assignments?: { [stepNumber: number]: string }; // Custom agent assignments
}

// Detailed JTBD with all related data
export interface DetailedJTBD extends JTBD {
  pain_points: JTBDPainPoint[];
  ai_techniques: JTBDAITechnique[];
  data_requirements: JTBDDataRequirement[];
  tools: JTBDTool[];
  persona_mapping: JTBDPersonaMapping[];
  process_steps: JTBDProcessStep[];
  recent_executions?: JTBDExecution[];
}
```

#### **Agent Configuration Models**

```typescript
// Agent definition from database
export type Agent = Database['public']['Tables']['agents']['Row'];

export interface AgentWithCategories extends Agent {
  categories: AgentCategory[];
}

export interface AgentWithCapabilities extends Agent {
  capabilities_detail: (AgentCapability & { capability: Capability })[];
  primary_capabilities: (AgentCapability & { capability: Capability })[];
}

export interface CapabilityWithProficiency extends Capability {
  proficiency_level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  is_primary: boolean;
}
```

### 1.3 Current Workflow Configuration Examples

#### **MA001 - Medical Affairs Trend Analysis Workflow**

```json
{
  "jtbd_id": "MA001",
  "title": "Identify and analyze emerging pharmaceutical trends",
  "function": "Medical Affairs",
  "complexity": "Medium",
  "process_steps": [
    {
      "step_number": 1,
      "step_name": "Initialize Trend Analysis",
      "step_description": "Set up data sources and analysis parameters for trend identification",
      "agent_id": null,
      "estimated_duration": 15,
      "required_capabilities": [],
      "input_schema": {
        "therapeutic_areas": "array",
        "time_range": "object"
      },
      "output_schema": {
        "analysis_config": "object",
        "data_sources": "array"
      }
    },
    {
      "step_number": 2,
      "step_name": "Conduct Literature Analysis",
      "step_description": "Analyze recent publications and research trends",
      "agent_id": null,
      "estimated_duration": 30,
      "required_capabilities": [],
      "input_schema": {
        "analysis_config": "object"
      },
      "output_schema": {
        "trend_insights": "array",
        "key_publications": "array"
      }
    },
    {
      "step_number": 3,
      "step_name": "Generate Trend Report",
      "step_description": "Compile findings into actionable insights report",
      "agent_id": null,
      "estimated_duration": 20,
      "required_capabilities": [],
      "input_schema": {
        "trend_insights": "array"
      },
      "output_schema": {
        "final_report": "object",
        "recommendations": "array"
      }
    }
  ]
}
```

#### **Available Pharmaceutical Agents**

```json
{
  "fda-regulatory-navigator": {
    "id": "c34b915f-02fc-4e75-91a9-72cae5d4b1a5",
    "name": "fda-regulatory-navigator",
    "display_name": "FDA Regulatory Navigator",
    "tier": 1,
    "model": "gpt-4",
    "capabilities": [
      "Regulatory Pathway Analysis",
      "Submission Planning",
      "Predicate Identification",
      "FDA Meeting Prep"
    ],
    "specializations": ["FDA", "510k", "PMA", "De Novo"],
    "status": "active"
  },
  "clinical-trial-architect": {
    "id": "80e85f23-880d-4ae2-b2f5-d7b95dc08bea",
    "name": "clinical-trial-architect",
    "display_name": "Clinical Trial Architect",
    "tier": 1,
    "model": "gpt-4",
    "capabilities": [
      "Study Design",
      "Biostatistics",
      "Endpoint Selection",
      "Protocol Development",
      "Sample Size Calculation"
    ],
    "specializations": ["RCT", "RWE", "Biostatistics"],
    "status": "active"
  }
}
```

### 1.4 Current System Strengths

#### **✅ Sophisticated Architecture**
- **589 LOC execution engine** with advanced orchestration patterns
- **627 LOC agent service** with enterprise-grade database integration
- **467 LOC LLM orchestrator** with pharmaceutical specialization
- Real-time execution tracking via WebSocket
- Database-driven agent management

#### **✅ Pharmaceutical Domain Specialization**
- Pre-configured specialized agents (FDA regulatory, clinical trial design)
- Industry-specific capabilities and knowledge domains
- Regulatory compliance tracking
- Cost and ROI metrics

#### **✅ Flexible Execution Models**
- Automated, semi-automated, and manual execution modes
- Step-by-step progress tracking
- Error handling and recovery
- Custom agent assignments (via `agent_assignments` parameter)

### 1.5 Current System Limitations

#### **❌ Static Workflow Configuration**
- No visual workflow builder
- Workflows stored as static database records
- Limited conditional logic support
- No drag-and-drop step creation

#### **❌ Basic Agent Assignment**
- Manual agent assignment per execution
- No intelligent agent matching
- Limited agent collaboration patterns
- No dynamic agent selection based on step requirements

#### **❌ Missing Advanced Features**
- No workflow templates library
- No conditional branching or loops
- No sub-workflow support
- No workflow versioning
- Limited workflow testing capabilities

---

## PART 2: ENHANCED SYSTEM DESIGN

### 2.1 Visual Workflow Builder Architecture

#### **Component Structure**

```typescript
// Enhanced workflow definition with advanced features
interface EnhancedWorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  steps: EnhancedWorkflowStep[];
  conditional_logic: ConditionalBranch[];
  parallel_branches: ParallelBranch[];
  error_strategies: ErrorStrategy[];
  success_criteria: SuccessCriteria;
  metadata: WorkflowMetadata;
}

interface EnhancedWorkflowStep extends JTBDProcessStep {
  // Enhanced step configuration
  conditional_next?: ConditionalNext[];     // Multiple next steps based on conditions
  parallel_steps?: string[];               // Steps that can run in parallel
  retry_config?: RetryConfiguration;       // Retry logic
  timeout_config?: TimeoutConfiguration;   // Timeout handling
  agent_selection?: AgentSelectionStrategy; // Dynamic agent selection
  validation_rules?: ValidationRule[];     // Input/output validation
  monitoring_config?: MonitoringConfig;    // Performance monitoring
}

interface ConditionalNext {
  condition: string;                       // JavaScript expression
  next_step_id: string;                   // Target step
  transform_data?: DataTransformation;    // Data transformation
}

interface AgentSelectionStrategy {
  strategy: 'manual' | 'automatic' | 'consensus' | 'load_balanced';
  criteria: AgentSelectionCriteria;
  fallback_agents?: string[];
  consensus_config?: ConsensusConfiguration;
}
```

#### **Visual Builder Component**

```typescript
// WorkflowDesigner.tsx - Main visual builder component
import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface WorkflowDesignerProps {
  workflow?: EnhancedWorkflowDefinition;
  onSave: (workflow: EnhancedWorkflowDefinition) => void;
  onTest: (workflow: EnhancedWorkflowDefinition) => void;
}

export const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({
  workflow,
  onSave,
  onTest
}) => {
  const [currentWorkflow, setCurrentWorkflow] = useState<EnhancedWorkflowDefinition>(
    workflow || createEmptyWorkflow()
  );
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);

  // Drag and drop handlers
  const handleStepDrop = useCallback((stepType: string, position: Position) => {
    const newStep = createStepFromTemplate(stepType, position);
    setCurrentWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  }, []);

  const handleStepConnect = useCallback((sourceId: string, targetId: string) => {
    // Create connection between steps
    setCurrentWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === sourceId
          ? { ...step, next_steps: [...(step.next_steps || []), targetId] }
          : step
      )
    }));
  }, []);

  // Validation
  const validateWorkflow = useCallback(() => {
    const errors: ValidationError[] = [];

    // Check for disconnected steps
    const connectedSteps = new Set<string>();
    currentWorkflow.steps.forEach(step => {
      step.next_steps?.forEach(nextId => connectedSteps.add(nextId));
    });

    const orphanSteps = currentWorkflow.steps.filter(
      step => !connectedSteps.has(step.id) && step.step_number !== 1
    );

    if (orphanSteps.length > 0) {
      errors.push({
        type: 'disconnected_steps',
        message: `Disconnected steps: ${orphanSteps.map(s => s.step_name).join(', ')}`,
        steps: orphanSteps.map(s => s.id)
      });
    }

    return errors;
  }, [currentWorkflow]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="workflow-designer">
        {/* Toolbar */}
        <WorkflowToolbar
          onSave={() => onSave(currentWorkflow)}
          onTest={() => onTest(currentWorkflow)}
          onValidate={validateWorkflow}
        />

        {/* Step Library Panel */}
        <StepLibraryPanel
          onStepSelect={handleStepDrop}
        />

        {/* Main Canvas */}
        <WorkflowCanvas
          workflow={currentWorkflow}
          selectedStep={selectedStep}
          onStepSelect={setSelectedStep}
          onStepConnect={handleStepConnect}
          onStepUpdate={(stepId, updates) => {
            setCurrentWorkflow(prev => ({
              ...prev,
              steps: prev.steps.map(step =>
                step.id === stepId ? { ...step, ...updates } : step
              )
            }));
          }}
        />

        {/* Properties Panel */}
        <StepPropertiesPanel
          step={selectedStep ? currentWorkflow.steps.find(s => s.id === selectedStep) : null}
          availableAgents={availableAgents}
          onStepUpdate={(updates) => {
            if (selectedStep) {
              setCurrentWorkflow(prev => ({
                ...prev,
                steps: prev.steps.map(step =>
                  step.id === selectedStep ? { ...step, ...updates } : step
                )
              }));
            }
          }}
        />
      </div>
    </DndProvider>
  );
};
```

### 2.2 Dynamic Agent Selection System

#### **Intelligent Agent Matcher**

```typescript
// DynamicAgentSelector.ts - Smart agent selection
export class DynamicAgentSelector {
  constructor(
    private agentService: AgentService,
    private performanceTracker: AgentPerformanceTracker
  ) {}

  async selectOptimalAgent(
    step: EnhancedWorkflowStep,
    context: ExecutionContext,
    selectionStrategy: AgentSelectionStrategy
  ): Promise<Agent> {
    const availableAgents = await this.agentService.getActiveAgents();

    switch (selectionStrategy.strategy) {
      case 'automatic':
        return this.automaticSelection(step, availableAgents, context);
      case 'consensus':
        return this.consensusSelection(step, availableAgents, selectionStrategy.consensus_config);
      case 'load_balanced':
        return this.loadBalancedSelection(step, availableAgents);
      default:
        return this.manualSelection(step, selectionStrategy.criteria.preferred_agent_id);
    }
  }

  private async automaticSelection(
    step: EnhancedWorkflowStep,
    agents: Agent[],
    context: ExecutionContext
  ): Promise<Agent> {
    // Score agents based on multiple criteria
    const scoredAgents = agents.map(agent => ({
      agent,
      score: this.calculateAgentScore(agent, step, context)
    }));

    // Sort by score and return best match
    scoredAgents.sort((a, b) => b.score - a.score);

    if (scoredAgents.length === 0) {
      throw new Error('No suitable agents found for step');
    }

    return scoredAgents[0].agent;
  }

  private calculateAgentScore(
    agent: Agent,
    step: EnhancedWorkflowStep,
    context: ExecutionContext
  ): number {
    let score = 0;

    // Capability matching (40% weight)
    const capabilityMatch = this.calculateCapabilityMatch(
      agent.capabilities as string[],
      step.required_capabilities
    );
    score += capabilityMatch * 0.4;

    // Performance history (30% weight)
    const performanceScore = this.performanceTracker.getAgentScore(agent.id, step.jtbd_id);
    score += performanceScore * 0.3;

    // Current load (20% weight)
    const loadScore = this.calculateLoadScore(agent.id);
    score += loadScore * 0.2;

    // Cost efficiency (10% weight)
    const costScore = this.calculateCostScore(agent);
    score += costScore * 0.1;

    return score;
  }

  private calculateCapabilityMatch(
    agentCapabilities: string[],
    requiredCapabilities: string[]
  ): number {
    if (requiredCapabilities.length === 0) return 1.0;

    const matches = requiredCapabilities.filter(required =>
      agentCapabilities.some(capability =>
        capability.toLowerCase().includes(required.toLowerCase()) ||
        this.isCapabilitySynonym(capability, required)
      )
    );

    return matches.length / requiredCapabilities.length;
  }

  private async consensusSelection(
    step: EnhancedWorkflowStep,
    agents: Agent[],
    consensusConfig?: ConsensusConfiguration
  ): Promise<Agent[]> {
    // Select multiple agents for consensus
    const topAgents = agents
      .map(agent => ({
        agent,
        score: this.calculateAgentScore(agent, step, {} as ExecutionContext)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, consensusConfig?.agent_count || 3)
      .map(scored => scored.agent);

    return topAgents;
  }
}
```

#### **Agent Performance Tracking**

```typescript
// AgentPerformanceTracker.ts
export class AgentPerformanceTracker {
  constructor(private supabase: SupabaseClient) {}

  async trackExecution(
    agentId: string,
    stepId: string,
    performance: PerformanceMetrics
  ): Promise<void> {
    const metrics = {
      agent_id: agentId,
      step_id: stepId,
      execution_time: performance.executionTime,
      success_rate: performance.successRate,
      quality_score: performance.qualityScore,
      cost_per_token: performance.costPerToken,
      user_satisfaction: performance.userSatisfaction,
      error_count: performance.errorCount,
      recorded_at: new Date().toISOString()
    };

    await this.supabase
      .from('agent_performance_metrics')
      .insert([metrics]);
  }

  getAgentScore(agentId: string, jtbdId?: string): number {
    // Calculate weighted performance score
    // This would query recent performance data
    return 0.85; // Placeholder
  }

  async getAgentAnalytics(
    agentId: string,
    timeRange: TimeRange
  ): Promise<AgentAnalytics> {
    const { data } = await this.supabase
      .from('agent_performance_metrics')
      .select('*')
      .eq('agent_id', agentId)
      .gte('recorded_at', timeRange.start)
      .lte('recorded_at', timeRange.end);

    return this.calculateAnalytics(data || []);
  }
}
```

### 2.3 Workflow Template Library

#### **Template Management System**

```typescript
// WorkflowTemplateService.ts
export class WorkflowTemplateService {
  constructor(private supabase: SupabaseClient) {}

  async createTemplate(
    workflow: EnhancedWorkflowDefinition,
    templateMetadata: TemplateMetadata
  ): Promise<WorkflowTemplate> {
    const template: WorkflowTemplate = {
      id: generateId(),
      name: templateMetadata.name,
      description: templateMetadata.description,
      category: templateMetadata.category,
      industry_tags: templateMetadata.industryTags,
      complexity_level: workflow.complexity,
      estimated_duration: this.calculateTotalDuration(workflow),
      template_data: workflow,
      usage_count: 0,
      rating: 0,
      created_by: templateMetadata.createdBy,
      is_public: templateMetadata.isPublic,
      created_at: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from('workflow_templates')
      .insert([template])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deployTemplate(
    templateId: string,
    customizations: TemplateCustomizations
  ): Promise<EnhancedWorkflowDefinition> {
    const template = await this.getTemplate(templateId);
    if (!template) throw new Error('Template not found');

    // Apply customizations
    const workflow = this.applyCustomizations(template.template_data, customizations);

    // Update usage count
    await this.supabase
      .from('workflow_templates')
      .update({ usage_count: template.usage_count + 1 })
      .eq('id', templateId);

    return workflow;
  }

  private applyCustomizations(
    baseWorkflow: EnhancedWorkflowDefinition,
    customizations: TemplateCustomizations
  ): EnhancedWorkflowDefinition {
    let customized = { ...baseWorkflow };

    // Apply agent assignments
    if (customizations.agentAssignments) {
      customized.steps = customized.steps.map(step => ({
        ...step,
        agent_id: customizations.agentAssignments[step.id] || step.agent_id
      }));
    }

    // Apply parameter overrides
    if (customizations.parameterOverrides) {
      customized.steps = customized.steps.map(step => ({
        ...step,
        input_schema: {
          ...step.input_schema,
          ...customizations.parameterOverrides[step.id]
        }
      }));
    }

    // Apply conditional logic modifications
    if (customizations.conditionalLogic) {
      customized.conditional_logic = [
        ...customized.conditional_logic,
        ...customizations.conditionalLogic
      ];
    }

    return customized;
  }
}
```

#### **Pharmaceutical Template Library**

```typescript
// PharmaceuticalTemplates.ts
export const pharmaceuticalTemplates: Record<string, WorkflowTemplate> = {
  fdaSubmission: {
    id: 'template-fda-510k',
    name: 'FDA 510(k) Submission Workflow',
    description: 'Complete workflow for FDA medical device submission including predicate analysis, clinical evidence compilation, and submission preparation',
    category: 'Regulatory',
    industry_tags: ['FDA', 'Medical Devices', '510k', 'Regulatory'],
    complexity_level: 'High',
    estimated_duration: 180, // 3 hours
    template_data: {
      id: 'fda-510k-workflow',
      name: 'FDA 510(k) Submission',
      version: '1.0',
      category: 'Regulatory',
      steps: [
        {
          id: 'step-1',
          step_number: 1,
          step_name: 'Regulatory Gap Analysis',
          step_description: 'Conduct comprehensive analysis of regulatory requirements and identify gaps',
          estimated_duration: 30,
          required_capabilities: ['regulatory_analysis', 'fda_expertise'],
          agent_selection: {
            strategy: 'automatic',
            criteria: {
              required_specializations: ['FDA', '510k'],
              minimum_tier: 1
            }
          },
          input_schema: {
            device_description: 'string',
            intended_use: 'string',
            target_population: 'string'
          },
          output_schema: {
            gap_analysis: 'object',
            required_studies: 'array',
            timeline_estimate: 'object'
          }
        },
        {
          id: 'step-2',
          step_number: 2,
          step_name: 'Predicate Device Analysis',
          step_description: 'Identify and analyze predicate devices for substantial equivalence',
          estimated_duration: 45,
          required_capabilities: ['predicate_analysis', 'database_search'],
          conditional_next: [
            {
              condition: 'output.predicates.length > 0',
              next_step_id: 'step-3'
            },
            {
              condition: 'output.predicates.length === 0',
              next_step_id: 'step-2b'
            }
          ]
        },
        {
          id: 'step-2b',
          step_number: 2.1,
          step_name: 'De Novo Pathway Assessment',
          step_description: 'Evaluate if De Novo pathway is appropriate when no predicates exist',
          estimated_duration: 30,
          required_capabilities: ['de_novo_analysis', 'risk_assessment']
        },
        {
          id: 'step-3',
          step_number: 3,
          step_name: 'Clinical Evidence Compilation',
          step_description: 'Compile and analyze clinical evidence for substantial equivalence',
          estimated_duration: 60,
          required_capabilities: ['clinical_data_analysis', 'evidence_synthesis'],
          parallel_steps: ['step-4'], // Can run in parallel with testing strategy
        },
        {
          id: 'step-4',
          step_number: 4,
          step_name: 'Testing Strategy Development',
          step_description: 'Develop comprehensive testing strategy for device validation',
          estimated_duration: 45,
          required_capabilities: ['testing_protocols', 'standards_knowledge']
        },
        {
          id: 'step-5',
          step_number: 5,
          step_name: 'Submission Package Assembly',
          step_description: 'Compile complete 510(k) submission package',
          estimated_duration: 40,
          required_capabilities: ['document_preparation', 'submission_formatting'],
          validation_rules: [
            {
              field: 'predicate_comparison',
              rule: 'required',
              message: 'Predicate comparison table is required'
            },
            {
              field: 'clinical_data',
              rule: 'min_studies',
              value: 1,
              message: 'At least one clinical study is required'
            }
          ]
        }
      ],
      conditional_logic: [
        {
          id: 'no-predicates-branch',
          condition: 'step_2.output.predicates.length === 0',
          actions: [
            'insert_step:step-2b',
            'notify_user:de_novo_required'
          ]
        }
      ],
      success_criteria: {
        required_outputs: ['gap_analysis', 'predicate_analysis', 'submission_package'],
        quality_thresholds: {
          confidence_score: 0.8,
          completeness_score: 0.9
        }
      }
    },
    usage_count: 0,
    rating: 0,
    created_by: 'system',
    is_public: true,
    created_at: new Date().toISOString()
  },

  clinicalTrialDesign: {
    id: 'template-clinical-trial',
    name: 'Clinical Trial Protocol Design',
    description: 'End-to-end clinical trial protocol development including study design, statistical planning, and regulatory considerations',
    category: 'Clinical',
    industry_tags: ['Clinical Trials', 'Biostatistics', 'Protocol Design'],
    complexity_level: 'High',
    estimated_duration: 240, // 4 hours
    template_data: {
      id: 'clinical-trial-workflow',
      name: 'Clinical Trial Protocol Design',
      version: '1.0',
      category: 'Clinical',
      steps: [
        {
          id: 'step-1',
          step_number: 1,
          step_name: 'Literature Review and Background',
          step_description: 'Comprehensive review of existing literature and regulatory landscape',
          estimated_duration: 45,
          required_capabilities: ['literature_search', 'evidence_review'],
          agent_selection: {
            strategy: 'automatic',
            criteria: {
              required_specializations: ['Clinical Research', 'Literature Review']
            }
          }
        },
        {
          id: 'step-2',
          step_number: 2,
          step_name: 'Study Objectives and Endpoints',
          step_description: 'Define primary and secondary objectives with measurable endpoints',
          estimated_duration: 30,
          required_capabilities: ['endpoint_selection', 'clinical_design']
        },
        {
          id: 'step-3',
          step_number: 3,
          step_name: 'Statistical Design and Power Analysis',
          step_description: 'Determine study design, sample size, and statistical analysis plan',
          estimated_duration: 60,
          required_capabilities: ['biostatistics', 'sample_size_calculation', 'power_analysis']
        },
        {
          id: 'step-4',
          step_number: 4,
          step_name: 'Inclusion/Exclusion Criteria',
          step_description: 'Define patient population and enrollment criteria',
          estimated_duration: 30,
          required_capabilities: ['patient_selection', 'clinical_criteria']
        },
        {
          id: 'step-5',
          step_number: 5,
          step_name: 'Protocol Development',
          step_description: 'Draft complete clinical trial protocol document',
          estimated_duration: 75,
          required_capabilities: ['protocol_writing', 'regulatory_compliance']
        }
      ]
    },
    usage_count: 0,
    rating: 0,
    created_by: 'system',
    is_public: true,
    created_at: new Date().toISOString()
  },

  marketAccessStrategy: {
    id: 'template-market-access',
    name: 'Market Access and Reimbursement Strategy',
    description: 'Comprehensive market access planning including HTA assessment, payer strategy, and value demonstration',
    category: 'Market Access',
    industry_tags: ['Market Access', 'Reimbursement', 'HTA', 'Health Economics'],
    complexity_level: 'Medium',
    estimated_duration: 150, // 2.5 hours
    template_data: {
      id: 'market-access-workflow',
      name: 'Market Access Strategy',
      version: '1.0',
      category: 'Market Access',
      steps: [
        {
          id: 'step-1',
          step_number: 1,
          step_name: 'Market Landscape Analysis',
          step_description: 'Analyze competitive landscape and reimbursement environment',
          estimated_duration: 40,
          required_capabilities: ['market_research', 'competitive_analysis']
        },
        {
          id: 'step-2',
          step_number: 2,
          step_name: 'HTA Requirements Assessment',
          step_description: 'Evaluate Health Technology Assessment requirements across target markets',
          estimated_duration: 35,
          required_capabilities: ['hta_analysis', 'regulatory_landscape']
        },
        {
          id: 'step-3',
          step_number: 3,
          step_name: 'Value Proposition Development',
          step_description: 'Develop compelling value proposition for payers and providers',
          estimated_duration: 45,
          required_capabilities: ['value_messaging', 'health_economics']
        },
        {
          id: 'step-4',
          step_number: 4,
          step_name: 'Economic Modeling',
          step_description: 'Build health economic models to demonstrate value',
          estimated_duration: 30,
          required_capabilities: ['economic_modeling', 'cost_effectiveness']
        }
      ]
    },
    usage_count: 0,
    rating: 0,
    created_by: 'system',
    is_public: true,
    created_at: new Date().toISOString()
  }
};
```

### 2.4 Conditional Workflow Logic Engine

#### **Enhanced Execution Engine**

```typescript
// ConditionalWorkflowEngine.ts
export class ConditionalWorkflowEngine extends JTBDExecutionEngine {
  async executeWorkflow(
    executionId: number,
    workflow: EnhancedWorkflowDefinition
  ): Promise<void> {
    const context = this.activeExecutions.get(executionId);
    if (!context) throw new Error(`Execution context ${executionId} not found`);

    try {
      // Initialize workflow state
      const workflowState = new WorkflowState(workflow, context);

      // Execute steps with conditional logic
      while (!workflowState.isComplete()) {
        const currentSteps = workflowState.getNextSteps();

        if (currentSteps.length === 0) {
          throw new Error('Workflow deadlock detected - no next steps available');
        }

        // Execute steps (parallel or sequential)
        if (currentSteps.some(step => step.is_parallel)) {
          await this.executeParallelSteps(currentSteps, workflowState);
        } else {
          for (const step of currentSteps) {
            await this.executeStep(step, workflowState);
          }
        }
      }

      await this.completeExecution(executionId);
    } catch (error) {
      await this.handleExecutionError(executionId, error);
    }
  }

  private async executeStep(
    step: EnhancedWorkflowStep,
    workflowState: WorkflowState
  ): Promise<void> {
    console.log(`🔧 Executing step: ${step.step_name}`);

    // Pre-execution validation
    await this.validateStepInputs(step, workflowState);

    // Dynamic agent selection
    const agent = await this.selectAgentForStep(step, workflowState);

    // Execute step with timeout and retry logic
    const result = await this.executeWithRetryAndTimeout(step, agent, workflowState);

    // Post-execution validation
    await this.validateStepOutputs(step, result);

    // Update workflow state
    workflowState.completeStep(step.id, result);

    // Evaluate conditional logic
    await this.evaluateConditionalLogic(step, result, workflowState);
  }

  private async executeParallelSteps(
    steps: EnhancedWorkflowStep[],
    workflowState: WorkflowState
  ): Promise<void> {
    console.log(`⚡ Executing ${steps.length} steps in parallel`);

    const promises = steps.map(step => this.executeStep(step, workflowState));

    // Wait for all parallel steps to complete
    const results = await Promise.allSettled(promises);

    // Handle any failures
    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
      console.error(`${failures.length} parallel steps failed`);
      // Implement failure handling strategy
    }
  }

  private async evaluateConditionalLogic(
    step: EnhancedWorkflowStep,
    result: StepResult,
    workflowState: WorkflowState
  ): Promise<void> {
    if (!step.conditional_next) return;

    for (const condition of step.conditional_next) {
      const shouldExecute = await this.evaluateCondition(
        condition.condition,
        result,
        workflowState
      );

      if (shouldExecute) {
        // Apply data transformation if specified
        if (condition.transform_data) {
          const transformedData = this.applyDataTransformation(
            result.output_data,
            condition.transform_data
          );
          workflowState.setStepInput(condition.next_step_id, transformedData);
        }

        // Queue next step
        workflowState.queueStep(condition.next_step_id);
        break; // Execute only the first matching condition
      }
    }
  }

  private async evaluateCondition(
    condition: string,
    stepResult: StepResult,
    workflowState: WorkflowState
  ): Promise<boolean> {
    try {
      // Create safe evaluation context
      const context = {
        output: stepResult.output_data,
        confidence: stepResult.confidence,
        error_count: workflowState.getErrorCount(),
        previous_results: workflowState.getAccumulatedResults(),
        execution_time: stepResult.execution_time_minutes
      };

      // Use a safe expression evaluator (e.g., using a sandboxed environment)
      return this.safeEvaluate(condition, context);
    } catch (error) {
      console.error(`Condition evaluation failed: ${condition}`, error);
      return false;
    }
  }

  private safeEvaluate(expression: string, context: any): boolean {
    // Implement safe expression evaluation
    // This could use a library like `expr-eval` or a custom parser
    // For now, using a simple implementation

    // Replace context variables in expression
    let safeExpression = expression;
    Object.keys(context).forEach(key => {
      const value = context[key];
      if (typeof value === 'string') {
        safeExpression = safeExpression.replace(
          new RegExp(`\\b${key}\\b`, 'g'),
          `"${value}"`
        );
      } else {
        safeExpression = safeExpression.replace(
          new RegExp(`\\b${key}\\b`, 'g'),
          JSON.stringify(value)
        );
      }
    });

    // Use Function constructor for safe evaluation (avoid eval)
    try {
      return new Function('return ' + safeExpression)();
    } catch {
      return false;
    }
  }
}

// Workflow state management
class WorkflowState {
  private completedSteps = new Set<string>();
  private queuedSteps = new Set<string>();
  private stepResults = new Map<string, StepResult>();
  private stepInputs = new Map<string, any>();

  constructor(
    private workflow: EnhancedWorkflowDefinition,
    private context: ExecutionContext
  ) {
    // Queue initial steps (steps with no dependencies)
    const initialSteps = workflow.steps.filter(step =>
      !workflow.steps.some(otherStep =>
        otherStep.conditional_next?.some(cond => cond.next_step_id === step.id)
      )
    );

    initialSteps.forEach(step => this.queuedSteps.add(step.id));
  }

  getNextSteps(): EnhancedWorkflowStep[] {
    return this.workflow.steps.filter(step =>
      this.queuedSteps.has(step.id) && !this.completedSteps.has(step.id)
    );
  }

  completeStep(stepId: string, result: StepResult): void {
    this.completedSteps.add(stepId);
    this.queuedSteps.delete(stepId);
    this.stepResults.set(stepId, result);
  }

  queueStep(stepId: string): void {
    if (!this.completedSteps.has(stepId)) {
      this.queuedSteps.add(stepId);
    }
  }

  isComplete(): boolean {
    return this.completedSteps.size === this.workflow.steps.length;
  }

  getAccumulatedResults(): StepResult[] {
    return Array.from(this.stepResults.values());
  }

  getErrorCount(): number {
    return Array.from(this.stepResults.values())
      .filter(result => result.status === 'Failed').length;
  }

  setStepInput(stepId: string, inputData: any): void {
    this.stepInputs.set(stepId, inputData);
  }

  getStepInput(stepId: string): any {
    return this.stepInputs.get(stepId);
  }
}
```

---

## PART 3: IMPLEMENTATION PLAN

### 3.1 Database Migrations

```sql
-- Enhanced workflow configuration support
ALTER TABLE jtbd_process_steps ADD COLUMN conditional_next JSONB;
ALTER TABLE jtbd_process_steps ADD COLUMN parallel_steps TEXT[];
ALTER TABLE jtbd_process_steps ADD COLUMN retry_config JSONB;
ALTER TABLE jtbd_process_steps ADD COLUMN timeout_config JSONB;
ALTER TABLE jtbd_process_steps ADD COLUMN agent_selection_strategy JSONB;
ALTER TABLE jtbd_process_steps ADD COLUMN validation_rules JSONB;
ALTER TABLE jtbd_process_steps ADD COLUMN monitoring_config JSONB;

-- Workflow templates
CREATE TABLE workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  industry_tags TEXT[],
  complexity_level TEXT CHECK (complexity_level IN ('Low', 'Medium', 'High')),
  estimated_duration INTEGER, -- minutes
  template_data JSONB NOT NULL,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflow versions
CREATE TABLE workflow_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id TEXT NOT NULL,
  version TEXT NOT NULL,
  workflow_definition JSONB NOT NULL,
  change_summary TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(workflow_id, version)
);

-- Agent performance metrics
CREATE TABLE agent_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  step_id TEXT,
  jtbd_id TEXT,
  execution_time INTEGER, -- seconds
  success_rate DECIMAL(3,2),
  quality_score DECIMAL(3,2),
  cost_per_token DECIMAL(10,6),
  user_satisfaction DECIMAL(3,2),
  error_count INTEGER DEFAULT 0,
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Workflow execution analytics
CREATE TABLE workflow_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id TEXT NOT NULL,
  execution_id INTEGER REFERENCES jtbd_executions(id),
  total_duration INTEGER,
  step_durations JSONB,
  agent_utilization JSONB,
  bottlenecks JSONB,
  cost_breakdown JSONB,
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Conditional workflow logic
CREATE TABLE workflow_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id TEXT NOT NULL,
  condition_name TEXT NOT NULL,
  condition_expression TEXT NOT NULL,
  actions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX idx_workflow_templates_tags ON workflow_templates USING GIN(industry_tags);
CREATE INDEX idx_agent_performance_agent_id ON agent_performance_metrics(agent_id);
CREATE INDEX idx_agent_performance_recorded_at ON agent_performance_metrics(recorded_at);
CREATE INDEX idx_workflow_analytics_workflow_id ON workflow_analytics(workflow_id);
```

### 3.2 Backend Services Implementation

#### **Enhanced JTBD Service**

```typescript
// enhanced-jtbd-service.ts
export class EnhancedJTBDService extends JTBDService {
  async createWorkflow(
    definition: EnhancedWorkflowDefinition,
    createdBy: string
  ): Promise<string> {
    // Create workflow record
    const workflowId = generateId();

    // Insert workflow steps with enhanced features
    const stepsWithEnhancements = definition.steps.map(step => ({
      ...step,
      conditional_next: step.conditional_next || null,
      parallel_steps: step.parallel_steps || [],
      retry_config: step.retry_config || null,
      timeout_config: step.timeout_config || null,
      agent_selection_strategy: step.agent_selection || null,
      validation_rules: step.validation_rules || [],
      monitoring_config: step.monitoring_config || null
    }));

    const { error } = await this.supabase
      .from('jtbd_process_steps')
      .insert(stepsWithEnhancements);

    if (error) throw error;

    // Save workflow version
    await this.saveWorkflowVersion(workflowId, '1.0', definition, createdBy);

    return workflowId;
  }

  async updateWorkflow(
    workflowId: string,
    updates: Partial<EnhancedWorkflowDefinition>,
    updatedBy: string
  ): Promise<void> {
    // Get current version
    const currentWorkflow = await this.getEnhancedWorkflow(workflowId);
    if (!currentWorkflow) throw new Error('Workflow not found');

    // Create new version
    const newVersion = this.incrementVersion(currentWorkflow.version);
    const updatedWorkflow = { ...currentWorkflow, ...updates, version: newVersion };

    // Update steps
    if (updates.steps) {
      await this.supabase
        .from('jtbd_process_steps')
        .delete()
        .eq('jtbd_id', workflowId);

      await this.supabase
        .from('jtbd_process_steps')
        .insert(updates.steps);
    }

    // Save new version
    await this.saveWorkflowVersion(workflowId, newVersion, updatedWorkflow, updatedBy);
  }

  async validateWorkflow(
    workflow: EnhancedWorkflowDefinition
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate step dependencies
    const stepIds = new Set(workflow.steps.map(s => s.id));
    workflow.steps.forEach(step => {
      step.conditional_next?.forEach(cond => {
        if (!stepIds.has(cond.next_step_id)) {
          errors.push({
            type: 'invalid_dependency',
            stepId: step.id,
            message: `Step references non-existent step: ${cond.next_step_id}`
          });
        }
      });
    });

    // Validate agent assignments
    const availableAgents = await this.agentService.getActiveAgents();
    const agentIds = new Set(availableAgents.map(a => a.id));

    workflow.steps.forEach(step => {
      if (step.agent_id && !agentIds.has(step.agent_id)) {
        warnings.push({
          type: 'agent_not_found',
          stepId: step.id,
          message: `Assigned agent not found: ${step.agent_id}`
        });
      }
    });

    // Check for circular dependencies
    if (this.hasCircularDependencies(workflow)) {
      errors.push({
        type: 'circular_dependency',
        message: 'Workflow contains circular dependencies'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private async saveWorkflowVersion(
    workflowId: string,
    version: string,
    definition: EnhancedWorkflowDefinition,
    createdBy: string
  ): Promise<void> {
    await this.supabase
      .from('workflow_versions')
      .insert({
        workflow_id: workflowId,
        version,
        workflow_definition: definition,
        created_by: createdBy
      });
  }

  private hasCircularDependencies(workflow: EnhancedWorkflowDefinition): boolean {
    // Implement cycle detection algorithm
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (stepId: string): boolean => {
      if (recursionStack.has(stepId)) return true;
      if (visited.has(stepId)) return false;

      visited.add(stepId);
      recursionStack.add(stepId);

      const step = workflow.steps.find(s => s.id === stepId);
      if (step?.conditional_next) {
        for (const cond of step.conditional_next) {
          if (hasCycle(cond.next_step_id)) return true;
        }
      }

      recursionStack.delete(stepId);
      return false;
    };

    return workflow.steps.some(step => hasCycle(step.id));
  }
}
```

### 3.3 Frontend Components

#### **Main Workflow Designer Component**

```typescript
// components/workflow/WorkflowDesigner.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WorkflowDesignerProps {
  workflowId?: string;
  onSave: (workflow: EnhancedWorkflowDefinition) => Promise<void>;
  onTest: (workflow: EnhancedWorkflowDefinition) => Promise<void>;
}

export const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({
  workflowId,
  onSave,
  onTest
}) => {
  const [workflow, setWorkflow] = useState<EnhancedWorkflowDefinition | null>(null);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load workflow if editing existing
  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId);
    } else {
      setWorkflow(createEmptyWorkflow());
    }
  }, [workflowId]);

  // Load available agents
  useEffect(() => {
    loadAvailableAgents();
  }, []);

  const loadWorkflow = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/workflows/${id}`);
      const data = await response.json();
      setWorkflow(data);
    } catch (error) {
      console.error('Failed to load workflow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      const agents = await response.json();
      setAvailableAgents(agents);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  const handleValidate = useCallback(async () => {
    if (!workflow) return;

    try {
      const response = await fetch('/api/workflows/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow)
      });
      const result = await response.json();
      setValidationResult(result);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  }, [workflow]);

  const handleSave = useCallback(async () => {
    if (!workflow) return;

    setIsLoading(true);
    try {
      await onSave(workflow);
      // Show success message
    } catch (error) {
      console.error('Save failed:', error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  }, [workflow, onSave]);

  const handleTest = useCallback(async () => {
    if (!workflow) return;

    // Validate before testing
    await handleValidate();
    if (validationResult && !validationResult.isValid) {
      // Show validation errors
      return;
    }

    setIsLoading(true);
    try {
      await onTest(workflow);
      // Show test results
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [workflow, onTest, validationResult, handleValidate]);

  const handleStepAdd = useCallback((stepType: string, position: Position) => {
    if (!workflow) return;

    const newStep = createStepFromTemplate(stepType, {
      ...position,
      stepNumber: workflow.steps.length + 1
    });

    setWorkflow(prev => prev ? {
      ...prev,
      steps: [...prev.steps, newStep]
    } : null);
  }, [workflow]);

  const handleStepUpdate = useCallback((stepId: string, updates: Partial<EnhancedWorkflowStep>) => {
    if (!workflow) return;

    setWorkflow(prev => prev ? {
      ...prev,
      steps: prev.steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      )
    } : null);
  }, [workflow]);

  const handleStepConnect = useCallback((sourceId: string, targetId: string, condition?: string) => {
    if (!workflow) return;

    setWorkflow(prev => prev ? {
      ...prev,
      steps: prev.steps.map(step =>
        step.id === sourceId
          ? {
              ...step,
              conditional_next: [
                ...(step.conditional_next || []),
                {
                  condition: condition || 'true',
                  next_step_id: targetId
                }
              ]
            }
          : step
      )
    } : null);
  }, [workflow]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!workflow) {
    return <div>Failed to load workflow</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="workflow-designer h-screen flex flex-col">
        {/* Toolbar */}
        <div className="border-b p-4 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">{workflow.name || 'New Workflow'}</h1>
            <Button variant="outline" onClick={handleValidate}>
              Validate
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleTest}>
              Test Workflow
            </Button>
            <Button onClick={handleSave}>
              Save Workflow
            </Button>
          </div>
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="p-4 border-b">
            {validationResult.errors.length > 0 && (
              <Alert variant="destructive" className="mb-2">
                <AlertDescription>
                  {validationResult.errors.length} validation error(s) found
                </AlertDescription>
              </Alert>
            )}
            {validationResult.warnings.length > 0 && (
              <Alert className="mb-2">
                <AlertDescription>
                  {validationResult.warnings.length} warning(s) found
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Step Library Panel */}
          <div className="w-64 border-r bg-gray-50 p-4">
            <StepLibraryPanel onStepSelect={handleStepAdd} />
          </div>

          {/* Canvas */}
          <div className="flex-1 relative">
            <WorkflowCanvas
              workflow={workflow}
              selectedStep={selectedStep}
              onStepSelect={setSelectedStep}
              onStepUpdate={handleStepUpdate}
              onStepConnect={handleStepConnect}
              validationResult={validationResult}
            />
          </div>

          {/* Properties Panel */}
          <div className="w-80 border-l bg-gray-50 p-4">
            <StepPropertiesPanel
              step={selectedStep ? workflow.steps.find(s => s.id === selectedStep) : null}
              availableAgents={availableAgents}
              onStepUpdate={(updates) => {
                if (selectedStep) {
                  handleStepUpdate(selectedStep, updates);
                }
              }}
            />
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

function createEmptyWorkflow(): EnhancedWorkflowDefinition {
  return {
    id: generateId(),
    name: 'New Workflow',
    description: '',
    version: '1.0',
    category: 'Custom',
    steps: [],
    conditional_logic: [],
    parallel_branches: [],
    error_strategies: [],
    success_criteria: {
      required_outputs: [],
      quality_thresholds: {}
    },
    metadata: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };
}

function createStepFromTemplate(stepType: string, position: Position & { stepNumber: number }): EnhancedWorkflowStep {
  const templates = {
    'analysis': {
      step_name: 'Data Analysis',
      step_description: 'Analyze data and generate insights',
      required_capabilities: ['data_analysis'],
      estimated_duration: 30
    },
    'research': {
      step_name: 'Literature Research',
      step_description: 'Conduct comprehensive literature review',
      required_capabilities: ['literature_search', 'research'],
      estimated_duration: 45
    },
    'report': {
      step_name: 'Generate Report',
      step_description: 'Compile findings into comprehensive report',
      required_capabilities: ['report_generation', 'writing'],
      estimated_duration: 20
    }
  };

  const template = templates[stepType as keyof typeof templates] || templates.analysis;

  return {
    id: generateId(),
    jtbd_id: '',
    step_number: position.stepNumber,
    ...template,
    agent_id: null,
    is_parallel: false,
    input_schema: {},
    output_schema: {},
    error_handling: {},
    agent_selection: {
      strategy: 'automatic',
      criteria: {}
    },
    validation_rules: [],
    position: { x: position.x, y: position.y }
  };
}
```

#### **Step Library Panel Component**

```typescript
// components/workflow/StepLibraryPanel.tsx
import React from 'react';
import { useDrag } from 'react-dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StepLibraryPanelProps {
  onStepSelect: (stepType: string, position: Position) => void;
}

interface StepTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  capabilities: string[];
  estimatedDuration: number;
}

const stepTemplates: StepTemplate[] = [
  {
    id: 'literature-review',
    name: 'Literature Review',
    description: 'Comprehensive literature search and analysis',
    icon: '📚',
    category: 'Research',
    capabilities: ['literature_search', 'evidence_review'],
    estimatedDuration: 45
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    description: 'Statistical analysis and data processing',
    icon: '📊',
    category: 'Analysis',
    capabilities: ['data_analysis', 'statistics'],
    estimatedDuration: 30
  },
  {
    id: 'regulatory-review',
    name: 'Regulatory Review',
    description: 'Review regulatory requirements and compliance',
    icon: '⚖️',
    category: 'Regulatory',
    capabilities: ['regulatory_analysis', 'compliance_review'],
    estimatedDuration: 60
  },
  {
    id: 'clinical-design',
    name: 'Clinical Study Design',
    description: 'Design clinical trial protocols and procedures',
    icon: '🧪',
    category: 'Clinical',
    capabilities: ['study_design', 'protocol_development'],
    estimatedDuration: 90
  },
  {
    id: 'market-analysis',
    name: 'Market Analysis',
    description: 'Analyze market conditions and competitive landscape',
    icon: '📈',
    category: 'Market',
    capabilities: ['market_research', 'competitive_analysis'],
    estimatedDuration: 40
  },
  {
    id: 'report-generation',
    name: 'Report Generation',
    description: 'Compile findings into comprehensive report',
    icon: '📄',
    category: 'Documentation',
    capabilities: ['report_writing', 'document_generation'],
    estimatedDuration: 25
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment',
    description: 'Identify and evaluate potential risks',
    icon: '⚠️',
    category: 'Analysis',
    capabilities: ['risk_analysis', 'assessment'],
    estimatedDuration: 35
  },
  {
    id: 'stakeholder-review',
    name: 'Stakeholder Review',
    description: 'Gather feedback from key stakeholders',
    icon: '👥',
    category: 'Collaboration',
    capabilities: ['stakeholder_management', 'feedback_collection'],
    estimatedDuration: 20
  }
];

interface DraggableStepProps {
  template: StepTemplate;
  onSelect: (stepType: string) => void;
}

const DraggableStep: React.FC<DraggableStepProps> = ({ template, onSelect }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'workflow-step',
    item: { stepType: template.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <Card
      ref={drag}
      className={`cursor-move mb-3 hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
      onClick={() => onSelect(template.id)}
    >
      <CardContent className="p-3">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xl">{template.icon}</span>
          <div className="flex-1">
            <h3 className="font-medium text-sm">{template.name}</h3>
            <p className="text-xs text-gray-600 line-clamp-2">{template.description}</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <Badge variant="secondary">{template.category}</Badge>
          <span className="text-gray-500">{template.estimatedDuration}min</span>
        </div>
        <div className="mt-2">
          <div className="flex flex-wrap gap-1">
            {template.capabilities.slice(0, 2).map(cap => (
              <Badge key={cap} variant="outline" className="text-xs">
                {cap.replace('_', ' ')}
              </Badge>
            ))}
            {template.capabilities.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{template.capabilities.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const StepLibraryPanel: React.FC<StepLibraryPanelProps> = ({ onStepSelect }) => {
  const categories = [...new Set(stepTemplates.map(t => t.category))];

  const handleStepSelect = (stepType: string) => {
    // For click-to-add, position at center of canvas
    onStepSelect(stepType, { x: 300, y: 200 });
  };

  return (
    <div className="step-library-panel">
      <h2 className="font-semibold text-lg mb-4">Step Library</h2>

      {categories.map(category => (
        <div key={category} className="mb-6">
          <h3 className="font-medium text-sm text-gray-700 mb-2 uppercase tracking-wide">
            {category}
          </h3>
          {stepTemplates
            .filter(template => template.category === category)
            .map(template => (
              <DraggableStep
                key={template.id}
                template={template}
                onSelect={handleStepSelect}
              />
            ))}
        </div>
      ))}

      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-sm text-blue-900 mb-2">💡 Pro Tip</h4>
        <p className="text-xs text-blue-700">
          Drag steps onto the canvas or click to add them. Connect steps by clicking and dragging between connection points.
        </p>
      </div>
    </div>
  );
};
```

### 3.4 API Routes

#### **Workflow Configuration API**

```typescript
// app/api/workflows/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EnhancedJTBDService } from '@/lib/jtbd/enhanced-jtbd-service';

const jtbdService = new EnhancedJTBDService();

export async function POST(request: NextRequest) {
  try {
    const workflow: EnhancedWorkflowDefinition = await request.json();
    const userId = request.headers.get('user-id'); // From auth middleware

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate workflow
    const validation = await jtbdService.validateWorkflow(workflow);
    if (!validation.isValid) {
      return NextResponse.json({
        error: 'Workflow validation failed',
        validation
      }, { status: 400 });
    }

    // Create workflow
    const workflowId = await jtbdService.createWorkflow(workflow, userId);

    return NextResponse.json({
      success: true,
      workflowId,
      message: 'Workflow created successfully'
    });

  } catch (error) {
    console.error('Workflow creation failed:', error);
    return NextResponse.json({
      error: 'Failed to create workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const userId = request.headers.get('user-id');

    const workflows = await jtbdService.getWorkflows({
      category: category || undefined,
      userId
    });

    return NextResponse.json(workflows);

  } catch (error) {
    console.error('Failed to fetch workflows:', error);
    return NextResponse.json({
      error: 'Failed to fetch workflows'
    }, { status: 500 });
  }
}

// app/api/workflows/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflow = await jtbdService.getEnhancedWorkflow(params.id);

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json(workflow);

  } catch (error) {
    console.error('Failed to fetch workflow:', error);
    return NextResponse.json({
      error: 'Failed to fetch workflow'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates: Partial<EnhancedWorkflowDefinition> = await request.json();
    const userId = request.headers.get('user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await jtbdService.updateWorkflow(params.id, updates, userId);

    return NextResponse.json({
      success: true,
      message: 'Workflow updated successfully'
    });

  } catch (error) {
    console.error('Workflow update failed:', error);
    return NextResponse.json({
      error: 'Failed to update workflow'
    }, { status: 500 });
  }
}

// app/api/workflows/validate/route.ts
export async function POST(request: NextRequest) {
  try {
    const workflow: EnhancedWorkflowDefinition = await request.json();

    const validation = await jtbdService.validateWorkflow(workflow);

    return NextResponse.json(validation);

  } catch (error) {
    console.error('Workflow validation failed:', error);
    return NextResponse.json({
      error: 'Validation failed',
      isValid: false,
      errors: [{ type: 'system_error', message: 'Validation system error' }],
      warnings: []
    }, { status: 500 });
  }
}

// app/api/workflows/[id]/test/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { testData } = await request.json();
    const userId = request.headers.get('user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Start test execution
    const testResult = await jtbdService.testWorkflow(params.id, testData, userId);

    return NextResponse.json({
      success: true,
      testExecutionId: testResult.executionId,
      message: 'Test execution started'
    });

  } catch (error) {
    console.error('Workflow test failed:', error);
    return NextResponse.json({
      error: 'Failed to start test execution'
    }, { status: 500 });
  }
}
```

#### **Template Management API**

```typescript
// app/api/templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { WorkflowTemplateService } from '@/lib/workflow/template-service';

const templateService = new WorkflowTemplateService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tags = searchParams.get('tags')?.split(',');
    const complexity = searchParams.get('complexity');

    const templates = await templateService.getTemplates({
      category: category || undefined,
      industryTags: tags,
      complexityLevel: complexity as 'Low' | 'Medium' | 'High' | undefined
    });

    return NextResponse.json(templates);

  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return NextResponse.json({
      error: 'Failed to fetch templates'
    }, { status: 500 });
  }
}

// app/api/templates/[id]/deploy/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customizations: TemplateCustomizations = await request.json();
    const userId = request.headers.get('user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workflow = await templateService.deployTemplate(params.id, customizations);

    // Create workflow from template
    const workflowId = await jtbdService.createWorkflow(workflow, userId);

    return NextResponse.json({
      success: true,
      workflowId,
      workflow,
      message: 'Template deployed successfully'
    });

  } catch (error) {
    console.error('Template deployment failed:', error);
    return NextResponse.json({
      error: 'Failed to deploy template'
    }, { status: 500 });
  }
}
```

---

## PART 4: SYSTEM ENHANCEMENTS SUMMARY

### 4.1 Priority 1: Critical Features (Immediate Implementation)

#### **✅ Visual Workflow Builder**
- **Impact**: Transform static workflow configuration into dynamic, user-friendly design
- **Components**: Drag-and-drop canvas, step library, properties panel
- **Implementation**: 2-3 weeks
- **Dependencies**: Enhanced database schema, React DnD integration

#### **✅ Dynamic Agent Selection**
- **Impact**: Intelligent agent matching based on capabilities and performance
- **Components**: Agent selector service, performance tracking, consensus mechanisms
- **Implementation**: 2 weeks
- **Dependencies**: Agent performance metrics table

#### **✅ Conditional Workflow Logic**
- **Impact**: Enable branching, loops, and complex workflow patterns
- **Components**: Condition evaluator, workflow state manager, enhanced execution engine
- **Implementation**: 3 weeks
- **Dependencies**: Enhanced process steps schema

### 4.2 Priority 2: Enhanced Features (Short-term)

#### **✅ Workflow Template Library**
- **Impact**: Rapid workflow deployment from proven templates
- **Components**: Template service, customization engine, pharmaceutical templates
- **Implementation**: 2 weeks
- **Dependencies**: Template database tables

#### **✅ Advanced Testing Framework**
- **Impact**: Comprehensive workflow validation and performance testing
- **Components**: Unit testing, integration testing, load testing, regression testing
- **Implementation**: 3 weeks
- **Dependencies**: Test execution infrastructure

#### **✅ Real-time Monitoring & Analytics**
- **Impact**: Live workflow performance insights and optimization recommendations
- **Components**: Performance dashboard, bottleneck detection, cost analysis
- **Implementation**: 2 weeks
- **Dependencies**: Analytics database tables

### 4.3 Priority 3: Future Enhancements (Long-term)

#### **🔮 AI-Powered Workflow Optimization**
- **Impact**: Machine learning-driven workflow improvements
- **Components**: ML recommendation engine, performance prediction, auto-optimization
- **Implementation**: 6-8 weeks
- **Dependencies**: Historical execution data, ML infrastructure

#### **🔮 Advanced Collaboration Features**
- **Impact**: Multi-user workflow design and approval workflows
- **Components**: Real-time collaboration, version control, approval chains
- **Implementation**: 4-6 weeks
- **Dependencies**: User management, notification system

#### **🔮 Enterprise Integration Hub**
- **Impact**: Connect workflows with external systems and APIs
- **Components**: API connectors, data transformation, event triggers
- **Implementation**: 8-10 weeks
- **Dependencies**: Integration infrastructure, security framework

---

## PART 5: TECHNICAL IMPLEMENTATION ROADMAP

### 5.1 Phase 1: Foundation (Weeks 1-2)
- Database schema migrations
- Enhanced JTBD service implementation
- Basic workflow validation system
- Agent performance tracking setup

### 5.2 Phase 2: Core Builder (Weeks 3-5)
- Visual workflow designer component
- Step library and properties panels
- Drag-and-drop functionality
- Basic conditional logic support

### 5.3 Phase 3: Advanced Features (Weeks 6-8)
- Dynamic agent selection system
- Workflow template library
- Advanced conditional logic engine
- Testing framework implementation

### 5.4 Phase 4: Optimization (Weeks 9-10)
- Performance monitoring dashboard
- Analytics and reporting
- User experience refinements
- Documentation and training materials

---

## PART 6: SUCCESS METRICS

### 6.1 Technical Metrics
- **Workflow Creation Time**: Reduce from 4+ hours to < 30 minutes
- **Agent Selection Accuracy**: > 90% optimal agent selection
- **Execution Success Rate**: > 95% successful workflow completion
- **Performance Improvement**: 40% faster execution through optimization

### 6.2 User Experience Metrics
- **User Adoption**: 80% of users create custom workflows within 30 days
- **Template Usage**: 60% of workflows deployed from templates
- **User Satisfaction**: > 4.5/5 rating for workflow builder
- **Training Time**: < 2 hours for new users to become proficient

### 6.3 Business Impact Metrics
- **Development Velocity**: 3x faster custom workflow deployment
- **Cost Efficiency**: 25% reduction in agent execution costs
- **Workflow Reusability**: 70% of workflows reused across projects
- **Error Reduction**: 50% fewer workflow execution errors

---

## CONCLUSION

The enhanced JTBD Workflow Configuration & Management System will transform the current static workflow system into a dynamic, intelligent, and user-friendly platform. By implementing visual workflow design, dynamic agent selection, conditional logic, and comprehensive template libraries, users will be able to create sophisticated pharmaceutical workflows with minimal technical expertise.

The phased implementation approach ensures rapid delivery of core functionality while building toward advanced features that will establish the platform as the industry standard for pharmaceutical workflow automation.

**Next Steps:**
1. **Review and approve** the technical architecture and implementation plan
2. **Begin Phase 1** database schema migrations and foundation services
3. **Start development** of the visual workflow builder components
4. **Establish** pharmaceutical template library with domain experts
5. **Plan user testing** and feedback collection for iterative improvement

This enhanced system will provide unprecedented flexibility and power for pharmaceutical digital health workflows while maintaining the sophisticated agent orchestration and domain expertise that sets the platform apart from generic automation tools.