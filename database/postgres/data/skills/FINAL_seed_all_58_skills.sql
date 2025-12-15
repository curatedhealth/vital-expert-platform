-- ============================================================================
-- SKILLS SEED - SCHEMA-COMPATIBLE VERSION
-- ============================================================================
-- All 58 skills (16 VITAL + 42 Awesome Claude)
-- Uses complexity_score (1-10) which auto-populates complexity_level via trigger
-- Ready for manual execution
-- ============================================================================

BEGIN;

-- ============================================================================
-- VITAL COMMAND CENTER SKILLS (16 skills)
-- ============================================================================

-- Document Processing (4 skills)
INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'DOCX Creation & Editing', 'docx-creation-editing', 'Create, edit, and analyze Word documents with tracked changes, comments, and formatting. Supports OOXML manipulation.', 'tool', 'skills-main/document-skills/docx', 'Document Processing', 7, true, '{"source": "vital-command-center", "folder": "document-skills/docx"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'docx-creation-editing');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'PDF Processing & Analysis', 'pdf-processing-analysis', 'Extract text, tables, metadata from PDFs. Merge, annotate, and process PDF documents.', 'tool', 'skills-main/document-skills/pdf', 'Document Processing', 7, true, '{"source": "vital-command-center", "folder": "document-skills/pdf"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'pdf-processing-analysis');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'PPTX Creation & Editing', 'pptx-creation-editing', 'Generate, read, and adjust PowerPoint slides, layouts, and templates. OOXML-based manipulation.', 'tool', 'skills-main/document-skills/pptx', 'Document Processing', 7, true, '{"source": "vital-command-center", "folder": "document-skills/pptx"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'pptx-creation-editing');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'XLSX Spreadsheet Processing', 'xlsx-spreadsheet-processing', 'Excel spreadsheet manipulation: formulas, charts, data transformations, and analysis.', 'tool', 'skills-main/document-skills/xlsx', 'Document Processing', 6, true, '{"source": "vital-command-center", "folder": "document-skills/xlsx"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'xlsx-spreadsheet-processing');

-- Creative & Design (4 skills)
INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Algorithmic Art Generation', 'algorithmic-art-generation', 'Generate algorithmic and generative art using code-based creative approaches.', 'tool', 'skills-main/algorithmic-art', 'Creative & Design', 6, true, '{"source": "vital-command-center", "folder": "algorithmic-art"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'algorithmic-art-generation');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Brand Guidelines & Styling', 'brand-guidelines-styling', 'Apply Anthropic brand guidelines and consistent styling to documents and designs.', 'prompt', 'skills-main/brand-guidelines', 'Creative & Design', 4, true, '{"source": "vital-command-center", "folder": "brand-guidelines"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'brand-guidelines-styling');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Canvas Design & Graphics', 'canvas-design-graphics', 'Visual design in canvas with support for multiple fonts and design elements.', 'tool', 'skills-main/canvas-design', 'Creative & Design', 6, true, '{"source": "vital-command-center", "folder": "canvas-design"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'canvas-design-graphics');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Theme Factory & Generation', 'theme-factory-generation', 'Generate and apply design themes across documents and applications with consistent styling.', 'workflow', 'skills-main/theme-factory', 'Creative & Design', 5, true, '{"source": "vital-command-center", "folder": "theme-factory"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'theme-factory-generation');

