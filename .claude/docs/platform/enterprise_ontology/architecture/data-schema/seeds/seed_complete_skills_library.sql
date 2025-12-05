-- ============================================================================
-- COMPREHENSIVE SKILLS LIBRARY SEED
-- ============================================================================
-- Date: 2025-11-22
-- Purpose: Seed ALL skills from multiple sources
-- Sources:
--   1. Anthropic Official Skills (github.com/anthropics/skills) - 16 skills
--   2. Awesome Claude Skills Community (github.com/BehiSecc/awesome-claude-skills) - 40+ skills
--   3. alirezarezvani/claude-skills - 25 production-ready skills
--   4. Medical Affairs & Pharma Custom Skills - 75+ skills
-- Total: 156+ skills
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'SEEDING COMPREHENSIVE SKILLS LIBRARY';
    RAISE NOTICE '=================================================================';
END $$;

-- ============================================================================
-- PART 1: ANTHROPIC OFFICIAL SKILLS (16 skills)
-- ============================================================================

DO $$ BEGIN RAISE NOTICE 'Part 1: Anthropic Official Skills...'; END $$;

INSERT INTO public.skills (name, slug, category, complexity_level, is_core, is_executable, skill_type, description) VALUES
-- Creative & Design
('Algorithmic Art', 'algorithmic-art', 'Creative & Design', 'advanced', false, true, 'built_in', 'Create generative art using p5.js with seeded randomness, flow fields, and particle systems'),
('Canvas Design', 'canvas-design', 'Creative & Design', 'advanced', false, true, 'built_in', 'Design beautiful visual art in .png and .pdf formats using design philosophies'),
('Slack GIF Creator', 'slack-gif-creator', 'Creative & Design', 'intermediate', false, true, 'built_in', 'Create animated GIFs optimized for Slack size constraints'),
('Theme Factory', 'theme-factory', 'Creative & Design', 'intermediate', false, true, 'built_in', 'Style artifacts with 10 pre-set professional themes or generate custom themes on-the-fly'),

-- Development & Technical
('Artifacts Builder', 'artifacts-builder', 'Development & Technical', 'advanced', true, true, 'built_in', 'Build complex claude.ai HTML artifacts using React, Tailwind CSS, and shadcn/ui components'),
('MCP Server Builder', 'mcp-builder', 'Development & Technical', 'expert', true, true, 'built_in', 'Guide for creating high-quality MCP servers to integrate external APIs and services'),
('Web App Testing', 'webapp-testing', 'Development & Technical', 'advanced', true, true, 'built_in', 'Test local web applications using Playwright for UI verification and debugging'),
('Frontend Design', 'frontend-design', 'Development & Technical', 'advanced', false, true, 'built_in', 'Design and build modern frontend interfaces with best practices'),

-- Enterprise & Communication
('Brand Guidelines', 'brand-guidelines', 'Enterprise & Communication', 'intermediate', false, true, 'built_in', 'Apply official brand colors and typography to artifacts'),
('Internal Communications', 'internal-comms', 'Enterprise & Communication', 'intermediate', true, true, 'built_in', 'Write internal communications like status reports, newsletters, and FAQs'),

-- Meta Skills
('Skill Creator', 'skill-creator', 'Meta Skills', 'advanced', true, false, 'built_in', 'Guide for creating effective skills that extend Claude capabilities'),
('Template Skill', 'template-skill', 'Meta Skills', 'basic', false, false, 'built_in', 'A basic template to use as a starting point for new skills'),

-- Document Skills (Source-available, production-ready)
('Word Document Processor', 'docx-processor', 'Document Processing', 'advanced', true, true, 'built_in', 'Create and edit Microsoft Word documents with formatting, tables, tracked changes, and comments'),
('PDF Processor', 'pdf-processor', 'Document Processing', 'advanced', true, true, 'built_in', 'Extract text, merge PDFs, handle forms, and manipulate PDF documents'),
('PowerPoint Processor', 'pptx-processor', 'Document Processing', 'advanced', true, true, 'built_in', 'Generate and edit PowerPoint presentations with slides, charts, and media'),
('Excel Processor', 'xlsx-processor', 'Document Processing', 'advanced', true, true, 'built_in', 'Create and manipulate spreadsheets with formulas, charts, and data analysis')

ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 2: AWESOME CLAUDE SKILLS - DEVELOPMENT & CODE TOOLS
-- ============================================================================

