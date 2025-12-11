import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export async function GET() {
  try {
    const [suitesRes, subSuitesRes, suitePromptsRes, promptsRes] = await Promise.all([
      supabase.from('prompt_suites').select('id, suite_code, description').order('suite_code'),
      supabase.from('prompt_sub_suites').select('id, suite_id, sub_suite_code, description').order('sub_suite_code'),
      supabase.from('suite_prompts').select('prompt_id, suite_id, sub_suite_id, sort_order'),
      supabase
        .from('prompts')
        .select(
          'id, prompt_code, name, title, description, content, system_prompt, user_template, tags, variables, category, function, task_type, complexity, is_active, version, usage_count'
        )
        .eq('is_active', true),
    ]);

    if (suitesRes.error || subSuitesRes.error || suitePromptsRes.error || promptsRes.error) {
      const detail =
        suitesRes.error?.message ||
        subSuitesRes.error?.message ||
        suitePromptsRes.error?.message ||
        promptsRes.error?.message;
      return NextResponse.json({ success: false, error: detail || 'Failed to fetch PRISM data' }, { status: 500 });
    }

    const normalizeCode = (code?: string | null) => (code || '').replace(/™/g, '').trim().toUpperCase();

    // Deduplicate suites by normalized suite_code
    const suiteByCode = new Map<
      string,
      {
        id: string;
        code: string;
        name: string;
        fullName: string;
        description: string;
        icon: string;
        color: string;
        promptCount: number;
        sortOrder: number;
      }
    >();
    const suiteIdToCode = new Map<string, string>();
    (suitesRes.data || []).forEach((s, idx) => {
      const normCode = normalizeCode(s.suite_code);
      if (!normCode) return;
      if (!suiteByCode.has(normCode)) {
        suiteByCode.set(normCode, {
          id: s.id,
          code: normCode,
          name: `${normCode}™`,
          fullName: s.description || normCode,
          description: s.description || '',
          icon: '',
          color: '',
          promptCount: 0,
          sortOrder: idx,
        });
      }
      suiteIdToCode.set(s.id, normCode);
    });

    // Deduplicate sub-suites by (normalized suite_code, normalized sub_suite_code)
    const subSuiteKeyToData = new Map<
      string,
      {
        id: string;
        suiteId?: string;
        suiteCode?: string;
        code: string;
        name: string;
        fullName: string;
        description: string;
        promptCount: number;
        sortOrder: number;
      }
    >();
    const subSuiteIdToKey = new Map<string, string>();
    (subSuitesRes.data || []).forEach((ss, idx) => {
      const suiteCode = suiteIdToCode.get(ss.suite_id || '');
      const normSub = normalizeCode(ss.sub_suite_code);
      if (!normSub) return;
      const key = `${suiteCode || ss.suite_id || 'UNKNOWN'}::${normSub}`;
      if (!subSuiteKeyToData.has(key)) {
        subSuiteKeyToData.set(key, {
          id: ss.id,
          suiteId: ss.suite_id || undefined,
          suiteCode,
          code: normSub,
          name: `${normSub}`,
          fullName: ss.description || normSub,
          description: ss.description || '',
          promptCount: 0,
          sortOrder: idx,
        });
      }
      subSuiteIdToKey.set(ss.id, key);
    });

    const promptMap = new Map<string, { suiteCode?: string; subKey?: string; sort_order?: number }>();

    (suitePromptsRes.data || []).forEach((sp) => {
      // Only keep first mapping per prompt for front-end display
      if (!promptMap.has(sp.prompt_id)) {
        const suiteCode = suiteIdToCode.get(sp.suite_id || '');
        const subKey = subSuiteIdToKey.get(sp.sub_suite_id || '');
        promptMap.set(sp.prompt_id, { suiteCode, subKey, sort_order: sp.sort_order || 0 });
      }
    });

    const prompts = (promptsRes.data || []).map((p) => {
      const mapping = promptMap.get(p.id);
      const suite = mapping?.suiteCode ? suiteByCode.get(mapping.suiteCode) : undefined;
      const subSuite = mapping?.subKey ? subSuiteKeyToData.get(mapping.subKey) : undefined;

      if (suite) suite.promptCount += 1;
      if (subSuite) subSuite.promptCount += 1;

      return {
        id: p.id,
        prompt_code: p.prompt_code,
        name: p.name,
        display_name: p.name,
        title: p.title || p.name,
        description: p.description || '',
        content: p.content,
        system_prompt: p.system_prompt,
        user_template: p.user_template,
        category: p.category,
        function: p.function,
        task_type: p.task_type,
        complexity: p.complexity,
        tags: p.tags || [],
        variables: p.variables || [],
        usage_count: p.usage_count || 0,
        version: p.version || '1.0.0',
        suite: suite ? suite.name : undefined,
        suite_id: suite ? suite.id : undefined,
        suite_name: suite ? suite.name : undefined,
        suite_full_name: suite ? suite.fullName : undefined,
        sub_suite: subSuite ? subSuite.name : undefined,
        sub_suite_id: subSuite ? subSuite.id : undefined,
        sub_suite_name: subSuite ? subSuite.name : undefined,
        sort_order: mapping?.sort_order || 0,
        is_favorite: false,
      };
    });

    return NextResponse.json({
      success: true,
      source: 'api',
      suites: Array.from(suiteByCode.values()),
      subSuites: Array.from(subSuiteKeyToData.values()),
      prompts,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unexpected error' }, { status: 500 });
  }
}
