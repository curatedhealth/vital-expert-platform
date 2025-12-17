# VITAL Platform: User Template Editor Architecture
## Seamless UI/UX for Runner Template Management

**Version:** 1.0
**Date:** December 2025
**Status:** Gold Standard Implementation Guide

---

# Executive Summary

This document defines the **Database-First architecture** for user-customizable runner templates. Users can create, edit, and share templates through a seamless frontend UI, with all data stored in the database for real-time collaboration.

**Key Decisions:**
- **Database-First**: All templates stored in PostgreSQL, not YAML files
- **Real-time Editing**: Supabase real-time subscriptions for live updates
- **Hybrid Inheritance**: System defaults seeded from YAML, user overrides in DB
- **YAML Export**: Optional export for backup/DevOps (not runtime)

---

# Part 1: Architecture Overview

## 1.1 System Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    USER TEMPLATE EDITOR ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         FRONTEND (React/Next.js)                        │ │
│  │                                                                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │ │
│  │  │  Template    │  │   Prompt     │  │    Model     │  │   HITL     │ │ │
│  │  │  Browser     │  │   Editor     │  │   Config     │  │   Config   │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │ │
│  │         │                 │                 │                │         │ │
│  │         └─────────────────┴─────────────────┴────────────────┘         │ │
│  │                                   │                                     │ │
│  │                                   ▼                                     │ │
│  │                    ┌──────────────────────────┐                        │ │
│  │                    │   Template State Manager  │                        │ │
│  │                    │   (React Context/Zustand) │                        │ │
│  │                    └──────────────────────────┘                        │ │
│  │                                   │                                     │ │
│  └───────────────────────────────────┼─────────────────────────────────────┘ │
│                                      │                                       │
│                                      ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         API LAYER (Next.js API / FastAPI)               │ │
│  │                                                                          │ │
│  │  POST /api/templates          - Create template                         │ │
│  │  GET  /api/templates          - List templates                          │ │
│  │  GET  /api/templates/:id      - Get template                            │ │
│  │  PUT  /api/templates/:id      - Update template                         │ │
│  │  POST /api/templates/:id/version - Create version                       │ │
│  │  GET  /api/templates/:id/export  - Export YAML                          │ │
│  │                                                                          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│                                      ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         DATABASE (Supabase/PostgreSQL)                  │ │
│  │                                                                          │ │
│  │  ┌─────────────────────┐  ┌─────────────────────┐                      │ │
│  │  │ user_runner_        │  │ user_template_      │                      │ │
│  │  │ templates           │  │ prompts             │                      │ │
│  │  └─────────────────────┘  └─────────────────────┘                      │ │
│  │  ┌─────────────────────┐  ┌─────────────────────┐                      │ │
│  │  │ user_template_      │  │ user_template_      │                      │ │
│  │  │ models              │  │ hitl                │                      │ │
│  │  └─────────────────────┘  └─────────────────────┘                      │ │
│  │  ┌─────────────────────┐  ┌─────────────────────┐                      │ │
│  │  │ user_template_      │  │ user_template_      │                      │ │
│  │  │ versions            │  │ usage               │                      │ │
│  │  └─────────────────────┘  └─────────────────────┘                      │ │
│  │                                                                          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│                                      ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         RUNTIME (Python Runners)                        │ │
│  │                                                                          │ │
│  │  Runner.load_template(run_code, user_id, template_id)                   │ │
│  │       │                                                                  │ │
│  │       └──► get_effective_template() ──► Merged Config ──► Execute      │ │
│  │                                                                          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 1.2 Data Flow Summary

| Step | Component | Action | Data Flow |
|------|-----------|--------|-----------|
| 1 | Frontend | User edits template | Form state |
| 2 | API | Validate & save | JSON → Database |
| 3 | Database | Store with RLS | Tables with versioning |
| 4 | Runtime | Load template | DB → Runner config |
| 5 | Export | Optional backup | DB → YAML file |

---

# Part 2: Database Schema