DO $$ BEGIN RAISE NOTICE 'Part 2: Development & Code Tools...'; END $$;

INSERT INTO public.skills (name, slug, category, complexity_level, is_core, is_executable, skill_type, description) VALUES
-- Development Workflow
('Test-Driven Development', 'test-driven-development', 'Development & Code Tools', 'advanced', true, true, 'custom', 'Implements TDD methodology - writes tests before writing implementation code'),
('Git Worktrees Manager', 'using-git-worktrees', 'Development & Code Tools', 'intermediate', false, true, 'custom', 'Creates isolated git worktrees with directory selection for parallel development'),
('Finishing Development Branch', 'finishing-dev-branch', 'Development & Code Tools', 'intermediate', false, true, 'custom', 'Guides development completion with workflow options for merging, rebasing, or continuing'),
('Git Push Automation', 'git-pushing', 'Development & Code Tools', 'basic', false, true, 'custom', 'Automates git operations including committing, pushing, and repository interactions'),
('Review Implementation', 'review-implementing', 'Development & Code Tools', 'advanced', false, true, 'custom', 'Evaluates code implementation plans against specifications and requirements'),
('Test Fixing', 'test-fixing', 'Development & Code Tools', 'intermediate', false, true, 'custom', 'Identifies failing tests and proposes patches to fix them'),

-- Testing & Quality
('Pairwise Testing (PICT)', 'pypict-testing', 'Development & Code Tools', 'advanced', false, true, 'custom', 'Design comprehensive test cases using PICT (Pairwise Independent Combinatorial Testing)'),
('Defense in Depth Testing', 'defense-in-depth', 'Development & Code Tools', 'expert', false, true, 'custom', 'Implements multi-layered testing and security best practices'),
('Systematic Debugging', 'systematic-debugging', 'Development & Code Tools', 'advanced', true, true, 'custom', 'Structured approach to debugging bugs and test failures with root cause analysis'),
('Root Cause Tracing', 'root-cause-tracing', 'Development & Code Tools', 'advanced', true, true, 'custom', 'Traces execution errors back to original trigger points in the codebase'),

-- Specialized Development
('AWS Development Skills', 'aws-skills', 'Development & Code Tools', 'expert', false, true, 'custom', 'AWS development with CDK patterns and serverless architecture'),
('Move Language Quality', 'move-code-quality', 'Development & Code Tools', 'expert', false, true, 'custom', 'Analyzes Move language packages for compliance with standards'),
('Terminal Title Automation', 'claude-code-terminal-title', 'Development & Code Tools', 'basic', false, true, 'custom', 'Dynamically titles terminal windows describing current work context')

ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 3: AWESOME CLAUDE SKILLS - DATA & ANALYSIS
-- ============================================================================

DO $$ BEGIN RAISE NOTICE 'Part 3: Data & Analysis Skills...'; END $$;

INSERT INTO public.skills (name, slug, category, complexity_level, is_core, is_executable, skill_type, description) VALUES
('CSV Data Summarizer', 'csv-data-summarizer', 'Data & Analysis', 'intermediate', true, true, 'custom', 'Analyzes CSV structure, distributions, correlations, and provides comprehensive data summaries')

ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 4: AWESOME CLAUDE SKILLS - SCIENTIFIC & RESEARCH
-- ============================================================================

DO $$ BEGIN RAISE NOTICE 'Part 4: Scientific & Research Skills...'; END $$;

