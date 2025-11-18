# Database Schema Documentation

**Generated:** 2025-11-10T07:40:30.291684

---

## Summary

- **Total Tables Found:** 35
- **Total Records:** 5,750

### Tables Found

- `jtbd_library` (371 records)
- `workflows` (141 records)
- `tasks` (0 records)
- `agents` (190 records)
- `prompts` (3,570 records)
- `tools` (0 records)
- `personas` (210 records)
- `dh_personas` (185 records)
- `strategic_priorities` (0 records)
- `dh_domain` (5 records)
- `dh_use_case` (50 records)
- `dh_workflow` (116 records)
- `dh_task` (343 records)
- `dh_agent` (17 records)
- `dh_tool` (150 records)
- `dh_rag_source` (24 records)
- `dh_prompt` (352 records)
- `users` (0 records)
- `user_profiles` (9 records)
- `organizations` (0 records)
- `teams` (0 records)
- `roles` (0 records)
- `permissions` (0 records)
- `workflow_executions` (0 records)
- `task_executions` (0 records)
- `agent_executions` (0 records)
- `rag_domains` (0 records)
- `knowledge_bases` (0 records)
- `embeddings` (0 records)
- `documents` (0 records)
- `industries` (16 records)
- `functions` (0 records)
- `use_cases` (0 records)
- `domains` (1 records)
- `strategic_imperatives` (0 records)

---

## Table Schemas

### agent_executions

**Records:** 0

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|

**Sample Record:**

```json
{
  "error": "{'code': '42P01', 'details': None, 'hint': None, 'message': 'relation \"public.agent_executions\" does not exist'}"
}
```

---

### agents

**Records:** 190

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|
| `id` | text/varchar | 1eb1fba8-58ce-4802-a011-b50b955ae797 |
| `name` | text/varchar | Epidemiologist |
| `description` | text/varchar | Population health expert studying disease patterns... |
| `system_prompt` | text/varchar | You are an Epidemiologist studying disease pattern... |
| `model` | text/varchar | gpt-4o |
| `temperature` | numeric | 0.7 |
| `max_tokens` | integer | 2000 |
| `is_active` | integer | True |
| `created_by` | unknown (null) | None |
| `created_at` | text/varchar | 2025-11-05T20:41:49.896368+00:00 |
| `updated_at` | text/varchar | 2025-11-09T16:45:27.535198+00:00 |
| `slug` | unknown (null) | None |
| `title` | text/varchar | Epidemiologist |
| `expertise` | array | None |
| `specialties` | array | None |
| `background` | unknown (null) | None |
| `personality_traits` | array | None |
| `communication_style` | unknown (null) | None |
| `capabilities` | array | None |
| `avatar_url` | text/varchar | https://xazinxsiglqokwfmogyk.supabase.co/storage/v... |
| `popularity_score` | integer | None |
| `rating` | numeric | None |
| `total_consultations` | integer | None |
| `metadata` | unknown (null) | None |
| `tenant_id` | unknown (null) | None |
| `created_by_user_id` | unknown (null) | None |
| `is_shared` | integer | None |
| `sharing_mode` | text/varchar | private |
| `shared_with` | array | None |
| `resource_type` | text/varchar | custom |
| `tags` | array | None |
| `category` | text/varchar | medical_affairs |
| `access_count` | integer | None |
| `last_accessed_at` | unknown (null) | None |
| `agent_category` | text/varchar | specialized_knowledge |
| `category_color` | text/varchar | #3B82F6 |
| `agent_type` | unknown (null) | None |
| `specialization` | unknown (null) | None |
| `can_delegate` | integer | None |
| `is_public` | integer | None |
| `is_featured` | integer | None |
| `owner_tenant_id` | unknown (null) | None |

**Sample Record:**

