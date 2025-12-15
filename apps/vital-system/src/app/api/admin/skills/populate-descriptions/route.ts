import { NextResponse, NextRequest } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { createLogger } from '@/lib/services/observability/structured-logger';
import * as fs from 'fs';
import * as path from 'path';

// Source directories for skill documentation
const SKILLS_MAIN_PATH = '/Users/hichamnaim/Downloads/skills-main';
const AWESOME_SKILLS_PATH = '/Users/hichamnaim/Downloads/awesome-claude-skills-main';

// Mapping of skill slugs to their folder paths in skills-main
const SKILL_FOLDER_MAPPINGS: Record<string, string> = {
  // Document Processing Skills
  'docx-creation-editing': 'document-skills/docx',
  'pdf-processing-analysis': 'document-skills/pdf',
  'pptx-creation-editing': 'document-skills/pptx',
  'xlsx-spreadsheet-processing': 'document-skills/xlsx',

  // Creative & Design Skills
  'algorithmic-art-generation': 'algorithmic-art',
  'brand-guidelines-styling': 'brand-guidelines',
  'canvas-design-graphics': 'canvas-design',
  'theme-factory-generation': 'theme-factory',
  'slack-gif-creation': 'slack-gif-creator',

  // Development & Code Skills
  'frontend-design-development': 'frontend-design',
  'mcp-server-development': 'mcp-builder',
  'skill-creation-templates': 'skill-creator',
  'web-artifacts-builder': 'web-artifacts-builder',
  'web-application-testing': 'webapp-testing',

  // Communication Skills
  'internal-communications': 'internal-comms',

  // Utility Skills
  'template-skill-framework': 'template-skill',
};

// Alternative slug mappings (try these if the primary slug doesn't exist)
const ALTERNATIVE_SLUGS: Record<string, string[]> = {
  'document-skills/docx': ['docx', 'docx-skill', 'document-docx'],
  'document-skills/pdf': ['pdf', 'pdf-skill', 'document-pdf', 'pdf-processing'],
  'document-skills/pptx': ['pptx', 'pptx-skill', 'document-pptx'],
  'document-skills/xlsx': ['xlsx', 'xlsx-skill', 'document-xlsx', 'spreadsheet'],
  'algorithmic-art': ['algorithmic-art', 'art-generation'],
  'brand-guidelines': ['brand-guidelines', 'brand-style'],
  'canvas-design': ['canvas-design', 'canvas'],
  'theme-factory': ['theme-factory', 'theme-generation'],
  'slack-gif-creator': ['slack-gif', 'gif-creator'],
  'frontend-design': ['frontend-design', 'frontend', 'ui-design'],
  'mcp-builder': ['mcp-builder', 'mcp-server', 'mcp'],
  'skill-creator': ['skill-creator', 'skill-creation'],
  'web-artifacts-builder': ['web-artifacts', 'artifacts-builder'],
  'webapp-testing': ['webapp-testing', 'web-testing'],
  'internal-comms': ['internal-comms', 'internal-communications'],
  'template-skill': ['template-skill', 'skill-template'],
};

/**
 * Read SKILL.md content and strip YAML frontmatter
 */
function readSkillMd(basePath: string, folderName: string): { content: string; name: string; description: string } | null {
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
    // Extract name and description from frontmatter
    const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
    const descMatch = frontmatter.match(/^description:\s*(.+)$/m);

    if (nameMatch) name = nameMatch[1].trim();
    if (descMatch) description = descMatch[1].trim();

    // Remove frontmatter from content
    content = rawContent.replace(/^---[\s\S]*?---\s*\n/, '').trim();
  }

  return { content, name, description };
}

/**
 * POST /api/admin/skills/populate-descriptions - Populate skill detailed descriptions
 */