INSERT INTO public.skills (name, slug, category, complexity_level, is_core, is_executable, skill_type, description) VALUES
('Scientific Databases Access', 'scientific-databases', 'Scientific & Research', 'expert', true, true, 'custom', 'Access to 26 research databases including PubMed, AlphaFold, UniProt, ChEMBL, and ClinicalTrials.gov'),
('Lab Automation Integrations', 'scientific-integrations', 'Scientific & Research', 'expert', false, true, 'custom', 'Lab automation platform integrations for Benchling, Opentrons, and scientific workflows'),
('Scientific Python Packages', 'scientific-packages', 'Scientific & Research', 'expert', true, true, 'custom', '58 specialized Python packages for bioinformatics, cheminformatics, machine learning, and data analysis'),
('Scientific Thinking Tools', 'scientific-thinking', 'Scientific & Research', 'advanced', true, false, 'custom', 'Scientific writing tools, visualization, methodology support, and research planning')

ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 5: AWESOME CLAUDE SKILLS - WRITING & RESEARCH
-- ============================================================================

DO $$ BEGIN RAISE NOTICE 'Part 5: Writing & Research Skills...'; END $$;

INSERT INTO public.skills (name, slug, category, complexity_level, is_core, is_executable, skill_type, description) VALUES
('Article Extractor', 'article-extractor', 'Writing & Research', 'intermediate', true, true, 'custom', 'Extract full article text and metadata from web pages'),
('Content Research Writer', 'content-research-writer', 'Writing & Research', 'advanced', false, true, 'custom', 'Assists in writing high-quality content by conducting research, adding citations, improving hooks'),
('Brainstorming', 'brainstorming', 'Writing & Research', 'intermediate', false, false, 'custom', 'Transform rough ideas into fully-formed designs through structured questioning'),
('Family History Research', 'family-history-research', 'Writing & Research', 'intermediate', false, true, 'custom', 'Provides assistance with planning family history and genealogy research projects')

ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 6: AWESOME CLAUDE SKILLS - LEARNING & KNOWLEDGE
-- ============================================================================

DO $$ BEGIN RAISE NOTICE 'Part 6: Learning & Knowledge Skills...'; END $$;

INSERT INTO public.skills (name, slug, category, complexity_level, is_core, is_executable, skill_type, description) VALUES
('Tapestry Knowledge Networks', 'tapestry', 'Learning & Knowledge', 'advanced', false, true, 'custom', 'Interlink and summarize related documents into knowledge networks'),
('Ship Learn Next', 'ship-learn-next', 'Learning & Knowledge', 'intermediate', false, false, 'custom', 'Skill to help iterate on what to build or learn next, based on feedback loops')

ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 7: AWESOME CLAUDE SKILLS - MEDIA & CONTENT
-- ============================================================================

DO $$ BEGIN RAISE NOTICE 'Part 7: Media & Content Skills...'; END $$;

INSERT INTO public.skills (name, slug, category, complexity_level, is_core, is_executable, skill_type, description) VALUES
('YouTube Transcript Fetcher', 'youtube-transcript', 'Media & Content', 'intermediate', true, true, 'custom', 'Fetches YouTube transcripts and creates summaries and analysis'),
('Video Downloader', 'video-downloader', 'Media & Content', 'intermediate', false, true, 'custom', 'Downloads videos from YouTube and other platforms for offline use'),
('Image Enhancer', 'image-enhancer', 'Media & Content', 'intermediate', false, true, 'custom', 'Improves image quality, particularly for screenshots and low-resolution images'),
('EPUB Parser', 'claude-epub-skill', 'Media & Content', 'intermediate', false, true, 'custom', 'Parses and analyzes EPUB ebook contents including metadata and structure')

ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 8: AWESOME CLAUDE SKILLS - COLLABORATION & PROJECT MANAGEMENT
-- ============================================================================

DO $$ BEGIN RAISE NOTICE 'Part 8: Collaboration & Project Management Skills...'; END $$;

INSERT INTO public.skills (name, slug, category, complexity_level, is_core, is_executable, skill_type, description) VALUES
('Meeting Insights Analyzer', 'meeting-insights-analyzer', 'Collaboration & Project Management', 'advanced', false, true, 'custom', 'Transforms meeting transcripts into actionable insights about communication patterns'),
('Linear CLI Integration', 'linear-cli-skill', 'Collaboration & Project Management', 'intermediate', false, true, 'custom', 'Teaches Claude to use linear-CLI for project management and issue tracking')

ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 9: AWESOME CLAUDE SKILLS - SECURITY & WEB TESTING
-- ============================================================================

