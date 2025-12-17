# VITAL Platform: Workflow Designer Runner Integration
## Runners as First-Class Workflow Nodes

**Version:** 1.0
**Date:** December 2025
**Status:** Architecture Design Document

---

# Executive Summary

This document defines how to integrate the **215 VITAL runners** into the ReactFlow workflow designer as first-class nodes. Instead of generic "expert" nodes, users will drag and drop specific runners like `critique_001`, `draft_001`, or `deep_research` directly onto the canvas.

**Key Decision:** Each runner becomes a node type. The workflow designer translates visual graphs into executable LangGraph code.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RUNNER-AS-NODE ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  BEFORE (Current)                    AFTER (Runner-as-Node)                  │
│  ═══════════════                     ════════════════════════                │
│                                                                              │
│  ┌────────────┐                     ┌─────────────────────────┐             │
│  │  expert    │                     │  critique_001 (EVALUATE) │             │
│  │ (generic)  │   ───────────►      │  ─────────────────────── │             │
│  │ agentId:?  │                     │  • MCDA evaluation       │             │
│  └────────────┘                     │  • Pre-configured prompt │             │
│                                     │  • Output: CritiqueOutput│             │
│                                     └─────────────────────────┘             │
│                                                                              │
│  User configures everything         User drags pre-built runner             │
│  manually                           with full configuration                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# Part 1: Node Type Design

## 1.1 Runner Node Categories (22 Cognitive + 8 Family)

The node palette will be organized by runner category:

```typescript
// packages/protocol/src/constants/runner-node-types.ts

export const RUNNER_CATEGORIES = {
  // ════════════════════════════════════════════════════════════════════════
  // FAMILY RUNNERS (8) - Complex Multi-Step Workflows
  // ════════════════════════════════════════════════════════════════════════
  FAMILY: {
    label: 'Family Runners',
    description: 'Complex multi-step workflows',
    color: '#8b5cf6',
    runners: [
      'deep_research',      // ToT → CoT → Reflection
      'strategy',           // SWOT, Scenarios, Roadmaps
      'evaluation',         // MCDA Decision Analysis
      'investigation',      // Bayesian Root Cause
      'problem_solving',    // Hypothesis → Test → Iterate
      'communication',      // Audience-led Messaging
      'monitoring',         // Signal Tracking
      'generic',            // Flexible Fallback
    ],
  },

  // ════════════════════════════════════════════════════════════════════════
  // COGNITIVE RUNNERS (88) - Atomic Operations
  // ════════════════════════════════════════════════════════════════════════

  UNDERSTAND: {
    label: 'Understand',
    description: 'Knowledge acquisition tasks',
    color: '#3b82f6',
    icon: 'search',
    runners: ['scan_001', 'explore_001', 'gap_detect_001', 'extract_001'],
  },

  EVALUATE: {
    label: 'Evaluate',
    description: 'Quality assessment tasks',
    color: '#ef4444',
    icon: 'check-square',
    runners: ['critique_001', 'compare_001', 'score_001', 'benchmark_001'],
  },

  DECIDE: {
    label: 'Decide',
    description: 'Strategic choice tasks',
    color: '#f59e0b',
    icon: 'git-branch',
    runners: ['frame_001', 'option_gen_001', 'tradeoff_001', 'recommend_001'],
  },

  INVESTIGATE: {
    label: 'Investigate',
    description: 'Causal analysis tasks',
    color: '#ec4899',
    icon: 'search',
    runners: ['detect_001', 'hypothesize_001', 'evidence_001', 'conclude_001'],
  },

  WATCH: {
    label: 'Watch',
    description: 'Monitoring tasks',
    color: '#06b6d4',
    icon: 'activity',
    runners: ['baseline_001', 'delta_001', 'alert_001', 'trend_001'],
  },

  SOLVE: {
    label: 'Solve',
    description: 'Problem resolution tasks',
    color: '#10b981',
    icon: 'zap',
    runners: ['diagnose_001', 'pathfind_001', 'alternative_001', 'unblock_001'],
  },

  PREPARE: {
    label: 'Prepare',
    description: 'Readiness tasks',
    color: '#6366f1',
    icon: 'clipboard',
    runners: ['context_001', 'anticipate_001', 'brief_001', 'talking_point_001'],
  },

  CREATE: {
    label: 'Create',
    description: 'Content generation tasks',
    color: '#a855f7',
    icon: 'edit',
    runners: ['draft_001', 'expand_001', 'format_001', 'citation_001'],
  },

  REFINE: {
    label: 'Refine',
    description: 'Optimization tasks',
    color: '#14b8a6',
    icon: 'refresh-cw',
    runners: ['critic_001', 'mutate_001', 'verify_001', 'select_001'],
  },

  VALIDATE: {
    label: 'Validate',
    description: 'Verification tasks',
    color: '#f97316',
    icon: 'shield',
    runners: ['compliance_check_001', 'fact_check_001', 'citation_check_001', 'consistency_check_001'],
  },

  SYNTHESIZE: {
    label: 'Synthesize',
    description: 'Integration tasks',
    color: '#84cc16',
    icon: 'layers',
    runners: ['collect_001', 'theme_001', 'resolve_001', 'narrate_001'],
  },

  PLAN: {
    label: 'Plan',
    description: 'Scheduling tasks',
    color: '#0ea5e9',
    icon: 'calendar',
    runners: ['decompose_001', 'dependency_001', 'schedule_001', 'resource_001'],
  },

  PREDICT: {
    label: 'Predict',
    description: 'Forecasting tasks',
    color: '#8b5cf6',
    icon: 'trending-up',
    runners: ['trend_analyze_001', 'scenario_001', 'project_001', 'uncertainty_001'],
  },

  ENGAGE: {
    label: 'Engage',
    description: 'Stakeholder tasks',
    color: '#ec4899',
    icon: 'users',
    runners: ['profile_001', 'interest_001', 'touchpoint_001', 'message_001'],
  },

  ALIGN: {
    label: 'Align',
    description: 'Consensus tasks',
    color: '#22c55e',
    icon: 'target',
    runners: ['position_001', 'common_ground_001', 'objection_001', 'consensus_001'],
  },

  INFLUENCE: {
    label: 'Influence',
    description: 'Persuasion tasks',
    color: '#f43f5e',
    icon: 'megaphone',
    runners: ['audience_analyze_001', 'position_calc_001', 'argument_001', 'counter_001'],
  },

  ADAPT: {
    label: 'Adapt',
    description: 'Transformation tasks',
    color: '#64748b',
    icon: 'shuffle',
    runners: ['localize_001', 'audience_adapt_001', 'format_convert_001', 'reg_adapt_001'],
  },

  DISCOVER: {
    label: 'Discover',
    description: 'Opportunity tasks',
    color: '#eab308',
    icon: 'compass',
    runners: ['white_space_001', 'differentiate_001', 'repurpose_001', 'opportunity_score_001'],
  },

  DESIGN: {
    label: 'Design',
    description: 'Structure work tasks',
    color: '#6d28d9',
    icon: 'layout',
    runners: ['panel_design_001', 'workflow_design_001', 'eval_design_001', 'research_design_001'],
  },

  GOVERN: {
    label: 'Govern',
    description: 'Compliance tasks',
    color: '#dc2626',
    icon: 'lock',
    runners: ['policy_check_001', 'sanitize_001', 'audit_log_001', 'permission_check_001'],
  },

  EXECUTE: {
    label: 'Execute',
    description: 'Operations tasks',
    color: '#059669',
    icon: 'play',
    runners: ['state_read_001', 'transition_001', 'action_001', 'escalate_001'],
  },
} as const;
```

## 1.2 Runner Node Schema

