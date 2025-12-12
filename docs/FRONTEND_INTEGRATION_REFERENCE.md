# Mission Runner Gallery - Frontend Integration Reference

> **For Frontend/UI Team** - Complete reference for building the Mission Runners Gallery

## Quick Overview

```
TASK = PERSONA + SKILL + KNOWLEDGE + CONTEXT
```

The Mission Runner Library provides **24 specialized runners** organized into:
- **12 Core Cognitive Runners** (6 categories × 2 variants)
- **12 Pharmaceutical Domain Runners** (6 families × 2 variants)
- **20+ Mission Templates** in the database

---

## 1. Runner Categories (22 Core Types)

```typescript
// src/types/runners.ts
export type RunnerCategory =
  | "understand"    // Comprehension, interpretation
  | "evaluate"      // Assessment, scoring, grading
  | "decide"        // Decision support, recommendations
  | "investigate"   // Research, evidence gathering
  | "watch"         // Monitoring, surveillance
  | "solve"         // Problem-solving
  | "prepare"       // Preparation, planning
  | "create"        // Content generation
  | "refine"        // Improvement, optimization
  | "validate"      // Verification, compliance
  | "synthesize"    // Integration, summarization
  | "plan"          // Strategic planning, decomposition
  | "predict"       // Forecasting, anticipation
  | "engage"        // Stakeholder engagement
  | "align"         // Alignment, coordination
  | "influence"     // Persuasion, advocacy
  | "adapt"         // Adaptation, flexibility
  | "discover"      // Discovery, exploration
  | "design"        // Design thinking, UX
  | "govern"        // Governance, policies
  | "secure"        // Security, compliance
  | "execute";      // Execution, implementation
```

---

## 2. Pharmaceutical Domains (6 Families)

```typescript
// src/types/runners.ts
export type PharmaDomain =
  | "foresight"        // Trend analysis, competitive intelligence
  | "brand_strategy"   // Commercial positioning, messaging
  | "digital_health"   // DTx, RWE, patient engagement
  | "medical_affairs"  // KOL engagement, MSL, scientific comms
  | "market_access"    // HEOR, pricing, reimbursement
  | "design_thinking"; // Human-centered design
```

---

## 3. All 24 Mission Runners

### 3.1 Core Cognitive Runners (12)

| Runner ID | Name | Category | Description | Icon Suggestion |
|-----------|------|----------|-------------|-----------------|
| `critique_basic` | Critique Runner | EVALUATE | Critical analysis, gap identification, quality assessment | 🔍 |
| `critique_advanced` | Advanced Critique Runner | EVALUATE | In-depth critique with bias analysis and quality scoring | 🔬 |
| `synthesize_basic` | Synthesize Runner | SYNTHESIZE | Information integration and summarization | 🔄 |
| `synthesize_advanced` | Advanced Synthesize Runner | SYNTHESIZE | Multi-source synthesis with conflict resolution | 📊 |
| `decompose_basic` | Decompose Runner | PLAN | Task breakdown into subtasks with dependencies | 📋 |
| `decompose_advanced` | Advanced Decompose Runner | PLAN | Complex decomposition with resource estimation | 🗂️ |
| `investigate_basic` | Investigate Runner | INVESTIGATE | Multi-source research with evidence validation | 🔎 |
| `investigate_advanced` | Advanced Investigate Runner | INVESTIGATE | Deep search with cross-referencing and trend analysis | 📚 |
| `validate_basic` | Validate Runner | VALIDATE | Verification and compliance checking | ✅ |
| `validate_advanced` | Advanced Validate Runner | VALIDATE | Multi-standard validation with detailed compliance | ✔️ |
| `recommend_basic` | Recommend Runner | DECIDE | Actionable recommendations with rationale | 💡 |
| `recommend_advanced` | Advanced Recommend Runner | DECIDE | Strategic recommendations with scenario analysis | 🎯 |

### 3.2 Pharmaceutical Domain Runners (12)

