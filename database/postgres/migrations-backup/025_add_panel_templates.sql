-- ============================================================================
-- Migration 025: Add All 6 Ask Panel Mode Templates to Template Library
-- ============================================================================
-- This migration adds template library entries for all 6 Ask Panel modes
-- so they appear in the Templates dialog
-- ============================================================================

-- 1. Open Discussion Panel (Mode 1)
INSERT INTO template_library (
  template_name,
  template_slug,
  display_name,
  description,
  template_type,
  template_category,
  framework,
  is_builtin,
  is_public,
  is_featured,
  content,
  tags,
  source_table,
  source_id
)
SELECT 
  'Ask Panel Mode 1 - Open Discussion',
  'ap_mode_1',
  'Ask Panel Mode 1 - Open Discussion',
  'Open panel discussion with multiple perspectives. Up to 4 experts collaborate freely without strict structure.',
  'workflow',
  'panel_discussion',
  'langgraph',
  TRUE,
  TRUE,
  TRUE,
  jsonb_build_object(
    'nodes', ARRAY[
      jsonb_build_object('id', 'start', 'type', 'start', 'label', 'START', 'position', jsonb_build_object('x', 200, 'y', 50)),
      jsonb_build_object('id', 'parallel_experts', 'type', 'parallel', 'label', 'Parallel Expert Analysis', 'position', jsonb_build_object('x', 200, 'y', 150)),
      jsonb_build_object('id', 'synthesis', 'type', 'agent', 'label', 'Synthesis', 'position', jsonb_build_object('x', 200, 'y', 250)),
      jsonb_build_object('id', 'end', 'type', 'end', 'label', 'END', 'position', jsonb_build_object('x', 200, 'y', 350))
    ],
    'edges', ARRAY[
      jsonb_build_object('id', 'e1', 'source', 'start', 'target', 'parallel_experts'),
      jsonb_build_object('id', 'e2', 'source', 'parallel_experts', 'target', 'synthesis'),
      jsonb_build_object('id', 'e3', 'source', 'synthesis', 'target', 'end')
    ],
    'metadata', jsonb_build_object('max_agents', 4, 'panel_type', 'open', 'mode_code', 'ap_mode_1')
  ),
  ARRAY['ask_panel', 'panel', 'open_discussion', 'collaborative'],
  'service_modes',
  (SELECT id FROM service_modes WHERE mode_code = 'ap_mode_1')
WHERE NOT EXISTS (
  SELECT 1 FROM template_library WHERE template_slug = 'ap_mode_1'
);

-- 2. Structured Panel (Mode 2)
INSERT INTO template_library (
  template_name,
  template_slug,
  display_name,
  description,
  template_type,
  template_category,
  framework,
  is_builtin,
  is_public,
  is_featured,
  content,
  tags,
  source_table,
  source_id
)
SELECT 
  'Ask Panel Mode 2 - Structured Panel',
  'ap_mode_2',
  'Ask Panel Mode 2 - Structured Panel',
  'Structured panel with defined roles and sequential speaking order. Up to 6 experts with formal process.',
  'workflow',
  'panel_discussion',
  'langgraph',
  TRUE,
  TRUE,
  TRUE,
  jsonb_build_object(
    'nodes', ARRAY[
      jsonb_build_object('id', 'start', 'type', 'start', 'label', 'START', 'position', jsonb_build_object('x', 200, 'y', 50)),
      jsonb_build_object('id', 'moderator', 'type', 'orchestrator', 'label', 'Moderator', 'position', jsonb_build_object('x', 200, 'y', 150)),
      jsonb_build_object('id', 'round_1', 'type', 'agent', 'label', 'Discussion Round 1', 'position', jsonb_build_object('x', 200, 'y', 250)),
      jsonb_build_object('id', 'round_2', 'type', 'agent', 'label', 'Discussion Round 2', 'position', jsonb_build_object('x', 200, 'y', 350)),
      jsonb_build_object('id', 'synthesis', 'type', 'agent', 'label', 'Synthesis', 'position', jsonb_build_object('x', 200, 'y', 450)),
      jsonb_build_object('id', 'end', 'type', 'end', 'label', 'END', 'position', jsonb_build_object('x', 200, 'y', 550))
    ],
    'edges', ARRAY[
      jsonb_build_object('id', 'e1', 'source', 'start', 'target', 'moderator'),
      jsonb_build_object('id', 'e2', 'source', 'moderator', 'target', 'round_1'),
      jsonb_build_object('id', 'e3', 'source', 'round_1', 'target', 'round_2'),
      jsonb_build_object('id', 'e4', 'source', 'round_2', 'target', 'synthesis'),
      jsonb_build_object('id', 'e5', 'source', 'synthesis', 'target', 'end')
    ],
    'metadata', jsonb_build_object('max_agents', 6, 'panel_type', 'structured', 'mode_code', 'ap_mode_2')
  ),
  ARRAY['ask_panel', 'panel', 'structured', 'sequential'],
  'service_modes',
  (SELECT id FROM service_modes WHERE mode_code = 'ap_mode_2')