## 2.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER TEMPLATE DATABASE SCHEMA                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────┐         ┌───────────────────┐                        │
│  │   vital_runners   │◄────────│ user_runner_      │                        │
│  │   (system)        │  FK     │ templates         │                        │
│  │                   │         │                   │                        │
│  │ • run_code (PK)   │         │ • id (PK)         │                        │
│  │ • run_name        │         │ • user_id (FK)    │                        │
│  │ • cat_code        │         │ • tenant_id (FK)  │                        │
│  │ • algo_core       │         │ • run_code (FK)   │                        │
│  │ • complexity      │         │ • template_name   │                        │
│  └───────────────────┘         │ • template_type   │                        │
│                                │ • visibility      │                        │
│                                │ • status          │                        │
│                                │ • version         │                        │
│                                └─────────┬─────────┘                        │
│                                          │                                   │
│           ┌──────────────────────────────┼──────────────────────────────┐   │
│           │                              │                              │   │
│           ▼                              ▼                              ▼   │
│  ┌─────────────────┐          ┌─────────────────┐          ┌─────────────┐ │
│  │ user_template_  │          │ user_template_  │          │ user_       │ │
│  │ prompts         │          │ models          │          │ template_   │ │
│  │                 │          │                 │          │ hitl        │ │
│  │ • prompt_pattern│          │ • provider      │          │             │ │
│  │ • system_prompt │          │ • model_name    │          │ • enabled   │ │
│  │ • user_template │          │ • temperature   │          │ • triggers  │ │
│  │ • reasoning_    │          │ • max_tokens    │          │ • approvers │ │
│  │   steps         │          │ • fallbacks     │          │             │ │
│  │ • output_schema │          │ • max_cost      │          │             │ │
│  └─────────────────┘          └─────────────────┘          └─────────────┘ │
│           │                              │                              │   │
│           └──────────────────────────────┼──────────────────────────────┘   │
│                                          │                                   │
│                                          ▼                                   │
│                               ┌─────────────────────┐                       │
│                               │ user_template_      │                       │
│                               │ versions            │                       │
│                               │                     │                       │
│                               │ • version           │                       │
│                               │ • template_snapshot │                       │
│                               │ • performance_      │                       │
│                               │   metrics           │                       │
│                               └─────────────────────┘                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2.2 Key Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `user_runner_templates` | Main template record | user_id, run_code, template_name, visibility, status |
| `user_template_prompts` | Prompt configuration | prompt_pattern, system_prompt, reasoning_steps |
| `user_template_models` | Model settings | provider, model_name, temperature, max_tokens |
| `user_template_evaluation` | QA settings | framework, metrics, confidence_threshold |
| `user_template_hitl` | Human review config | hitl_enabled, triggers, approvers |
| `user_template_tools` | MCP tool config | tool_name, mcp_server, is_required |
| `user_template_versions` | Version history | version, template_snapshot |
| `user_template_shares` | Sharing permissions | shared_with_user_id, can_edit |
| `user_template_usage` | Analytics | execution_time_ms, cost_usd |

---

# Part 3: Frontend UI/UX Design

