/**
 * Enhanced Agent Edit Form Component
 * Comprehensive form for editing all agent attributes with:
 * - 9 tabs for comprehensive configuration
 * - Slider controls for adjustable attributes
 * - 6-section prompt builder
 * - AI-suggested model configuration
 * - Personality and communication style settings
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LabeledSlider, SliderGroup, SuccessCriteriaSlider } from '@/components/ui/labeled-slider';
import type {
  Agent,
  AgentLevelNumber,
  AgentEditFormState,
  AgentSuccessCriteria,
  DataClassification,
  ExpertiseLevel,
  GeographicScope,
  ResponseFormat,
  PersonaArchetypeCode,
  CommunicationStyleCode,
  SubagentHierarchyConfig,
} from '../types/agent.types';
import { SubagentSelector } from './subagent-selector';
import {
  AGENT_LEVEL_DEFAULTS,
  PERSONALITY_SLIDERS,
  COMMUNICATION_SLIDERS,
  MODEL_SLIDERS,
  TOKEN_BUDGET_SLIDERS,
  PERSONA_ARCHETYPE_LABELS,
  PERSONA_ARCHETYPE_DESCRIPTIONS,
} from '../types/agent.types';
import { AGENT_LEVEL_COLORS } from '../constants/design-tokens';
import {
  Save,
  X,
  Settings,
  Building,
  Layers,
  User,
  MessageSquare,
  FileText,
  GitBranch,
  Target,
  Shield,
  Wand2,
  Info,
  Sparkles,
  Zap,
  Brain,
  Wrench,
  CheckCircle,
  Loader2,
  Fingerprint,
  List,
  UserCog,
  Globe,
  Copy,
  Building2,
  Plus,
  Filter,
  BarChart3,
  Lightbulb,
  Rocket,
  Heart,
  Microscope,
  Users,
  TrendingUp,
  GraduationCap,
  Cpu,
  Gauge,
  DollarSign,
  AlertTriangle,
  Check,
  ThumbsUp,
  ArrowUp,
  Eye,
  Clock,
  Crown,
  Flame,
  type LucideIcon,
} from 'lucide-react';

// Map icon names to Lucide components for personality types
const PERSONALITY_ICON_MAP: Record<string, LucideIcon> = {
  BarChart3,
  Target,
  Lightbulb,
  Rocket,
  Heart,
  Wrench,
  Shield,
  Users,
  Microscope,
  TrendingUp,
  Settings,
  GraduationCap,
  Brain,
  Sparkles,
  Zap,
};

// Helper component to render personality type icon
const PersonalityIcon = ({ iconName, className }: { iconName?: string; className?: string }) => {
  if (!iconName) return null;
  const IconComponent = PERSONALITY_ICON_MAP[iconName];
  if (!IconComponent) return <span className={className}>{iconName}</span>;
  return <IconComponent className={className} />;
};
import { supabase } from '@vital/sdk/client';

// ============================================================================
// TYPES
// ============================================================================

interface DropdownOption {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  category?: string;
  capability_id?: string; // For skills that belong to capabilities
  tenant_id?: string;     // For functions that belong to tenants
  function_id?: string;   // For departments that belong to functions
  department_id?: string; // For roles that belong to departments
}

interface AvatarOption {
  id: string;
  filename: string;
  public_url: string;
  persona_type?: string;
  business_function?: string;
  display_name?: string;
  primary_color?: string;
}

interface PersonalityTypeOption {
  id: string;
  name: string;
  slug: string;
  display_name: string;
  description?: string;
  style: string;
  temperature: number;
  icon?: string;
  color?: string;
  category?: string;
  tone_keywords?: string[];
  communication_style?: string;
  reasoning_approach?: string;
}

// Personality style to slider presets mapping
// Each style maps to specific values for personality and communication sliders
const PERSONALITY_STYLE_PRESETS: Record<string, {
  // Personality sliders (0-100)
  personality_formality: number;
  personality_empathy: number;
  personality_directness: number;
  personality_detail_orientation: number;
  personality_proactivity: number;
  personality_risk_tolerance: number;
  // Communication sliders (0-100)
  comm_verbosity: number;
  comm_technical_level: number;
  comm_warmth: number;
}> = {
  analytical: {
    personality_formality: 85,
    personality_empathy: 25,
    personality_directness: 75,
    personality_detail_orientation: 90,
    personality_proactivity: 40,
    personality_risk_tolerance: 20,
    comm_verbosity: 60,
    comm_technical_level: 80,
    comm_warmth: 30,
  },
  strategic: {
    personality_formality: 70,
    personality_empathy: 45,
    personality_directness: 65,
    personality_detail_orientation: 70,
    personality_proactivity: 85,
    personality_risk_tolerance: 50,
    comm_verbosity: 55,
    comm_technical_level: 65,
    comm_warmth: 45,
  },
  creative: {
    personality_formality: 40,
    personality_empathy: 55,
    personality_directness: 50,
    personality_detail_orientation: 50,
    personality_proactivity: 75,
    personality_risk_tolerance: 70,
    comm_verbosity: 65,
    comm_technical_level: 40,
    comm_warmth: 65,
  },
  innovator: {
    personality_formality: 30,
    personality_empathy: 45,
    personality_directness: 70,
    personality_detail_orientation: 40,
    personality_proactivity: 95,
    personality_risk_tolerance: 90,
    comm_verbosity: 55,
    comm_technical_level: 50,
    comm_warmth: 55,
  },
  empathetic: {
    personality_formality: 45,
    personality_empathy: 95,
    personality_directness: 35,
    personality_detail_orientation: 55,
    personality_proactivity: 50,
    personality_risk_tolerance: 30,
    comm_verbosity: 65,
    comm_technical_level: 30,
    comm_warmth: 90,
  },
  pragmatic: {
    personality_formality: 60,
    personality_empathy: 35,
    personality_directness: 80,
    personality_detail_orientation: 55,
    personality_proactivity: 75,
    personality_risk_tolerance: 45,
    comm_verbosity: 40,
    comm_technical_level: 55,
    comm_warmth: 40,
  },
  cautious: {
    personality_formality: 80,
    personality_empathy: 40,
    personality_directness: 45,
    personality_detail_orientation: 85,
    personality_proactivity: 30,
    personality_risk_tolerance: 10,
    comm_verbosity: 70,
    comm_technical_level: 70,
    comm_warmth: 35,
  },
  collaborative: {
    personality_formality: 55,
    personality_empathy: 80,
    personality_directness: 40,
    personality_detail_orientation: 55,
    personality_proactivity: 65,
    personality_risk_tolerance: 45,
    comm_verbosity: 60,
    comm_technical_level: 45,
    comm_warmth: 80,
  },
  scientific: {
    personality_formality: 90,
    personality_empathy: 25,
    personality_directness: 70,
    personality_detail_orientation: 95,
    personality_proactivity: 35,
    personality_risk_tolerance: 15,
    comm_verbosity: 75,
    comm_technical_level: 90,
    comm_warmth: 25,
  },
  executive: {
    personality_formality: 75,
    personality_empathy: 30,
    personality_directness: 90,
    personality_detail_orientation: 40,
    personality_proactivity: 90,
    personality_risk_tolerance: 55,
    comm_verbosity: 30,
    comm_technical_level: 60,
    comm_warmth: 35,
  },
  technical: {
    personality_formality: 80,
    personality_empathy: 20,
    personality_directness: 65,
    personality_detail_orientation: 95,
    personality_proactivity: 40,
    personality_risk_tolerance: 25,
    comm_verbosity: 65,
    comm_technical_level: 95,
    comm_warmth: 20,
  },
  educational: {
    personality_formality: 55,
    personality_empathy: 75,
    personality_directness: 45,
    personality_detail_orientation: 80,
    personality_proactivity: 70,
    personality_risk_tolerance: 25,
    comm_verbosity: 75,
    comm_technical_level: 35,
    comm_warmth: 70,
  },
}

interface PromptStarterOption {
  id: string;
  title: string;
  prompt_text: string;
  description?: string;
  category?: string;
  icon?: string;
  sort_order?: number;
}

interface TenantOption {
  id: string;
  name: string;
  tenant_key?: string;  // 'vital-system', 'digital-health-startup', 'pharma', etc.
  is_active?: boolean;
}

// Junction table type for tenant-function mapping
interface FunctionTenantMapping {
  id: string;
  function_id: string;
  tenant_id: string;
}

// LLM Model option from database
interface LlmModelOption {
  id: string;
  model_id: string;       // API identifier (gpt-4, o1, etc.)
  name: string;           // Display name
  provider_id: string;
  provider_name?: string; // Joined from llm_providers
  context_window: number;
  cost_per_1k_input_tokens: number;
  cost_per_1k_output_tokens: number;
  reasoning_score: number;
  coding_score: number;
  medical_score: number;
  speed_score: number;
  tier: number;
  is_active: boolean;
  is_recommended?: boolean;
  supports_streaming?: boolean;
  supports_function_calling?: boolean;
  supports_vision?: boolean;
  training_cutoff_date?: string;
  created_at?: string;
}

// LLM Provider option from database
interface LlmProviderOption {
  id: string;
  name: string;
  provider_type?: string;
  is_active: boolean;
}

interface SupabaseDropdownData {
  functions: DropdownOption[];
  departments: DropdownOption[];
  roles: DropdownOption[];
  capabilities: DropdownOption[];
  skills: DropdownOption[];
  knowledgeDomains: DropdownOption[];
  tools: DropdownOption[];
  responsibilities: DropdownOption[];
  avatars: AvatarOption[];
  personalityTypes: PersonalityTypeOption[];
  promptStarters: PromptStarterOption[];
  tenants: TenantOption[];
  functionTenants: FunctionTenantMapping[]; // Junction table for tenant->function filtering
  llmModels: LlmModelOption[];              // LLM models from database
  llmProviders: LlmProviderOption[];        // LLM providers for filtering
}

// Fallback personality types (used when DB fetch fails) - Uses Lucide React icon names
const FALLBACK_PERSONALITY_TYPES: PersonalityTypeOption[] = [
  { id: 'analytical', name: 'Analytical', slug: 'analytical', display_name: 'Analytical Expert', description: 'Precise, data-driven, methodical reasoning', style: 'analytical', temperature: 0.2, icon: 'BarChart3', category: 'general' },
  { id: 'strategic', name: 'Strategic', slug: 'strategic', display_name: 'Strategic Thinker', description: 'Big-picture thinking, long-term planning', style: 'strategic', temperature: 0.4, icon: 'Target', category: 'general' },
  { id: 'creative', name: 'Creative', slug: 'creative', display_name: 'Creative Innovator', description: 'Innovative, outside-the-box thinking', style: 'creative', temperature: 0.7, icon: 'Lightbulb', category: 'general' },
  { id: 'innovator', name: 'Innovator', slug: 'innovator', display_name: 'Bold Innovator', description: 'Experimental, bold ideas, risk-taking', style: 'innovator', temperature: 0.9, icon: 'Rocket', category: 'general' },
  { id: 'educational', name: 'Educational', slug: 'educational', display_name: 'Educational Guide', description: 'Teaching-oriented, explanatory', style: 'educational', temperature: 0.5, icon: 'GraduationCap', category: 'general' },
  { id: 'empathetic', name: 'Empathetic', slug: 'empathetic', display_name: 'Empathetic Advisor', description: 'Patient-centered, compassionate', style: 'empathetic', temperature: 0.5, icon: 'Heart', category: 'medical' },
  { id: 'cautious', name: 'Cautious', slug: 'cautious', display_name: 'Cautious Evaluator', description: 'Risk-aware, safety-first', style: 'cautious', temperature: 0.2, icon: 'Shield', category: 'medical' },
  { id: 'scientific', name: 'Scientific', slug: 'scientific', display_name: 'Scientific Researcher', description: 'Rigorous methodology, peer-reviewed', style: 'scientific', temperature: 0.3, icon: 'Microscope', category: 'medical' },
  { id: 'pragmatic', name: 'Pragmatic', slug: 'pragmatic', display_name: 'Pragmatic Problem-Solver', description: 'Practical, action-oriented', style: 'pragmatic', temperature: 0.4, icon: 'Wrench', category: 'business' },
  { id: 'collaborative', name: 'Collaborative', slug: 'collaborative', display_name: 'Collaborative Facilitator', description: 'Team-oriented, consensus-building', style: 'collaborative', temperature: 0.5, icon: 'Users', category: 'business' },
  { id: 'executive', name: 'Executive', slug: 'executive', display_name: 'Executive Advisor', description: 'C-suite communication, strategic', style: 'executive', temperature: 0.3, icon: 'TrendingUp', category: 'business' },
  { id: 'technical', name: 'Technical', slug: 'technical', display_name: 'Technical Specialist', description: 'Deep technical expertise, precise specifications', style: 'technical', temperature: 0.3, icon: 'Settings', category: 'technical' },
];

// Type for LLM model display (used by both DB and fallback data)
interface LlmModelDisplay {
  value: string;      // model_id
  label: string;      // display name
  cost: string;       // formatted cost string
  costValue: number;  // numeric cost for sorting/filtering
  tier: number;       // 1-5 tier
  provider: string;   // provider name
  reasoning: number;  // 0-100 score
  coding: number;     // 0-100 score
  medical: number;    // 0-100 score
  speed: number;      // 0-100 score
  context: number;    // context window size
  isRecommended?: boolean;
  isLatest?: boolean;         // true if released in last 6 months
  trainingCutoff?: string;    // e.g., "Apr 2024"
  supportsVision?: boolean;
  supportsStreaming?: boolean;
}

// Fallback LLM Models (used when DB fetch fails)
const FALLBACK_LLM_MODELS: LlmModelDisplay[] = [
  { value: 'gpt-4', label: 'GPT-4', cost: '$0.35/query', costValue: 0.35, tier: 3, provider: 'OpenAI', reasoning: 95, coding: 90, medical: 87, speed: 60, context: 128000 },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', cost: '$0.10/query', costValue: 0.10, tier: 2, provider: 'OpenAI', reasoning: 90, coding: 88, medical: 85, speed: 75, context: 128000 },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', cost: '$0.015/query', costValue: 0.015, tier: 1, provider: 'OpenAI', reasoning: 70, coding: 72, medical: 68, speed: 95, context: 16000 },
  { value: 'claude-3-opus', label: 'Claude 3 Opus', cost: '$0.40/query', costValue: 0.40, tier: 3, provider: 'Anthropic', reasoning: 97, coding: 92, medical: 89, speed: 55, context: 200000 },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', cost: '$0.08/query', costValue: 0.08, tier: 2, provider: 'Anthropic', reasoning: 88, coding: 85, medical: 82, speed: 80, context: 200000 },
  { value: 'claude-3-haiku', label: 'Claude 3 Haiku', cost: '$0.025/query', costValue: 0.025, tier: 1, provider: 'Anthropic', reasoning: 75, coding: 70, medical: 72, speed: 95, context: 200000 },
  { value: 'meditron-70b', label: 'Meditron 70B', cost: '$0.10/query', costValue: 0.10, tier: 3, provider: 'Hugging Face', reasoning: 85, coding: 60, medical: 95, speed: 65, context: 32000 },
  { value: 'biogpt', label: 'BioGPT', cost: '$0.02/query', costValue: 0.02, tier: 1, provider: 'Hugging Face', reasoning: 70, coding: 55, medical: 85, speed: 90, context: 4000 },
  { value: 'none', label: 'None (Deterministic)', cost: '$0/query', costValue: 0, tier: 5, provider: 'None', reasoning: 0, coding: 0, medical: 0, speed: 100, context: 0 },
];

// Helper function to transform database LLM models to display format
function transformDbModelToDisplay(model: LlmModelOption): LlmModelDisplay {
  const estimatedCost = (model.cost_per_1k_input_tokens + model.cost_per_1k_output_tokens) * 0.5;
  const costString = estimatedCost > 0 ? `$${estimatedCost.toFixed(3)}/query` : '$0/query';

  // Determine if model is "latest" (training cutoff within last 6 months)
  let isLatest = false;
  let trainingCutoff: string | undefined;
  if (model.training_cutoff_date) {
    const cutoffDate = new Date(model.training_cutoff_date);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    isLatest = cutoffDate >= sixMonthsAgo;
    trainingCutoff = cutoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  return {
    value: model.model_id,
    label: model.name,
    cost: costString,
    costValue: estimatedCost,
    tier: model.tier || 1,
    provider: model.provider_name || 'Unknown',
    reasoning: model.reasoning_score || 0,
    coding: model.coding_score || 0,
    medical: model.medical_score || 0,
    speed: model.speed_score || 0,
    context: model.context_window || 4000,
    isRecommended: model.is_recommended ?? false,
    isLatest,
    trainingCutoff,
    supportsVision: model.supports_vision ?? false,
    supportsStreaming: model.supports_streaming ?? false,
  };
}

// Default model providers for filtering (will be populated from DB)
const DEFAULT_MODEL_PROVIDERS = ['All', 'OpenAI', 'Anthropic', 'Google', 'Hugging Face'] as const;

// Cost tiers for filtering
const COST_TIERS = [
  { id: 'all', label: 'All Costs' },
  { id: 'budget', label: '< $0.05', maxCost: 0.05 },
  { id: 'standard', label: '$0.05-$0.15', minCost: 0.05, maxCost: 0.15 },
  { id: 'premium', label: '> $0.15', minCost: 0.15 },
] as const;

// Capability categories for filter badges
const CAPABILITY_CATEGORIES = ['All', 'Analysis', 'Research', 'Communication', 'Data', 'Compliance', 'Medical', 'Technical'] as const;

export interface AgentEditFormEnhancedProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (agent: Partial<Agent>) => Promise<void>;
  /** Available persona archetypes from database */
  personaArchetypes?: Array<{ id: string; archetype_code: string; archetype_name: string; description?: string }>;
  /** Available communication styles from database */
  communicationStyles?: Array<{ id: string; style_code: string; style_name: string; description?: string }>;
  /** Available agents for hierarchy selection */
  availableAgents?: Array<{ id: string; name: string; agent_level_id?: string }>;
}

