-- ============================================================================
-- LOAD SKILLS FROM FOLDER
-- ============================================================================
-- Source: /Users/hichamnaim/Downloads/Cursor/VITAL path/.vital-command-center/skills-main
-- Parsed: 12 skills with SKILL.md files
-- Schema: Using 'complexity_level' only (removed 'complexity')
-- ============================================================================

-- Check if skills already exist (optional - for safety)
DO $$
BEGIN
    -- Delete any existing skills with these slugs to avoid duplicates
    DELETE FROM skills WHERE slug IN (
        'internal-comms', 'skill-creator', 'webapp-testing', 'frontend-design',
        'mcp-builder', 'brand-guidelines', 'web-artifacts-builder', 'template-skill'
    );
END $$;

-- Insert 8 NEW skills parsed from skills-main folder
-- (Skipping 4 that already exist: theme-factory, algorithmic-art, canvas-design, slack-gif-creator)
INSERT INTO skills (
    name,
    slug,
    description,
    category,
    skill_type,
    complexity_level,
    is_active,
    is_executable,
    requires_context,
    is_stateful,
    version
)
VALUES
  (
    'Internal Comms',
    'internal-comms',
    'Templates and strategies for internal communication, team announcements, company-wide messaging, and employee engagement communications.',
    'Creative & Design',
    'custom',
    'basic',
    true,
    true,
    false,
    false,
    '1.0.0'
  ),
  (
    'Skill Creator',
    'skill-creator',
    'Meta-skill for creating new skills. Provides templates, structure, and best practices for defining new agent capabilities and adding them to the skills library.',
    'Development & Technical',
    'custom',
    'expert',
    true,
    true,
    false,
    false,
    '1.0.0'
  ),
  (
    'Web Application Testing',
    'webapp-testing',
    'Comprehensive testing patterns for web applications, including unit tests, integration tests, E2E tests, and quality assurance best practices.',
    'Development & Technical',
    'custom',
    'advanced',
    true,
    true,
    false,
    false,
    '1.0.0'
  ),
  (
    'Frontend Design',
    'frontend-design',
    'UI/UX design principles for frontend development, including responsive design, component architecture, accessibility, and modern design systems.',
    'Creative & Design',
    'custom',
    'intermediate',
    true,
    true,
    false,
    false,
    '1.0.0'
  ),
  (
    'MCP Server Development',
    'mcp-builder',
    'Guide for building Model Context Protocol (MCP) servers, including server architecture, protocol implementation, and integration patterns.',
    'Development & Technical',
    'custom',
    'expert',
    true,
    true,
    false,
    false,
    '1.0.0'
  ),
  (
    'Brand Styling',
    'brand-guidelines',
    'Brand guidelines and styling systems, including color palettes, typography, voice and tone, visual identity, and brand consistency rules.',
    'Creative & Design',
    'custom',
    'intermediate',
    true,
    true,
    false,
    false,
    '1.0.0'
  ),
  (
    'Web Artifacts Builder',
    'web-artifacts-builder',
    'Skills for creating web-based artifacts, components, and deliverables, including HTML/CSS/JS generation and web component development.',
    'Development & Technical',
    'custom',
    'advanced',
    true,
    true,
    false,
    false,
    '1.0.0'
  ),
  (
    'Template Skill',
    'template-skill',
    'Basic skill template with standard structure, metadata, and documentation patterns for creating new skills.',
    'Development & Technical',
    'custom',
    'basic',
    true,
    true,
    false,
    false,
    '1.0.0'
  );

-- Verify the insert
SELECT COUNT(*) as total_new_skills_loaded FROM skills WHERE slug IN (
  'internal-comms', 'skill-creator', 'webapp-testing', 'frontend-design',
  'mcp-builder', 'brand-guidelines', 'web-artifacts-builder', 'template-skill'
);

-- Show all skills from skills-main folder (including existing ones)
SELECT name, slug, category, skill_type, complexity_level FROM skills
WHERE slug IN (
  'theme-factory', 'algorithmic-art', 'canvas-design', 'slack-gif-creator',
  'internal-comms', 'skill-creator', 'webapp-testing', 'frontend-design',
  'mcp-builder', 'brand-guidelines', 'web-artifacts-builder', 'template-skill'
)
ORDER BY name;
