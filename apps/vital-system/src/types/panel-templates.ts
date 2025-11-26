/**
 * Panel Template Types
 * Loaded dynamically from Supabase template_library table
 */

export interface PanelTemplateMetadata {
  max_agents: number;
  panel_type: string;
  mode_code: string;
  voting_enabled?: boolean;
  enable_tools?: boolean;
  rounds?: number;
  depth?: string;
  phases?: number;
}

export interface PanelTemplateNode {
  id: string;
  type: string;
  label: string;
  position: {
    x: number;
    y: number;
  };
}

export interface PanelTemplateEdge {
  id: string;
  source: string;
  target: string;
}

export interface PanelTemplateContent {
  nodes: PanelTemplateNode[];
  edges: PanelTemplateEdge[];
  metadata: PanelTemplateMetadata;
}

export interface PanelTemplate {
  id: string;
  template_name: string;
  template_slug: string;
  display_name: string;
  description: string;
  template_type: string;
  template_category: string;
  framework: string;
  is_builtin: boolean;
  is_public: boolean;
  is_featured: boolean;
  content: PanelTemplateContent;
  tags: string[];
  source_table?: string;
  source_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PanelTemplateCardProps {
  template: PanelTemplate;
  onSelect: (template: PanelTemplate) => void;
  selected?: boolean;
}
