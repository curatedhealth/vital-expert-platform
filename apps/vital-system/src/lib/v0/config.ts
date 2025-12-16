/**
 * v0 Integration Configuration
 * 
 * Configuration for v0 AI-powered UI generation.
 */

import { 
  Box, 
  Users, 
  Layers, 
  BarChart3, 
  Layout, 
  FormInput, 
  Table,
  type LucideIcon,
} from 'lucide-react';
import type { V0GenerationType, V0PromptExample } from '@/features/v0-integration/types/v0.types';

/**
 * Check if v0 integration is enabled
 */
export const isV0Enabled = (): boolean => {
  return process.env.NEXT_PUBLIC_V0_ENABLED === 'true';
};

/**
 * Generation type configurations with examples and icons
 */
export interface GenerationTypeConfig {
  id: V0GenerationType;
  label: string;
  description: string;
  icon: LucideIcon;
  examples: V0PromptExample[];
  color: string;
  bgColor: string;
}

export const GENERATION_TYPE_CONFIGS: Record<V0GenerationType, GenerationTypeConfig> = {
  'workflow-node': {
    id: 'workflow-node',
    label: 'Workflow Node',
    description: 'Custom node for workflow designer with inputs/outputs',
    icon: Box,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    examples: [
      {
        label: 'KOL Influence Scorer',
        prompt: 'Create a KOL Influence Scorer node that displays publication count badge, H-index indicator, conference appearances, network influence score (0-100), and engagement history timeline. Use purple/blue gradient theme.',
        category: 'Medical Affairs',
      },
      {
        label: 'FDA Compliance Checker',
        prompt: 'Create an FDA Compliance Checker node with a checklist UI showing regulatory requirements, validation status for each item (pass/fail/pending), and overall compliance percentage with a circular progress indicator.',
        category: 'Regulatory',
      },
      {
        label: 'Clinical Trial Eligibility',
        prompt: 'Create a Clinical Trial Eligibility Validator node that shows inclusion/exclusion criteria checklist, patient match score, and flags any potential issues. Include a compact summary view and expandable detailed view.',
        category: 'Clinical Development',
      },
      {
        label: 'Document Generator',
        prompt: 'Create a Document Generator node with template selection dropdown, variable inputs panel, preview section, and generate button. Show generation progress and output preview.',
        category: 'General',
      },
    ],
  },
  'agent-card': {
    id: 'agent-card',
    label: 'Agent Card',
    description: 'AI agent display card with avatar and capabilities',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    examples: [
      {
        label: 'Medical Affairs Specialist',
        prompt: 'Create a Medical Affairs Specialist agent card showing therapeutic area badges, publication expertise meter, active KOL relationships count, and recent engagement summary. Include a compact view and expanded view toggle.',
        category: 'Medical Affairs',
      },
      {
        label: 'Regulatory Expert',
        prompt: 'Create a Regulatory Expert agent card with region expertise badges (FDA, EMA, PMDA), submission type specializations, compliance score indicator, and recent submissions timeline.',
        category: 'Regulatory',
      },
      {
        label: 'Clinical Research Analyst',
        prompt: 'Create a Clinical Research Analyst agent card showing study phase expertise, protocol design score, enrollment metrics, and active studies count with a mini progress chart.',
        category: 'Clinical Development',
      },
    ],
  },
  'panel-ui': {
    id: 'panel-ui',
    label: 'Panel UI',
    description: 'Multi-expert panel discussion interface',
    icon: Layers,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    examples: [
      {
        label: 'Risk Assessment Panel',
        prompt: 'Create a Risk Assessment Panel with a 5x5 risk matrix visualization, expert cards for each panelist, consensus indicator, dissenting opinions highlight, and action items sidebar.',
        category: 'Risk Management',
      },
      {
        label: 'Drug Interaction Review',
        prompt: 'Create a Drug Interaction Review panel with medication list, interaction matrix heatmap, expert commentary cards, severity indicators, and recommendations panel.',
        category: 'Pharmacovigilance',
      },
      {
        label: 'Protocol Review Committee',
        prompt: 'Create a Protocol Review Committee interface showing the protocol document outline, reviewer assignments, comment threads, approval status per section, and final decision tracker.',
        category: 'Clinical Development',
      },
    ],
  },
  'visualization': {
    id: 'visualization',
    label: 'Visualization',
    description: 'Data visualization component',
    icon: BarChart3,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    examples: [
      {
        label: 'KOL Network Graph',
        prompt: 'Create a KOL Network Graph visualization showing experts as nodes with influence score sizing, connection lines with interaction frequency, clustering by therapeutic area, and hover tooltips with detailed info.',
        category: 'Medical Affairs',
      },
      {
        label: 'Clinical Trial Timeline',
        prompt: 'Create a Clinical Trial Timeline visualization showing phases as horizontal bars, milestones as markers, enrollment progress as a fill indicator, and key dates with labels. Support zoom and pan.',
        category: 'Clinical Development',
      },
      {
        label: 'Market Access Dashboard',
        prompt: 'Create a Market Access Dashboard with country comparison charts, pricing tiers, reimbursement status indicators, and time-to-market comparison across regions.',
        category: 'Market Access',
      },
    ],
  },
  'dashboard': {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Dashboard layout with multiple widgets',
    icon: Layout,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    examples: [
      {
        label: 'KOL Engagement Dashboard',
        prompt: 'Create a KOL Engagement Dashboard with a network graph widget, engagement timeline, upcoming activities card, compliance status panel, and quick actions toolbar.',
        category: 'Medical Affairs',
      },
      {
        label: 'Regulatory Submission Tracker',
        prompt: 'Create a Regulatory Submission Tracker dashboard with submission pipeline kanban, deadline countdown cards, document status checklist, and agency communication log.',
        category: 'Regulatory',
      },
    ],
  },
  'form': {
    id: 'form',
    label: 'Form',
    description: 'Custom form component',
    icon: FormInput,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    examples: [
      {
        label: 'KOL Profile Form',
        prompt: 'Create a KOL Profile Form with sections for personal info, professional background, publication history, areas of expertise (multi-select), and engagement preferences. Include validation and save progress.',
        category: 'Medical Affairs',
      },
      {
        label: 'Adverse Event Report',
        prompt: 'Create an Adverse Event Report form with patient demographics section, event description, severity selector, causality assessment, and follow-up actions. Include required field indicators and form progress.',
        category: 'Pharmacovigilance',
      },
    ],
  },
  'table': {
    id: 'table',
    label: 'Data Table',
    description: 'Data table with filtering and sorting',
    icon: Table,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    examples: [
      {
        label: 'KOL Directory Table',
        prompt: 'Create a KOL Directory Table with columns for name, institution, specialty, influence score, last engagement, and status. Include search, filtering by specialty, sorting, and row expansion for details.',
        category: 'Medical Affairs',
      },
      {
        label: 'Publication Tracker',
        prompt: 'Create a Publication Tracker table with title, authors, journal, impact factor, publication date, and citation count. Include filters for date range and journal tier, and a preview modal.',
        category: 'Medical Affairs',
      },
    ],
  },
};