-- Development & Code (5 skills)
INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Frontend Design & Development', 'frontend-design-development', 'Design and develop modern frontend user interfaces with best practices and modern frameworks.', 'tool', 'skills-main/frontend-design', 'Development & Code', 7, true, '{"source": "vital-command-center", "folder": "frontend-design"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'frontend-design-development');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'MCP Server Development', 'mcp-server-development', 'Build and deploy Model Context Protocol (MCP) servers for Claude integration and extensions.', 'tool', 'skills-main/mcp-builder', 'Development & Code', 8, true, '{"source": "vital-command-center", "folder": "mcp-builder"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'mcp-server-development');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Skill Creation & Templates', 'skill-creation-templates', 'Template and helper tools for building new Claude skills with proper structure.', 'tool', 'skills-main/skill-creator', 'Development & Code', 6, true, '{"source": "vital-command-center", "folder": "skill-creator"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'skill-creation-templates');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Web Artifacts Builder', 'web-artifacts-builder', 'Build multi-component HTML artifacts using React, Tailwind CSS, and modern web technologies.', 'tool', 'skills-main/web-artifacts-builder', 'Development & Code', 7, true, '{"source": "vital-command-center", "folder": "web-artifacts-builder"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'web-artifacts-builder');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Web Application Testing', 'web-application-testing', 'Toolkit for interacting with and testing local web applications using Playwright automation.', 'tool', 'skills-main/webapp-testing', 'Development & Code', 7, true, '{"source": "vital-command-center", "folder": "webapp-testing"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'web-application-testing');

-- Communication & Utilities (3 skills)
INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Internal Communications', 'internal-communications', 'Create internal communications including status reports, leadership updates, newsletters, and company announcements.', 'prompt', 'skills-main/internal-comms', 'Communication & Writing', 5, true, '{"source": "vital-command-center", "folder": "internal-comms"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'internal-communications');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Slack GIF Creation', 'slack-gif-creation', 'Create animated GIFs for Slack with custom animations, effects, typography, and branding.', 'tool', 'skills-main/slack-gif-creator', 'Creative & Design', 6, true, '{"source": "vital-command-center", "folder": "slack-gif-creator"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'slack-gif-creation');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Template Skill Framework', 'template-skill-framework', 'Minimal skeleton and template for creating new skill project structures.', 'tool', 'skills-main/template-skill', 'Development & Code', 3, true, '{"source": "vital-command-center", "folder": "template-skill"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'template-skill-framework');

-- ============================================================================
-- AWESOME CLAUDE SKILLS (42 skills)
-- ============================================================================

-- Scientific & Research Tools (4 skills)
INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Scientific Databases Access', 'scientific-databases-access', 'Access to 26 scientific databases including PubMed, PubChem, UniProt, ChEMBL, and AlphaFold DB for research.', 'tool', 'https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-databases', 'Scientific & Research', 8, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-databases"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'scientific-databases-access');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Scientific Lab Integrations', 'scientific-lab-integrations', 'Platform integrations for lab automation and workflow management: Benchling, DNAnexus, Opentrons, and more.', 'tool', 'https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-integrations', 'Scientific & Research', 8, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-integrations"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'scientific-lab-integrations');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Scientific Python Packages', 'scientific-python-packages', '58 specialized Python packages for bioinformatics, cheminformatics, machine learning, and scientific data analysis.', 'tool', 'https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-packages', 'Scientific & Research', 9, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-packages"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'scientific-python-packages');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Scientific Thinking & Analysis', 'scientific-thinking-analysis', 'Analysis tools and document processing for scientific writing, visualization, and research methodology.', 'tool', 'https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-thinking', 'Scientific & Research', 7, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-thinking"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'scientific-thinking-analysis');