DO $$ BEGIN RAISE NOTICE 'Part 9: Security & Web Testing Skills...'; END $$;

INSERT INTO public.skills (name, slug, category, complexity_level, is_core, is_executable, skill_type, description) VALUES
('FFUF Fuzzing Integration', 'ffuf-claude-skill', 'Security & Web Testing', 'expert', false, true, 'custom', 'Integrate Claude with FFUF (fuzzing) and analyze results for vulnerabilities')

ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 10: AWESOME CLAUDE SKILLS - UTILITY & AUTOMATION
-- ============================================================================

DO $$ BEGIN RAISE NOTICE 'Part 10: Utility & Automation Skills...'; END $$;

INSERT INTO public.skills (name, slug, category, complexity_level, is_core, is_executable, skill_type, description) VALUES
('File Organizer', 'file-organizer', 'Utility & Automation', 'intermediate', false, true, 'custom', 'Intelligently organizes your files and folders across your computer'),
('Invoice Organizer', 'invoice-organizer', 'Utility & Automation', 'intermediate', false, true, 'custom', 'Automatically organizes invoices and receipts for tax preparation')

ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 11: ALIREZAREZVANI/CLAUDE-SKILLS - MARKETING & CONTENT
-- ============================================================================

DO $$ BEGIN RAISE NOTICE 'Part 11: Marketing & Content Skills...'; END $$;

INSERT INTO public.skills (name, slug, category, complexity_level, is_core, is_executable, skill_type, description) VALUES
('Content Creator', 'content-creator', 'Marketing & Content', 'advanced', false, true, 'custom', 'Professional-grade brand voice analysis, SEO optimization, and platform-specific content frameworks'),
('Marketing Demand & Acquisition', 'marketing-demand-acquisition', 'Marketing & Content', 'expert', false, true, 'custom', 'Expert demand generation and customer acquisition strategies with CAC calculator'),
('Marketing Strategy & PMM', 'marketing-strategy-pmm', 'Marketing & Content', 'expert', false, true, 'custom', 'Product marketing, positioning, GTM strategy, and competitive intelligence')

ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 12: ALIREZAREZVANI/CLAUDE-SKILLS - EXECUTIVE ADVISORY
-- ============================================================================

DO $$ BEGIN RAISE NOTICE 'Part 12: Executive Advisory Skills...'; END $$;

INSERT INTO public.skills (name, slug, category, complexity_level, is_core, is_executable, skill_type, description) VALUES
('CEO Advisor', 'ceo-advisor', 'Executive Advisory', 'expert', false, true, 'custom', 'Strategic decision-making guidance for organizational leadership with strategy and financial scenario analyzers'),
('CTO Advisor', 'cto-advisor', 'Executive Advisory', 'expert', false, true, 'custom', 'Technical leadership and engineering strategy guidance with tech debt analyzer')

ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 13: ALIREZAREZVANI/CLAUDE-SKILLS - PRODUCT MANAGEMENT
-- ============================================================================

DO $$ BEGIN RAISE NOTICE 'Part 13: Product Management Skills...'; END $$;

INSERT INTO public.skills (name, slug, category, complexity_level, is_core, is_executable, skill_type, description) VALUES
('Product Manager Toolkit', 'product-manager-toolkit', 'Product Management', 'advanced', false, true, 'custom', 'Essential tools and frameworks for modern product management including RICE prioritizer'),
('Agile Product Owner', 'agile-product-owner', 'Product Management', 'advanced', false, true, 'custom', 'Sprint execution and backlog management for agile delivery with user story generator'),
('Product Strategist', 'product-strategist', 'Product Management', 'expert', false, true, 'custom', 'Strategic planning and vision alignment for product leadership with OKR cascade generator'),
('UX Researcher Designer', 'ux-researcher-designer', 'Product Management', 'advanced', false, true, 'custom', 'User research and experience design frameworks with persona generator'),
('UI Design System', 'ui-design-system', 'Product Management', 'advanced', false, true, 'custom', 'Visual design systems and component architecture with design token generator')

ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 14: ALIREZAREZVANI/CLAUDE-SKILLS - PROJECT MANAGEMENT (ATLASSIAN)
-- ============================================================================