```typescript
// packages/protocol/src/schemas/runner-node.schema.ts

import { z } from 'zod';

/**
 * Runner Node - Executes a specific runner from the VITAL registry
 */
export const RunnerNodeDataSchema = z.object({
  // ════════════════════════════════════════════════════════════════════════
  // RUNNER IDENTIFICATION
  // ════════════════════════════════════════════════════════════════════════
  runCode: z.string()
    .describe('Runner code from vital_runners registry (e.g., "critique_001")'),

  runName: z.string().optional()
    .describe('Human-readable runner name (auto-populated from registry)'),

  category: z.string().optional()
    .describe('Runner category (e.g., "EVALUATE", "CREATE")'),

  algorithmicCore: z.string().optional()
    .describe('Core algorithm (e.g., "MCDA", "CoT", "ToT")'),

  // ════════════════════════════════════════════════════════════════════════
  // TEMPLATE CONFIGURATION
  // ════════════════════════════════════════════════════════════════════════
  templateId: z.string().uuid().optional()
    .describe('Custom user template ID (overrides system default)'),

  promptOverrides: z.object({
    systemPrompt: z.string().optional(),
    userPromptTemplate: z.string().optional(),
  }).optional()
    .describe('Optional prompt overrides for this execution'),

  // ════════════════════════════════════════════════════════════════════════
  // MODEL CONFIGURATION
  // ════════════════════════════════════════════════════════════════════════
  modelOverrides: z.object({
    provider: z.enum(['openai', 'anthropic', 'azure', 'custom']).optional(),
    modelName: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().min(1).max(128000).optional(),
  }).optional()
    .describe('Optional model overrides'),

  // ════════════════════════════════════════════════════════════════════════
  // INPUT/OUTPUT MAPPING
  // ════════════════════════════════════════════════════════════════════════
  inputMapping: z.record(z.string(), z.any()).default({})
    .describe('Maps workflow state keys to runner input parameters'),

  outputKey: z.string().default('runner_output')
    .describe('Key in workflow state where output is stored'),

  // ════════════════════════════════════════════════════════════════════════
  // EXECUTION SETTINGS
  // ════════════════════════════════════════════════════════════════════════
  streaming: z.boolean().default(true)
    .describe('Enable streaming output'),

  timeoutSeconds: z.number().min(1).max(600).default(300)
    .describe('Maximum execution time'),

  retryCount: z.number().min(0).max(5).default(2)
    .describe('Number of retries on failure'),

  // ════════════════════════════════════════════════════════════════════════
  // HITL CONFIGURATION
  // ════════════════════════════════════════════════════════════════════════
  hitl: z.object({
    enabled: z.boolean().default(false),
    requireApproval: z.boolean().default(false),
    approvalPrompt: z.string().optional(),
    confidenceThreshold: z.number().min(0).max(1).default(0.7)
      .describe('Auto-approve if confidence > threshold'),
  }).optional(),

  // ════════════════════════════════════════════════════════════════════════
  // METADATA
  // ════════════════════════════════════════════════════════════════════════
  label: z.string().optional()
    .describe('Custom label for this node instance'),

  description: z.string().optional()
    .describe('Custom description'),
});

export type RunnerNodeData = z.infer<typeof RunnerNodeDataSchema>;

/**
 * Full Runner Node (includes position)
 */
export const RunnerNodeSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('runner'),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: RunnerNodeDataSchema,
});

export type RunnerNode = z.infer<typeof RunnerNodeSchema>;
```

---

# Part 2: Node Palette UI Design

## 2.1 Hierarchical Palette Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  NODE PALETTE                                                        [🔍]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ▼ Family Runners (8)                                              ★ Complex│
│  ├─ 🧠 Deep Research      ToT → CoT → Reflection                            │
│  ├─ 📊 Strategy           SWOT, Scenarios, Roadmaps                         │
│  ├─ ⚖️  Evaluation         MCDA Decision Analysis                            │
│  ├─ 🔍 Investigation      Bayesian Root Cause                               │
│  ├─ 💡 Problem Solving    Hypothesis → Test                                 │
│  ├─ 📝 Communication      Audience-led Messaging                            │
│  ├─ 👁️  Monitoring         Signal Tracking                                   │
│  └─ 🔧 Generic            Flexible Fallback                                 │
│                                                                              │
│  ▼ Understand (4)                                                           │
│  ├─ scan_001              Broad landscape scan                              │
│  ├─ explore_001           Deep dive analysis                                │
│  ├─ gap_detect_001        Find missing info                                 │
│  └─ extract_001           Extract specific info                             │
│                                                                              │
│  ▼ Evaluate (4)                                                             │
│  ├─ critique_001          Apply rubric (MCDA)                               │
│  ├─ compare_001           Side-by-side comparison                           │
│  ├─ score_001             Calculate weighted score                          │
│  └─ benchmark_001         Compare to reference                              │
│                                                                              │
│  ▶ Decide (4)                                                               │
│  ▶ Create (4)                                                               │
│  ▶ Synthesize (4)                                                           │
│  ▶ Validate (4)                                                             │
│  ... (22 categories total)                                                  │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  ▶ Control Flow                                                             │
│  ├─ start, end, router, condition, parallel, merge                          │
│                                                                              │
│  ▶ Human-in-the-Loop                                                        │
│  ├─ human_input, approval                                                   │
│                                                                              │
│  ▶ Data & Utility                                                           │
│  ├─ transform, aggregate, delay, log, webhook                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2.2 Palette Component