| Runner ID | Name | Domain | Description | Icon Suggestion |
|-----------|------|--------|-------------|-----------------|
| `foresight_basic` | Foresight Runner | FORESIGHT | Trend analysis and signal detection | 🔮 |
| `foresight_advanced` | Advanced Foresight Runner | FORESIGHT | Strategic forecasting with scenario planning | 🌐 |
| `brand_strategy_basic` | Brand Strategy Runner | BRAND_STRATEGY | Brand positioning and messaging | 🏷️ |
| `brand_strategy_advanced` | Advanced Brand Strategy Runner | BRAND_STRATEGY | Omnichannel planning and lifecycle management | 📈 |
| `digital_health_basic` | Digital Health Runner | DIGITAL_HEALTH | DTx strategy and RWE generation | 📱 |
| `digital_health_advanced` | Advanced Digital Health Runner | DIGITAL_HEALTH | AI/ML integration and ecosystem strategy | 🤖 |
| `medical_affairs_basic` | Medical Affairs Runner | MEDICAL_AFFAIRS | KOL engagement and MSL activities | 🏥 |
| `medical_affairs_advanced` | Advanced Medical Affairs Runner | MEDICAL_AFFAIRS | Strategic medical planning with lifecycle support | ⚕️ |
| `market_access_basic` | Market Access Runner | MARKET_ACCESS | HEOR strategy and reimbursement analysis | 💰 |
| `market_access_advanced` | Advanced Market Access Runner | MARKET_ACCESS | Multi-market access with value dossier creation | 🌍 |
| `design_thinking_basic` | Design Thinking Runner | DESIGN_THINKING | Human-centered design for healthcare | 🎨 |
| `design_thinking_advanced` | Advanced Design Thinking Runner | DESIGN_THINKING | Service design with innovation strategy | ✨ |

---

## 4. Mission Templates (Database)

### 4.1 Template Families

```typescript
export type MissionFamily =
  | "DEEP_RESEARCH"    // Comprehensive research missions
  | "EVALUATION"       // Assessment and benchmarking
  | "INVESTIGATION"    // Due diligence, forensics
  | "STRATEGY"         // Strategic planning and decisions
  | "PREPARATION"      // Case building, document prep
  | "MONITORING"       // Ongoing surveillance
  | "PROBLEM_SOLVING"  // Finding alternatives, solutions
  | "GENERIC";         // Fallback for unmatched queries
```

### 4.2 All Mission Templates

| Template ID | Name | Family | Category | Complexity | Duration (min) | Cost Range |
|-------------|------|--------|----------|------------|----------------|------------|
| `deep_dive` | Deep Dive Analysis | DEEP_RESEARCH | Research | high | 45-90 | $2.50-$8.00 |
| `comprehensive_analysis` | Comprehensive Analysis | DEEP_RESEARCH | Research | critical | 90-180 | $5.00-$15.00 |
| `benchmark` | Benchmark Analysis | EVALUATION | Analysis | medium | 30-60 | $2.00-$5.00 |
| `critique` | Critique & Review | EVALUATION | Quality | medium | 20-45 | $1.50-$4.00 |
| `feasibility_study` | Feasibility Study | EVALUATION | Analysis | high | 60-120 | $4.00-$12.00 |
| `due_diligence` | Due Diligence | INVESTIGATION | Analysis | critical | 120-240 | $8.00-$25.00 |
| `failure_forensics` | Failure Forensics | INVESTIGATION | Analysis | high | 45-90 | $3.00-$8.00 |
| `decision_framing` | Decision Framing | STRATEGY | Strategy | medium | 30-60 | $2.00-$5.00 |
| `scenario_planning` | Scenario Planning | STRATEGY | Strategy | high | 60-120 | $4.00-$10.00 |
| `risk_assessment` | Risk Assessment | STRATEGY | Analysis | high | 45-90 | $3.00-$8.00 |
| `case_building` | Case Building | PREPARATION | Preparation | high | 40-80 | $3.00-$7.00 |
| `document_drafting` | Document Drafting | PREPARATION | Content | medium | 30-60 | $2.00-$5.00 |
| `presentation_creation` | Presentation Creation | PREPARATION | Content | medium | 25-50 | $1.50-$4.00 |
| `competitive_watch` | Competitive Watch | MONITORING | Intelligence | medium | 20-45 | $1.00-$3.00 |
| `regulatory_watch` | Regulatory Watch | MONITORING | Intelligence | medium | 25-50 | $1.50-$4.00 |
| `alternative_finding` | Alternative Finding | PROBLEM_SOLVING | Problem Solving | medium | 25-50 | $1.50-$4.00 |
| `gap_analysis` | Gap Analysis | PROBLEM_SOLVING | Analysis | medium | 30-60 | $2.00-$5.00 |
| `quick_answer` | Quick Answer | GENERIC | General | low | 5-15 | $0.25-$1.00 |
| `generic_query` | Generic Query | GENERIC | General | low | 10-30 | $0.50-$2.00 |
| `stakeholder_analysis` | Stakeholder Analysis | STRATEGY | Analysis | medium | 30-60 | $2.00-$5.00 |

