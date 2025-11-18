# Gold-Standard Database Structure Blueprint

**VITAL.expert Platform - Complete Database Architecture**
**Review this BEFORE we create anything**

---

## High-Level Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    MULTI-TENANCY LAYER                          │
│  ┌──────────┐      ┌────────────────┐      ┌──────────────┐   │
│  │ tenants  │──────│ tenant_members │──────│user_profiles │   │
│  └──────────┘      └────────────────┘      └──────────────┘   │
│         │                                                       │
│         │ (tenant_id on ALL tables below)                      │
└─────────┼───────────────────────────────────────────────────────┘
          │
┌─────────┴─────────────────────────────────────────────────────┐
│                   ORGANIZATIONAL HIERARCHY                      │
│  ┌────────────┐                                                │
│  │ industries │                                                │
│  └─────┬──────┘                                                │
│        │                                                       │
│  ┌─────▼──────────┐     ┌────────────────┐                   │
│  │ org_functions  │─────│ org_departments│                   │
│  └────────┬───────┘     └────────┬───────┘                   │
│           │                      │                            │
│  ┌────────▼──────┐     ┌─────────▼────────┐                 │
│  │   org_roles   │─────│ org_responsibilities│               │
│  └───────────────┘     └──────────────────┘                  │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                      OUTCOME HIERARCHY                         │
│  ┌─────────┐                                                  │
│  │ domains │                                                  │
│  └────┬────┘                                                  │
│       │                                                       │
│  ┌────▼─────────┐                                            │
│  │capabilities  │                                            │
│  └────┬─────────┘                                            │
│       │                                                       │
│  ┌────▼────────────┐        ┌─────────┐                     │
│  │jobs_to_be_done  │────────│personas │                     │
│  └────┬────────────┘        └─────────┘                     │
│       │                                                       │
│  ┌────▼──────┐                                               │
│  │ workflows │                                               │
│  └────┬──────┘                                               │
│       │                                                       │
│  ┌────▼─────┐                                                │
│  │  tasks   │                                                │
│  └────┬─────┘                                                │
│       │                                                       │
│  ┌────▼─────┐                                                │
│  │  steps   │                                                │
│  └──────────┘                                                │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                      AI AGENTS ECOSYSTEM                       │
│  ┌────────┐                                                   │
│  │ agents │                                                   │
│  └────┬───┘                                                   │
│       │                                                       │
│  ┌────▼──────────────┬──────────────┬──────────────┐        │
│  │                   │              │              │         │
│  ▼                   ▼              ▼              ▼         │
│  agent_prompts  agent_tools  agent_knowledge  agent_skills   │
│  │                   │              │              │         │
│  ▼                   ▼              ▼              ▼         │
│  prompts          tools    knowledge_sources   skills        │
│                                     │                         │
│                              ┌──────▼──────┐                 │
│                              │knowledge_    │                 │
│                              │  chunks      │                 │
│                              │(RAG vectors) │                 │
│                              └──────────────┘                 │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                       CONVERSATIONS                            │
│  ┌──────────────────────┐                                     │
│  │expert_consultations  │                                     │
│  └──────────┬───────────┘                                     │
│             │                                                  │
│  ┌──────────▼────────────┐                                    │
│  │  expert_messages      │                                    │
│  └───────────────────────┘                                    │
│                                                               │
│  ┌──────────────────────┐                                     │
│  │ panel_discussions    │                                     │
│  └──────────┬───────────┘                                     │
│             │                                                  │
│  ┌──────────▼──────────┬─────────────┬───────────────┐       │
│  │                     │             │               │        │
│  ▼                     ▼             ▼               ▼        │
│  panel_members  panel_messages  panel_rounds  panel_consensus│
│                                                      │        │
│                                              ┌───────▼──────┐ │
│                                              │ panel_votes  │ │
│                                              └──────────────┘ │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                    WORKFLOW EXECUTION                          │
│  ┌─────────────────────┐                                      │
│  │ workflow_executions │                                      │
│  └──────────┬──────────┘                                      │
│             │                                                  │
│  ┌──────────▼──────────┬────────────────┐                    │
│  │                     │                │                     │
│  ▼                     ▼                ▼                     │
│  workflow_steps  workflow_approvals  workflow_logs           │
│                                                               │
│  ┌──────────────┐                                            │
│  │ deliverables │                                            │
│  └──────────────┘                                            │
└───────────────────────────────────────────────────────────────┘
```

---

## Complete Table List (54 Tables)

### 🏢 Multi-Tenancy & Auth (4 tables)
1. **tenants** - Multi-tenant organizations
2. **tenant_members** - User memberships with roles
3. **user_profiles** - Extended user data (links to auth.users)
4. **api_keys** - Programmatic access keys

### 🗂️ Organizational Hierarchy (8 tables)
5. **industries** - Industry classifications (Pharma, Biotech, Digital Health)
6. **org_functions** - Functional areas (Medical Affairs, Commercial, Market Access)
7. **org_departments** - Department structure
8. **org_roles** - Role definitions
9. **org_responsibilities** - Responsibility definitions
10. **function_departments** - Junction: function ↔ department
11. **function_roles** - Junction: function ↔ role
12. **department_roles** - Junction: department ↔ role

### 🎯 Outcome Hierarchy (5 tables)
13. **domains** - Top-level business domains
14. **capabilities** - Platform capabilities
15. **strategic_priorities** - Business objectives
16. **capability_jtbd_mapping** - Junction: capability ↔ JTBD
17. **solution_industry_matrix** - Junction: solution ↔ industry

### 👥 Personas & JTBDs (3 tables)
18. **personas** - Professional roles (335 records)
19. **jobs_to_be_done** - Core JTBD library (338 records)
20. **jtbd_personas** - Junction: JTBD ↔ persona with relevance scoring

### 🤖 AI Agents (5 tables)
21. **agents** - AI consultants (254 to import)
22. **agent_skills** - Junction: agent ↔ skill
23. **agent_tools** - Junction: agent ↔ tool
24. **agent_prompts** - Junction: agent ↔ prompt
25. **agent_knowledge** - Junction: agent ↔ knowledge
26. **agent_industries** - Junction: agent ↔ industry

### 📝 Content Library (6 tables)
27. **prompts** - Prompt library (7 role types)
28. **tools** - Integration tools
29. **knowledge_sources** - Knowledge base entries
30. **knowledge_chunks** - RAG chunks with vector embeddings
31. **skills** - Skill definitions
32. **templates** - Reusable templates

### 🔄 Workflows & Tasks (7 tables)
33. **workflows** - Multi-step processes
34. **tasks** - Workflow tasks
35. **steps** - Task steps (atomic actions)
36. **workflow_step_definitions** - Step definitions
37. **workflow_step_connections** - Step flow connections
38. **workflow_tasks** - Junction: workflow ↔ task
39. **task_agents** - Junction: task ↔ agent
40. **task_tools** - Junction: task ↔ tool

### 💬 Conversations (9 tables)
41. **expert_consultations** - 1:1 agent conversations
42. **expert_messages** - Consultation messages
43. **consultation_sessions** - Session tracking
44. **panel_discussions** - Multi-agent panel discussions
45. **panel_members** - Panel membership
46. **panel_messages** - Panel messages
47. **panel_rounds** - Discussion rounds
48. **panel_consensus** - Consensus tracking
49. **panel_votes** - Vote records

### 🎁 Solutions & Marketplace (7 tables)
50. **solutions** - Packaged solutions
51. **solution_agents** - Junction: solution ↔ agent
52. **solution_workflows** - Junction: solution ↔ workflow
53. **solution_prompts** - Junction: solution ↔ prompt
54. **solution_templates** - Junction: solution ↔ template
55. **solution_knowledge** - Junction: solution ↔ knowledge
56. **solution_installations** - Solution usage tracking

### 📊 Workflow Execution (4 tables)
57. **workflow_executions** - Workflow runtime instances
58. **workflow_steps** - Step execution tracking
59. **workflow_approvals** - Approval tracking
60. **workflow_logs** - Execution logs
61. **deliverables** - Output tracking

### 📈 Feedback & Voting (3 tables)
62. **consultation_feedback** - User feedback
63. **votes** - Voting instances
64. **vote_records** - Individual votes

### 🔍 Audit & Compliance (3 tables)
65. **audit_log** - Complete audit trail (7-year retention)
66. **service_role_audit** - Service-level actions
67. **data_retention_policies** - Compliance rules

**Total: 67 tables**

---

## ENUM Types (17 types)

```sql
-- Agent-related
agent_status: development, testing, active, maintenance, deprecated, archived
agent_type: specialist, orchestrator, synthesizer, validator, facilitator, analyst, researcher, strategist
validation_status: pending, in_review, approved, rejected, requires_update
domain_expertise: medical, regulatory, legal, financial, business, technical, commercial, market_access, clinical, manufacturing, quality, research, general
data_classification: public, internal, confidential, restricted, phi

-- JTBD-related
functional_area_type: Commercial, Medical Affairs, Market Access, Clinical, Regulatory, R&D, Manufacturing, Quality, Operations, IT/Digital, Legal, Finance, HR, Business Development
job_category_type: strategic, operational, tactical, administrative, analytical, collaborative, creative, technical
frequency_type: daily, weekly, monthly, quarterly, yearly, as_needed
complexity_type: simple, moderate, complex, expert
decision_type: routine, tactical, strategic, critical
jtbd_status: draft, active, deprecated, archived

-- Tenant-related
tenant_status: trial, active, suspended, cancelled, churned
tenant_tier: free, starter, professional, enterprise
tenant_role: owner, admin, manager, member, guest, viewer

-- Content-related
prompt_role_type: system, context, instruction, example, panel_orchestration, analysis, synthesis
visibility_level: private, tenant, subtenant, organization, public

-- Conversation-related
conversation_mode: expert_consultation, panel_discussion, ask_panel
message_role: user, assistant, system, agent, panel_moderator