```typescript
// apps/vital-system/src/features/workflow-designer/components/palette/RunnerPalette.tsx

import React, { useState, useMemo } from 'react';
import { RUNNER_CATEGORIES } from '@vital/protocol';
import { useRunnerRegistry } from '../../hooks/useRunnerRegistry';

interface RunnerPaletteProps {
  onDragStart: (runnerCode: string, category: string) => void;
}

export const RunnerPalette: React.FC<RunnerPaletteProps> = ({ onDragStart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['FAMILY'])
  );

  // Load runner metadata from database
  const { runners, isLoading } = useRunnerRegistry();

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return RUNNER_CATEGORIES;

    const term = searchTerm.toLowerCase();
    return Object.entries(RUNNER_CATEGORIES).reduce((acc, [key, category]) => {
      const matchingRunners = category.runners.filter(
        code =>
          code.includes(term) ||
          runners[code]?.run_name?.toLowerCase().includes(term) ||
          runners[code]?.algo_core?.toLowerCase().includes(term)
      );

      if (matchingRunners.length > 0) {
        acc[key] = { ...category, runners: matchingRunners };
      }
      return acc;
    }, {} as typeof RUNNER_CATEGORIES);
  }, [searchTerm, runners]);

  const handleDragStart = (e: React.DragEvent, runnerCode: string, category: string) => {
    e.dataTransfer.setData('application/runner', JSON.stringify({
      runCode: runnerCode,
      category,
      ...runners[runnerCode],
    }));
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart(runnerCode, category);
  };

  return (
    <div className="runner-palette">
      {/* Search */}
      <div className="palette-search">
        <input
          type="text"
          placeholder="Search runners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className="palette-categories">
        {Object.entries(filteredCategories).map(([key, category]) => (
          <div key={key} className="category">
            <div
              className="category-header"
              onClick={() => {
                const newExpanded = new Set(expandedCategories);
                if (newExpanded.has(key)) {
                  newExpanded.delete(key);
                } else {
                  newExpanded.add(key);
                }
                setExpandedCategories(newExpanded);
              }}
            >
              <span className="category-icon" style={{ color: category.color }}>
                {category.icon}
              </span>
              <span className="category-label">{category.label}</span>
              <span className="runner-count">({category.runners.length})</span>
            </div>

            {expandedCategories.has(key) && (
              <div className="category-runners">
                {category.runners.map(runnerCode => {
                  const runner = runners[runnerCode];
                  return (
                    <div
                      key={runnerCode}
                      className="runner-item"
                      draggable
                      onDragStart={(e) => handleDragStart(e, runnerCode, key)}
                    >
                      <span className="runner-code">{runnerCode}</span>
                      <span className="runner-name">
                        {runner?.run_name || runnerCode}
                      </span>
                      <span className="runner-algo">{runner?.algo_core}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

# Part 3: LangGraph Translation

## 3.1 Runner Node Handler (Backend)

```python
# services/ai-engine/src/modules/translator/registry.py

