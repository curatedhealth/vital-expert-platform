/**
 * Populate Skills Detailed Descriptions
 *
 * This script reads SKILL.md files from the skills directories and updates
 * the skills table with detailed markdown content.
 *
 * Source directories:
 * - /Users/hichamnaim/Downloads/skills-main/ (Official Anthropic skills)
 * - /Users/hichamnaim/Downloads/awesome-claude-skills-main/ (Community skills)
 *
 * Usage:
 *   npx ts-node scripts/populate-skill-detailed-descriptions.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Configuration
const SKILLS_MAIN_PATH = '/Users/hichamnaim/Downloads/skills-main';
const AWESOME_SKILLS_PATH = '/Users/hichamnaim/Downloads/awesome-claude-skills-main';

// Supabase configuration (use service role for direct updates)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

interface SkillMapping {
  slug: string;
  skillMdPath?: string;
  githubUrl?: string;
  folderName?: string;
}

// Mapping of skill slugs to their SKILL.md file locations
const skillMappings: SkillMapping[] = [
  // Document Processing Skills
  { slug: 'docx-creation-editing', folderName: 'document-skills/docx' },
  { slug: 'pdf-processing-analysis', folderName: 'document-skills/pdf' },
  { slug: 'pptx-creation-editing', folderName: 'document-skills/pptx' },
  { slug: 'xlsx-spreadsheet-processing', folderName: 'document-skills/xlsx' },

  // Creative & Design Skills
  { slug: 'algorithmic-art-generation', folderName: 'algorithmic-art' },
  { slug: 'brand-guidelines-styling', folderName: 'brand-guidelines' },
  { slug: 'canvas-design-graphics', folderName: 'canvas-design' },
  { slug: 'theme-factory-generation', folderName: 'theme-factory' },
  { slug: 'slack-gif-creation', folderName: 'slack-gif-creator' },

  // Development & Code Skills
  { slug: 'frontend-design-development', folderName: 'frontend-design' },
  { slug: 'mcp-server-development', folderName: 'mcp-builder' },
  { slug: 'skill-creation-templates', folderName: 'skill-creator' },
  { slug: 'web-artifacts-builder', folderName: 'web-artifacts-builder' },
  { slug: 'web-application-testing', folderName: 'webapp-testing' },

  // Communication Skills
  { slug: 'internal-communications', folderName: 'internal-comms' },

  // Utility Skills
  { slug: 'template-skill-framework', folderName: 'template-skill' },
];

// Awesome Claude Skills from README (community contributed)
const awesomeSkillsFromReadme: { slug: string; name: string; description: string; githubUrl: string; category: string }[] = [
  // Development & Code Tools
  { slug: 'artifacts-builder', name: 'Artifacts Builder', description: 'Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui).', githubUrl: 'https://github.com/anthropics/skills/tree/main/artifacts-builder', category: 'Development & Code' },
  { slug: 'test-driven-development', name: 'Test Driven Development', description: 'Use when implementing any feature or bugfix, before writing implementation code', githubUrl: 'https://github.com/obra/superpowers/tree/main/skills/test-driven-development', category: 'Development & Code' },
  { slug: 'using-git-worktrees', name: 'Using Git Worktrees', description: 'Creates isolated git worktrees with smart directory selection and safety verification.', githubUrl: 'https://github.com/obra/superpowers/blob/main/skills/using-git-worktrees/', category: 'Development & Code' },
  { slug: 'finishing-a-development-branch', name: 'Finishing A Development Branch', description: 'Guides completion of development work by presenting clear options and handling chosen workflow.', githubUrl: 'https://github.com/obra/superpowers/tree/main/skills/finishing-a-development-branch', category: 'Development & Code' },
  { slug: 'pypict-claude-skill', name: 'Pypict Claude Skill', description: 'Design comprehensive test cases using PICT (Pairwise Independent Combinatorial Testing) for requirements or code, generating optimized test suites with pairwise coverage.', githubUrl: 'https://github.com/omkamal/pypict-claude-skill', category: 'Development & Code' },
  { slug: 'aws-skills', name: 'AWS Skills', description: 'AWS development with CDK best practices, cost optimization MCP servers, and serverless/event-driven architecture patterns.', githubUrl: 'https://github.com/zxkane/aws-skills', category: 'Development & Code' },
  { slug: 'move-code-quality-skill', name: 'Move Code Quality Skill', description: 'Analyzes Move language packages against the official Move Book Code Quality Checklist for Move 2024 Edition compliance and best practices.', githubUrl: 'https://github.com/1NickPappas/move-code-quality-skill', category: 'Development & Code' },

  // Data & Analysis
  { slug: 'root-cause-tracing', name: 'Root Cause Tracing', description: 'Use when errors occur deep in execution and you need to trace back to find the original trigger', githubUrl: 'https://github.com/obra/superpowers/tree/main/skills/root-cause-tracing', category: 'Data & Analysis' },
  { slug: 'csv-data-summarizer', name: 'CSV Data Summarizer', description: 'Automatically analyzes CSVs: columns, distributions, missing data, correlations.', githubUrl: 'https://github.com/coffeefuelbump/csv-data-summarizer-claude-skill', category: 'Data & Analysis' },

  // Scientific & Research
  { slug: 'scientific-databases-access', name: 'Scientific Databases Access', description: 'Access to 26 scientific databases including PubMed, PubChem, UniProt, ChEMBL, and AlphaFold DB for research.', githubUrl: 'https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-databases', category: 'Scientific & Research' },
  { slug: 'scientific-lab-integrations', name: 'Scientific Lab Integrations', description: 'Platform integrations for lab automation and workflow management: Benchling, DNAnexus, Opentrons, and more.', githubUrl: 'https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-integrations', category: 'Scientific & Research' },
  { slug: 'scientific-python-packages', name: 'Scientific Python Packages', description: '58 specialized Python packages for bioinformatics, cheminformatics, machine learning, and scientific data analysis.', githubUrl: 'https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-packages', category: 'Scientific & Research' },
  { slug: 'scientific-thinking', name: 'Scientific Thinking', description: 'Analysis tools and document processing for scientific writing, visualization, and methodology.', githubUrl: 'https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-thinking', category: 'Scientific & Research' },

  // Writing & Research
  { slug: 'article-extractor', name: 'Article Extractor', description: 'Extract full article text and metadata from web pages.', githubUrl: 'https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/article-extractor', category: 'Writing & Research' },
  { slug: 'content-research-writer', name: 'Content Research Writer', description: 'Assists in writing high-quality content by conducting research, adding citations, improving hooks, iterating on outlines, and providing real-time feedback on each section', githubUrl: 'https://github.com/ComposioHQ/awesome-claude-skills/tree/master/content-research-writer', category: 'Writing & Research' },
  { slug: 'brainstorming', name: 'Brainstorming', description: 'Transform rough ideas into fully-formed designs through structured questioning and alternative exploration.', githubUrl: 'https://github.com/obra/superpowers/tree/main/skills/brainstorming', category: 'Writing & Research' },

  // Learning & Knowledge
  { slug: 'tapestry', name: 'Tapestry', description: 'Interlink and summarize related documents into knowledge networks.', githubUrl: 'https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/tapestry', category: 'Learning & Knowledge' },

  // Media & Content
  { slug: 'youtube-transcript', name: 'YouTube Transcript', description: 'Fetch transcripts from YouTube videos and prepare summaries.', githubUrl: 'https://github.com/michalparkola/tapestry-skills-for-claude-code/tree/main/youtube-transcript', category: 'Media & Content' },
  { slug: 'video-downloader', name: 'Video Downloader', description: 'Downloads videos from YouTube and other platforms for offline viewing, editing, or archival.', githubUrl: 'https://github.com/ComposioHQ/awesome-claude-skills/tree/master/video-downloader', category: 'Media & Content' },
  { slug: 'image-enhancer', name: 'Image Enhancer', description: 'Improves the quality of images, especially screenshots.', githubUrl: 'https://github.com/ComposioHQ/awesome-claude-skills/tree/master/image-enhancer', category: 'Media & Content' },

  // Collaboration & Project Management
  { slug: 'git-pushing', name: 'Git Pushing', description: 'Automate git operations and repository interactions.', githubUrl: 'https://github.com/mhattingpete/claude-skills-marketplace/tree/main/engineering-workflow-plugin/skills/git-pushing', category: 'Collaboration' },
  { slug: 'review-implementing', name: 'Review Implementing', description: 'Evaluate code implementation plans and align with specs.', githubUrl: 'https://github.com/mhattingpete/claude-skills-marketplace/tree/main/engineering-workflow-plugin/skills/review-implementing', category: 'Collaboration' },
  { slug: 'test-fixing', name: 'Test Fixing', description: 'Detect failing tests and propose patches or fixes.', githubUrl: 'https://github.com/mhattingpete/claude-skills-marketplace/tree/main/engineering-workflow-plugin/skills/test-fixing', category: 'Collaboration' },

  // Security & Web Testing
  { slug: 'ffuf-claude-skill', name: 'FFUF Claude Skill', description: 'Integrate Claude with FFUF (fuzzing) and analyze results for vulnerabilities.', githubUrl: 'https://github.com/jthack/ffuf_claude_skill', category: 'Security & Testing' },
  { slug: 'defense-in-depth', name: 'Defense In Depth', description: 'Implement multi-layered testing and security best practices.', githubUrl: 'https://github.com/obra/superpowers/blob/main/skills/defense-in-depth', category: 'Security & Testing' },
  { slug: 'systematic-debugging', name: 'Systematic Debugging', description: 'Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes', githubUrl: 'https://github.com/obra/superpowers/blob/main/skills/systematic-debugging', category: 'Security & Testing' },

  // Utility & Automation
  { slug: 'file-organizer', name: 'File Organizer', description: 'Intelligently organizes your files and folders across your computer.', githubUrl: 'https://github.com/ComposioHQ/awesome-claude-skills/tree/master/file-organizer', category: 'Utility & Automation' },
  { slug: 'invoice-organizer', name: 'Invoice Organizer', description: 'Automatically organizes invoices and receipts for tax preparation', githubUrl: 'https://github.com/ComposioHQ/awesome-claude-skills/blob/master/invoice-organizer/SKILL.md', category: 'Utility & Automation' },
];

/**
 * Read SKILL.md content from a folder
 */