export const POST = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext
) => {
  const logger = createLogger();
  const operationId = `skills_populate_${Date.now()}`;

  try {
    const { profile } = context;

    // Check if user is superadmin or admin
    if (profile.role !== 'super_admin' && profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can populate skill descriptions.' },
        { status: 403 }
      );
    }

    logger.info('skills_populate_started', {
      operationId,
      userId: context.user.id,
    });

    const supabase = getServiceSupabaseClient();
    const results: { slug: string; status: string; message: string }[] = [];

    // Get all existing skills from database
    const { data: existingSkills, error: fetchError } = await supabase
      .from('skills')
      .select('id, slug, name');

    if (fetchError) {
      logger.error('skills_fetch_error', new Error(fetchError.message), { operationId });
      return NextResponse.json(
        { error: 'Failed to fetch existing skills' },
        { status: 500 }
      );
    }

    // Create a map for quick lookup
    const skillsBySlug = new Map(existingSkills?.map(s => [s.slug, s]) || []);

    // Process each skill folder
    for (const [primarySlug, folderPath] of Object.entries(SKILL_FOLDER_MAPPINGS)) {
      const skillData = readSkillMd(SKILLS_MAIN_PATH, folderPath);

      if (!skillData) {
        results.push({ slug: primarySlug, status: 'skipped', message: `No SKILL.md found in ${folderPath}` });
        continue;
      }

      // Try to find matching skill by primary slug or alternatives
      let matchedSkill = skillsBySlug.get(primarySlug);
      let matchedSlug = primarySlug;

      if (!matchedSkill) {
        // Try alternative slugs
        const alternatives = ALTERNATIVE_SLUGS[folderPath] || [];
        for (const altSlug of alternatives) {
          if (skillsBySlug.has(altSlug)) {
            matchedSkill = skillsBySlug.get(altSlug);
            matchedSlug = altSlug;
            break;
          }
        }
      }

      // Also try matching by name (case-insensitive)
      if (!matchedSkill && skillData.name) {
        for (const [slug, skill] of skillsBySlug) {
          if (skill.name.toLowerCase() === skillData.name.toLowerCase()) {
            matchedSkill = skill;
            matchedSlug = slug;
            break;
          }
        }
      }

      if (matchedSkill) {
        // Update existing skill with detailed description
        const { error: updateError } = await supabase
          .from('skills')
          .update({
            detailed_description: skillData.content,
            github_url: `https://github.com/anthropics/skills/tree/main/${folderPath}`,
          })
          .eq('id', matchedSkill.id);

        if (updateError) {
          results.push({ slug: matchedSlug, status: 'error', message: updateError.message });
        } else {
          results.push({ slug: matchedSlug, status: 'updated', message: `Updated with ${skillData.content.length} chars` });
        }
      } else {
        // Create new skill
        const newSlug = skillData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

        const { error: insertError } = await supabase
          .from('skills')
          .insert({
            name: skillData.name || folderPath.split('/').pop(),
            slug: newSlug,
            description: skillData.description || `Skill for ${folderPath}`,
            detailed_description: skillData.content,
            github_url: `https://github.com/anthropics/skills/tree/main/${folderPath}`,
            category: getCategoryFromPath(folderPath),
            implementation_type: 'tool',
            complexity_score: 5,
            is_active: true,
          });

        if (insertError) {
          if (insertError.code === '23505') {
            results.push({ slug: newSlug, status: 'skipped', message: 'Skill already exists' });
          } else {
            results.push({ slug: newSlug, status: 'error', message: insertError.message });
          }
        } else {
          results.push({ slug: newSlug, status: 'created', message: `Created new skill` });
        }
      }
    }

    // Summary
    const summary = {
      total: results.length,
      updated: results.filter(r => r.status === 'updated').length,
      created: results.filter(r => r.status === 'created').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      errors: results.filter(r => r.status === 'error').length,
    };

    logger.info('skills_populate_complete', { operationId, summary });

    return NextResponse.json({
      success: true,
      summary,
      results,
    });
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error('Unknown error');
    logger.error('skills_populate_exception', errorObj, { operationId });
    return NextResponse.json(
      { error: 'Internal server error', details: errorObj.message },
      { status: 500 }
    );
  }
});

/**
 * GET /api/admin/skills/populate-descriptions - Get available skill sources
 */
export const GET = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext
) => {
  const { profile } = context;

  if (profile.role !== 'super_admin' && profile.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }

  const sources: { folder: string; hasSkillMd: boolean; path: string }[] = [];

  // Check skills-main directory
  for (const [slug, folderPath] of Object.entries(SKILL_FOLDER_MAPPINGS)) {
    const fullPath = path.join(SKILLS_MAIN_PATH, folderPath, 'SKILL.md');
    sources.push({
      folder: folderPath,
      hasSkillMd: fs.existsSync(fullPath),
      path: fullPath,
    });
  }

  return NextResponse.json({
    skillsMainPath: SKILLS_MAIN_PATH,
    awesomeSkillsPath: AWESOME_SKILLS_PATH,
    sources,
    mappings: SKILL_FOLDER_MAPPINGS,
  });
});

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