-- Development & Code Tools (8 skills)
INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'HTML Artifacts Builder', 'html-artifacts-builder', 'Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using React, Tailwind CSS, and shadcn/ui.', 'tool', 'https://github.com/anthropics/skills/tree/main/artifacts-builder', 'Development & Code', 7, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/anthropics/skills/tree/main/artifacts-builder"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'html-artifacts-builder');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Test Driven Development', 'test-driven-development', 'TDD workflow for implementing features and bugfixes. Write tests before implementation code.', 'workflow', 'https://github.com/obra/superpowers/tree/main/skills/test-driven-development', 'Development & Code', 6, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/obra/superpowers/tree/main/skills/test-driven-development"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'test-driven-development');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Git Worktrees Management', 'git-worktrees-management', 'Create isolated git worktrees with smart directory selection and safety verification for parallel development.', 'tool', 'https://github.com/obra/superpowers/blob/main/skills/using-git-worktrees/', 'Development & Code', 5, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/obra/superpowers/blob/main/skills/using-git-worktrees/"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'git-worktrees-management');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Development Branch Completion', 'development-branch-completion', 'Guide completion of development work by presenting clear options and handling the chosen workflow.', 'workflow', 'https://github.com/obra/superpowers/tree/main/skills/finishing-a-development-branch', 'Development & Code', 5, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/obra/superpowers/tree/main/skills/finishing-a-development-branch"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'development-branch-completion');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'PICT Test Case Design', 'pict-test-case-design', 'Design comprehensive test cases using PICT (Pairwise Independent Combinatorial Testing) for optimal coverage.', 'tool', 'https://github.com/omkamal/pypict-claude-skill', 'Development & Code', 7, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/omkamal/pypict-claude-skill"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'pict-test-case-design');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'AWS Development & CDK', 'aws-development-cdk', 'AWS development with CDK best practices, cost optimization, MCP servers, and serverless/event-driven architecture patterns.', 'tool', 'https://github.com/zxkane/aws-skills', 'Development & Code', 8, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/zxkane/aws-skills"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'aws-development-cdk');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Move Code Quality Analysis', 'move-code-quality-analysis', 'Analyze Move language packages against the official Move Book Code Quality Checklist for Move 2024 Edition compliance.', 'tool', 'https://github.com/1NickPappas/move-code-quality-skill', 'Development & Code', 7, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/1NickPappas/move-code-quality-skill"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'move-code-quality-analysis');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Terminal Window Titling', 'terminal-window-titling', 'Give each Claude Code terminal window a dynamic title describing the work being done for better organization.', 'tool', 'https://github.com/bluzername/claude-code-terminal-title', 'Development & Code', 4, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/bluzername/claude-code-terminal-title"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'terminal-window-titling');

-- Data & Analysis (2 skills)
INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Root Cause Error Tracing', 'root-cause-error-tracing', 'Trace errors that occur deep in execution back to find the original trigger and root cause.', 'workflow', 'https://github.com/obra/superpowers/tree/main/skills/root-cause-tracing', 'Data & Analysis', 6, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/obra/superpowers/tree/main/skills/root-cause-tracing"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'root-cause-error-tracing');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'CSV Data Summarization', 'csv-data-summarization', 'Automatically analyze CSV files: column types, distributions, missing data, correlations, and statistics.', 'tool', 'https://github.com/coffeefuelbump/csv-data-summarizer-claude-skill', 'Data & Analysis', 5, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/coffeefuelbump/csv-data-summarizer-claude-skill"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'csv-data-summarization');

-- Writing & Research (5 skills)
INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Article Text Extraction', 'article-text-extraction', 'Extract full article text and metadata from web pages for research and content analysis.', 'tool', 'https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/article-extractor', 'Writing & Research', 5, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/article-extractor"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'article-text-extraction');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Content Research & Writing', 'content-research-writing', 'Write high-quality content with research, citations, hooks, iterative outlines, and real-time section feedback.', 'workflow', 'https://github.com/ComposioHQ/awesome-claude-skills/tree/master/content-research-writer', 'Writing & Research', 7, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/ComposioHQ/awesome-claude-skills/tree/master/content-research-writer"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'content-research-writing');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Brainstorming & Ideation', 'brainstorming-ideation', 'Transform rough ideas into fully-formed designs through structured questioning and alternative exploration.', 'prompt', 'https://github.com/obra/superpowers/tree/main/skills/brainstorming', 'Writing & Research', 4, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/obra/superpowers/tree/main/skills/brainstorming"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'brainstorming-ideation');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Family History Research', 'family-history-research', 'Assistance with planning family history and genealogy research projects with structured methodology.', 'workflow', 'https://github.com/emaynard/claude-family-history-research-skill', 'Writing & Research', 5, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/emaynard/claude-family-history-research-skill"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'family-history-research');

-- Learning & Knowledge (2 skills)
INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Knowledge Network Tapestry', 'knowledge-network-tapestry', 'Interlink and summarize related documents into comprehensive knowledge networks and concept maps.', 'tool', 'https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/tapestry', 'Learning & Knowledge', 6, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/tapestry"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'knowledge-network-tapestry');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Ship-Learn-Next Iteration', 'ship-learn-next-iteration', 'Iterate on what to build or learn next based on feedback loops and continuous improvement cycles.', 'workflow', 'https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/ship-learn-next', 'Learning & Knowledge', 5, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/ship-learn-next"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'ship-learn-next-iteration');