DO $$ BEGIN RAISE NOTICE 'Part 14: Project Management Skills...'; END $$;

INSERT INTO public.skills (name, slug, category, complexity_level, is_core, is_executable, skill_type, description) VALUES
('Senior Project Manager', 'senior-project-manager', 'Project Management', 'expert', false, true, 'custom', 'Strategic software project management with portfolio oversight'),
('Scrum Master Expert', 'scrum-master-expert', 'Project Management', 'advanced', false, true, 'custom', 'Agile facilitation for software development teams with sprint planning'),
('Atlassian Jira Expert', 'atlassian-jira-expert', 'Project Management', 'expert', false, true, 'custom', 'Advanced Jira configuration and technical operations with JQL mastery'),
('Atlassian Confluence Expert', 'atlassian-confluence-expert', 'Project Management', 'advanced', false, true, 'custom', 'Knowledge management and documentation architecture'),
('Atlassian Administrator', 'atlassian-administrator', 'Project Management', 'expert', false, true, 'custom', 'System administration for Atlassian suite with user provisioning'),
('Atlassian Template Creator', 'atlassian-template-creator', 'Project Management', 'advanced', false, true, 'custom', 'Template and file creation/modification specialist with 15+ Confluence templates')

ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 15: ALIREZAREZVANI/CLAUDE-SKILLS - ENGINEERING
-- ============================================================================

DO $$ BEGIN RAISE NOTICE 'Part 15: Engineering Skills...'; END $$;

INSERT INTO public.skills (name, slug, category, complexity_level, is_core, is_executable, skill_type, description) VALUES
('Senior Software Architect', 'senior-software-architect', 'Engineering', 'expert', false, true, 'custom', 'System architecture design and technology decisions with architecture diagram generator'),
('Senior Frontend Engineer', 'senior-frontend-engineer', 'Engineering', 'expert', false, true, 'custom', 'Frontend development with React, Next.js, and TypeScript including component generator'),
('Senior Backend Engineer', 'senior-backend-engineer', 'Engineering', 'expert', false, true, 'custom', 'Backend development with Node.js, Express, GraphQL, Go, and Python with API scaffolder'),
('Senior Fullstack Engineer', 'senior-fullstack-engineer', 'Engineering', 'expert', false, true, 'custom', 'End-to-end application development with complete stack integration'),
('Senior QA Testing Engineer', 'senior-qa-testing', 'Engineering', 'expert', false, true, 'custom', 'Quality assurance and test automation with test suite generator'),
('Senior DevOps Engineer', 'senior-devops-engineer', 'Engineering', 'expert', false, true, 'custom', 'CI/CD automation and infrastructure as code with pipeline generator'),
('Senior SecOps Engineer', 'senior-secops-engineer', 'Engineering', 'expert', false, true, 'custom', 'Security operations and vulnerability management with security scanner'),
('Code Reviewer', 'code-reviewer', 'Engineering', 'advanced', false, true, 'custom', 'Automated code review and quality checking with PR analyzer'),
('Senior Security Engineer', 'senior-security-engineer', 'Engineering', 'expert', false, true, 'custom', 'Security architecture, penetration testing, and cryptography implementation')

ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 16: MEDICAL AFFAIRS & PHARMA CUSTOM SKILLS
-- ============================================================================

DO $$ BEGIN RAISE NOTICE 'Part 16: Medical Affairs & Pharma Skills...'; END $$;