// ============================================================================
// MULTISELECT DROPDOWN COMPONENT
// ============================================================================

interface MultiSelectDropdownProps {
  options: DropdownOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  loading?: boolean;
  emptyMessage?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selected,
  onChange,
  placeholder = 'Select items...',
  loading = false,
  emptyMessage = 'No options available',
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const getSelectedNames = () => {
    return selected
      .map(id => options.find(opt => opt.id === id || opt.name === id)?.name || id)
      .join(', ');
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Selected items display */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map(id => {
            const option = options.find(opt => opt.id === id || opt.name === id);
            return (
              <Badge key={id} variant="secondary" className="flex items-center gap-1 text-xs">
                {option?.name || id}
                <button
                  type="button"
                  onClick={() => toggleOption(id)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Search input */}
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="h-9"
      />

      {/* Options list */}
      <div className="border rounded-md max-h-40 overflow-y-auto">
        {filteredOptions.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground text-center">
            {emptyMessage}
          </div>
        ) : (
          filteredOptions.map(option => {
            const isSelected = selected.includes(option.id) || selected.includes(option.name);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleOption(option.id || option.name)}
                className={cn(
                  'w-full flex items-center gap-2 p-2 text-left text-sm hover:bg-muted/50 transition-colors',
                  isSelected && 'bg-primary/10'
                )}
              >
                <div className={cn(
                  'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
                  isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                )}>
                  {isSelected && <CheckCircle className="h-3 w-3 text-primary-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{option.name}</div>
                  {option.description && (
                    <div className="text-xs text-muted-foreground truncate">{option.description}</div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Selected count */}
      <div className="text-xs text-muted-foreground">
        {selected.length} selected
      </div>
    </div>
  );
};

// ============================================================================
// ENHANCED AGENT EDIT FORM COMPONENT
// ============================================================================

export const AgentEditFormEnhanced: React.FC<AgentEditFormEnhancedProps> = ({
  agent,
  open,
  onOpenChange,
  onSave,
  personaArchetypes = [],
  communicationStyles = [],
  availableAgents = [],
}) => {
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState('identity');

  // AI Enhancement state (for system prompt generation)
  const [enhancingPrompt, setEnhancingPrompt] = React.useState(false);
  const [enhanceError, setEnhanceError] = React.useState<string | null>(null);
  const [enhanceSuccess, setEnhanceSuccess] = React.useState(false);

  // AI Builder state (for complete agent generation)
  const [buildingAgent, setBuildingAgent] = React.useState(false);
  const [buildError, setBuildError] = React.useState<string | null>(null);
  const [buildSuccess, setBuildSuccess] = React.useState(false);
  const [showAIBuilder, setShowAIBuilder] = React.useState(false);

  const [loadingDropdowns, setLoadingDropdowns] = React.useState(true);

  // Avatar picker modal state
  const [avatarPickerOpen, setAvatarPickerOpen] = React.useState(false);
  const [avatarFilter, setAvatarFilter] = React.useState('');

  // Supabase dropdown data
  const [dropdownData, setDropdownData] = React.useState<SupabaseDropdownData>({
    functions: [],
    departments: [],
    roles: [],
    capabilities: [],
    skills: [],
    knowledgeDomains: [],
    tools: [],
    responsibilities: [],
    avatars: [],
    personalityTypes: [],
    promptStarters: [],
    tenants: [],
    functionTenants: [], // Junction table for tenant->function mapping
    llmModels: [],       // LLM models from database
    llmProviders: [],    // LLM providers for filtering
  });

  // Filter and sort states for model selection
  const [providerFilter, setProviderFilter] = React.useState<string>('All');
  const [modelSortBy, setModelSortBy] = React.useState<'recommended' | 'cost' | 'reasoning' | 'medical' | 'coding' | 'speed'>('recommended');
  const [capabilityFilter, setCapabilityFilter] = React.useState<string>('All');

  // Prompt starter input state
  const [newPromptStarter, setNewPromptStarter] = React.useState({ title: '', prompt: '' });

  // Fetch dropdown data from Supabase
  React.useEffect(() => {
    const fetchDropdownData = async () => {
      setLoadingDropdowns(true);
      try {
        // Fetch all dropdown data in parallel - using org_* tables for organizational structure
        // Note: org_functions doesn't have tenant_id, tenants/orgs are separate concept
        const results = await Promise.allSettled([
          supabase.from('org_functions').select('id, name, description').order('name'),
          supabase.from('org_departments').select('id, name, description, function_id').order('name'),
          supabase.from('org_roles').select('id, name, description, department_id').order('name'),
          supabase.from('capabilities').select('id, name, description').order('name'),
          supabase.from('skills').select('id, name, description, capability_id').order('name'),
          supabase.from('knowledge_domains').select('id, name, slug, description').order('name'),
          supabase.from('tools').select('id, name, description, category').order('name'),
          supabase.from('responsibilities').select('id, name, description').order('name'),
          supabase.from('avatars').select('id, filename, public_url, persona_type, business_function, display_name, primary_color').order('display_name'),
          // Try personality_types first, will use fallback if doesn't exist
          // personality_types = AGENT personalities (Analytical, Strategic, Creative, etc.)
          supabase.from('personality_types').select('id, name, slug, display_name, description, style, temperature, icon, color, tone_keywords, communication_style, reasoning_approach, category').eq('is_active', true).order('sort_order'),
          // Fetch prompt suites (suite_code, suite_name are the correct column names)
          supabase.from('prompt_suites').select('id, suite_code, suite_name, description, icon, color').eq('is_active', true).order('sort_order'),
          // Fetch function_tenants junction table (tenant->function mapping)
          supabase.from('function_tenants').select('id, function_id, tenant_id'),
          // Fetch tenants directly - using only basic columns that exist
          supabase.from('tenants').select('id, name').order('name'),
          // Fetch LLM models with provider name joined - sorted by is_recommended first, then reasoning
          supabase.from('llm_models').select(`
            id, model_id, name, provider_id, context_window,
            cost_per_1k_input_tokens, cost_per_1k_output_tokens,
            reasoning_score, coding_score, medical_score, speed_score,
            tier, is_active, is_recommended, supports_streaming, supports_function_calling, supports_vision,
            training_cutoff_date, created_at,
            llm_providers!inner(name)
          `).eq('is_active', true).order('is_recommended', { ascending: false }).order('reasoning_score', { ascending: false }).limit(150),
          // Fetch LLM providers
          supabase.from('llm_providers').select('id, name, provider_type, is_active').eq('is_active', true).order('name'),
        ]);

        // Extract data safely with fallbacks
        const getData = (result: PromiseSettledResult<any>, fallback: any[] = [], name?: string) => {
          if (result.status === 'fulfilled') {
            if (result.value.error) {
              console.warn(`[AgentEditForm] Query error for ${name}:`, result.value.error);
              return fallback;
            }
            if (result.value.data) {
              console.log(`[AgentEditForm] Fetched ${result.value.data.length} items for ${name}`);
              return result.value.data;
            }
          }
          if (result.status === 'rejected') {
            console.warn(`[AgentEditForm] Failed to fetch ${name}:`, result.reason);
          }
          return fallback;
        };

        // Get function_tenants junction table (mapping tenant_id -> function_id)
        const functionTenantsData = getData(results[11], [], 'functionTenants');

        // Get tenants directly from separate query (results[12])
        const tenantsData = getData(results[12], [], 'tenants');
        console.log('[AgentEditForm] Tenants fetched directly:', tenantsData.length);

        // Get LLM models (results[13]) - transform to include provider_name from joined table
        const rawLlmModels = getData(results[13], [], 'llmModels');
        const llmModelsData: LlmModelOption[] = rawLlmModels.map((m: any) => ({
          ...m,
          provider_name: m.llm_providers?.name || 'Unknown',
        }));
        console.log('[AgentEditForm] LLM models fetched:', llmModelsData.length);

        // Get LLM providers (results[14])
        const llmProvidersData = getData(results[14], [], 'llmProviders');
        console.log('[AgentEditForm] LLM providers fetched:', llmProvidersData.length);

        setDropdownData({
          functions: getData(results[0], [], 'functions'),
          departments: getData(results[1], [], 'departments'),
          roles: getData(results[2], [], 'roles'),
          capabilities: getData(results[3], [], 'capabilities'),
          skills: getData(results[4], [], 'skills'),
          knowledgeDomains: getData(results[5], [], 'knowledgeDomains'),
          tools: getData(results[6], [], 'tools'),
          responsibilities: getData(results[7], [], 'responsibilities'),
          avatars: getData(results[8], [], 'avatars'),
          personalityTypes: getData(results[9], FALLBACK_PERSONALITY_TYPES, 'personalityTypes'),
          promptStarters: getData(results[10], [], 'promptStarters'),
          tenants: tenantsData, // Now directly from tenants table
          functionTenants: functionTenantsData, // Junction table for filtering
          llmModels: llmModelsData, // LLM models with provider names
          llmProviders: llmProvidersData, // LLM providers for filtering
        });

        // Log what was fetched for debugging
        console.log('[AgentEditForm] Dropdown data loaded:', {
          functions: getData(results[0]).length,
          departments: getData(results[1]).length,
          roles: getData(results[2]).length,
          capabilities: getData(results[3]).length,
          skills: getData(results[4]).length,
          knowledgeDomains: getData(results[5]).length,
          tools: getData(results[6]).length,
          responsibilities: getData(results[7]).length,
          avatars: getData(results[8]).length,
          personalityTypes: getData(results[9], FALLBACK_PERSONALITY_TYPES).length,
          promptStarters: getData(results[10]).length,
          tenants: tenantsData.length,
          functionTenants: functionTenantsData.length,
        });
      } catch (error) {
        console.error('Failed to fetch dropdown data:', error);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    if (open) {
      fetchDropdownData();
    }
  }, [open, agent?.id]);

  // Computed: Transform database LLM models to display format, with fallback
  const LLM_MODELS: LlmModelDisplay[] = React.useMemo(() => {
    if (dropdownData.llmModels.length > 0) {
      // Transform database models to display format
      const dbModels = dropdownData.llmModels.map(transformDbModelToDisplay);
      // Add the "None" option
      return [...dbModels, FALLBACK_LLM_MODELS.find(m => m.value === 'none')!];
    }
    // Use fallback if database fetch failed or is empty
    return FALLBACK_LLM_MODELS;
  }, [dropdownData.llmModels]);

  // Computed: Dynamic provider list from database, with fallback
  const MODEL_PROVIDERS: string[] = React.useMemo(() => {
    if (dropdownData.llmProviders.length > 0) {
      const providerNames = dropdownData.llmProviders.map(p => p.name);
      return ['All', ...providerNames];
    }
    return [...DEFAULT_MODEL_PROVIDERS];
  }, [dropdownData.llmProviders]);

  // Model fit algorithm: calculates how well a model fits the agent's profile
  // Returns models sorted by fit score with fitScore property
  const calculateModelFit = React.useCallback((
    models: LlmModelDisplay[],
    agentProfile: {
      functionId?: string;
      functionName?: string;
      knowledgeDomains?: string[];
      capabilities?: string[];
      description?: string;
    }
  ): (LlmModelDisplay & { fitScore: number; fitReason: string })[] => {
    // Define weight profiles based on agent characteristics
    const weights = { reasoning: 0.25, coding: 0.15, medical: 0.25, speed: 0.15, cost: 0.20 };

    // Detect if agent is medical/clinical based on function, domains, or description
    const isMedical =
      agentProfile.functionName?.toLowerCase().includes('medical') ||
      agentProfile.functionName?.toLowerCase().includes('clinical') ||
      agentProfile.functionName?.toLowerCase().includes('pharma') ||
      agentProfile.knowledgeDomains?.some(d =>
        d.toLowerCase().includes('medical') ||
        d.toLowerCase().includes('clinical') ||
        d.toLowerCase().includes('pharma') ||
        d.toLowerCase().includes('health')
      ) ||
      agentProfile.description?.toLowerCase().includes('medical') ||
      agentProfile.description?.toLowerCase().includes('clinical');

    // Detect if agent needs strong reasoning (analytical, strategic roles)
    const needsReasoning =
      agentProfile.capabilities?.some(c =>
        c.toLowerCase().includes('analy') ||
        c.toLowerCase().includes('strategic') ||
        c.toLowerCase().includes('research')
      ) ||
      agentProfile.description?.toLowerCase().includes('analy');

    // Detect if agent is technical/coding focused
    const isTechnical =
      agentProfile.functionName?.toLowerCase().includes('tech') ||
      agentProfile.capabilities?.some(c =>
        c.toLowerCase().includes('code') ||
        c.toLowerCase().includes('technical') ||
        c.toLowerCase().includes('engineering')
      );

    // Adjust weights based on profile
    if (isMedical) {
      weights.medical = 0.40;
      weights.reasoning = 0.30;
      weights.coding = 0.05;
      weights.speed = 0.10;
      weights.cost = 0.15;
    } else if (isTechnical) {
      weights.coding = 0.35;
      weights.reasoning = 0.30;
      weights.medical = 0.05;
      weights.speed = 0.15;
      weights.cost = 0.15;
    } else if (needsReasoning) {
      weights.reasoning = 0.40;
      weights.coding = 0.15;
      weights.medical = 0.15;
      weights.speed = 0.15;
      weights.cost = 0.15;
    }

    // Calculate fit score for each model
    return models.map(model => {
      // Normalize cost (inverse - lower cost = higher score, max $0.50 assumed)
      const normalizedCost = Math.max(0, 100 - (model.costValue / 0.5) * 100);

      const fitScore = Math.round(
        model.reasoning * weights.reasoning +
        model.coding * weights.coding +
        model.medical * weights.medical +
        model.speed * weights.speed +
        normalizedCost * weights.cost
      );

      // Generate fit reason
      let fitReason = '';
      if (isMedical && model.medical >= 80) fitReason = 'High medical accuracy';
      else if (isTechnical && model.coding >= 80) fitReason = 'Strong coding capability';
      else if (needsReasoning && model.reasoning >= 85) fitReason = 'Excellent reasoning';
      else if (model.costValue <= 0.02 && model.reasoning >= 70) fitReason = 'Cost-effective';
      else if (fitScore >= 70) fitReason = 'Well-balanced';

      return { ...model, fitScore, fitReason };
    }).sort((a, b) => b.fitScore - a.fitScore);
  }, []);

  // Initialize form state with all new fields
  const [formState, setFormState] = React.useState<AgentEditFormState>({
    // Tab 1: Basic Info
    name: '',
    tagline: '',
    description: '',
    avatar_url: '',
    avatar_description: '',
    version: '1.0',

    // Tab 2: Organization
    function_id: '',
    department_id: '',
    role_id: '',

    // Tab 3: Level & Model
    agent_level_id: '',
    base_model: 'gpt-4',
    temperature: 0.4,
    max_tokens: 3000,
    context_window: 8000,
    cost_per_query: 0.12,
    token_budget_min: 1000,
    token_budget_max: 2000,
    token_budget_recommended: 1500,
    model_justification: '',
    model_citation: '',

    // Tab 4: Personality & Style
    persona_archetype_id: '',
    communication_style_id: '',
    personality_formality: 70,
    personality_empathy: 50,
    personality_directness: 70,
    personality_detail_orientation: 60,
    personality_proactivity: 50,
    personality_risk_tolerance: 30,
    comm_verbosity: 50,
    comm_technical_level: 50,
    comm_warmth: 50,

    // Tab 4b: Personality Type (affects temperature)
    personality_type: 'strategic' as keyof typeof PERSONALITY_TYPES,

    // Tab 5: Response Preferences
    preferred_response_format: 'balanced',
    citation_style: 'apa',
    include_citations: true,
    include_confidence_scores: true,
    include_limitations: true,
    insights_enabled: true,
    insights_depth: 'balanced' as 'brief' | 'balanced' | 'detailed',

    // Prompt Starters (for quick suggestions)
    prompt_starters: [] as string[],

    // Tab 6: 6-Section Prompt Builder
    prompt_section_you_are: '',
    prompt_section_you_do: '',
    prompt_section_you_never: '',
    prompt_section_success_criteria: '',
    prompt_section_when_unsure: '',
    prompt_section_evidence: '',

    // Tab 7: Hierarchy & Relationships
    reports_to_agent_id: '',
    can_escalate_to: '',
    can_spawn_l2: false,
    can_spawn_l3: false,
    can_spawn_l4: false,
    can_use_worker_pool: false,

    // Tab 8: Success Criteria
    success_criteria: [],

    // Tab 9: Safety & Compliance
    hipaa_compliant: false,
    audit_trail_enabled: false,
    data_classification: 'internal' as DataClassification,
    expertise_level: 'senior' as ExpertiseLevel,
    expertise_years: 10,
    geographic_scope: 'global' as GeographicScope,
    industry_specialization: 'pharmaceuticals',

    // Tab 10: Capabilities & Skills
    capabilities: [] as string[],
    skills: [] as string[],
    responsibilities: [] as string[],

    // Tab 11: Knowledge & RAG
    knowledge_domains: [] as string[],
    rag_enabled: true,
    agent_specific_rag: false, // Enable agent-specific knowledge base
    rag_content_files: [] as string[], // File references for agent-specific content

    // Tab 12: Tools
    tools: [] as string[],

    // Status
    status: 'development' as any,
    validation_status: 'pending' as any,

    // Admin Controls (Super Admin only)
    tenant_id: '' as string,
    is_public: false,
    allow_duplicate: true,
    personality_type_id: '' as string,
  });

  // Note: Manual input states removed - now using MultiSelectDropdown with Supabase data

  // Sync form state with agent prop
  React.useEffect(() => {
    if (agent) {
      setFormState(prev => ({
        ...prev,
        name: agent.name || '',
        tagline: agent.tagline || '',
        description: agent.description || '',
        avatar_url: agent.avatar_url || '',
        avatar_description: agent.avatar_description || '',
        version: agent.version || '1.0',
        function_id: agent.function_id || '',
        department_id: agent.department_id || '',
        role_id: agent.role_id || '',
        agent_level_id: agent.agent_level_id || '',
        base_model: agent.base_model || agent.model || 'gpt-4',
        temperature: agent.temperature ?? 0.4,
        max_tokens: agent.max_tokens || 3000,
        context_window: agent.context_window || 8000,
        cost_per_query: agent.cost_per_query || 0.12,
        token_budget_min: agent.token_budget_min || 1000,
        token_budget_max: agent.token_budget_max || 2000,
        token_budget_recommended: agent.token_budget_recommended || 1500,
        model_justification: agent.model_justification || '',
        model_citation: agent.model_citation || '',
        persona_archetype_id: agent.persona_archetype_id || '',
        communication_style_id: agent.communication_style_id || '',
        personality_formality: agent.personality_formality ?? 70,
        personality_empathy: agent.personality_empathy ?? 50,
        personality_directness: agent.personality_directness ?? 70,
        personality_detail_orientation: agent.personality_detail_orientation ?? 60,
        personality_proactivity: agent.personality_proactivity ?? 50,
        personality_risk_tolerance: agent.personality_risk_tolerance ?? 30,
        comm_verbosity: agent.comm_verbosity ?? 50,
        comm_technical_level: agent.comm_technical_level ?? 50,
        comm_warmth: agent.comm_warmth ?? 50,
        personality_type: (agent as any).personality_type || 'strategic',
        preferred_response_format: agent.preferred_response_format || 'balanced',
        citation_style: (agent as any).citation_style || 'apa',
        include_citations: agent.include_citations ?? true,
        include_confidence_scores: agent.include_confidence_scores ?? true,
        include_limitations: agent.include_limitations ?? true,
        insights_enabled: (agent as any).insights_enabled ?? true,
        insights_depth: (agent as any).insights_depth || 'balanced',
        prompt_starters: (agent as any).prompt_starters || [],
        prompt_section_you_are: agent.prompt_section_you_are || '',
        prompt_section_you_do: agent.prompt_section_you_do || '',
        prompt_section_you_never: agent.prompt_section_you_never || '',
        prompt_section_success_criteria: agent.prompt_section_success_criteria || '',
        prompt_section_when_unsure: agent.prompt_section_when_unsure || '',
        prompt_section_evidence: agent.prompt_section_evidence || '',
        reports_to_agent_id: agent.reports_to_agent_id || '',
        can_escalate_to: agent.can_escalate_to || '',
        can_spawn_l2: agent.can_spawn_l2 ?? false,
        can_spawn_l3: agent.can_spawn_l3 ?? false,
        can_spawn_l4: agent.can_spawn_l4 ?? false,
        can_use_worker_pool: agent.can_use_worker_pool ?? false,
        hipaa_compliant: agent.hipaa_compliant ?? false,
        audit_trail_enabled: agent.audit_trail_enabled ?? false,
        data_classification: agent.data_classification || 'internal',
        expertise_level: agent.expertise_level || 'senior',
        expertise_years: agent.expertise_years || 10,
        geographic_scope: agent.geographic_scope || 'global',
        industry_specialization: agent.industry_specialization || 'pharmaceuticals',
        status: agent.status || 'development',
        validation_status: agent.validation_status || 'pending',
        // Admin controls
        tenant_id: (agent as any).tenant_id || '',
        is_public: (agent as any).is_public ?? false,
        allow_duplicate: (agent as any).allow_duplicate ?? true,
        personality_type_id: (agent as any).personality_type_id || '',
        // New fields
        capabilities: agent.capabilities || [],
        skills: (agent as any).skills || [],
        responsibilities: (agent as any).responsibilities || [],
        knowledge_domains: agent.knowledge_domains || [],
        rag_enabled: agent.rag_enabled ?? true,
        agent_specific_rag: (agent as any).agent_specific_rag ?? false,
        rag_content_files: (agent as any).rag_content_files || [],
        tools: (agent as any).tools || [],
      }));
    }
  }, [agent]);

  // Apply level defaults when level changes
  const handleLevelChange = (levelNumber: AgentLevelNumber) => {
    const defaults = AGENT_LEVEL_DEFAULTS[levelNumber];
    if (defaults) {
      setFormState(prev => ({
        ...prev,
        base_model: defaults.default_model || prev.base_model,
        temperature: defaults.default_temperature ?? prev.temperature,
        max_tokens: defaults.default_max_tokens ?? prev.max_tokens,
        context_window: defaults.default_context_window ?? prev.context_window,
        cost_per_query: defaults.default_cost_per_query ?? prev.cost_per_query,
        token_budget_min: defaults.default_token_budget_min ?? prev.token_budget_min,
        token_budget_max: defaults.default_token_budget_max ?? prev.token_budget_max,
        token_budget_recommended: defaults.default_token_budget_recommended ?? prev.token_budget_recommended,
        can_spawn_l2: defaults.default_can_spawn_l2 ?? prev.can_spawn_l2,
        can_spawn_l3: defaults.default_can_spawn_l3 ?? prev.can_spawn_l3,
        can_spawn_l4: defaults.default_can_spawn_l4 ?? prev.can_spawn_l4,
        can_use_worker_pool: defaults.default_can_use_worker_pool ?? prev.can_use_worker_pool,
        can_escalate_to: defaults.default_can_escalate_to || prev.can_escalate_to,
      }));
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!agent) return;

    setSaving(true);
    setSaveError(null);
    try {
      console.log('[AgentEditForm] Saving agent with data:', {
        id: agent.id,
        display_name: formState.display_name,
        model: formState.base_model,
        fieldsCount: Object.keys(formState).length,
      });
      await onSave({
        id: agent.id,
        ...formState,
        model: formState.base_model, // Alias for compatibility
      });
      console.log('[AgentEditForm] Save successful!');
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('[AgentEditForm] Failed to save agent:', error);
      setSaveError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // AI Enhancement: Generate gold-standard system prompt from all form data
  const handleEnhanceWithAI = async () => {
    setEnhancingPrompt(true);
    setEnhanceError(null);
    setEnhanceSuccess(false);

    try {
      console.log('🤖 [AI Enhance] Starting system prompt generation...');

      // Get function, department, role names from dropdowns
      const functionName = dropdownData.functions.find(f => f.id === formState.function_id)?.name || '';
      const departmentName = dropdownData.departments.find(d => d.id === formState.department_id)?.name || '';
      const roleName = dropdownData.roles.find(r => r.id === formState.role_id)?.name || '';

      // Build agent data from all form fields
      const agentData = {
        name: formState.name,
        tagline: formState.tagline,
        description: formState.description,
        function_name: functionName,
        department_name: departmentName,
        role_name: roleName,
        // Capabilities and knowledge
        capabilities: formState.capabilities,
        knowledge_domains: formState.knowledge_domains,
        tools: formState.tools,
        skills: formState.skills,
        responsibilities: formState.responsibilities,
        // Personality traits
        personality_formality: formState.personality_formality,
        personality_empathy: formState.personality_empathy,
        personality_directness: formState.personality_directness,
        personality_detail_orientation: formState.personality_detail_orientation,
        personality_proactivity: formState.personality_proactivity,
        personality_risk_tolerance: formState.personality_risk_tolerance,
        // Communication
        comm_verbosity: formState.comm_verbosity,
        comm_technical_level: formState.comm_technical_level,
        comm_warmth: formState.comm_warmth,
        // Existing prompt sections (to preserve/enhance)
        prompt_section_you_are: formState.prompt_section_you_are,
        prompt_section_you_do: formState.prompt_section_you_do,
        prompt_section_you_never: formState.prompt_section_you_never,
        prompt_section_success_criteria: formState.prompt_section_success_criteria,
        prompt_section_when_unsure: formState.prompt_section_when_unsure,
        prompt_section_evidence: formState.prompt_section_evidence,
        // Compliance
        hipaa_compliant: formState.hipaa_compliant,
        audit_trail_enabled: formState.audit_trail_enabled,
        data_classification: formState.data_classification,
        // Config
        base_model: formState.base_model,
        expertise_level: formState.expertise_level,
        geographic_scope: formState.geographic_scope,
        industry_specialization: formState.industry_specialization,
      };

      console.log('📤 [AI Enhance] Sending agent data:', agentData.name);

      const response = await fetch('/api/generate-system-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentData,
          mode: 'enhance',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to generate prompt (HTTP ${response.status})`);
      }

      const result = await response.json();
      console.log('✅ [AI Enhance] Received response:', {
        success: result.success,
        sectionsFound: Object.keys(result.sections || {}).length,
        tokensUsed: result.tokensUsed,
      });

      // Update form state with parsed sections
      if (result.sections) {
        setFormState(prev => ({
          ...prev,
          prompt_section_you_are: result.sections.you_are || prev.prompt_section_you_are,
          prompt_section_you_do: result.sections.you_do || prev.prompt_section_you_do,
          prompt_section_you_never: result.sections.you_never || prev.prompt_section_you_never,
          prompt_section_success_criteria: result.sections.success_criteria || prev.prompt_section_success_criteria,
          prompt_section_when_unsure: result.sections.when_unsure || prev.prompt_section_when_unsure,
          prompt_section_evidence: result.sections.evidence || prev.prompt_section_evidence,
        }));
      }

      setEnhanceSuccess(true);
      // Clear success message after 5 seconds
      setTimeout(() => setEnhanceSuccess(false), 5000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ [AI Enhance] Error:', error);
      setEnhanceError(errorMessage);
    } finally {
      setEnhancingPrompt(false);
    }
  };

  // AI Agent Builder - generates ALL agent fields from name, tagline, description
  const handleBuildWithAI = async () => {
    setBuildingAgent(true);
    setBuildError(null);
    setBuildSuccess(false);

    try {
      console.log('🔨 [AI Builder] Building complete agent from minimal input...');

      // Only send minimal data - name, tagline, description
      const agentData = {
        name: formState.name,
        tagline: formState.tagline,
        description: formState.description,
      };

      console.log('📤 [AI Builder] Sending:', agentData);

      const response = await fetch('/api/generate-system-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentData,
          mode: 'build', // Full agent builder mode
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to build agent (HTTP ${response.status})`);
      }

      const result = await response.json();
      console.log('✅ [AI Builder] Received complete agent config:', {
        success: result.success,
        detectedDomain: result.detectedDomain,
        capabilities: result.agentConfig?.capabilities?.length || 0,
        tokensUsed: result.tokensUsed,
      });

      // Update ALL form fields with AI-generated values
      if (result.agentConfig) {
        const config = result.agentConfig;

        setFormState(prev => ({
          ...prev,
          // Capabilities and skills
          capabilities: config.capabilities || prev.capabilities,
          knowledge_domains: config.knowledge_domains || prev.knowledge_domains,
          skills: config.skills || prev.skills,
          responsibilities: config.responsibilities || prev.responsibilities,
          tools: config.tools || prev.tools,

          // Personality settings
          personality_type: config.personality?.style || prev.personality_type,
          personality_formality: config.personality?.formality ?? prev.personality_formality,
          personality_empathy: config.personality?.empathy ?? prev.personality_empathy,
          personality_directness: config.personality?.directness ?? prev.personality_directness,
          personality_detail_orientation: config.personality?.detail_orientation ?? prev.personality_detail_orientation,
          personality_proactivity: config.personality?.proactivity ?? prev.personality_proactivity,
          personality_risk_tolerance: config.personality?.risk_tolerance ?? prev.personality_risk_tolerance,

          // Communication settings
          comm_verbosity: config.communication?.verbosity ?? prev.comm_verbosity,
          comm_technical_level: config.communication?.technical_level ?? prev.comm_technical_level,
          comm_warmth: config.communication?.warmth ?? prev.comm_warmth,

          // Compliance settings
          hipaa_compliant: config.compliance?.hipaa_compliant ?? prev.hipaa_compliant,
          audit_trail_enabled: config.compliance?.audit_trail_enabled ?? prev.audit_trail_enabled,
          data_classification: config.compliance?.data_classification || prev.data_classification,

          // Expertise settings
          expertise_level: config.expertise?.level || prev.expertise_level,
          expertise_years: config.expertise?.years ?? prev.expertise_years,
          geographic_scope: config.expertise?.geographic_scope || prev.geographic_scope,
          industry_specialization: config.expertise?.industry_specialization || prev.industry_specialization,

          // Model configuration
          base_model: config.model_config?.recommended_model || prev.base_model,
          temperature: config.model_config?.temperature ?? prev.temperature,
          max_tokens: config.model_config?.max_tokens ?? prev.max_tokens,
          model_justification: config.model_config?.justification || prev.model_justification,

          // System prompt sections
          prompt_section_you_are: config.prompt_sections?.you_are || prev.prompt_section_you_are,
          prompt_section_you_do: config.prompt_sections?.you_do || prev.prompt_section_you_do,
          prompt_section_you_never: config.prompt_sections?.you_never || prev.prompt_section_you_never,
          prompt_section_success_criteria: config.prompt_sections?.success_criteria || prev.prompt_section_success_criteria,
          prompt_section_when_unsure: config.prompt_sections?.when_unsure || prev.prompt_section_when_unsure,
          prompt_section_evidence: config.prompt_sections?.evidence || prev.prompt_section_evidence,
        }));

        console.log('📝 [AI Builder] Form updated with generated values');
      }

      setBuildSuccess(true);
      setShowAIBuilder(false); // Close the builder panel on success
      // Clear success message after 5 seconds
      setTimeout(() => setBuildSuccess(false), 5000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ [AI Builder] Error:', error);
      setBuildError(errorMessage);
    } finally {
      setBuildingAgent(false);
    }
  };

  // Generate YAML+MD formatted system prompt from form sections
  const generateYamlMdPrompt = React.useCallback(() => {
    const sections = [];

    if (formState.prompt_section_you_are) {
      sections.push(`## YOU ARE\n${formState.prompt_section_you_are}`);
    }
    if (formState.prompt_section_you_do) {
      sections.push(`## YOU DO\n${formState.prompt_section_you_do}`);
    }
    if (formState.prompt_section_you_never) {
      sections.push(`## YOU NEVER\n${formState.prompt_section_you_never}`);
    }
    if (formState.prompt_section_success_criteria) {
      sections.push(`## SUCCESS CRITERIA\n${formState.prompt_section_success_criteria}`);
    }
    if (formState.prompt_section_when_unsure) {
      sections.push(`## WHEN UNSURE\n${formState.prompt_section_when_unsure}`);
    }
    if (formState.prompt_section_evidence) {
      sections.push(`## EVIDENCE REQUIREMENTS\n${formState.prompt_section_evidence}`);
    }

    return sections.join('\n\n');
  }, [
    formState.prompt_section_you_are,
    formState.prompt_section_you_do,
    formState.prompt_section_you_never,
    formState.prompt_section_success_criteria,
    formState.prompt_section_when_unsure,
    formState.prompt_section_evidence,
  ]);

  // Parse YAML+MD text back into form sections
  const parseYamlMdPrompt = (text: string) => {
    // Parse the markdown sections using regex
    const youAreMatch = text.match(/##\s*YOU\s+ARE\s*\n([\s\S]*?)(?=##|$)/i);
    const youDoMatch = text.match(/##\s*YOU\s+DO\s*\n([\s\S]*?)(?=##|$)/i);
    const youNeverMatch = text.match(/##\s*YOU\s+NEVER\s*\n([\s\S]*?)(?=##|$)/i);
    const successMatch = text.match(/##\s*SUCCESS\s+CRITERIA\s*\n([\s\S]*?)(?=##|$)/i);
    const unsureMatch = text.match(/##\s*WHEN\s+UNSURE\s*\n([\s\S]*?)(?=##|$)/i);
    const evidenceMatch = text.match(/##\s*EVIDENCE\s+(REQUIREMENTS?)?\s*\n([\s\S]*?)(?=##|$)/i);

    setFormState(prev => ({
      ...prev,
      prompt_section_you_are: youAreMatch?.[1]?.trim() || prev.prompt_section_you_are,
      prompt_section_you_do: youDoMatch?.[1]?.trim() || prev.prompt_section_you_do,
      prompt_section_you_never: youNeverMatch?.[1]?.trim() || prev.prompt_section_you_never,
      prompt_section_success_criteria: successMatch?.[1]?.trim() || prev.prompt_section_success_criteria,
      prompt_section_when_unsure: unsureMatch?.[1]?.trim() || prev.prompt_section_when_unsure,
      prompt_section_evidence: evidenceMatch?.[2]?.trim() || evidenceMatch?.[1]?.trim() || prev.prompt_section_evidence,
    }));
  };

  // Update a single field
  const updateField = <K extends keyof AgentEditFormState>(
    field: K,
    value: AgentEditFormState[K]
  ) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  // Update personality/communication slider
  const updateSlider = (field: string, value: number) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  // Update personality type (also adjusts temperature) - using DB types
  const handlePersonalityTypeChange = (personalityType: PersonalityTypeOption) => {
    // Get preset slider values for this personality style (or use defaults)
    const stylePresets = PERSONALITY_STYLE_PRESETS[personalityType.style] || PERSONALITY_STYLE_PRESETS['analytical'];

    setFormState(prev => ({
      ...prev,
      // Core personality type fields
      personality_type: personalityType.slug,
      personality_type_id: personalityType.id,
      temperature: personalityType.temperature,
      // Apply personality slider presets
      personality_formality: stylePresets.personality_formality,
      personality_empathy: stylePresets.personality_empathy,
      personality_directness: stylePresets.personality_directness,
      personality_detail_orientation: stylePresets.personality_detail_orientation,
      personality_proactivity: stylePresets.personality_proactivity,
      personality_risk_tolerance: stylePresets.personality_risk_tolerance,
      // Apply communication slider presets
      comm_verbosity: stylePresets.comm_verbosity,
      comm_technical_level: stylePresets.comm_technical_level,
      comm_warmth: stylePresets.comm_warmth,
    }));

    console.log(`[AgentEditForm] Personality type changed to "${personalityType.display_name}" (${personalityType.style}). Applied presets:`, stylePresets);
  };

  // Get personality types (prefer DB, fallback to constants)
  const personalityTypes = dropdownData.personalityTypes.length > 0
    ? dropdownData.personalityTypes
    : FALLBACK_PERSONALITY_TYPES;

  // Manage prompt starters (with Supabase integration)
  const addPromptStarter = async (title: string, promptText: string) => {
    if (!title.trim() || !promptText.trim() || formState.prompt_starters.length >= 5) return;

    // Add to local state first (optimistic update)
    setFormState(prev => ({
      ...prev,
      prompt_starters: [...prev.prompt_starters, promptText.trim()],
    }));

    // Also save to Supabase if agent exists
    if (agent?.id) {
      try {
        await supabase.from('prompt_starters').insert({
          agent_id: agent.id,
          title: title.trim(),
          prompt_text: promptText.trim(),
          sort_order: formState.prompt_starters.length,
          is_active: true,
        });
        console.log('[AgentEditForm] Prompt starter saved to DB');
      } catch (error) {
        console.error('Failed to save prompt starter:', error);
      }
    }

    // Reset input
    setNewPromptStarter({ title: '', prompt: '' });
  };

  const removePromptStarter = async (index: number, starterId?: string) => {
    setFormState(prev => ({
      ...prev,
      prompt_starters: prev.prompt_starters.filter((_, i) => i !== index),
    }));

    // Also remove from Supabase if we have the ID
    if (starterId) {
      try {
        await supabase.from('prompt_starters').delete().eq('id', starterId);
        console.log('[AgentEditForm] Prompt starter removed from DB');
      } catch (error) {
        console.error('Failed to remove prompt starter:', error);
      }
    }
  };

  // Note: Array field handlers (addToArray, removeFromArray, toggleArrayItem)
  // removed - now using MultiSelectDropdown with Supabase data

  if (!agent) return null;

  const currentLevel = agent.agent_levels?.level_number || 3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b flex flex-row items-start justify-between">
          <div>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Edit Agent Configuration
            </DialogTitle>
            <DialogDescription>
              Comprehensive configuration for {agent.name || 'this agent'}
            </DialogDescription>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogHeader>

        {/* Error Alert */}
        {saveError && (
          <div className="mx-6 mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Failed to save agent</p>
              <p className="text-sm text-destructive/80 mt-1">{saveError}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              onClick={() => setSaveError(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* AI Agent Builder Panel */}
        {!showAIBuilder && !buildSuccess && (
          <div className="mx-6 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAIBuilder(true)}
              className="w-full gap-2 border-dashed border-primary/50 hover:border-primary hover:bg-primary/5"
            >
              <Wand2 className="h-4 w-4" />
              <span>Use AI Agent Builder</span>
              <Badge variant="secondary" className="ml-2 text-xs">New</Badge>
            </Button>
          </div>
        )}

        {/* AI Build Success Message */}
        {buildSuccess && (
          <div className="mx-6 mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-700 dark:text-green-400">AI Agent Builder completed</p>
              <p className="text-sm text-green-600/80 dark:text-green-400/80 mt-1">
                All agent fields have been populated. Review and adjust as needed, then save.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
              onClick={() => setBuildSuccess(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Expanded AI Builder Form */}
        {showAIBuilder && (
          <Card className="mx-6 mt-4 border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Wand2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">AI Agent Builder</CardTitle>
                    <CardDescription>
                      Just provide name, tagline, and description - AI generates everything else
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIBuilder(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="ai-name" className="text-sm font-medium flex items-center gap-2">
                  Agent Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ai-name"
                  value={formState.name}
                  onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Medical Literature Analyst"
                  className="bg-background"
                />
              </div>

              {/* Tagline Input */}
              <div className="space-y-2">
                <Label htmlFor="ai-tagline" className="text-sm font-medium">
                  Tagline
                </Label>
                <Input
                  id="ai-tagline"
                  value={formState.tagline}
                  onChange={(e) => setFormState(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="e.g., Your expert guide to medical research"
                  className="bg-background"
                />
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <Label htmlFor="ai-description" className="text-sm font-medium flex items-center gap-2">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="ai-description"
                  value={formState.description}
                  onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this agent does, its expertise, and target users. The more detail you provide, the better the AI can configure the agent."
                  className="bg-background min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Include domain keywords like &quot;clinical&quot;, &quot;regulatory&quot;, &quot;commercial&quot;, &quot;safety&quot; for better results
                </p>
              </div>

              {/* Build Error */}
              {buildError && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{buildError}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleBuildWithAI}
                  disabled={buildingAgent || !formState.name || !formState.description}
                  className="flex-1 gap-2"
                >
                  {buildingAgent ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Building Agent...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Complete Agent
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAIBuilder(false)}
                  disabled={buildingAgent}
                >
                  Cancel
                </Button>
              </div>

              {/* What gets generated info */}
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">AI will generate:</p>
                <div className="flex flex-wrap gap-1">
                  {['Capabilities', 'Skills', 'Knowledge Domains', 'Responsibilities', 'Tools', 'Personality', 'Compliance', 'Model Config', 'System Prompt'].map(item => (
                    <Badge key={item} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex" orientation="vertical">
          {/* Vertical Tabs Sidebar */}
          <div className="border-r bg-muted/30 w-48 flex-shrink-0">
            <ScrollArea className="h-[60vh]">
              <TabsList className="flex flex-col h-auto w-full bg-transparent p-2 gap-1">
                <TabsTrigger value="identity" className="w-full justify-start gap-2 px-3 py-2 h-auto">
                  <Fingerprint className="h-4 w-4" />
                  <span>Identity</span>
                </TabsTrigger>
                <TabsTrigger value="org" className="w-full justify-start gap-2 px-3 py-2 h-auto">
                  <Building className="h-4 w-4" />
                  <span>Organization</span>
                </TabsTrigger>
                <TabsTrigger value="level" className="w-full justify-start gap-2 px-3 py-2 h-auto">
                  <Layers className="h-4 w-4" />
                  <span>Role & Level</span>
                </TabsTrigger>
                <TabsTrigger value="models" className="w-full justify-start gap-2 px-3 py-2 h-auto">
                  <Cpu className="h-4 w-4" />
                  <span>Models</span>
                </TabsTrigger>
                <TabsTrigger value="personality" className="w-full justify-start gap-2 px-3 py-2 h-auto">
                  <User className="h-4 w-4" />
                  <span>Personality</span>
                </TabsTrigger>
                <TabsTrigger value="prompts" className="w-full justify-start gap-2 px-3 py-2 h-auto">
                  <MessageSquare className="h-4 w-4" />
                  <span>Prompt Starters</span>
                </TabsTrigger>
                <TabsTrigger value="hierarchy" className="w-full justify-start gap-2 px-3 py-2 h-auto">
                  <GitBranch className="h-4 w-4" />
                  <span>Hierarchy</span>
                </TabsTrigger>
                <TabsTrigger value="criteria" className="w-full justify-start gap-2 px-3 py-2 h-auto">
                  <Target className="h-4 w-4" />
                  <span>Criteria</span>
                </TabsTrigger>
                <TabsTrigger value="safety" className="w-full justify-start gap-2 px-3 py-2 h-auto">
                  <Shield className="h-4 w-4" />
                  <span>Safety</span>
                </TabsTrigger>
                <TabsTrigger value="capabilities" className="w-full justify-start gap-2 px-3 py-2 h-auto">
                  <Zap className="h-4 w-4" />
                  <span>Capabilities</span>
                </TabsTrigger>
                <TabsTrigger value="knowledge" className="w-full justify-start gap-2 px-3 py-2 h-auto">
                  <Brain className="h-4 w-4" />
                  <span>Knowledge</span>
                </TabsTrigger>
                <TabsTrigger value="tools" className="w-full justify-start gap-2 px-3 py-2 h-auto">
                  <Wrench className="h-4 w-4" />
                  <span>Tools</span>
                </TabsTrigger>
                <Separator className="my-2" />
                <TabsTrigger value="system-prompt" className="w-full justify-start gap-2 px-3 py-2 h-auto bg-primary/5 border border-primary/20">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium">System Prompt</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="w-full justify-start gap-2 px-3 py-2 h-auto">
                  <UserCog className="h-4 w-4" />
                  <span>Admin</span>
                </TabsTrigger>
              </TabsList>
            </ScrollArea>
          </div>

          {/* Content Area */}
          <ScrollArea className="flex-1 px-6 max-h-[60vh]">
            {/* TAB 1: IDENTITY */}
            <TabsContent value="identity" className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Agent Name (ID)</Label>
                    <Input
                      id="name"
                      value={formState.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="unique-agent-name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={formState.version}
                      onChange={(e) => updateField('version', e.target.value)}
                      placeholder="1.0"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={formState.tagline}
                    onChange={(e) => updateField('tagline', e.target.value)}
                    placeholder="Brief one-liner describing the agent's purpose"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formState.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Detailed agent description"
                    rows={4}
                  />
                </div>

                {/* Avatar Picker Section */}
                <Card className="border-dashed">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar Preview */}
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
                          {formState.avatar_url ? (
                            <img
                              src={formState.avatar_url}
                              alt="Agent Avatar"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_01.svg';
                              }}
                            />
                          ) : (
                            <User className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {/* Avatar Selection */}
                      <div className="flex-1 space-y-2">
                        <Label>Agent Avatar</Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setAvatarPickerOpen(true)}
                          >
                            <Sparkles className="h-4 w-4 mr-1" />
                            Choose Avatar
                          </Button>
                          {formState.avatar_url && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => updateField('avatar_url', '')}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Clear
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formState.avatar_url ? formState.avatar_url.split('/').pop() : 'No avatar selected'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Avatar Picker Modal */}
                <Dialog open={avatarPickerOpen} onOpenChange={setAvatarPickerOpen}>
                  <DialogContent className="max-w-3xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Select Agent Avatar
                      </DialogTitle>
                      <DialogDescription>
                        Choose from {dropdownData.avatars.length || 100} VITAL avatars organized by persona type
                      </DialogDescription>
                    </DialogHeader>

                    {/* Filter */}
                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="Search avatars..."
                        value={avatarFilter}
                        onChange={(e) => setAvatarFilter(e.target.value)}
                        className="flex-1"
                      />
                      <Select
                        value={avatarFilter || 'all'}
                        onValueChange={(value) => setAvatarFilter(value === 'all' ? '' : value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                          <SelectItem value="foresight">Foresight</SelectItem>
                          <SelectItem value="medical">Medical</SelectItem>
                          <SelectItem value="pharma">Pharma</SelectItem>
                          <SelectItem value="startup">Startup</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Avatar Grid */}
                    <ScrollArea className="h-[400px]">
                      {dropdownData.avatars.length > 0 ? (
                        <div className="grid grid-cols-6 gap-2">
                          {dropdownData.avatars
                            .filter(a => {
                              if (!avatarFilter) return true;
                              return (
                                a.persona_type?.toLowerCase().includes(avatarFilter.toLowerCase()) ||
                                a.business_function?.toLowerCase().includes(avatarFilter.toLowerCase()) ||
                                a.display_name?.toLowerCase().includes(avatarFilter.toLowerCase())
                              );
                            })
                            .map((avatar) => (
                              <button
                                key={avatar.id}
                                type="button"
                                onClick={() => {
                                  updateField('avatar_url', avatar.public_url);
                                  setAvatarPickerOpen(false);
                                }}
                                className={cn(
                                  'p-2 rounded-lg border-2 hover:border-primary/50 transition-all',
                                  formState.avatar_url === avatar.public_url
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border'
                                )}
                              >
                                <img
                                  src={avatar.public_url}
                                  alt={avatar.display_name || avatar.filename}
                                  className="w-12 h-12 object-contain mx-auto"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_01.svg';
                                  }}
                                />
                                <p className="text-xs text-center truncate mt-1 text-muted-foreground">
                                  {avatar.persona_type || 'Expert'}
                                </p>
                              </button>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No avatars loaded from database.</p>
                          <p className="text-sm mt-2">Using local avatar paths instead.</p>
                          {/* Fallback: Show sample avatars from local paths */}
                          <div className="grid grid-cols-6 gap-2 mt-4">
                            {['expert', 'foresight', 'medical', 'pharma', 'startup'].map((type) =>
                              ['analytics_insights', 'commercial_marketing', 'market_access', 'medical_affairs', 'product_innovation'].map((func) =>
                                [1, 2, 3, 4].map((num) => {
                                  const path = `/assets/vital/avatars/vital_avatar_${type}_${func}_${String(num).padStart(2, '0')}.svg`;
                                  return (
                                    <button
                                      key={path}
                                      type="button"
                                      onClick={() => {
                                        updateField('avatar_url', path);
                                        setAvatarPickerOpen(false);
                                      }}
                                      className={cn(
                                        'p-2 rounded-lg border-2 hover:border-primary/50 transition-all',
                                        formState.avatar_url === path
                                          ? 'border-primary bg-primary/10'
                                          : 'border-border'
                                      )}
                                    >
                                      <img
                                        src={path}
                                        alt={`${type} ${func} ${num}`}
                                        className="w-12 h-12 object-contain mx-auto"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    </button>
                                  );
                                })
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </ScrollArea>
                  </DialogContent>
                </Dialog>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="avatar_url_manual">Avatar URL (Manual)</Label>
                    <Input
                      id="avatar_url_manual"
                      value={formState.avatar_url}
                      onChange={(e) => updateField('avatar_url', e.target.value)}
                      placeholder="/assets/vital/avatars/..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formState.status}
                      onValueChange={(value) => updateField('status', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="testing">Testing</SelectItem>
                        <SelectItem value="deprecated">Deprecated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: ORGANIZATION */}
            <TabsContent value="org" className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Organizational Context
                  </CardTitle>
                  <CardDescription>
                    Define where this agent fits in the organizational structure. Select Tenant first, then Function, Department, and Role.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {/* TENANT - Top level of hierarchy */}
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-purple-500" />
                      Tenant Organization
                      <Badge variant="outline" className="text-xs">{dropdownData.tenants.length} available</Badge>
                    </Label>
                    {loadingDropdowns ? (
                      <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading tenants...</span>
                      </div>
                    ) : (
                      <Select
                        value={formState.tenant_id || 'none'}
                        onValueChange={(value) => {
                          const newTenantId = value === 'none' ? '' : value;
                          // Clear ALL dependent selections when tenant changes
                          setFormState(prev => ({
                            ...prev,
                            tenant_id: newTenantId,
                            function_id: '', // Clear function
                            department_id: '', // Clear department
                            role_id: '',       // Clear role
                          }));
                        }}
                      >
                        <SelectTrigger className={formState.tenant_id ? 'border-purple-500/50' : ''}>
                          <SelectValue placeholder="Select tenant organization..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <span className="text-muted-foreground">All Tenants</span>
                          </SelectItem>
                          {dropdownData.tenants.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id}>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-3 w-3 text-muted-foreground" />
                                {tenant.name}
                                {tenant.tenant_key && (
                                  <span className="text-xs text-muted-foreground capitalize">({tenant.tenant_key.replace(/-/g, ' ')})</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* FUNCTION - Filtered by Tenant via junction table */}
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                      Business Function
                      {formState.tenant_id && (
                        <Badge variant="secondary" className="text-xs">
                          {/* Filter functions using function_tenants junction table */}
                          {dropdownData.functions.filter(f =>
                            dropdownData.functionTenants.some(ft => ft.function_id === f.id && ft.tenant_id === formState.tenant_id)
                          ).length} for selected tenant
                        </Badge>
                      )}
                      {!formState.tenant_id && (
                        <Badge variant="outline" className="text-xs">{dropdownData.functions.length} available</Badge>
                      )}
                    </Label>
                    {loadingDropdowns ? (
                      <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading functions...</span>
                      </div>
                    ) : (
                      <Select
                        value={formState.function_id || 'none'}
                        onValueChange={(value) => {
                          const newFunctionId = value === 'none' ? '' : value;
                          // Clear dependent selections when function changes
                          setFormState(prev => ({
                            ...prev,
                            function_id: newFunctionId,
                            department_id: '', // Clear department
                            role_id: '',       // Clear role
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={formState.tenant_id ? "Select function..." : "Select a tenant first or choose from all..."} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <span className="text-muted-foreground">All Functions</span>
                          </SelectItem>
                          {/* Filter functions by selected tenant using junction table, or show all if no tenant selected */}
                          {(formState.tenant_id
                            ? dropdownData.functions.filter(func =>
                                dropdownData.functionTenants.some(ft => ft.function_id === func.id && ft.tenant_id === formState.tenant_id)
                              )
                            : dropdownData.functions
                          ).map((func) => (
                            <SelectItem key={func.id} value={func.id}>
                              {func.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {!formState.tenant_id && (
                      <p className="text-xs text-amber-600">Select a tenant to filter functions</p>
                    )}
                  </div>

                  {/* DEPARTMENT - Filtered by Function (DISABLED until Function selected) */}
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                      Department
                      {formState.function_id && (
                        <Badge variant="secondary" className="text-xs">
                          {dropdownData.departments.filter(d => d.function_id === formState.function_id).length} for selected function
                        </Badge>
                      )}
                      {!formState.function_id && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Select function first</Badge>
                      )}
                    </Label>
                    {loadingDropdowns ? (
                      <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading departments...</span>
                      </div>
                    ) : (
                      <Select
                        value={formState.department_id || 'none'}
                        onValueChange={(value) => {
                          const newDepartmentId = value === 'none' ? '' : value;
                          // Clear role when department changes
                          setFormState(prev => ({
                            ...prev,
                            department_id: newDepartmentId,
                            role_id: '', // Clear role
                          }));
                        }}
                        disabled={!formState.function_id}
                      >
                        <SelectTrigger className={!formState.function_id ? 'opacity-50 cursor-not-allowed' : ''}>
                          <SelectValue placeholder={formState.function_id ? "Select department..." : "Select a function first..."} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <span className="text-muted-foreground">No Department (Skip)</span>
                          </SelectItem>
                          {/* Filter departments by selected function */}
                          {dropdownData.departments
                            .filter(dept => dept.function_id === formState.function_id)
                            .map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                    {!formState.function_id && (
                      <p className="text-xs text-amber-600 flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Select a function first to unlock department selection
                      </p>
                    )}
                  </div>

                  {/* ROLE - Filtered by Department (DISABLED until Department selected) */}
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                      Role
                      {formState.department_id && (
                        <Badge variant="secondary" className="text-xs">
                          {dropdownData.roles.filter(r => r.department_id === formState.department_id).length} for selected department
                        </Badge>
                      )}
                      {!formState.department_id && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Select department first</Badge>
                      )}
                    </Label>
                    {loadingDropdowns ? (
                      <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading roles...</span>
                      </div>
                    ) : (
                      <Select
                        value={formState.role_id || 'none'}
                        onValueChange={(value) => updateField('role_id', value === 'none' ? '' : value)}
                        disabled={!formState.department_id}
                      >
                        <SelectTrigger className={!formState.department_id ? 'opacity-50 cursor-not-allowed' : ''}>
                          <SelectValue placeholder={formState.department_id ? "Select role..." : "Select a department first..."} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <span className="text-muted-foreground">No Role (Skip)</span>
                          </SelectItem>
                          {/* Filter roles by selected department */}
                          {dropdownData.roles
                            .filter(role => role.department_id === formState.department_id)
                            .map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                    {!formState.department_id && (
                      <p className="text-xs text-amber-600 flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Select a department first to unlock role selection
                      </p>
                    )}
                  </div>

                  {/* Selection Summary */}
                  {(formState.tenant_id || formState.function_id || formState.department_id || formState.role_id) && (
                    <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                      <Label className="text-xs text-muted-foreground">Current Selection:</Label>
                      <div className="flex flex-wrap gap-2 items-center">
                        {formState.tenant_id && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            <Building2 className="h-3 w-3 mr-1" />
                            {dropdownData.tenants.find(t => t.id === formState.tenant_id)?.name || 'Unknown'}
                          </Badge>
                        )}
                        {formState.function_id && (
                          <Badge variant="outline">
                            {formState.tenant_id && '→ '}{dropdownData.functions.find(f => f.id === formState.function_id)?.name || 'Unknown'}
                          </Badge>
                        )}
                        {formState.department_id && (
                          <Badge variant="outline">
                            → {dropdownData.departments.find(d => d.id === formState.department_id)?.name || 'Unknown'}
                          </Badge>
                        )}
                        {formState.role_id && (
                          <Badge variant="default">
                            → {dropdownData.roles.find(r => r.id === formState.role_id)?.name || 'Unknown'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: ROLE & LEVEL */}
            <TabsContent value="level" className="space-y-4 py-4">
              {/* Agent Level Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Agent Level
                  </CardTitle>
                  <CardDescription>
                    Select the agent's position in the hierarchy (L1 = Orchestrator, L5 = Tool)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {([1, 2, 3, 4, 5] as AgentLevelNumber[]).map((level) => {
                      const config = AGENT_LEVEL_COLORS[level];
                      const isSelected = currentLevel === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => handleLevelChange(level)}
                          className={cn(
                            'p-4 border-2 rounded-lg text-center transition-all',
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          <div className="font-bold text-lg">L{level}</div>
                          <div className="text-sm font-medium">{config.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {level === 1 && 'Full autonomy'}
                            {level === 2 && 'High autonomy'}
                            {level === 3 && 'Specialist'}
                            {level === 4 && 'Task executor'}
                            {level === 5 && 'API/Tool'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Level Description */}
              <Card>
                <CardContent className="pt-6">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Layers className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold">
                          Level {currentLevel}: {AGENT_LEVEL_COLORS[currentLevel]?.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {currentLevel === 1 && 'Top-level orchestrators that coordinate entire workflows and manage other agents. Full decision-making authority.'}
                          {currentLevel === 2 && 'Expert advisors with high autonomy. Can manage L3-L5 agents and make domain-specific decisions.'}
                          {currentLevel === 3 && 'Specialized agents focused on specific domains. Execute complex tasks within their expertise.'}
                          {currentLevel === 4 && 'Task-focused agents that execute specific operations. Reliable, repeatable task execution.'}
                          {currentLevel === 5 && 'Pure tools and APIs. Deterministic, fast execution. May use LLM for parameter extraction.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Responsibilities */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Responsibilities
                  </CardTitle>
                  <CardDescription>
                    Define what this agent is accountable for at Level {currentLevel}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full max-w-full overflow-hidden">
                    <MultiSelectDropdown
                      options={dropdownData.responsibilities}
                      selected={formState.responsibilities}
                      onChange={(selected) => updateField('responsibilities', selected)}
                      placeholder="Search responsibilities..."
                      loading={loadingDropdowns}
                      emptyMessage="No responsibilities found in database"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3.5: MODELS */}
            <TabsContent value="models" className="space-y-4 py-4">
              {/* Model Filters & Sort */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter & Sort Models
                  </CardTitle>
                  <CardDescription>
                    AI-powered recommendations based on agent profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Provider Filter */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Provider:</Label>
                    <div className="flex gap-2 flex-wrap">
                      {MODEL_PROVIDERS.map((provider) => (
                        <Badge
                          key={provider}
                          variant={providerFilter === provider ? 'default' : 'outline'}
                          className="cursor-pointer hover:bg-primary/10"
                          onClick={() => setProviderFilter(provider)}
                        >
                          {provider}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Sort by:</Label>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { id: 'recommended', label: 'Recommended', icon: Sparkles },
                        { id: 'cost', label: 'Cost (Low→High)', icon: DollarSign },
                        { id: 'reasoning', label: 'Reasoning', icon: Brain },
                        { id: 'medical', label: 'Medical', icon: Heart },
                        { id: 'coding', label: 'Coding', icon: Cpu },
                        { id: 'speed', label: 'Speed', icon: Zap },
                      ].map((sort) => (
                        <Badge
                          key={sort.id}
                          variant={modelSortBy === sort.id ? 'default' : 'outline'}
                          className={cn(
                            'cursor-pointer hover:bg-primary/10',
                            modelSortBy === sort.id && sort.id === 'recommended' && 'bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0'
                          )}
                          onClick={() => setModelSortBy(sort.id as typeof modelSortBy)}
                        >
                          <sort.icon className="h-3 w-3 mr-1" />
                          {sort.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Model Selection Feedback Banner */}
              {(() => {
                const selectedFunction = dropdownData.functions.find(f => f.id === formState.function_id);
                const modelsWithFit = calculateModelFit(LLM_MODELS, {
                  functionId: formState.function_id,
                  functionName: selectedFunction?.name,
                  knowledgeDomains: formState.knowledge_domains,
                  capabilities: formState.capabilities,
                  description: formState.description,
                });

                const selectedModel = modelsWithFit.find(m => m.value === formState.base_model);
                const topModel = modelsWithFit[0];
                const isOptimalChoice = selectedModel && topModel && selectedModel.value === topModel.value;
                const isGoodChoice = selectedModel && selectedModel.fitScore >= 75;
                const betterAlternatives = selectedModel ? modelsWithFit.filter(m => m.fitScore > selectedModel.fitScore).slice(0, 3) : [];

                if (!formState.base_model || !selectedModel) return null;

                return (
                  <Card className={cn(
                    'border-2',
                    isOptimalChoice ? 'border-green-500 bg-green-50 dark:bg-green-950/20' :
                    isGoodChoice ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' :
                    'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
                  )}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        {isOptimalChoice ? (
                          <>
                            <div className="rounded-full bg-green-500 p-2">
                              <Crown className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                                <ThumbsUp className="h-4 w-4" />
                                Excellent Choice!
                              </div>
                              <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                                <strong>{selectedModel.label}</strong> is the best match for this agent profile with a {selectedModel.fitScore}% fit score.
                                {selectedModel.fitReason && ` ${selectedModel.fitReason}.`}
                              </p>
                            </div>
                          </>
                        ) : isGoodChoice ? (
                          <>
                            <div className="rounded-full bg-blue-500 p-2">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                                <ThumbsUp className="h-4 w-4" />
                                Good Choice
                              </div>
                              <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">
                                <strong>{selectedModel.label}</strong> has a {selectedModel.fitScore}% fit score.
                                {betterAlternatives.length > 0 && (
                                  <span> For better performance, consider: <strong>{betterAlternatives.map(m => m.label).join(', ')}</strong></span>
                                )}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="rounded-full bg-amber-500 p-2">
                              <AlertTriangle className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                                <ArrowUp className="h-4 w-4" />
                                Consider Better Alternatives
                              </div>
                              <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                                <strong>{selectedModel.label}</strong> has a {selectedModel.fitScore}% fit score which is suboptimal for this agent.
                              </p>
                              {betterAlternatives.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {betterAlternatives.map(alt => (
                                    <button
                                      key={alt.value}
                                      type="button"
                                      onClick={() => updateField('base_model', alt.value)}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-amber-900 rounded border border-amber-300 text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-800 transition-colors"
                                    >
                                      <Sparkles className="h-3 w-3 text-amber-600" />
                                      {alt.label} ({alt.fitScore}%)
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Model Comparison Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    Model Comparison
                  </CardTitle>
                  <CardDescription>
                    {LLM_MODELS.length} models available • Click a row to select
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead className="w-[200px]">Model</TableHead>
                          <TableHead className="w-[80px] text-center">Fit</TableHead>
                          <TableHead className="w-[70px] text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Brain className="h-3 w-3" />
                              <span className="sr-only sm:not-sr-only">Reason</span>
                            </div>
                          </TableHead>
                          <TableHead className="w-[70px] text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Heart className="h-3 w-3" />
                              <span className="sr-only sm:not-sr-only">Medical</span>
                            </div>
                          </TableHead>
                          <TableHead className="w-[70px] text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Cpu className="h-3 w-3" />
                              <span className="sr-only sm:not-sr-only">Code</span>
                            </div>
                          </TableHead>
                          <TableHead className="w-[70px] text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Zap className="h-3 w-3" />
                              <span className="sr-only sm:not-sr-only">Speed</span>
                            </div>
                          </TableHead>
                          <TableHead className="w-[80px] text-right">Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          const selectedFunction = dropdownData.functions.find(f => f.id === formState.function_id);
                          const modelsWithFit = calculateModelFit(LLM_MODELS, {
                            functionId: formState.function_id,
                            functionName: selectedFunction?.name,
                            knowledgeDomains: formState.knowledge_domains,
                            capabilities: formState.capabilities,
                            description: formState.description,
                          });

                          let filtered = modelsWithFit.filter(m =>
                            providerFilter === 'All' || m.provider === providerFilter
                          );

                          if (modelSortBy === 'cost') {
                            filtered = [...filtered].sort((a, b) => a.costValue - b.costValue);
                          } else if (modelSortBy === 'reasoning') {
                            filtered = [...filtered].sort((a, b) => b.reasoning - a.reasoning);
                          } else if (modelSortBy === 'medical') {
                            filtered = [...filtered].sort((a, b) => b.medical - a.medical);
                          } else if (modelSortBy === 'coding') {
                            filtered = [...filtered].sort((a, b) => b.coding - a.coding);
                          } else if (modelSortBy === 'speed') {
                            filtered = [...filtered].sort((a, b) => b.speed - a.speed);
                          }

                          const topRecommended = modelsWithFit.slice(0, 3).map(m => m.value);

                          return filtered.slice(0, 30).map((model, index) => {
                            const isSelected = formState.base_model === model.value;
                            const isTop = index === 0 && modelSortBy === 'recommended';
                            const isRecommended = topRecommended.includes(model.value);

                            return (
                              <TableRow
                                key={model.value}
                                className={cn(
                                  'cursor-pointer transition-colors',
                                  isSelected && 'bg-primary/10 border-l-4 border-l-primary',
                                  !isSelected && isRecommended && 'bg-violet-50 dark:bg-violet-950/20',
                                  'hover:bg-muted/50'
                                )}
                                onClick={() => updateField('base_model', model.value)}
                              >
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span>{model.label}</span>
                                        {model.isLatest && (
                                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-orange-100 text-orange-700 border-orange-300">
                                            <Flame className="h-2.5 w-2.5 mr-0.5" />
                                            New
                                          </Badge>
                                        )}
                                        {isTop && (
                                          <Badge className="text-[10px] px-1 py-0 h-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0">
                                            <Crown className="h-2.5 w-2.5 mr-0.5" />
                                            Best
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <span>{model.provider}</span>
                                        {model.trainingCutoff && (
                                          <>
                                            <span>•</span>
                                            <Clock className="h-3 w-3" />
                                            <span>{model.trainingCutoff}</span>
                                          </>
                                        )}
                                        {model.supportsVision && (
                                          <Eye className="h-3 w-3 text-blue-500" title="Supports Vision" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className={cn(
                                    'inline-flex items-center justify-center w-12 h-6 rounded-full text-xs font-bold',
                                    model.fitScore >= 85 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                    model.fitScore >= 70 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                                    model.fitScore >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                                    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                  )}>
                                    {model.fitScore}%
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <div className="w-8 h-1.5 bg-muted rounded-full overflow-hidden">
                                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${model.reasoning}%` }} />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-6">{model.reasoning}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <div className="w-8 h-1.5 bg-muted rounded-full overflow-hidden">
                                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${model.medical}%` }} />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-6">{model.medical}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <div className="w-8 h-1.5 bg-muted rounded-full overflow-hidden">
                                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${model.coding}%` }} />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-6">{model.coding}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <div className="w-8 h-1.5 bg-muted rounded-full overflow-hidden">
                                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${model.speed}%` }} />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-6">{model.speed}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right text-xs">
                                  <span className={cn(
                                    'font-medium',
                                    model.costValue <= 0.02 ? 'text-green-600' :
                                    model.costValue <= 0.10 ? 'text-blue-600' :
                                    'text-amber-600'
                                  )}>
                                    {model.cost}
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          });
                        })()}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Model Parameters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Model Parameters
                  </CardTitle>
                  <CardDescription>
                    Fine-tune the model behavior for this agent
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SliderGroup
                    title=""
                    sliders={MODEL_SLIDERS}
                    values={{
                      temperature: formState.temperature,
                      max_tokens: formState.max_tokens,
                      context_window: formState.context_window,
                    }}
                    onChange={updateSlider}
                    columns={1}
                  />

                  <Separator />

                  <SliderGroup
                    title="Token Budget"
                    sliders={TOKEN_BUDGET_SLIDERS}
                    values={{
                      token_budget_min: formState.token_budget_min,
                      token_budget_max: formState.token_budget_max,
                      token_budget_recommended: formState.token_budget_recommended,
                    }}
                    onChange={updateSlider}
                    columns={3}
                  />
                </CardContent>
              </Card>

              {/* Model Evidence */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Model Justification
                  </CardTitle>
                  <CardDescription>
                    Document why this model was selected (required for evidence-based operations)
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="model_justification">Justification</Label>
                    <Textarea
                      id="model_justification"
                      value={formState.model_justification}
                      onChange={(e) => updateField('model_justification', e.target.value)}
                      placeholder="e.g., Ultra-specialist requiring highest accuracy for pharmacovigilance. GPT-4 achieves 86.7% on MedQA (USMLE)."
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="model_citation">Citation</Label>
                    <Input
                      id="model_citation"
                      value={formState.model_citation}
                      onChange={(e) => updateField('model_citation', e.target.value)}
                      placeholder="e.g., OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 4: PERSONALITY & STYLE */}
            <TabsContent value="personality" className="space-y-4 py-4">
              {/* Personality Type Selection - Affects Temperature */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Personality Type
                  </CardTitle>
                  <CardDescription>
                    Select a thinking style - this sets the agent's temperature and communication approach
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Personality Type Dropdown */}
                  <Select
                    value={formState.personality_type_id || formState.personality_type || ''}
                    onValueChange={(value) => {
                      const selected = personalityTypes.find(pt => pt.id === value || pt.slug === value);
                      if (selected) handlePersonalityTypeChange(selected);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a personality type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {personalityTypes.map((pt) => (
                        <SelectItem key={pt.id} value={pt.id || pt.slug}>
                          <div className="flex items-center gap-3">
                            <PersonalityIcon iconName={pt.icon} className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{pt.display_name || pt.name}</span>
                            <span className="text-xs text-muted-foreground">T:{pt.temperature}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Selected personality details */}
                  {(formState.personality_type_id || formState.personality_type) && (
                    <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-2">
                      {(() => {
                        const selected = personalityTypes.find(
                          pt => pt.id === formState.personality_type_id || pt.slug === formState.personality_type
                        );
                        if (!selected) return null;
                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{selected.display_name || selected.name}</span>
                              <Badge variant="outline">Icon: {selected.icon}</Badge>
                            </div>
                            <p className="text-muted-foreground text-xs">{selected.description}</p>
                            <div className="flex gap-2 text-xs">
                              <Badge variant="secondary">Temperature: {selected.temperature}</Badge>
                              <Badge variant="secondary" className="capitalize">Category: {selected.category}</Badge>
                              <Badge variant="secondary">Style: {selected.style}</Badge>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Personality Sliders */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Fine-Tune Personality Traits</CardTitle>
                  <CardDescription>
                    Adjust specific characteristics (0-100 scale)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SliderGroup
                    sliders={PERSONALITY_SLIDERS}
                    values={{
                      personality_formality: formState.personality_formality,
                      personality_empathy: formState.personality_empathy,
                      personality_directness: formState.personality_directness,
                      personality_detail_orientation: formState.personality_detail_orientation,
                      personality_proactivity: formState.personality_proactivity,
                      personality_risk_tolerance: formState.personality_risk_tolerance,
                    }}
                    onChange={updateSlider}
                    columns={2}
                  />
                </CardContent>
              </Card>

              {/* Communication Sliders */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Communication Style</CardTitle>
                  <CardDescription>
                    Adjust how the agent communicates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SliderGroup
                    sliders={COMMUNICATION_SLIDERS}
                    values={{
                      comm_verbosity: formState.comm_verbosity,
                      comm_technical_level: formState.comm_technical_level,
                      comm_warmth: formState.comm_warmth,
                    }}
                    onChange={updateSlider}
                    columns={3}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 5: PROMPT STARTERS (separate from personality) */}
            <TabsContent value="prompts" className="space-y-4 py-4">
              {/* Prompt Starters Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Prompt Starters
                    <Badge variant="outline" className="ml-auto text-xs">
                      {dropdownData.promptStarters.length > 0 ? 'Synced with DB' : 'Local'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Suggested conversation starters shown to users (max 5). Stored in Supabase prompt_starters table.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current starters from DB */}
                  {dropdownData.promptStarters.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Saved starters:</Label>
                      {dropdownData.promptStarters.map((starter) => (
                        <div key={starter.id} className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{starter.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{starter.prompt_text}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePromptStarter(
                              dropdownData.promptStarters.indexOf(starter),
                              starter.id
                            )}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Local starters (not yet saved) */}
                  {formState.prompt_starters.length > 0 && dropdownData.promptStarters.length === 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Unsaved starters:</Label>
                      {formState.prompt_starters.map((starter, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                          <span className="flex-1 text-sm">{starter}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePromptStarter(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new starter */}
                  {(dropdownData.promptStarters.length + formState.prompt_starters.length) < 5 && (
                    <div className="space-y-3 p-3 border border-dashed rounded-lg">
                      <Label>Add New Prompt Starter</Label>
                      <Input
                        placeholder="Title (e.g., 'Clinical Trial Query')"
                        value={newPromptStarter.title}
                        onChange={(e) => setNewPromptStarter(prev => ({ ...prev, title: e.target.value }))}
                      />
                      <Input
                        placeholder="Prompt text (e.g., 'What are the latest clinical trial results for...')"
                        value={newPromptStarter.prompt}
                        onChange={(e) => setNewPromptStarter(prev => ({ ...prev, prompt: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newPromptStarter.title && newPromptStarter.prompt) {
                            e.preventDefault();
                            addPromptStarter(newPromptStarter.title, newPromptStarter.prompt);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (newPromptStarter.title && newPromptStarter.prompt) {
                            addPromptStarter(newPromptStarter.title, newPromptStarter.prompt);
                          }
                        }}
                        disabled={!newPromptStarter.title || !newPromptStarter.prompt}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Starter
                      </Button>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {dropdownData.promptStarters.length + formState.prompt_starters.length}/5 prompt starters configured
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 6: 6-SECTION PROMPT BUILDER */}
            {/* NEW: SYSTEM PROMPT TAB - Single YAML+MD Form */}
            <TabsContent value="system-prompt" className="space-y-4 py-4">
              <Card className="border-primary/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">System Prompt (YAML + Markdown)</CardTitle>
                        <CardDescription>
                          The complete system prompt that defines your agent&apos;s behavior. Use AI to generate or edit manually.
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEnhanceWithAI}
                        disabled={enhancingPrompt || !formState.name}
                        className="gap-2"
                      >
                        {enhancingPrompt ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Generate with AI
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Copy to clipboard
                          const systemPrompt = generateYamlMdPrompt();
                          navigator.clipboard.writeText(systemPrompt);
                        }}
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                  </div>

                  {/* Success/Error messages */}
                  {enhanceSuccess && (
                    <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-700 dark:text-green-400">
                        System prompt generated successfully! Review and adjust as needed.
                      </span>
                    </div>
                  )}
                  {enhanceError && (
                    <div className="mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-destructive">Failed to generate prompt</p>
                        <p className="text-sm text-destructive/80">{enhanceError}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setEnhanceError(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {/* Preview of YAML frontmatter */}
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
                    <p className="text-xs font-mono text-muted-foreground mb-2">YAML Frontmatter (auto-generated from form data):</p>
                    <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
{`---
agent_name: "${formState.name || 'untitled'}"
version: "${formState.version || '1.0'}"
model: "${formState.base_model || 'gpt-4'}"
temperature: ${formState.temperature || 0.4}
max_tokens: ${formState.max_tokens || 3000}
expertise_level: "${formState.expertise_level || 'senior'}"
hipaa_compliant: ${formState.hipaa_compliant || false}
---`}
                    </pre>
                  </div>

                  {/* Single large textarea for the markdown body */}
                  <div className="grid gap-2">
                    <Label htmlFor="system_prompt" className="text-sm font-medium">
                      Markdown System Prompt
                    </Label>
                    <Textarea
                      id="system_prompt"
                      value={generateYamlMdPrompt()}
                      onChange={(e) => parseYamlMdPrompt(e.target.value)}
                      placeholder={`## YOU ARE
[Define the agent's specific role and unique positioning...]

## YOU DO
[List 3-7 specific capabilities with measurable outcomes...]

## YOU NEVER
[Define 3-5 safety-critical boundaries with rationale...]

## SUCCESS CRITERIA
[Define measurable performance targets...]

## WHEN UNSURE
[Define escalation protocol with confidence thresholds...]

## EVIDENCE REQUIREMENTS
[Define what sources to cite, evidence hierarchy...]`}
                      className="font-mono text-sm min-h-[500px] resize-y"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use the 6-section framework: YOU ARE, YOU DO, YOU NEVER, SUCCESS CRITERIA, WHEN UNSURE, EVIDENCE REQUIREMENTS
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 7: HIERARCHY & RELATIONSHIPS */}
            <TabsContent value="hierarchy" className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Reporting Structure</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Reports To</Label>
                    <Select
                      value={formState.reports_to_agent_id}
                      onValueChange={(value) => updateField('reports_to_agent_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent agent..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {availableAgents.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Escalates To</Label>
                    <Select
                      value={formState.can_escalate_to}
                      onValueChange={(value) => updateField('can_escalate_to', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select escalation target..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="HITL">Human in the Loop</SelectItem>
                        <SelectItem value="L1">L1 Master</SelectItem>
                        <SelectItem value="L2">L2 Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Spawning Capabilities</CardTitle>
                  <CardDescription>
                    What lower-level agents can this agent spawn?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Can Spawn L2 (Expert)</Label>
                      <p className="text-xs text-muted-foreground">
                        Spawn domain expert agents
                      </p>
                    </div>
                    <Switch
                      checked={formState.can_spawn_l2}
                      onCheckedChange={(checked) => updateField('can_spawn_l2', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Can Spawn L3 (Specialist)</Label>
                      <p className="text-xs text-muted-foreground">
                        Spawn task specialists
                      </p>
                    </div>
                    <Switch
                      checked={formState.can_spawn_l3}
                      onCheckedChange={(checked) => updateField('can_spawn_l3', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Can Spawn L4 (Worker)</Label>
                      <p className="text-xs text-muted-foreground">
                        Spawn worker agents for data tasks
                      </p>
                    </div>
                    <Switch
                      checked={formState.can_spawn_l4}
                      onCheckedChange={(checked) => updateField('can_spawn_l4', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Can Use Worker Pool</Label>
                      <p className="text-xs text-muted-foreground">
                        Access shared worker pool for parallel tasks
                      </p>
                    </div>
                    <Switch
                      checked={formState.can_use_worker_pool}
                      onCheckedChange={(checked) => updateField('can_use_worker_pool', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* L4/L5 Agent Selection - Only show for agents that can spawn */}
              {(formState.can_spawn_l4 || formState.can_spawn_l3) && agent && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Configure L4/L5 Agents</CardTitle>
                    <CardDescription>
                      Select specific L4 Workers and L5 Tools this agent can spawn. AI will recommend agents based on domain expertise.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SubagentSelector
                      agent={agent}
                      onSave={(config: SubagentHierarchyConfig) => {
                        // Update the agent's metadata with the hierarchy config
                        updateField('metadata', {
                          ...formState.metadata,
                          hierarchy: config,
                        });
                      }}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* TAB 8: SUCCESS CRITERIA */}
            <TabsContent value="criteria" className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Success Criteria Targets</CardTitle>
                  <CardDescription>
                    Adjust target percentages for success metrics (auto-populated based on agent level)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Success criteria will be auto-generated when the agent is saved based on the selected level.
                    You can customize targets after creation.
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Current Level: <strong>L{currentLevel}</strong> -
                      Default success criteria will be applied
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 9: SAFETY & COMPLIANCE */}
            <TabsContent value="safety" className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Compliance Flags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>HIPAA Compliant</Label>
                      <p className="text-xs text-muted-foreground">
                        Agent handles PHI according to HIPAA regulations
                      </p>
                    </div>
                    <Switch
                      checked={formState.hipaa_compliant}
                      onCheckedChange={(checked) => updateField('hipaa_compliant', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Audit Trail Enabled</Label>
                      <p className="text-xs text-muted-foreground">
                        All interactions are logged for compliance
                      </p>
                    </div>
                    <Switch
                      checked={formState.audit_trail_enabled}
                      onCheckedChange={(checked) => updateField('audit_trail_enabled', checked)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Data Classification</Label>
                    <Select
                      value={formState.data_classification}
                      onValueChange={(value) => updateField('data_classification', value as DataClassification)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="confidential">Confidential</SelectItem>
                        <SelectItem value="restricted">Restricted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Expertise Profile</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Expertise Level</Label>
                      <Select
                        value={formState.expertise_level}
                        onValueChange={(value) => updateField('expertise_level', value as ExpertiseLevel)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry</SelectItem>
                          <SelectItem value="mid">Mid</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                          <SelectItem value="thought_leader">Thought Leader</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="expertise_years">Years of Experience</Label>
                      <Input
                        id="expertise_years"
                        type="number"
                        min="0"
                        max="50"
                        value={formState.expertise_years}
                        onChange={(e) => updateField('expertise_years', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Geographic Scope</Label>
                      <Select
                        value={formState.geographic_scope}
                        onValueChange={(value) => updateField('geographic_scope', value as GeographicScope)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Local</SelectItem>
                          <SelectItem value="regional">Regional</SelectItem>
                          <SelectItem value="national">National</SelectItem>
                          <SelectItem value="global">Global</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="industry">Industry Specialization</Label>
                      <Input
                        id="industry"
                        value={formState.industry_specialization}
                        onChange={(e) => updateField('industry_specialization', e.target.value)}
                        placeholder="e.g., pharmaceuticals"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 10: CAPABILITIES & SKILLS */}
            <TabsContent value="capabilities" className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Capabilities
                    <Badge variant="outline" className="ml-auto text-xs">
                      {formState.capabilities.length} selected
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Select capabilities this agent possesses. Skills will filter based on selected capabilities.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Capability Category Filter Badges */}
                  <div className="flex gap-2 flex-wrap">
                    {CAPABILITY_CATEGORIES.map((category) => (
                      <Badge
                        key={category}
                        variant={capabilityFilter === category ? 'default' : 'outline'}
                        className="cursor-pointer hover:bg-primary/10"
                        onClick={() => setCapabilityFilter(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>

                  <div className="w-full max-w-full overflow-hidden">
                    <MultiSelectDropdown
                      options={
                        capabilityFilter === 'All'
                          ? dropdownData.capabilities
                          : dropdownData.capabilities.filter(cap =>
                              cap.category?.toLowerCase().includes(capabilityFilter.toLowerCase()) ||
                              cap.name?.toLowerCase().includes(capabilityFilter.toLowerCase())
                            )
                      }
                      selected={formState.capabilities}
                      onChange={(selected) => {
                        updateField('capabilities', selected);
                        // Clear skills that don't belong to selected capabilities if needed
                      }}
                      placeholder="Search capabilities..."
                      loading={loadingDropdowns}
                      emptyMessage={
                        capabilityFilter !== 'All'
                          ? `No capabilities found for "${capabilityFilter}"`
                          : 'No capabilities found in database'
                      }
                    />
                  </div>
                  {formState.capabilities.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {formState.capabilities.length} capability(ies) selected - skills below are filtered accordingly
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    Skills
                    {formState.capabilities.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Filtered by {formState.capabilities.length} capabilities
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {formState.capabilities.length > 0
                      ? 'Showing skills related to selected capabilities'
                      : 'Select capabilities first to filter skills, or choose from all skills'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full max-w-full overflow-hidden">
                    <MultiSelectDropdown
                      options={
                        formState.capabilities.length > 0
                          ? dropdownData.skills.filter(skill =>
                              // If skill has capability_id, filter by selected capabilities
                              // Otherwise show all skills
                              !skill.capability_id ||
                              formState.capabilities.includes(skill.capability_id)
                            )
                          : dropdownData.skills
                      }
                      selected={formState.skills}
                      onChange={(selected) => updateField('skills', selected)}
                      placeholder="Search skills..."
                      loading={loadingDropdowns}
                      emptyMessage={
                        formState.capabilities.length > 0
                          ? 'No skills found for selected capabilities'
                          : 'No skills found in database'
                      }
                    />
                  </div>
                </CardContent>
              </Card>

            </TabsContent>

            {/* TAB 11: KNOWLEDGE & RAG */}
            <TabsContent value="knowledge" className="space-y-4 py-4">
              {/* Global RAG Toggle */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Platform Knowledge (RAG)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Platform RAG</Label>
                      <p className="text-xs text-muted-foreground">
                        Agent accesses shared VITAL knowledge base
                      </p>
                    </div>
                    <Switch
                      checked={formState.rag_enabled}
                      onCheckedChange={(checked) => updateField('rag_enabled', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Agent-Specific RAG */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Agent-Specific RAG
                  </CardTitle>
                  <CardDescription>
                    Upload custom knowledge for this agent only
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Agent-Specific Knowledge</Label>
                      <p className="text-xs text-muted-foreground">
                        Agent uses custom documents uploaded below
                      </p>
                    </div>
                    <Switch
                      checked={formState.agent_specific_rag}
                      onCheckedChange={(checked) => updateField('agent_specific_rag', checked)}
                    />
                  </div>

                  {formState.agent_specific_rag && (
                    <div className="space-y-3 pt-2">
                      <Label>Content Files</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Drag & drop files here, or click to browse
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Supports PDF, TXT, DOCX, MD (max 10MB each)
                          </p>
                          <Button variant="outline" size="sm" type="button">
                            Upload Files
                          </Button>
                        </div>
                      </div>
                      {formState.rag_content_files.length > 0 && (
                        <div className="space-y-2">
                          {formState.rag_content_files.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                              <FileText className="h-4 w-4" />
                              <span className="flex-1 text-sm truncate">{file}</span>
                              <Button variant="ghost" size="sm" type="button">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Knowledge Domains with Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Knowledge Domains</CardTitle>
                  <CardDescription>
                    Filter and select knowledge domains this agent can access
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Category Filter */}
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => {/* Filter by category */}}
                    >
                      All Domains
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10"
                    >
                      Clinical
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10"
                    >
                      Regulatory
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10"
                    >
                      Commercial
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10"
                    >
                      Medical Affairs
                    </Badge>
                  </div>

                  <MultiSelectDropdown
                    options={dropdownData.knowledgeDomains}
                    selected={formState.knowledge_domains}
                    onChange={(selected) => updateField('knowledge_domains', selected)}
                    placeholder="Search knowledge domains..."
                    loading={loadingDropdowns}
                    emptyMessage="No knowledge domains found in database"
                  />
                  {formState.knowledge_domains.length === 0 && !loadingDropdowns && (
                    <p className="text-xs text-muted-foreground italic">
                      No domains selected - agent will have access to all knowledge
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 12: TOOLS */}
            <TabsContent value="tools" className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Tools & Integrations
                  </CardTitle>
                  <CardDescription>
                    Filter and select tools this agent can use from the registry
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Category Filter */}
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10"
                    >
                      All Tools
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10"
                    >
                      Data
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10"
                    >
                      Analysis
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10"
                    >
                      Communication
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10"
                    >
                      Integration
                    </Badge>
                  </div>

                  <MultiSelectDropdown
                    options={dropdownData.tools}
                    selected={formState.tools}
                    onChange={(selected) => updateField('tools', selected)}
                    placeholder="Search tools..."
                    loading={loadingDropdowns}
                    emptyMessage="No tools found in database"
                  />

                  {formState.tools.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formState.tools.length} tool(s) selected
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 13: ADMIN CONTROLS (Super Admin Only) */}
            <TabsContent value="admin" className="space-y-4 py-4">
              {/* Tenant Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Tenant Assignment
                  </CardTitle>
                  <CardDescription>
                    Assign this agent to a specific tenant organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tenant_id">Assigned Tenant</Label>
                    <Select
                      value={formState.tenant_id || 'none'}
                      onValueChange={(value) => updateField('tenant_id', value === 'none' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenant..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <span className="text-muted-foreground">No tenant (Platform-wide)</span>
                        </SelectItem>
                        {dropdownData.tenants.map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            <div className="flex items-center gap-2">
                              <span>{tenant.name}</span>
                              {tenant.tenant_key && (
                                <span className="text-xs text-muted-foreground">({tenant.tenant_key})</span>
                              )}
                              {!tenant.is_active && (
                                <Badge variant="secondary" className="text-xs">Inactive</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Agents can be tenant-specific or platform-wide (no tenant assigned)
                    </p>
                  </div>

                  {formState.tenant_id && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-800">
                        This agent is assigned to:{' '}
                        <strong>
                          {dropdownData.tenants.find(t => t.id === formState.tenant_id)?.name || 'Unknown'}
                        </strong>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Visibility & Access Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Visibility & Access
                  </CardTitle>
                  <CardDescription>
                    Control who can see and interact with this agent
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Public Toggle */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="is_public" className="font-medium">
                          Public Access
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        When enabled, this agent is visible to all users in the agent store
                      </p>
                    </div>
                    <Switch
                      id="is_public"
                      checked={formState.is_public}
                      onCheckedChange={(checked) => updateField('is_public', checked)}
                    />
                  </div>

                  {/* Duplicate Toggle */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Copy className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="allow_duplicate" className="font-medium">
                          Allow Duplication
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        When enabled, users can create their own copy of this agent
                      </p>
                    </div>
                    <Switch
                      id="allow_duplicate"
                      checked={formState.allow_duplicate}
                      onCheckedChange={(checked) => updateField('allow_duplicate', checked)}
                    />
                  </div>

                  {/* Status Summary */}
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <Label className="text-xs text-muted-foreground mb-2 block">Current Visibility:</Label>
                    <div className="flex gap-2 flex-wrap">
                      {formState.is_public ? (
                        <Badge variant="default" className="bg-green-600">Public</Badge>
                      ) : (
                        <Badge variant="secondary">Private</Badge>
                      )}
                      {formState.allow_duplicate ? (
                        <Badge variant="outline">Duplicatable</Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-300">No Duplication</Badge>
                      )}
                      {formState.tenant_id ? (
                        <Badge variant="outline">Tenant-specific</Badge>
                      ) : (
                        <Badge variant="outline" className="text-blue-600 border-blue-300">Platform-wide</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Agent Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserCog className="h-4 w-4" />
                    Agent Metadata
                  </CardTitle>
                  <CardDescription>
                    Additional administrative information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Label className="text-xs text-muted-foreground">Agent ID</Label>
                      <p className="font-mono text-xs mt-1 truncate">{agent?.id || 'Not saved yet'}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <p className="font-medium text-sm mt-1 capitalize">{formState.status}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Label className="text-xs text-muted-foreground">Validation</Label>
                      <p className="font-medium text-sm mt-1 capitalize">{formState.validation_status}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Label className="text-xs text-muted-foreground">Personality Type ID</Label>
                      <p className="font-mono text-xs mt-1 truncate">{formState.personality_type_id || 'None'}</p>
                    </div>
                  </div>

                  {/* Status Change */}
                  <div className="grid gap-2">
                    <Label htmlFor="status">Agent Status</Label>
                    <Select
                      value={formState.status}
                      onValueChange={(value) => updateField('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="testing">Testing</SelectItem>
                        <SelectItem value="active">Active (Production)</SelectItem>
                        <SelectItem value="deprecated">Deprecated</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AgentEditFormEnhanced;