-- Media & Content (4 skills)
INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'YouTube Transcript Fetching', 'youtube-transcript-fetching', 'Fetch transcripts from YouTube videos and prepare summaries for content analysis and research.', 'tool', 'https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/youtube-transcript', 'Media & Content', 5, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/youtube-transcript"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'youtube-transcript-fetching');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Video Download & Archival', 'video-download-archival', 'Download videos from YouTube and other platforms for offline viewing, editing, or archival purposes.', 'tool', 'https://github.com/ComposioHQ/awesome-claude-skills/tree/master/video-downloader', 'Media & Content', 5, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/ComposioHQ/awesome-claude-skills/tree/master/video-downloader"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'video-download-archival');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Image Quality Enhancement', 'image-quality-enhancement', 'Improve the quality of images, especially screenshots, through enhancement and optimization techniques.', 'tool', 'https://github.com/ComposioHQ/awesome-claude-skills/tree/master/image-enhancer', 'Media & Content', 5, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/ComposioHQ/awesome-claude-skills/tree/master/image-enhancer"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'image-quality-enhancement');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'EPUB eBook Parsing', 'epub-ebook-parsing', 'Parse and analyze EPUB ebook contents for querying, summarizing, and content extraction.', 'tool', 'https://github.com/smerchek/claude-epub-skill', 'Media & Content', 5, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/smerchek/claude-epub-skill"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'epub-ebook-parsing');

-- Collaboration & Project Management (5 skills)
INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Git Operations Automation', 'git-operations-automation', 'Automate git operations and repository interactions including pushing, pulling, and branch management.', 'tool', 'https://github.com/mhattingpete/claude-skills-marketplace/tree/main/engineering-workflow-plugin/skills/git-pushing', 'Collaboration & Project Management', 5, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/mhattingpete/claude-skills-marketplace/tree/main/engineering-workflow-plugin/skills/git-pushing"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'git-operations-automation');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Code Review & Implementation', 'code-review-implementation', 'Evaluate code implementation plans and align with specifications through systematic review processes.', 'workflow', 'https://github.com/mhattingpete/claude-skills-marketplace/tree/main/engineering-workflow-plugin/skills/review-implementing', 'Collaboration & Project Management', 6, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/mhattingpete/claude-skills-marketplace/tree/main/engineering-workflow-plugin/skills/review-implementing"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'code-review-implementation');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Test Failure Fixing', 'test-failure-fixing', 'Detect failing tests and propose patches or fixes with root cause analysis and regression prevention.', 'workflow', 'https://github.com/mhattingpete/claude-skills-marketplace/tree/main/engineering-workflow-plugin/skills/test-fixing', 'Collaboration & Project Management', 6, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/mhattingpete/claude-skills-marketplace/tree/main/engineering-workflow-plugin/skills/test-fixing"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'test-failure-fixing');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Meeting Insights Analysis', 'meeting-insights-analysis', 'Transform meeting transcripts into actionable insights about communication patterns and decision-making.', 'tool', 'https://github.com/ComposioHQ/awesome-claude-skills/blob/master/meeting-insights-analyzer/', 'Collaboration & Project Management', 6, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/ComposioHQ/awesome-claude-skills/blob/master/meeting-insights-analyzer/"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'meeting-insights-analysis');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Linear CLI Integration', 'linear-cli-integration', 'Teach Claude how to use linear-CLI for project management, meant to replace Linear MCP integration.', 'tool', 'https://github.com/Valian/linear-cli-skill', 'Collaboration & Project Management', 6, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/Valian/linear-cli-skill"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'linear-cli-integration');