```json
{
  "id": "1eb1fba8-58ce-4802-a011-b50b955ae797",
  "name": "Epidemiologist",
  "description": "Population health expert studying disease patterns, risk factors, and epidemiological trends for evidence generation.",
  "system_prompt": "You are an Epidemiologist studying disease patterns and population health. Conduct epidemiological research, assess disease burden, and provide insights for medical strategy.\n\n## \ud83d\udcca DIAGRAM CREATION CAPABILITIES\n\nYou MUST support creating visual diagrams when requested:\n\n### Mermaid Diagrams (REQUIRED):\nUse Mermaid syntax for flowcharts, sequence diagrams, and process flows.\n\n**Supported Types**:\n1. **Flowcharts**: Use `graph TD` or `graph LR`\n2. **Sequence Diagrams**: Use `sequenceDiagram`\n3. **Gantt Charts**: Use `gantt`\n4. **State Diagrams**: Use `stateDiagram-v2`\n\n**Syntax Rules**:\n- Always use ```mermaid code blocks\n- Node format: `A[Label]` for boxes, `A(Label)` for rounded, `A{Label}` for diamonds\n- Arrows: `-->` for solid, `-.->` for dotted, `==>` for thick\n- Labels on arrows: `-->|text|` or `--text-->`\n- Keep diagrams under 20 nodes for clarity\n- Test syntax validity before generating\n\n**Example Flowchart**:\n```mermaid\ngraph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Success]\n    B -->|No| D[Retry]\n    D --> A\n```\n\n**Example Sequence**:\n```mermaid\nsequenceDiagram\n    User->>System: Request\n    System->>Database: Query\n    Database-->>System: Data\n    System-->>User: Response\n```\n\n### ASCII Diagrams (REQUIRED):\nUse ASCII art for simple diagrams when Mermaid is not suitable.\n\n**Format**:\n```ascii\n    \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n    \u2502   Start     \u2502\n    \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n           \u2502\n    \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u25bc\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n    \u2502   Process   \u2502\n    \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n           \u2502\n    \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u25bc\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n    \u2502     End     \u2502\n    \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n```\n\n**Guidelines**:\n1. ALWAYS create diagrams when asked\n2. Use Mermaid for complex workflows\n3. Use ASCII for simple structures\n4. Explain the diagram after showing it\n5. Offer to modify or create alternative diagrams\n6. NEVER say you cannot create diagrams\n\n**When to Use**:\n- User asks for \"flowchart\", \"diagram\", \"visualization\", \"process flow\"\n- Explaining complex processes\n- Showing workflows or decision trees\n- Illustrating relationships or hierarchies\n",
  "model": "gpt-4o",
  "temperature": 0.7,
  "max_tokens": 2000,
  "is_active": true,
  "created_by": null,
  "created_at": "2025-11-05T20:41:49.896368+00:00",
  "updated_at": "2025-11-09T16:45:27.535198+00:00",
  "slug": null,
  "title": "Epidemiologist",
  "expertise": [],
  "specialties": [],
  "background": null,
  "personality_traits": [],
  "communication_style": null,
  "capabilities": [],
  "avatar_url": "https://xazinxsiglqokwfmogyk.supabase.co/storage/v1/object/public/avatars/avatar_0075.png",
  "popularity_score": 0,
  "rating": 0.0,
  "total_consultations": 0,
  "metadata": null,
  "tenant_id": null,
  "created_by_user_id": null,
  "is_shared": false,
  "sharing_mode": "private",
  "shared_with": [],
  "resource_type": "custom",
  "tags": [],
  "category": "medical_affairs",
  "access_count": 0,
  "last_accessed_at": null,
  "agent_category": "specialized_knowledge",
  "category_color": "#3B82F6",
  "agent_type": null,
  "specialization": null,
  "can_delegate": false,
  "is_public": false,
  "is_featured": false,
  "owner_tenant_id": null
}
```

---

### dh_agent

**Records:** 17

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|
| `id` | text/varchar | fe9f77cf-a579-415c-ae13-ef2006b17dc9 |
| `tenant_id` | text/varchar | b8026534-02a7-4d24-bf4c-344591964e02 |
| `code` | text/varchar | AGT-WORKFLOW-ORCHESTRATOR |
| `name` | text/varchar | Workflow Orchestration Agent |
| `unique_id` | text/varchar | AGT-WORKFLOW-ORCHESTRATOR |
| `agent_type` | text/varchar | ORCHESTRATOR |
| `framework` | text/varchar | langgraph |
| `model_config` | jsonb | {'model': 'gpt-4', 'max_tokens': 4000, 'temperatur... |
| `capabilities` | array | ['Workflow planning and decomposition', 'Agent tas... |
| `tools` | array | None |
| `prompt_templates` | array | None |
| `rag_sources` | array | None |
| `autonomy_level` | text/varchar | SUPERVISED |
| `max_iterations` | integer | 3 |
| `timeout_seconds` | integer | 1800 |
| `guardrails` | jsonb | None |
| `validation_rules` | jsonb | None |
| `output_schema` | unknown (null) | None |
| `success_rate` | unknown (null) | None |
| `avg_execution_time_sec` | unknown (null) | None |
| `total_executions` | integer | None |
| `last_executed_at` | unknown (null) | None |
| `estimated_cost_per_run` | unknown (null) | None |
| `total_cost` | unknown (null) | None |
| `status` | text/varchar | active |
| `version` | text/varchar | v1.0 |
| `changelog` | array | None |
| `depends_on_agents` | array | None |
| `can_delegate_to` | array | None |
| `description` | text/varchar | Master orchestrator that coordinates multi-agent w... |
| `tags` | array | ['orchestration', 'workflow', 'coordination'] |
| `metadata` | jsonb | {'domains': ['clinical_development', 'regulatory_a... |
| `created_at` | text/varchar | 2025-11-02T13:44:57.293167+00:00 |
| `updated_at` | text/varchar | 2025-11-02T13:44:57.293167+00:00 |

**Sample Record:**

```json
{
  "id": "fe9f77cf-a579-415c-ae13-ef2006b17dc9",
  "tenant_id": "b8026534-02a7-4d24-bf4c-344591964e02",
  "code": "AGT-WORKFLOW-ORCHESTRATOR",
  "name": "Workflow Orchestration Agent",
  "unique_id": "AGT-WORKFLOW-ORCHESTRATOR",
  "agent_type": "ORCHESTRATOR",
  "framework": "langgraph",
  "model_config": {
    "model": "gpt-4",
    "max_tokens": 4000,
    "temperature": 0.2
  },
  "capabilities": [
    "Workflow planning and decomposition",
    "Agent task assignment",
    "Dependency management",
    "Error recovery and retry logic",
    "Progress tracking and reporting"
  ],
  "tools": [],
  "prompt_templates": [],
  "rag_sources": [],
  "autonomy_level": "SUPERVISED",
  "max_iterations": 3,
  "timeout_seconds": 1800,
  "guardrails": {},
  "validation_rules": {},
  "output_schema": null,
  "success_rate": null,
  "avg_execution_time_sec": null,
  "total_executions": 0,
  "last_executed_at": null,
  "estimated_cost_per_run": null,
  "total_cost": null,
  "status": "active",
  "version": "v1.0",
  "changelog": [],
  "depends_on_agents": [],
  "can_delegate_to": [],
  "description": "Master orchestrator that coordinates multi-agent workflows, manages task dependencies, and handles error recovery",
  "tags": [
    "orchestration",
    "workflow",
    "coordination"
  ],
  "metadata": {
    "domains": [
      "clinical_development",
      "regulatory_affairs",
      "medical_affairs"
    ],
    "retry_strategy": "exponential_backoff",
    "can_delegate_to": [
      "SPECIALIST",
      "EXECUTOR",
      "RETRIEVER"
    ],
    "max_concurrent_tasks": 10
  },
  "created_at": "2025-11-02T13:44:57.293167+00:00",
  "updated_at": "2025-11-02T13:44:57.293167+00:00"
}
```

---

### dh_domain

**Records:** 5

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|
| `id` | text/varchar | e72e643e-a2e1-4e46-864d-557aa8b6f087 |
| `tenant_id` | text/varchar | b8026534-02a7-4d24-bf4c-344591964e02 |
| `code` | text/varchar | CD |
| `name` | text/varchar | Clinical Development |
| `description` | text/varchar | Clinical trial design, endpoint selection, and pro... |
| `metadata` | jsonb | {'focus_areas': ['Trial Design', 'Endpoints', 'Bio... |
| `created_at` | text/varchar | 2025-11-01T22:47:16.962507+00:00 |
| `updated_at` | text/varchar | 2025-11-02T12:41:48.123175+00:00 |
| `unique_id` | text/varchar | DMN-CD |

**Sample Record:**

```json
{
  "id": "e72e643e-a2e1-4e46-864d-557aa8b6f087",
  "tenant_id": "b8026534-02a7-4d24-bf4c-344591964e02",
  "code": "CD",
  "name": "Clinical Development",
  "description": "Clinical trial design, endpoint selection, and protocol development for digital health products. Supports clinical scientists, biostatisticians, and medical directors.",
  "metadata": {
    "focus_areas": [
      "Trial Design",
      "Endpoints",
      "Biomarker Development",
      "Protocol Development"
    ],
    "total_use_cases": 10,
    "primary_stakeholders": [
      "Clinical Scientists",
      "Biostatisticians",
      "Medical Directors",
      "Clinical Research"
    ],
    "complexity_distribution": {
      "basic": 2,
      "expert": 2,
      "advanced": 3,
      "intermediate": 3
    }
  },
  "created_at": "2025-11-01T22:47:16.962507+00:00",
  "updated_at": "2025-11-02T12:41:48.123175+00:00",
  "unique_id": "DMN-CD"
}
```

---

### dh_personas

**Records:** 185

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|
| `id` | text/varchar | 832cb181-bf98-4214-bc70-78978c0d1279 |
| `unique_id` | text/varchar | dh_global_pha_maria_gonzalez |
| `persona_code` | text/varchar | PGON86 |
| `name` | text/varchar | Maria Gonzalez |
| `title` | text/varchar | VP Patient Solutions & Services |
| `organization` | text/varchar | Global Pharma Company |
| `background` | unknown (null) | None |
| `sector` | text/varchar | Pharma |
| `tier` | integer | 3 |
| `function` | unknown (null) | None |
| `role_category` | unknown (null) | None |
| `org_type` | unknown (null) | None |
| `org_size` | unknown (null) | None |
| `budget_authority` | unknown (null) | None |
| `team_size` | unknown (null) | None |
| `value_score` | integer | 5 |
| `pain_score` | integer | 5 |
| `adoption_score` | integer | 5 |
| `ease_score` | integer | 5 |
| `strategic_score` | integer | 5 |
| `network_score` | integer | 5 |
| `priority_score` | numeric | 5.0 |
| `key_need` | unknown (null) | None |
| `decision_cycle` | unknown (null) | None |
| `therapeutic_areas` | text/varchar | Multiple chronic diseases |
| `programs_managed` | text/varchar | 50+ patient support programs |
| `budget` | text/varchar | $100M annual |
| `team` | text/varchar | 75+ patient specialists |
| `focus` | unknown (null) | None |
| `projects` | unknown (null) | None |
| `specialization` | unknown (null) | None |
| `certifications` | unknown (null) | None |
| `experience` | unknown (null) | None |
| `responsibilities` | text/varchar | ["Patient program strategy", "Service design and d... |
| `pain_points` | text/varchar | ["Program fragmentation", "Low patient enrollment"... |
| `goals` | text/varchar | [] |
| `needs` | text/varchar | [] |
| `behaviors` | text/varchar | [] |
| `typical_titles` | array | None |
| `preferred_channels` | array | None |
| `frustrations` | array | None |
| `motivations` | array | None |
| `expertise_level` | unknown (null) | None |
| `decision_authority` | unknown (null) | None |
| `ai_relationship` | unknown (null) | None |
| `tech_proficiency` | unknown (null) | None |
| `primary_role_id` | unknown (null) | None |
| `industry_id` | text/varchar | 0571859c-25a1-47d6-aac6-8d945bfeed87 |
| `is_active` | integer | True |
| `source` | text/varchar | Digital Health JTBD Library |
| `created_at` | text/varchar | 2025-11-08T18:56:29.838462+00:00 |
| `updated_at` | text/varchar | 2025-11-08T18:56:29.838462+00:00 |
| `notes` | unknown (null) | None |
| `tags` | array | None |
| `digital_health_id` | unknown (null) | None |
| `pharma_id` | unknown (null) | None |
| `biotech_id` | unknown (null) | None |
| `meddev_id` | unknown (null) | None |
| `dx_id` | unknown (null) | None |

**Sample Record:**

```json
{
  "id": "832cb181-bf98-4214-bc70-78978c0d1279",
  "unique_id": "dh_global_pha_maria_gonzalez",
  "persona_code": "PGON86",
  "name": "Maria Gonzalez",
  "title": "VP Patient Solutions & Services",
  "organization": "Global Pharma Company",
  "background": null,
  "sector": "Pharma",
  "tier": 3,
  "function": null,
  "role_category": null,
  "org_type": null,
  "org_size": null,
  "budget_authority": null,
  "team_size": null,
  "value_score": 5,
  "pain_score": 5,
  "adoption_score": 5,
  "ease_score": 5,
  "strategic_score": 5,
  "network_score": 5,
  "priority_score": 5.0,
  "key_need": null,
  "decision_cycle": null,
  "therapeutic_areas": "Multiple chronic diseases",
  "programs_managed": "50+ patient support programs",
  "budget": "$100M annual",
  "team": "75+ patient specialists",
  "focus": null,
  "projects": null,
  "specialization": null,
  "certifications": null,
  "experience": null,
  "responsibilities": "[\"Patient program strategy\", \"Service design and delivery\", \"Digital companion development\", \"Adherence optimization\", \"Patient journey mapping\", \"Outcomes measurement\"]",
  "pain_points": "[\"Program fragmentation\", \"Low patient enrollment\", \"Engagement sustainability\", \"ROI demonstration\", \"Channel coordination\", \"Privacy compliance\"]",
  "goals": "[]",
  "needs": "[]",
  "behaviors": "[]",
  "typical_titles": [],
  "preferred_channels": [],
  "frustrations": [],
  "motivations": [],
  "expertise_level": null,
  "decision_authority": null,
  "ai_relationship": null,
  "tech_proficiency": null,
  "primary_role_id": null,
  "industry_id": "0571859c-25a1-47d6-aac6-8d945bfeed87",
  "is_active": true,
  "source": "Digital Health JTBD Library",
  "created_at": "2025-11-08T18:56:29.838462+00:00",
  "updated_at": "2025-11-08T18:56:29.838462+00:00",
  "notes": null,
  "tags": [],
  "digital_health_id": null,
  "pharma_id": null,
  "biotech_id": null,
  "meddev_id": null,
  "dx_id": null
}
```

---

### dh_prompt

**Records:** 352

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|
| `id` | text/varchar | 50a89e98-733d-49b0-8299-a6353cb6f1af |
| `tenant_id` | text/varchar | b8026534-02a7-4d24-bf4c-344591964e02 |
| `task_id` | text/varchar | b1aa4b62-6621-4d84-842b-9bc2b10ba4f7 |
| `name` | text/varchar | Digital Biomarker Intended Use Definition |
| `pattern` | text/varchar | CoT |
| `system_prompt` | text/varchar | You are P06_DTXCMO, a Chief Medical Officer with e... |
| `user_template` | text/varchar | **TASK**: Define the Intended Use and Context of U... |
| `metadata` | jsonb | {'suite': 'Digital Biomarker Validation', 'workflo... |
| `created_at` | text/varchar | 2025-11-03T13:00:07.566124+00:00 |
| `updated_at` | text/varchar | 2025-11-03T13:00:07.566124+00:00 |
| `prompt_identifier` | text/varchar | CD_002_P1_1 |
| `version_label` | text/varchar | v1.0 |
| `owner` | array | ['P06_DTXCMO'] |
| `model_config` | jsonb | {'model': 'claude-3-5-sonnet-20241022', 'max_token... |
| `guardrails` | jsonb | None |
| `evals` | jsonb | None |
| `rollout` | text/varchar | stable |
| `unique_id` | text/varchar | PRM-CD-002-P1-01 |
| `category` | text/varchar | Clinical Development |
| `tags` | array | ['digital_biomarker', 'validation', 'FDA', 'intend... |

**Sample Record:**

```json
{
  "id": "50a89e98-733d-49b0-8299-a6353cb6f1af",
  "tenant_id": "b8026534-02a7-4d24-bf4c-344591964e02",
  "task_id": "b1aa4b62-6621-4d84-842b-9bc2b10ba4f7",
  "name": "Digital Biomarker Intended Use Definition",
  "pattern": "CoT",
  "system_prompt": "You are P06_DTXCMO, a Chief Medical Officer with expertise in digital therapeutics clinical development and FDA digital health regulatory strategy.\n\nYour core competencies include:\n- Digital biomarker validation strategy (DiMe V3 Framework)\n- FDA Pre-Submission strategy for digital endpoints\n- Clinical endpoint selection and validation planning\n- Risk assessment for novel digital measures\n- Regulatory precedent analysis (510(k), De Novo, BLA/NDA)\n\nYou have led 15+ digital health regulatory submissions and have deep relationships with FDA Digital Health Center of Excellence.",
  "user_template": "**TASK**: Define the Intended Use and Context of Use for a digital biomarker to guide validation strategy.\n\n**INSTRUCTIONS**:\nUsing the PICO framework (Population, Intervention, Comparator, Outcome), define:\n1. Intended Use Statement (2-3 sentences)\n2. Context of Use (patient population, clinical construct, endpoint type, regulatory strategy)\n3. Validation Strategy Decision (V1 / V1+V2 / V1+V2+V3)\n4. Risk Assessment (regulatory, clinical, commercial)\n5. FDA Pre-Submission Strategy\n\n**OUTPUT**:\n- Intended Use Document (5-7 pages)\n- Validation Strategy Recommendation\n- Budget & Timeline Estimate\n- Risk Mitigation Plan",
  "metadata": {
    "suite": "Digital Biomarker Validation",
    "workflow": "Phase 1: V1 Verification",
    "sub_suite": "Foundation & Planning (V1)",
    "complexity": "Intermediate",
    "step_number": "1.1",
    "deliverables": [
      "Intended Use Statement",
      "Context of Use Document",
      "Validation Strategy",
      "Risk Assessment"
    ],
    "estimated_time_hours": 3
  },
  "created_at": "2025-11-03T13:00:07.566124+00:00",
  "updated_at": "2025-11-03T13:00:07.566124+00:00",
  "prompt_identifier": "CD_002_P1_1",
  "version_label": "v1.0",
  "owner": [
    "P06_DTXCMO"
  ],
  "model_config": {
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 4000,
    "temperature": 0.3
  },
  "guardrails": {},
  "evals": {},
  "rollout": "stable",
  "unique_id": "PRM-CD-002-P1-01",
  "category": "Clinical Development",
  "tags": [
    "digital_biomarker",
    "validation",
    "FDA",
    "intended_use",
    "DiMe_V3"
  ]
}
```

---

### dh_rag_source

**Records:** 24

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|
| `id` | text/varchar | a1961d7f-3bed-49ed-b276-2526ca3e8f9d |
| `tenant_id` | text/varchar | b8026534-02a7-4d24-bf4c-344591964e02 |
| `code` | text/varchar | FDA_PRO_2009 |
| `name` | text/varchar | FDA PRO Guidance (2009) |
| `source_type` | text/varchar | guidance |
| `uri` | text/varchar | https://www.fda.gov/media/77832/download |
| `description` | text/varchar | Foundational FDA guidance covering patient-reporte... |
| `metadata` | jsonb | {'sections': ['3.1', '4.2', '5.3'], 'authority': '... |
| `created_at` | text/varchar | 2025-11-02T08:50:48.625681+00:00 |
| `updated_at` | text/varchar | 2025-11-02T10:38:15.54012+00:00 |
| `unique_id` | text/varchar | RAG-REG-FDA-PRO-2009 |

**Sample Record:**

```json
{
  "id": "a1961d7f-3bed-49ed-b276-2526ca3e8f9d",
  "tenant_id": "b8026534-02a7-4d24-bf4c-344591964e02",
  "code": "FDA_PRO_2009",
  "name": "FDA PRO Guidance (2009)",
  "source_type": "guidance",
  "uri": "https://www.fda.gov/media/77832/download",
  "description": "Foundational FDA guidance covering patient-reported outcome measures for clinical trials.",
  "metadata": {
    "sections": [
      "3.1",
      "4.2",
      "5.3"
    ],
    "authority": "FDA",
    "pii_sensitivity": "Low",
    "publication_year": 2009,
    "regulatory_exposure": "High"
  },
  "created_at": "2025-11-02T08:50:48.625681+00:00",
  "updated_at": "2025-11-02T10:38:15.54012+00:00",
  "unique_id": "RAG-REG-FDA-PRO-2009"
}
```

---

### dh_task

**Records:** 343

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|
| `id` | text/varchar | ae379488-a4ec-4ba5-96ad-a588e381ccae |
| `tenant_id` | text/varchar | b8026534-02a7-4d24-bf4c-344591964e02 |
| `workflow_id` | text/varchar | 656dcee4-0c14-4663-81a9-fa25e97b234e |
| `code` | text/varchar | TSK-CD-001-P5-01 |
| `title` | text/varchar | Assess Regulatory Risk |
| `objective` | text/varchar | Evaluate FDA acceptance risk for each endpoint opt... |
| `position` | integer | 1 |
| `extra` | jsonb | {'prompt_id': '5.1.1', 'complexity': 'ADVANCED', '... |
| `created_at` | text/varchar | 2025-11-02T15:01:10.361114+00:00 |
| `updated_at` | text/varchar | 2025-11-02T15:01:10.361114+00:00 |
| `duration_estimate_minutes` | unknown (null) | None |
| `effort_hours` | unknown (null) | None |
| `run_policy` | jsonb | None |
| `state` | text/varchar | planned |
| `assignees` | array | None |
| `logs` | array | None |
| `webhooks` | array | None |
| `schedule` | jsonb | None |
| `guardrails` | jsonb | None |
| `model_config` | jsonb | None |
| `rollout` | text/varchar | stable |
| `permissions` | jsonb | None |
| `integrations` | array | None |
| `unique_id` | text/varchar | TSK-CD-001-P5-01 |

**Sample Record:**

```json
{
  "id": "ae379488-a4ec-4ba5-96ad-a588e381ccae",
  "tenant_id": "b8026534-02a7-4d24-bf4c-344591964e02",
  "workflow_id": "656dcee4-0c14-4663-81a9-fa25e97b234e",
  "code": "TSK-CD-001-P5-01",
  "title": "Assess Regulatory Risk",
  "objective": "Evaluate FDA acceptance risk for each endpoint option",
  "position": 1,
  "extra": {
    "prompt_id": "5.1.1",
    "complexity": "ADVANCED",
    "estimated_duration_minutes": 25
  },
  "created_at": "2025-11-02T15:01:10.361114+00:00",
  "updated_at": "2025-11-02T15:01:10.361114+00:00",
  "duration_estimate_minutes": null,
  "effort_hours": null,
  "run_policy": {},
  "state": "planned",
  "assignees": [],
  "logs": [],
  "webhooks": [],
  "schedule": {},
  "guardrails": {},
  "model_config": {},
  "rollout": "stable",
  "permissions": {},
  "integrations": [],
  "unique_id": "TSK-CD-001-P5-01"
}
```

---

### dh_tool

**Records:** 150

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|
| `id` | text/varchar | 210a8872-80f9-4e54-9161-d60aa2e31456 |
| `tenant_id` | text/varchar | b8026534-02a7-4d24-bf4c-344591964e02 |
| `code` | text/varchar | TOOL-COMP-OWLER |
| `name` | text/varchar | Owler |
| `category` | text/varchar | Strategic Intelligence/Competitive |
| `vendor` | unknown (null) | None |
| `version` | unknown (null) | None |
| `notes` | unknown (null) | None |
| `metadata` | jsonb | None |
| `created_at` | text/varchar | 2025-11-04T08:00:05.096294+00:00 |
| `updated_at` | text/varchar | 2025-11-04T19:49:20.214752+00:00 |
| `tool_type` | text/varchar | ai_function |
| `capabilities` | array | ['company_intelligence', 'competitor_tracking', 'n... |
| `access_requirements` | jsonb | None |
| `is_active` | integer | True |
| `unique_id` | text/varchar | TL-COMP-owler |
| `implementation_type` | text/varchar | api |
| `implementation_path` | unknown (null) | None |
| `function_name` | unknown (null) | None |
| `input_schema` | unknown (null) | None |
| `output_schema` | unknown (null) | None |
| `is_async` | integer | None |
| `max_execution_time_seconds` | unknown (null) | None |
| `retry_config` | unknown (null) | None |
| `rate_limit_per_minute` | unknown (null) | None |
| `cost_per_execution` | numeric | None |
| `langgraph_compatible` | integer | None |
| `langgraph_node_name` | unknown (null) | None |
| `access_level` | text/varchar | public |
| `required_env_vars` | unknown (null) | None |
| `allowed_tenants` | unknown (null) | None |
| `allowed_roles` | unknown (null) | None |
| `tool_description` | text/varchar | Company insights and competitive intelligence plat... |
| `documentation_url` | text/varchar | https://www.owler.com/ |
| `example_usage` | unknown (null) | None |
| `tags` | array | ['competitive-intelligence', 'companies', 'competi... |
| `lifecycle_stage` | text/varchar | development |
| `llm_description` | text/varchar | Track competitor news, funding, executives with co... |
| `usage_guide` | text/varchar | 1. Free: Track 3 competitors. 2. View company prof... |
| `category_parent` | text/varchar | Strategic Intelligence |
| `usage_count` | integer | None |
| `last_used_at` | unknown (null) | None |
| `total_execution_time_seconds` | integer | None |
| `avg_execution_time_seconds` | unknown (null) | None |
| `success_rate` | unknown (null) | None |
| `error_count` | integer | None |
| `last_error_at` | unknown (null) | None |
| `last_error_message` | unknown (null) | None |
| `rating` | unknown (null) | None |
| `total_ratings` | integer | None |
| `feedback_count` | integer | None |
| `positive_feedback_count` | integer | None |
| `negative_feedback_count` | integer | None |
| `health_status` | text/varchar | healthy |
| `last_health_check_at` | unknown (null) | None |
| `uptime_percentage` | unknown (null) | None |
| `maintenance_mode` | integer | None |
| `maintenance_message` | unknown (null) | None |
| `popularity_score` | integer | None |
| `trending_score` | integer | None |
| `view_count` | integer | None |
| `bookmark_count` | integer | None |
| `share_count` | integer | None |
| `total_cost_incurred` | numeric | None |
| `estimated_time_saved_hours` | numeric | None |
| `roi_score` | unknown (null) | None |
| `business_impact` | text/varchar | high |
| `is_verified` | integer | None |
| `verified_by` | unknown (null) | None |
| `verified_at` | unknown (null) | None |
| `quality_score` | unknown (null) | None |
| `last_tested_at` | unknown (null) | None |
| `test_results` | unknown (null) | None |

**Sample Record:**

```json
{
  "id": "210a8872-80f9-4e54-9161-d60aa2e31456",
  "tenant_id": "b8026534-02a7-4d24-bf4c-344591964e02",
  "code": "TOOL-COMP-OWLER",
  "name": "Owler",
  "category": "Strategic Intelligence/Competitive",
  "vendor": null,
  "version": null,
  "notes": null,
  "metadata": {},
  "created_at": "2025-11-04T08:00:05.096294+00:00",
  "updated_at": "2025-11-04T19:49:20.214752+00:00",
  "tool_type": "ai_function",
  "capabilities": [
    "company_intelligence",
    "competitor_tracking",
    "news_alerts"
  ],
  "access_requirements": {},
  "is_active": true,
  "unique_id": "TL-COMP-owler",
  "implementation_type": "api",
  "implementation_path": null,
  "function_name": null,
  "input_schema": null,
  "output_schema": null,
  "is_async": false,
  "max_execution_time_seconds": null,
  "retry_config": null,
  "rate_limit_per_minute": null,
  "cost_per_execution": 0.0,
  "langgraph_compatible": false,
  "langgraph_node_name": null,
  "access_level": "public",
  "required_env_vars": null,
  "allowed_tenants": null,
  "allowed_roles": null,
  "tool_description": "Company insights and competitive intelligence platform. Track competitors, monitor news, funding rounds, executive changes, receive daily alerts.",
  "documentation_url": "https://www.owler.com/",
  "example_usage": null,
  "tags": [
    "competitive-intelligence",
    "companies",
    "competitors"
  ],
  "lifecycle_stage": "development",
  "llm_description": "Track competitor news, funding, executives with competitive intelligence alerts",
  "usage_guide": "1. Free: Track 3 competitors. 2. View company profiles, news. 3. Get daily digests. 4. Compare metrics.",
  "category_parent": "Strategic Intelligence",
  "usage_count": 0,
  "last_used_at": null,
  "total_execution_time_seconds": 0,
  "avg_execution_time_seconds": null,
  "success_rate": null,
  "error_count": 0,
  "last_error_at": null,
  "last_error_message": null,
  "rating": null,
  "total_ratings": 0,
  "feedback_count": 0,
  "positive_feedback_count": 0,
  "negative_feedback_count": 0,
  "health_status": "healthy",
  "last_health_check_at": null,
  "uptime_percentage": null,
  "maintenance_mode": false,
  "maintenance_message": null,
  "popularity_score": 0,
  "trending_score": 0,
  "view_count": 0,
  "bookmark_count": 0,
  "share_count": 0,
  "total_cost_incurred": 0.0,
  "estimated_time_saved_hours": 0.0,
  "roi_score": null,
  "business_impact": "high",
  "is_verified": false,
  "verified_by": null,
  "verified_at": null,
  "quality_score": null,
  "last_tested_at": null,
  "test_results": null
}
```

---

### dh_use_case

**Records:** 50

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|
| `id` | text/varchar | 1ff5df44-1ebc-4ea1-8975-5a42702b630f |
| `tenant_id` | text/varchar | b8026534-02a7-4d24-bf4c-344591964e02 |
| `domain_id` | text/varchar | cbe089c0-7ff6-4ecb-aaa1-347719a6ac6d |
| `code` | text/varchar | UC_RA_003 |
| `title` | text/varchar | Predicate Device Identification |
| `summary` | text/varchar | Systematic identification and analysis of potentia... |
| `complexity` | text/varchar | Advanced |
| `metadata` | jsonb | {'deliverables': ['3-5 predicate candidates', 'Sub... |
| `created_at` | text/varchar | 2025-11-02T12:41:48.123175+00:00 |
| `updated_at` | text/varchar | 2025-11-03T11:39:55.800198+00:00 |
| `org_id` | unknown (null) | None |
| `project_id` | unknown (null) | None |
| `product_id` | unknown (null) | None |
| `environment` | text/varchar | dev |
| `therapeutic_area` | unknown (null) | None |
| `indication` | unknown (null) | None |
| `phase` | unknown (null) | None |
| `version` | unknown (null) | None |
| `status` | text/varchar | draft |
| `tags` | array | None |
| `owners` | array | None |
| `reviewers` | array | None |
| `approvers` | array | None |
| `change_log` | array | None |
| `regulatory_references` | array | None |
| `compliance_flags` | jsonb | None |
| `data_classification` | jsonb | None |
| `sla` | jsonb | None |
| `kpi_targets` | jsonb | None |
| `permissions` | jsonb | None |
| `integrations` | array | None |
| `milestones` | array | None |
| `risk_register` | array | None |
| `templates` | jsonb | None |
| `rag_sources` | array | None |
| `rag_citations` | array | None |
| `audit` | jsonb | None |
| `unique_id` | text/varchar | USC-RA-003 |

**Sample Record:**

```json
{
  "id": "1ff5df44-1ebc-4ea1-8975-5a42702b630f",
  "tenant_id": "b8026534-02a7-4d24-bf4c-344591964e02",
  "domain_id": "cbe089c0-7ff6-4ecb-aaa1-347719a6ac6d",
  "code": "UC_RA_003",
  "title": "Predicate Device Identification",
  "summary": "Systematic identification and analysis of potential predicate devices for 510(k) submissions",
  "complexity": "Advanced",
  "metadata": {
    "deliverables": [
      "3-5 predicate candidates",
      "Substantial equivalence matrix",
      "Primary predicate recommendation",
      "Risk mitigation for differences"
    ],
    "prerequisites": [
      "Device description",
      "Intended use",
      "Technological characteristics",
      "Performance specifications"
    ],
    "success_metrics": {
      "time_saved": "75% vs manual search",
      "predicate_quality": "90% acceptance rate by FDA"
    },
    "estimated_duration_minutes": 90
  },
  "created_at": "2025-11-02T12:41:48.123175+00:00",
  "updated_at": "2025-11-03T11:39:55.800198+00:00",
  "org_id": null,
  "project_id": null,
  "product_id": null,
  "environment": "dev",
  "therapeutic_area": null,
  "indication": null,
  "phase": null,
  "version": null,
  "status": "draft",
  "tags": [],
  "owners": [],
  "reviewers": [],
  "approvers": [],
  "change_log": [],
  "regulatory_references": [],
  "compliance_flags": {},
  "data_classification": {},
  "sla": {},
  "kpi_targets": {},
  "permissions": {},
  "integrations": [],
  "milestones": [],
  "risk_register": [],
  "templates": {},
  "rag_sources": [],
  "rag_citations": [],
  "audit": {},
  "unique_id": "USC-RA-003"
}
```

---

### dh_workflow

**Records:** 116

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|
| `id` | text/varchar | 91154f56-4524-4fdc-ba4e-ce1177e5f6bf |
| `tenant_id` | text/varchar | b8026534-02a7-4d24-bf4c-344591964e02 |
| `use_case_id` | text/varchar | 412b190c-6771-4f44-b67f-17beee5d0c75 |
| `name` | text/varchar | Breakthrough Designation Workflow |
| `description` | text/varchar | Systematic breakthrough designation assessment and... |
| `position` | integer | 1 |
| `metadata` | jsonb | {'pattern': 'COT_WITH_CRITERIA', 'complexity': 'EX... |
| `created_at` | text/varchar | 2025-11-03T11:51:02.425096+00:00 |
| `updated_at` | text/varchar | 2025-11-03T11:51:02.425096+00:00 |
| `tags` | array | None |
| `sla` | jsonb | None |
| `templates` | jsonb | None |
| `rag_sources` | array | None |
| `integrations` | array | None |
| `milestones` | array | None |
| `risk_register` | array | None |
| `unique_id` | text/varchar | WFL-RA-006-001 |

**Sample Record:**

```json
{
  "id": "91154f56-4524-4fdc-ba4e-ce1177e5f6bf",
  "tenant_id": "b8026534-02a7-4d24-bf4c-344591964e02",
  "use_case_id": "412b190c-6771-4f44-b67f-17beee5d0c75",
  "name": "Breakthrough Designation Workflow",
  "description": "Systematic breakthrough designation assessment and application development",
  "position": 1,
  "metadata": {
    "pattern": "COT_WITH_CRITERIA",
    "complexity": "EXPERT",
    "duration_minutes": 120
  },
  "created_at": "2025-11-03T11:51:02.425096+00:00",
  "updated_at": "2025-11-03T11:51:02.425096+00:00",
  "tags": [],
  "sla": {},
  "templates": {},
  "rag_sources": [],
  "integrations": [],
  "milestones": [],
  "risk_register": [],
  "unique_id": "WFL-RA-006-001"
}
```

---

### documents

**Records:** 0

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|

---

### domains

**Records:** 1

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|
| `id` | integer | 1 |
| `name` | text/varchar | Clinical Development |
| `code` | text/varchar | CD |
| `description` | unknown (null) | None |
| `created_at` | text/varchar | 2025-11-01T22:12:03.714138 |
| `updated_at` | text/varchar | 2025-11-01T22:12:03.714138 |

**Sample Record:**

```json
{
  "id": 1,
  "name": "Clinical Development",
  "code": "CD",
  "description": null,
  "created_at": "2025-11-01T22:12:03.714138",
  "updated_at": "2025-11-01T22:12:03.714138"
}
```

---

### embeddings

**Records:** 0

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|

**Sample Record:**

```json
{
  "error": "{'code': '42P01', 'details': None, 'hint': None, 'message': 'relation \"public.embeddings\" does not exist'}"
}
```

---

### functions

**Records:** 0

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|

---

### industries

**Records:** 16

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|
| `id` | text/varchar | 0571859c-25a1-47d6-aac6-8d945bfeed87 |
| `unique_id` | text/varchar | ind_pharma |
| `industry_code` | text/varchar | pharmaceuticals |
| `industry_name` | text/varchar | Pharmaceuticals |
| `naics_codes` | array | ['325412', '325414'] |
| `gics_sector` | text/varchar | 35201010 |
| `description` | text/varchar | Traditional pharmaceutical companies developing sm... |
| `sub_categories` | array | ['small_molecule', 'specialty_pharma', 'generics',... |
| `example_agents` | array | ['Drug Information Specialist', 'Formulation Scien... |
| `created_at` | text/varchar | 2025-11-08T17:23:44.309996+00:00 |
| `updated_at` | text/varchar | 2025-11-08T17:23:44.309996+00:00 |

**Sample Record:**

```json
{
  "id": "0571859c-25a1-47d6-aac6-8d945bfeed87",
  "unique_id": "ind_pharma",
  "industry_code": "pharmaceuticals",
  "industry_name": "Pharmaceuticals",
  "naics_codes": [
    "325412",
    "325414"
  ],
  "gics_sector": "35201010",
  "description": "Traditional pharmaceutical companies developing small molecule drugs",
  "sub_categories": [
    "small_molecule",
    "specialty_pharma",
    "generics",
    "branded_pharma",
    "otc"
  ],
  "example_agents": [
    "Drug Information Specialist",
    "Formulation Scientist",
    "Regulatory Strategy Advisor"
  ],
  "created_at": "2025-11-08T17:23:44.309996+00:00",
  "updated_at": "2025-11-08T17:23:44.309996+00:00"
}
```

---

### jtbd_library

**Records:** 371

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|
| `id` | text/varchar | jtbd00008 |
| `title` | text/varchar | Strategic Leadership |
| `verb` | text/varchar | align |
| `goal` | text/varchar | achieve outcome |
| `function` | text/varchar | SP01 |
| `category` | text/varchar | Strategic Leadership |
| `description` | text/varchar | Lifecycle planning that aligns Medical Affairs act... |
| `business_value` | unknown (null) | None |
| `complexity` | text/varchar | High |
| `time_to_value` | unknown (null) | None |
| `implementation_cost` | unknown (null) | None |
| `created_at` | text/varchar | 2025-11-09T10:13:40.817591 |
| `updated_at` | text/varchar | 2025-11-09T10:13:41.057222 |
| `is_active` | integer | True |
| `usage_count` | integer | None |
| `success_rate` | numeric | None |
| `avg_execution_time` | unknown (null) | None |
| `tags` | array | ['pain_point', 'pain_point'] |
| `keywords` | unknown (null) | None |
| `workshop_potential` | unknown (null) | None |
| `maturity_level` | unknown (null) | None |
| `industry_id` | unknown (null) | None |
| `org_function_id` | unknown (null) | None |
| `unique_id` | text/varchar | pmc_jtbd00008 |
| `jtbd_code` | text/varchar | JTBD-MA-008 |
| `original_id` | text/varchar | JTBD-MA-008 |
| `statement` | text/varchar | When managing product lifecycle strategy, I want t... |
| `frequency` | text/varchar | Ongoing |
| `importance` | integer | 9 |
| `satisfaction` | integer | 3 |
| `opportunity_score` | unknown (null) | None |
| `success_metrics` | jsonb | {'criteria': ['Evidence readiness 100% at key mile... |
| `source` | text/varchar | Medical Affairs Consolidated Library |
| `persona_context` | unknown (null) | None |
| `frequency_category` | unknown (null) | None |
| `use_case_category` | unknown (null) | None |
| `solution_type` | unknown (null) | None |
| `outcome_type` | unknown (null) | None |
| `priority_tier` | unknown (null) | None |
| `persona_id` | unknown (null) | None |
| `persona_name` | unknown (null) | None |
| `persona_title` | unknown (null) | None |
| `persona_function` | unknown (null) | None |
| `industry_name` | unknown (null) | None |
| `sector` | text/varchar | Multi-sector |
| `metrics_count` | integer | None |
| `has_quantitative_metrics` | integer | None |

**Sample Record:**

```json
{
  "id": "jtbd00008",
  "title": "Strategic Leadership",
  "verb": "align",
  "goal": "achieve outcome",
  "function": "SP01",
  "category": "Strategic Leadership",
  "description": "Lifecycle planning that aligns Medical Affairs activities with product phase including pre-launch, launch, growth, maturity, and LOE management.",
  "business_value": null,
  "complexity": "High",
  "time_to_value": null,
  "implementation_cost": null,
  "created_at": "2025-11-09T10:13:40.817591",
  "updated_at": "2025-11-09T10:13:41.057222",
  "is_active": true,
  "usage_count": 0,
  "success_rate": 0.0,
  "avg_execution_time": null,
  "tags": [
    "pain_point",
    "pain_point"
  ],
  "keywords": null,
  "workshop_potential": null,
  "maturity_level": null,
  "industry_id": null,
  "org_function_id": null,
  "unique_id": "pmc_jtbd00008",
  "jtbd_code": "JTBD-MA-008",
  "original_id": "JTBD-MA-008",
  "statement": "When managing product lifecycle strategy, I want to align evidence generation with product milestones, so Medical Affairs activities support launch, growth, maturity, and lifecycle management phases",
  "frequency": "Ongoing",
  "importance": 9,
  "satisfaction": 3,
  "opportunity_score": null,
  "success_metrics": {
    "criteria": [
      "Evidence readiness 100% at key milestones",
      "Launch preparedness score >90%",
      "Post-launch evidence generated on schedule",
      "Lifecycle extension supported by new data",
      "LOE transition managed proactively"
    ]
  },
  "source": "Medical Affairs Consolidated Library",
  "persona_context": null,
  "frequency_category": null,
  "use_case_category": null,
  "solution_type": null,
  "outcome_type": null,
  "priority_tier": null,
  "persona_id": null,
  "persona_name": null,
  "persona_title": null,
  "persona_function": null,
  "industry_name": null,
  "sector": "Multi-sector",
  "metrics_count": 0,
  "has_quantitative_metrics": false
}
```

---

### knowledge_bases

**Records:** 0

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|

**Sample Record:**

```json
{
  "error": "{'code': '42P01', 'details': None, 'hint': None, 'message': 'relation \"public.knowledge_bases\" does not exist'}"
}
```

---

### organizations

**Records:** 0

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|

---

### permissions

**Records:** 0

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|

**Sample Record:**

```json
{
  "error": "{'code': '42P01', 'details': None, 'hint': None, 'message': 'relation \"public.permissions\" does not exist'}"
}
```

---

### personas

**Records:** 210

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|
| `id` | text/varchar | 0aa9491a-2b1e-4b34-aa5d-716d304c772c |
| `unique_id` | text/varchar | dh_global_pha_maria_gonzalez |
| `name` | text/varchar | Unknown Persona |
| `display_name` | unknown (null) | None |
| `persona_type` | text/varchar | professional |
| `seniority_level` | unknown (null) | None |
| `decision_authority` | unknown (null) | None |
| `description` | unknown (null) | None |
| `short_bio` | unknown (null) | None |
| `tagline` | unknown (null) | None |
| `profile` | jsonb | None |
| `responsibilities` | text/varchar | ["Patient program strategy", "Service design and d... |
| `pain_points` | text/varchar | ["Program fragmentation", "Low patient enrollment"... |
| `goals` | text/varchar | [] |
| `attributes` | jsonb | None |
| `communication_style` | jsonb | None |
| `work_patterns` | jsonb | None |
| `preferences` | jsonb | None |
| `ai_interaction_profile` | jsonb | None |
| `is_active` | integer | True |
| `is_public` | integer | True |
| `is_featured` | integer | None |
| `is_verified` | integer | None |
| `tenant_id` | unknown (null) | None |
| `owner_tenant_id` | unknown (null) | None |
| `created_at` | text/varchar | 2025-11-08T18:56:29.838462+00:00 |
| `updated_at` | text/varchar | 2025-11-08T18:56:29.838462+00:00 |
| `created_by` | unknown (null) | None |
| `updated_by` | unknown (null) | None |
| `deleted_at` | unknown (null) | None |
| `version` | integer | 1 |

**Sample Record:**

```json
{
  "id": "0aa9491a-2b1e-4b34-aa5d-716d304c772c",
  "unique_id": "dh_global_pha_maria_gonzalez",
  "name": "Unknown Persona",
  "display_name": null,
  "persona_type": "professional",
  "seniority_level": null,
  "decision_authority": null,
  "description": null,
  "short_bio": null,
  "tagline": null,
  "profile": {},
  "responsibilities": "[\"Patient program strategy\", \"Service design and delivery\", \"Digital companion development\", \"Adherence optimization\", \"Patient journey mapping\", \"Outcomes measurement\"]",
  "pain_points": "[\"Program fragmentation\", \"Low patient enrollment\", \"Engagement sustainability\", \"ROI demonstration\", \"Channel coordination\", \"Privacy compliance\"]",
  "goals": "[]",
  "attributes": {},
  "communication_style": {},
  "work_patterns": {},
  "preferences": {},
  "ai_interaction_profile": {},
  "is_active": true,
  "is_public": true,
  "is_featured": false,
  "is_verified": false,
  "tenant_id": null,
  "owner_tenant_id": null,
  "created_at": "2025-11-08T18:56:29.838462+00:00",
  "updated_at": "2025-11-08T18:56:29.838462+00:00",
  "created_by": null,
  "updated_by": null,
  "deleted_at": null,
  "version": 1
}
```

---

### prompts

**Records:** 3,570

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|
| `id` | text/varchar | 8ed757f6-a783-41c5-8e8f-22615a6c52b4 |
| `name` | text/varchar | create-factorial-design |
| `display_name` | text/varchar | Create Factorial Design |
| `description` | text/varchar | FORGE - VALIDATE |
| `category` | text/varchar | Creation; Analysis |
| `system_prompt` | text/varchar | # FORGE_VALIDATE_FACTORIAL_DESIGN_EXPERT_v1.0: For... |
| `user_prompt_template` | text/varchar | # FORGE_VALIDATE_FACTORIAL_DESIGN_EXPERT_v1.0: For... |
| `execution_instructions` | jsonb | None |
| `success_criteria` | jsonb | None |
| `model_requirements` | jsonb | {'model': 'gpt-4', 'max_tokens': 2000, 'temperatur... |
| `input_schema` | jsonb | None |
| `output_schema` | jsonb | None |
| `validation_rules` | jsonb | None |
| `complexity_level` | text/varchar | expert |
| `domain` | text/varchar | general |
| `estimated_tokens` | integer | 1000 |
| `prerequisite_prompts` | unknown (null) | None |
| `prerequisite_capabilities` | array | None |
| `related_capabilities` | unknown (null) | None |
| `required_context` | unknown (null) | None |
| `validation_status` | text/varchar | active |
| `accuracy_threshold` | numeric | 0.85 |
| `testing_scenarios` | array | None |
| `hipaa_relevant` | integer | None |
| `phi_handling_rules` | jsonb | None |
| `compliance_tags` | array | None |
| `version` | text/varchar | v1.0 |
| `status` | text/varchar | active |
| `created_at` | text/varchar | 2025-10-29T11:02:40.209885+00:00 |
| `updated_at` | text/varchar | 2025-10-29T11:06:58.286292+00:00 |
| `created_by` | unknown (null) | None |

**Sample Record:**

```json
{
  "id": "8ed757f6-a783-41c5-8e8f-22615a6c52b4",
  "name": "create-factorial-design",
  "display_name": "Create Factorial Design",
  "description": "FORGE - VALIDATE",
  "category": "Creation; Analysis",
  "system_prompt": "# FORGE_VALIDATE_FACTORIAL_DESIGN_EXPERT_v1.0: Forge task \u2014 Factorial\n\n---\n\n## \ud83d\udcdd CONTEXT & BACKGROUND\n\n**Project/Product Information**:\n- **Product Name**: {product_name}\n- **Product Type**: {product_type} [Drug/Device/Biologic/Combination/Digital/Other]\n- **Therapeutic Area**: {therapeutic_area}\n- **Indication**: {indication}\n- **Target Population**: {target_population}\n- **Stage**: {development_stage} [Preclinical/Phase I/II/III/Post-Market/Other]\n\n**Regulatory Context** (if applicable):\n- **Primary Market**: {target_market} [US/EU/Japan/Global/Other]\n- **Regulatory Authority**: {regulatory_authority} [FDA/EMA/PMDA/Health Canada/Other]\n- **Regulatory Pathway**: {regulatory_pathway} [510(k)/PMA/NDA/BLA/MAA/Other]\n- **Device Class** (if applicable): {device_class} [Class I/II/III]\n- **Risk Classification**: {risk_level} [Low/Moderate/High]\n\n**Clinical Context** (if applicable):\n- **Study Phase**: {study_phase} [Phase I/II/III/IV]\n- **Study Design**: {study_design} [RCT/Observational/Real-World/Other]\n- **Sample Size**: {sample_size}\n- **Primary Endpoint**: {primary_endpoint}\n- **Key Secondary Endpoints**: {secondary_endpoints}\n\n**Commercial Context** (if applicable):\n- **Launch Timeline**: {launch_date}\n- **Competitive Landscape**: {competitors}\n- **Pricing Strategy**: {pricing_approach}\n- **Payer Segment**: {payer_type} [Commercial/Medicare/Medicaid/Mixed]\n\n**Operational Context** (if applicable):\n- **Timeline**: {project_timeline}\n- **Budget**: {budget_constraint}\n- **Team Size**: {team_composition}\n- **Key Stakeholders**: {stakeholders}\n\n---\n\n## \ud83c\udfaf SPECIFIC REQUEST\n\n**Primary Objective**:\n[Clear statement of what you need - be specific]\n\n**Specific Questions/Tasks**:\n1. {question_1}\n2. {question_2}\n3. {question_3}\n[Add more as needed]\n\n**Constraints or Special Considerations**:\n- {constraint_1}\n- {constraint_2}\n- {constraint_3}\n\n**Preferred Approach** (optional):\n[Any specific methodologies, frameworks, or approaches you prefer]\n\n---\n\n## \ud83d\udce4 DESIRED OUTPUT\n\n**Please provide the following:**\n\n### 1. **Executive Summary**\n   - Key findings or recommendations (2-3 paragraphs)\n   - Critical action items\n   - Timeline considerations\n   - Risk flags (if any)\n\n### 2. **Detailed Analysis** [Customize based on task type]\n   \n   **For ANALYSIS tasks**:\n   - Situation assessment\n   - Key findings with supporting evidence\n   - Gap analysis (if applicable)\n   - Risk-benefit evaluation\n   - Data interpretation and insights\n   \n   **For CREATION tasks**:\n   - Comprehensive document/strategy/plan\n   - Structured sections with clear organization\n   - Supporting rationale for recommendations\n   - Implementation guidance\n   - Quality checkpoints\n   \n   **For EVALUATION tasks**:\n   - Scoring or rating with criteria\n   - Strengths and weaknesses analysis\n   - Benchmark comparisons\n   - Improvement recommendations\n   - Priority ranking\n   \n   **For PLANNING tasks**:\n   - Strategic roadmap or timeline\n   - Resource requirements\n   - Milestone definitions\n   - Risk mitigation strategies\n   - Success metrics\n   \n   **For COMMUNICATION tasks**:\n   - Stakeholder-appropriate messaging\n   - Key talking points\n   - Anticipated questions and responses\n   - Supporting materials recommendations\n   - Communication timeline\n\n### 3. **Recommendations** [If applicable]\n   - Prioritized recommendations (High/Medium/Low priority)\n   - Rationale for each recommendation\n   - Implementation steps\n   - Success metrics\n   - Timeline estimates\n\n### 4. **Regulatory/Clinical Considerations** [If applicable]\n   - Applicable regulations or guidelines (with citations)\n   - Compliance requirements\n   - Precedent analysis\n   - Regulatory strategy recommendations\n   - Required submissions or filings\n\n### 5. **Risk Assessment & Mitigation** [If applicable]\n   - Identified risks (likelihood x impact)\n   - Risk mitigation strategies\n   - Contingency plans\n   - Escalation triggers\n   - Monitoring requirements\n\n### 6. **Implementation Guidance**\n   - Step-by-step action plan\n   - Resource requirements (people, budget, time)\n   - Dependencies and prerequisites\n   - Timeline with milestones\n   - Success criteria and KPIs\n\n### 7. **References & Citations**\n   - Regulatory citations [21 CFR \u00a7XXX, ICH guidelines]\n   - Clinical guidelines and literature\n   - Industry precedents\n   - Relevant case studies or examples\n   - Additional resources for deep-dive\n\n---\n\n## \u2699\ufe0f OUTPUT SPECIFICATIONS\n\n**Format**:\n- [ ] Structured markdown with clear sections\n- [ ] Executive summary at top\n- [ ] Numbered recommendations\n- [ ] Tables for comparisons (if applicable)\n- [ ] Bullet points for lists\n- [ ] Bold for critical information\n\n**Length**: \n- {desired_length} [e.g., \"2-3 pages\", \"Comprehensive\", \"Concise summary\"]\n\n**Technical Level**:\n- EXPERT [BASIC/INTERMEDIATE/ADVANCED/EXPERT based on template complexity]\n\n**Tone**:\n- [ ] Professional and formal\n- [ ] Evidence-based and objective\n- [ ] Action-oriented\n- [ ] Clear and unambiguous\n\n**Critical Requirements**:\n- \u2713 All recommendations must be evidence-based with citations\n- \u2713 Regulatory compliance must be ensured\n- \u2713 Patient safety must be prioritized\n- \u2713 Uncertainties must be clearly stated\n- \u2713 Limitations must be acknowledged\n\n---\n\n## \ud83d\udea8 IMPORTANT NOTES\n\n**What I Need Most**:\n[Highlight the single most important aspect of the output]\n\n**Deadline Considerations**:\n[Any time-sensitive aspects]\n\n**Known Constraints**:\n[Any limitations, resource constraints, or special circumstances]\n\n**Follow-up Plans**:\n[How this output will be used, next steps, or additional analyses planned]\n",
  "user_prompt_template": "# FORGE_VALIDATE_FACTORIAL_DESIGN_EXPERT_v1.0: Forge task \u2014 Factorial\n\n---\n\n## \ud83d\udcdd CONTEXT & BACKGROUND\n\n**Project/Product Information**:\n- **Product Name**: {product_name}\n- **Product Type**: {product_type} [Drug/Device/Biologic/Combination/Digital/Other]\n- **Therapeutic Area**: {therapeutic_area}\n- **Indication**: {indication}\n- **Target Population**: {target_population}\n- **Stage**: {development_stage} [Preclinical/Phase I/II/III/Post-Market/Other]\n\n**Regulatory Context** (if applicable):\n- **Primary Market**: {target_market} [US/EU/Japan/Global/Other]\n- **Regulatory Authority**: {regulatory_authority} [FDA/EMA/PMDA/Health Canada/Other]\n- **Regulatory Pathway**: {regulatory_pathway} [510(k)/PMA/NDA/BLA/MAA/Other]\n- **Device Class** (if applicable): {device_class} [Class I/II/III]\n- **Risk Classification**: {risk_level} [Low/Moderate/High]\n\n**Clinical Context** (if applicable):\n- **Study Phase**: {study_phase} [Phase I/II/III/IV]\n- **Study Design**: {study_design} [RCT/Observational/Real-World/Other]\n- **Sample Size**: {sample_size}\n- **Primary Endpoint**: {primary_endpoint}\n- **Key Secondary Endpoints**: {secondary_endpoints}\n\n**Commercial Context** (if applicable):\n- **Launch Timeline**: {launch_date}\n- **Competitive Landscape**: {competitors}\n- **Pricing Strategy**: {pricing_approach}\n- **Payer Segment**: {payer_type} [Commercial/Medicare/Medicaid/Mixed]\n\n**Operational Context** (if applicable):\n- **Timeline**: {project_timeline}\n- **Budget**: {budget_constraint}\n- **Team Size**: {team_composition}\n- **Key Stakeholders**: {stakeholders}\n\n---\n\n## \ud83c\udfaf SPECIFIC REQUEST\n\n**Primary Objective**:\n[Clear statement of what you need - be specific]\n\n**Specific Questions/Tasks**:\n1. {question_1}\n2. {question_2}\n3. {question_3}\n[Add more as needed]\n\n**Constraints or Special Considerations**:\n- {constraint_1}\n- {constraint_2}\n- {constraint_3}\n\n**Preferred Approach** (optional):\n[Any specific methodologies, frameworks, or approaches you prefer]\n\n---\n\n## \ud83d\udce4 DESIRED OUTPUT\n\n**Please provide the following:**\n\n### 1. **Executive Summary**\n   - Key findings or recommendations (2-3 paragraphs)\n   - Critical action items\n   - Timeline considerations\n   - Risk flags (if any)\n\n### 2. **Detailed Analysis** [Customize based on task type]\n   \n   **For ANALYSIS tasks**:\n   - Situation assessment\n   - Key findings with supporting evidence\n   - Gap analysis (if applicable)\n   - Risk-benefit evaluation\n   - Data interpretation and insights\n   \n   **For CREATION tasks**:\n   - Comprehensive document/strategy/plan\n   - Structured sections with clear organization\n   - Supporting rationale for recommendations\n   - Implementation guidance\n   - Quality checkpoints\n   \n   **For EVALUATION tasks**:\n   - Scoring or rating with criteria\n   - Strengths and weaknesses analysis\n   - Benchmark comparisons\n   - Improvement recommendations\n   - Priority ranking\n   \n   **For PLANNING tasks**:\n   - Strategic roadmap or timeline\n   - Resource requirements\n   - Milestone definitions\n   - Risk mitigation strategies\n   - Success metrics\n   \n   **For COMMUNICATION tasks**:\n   - Stakeholder-appropriate messaging\n   - Key talking points\n   - Anticipated questions and responses\n   - Supporting materials recommendations\n   - Communication timeline\n\n### 3. **Recommendations** [If applicable]\n   - Prioritized recommendations (High/Medium/Low priority)\n   - Rationale for each recommendation\n   - Implementation steps\n   - Success metrics\n   - Timeline estimates\n\n### 4. **Regulatory/Clinical Considerations** [If applicable]\n   - Applicable regulations or guidelines (with citations)\n   - Compliance requirements\n   - Precedent analysis\n   - Regulatory strategy recommendations\n   - Required submissions or filings\n\n### 5. **Risk Assessment & Mitigation** [If applicable]\n   - Identified risks (likelihood x impact)\n   - Risk mitigation strategies\n   - Contingency plans\n   - Escalation triggers\n   - Monitoring requirements\n\n### 6. **Implementation Guidance**\n   - Step-by-step action plan\n   - Resource requirements (people, budget, time)\n   - Dependencies and prerequisites\n   - Timeline with milestones\n   - Success criteria and KPIs\n\n### 7. **References & Citations**\n   - Regulatory citations [21 CFR \u00a7XXX, ICH guidelines]\n   - Clinical guidelines and literature\n   - Industry precedents\n   - Relevant case studies or examples\n   - Additional resources for deep-dive\n\n---\n\n## \u2699\ufe0f OUTPUT SPECIFICATIONS\n\n**Format**:\n- [ ] Structured markdown with clear sections\n- [ ] Executive summary at top\n- [ ] Numbered recommendations\n- [ ] Tables for comparisons (if applicable)\n- [ ] Bullet points for lists\n- [ ] Bold for critical information\n\n**Length**: \n- {desired_length} [e.g., \"2-3 pages\", \"Comprehensive\", \"Concise summary\"]\n\n**Technical Level**:\n- EXPERT [BASIC/INTERMEDIATE/ADVANCED/EXPERT based on template complexity]\n\n**Tone**:\n- [ ] Professional and formal\n- [ ] Evidence-based and objective\n- [ ] Action-oriented\n- [ ] Clear and unambiguous\n\n**Critical Requirements**:\n- \u2713 All recommendations must be evidence-based with citations\n- \u2713 Regulatory compliance must be ensured\n- \u2713 Patient safety must be prioritized\n- \u2713 Uncertainties must be clearly stated\n- \u2713 Limitations must be acknowledged\n\n---\n\n## \ud83d\udea8 IMPORTANT NOTES\n\n**What I Need Most**:\n[Highlight the single most important aspect of the output]\n\n**Deadline Considerations**:\n[Any time-sensitive aspects]\n\n**Known Constraints**:\n[Any limitations, resource constraints, or special circumstances]\n\n**Follow-up Plans**:\n[How this output will be used, next steps, or additional analyses planned]\n",
  "execution_instructions": {},
  "success_criteria": {},
  "model_requirements": {
    "model": "gpt-4",
    "max_tokens": 2000,
    "temperature": 0.7
  },
  "input_schema": {},
  "output_schema": {},
  "validation_rules": {},
  "complexity_level": "expert",
  "domain": "general",
  "estimated_tokens": 1000,
  "prerequisite_prompts": null,
  "prerequisite_capabilities": [],
  "related_capabilities": null,
  "required_context": null,
  "validation_status": "active",
  "accuracy_threshold": 0.85,
  "testing_scenarios": [],
  "hipaa_relevant": false,
  "phi_handling_rules": {},
  "compliance_tags": [],
  "version": "v1.0",
  "status": "active",
  "created_at": "2025-10-29T11:02:40.209885+00:00",
  "updated_at": "2025-10-29T11:06:58.286292+00:00",
  "created_by": null
}
```

---

### rag_domains

**Records:** 0

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|

**Sample Record:**

```json
{
  "error": "{'code': '42P01', 'details': None, 'hint': None, 'message': 'relation \"public.rag_domains\" does not exist'}"
}
```

---

### roles

**Records:** 0

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|

---

### strategic_imperatives

**Records:** 0

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|

**Sample Record:**

```json
{
  "error": "{'code': '42P01', 'details': None, 'hint': None, 'message': 'relation \"public.strategic_imperatives\" does not exist'}"
}
```

---

### strategic_priorities

**Records:** 0

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|

**Sample Record:**

```json
{
  "error": "{'code': '42P01', 'details': None, 'hint': None, 'message': 'relation \"public.strategic_priorities\" does not exist'}"
}
```

---

### task_executions

**Records:** 0

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|

**Sample Record:**

```json
{
  "error": "{'code': '42P01', 'details': None, 'hint': None, 'message': 'relation \"public.task_executions\" does not exist'}"
}
```

---

### tasks

**Records:** 0

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|

**Sample Record:**

```json
{
  "error": "{'code': '42P01', 'details': None, 'hint': None, 'message': 'relation \"public.tasks\" does not exist'}"
}
```

---

### teams

**Records:** 0

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|

**Sample Record:**

```json
{
  "error": "{'code': '42P01', 'details': None, 'hint': None, 'message': 'relation \"public.teams\" does not exist'}"
}
```

---

### tools

**Records:** 0

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|

**Sample Record:**

```json
{
  "error": "{'code': '42P01', 'details': None, 'hint': None, 'message': 'relation \"public.tools\" does not exist'}"
}
```

---

### use_cases

**Records:** 0

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|

**Sample Record:**

```json
{
  "error": "{'code': '42P01', 'details': None, 'hint': None, 'message': 'relation \"public.use_cases\" does not exist'}"
}
```

---

### user_profiles

**Records:** 9

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|
| `id` | text/varchar | 71f6aedd-af8e-4866-90a7-39ed69d35cde |
| `email` | text/varchar | user@vitalexpert.com |
| `full_name` | text/varchar | Test User |
| `avatar_url` | unknown (null) | None |
| `organization_id` | unknown (null) | None |
| `role` | text/varchar | user |
| `job_title` | unknown (null) | None |
| `department` | unknown (null) | None |
| `preferences` | jsonb | None |
| `created_at` | text/varchar | 2025-10-08T11:20:45.627218+00:00 |
| `updated_at` | text/varchar | 2025-11-06T17:14:51.85346+00:00 |
| `user_id` | text/varchar | 71f6aedd-af8e-4866-90a7-39ed69d35cde |
| `is_active` | integer | True |
| `last_login` | unknown (null) | None |
| `created_by` | unknown (null) | None |
| `updated_by` | unknown (null) | None |

**Sample Record:**

```json
{
  "id": "71f6aedd-af8e-4866-90a7-39ed69d35cde",
  "email": "user@vitalexpert.com",
  "full_name": "Test User",
  "avatar_url": null,
  "organization_id": null,
  "role": "user",
  "job_title": null,
  "department": null,
  "preferences": {},
  "created_at": "2025-10-08T11:20:45.627218+00:00",
  "updated_at": "2025-11-06T17:14:51.85346+00:00",
  "user_id": "71f6aedd-af8e-4866-90a7-39ed69d35cde",
  "is_active": true,
  "last_login": null,
  "created_by": null,
  "updated_by": null
}
```

---

### users

**Records:** 0

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|

**Sample Record:**

```json
{
  "error": "{'code': '42P01', 'details': None, 'hint': None, 'message': 'relation \"public.users\" does not exist'}"
}
```

---

### workflow_executions

**Records:** 0

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|

**Sample Record:**

```json
{
  "error": "{'code': '42P01', 'details': None, 'hint': None, 'message': 'relation \"public.workflow_executions\" does not exist'}"
}
```

---

### workflows

**Records:** 141

**Columns:**

| Column Name | Type | Sample Value |
|-------------|------|-------------|
| `id` | text/varchar | badc72c6-f481-4381-a1f6-4e62ccdd8584 |
| `name` | text/varchar | Annual Strategic Planning Process |
| `description` | text/varchar | Annual Strategic Planning Process for JTBD-MA-001 ... |
| `definition` | jsonb | {'phases': [{'tasks': [{'owner': 'Medical Director... |
| `status` | text/varchar | active |
| `created_by` | unknown (null) | None |
| `organization_id` | unknown (null) | None |
| `is_public` | integer | True |
| `created_at` | text/varchar | 2025-11-09T10:54:07.268443+00:00 |
| `updated_at` | text/varchar | 2025-11-09T10:54:07.268444+00:00 |

**Sample Record:**

```json
{
  "id": "badc72c6-f481-4381-a1f6-4e62ccdd8584",
  "name": "Annual Strategic Planning Process",
  "description": "Annual Strategic Planning Process for JTBD-MA-001 (4\u20136 weeks, 4 phases, 16 tasks)",
  "definition": {
    "phases": [
      {
        "tasks": [
          {
            "owner": "Medical Director",
            "tools": [
              "Evidence tracking system",
              "Publication database",
              "Clinical trial registry"
            ],
            "outputs": [
              "Evidence inventory spreadsheet"
            ],
            "task_id": "T001",
            "duration": "4 hours",
            "task_name": "Review current evidence portfolio"
          },
          {
            "owner": "Medical Director",
            "tools": [
              "Gap analysis framework",
              "PICO framework"
            ],
            "outputs": [
              "Evidence gap prioritization matrix"
            ],
            "task_id": "T002",
            "duration": "3 hours",
            "task_name": "Identify critical evidence gaps"
          },
          {
            "owner": "Competitive Intelligence Manager",
            "tools": [
              "Competitive intelligence DB",
              "ClinicalTrials.gov",
              "PubMed"
            ],
            "outputs": [
              "Competitor evidence comparison"
            ],
            "task_id": "T003",
            "duration": "4 hours",
            "task_name": "Benchmark competitor evidence"
          },
          {
            "owner": "Market Access Director",
            "tools": [
              "Payer policy DB",
              "HTA guidance docs"
            ],
            "outputs": [
              "HTA landscape analysis",
              "Payer evidence requirements matrix"
            ],
            "task_id": "T004",
            "duration": "3 hours",
            "task_name": "Assess regulatory & payer requirements"
          }
        ],
        "duration": "1 week",
        "phase_name": "Evidence Gap Analysis",
        "phase_number": 1
      },
      {
        "tasks": [
          {
            "owner": "Medical Director",
            "tools": [
              "Virtual meeting platform",
              "Ad board materials"
            ],
            "outputs": [
              "KOL strategic recommendations"
            ],
            "task_id": "T005",
            "duration": "4 hours",
            "task_name": "Conduct KOL advisory board"
          },
          {
            "owner": "Regional Medical Director",
            "tools": [
              "Survey tool",
              "CRM insights DB"
            ],
            "outputs": [
              "Field insights report"
            ],
            "task_id": "T006",
            "duration": "2 hours",
            "task_name": "Survey MSL field insights"
          },
          {
            "owner": "Market Access Director",
            "tools": [
              "Interview guide",
              "Payer relationship DB"
            ],
            "outputs": [
              "Payer needs assessment"
            ],
            "task_id": "T007",
            "duration": "6 hours",
            "task_name": "Interview payer stakeholders"
          },
          {
            "owner": "VP Medical Affairs",
            "tools": [
              "Collaboration suite",
              "Workshops"
            ],
            "outputs": [
              "Cross-functional requirements"
            ],
            "task_id": "T008",
            "duration": "4 hours",
            "task_name": "Gather cross-functional input"
          }
        ],
        "duration": "1 week",
        "phase_name": "Stakeholder Input Collection",
        "phase_number": 2
      },
      {
        "tasks": [
          {
            "owner": "VP Medical Affairs",
            "tools": [
              "Strategy canvas",
              "OKR framework"
            ],
            "outputs": [
              "Strategic objectives (5\u20137)"
            ],
            "task_id": "T009",
            "duration": "8 hours",
            "task_name": "Define strategic objectives"
          },
          {
            "owner": "Medical Director",
            "tools": [
              "Roadmap template",
              "Project planning tool"
            ],
            "outputs": [
              "3-year evidence roadmap",
              "Study prioritization matrix"
            ],
            "task_id": "T010",
            "duration": "12 hours",
            "task_name": "Develop evidence generation roadmap"
          },
          {
            "owner": "Medical Affairs Operations",
            "tools": [
              "Financial planning tool",
              "Resource mgmt"
            ],
            "outputs": [
              "Resource allocation by initiative",
              "Budget model"
            ],
            "task_id": "T011",
            "duration": "8 hours",
            "task_name": "Create resource allocation model"
          },
          {
            "owner": "Head of Talent Development",
            "tools": [
              "Competency framework",
              "LMS"
            ],
            "outputs": [
              "Capabilities assessment",
              "Training roadmap"
            ],
            "task_id": "T012",
            "duration": "6 hours",
            "task_name": "Design capability plan"
          }
        ],
        "duration": "2 weeks",
        "phase_name": "Strategic Framework Development",
        "phase_number": 3
      },
      {
        "tasks": [
          {
            "owner": "VP Medical Affairs",
            "tools": [
              "Presentation deck",
              "Financial models"
            ],
            "outputs": [
              "Leadership approval",
              "Executive feedback"
            ],
            "task_id": "T013",
            "duration": "2 hours",
            "task_name": "Present to executive leadership"
          },
          {
            "owner": "VP Medical Affairs",
            "tools": [
              "Comms platform",
              "Video conferencing"
            ],
            "outputs": [
              "Town hall",
              "Strategy one-pager"
            ],
            "task_id": "T014",
            "duration": "4 hours",
            "task_name": "Cascade to organization"
          },
          {
            "owner": "Medical Affairs Operations",
            "tools": [
              "BI platform",
              "Performance mgmt"
            ],
            "outputs": [
              "KPI dashboard",
              "Tracking protocols"
            ],
            "task_id": "T015",
            "duration": "4 hours",
            "task_name": "Establish KPIs & tracking"
          },
          {
            "owner": "Program Manager",
            "tools": [
              "Project mgmt software",
              "Gantt charts"
            ],
            "outputs": [
              "Implementation roadmap",
              "Milestone tracker"
            ],
            "task_id": "T016",
            "duration": "4 hours",
            "task_name": "Create implementation timeline"
          }
        ],
        "duration": "2 weeks",
        "phase_name": "Validation & Finalization",
        "phase_number": 4
      }
    ],
    "source": "SP01 Operational Library",
    "jtbd_id": "JTBD-MA-001",
    "duration": "4\u20136 weeks",
    "task_count": 16,
    "imported_at": "2025-11-09T10:54:07.268432+00:00",
    "phase_count": 4,
    "workflow_id": "WF-001-A",
    "total_effort": "120\u2013160 hours",
    "workflow_name": "Annual Strategic Planning Process"
  },
  "status": "active",
  "created_by": null,
  "organization_id": null,
  "is_public": true,
  "created_at": "2025-11-09T10:54:07.268443+00:00",
  "updated_at": "2025-11-09T10:54:07.268444+00:00"
}
```

---