INSERT INTO public.skills (name, slug, category, complexity_level, is_core, description) VALUES
-- Scientific & Clinical Skills
('Clinical Research Knowledge', 'clinical-research-knowledge', 'Scientific & Clinical', 'advanced', true, 'Understanding of clinical trial design and execution'),
('Medical Literature Review', 'medical-literature-review', 'Scientific & Clinical', 'intermediate', true, 'Ability to review and synthesize medical literature'),
('Scientific Writing', 'scientific-writing', 'Scientific & Clinical', 'advanced', true, 'Writing scientific and medical documents'),
('Scientific Communication', 'scientific-communication', 'Scientific & Clinical', 'advanced', true, 'Presenting complex scientific information clearly'),
('Evidence Synthesis', 'evidence-synthesis', 'Scientific & Clinical', 'advanced', true, 'Synthesizing clinical and scientific evidence'),
('Clinical Data Analysis', 'clinical-data-analysis', 'Scientific & Clinical', 'advanced', true, 'Analyzing clinical trial data and outcomes'),
('Pharmacology', 'pharmacology', 'Scientific & Clinical', 'expert', true, 'Knowledge of drug mechanisms and pharmacokinetics'),
('Pharmacovigilance', 'pharmacovigilance', 'Scientific & Clinical', 'expert', true, 'Drug safety monitoring and adverse event reporting'),
('Biostatistics', 'biostatistics', 'Scientific & Clinical', 'expert', true, 'Statistical analysis in biomedical research'),
('Epidemiology', 'epidemiology', 'Scientific & Clinical', 'expert', true, 'Disease patterns and population health analysis'),
('Health Economics', 'health-economics', 'Scientific & Clinical', 'expert', true, 'HEOR and cost-effectiveness analysis'),
('Regulatory Knowledge', 'regulatory-knowledge', 'Scientific & Clinical', 'expert', true, 'Understanding of regulatory requirements'),

-- Communication Skills
('Presentation Skills', 'presentation-skills', 'Communication', 'intermediate', true, 'Delivering effective presentations'),
('Public Speaking', 'public-speaking', 'Communication', 'intermediate', false, 'Speaking to large audiences'),
('Medical Writing', 'medical-writing', 'Communication', 'advanced', true, 'Writing for medical audiences'),
('Technical Writing', 'technical-writing', 'Communication', 'intermediate', true, 'Creating technical documentation'),
('Storytelling', 'storytelling', 'Communication', 'intermediate', false, 'Narrative communication of data'),
('Cross-cultural Communication', 'cross-cultural-communication', 'Communication', 'intermediate', false, 'Communicating across cultures'),

-- Interpersonal Skills
('Relationship Building', 'relationship-building', 'Interpersonal', 'intermediate', true, 'Building and maintaining professional relationships'),
('Stakeholder Management', 'stakeholder-management', 'Interpersonal', 'advanced', true, 'Managing diverse stakeholder needs'),
('Negotiation', 'negotiation', 'Interpersonal', 'advanced', false, 'Negotiating agreements and resolutions'),
('Conflict Resolution', 'conflict-resolution', 'Interpersonal', 'intermediate', false, 'Resolving disputes and conflicts'),
('Emotional Intelligence', 'emotional-intelligence', 'Interpersonal', 'intermediate', false, 'Understanding and managing emotions'),
('Active Listening', 'active-listening', 'Interpersonal', 'basic', true, 'Effective listening and comprehension'),
('Collaboration', 'collaboration', 'Interpersonal', 'intermediate', true, 'Working effectively in teams'),
('Mentoring', 'mentoring', 'Interpersonal', 'advanced', false, 'Guiding and developing others'),

-- Leadership & Management
('Strategic Thinking', 'strategic-thinking', 'Leadership & Management', 'expert', true, 'Long-term strategic planning'),
('Team Leadership', 'team-leadership', 'Leadership & Management', 'advanced', true, 'Leading and motivating teams'),
('People Management', 'people-management', 'Leadership & Management', 'advanced', true, 'Managing team performance'),
('Change Management', 'change-management', 'Leadership & Management', 'advanced', false, 'Leading organizational change'),
('Project Management', 'project-management', 'Leadership & Management', 'advanced', true, 'Managing projects and deliverables'),
('Budget Management', 'budget-management', 'Leadership & Management', 'advanced', false, 'Financial planning and management'),
('Decision Making', 'decision-making', 'Leadership & Management', 'advanced', true, 'Making effective decisions'),
('Vision Setting', 'vision-setting', 'Leadership & Management', 'expert', false, 'Defining strategic vision'),

