-- ============================================================================
-- MASTER SEED SCRIPT - ALL SKILLS (58 Total)
-- ============================================================================
-- Source 1: VITAL Command Center Skills (16 skills)
-- Source 2: Awesome Claude Skills (42 skills)
-- 
-- This script loads all skills into the AgentOS 3.0 database
-- Run this after the schema migrations are complete
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: VITAL COMMAND CENTER SKILLS (16 skills)
-- ============================================================================

-- Document Processing Skills (4)
INSERT INTO skills (
    name, description, implementation_type, implementation_ref, 
    category, complexity_level, is_active, metadata
) VALUES 
(
    'DOCX Creation, Editing, and Analysis',
    'Create, edit, and analyze Word documents with tracked changes, comments, formatting. Supports OOXML manipulation and document generation.',
    'tool',
    'skills-main/document-skills/docx',
    'Document Processing',
    7,
    true,
    '{"source": "vital-command-center", "slug": "docx", "folder_path": "document-skills/docx"}'::jsonb
),
(
    'PDF Processing Guide',
    'Extract text, tables, metadata, merge & annotate PDFs. Comprehensive PDF manipulation including forms processing.',
    'tool',
    'skills-main/document-skills/pdf',
    'Document Processing',
    7,
    true,
    '{"source": "vital-command-center", "slug": "pdf", "folder_path": "document-skills/pdf"}'::jsonb
),
(
    'PPTX Creation, Editing, and Analysis',
    'Read, generate, and adjust slides, layouts, templates. OOXML-based PowerPoint generation and manipulation.',
    'tool',
    'skills-main/document-skills/pptx',
    'Document Processing',
    7,
    true,
    '{"source": "vital-command-center", "slug": "pptx", "folder_path": "document-skills/pptx"}'::jsonb
),
(
    'XLSX Requirements for Outputs',
    'Spreadsheet manipulation: formulas, charts, data transformations. Excel file creation and analysis.',
    'tool',
    'skills-main/document-skills/xlsx',
    'Document Processing',
    6,
    true,
    '{"source": "vital-command-center", "slug": "xlsx", "folder_path": "document-skills/xlsx"}'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    implementation_ref = EXCLUDED.implementation_ref,
    category = EXCLUDED.category,
    complexity_level = EXCLUDED.complexity_level,
    metadata = EXCLUDED.metadata;

-- Creative & Design Skills (4)
INSERT INTO skills (
    name, description, implementation_type, implementation_ref, 
    category, complexity_level, is_active, metadata
) VALUES 
(
    'Algorithmic Art',
    'Generate algorithmic and generative art using code-based approaches.',
    'tool',
    'skills-main/algorithmic-art',
    'Creative & Design',
    6,
    true,
    '{"source": "vital-command-center", "slug": "algorithmic-art", "folder_path": "algorithmic-art"}'::jsonb
),
(
    'Anthropic Brand Styling',
    'Apply Anthropic brand guidelines and styling to documents and designs.',
    'prompt',
    'skills-main/brand-guidelines',
    'Creative & Design',
    4,
    true,
    '{"source": "vital-command-center", "slug": "brand-guidelines", "folder_path": "brand-guidelines"}'::jsonb
),
(
    'Canvas Design',
    'Visual design in canvas with support for multiple fonts and design elements.',
    'tool',
    'skills-main/canvas-design',
    'Creative & Design',
    6,
    true,
    '{"source": "vital-command-center", "slug": "canvas-design", "folder_path": "canvas-design"}'::jsonb
),
(
    'Theme Factory Skill',
    'Generate and apply design themes across documents and applications.',
    'workflow',
    'skills-main/theme-factory',
    'Creative & Design',
    5,
    true,
    '{"source": "vital-command-center", "slug": "theme-factory", "folder_path": "theme-factory"}'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    implementation_ref = EXCLUDED.implementation_ref,
    category = EXCLUDED.category,
    complexity_level = EXCLUDED.complexity_level,
    metadata = EXCLUDED.metadata;

-- Development & Code Tools (5)
INSERT INTO skills (
    name, description, implementation_type, implementation_ref, 
    category, complexity_level, is_active, metadata
) VALUES 
(
    'Frontend Design',
    'Design and develop modern frontend user interfaces with best practices.',
    'tool',
    'skills-main/frontend-design',
    'Development & Code',
    7,
    true,
    '{"source": "vital-command-center", "slug": "frontend-design", "folder_path": "frontend-design"}'::jsonb
),
(
    'MCP Server Development Guide',
    'Build and deploy Model Context Protocol (MCP) servers for Claude integration.',
    'tool',
    'skills-main/mcp-builder',
    'Development & Code',
    8,
    true,
    '{"source": "vital-command-center", "slug": "mcp-builder", "folder_path": "mcp-builder"}'::jsonb
),
(
    'Skill Creator',
    'Template and helper tools for building new Claude skills.',
    'tool',
    'skills-main/skill-creator',
    'Development & Code',
    6,
    true,
    '{"source": "vital-command-center", "slug": "skill-creator", "folder_path": "skill-creator"}'::jsonb
),
(
    'Web Artifacts Builder',
    'Build multi-component HTML artifacts using React, Tailwind, and modern web technologies.',
    'tool',
    'skills-main/web-artifacts-builder',
    'Development & Code',
    7,
    true,
    '{"source": "vital-command-center", "slug": "web-artifacts-builder", "folder_path": "web-artifacts-builder"}'::jsonb
),
(
    'Web Application Testing',
    'Toolkit for interacting with and testing local web applications using Playwright.',
    'tool',
    'skills-main/webapp-testing',
    'Development & Code',
    7,
    true,
    '{"source": "vital-command-center", "slug": "webapp-testing", "folder_path": "webapp-testing"}'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    implementation_ref = EXCLUDED.implementation_ref,
    category = EXCLUDED.category,
    complexity_level = EXCLUDED.complexity_level,
    metadata = EXCLUDED.metadata;

-- Communication & Automation (3)
INSERT INTO skills (
    name, description, implementation_type, implementation_ref, 
    category, complexity_level, is_active, metadata
) VALUES 
(
    'Internal Comms',
    'Create internal communications including status reports, leadership updates, newsletters, and announcements.',
    'prompt',
    'skills-main/internal-comms',
    'Communication & Writing',
    5,
    true,
    '{"source": "vital-command-center", "slug": "internal-comms", "folder_path": "internal-comms"}'::jsonb
),
(
    'Slack GIF Creator',
    'Create animated GIFs for Slack with custom animations, effects, and branding.',
    'tool',
    'skills-main/slack-gif-creator',
    'Creative & Design',
    6,
    true,
    '{"source": "vital-command-center", "slug": "slack-gif-creator", "folder_path": "slack-gif-creator"}'::jsonb
),
(
    'Template Skill',
    'Minimal skeleton for a new skill project structure.',
    'tool',
    'skills-main/template-skill',
    'Development & Code',
    3,
    true,
    '{"source": "vital-command-center", "slug": "template-skill", "folder_path": "template-skill"}'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    implementation_ref = EXCLUDED.implementation_ref,
    category = EXCLUDED.category,
    complexity_level = EXCLUDED.complexity_level,
    metadata = EXCLUDED.metadata;

-- ============================================================================
-- PART 2: AWESOME CLAUDE SKILLS (42 skills)
-- ============================================================================

-- Scientific & Research Tools (4)
INSERT INTO skills (
    name, description, implementation_type, implementation_ref, 
    category, complexity_level, is_active, metadata
) VALUES 
(
    'Scientific Databases',
    'Access to 26 scientific databases including PubMed, PubChem, UniProt, ChEMBL, and AlphaFold DB.',
    'tool',
    'https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-databases',
    'Scientific & Research',
    8,
    true,
    '{"source": "awesome-claude-skills", "slug": "scientific-databases", "github_url": "https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-databases"}'::jsonb
),
(
    'Scientific Integrations',
    'Platform integrations for lab automation and workflow management (Benchling, DNAnexus, Opentrons, and more).',
    'tool',
    'https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-integrations',
    'Scientific & Research',
    8,
    true,
    '{"source": "awesome-claude-skills", "slug": "scientific-integrations", "github_url": "https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-integrations"}'::jsonb
),
(
    'Scientific Packages',
    '58 specialized Python packages for bioinformatics, cheminformatics, machine learning, and data analysis.',
    'tool',
    'https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-packages',
    'Scientific & Research',
    9,
    true,
    '{"source": "awesome-claude-skills", "slug": "scientific-packages", "github_url": "https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-packages"}'::jsonb
),
(
    'Scientific Thinking',
    'Analysis tools and document processing for scientific writing, visualization, and methodology.',
    'tool',
    'https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-thinking',
    'Scientific & Research',
    7,
    true,
    '{"source": "awesome-claude-skills", "slug": "scientific-thinking", "github_url": "https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-thinking"}'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    implementation_ref = EXCLUDED.implementation_ref,
    category = EXCLUDED.category,
    complexity_level = EXCLUDED.complexity_level,
    metadata = EXCLUDED.metadata;

-- Development & Code Tools (8)
INSERT INTO skills (
    name, description, implementation_type, implementation_ref, 
    category, complexity_level, is_active, metadata
) VALUES 
(
    'Artifacts Builder',
    'Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui).',
    'tool',
    'https://github.com/anthropics/skills/tree/main/artifacts-builder',
    'Development & Code',
    7,
    true,
    '{"source": "awesome-claude-skills", "slug": "artifacts-builder", "github_url": "https://github.com/anthropics/skills/tree/main/artifacts-builder"}'::jsonb
),
(
    'Test Driven Development',
    'Use when implementing any feature or bugfix, before writing implementation code',
    'workflow',
    'https://github.com/obra/superpowers/tree/main/skills/test-driven-development',
    'Development & Code',
    6,
    true,
    '{"source": "awesome-claude-skills", "slug": "test-driven-development", "github_url": "https://github.com/obra/superpowers/tree/main/skills/test-driven-development"}'::jsonb
),
(
    'Using Git Worktrees',
    'Creates isolated git worktrees with smart directory selection and safety verification.',
    'tool',
    'https://github.com/obra/superpowers/blob/main/skills/using-git-worktrees/',
    'Development & Code',
    5,
    true,
    '{"source": "awesome-claude-skills", "slug": "using-git-worktrees", "github_url": "https://github.com/obra/superpowers/blob/main/skills/using-git-worktrees/"}'::jsonb
),
(
    'Finishing A Development Branch',
    'Guides completion of development work by presenting clear options and handling chosen workflow.',
    'workflow',
    'https://github.com/obra/superpowers/tree/main/skills/finishing-a-development-branch',
    'Development & Code',
    5,
    true,
    '{"source": "awesome-claude-skills", "slug": "finishing-a-development-branch", "github_url": "https://github.com/obra/superpowers/tree/main/skills/finishing-a-development-branch"}'::jsonb
),
(
    'Pypict Claude Skill',
    'Design comprehensive test cases using PICT (Pairwise Independent Combinatorial Testing) for requirements or code, generating optimized test suites with pairwise coverage.',
    'tool',
    'https://github.com/omkamal/pypict-claude-skill',
    'Development & Code',
    7,
    true,
    '{"source": "awesome-claude-skills", "slug": "pypict-claude-skill", "github_url": "https://github.com/omkamal/pypict-claude-skill"}'::jsonb
),
(
    'AWS Skills',
    'AWS development with CDK best practices, cost optimization MCP servers, and serverless/event-driven architecture patterns.',
    'tool',
    'https://github.com/zxkane/aws-skills',
    'Development & Code',
    8,
    true,
    '{"source": "awesome-claude-skills", "slug": "aws-skills", "github_url": "https://github.com/zxkane/aws-skills"}'::jsonb
),
(
    'Move Code Quality Skill',
    'Analyzes Move language packages against the official Move Book Code Quality Checklist for Move 2024 Edition compliance and best practices.',
    'tool',
    'https://github.com/1NickPappas/move-code-quality-skill',
    'Development & Code',
    7,
    true,
    '{"source": "awesome-claude-skills", "slug": "move-code-quality-skill", "github_url": "https://github.com/1NickPappas/move-code-quality-skill"}'::jsonb
),
(
    'Claude Code Terminal Title',
    'Gives each Claude Code terminal window a dynamic title that describes the work being done so you don''t lose track of what terminal window is doing what.',
    'tool',
    'https://github.com/bluzername/claude-code-terminal-title',
    'Development & Code',
    4,
    true,
    '{"source": "awesome-claude-skills", "slug": "claude-code-terminal-title", "github_url": "https://github.com/bluzername/claude-code-terminal-title"}'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    implementation_ref = EXCLUDED.implementation_ref,
    category = EXCLUDED.category,
    complexity_level = EXCLUDED.complexity_level,
    metadata = EXCLUDED.metadata;

-- Data & Analysis (2)
INSERT INTO skills (
    name, description, implementation_type, implementation_ref, 
    category, complexity_level, is_active, metadata
) VALUES 
(
    'Root Cause Tracing',
    'Use when errors occur deep in execution and you need to trace back to find the original trigger',
    'workflow',
    'https://github.com/obra/superpowers/tree/main/skills/root-cause-tracing',
    'Data & Analysis',
    6,
    true,
    '{"source": "awesome-claude-skills", "slug": "root-cause-tracing", "github_url": "https://github.com/obra/superpowers/tree/main/skills/root-cause-tracing"}'::jsonb
),
(
    'CSV Data Summarizer',
    'Automatically analyzes CSVs: columns, distributions, missing data, correlations.',
    'tool',
    'https://github.com/coffeefuelbump/csv-data-summarizer-claude-skill',
    'Data & Analysis',
    5,
    true,
    '{"source": "awesome-claude-skills", "slug": "csv-data-summarizer-claude-skill", "github_url": "https://github.com/coffeefuelbump/csv-data-summarizer-claude-skill"}'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    implementation_ref = EXCLUDED.implementation_ref,
    category = EXCLUDED.category,
    complexity_level = EXCLUDED.complexity_level,
    metadata = EXCLUDED.metadata;

-- Writing & Research (5)
INSERT INTO skills (
    name, description, implementation_type, implementation_ref, 
    category, complexity_level, is_active, metadata
) VALUES 
(
    'Article Extractor',
    'Extract full article text and metadata from web pages.',
    'tool',
    'https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/article-extractor',
    'Writing & Research',
    5,
    true,
    '{"source": "awesome-claude-skills", "slug": "article-extractor", "github_url": "https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/article-extractor"}'::jsonb
),
(
    'Content Research Writer',
    'Assists in writing high-quality content by conducting research, adding citations, improving hooks, iterating on outlines, and providing real-time feedback on each section',
    'workflow',
    'https://github.com/ComposioHQ/awesome-claude-skills/tree/master/content-research-writer',
    'Writing & Research',
    7,
    true,
    '{"source": "awesome-claude-skills", "slug": "content-research-writer", "github_url": "https://github.com/ComposioHQ/awesome-claude-skills/tree/master/content-research-writer"}'::jsonb
),
(
    'Brainstorming',
    'Transform rough ideas into fully-formed designs through structured questioning and alternative exploration.',
    'prompt',
    'https://github.com/obra/superpowers/tree/main/skills/brainstorming',
    'Writing & Research',
    4,
    true,
    '{"source": "awesome-claude-skills", "slug": "brainstorming", "github_url": "https://github.com/obra/superpowers/tree/main/skills/brainstorming"}'::jsonb
),
(
    'Family History Research',
    'Provides assistance with planning family history and genealogy research projects.',
    'workflow',
    'https://github.com/emaynard/claude-family-history-research-skill',
    'Writing & Research',
    5,
    true,
    '{"source": "awesome-claude-skills", "slug": "family-history-research", "github_url": "https://github.com/emaynard/claude-family-history-research-skill"}'::jsonb
),
(
    'Tapestry',
    'Interlink and summarize related documents into knowledge networks.',
    'tool',
    'https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/tapestry',
    'Learning & Knowledge',
    6,
    true,
    '{"source": "awesome-claude-skills", "slug": "tapestry", "github_url": "https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/tapestry"}'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    implementation_ref = EXCLUDED.implementation_ref,
    category = EXCLUDED.category,
    complexity_level = EXCLUDED.complexity_level,
    metadata = EXCLUDED.metadata;

-- Learning & Knowledge (1)
INSERT INTO skills (
    name, description, implementation_type, implementation_ref, 
    category, complexity_level, is_active, metadata
) VALUES 
(
    'Ship Learn Next',
    'Skill to help iterate on what to build or learn next, based on feedback loops.',
    'workflow',
    'https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/ship-learn-next',
    'Learning & Knowledge',
    5,
    true,
    '{"source": "awesome-claude-skills", "slug": "ship-learn-next", "github_url": "https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/ship-learn-next"}'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    implementation_ref = EXCLUDED.implementation_ref,
    category = EXCLUDED.category,
    complexity_level = EXCLUDED.complexity_level,
    metadata = EXCLUDED.metadata;

-- Media & Content (4)
INSERT INTO skills (
    name, description, implementation_type, implementation_ref, 
    category, complexity_level, is_active, metadata
) VALUES 
(
    'Youtube Transcript',
    'Fetch transcripts from YouTube videos and prepare summaries.',
    'tool',
    'https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/youtube-transcript',
    'Media & Content',
    5,
    true,
    '{"source": "awesome-claude-skills", "slug": "youtube-transcript", "github_url": "https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/youtube-transcript"}'::jsonb
),
(
    'Video Downloader',
    'Downloads videos from YouTube and other platforms for offline viewing, editing, or archival.',
    'tool',
    'https://github.com/ComposioHQ/awesome-claude-skills/tree/master/video-downloader',
    'Media & Content',
    5,
    true,
    '{"source": "awesome-claude-skills", "slug": "video-downloader", "github_url": "https://github.com/ComposioHQ/awesome-claude-skills/tree/master/video-downloader"}'::jsonb
),
(
    'Image Enhancer',
    'Improves the quality of images, especially screenshots.',
    'tool',
    'https://github.com/ComposioHQ/awesome-claude-skills/tree/master/image-enhancer',
    'Media & Content',
    5,
    true,
    '{"source": "awesome-claude-skills", "slug": "image-enhancer", "github_url": "https://github.com/ComposioHQ/awesome-claude-skills/tree/master/image-enhancer"}'::jsonb
),
(
    'Claude Epub Skill',
    'Parse and analyze EPUB ebook contents for querying or summarizing.',
    'tool',
    'https://github.com/smerchek/claude-epub-skill',
    'Media & Content',
    5,
    true,
    '{"source": "awesome-claude-skills", "slug": "claude-epub-skill", "github_url": "https://github.com/smerchek/claude-epub-skill"}'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    implementation_ref = EXCLUDED.implementation_ref,
    category = EXCLUDED.category,
    complexity_level = EXCLUDED.complexity_level,
    metadata = EXCLUDED.metadata;

-- Collaboration & Project Management (5)
INSERT INTO skills (
    name, description, implementation_type, implementation_ref, 
    category, complexity_level, is_active, metadata
) VALUES 
(
    'Git Pushing',
    'Automate git operations and repository interactions.',
    'tool',
    'https://github.com/mhattingpete/claude-skills-marketplace/tree/main/engineering-workflow-plugin/skills/git-pushing',
    'Collaboration & Project Management',
    5,
    true,
    '{"source": "awesome-claude-skills", "slug": "git-pushing", "github_url": "https://github.com/mhattingpete/claude-skills-marketplace/tree/main/engineering-workflow-plugin/skills/git-pushing"}'::jsonb
),
(
    'Review Implementing',
    'Evaluate code implementation plans and align with specs.',
    'workflow',
    'https://github.com/mhattingpete/claude-skills-marketplace/tree/main/engineering-workflow-plugin/skills/review-implementing',
    'Collaboration & Project Management',
    6,
    true,
    '{"source": "awesome-claude-skills", "slug": "review-implementing", "github_url": "https://github.com/mhattingpete/claude-skills-marketplace/tree/main/engineering-workflow-plugin/skills/review-implementing"}'::jsonb
),
(
    'Test Fixing',
    'Detect failing tests and propose patches or fixes.',
    'workflow',
    'https://github.com/mhattingpete/claude-skills-marketplace/tree/main/engineering-workflow-plugin/skills/test-fixing',
    'Collaboration & Project Management',
    6,
    true,
    '{"source": "awesome-claude-skills", "slug": "test-fixing", "github_url": "https://github.com/mhattingpete/claude-skills-marketplace/tree/main/engineering-workflow-plugin/skills/test-fixing"}'::jsonb
),
(
    'Meeting Insights Analyzer',
    'Transforms your meeting transcripts into actionable insights about your communication patterns',
    'tool',
    'https://github.com/ComposioHQ/awesome-claude-skills/blob/master/meeting-insights-analyzer/',
    'Collaboration & Project Management',
    6,
    true,
    '{"source": "awesome-claude-skills", "slug": "meeting-insights-analyzer", "github_url": "https://github.com/ComposioHQ/awesome-claude-skills/blob/master/meeting-insights-analyzer/"}'::jsonb
),
(
    'Linear CLI Skill',
    'A skill teaching claude how to use linear-CLI (provided alongside the skill), meant to replace linear MCP.',
    'tool',
    'https://github.com/Valian/linear-cli-skill',
    'Collaboration & Project Management',
    6,
    true,
    '{"source": "awesome-claude-skills", "slug": "linear-cli-skill", "github_url": "https://github.com/Valian/linear-cli-skill"}'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    implementation_ref = EXCLUDED.implementation_ref,
    category = EXCLUDED.category,
    complexity_level = EXCLUDED.complexity_level,
    metadata = EXCLUDED.metadata;

-- Security & Web Testing (4)
INSERT INTO skills (
    name, description, implementation_type, implementation_ref, 
    category, complexity_level, is_active, metadata
) VALUES 
(
    'Ffuf Claude Skill',
    'Integrate Claude with FFUF (fuzzing) and analyze results for vulnerabilities.',
    'tool',
    'https://github.com/jthack/ffuf_claude_skill',
    'Security & Web Testing',
    7,
    true,
    '{"source": "awesome-claude-skills", "slug": "ffuf_claude_skill", "github_url": "https://github.com/jthack/ffuf_claude_skill"}'::jsonb
),
(
    'Defense In Depth',
    'Implement multi-layered testing and security best practices.',
    'workflow',
    'https://github.com/obra/superpowers/blob/main/skills/defense-in-depth',
    'Security & Web Testing',
    7,
    true,
    '{"source": "awesome-claude-skills", "slug": "defense-in-depth", "github_url": "https://github.com/obra/superpowers/blob/main/skills/defense-in-depth"}'::jsonb
),
(
    'Webapp Testing',
    'Toolkit for interacting with and testing local web applications using Playwright.',
    'tool',
    'https://github.com/anthropics/skills/tree/main/webapp-testing',
    'Security & Web Testing',
    7,
    true,
    '{"source": "awesome-claude-skills", "slug": "webapp-testing", "github_url": "https://github.com/anthropics/skills/tree/main/webapp-testing"}'::jsonb
),
(
    'Systematic Debugging',
    'Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes',
    'workflow',
    'https://github.com/obra/superpowers/blob/main/skills/systematic-debugging',
    'Security & Web Testing',
    6,
    true,
    '{"source": "awesome-claude-skills", "slug": "systematic-debugging", "github_url": "https://github.com/obra/superpowers/blob/main/skills/systematic-debugging"}'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    implementation_ref = EXCLUDED.implementation_ref,
    category = EXCLUDED.category,
    complexity_level = EXCLUDED.complexity_level,
    metadata = EXCLUDED.metadata;

-- Utility & Automation (4)
INSERT INTO skills (
    name, description, implementation_type, implementation_ref, 
    category, complexity_level, is_active, metadata
) VALUES 
(
    'File Organizer',
    'Intelligently organizes your files and folders across your computer.',
    'tool',
    'https://github.com/ComposioHQ/awesome-claude-skills/tree/master/file-organizer',
    'Utility & Automation',
    5,
    true,
    '{"source": "awesome-claude-skills", "slug": "file-organizer", "github_url": "https://github.com/ComposioHQ/awesome-claude-skills/tree/master/file-organizer"}'::jsonb
),
(
    'Invoice Organizer',
    'Automatically organizes invoices and receipts for tax preparation',
    'tool',
    'https://github.com/ComposioHQ/awesome-claude-skills/blob/master/invoice-organizer/SKILL.md',
    'Utility & Automation',
    5,
    true,
    '{"source": "awesome-claude-skills", "slug": "invoice-organizer", "github_url": "https://github.com/ComposioHQ/awesome-claude-skills/blob/master/invoice-organizer/SKILL.md"}'::jsonb
),
(
    'Skill Creator Tool',
    'Template / helper to build new Claude skills.',
    'tool',
    'https://github.com/anthropics/skills/tree/main/skill-creator',
    'Utility & Automation',
    5,
    true,
    '{"source": "awesome-claude-skills", "slug": "skill-creator", "github_url": "https://github.com/anthropics/skills/tree/main/skill-creator"}'::jsonb
),
(
    'Template Skill Tool',
    'Minimal skeleton for a new skill project structure.',
    'tool',
    'https://github.com/anthropics/skills/tree/main/template-skill',
    'Utility & Automation',
    3,
    true,
    '{"source": "awesome-claude-skills", "slug": "template-skill", "github_url": "https://github.com/anthropics/skills/tree/main/template-skill"}'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    implementation_ref = EXCLUDED.implementation_ref,
    category = EXCLUDED.category,
    complexity_level = EXCLUDED.complexity_level,
    metadata = EXCLUDED.metadata;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

SELECT 
    category,
    COUNT(*) as skill_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM skills
GROUP BY category
ORDER BY skill_count DESC;

-- Expected Result: 58 total skills across all categories