---

## 5. TypeScript Interfaces for Frontend

```typescript
// src/types/mission-runners.ts

// ============ ENUMS ============
export type RunnerCategory =
  | "understand" | "evaluate" | "decide" | "investigate" | "watch"
  | "solve" | "prepare" | "create" | "refine" | "validate"
  | "synthesize" | "plan" | "predict" | "engage" | "align"
  | "influence" | "adapt" | "discover" | "design" | "govern"
  | "secure" | "execute";

export type PharmaDomain =
  | "foresight" | "brand_strategy" | "digital_health"
  | "medical_affairs" | "market_access" | "design_thinking";

export type KnowledgeLayer =
  | "industry"    // L0: Cross-industry knowledge
  | "function"    // L1: Function-specific (Medical Affairs, Commercial)
  | "specialty";  // L2: Deep specialty (Oncology, Rare Disease)

export type QualityMetric =
  | "relevance" | "accuracy" | "comprehensiveness"
  | "expression" | "faithfulness" | "coverage"
  | "timeliness" | "confidence";

export type MissionFamily =
  | "DEEP_RESEARCH" | "EVALUATION" | "INVESTIGATION"
  | "STRATEGY" | "PREPARATION" | "MONITORING"
  | "PROBLEM_SOLVING" | "GENERIC";

export type MissionComplexity = "low" | "medium" | "high" | "critical";

// ============ RUNNER TYPES ============
export interface Runner {
  id: string;               // e.g., "investigate_basic"
  name: string;             // e.g., "Investigate Runner"
  category: RunnerCategory;
  domain?: PharmaDomain;    // Only for pharma runners
  description: string;
  requiredKnowledgeLayers: KnowledgeLayer[];
  qualityMetrics: QualityMetric[];
  version: string;
  isActive: boolean;
}

export interface RunnerInput {
  task: string;
  context: Record<string, any>;
  personaId?: string;
  knowledgeLayers: KnowledgeLayer[];
  constraints: Record<string, any>;
  previousResults: RunnerResult[];
  maxIterations: number;    // default: 3
  qualityThreshold: number; // default: 0.80
  streamTokens: boolean;
}

export interface RunnerOutput {
  result: any;
  confidence: number;
  qualityScores: Record<QualityMetric, number>;
  sources: Source[];
  artifacts: Artifact[];
  iterationsUsed: number;
  tokensUsed: number;
  costUsd: number;
  durationMs: number;
  metadata: Record<string, any>;
}

// ============ MISSION TYPES ============
export interface MissionTemplate {
  id: string;               // e.g., "deep_dive"
  name: string;             // e.g., "Deep Dive Analysis"
  family: MissionFamily;
  category: string;
  description: string;
  longDescription?: string;
  complexity: MissionComplexity;
  estimatedDurationMin: number;
  estimatedDurationMax: number;
  estimatedCostMin: number;
  estimatedCostMax: number;
  requiredAgentTiers: string[];
  recommendedAgents: string[];
  minAgents: number;
  maxAgents: number;
  tasks: MissionTask[];
  checkpoints: Checkpoint[];
  requiredInputs: InputField[];
  optionalInputs: InputField[];
  outputs: OutputField[];
  tags: string[];
  useCases: string[];
  exampleQueries: string[];
  workflowConfig: Record<string, any>;
  toolRequirements: ToolRequirement[];
  mode4Constraints: Mode4Constraints;
  isActive: boolean;
  version: string;
}

export interface MissionTask {
  id: string;
  name: string;
  description: string;
  assignedLevel: "L1" | "L2" | "L3" | "L4" | "L5";
  assignedArchetype?: string;
  estimatedMinutes: number;
  required: boolean;
  tools?: string[];
}

export interface Checkpoint {
  id: string;
  name: string;
  type: "approval" | "quality" | "budget" | "timeout";
  afterTask: string;
  description?: string;
  options?: string[];
  timeoutMinutes?: number;
}

export interface InputField {
  name: string;
  type: "string" | "array" | "number" | "boolean" | "file" | "object";
  description: string;
  required?: boolean;
}

export interface OutputField {
  name: string;
  type: "markdown" | "document" | "table" | "array" | "structured_data" | "file" | "number" | "object";
  description: string;
}

export interface Mode4Constraints {
  maxCost: number;
  maxApiCalls: number;
  maxIterations: number;
  allowAutoContinue: boolean;
  maxWallTimeMinutes: number;
  budgetWarningThreshold?: number;
  qualityCheckpointInterval?: number;
}

// ============ GALLERY DISPLAY TYPES ============
export interface RunnerCard {
  id: string;
  name: string;
  category: RunnerCategory;
  domain?: PharmaDomain;
  description: string;
  icon: string;             // Icon path or emoji
  color: string;            // Tailwind color class
  variant: "basic" | "advanced";
  tags: string[];
}

export interface MissionCard {
  id: string;
  name: string;
  family: MissionFamily;
  category: string;
  description: string;
  complexity: MissionComplexity;
  durationRange: string;    // "30-60 min"
  costRange: string;        // "$2-$5"
  tags: string[];
  popularityScore?: number;
}

// ============ FILTER TYPES ============
export interface RunnerFilters {
  categories?: RunnerCategory[];
  domains?: PharmaDomain[];
  variant?: "basic" | "advanced" | "all";
  searchQuery?: string;
}

export interface MissionFilters {
  families?: MissionFamily[];
  complexity?: MissionComplexity[];
  maxDuration?: number;
  maxCost?: number;
  searchQuery?: string;
  tags?: string[];
}
```

