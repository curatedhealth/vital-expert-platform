/**
 * Seed All Skills to Database
 *
 * This script reads all SKILL.md files and the awesome-claude-skills README
 * to populate the skills table with comprehensive skill data.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-all-skills.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Configuration
const SKILLS_MAIN_PATH = '/Users/hichamnaim/Downloads/skills-main';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// ============================================================================
// SKILL DEFINITIONS
// ============================================================================

interface SkillDefinition {
  name: string;
  slug: string;
  description: string;
  category: string;
  github_url: string;
  folder_path?: string; // For skills with local SKILL.md files
  implementation_type: 'prompt' | 'tool' | 'workflow' | 'agent_graph';
  complexity_score: number;
}

// Official Anthropic Skills (with SKILL.md files)
const officialSkills: SkillDefinition[] = [
  // Document Processing
  {
    name: 'DOCX Creation & Editing',
    slug: 'docx',
    description: 'Create, edit, analyze Word docs with tracked changes, comments, formatting.',
    category: 'Document Processing',
    github_url: 'https://github.com/anthropics/skills/tree/main/document-skills/docx',
    folder_path: 'document-skills/docx',
    implementation_type: 'tool',
    complexity_score: 6,
  },
  {
    name: 'PDF Processing & Analysis',
    slug: 'pdf',
    description: 'Extract text, tables, metadata, merge & annotate PDFs.',
    category: 'Document Processing',
    github_url: 'https://github.com/anthropics/skills/tree/main/document-skills/pdf',
    folder_path: 'document-skills/pdf',
    implementation_type: 'tool',
    complexity_score: 7,
  },
  {
    name: 'PPTX Creation & Editing',
    slug: 'pptx',
    description: 'Read, generate, and adjust slides, layouts, templates.',
    category: 'Document Processing',
    github_url: 'https://github.com/anthropics/skills/tree/main/document-skills/pptx',
    folder_path: 'document-skills/pptx',
    implementation_type: 'tool',
    complexity_score: 7,
  },
  {
    name: 'XLSX Spreadsheet Processing',
    slug: 'xlsx',
    description: 'Spreadsheet manipulation: formulas, charts, data transformations.',
    category: 'Document Processing',
    github_url: 'https://github.com/anthropics/skills/tree/main/document-skills/xlsx',
    folder_path: 'document-skills/xlsx',
    implementation_type: 'tool',
    complexity_score: 6,
  },

  // Creative & Design
  {
    name: 'Algorithmic Art Generation',
    slug: 'algorithmic-art',
    description: 'Generate unique algorithmic artwork using mathematical patterns and code.',
    category: 'Creative & Design',
    github_url: 'https://github.com/anthropics/skills/tree/main/algorithmic-art',
    folder_path: 'algorithmic-art',
    implementation_type: 'tool',
    complexity_score: 8,
  },
  {
    name: 'Brand Guidelines & Styling',
    slug: 'brand-guidelines',
    description: 'Applies Anthropic\'s official brand colors and typography to artifacts.',
    category: 'Creative & Design',
    github_url: 'https://github.com/anthropics/skills/tree/main/brand-guidelines',
    folder_path: 'brand-guidelines',
    implementation_type: 'prompt',
    complexity_score: 4,
  },
  {
    name: 'Canvas Design & Graphics',
    slug: 'canvas-design',
    description: 'Create graphics and visualizations using HTML Canvas.',
    category: 'Creative & Design',
    github_url: 'https://github.com/anthropics/skills/tree/main/canvas-design',
    folder_path: 'canvas-design',
    implementation_type: 'tool',
    complexity_score: 7,
  },
  {
    name: 'Theme Factory Generation',
    slug: 'theme-factory',
    description: 'Generate cohesive UI themes with colors, typography, and components.',
    category: 'Creative & Design',
    github_url: 'https://github.com/anthropics/skills/tree/main/theme-factory',
    folder_path: 'theme-factory',
    implementation_type: 'tool',
    complexity_score: 6,
  },
  {
    name: 'Slack GIF Creation',
    slug: 'slack-gif-creator',
    description: 'Create custom animated GIFs for Slack and other messaging platforms.',
    category: 'Creative & Design',
    github_url: 'https://github.com/anthropics/skills/tree/main/slack-gif-creator',
    folder_path: 'slack-gif-creator',
    implementation_type: 'tool',
    complexity_score: 5,
  },

  // Development & Code
  {
    name: 'Frontend Design & Development',
    slug: 'frontend-design',
    description: 'Create distinctive, production-grade frontend interfaces with high design quality.',
    category: 'Development & Code',
    github_url: 'https://github.com/anthropics/skills/tree/main/frontend-design',
    folder_path: 'frontend-design',
    implementation_type: 'prompt',
    complexity_score: 8,
  },
  {
    name: 'MCP Server Development',
    slug: 'mcp-builder',
    description: 'Build Model Context Protocol (MCP) servers for tool integration.',
    category: 'Development & Code',
    github_url: 'https://github.com/anthropics/skills/tree/main/mcp-builder',
    folder_path: 'mcp-builder',
    implementation_type: 'tool',
    complexity_score: 9,
  },
  {
    name: 'Skill Creator',
    slug: 'skill-creator',
    description: 'Template and helper to build new Claude skills.',
    category: 'Development & Code',
    github_url: 'https://github.com/anthropics/skills/tree/main/skill-creator',
    folder_path: 'skill-creator',
    implementation_type: 'prompt',
    complexity_score: 6,
  },
  {
    name: 'Web Artifacts Builder',
    slug: 'web-artifacts-builder',
    description: 'Suite of tools for creating multi-component HTML artifacts.',
    category: 'Development & Code',
    github_url: 'https://github.com/anthropics/skills/tree/main/web-artifacts-builder',
    folder_path: 'web-artifacts-builder',
    implementation_type: 'tool',
    complexity_score: 7,
  },
  {
    name: 'Web Application Testing',
    slug: 'webapp-testing',
    description: 'Toolkit for interacting with and testing local web applications using Playwright.',
    category: 'Security & Testing',
    github_url: 'https://github.com/anthropics/skills/tree/main/webapp-testing',
    folder_path: 'webapp-testing',
    implementation_type: 'tool',
    complexity_score: 7,
  },

  // Communication
  {
    name: 'Internal Communications',
    slug: 'internal-comms',
    description: 'Create internal communications (status reports, leadership updates, etc).',
    category: 'Communication',
    github_url: 'https://github.com/anthropics/skills/tree/main/internal-comms',
    folder_path: 'internal-comms',
    implementation_type: 'prompt',
    complexity_score: 4,
  },

  // Utility
  {
    name: 'Template Skill Framework',
    slug: 'template-skill',
    description: 'Minimal skeleton for a new skill project structure.',
    category: 'Utility & Automation',
    github_url: 'https://github.com/anthropics/skills/tree/main/template-skill',
    folder_path: 'template-skill',
    implementation_type: 'prompt',
    complexity_score: 2,
  },
];

// Community Skills (from awesome-claude-skills README)
const communitySkills: SkillDefinition[] = [
  // Development & Code
  {
    name: 'Artifacts Builder',
    slug: 'artifacts-builder',
    description: 'Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui).',
    category: 'Development & Code',
    github_url: 'https://github.com/anthropics/skills/tree/main/artifacts-builder',
    implementation_type: 'tool',
    complexity_score: 8,
  },
  {
    name: 'Test Driven Development',
    slug: 'test-driven-development',
    description: 'Use when implementing any feature or bugfix, before writing implementation code.',
    category: 'Development & Code',
    github_url: 'https://github.com/obra/superpowers/tree/main/skills/test-driven-development',
    implementation_type: 'prompt',
    complexity_score: 6,
  },
  {
    name: 'Using Git Worktrees',
    slug: 'using-git-worktrees',
    description: 'Creates isolated git worktrees with smart directory selection and safety verification.',
    category: 'Development & Code',
    github_url: 'https://github.com/obra/superpowers/blob/main/skills/using-git-worktrees/',
    implementation_type: 'tool',
    complexity_score: 5,
  },
  {
    name: 'Finishing a Development Branch',
    slug: 'finishing-a-development-branch',
    description: 'Guides completion of development work by presenting clear options and handling chosen workflow.',
    category: 'Development & Code',
    github_url: 'https://github.com/obra/superpowers/tree/main/skills/finishing-a-development-branch',
    implementation_type: 'workflow',
    complexity_score: 5,
  },
  {
    name: 'PyPICT Claude Skill',
    slug: 'pypict-claude-skill',
    description: 'Design comprehensive test cases using PICT (Pairwise Independent Combinatorial Testing) for requirements or code.',
    category: 'Development & Code',
    github_url: 'https://github.com/omkamal/pypict-claude-skill',
    implementation_type: 'tool',
    complexity_score: 7,
  },
  {
    name: 'AWS Skills',
    slug: 'aws-skills',
    description: 'AWS development with CDK best practices, cost optimization MCP servers, and serverless/event-driven architecture patterns.',
    category: 'Development & Code',
    github_url: 'https://github.com/zxkane/aws-skills',
    implementation_type: 'prompt',
    complexity_score: 8,
  },
  {
    name: 'Move Code Quality Skill',
    slug: 'move-code-quality-skill',
    description: 'Analyzes Move language packages against the official Move Book Code Quality Checklist for Move 2024 Edition compliance.',
    category: 'Development & Code',
    github_url: 'https://github.com/1NickPappas/move-code-quality-skill',
    implementation_type: 'prompt',
    complexity_score: 7,
  },
  {
    name: 'Claude Code Terminal Title',
    slug: 'claude-code-terminal-title',
    description: 'Gives each Claude Code terminal window a dynamic title that describes the work being done.',
    category: 'Development & Code',
    github_url: 'https://github.com/bluzername/claude-code-terminal-title',
    implementation_type: 'tool',
    complexity_score: 3,
  },

  // Data & Analysis
  {
    name: 'Root Cause Tracing',
    slug: 'root-cause-tracing',
    description: 'Use when errors occur deep in execution and you need to trace back to find the original trigger.',
    category: 'Data & Analysis',
    github_url: 'https://github.com/obra/superpowers/tree/main/skills/root-cause-tracing',
    implementation_type: 'prompt',
    complexity_score: 6,
  },
  {
    name: 'CSV Data Summarizer',
    slug: 'csv-data-summarizer',
    description: 'Automatically analyzes CSVs: columns, distributions, missing data, correlations.',
    category: 'Data & Analysis',
    github_url: 'https://github.com/coffeefuelbump/csv-data-summarizer-claude-skill',
    implementation_type: 'tool',
    complexity_score: 5,
  },

  // Scientific & Research
  {
    name: 'Scientific Databases Access',
    slug: 'scientific-databases',
    description: 'Access to 26 scientific databases including PubMed, PubChem, UniProt, ChEMBL, and AlphaFold DB.',
    category: 'Scientific & Research',
    github_url: 'https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-databases',
    implementation_type: 'tool',
    complexity_score: 8,
  },
  {
    name: 'Scientific Lab Integrations',
    slug: 'scientific-integrations',
    description: 'Platform integrations for lab automation and workflow management (Benchling, DNAnexus, Opentrons).',
    category: 'Scientific & Research',
    github_url: 'https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-integrations',
    implementation_type: 'tool',
    complexity_score: 9,
  },
  {
    name: 'Scientific Python Packages',
    slug: 'scientific-packages',
    description: '58 specialized Python packages for bioinformatics, cheminformatics, machine learning, and data analysis.',
    category: 'Scientific & Research',
    github_url: 'https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-packages',
    implementation_type: 'tool',
    complexity_score: 7,
  },
  {
    name: 'Scientific Thinking',
    slug: 'scientific-thinking',
    description: 'Analysis tools and document processing for scientific writing, visualization, and methodology.',
    category: 'Scientific & Research',
    github_url: 'https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-thinking',
    implementation_type: 'prompt',
    complexity_score: 6,
  },

  // Writing & Research
  {
    name: 'Article Extractor',
    slug: 'article-extractor',
    description: 'Extract full article text and metadata from web pages.',
    category: 'Writing & Research',
    github_url: 'https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/article-extractor',
    implementation_type: 'tool',
    complexity_score: 5,
  },
  {
    name: 'Content Research Writer',
    slug: 'content-research-writer',
    description: 'Assists in writing high-quality content by conducting research, adding citations, improving hooks, iterating on outlines.',
    category: 'Writing & Research',
    github_url: 'https://github.com/ComposioHQ/awesome-claude-skills/tree/master/content-research-writer',
    implementation_type: 'workflow',
    complexity_score: 7,
  },
  {
    name: 'Brainstorming',
    slug: 'brainstorming',
    description: 'Transform rough ideas into fully-formed designs through structured questioning and alternative exploration.',
    category: 'Writing & Research',
    github_url: 'https://github.com/obra/superpowers/tree/main/skills/brainstorming',
    implementation_type: 'prompt',
    complexity_score: 4,
  },
  {
    name: 'Family History Research',
    slug: 'family-history-research',
    description: 'Provides assistance with planning family history and genealogy research projects.',
    category: 'Writing & Research',
    github_url: 'https://github.com/emaynard/claude-family-history-research-skill',
    implementation_type: 'prompt',
    complexity_score: 5,
  },

  // Learning & Knowledge
  {
    name: 'Tapestry',
    slug: 'tapestry',
    description: 'Interlink and summarize related documents into knowledge networks.',
    category: 'Learning & Knowledge',
    github_url: 'https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/tapestry',
    implementation_type: 'tool',
    complexity_score: 7,
  },
  {
    name: 'Ship Learn Next',
    slug: 'ship-learn-next',
    description: 'Skill to help iterate on what to build or learn next, based on feedback loops.',
    category: 'Learning & Knowledge',
    github_url: 'https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/ship-learn-next',
    implementation_type: 'workflow',
    complexity_score: 5,
  },

  // Media & Content
  {
    name: 'YouTube Transcript',
    slug: 'youtube-transcript',
    description: 'Fetch transcripts from YouTube videos and prepare summaries.',
    category: 'Media & Content',
    github_url: 'https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/youtube-transcript',
    implementation_type: 'tool',
    complexity_score: 4,
  },
  {
    name: 'Video Downloader',
    slug: 'video-downloader',
    description: 'Downloads videos from YouTube and other platforms for offline viewing, editing, or archival.',
    category: 'Media & Content',
    github_url: 'https://github.com/ComposioHQ/awesome-claude-skills/tree/master/video-downloader',
    implementation_type: 'tool',
    complexity_score: 5,
  },
  {
    name: 'Image Enhancer',
    slug: 'image-enhancer',
    description: 'Improves the quality of images, especially screenshots.',
    category: 'Media & Content',
    github_url: 'https://github.com/ComposioHQ/awesome-claude-skills/tree/master/image-enhancer',
    implementation_type: 'tool',
    complexity_score: 6,
  },
  {
    name: 'Claude EPUB Skill',
    slug: 'claude-epub-skill',
    description: 'Parse and analyze EPUB ebook contents for querying or summarizing.',
    category: 'Media & Content',
    github_url: 'https://github.com/smerchek/claude-epub-skill',
    implementation_type: 'tool',
    complexity_score: 5,
  },

  // Collaboration & Project Management
  {
    name: 'Git Pushing',
    slug: 'git-pushing',
    description: 'Automate git operations and repository interactions.',
    category: 'Collaboration',
    github_url: 'https://github.com/mhattingpete/claude-skills-marketplace/tree/main/engineering-workflow-plugin/skills/git-pushing',
    implementation_type: 'tool',
    complexity_score: 4,
  },
  {
    name: 'Review Implementing',
    slug: 'review-implementing',
    description: 'Evaluate code implementation plans and align with specs.',
    category: 'Collaboration',
    github_url: 'https://github.com/mhattingpete/claude-skills-marketplace/tree/main/engineering-workflow-plugin/skills/review-implementing',
    implementation_type: 'prompt',
    complexity_score: 5,
  },
  {
    name: 'Test Fixing',
    slug: 'test-fixing',
    description: 'Detect failing tests and propose patches or fixes.',
    category: 'Collaboration',
    github_url: 'https://github.com/mhattingpete/claude-skills-marketplace/tree/main/engineering-workflow-plugin/skills/test-fixing',
    implementation_type: 'tool',
    complexity_score: 6,
  },
  {
    name: 'Meeting Insights Analyzer',
    slug: 'meeting-insights-analyzer',
    description: 'Transforms your meeting transcripts into actionable insights about your communication patterns.',
    category: 'Collaboration',
    github_url: 'https://github.com/ComposioHQ/awesome-claude-skills/blob/master/meeting-insights-analyzer/',
    implementation_type: 'tool',
    complexity_score: 6,
  },
  {
    name: 'Linear CLI Skill',
    slug: 'linear-cli-skill',
    description: 'A skill teaching Claude how to use linear-CLI, meant to replace linear MCP.',
    category: 'Collaboration',
    github_url: 'https://github.com/Valian/linear-cli-skill',
    implementation_type: 'tool',
    complexity_score: 5,
  },

  // Security & Testing
  {
    name: 'FFUF Claude Skill',
    slug: 'ffuf-claude-skill',
    description: 'Integrate Claude with FFUF (fuzzing) and analyze results for vulnerabilities.',
    category: 'Security & Testing',
    github_url: 'https://github.com/jthack/ffuf_claude_skill',
    implementation_type: 'tool',
    complexity_score: 8,
  },
  {
    name: 'Defense In Depth',
    slug: 'defense-in-depth',
    description: 'Implement multi-layered testing and security best practices.',
    category: 'Security & Testing',
    github_url: 'https://github.com/obra/superpowers/blob/main/skills/defense-in-depth',
    implementation_type: 'prompt',
    complexity_score: 7,
  },
  {
    name: 'Systematic Debugging',
    slug: 'systematic-debugging',
    description: 'Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes.',
    category: 'Security & Testing',
    github_url: 'https://github.com/obra/superpowers/blob/main/skills/systematic-debugging',
    implementation_type: 'prompt',
    complexity_score: 6,
  },

  // Utility & Automation
  {
    name: 'File Organizer',
    slug: 'file-organizer',
    description: 'Intelligently organizes your files and folders across your computer.',
    category: 'Utility & Automation',
    github_url: 'https://github.com/ComposioHQ/awesome-claude-skills/tree/master/file-organizer',
    implementation_type: 'tool',
    complexity_score: 5,
  },
  {
    name: 'Invoice Organizer',
    slug: 'invoice-organizer',
    description: 'Automatically organizes invoices and receipts for tax preparation.',
    category: 'Utility & Automation',
    github_url: 'https://github.com/ComposioHQ/awesome-claude-skills/blob/master/invoice-organizer/SKILL.md',
    implementation_type: 'tool',
    complexity_score: 5,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Read SKILL.md content and parse frontmatter
 */