WHERE NOT EXISTS (
  SELECT 1 FROM template_library WHERE template_slug = 'ap_mode_2'
);

-- 3. Consensus Building Panel (Mode 3)
INSERT INTO template_library (
  template_name,
  template_slug,
  display_name,
  description,
  template_type,
  template_category,
  framework,
  is_builtin,
  is_public,
  is_featured,
  content,
  tags,
  source_table,
  source_id
)
SELECT 
  'Ask Panel Mode 3 - Consensus Building',
  'ap_mode_3',
  'Ask Panel Mode 3 - Consensus Building',
  'Panel discussion with consensus-driven decision making. Up to 5 experts with voting mechanism.',
  'workflow',
  'panel_discussion',
  'langgraph',
  TRUE,
  TRUE,
  TRUE,
  jsonb_build_object(
    'nodes', ARRAY[
      jsonb_build_object('id', 'start', 'type', 'start', 'label', 'START', 'position', jsonb_build_object('x', 200, 'y', 50)),
      jsonb_build_object('id', 'discussion', 'type', 'agent', 'label', 'Discussion', 'position', jsonb_build_object('x', 200, 'y', 150)),
      jsonb_build_object('id', 'voting', 'type', 'condition', 'label', 'Consensus Check', 'position', jsonb_build_object('x', 200, 'y', 250)),
      jsonb_build_object('id', 'consensus', 'type', 'agent', 'label', 'Build Consensus', 'position', jsonb_build_object('x', 200, 'y', 350)),
      jsonb_build_object('id', 'end', 'type', 'end', 'label', 'END', 'position', jsonb_build_object('x', 200, 'y', 450))
    ],
    'edges', ARRAY[
      jsonb_build_object('id', 'e1', 'source', 'start', 'target', 'discussion'),
      jsonb_build_object('id', 'e2', 'source', 'discussion', 'target', 'voting'),
      jsonb_build_object('id', 'e3', 'source', 'voting', 'target', 'consensus'),
      jsonb_build_object('id', 'e4', 'source', 'consensus', 'target', 'end')
    ],
    'metadata', jsonb_build_object('max_agents', 5, 'voting_enabled', true, 'mode_code', 'ap_mode_3')
  ),
  ARRAY['ask_panel', 'panel', 'consensus', 'voting'],
  'service_modes',
  (SELECT id FROM service_modes WHERE mode_code = 'ap_mode_3')
WHERE NOT EXISTS (
  SELECT 1 FROM template_library WHERE template_slug = 'ap_mode_3'
);

