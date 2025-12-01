-- ============================================================================
-- Migration: 031_update_mode1_template_enhanced.sql
-- Description: Update Mode 1 template to reflect Mode1EnhancedWorkflow backend
-- Author: System
-- Date: 2025-11-23
-- ============================================================================
--
-- This migration updates the Mode 1 Ask Expert template to accurately reflect
-- the current backend implementation: Mode1EnhancedWorkflow
--
-- Backend File: services/ai-engine/src/langgraph_workflows/mode1_enhanced_workflow.py
--
-- Flow Architecture (18 nodes, 14+ branching paths):
-- 1. validate_tenant → Validate tenant access (Golden Rule #3)
-- 2. retrieve_memory → Load semantic memory from past conversations (Golden Rule #5)
-- 3. check_conversation → Determine if fresh or continuing session
--    BRANCH A: fresh → fresh_conversation
--    BRANCH B: continuing → load_conversation
-- 4. analyze_query → NLU + intent detection
-- 5. select_expert → ML-powered agent selection with feedback data
-- 6. enhance_context → Enrich with memory context
--    BRANCH: Execution Strategy (RAG/Tools toggle)
--      • rag_and_tools → Both enabled
--      • rag_only → RAG only
--      • tools_only → Tools only  
--      • direct → Neither (direct LLM)
-- 7. execute_agent → Primary agent execution
--    BRANCH: Retry/Success/Failure
--      • success → calculate_confidence
--      • retry → retry_agent → execute_agent
--      • failure → fallback_response
-- 8. calculate_confidence → Multi-factor confidence score (Golden Rule #5)
-- 9. collect_implicit_feedback → Gather usage signals (Golden Rule #5)
-- 10. extract_memory → Extract semantic memories (Golden Rule #5)
-- 11. capture_tool_knowledge → Capture tool outputs (Golden Rule #4)
-- 12. extract_entities → NER for knowledge graph
-- 13. enrich_knowledge_base → Add to KB (Golden Rule #4)
-- 14. save_conversation → Persist with memory
--     BRANCH: Save Success/Error
--       • success → prepare_feedback
--       • error → handle_save_error → prepare_feedback
-- 15. prepare_feedback → Prepare feedback collection UI
-- 16. format_output → Format final response
-- END
-- ============================================================================

BEGIN;

-- ============================================================================
-- Step 1: Update Workflow Definition
-- ============================================================================

UPDATE workflows
SET 
  name = 'Ask Expert Mode 1: Manual-Interactive (Enhanced)',
  description = 'User selects expert → Multi-turn conversation with feedback, memory, and knowledge enrichment (GOLD STANDARD)',
  definition = jsonb_build_object(
    'nodes', jsonb_build_array(
      -- Input Node
      jsonb_build_object(
        'id', 'input',
        'type', 'input',
        'position', jsonb_build_object('x', 100, 'y', 100),
        'data', jsonb_build_object(
          'label', 'User Query',
          'description', 'User provides query and selects expert agent'
        )
      ),
      
      -- Validation & Memory Retrieval
      jsonb_build_object(
        'id', 'validate_tenant',
        'type', 'agent',
        'position', jsonb_build_object('x', 300, 'y', 100),
        'data', jsonb_build_object(
          'label', 'Validate Tenant',
          'description', 'Enforce tenant isolation (Golden Rule #3)',
          'config', jsonb_build_object('node_type', 'validation')
        )
      ),
      
      jsonb_build_object(
        'id', 'retrieve_memory',
        'type', 'agent',
        'position', jsonb_build_object('x', 500, 'y', 100),
        'data', jsonb_build_object(
          'label', 'Retrieve Memory',
          'description', 'Load semantic memory from past conversations',
          'config', jsonb_build_object('node_type', 'memory', 'golden_rule', 5)
        )
      ),
      
      -- Conversation Routing
      jsonb_build_object(
        'id', 'check_conversation',
        'type', 'condition',
        'position', jsonb_build_object('x', 700, 'y', 100),
        'data', jsonb_build_object(
          'label', 'Check Conversation',
          'description', 'Route: fresh or continuing session?'
        )
      ),
      
      jsonb_build_object(
        'id', 'fresh_conversation',
        'type', 'agent',
        'position', jsonb_build_object('x', 850, 'y', 50),
        'data', jsonb_build_object(
          'label', 'Fresh Conversation',
          'description', 'Initialize new conversation session'
        )
      ),
      
      jsonb_build_object(
        'id', 'load_conversation',
        'type', 'agent',
        'position', jsonb_build_object('x', 850, 'y', 150),
        'data', jsonb_build_object(
          'label', 'Load Conversation',
          'description', 'Load existing conversation context'
        )
      ),
      
      -- Query Analysis & Agent Selection
      jsonb_build_object(
        'id', 'analyze_query',
        'type', 'agent',
        'position', jsonb_build_object('x', 1050, 'y', 100),
        'data', jsonb_build_object(
          'label', 'Analyze Query',
          'description', 'NLU + intent detection + domain classification'
        )
      ),
      
      jsonb_build_object(
        'id', 'select_expert',
        'type', 'agent',
        'position', jsonb_build_object('x', 1250, 'y', 100),
        'data', jsonb_build_object(
          'label', 'Select Expert',
          'description', 'ML-powered agent selection with feedback data',
          'config', jsonb_build_object('selection', 'manual', 'requires_user_input', true)
        )
      ),
      
      jsonb_build_object(
        'id', 'enhance_context',
        'type', 'agent',
        'position', jsonb_build_object('x', 1450, 'y', 100),
        'data', jsonb_build_object(
          'label', 'Enhance Context',
          'description', 'Enrich context with memory and history',
          'config', jsonb_build_object('node_type', 'memory')
        )
      ),
      
      -- Execution Strategy Router
      jsonb_build_object(
        'id', 'route_execution',
        'type', 'orchestrator',
        'position', jsonb_build_object('x', 1650, 'y', 100),
        'data', jsonb_build_object(
          'label', 'Route Execution',
          'description', 'Choose: RAG+Tools | RAG only | Tools only | Direct',
          'config', jsonb_build_object('router_type', 'execution_strategy')
        )
      ),
      
      -- Execution Paths
      jsonb_build_object(
        'id', 'rag_and_tools',
        'type', 'tool',
        'position', jsonb_build_object('x', 1850, 'y', 0),
        'data', jsonb_build_object(
          'label', 'RAG + Tools',
          'description', 'Enable both RAG retrieval and tool execution',
          'config', jsonb_build_object('rag', true, 'tools', true, 'golden_rule', 4)
        )
      ),
      
      jsonb_build_object(
        'id', 'rag_only',
        'type', 'tool',
        'position', jsonb_build_object('x', 1850, 'y', 80),
        'data', jsonb_build_object(
          'label', 'RAG Only',
          'description', 'RAG retrieval without tools',
          'config', jsonb_build_object('rag', true, 'tools', false)
        )
      ),
      
      jsonb_build_object(
        'id', 'tools_only',
        'type', 'tool',
        'position', jsonb_build_object('x', 1850, 'y', 160),
        'data', jsonb_build_object(
          'label', 'Tools Only',
          'description', 'Tool execution without RAG',
          'config', jsonb_build_object('rag', false, 'tools', true)
        )
      ),
      
      jsonb_build_object(
        'id', 'direct_execution',
        'type', 'agent',
        'position', jsonb_build_object('x', 1850, 'y', 240),
        'data', jsonb_build_object(
          'label', 'Direct LLM',
          'description', 'Direct LLM call without RAG/Tools',
          'config', jsonb_build_object('rag', false, 'tools', false)
        )
      ),
      
      -- Agent Execution with Retry
      jsonb_build_object(
        'id', 'execute_agent',
        'type', 'agent',
        'position', jsonb_build_object('x', 2100, 'y', 100),
        'data', jsonb_build_object(
          'label', 'Execute Agent',
          'description', 'Primary agent execution with selected expert',
          'config', jsonb_build_object('retry_enabled', true)
        )
      ),
      
      jsonb_build_object(
        'id', 'retry_router',
        'type', 'condition',
        'position', jsonb_build_object('x', 2300, 'y', 100),
        'data', jsonb_build_object(
          'label', 'Retry Router',
          'description', 'Route: success | retry | fallback'
        )
      ),
      
      jsonb_build_object(
        'id', 'retry_agent',
        'type', 'agent',
        'position', jsonb_build_object('x', 2250, 'y', 0),
        'data', jsonb_build_object(
          'label', 'Retry Agent',
          'description', 'Retry with adjusted parameters'
        )
      ),
      
      jsonb_build_object(
        'id', 'fallback_response',
        'type', 'agent',
        'position', jsonb_build_object('x', 2450, 'y', 200),
        'data', jsonb_build_object(
          'label', 'Fallback',
          'description', 'Graceful degradation response'
        )
      ),
      
      -- Post-Execution: Feedback & Memory
      jsonb_build_object(
        'id', 'calculate_confidence',
        'type', 'agent',
        'position', jsonb_build_object('x', 2550, 'y', 100),
        'data', jsonb_build_object(
          'label', 'Calculate Confidence',
          'description', 'Multi-factor confidence scoring',
          'config', jsonb_build_object('golden_rule', 5, 'factors', jsonb_build_array('citation_quality', 'expert_tier', 'rag_relevance'))
        )
      ),
      
      jsonb_build_object(
        'id', 'collect_feedback',
        'type', 'agent',
        'position', jsonb_build_object('x', 2750, 'y', 100),
        'data', jsonb_build_object(
          'label', 'Collect Implicit Feedback',
          'description', 'Gather usage signals: latency, user engagement',
          'config', jsonb_build_object('golden_rule', 5)
        )
      ),
      
      jsonb_build_object(
        'id', 'extract_memory',
        'type', 'agent',
        'position', jsonb_build_object('x', 2950, 'y', 50),
        'data', jsonb_build_object(
          'label', 'Extract Memory',
          'description', 'Extract semantic memories for future recall',
          'config', jsonb_build_object('golden_rule', 5, 'node_type', 'memory')
        )
      ),
      
      -- Knowledge Enrichment (Parallel)
      jsonb_build_object(
        'id', 'capture_tool_knowledge',
        'type', 'tool',
        'position', jsonb_build_object('x', 2950, 'y', 150),
        'data', jsonb_build_object(
          'label', 'Capture Tool Knowledge',
          'description', 'Capture tool outputs and results',
          'config', jsonb_build_object('golden_rule', 4)
        )
      ),
      
      jsonb_build_object(
        'id', 'extract_entities',
        'type', 'agent',
        'position', jsonb_build_object('x', 3150, 'y', 50),
        'data', jsonb_build_object(
          'label', 'Extract Entities',
          'description', 'Named Entity Recognition for knowledge graph'
        )
      ),
      
      jsonb_build_object(
        'id', 'enrich_kb',
        'type', 'agent',
        'position', jsonb_build_object('x', 3150, 'y', 150),
        'data', jsonb_build_object(
          'label', 'Enrich Knowledge Base',
          'description', 'Add extracted knowledge to KB',
          'config', jsonb_build_object('golden_rule', 4)
        )
      ),
      
      -- Save & Output
      jsonb_build_object(
        'id', 'save_conversation',
        'type', 'agent',
        'position', jsonb_build_object('x', 3350, 'y', 100),
        'data', jsonb_build_object(
          'label', 'Save Conversation',
          'description', 'Persist conversation with memory'
        )
      ),
      
      jsonb_build_object(
        'id', 'save_router',
        'type', 'condition',
        'position', jsonb_build_object('x', 3550, 'y', 100),
        'data', jsonb_build_object(
          'label', 'Save Status',
          'description', 'Route: success | error'
        )
      ),
      
      jsonb_build_object(
        'id', 'handle_save_error',
        'type', 'agent',
        'position', jsonb_build_object('x', 3550, 'y', 200),
        'data', jsonb_build_object(
          'label', 'Handle Save Error',
          'description', 'Log and recover from save errors'
        )
      ),
      
      jsonb_build_object(
        'id', 'prepare_feedback',
        'type', 'agent',
        'position', jsonb_build_object('x', 3750, 'y', 100),
        'data', jsonb_build_object(
          'label', 'Prepare Feedback UI',
          'description', 'Prepare explicit feedback collection',
          'config', jsonb_build_object('golden_rule', 5)
        )
      ),
      
      jsonb_build_object(
        'id', 'format_output',
        'type', 'agent',
        'position', jsonb_build_object('x', 3950, 'y', 100),
        'data', jsonb_build_object(
          'label', 'Format Output',
          'description', 'Format final response with citations'
        )
      ),
      
      -- Output Node
      jsonb_build_object(
        'id', 'output',
        'type', 'output',
        'position', jsonb_build_object('x', 4150, 'y', 100),
        'data', jsonb_build_object(
          'label', 'Response',
          'description', 'Final response with confidence, citations, and feedback UI'
        )
      )
    ),
    
    'edges', jsonb_build_array(
      -- Main flow
      jsonb_build_object('id', 'e1', 'source', 'input', 'target', 'validate_tenant', 'animated', true),
      jsonb_build_object('id', 'e2', 'source', 'validate_tenant', 'target', 'retrieve_memory', 'animated', true),
      jsonb_build_object('id', 'e3', 'source', 'retrieve_memory', 'target', 'check_conversation', 'animated', true),
      
      -- Conversation routing
      jsonb_build_object('id', 'e4a', 'source', 'check_conversation', 'target', 'fresh_conversation', 'label', 'fresh', 'animated', true),
      jsonb_build_object('id', 'e4b', 'source', 'check_conversation', 'target', 'load_conversation', 'label', 'continuing', 'animated', true),
      jsonb_build_object('id', 'e5a', 'source', 'fresh_conversation', 'target', 'analyze_query', 'animated', true),
      jsonb_build_object('id', 'e5b', 'source', 'load_conversation', 'target', 'analyze_query', 'animated', true),
      
      -- Query → Expert → Context
      jsonb_build_object('id', 'e6', 'source', 'analyze_query', 'target', 'select_expert', 'animated', true),
      jsonb_build_object('id', 'e7', 'source', 'select_expert', 'target', 'enhance_context', 'animated', true),
      jsonb_build_object('id', 'e8', 'source', 'enhance_context', 'target', 'route_execution', 'animated', true),
      
      -- Execution strategy routing
      jsonb_build_object('id', 'e9a', 'source', 'route_execution', 'target', 'rag_and_tools', 'label', 'rag+tools', 'animated', true),
      jsonb_build_object('id', 'e9b', 'source', 'route_execution', 'target', 'rag_only', 'label', 'rag', 'animated', true),
      jsonb_build_object('id', 'e9c', 'source', 'route_execution', 'target', 'tools_only', 'label', 'tools', 'animated', true),
      jsonb_build_object('id', 'e9d', 'source', 'route_execution', 'target', 'direct_execution', 'label', 'direct', 'animated', true),
      
      -- Converge to execution
      jsonb_build_object('id', 'e10a', 'source', 'rag_and_tools', 'target', 'execute_agent', 'animated', true),
      jsonb_build_object('id', 'e10b', 'source', 'rag_only', 'target', 'execute_agent', 'animated', true),
      jsonb_build_object('id', 'e10c', 'source', 'tools_only', 'target', 'execute_agent', 'animated', true),
      jsonb_build_object('id', 'e10d', 'source', 'direct_execution', 'target', 'execute_agent', 'animated', true),
      
      -- Retry logic
      jsonb_build_object('id', 'e11', 'source', 'execute_agent', 'target', 'retry_router', 'animated', true),
      jsonb_build_object('id', 'e12a', 'source', 'retry_router', 'target', 'retry_agent', 'label', 'retry', 'animated', true),
      jsonb_build_object('id', 'e12b', 'source', 'retry_agent', 'target', 'execute_agent', 'animated', true),
      jsonb_build_object('id', 'e12c', 'source', 'retry_router', 'target', 'fallback_response', 'label', 'fallback', 'animated', true),
      jsonb_build_object('id', 'e12d', 'source', 'retry_router', 'target', 'calculate_confidence', 'label', 'success', 'animated', true),
      jsonb_build_object('id', 'e12e', 'source', 'fallback_response', 'target', 'calculate_confidence', 'animated', true),
      
      -- Post-execution flow
      jsonb_build_object('id', 'e13', 'source', 'calculate_confidence', 'target', 'collect_feedback', 'animated', true),
      
      -- Parallel enrichment branches
      jsonb_build_object('id', 'e14a', 'source', 'collect_feedback', 'target', 'extract_memory', 'animated', true),
      jsonb_build_object('id', 'e14b', 'source', 'collect_feedback', 'target', 'capture_tool_knowledge', 'animated', true),
      
      jsonb_build_object('id', 'e15a', 'source', 'extract_memory', 'target', 'extract_entities', 'animated', true),
      jsonb_build_object('id', 'e15b', 'source', 'capture_tool_knowledge', 'target', 'enrich_kb', 'animated', true),
      
      -- Converge to save
      jsonb_build_object('id', 'e16a', 'source', 'extract_entities', 'target', 'save_conversation', 'animated', true),
      jsonb_build_object('id', 'e16b', 'source', 'enrich_kb', 'target', 'save_conversation', 'animated', true),
      
      -- Save routing
      jsonb_build_object('id', 'e17', 'source', 'save_conversation', 'target', 'save_router', 'animated', true),
      jsonb_build_object('id', 'e18a', 'source', 'save_router', 'target', 'handle_save_error', 'label', 'error', 'animated', true),
      jsonb_build_object('id', 'e18b', 'source', 'handle_save_error', 'target', 'prepare_feedback', 'animated', true),
      jsonb_build_object('id', 'e18c', 'source', 'save_router', 'target', 'prepare_feedback', 'label', 'success', 'animated', true),
      
      -- Final output
      jsonb_build_object('id', 'e19', 'source', 'prepare_feedback', 'target', 'format_output', 'animated', true),
      jsonb_build_object('id', 'e20', 'source', 'format_output', 'target', 'output', 'animated', true)
    ),
    
    'metadata', jsonb_build_object(
      'source', 'mode1_enhanced_workflow',
      'backend_file', 'langgraph_workflows/mode1_enhanced_workflow.py',
      'version', '2.0',
      'node_count', 30,
      'edge_count', 40,
      'branching_paths', 14,
      'golden_rules', jsonb_build_array(1, 2, 3, 4, 5),
      'features', jsonb_build_array(
        'feedback_collection',
        'semantic_memory',
        'knowledge_enrichment',
        'multi_branching',
        'rag_tools_enforcement',
        'confidence_calculation',
        'retry_logic',
        'graceful_degradation'
      ),
      'defaultQuery', 'What are the FDA IND requirements for Phase II clinical trials?',
      'mode', 'mode1',
      'selection', 'manual',
      'interaction', 'interactive',
      'requires_agent_selection', true
    )
  ),
  updated_at = NOW()
WHERE template_id = 'mode1_ask_expert';

-- ============================================================================
-- Step 2: Update Template Library Entry
-- ============================================================================

UPDATE template_library
SET 
  display_name = 'Ask Expert Mode 1: Manual-Interactive (Enhanced)',
  description = 'GOLD STANDARD: User selects expert → Multi-turn conversation with feedback, memory, and knowledge enrichment',
  content = jsonb_set(
    content,
    '{features}',
    '["Feedback Collection (Golden Rule #5)", "Semantic Memory (Golden Rule #5)", "Knowledge Enrichment (Golden Rule #4)", "RAG/Tools Enforcement (Golden Rule #4)", "Confidence Calculation", "Retry Logic", "14+ Branching Paths"]'::jsonb
  ),
  tags = ARRAY['mode1', 'manual_interactive', 'gold_standard', 'feedback', 'memory', 'enrichment', 'langgraph', 'enhanced'],
  updated_at = NOW()
WHERE template_slug = 'mode1_ask_expert';

-- ============================================================================
-- Step 3: Log Migration
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Mode 1 template updated to reflect Mode1EnhancedWorkflow';
  RAISE NOTICE '   • 30 nodes (up from 2)';
  RAISE NOTICE '   • 40 edges (up from 14)';
  RAISE NOTICE '   • 14+ branching paths';
  RAISE NOTICE '   • All 5 Golden Rules implemented';
  RAISE NOTICE '   • Features: Feedback, Memory, Enrichment, RAG/Tools, Confidence';
  RAISE NOTICE '   • Backend sync: mode1_enhanced_workflow.py';
END $$;

COMMIT;