---

## 6. API Endpoints

### 6.1 Runner Endpoints

```typescript
// GET /api/runners
// List all available runners
// Response: Runner[]

// GET /api/runners/:id
// Get specific runner details
// Response: Runner

// GET /api/runners/category/:category
// Filter by category
// Response: Runner[]

// GET /api/runners/domain/:domain
// Filter by pharma domain
// Response: Runner[]

// POST /api/runners/:id/execute
// Execute a runner
// Request: RunnerInput
// Response: SSE stream of RunnerOutput
```

### 6.2 Mission Template Endpoints

```typescript
// GET /api/mission-templates
// List all templates
// Response: MissionTemplate[]

// GET /api/mission-templates/:id
// Get specific template
// Response: MissionTemplate

// GET /api/mission-templates/family/:family
// Filter by family
// Response: MissionTemplate[]

// POST /api/missions
// Create and start a mission
// Request: { templateId: string, inputs: Record<string, any>, agentId: string }
// Response: { missionId: string, status: "started" }

// GET /api/missions/:id/stream
// Stream mission progress
// Response: SSE stream of MissionEvent
```

---

## 7. Gallery UI Components

### 7.1 Recommended Component Structure

```
src/features/missions/
├── components/
│   ├── RunnerGallery.tsx           # Main runner gallery grid
│   ├── RunnerCard.tsx              # Individual runner card
│   ├── RunnerFilters.tsx           # Filter sidebar
│   ├── RunnerDetail.tsx            # Runner detail modal
│   ├── MissionGallery.tsx          # Mission template gallery
│   ├── MissionCard.tsx             # Mission template card
│   ├── MissionFilters.tsx          # Mission filters
│   ├── MissionDetail.tsx           # Mission template detail
│   ├── MissionLauncher.tsx         # Start mission form
│   └── MissionProgress.tsx         # Live mission progress
├── hooks/
│   ├── useRunners.ts               # Fetch runners
│   ├── useMissionTemplates.ts      # Fetch templates
│   ├── useMissionExecution.ts      # Execute missions
│   └── useRunnerExecution.ts       # Execute runners
├── types/
│   └── index.ts                    # Type definitions
└── utils/
    ├── categoryColors.ts           # Category color mapping
    └── complexityBadges.ts         # Complexity styling
```

### 7.2 Color Scheme by Category