@NodeRegistry.register("runner", description="Execute a VITAL runner", requires_llm=True)
async def runner_node(state: dict, config: dict) -> dict:
    """
    Runner node - Executes a runner from the VITAL registry.

    This is the core translation point: visual runner nodes become
    actual runner executions via the UnifiedRunnerRegistry.

    Config:
        - runCode: Runner code (e.g., "critique_001", "deep_research")
        - templateId: Optional custom template ID
        - inputMapping: Map workflow state to runner inputs
        - outputKey: Where to store runner output
        - modelOverrides: Optional model configuration overrides
        - hitl: Human-in-the-loop configuration
    """
    from runners.registry import UnifiedRunnerRegistry
    from runners.base.template_loader import TemplateLoader
    from core.context import get_organization_id, get_user_id

    run_code = config.get("runCode")
    template_id = config.get("templateId")
    input_mapping = config.get("inputMapping", {})
    output_key = config.get("outputKey", "runner_output")
    model_overrides = config.get("modelOverrides", {})
    hitl_config = config.get("hitl", {})

    if not run_code:
        return {
            **state,
            "error": "No runCode specified for runner node",
            "runner_executed": False,
        }

    try:
        # ════════════════════════════════════════════════════════════════════
        # 1. GET RUNNER FROM REGISTRY
        # ════════════════════════════════════════════════════════════════════
        runner_class = UnifiedRunnerRegistry.get_runner(run_code)

        if not runner_class:
            return {
                **state,
                "error": f"Runner not found: {run_code}",
                "runner_executed": False,
            }

        # ════════════════════════════════════════════════════════════════════
        # 2. LOAD TEMPLATE (System or User Custom)
        # ════════════════════════════════════════════════════════════════════
        template_loader = TemplateLoader()
        user_id = get_user_id()

        template = await template_loader.load_template(
            run_code=run_code,
            user_id=user_id,
            template_id=template_id,
        )

        # Apply model overrides
        if model_overrides:
            if model_overrides.get("temperature"):
                template.temperature = model_overrides["temperature"]
            if model_overrides.get("maxTokens"):
                template.max_tokens = model_overrides["maxTokens"]
            if model_overrides.get("modelName"):
                template.model_name = model_overrides["modelName"]

        # ════════════════════════════════════════════════════════════════════
        # 3. MAP INPUTS FROM WORKFLOW STATE
        # ════════════════════════════════════════════════════════════════════
        runner_input = {}

        for param_name, state_path in input_mapping.items():
            # Support JSONPath-like notation: $.context.document
            if isinstance(state_path, str) and state_path.startswith("$."):
                value = _resolve_json_path(state, state_path)
            else:
                value = state.get(state_path, state_path)
            runner_input[param_name] = value

        # Default inputs from state
        if not runner_input:
            runner_input = {
                "query": state.get("query", state.get("input", "")),
                "context": state.get("context", {}),
                "document": state.get("document"),
            }

        # ════════════════════════════════════════════════════════════════════
        # 4. INSTANTIATE AND EXECUTE RUNNER
        # ════════════════════════════════════════════════════════════════════
        runner = runner_class(template=template)

        # Check if this is a Family Runner or Task Runner
        if hasattr(runner, 'execute_stream'):
            # Family Runner - collect streaming results
            results = []
            async for event in runner.execute_stream(runner_input):
                results.append(event)

            # Extract final output from stream
            output = results[-1] if results else {}
        else:
            # Task Runner - direct execution
            output = await runner.execute(runner_input)

        # ════════════════════════════════════════════════════════════════════
        # 5. HITL CHECK
        # ════════════════════════════════════════════════════════════════════
        needs_approval = False

        if hitl_config.get("enabled"):
            confidence = output.get("confidence", 1.0)
            threshold = hitl_config.get("confidenceThreshold", 0.7)

            if confidence < threshold or hitl_config.get("requireApproval"):
                needs_approval = True

        # ════════════════════════════════════════════════════════════════════
        # 6. RETURN UPDATED STATE
        # ════════════════════════════════════════════════════════════════════
        return {
            **state,
            "runner_executed": True,
            "run_code": run_code,
            "runner_category": runner.category if hasattr(runner, 'category') else None,
            output_key: output,
            "_needs_approval": needs_approval,
            "_approval_prompt": hitl_config.get("approvalPrompt") if needs_approval else None,
        }

    except Exception as e:
        logger.exception(f"Runner node failed: {run_code} - {e}")
        return {
            **state,
            "error": str(e),
            "runner_executed": False,
            "run_code": run_code,
        }


def _resolve_json_path(state: dict, path: str) -> any:
    """
    Resolve a JSONPath-like expression.
    Example: $.context.document -> state["context"]["document"]
    """
    if not path.startswith("$."):
        return state.get(path)

    parts = path[2:].split(".")
    current = state

    for part in parts:
        if isinstance(current, dict):
            current = current.get(part)
        elif isinstance(current, list) and part.isdigit():
            current = current[int(part)]
        else:
            return None

    return current
```

## 3.2 Frontend Code Generator Update

```typescript
// apps/vital-system/src/features/workflow-designer/adapters/LangGraphAdapter.ts

/**
 * Generate LangGraph node code for a Runner node
 */