function readSkillMd(basePath: string, folderName: string): string | null {
  const skillMdPath = path.join(basePath, folderName, 'SKILL.md');

  if (fs.existsSync(skillMdPath)) {
    const content = fs.readFileSync(skillMdPath, 'utf-8');
    // Remove YAML frontmatter if present
    const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n*/m, '');
    return withoutFrontmatter.trim();
  }

  return null;
}

/**
 * Parse YAML frontmatter from SKILL.md
 */
function parseSkillMdWithMeta(basePath: string, folderName: string): { content: string; name: string; description: string } | null {
  const skillMdPath = path.join(basePath, folderName, 'SKILL.md');

  if (!fs.existsSync(skillMdPath)) {
    return null;
  }

  const rawContent = fs.readFileSync(skillMdPath, 'utf-8');

  // Parse YAML frontmatter
  const frontmatterMatch = rawContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  let name = '';
  let description = '';
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

/**
 * Get category from folder path
 */
function getCategoryFromPath(folderPath: string): string {
  if (folderPath.startsWith('document-skills')) return 'Document Processing';
  if (['algorithmic-art', 'brand-guidelines', 'canvas-design', 'theme-factory', 'slack-gif-creator'].some(p => folderPath.includes(p))) {
    return 'Creative & Design';
  }
  if (['frontend-design', 'mcp-builder', 'skill-creator', 'web-artifacts-builder', 'webapp-testing'].some(p => folderPath.includes(p))) {
    return 'Development & Code';
  }
  if (folderPath.includes('internal-comms')) return 'Communication';
  return 'Utility';
}

/**
 * Main function to populate skill descriptions
 */
async function populateSkillDescriptions() {
  console.log('🚀 Starting skill detailed descriptions population...\n');

  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
    console.log('\nTo run this script, set the environment variable:');
    console.log('export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let updatedCount = 0;
  let createdCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  // First, get all existing skills
  console.log('📥 Fetching existing skills from database...\n');
  const { data: existingSkills, error: fetchError } = await supabase
    .from('skills')
    .select('id, slug, name');

  if (fetchError) {
    console.error('❌ Failed to fetch existing skills:', fetchError.message);
    process.exit(1);
  }

  // Create lookup maps
  const skillsBySlug = new Map(existingSkills?.map(s => [s.slug, s]) || []);
  const skillsByName = new Map(existingSkills?.map(s => [s.name.toLowerCase(), s]) || []);

  console.log(`📊 Found ${existingSkills?.length || 0} existing skills\n`);

  // Process skills-main mappings
  console.log('📁 Processing skills-main directory...\n');

  for (const mapping of skillMappings) {
    if (!mapping.folderName) continue;

    const skillData = parseSkillMdWithMeta(SKILLS_MAIN_PATH, mapping.folderName);

    if (!skillData) {
      console.log(`  ⏭️  ${mapping.slug}: No SKILL.md found in ${mapping.folderName}`);
      skippedCount++;
      continue;
    }

    // Try to find existing skill by slug, alternative slugs, or name
    let matchedSkill = skillsBySlug.get(mapping.slug);
    let matchedSlug = mapping.slug;

    // Try alternative slug patterns
    if (!matchedSkill) {
      const alternativeSlugs = [
        skillData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        mapping.folderName.split('/').pop() || '',
        mapping.folderName.replace('/', '-'),
      ];

      for (const altSlug of alternativeSlugs) {
        if (skillsBySlug.has(altSlug)) {
          matchedSkill = skillsBySlug.get(altSlug);
          matchedSlug = altSlug;
          break;
        }
      }
    }

    // Try by name
    if (!matchedSkill && skillData.name) {
      matchedSkill = skillsByName.get(skillData.name.toLowerCase());
      if (matchedSkill) matchedSlug = matchedSkill.slug;
    }

    if (matchedSkill) {
      // Update existing skill
      const { error } = await supabase
        .from('skills')
        .update({
          detailed_description: skillData.content,
          github_url: `https://github.com/anthropics/skills/tree/main/${mapping.folderName}`,
        })
        .eq('id', matchedSkill.id);

      if (error) {
        console.log(`  ❌ ${matchedSlug}: ${error.message}`);
        errorCount++;
      } else {
        console.log(`  ✅ ${matchedSlug}: Updated with ${skillData.content.length} chars`);
        updatedCount++;
      }
    } else {
      // Create new skill
      const newSlug = skillData.name
        ? skillData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
        : mapping.slug;

      const { error } = await supabase
        .from('skills')
        .insert({
          name: skillData.name || mapping.folderName.split('/').pop() || mapping.slug,
          slug: newSlug,
          description: skillData.description || `Skill for ${mapping.folderName}`,
          detailed_description: skillData.content,
          github_url: `https://github.com/anthropics/skills/tree/main/${mapping.folderName}`,
          category: getCategoryFromPath(mapping.folderName),
          implementation_type: 'tool',
          complexity_score: 5,
          is_active: true,
        });

      if (error) {
        if (error.code === '23505') {
          console.log(`  ⚠️  ${newSlug}: Slug conflict, trying update...`);
          // Try update instead
          const { error: updateError } = await supabase
            .from('skills')
            .update({
              detailed_description: skillData.content,
              github_url: `https://github.com/anthropics/skills/tree/main/${mapping.folderName}`,
            })
            .eq('slug', newSlug);

          if (updateError) {
            console.log(`  ❌ ${newSlug}: ${updateError.message}`);
            errorCount++;
          } else {
            console.log(`  ✅ ${newSlug}: Updated existing`);
            updatedCount++;
          }
        } else {
          console.log(`  ❌ ${newSlug}: ${error.message}`);
          errorCount++;
        }
      } else {
        console.log(`  🆕 ${newSlug}: Created new skill`);
        createdCount++;
      }
    }
  }

  // Process awesome-claude-skills (update github_url for existing skills)
  console.log('\n📁 Processing awesome-claude-skills...\n');

  for (const skill of awesomeSkillsFromReadme) {
    // First check if skill exists
    const { data: existingSkill } = await supabase
      .from('skills')
      .select('id, slug')
      .eq('slug', skill.slug)
      .single();

    if (existingSkill) {
      // Update existing skill with github_url
      const { error } = await supabase
        .from('skills')
        .update({
          github_url: skill.githubUrl,
        })
        .eq('slug', skill.slug);

      if (error) {
        console.log(`  ❌ ${skill.slug}: ${error.message}`);
        errorCount++;
      } else {
        console.log(`  ✅ ${skill.slug}: Updated github_url`);
        updatedCount++;
      }
    } else {
      // Create new skill
      const { error } = await supabase
        .from('skills')
        .insert({
          name: skill.name,
          slug: skill.slug,
          description: skill.description,
          category: skill.category,
          github_url: skill.githubUrl,
          implementation_type: 'tool',
          complexity_score: 5,
          is_active: true,
          metadata: { source: 'awesome-claude-skills' },
        });

      if (error) {
        if (error.code === '23505') {
          console.log(`  ⏭️  ${skill.slug}: Already exists (conflict)`);
          skippedCount++;
        } else {
          console.log(`  ❌ ${skill.slug}: ${error.message}`);
          errorCount++;
        }
      } else {
        console.log(`  ✅ ${skill.slug}: Created new skill`);
        updatedCount++;
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`   ✅ Updated: ${updatedCount}`);
  console.log(`   🆕 Created: ${createdCount}`);
  console.log(`   ⏭️  Skipped: ${skippedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log('='.repeat(50));
}

// Run the script
populateSkillDescriptions().catch(console.error);