-- 4. Debate Panel (Mode 4)
INSERT INTO template_library (
  template_name,
  template_slug,
  display_name,
  description,
  template_type,
  template_category,
  framework,
  is_builtin,
  is_public,
  is_featured,
  content,
  tags,
  source_table,
  source_id
)
SELECT 
  'Ask Panel Mode 4 - Debate Panel',
  'ap_mode_4',
  'Ask Panel Mode 4 - Debate Panel',
  'Adversarial panel with debate and counter-arguments. Up to 6 experts with 3 rounds of rebuttals.',
  'workflow',
  'panel_discussion',
  'langgraph',
  TRUE,
  TRUE,
  TRUE,
  jsonb_build_object(
    'nodes', ARRAY[
      jsonb_build_object('id', 'start', 'type', 'start', 'label', 'START', 'position', jsonb_build_object('x', 200, 'y', 50)),
      jsonb_build_object('id', 'opening', 'type', 'agent', 'label', 'Opening Statements', 'position', jsonb_build_object('x', 200, 'y', 150)),
      jsonb_build_object('id', 'debate_r1', 'type', 'agent', 'label', 'Debate Round 1', 'position', jsonb_build_object('x', 200, 'y', 250)),
      jsonb_build_object('id', 'debate_r2', 'type', 'agent', 'label', 'Debate Round 2', 'position', jsonb_build_object('x', 200, 'y', 350)),
      jsonb_build_object('id', 'debate_r3', 'type', 'agent', 'label', 'Debate Round 3', 'position', jsonb_build_object('x', 200, 'y', 450)),
      jsonb_build_object('id', 'closing', 'type', 'agent', 'label', 'Closing Arguments', 'position', jsonb_build_object('x', 200, 'y', 550)),
      jsonb_build_object('id', 'end', 'type', 'end', 'label', 'END', 'position', jsonb_build_object('x', 200, 'y', 650))
    ],
    'edges', ARRAY[
      jsonb_build_object('id', 'e1', 'source', 'start', 'target', 'opening'),
      jsonb_build_object('id', 'e2', 'source', 'opening', 'target', 'debate_r1'),
      jsonb_build_object('id', 'e3', 'source', 'debate_r1', 'target', 'debate_r2'),
      jsonb_build_object('id', 'e4', 'source', 'debate_r2', 'target', 'debate_r3'),
      jsonb_build_object('id', 'e5', 'source', 'debate_r3', 'target', 'closing'),
      jsonb_build_object('id', 'e6', 'source', 'closing', 'target', 'end')
    ],
    'metadata', jsonb_build_object('max_agents', 6, 'panel_type', 'debate', 'rounds', 3, 'mode_code', 'ap_mode_4')
  ),
  ARRAY['ask_panel', 'panel', 'debate', 'adversarial'],
  'service_modes',
  (SELECT id FROM service_modes WHERE mode_code = 'ap_mode_4')
WHERE NOT EXISTS (
  SELECT 1 FROM template_library WHERE template_slug = 'ap_mode_4'
);

-- 5. Expert Review Panel (Mode 5)
INSERT INTO template_library (
  template_name,
  template_slug,
  display_name,
  description,
  template_type,
  template_category,
  framework,
  is_builtin,
  is_public,
  is_featured,
  content,
  tags,
  source_table,
  source_id
)
SELECT 
  'Ask Panel Mode 5 - Expert Review',
  'ap_mode_5',
  'Ask Panel Mode 5 - Expert Review',
  'Expert review panel with detailed analysis. Up to 8 experts with tools enabled for comprehensive depth.',
  'workflow',
  'panel_discussion',
  'langgraph',
  TRUE,
  TRUE,
  TRUE,
  jsonb_build_object(
    'nodes', ARRAY[
      jsonb_build_object('id', 'start', 'type', 'start', 'label', 'START', 'position', jsonb_build_object('x', 200, 'y', 50)),
      jsonb_build_object('id', 'analysis', 'type', 'agent', 'label', 'Expert Analysis', 'position', jsonb_build_object('x', 200, 'y', 150)),
      jsonb_build_object('id', 'tools', 'type', 'tool', 'label', 'Research Tools', 'position', jsonb_build_object('x', 200, 'y', 250)),
      jsonb_build_object('id', 'review', 'type', 'agent', 'label', 'Peer Review', 'position', jsonb_build_object('x', 200, 'y', 350)),
      jsonb_build_object('id', 'synthesis', 'type', 'agent', 'label', 'Comprehensive Synthesis', 'position', jsonb_build_object('x', 200, 'y', 450)),
      jsonb_build_object('id', 'end', 'type', 'end', 'label', 'END', 'position', jsonb_build_object('x', 200, 'y', 550))
    ],
    'edges', ARRAY[
      jsonb_build_object('id', 'e1', 'source', 'start', 'target', 'analysis'),
      jsonb_build_object('id', 'e2', 'source', 'analysis', 'target', 'tools'),
      jsonb_build_object('id', 'e3', 'source', 'tools', 'target', 'review'),
      jsonb_build_object('id', 'e4', 'source', 'review', 'target', 'synthesis'),
      jsonb_build_object('id', 'e5', 'source', 'synthesis', 'target', 'end')
    ],
    'metadata', jsonb_build_object('max_agents', 8, 'enable_tools', true, 'depth', 'comprehensive', 'mode_code', 'ap_mode_5')
  ),
  ARRAY['ask_panel', 'panel', 'expert_review', 'comprehensive'],
  'service_modes',
  (SELECT id FROM service_modes WHERE mode_code = 'ap_mode_5')