private generateRunnerNode(node: RunnerNode): string {
  const { runCode, inputMapping, outputKey, hitl, modelOverrides } = node.data;

  const configDict = {
    runCode,
    inputMapping: inputMapping || {},
    outputKey: outputKey || 'runner_output',
    hitl: hitl || { enabled: false },
    modelOverrides: modelOverrides || {},
  };

  return `
@NodeRegistry.register("${node.id}")
async def ${this.sanitizeNodeId(node.id)}_node(state: WorkflowState) -> WorkflowState:
    """
    Runner: ${runCode}
    ${node.data.label || ''}
    """
    from modules.translator.registry import runner_node

    config = ${JSON.stringify(configDict, null, 4)}

    return await runner_node(state, config)
`;
}

/**
 * Generate complete LangGraph workflow from visual graph
 */
public generate(workflow: Workflow): GeneratedCode {
  const imports = this.generateImports(workflow);
  const stateSchema = this.generateStateSchema(workflow);
  const nodeFunctions = workflow.nodes.map(node => {
    if (node.type === 'runner') {
      return this.generateRunnerNode(node as RunnerNode);
    }
    return this.generateGenericNode(node);
  });
  const graphBuilder = this.generateGraphBuilder(workflow);

  return {
    code: [imports, stateSchema, ...nodeFunctions, graphBuilder].join('\n\n'),
    language: 'python',
    framework: 'langgraph',
  };
}
```

---

# Part 4: Data Flow Architecture

## 4.1 Complete Translation Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW DESIGNER → LANGGRAPH PIPELINE                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. VISUAL DESIGN (ReactFlow)                                                │
│  ═══════════════════════════                                                 │
│                                                                              │
│  ┌─────────┐    ┌──────────────┐    ┌──────────────┐    ┌─────────┐        │
│  │  start  │───►│ critique_001 │───►│  draft_001   │───►│   end   │        │
│  └─────────┘    └──────────────┘    └──────────────┘    └─────────┘        │
│                                                                              │
│  2. JSON SERIALIZATION                                                       │
│  ═════════════════════                                                       │
│                                                                              │
│  {                                                                           │
│    "nodes": [                                                                │
│      { "id": "n1", "type": "start", "data": {...} },                        │
│      { "id": "n2", "type": "runner", "data": { "runCode": "critique_001" }},│
│      { "id": "n3", "type": "runner", "data": { "runCode": "draft_001" }},   │
│      { "id": "n4", "type": "end", "data": {...} }                           │
│    ],                                                                        │
│    "edges": [                                                                │
│      { "source": "n1", "target": "n2" },                                    │
│      { "source": "n2", "target": "n3" },                                    │
│      { "source": "n3", "target": "n4" }                                     │
│    ]                                                                         │
│  }                                                                           │
│                                                                              │
│  3. BACKEND COMPILATION (Python)                                             │
│  ════════════════════════════════                                            │
│                                                                              │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐          │
│  │  Parser   │───►│ Validator │───►│ Registry  │───►│ Compiler  │          │
│  │  (JSON→Py)│    │ (Check)   │    │ (Lookup)  │    │ (Build)   │          │
│  └───────────┘    └───────────┘    └───────────┘    └───────────┘          │
│                                                                              │
│  4. LANGGRAPH EXECUTION                                                      │
│  ═══════════════════════                                                     │
│                                                                              │
│  graph = StateGraph(WorkflowState)                                          │
│  graph.add_node("n2", runner_node)  # critique_001                          │
│  graph.add_node("n3", runner_node)  # draft_001                             │
│  graph.add_edge("n1", "n2")                                                 │
│  graph.add_edge("n2", "n3")                                                 │
│  graph.add_edge("n3", "n4")                                                 │
│  compiled = graph.compile()                                                  │
│  result = await compiled.ainvoke(initial_state)                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4.2 State Schema for Runner Workflows

```python
# services/ai-engine/src/langgraph_workflows/state_schemas.py

from typing import TypedDict, Annotated, Optional, Dict, Any, List
import operator