-- Analytical Skills
('Data Analysis', 'data-analysis', 'Analytical', 'advanced', true, 'Analyzing quantitative and qualitative data'),
('Critical Thinking', 'critical-thinking', 'Analytical', 'advanced', true, 'Evaluating information objectively'),
('Problem Solving', 'problem-solving', 'Analytical', 'advanced', true, 'Identifying and solving complex problems'),
('Research Skills', 'research-skills', 'Analytical', 'advanced', true, 'Conducting systematic research'),
('Competitive Intelligence', 'competitive-intelligence', 'Analytical', 'advanced', false, 'Analyzing competitive landscape'),
('Market Analysis', 'market-analysis', 'Analytical', 'advanced', false, 'Understanding market dynamics'),

-- Digital & Technology
('CRM Systems', 'crm-systems', 'Digital & Technology', 'intermediate', true, 'Using customer relationship management systems'),
('Data Visualization', 'data-visualization', 'Digital & Technology', 'intermediate', true, 'Creating visual representations of data'),
('Microsoft Office Suite', 'microsoft-office-suite', 'Digital & Technology', 'basic', true, 'Proficiency in Word, Excel, PowerPoint'),
('Database Management', 'database-management', 'Digital & Technology', 'intermediate', false, 'Managing and querying databases'),
('Digital Collaboration Tools', 'digital-collaboration-tools', 'Digital & Technology', 'basic', true, 'Using Teams, Slack, Zoom, etc.'),
('AI Tools', 'ai-tools', 'Digital & Technology', 'intermediate', false, 'Using AI-powered tools and platforms'),
('Statistical Software', 'statistical-software', 'Digital & Technology', 'advanced', true, 'Using R, SAS, SPSS, etc.'),
('Medical Information Systems', 'medical-information-systems', 'Digital & Technology', 'intermediate', true, 'Using specialized medical databases'),

-- Business Skills
('Business Acumen', 'business-acumen', 'Business', 'advanced', true, 'Understanding business operations'),
('Financial Analysis', 'financial-analysis', 'Business', 'advanced', false, 'Analyzing financial data'),
('Sales Enablement', 'sales-enablement', 'Business', 'intermediate', false, 'Supporting sales processes'),
('Marketing Knowledge', 'marketing-knowledge', 'Business', 'intermediate', false, 'Understanding marketing principles'),
('Contract Management', 'contract-management', 'Business', 'intermediate', false, 'Managing contracts and agreements'),
('Procurement', 'procurement', 'Business', 'intermediate', false, 'Sourcing and vendor management'),

-- Compliance & Quality
('Regulatory Compliance', 'regulatory-compliance', 'Compliance & Quality', 'expert', true, 'Ensuring regulatory adherence'),
('Quality Assurance', 'quality-assurance', 'Compliance & Quality', 'advanced', true, 'Maintaining quality standards'),
('SOPs & Governance', 'sops-governance', 'Compliance & Quality', 'advanced', true, 'Following standard operating procedures'),
('Audit Readiness', 'audit-readiness', 'Compliance & Quality', 'advanced', false, 'Preparing for audits and inspections'),
('Risk Management', 'risk-management', 'Compliance & Quality', 'advanced', true, 'Identifying and mitigating risks'),

-- Specialized Pharma Skills
('Product Launch', 'product-launch', 'Pharma Specialized', 'expert', false, 'Planning and executing product launches'),
('Payer Relations', 'payer-relations', 'Pharma Specialized', 'advanced', false, 'Working with payers and health plans'),
('KOL Management', 'kol-management', 'Pharma Specialized', 'advanced', true, 'Managing key opinion leader relationships'),
('Advisory Board Management', 'advisory-board-management', 'Pharma Specialized', 'advanced', true, 'Organizing and running advisory boards'),
('Congress Management', 'congress-management', 'Pharma Specialized', 'advanced', true, 'Managing medical congress activities'),
('Field Force Training', 'field-force-training', 'Pharma Specialized', 'advanced', false, 'Training field-based teams'),
('Publication Planning', 'publication-planning', 'Pharma Specialized', 'advanced', true, 'Strategic publication planning'),
('MSL Operations', 'msl-operations', 'Pharma Specialized', 'advanced', true, 'Managing medical science liaison activities'),
('Insights Generation', 'insights-generation', 'Pharma Specialized', 'advanced', true, 'Generating actionable insights from data'),
('Scientific Exchange', 'scientific-exchange', 'Pharma Specialized', 'advanced', true, 'Facilitating scientific discussions with KOLs'),
('Medical Information Management', 'medical-information-management', 'Pharma Specialized', 'advanced', true, 'Managing medical inquiry responses'),
('Real-World Evidence', 'real-world-evidence', 'Pharma Specialized', 'expert', true, 'Generating and analyzing RWE studies'),
('Health Technology Assessment', 'health-technology-assessment', 'Pharma Specialized', 'expert', false, 'Evaluating health technologies for payers'),
('Clinical Protocol Development', 'clinical-protocol-development', 'Pharma Specialized', 'expert', true, 'Designing clinical trial protocols'),
('Medical Monitoring', 'medical-monitoring', 'Pharma Specialized', 'expert', true, 'Monitoring patient safety in clinical trials'),
('Label Optimization', 'label-optimization', 'Pharma Specialized', 'expert', false, 'Optimizing product labeling'),
('Therapeutic Area Expertise', 'therapeutic-area-expertise', 'Pharma Specialized', 'expert', true, 'Deep knowledge in specific therapeutic areas')

ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION & SUMMARY
-- ============================================================================