```typescript
// src/utils/categoryColors.ts
export const CATEGORY_COLORS: Record<RunnerCategory, string> = {
  understand: "bg-blue-500",
  evaluate: "bg-purple-500",
  decide: "bg-amber-500",
  investigate: "bg-emerald-500",
  watch: "bg-cyan-500",
  solve: "bg-rose-500",
  prepare: "bg-indigo-500",
  create: "bg-pink-500",
  refine: "bg-lime-500",
  validate: "bg-green-500",
  synthesize: "bg-teal-500",
  plan: "bg-orange-500",
  predict: "bg-violet-500",
  engage: "bg-fuchsia-500",
  align: "bg-sky-500",
  influence: "bg-red-500",
  adapt: "bg-yellow-500",
  discover: "bg-blue-600",
  design: "bg-pink-600",
  govern: "bg-slate-500",
  secure: "bg-gray-600",
  execute: "bg-emerald-600",
};

export const DOMAIN_COLORS: Record<PharmaDomain, string> = {
  foresight: "bg-gradient-to-r from-purple-500 to-indigo-500",
  brand_strategy: "bg-gradient-to-r from-orange-500 to-red-500",
  digital_health: "bg-gradient-to-r from-cyan-500 to-blue-500",
  medical_affairs: "bg-gradient-to-r from-emerald-500 to-teal-500",
  market_access: "bg-gradient-to-r from-amber-500 to-yellow-500",
  design_thinking: "bg-gradient-to-r from-pink-500 to-rose-500",
};

export const FAMILY_COLORS: Record<MissionFamily, string> = {
  DEEP_RESEARCH: "bg-blue-600",
  EVALUATION: "bg-purple-600",
  INVESTIGATION: "bg-red-600",
  STRATEGY: "bg-amber-600",
  PREPARATION: "bg-indigo-600",
  MONITORING: "bg-cyan-600",
  PROBLEM_SOLVING: "bg-emerald-600",
  GENERIC: "bg-gray-500",
};

export const COMPLEXITY_BADGES: Record<MissionComplexity, { bg: string; text: string }> = {
  low: { bg: "bg-green-100", text: "text-green-800" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-800" },
  high: { bg: "bg-orange-100", text: "text-orange-800" },
  critical: { bg: "bg-red-100", text: "text-red-800" },
};
```

---

## 8. Sample Gallery Card Components

### 8.1 Runner Card

```tsx
// src/features/missions/components/RunnerCard.tsx
import { Runner, CATEGORY_COLORS, DOMAIN_COLORS } from "@/types";

interface RunnerCardProps {
  runner: Runner;
  onClick: (id: string) => void;
}

export function RunnerCard({ runner, onClick }: RunnerCardProps) {
  const colorClass = runner.domain
    ? DOMAIN_COLORS[runner.domain]
    : CATEGORY_COLORS[runner.category];

  return (
    <div
      className={`
        rounded-lg p-4 cursor-pointer transition-all
        hover:shadow-lg hover:scale-[1.02]
        border border-gray-200 dark:border-gray-700
      `}
      onClick={() => onClick(runner.id)}
    >
      {/* Color bar */}
      <div className={`h-2 -mx-4 -mt-4 mb-3 rounded-t-lg ${colorClass}`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg">{runner.name}</h3>
        {runner.domain && (
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
            {runner.domain.replace("_", " ")}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {runner.description}
      </p>

      {/* Category badge */}
      <div className="flex items-center gap-2">
        <span className={`
          text-xs px-2 py-1 rounded-full text-white
          ${CATEGORY_COLORS[runner.category]}
        `}>
          {runner.category}
        </span>
        <span className="text-xs text-gray-500">
          v{runner.version}
        </span>
      </div>
    </div>
  );
}
```

### 8.2 Mission Card