/**
 * Get examples for a specific generation type
 */
export const getExamplesForType = (type: V0GenerationType): V0PromptExample[] => {
  return GENERATION_TYPE_CONFIGS[type]?.examples || [];
};

/**
 * Get configuration for a specific generation type
 */
export const getTypeConfig = (type: V0GenerationType): GenerationTypeConfig | undefined => {
  return GENERATION_TYPE_CONFIGS[type];
};

/**
 * All available generation types
 */
export const AVAILABLE_GENERATION_TYPES: V0GenerationType[] = [
  'workflow-node',
  'agent-card',
  'panel-ui',
  'visualization',
  'dashboard',
  'form',
  'table',
];

/**
 * Medical Affairs specific workflow examples for POC
 */
export const KOL_ENGAGEMENT_WORKFLOW_EXAMPLES = {
  name: 'KOL Engagement Workflow',
  domain: 'Medical Affairs',
  description: 'End-to-end workflow for identifying, engaging, and tracking Key Opinion Leaders',
  stages: [
    {
      name: 'KOL Identification',
      tasks: ['Scientific Publication Analysis', 'Conference Presence Mapping', 'Influence Network Analysis'],
    },
    {
      name: 'Engagement Planning',
      tasks: ['Compliance Pre-Review', 'Engagement Strategy Development', 'Material Preparation'],
    },
    {
      name: 'Execution & Tracking',
      tasks: ['Meeting Documentation', 'Follow-up Action Items', 'Relationship Scoring Update'],
    },
  ],
  suggestedNodes: [
    {
      type: 'workflow-node',
      prompt: 'Create a KOL Influence Scorer node that calculates and displays: H-index with trend indicator, publication count with recent activity badge, citation impact score, conference presentations count, editorial board memberships, and overall influence percentile. Use a card layout with collapsible sections.',
    },
    {
      type: 'workflow-node',
      prompt: 'Create a Compliance Gateway node that shows pre-engagement checklist items (SOPs followed, approval obtained, budget verified), compliance score, required approvals status, and a proceed/hold decision button. Use traffic light colors for status.',
    },
    {
      type: 'workflow-node',
      prompt: 'Create an Engagement Tracker node that displays meeting history timeline, sentiment analysis of interactions, follow-up tasks with due dates, relationship strength meter, and next recommended actions. Include export functionality.',
    },
  ],
  suggestedVisualizations: [
    {
      type: 'visualization',
      prompt: 'Create a KOL Network Graph showing interconnections between KOLs in a therapeutic area. Nodes should be sized by influence score, colored by specialty, with edges showing collaboration strength. Include zoom, pan, node selection, and detail panel on click.',
    },
    {
      type: 'visualization',
      prompt: 'Create an Engagement Funnel visualization showing KOLs at each stage (Identified → Qualified → Contacted → Engaged → Active Collaboration). Include conversion rates between stages and time-in-stage metrics.',
    },
  ],
};










