import { useState, useEffect } from 'react';
import { supabase } from '@vital/sdk/client';

export interface Tool {
  id: string;
  name: string;
  description: string | null;
  type: string | null;
  category: string | null;
  api_endpoint: string | null;
  configuration: any;
  authentication_required: boolean;
  rate_limit: string | null;
  cost_model: string | null;
  documentation_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useAvailableTools() {
  const [availableToolsFromDB, setAvailableToolsFromDB] = useState<Tool[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);

  useEffect(() => {
    const fetchAvailableTools = async () => {
      try {
        setLoadingTools(true);

        // Fetch tools from Supabase dh_tool table
        const { data: tools, error } = await supabase
          .from('dh_tool')
          .select('*')
          .eq('is_active', true)
          .order('category_parent', { ascending: true })
          .order('name', { ascending: true });

        if (error) {
          console.error('❌ Error fetching tools from database:', error);
          setAvailableToolsFromDB([]);
          return;
        }

        // Map tools to the expected format
        const mappedTools: Tool[] = (tools || []).map((tool) => ({
          id: tool.id,
          name: tool.name,
          description: tool.tool_description || tool.llm_description || null,
          type: tool.tool_type || null,
          category: tool.category || null,
          api_endpoint: tool.implementation_path || null,
          configuration: tool.metadata || {},
          authentication_required: (tool.required_env_vars && tool.required_env_vars.length > 0) || false,
          rate_limit: tool.rate_limit_per_minute ? `${tool.rate_limit_per_minute}/min` : null,
          cost_model: tool.cost_per_execution ? `$${tool.cost_per_execution}/exec` : null,
          documentation_url: tool.documentation_url || null,
          is_active: tool.is_active || false,
          created_at: tool.created_at || new Date().toISOString(),
          updated_at: tool.updated_at || new Date().toISOString(),
        }));

        setAvailableToolsFromDB(mappedTools);
        console.log(`✅ Loaded ${mappedTools.length} tools from database (including ${tools.filter((t: any) => t.category_parent === 'Strategic Intelligence').length} Strategic Intelligence tools)`);
      } catch (error) {
        console.error('❌ Exception loading tools:', error);
        setAvailableToolsFromDB([]);
      } finally {
        setLoadingTools(false);
      }
    };

    fetchAvailableTools();
  }, []);

  return {
    availableToolsFromDB,
    loadingTools,
  };
}