class RunnerWorkflowState(TypedDict):
    """
    State schema for workflows with runner nodes.

    Designed to carry data between runners and support
    the full Task Formula: AGENT + RUNNER + SKILL + KNOWLEDGE + PROMPT
    """

    # ════════════════════════════════════════════════════════════════════════
    # WORKFLOW IDENTITY
    # ════════════════════════════════════════════════════════════════════════
    workflow_id: str
    tenant_id: str
    user_id: str

    # ════════════════════════════════════════════════════════════════════════
    # EXECUTION TRACKING
    # ════════════════════════════════════════════════════════════════════════
    started_at: str
    current_node_id: str
    execution_path: Annotated[List[str], operator.add]  # Accumulates node IDs

    # ════════════════════════════════════════════════════════════════════════
    # INPUT/OUTPUT
    # ════════════════════════════════════════════════════════════════════════
    input: Dict[str, Any]                    # Initial workflow input
    query: str                               # Primary query/question
    output: Optional[Dict[str, Any]]         # Final workflow output

    # ════════════════════════════════════════════════════════════════════════
    # RUNNER DATA FLOW
    # ════════════════════════════════════════════════════════════════════════
    context: Dict[str, Any]                  # Shared context between runners
    documents: List[Dict[str, Any]]          # Documents being processed
    artifacts: Annotated[List[Dict], operator.add]  # Generated artifacts

    # ════════════════════════════════════════════════════════════════════════
    # RUNNER OUTPUTS (keyed by output_key from each runner)
    # ════════════════════════════════════════════════════════════════════════
    runner_outputs: Dict[str, Any]           # Map of output_key -> runner result

    # ════════════════════════════════════════════════════════════════════════
    # KNOWLEDGE & CITATIONS
    # ════════════════════════════════════════════════════════════════════════
    knowledge_context: str                   # RAG-retrieved knowledge
    citations: Annotated[List[Dict], operator.add]  # Accumulated citations

    # ════════════════════════════════════════════════════════════════════════
    # HITL TRACKING
    # ════════════════════════════════════════════════════════════════════════
    pending_approvals: List[str]             # Node IDs awaiting approval
    approval_decisions: Dict[str, bool]      # Map of node_id -> approved

    # ════════════════════════════════════════════════════════════════════════
    # ERROR HANDLING
    # ════════════════════════════════════════════════════════════════════════
    error: Optional[str]
    error_node_id: Optional[str]

    # ════════════════════════════════════════════════════════════════════════
    # METRICS
    # ════════════════════════════════════════════════════════════════════════
    total_tokens: int
    total_cost_usd: float
    execution_times: Dict[str, float]        # Map of node_id -> ms
```

---

# Part 5: Implementation Checklist

## Phase 1: Protocol Package Updates
- [ ] Add `RunnerNodeSchema` to `packages/protocol/src/schemas/`
- [ ] Add `RUNNER_CATEGORIES` to `packages/protocol/src/constants/`
- [ ] Update `NODE_TYPES` to include `runner`
- [ ] Regenerate JSON schemas
- [ ] Export new types in `packages/protocol/src/index.ts`

## Phase 2: Backend Registry Updates
- [ ] Add `runner_node` handler in `registry.py`
- [ ] Create `_resolve_json_path` utility
- [ ] Update `RunnerWorkflowState` schema
- [ ] Test runner node execution
- [ ] Add integration tests

## Phase 3: Frontend Palette Updates
- [ ] Create `RunnerPalette.tsx` component
- [ ] Create `useRunnerRegistry` hook (fetches from DB)
- [ ] Update `NodePalette.tsx` to include runners
- [ ] Add runner node metadata (icons, colors)
- [ ] Implement drag-and-drop for runner nodes

## Phase 4: Designer Integration
- [ ] Update `WorkflowNode.tsx` to render runner nodes
- [ ] Update `PropertyPanel.tsx` for runner configuration
- [ ] Add runner-specific validation in `validation.ts`
- [ ] Update `LangGraphAdapter.ts` for runner code generation

## Phase 5: Testing & Documentation
- [ ] Unit tests for runner node handler
- [ ] Integration tests for full workflow compilation
- [ ] E2E tests for visual designer → execution
- [ ] Update user documentation

---

# Part 6: Example Workflow

## 6.1 Competitive Analysis Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  COMPETITIVE ANALYSIS WORKFLOW (Visual Design)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐    ┌──────────────┐    ┌──────────────┐                        │
│  │  start  │───►│  scan_001    │───►│ critique_001 │                        │
│  └─────────┘    │ (UNDERSTAND) │    │  (EVALUATE)  │                        │
│                 │              │    │              │                        │
│                 │ Scan market  │    │ SWOT rubric  │                        │
│                 │ landscape    │    │ evaluation   │                        │
│                 └──────────────┘    └──────┬───────┘                        │
│                                            │                                 │
│                        ┌───────────────────┴───────────────────┐            │
│                        │                                       │            │
│                        ▼                                       ▼            │
│               ┌──────────────┐                        ┌──────────────┐      │
│               │ recommend_001│                        │  draft_001   │      │
│               │   (DECIDE)   │                        │   (CREATE)   │      │
│               │              │                        │              │      │
│               │ Strategic    │                        │ Executive    │      │
│               │ recommendation│                       │ summary      │      │
│               └──────┬───────┘                        └──────┬───────┘      │
│                      │                                       │              │
│                      └───────────────────┬───────────────────┘              │
│                                          │                                   │
│                                          ▼                                   │
│                                   ┌─────────────┐                           │
│                                   │  aggregate  │                           │
│                                   │  (MERGE)    │                           │
│                                   │             │                           │
│                                   │ Combine     │                           │
│                                   │ outputs     │                           │
│                                   └──────┬──────┘                           │
│                                          │                                   │
│                                          ▼                                   │
│                                   ┌─────────┐                               │
│                                   │   end   │                               │
│                                   └─────────┘                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 6.2 Generated LangGraph Code

```python
# Auto-generated from Visual Workflow Designer

