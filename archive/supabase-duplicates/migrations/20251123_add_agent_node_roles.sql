-- ============================================================================
-- Migration: Add Agent Node Roles
-- Date: 2025-11-23
-- Purpose: Enable specialized node behavior (planner, executor, critic, etc.)
-- Priority: HIGH
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Drop existing table if it exists (clean migration)
-- ============================================================================

DROP TABLE IF EXISTS public.agent_node_roles CASCADE;

-- ============================================================================
-- 2. Agent Node Roles Table
-- ============================================================================

CREATE TABLE public.agent_node_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Role metadata
  role_name TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('orchestration', 'execution', 'validation', 'routing')),
  
  -- Implementation reference
  implementation_class TEXT, -- e.g., 'TreeOfThoughtsPlanner', 'ReActExecutor'
  default_config JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. Add role_id to agent_graph_nodes
-- ============================================================================

ALTER TABLE public.agent_graph_nodes 
  ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.agent_node_roles(id) ON DELETE SET NULL;

-- ============================================================================
-- 4. Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_agent_node_roles_name ON public.agent_node_roles(role_name);
CREATE INDEX IF NOT EXISTS idx_agent_node_roles_category ON public.agent_node_roles(category);
CREATE INDEX IF NOT EXISTS idx_agent_graph_nodes_role ON public.agent_graph_nodes(role_id);

-- ============================================================================
-- 5. Seed Standard Roles
-- ============================================================================

INSERT INTO public.agent_node_roles (role_name, description, category, implementation_class, default_config) VALUES
  -- Orchestration roles
  ('planner', 'Plans tasks using Tree-of-Thoughts or decomposition strategies', 'orchestration', 'TreeOfThoughtsPlanner', 
   '{"max_branches": 5, "depth_limit": 3, "exploration_strategy": "best_first"}'),
  
  ('supervisor', 'Supervises sub-agents and synthesizes results', 'orchestration', 'SupervisorAgent',
   '{"delegation_strategy": "capability_based", "synthesis_method": "weighted_consensus"}'),
  
  ('coordinator', 'Coordinates parallel agent execution', 'orchestration', 'ParallelCoordinator',
   '{"max_parallel": 5, "timeout_seconds": 60}'),
  
  -- Execution roles
  ('executor', 'Executes tasks using ReAct or chain-of-thought', 'execution', 'ReActExecutor',
   '{"max_iterations": 10, "reflection_enabled": true}'),
  
  ('specialist', 'Specialized domain expert agent', 'execution', 'SpecialistAgent',
   '{"domain_focus": true, "use_domain_rag": true}'),
  
  ('tool_user', 'Specialized tool execution node', 'execution', 'ToolExecutor',
   '{"parallel_tools": false, "error_handling": "retry_with_fallback"}'),
  
  -- Validation roles
  ('critic', 'Critiques outputs using Constitutional AI', 'validation', 'ConstitutionalCritic',
   '{"constitution": "default", "critique_depth": "thorough", "auto_revise": false}'),
  
  ('validator', 'Validates outputs against rules and constraints', 'validation', 'RuleValidator',
   '{"validation_mode": "strict", "fail_fast": false}'),
  
  ('fact_checker', 'Checks factual accuracy using knowledge sources', 'validation', 'FactChecker',
   '{"confidence_threshold": 0.8, "sources": ["rag", "external_api"]}'),
  
  ('safety_guard', 'Enforces safety constraints and policies', 'validation', 'SafetyGuard',
   '{"policy_mode": "strict", "escalate_on_violation": true}'),
  
  -- Routing roles
  ('router', 'Routes to next node based on conditions', 'routing', 'ConditionalRouter',
   '{"routing_strategy": "rule_based", "default_route": "end"}'),
  
  ('classifier', 'Classifies inputs for routing decisions', 'routing', 'InputClassifier',
   '{"classification_method": "llm", "confidence_threshold": 0.7}'),
  
  ('arbiter', 'Arbitrates between conflicting agent outputs', 'routing', 'PanelArbiter',
   '{"arbitration_method": "weighted_vote", "tie_breaker": "expert_panel"}')
  
ON CONFLICT (role_name) DO NOTHING;

-- ============================================================================
-- 6. Comments
-- ============================================================================

COMMENT ON TABLE public.agent_node_roles IS 'Defines specialized roles for agent graph nodes';
COMMENT ON COLUMN public.agent_node_roles.implementation_class IS 'Python class that implements this role';
COMMENT ON COLUMN public.agent_node_roles.default_config IS 'Default configuration for this role type';
COMMENT ON COLUMN public.agent_graph_nodes.role_id IS 'Specialized role for this node (planner, executor, critic, etc.)';

COMMIT;

-- Verification
SELECT 'agent_node_roles' AS table_name, COUNT(*) AS row_count FROM public.agent_node_roles
UNION ALL
SELECT 'agent_graph_nodes with role', COUNT(*) FROM public.agent_graph_nodes WHERE role_id IS NOT NULL;


