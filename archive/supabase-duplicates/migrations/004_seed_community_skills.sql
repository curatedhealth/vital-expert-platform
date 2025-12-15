-- ============================================================================
-- Migration 004: Seed Community Skills Library
-- ============================================================================
-- Date: 2025-11-17
-- Purpose: Add comprehensive skills from community repositories
-- Sources:
--   - https://github.com/alirezarezvani/claude-skills (25 production-ready skills)
--   - https://github.com/BehiSecc/awesome-claude-skills (40+ community skills)
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: Marketing & Content Skills (alirezarezvani/claude-skills)
-- ============================================================================

INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, is_active) VALUES
-- Marketing
('content-creator', 'content-creator', 'Content Creator', 'Professional-grade brand voice analysis, SEO optimization, and platform-specific content frameworks', 'custom', 'generation', 'skill_command', true),
('marketing-demand-acquisition', 'marketing-demand-acquisition', 'Marketing Demand & Acquisition', 'Expert demand generation and customer acquisition strategies for Series A+ startups with CAC calculator and channel playbooks', 'custom', 'analysis', 'skill_command', true),
('marketing-strategy-pmm', 'marketing-strategy-pmm', 'Marketing Strategy & Product Marketing', 'Product marketing, positioning, GTM strategy, and competitive intelligence with ICP definition and battlecards', 'custom', 'analysis', 'skill_command', true),

-- Executive Advisory
('ceo-advisor', 'ceo-advisor', 'CEO Advisor', 'Strategic decision-making guidance for organizational leadership with strategy and financial scenario analyzers', 'custom', 'analysis', 'skill_command', true),
('cto-advisor', 'cto-advisor', 'CTO Advisor', 'Technical leadership and engineering strategy guidance with tech debt analyzer and team scaling calculator', 'custom', 'analysis', 'skill_command', true),

-- Product Management
('product-manager-toolkit', 'product-manager-toolkit', 'Product Manager Toolkit', 'Essential tools and frameworks for modern product management including RICE prioritizer and customer interview analyzer', 'custom', 'planning', 'skill_command', true),
('agile-product-owner', 'agile-product-owner', 'Agile Product Owner', 'Sprint execution and backlog management for agile delivery with user story generator and sprint planner', 'custom', 'planning', 'skill_command', true),
('product-strategist', 'product-strategist', 'Product Strategist', 'Strategic planning and vision alignment for product leadership with OKR cascade generator', 'custom', 'planning', 'skill_command', true),
('ux-researcher-designer', 'ux-researcher-designer', 'UX Researcher Designer', 'User research and experience design frameworks with persona generator and journey mapper', 'custom', 'analysis', 'skill_command', true),
('ui-design-system', 'ui-design-system', 'UI Design System', 'Visual design systems and component architecture with design token generator', 'custom', 'generation', 'skill_command', true),

-- Project Management (Atlassian-focused)
('senior-project-manager', 'senior-project-manager', 'Senior Project Management Expert', 'Strategic software project management with portfolio oversight and Atlassian MCP integration', 'custom', 'planning', 'skill_command', true),
('scrum-master-expert', 'scrum-master-expert', 'Scrum Master Expert', 'Agile facilitation for software development teams with sprint planning and retrospectives', 'custom', 'planning', 'skill_command', true),
('atlassian-jira-expert', 'atlassian-jira-expert', 'Atlassian Jira Expert', 'Advanced Jira configuration and technical operations with JQL mastery and automation rules', 'custom', 'planning', 'tool_use', true),
('atlassian-confluence-expert', 'atlassian-confluence-expert', 'Atlassian Confluence Expert', 'Knowledge management and documentation architecture with space architecture and templates', 'custom', 'communication', 'tool_use', true),
('atlassian-administrator', 'atlassian-administrator', 'Atlassian Administrator', 'System administration for Atlassian suite with user provisioning and security setup', 'custom', 'execution', 'tool_use', true),
('atlassian-template-creator', 'atlassian-template-creator', 'Atlassian Template Creator Expert', 'Template and file creation/modification specialist with 15+ Confluence templates', 'custom', 'generation', 'tool_use', true),