from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

class CompetitiveAnalysisState(TypedDict):
    workflow_id: str
    query: str
    context: dict
    scan_result: dict
    critique_result: dict
    recommendation: dict
    executive_summary: str
    final_output: dict
    execution_path: Annotated[list, operator.add]

# Node functions
async def scan_node(state: CompetitiveAnalysisState) -> CompetitiveAnalysisState:
    from modules.translator.registry import runner_node
    config = {
        "runCode": "scan_001",
        "inputMapping": {"query": "$.query"},
        "outputKey": "scan_result",
    }
    return await runner_node(state, config)

async def critique_node(state: CompetitiveAnalysisState) -> CompetitiveAnalysisState:
    from modules.translator.registry import runner_node
    config = {
        "runCode": "critique_001",
        "inputMapping": {"document": "$.scan_result.landscape"},
        "outputKey": "critique_result",
    }
    return await runner_node(state, config)

async def recommend_node(state: CompetitiveAnalysisState) -> CompetitiveAnalysisState:
    from modules.translator.registry import runner_node
    config = {
        "runCode": "recommend_001",
        "inputMapping": {"evaluation": "$.critique_result"},
        "outputKey": "recommendation",
    }
    return await runner_node(state, config)

async def draft_node(state: CompetitiveAnalysisState) -> CompetitiveAnalysisState:
    from modules.translator.registry import runner_node
    config = {
        "runCode": "draft_001",
        "inputMapping": {
            "content": "$.critique_result",
            "format": "executive_summary",
        },
        "outputKey": "executive_summary",
    }
    return await runner_node(state, config)

# Build graph
graph = StateGraph(CompetitiveAnalysisState)

graph.add_node("scan", scan_node)
graph.add_node("critique", critique_node)
graph.add_node("recommend", recommend_node)
graph.add_node("draft", draft_node)

graph.set_entry_point("scan")
graph.add_edge("scan", "critique")
graph.add_edge("critique", "recommend")
graph.add_edge("critique", "draft")
graph.add_edge("recommend", END)
graph.add_edge("draft", END)

workflow = graph.compile()
```

---

# Related Documents

| Document | Path | Purpose |
|----------|------|---------|
| **Runner Package Architecture** | `docs/runners/RUNNER_PACKAGE_ARCHITECTURE.md` | 13-component package, prompt patterns |
| **Task Composition Architecture** | `docs/runners/TASK_COMPOSITION_ARCHITECTURE.md` | 8 orchestration patterns |
| **User Template Editor** | `docs/runners/USER_TEMPLATE_EDITOR_ARCHITECTURE.md` | Database-First templates |
| **Unified Runner Strategy** | `docs/runners/UNIFIED_RUNNER_STRATEGY.md` | Cross-service runner architecture |

---

**Version History:**
- v1.0 (December 2025): Initial runner-as-node architecture

---

*End of Document*