```tsx
// src/features/missions/components/MissionCard.tsx
import { MissionTemplate, FAMILY_COLORS, COMPLEXITY_BADGES } from "@/types";

interface MissionCardProps {
  mission: MissionTemplate;
  onClick: (id: string) => void;
}

export function MissionCard({ mission, onClick }: MissionCardProps) {
  const complexityStyle = COMPLEXITY_BADGES[mission.complexity];

  return (
    <div
      className="rounded-lg p-4 border border-gray-200 cursor-pointer
                 hover:shadow-lg transition-all"
      onClick={() => onClick(mission.id)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs px-2 py-1 rounded text-white ${FAMILY_COLORS[mission.family]}`}>
          {mission.family.replace("_", " ")}
        </span>
        <span className={`text-xs px-2 py-1 rounded ${complexityStyle.bg} ${complexityStyle.text}`}>
          {mission.complexity}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-lg mb-2">{mission.name}</h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {mission.description}
      </p>

      {/* Metrics */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>⏱️ {mission.estimatedDurationMin}-{mission.estimatedDurationMax} min</span>
        <span>💰 ${mission.estimatedCostMin}-${mission.estimatedCostMax}</span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-3">
        {mission.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 rounded">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
```

---

## 9. SSE Event Types for Streaming

```typescript
// Mission execution SSE events
export type MissionEvent =
  | { event: "mission_started"; missionId: string; templateId: string }
  | { event: "task_started"; taskId: string; taskName: string; level: string }
  | { event: "task_progress"; taskId: string; progress: number; message: string }
  | { event: "task_completed"; taskId: string; output: any; durationMs: number }
  | { event: "checkpoint_reached"; checkpointId: string; type: string; requiresApproval: boolean }
  | { event: "checkpoint_resolved"; checkpointId: string; decision: string }
  | { event: "delegation"; fromAgent: string; toAgent: string; reason: string }
  | { event: "thinking"; agentId: string; content: string }
  | { event: "reasoning"; step: number; content: string }
  | { event: "artifact_created"; artifactId: string; type: string; name: string }
  | { event: "source_found"; sourceId: string; title: string; url?: string }
  | { event: "quality_score"; metric: string; score: number }
  | { event: "mission_completed"; outputs: any; totalCost: number; totalDuration: number }
  | { event: "mission_failed"; error: string; failedTask?: string };

// Runner execution SSE events
export type RunnerEvent =
  | { event: "start"; runnerId: string; category: string }
  | { event: "iteration_start"; iteration: number }
  | { event: "token"; content: string }
  | { event: "iteration_complete"; iteration: number; quality: number }
  | { event: "complete"; result: any; confidence: number; qualityScores: Record<string, number> };
```

---

## 10. Database Schema Reference

### 10.1 Mission Templates Table

```sql
CREATE TABLE mission_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  family TEXT NOT NULL,          -- DEEP_RESEARCH, EVALUATION, etc.
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  complexity TEXT NOT NULL,      -- low, medium, high, critical
  estimated_duration_min INTEGER,
  estimated_duration_max INTEGER,
  estimated_cost_min NUMERIC(10,4),
  estimated_cost_max NUMERIC(10,4),
  required_agent_tiers TEXT[],   -- ['L1', 'L2', 'L3']
  recommended_agents TEXT[],
  min_agents INTEGER,
  max_agents INTEGER,
  tasks JSONB NOT NULL,          -- Array of MissionTask
  checkpoints JSONB,             -- Array of Checkpoint
  required_inputs JSONB,
  optional_inputs JSONB,
  outputs JSONB,
  tags TEXT[],
  use_cases TEXT[],
  example_queries TEXT[],
  workflow_config JSONB,
  tool_requirements JSONB,
  mode_4_constraints JSONB,
  is_active BOOLEAN DEFAULT true,
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 10.2 Missions Table (Active Missions)

```sql
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT REFERENCES mission_templates(id),
  agent_id UUID REFERENCES agents(id),
  tenant_id UUID REFERENCES tenants(id),
  goal TEXT NOT NULL,
  inputs JSONB,
  status TEXT DEFAULT 'pending',    -- pending, running, paused, completed, failed
  current_task_id TEXT,
  completed_tasks TEXT[],
  outputs JSONB,
  artifacts JSONB,
  sources JSONB,
  total_cost NUMERIC(10,4) DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 11. Quick Start Queries

### Fetch All Runners (Mock until API ready)

```typescript
export const RUNNERS: Runner[] = [
  // Core Cognitive
  { id: "critique_basic", name: "Critique Runner", category: "evaluate", description: "Critical analysis and gap identification", version: "1.0.0", isActive: true },
  { id: "critique_advanced", name: "Advanced Critique Runner", category: "evaluate", description: "In-depth critique with bias analysis", version: "1.0.0", isActive: true },
  { id: "synthesize_basic", name: "Synthesize Runner", category: "synthesize", description: "Information integration and summarization", version: "1.0.0", isActive: true },
  { id: "synthesize_advanced", name: "Advanced Synthesize Runner", category: "synthesize", description: "Multi-source synthesis with conflict resolution", version: "1.0.0", isActive: true },
  { id: "decompose_basic", name: "Decompose Runner", category: "plan", description: "Task breakdown into subtasks", version: "1.0.0", isActive: true },
  { id: "decompose_advanced", name: "Advanced Decompose Runner", category: "plan", description: "Complex decomposition with resource estimation", version: "1.0.0", isActive: true },
  { id: "investigate_basic", name: "Investigate Runner", category: "investigate", description: "Multi-source research with evidence validation", version: "1.0.0", isActive: true },
  { id: "investigate_advanced", name: "Advanced Investigate Runner", category: "investigate", description: "Deep search with cross-referencing", version: "1.0.0", isActive: true },
  { id: "validate_basic", name: "Validate Runner", category: "validate", description: "Verification and compliance checking", version: "1.0.0", isActive: true },
  { id: "validate_advanced", name: "Advanced Validate Runner", category: "validate", description: "Multi-standard validation", version: "1.0.0", isActive: true },
  { id: "recommend_basic", name: "Recommend Runner", category: "decide", description: "Actionable recommendations", version: "1.0.0", isActive: true },
  { id: "recommend_advanced", name: "Advanced Recommend Runner", category: "decide", description: "Strategic recommendations with scenario analysis", version: "1.0.0", isActive: true },

  // Pharma Domain
  { id: "foresight_basic", name: "Foresight Runner", category: "investigate", domain: "foresight", description: "Trend analysis and signal detection", version: "1.0.0", isActive: true },
  { id: "foresight_advanced", name: "Advanced Foresight Runner", category: "investigate", domain: "foresight", description: "Strategic forecasting with scenario planning", version: "1.0.0", isActive: true },
  { id: "brand_strategy_basic", name: "Brand Strategy Runner", category: "create", domain: "brand_strategy", description: "Brand positioning and messaging", version: "1.0.0", isActive: true },
  { id: "brand_strategy_advanced", name: "Advanced Brand Strategy Runner", category: "create", domain: "brand_strategy", description: "Omnichannel planning and lifecycle management", version: "1.0.0", isActive: true },
  { id: "digital_health_basic", name: "Digital Health Runner", category: "design", domain: "digital_health", description: "DTx strategy and RWE generation", version: "1.0.0", isActive: true },
  { id: "digital_health_advanced", name: "Advanced Digital Health Runner", category: "design", domain: "digital_health", description: "AI/ML integration and ecosystem strategy", version: "1.0.0", isActive: true },
  { id: "medical_affairs_basic", name: "Medical Affairs Runner", category: "engage", domain: "medical_affairs", description: "KOL engagement and MSL activities", version: "1.0.0", isActive: true },
  { id: "medical_affairs_advanced", name: "Advanced Medical Affairs Runner", category: "engage", domain: "medical_affairs", description: "Strategic medical planning", version: "1.0.0", isActive: true },
  { id: "market_access_basic", name: "Market Access Runner", category: "evaluate", domain: "market_access", description: "HEOR strategy and reimbursement analysis", version: "1.0.0", isActive: true },
  { id: "market_access_advanced", name: "Advanced Market Access Runner", category: "evaluate", domain: "market_access", description: "Multi-market access with value dossier", version: "1.0.0", isActive: true },
  { id: "design_thinking_basic", name: "Design Thinking Runner", category: "design", domain: "design_thinking", description: "Human-centered design for healthcare", version: "1.0.0", isActive: true },
  { id: "design_thinking_advanced", name: "Advanced Design Thinking Runner", category: "design", domain: "design_thinking", description: "Service design with innovation strategy", version: "1.0.0", isActive: true },
];
```

---

## 12. File Locations

| Component | Path |
|-----------|------|
| Base Runner | `services/ai-engine/src/runners/base.py` |
| Registry | `services/ai-engine/src/runners/registry.py` |
| Assembler | `services/ai-engine/src/runners/assembler.py` |
| Executor | `services/ai-engine/src/runners/executor.py` |
| Core Runners | `services/ai-engine/src/runners/core/` |
| Pharma Runners | `services/ai-engine/src/runners/pharma/` |
| API Routes | `services/ai-engine/src/api/routes/missions.py` |
| Mission Templates | Database: `mission_templates` table |

---

*Generated: December 11, 2025*
*Contact: AI Engine Team for questions*