-- Engineering
('senior-software-architect', 'senior-software-architect', 'Senior Software Architect', 'System architecture design and technology decisions with architecture diagram generator', 'custom', 'planning', 'skill_command', true),
('senior-frontend-engineer', 'senior-frontend-engineer', 'Senior Frontend Engineer', 'Frontend development with React, Next.js, and TypeScript including component generator', 'custom', 'generation', 'skill_command', true),
('senior-backend-engineer', 'senior-backend-engineer', 'Senior Backend Engineer', 'Backend development with Node.js, Express, GraphQL, Go, and Python with API scaffolder', 'custom', 'generation', 'skill_command', true),
('senior-fullstack-engineer', 'senior-fullstack-engineer', 'Senior Fullstack Engineer', 'End-to-end application development with complete stack integration', 'custom', 'generation', 'skill_command', true),
('senior-qa-testing', 'senior-qa-testing', 'Senior QA Testing Engineer', 'Quality assurance and test automation with test suite generator and coverage analyzer', 'custom', 'validation', 'skill_command', true),
('senior-devops-engineer', 'senior-devops-engineer', 'Senior DevOps Engineer', 'CI/CD automation and infrastructure as code with pipeline generator and Terraform scaffolder', 'custom', 'execution', 'skill_command', true),
('senior-secops-engineer', 'senior-secops-engineer', 'Senior SecOps Engineer', 'Security operations and vulnerability management with security scanner and compliance checker', 'custom', 'validation', 'skill_command', true),
('code-reviewer', 'code-reviewer', 'Code Reviewer', 'Automated code review and quality checking with PR analyzer and review report generator', 'custom', 'validation', 'skill_command', true),
('senior-security-engineer', 'senior-security-engineer', 'Senior Security Engineer', 'Security architecture, penetration testing, and cryptography implementation', 'custom', 'validation', 'skill_command', true)

ON CONFLICT (skill_name) DO NOTHING;

-- ============================================================================
-- PART 2: Development & Code Tools (awesome-claude-skills)
-- ============================================================================

INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, is_active) VALUES
-- Development Workflow
('test-driven-development', 'test-driven-development', 'Test-Driven Development', 'Implements TDD methodology - writes tests before writing feature code', 'custom', 'validation', 'skill_command', true),
('using-git-worktrees', 'using-git-worktrees', 'Git Worktrees Manager', 'Creates isolated git worktrees with directory selection for parallel development', 'custom', 'file_operations', 'skill_command', true),
('finishing-dev-branch', 'finishing-dev-branch', 'Finishing Development Branch', 'Guides development completion with workflow options for merging, rebasing, or continuing', 'custom', 'execution', 'skill_command', true),
('git-pushing', 'git-pushing', 'Git Push Automation', 'Automates git operations including committing, pushing, and repository interactions', 'custom', 'execution', 'skill_command', true),
('review-implementing', 'review-implementing', 'Review Implementation', 'Evaluates code implementation plans against specifications and requirements', 'custom', 'validation', 'skill_command', true),
('test-fixing', 'test-fixing', 'Test Fixing', 'Identifies failing tests and proposes patches to fix them', 'custom', 'validation', 'skill_command', true),

-- Testing & Quality
('pypict-testing', 'pypict-testing', 'Pairwise Testing (PICT)', 'Design comprehensive test cases using PICT (Pairwise Independent Combinatorial Testing)', 'custom', 'validation', 'skill_command', true),
('defense-in-depth', 'defense-in-depth', 'Defense in Depth Testing', 'Implements multi-layered testing and security best practices', 'custom', 'validation', 'skill_command', true),
('systematic-debugging', 'systematic-debugging', 'Systematic Debugging', 'Structured approach to debugging bugs and test failures with root cause analysis', 'custom', 'validation', 'skill_command', true),
('root-cause-tracing', 'root-cause-tracing', 'Root Cause Tracing', 'Traces execution errors back to original trigger points in the codebase', 'custom', 'analysis', 'skill_command', true),

-- Specialized Development
('aws-skills', 'aws-skills', 'AWS Development Skills', 'AWS development with CDK patterns and serverless architecture', 'custom', 'generation', 'skill_command', true),
('move-code-quality', 'move-code-quality', 'Move Language Quality', 'Analyzes Move language packages for compliance with standards', 'custom', 'validation', 'skill_command', true),
('claude-code-terminal-title', 'claude-code-terminal-title', 'Terminal Title Automation', 'Dynamically titles terminal windows describing current work context', 'custom', 'execution', 'skill_command', true)

ON CONFLICT (skill_name) DO NOTHING;

-- ============================================================================
-- PART 3: Data & Analysis Skills (awesome-claude-skills)
-- ============================================================================

INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, requires_network, is_active) VALUES
('csv-data-summarizer', 'csv-data-summarizer', 'CSV Data Summarizer', 'Analyzes CSV structure, distributions, correlations, and provides comprehensive data summaries', 'custom', 'analysis', 'skill_command', false, true)

ON CONFLICT (skill_name) DO NOTHING;

-- ============================================================================
-- PART 4: Scientific & Research Skills (awesome-claude-skills)
-- ============================================================================

INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, requires_network, is_active) VALUES
-- Scientific Databases
('scientific-databases', 'scientific-databases', 'Scientific Databases Access', 'Access to 26 research databases including PubMed, AlphaFold, UniProt, ChEMBL, and ClinicalTrials.gov', 'custom', 'data_retrieval', 'skill_command', true, true),
('scientific-integrations', 'scientific-integrations', 'Lab Automation Integrations', 'Lab automation platform integrations for Benchling, Opentrons, and scientific workflows', 'custom', 'execution', 'skill_command', true, true),
('scientific-packages', 'scientific-packages', 'Scientific Python Packages', '58 specialized Python packages for bioinformatics, cheminformatics, machine learning, and data analysis', 'custom', 'analysis', 'skill_command', false, true),
('scientific-thinking', 'scientific-thinking', 'Scientific Thinking Tools', 'Scientific writing tools, visualization, methodology support, and research planning', 'custom', 'generation', 'skill_command', false, true)

ON CONFLICT (skill_name) DO NOTHING;

-- ============================================================================
-- PART 5: Writing & Research Skills (awesome-claude-skills)
-- ============================================================================

INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, requires_network, is_active) VALUES
('article-extractor', 'article-extractor', 'Article Extractor', 'Extracts full article text and metadata from web pages for research and analysis', 'custom', 'data_retrieval', 'skill_command', true, true),
('content-research-writer', 'content-research-writer', 'Content Research Writer', 'Researches topics, adds citations, and provides section-by-section writing feedback', 'custom', 'generation', 'skill_command', true, true),
('brainstorming', 'brainstorming', 'Brainstorming Facilitator', 'Transform rough ideas into fully-formed designs through structured questioning', 'custom', 'planning', 'skill_command', false, true),
('family-history-research', 'family-history-research', 'Family History Research', 'Assists with genealogy and ancestry research planning and documentation', 'custom', 'analysis', 'skill_command', true, true)

ON CONFLICT (skill_name) DO NOTHING;

-- ============================================================================
-- PART 6: Learning & Knowledge Skills (awesome-claude-skills)
-- ============================================================================

INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, is_active) VALUES
('tapestry', 'tapestry', 'Tapestry Knowledge Network', 'Interlinking and summarization of related documents into knowledge networks', 'custom', 'analysis', 'skill_command', true),
('ship-learn-next', 'ship-learn-next', 'Ship-Learn-Next Priority', 'Determines next building or learning priorities based on feedback and progress', 'custom', 'planning', 'skill_command', true)

ON CONFLICT (skill_name) DO NOTHING;

-- ============================================================================
-- PART 7: Media & Content Skills (awesome-claude-skills)
-- ============================================================================

INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, requires_network, is_active) VALUES
('youtube-transcript', 'youtube-transcript', 'YouTube Transcript Fetcher', 'Fetches YouTube transcripts and creates summaries and analysis', 'custom', 'data_retrieval', 'skill_command', true, true),
('video-downloader', 'video-downloader', 'Video Downloader', 'Downloads videos from YouTube and other platforms for offline use', 'custom', 'file_operations', 'skill_command', true, true),
('image-enhancer', 'image-enhancer', 'Image Enhancer', 'Improves image quality, particularly for screenshots and low-resolution images', 'custom', 'generation', 'skill_command', false, true),
('claude-epub-skill', 'claude-epub-skill', 'EPUB Parser', 'Parses and analyzes EPUB ebook contents including metadata and structure', 'custom', 'file_operations', 'skill_command', false, true)

ON CONFLICT (skill_name) DO NOTHING;

-- ============================================================================
-- PART 8: Collaboration & Project Management Skills (awesome-claude-skills)
-- ============================================================================

INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, requires_network, is_active) VALUES
('meeting-insights-analyzer', 'meeting-insights-analyzer', 'Meeting Insights Analyzer', 'Transforms meeting transcripts into actionable insights about communication patterns', 'custom', 'analysis', 'skill_command', false, true),
('linear-cli-skill', 'linear-cli-skill', 'Linear CLI Integration', 'Teaches Claude to use linear-CLI for project management and issue tracking', 'custom', 'execution', 'tool_use', true, true)

