import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * PRISM API - Fetch Prompt Suites, Sub-Suites, and Prompts
 * Uses the normalized prompt_suites, prompt_sub_suites tables
 * Falls back to content-based categorization if suite_prompts junction is empty
 */

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    const suiteCode = searchParams.get('suite');
    const subSuiteCode = searchParams.get('subSuite');
    const search = searchParams.get('search');

    console.log('[PRISM API] Fetching suites and sub-suites...');

    // Fetch all suites from prompt_suites table
    const { data: suites, error: suitesError } = await supabase
      .from('prompt_suites')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (suitesError) {
      console.error('[PRISM API] Error fetching suites:', suitesError);
      if (suitesError.code === '42P01') {
        return NextResponse.json({
          success: true,
          suites: [],
          subSuites: [],
          prompts: [],
          message: 'prompt_suites table does not exist'
        });
      }
      return NextResponse.json({ error: 'Failed to fetch suites' }, { status: 500 });
    }

    console.log(`[PRISM API] Found ${suites?.length || 0} suites`);

    // Fetch all sub-suites from prompt_sub_suites table
    const { data: subSuites, error: subSuitesError } = await supabase
      .from('prompt_sub_suites')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (subSuitesError && subSuitesError.code !== '42P01') {
      console.error('[PRISM API] Error fetching sub-suites:', subSuitesError);
    }

    console.log(`[PRISM API] Found ${subSuites?.length || 0} sub-suites`);

    // Try to fetch prompts from suite_prompts junction table first
    let prompts: any[] = [];
    let dataSource = 'suite_prompts';

    const { data: suitePrompts, error: suitePromptsError } = await supabase
      .from('suite_prompts')
      .select(`
        id,
        sort_order,
        is_primary,
        prompt_id,
        suite_id,
        sub_suite_id,
        prompts (
          id,
          prompt_code,
          name,
          slug,
          title,
          description,
          content,
          role_type,
          category,
          function,
          task_type,
          complexity,
          pattern_type,
          system_prompt,
          user_template,
          tags,
          variables,
          estimated_time_minutes,
          accuracy_clinical,
          accuracy_regulatory,
          user_satisfaction,
          usage_count,
          expert_validated,
          validation_date,
          version,
          is_active,
          rag_enabled
        )
      `)
      .order('sort_order', { ascending: true });

    if (!suitePromptsError && suitePrompts && suitePrompts.length > 0) {
      // Use junction table data
      console.log(`[PRISM API] Found ${suitePrompts.length} prompts via suite_prompts junction`);
      
      prompts = suitePrompts
        .filter((sp: any) => sp.prompts && sp.prompts.is_active !== false)
        .map((sp: any) => {
          const suite = suites?.find(s => s.id === sp.suite_id);
          const subSuite = subSuites?.find(ss => ss.id === sp.sub_suite_id);
          
          return {
            id: sp.prompts.id,
            prompt_code: sp.prompts.prompt_code,
            name: sp.prompts.name,
            display_name: sp.prompts.title || sp.prompts.name,
            title: sp.prompts.title,
            description: sp.prompts.description,
            content: sp.prompts.content,
            system_prompt: sp.prompts.system_prompt,
            user_template: sp.prompts.user_template,
            category: sp.prompts.category,
            function: sp.prompts.function,
            task_type: sp.prompts.task_type,
            complexity: sp.prompts.complexity,
            tags: sp.prompts.tags,
            variables: sp.prompts.variables,
            estimated_time_minutes: sp.prompts.estimated_time_minutes,
            usage_count: sp.prompts.usage_count,
            expert_validated: sp.prompts.expert_validated,
            version: sp.prompts.version,
            rag_enabled: sp.prompts.rag_enabled,
            // Suite info from junction
            suite: suite ? `${suite.suite_code}™` : null,
            suite_id: sp.suite_id,
            suite_name: suite?.suite_name,
            suite_full_name: suite?.suite_full_name,
            suite_icon: suite?.icon,
            suite_color: suite?.color,
            // Sub-suite info
            sub_suite: subSuite?.sub_suite_code,
            sub_suite_id: sp.sub_suite_id,
            sub_suite_name: subSuite?.sub_suite_name,
            sort_order: sp.sort_order,
            is_primary: sp.is_primary
          };
        });
    } else {
      // Fallback: fetch from prompts table directly and categorize by content
      console.log('[PRISM API] No suite_prompts data, falling back to prompts table with categorization');
      dataSource = 'prompts_categorized';

      const { data: flatPrompts, error: promptsError } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });

      if (promptsError) {
        console.error('[PRISM API] Error fetching prompts:', promptsError);
      } else if (flatPrompts) {
        console.log(`[PRISM API] Found ${flatPrompts.length} prompts in prompts table`);
        
        // Categorize prompts by content analysis
        prompts = flatPrompts.map((prompt: any) => {
          const suite = categorizeBySuite(prompt, suites || []);
          
          return {
            id: prompt.id,
            prompt_code: prompt.prompt_code,
            name: prompt.name,
            display_name: prompt.title || prompt.display_name || prompt.name,
            title: prompt.title,
            description: prompt.description,
            content: prompt.content || prompt.system_prompt,
            system_prompt: prompt.system_prompt,
            user_template: prompt.user_prompt_template,
            category: prompt.category,
            function: prompt.function,
            task_type: prompt.task_type,
            complexity: prompt.complexity_level || prompt.complexity,
            tags: prompt.tags,
            variables: prompt.variables,
            estimated_time_minutes: prompt.estimated_time_minutes,
            usage_count: prompt.usage_count,
            expert_validated: prompt.expert_validated,
            version: prompt.version,
            rag_enabled: prompt.rag_enabled,
            // Suite info from categorization
            suite: suite ? `${suite.suite_code}™` : 'RULES™',
            suite_id: suite?.id,
            suite_name: suite?.suite_name,
            suite_full_name: suite?.suite_full_name,
            suite_icon: suite?.icon,
            suite_color: suite?.color,
            // No sub-suite for categorized prompts
            sub_suite: null,
            sub_suite_id: null,
            sub_suite_name: null,
            sort_order: 0,
            is_primary: true
          };
        });
      }
    }

    // Apply filters
    let filteredPrompts = prompts;

    // Filter by suite
    if (suiteCode) {
      filteredPrompts = filteredPrompts.filter(p => 
        p.suite === suiteCode || p.suite === `${suiteCode}™`
      );
    }

    // Filter by sub-suite
    if (subSuiteCode) {
      filteredPrompts = filteredPrompts.filter(p => p.sub_suite === subSuiteCode);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPrompts = filteredPrompts.filter(p =>
        (p.name || '').toLowerCase().includes(searchLower) ||
        (p.title || '').toLowerCase().includes(searchLower) ||
        (p.description || '').toLowerCase().includes(searchLower) ||
        (p.tags || []).some((t: string) => t.toLowerCase().includes(searchLower))
      );
    }

    // Transform suites for frontend with actual prompt counts
    const transformedSuites = (suites || []).map(s => {
      const suitePromptCount = prompts.filter(p => 
        p.suite_id === s.id || p.suite === `${s.suite_code}™`
      ).length;
      
      return {
        id: s.id,
        code: s.suite_code,
        name: `${s.suite_code}™`,
        fullName: s.suite_full_name,
        description: s.tagline || s.description,
        purpose: s.purpose,
        targetRoles: s.target_roles,
        coverageAreas: s.coverage_areas,
        icon: s.icon,
        color: s.color,
        promptCount: suitePromptCount || s.prompt_count || 0,
        sortOrder: s.sort_order
      };
    });

    // Transform sub-suites for frontend with actual prompt counts
    const transformedSubSuites = (subSuites || []).map(s => {
      const subSuitePromptCount = prompts.filter(p => p.sub_suite_id === s.id).length;
      
      return {
        id: s.id,
        suiteId: s.suite_id,
        code: s.sub_suite_code,
        name: s.sub_suite_name,
        fullName: s.sub_suite_full_name,
        description: s.description,
        purpose: s.purpose,
        promptCount: subSuitePromptCount || s.prompt_count || 0,
        sortOrder: s.sort_order
      };
    });

    console.log(`[PRISM API] Returning ${transformedSuites.length} suites, ${transformedSubSuites.length} sub-suites, ${filteredPrompts.length} prompts`);

    return NextResponse.json({
      success: true,
      suites: transformedSuites,
      subSuites: transformedSubSuites,
      prompts: filteredPrompts,
      total: filteredPrompts.length,
      source: dataSource
    });

  } catch (error) {
    console.error('[PRISM API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Categorize a prompt into a PRISM suite based on content analysis
 */
function categorizeBySuite(prompt: any, suites: any[]) {
  const text = `${prompt.name || ''} ${prompt.content || ''} ${prompt.system_prompt || ''} ${prompt.title || ''} ${prompt.description || ''}`.toLowerCase();
  const category = (prompt.category || '').toLowerCase();
  const tags = (prompt.tags || []).map((t: string) => t.toLowerCase()).join(' ');
  const combinedText = `${text} ${tags}`;

  // First, check by category field (most reliable)
  const categoryMapping: Record<string, string> = {
    'regulatory': 'RULES',
    'clinical': 'TRIALS',
    'safety': 'GUARD',
    'pharmacovigilance': 'GUARD',
    'market-access': 'VALUE',
    'medical-affairs': 'BRIDGE',
    'evidence': 'PROOF',
    'writing': 'CRAFT',
    'commercial': 'SCOUT',
    'operations': 'PROJECT',
    'digital-health': 'FORGE',
  };

  // Check category first
  for (const [cat, suiteCode] of Object.entries(categoryMapping)) {
    if (category.includes(cat)) {
      const suite = suites.find(s => s.suite_code === suiteCode);
      if (suite) return suite;
    }
  }

  // Keywords for each suite with priority scoring
  const suiteKeywords: Record<string, { keywords: string[], weight: number }[]> = {
    'TRIALS': [
      { keywords: ['clinical trial', 'clinical protocol', 'trial design', 'trial operations', 'clinical study'], weight: 10 },
      { keywords: ['protocol design', 'patient recruitment', 'site selection', 'investigator', 'enrollment'], weight: 8 },
      { keywords: ['phase i', 'phase ii', 'phase iii', 'phase 1', 'phase 2', 'phase 3', 'irb', 'informed consent'], weight: 7 },
      { keywords: ['randomization', 'placebo', 'endpoint', 'cro', 'study coordinator', 'clinical data'], weight: 6 },
      { keywords: ['basket trial', 'umbrella trial', 'adaptive trial', 'oncology study', 'patient safety'], weight: 5 },
    ],
    'GUARD': [
      { keywords: ['pharmacovigilance', 'adverse event', 'drug safety', 'safety signal', 'safety report'], weight: 10 },
      { keywords: ['psur', 'pbrer', 'icsr', 'benefit-risk', 'risk management'], weight: 9 },
      { keywords: ['toxicology', 'genotoxicity', 'safety surveillance', 'post-market', 'safety monitoring'], weight: 8 },
      { keywords: ['signal detection', 'adverse reaction', 'safety assessment', 'safety communication'], weight: 7 },
    ],
    'VALUE': [
      { keywords: ['market access', 'health economics', 'heor', 'pricing strategy', 'reimbursement'], weight: 10 },
      { keywords: ['payer', 'formulary', 'hta submission', 'value dossier', 'budget impact'], weight: 9 },
      { keywords: ['cost-effectiveness', 'outcomes research', 'economic model', 'value proposition'], weight: 8 },
      { keywords: ['patient access', 'therapy access', 'access strategy'], weight: 7 },
    ],
    'BRIDGE': [
      { keywords: ['medical science liaison', 'msl', 'medical affairs', 'kol engagement'], weight: 10 },
      { keywords: ['key opinion leader', 'advisory board', 'speaker program', 'field medical'], weight: 9 },
      { keywords: ['scientific engagement', 'medical information', 'stakeholder engagement', 'therapeutic area'], weight: 8 },
      { keywords: ['medical education', 'scientific support', 'kol', 'thought leader'], weight: 7 },
    ],
    'PROOF': [
      { keywords: ['real-world evidence', 'rwe', 'evidence synthesis', 'systematic review'], weight: 10 },
      { keywords: ['meta-analysis', 'comparative effectiveness', 'outcomes analysis', 'data analysis'], weight: 9 },
      { keywords: ['biostatistic', 'epidemiolog', 'database analysis', 'patient-reported outcome'], weight: 8 },
      { keywords: ['evidence generation', 'clinical evidence', 'research specialist'], weight: 7 },
    ],
    'CRAFT': [
      { keywords: ['medical writer', 'medical writing', 'publication', 'manuscript'], weight: 10 },
      { keywords: ['clinical study report', 'csr', 'regulatory document', 'scientific manuscript'], weight: 9 },
      { keywords: ['abstract', 'poster', 'medical communication', 'scientific communication'], weight: 8 },
      { keywords: ['document creation', 'regulatory writing', 'patient material'], weight: 7 },
    ],
    'SCOUT': [
      { keywords: ['competitive intelligence', 'market research', 'brand strategy', 'commercial strategy'], weight: 10 },
      { keywords: ['market analysis', 'pipeline intelligence', 'competitor analysis', 'swot'], weight: 9 },
      { keywords: ['brand manager', 'marketing', 'omnichannel', 'promotional'], weight: 8 },
      { keywords: ['market positioning', 'commercial plan', 'product launch'], weight: 7 },
    ],
    'PROJECT': [
      { keywords: ['project management', 'program management', 'operations management'], weight: 10 },
      { keywords: ['supply chain', 'manufacturing', 'warehouse', 'logistics'], weight: 9 },
      { keywords: ['resource planning', 'timeline', 'milestone', 'coordination'], weight: 8 },
      { keywords: ['cmc', 'scale-up', 'technology transfer', 'process validation'], weight: 7 },
      { keywords: ['gmp compliance', 'deviation', 'capa', 'quality system', 'quality metrics'], weight: 6 },
    ],
    'FORGE': [
      { keywords: ['digital health', 'digital therapeutic', 'dtx', 'samd', 'software as medical device'], weight: 10 },
      { keywords: ['mobile health', 'telemedicine', 'digital biomarker', 'health app'], weight: 9 },
      { keywords: ['ai ', 'machine learning', 'algorithm', 'predictive model'], weight: 8 },
      { keywords: ['digital intervention', 'digital solution', '3d bioprint'], weight: 7 },
    ],
    'RULES': [
      { keywords: ['regulatory affairs', 'fda regulation', 'ema regulation', 'regulatory submission'], weight: 10 },
      { keywords: ['nda', 'bla', 'ind', '510(k)', 'pma', 'de novo', 'regulatory pathway'], weight: 9 },
      { keywords: ['compliance', 'regulatory strategy', 'submission strategy', 'regulatory guidance'], weight: 8 },
      { keywords: ['approval', 'regulatory compliance', 'regulatory requirement', 'hipaa'], weight: 7 },
    ],
  };

  // Score each suite
  const scores: Record<string, number> = {};
  
  for (const [suiteCode, keywordGroups] of Object.entries(suiteKeywords)) {
    scores[suiteCode] = 0;
    for (const group of keywordGroups) {
      for (const keyword of group.keywords) {
        if (combinedText.includes(keyword)) {
          scores[suiteCode] += group.weight;
        }
      }
    }
  }

  // Find the suite with the highest score
  let maxScore = 0;
  let bestSuiteCode = 'RULES'; // Default
  
  for (const [suiteCode, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestSuiteCode = suiteCode;
    }
  }

  // Only use the categorization if we have a meaningful score
  if (maxScore >= 5) {
    const suite = suites.find(s => s.suite_code === bestSuiteCode);
    if (suite) return suite;
  }

  // Additional fallback based on common patterns in prompt names
  if (combinedText.includes('clinical') && !combinedText.includes('regulatory')) {
    return suites.find(s => s.suite_code === 'TRIALS');
  }
  if (combinedText.includes('safety') || combinedText.includes('adverse')) {
    return suites.find(s => s.suite_code === 'GUARD');
  }
  if (combinedText.includes('market') || combinedText.includes('payer') || combinedText.includes('pricing')) {
    return suites.find(s => s.suite_code === 'VALUE');
  }
  if (combinedText.includes('msl') || combinedText.includes('medical affairs') || combinedText.includes('kol')) {
    return suites.find(s => s.suite_code === 'BRIDGE');
  }

  // Default to RULES for regulatory/general content
  return suites.find(s => s.suite_code === 'RULES') || suites[0];
}