-- Security & Web Testing (4 skills)
INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'FFUF Fuzzing Integration', 'ffuf-fuzzing-integration', 'Integrate Claude with FFUF fuzzing tool and analyze results for security vulnerabilities.', 'tool', 'https://github.com/jthack/ffuf_claude_skill', 'Security & Web Testing', 7, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/jthack/ffuf_claude_skill"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'ffuf-fuzzing-integration');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Defense-in-Depth Testing', 'defense-in-depth-testing', 'Implement multi-layered testing and security best practices with comprehensive coverage strategies.', 'workflow', 'https://github.com/obra/superpowers/blob/main/skills/defense-in-depth', 'Security & Web Testing', 7, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/obra/superpowers/blob/main/skills/defense-in-depth"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'defense-in-depth-testing');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Playwright Web Testing', 'playwright-web-testing', 'Toolkit for interacting with and testing local web applications using Playwright automation framework.', 'tool', 'https://github.com/anthropics/skills/tree/main/webapp-testing', 'Security & Web Testing', 7, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/anthropics/skills/tree/main/webapp-testing"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'playwright-web-testing');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Systematic Debugging', 'systematic-debugging', 'Use when encountering bugs, test failures, or unexpected behavior. Systematic approach before proposing fixes.', 'workflow', 'https://github.com/obra/superpowers/blob/main/skills/systematic-debugging', 'Security & Web Testing', 6, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/obra/superpowers/blob/main/skills/systematic-debugging"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'systematic-debugging');

-- Utility & Automation (4 skills)
INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Intelligent File Organization', 'intelligent-file-organization', 'Intelligently organize files and folders across your computer with smart categorization and naming.', 'tool', 'https://github.com/ComposioHQ/awesome-claude-skills/tree/master/file-organizer', 'Utility & Automation', 5, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/ComposioHQ/awesome-claude-skills/tree/master/file-organizer"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'intelligent-file-organization');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Invoice & Receipt Organization', 'invoice-receipt-organization', 'Automatically organize invoices and receipts for tax preparation with categorization and tracking.', 'tool', 'https://github.com/ComposioHQ/awesome-claude-skills/blob/master/invoice-organizer/SKILL.md', 'Utility & Automation', 5, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/ComposioHQ/awesome-claude-skills/blob/master/invoice-organizer/SKILL.md"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'invoice-receipt-organization');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Claude Skill Creator Tool', 'claude-skill-creator-tool', 'Template and helper to build new Claude skills with proper structure and best practices.', 'tool', 'https://github.com/anthropics/skills/tree/main/skill-creator', 'Utility & Automation', 5, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/anthropics/skills/tree/main/skill-creator"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'claude-skill-creator-tool');

INSERT INTO skills (name, slug, description, implementation_type, implementation_ref, category, complexity_score, is_active, metadata)
SELECT 'Template Skill Skeleton', 'template-skill-skeleton', 'Minimal skeleton for creating new skill project structures with essential boilerplate.', 'tool', 'https://github.com/anthropics/skills/tree/main/template-skill', 'Utility & Automation', 3, true, '{"source": "awesome-claude-skills", "github_url": "https://github.com/anthropics/skills/tree/main/template-skill"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE slug = 'template-skill-skeleton');

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Total count
SELECT 
    '✅ Total skills with implementation_type:' as status,
    COUNT(*) as count
FROM skills 
WHERE implementation_type IS NOT NULL;

-- By source
SELECT 
    metadata->>'source' as source,
    COUNT(*) as count
FROM skills 
WHERE implementation_type IS NOT NULL
GROUP BY metadata->>'source'
ORDER BY count DESC;

-- By category
SELECT 
    category,
    COUNT(*) as count,
    ROUND(AVG(complexity_score), 1) as avg_complexity
FROM skills 
WHERE implementation_type IS NOT NULL
GROUP BY category
ORDER BY count DESC;

-- By complexity
SELECT 
    complexity_level,
    COUNT(*) as count,
    MIN(complexity_score) as min_score,
    MAX(complexity_score) as max_score
FROM skills 
WHERE implementation_type IS NOT NULL
GROUP BY complexity_level
ORDER BY min_score;

-- Sample of loaded skills
SELECT 
    name,
    category,
    complexity_score,
    complexity_level,
    implementation_type
FROM skills
WHERE implementation_type IS NOT NULL
ORDER BY complexity_score DESC, name
LIMIT 10;