ON CONFLICT (skill_name) DO NOTHING;

-- ============================================================================
-- PART 9: Security & Web Testing Skills (awesome-claude-skills)
-- ============================================================================

INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, requires_network, is_active) VALUES
('ffuf-fuzzing', 'ffuf-fuzzing', 'FFUF Web Fuzzing', 'Integrates with FFUF fuzzing tool for web vulnerability analysis and discovery', 'custom', 'validation', 'tool_use', true, true)

ON CONFLICT (skill_name) DO NOTHING;

-- ============================================================================
-- PART 10: Utility & Automation Skills (awesome-claude-skills)
-- ============================================================================

INSERT INTO skills (skill_name, skill_slug, display_name, description, skill_type, category, invocation_method, is_active) VALUES
('file-organizer', 'file-organizer', 'File Organizer', 'Intelligently organizes files and folders across systems with smart categorization', 'custom', 'file_operations', 'skill_command', true),
('invoice-organizer', 'invoice-organizer', 'Invoice Organizer', 'Automatically organizes invoices and receipts for tax purposes and accounting', 'custom', 'file_operations', 'skill_command', true)

ON CONFLICT (skill_name) DO NOTHING;

COMMIT;

-- ============================================================================
-- Verification & Summary
-- ============================================================================

DO $$
DECLARE
    v_total_skills INTEGER;
    v_anthropic_skills INTEGER;
    v_vital_skills INTEGER;
    v_alirezarezvani_skills INTEGER;
    v_awesome_skills INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_skills FROM skills;

    SELECT COUNT(*) INTO v_anthropic_skills
    FROM skills WHERE skill_type = 'built_in';

    SELECT COUNT(*) INTO v_vital_skills
    FROM skills WHERE skill_name LIKE '%_' AND skill_type = 'custom';

    SELECT COUNT(*) INTO v_alirezarezvani_skills
    FROM skills WHERE skill_slug IN (
        'content-creator', 'marketing-demand-acquisition', 'ceo-advisor',
        'product-manager-toolkit', 'senior-software-architect'
    );

    SELECT COUNT(*) INTO v_awesome_skills
    FROM skills WHERE skill_slug IN (
        'test-driven-development', 'scientific-databases', 'article-extractor',
        'youtube-transcript', 'meeting-insights-analyzer'
    );

    RAISE NOTICE '✅ Migration 004 completed successfully';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Skills Library Summary:';
    RAISE NOTICE '  Total Skills: %', v_total_skills;
    RAISE NOTICE '  ├─ Anthropic Official: %', v_anthropic_skills;
    RAISE NOTICE '  ├─ VITAL Custom (Regulatory/Clinical/Market Access): %', v_vital_skills;
    RAISE NOTICE '  ├─ alirezarezvani/claude-skills: ~25 production-ready';
    RAISE NOTICE '  └─ awesome-claude-skills community: ~40 skills';
    RAISE NOTICE '';
    RAISE NOTICE '📂 Skill Categories:';
    RAISE NOTICE '  - Planning & Orchestration';
    RAISE NOTICE '  - Delegation & Agent Management';
    RAISE NOTICE '  - Search & Discovery (GraphRAG, Knowledge Base, Literature)';
    RAISE NOTICE '  - Analysis (Data, Code, Strategic, UX, Security)';
    RAISE NOTICE '  - Generation (Content, Code, Documents, Templates)';
    RAISE NOTICE '  - Validation (Testing, QA, Security, Compliance)';
    RAISE NOTICE '  - Communication (Documentation, Reports, Comms)';
    RAISE NOTICE '  - Data Retrieval (APIs, Databases, Web)';
    RAISE NOTICE '  - File Operations (Documents, Media, Organization)';
    RAISE NOTICE '  - Execution (Automation, Deployment, CI/CD)';
    RAISE NOTICE '';
    RAISE NOTICE '🔗 Sources Integrated:';
    RAISE NOTICE '  ✓ https://github.com/anthropics/skills';
    RAISE NOTICE '  ✓ https://github.com/alirezarezvani/claude-skills';
    RAISE NOTICE '  ✓ https://github.com/BehiSecc/awesome-claude-skills';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next: Link skills to capabilities via capability_skills table';
END $$;