function readSkillMd(folderPath: string): { content: string; name?: string; description?: string } | null {
  const skillMdPath = path.join(SKILLS_MAIN_PATH, folderPath, 'SKILL.md');

  if (!fs.existsSync(skillMdPath)) {
    return null;
  }

  const rawContent = fs.readFileSync(skillMdPath, 'utf-8');

  // Parse YAML frontmatter
  const frontmatterMatch = rawContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  let name: string | undefined;
  let description: string | undefined;
  let content = rawContent;

  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
    const descMatch = frontmatter.match(/^description:\s*(.+)$/m);

    if (nameMatch) name = nameMatch[1].trim();
    if (descMatch) description = descMatch[1].trim();

    content = rawContent.replace(/^---[\s\S]*?---\s*\n/, '').trim();
  }

  return { content, name, description };
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function seedAllSkills() {
  console.log('🚀 Starting comprehensive skill seeding...\n');

  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  // Combine all skills
  const allSkills = [...officialSkills, ...communitySkills];
  console.log(`📊 Processing ${allSkills.length} skills total\n`);

  // Process each skill
  for (const skillDef of allSkills) {
    // Check if skill already exists
    const { data: existing } = await supabase
      .from('skills')
      .select('id, slug')
      .eq('slug', skillDef.slug)
      .single();

    // Read SKILL.md if available
    let detailedDescription: string | null = null;
    if (skillDef.folder_path) {
      const skillMd = readSkillMd(skillDef.folder_path);
      if (skillMd) {
        detailedDescription = skillMd.content;
      }
    }

    const skillData = {
      name: skillDef.name,
      slug: skillDef.slug,
      description: skillDef.description,
      category: skillDef.category,
      github_url: skillDef.github_url,
      implementation_type: skillDef.implementation_type,
      complexity_score: skillDef.complexity_score,
      is_active: true,
      detailed_description: detailedDescription,
      metadata: {
        source: skillDef.folder_path ? 'anthropic-official' : 'community',
      },
    };

    if (existing) {
      // Update existing skill
      const { error } = await supabase
        .from('skills')
        .update(skillData)
        .eq('id', existing.id);

      if (error) {
        console.log(`  ❌ ${skillDef.slug}: ${error.message}`);
        errorCount++;
      } else {
        console.log(`  ✅ ${skillDef.slug}: Updated`);
        updatedCount++;
      }
    } else {
      // Create new skill
      const { error } = await supabase
        .from('skills')
        .insert(skillData);

      if (error) {
        if (error.code === '23505') {
          console.log(`  ⏭️  ${skillDef.slug}: Already exists`);
          skippedCount++;
        } else {
          console.log(`  ❌ ${skillDef.slug}: ${error.message}`);
          errorCount++;
        }
      } else {
        console.log(`  🆕 ${skillDef.slug}: Created`);
        createdCount++;
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`   🆕 Created: ${createdCount}`);
  console.log(`   ✅ Updated: ${updatedCount}`);
  console.log(`   ⏭️  Skipped: ${skippedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📦 Total: ${allSkills.length}`);
  console.log('='.repeat(50));
}

// Run the script
seedAllSkills().catch(console.error);