WHERE NOT EXISTS (
  SELECT 1 FROM template_library WHERE template_slug = 'ap_mode_5'
);

-- 6. Multi-Phase Analysis Panel (Mode 6)
INSERT INTO template_library (
  template_name,
  template_slug,
  display_name,
  description,
  template_type,
  template_category,
  framework,
  is_builtin,
  is_public,
  is_featured,
  content,
  tags,
  source_table,
  source_id
)
SELECT 
  'Ask Panel Mode 6 - Multi-Phase Analysis',
  'ap_mode_6',
  'Ask Panel Mode 6 - Multi-Phase Analysis',
  'Multi-phase panel with discovery, analysis, and synthesis. Most complex mode with comprehensive workflow.',
  'workflow',
  'panel_discussion',
  'langgraph',
  TRUE,
  TRUE,
  TRUE,
  jsonb_build_object(
    'nodes', ARRAY[
      jsonb_build_object('id', 'start', 'type', 'start', 'label', 'START', 'position', jsonb_build_object('x', 200, 'y', 50)),
      jsonb_build_object('id', 'discovery', 'type', 'agent', 'label', 'Phase 1: Discovery', 'position', jsonb_build_object('x', 200, 'y', 150)),
      jsonb_build_object('id', 'research', 'type', 'tool', 'label', 'Research & Data', 'position', jsonb_build_object('x', 200, 'y', 250)),
      jsonb_build_object('id', 'analysis', 'type', 'agent', 'label', 'Phase 2: Analysis', 'position', jsonb_build_object('x', 200, 'y', 350)),
      jsonb_build_object('id', 'peer_review', 'type', 'agent', 'label', 'Peer Review', 'position', jsonb_build_object('x', 200, 'y', 450)),
      jsonb_build_object('id', 'synthesis', 'type', 'agent', 'label', 'Phase 3: Synthesis', 'position', jsonb_build_object('x', 200, 'y', 550)),
      jsonb_build_object('id', 'end', 'type', 'end', 'label', 'END', 'position', jsonb_build_object('x', 200, 'y', 650))
    ],
    'edges', ARRAY[
      jsonb_build_object('id', 'e1', 'source', 'start', 'target', 'discovery'),
      jsonb_build_object('id', 'e2', 'source', 'discovery', 'target', 'research'),
      jsonb_build_object('id', 'e3', 'source', 'research', 'target', 'analysis'),
      jsonb_build_object('id', 'e4', 'source', 'analysis', 'target', 'peer_review'),
      jsonb_build_object('id', 'e5', 'source', 'peer_review', 'target', 'synthesis'),
      jsonb_build_object('id', 'e6', 'source', 'synthesis', 'target', 'end')
    ],
    'metadata', jsonb_build_object('phases', 3, 'panel_type', 'multi_phase', 'mode_code', 'ap_mode_6')
  ),
  ARRAY['ask_panel', 'panel', 'multi_phase', 'comprehensive'],
  'service_modes',
  (SELECT id FROM service_modes WHERE mode_code = 'ap_mode_6')
WHERE NOT EXISTS (
  SELECT 1 FROM template_library WHERE template_slug = 'ap_mode_6'
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check all templates
-- SELECT template_name, template_category, is_featured 
-- FROM template_library 
-- WHERE template_category IN ('panel_discussion', 'expert_consultation')
-- ORDER BY template_category, template_name;

-- Expected: 10 templates total (4 Ask Expert + 6 Ask Panel)
