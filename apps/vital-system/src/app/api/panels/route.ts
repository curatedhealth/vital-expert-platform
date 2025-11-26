import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';
import { PANEL_TEMPLATES } from '@/features/ask-panel/constants/panel-templates';

export async function GET(_req: NextRequest) {
  try {
    // Try to get Supabase client, but fall back to hardcoded templates if not configured
    let supabase;
    try {
      supabase = getServiceSupabaseClient();
    } catch (configError: any) {
      // Supabase not configured - return hardcoded templates
      console.warn('[Panels API] Supabase not configured, using hardcoded templates:', configError.message);
      return NextResponse.json({
        success: true,
        panels: PANEL_TEMPLATES.map(template => ({
          slug: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          mode: template.mode,
          framework: template.framework,
          suggested_agents: template.suggestedAgents,
          default_settings: template.defaultSettings,
          metadata: {
            icon: template.icon,
            tags: template.tags,
            popularity: template.popularity,
          },
        })),
        fallback: true,
      });
    }

    // Try to fetch from Supabase
    const { data, error } = await supabase
      .from('panels')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('[Panels API] Supabase query error, falling back to hardcoded templates:', error);
      // Fall back to hardcoded templates on query error
      return NextResponse.json({
        success: true,
        panels: PANEL_TEMPLATES.map(template => ({
          slug: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          mode: template.mode,
          framework: template.framework,
          suggested_agents: template.suggestedAgents,
          default_settings: template.defaultSettings,
          metadata: {
            icon: template.icon,
            tags: template.tags,
            popularity: template.popularity,
          },
        })),
        fallback: true,
      });
    }

    // Return Supabase data if available, otherwise fall back
    if (data && data.length > 0) {
      return NextResponse.json({
        success: true,
        panels: data,
        fallback: false,
      });
    }

    // No data in Supabase, use hardcoded templates
    return NextResponse.json({
      success: true,
      panels: PANEL_TEMPLATES.map(template => ({
        slug: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        mode: template.mode,
        framework: template.framework,
        suggested_agents: template.suggestedAgents,
        default_settings: template.defaultSettings,
        metadata: {
          icon: template.icon,
          tags: template.tags,
          popularity: template.popularity,
        },
      })),
      fallback: true,
    });
  } catch (err: any) {
    console.error('[Panels API] Unexpected error, using hardcoded templates:', err);
    // Last resort: return hardcoded templates
    return NextResponse.json({
      success: true,
      panels: PANEL_TEMPLATES.map(template => ({
        slug: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        mode: template.mode,
        framework: template.framework,
        suggested_agents: template.suggestedAgents,
        default_settings: template.defaultSettings,
        metadata: {
          icon: template.icon,
          tags: template.tags,
          popularity: template.popularity,
        },
      })),
      fallback: true,
    });
  }
}