DO $$
DECLARE
    v_total_skills INTEGER;
    v_anthropic INTEGER;
    v_awesome INTEGER;
    v_alirezarezvani INTEGER;
    v_pharma INTEGER;
    v_by_category RECORD;
BEGIN
    SELECT COUNT(*) INTO v_total_skills FROM public.skills WHERE deleted_at IS NULL;
    
    SELECT COUNT(*) INTO v_anthropic 
    FROM public.skills 
    WHERE deleted_at IS NULL AND skill_type = 'built_in';
    
    SELECT COUNT(*) INTO v_awesome 
    FROM public.skills 
    WHERE deleted_at IS NULL 
    AND skill_type = 'custom' 
    AND slug IN ('test-driven-development', 'using-git-worktrees', 'csv-data-summarizer', 'scientific-databases', 'article-extractor', 'youtube-transcript', 'meeting-insights-analyzer', 'ffuf-claude-skill', 'file-organizer');
    
    SELECT COUNT(*) INTO v_alirezarezvani 
    FROM public.skills 
    WHERE deleted_at IS NULL 
    AND slug IN ('content-creator', 'marketing-demand-acquisition', 'ceo-advisor', 'product-manager-toolkit', 'senior-software-architect', 'atlassian-jira-expert');
    
    SELECT COUNT(*) INTO v_pharma 
    FROM public.skills 
    WHERE deleted_at IS NULL 
    AND category IN ('Scientific & Clinical', 'Communication', 'Interpersonal', 'Leadership & Management', 'Analytical', 'Digital & Technology', 'Business', 'Compliance & Quality', 'Pharma Specialized');
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '✅ COMPREHENSIVE SKILLS LIBRARY SEEDED SUCCESSFULLY';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Skills by Source:';
    RAISE NOTICE '  ├─ Anthropic Official (built_in): % skills', v_anthropic;
    RAISE NOTICE '  ├─ Awesome Claude Skills (community): ~% skills', v_awesome;
    RAISE NOTICE '  ├─ alirezarezvani/claude-skills: ~% skills', v_alirezarezvani;
    RAISE NOTICE '  └─ Medical Affairs & Pharma: % skills', v_pharma;
    RAISE NOTICE '';
    RAISE NOTICE '📈 Total Skills: %', v_total_skills;
    RAISE NOTICE '';
    RAISE NOTICE '📂 Skills by Category:';
    
    FOR v_by_category IN 
        SELECT 
            category,
            COUNT(*) as skill_count,
            COUNT(CASE WHEN is_core = true THEN 1 END) as core_count,
            COUNT(CASE WHEN is_executable = true THEN 1 END) as executable_count
        FROM public.skills
        WHERE deleted_at IS NULL
        GROUP BY category
        ORDER BY skill_count DESC
    LOOP
        RAISE NOTICE '  ├─ %: % skills (% core, % executable)', 
            v_by_category.category, 
            v_by_category.skill_count,
            v_by_category.core_count,
            v_by_category.executable_count;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