## 3.1 Template Browser Component

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TEMPLATE BROWSER                                                    [+New] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ My Templates│ │   Shared    │ │   Public    │ │   System    │           │
│  │    (12)     │ │    (5)      │ │    (48)     │ │   (88)      │           │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                                              │
│  Search: [________________________] Category: [All ▼] Status: [Active ▼]   │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ ★ My Custom Critique Runner                           v1.2.0  Active  │ │
│  │   EVALUATE > critique_001                                              │ │
│  │   Chain-of-Thought • GPT-4 • HITL Enabled                             │ │
│  │   Used 47 times • Last: 2 hours ago                    [Edit] [Clone] │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │   Research Deep Dive Template                         v2.0.1  Active  │ │
│  │   UNDERSTAND > scan_001                                                │ │
│  │   Tree-of-Thought • GPT-4-Turbo • Auto                                │ │
│  │   Used 23 times • Last: Yesterday                      [Edit] [Clone] │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │   Draft Strategy Template                             v1.0.0  Draft   │ │
│  │   CREATE > draft_001                                                   │ │
│  │   Meta-Prompting • Claude-3 • HITL Required                           │ │
│  │   Not used yet                                   [Edit] [Delete]       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3.2 Template Editor - Multi-Tab Interface

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TEMPLATE EDITOR: My Custom Critique Runner                                  │
│  Runner: critique_001 (EVALUATE)                    [Save Draft] [Publish]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐       │
│  │ Overview │  Prompt  │  Model   │   Eval   │   HITL   │  Tools   │       │
│  └──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘       │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                              │
│  Template Name: [My Custom Critique Runner___________________________]      │
│                                                                              │
│  Description:                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ A customized critique runner for evaluating market access           │   │
│  │ documents with pharmaceutical-specific rubrics.                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Template Type:  ○ Custom   ● Override   ○ Extension                        │
│                                                                              │
│  Visibility:     ● Private  ○ Team      ○ Public (requires approval)        │
│                                                                              │
│  Tags: [market-access] [pharma] [evaluation] [+Add]                         │
│                                                                              │
│  ───────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  Version: 1.2.0                                                              │
│  Created: Dec 10, 2025 by John Doe                                          │
│  Last Modified: 2 hours ago                                                  │
│                                                                              │
│  [View Version History]                                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3.3 Prompt Editor Tab

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PROMPT CONFIGURATION                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Prompt Pattern:                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ● Chain-of-Thought   ○ Tree-of-Thought   ○ ReAct                    │   │
│  │ ○ Self-Critique      ○ Meta-Prompting    ○ Custom                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ℹ️ Chain-of-Thought: Best for factual analysis and structured evaluation   │
│                                                                              │
│  ───────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  System Prompt:                                          [Use AI Assistant] │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ You are an expert pharmaceutical market access evaluator.           │   │
│  │                                                                      │   │
│  │ Your task is to critique documents against regulatory and           │   │
│  │ commercial criteria using the MCDA methodology.                     │   │
│  │                                                                      │   │
│  │ Always provide:                                                      │   │
│  │ 1. Overall score (0-10)                                             │   │
│  │ 2. Criterion-by-criterion breakdown                                 │   │
│  │ 3. Specific recommendations for improvement                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ───────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  Reasoning Steps:                                        [+ Add Step]       │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Step 1: Document Analysis                                     [⋮]   │   │
│  │ Identify document type, structure, and key sections                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Step 2: Criteria Mapping                                      [⋮]   │   │
│  │ Map document sections to evaluation criteria                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Step 3: Scoring                                               [⋮]   │   │
│  │ Apply MCDA scoring to each criterion                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Step 4: Synthesis                                             [⋮]   │   │
│  │ Combine scores and generate recommendations                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ───────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  User Prompt Template:                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Please evaluate the following document:                             │   │
│  │                                                                      │   │
│  │ **Document:**                                                        │   │
│  │ {document}                                                           │   │
│  │                                                                      │   │
│  │ **Evaluation Criteria:**                                             │   │
│  │ {rubric}                                                             │   │
│  │                                                                      │   │
│  │ **Additional Context:**                                              │   │
│  │ {context}                                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Available Variables: {document} {rubric} {context} {constraints}           │
│                                                                              │
│  ───────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  Output Format:  ● JSON   ○ Markdown   ○ Text   ○ Custom Schema            │
│                                                                              │
│  Output Schema:                                        [Edit JSON Schema]   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ {                                                                    │   │
│  │   "overall_score": "number (0-10)",                                 │   │
│  │   "criterion_scores": [{"criterion": "string", "score": "number"}], │   │
│  │   "strengths": ["string"],                                          │   │
│  │   "weaknesses": ["string"],                                         │   │
│  │   "recommendations": ["string"]                                     │   │
│  │ }                                                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3.4 Model Configuration Tab

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MODEL CONFIGURATION                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Primary Model:                                                              │
│                                                                              │
│  Provider:    [OpenAI        ▼]                                             │
│  Model:       [gpt-4-turbo   ▼]                                             │
│                                                                              │
│  ℹ️ GPT-4 Turbo: Best for complex evaluation tasks. $0.01/1K input tokens   │
│                                                                              │
│  ───────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  Parameters:                                                                 │
│                                                                              │
│  Temperature:     [====●=========] 0.3                                      │
│                   Deterministic ←→ Creative                                  │
│                                                                              │
│  Max Tokens:      [2000_________]                                           │
│                                                                              │
│  Top P:           [====●=========] 0.9                                      │
│                                                                              │
│  ───────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  Fallback Models:                                       [+ Add Fallback]    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 1. Claude-3 Opus (Anthropic)                                  [×]   │   │
│  │    Trigger: Primary unavailable OR error_rate > 10%                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 2. GPT-3.5 Turbo (OpenAI)                                     [×]   │   │
│  │    Trigger: Cost optimization AND expected_confidence > 0.9         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ───────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  Cost Controls:                                                              │
│                                                                              │
│  Max Cost Per Run:  [$0.50_______]                                          │
│                                                                              │
│  ⚠️ Estimated cost per run: $0.12 - $0.35                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3.5 HITL Configuration Tab

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HUMAN-IN-THE-LOOP CONFIGURATION                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  HITL Enabled:  [●] Yes                                                      │
│                                                                              │
│  ───────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  Trigger Conditions:                                    [+ Add Trigger]     │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Trigger 1: Low Confidence                                     [×]   │   │
│  │                                                                      │   │
│  │ Condition: confidence_score < [0.7___]                              │   │
│  │ Action:    ● Pause for approval  ○ Flag for review  ○ Log only     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Trigger 2: High-Stakes Content                                [×]   │   │
│  │                                                                      │   │
│  │ Condition: Contains regulatory claims                               │   │
│  │ Action:    ● Pause for approval  ○ Flag for review  ○ Log only     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ───────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  Approvers:                                             [+ Add Approver]    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ● Role: Domain Expert                               Required: Yes   │   │
│  │ ○ User: jane.doe@company.com                        Required: No    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ───────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  Timeout & Escalation:                                                       │
│                                                                              │
│  Approval Timeout:     [24___] hours                                        │
│  On Timeout:           [Escalate to Supervisor ▼]                           │
│  Escalation Contact:   [supervisor@company.com___________]                  │
│                                                                              │
│  ───────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  Notification Settings:                                                      │
│                                                                              │
│  ☑ Email notifications                                                      │
│  ☑ Slack notifications    Channel: [#ai-reviews________]                   │
│  ☐ SMS notifications                                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# Part 4: API Endpoints

## 4.1 REST API Specification

```yaml
# Template CRUD Operations

POST /api/templates
  description: Create new template
  body:
    run_code: string (required)
    template_name: string (required)
    template_type: "custom" | "override" | "extension"
    visibility: "private" | "team" | "public"
  response:
    template_id: uuid

GET /api/templates
  description: List user's available templates
  query:
    run_code: string (optional - filter by runner)
    status: string (optional)
    visibility: string (optional)
    page: number
    limit: number
  response:
    templates: Template[]
    total: number

GET /api/templates/:id
  description: Get template details
  response:
    template: FullTemplate (includes prompt, model, eval, hitl configs)

PUT /api/templates/:id
  description: Update template
  body: Partial<FullTemplate>
  response:
    template: FullTemplate

DELETE /api/templates/:id
  description: Delete template (soft delete)
  response:
    success: boolean

# Versioning

POST /api/templates/:id/versions
  description: Create new version
  body:
    version: string (semver)
    notes: string
  response:
    version_id: uuid

GET /api/templates/:id/versions
  description: List version history
  response:
    versions: Version[]

POST /api/templates/:id/versions/:version_id/restore
  description: Restore previous version
  response:
    template: FullTemplate

# Export

GET /api/templates/:id/export
  description: Export template as YAML
  query:
    format: "yaml" | "json"
  response:
    content: string (YAML or JSON)

POST /api/templates/import
  description: Import template from YAML
  body:
    yaml_content: string
  response:
    template_id: uuid

# Sharing

POST /api/templates/:id/share
  description: Share template
  body:
    share_with: { user_id?: uuid, tenant_id?: uuid, role?: string }
    permissions: { can_view, can_use, can_edit, can_share }
  response:
    share_id: uuid

DELETE /api/templates/:id/share/:share_id
  description: Revoke share

# Testing

POST /api/templates/:id/test
  description: Test template with sample input
  body:
    sample_input: object
  response:
    output: RunnerOutput
    execution_time_ms: number
    cost_usd: number
```

## 4.2 Supabase Real-time Subscriptions

```typescript
// Frontend: Real-time template updates

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Subscribe to template changes
const subscription = supabase
  .channel('template-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'user_runner_templates',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Template changed:', payload)
      // Update UI state
      refreshTemplates()
    }
  )
  .subscribe()

// Cleanup
return () => {
  supabase.removeChannel(subscription)
}
```

---

# Part 5: Runtime Integration

## 5.1 Runner Template Loading

```python
# services/ai-engine/src/langgraph_workflows/task_runners/template_loader.py

from typing import Optional
from pydantic import BaseModel
from supabase import create_client

class TemplateConfig(BaseModel):
    """Loaded template configuration."""
    template_id: Optional[str]
    template_name: Optional[str]

    # System runner info
    run_code: str
    run_name: str
    cat_code: str
    algo_core: str

    # Prompt config
    prompt_pattern: str
    system_prompt: str
    user_prompt_template: str
    reasoning_steps: list
    output_format: str
    output_schema: Optional[dict]

    # Model config
    provider: str
    model_name: str
    temperature: float
    max_tokens: int
    fallback_models: list

    # Evaluation config
    eval_framework: str
    eval_metrics: list
    confidence_method: str
    confidence_threshold: float

    # HITL config
    hitl_enabled: bool
    hitl_triggers: list
    approval_required: bool

class TemplateLoader:
    """
    Loads templates from database at runtime.
    NOT from YAML files.
    """

    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase = create_client(supabase_url, supabase_key)

    async def load_template(
        self,
        run_code: str,
        user_id: Optional[str] = None,
        template_id: Optional[str] = None
    ) -> TemplateConfig:
        """
        Load effective template from database.

        Priority:
        1. Specific template_id if provided
        2. User's favorite template for this runner
        3. System default (from vital_runners)
        """
        result = await self.supabase.rpc(
            'get_effective_template',
            {
                'p_run_code': run_code,
                'p_user_id': user_id,
                'p_template_id': template_id
            }
        ).execute()

        if result.data:
            return TemplateConfig(**result.data)

        raise ValueError(f"Template not found for runner: {run_code}")

    async def list_user_templates(
        self,
        user_id: str,
        run_code: Optional[str] = None
    ) -> list[TemplateConfig]:
        """List templates available to user."""
        query = self.supabase.from_('v_user_available_templates').select('*')

        if run_code:
            query = query.eq('run_code', run_code)

        result = await query.execute()
        return [TemplateConfig(**t) for t in result.data]
```

## 5.2 Runner with Template Support

```python
# services/ai-engine/src/langgraph_workflows/task_runners/base/templated_runner.py

from abc import ABC, abstractmethod
from .template_loader import TemplateLoader, TemplateConfig

class TemplatedRunner(ABC):
    """
    Base runner class with template support.
    Templates are loaded from DATABASE at runtime.
    """

    def __init__(
        self,
        run_code: str,
        template_loader: TemplateLoader
    ):
        self.run_code = run_code
        self.template_loader = template_loader
        self._template: Optional[TemplateConfig] = None

    async def load_template(
        self,
        user_id: Optional[str] = None,
        template_id: Optional[str] = None
    ):
        """Load template configuration from database."""
        self._template = await self.template_loader.load_template(
            run_code=self.run_code,
            user_id=user_id,
            template_id=template_id
        )

        # Configure runner based on template
        self._configure_from_template()

    def _configure_from_template(self):
        """Apply template configuration to runner."""
        if not self._template:
            return

        # Configure LLM
        self.llm = self._create_llm(
            provider=self._template.provider,
            model=self._template.model_name,
            temperature=self._template.temperature,
            max_tokens=self._template.max_tokens
        )

        # Configure prompts
        self.system_prompt = self._template.system_prompt
        self.user_prompt_template = self._template.user_prompt_template
        self.reasoning_steps = self._template.reasoning_steps

        # Configure evaluation
        self.confidence_threshold = self._template.confidence_threshold

        # Configure HITL
        self.hitl_enabled = self._template.hitl_enabled
        self.hitl_triggers = self._template.hitl_triggers

    async def execute(
        self,
        input: dict,
        user_id: Optional[str] = None,
        template_id: Optional[str] = None
    ) -> dict:
        """Execute runner with template."""
        # Load template if not already loaded
        if not self._template:
            await self.load_template(user_id, template_id)

        # Format user prompt with input
        user_prompt = self.user_prompt_template.format(**input)

        # Execute LLM
        response = await self.llm.invoke(
            system=self.system_prompt,
            user=user_prompt
        )

        # Check HITL triggers
        if self.hitl_enabled:
            await self._check_hitl_triggers(response)

        return response

    @abstractmethod
    async def _check_hitl_triggers(self, response: dict):
        """Check if HITL review is needed."""
        pass
```

---

# Part 6: YAML Export (Backup Only)

## 6.1 Export API Implementation

```python
# services/ai-engine/src/api/routes/template_export.py

from fastapi import APIRouter, Response
from fastapi.responses import StreamingResponse
import yaml

router = APIRouter()

@router.get("/templates/{template_id}/export")
async def export_template_yaml(
    template_id: str,
    format: str = "yaml"
):
    """
    Export template as YAML for backup/versioning.
    NOT used at runtime.
    """
    # Get full template from database
    template = await get_full_template(template_id)

    # Build export structure (matches package format)
    export_data = {
        'runner_manifest': {
            'runner_id': template.run_code,
            'runner_name': template.template_name,
            'version': template.version,
            'cognitive_category': template.cat_code,
            'description': template.description,
        },
        'prompt_strategy': {
            'prompting_pattern': template.prompt_pattern,
            'reasoning_structure': template.reasoning_steps,
            'prompt_template': {
                'version': template.version,
                'system_prompt': template.system_prompt,
                'user_prompt_template': template.user_prompt_template,
                'parameters': template.parameters,
            },
            'output_requirements': {
                'format': template.output_format,
                'schema': template.output_schema,
            }
        },
        'model_config': {
            'primary_model': {
                'provider': template.provider,
                'model_name': template.model_name,
                'temperature': template.temperature,
                'max_tokens': template.max_tokens,
            },
            'fallback_models': template.fallback_models,
            'cost_optimization': {
                'max_cost_per_run_usd': template.max_cost_per_run,
            }
        },
        'evaluation': {
            'evaluation_framework': template.eval_framework,
            'metrics': template.eval_metrics,
            'confidence_scoring': {
                'method': template.confidence_method,
                'threshold_for_hitl': template.confidence_threshold,
            }
        },
        'hitl_config': {
            'hitl_enabled': template.hitl_enabled,
            'patterns': template.hitl_triggers,
            'fallback_strategy': template.fallback_strategy,
        }
    }

    if format == "yaml":
        content = yaml.dump(export_data, default_flow_style=False, sort_keys=False)
        media_type = "application/x-yaml"
        filename = f"{template.run_code}_{template.version}.yaml"
    else:
        content = json.dumps(export_data, indent=2)
        media_type = "application/json"
        filename = f"{template.run_code}_{template.version}.json"

    return Response(
        content=content,
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

@router.post("/templates/import")
async def import_template_yaml(
    yaml_content: str,
    user_id: str
):
    """
    Import template from YAML.
    Creates new template in database.
    """
    # Parse YAML
    data = yaml.safe_load(yaml_content)

    # Create template in database
    template_id = await create_template_from_yaml(data, user_id)

    return {"template_id": template_id}
```

---

# Part 7: Summary

## 7.1 Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage | Database-First | Real-time edits, multi-user, versioning |
| UI Framework | React/Next.js | VITAL frontend standard |
| State Management | Supabase Real-time | Live updates across tabs |
| Runtime Loading | Database Query | Single source of truth |
| YAML Export | Optional Backup | DevOps/git versioning |

## 7.2 Key Benefits

1. **Seamless UX**: Users edit templates in rich UI, not YAML
2. **Real-time**: Changes reflect immediately
3. **Collaboration**: Teams can share and collaborate
4. **Versioning**: Full history with rollback
5. **Analytics**: Track usage and performance
6. **Security**: RLS policies control access

## 7.3 Related Documents

### Core Documentation

| Document | Path | Purpose |
|----------|------|---------|
| Runner Package Architecture | `docs/runners/RUNNER_PACKAGE_ARCHITECTURE.md` | 13-component package structure, 5 prompt patterns, 6 LangGraph archetypes |
| Task Composition Architecture | `docs/runners/TASK_COMPOSITION_ARCHITECTURE.md` | 8 workflow orchestration patterns, TaskDefinition schema |
| JTBD Runner Mapping | `docs/runners/JTBD_RUNNER_MAPPING.md` | Runner selection logic & routing |
| Unified Conceptual Model | `docs/runners/UNIFIED_CONCEPTUAL_MODEL.md` | Task Formula & Knowledge Stack |
| Conceptual Design Index | `docs/runners/CONCEPTUAL_DESIGN_INDEX.md` | Master index of all documents |

### Database Migrations

| Migration | Path | Purpose |
|-----------|------|---------|
| User Templates | `database/postgres/migrations/20251217_user_runner_templates.sql` | User template schema |
| Panel/Workflow Linkages | `database/postgres/migrations/20251217_panel_workflow_task_runner_linkages.sql` | Workflow composition schema |

---

**Version History:**
- v1.0 (December 2025): Initial architecture document

---

*End of Document*
