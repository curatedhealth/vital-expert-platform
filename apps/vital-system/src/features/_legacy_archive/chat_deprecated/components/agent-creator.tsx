'use client';

import {
  X,
  Plus,
  Brain,
  Zap,
  Settings,
  Save,
  Lightbulb,
  Star,
  Trash2,
  CheckCircle,
  MessageSquare,
  User,
  Building2,
  Wrench,
  BookOpen,
  Cpu,
  Eye,
  Edit3,
  Check,
  Sparkles
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

import { AgentAvatar } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { IconSelectionModal } from '@vital/ui';
import { Input } from '@vital/ui';
import { Label } from '@vital/ui';
import { BUSINESS_FUNCTIONS, DEPARTMENTS_BY_FUNCTION, ROLES_BY_DEPARTMENT } from '@/config/organizational-structure';
import { AgentService, type AgentWithCategories } from '@/features/agents/services/agent-service';
import { TOOL_STATUS } from '@/features/chat/tools/tool-registry';
import { promptGenerationService } from '@/lib/services/prompt-generation-service';
import { useAgentsStore } from '@/lib/stores/agents-store';
import { useChatStore } from '@/lib/stores/chat-store';
import { supabase } from '@vital/sdk/client';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@vital/ui/lib/utils';
import type {
  MedicalCapability,
  MedicalCompetency,
  HealthcareBusinessFunction,
  HealthcareRole,
  SystemPromptGenerationRequest,
  SystemPromptGenerationResponse
} from '@/types/healthcare-compliance';

// Import Sprint 2 components from separate files
import { CapabilitiesTab } from './agent-creator/CapabilitiesTab';
import { KnowledgeTab } from './agent-creator/KnowledgeTab';
import { ToolsTab } from './agent-creator/ToolsTab';

interface AgentCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingAgent?: AgentWithCategories | null;
}

// Default model options (fallback)
const defaultModelOptions = [
  { id: 'gpt-4', name: 'GPT-4', description: 'Most capable, best for complex reasoning' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Faster GPT-4 with 128K context window' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient for most tasks' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Most powerful Claude model for complex tasks' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced performance and speed' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fastest Claude model for quick responses' },
  { id: 'CuratedHealth/base_7b', name: 'CuratedHealth Base 7B', description: 'Hugging Face fine-tuned 7B parameter base model' },
  { id: 'CuratedHealth/meditron70b-qlora-1gpu', name: 'Meditron 70B QLoRA', description: 'Medical-focused 70B model optimized for single GPU' },
  { id: 'CuratedHealth/Qwen3-8B-SFT-20250917123923', name: 'Qwen3 8B SFT', description: 'Supervised fine-tuned Qwen3 8B model for medical tasks' },
];

interface ModelOption {
  id: string;
  name: string;
  description: string;
  provider?: string;
  maxTokens?: number;
}

// Avatar icons will be loaded from Supabase IconService

const predefinedCapabilities = [
  'Regulatory Guidance',
  'Clinical Research',
  'Market Access',
  'Technical Architecture',
  'Data Analysis',
  'Risk Assessment',
  'Compliance Review',
  'Protocol Design',
  'Evidence Generation',
  'Business Strategy',
  'Quality Assurance',
  'Pharmacovigilance',
];

const availableTools = [
  'Web Search',
  'Document Analysis',
  'Data Calculator',
  'Regulatory Database Search',
  'Literature Search',
  'Statistical Analysis',
  'Timeline Generator',
  'Budget Calculator',
  'Risk Assessment Matrix',
  'Compliance Checker',
  'Citation Generator',
  'Template Generator',
];

import { IconService, type Icon } from '@/lib/services/icon-service';
import { ModelFitnessScorer, type FitnessScore, type ModelCapabilities, type AgentProfile } from '@/lib/services/model-fitness-scorer';

// Agent Level Constants (5-Level Hierarchy)
const AGENT_LEVELS = {
  MASTER: {
    id: '5e27905e-6f58-462e-93a4-6fad5388ebaf',
    name: 'Master',
    tier_equivalent: 3, // For backward compatibility
    description: 'Top-level orchestrator managing entire domains or functions'
  },
  EXPERT: {
    id: 'a6e394b0-6ca1-4cb1-8097-719523ee6782',
    name: 'Expert',
    tier_equivalent: 3, // Expert level
    description: 'Deep domain specialist with advanced analytical capabilities'
  },
  SPECIALIST: {
    id: '5a3647eb-a2bd-43f2-9c8b-6413d39ed0fb',
    name: 'Specialist',
    tier_equivalent: 2, // Mid-level
    description: 'Focused specialist for specific sub-domains or technical tasks'
  },
  WORKER: {
    id: 'c6f7eec5-3fc5-4f10-b030-bce0d22480e8',
    name: 'Worker',
    tier_equivalent: 1, // Basic level
    description: 'Task-execution agent for routine, repeatable work'
  },
  TOOL: {
    id: '45420d67-67bf-44cf-a842-44bbaf3145e7',
    name: 'Tool',
    tier_equivalent: 1, // Basic level
    description: 'Micro-agent wrapping specific tools, APIs, or atomic operations'
  }
} as const;

// Helper function to get tier equivalent for backward compatibility
const getTierFromAgentLevel = (agentLevelId: string): 1 | 2 | 3 => {
  const level = Object.values(AGENT_LEVELS).find(l => l.id === agentLevelId);
  return (level?.tier_equivalent || 2) as 1 | 2 | 3;
};

interface PromptStarter {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: string; // Icon name/id from the database
  iconUrl?: string; // Full URL to the icon
}

interface Tool {
  id: string;
  name: string;
  description: string | null;
  type: string | null;
  category: string | null;
  api_endpoint: string | null;
  configuration: any;
  authentication_required: boolean | null;
  rate_limit: string | null;
  cost_model: string | null;
  documentation_url: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

// Knowledge domains will be loaded from database
// This is just a fallback if database fetch fails
const fallbackKnowledgeDomains = [
  { value: 'digital-health', label: 'Digital Health' },
  { value: 'clinical-research', label: 'Clinical Research' },
  { value: 'market-access', label: 'Market Access' },
  { value: 'regulatory', label: 'Regulatory' },
  { value: 'quality-assurance', label: 'Quality Assurance' },
  { value: 'health-economics', label: 'Health Economics' },
];

// Use shared organizational structure configuration
const staticBusinessFunctions = BUSINESS_FUNCTIONS;
const staticDepartmentsByFunction = DEPARTMENTS_BY_FUNCTION;
const staticRolesByDepartment = ROLES_BY_DEPARTMENT;

const roles = [
  { value: 'AI/ML Specialist', label: 'AI/ML Specialist' },
  { value: 'Algorithm Validation', label: 'Algorithm Validation' },
  { value: 'AR/VR Developer', label: 'AR/VR Developer' },
  { value: 'Audit & Inspection', label: 'Audit & Inspection' },
  { value: 'Biomarker Development', label: 'Biomarker Development' },
  { value: 'Blockchain Specialist', label: 'Blockchain Specialist' },
  { value: 'Canada Regulatory Specialist', label: 'Canada Regulatory Specialist' },
  { value: 'Cardiology Specialist', label: 'Cardiology Specialist' },
  { value: 'China Regulatory Specialist', label: 'China Regulatory Specialist' },
  { value: 'Cybersecurity Specialist', label: 'Cybersecurity Specialist' },
  { value: 'Data Orchestration', label: 'Data Orchestration' },
  { value: 'Diabetes Specialist', label: 'Diabetes Specialist' },
  { value: 'Digital Innovation', label: 'Digital Innovation' },
  { value: 'Documentation', label: 'Documentation' },
  { value: 'DTx Strategy', label: 'DTx Strategy' },
  { value: 'Education Specialist', label: 'Education Specialist' },
  { value: 'EU Regulatory Specialist', label: 'EU Regulatory Specialist' },
  { value: 'Global Strategy', label: 'Global Strategy' },
  { value: 'Health Economics', label: 'Health Economics' },
  { value: 'Investor Relations', label: 'Investor Relations' },
  { value: 'Japan Regulatory Specialist', label: 'Japan Regulatory Specialist' },
  { value: 'KOL Management', label: 'KOL Management' },
  { value: 'Market Analysis', label: 'Market Analysis' },
  { value: 'Master Coordinator', label: 'Master Coordinator' },
  { value: 'Medical Strategy', label: 'Medical Strategy' },
  { value: 'Mental Health Specialist', label: 'Mental Health Specialist' },
  { value: 'Neurology Specialist', label: 'Neurology Specialist' },
  { value: 'Oncology Specialist', label: 'Oncology Specialist' },
  { value: 'Partnership Strategy', label: 'Partnership Strategy' },
  { value: 'Predictive Analytics', label: 'Predictive Analytics' },
  { value: 'Quality Management', label: 'Quality Management' },
  { value: 'Reimbursement Planning', label: 'Reimbursement Planning' },
  { value: 'Respiratory Specialist', label: 'Respiratory Specialist' },
  { value: 'Risk Management', label: 'Risk Management' },
  { value: 'RWE Analysis', label: 'RWE Analysis' },
  { value: 'Safety Monitoring', label: 'Safety Monitoring' },
  { value: 'Statistical Analysis', label: 'Statistical Analysis' },
  { value: 'Surveillance Management', label: 'Surveillance Management' },
  { value: 'Synthesis & Validation', label: 'Synthesis & Validation' },
  { value: 'Voice Biomarkers', label: 'Voice Biomarkers' },
];

export function AgentCreator({ isOpen, onClose, onSave, editingAgent }: AgentCreatorProps) {
  const { createCustomAgent } = useChatStore();
  const { updateAgent, createUserCopy, deleteAgent } = useAgentsStore();
  const { isSuperAdmin, isAdmin, loading: roleLoading } = useUserRole();
  const [agentService] = useState(() => new AgentService());
  const [iconService] = useState(() => new IconService());
  
  // Debug role state
  useEffect(() => {
    if (editingAgent && isOpen) {
      console.log('[Agent Creator] Role check:', {
        isSuperAdmin: isSuperAdmin(),
        isAdmin: isAdmin(),
        roleLoading,
        isUserCopy: (editingAgent as unknown).is_user_copy,
        isCustom: editingAgent.is_custom,
        shouldShowDelete: isSuperAdmin() || isAdmin() || (editingAgent as unknown).is_user_copy || editingAgent.is_custom,
      });
    }
  }, [editingAgent, isOpen, isSuperAdmin, isAdmin, roleLoading]);
  const [agentTemplates, setAgentTemplates] = useState<AgentWithCategories[]>([]);
  const [availableAvatars, setAvailableAvatars] = useState<string[]>([]);
  const [availableIcons, setAvailableIcons] = useState<Icon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIconModal, setShowIconModal] = useState(false);
  const [showPromptIconModal, setShowPromptIconModal] = useState(false);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);

  // Dynamic model options state
  const [modelOptions, setModelOptions] = useState<ModelOption[]>(defaultModelOptions);
  const [loadingModels, setLoadingModels] = useState(true);
  const [modelFitnessScore, setModelFitnessScore] = useState<FitnessScore | null>(null);

  // Tools state
  const [availableToolsFromDB, setAvailableToolsFromDB] = useState<Tool[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);

  // Knowledge Domains state (loaded from database)
  const [knowledgeDomains, setKnowledgeDomains] = useState<Array<{
    value: string;
    label: string;
    tier: number;
    recommended_embedding?: string;
    recommended_chat?: string;
    color?: string;
  }>>(fallbackKnowledgeDomains);
  const [loadingDomains, setLoadingDomains] = useState(true);
  const [recommendedModels, setRecommendedModels] = useState<{
    embedding: string | null;
    chat: string | null;
  }>({ embedding: null, chat: null });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    model: 'gpt-4',
    avatar: '🤖',
    capabilities: [] as string[],
    ragEnabled: true,
    temperature: 0.7,
    maxTokens: 2000,
    knowledgeUrls: [] as string[],
    knowledgeFiles: [] as File[],
    tools: [] as string[],
    knowledgeDomains: [] as string[],
    businessFunction: '',
    role: '',
    department: '',
    promptStarters: [] as PromptStarter[],

    // Agent Classification Fields
    agent_level_id: '5a3647eb-a2bd-43f2-9c8b-6413d39ed0fb' as string, // Default to Specialist level
    status: 'active' as 'active' | 'inactive' | 'testing' | 'development' | 'deprecated',
    priority: 1,

    // Medical Compliance Fields
    medicalSpecialty: '',
    clinicalValidationStatus: 'pending' as 'pending' | 'validated' | 'expired' | 'under_review',
    hipaaCompliant: false,
    pharmaEnabled: false,
    verifyEnabled: false,
    fdaSamdClass: '',
    accuracyThreshold: 0.95,
    citationRequired: true,
    selectedMedicalCapabilities: [] as string[],
    competencySelection: { /* TODO: implement */ } as Record<string, string[]>,

    // Enhanced Agent Template Fields
    architecturePattern: 'REACTIVE' as 'REACTIVE' | 'HYBRID' | 'DELIBERATIVE' | 'MULTI_AGENT',
    reasoningMethod: 'DIRECT' as 'DIRECT' | 'COT' | 'REACT' | 'HYBRID' | 'MULTI_PATH',
    communicationTone: '',
    communicationStyle: '',
    complexityLevel: '',
    primaryMission: '',
    valueProposition: '',
    metadata: {} as any,
  });

  const [newCapability, setNewCapability] = useState('');
  const [newKnowledgeUrl, setNewKnowledgeUrl] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isProcessingKnowledge, setIsProcessingKnowledge] = useState(false);
  const [knowledgeProcessingStatus, setKnowledgeProcessingStatus] = useState<string | null>(null);

  // State for hybrid prompt generation
  const [isGeneratingCompletePrompt, setIsGeneratingCompletePrompt] = useState(false);
  const [promptGenerationMode, setPromptGenerationMode] = useState<'template' | 'ai'>('template');
  const [promptViewMode, setPromptViewMode] = useState<'edit' | 'preview'>('preview');

  // Persona-Based Agent Designer State
  const [showPersonaWizard, setShowPersonaWizard] = useState(false);
  const [personaWizardStep, setPersonaWizardStep] = useState<'organization' | 'intent' | 'suggestions' | 'review'>('organization');
  const [personaIntent, setPersonaIntent] = useState('');
  const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);
  const [personaSuggestions, setPersonaSuggestions] = useState<any>(null);

  // Medical Capability State
  const [medicalCapabilities, setMedicalCapabilities] = useState<MedicalCapability[]>([]);
  const [competencies, setCompetencies] = useState<Record<string, MedicalCompetency[]>>({ /* TODO: implement */ });
  const [businessFunctions, setBusinessFunctions] = useState<HealthcareBusinessFunction[]>([]);
  const [healthcareRoles, setHealthcareRoles] = useState<HealthcareRole[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentsByFunction, setDepartmentsByFunction] = useState<Record<string, any[]>>({});
  const [loadingMedicalData, setLoadingMedicalData] = useState(true);

  // Filtered options for conditional dropdowns
  const [availableDepartments, setAvailableDepartments] = useState<any[]>([]);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);

  // Dynamic Prompt Generation State
  const [generatedPrompt, setGeneratedPrompt] = useState<SystemPromptGenerationResponse | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  // Tab state for multi-step form
  const [activeTab, setActiveTab] = useState<'basic' | 'organization' | 'capabilities' | 'prompts' | 'knowledge' | 'tools' | 'models' | 'reasoning' | 'safety' | 'generate'>('basic');

  // Fetch knowledge domains from database
  useEffect(() => {
    const fetchKnowledgeDomains = async () => {
      try {
        setLoadingDomains(true);
        const { data, error } = await supabase
          .from('knowledge_domains')
          .select('slug, name, tier, recommended_models, color')
          .eq('is_active', true)
          .order('priority');

        if (error) throw error;

        if (data && data.length > 0) {
          const domains = data.map((d) => ({
            value: d.slug,
            label: d.name,
            tier: d.tier,
            recommended_embedding: d.recommended_models?.embedding?.primary,
            recommended_chat: d.recommended_models?.chat?.primary,
            color: d.color,
          }));
          setKnowledgeDomains(domains);
          console.log(`✅ Loaded ${domains.length} knowledge domains from database`);
        } else {
          setKnowledgeDomains(fallbackKnowledgeDomains);
          console.log('ℹ️ Using fallback knowledge domains');
        }
      } catch (error) {
        console.error('Failed to load knowledge domains:', error);
        setKnowledgeDomains(fallbackKnowledgeDomains);
      } finally {
        setLoadingDomains(false);
      }
    };

    fetchKnowledgeDomains();
  }, []);

  // Fetch available LLM models dynamically
  useEffect(() => {
    const fetchAvailableModels = async () => {
      try {
        setLoadingModels(true);
        const response = await fetch('/api/llm/available-models');
        const data = await response.json();

        if (data.models && data.models.length > 0) {
          setModelOptions(data.models);
          console.log(`✅ Loaded ${data.models.length} LLM models from ${data.source}`);
        } else {
          // Fallback to default models
          setModelOptions(defaultModelOptions);
          console.log('ℹ️ Using default model options');
        }
      } catch (error) {
        console.error('❌ Error fetching available models:', error);
        // Fallback to default models on error
        setModelOptions(defaultModelOptions);
      } finally {
        setLoadingModels(false);
      }
    };

    fetchAvailableModels();
  }, []);

  // Load available tools from database
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

  // Load editing agent data
  useEffect(() => {
    if (editingAgent) {
      let capabilities: string[] = [];
      try {
        capabilities = typeof editingAgent.capabilities === 'string'
          ? JSON.parse(editingAgent.capabilities)
          : editingAgent.capabilities || [];
      } catch (e) {
        capabilities = [];
      }

      let knowledgeDomains: string[] = [];
      if (editingAgent.knowledge_domains) {
        knowledgeDomains = Array.isArray(editingAgent.knowledge_domains)
          ? editingAgent.knowledge_domains.filter((d): d is string => typeof d === 'string')
          : [];
      }

      // Create default prompt starters with icons from database
      const createDefaultPromptStarters = (icons: Icon[]): PromptStarter[] => {
        const iconMap = icons.reduce((acc, icon) => {
          acc[icon.name] = icon;
          return acc;
        }, { /* TODO: implement */ } as Record<string, Icon>);

        return [
          {
            id: '1',
            title: '510(k) vs PMA requirements',
            description: 'Compare pathway requirements and timelines',
            prompt: '510(k) vs PMA requirements',
            icon: iconMap.medical_document?.name || 'medical_document',
            iconUrl: iconMap.medical_document?.file_url || '📋'
          },
          {
            id: '2',
            title: 'Regulatory strategy guidance',
            description: 'Get strategic advice for your submission',
            prompt: 'Regulatory strategy guidance',
            icon: iconMap.healthcare_analysis?.name || 'healthcare_analysis',
            iconUrl: iconMap.healthcare_analysis?.file_url || '🔍'
          },
          {
            id: '3',
            title: 'De Novo vs 510(k) pathways',
            description: 'Understand novel device classification options',
            prompt: 'De Novo vs 510(k) pathways',
            icon: iconMap.stethoscope?.name || 'stethoscope',
            iconUrl: iconMap.stethoscope?.file_url || '🩺'
          },
          {
            id: '4',
            title: 'Submission checklist review',
            description: 'Ensure your submission is complete',
            prompt: 'Submission checklist review',
            icon: iconMap.checklist?.name || 'checklist',
            iconUrl: iconMap.checklist?.file_url || '✅'
          }
        ];
      };

      const defaultPromptStarters = createDefaultPromptStarters(availableIcons);

      // Convert names to UUIDs if necessary
      let businessFunctionValue = (editingAgent as any).function_id || '';
      let departmentValue = (editingAgent as any).department_id || '';
      let roleValue = (editingAgent as any).role_id || '';

      // If no UUID but has name, try to find UUID from loaded data
      if (!businessFunctionValue && editingAgent.business_function && businessFunctions.length > 0) {
        const matchedFunction = businessFunctions.find((f: any) =>
          (f.department_name || f.name) === editingAgent.business_function
        );
        if (matchedFunction) {
          businessFunctionValue = matchedFunction.id;
        }
      }

      if (!departmentValue && editingAgent.department && departments.length > 0) {
        const matchedDept = departments.find((d: any) =>
          (d.department_name || d.name) === editingAgent.department
        );
        if (matchedDept) {
          departmentValue = matchedDept.id;
        }
      }

      if (!roleValue && editingAgent.role && healthcareRoles.length > 0) {
        const matchedRole = healthcareRoles.find((r: any) =>
          (r.role_name || r.name) === editingAgent.role
        );
        if (matchedRole) {
          roleValue = matchedRole.id;
        }
      }

      console.log('[Agent Creator] Loading editing agent with:', {
        originalFunction: editingAgent.business_function,
        resolvedFunctionId: businessFunctionValue,
        originalDepartment: editingAgent.department,
        resolvedDepartmentId: departmentValue,
        originalRole: editingAgent.role,
        resolvedRoleId: roleValue,
        businessFunctionsLoaded: businessFunctions.length,
        departmentsLoaded: departments.length,
        rolesLoaded: healthcareRoles.length
      });

      setFormData(prev => ({
        ...prev,
        name: editingAgent.display_name || editingAgent.name || 'Unnamed Agent',
        description: editingAgent.description || 'Agent description not provided',
        systemPrompt: editingAgent.system_prompt || 'You are a helpful AI assistant.',
        model: editingAgent.model || 'gpt-4',
        avatar: editingAgent.avatar || '🤖',
        capabilities: capabilities,
        ragEnabled: editingAgent.rag_enabled ?? true,
        temperature: editingAgent.temperature || 0.7,
        maxTokens: editingAgent.max_tokens || 2000,
        knowledgeUrls: [],
        knowledgeFiles: [] as File[],
        // DON'T reset tools here - they are loaded separately in another useEffect
        // tools: [],
        knowledgeDomains: knowledgeDomains,
        businessFunction: businessFunctionValue,
        role: roleValue,
        department: departmentValue,
        promptStarters: defaultPromptStarters,
        // Agent Level (5-level hierarchy)
        agent_level_id: (editingAgent as any)?.agent_level_id || '5a3647eb-a2bd-43f2-9c8b-6413d39ed0fb', // Default to Specialist
        // Medical Compliance Fields (with safe property access)
        medicalSpecialty: (editingAgent as unknown)?.medical_specialty || '',
        clinicalValidationStatus: ((editingAgent as unknown)?.clinical_validation_status as "pending" | "validated" | "expired" | "under_review") || 'pending',
        hipaaCompliant: (editingAgent as unknown)?.hipaa_compliant || false,
        pharmaEnabled: (editingAgent as unknown)?.pharma_enabled || false,
        verifyEnabled: (editingAgent as unknown)?.verify_enabled || false,
        fdaSamdClass: (editingAgent as unknown)?.fda_samd_class || '',
        accuracyThreshold: (editingAgent as unknown)?.medical_accuracy_score || 0.95,
        citationRequired: true,
        selectedMedicalCapabilities: [] as string[], // TODO: Load from agent capabilities
        competencySelection: { /* TODO: implement */ } as Record<string, string[]>, // TODO: Load from agent competencies
        // Enhanced Agent Template Fields
        architecturePattern: (editingAgent as any)?.architecture_pattern || 'REACTIVE',
        reasoningMethod: (editingAgent as any)?.reasoning_method || 'DIRECT',
        communicationTone: (editingAgent as any)?.communication_tone || '',
        communicationStyle: (editingAgent as any)?.communication_style || '',
        complexityLevel: (editingAgent as any)?.complexity_level || '',
        primaryMission: (editingAgent as any)?.primary_mission || '',
        valueProposition: (editingAgent as any)?.value_proposition || '',
        metadata: (editingAgent as any)?.metadata || {},
      }));
    }
  }, [editingAgent, availableIcons, businessFunctions]);

  // Load agent's tools when editing (fetch from agent_tools table)
  useEffect(() => {
    const loadAgentTools = async () => {
      if (!editingAgent) {
        return;
      }

      try {
        // Fetch tool assignments from agent_tools table
        const { data: agentToolsData, error: agentToolsError } = await supabase
          .from('agent_tools')
          .select('tool_id')
          .eq('agent_id', editingAgent.id);

        if (agentToolsError) {
          console.error('❌ Error loading agent tools:', agentToolsError);
          return;
        }

        // Get the tool IDs
        const toolIds = (agentToolsData || []).map(at => at.tool_id);

        if (toolIds.length === 0) {
          console.log(`🔧 No tools assigned to agent ${editingAgent.display_name}`);
          return;
        }

        // Fetch tool details from dh_tool table
        const { data: toolsData, error: toolsError } = await supabase
          .from('dh_tool')
          .select('id, name')
          .in('id', toolIds);

        if (toolsError) {
          console.error('❌ Error fetching tool details:', toolsError);
          return;
        }

        // Convert to tool names array for formData
        const toolNames = (toolsData || []).map(t => t.name);
        console.log(`🔧 Loaded ${toolNames.length} tools for ${editingAgent.display_name}:`, toolNames);

        setFormData(prev => ({
          ...prev,
          tools: toolNames
        }));
      } catch (error) {
        console.error('❌ Exception loading agent tools:', error);
      }
    };

    loadAgentTools();
  }, [editingAgent]);

  // Load agent templates, avatars, and icons from database
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load agents, prompt icons, and avatar icons in parallel
        const [agents, icons, avatars] = await Promise.all([
          agentService.getActiveAgents(),
          iconService.getPromptIcons(),
          iconService.getAvatarIcons()
        ]);

        // Use first few agents as templates
        setAgentTemplates(agents.slice(0, 6));

        // Set available avatars from database instead of existing agents
        setAvailableAvatars(avatars.map(icon => icon.file_url));

        // Set available icons for prompt starters
        setAvailableIcons(icons);
      } catch (error) {
        console.error('Failed to load agent data:', error);
        // Fallback to empty arrays if database fails
        setAvailableAvatars([]);
        setAvailableIcons([]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [agentService, iconService, isOpen]);

  // Load medical capabilities and healthcare data
  useEffect(() => {
    const loadMedicalData = async () => {
      if (!isOpen) {
        console.log('[Agent Creator] Modal not open, skipping data load');
        return;
      }

      console.log('[Agent Creator] Starting data load...');
      setLoadingMedicalData(true);
      try {
        console.log('[Agent Creator] Loading capabilities from Supabase...');
        // Load medical capabilities from Supabase (without competencies join - relationship not configured)
        const { data: capabilities, error: capError } = await supabase
          .from('capabilities')
          .select('*')
          .not('medical_domain', 'is', null)
          .eq('status', 'active');

        if (capError) {
          // Log as warning since this is expected - capabilities table might not exist
          console.warn('[Agent Creator] Capabilities table not available:', capError.message || String(capError));
          // Don't throw - continue loading organizational data even if capabilities fail
          console.log('[Agent Creator] Continuing without capabilities - using empty array');
        }

        console.log('[Agent Creator] Capabilities loaded:', capabilities?.length || 0);

        // Load organizational structure from API
        console.log('[Agent Creator] Fetching organizational structure...');
        const response = await fetch('/api/organizational-structure');
        if (!response.ok) throw new Error('Failed to load organizational structure');

        const orgData = await response.json();
        if (!orgData.success) throw new Error(orgData.error || 'Failed to load organizational structure');

        console.log('[Agent Creator] API response:', orgData);

        const functions = orgData.data.functions;
        const roles = orgData.data.roles;
        const depts = orgData.data.departments;
        const deptsByFunction = orgData.data.departmentsByFunction;

        console.log('[Agent Creator] About to set state with functions:', functions?.length);

        // Set state with fallback to static data
        setMedicalCapabilities(capabilities || []);

        // If API returned no functions, use static data as fallback
        if (!functions || functions.length === 0) {
          console.warn('[Agent Creator] No functions from API, using static data');
          const staticFunctionsArray = staticBusinessFunctions.map((bf, index) => ({
            id: bf.value,
            name: bf.label,
            department_name: bf.label,
            created_at: new Date().toISOString()
          }));
          setBusinessFunctions(staticFunctionsArray);
        } else {
          console.log('[Agent Creator] Setting business functions from API:', functions.length);
          setBusinessFunctions(functions);
        }

        console.log('[Agent Creator] Setting roles, departments, deptsByFunction...');
        setHealthcareRoles(roles || []);
        setDepartments(depts || []);
        setDepartmentsByFunction(deptsByFunction || {});

        console.log('[Agent Creator] State set complete. Loaded organizational data:', {
          functions: (functions?.length || staticBusinessFunctions.length),
          departments: depts?.length || 0,
          roles: roles?.length || 0,
          departmentsByFunction: Object.keys(deptsByFunction || {}).length
        });

        // Organize competencies by capability
        const competencyMap: Record<string, MedicalCompetency[]> = { /* TODO: implement */ };
        capabilities?.forEach(cap => {
          if (cap.competencies) {
            competencyMap[cap.id] = cap.competencies;
          }
        });
        setCompetencies(competencyMap);

      } catch (error) {
        console.error('Failed to load medical data:', error);
      } finally {
        setLoadingMedicalData(false);
      }
    };

    loadMedicalData();
  }, [isOpen]);

  // Filter departments based on selected business function
  useEffect(() => {
    console.log('[Agent Creator] Department filter effect triggered:', {
      businessFunction: formData.businessFunction,
      hasFunctions: businessFunctions.length > 0,
      hasDeptsByFunction: Object.keys(departmentsByFunction).length > 0,
      deptsByFunctionKeys: Object.keys(departmentsByFunction),
      departmentsByFunctionSample: Object.keys(departmentsByFunction).slice(0, 3)
    });

    if (!formData.businessFunction) {
      console.log('[Agent Creator] No business function selected, clearing departments');
      setAvailableDepartments([]);
      return;
    }

    // If database has data, use it
    if (businessFunctions.length > 0 && Object.keys(departmentsByFunction).length > 0) {
      // formData.businessFunction now stores the function ID (UUID)
      const deptsForFunction = departmentsByFunction[formData.businessFunction] || [];

      console.log('[Agent Creator] Looking up departments for function ID:', formData.businessFunction);
      console.log('[Agent Creator] Found departments:', deptsForFunction.length, deptsForFunction.map((d: any) => d.name));
      setAvailableDepartments(deptsForFunction);

      // If current department is not in available departments, reset it
      const deptIds = deptsForFunction.map((d: any) => d.id);
      if (formData.department && deptsForFunction.length > 0 && !deptIds.includes(formData.department)) {
        setFormData(prev => ({ ...prev, department: '', role: '' }));
      }
      return;
    }

    // Fallback to static data
    const selectedStaticFunction = staticBusinessFunctions.find(bf =>
      bf.value === formData.businessFunction || bf.label === formData.businessFunction
    );

    if (selectedStaticFunction) {
      const depts = staticDepartmentsByFunction[selectedStaticFunction.value] || [];
      setAvailableDepartments(depts);

      // If current department is not in available departments, reset it
      if (formData.department && depts.length > 0 && !depts.includes(formData.department)) {
        setFormData(prev => ({ ...prev, department: '', role: '' }));
      }
    } else {
      setAvailableDepartments([]);
    }
  }, [formData.businessFunction, businessFunctions, departmentsByFunction]);

  // Filter roles based on selected business function and department
  useEffect(() => {
    if (!formData.businessFunction) {
      setAvailableRoles([]);
      return;
    }

    // If database has data, use it
    if (businessFunctions.length > 0 && healthcareRoles.length > 0) {
      // formData.businessFunction and formData.department now store IDs (UUIDs)
      console.log('[Agent Creator] Role filtering - Input:', {
        businessFunction: formData.businessFunction,
        department: formData.department,
        totalRoles: healthcareRoles.length
      });

      let filteredRoles = healthcareRoles.filter(role =>
        role.business_function_id === formData.businessFunction
      );

      console.log('[Agent Creator] After function filter:', filteredRoles.length, 'roles');
      if (filteredRoles.length > 0) {
        console.log('[Agent Creator] Sample roles after function filter:', filteredRoles.slice(0, 3).map((r: any) => ({
          name: r.name,
          business_function_id: r.business_function_id,
          department_id: r.department_id
        })));
      }

      // Further filter by department if selected
      if (formData.department) {
        filteredRoles = filteredRoles.filter(role =>
          role.department_id === formData.department
        );
        console.log('[Agent Creator] After department filter:', filteredRoles.length, 'roles');
      }

      setAvailableRoles(filteredRoles);

      console.log('[Agent Creator] Final filtered roles:', filteredRoles.length, 'for function:', formData.businessFunction, 'dept:', formData.department);

      // If current role is not in available roles, reset it
      const roleIds = filteredRoles.map((r: any) => r.id);
      if (formData.role && filteredRoles.length > 0 && !roleIds.includes(formData.role)) {
        setFormData(prev => ({ ...prev, role: '' }));
      }
      return;
    }

    // Fallback to static data - roles are conditional on department
    // Don't show any roles until department is selected
    setAvailableRoles([]);
  }, [formData.businessFunction, formData.department, businessFunctions, healthcareRoles]);

  // Debug logging for businessFunctions
  useEffect(() => {
    if (activeTab === 'organization') {
      console.log('[Agent Creator] Organization tab active - businessFunctions:', {
        length: businessFunctions.length,
        data: businessFunctions,
        sample: businessFunctions.slice(0, 3)
      });
    }
  }, [activeTab, businessFunctions]);

  // Debug logging for tools changes
  useEffect(() => {
    console.log('🔧 formData.tools changed:', formData.tools);
  }, [formData.tools]);

  // Update recommended models when knowledge domains change
  useEffect(() => {
    if (formData.knowledgeDomains.length > 0) {
      // Get recommendations from selected domains (prioritize Tier 1)
      const selectedDomains = knowledgeDomains.filter((d) =>
        formData.knowledgeDomains.includes(d.value)
      );

      // Sort by tier (Tier 1 first)
      const sortedDomains = selectedDomains.sort((a, b) => a.tier - b.tier);

      if (sortedDomains.length > 0) {
        const primaryDomain = sortedDomains[0];
        setRecommendedModels({
          embedding: primaryDomain.recommended_embedding || null,
          chat: primaryDomain.recommended_chat || null,
        });
      } else {
        setRecommendedModels({ embedding: null, chat: null });
      }
    } else {
      setRecommendedModels({ embedding: null, chat: null });
    }
  }, [formData.knowledgeDomains, knowledgeDomains]);

  const handleCapabilityAdd = (capability: string) => {
    if (capability && !formData.capabilities.includes(capability)) {
      setFormData(prev => ({
        ...prev,
        capabilities: [...prev.capabilities, capability]
      }));
    }
    setNewCapability('');
  };

  const handleCapabilityRemove = (capability: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.filter((c: any) => c !== capability)
    }));
  };

  const handleKnowledgeUrlAdd = (url: string) => {
    if (url && !formData.knowledgeUrls.includes(url)) {
      setFormData(prev => ({
        ...prev,
        knowledgeUrls: [...prev.knowledgeUrls, url]
      }));
    }
    setNewKnowledgeUrl('');
  };

  const handleKnowledgeUrlRemove = (url: string) => {
    setFormData(prev => ({
      ...prev,
      knowledgeUrls: prev.knowledgeUrls.filter((u: any) => u !== url)
    }));
  };

  const handleToolToggle = (tool: string) => {
    console.log('🔧 Tool toggle clicked:', tool);
    console.log('🔧 Current tools before toggle:', formData.tools);

    setFormData(prev => {
      const newTools = prev.tools.includes(tool)
        ? prev.tools.filter((t: any) => t !== tool)
        : [...prev.tools, tool];

      console.log('🔧 New tools after toggle:', newTools);

      return {
        ...prev,
        tools: newTools
      };
    });
  };

  const handleKnowledgeDomainToggle = (domain: string) => {
    setFormData(prev => ({
      ...prev,
      knowledgeDomains: prev.knowledgeDomains.includes(domain)
        ? prev.knowledgeDomains.filter((d: any) => d !== domain)
        : [...prev.knowledgeDomains, domain]
    }));
  };

  // Medical capability handlers
  const handleMedicalCapabilityToggle = (capabilityId: string) => {
    setFormData(prev => {
      const currentCapabilities = prev.selectedMedicalCapabilities || [];
      return {
        ...prev,
        selectedMedicalCapabilities: currentCapabilities.includes(capabilityId)
          ? currentCapabilities.filter(id => id !== capabilityId)
          : [...currentCapabilities, capabilityId]
      };
    });
  };

  const handleCompetencySelection = (capabilityId: string, competencyId: string) => {
    setFormData(prev => {
      const currentCompetencySelection = prev.competencySelection || { /* TODO: implement */ };
      // eslint-disable-next-line security/detect-object-injection
      const currentSelections = currentCompetencySelection[capabilityId] || [];
      const newSelections = currentSelections.includes(competencyId)
        ? currentSelections.filter(id => id !== competencyId)
        : [...currentSelections, competencyId];

      return {
        ...prev,
        competencySelection: {
          ...currentCompetencySelection,
          [capabilityId]: newSelections
        }
      };
    });
  };

  // Dynamic prompt generation function
  const generateDynamicPrompt = async () => {
    if ((formData.selectedMedicalCapabilities?.length || 0) === 0) {
      alert('Please select at least one medical capability to generate a dynamic prompt');
      return;
    }

    if (!formData.businessFunction || !formData.role) {
      alert('Please select a business function and role for medical context');
      return;
    }

    setIsGeneratingPrompt(true);

    try {
      // Find the selected business function and role
      const selectedBusinessFunction = businessFunctions.find(bf =>
        (bf.department_name || bf.name) === formData.businessFunction
      );
      const selectedRole = healthcareRoles.find(role =>
        (role.role_name || role.name) === formData.role
      );

      if (!selectedBusinessFunction || !selectedRole) {
        throw new Error('Selected business function or role not found');
      }

      const generationRequest: SystemPromptGenerationRequest = {
        agentId: '', // We'll set this when saving
        selectedCapabilities: formData.selectedMedicalCapabilities,
        competencySelection: formData.competencySelection,
        mode: 'standalone' as unknown, // Default mode
        medicalContext: {
          businessFunction: selectedBusinessFunction,
          role: selectedRole,
          medicalSpecialty: formData.medicalSpecialty || 'General Medicine',
          complianceRequirements: selectedBusinessFunction.regulatory_requirements || [],
          accuracyThreshold: formData.accuracyThreshold,
          hipaaRequired: formData.hipaaCompliant,
          fdaRegulated: !!formData.fdaSamdClass && formData.fdaSamdClass !== 'N/A'
        },
        pharmaProtocolRequired: formData.pharmaEnabled,
        verifyProtocolRequired: formData.verifyEnabled,
        includeTools: true,
        includeConstraints: true
      };

      const response = await promptGenerationService.generateSystemPrompt(generationRequest);
      setGeneratedPrompt(response);
      setShowPromptPreview(true);

      // Update the form with the generated prompt
      setFormData(prev => ({
        ...prev,
        systemPrompt: response.content
      }));

    } catch (error) {
      console.error('Failed to generate dynamic prompt:', error);
      alert('Failed to generate dynamic prompt. Please try again.');
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // Prompt starter management functions
  const addPromptStarter = () => {
    const firstIcon = availableIcons[0];
    const newPrompt: PromptStarter = {
      id: Date.now().toString(),
      title: '',
      description: '',
      prompt: '',
      icon: firstIcon?.name || 'document_medical',
      iconUrl: firstIcon?.file_url || '/Assets/Icons/computer, document, paper, medical, certificate, contract, hospital.svg'
    };
    setFormData(prev => ({
      ...prev,
      promptStarters: [...prev.promptStarters, newPrompt]
    }));
  };

  const updatePromptStarter = (id: string, field: keyof PromptStarter, value: string) => {
    setFormData(prev => ({
      ...prev,
      promptStarters: prev.promptStarters.map(prompt =>
        prompt.id === id ? { ...prompt, [field]: value } : prompt
      )
    }));
  };

  const removePromptStarter = (id: string) => {
    setFormData(prev => ({
      ...prev,
      promptStarters: prev.promptStarters.filter(prompt => prompt.id !== id)
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      knowledgeFiles: [...prev.knowledgeFiles, ...files]
    }));
  };

  const handleFileRemove = (fileToRemove: File) => {
    setFormData(prev => ({
      ...prev,
      knowledgeFiles: prev.knowledgeFiles.filter(file => file !== fileToRemove)
    }));
  };

  // Calculate model fitness score
  const calculateModelFitness = (modelId: string) => {
    const selectedModel = modelOptions.find((m: any) => m.id === modelId);
    if (!selectedModel) {
      setModelFitnessScore(null);
      return;
    }

    // Build agent profile from form data with dynamic criteria from Supabase agent registry
    const agentProfile: AgentProfile = {
      role: formData.role || formData.businessFunction,
      businessFunction: formData.businessFunction,
      capabilities: formData.capabilities,
      description: formData.description,
      medicalSpecialty: formData.medicalSpecialty,
      requiresHighAccuracy: formData.accuracyThreshold >= 0.95,
      requiresMedicalKnowledge: !!(formData.medicalSpecialty ||
        formData.businessFunction?.toLowerCase().includes('medical') ||
        formData.businessFunction?.toLowerCase().includes('clinical')),
      requiresCodeGeneration: formData.capabilities.some((c: any) =>
        c.toLowerCase().includes('code') ||
        c.toLowerCase().includes('technical') ||
        c.toLowerCase().includes('development')
      ),
      expectedOutputLength: formData.maxTokens > 4000 ? 'very_long' :
                           formData.maxTokens > 2000 ? 'long' :
                           formData.maxTokens > 1000 ? 'medium' : 'short',
      hipaaCompliant: formData.hipaaCompliant,

      // Dynamic agent configuration from Supabase agent registry
      temperature: formData.temperature,
      max_tokens: formData.maxTokens,
      rag_enabled: formData.ragEnabled,
      context_window: formData.maxTokens, // Use max_tokens as context window requirement
      response_format: 'markdown', // Default response format
      tools: formData.tools,
      knowledge_domains: formData.knowledgeDomains,
    };

    // Build model capabilities object
    const modelCapabilities: ModelCapabilities = {
      id: selectedModel.id,
      name: selectedModel.name,
      provider: selectedModel.provider || 'unknown',
      maxTokens: selectedModel.maxTokens || 4096,
      capabilities: selectedModel.capabilities as any,
    };

    // Calculate fitness
    const fitness = ModelFitnessScorer.calculateFitness(modelCapabilities, agentProfile);
    setModelFitnessScore(fitness);
  };

  const processKnowledgeSources = async () => {
    if (formData.knowledgeUrls.length === 0 && formData.knowledgeFiles.length === 0) {
      setKnowledgeProcessingStatus('No knowledge sources to process');
      return;
    }

    setIsProcessingKnowledge(true);
    setKnowledgeProcessingStatus('Processing knowledge sources...');

    try {
      let urlResults: unknown = { totalProcessed: 0, totalFailed: 0, results: [] };
      let fileResults: unknown = { totalProcessed: 0, totalFailed: 0, results: [] };

      // Process URLs if any
      if (formData.knowledgeUrls.length > 0) {
        const urlResponse = await fetch('/api/knowledge/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            knowledgeUrls: formData.knowledgeUrls,
            domain: 'digital-health',
            agentId: editingAgent?.id,
            isGlobal: false,
          }),
        });

        if (urlResponse.ok) {
          urlResults = await urlResponse.json();
        }
      }

      // Process files if any
      if (formData.knowledgeFiles.length > 0) {
        const fileFormData = new FormData();
        formData.knowledgeFiles.forEach(file => {
          fileFormData.append('files', file);
        });
        fileFormData.append('domain', 'digital-health');
        fileFormData.append('isGlobal', 'false');
        if (editingAgent?.id) {
          fileFormData.append('agentId', editingAgent.id);
        }
        const fileResponse = await fetch('/api/knowledge/upload', {
          method: 'POST',
          body: fileFormData,
        });
        if (fileResponse.ok) {
          fileResults = await fileResponse.json();
        } else {
          const errorText = await fileResponse.text();
          console.error('File upload error:', errorText);
        }
      }

      const totalProcessed = urlResults.totalProcessed + fileResults.totalProcessed;
      const totalFailed = urlResults.totalFailed + fileResults.totalFailed;

      setKnowledgeProcessingStatus(
        `Successfully processed ${totalProcessed} knowledge sources (${urlResults.totalProcessed} URLs, ${fileResults.totalProcessed} files). ${
          totalFailed > 0 ? `${totalFailed} failed.` : ''
        }`
      );

      // Clear processed items
      if (totalProcessed > 0) {
        setFormData(prev => ({
          ...prev,
          knowledgeUrls: [],
          knowledgeFiles: []
        }));
      }
    } catch (error) {
      console.error('Knowledge processing error:', error);
      setKnowledgeProcessingStatus('Failed to process knowledge sources');
    } finally {
      setIsProcessingKnowledge(false);
    }
  };

  const applyTemplate = (template: AgentWithCategories) => {
    // Parse capabilities from JSON string
    let capabilities: string[] = [];
    try {
      capabilities = typeof template.capabilities === 'string'
        ? JSON.parse(template.capabilities)
        : template.capabilities || [];
    } catch (e) {
      capabilities = [];
    }

    // Get knowledge domains from template if available
    let knowledgeDomains: string[] = [];
    if (template.knowledge_domains) {
      knowledgeDomains = Array.isArray(template.knowledge_domains)
        ? template.knowledge_domains.filter((d): d is string => typeof d === 'string')
        : [];
    }

    setFormData(prev => ({
      ...prev,
      name: template.display_name || template.name,
      description: template.description || '',
      systemPrompt: template.system_prompt || '',
      capabilities: capabilities,
      avatar: template.avatar || '🤖',
      temperature: template.temperature || 0.7,
      maxTokens: template.max_tokens || 2000,
      knowledgeDomains: knowledgeDomains,
    }));
    setSelectedTemplate(template.name);
  };

  const handleDelete = async () => {
    if (!editingAgent) return;

    // Super admin can delete any agent, otherwise only user's own agents
    const isUserAgent = (editingAgent as unknown).is_user_copy || editingAgent.is_custom;
    const canDelete = isSuperAdmin() || isAdmin() || isUserAgent;

    if (!canDelete) {
      alert('You can only delete your own agents.');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${editingAgent.display_name}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      // All agents are now stored in the database via UserAgentsService
      // User copies are stored in user_agents table with is_user_copy=true
      // We need to check if this is a user copy and remove it from user_agents table
      const isUserCopy = (editingAgent as unknown).is_user_copy || editingAgent.is_custom;

      if (isUserCopy && user?.id) {
        // Remove from user_agents table via API
        try {
          const response = await fetch('/api/user-agents', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              agentId: editingAgent.id,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to remove agent: ${response.statusText}`);
          }
        } catch (removeError) {
          console.error('❌ Failed to remove user agent:', removeError);
          // Continue to delete from agents table as fallback
        }
      }

      // Delete from agents table (for custom agents created by user)
      await deleteAgent(editingAgent.id);

      // Close modal and refresh
      onClose();
      onSave(); // This triggers a refresh

    } catch (error) {
      console.error('❌ Failed to delete agent:', error);
      
      // Show more detailed error message
      let errorMessage = 'Failed to delete agent. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
        // Check for specific error codes
        if (error.message.includes('23503')) {
          errorMessage = 'Cannot delete agent: It is being used in conversations or by other users. Please remove all references first.';
        } else if (error.message.includes('not found')) {
          errorMessage = 'Agent not found. It may have already been deleted.';
        }
      }
      
      alert(errorMessage);
    }
  };

  /**
   * Sync agent tools - delete removed tools and add new tools
   */
  const syncAgentTools = async (agentId: string, selectedToolIds: string[]) => {
    try {
      // First, get current tools for this agent
      const { data: currentTools, error: fetchError } = await supabase
        .from('agent_tools')
        .select('tool_id')
        .eq('agent_id', agentId);

      if (fetchError) {
        console.error('❌ Error fetching current agent tools:', fetchError);
        throw fetchError;
      }

      const currentToolIds = (currentTools || []).map(at => at.tool_id);

      // Determine tools to add and remove
      const toolsToAdd = selectedToolIds.filter(id => !currentToolIds.includes(id));
      const toolsToRemove = currentToolIds.filter(id => !selectedToolIds.includes(id));

      console.log('[Agent Tools] Syncing tools for agent:', agentId);
      console.log('  Current tools:', currentToolIds);
      console.log('  Selected tools:', selectedToolIds);
      console.log('  Tools to add:', toolsToAdd);
      console.log('  Tools to remove:', toolsToRemove);

      // Remove tools
      if (toolsToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('agent_tools')
          .delete()
          .eq('agent_id', agentId)
          .in('tool_id', toolsToRemove);

        if (deleteError) {
          console.error('❌ Error removing agent tools:', deleteError);
          throw deleteError;
        }
        console.log(`✅ Removed ${toolsToRemove.length} tools from agent`);
      }

      // Add new tools
      if (toolsToAdd.length > 0) {
        const toolsToInsert = toolsToAdd.map(toolId => ({
          agent_id: agentId,
          tool_id: toolId
        }));

        const { error: insertError } = await supabase
          .from('agent_tools')
          .insert(toolsToInsert);

        if (insertError) {
          console.error('❌ Error adding agent tools:', insertError);
          throw insertError;
        }
        console.log(`✅ Added ${toolsToAdd.length} tools to agent`);
      }

      if (toolsToAdd.length === 0 && toolsToRemove.length === 0) {
        console.log('ℹ️ No tools changes needed');
      }
    } catch (error) {
      console.error('❌ Error syncing agent tools:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description || !formData.systemPrompt) {
      alert('Please fill in all required fields');
      return;
    }

    // Find the selected business function and role for foreign key references
    const selectedBusinessFunction = businessFunctions.find(bf =>
      (bf.department_name || bf.name) === formData.businessFunction
    );
    const selectedRole = healthcareRoles.find(role =>
      (role.role_name || role.name) === formData.role
    );

    const agentData = {
      name: formData.name,
      display_name: formData.name, // agents-store expects display_name
      description: formData.description,
      system_prompt: formData.systemPrompt, // Convert to snake_case
      model: formData.model,
      avatar: formData.avatar,
      color: 'text-market-purple',
      capabilities: formData.capabilities,
      rag_enabled: formData.ragEnabled, // Convert to snake_case
      temperature: formData.temperature,
      max_tokens: formData.maxTokens, // Convert to snake_case
      knowledge_domains: formData.knowledgeDomains, // Convert to snake_case
      // Organization relationships (UUIDs to org tables)
      function_id: formData.businessFunction || null,
      department_id: formData.department || null,
      role_id: formData.role || null,
      // Required fields for agents-store
      status: 'active' as const,
      tier: 1,
      priority: 1,
      implementation_phase: 1,
      is_custom: true,
      // Enhanced Agent Template Fields
      architecture_pattern: formData.architecturePattern,
      reasoning_method: formData.reasoningMethod,
      communication_tone: formData.communicationTone || null,
      communication_style: formData.communicationStyle || null,
      complexity_level: formData.complexityLevel || null,
      primary_mission: formData.primaryMission || null,
      value_proposition: formData.valueProposition || null,
      metadata: formData.metadata || {},
    };

    try {
      if (editingAgent) {
        // Check if this is a user copy from localStorage that doesn't exist in DB yet
        const isUserCopyFromLocalStorage = (editingAgent as unknown).is_user_copy && editingAgent.is_custom;

        if (isUserCopyFromLocalStorage) {
          // Create user copy in database using agents store
          const userCopyData = {
            id: crypto.randomUUID(), // Generate new ID
            name: formData.name,
            display_name: formData.name,
            description: formData.description,
            system_prompt: formData.systemPrompt,
            model: formData.model,
            avatar: formData.avatar,
            color: 'text-market-purple',
            capabilities: formData.capabilities,
            rag_enabled: formData.ragEnabled,
            temperature: formData.temperature,
            max_tokens: formData.maxTokens,
            knowledge_domains: formData.knowledgeDomains,
            is_custom: true,
            status: 'active' as const,
            agent_level_id: formData.agent_level_id,
            priority: 1,
            implementation_phase: 1,
          };
          await createUserCopy(userCopyData as unknown);
        } else {
          // Look up names from UUIDs for display
          const selectedFunction = businessFunctions.find((f: any) => f.id === formData.businessFunction);
          const selectedDept = availableDepartments.find((d: any) => d.id === formData.department);
          const selectedRole = availableRoles.find((r: any) => r.id === formData.role);

          console.log('[Agent Creator] Save - Looking up names from UUIDs:');
          console.log('  Business Function UUID:', formData.businessFunction);
          console.log('  Found function:', selectedFunction);
          console.log('  Department UUID:', formData.department);
          console.log('  Found dept:', selectedDept);
          console.log('  Role UUID:', formData.role);
          console.log('  Found role:', selectedRole);

          // Update existing agent - Send both IDs and names to database
          const updates = {
            display_name: formData.name,
            description: formData.description,
            system_prompt: formData.systemPrompt,
            model: formData.model,
            avatar: formData.avatar,
            tier: formData.tier,
            status: formData.status,
            priority: formData.priority,
            // Don't update color - keep existing value
            capabilities: formData.capabilities,
            rag_enabled: formData.ragEnabled,
            temperature: formData.temperature,
            max_tokens: formData.maxTokens,
            knowledge_domains: formData.knowledgeDomains,
            // Store organization structure in database columns
            function_id: formData.businessFunction || null,
            function_name: selectedFunction?.name || null,
            department_id: formData.department || null,
            department_name: selectedDept?.name || null,
            role_id: formData.role || null,
            role_name: selectedRole?.name || null,
          };

          console.log('[Agent Creator] Updating agent:', editingAgent.id);

          // Call API to update agent
          const response = await fetch(`/api/agents/${editingAgent.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update agent');
          }

          const result = await response.json();
          console.log('✅ Agent updated successfully:', result.agent);

          // Update the agent in the agents store
          updateAgent(editingAgent.id, result.agent);

          // Update agent tools
          console.log('🔧 Syncing tools for agent:', editingAgent.id);
          console.log('🔧 Selected tool names in formData:', formData.tools);
          try {
            // Convert tool names to tool IDs from availableToolsFromDB
            const selectedToolIds = formData.tools
              .map(toolName => {
                const tool = availableToolsFromDB.find(t => t.name === toolName);
                if (!tool) {
                  console.warn(`⚠️ Tool not found in database: ${toolName}`);
                  return null;
                }
                return tool.id;
              })
              .filter((id): id is string => id !== null);
            
            console.log('🔧 Mapped to tool IDs:', selectedToolIds);
            await syncAgentTools(editingAgent.id, selectedToolIds);
            console.log('✅ Agent tools synced successfully');
          } catch (toolError) {
            console.warn('⚠️ Failed to sync agent tools (non-critical):', toolError);
            // Don't throw - agent was saved successfully, tool sync is optional
          }
        }
      } else {
        // Create new agent - convert to chat store format
        const chatStoreAgentData = {
          name: formData.name,
          description: formData.description,
          systemPrompt: formData.systemPrompt, // camelCase for chat store
          model: formData.model,
          avatar: formData.avatar,
          color: 'text-market-purple',
          capabilities: formData.capabilities,
          ragEnabled: formData.ragEnabled, // camelCase for chat store
          temperature: formData.temperature,
          maxTokens: formData.maxTokens, // camelCase for chat store
          knowledgeDomains: formData.knowledgeDomains, // camelCase for chat store
          businessFunction: selectedBusinessFunction?.name || selectedBusinessFunction?.department_name || '',
          role: selectedRole?.name || selectedRole?.role_name || '',
        };
        createCustomAgent(chatStoreAgentData);

        // Note: Cannot sync tools for new agents created through chat store
        // as they don't have a database ID. Tools should be synced when the
        // agent is properly created in the database through the agents store.
      }

      onSave();
    } catch (error) {
      console.error('=== AGENT SAVE ERROR ===');
      console.error('Error saving agent:', error);
      console.error('Editing agent object:', editingAgent);
      console.error('Editing agent ID:', editingAgent?.id);

      // Get more detailed error information
      let errorMessage = 'Failed to save agent. Please try again.';
      if (error instanceof Error) {
        errorMessage = `Failed to save agent: ${error.message}`;
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }

      alert(errorMessage);
    }
  };

  /**
   * Generate comprehensive system prompt from all agent attributes
   */
  const generateCompleteSystemPrompt = () => {
    try {
      console.log('[System Prompt Generation] Using Gold Standard Template v5.0 from ai_agent_prompt_enhanced.md');

      // Build comprehensive system prompt following industry gold standard
      const timestamp = new Date().toISOString();
      const agentId = `AGT-${getTierFromAgentLevel(formData.agent_level_id)}-${Date.now().toString(36).toUpperCase()}`;

      let prompt = '';

      // ===== HEADER - Following Gold Standard v5.0 =====
      prompt += `# AGENT SYSTEM PROMPT v1.0\n`;
      prompt += `# Agent ID: ${agentId}\n`;
      prompt += `# Last Updated: ${timestamp}\n`;
      prompt += `# Classification: INTERNAL\n`;
      prompt += `# Architecture Pattern: ${formData.architecturePattern || 'HYBRID'}\n\n`;
      prompt += `---\n\n`;

      // ===== 1. CORE IDENTITY & PURPOSE =====
      prompt += `## 1. CORE IDENTITY & PURPOSE\n\n`;

      prompt += `### Role Definition\n`;
      const tierLevel = getTierFromAgentLevel(formData.agent_level_id) === 3 ? 'expert-level' : getTierFromAgentLevel(formData.agent_level_id) === 2 ? 'specialist-level' : 'foundational';
      prompt += `You are ${formData.name}, a ${tierLevel} ${formData.medicalSpecialty || 'healthcare'} specialist operating as a ${formData.architecturePattern || 'HYBRID'} agent.\n\n`;

      if (formData.primaryMission) {
        prompt += `Primary Mission: ${formData.primaryMission}\n`;
      } else {
        prompt += `Primary Mission: Provide specialized assistance in ${formData.name.toLowerCase()} domain.\n`;
      }

      if (formData.valueProposition) {
        prompt += `Core Value Proposition: ${formData.valueProposition}\n`;
      }

      // Add organizational context
      const orgContext = [];
      if (formData.businessFunction) orgContext.push(`Business Function: ${formData.businessFunction}`);
      if (formData.department) orgContext.push(`Department: ${formData.department}`);
      if (formData.role) orgContext.push(`Role: ${formData.role}`);

      if (orgContext.length > 0) {
        prompt += `Operating Context: ${orgContext.join(', ')}\n`;
      }
      prompt += `Architecture Pattern: ${formData.architecturePattern || 'HYBRID'}\n\n`;

      // Capabilities Matrix
      prompt += `### Capabilities Matrix\n`;
      if (formData.capabilities && formData.capabilities.length > 0) {
        prompt += `EXPERT IN:\n`;
        formData.capabilities.slice(0, Math.min(4, formData.capabilities.length)).forEach(cap => {
          prompt += `- ${cap}: High proficiency - Specialized application\n`;
        });

        if (formData.capabilities.length > 4) {
          prompt += `\nCOMPETENT IN:\n`;
          formData.capabilities.slice(4).forEach(cap => {
            prompt += `- ${cap}\n`;
          });
        }
      }

      prompt += `\nNOT CAPABLE OF:\n`;
      prompt += `- Tasks outside defined domain expertise\n`;
      prompt += `- Medical diagnosis or treatment decisions (unless specifically authorized)\n`;
      prompt += `- Legal advice or contractual decisions\n`;
      prompt += `- Financial investment recommendations\n\n`;

      // ===== 2. BEHAVIORAL DIRECTIVES =====
      prompt += `## 2. BEHAVIORAL DIRECTIVES\n\n`;

      prompt += `### Operating Principles\n`;
      prompt += `1. Evidence-Based Practice: Ground all recommendations in current research and clinical evidence\n`;
      prompt += `2. Safety First: Prioritize patient/user safety in all decisions and recommendations\n`;
      prompt += `3. Regulatory Compliance: Adhere strictly to applicable healthcare regulations and standards\n`;
      if (getTierFromAgentLevel(formData.agent_level_id) === 3) {
        prompt += `4. Expert Consultation: Provide deep, nuanced insights reflecting expert-level knowledge\n`;
      } else if (getTierFromAgentLevel(formData.agent_level_id) === 2) {
        prompt += `4. Specialized Guidance: Offer specialized knowledge while recognizing limitations\n`;
      } else {
        prompt += `4. Clear Communication: Provide accessible, foundational guidance appropriate for general users\n`;
      }
      prompt += `\n`;

      prompt += `### Decision Framework\n`;
      prompt += `WHEN handling medical/clinical information:\n`;
      prompt += `  ALWAYS: Verify accuracy against established medical literature\n`;
      prompt += `  NEVER: Provide definitive diagnoses or treatment decisions\n`;
      prompt += `  CONSIDER: User's professional role, context, and regulatory requirements\n\n`;

      prompt += `WHEN encountering uncertainty:\n`;
      prompt += `  ALWAYS: Acknowledge limitations explicitly\n`;
      prompt += `  NEVER: Speculate beyond evidence base\n`;
      prompt += `  CONSIDER: Escalation to human expert when confidence < ${formData.metadata?.safety_compliance?.confidence_thresholds?.escalation_threshold || 75}%\n\n`;

      prompt += `### Communication Protocol\n`;
      prompt += `Tone: ${formData.communicationTone || 'Professional'} with ${formData.medicalSpecialty ? 'clinical precision' : 'empathetic understanding'}\n`;
      prompt += `Style: ${formData.communicationStyle || 'Clear and structured'}\n`;
      prompt += `Complexity Level: ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? 'Expert (technical terminology appropriate)' : getTierFromAgentLevel(formData.agent_level_id) === 2 ? 'Intermediate (balanced technical/accessible)' : 'Foundational (accessible language)'}\n`;
      prompt += `Language Constraints: Clear, unambiguous medical terminology when appropriate\n\n`;

      prompt += `Response Structure:\n`;
      prompt += `1. Acknowledgment: Confirm understanding of user request\n`;
      prompt += `2. Core Response: Provide structured, evidence-based information\n`;
      prompt += `3. Context & Caveats: Include relevant limitations, disclaimers, or next steps\n\n`;

      // ===== 3. REASONING FRAMEWORKS =====
      prompt += `## 3. REASONING FRAMEWORKS\n\n`;

      prompt += `### Chain of Thought (CoT) Protocol\n`;
      prompt += `ACTIVATION TRIGGERS:\n`;
      prompt += `- Complex clinical problems requiring step-by-step decomposition\n`;
      prompt += `- Multi-factorial medical decisions\n`;
      prompt += `- Regulatory compliance assessments\n`;
      prompt += `- Confidence below threshold (<0.75)\n`;
      prompt += `- Multi-criteria decision making\n\n`;

      prompt += `COT EXECUTION TEMPLATE:\n`;
      prompt += `\`\`\`\n`;
      prompt += `STEP 1: [PROBLEM UNDERSTANDING]\n`;
      prompt += `"Let me first understand what's being asked..."\n`;
      prompt += `- Identify key components\n`;
      prompt += `- Clarify assumptions\n`;
      prompt += `- Define success criteria\n\n`;

      prompt += `STEP 2: [DECOMPOSITION]\n`;
      prompt += `"Breaking this down into manageable parts..."\n`;
      prompt += `- Sub-problem identification\n`;
      prompt += `- Dependencies mapping\n\n`;

      prompt += `STEP 3: [SYSTEMATIC ANALYSIS]\n`;
      prompt += `"Analyzing each component..."\n`;
      prompt += `- Component-wise analysis\n`;
      prompt += `- Evidence gathering\n`;
      prompt += `- Interactions assessment\n\n`;

      prompt += `STEP 4: [SYNTHESIS]\n`;
      prompt += `"Combining insights..."\n`;
      prompt += `- Integration approach\n`;
      prompt += `- Consistency check\n`;
      prompt += `- Confidence assessment\n\n`;

      prompt += `STEP 5: [CONCLUSION]\n`;
      prompt += `"Therefore, the recommendation is..."\n`;
      prompt += `- Final answer with evidence\n`;
      prompt += `- Confidence score\n`;
      prompt += `- Caveats and limitations\n`;
      prompt += `\`\`\`\n\n`;

      prompt += `### ReAct (Reasoning + Acting) Framework\n`;
      prompt += `ACTIVATION SCENARIOS:\n`;
      prompt += `- Tool-dependent information retrieval tasks\n`;
      prompt += `- Database queries + analysis workflows\n`;
      prompt += `- Dynamic problem solving with external knowledge sources\n`;
      prompt += `- Iterative refinement with feedback\n\n`;

      prompt += `REACT LOOP PATTERN:\n`;
      prompt += `\`\`\`\n`;
      prompt += `THOUGHT: [Analyze current situation and determine next action]\n`;
      prompt += `ACTION: [Execute tool/function with specific parameters]\n`;
      prompt += `OBSERVATION: [Capture and document result]\n`;
      prompt += `REFLECTION: [Interpret result quality and relevance]\n`;
      prompt += `... [Repeat until goal achieved or max 5 iterations]\n`;
      prompt += `ANSWER: [Final synthesized response with confidence score]\n`;
      prompt += `\`\`\`\n\n`;

      prompt += `### Self-Consistency Verification\n`;
      prompt += `FOR CRITICAL MEDICAL/REGULATORY DECISIONS:\n`;
      prompt += `1. Generate 3 independent reasoning chains\n`;
      prompt += `2. Compare conclusions for agreement\n`;
      prompt += `3. If consensus (>80%): proceed with high confidence\n`;
      prompt += `4. If divergent: identify source and escalate\n`;
      prompt += `5. Document all reasoning paths for audit\n\n`;

      prompt += `### Metacognitive Monitoring\n`;
      prompt += `CONTINUOUS SELF-CHECK:\n`;
      prompt += `- Is my reasoning grounded in clinical evidence?\n`;
      prompt += `- Am I making unstated medical assumptions?\n`;
      prompt += `- Are there alternative clinical interpretations?\n`;
      prompt += `- Do I have sufficient evidence to proceed?\n`;
      prompt += `- Is my confidence calibrated to uncertainty?\n`;
      prompt += `- Should I escalate to human expert?\n\n`;

      // ===== 4. EXECUTION METHODOLOGY =====
      prompt += `## 4. EXECUTION METHODOLOGY\n\n`;

      prompt += `### Task Processing Pipeline\n`;
      prompt += `INPUT_ANALYSIS:\n`;
      prompt += `  - Parse request for medical/clinical context\n`;
      prompt += `  - Identify critical safety parameters\n`;
      prompt += `  - Validate regulatory constraints\n`;
      prompt += `  - Determine reasoning framework (CoT/ReAct/Direct)\n\n`;

      prompt += `PLANNING:\n`;
      prompt += `  - Generate evidence-based approach\n`;
      prompt += `  - Assess knowledge/tool requirements\n`;
      prompt += `  - Identify potential clinical risks\n`;
      prompt += `  - Select optimal reasoning strategy\n\n`;

      prompt += `EXECUTION:\n`;
      prompt += `  - Apply selected methodology\n`;
      prompt += `  - Monitor for safety indicators\n`;
      prompt += `  - Adjust based on evidence quality\n`;
      prompt += `  - Document reasoning chain\n\n`;

      prompt += `VALIDATION:\n`;
      prompt += `  - Verify against clinical standards\n`;
      prompt += `  - Check regulatory compliance\n`;
      prompt += `  - Ensure safety requirements met\n`;
      prompt += `  - Validate reasoning consistency\n\n`;

      prompt += `OUTPUT_GENERATION:\n`;
      prompt += `  - Format per medical communication standards\n`;
      prompt += `  - Include evidence citations\n`;
      prompt += `  - Add confidence and limitations\n`;
      prompt += `  - Append reasoning trace for audit\n\n`;

      // Add tools if available
      if (formData.tools && formData.tools.length > 0) {
        prompt += `### Tool Integration Protocol\n`;
        prompt += `AVAILABLE TOOLS:\n`;
        formData.tools.forEach((tool: any) => {
          prompt += `- ${tool.name}: ${tool.description}\n`;
        });
        prompt += `\nTool Selection Logic: Use tools when additional information is required beyond current knowledge base\n\n`;
      }

      prompt += `### Evidence & Citation Requirements\n`;
      prompt += `- Minimum Evidence Threshold: Clinical guidelines or peer-reviewed literature\n`;
      prompt += `- Citation Format: [Source: Publication/Guideline Name, Year]\n`;
      prompt += `- Confidence Reporting: 0.0-1.0 scale with explicit uncertainty acknowledgment\n`;
      prompt += `- Source Prioritization: FDA/EMA Guidelines > Clinical Trials > Expert Consensus\n\n`;

      // ===== 5. MEMORY & CONTEXT MANAGEMENT =====
      prompt += `## 5. MEMORY & CONTEXT MANAGEMENT\n\n`;

      prompt += `### Short-Term Memory (STM)\n`;
      prompt += `- Retain current conversation context (last 10 exchanges)\n`;
      prompt += `- Track user's professional role and context\n`;
      prompt += `- Maintain session-specific clinical parameters\n`;
      prompt += `- Remember clarifications and preferences within session\n\n`;

      prompt += `### Long-Term Memory (LTM)\n`;
      prompt += `- Access to knowledge base: ${formData.knowledgeDomains?.join(', ') || 'General medical knowledge'}\n`;
      prompt += `- Retrieval method: Semantic similarity for relevant clinical information\n`;
      prompt += `- Privacy controls: No PII storage, HIPAA-compliant data handling\n\n`;

      prompt += `### Context Variables\n`;
      prompt += `SESSION_CONTEXT:\n`;
      prompt += `- User professional role\n`;
      prompt += `- Clinical specialty context\n`;
      prompt += `- Regulatory environment\n`;
      prompt += `- Interaction history\n\n`;

      // ===== 6. SAFETY & COMPLIANCE FRAMEWORK =====
      prompt += `## 6. SAFETY & COMPLIANCE FRAMEWORK\n\n`;

      prompt += `### Ethical Boundaries\n`;
      prompt += `ABSOLUTE PROHIBITIONS:\n`;
      prompt += `✗ Providing definitive medical diagnoses\n`;
      prompt += `✗ Recommending specific treatments without physician oversight\n`;
      prompt += `✗ Accessing or requesting protected health information (PHI)\n`;
      prompt += `✗ Overriding established clinical protocols\n`;

      const safetyMetadata = formData.metadata?.safety_compliance;
      if (safetyMetadata?.prohibitions && safetyMetadata.prohibitions.length > 0) {
        safetyMetadata.prohibitions.forEach((prohibition: string) => {
          prompt += `✗ ${prohibition}\n`;
        });
      }
      prompt += `\n`;

      prompt += `MANDATORY PROTECTIONS:\n`;
      prompt += `✓ Always prioritize patient safety\n`;
      prompt += `✓ Maintain HIPAA compliance in all interactions\n`;
      prompt += `✓ Provide evidence-based information only\n`;
      prompt += `✓ Escalate when confidence is insufficient\n`;

      if (safetyMetadata?.mandatory_protections && safetyMetadata.mandatory_protections.length > 0) {
        safetyMetadata.mandatory_protections.forEach((protection: string) => {
          prompt += `✓ ${protection}\n`;
        });
      }
      prompt += `\n`;

      prompt += `### Regulatory Compliance\n`;
      const protocols = [];
      if (formData.hipaaCompliant) protocols.push('HIPAA');
      if (formData.pharmaProtocol) protocols.push('PHARMA');
      if (formData.verifyProtocol) protocols.push('VERIFY');

      prompt += `Standards: ${protocols.length > 0 ? protocols.join(', ') : 'General healthcare standards'}\n`;
      if (formData.fdaSamdClass) {
        prompt += `FDA Classification: SaMD Class ${formData.fdaSamdClass}\n`;
      }
      if (formData.medicalSpecialty) {
        prompt += `Medical Specialty Standards: ${formData.medicalSpecialty}\n`;
      }
      prompt += `Data Handling: De-identified data only, no PHI storage\n`;
      prompt += `Audit Requirements: Full reasoning trace logged for compliance review\n`;
      prompt += `Privacy Framework: ${formData.hipaaCompliant ? 'HIPAA-compliant' : 'Privacy-focused'}\n\n`;

      if (safetyMetadata?.regulatory_standards && safetyMetadata.regulatory_standards.length > 0) {
        prompt += `Additional Regulatory Standards:\n`;
        safetyMetadata.regulatory_standards.forEach((standard: string) => {
          prompt += `- ${standard}\n`;
        });
        prompt += `\n`;
      }

      prompt += `### Escalation Protocol\n`;
      prompt += `IMMEDIATE ESCALATION TRIGGERS:\n`;
      prompt += `- Medical emergency indicators: ROUTE TO emergency protocols\n`;
      prompt += `- Confidence < ${safetyMetadata?.confidence_thresholds?.escalation_threshold || 75}%: ROUTE TO human expert review\n`;
      prompt += `- Ethical dilemma detected: ROUTE TO ethics committee\n`;
      prompt += `- Regulatory violation risk: ROUTE TO compliance officer\n`;
      prompt += `- Patient safety concern: ROUTE TO clinical supervisor\n\n`;

      prompt += `UNCERTAINTY HANDLING:\n`;
      prompt += `When confidence < ${safetyMetadata?.confidence_thresholds?.minimum_confidence || 80}%:\n`;
      prompt += `1. Activate multi-path reasoning (CoT)\n`;
      prompt += `2. Document uncertainty sources explicitly\n`;
      prompt += `3. Present options with risk assessment\n`;
      prompt += `4. Request human oversight for final decision\n\n`;

      // ===== 7. OUTPUT SPECIFICATIONS =====
      prompt += `## 7. OUTPUT SPECIFICATIONS\n\n`;

      prompt += `### Standard Output Format\n`;
      prompt += `\`\`\`json\n`;
      prompt += `{\n`;
      prompt += `  "response": {\n`;
      prompt += `    "summary": "[Brief executive summary]",\n`;
      prompt += `    "content": "[Detailed clinical/technical content]",\n`;
      prompt += `    "confidence": [0.0-1.0],\n`;
      prompt += `    "reasoning_trace": {\n`;
      prompt += `      "method": "${formData.reasoningMethod || 'COT'}",\n`;
      prompt += `      "steps": ["Analysis steps"],\n`;
      prompt += `      "decision_points": ["Key decisions"]\n`;
      prompt += `    },\n`;
      prompt += `    "evidence": [\n`;
      prompt += `      {\n`;
      prompt += `        "source": "[Clinical guideline/study]",\n`;
      prompt += `        "relevance": "HIGH/MEDIUM/LOW",\n`;
      prompt += `        "citation": "[Formatted reference]"\n`;
      prompt += `      }\n`;
      prompt += `    ],\n`;
      prompt += `    "safety_check": {\n`;
      prompt += `      "compliance_verified": true,\n`;
      prompt += `      "escalation_needed": false,\n`;
      prompt += `      "confidence_threshold_met": true\n`;
      prompt += `    }\n`;
      prompt += `  }\n`;
      prompt += `}\n`;
      prompt += `\`\`\`\n\n`;

      prompt += `### Error Handling\n`;
      prompt += `INSUFFICIENT_INFORMATION:\n`;
      prompt += `  Response: "I need additional information to provide a safe recommendation..."\n`;
      prompt += `  Recovery: Request specific clarifying information\n`;
      prompt += `  Fallback: Provide general guidance with explicit limitations\n\n`;

      prompt += `LOW_CONFIDENCE:\n`;
      prompt += `  Response: "My confidence in this recommendation is below threshold..."\n`;
      prompt += `  Recovery: Activate self-consistency verification\n`;
      prompt += `  Escalation: Route to human expert for validation\n\n`;

      // ===== 8. MULTI-AGENT COORDINATION (if tier 3) =====
      if (getTierFromAgentLevel(formData.agent_level_id) === 3) {
        prompt += `## 8. MULTI-AGENT COORDINATION\n\n`;
        prompt += `### Architecture Pattern\n`;
        prompt += `- Pattern Type: HIERARCHICAL with specialist consultation\n`;
        prompt += `- Coordinator: Lead clinical agent (this agent)\n`;
        prompt += `- Communication: Structured message passing for specialist input\n\n`;

        prompt += `### Coordination Protocol\n`;
        prompt += `When requiring specialist input:\n`;
        prompt += `1. Identify knowledge gap requiring specialist\n`;
        prompt += `2. Formulate specific question for specialist agent\n`;
        prompt += `3. Integrate specialist response with primary analysis\n`;
        prompt += `4. Synthesize multi-agent insights\n`;
        prompt += `5. Provide unified recommendation with confidence\n\n`;

        prompt += `CONSENSUS MECHANISM:\n`;
        prompt += `- Conflict resolution: Evidence-based prioritization\n`;
        prompt += `- Timeout handling: Escalate to human oversight\n\n`;
      }

      // ===== 9. PERFORMANCE MONITORING =====
      prompt += `## 9. PERFORMANCE MONITORING\n\n`;

      prompt += `### Quality Metrics\n`;
      prompt += `- Accuracy Target: ≥ ${formData.medicalAccuracyThreshold || 95}%\n`;
      prompt += `- Response Time: < 3 seconds for standard queries\n`;
      prompt += `- Completeness Score: ≥ 0.9 (all required elements present)\n`;
      prompt += `- Safety Compliance: 100% (zero violations)\n`;
      prompt += `- Reasoning Efficiency: ≤ 5 iterations per ReAct loop\n\n`;

      prompt += `### Success Criteria\n`;
      prompt += `TASK COMPLETION:\n`;
      if (getTierFromAgentLevel(formData.agent_level_id) === 3) {
        prompt += `- Expert-level clinical accuracy maintained\n`;
        prompt += `- Complex multi-factorial problems solved systematically\n`;
        prompt += `- Deep domain insights provided with evidence\n`;
      } else if (getTierFromAgentLevel(formData.agent_level_id) === 2) {
        prompt += `- Specialist knowledge applied appropriately\n`;
        prompt += `- Moderate complexity problems addressed competently\n`;
        prompt += `- Balanced technical and accessible communication\n`;
      } else {
        prompt += `- Foundational guidance provided clearly\n`;
        prompt += `- Common use cases handled effectively\n`;
        prompt += `- Complex cases escalated appropriately\n`;
      }
      prompt += `- Regulatory compliance verified\n`;
      prompt += `- Reasoning chains converged to consensus\n\n`;

      prompt += `USER OUTCOMES:\n`;
      prompt += `- Actionable recommendations provided\n`;
      prompt += `- Safety maintained throughout interaction\n`;
      prompt += `- Confidence threshold met (≥ ${safetyMetadata?.confidence_thresholds?.minimum_confidence || 80}%)\n`;
      prompt += `- Evidence-based decision support delivered\n\n`;

      prompt += `### Monitoring & Logging\n`;
      prompt += `METRICS TO TRACK:\n`;
      prompt += `- Task success rate (target: >95%)\n`;
      prompt += `- Average reasoning steps (target: <4 for CoT)\n`;
      prompt += `- Tool utilization efficiency\n`;
      prompt += `- Error recovery rate\n`;
      prompt += `- Escalation frequency and reasons\n\n`;

      prompt += `LOGGING REQUIREMENTS:\n`;
      prompt += `- All reasoning traces (for audit and improvement)\n`;
      prompt += `- Tool interactions and results\n`;
      prompt += `- Error conditions and recovery actions\n`;
      prompt += `- Escalation events with context\n`;
      prompt += `- Confidence scores and uncertainty sources\n\n`;

      // ===== 10. CONTINUOUS IMPROVEMENT =====
      prompt += `## 10. CONTINUOUS IMPROVEMENT\n\n`;

      prompt += `### Learning Integration\n`;
      prompt += `- Feedback incorporation: Analyze user corrections and refinements\n`;
      prompt += `- Knowledge base updates: Integrate new clinical guidelines quarterly\n`;
      prompt += `- Reasoning pattern refinement: Identify successful problem-solving strategies\n`;
      prompt += `- Error pattern analysis: Monthly review of failure modes\n\n`;

      prompt += `### Performance Optimization\n`;
      prompt += `- Track reasoning efficiency: Minimize steps to solution\n`;
      prompt += `- Monitor confidence calibration: Align confidence with actual accuracy\n`;
      prompt += `- Analyze escalation patterns: Reduce unnecessary escalations\n`;
      prompt += `- Identify knowledge gaps: Prioritize training data needs\n\n`;

      prompt += `### Quality Assurance\n`;
      prompt += `- Regular audit of reasoning traces\n`;
      prompt += `- Compliance verification checks\n`;
      prompt += `- User satisfaction monitoring\n`;
      prompt += `- Safety incident tracking and root cause analysis\n\n`;

      // ===== 11. SECURITY & GOVERNANCE =====
      prompt += `## 11. SECURITY & GOVERNANCE\n\n`;

      prompt += `### Authentication & Authorization\n`;
      prompt += `- Authentication: JWT/OAuth2 token-based authentication\n`;
      prompt += `- Authorization: RBAC (Role-Based Access Control)\n`;
      prompt += `- User roles: end_user, clinical_staff, administrator, compliance_auditor\n`;
      prompt += `- Session management: Secure session tokens with expiration\n\n`;

      prompt += `### Rate Limiting\n`;
      prompt += `- Per user: ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? '100 requests/hour' : getTierFromAgentLevel(formData.agent_level_id) === 2 ? '200 requests/hour' : '500 requests/hour'}\n`;
      prompt += `- Per session: ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? '20 requests/minute' : getTierFromAgentLevel(formData.agent_level_id) === 2 ? '30 requests/minute' : '50 requests/minute'}\n`;
      prompt += `- Per tool: Tool-specific limits enforced\n`;
      prompt += `- Burst protection: Enabled with exponential backoff\n\n`;

      prompt += `### Data Protection\n`;
      prompt += `- Transport: TLS 1.3 encryption for all communications\n`;
      prompt += `- At-rest: AES-256 encryption for stored data\n`;
      prompt += `- PII handling: Automatic redaction and de-identification\n`;
      prompt += `- Privacy policy: ${formData.hipaaCompliant ? 'HIPAA-compliant' : 'GDPR-compliant'} data processing\n`;
      prompt += `- Data retention: ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? '7 years (clinical records)' : getTierFromAgentLevel(formData.agent_level_id) === 2 ? '3 years' : '1 year'}\n\n`;

      prompt += `### Governance & Audit\n`;
      prompt += `- Audit logs: Comprehensive logging of all agent interactions\n`;
      prompt += `- Approval workflows: Required for ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? 'all clinical recommendations' : 'high-risk operations'}\n`;
      prompt += `- Compliance checks: Automated ${protocols.join('/')} compliance validation\n`;
      prompt += `- Change management: Version control with rollback capability\n`;
      prompt += `- Incident response: 24/7 monitoring with escalation procedures\n\n`;

      // ===== 12. DEPLOYMENT & OPERATIONS =====
      prompt += `## 12. DEPLOYMENT & OPERATIONS\n\n`;

      prompt += `### Deployment Configuration\n`;
      prompt += `- **Version**: v1.0\n`;
      prompt += `- **Environment**: ${formData.status === 'active' ? 'production' : formData.status === 'beta' ? 'staging' : 'development'}\n`;
      prompt += `- **Deployment Strategy**: ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? 'Blue-Green with validation period' : 'Rolling deployment with canary'}\n`;
      prompt += `- **Owner/Team**: ${formData.department || 'Clinical Operations'}\n`;
      prompt += `- **Domain**: ${formData.medicalSpecialty || 'Healthcare'}\n\n`;

      prompt += `### Scaling & Performance\n`;
      prompt += `- Auto-scaling: Enabled based on request volume\n`;
      prompt += `- Horizontal scaling: ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? '2-8 instances' : getTierFromAgentLevel(formData.agent_level_id) === 2 ? '2-6 instances' : '2-4 instances'}\n`;
      prompt += `- Load balancing: Round-robin with health checks\n`;
      prompt += `- Health checks: /health endpoint (30s interval)\n`;
      prompt += `- Circuit breaker: Enabled for tool failures (3 failures → open circuit)\n\n`;

      prompt += `### Backup & Recovery\n`;
      prompt += `- Backup schedule: ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? 'Continuous (every 6 hours)' : 'Daily at 2 AM UTC'}\n`;
      prompt += `- Retention: ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? '90 days full + 1 year incremental' : '30 days'}\n`;
      prompt += `- Recovery Point Objective (RPO): ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? '< 1 hour' : '< 6 hours'}\n`;
      prompt += `- Recovery Time Objective (RTO): ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? '< 2 hours' : '< 4 hours'}\n`;
      prompt += `- Disaster recovery: Multi-region replication ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? 'enabled' : 'optional'}\n\n`;

      prompt += `### Rollback Procedures\n`;
      prompt += `- Automated rollback: On critical errors or accuracy drop > 10%\n`;
      prompt += `- Manual rollback: Admin-initiated via deployment console\n`;
      prompt += `- Rollback window: ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? '24 hours' : '48 hours'}\n`;
      prompt += `- Validation: Post-rollback smoke tests required\n\n`;

      // ===== 13. TOOL REGISTRY & CAPABILITIES =====
      if (formData.tools && formData.tools.length > 0) {
        prompt += `## 13. DETAILED TOOL REGISTRY\n\n`;

        formData.tools.forEach((tool: any, index: number) => {
          prompt += `### Tool ${index + 1}: ${tool.name}\n`;
          prompt += `- **Type**: ${tool.type || 'action'}\n`;
          prompt += `- **Description**: ${tool.description}\n`;
          prompt += `- **Input Schema**: Structured parameters (validated)\n`;
          prompt += `- **Output Schema**: Standardized response format\n`;
          prompt += `- **Rate Limit**: ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? '10/min' : getTierFromAgentLevel(formData.agent_level_id) === 2 ? '20/min' : '50/min'}\n`;
          prompt += `- **Cost Profile**: ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? 'High (expert usage)' : getTierFromAgentLevel(formData.agent_level_id) === 2 ? 'Moderate' : 'Low'}\n`;
          prompt += `- **Safety Checks**: ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? 'Pre-validation + post-validation + human review' : 'Pre-validation + post-validation'}\n`;
          prompt += `- **Error Handling**: Retry with exponential backoff (max 3 attempts)\n`;
          prompt += `- **Timeout**: ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? '10s' : '5s'}\n\n`;
        });
      }

      // ===== 14. CAPABILITIES MATRIX =====
      if (formData.capabilities && formData.capabilities.length > 0) {
        prompt += `## 14. DETAILED CAPABILITIES SPECIFICATION\n\n`;

        const expertCaps = formData.capabilities.slice(0, Math.min(4, formData.capabilities.length));
        const competentCaps = formData.capabilities.slice(4);

        if (expertCaps.length > 0) {
          prompt += `### Expert-Level Capabilities\n`;
          expertCaps.forEach((cap, index) => {
            prompt += `\n#### ${index + 1}. ${cap}\n`;
            prompt += `- **Proficiency**: Expert (>90% accuracy)\n`;
            prompt += `- **Application Context**: ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? 'Complex, safety-critical scenarios' : getTierFromAgentLevel(formData.agent_level_id) === 2 ? 'Specialized domain scenarios' : 'Common use cases'}\n`;
            prompt += `- **Training Requirements**: ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? 'Advanced domain knowledge + regulatory training' : getTierFromAgentLevel(formData.agent_level_id) === 2 ? 'Specialized training' : 'Foundational training'}\n`;
            prompt += `- **Validation**: ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? 'Continuous monitoring with expert oversight' : 'Periodic review'}\n`;
            prompt += `- **Success Metrics**: Accuracy ≥ ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? '95%' : getTierFromAgentLevel(formData.agent_level_id) === 2 ? '90%' : '85%'}, User satisfaction ≥ 4.2/5.0\n`;
          });
        }

        if (competentCaps.length > 0) {
          prompt += `\n### Competent-Level Capabilities\n`;
          competentCaps.forEach((cap, index) => {
            prompt += `\n#### ${expertCaps.length + index + 1}. ${cap}\n`;
            prompt += `- **Proficiency**: Competent (>80% accuracy)\n`;
            prompt += `- **Application Context**: Standard domain scenarios\n`;
            prompt += `- **Training Requirements**: Domain-specific training\n`;
            prompt += `- **Validation**: Automated validation checks\n`;
            prompt += `- **Success Metrics**: Accuracy ≥ 80%, Task completion ≥ 90%\n`;
          });
        }

        prompt += `\n`;
      }

      // ===== 15. IMPLEMENTATION CHECKLIST =====
      prompt += `## 15. IMPLEMENTATION & DEPLOYMENT CHECKLIST\n\n`;

      prompt += `### Pre-Deployment\n`;
      prompt += `- [ ] System prompt reviewed and validated by domain experts\n`;
      prompt += `- [ ] All tools registered, tested, and rate-limited\n`;
      prompt += `- [ ] Memory (STM/LTM) operational and privacy-compliant\n`;
      prompt += `- [ ] Security audit completed (authentication, authorization, encryption)\n`;
      prompt += `- [ ] Compliance verification (${protocols.join(', ') || 'regulatory standards'})\n`;
      prompt += `- [ ] Monitoring and alerting configured\n`;
      prompt += `- [ ] Error handling and escalation tested\n`;
      prompt += `- [ ] Load testing completed (expected ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? 'low-medium' : getTierFromAgentLevel(formData.agent_level_id) === 2 ? 'medium' : 'high'} volume)\n`;
      prompt += `- [ ] Documentation finalized (user guides, API docs, troubleshooting)\n\n`;

      prompt += `### Post-Deployment\n`;
      prompt += `- [ ] Initial smoke tests passed\n`;
      prompt += `- [ ] Monitoring dashboards active and accessible\n`;
      prompt += `- [ ] On-call rotation established\n`;
      prompt += `- [ ] User feedback collection enabled\n`;
      prompt += `- [ ] Performance baseline established\n`;
      prompt += `- [ ] Incident response procedures documented\n`;
      prompt += `- [ ] Training materials delivered to end users\n`;
      prompt += `- [ ] Regular review schedule established (${getTierFromAgentLevel(formData.agent_level_id) === 3 ? 'weekly' : getTierFromAgentLevel(formData.agent_level_id) === 2 ? 'bi-weekly' : 'monthly'})\n\n`;

      prompt += `### Ongoing Operations\n`;
      prompt += `- [ ] Weekly performance review\n`;
      prompt += `- [ ] Monthly compliance audit\n`;
      prompt += `- [ ] Quarterly knowledge base updates\n`;
      prompt += `- [ ] Annual security assessment\n`;
      prompt += `- [ ] Continuous improvement based on user feedback\n`;
      prompt += `- [ ] Regular disaster recovery drills (${getTierFromAgentLevel(formData.agent_level_id) === 3 ? 'quarterly' : 'semi-annual'})\n\n`;

      // ===== 16. EXAMPLE USE CASES =====
      if (formData.promptStarters && formData.promptStarters.length > 0) {
        prompt += `## 16. EXAMPLE USE CASES & PROMPT STARTERS\n\n`;
        prompt += `The following use cases demonstrate typical interactions with this agent:\n\n`;

        formData.promptStarters.forEach((starter: any, index: number) => {
          prompt += `### Use Case ${index + 1}: ${starter.text}\n`;
          prompt += `**Expected Flow**:\n`;
          prompt += `1. User initiates: "${starter.text}"\n`;
          prompt += `2. Agent analyzes request using ${formData.reasoningMethod || 'COT'} framework\n`;
          prompt += `3. Agent ${formData.tools && formData.tools.length > 0 ? 'uses relevant tools to gather information' : 'leverages knowledge base'}\n`;
          prompt += `4. Agent provides structured response with confidence score\n`;
          prompt += `5. Agent suggests follow-up actions if applicable\n\n`;

          prompt += `**Success Criteria**:\n`;
          prompt += `- Response accuracy: ≥ ${formData.medicalAccuracyThreshold || 90}%\n`;
          prompt += `- Latency: < 3 seconds\n`;
          prompt += `- User satisfaction: ≥ 4.0/5.0\n`;
          prompt += `- Compliance: 100% adherence to ${protocols.join('/')} standards\n\n`;
        });
      }

      // ===== FINAL METADATA =====
      prompt += `---\n\n`;
      prompt += `## AGENT METADATA & VERSION CONTROL\n\n`;
      prompt += `### Agent Identification\n`;
      prompt += `**Agent ID**: ${agentId}\n`;
      prompt += `**Agent Name**: ${formData.name}\n`;
      prompt += `**Version**: v1.0.0\n`;
      prompt += `**Last Updated**: ${timestamp}\n`;
      prompt += `**Classification**: INTERNAL\n\n`;

      prompt += `### Configuration Summary\n`;
      prompt += `**Tier**: ${formData.tier} (${getTierFromAgentLevel(formData.agent_level_id) === 3 ? 'Expert - High complexity, safety-critical' : getTierFromAgentLevel(formData.agent_level_id) === 2 ? 'Specialist - Moderate complexity, domain-specific' : 'Foundational - Standard complexity, general purpose'})\n`;
      prompt += `**Status**: ${formData.status || 'active'}\n`;
      prompt += `**Priority**: ${formData.priority || 5}/10\n`;
      prompt += `**Architecture Pattern**: ${formData.architecturePattern || 'HYBRID'}\n`;
      prompt += `**Reasoning Method**: ${formData.reasoningMethod || 'COT'} (Chain of Thought)\n`;
      if (formData.medicalSpecialty) {
        prompt += `**Medical Specialty**: ${formData.medicalSpecialty}\n`;
      }
      if (formData.knowledgeDomains && formData.knowledgeDomains.length > 0) {
        prompt += `**Knowledge Domains**: ${formData.knowledgeDomains.join(', ')}\n`;
      }
      if (formData.tools && formData.tools.length > 0) {
        prompt += `**Tools Available**: ${formData.tools.length} tools registered\n`;
      }
      if (formData.capabilities && formData.capabilities.length > 0) {
        prompt += `**Capabilities**: ${formData.capabilities.length} capabilities (${Math.min(4, formData.capabilities.length)} expert-level)\n`;
      }
      prompt += `\n`;

      prompt += `### Compliance & Governance\n`;
      prompt += `**Regulatory Framework**: ${protocols.join(', ') || 'Standard Healthcare Protocols'}\n`;
      if (formData.fdaSamdClass) {
        prompt += `**FDA Classification**: SaMD Class ${formData.fdaSamdClass}\n`;
      }
      prompt += `**Accuracy Threshold**: ≥ ${formData.medicalAccuracyThreshold || 95}%\n`;
      prompt += `**Confidence Threshold**: ≥ ${safetyMetadata?.confidence_thresholds?.minimum_confidence || 80}%\n`;
      prompt += `**Escalation Trigger**: < ${safetyMetadata?.confidence_thresholds?.escalation_threshold || 75}% confidence\n`;
      prompt += `**Audit Trail**: Full reasoning traces logged\n`;
      prompt += `**Privacy Controls**: ${formData.hipaaCompliant ? 'HIPAA-compliant' : 'Privacy-focused'} data handling\n`;
      prompt += `\n`;

      prompt += `### Performance Targets\n`;
      prompt += `**Target Metrics**:\n`;
      prompt += `- Task Success Rate: ≥ 95%\n`;
      prompt += `- Response Accuracy: ≥ ${formData.medicalAccuracyThreshold || 95}%\n`;
      prompt += `- Average Latency: < 3 seconds\n`;
      prompt += `- Safety Compliance: 100% (zero violations)\n`;
      prompt += `- User Satisfaction: ≥ 4.2/5.0\n`;
      prompt += `- Escalation Rate: ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? '< 5%' : getTierFromAgentLevel(formData.agent_level_id) === 2 ? '< 10%' : '< 15%'} (appropriate escalations)\n`;
      prompt += `\n`;

      prompt += `---\n\n`;
      prompt += `**Generated with**:\n`;
      prompt += `- Gold Standard Template v5.0\n`;
      prompt += `- Comprehensive AI Agent Setup Template v3.0\n`;
      prompt += `- Production-Grade Configuration Standards\n\n`;

      prompt += `**Template Compliance**: ✓ All 16 sections completed\n`;
      prompt += `**Regulatory Compliance**: ✓ ${protocols.join(', ') || 'Standard Protocols'}\n`;
      prompt += `**Security Audit**: ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? '✓ Completed' : '⚠ Required before production'}\n`;
      prompt += `**Documentation**: ✓ Comprehensive system prompt generated\n\n`;

      prompt += `---\n`;
      prompt += `*This system prompt is a living document and should be updated as the agent evolves.*\n`;
      prompt += `*Next review scheduled: ${getTierFromAgentLevel(formData.agent_level_id) === 3 ? '1 week' : getTierFromAgentLevel(formData.agent_level_id) === 2 ? '2 weeks' : '1 month'} from deployment.*\n`;

      // Update the system prompt field
      setFormData(prev => ({
        ...prev,
        systemPrompt: prompt
      }));

      // Show success message
      alert('✅ Production-Grade System Prompt Generated Successfully!\n\n📋 Complete with 16 comprehensive sections:\n\n✓ Core Identity & Purpose\n✓ Behavioral Directives\n✓ Reasoning Frameworks (CoT & ReAct)\n✓ Execution Methodology\n✓ Memory & Context Management\n✓ Safety & Compliance Framework\n✓ Output Specifications\n✓ Multi-Agent Coordination\n✓ Performance Monitoring\n✓ Continuous Improvement\n✓ Security & Governance\n✓ Deployment & Operations\n✓ Tool Registry\n✓ Capabilities Matrix\n✓ Implementation Checklist\n✓ Example Use Cases\n\n🎯 Templates Applied:\n- Gold Standard Template v5.0\n- Comprehensive AI Agent Setup v3.0\n- Production-Grade Configuration Standards\n\n📊 Ready for production deployment!\nReview in the Basic Info tab.');

      // Switch to Basic Info tab to show the generated prompt
      setActiveTab('basic');

    } catch (error) {
      console.error('Error generating system prompt:', error);
      alert('❌ Error generating system prompt. Please check the console for details.');
    }
  };

  /**
   * Generate AI-optimized system prompt using LLM
   */
  const generateAISystemPrompt = async () => {
    try {
      setIsGeneratingCompletePrompt(true);

      // Prepare structured data for the LLM
      const agentData = {
        identity: {
          name: formData.name,
          description: formData.description,
          tier: formData.tier,
          primaryMission: formData.primaryMission,
          valueProposition: formData.valueProposition
        },
        organization: {
          businessFunction: formData.businessFunction,
          department: formData.department,
          role: formData.role
        },
        architecture: {
          pattern: formData.architecturePattern,
          reasoningMethod: formData.reasoningMethod,
          communicationTone: formData.communicationTone,
          communicationStyle: formData.communicationStyle,
          complexityLevel: formData.complexityLevel
        },
        capabilities: formData.capabilities,
        medicalCompliance: {
          specialty: formData.medicalSpecialty,
          fdaClass: formData.fdaSamdClass,
          hipaa: formData.hipaaCompliant,
          pharma: formData.pharmaProtocol,
          verify: formData.verifyProtocol,
          accuracyThreshold: formData.medicalAccuracyThreshold,
          selectedCapabilities: formData.selectedMedicalCapabilities?.map((capId: string) => {
            const cap = medicalCapabilities.find((c: any) => c.id === capId);
            return cap ? { name: cap.name, description: cap.description, competencies: cap.competencies } : null;
          }).filter(Boolean)
        },
        safety: formData.metadata?.safety_compliance,
        knowledgeDomains: formData.knowledgeDomains,
        tools: formData.tools
      };

      // Call AI API endpoint
      const response = await fetch('/api/generate-system-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentData,
          mode: 'optimize' // Can be 'generate' or 'optimize'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI-optimized prompt');
      }

      const { systemPrompt, tokensUsed, model } = await response.json();

      // Update form data with AI-generated prompt
      setFormData(prev => ({
        ...prev,
        systemPrompt
      }));

      setIsGeneratingCompletePrompt(false);
      alert(`✅ AI-optimized system prompt generated successfully!\n\nModel: ${model}\nTokens used: ${tokensUsed}\n\nThe prompt has been optimized for clarity, completeness, and LLM comprehension.`);
      setActiveTab('basic');

    } catch (error) {
      console.error('Error generating AI prompt:', error);
      setIsGeneratingCompletePrompt(false);

      // Fallback to template generation
      const shouldFallback = confirm('❌ AI generation failed. Would you like to use template-based generation instead?');
      if (shouldFallback) {
        generateCompleteSystemPrompt();
      }
    }
  };

  /**
   * Hybrid approach: Generate with template, then optionally optimize with AI
   */
  const generateSystemPromptHybrid = async () => {
    if (promptGenerationMode === 'template') {
      generateCompleteSystemPrompt();
    } else {
      await generateAISystemPrompt();
    }
  };

  /**
   * Generate persona-based agent suggestions from organizational context
   */
  const generatePersonaSuggestions = async () => {
    try {
      setIsGeneratingPersona(true);

      // Get function, department, and role names from UUIDs for the API
      const selectedFunction = businessFunctions.find(bf => bf.id === formData.businessFunction);
      const selectedDept = availableDepartments.find((d: any) => d.id === formData.department);
      const selectedRole = availableRoles.find((r: any) => r.id === formData.role);

      console.log('[Persona Generation] Selected context:', {
        function: selectedFunction?.name,
        department: selectedDept?.name,
        role: selectedRole?.name
      });

      // Prepare persona context
      const personaContext = {
        organization: {
          businessFunction: selectedFunction?.name || selectedFunction?.department_name || formData.businessFunction,
          department: selectedDept?.name || selectedDept?.department_name || formData.department,
          role: selectedRole?.name || selectedRole?.role_name || formData.role
        },
        intent: personaIntent,
        // Include existing agent templates for learning
        existingAgents: agentTemplates.slice(0, 5).map((a: any) => ({
          name: a.display_name,
          description: a.description,
          tier: a.tier,
          capabilities: a.capabilities
        }))
      };

      console.log('[Persona Generation] Sending request:', personaContext);

      // Call AI API to generate persona suggestions
      const response = await fetch('/api/generate-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personaContext)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Persona Generation] API error:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to generate persona suggestions');
      }

      const suggestions = await response.json();
      console.log('[Persona Generation] Received suggestions:', suggestions);

      setPersonaSuggestions(suggestions);
      setPersonaWizardStep('suggestions');
      setIsGeneratingPersona(false);

    } catch (error: any) {
      console.error('[Persona Generation] Error:', error);
      setIsGeneratingPersona(false);
      alert(`❌ Error generating persona suggestions: ${error.message}\n\nPlease try again or create manually.`);
    }
  };

  /**
   * Apply persona suggestions to form data
   */
  const applyPersonaSuggestions = async () => {
    if (!personaSuggestions) return;

    // Convert prompt starters from API format to form format
    const promptStarters = personaSuggestions.promptStarters?.map((ps: any) => ({
      id: `ps-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: ps.text,
      icon: ps.icon || '💡'
    })) || [];

    // Auto-assign a unique avatar
    const autoAssignedAvatar = await autoAssignAvatar();

    setFormData(prev => ({
      ...prev,
      name: personaSuggestions.agentName || prev.name,
      description: personaSuggestions.description || prev.description,
      tier: personaSuggestions.tier || prev.tier,
      status: personaSuggestions.status || prev.status,
      priority: personaSuggestions.priority || prev.priority,
      capabilities: personaSuggestions.capabilities || prev.capabilities,
      primaryMission: personaSuggestions.primaryMission || prev.primaryMission,
      valueProposition: personaSuggestions.valueProposition || prev.valueProposition,
      architecturePattern: personaSuggestions.architecturePattern || prev.architecturePattern,
      reasoningMethod: personaSuggestions.reasoningMethod || prev.reasoningMethod,
      communicationTone: personaSuggestions.communicationTone || prev.communicationTone,
      communicationStyle: personaSuggestions.communicationStyle || prev.communicationStyle,
      tools: personaSuggestions.tools || prev.tools,
      knowledgeDomains: personaSuggestions.knowledgeDomains || prev.knowledgeDomains,
      promptStarters: promptStarters.length > 0 ? promptStarters : prev.promptStarters,
      avatar: autoAssignedAvatar, // Auto-assign unique avatar
    }));

    // Close wizard and show main form
    setShowPersonaWizard(false);
    setActiveTab('basic');

    alert('✅ Persona suggestions applied with unique avatar! Review and customize the agent details in all tabs.');
  };

  /**
   * Auto-assign a unique avatar from the avatars table
   * Ensures no avatar is used more than 2 times
   */
  const autoAssignAvatar = async () => {
    try {
      console.log('[Avatar Assignment] Starting auto-assignment...');

      // Fetch all agents to count avatar usage
      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select('avatar');

      if (agentsError) {
        console.error('[Avatar Assignment] Error fetching agents:', agentsError);
        return formData.avatar; // Keep current avatar
      }

      // Count usage of each avatar
      const avatarUsageCount: Record<string, number> = {};
      agents?.forEach(agent => {
        if (agent.avatar) {
          avatarUsageCount[agent.avatar] = (avatarUsageCount[agent.avatar] || 0) + 1;
        }
      });

      console.log('[Avatar Assignment] Avatar usage count:', avatarUsageCount);
      console.log('[Avatar Assignment] Available avatars:', availableAvatars.length);

      // Find avatars used less than 2 times
      const availableForAssignment = availableAvatars.filter(avatar => {
        const usageCount = avatarUsageCount[avatar] || 0;
        return usageCount < 2;
      });

      console.log('[Avatar Assignment] Avatars available for assignment:', availableForAssignment.length);

      if (availableForAssignment.length === 0) {
        console.warn('[Avatar Assignment] All avatars used 2+ times, selecting least used');
        // If all avatars are used 2+ times, select the least used one
        const sortedByUsage = availableAvatars.sort((a, b) => {
          const usageA = avatarUsageCount[a] || 0;
          const usageB = avatarUsageCount[b] || 0;
          return usageA - usageB;
        });
        return sortedByUsage[0] || formData.avatar;
      }

      // Randomly select from available avatars
      const randomIndex = Math.floor(Math.random() * availableForAssignment.length);
      const selectedAvatar = availableForAssignment[randomIndex];

      console.log('[Avatar Assignment] Selected avatar:', selectedAvatar);
      return selectedAvatar;

    } catch (error) {
      console.error('[Avatar Assignment] Error:', error);
      return formData.avatar; // Keep current avatar on error
    }
  };

  // Helper component for wizard step indicator
  const StepIndicator = ({ step, active, completed, label }: { step: number; active: boolean; completed: boolean; label: string }) => (
    <div className="flex flex-col items-center">
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
        active ? "bg-market-purple text-white" : completed ? "bg-green-500 text-white" : "bg-neutral-200 text-neutral-600"
      )}>
        {completed ? <Check className="h-5 w-5" /> : step}
      </div>
      <span className="text-xs mt-1 text-neutral-600">{label}</span>
    </div>
  );

  // Handlers for persona wizard
  const handleBusinessFunctionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      businessFunction: e.target.value,
      department: '',
      role: ''
    }));
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      department: e.target.value,
      role: ''
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-canvas-surface rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-market-purple/10 to-innovation-orange/10 rounded-lg flex items-center justify-center">
              <Star className="h-5 w-5 text-market-purple" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-deep-charcoal">
                {editingAgent ? 'Edit AI Agent' : 'Create Custom AI Agent'}
              </h2>
              <p className="text-sm text-medical-gray">
                {editingAgent ? 'Modify your specialized AI expert' : 'Design a specialized AI expert for your unique needs'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editingAgent && !showPersonaWizard && (
              <Button
                variant="outline"
                onClick={() => setShowPersonaWizard(true)}
                className="flex items-center gap-2 border-market-purple text-market-purple hover:bg-market-purple/10"
              >
                <Zap className="h-4 w-4" />
                Use AI Designer
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Persona Wizard - shown instead of main content when active */}
        {showPersonaWizard ? (
          <div className="flex-1 overflow-y-auto p-6">
            {/* Step Indicator */}
            <div className="max-w-3xl mx-auto mb-6">
              <div className="flex items-center justify-between">
                <StepIndicator step={1} active={personaWizardStep === 'organization'} completed={personaWizardStep !== 'organization'} label="Organization" />
                <div className="flex-1 h-0.5 bg-neutral-200 mx-2" />
                <StepIndicator step={2} active={personaWizardStep === 'intent'} completed={personaWizardStep === 'suggestions'} label="Intent" />
                <div className="flex-1 h-0.5 bg-neutral-200 mx-2" />
                <StepIndicator step={3} active={personaWizardStep === 'suggestions'} label="Review" />
              </div>
            </div>

            {/* Step 1: Organization Selection */}
            {personaWizardStep === 'organization' && (
              <Card className="max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle>Select Organizational Context</CardTitle>
                  <p className="text-sm text-medical-gray">Choose the business function, department, and role for this agent</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Business Function Dropdown */}
                  <div>
                    <Label>Business Function *</Label>
                    <select
                      value={formData.businessFunction}
                      onChange={handleBusinessFunctionChange}
                      disabled={loadingMedicalData}
                      className="w-full p-3 border rounded-lg disabled:bg-neutral-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {loadingMedicalData ? 'Loading...' : 'Select Business Function'}
                      </option>
                      {businessFunctions.map((bf, index) => (
                        <option key={bf.id ? `bf-${bf.id}` : `bf-${index}-${bf.name || index}`} value={bf.id}>
                          {bf.name || bf.department_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Department Dropdown (filtered by function) */}
                  <div>
                    <Label>Department *</Label>
                    <select
                      value={formData.department}
                      onChange={handleDepartmentChange}
                      className="w-full p-3 border rounded-lg disabled:bg-neutral-100 disabled:cursor-not-allowed"
                      disabled={!formData.businessFunction || loadingMedicalData}
                    >
                      <option value="">
                        {!formData.businessFunction
                          ? 'Select Business Function first'
                          : availableDepartments.length === 0
                          ? 'No departments available'
                          : 'Select Department'}
                      </option>
                      {availableDepartments.map((dept, index) => (
                        <option key={dept.id ? `dept-${dept.id}` : `dept-${index}-${dept.name || dept.department_name || index}`} value={dept.id}>
                          {dept.name || dept.department_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Role Dropdown (filtered by department) */}
                  <div>
                    <Label>Role *</Label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({...prev, role: e.target.value}))}
                      className="w-full p-3 border rounded-lg disabled:bg-neutral-100 disabled:cursor-not-allowed"
                      disabled={!formData.department || loadingMedicalData}
                    >
                      <option value="">
                        {!formData.businessFunction
                          ? 'Select Business Function first'
                          : !formData.department
                          ? 'Select Department first'
                          : availableRoles.length === 0
                          ? 'No roles available'
                          : 'Select Role'}
                      </option>
                      {availableRoles.map((role, index) => (
                        <option key={role.id ? `role-${role.id}` : `role-${index}-${role.name || role.role_name || index}`} value={role.id}>
                          {role.name || role.role_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => {
                      setShowPersonaWizard(false);
                      setPersonaWizardStep('organization');
                      setPersonaIntent('');
                      setPersonaSuggestions(null);
                    }}>Cancel</Button>
                    <Button
                      onClick={() => setPersonaWizardStep('intent')}
                      disabled={!formData.businessFunction || !formData.department || !formData.role}
                    >
                      Next: Describe Intent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Intent Description */}
            {personaWizardStep === 'intent' && (
              <Card className="max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle>Describe the Agent&apos;s Purpose</CardTitle>
                  <p className="text-sm text-medical-gray">What should this agent do? Be specific about tasks, goals, and responsibilities.</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Agent Intent *</Label>
                    <textarea
                      value={personaIntent}
                      onChange={(e) => setPersonaIntent(e.target.value)}
                      placeholder="Example: I need an agent that can design phase II-IV clinical trial protocols, ensuring compliance with FDA and ICH-GCP guidelines, and providing evidence-based recommendations for endpoint selection..."
                      className="w-full min-h-[200px] p-3 border rounded-lg focus:ring-2 focus:ring-market-purple"
                    />
                    <p className="text-xs text-medical-gray mt-2">
                      Tip: Include specific tasks, compliance requirements, and desired outcomes
                    </p>
                  </div>

                  {/* Context Display */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-deep-charcoal mb-2">Selected Context:</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Function:</strong> {formData.businessFunction}</p>
                      <p><strong>Department:</strong> {formData.department}</p>
                      <p><strong>Role:</strong> {formData.role}</p>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setPersonaWizardStep('organization')}>Back</Button>
                    <Button
                      onClick={generatePersonaSuggestions}
                      disabled={!personaIntent.trim() || isGeneratingPersona}
                    >
                      {isGeneratingPersona ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>Generate Agent Persona</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Suggestions Review */}
            {personaWizardStep === 'suggestions' && personaSuggestions && (
              <div className="max-w-4xl mx-auto space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>AI-Generated Persona Suggestions</CardTitle>
                    <p className="text-sm text-medical-gray">Review and customize the suggested agent profile</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Agent Name & Description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Agent Name</Label>
                        <input
                          type="text"
                          value={personaSuggestions.agentName || ''}
                          onChange={(e) => setPersonaSuggestions({...personaSuggestions, agentName: e.target.value})}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <Label>Agent Level</Label>
                        <select
                          value={personaSuggestions.agent_level_id || '5a3647eb-a2bd-43f2-9c8b-6413d39ed0fb'}
                          onChange={(e) => setPersonaSuggestions({...personaSuggestions, agent_level_id: e.target.value})}
                          className="w-full p-2 border rounded-lg"
                        >
                          <option value="5e27905e-6f58-462e-93a4-6fad5388ebaf">Master - Top-level orchestrator</option>
                          <option value="a6e394b0-6ca1-4cb1-8097-719523ee6782">Expert - Deep domain specialist</option>
                          <option value="5a3647eb-a2bd-43f2-9c8b-6413d39ed0fb">Specialist - Focused sub-domain expert</option>
                          <option value="c6f7eec5-3fc5-4f10-b030-bce0d22480e8">Worker - Task execution agent</option>
                          <option value="45420d67-67bf-44cf-a842-44bbaf3145e7">Tool - API/Tool wrapper</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <textarea
                        value={personaSuggestions.description || ''}
                        onChange={(e) => setPersonaSuggestions({...personaSuggestions, description: e.target.value})}
                        className="w-full min-h-[80px] p-2 border rounded-lg"
                      />
                    </div>

                    {/* Capabilities */}
                    <div>
                      <Label>Capabilities ({personaSuggestions.capabilities?.length || 0})</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {personaSuggestions.capabilities?.map((cap: string, i: number) => (
                          <span
                            key={i}
                            className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                          >
                            {cap}
                            <button
                              onClick={() => setPersonaSuggestions({
                                ...personaSuggestions,
                                capabilities: personaSuggestions.capabilities.filter((_: any, idx: number) => idx !== i)
                              })}
                              className="hover:text-purple-900"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Mission & Value */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Primary Mission</Label>
                        <textarea
                          value={personaSuggestions.primaryMission || ''}
                          onChange={(e) => setPersonaSuggestions({...personaSuggestions, primaryMission: e.target.value})}
                          className="w-full min-h-[60px] p-2 border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <Label>Value Proposition</Label>
                        <textarea
                          value={personaSuggestions.valueProposition || ''}
                          onChange={(e) => setPersonaSuggestions({...personaSuggestions, valueProposition: e.target.value})}
                          className="w-full min-h-[60px] p-2 border rounded-lg text-sm"
                        />
                      </div>
                    </div>

                    {/* AI Reasoning */}
                    {personaSuggestions.reasoning && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-deep-charcoal mb-2 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-blue-600" />
                          AI Reasoning:
                        </h4>
                        <p className="text-sm text-medical-gray">{personaSuggestions.reasoning}</p>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setPersonaWizardStep('intent');
                          setPersonaSuggestions(null);
                        }}
                      >
                        Regenerate
                      </Button>
                      <Button
                        onClick={applyPersonaSuggestions}
                        className="bg-market-purple text-white"
                      >
                        Apply & Continue Editing
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ) : (
          /* Original Main Content with Sidebar */
          <>
        {/* Main Content with Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Vertical Tabs Sidebar */}
          <div className="w-56 border-r border-neutral-200 bg-neutral-50 overflow-y-auto flex-shrink-0">
            <nav className="flex flex-col p-3 space-y-1" aria-label="Form sections">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={cn(
                "py-2.5 px-3 rounded-lg font-medium text-sm transition-all flex items-center gap-2.5 text-left",
                activeTab === 'basic'
                  ? "bg-market-purple text-white shadow-sm"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <User className="h-4 w-4 flex-shrink-0" />
              <span>Basic Info</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('organization')}
              className={cn(
                "py-2.5 px-3 rounded-lg font-medium text-sm transition-all flex items-center gap-2.5 text-left",
                activeTab === 'organization'
                  ? "bg-market-purple text-white shadow-sm"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span>Organization</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('capabilities')}
              className={cn(
                "py-2.5 px-3 rounded-lg font-medium text-sm transition-all flex items-center gap-2.5 text-left",
                activeTab === 'capabilities'
                  ? "bg-market-purple text-white shadow-sm"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <Zap className="h-4 w-4 flex-shrink-0" />
              <span>Capabilities</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('prompts')}
              className={cn(
                "py-2.5 px-3 rounded-lg font-medium text-sm transition-all flex items-center gap-2.5 text-left",
                activeTab === 'prompts'
                  ? "bg-market-purple text-white shadow-sm"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <MessageSquare className="h-4 w-4 flex-shrink-0" />
              <span>Prompt Starters</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('knowledge')}
              className={cn(
                "py-2.5 px-3 rounded-lg font-medium text-sm transition-all flex items-center gap-2.5 text-left",
                activeTab === 'knowledge'
                  ? "bg-market-purple text-white shadow-sm"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <BookOpen className="h-4 w-4 flex-shrink-0" />
              <span>Knowledge</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tools')}
              className={cn(
                "py-2.5 px-3 rounded-lg font-medium text-sm transition-all flex items-center gap-2.5 text-left",
                activeTab === 'tools'
                  ? "bg-market-purple text-white shadow-sm"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <Wrench className="h-4 w-4 flex-shrink-0" />
              <span>Tools</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('models')}
              className={cn(
                "py-2.5 px-3 rounded-lg font-medium text-sm transition-all flex items-center gap-2.5 text-left",
                activeTab === 'models'
                  ? "bg-market-purple text-white shadow-sm"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <Cpu className="h-4 w-4 flex-shrink-0" />
              <span>Models</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reasoning')}
              className={cn(
                "py-2.5 px-3 rounded-lg font-medium text-sm transition-all flex items-center gap-2.5 text-left",
                activeTab === 'reasoning'
                  ? "bg-market-purple text-white shadow-sm"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <Brain className="h-4 w-4 flex-shrink-0" />
              <span>Reasoning</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('safety')}
              className={cn(
                "py-2.5 px-3 rounded-lg font-medium text-sm transition-all flex items-center gap-2.5 text-left",
                activeTab === 'safety'
                  ? "bg-market-purple text-white shadow-sm"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>Safety</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('generate')}
              className={cn(
                "py-2.5 px-3 rounded-lg font-medium text-sm transition-all flex items-center gap-2.5 text-left",
                activeTab === 'generate'
                  ? "bg-market-purple text-white shadow-sm"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <Sparkles className="h-4 w-4 flex-shrink-0" />
              <span>Generate</span>
            </button>
          </nav>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-6 max-w-5xl mx-auto">
            {/* Form */}
            <div className="space-y-6">
              {/* Basic Info */}
              {activeTab === 'basic' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Agent Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Medical Writer"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="avatar">Avatar</Label>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center justify-center w-16 h-16 border-2 border-neutral-200 rounded-lg bg-neutral-50">
                          <AgentAvatar
                            avatar={formData.avatar}
                            name="Selected Avatar"
                            size="lg"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowIconModal(true)}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Choose Icon
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                              const newAvatar = await autoAssignAvatar();
                              setFormData(prev => ({ ...prev, avatar: newAvatar }));
                            }}
                            className="flex items-center gap-2 text-xs"
                          >
                            <Sparkles className="h-3 w-3" />
                            Auto-Assign
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Agent Classification */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <div>
                      <Label htmlFor="agent_level_id">Agent Level *</Label>
                      <select
                        id="agent_level_id"
                        value={formData.agent_level_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, agent_level_id: e.target.value }))}
                        className="w-full p-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-market-purple"
                      >
                        <option value="5e27905e-6f58-462e-93a4-6fad5388ebaf">Master - Top-level orchestrator</option>
                        <option value="a6e394b0-6ca1-4cb1-8097-719523ee6782">Expert - Deep domain specialist</option>
                        <option value="5a3647eb-a2bd-43f2-9c8b-6413d39ed0fb">Specialist - Focused sub-domain expert</option>
                        <option value="c6f7eec5-3fc5-4f10-b030-bce0d22480e8">Worker - Task execution agent</option>
                        <option value="45420d67-67bf-44cf-a842-44bbaf3145e7">Tool - API/Tool wrapper</option>
                      </select>
                      <p className="text-xs text-neutral-500 mt-1">
                        {formData.agent_level_id === '5e27905e-6f58-462e-93a4-6fad5388ebaf' && 'Manages entire domains or functions'}
                        {formData.agent_level_id === 'a6e394b0-6ca1-4cb1-8097-719523ee6782' && 'Advanced analytical capabilities'}
                        {formData.agent_level_id === '5a3647eb-a2bd-43f2-9c8b-6413d39ed0fb' && 'Specific sub-domain or technical tasks'}
                        {formData.agent_level_id === 'c6f7eec5-3fc5-4f10-b030-bce0d22480e8' && 'Routine, repeatable work'}
                        {formData.agent_level_id === '45420d67-67bf-44cf-a842-44bbaf3145e7' && 'Wraps specific tools or APIs'}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="status">Status *</Label>
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as typeof formData.status }))}
                        className="w-full p-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-market-purple"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="testing">Testing</option>
                        <option value="development">Development</option>
                        <option value="deprecated">Deprecated</option>
                      </select>
                      <p className="text-xs text-neutral-500 mt-1">
                        {formData.status === 'active' && 'Ready for production use'}
                        {formData.status === 'inactive' && 'Not currently available'}
                        {formData.status === 'testing' && 'Under quality assurance'}
                        {formData.status === 'development' && 'Still being built'}
                        {formData.status === 'deprecated' && 'No longer supported'}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Input
                        id="priority"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                        placeholder="1-10"
                        className="w-full"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        Display priority (1-10, higher = more prominent)
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the agent's expertise"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="systemPrompt">System Prompt *</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPromptViewMode('preview')}
                          className={cn(
                            "h-8 px-3 text-xs",
                            promptViewMode === 'preview' && "bg-progress-teal/10 text-progress-teal"
                          )}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPromptViewMode('edit')}
                          className={cn(
                            "h-8 px-3 text-xs",
                            promptViewMode === 'edit' && "bg-progress-teal/10 text-progress-teal"
                          )}
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>

                    {promptViewMode === 'edit' ? (
                      <textarea
                        id="systemPrompt"
                        value={formData.systemPrompt}
                        onChange={(e) => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
                        placeholder="Define the agent's role, expertise, and behavior..."
                        className="w-full min-h-[400px] p-3 border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-market-purple font-mono text-sm"
                        required
                      />
                    ) : (
                      <div className="w-full min-h-[400px] max-h-[600px] overflow-y-auto p-4 border border-neutral-200 rounded-lg bg-neutral-50 prose prose-sm max-w-none prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-p:text-neutral-700 prose-li:text-neutral-700 prose-strong:text-neutral-900 prose-code:text-progress-teal prose-code:bg-progress-teal/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-neutral-900 prose-pre:text-neutral-100">
                        <ReactMarkdown>
                          {formData.systemPrompt || '*No system prompt defined*'}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              )}

              {/* Organization */}
              {activeTab === 'organization' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Organization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="businessFunction">Business Function</Label>
                    {activeTab === 'organization' && console.log('[Agent Creator Render] businessFunctions:', businessFunctions.length, 'loading:', loadingMedicalData)}
                    <select
                      id="businessFunction"
                      value={formData.businessFunction}
                      onChange={(e) => {
                        console.log('[Agent Creator] Business Function changed to:', e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          businessFunction: e.target.value,
                          department: '', // Reset department when function changes
                          role: '' // Reset role when function changes
                        }));
                      }}
                      disabled={loadingMedicalData}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-progress-teal disabled:bg-neutral-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {loadingMedicalData ? 'Loading...' : `Select Business Function (${businessFunctions.length} available)`}
                      </option>
                      {businessFunctions.map((bf, index) => (
                        <option key={bf.id ? `bf-${bf.id}` : `bf-${index}-${bf.name || index}`} value={bf.id}>
                          {bf.name || bf.department_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <select
                      id="department"
                      value={formData.department}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          department: e.target.value,
                          role: '' // Reset role when department changes
                        }));
                      }}
                      disabled={!formData.businessFunction}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">
                        {!formData.businessFunction
                          ? 'Select Business Function first'
                          : availableDepartments.length === 0
                          ? 'Not available'
                          : 'Select Department...'}
                      </option>
                      {availableDepartments.map((dept, index) => (
                        <option key={dept.id ? `dept-${dept.id}` : `dept-${index}-${dept.name || dept.department_name || index}`} value={dept.id}>
                          {dept.name || dept.department_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      disabled={!formData.businessFunction || (!formData.department && businessFunctions.length === 0)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!formData.businessFunction
                          ? 'Select Business Function first'
                          : !formData.department && businessFunctions.length === 0
                          ? 'Select Department first'
                          : 'Select Role'}
                      </option>
                      {loadingMedicalData ? (
                        <option disabled>Loading...</option>
                      ) : healthcareRoles.length > 0 ? (
                        // Database data available - show filtered roles or message
                        availableRoles.length > 0 ? (
                          availableRoles.map((role, index) => (
                            <option key={role.id ? `role-${role.id}` : `role-${index}-${role.name || role.role_name || index}`} value={role.id}>
                              {role.name || role.role_name}
                              {role.level ? ` - ${role.level}` : ''}
                            </option>
                          ))
                        ) : formData.department ? (
                          <option disabled>No roles available for this department</option>
                        ) : null
                      ) : formData.businessFunction && formData.department ? (
                        // Fallback: Static data - show roles for selected department
                        (() => {
                          const selectedStaticFunction = staticBusinessFunctions.find(bf =>
                            bf.value === formData.businessFunction || bf.label === formData.businessFunction
                          );
                          const functionKey = selectedStaticFunction?.value || '';
                          const rolesForDepartment = staticRolesByDepartment[functionKey]?.[formData.department] || [];

                          return rolesForDepartment.length > 0 ? (
                            rolesForDepartment.map(role => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))
                          ) : (
                            <option disabled>No roles available for this department</option>
                          );
                        })()
                      ) : null}
                    </select>
                    <p className="text-xs text-neutral-500 mt-1">
                      {formData.department
                        ? `Showing roles for ${formData.department}`
                        : 'Select a department to see available roles'}
                    </p>
                  </div>
                </CardContent>
              </Card>
              )}

              {/* Capabilities */}
              {activeTab === 'capabilities' && (
                <CapabilitiesTab
                  formData={formData}
                  newCapability={newCapability}
                  predefinedCapabilities={predefinedCapabilities}
                  setNewCapability={setNewCapability}
                  setFormData={setFormData}
                  handleCapabilityAdd={handleCapabilityAdd}
                  handleCapabilityRemove={handleCapabilityRemove}
                />
              )}

              {/* Prompt Starters */}
              {activeTab === 'prompts' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span>Prompt Starters</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-medical-gray">
                      Create conversation starters that help users interact with this agent
                    </p>
                    <Button
                      type="button"
                      onClick={addPromptStarter}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Prompt
                    </Button>
                  </div>

                  {formData.promptStarters.length > 0 && (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {formData.promptStarters.map((prompt, index) => (
                        <Card key={prompt.id} className="relative border border-neutral-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-medium">Prompt Starter {index + 1}</CardTitle>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1 text-red-500 hover:text-red-700"
                                onClick={() => removePromptStarter(prompt.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor={`prompt-title-${prompt.id}`}>Title</Label>
                                <Input
                                  id={`prompt-title-${prompt.id}`}
                                  value={prompt.title}
                                  onChange={(e) => updatePromptStarter(prompt.id, 'title', e.target.value)}
                                  placeholder="e.g., 510(k) vs PMA requirements"
                                  className="text-sm"
                                />
                              </div>

                              <div>
                                <Label htmlFor={`prompt-description-${prompt.id}`}>Description</Label>
                                <Input
                                  id={`prompt-description-${prompt.id}`}
                                  value={prompt.description}
                                  onChange={(e) => updatePromptStarter(prompt.id, 'description', e.target.value)}
                                  placeholder="Brief description"
                                  className="text-sm"
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor={`prompt-text-${prompt.id}`}>Actual Prompt</Label>
                              <textarea
                                id={`prompt-text-${prompt.id}`}
                                value={prompt.prompt}
                                onChange={(e) => updatePromptStarter(prompt.id, 'prompt', e.target.value)}
                                placeholder="The prompt that will be sent to the AI"
                                className="w-full min-h-[60px] p-2 border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-market-purple text-sm"
                                rows={2}
                              />
                            </div>

                            <div>
                              <Label>Icon</Label>
                              <div className="flex items-center gap-3 mt-2">
                                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center border">
                                  {prompt.iconUrl ? (
                                    prompt.iconUrl.startsWith('http') || prompt.iconUrl.startsWith('/') ? (
                                      <Image
                                        src={prompt.iconUrl}
                                        alt="Selected icon"
                                        width={20}
                                        height={20}
                                        className="w-5 h-5"
                                      />
                                    ) : (
                                      <span className="text-lg">{prompt.iconUrl}</span>
                                    )
                                  ) : (
                                    <MessageSquare className="w-5 h-5 text-neutral-400" />
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingPromptId(prompt.id);
                                    setShowPromptIconModal(true);
                                  }}
                                  className="text-sm"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Choose Icon
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {formData.promptStarters.length === 0 && (
                    <div className="text-center py-6 text-medical-gray text-sm">
                      No prompt starters created yet. Add one to help users get started with this agent.
                    </div>
                  )}
                </CardContent>
              </Card>
              )}

              {/* Knowledge Base / RAG */}
              {activeTab === 'knowledge' && (
                <KnowledgeTab
                  formData={formData}
                  newKnowledgeUrl={newKnowledgeUrl}
                  isProcessingKnowledge={isProcessingKnowledge}
                  knowledgeProcessingStatus={knowledgeProcessingStatus}
                  knowledgeDomains={knowledgeDomains}
                  loadingDomains={loadingDomains}
                  setNewKnowledgeUrl={setNewKnowledgeUrl}
                  setFormData={setFormData}
                  handleKnowledgeUrlAdd={handleKnowledgeUrlAdd}
                  handleKnowledgeUrlRemove={handleKnowledgeUrlRemove}
                  handleFileUpload={handleFileUpload}
                  handleFileRemove={handleFileRemove}
                  processKnowledgeSources={processKnowledgeSources}
                  handleKnowledgeDomainToggle={handleKnowledgeDomainToggle}
                />
              )}

              {/* Tools & Integrations */}
              {activeTab === 'tools' && (
                <ToolsTab
                  formData={formData}
                  availableToolsFromDB={availableToolsFromDB}
                  loadingTools={loadingTools}
                  handleToolToggle={handleToolToggle}
                />
              )}

              {/* Advanced Settings */}
              {activeTab === 'models' && (
              <>
              {/* Recommended Models based on Knowledge Domains */}
              {recommendedModels.chat && (
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                      <Lightbulb className="h-4 w-4" />
                      Recommended Models for Selected Domains
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-canvas-surface rounded-lg border border-green-200">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-neutral-700 mb-1">Recommended Chat Model</p>
                        <code className="text-sm bg-green-100 px-3 py-1 rounded">{recommendedModels.chat}</code>
                        <p className="text-xs text-neutral-600 mt-2">
                          Based on your selected knowledge domains (prioritizing Tier 1 domains)
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setFormData(prev => ({ ...prev, model: recommendedModels.chat! }))}
                      >
                        Use This
                      </Button>
                    </div>
                    {recommendedModels.embedding && (
                      <div className="flex items-start gap-3 p-3 bg-canvas-surface rounded-lg border border-green-200">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-neutral-700 mb-1">Recommended Embedding Model</p>
                          <code className="text-sm bg-green-100 px-3 py-1 rounded">{recommendedModels.embedding}</code>
                          <p className="text-xs text-neutral-600 mt-2">
                            For RAG knowledge base embeddings and document search
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Auto-applied for RAG
                        </Badge>
                      </div>
                    )}
                    <p className="text-xs text-neutral-500 italic">
                      💡 These models are optimized for the knowledge domains you selected
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Advanced Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="model">
                        AI Model
                        {loadingModels && <span className="ml-2 text-xs text-medical-gray">(Loading...)</span>}
                        {recommendedModels.chat && (
                          <Badge className="ml-2 bg-green-500 text-xs">
                            ⭐ {recommendedModels.chat} recommended
                          </Badge>
                        )}
                      </Label>
                      <select
                        id="model"
                        value={formData.model}
                        onChange={(e) => {
                          const selectedModel = modelOptions.find((m: any) => m.id === e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            model: e.target.value,
                            // Auto-update max tokens if model has a specific limit
                            maxTokens: selectedModel?.maxTokens || prev.maxTokens
                          }));
                          // Calculate fitness score for the selected model
                          calculateModelFitness(e.target.value);
                        }}
                        disabled={loadingModels}
                        className="w-full p-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-market-purple disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingModels ? (
                          <option>Loading available models...</option>
                        ) : (
                          modelOptions.map((model) => (
                            <option key={model.id} value={model.id}>
                              {model.name} - {model.description}
                              {recommendedModels.chat === model.id ? ' ⭐ RECOMMENDED' : ''}
                            </option>
                          ))
                        )}
                      </select>
                      {!loadingModels && modelOptions.length > 0 && (
                        <p className="text-xs text-medical-gray mt-1">
                          {modelOptions.length} model{modelOptions.length !== 1 ? 's' : ''} available
                        </p>
                      )}

                      {/* Model Fitness Score Display */}
                      {modelFitnessScore && (
                        <div className="mt-3 p-3 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-neutral-700">Model Fitness Score</span>
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "px-2 py-1 rounded-full text-xs font-bold",
                                modelFitnessScore.recommendation === 'excellent' && "bg-green-100 text-green-800",
                                modelFitnessScore.recommendation === 'good' && "bg-blue-100 text-blue-800",
                                modelFitnessScore.recommendation === 'acceptable' && "bg-yellow-100 text-yellow-800",
                                modelFitnessScore.recommendation === 'poor' && "bg-orange-100 text-orange-800",
                                modelFitnessScore.recommendation === 'not_recommended' && "bg-red-100 text-red-800"
                              )}>
                                {modelFitnessScore.overall}/100
                              </div>
                              {modelFitnessScore.recommendation === 'excellent' && <span className="text-green-600">⭐️ Excellent</span>}
                              {modelFitnessScore.recommendation === 'good' && <span className="text-blue-600">✓ Good</span>}
                              {modelFitnessScore.recommendation === 'acceptable' && <span className="text-yellow-600">○ Acceptable</span>}
                              {modelFitnessScore.recommendation === 'poor' && <span className="text-orange-600">△ Poor</span>}
                              {modelFitnessScore.recommendation === 'not_recommended' && <span className="text-red-600">✕ Not Recommended</span>}
                            </div>
                          </div>

                          {/* Progress bars for breakdown */}
                          <div className="space-y-1.5 mt-2">
                            {Object.entries({
                              'Role Match': modelFitnessScore.breakdown.roleMatch,
                              'Capabilities': modelFitnessScore.breakdown.capabilityMatch,
                              'Performance': modelFitnessScore.breakdown.performanceMatch,
                              'Cost': modelFitnessScore.breakdown.costEfficiency,
                              'Context Size': modelFitnessScore.breakdown.contextSizeMatch,
                              'Compliance': modelFitnessScore.breakdown.complianceMatch,
                            }).map(([label, score]) => (
                              <div key={label} className="flex items-center gap-2">
                                <span className="text-xs text-neutral-600 w-24">{label}:</span>
                                <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-full rounded-full transition-all",
                                      score >= 80 ? "bg-green-500" :
                                      score >= 60 ? "bg-blue-500" :
                                      score >= 40 ? "bg-yellow-500" : "bg-red-500"
                                    )}
                                    style={{ width: `${score}%` }}
                                  />
                                </div>
                                <span className="text-xs text-neutral-500 w-8 text-right">{score}</span>
                              </div>
                            ))}
                          </div>

                          {/* Reasoning */}
                          <p className="text-xs text-neutral-600 mt-2 italic">{modelFitnessScore.reasoning}</p>

                          {/* Strengths and Weaknesses */}
                          {(modelFitnessScore.strengths.length > 0 || modelFitnessScore.weaknesses.length > 0) && (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              {modelFitnessScore.strengths.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-green-700 mb-1">Strengths:</p>
                                  <ul className="text-xs text-green-600 space-y-0.5">
                                    {modelFitnessScore.strengths.slice(0, 3).map((strength, i) => (
                                      <li key={i}>• {strength}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {modelFitnessScore.weaknesses.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-orange-700 mb-1">Considerations:</p>
                                  <ul className="text-xs text-orange-600 space-y-0.5">
                                    {modelFitnessScore.weaknesses.slice(0, 3).map((weakness, i) => (
                                      <li key={i}>• {weakness}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Alternative Suggestions */}
                          {modelFitnessScore.alternativeSuggestions && modelFitnessScore.alternativeSuggestions.length > 0 && (
                            <div className="mt-2 p-2 bg-canvas-surface rounded border border-neutral-200">
                              <p className="text-xs font-semibold text-neutral-700 mb-1">💡 Better Alternatives:</p>
                              <ul className="text-xs text-blue-600 space-y-0.5">
                                {modelFitnessScore.alternativeSuggestions.map((suggestion, i) => (
                                  <li key={i}>• {suggestion}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="temperature">
                        Temperature: {formData.temperature}
                      </Label>
                      <input
                        type="range"
                        id="temperature"
                        min="0"
                        max="1"
                        step="0.1"
                        value={formData.temperature}
                        onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                        className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-medical-gray mt-1">
                        <span>Focused</span>
                        <span>Creative</span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="maxTokens">Max Tokens</Label>
                      <Input
                        type="number"
                        id="maxTokens"
                        value={formData.maxTokens}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                        min="100"
                        max="4000"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              </>
              )}

              {/* Reasoning & Intelligence Tab */}
              {activeTab === 'reasoning' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="h-4 w-4 flex-shrink-0" />
                      <span>Architecture & Reasoning</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="architecturePattern">Architecture Pattern *</Label>
                        <select
                          id="architecturePattern"
                          value={formData.architecturePattern || 'REACTIVE'}
                          onChange={(e) => setFormData(prev => ({ ...prev, architecturePattern: e.target.value }))}
                          className="w-full p-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-market-purple"
                          required
                        >
                          <option value="REACTIVE">Reactive (Tier 1) - Simple stimulus-response</option>
                          <option value="HYBRID">Hybrid (Tier 2) - Mix of reactive and deliberative</option>
                          <option value="DELIBERATIVE">Deliberative (Tier 3) - Complex reasoning</option>
                          <option value="MULTI_AGENT">Multi-Agent - Coordinated specialists</option>
                        </select>
                        <p className="text-xs text-medical-gray mt-1">
                          Defines how the agent processes information
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="reasoningMethod">Reasoning Method *</Label>
                        <select
                          id="reasoningMethod"
                          value={formData.reasoningMethod || 'DIRECT'}
                          onChange={(e) => setFormData(prev => ({ ...prev, reasoningMethod: e.target.value }))}
                          className="w-full p-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-market-purple"
                          required
                        >
                          <option value="DIRECT">Direct (Tier 1) - Immediate answers</option>
                          <option value="COT">Chain of Thought (Tier 2) - Step-by-step</option>
                          <option value="REACT">ReAct (Tier 3) - Reasoning + Acting loop</option>
                          <option value="HYBRID">Hybrid - Multiple methods</option>
                          <option value="MULTI_PATH">Multi-Path - Parallel reasoning</option>
                        </select>
                        <p className="text-xs text-medical-gray mt-1">
                          Primary reasoning approach
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="communicationTone">Communication Tone</Label>
                        <Input
                          id="communicationTone"
                          value={formData.communicationTone || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, communicationTone: e.target.value }))}
                          placeholder="e.g., Professional and empathetic"
                        />
                      </div>

                      <div>
                        <Label htmlFor="communicationStyle">Communication Style</Label>
                        <Input
                          id="communicationStyle"
                          value={formData.communicationStyle || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, communicationStyle: e.target.value }))}
                          placeholder="e.g., Structured, analytical"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="complexityLevel">Complexity Level</Label>
                      <Input
                        id="complexityLevel"
                        value={formData.complexityLevel || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, complexityLevel: e.target.value }))}
                        placeholder="e.g., Expert-level medical terminology"
                      />
                      <p className="text-xs text-medical-gray mt-1">
                        Target audience complexity
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="primaryMission">Primary Mission</Label>
                      <textarea
                        id="primaryMission"
                        value={formData.primaryMission || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryMission: e.target.value }))}
                        placeholder="Core mission statement for this agent"
                        className="w-full min-h-[80px] p-3 border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-market-purple text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="valueProposition">Value Proposition</Label>
                      <textarea
                        id="valueProposition"
                        value={formData.valueProposition || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, valueProposition: e.target.value }))}
                        placeholder="What unique value does this agent provide?"
                        className="w-full min-h-[80px] p-3 border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-market-purple text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Safety & Compliance Tab */}
              {activeTab === 'safety' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span>Enhanced Safety & Compliance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> These fields define safety rules, prohibitions, and escalation triggers that will be enforced in the agent's system prompt.
                      </p>
                    </div>

                    {/* Medical Compliance & Capabilities */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Zap className="h-4 w-4 flex-shrink-0" />
                          <span>Medical Compliance & Capabilities</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Medical Specialty and FDA Classification */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="medicalSpecialty">Medical Specialty</Label>
                            <select
                              id="medicalSpecialty"
                              value={formData.medicalSpecialty}
                              onChange={(e) => setFormData(prev => ({ ...prev, medicalSpecialty: e.target.value }))}
                              className="w-full p-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-market-purple"
                            >
                              <option value="">Select Medical Specialty</option>
                              <option value="Regulatory Affairs">Regulatory Affairs</option>
                              <option value="Clinical Research">Clinical Research</option>
                              <option value="Medical Writing">Medical Writing</option>
                              <option value="Pharmacovigilance">Pharmacovigilance</option>
                              <option value="Medical Affairs">Medical Affairs</option>
                              <option value="Quality Assurance">Quality Assurance</option>
                              <option value="Biostatistics">Biostatistics</option>
                              <option value="Health Economics">Health Economics</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="fdaSamdClass">FDA SaMD Classification</Label>
                            <select
                              id="fdaSamdClass"
                              value={formData.fdaSamdClass}
                              onChange={(e) => setFormData(prev => ({ ...prev, fdaSamdClass: e.target.value }))}
                              className="w-full p-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-market-purple"
                            >
                              <option value="">Select FDA SaMD Class</option>
                              <option value="I">Class I - Low Risk</option>
                              <option value="IIa">Class IIa - Moderate Risk</option>
                              <option value="IIb">Class IIb - Moderate Risk</option>
                              <option value="III">Class III - High Risk</option>
                              <option value="N/A">Not Applicable</option>
                            </select>
                          </div>
                        </div>

                        {/* Compliance Toggles */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="hipaaCompliant"
                              checked={formData.hipaaCompliant}
                              onChange={(e) => setFormData(prev => ({ ...prev, hipaaCompliant: e.target.checked }))}
                              className="rounded border-neutral-300 text-market-purple focus:ring-market-purple"
                            />
                            <Label htmlFor="hipaaCompliant" className="text-sm font-medium">
                              HIPAA Compliant
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="pharmaEnabled"
                              checked={formData.pharmaEnabled}
                              onChange={(e) => setFormData(prev => ({ ...prev, pharmaEnabled: e.target.checked }))}
                              className="rounded border-neutral-300 text-market-purple focus:ring-market-purple"
                            />
                            <Label htmlFor="pharmaEnabled" className="text-sm font-medium">
                              PHARMA Protocol
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="verifyEnabled"
                              checked={formData.verifyEnabled}
                              onChange={(e) => setFormData(prev => ({ ...prev, verifyEnabled: e.target.checked }))}
                              className="rounded border-neutral-300 text-market-purple focus:ring-market-purple"
                            />
                            <Label htmlFor="verifyEnabled" className="text-sm font-medium">
                              VERIFY Protocol
                            </Label>
                          </div>
                        </div>

                        {/* Medical Accuracy Threshold */}
                        <div>
                          <Label htmlFor="accuracyThreshold">
                            Medical Accuracy Threshold: {(formData.accuracyThreshold * 100).toFixed(0)}%
                          </Label>
                          <input
                            type="range"
                            id="accuracyThreshold"
                            min="0.90"
                            max="1.00"
                            step="0.01"
                            value={formData.accuracyThreshold}
                            onChange={(e) => setFormData(prev => ({ ...prev, accuracyThreshold: parseFloat(e.target.value) }))}
                            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-medical-gray mt-1">
                            <span>90% (Standard)</span>
                            <span>100% (Maximum)</span>
                          </div>
                        </div>

                        {/* Medical Capabilities Selection */}
                        <div>
                          <Label>Medical Capabilities</Label>
                          <p className="text-xs text-medical-gray mb-3">
                            Select medical capabilities with regulatory compliance and clinical validation
                          </p>

                          {loadingMedicalData ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="w-6 h-6 border-2 border-progress-teal border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {medicalCapabilities.map((capability) => (
                                <div key={capability.id} className="border border-neutral-200 rounded-lg p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3">
                                      <input
                                        type="checkbox"
                                        id={`capability-${capability.id}`}
                                        checked={(formData.selectedMedicalCapabilities || []).includes(capability.id)}
                                        onChange={() => handleMedicalCapabilityToggle(capability.id)}
                                        className="mt-1 rounded border-neutral-300 text-market-purple focus:ring-market-purple"
                                      />
                                      <div className="flex-1">
                                        <Label
                                          htmlFor={`capability-${capability.id}`}
                                          className="text-sm font-medium text-deep-charcoal cursor-pointer"
                                        >
                                          {capability.display_name}
                                        </Label>
                                        <p className="text-xs text-medical-gray mt-1">
                                          {capability.description}
                                        </p>

                                        {capability.medical_domain && (
                                          <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="outline" className="text-xs">
                                              {capability.medical_domain}
                                            </Badge>
                                            {capability.accuracy_threshold && (
                                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                                {(capability.accuracy_threshold * 100).toFixed(0)}% Accuracy
                                              </Badge>
                                            )}
                                            {capability.citation_required && (
                                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                                Citation Required
                                              </Badge>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Competencies for this capability */}
                                  {(formData.selectedMedicalCapabilities || []).includes(capability.id) && competencies[capability.id] && (
                                    <div className="mt-4 pl-6 border-l-2 border-neutral-100">
                                      <Label className="text-sm font-medium text-deep-charcoal">
                                        Select Competencies
                                      </Label>
                                      <div className="grid grid-cols-1 gap-2 mt-2">
                                        {competencies[capability.id].map((competency) => (
                                          <div key={competency.id} className="flex items-start space-x-2">
                                            <input
                                              type="checkbox"
                                              id={`competency-${competency.id}`}
                                              checked={((formData.competencySelection || { /* TODO: implement */ })[capability.id] || []).includes(competency.id)}
                                              onChange={() => handleCompetencySelection(capability.id, competency.id)}
                                              className="mt-1 rounded border-neutral-300 text-market-purple focus:ring-market-purple"
                                            />
                                            <div className="flex-1">
                                              <Label
                                                htmlFor={`competency-${competency.id}`}
                                                className="text-xs font-medium cursor-pointer"
                                              >
                                                {competency.name}
                                              </Label>
                                              <p className="text-xs text-medical-gray">
                                                {competency.description}
                                              </p>
                                              {competency.medical_accuracy_requirement && (
                                                <Badge variant="outline" className="text-xs mt-1">
                                                  {(competency.medical_accuracy_requirement * 100).toFixed(0)}% Required
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}

                              {medicalCapabilities.length === 0 && (
                                <p className="text-sm text-medical-gray italic text-center py-4">
                                  No medical capabilities available. Please check your database configuration.
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Selected Medical Capabilities Summary */}
                        {formData.selectedMedicalCapabilities?.length > 0 && (
                          <div>
                            <Label>Selected Medical Capabilities</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {formData.selectedMedicalCapabilities.map((capabilityId) => {
                                const capability = medicalCapabilities.find((c: any) => c.id === capabilityId);
                                return capability ? (
                                  <Badge
                                    key={capabilityId}
                                    variant="secondary"
                                    className="text-xs bg-trust-blue/10 text-trust-blue"
                                  >
                                    {capability.display_name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}

                        {/* Dynamic Prompt Generation */}
                        <div className="border-t border-neutral-200 pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <Label className="text-base font-medium">Dynamic System Prompt</Label>
                              <p className="text-xs text-medical-gray mt-1">
                                Generate a medical-grade system prompt with PHARMA/VERIFY protocols based on selected capabilities
                              </p>
                            </div>
                            <Button
                              type="button"
                              onClick={generateDynamicPrompt}
                              disabled={isGeneratingPrompt || (formData.selectedMedicalCapabilities?.length || 0) === 0}
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              {isGeneratingPrompt ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-progress-teal border-t-transparent rounded-full animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Zap className="h-4 w-4 flex-shrink-0" />
                                  <span>Generate Smart Prompt</span>
                                </>
                              )}
                            </Button>
                          </div>

                          {generatedPrompt && (
                            <div className="space-y-3">
                              {/* Prompt Metadata */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-neutral-50 rounded-lg">
                                <div>
                                  <Label className="text-xs font-medium text-neutral-600">Token Count</Label>
                                  <p className="text-sm font-medium">{generatedPrompt.metadata.tokenCount}</p>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-neutral-600">Capabilities</Label>
                                  <p className="text-sm font-medium">{generatedPrompt.metadata.capabilities.length}</p>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-neutral-600">Compliance Level</Label>
                                  <p className="text-sm font-medium">{generatedPrompt.metadata.complianceLevel}</p>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-neutral-600">Validation Required</Label>
                                  <p className="text-sm font-medium">{generatedPrompt.validationRequired ? 'Yes' : 'No'}</p>
                                </div>
                              </div>

                              {/* Protocol Indicators */}
                              <div className="flex flex-wrap gap-2">
                                {generatedPrompt.metadata.pharmaProtocolIncluded && (
                                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                    PHARMA Protocol Enabled
                                  </Badge>
                                )}
                                {generatedPrompt.metadata.verifyProtocolIncluded && (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                    VERIFY Protocol Enabled
                                  </Badge>
                                )}
                                {generatedPrompt.metadata.medicalDisclaimers.length > 0 && (
                                  <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                                    Medical Disclaimers Included
                                  </Badge>
                                )}
                              </div>

                              {/* Prompt Preview Toggle */}
                              <Button
                                type="button"
                                onClick={() => setShowPromptPreview(!showPromptPreview)}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-center"
                              >
                                {showPromptPreview ? 'Hide' : 'Show'} Generated Prompt Preview
                              </Button>

                              {/* Prompt Preview */}
                              {showPromptPreview && (
                                <div className="border border-neutral-200 rounded-lg">
                                  <div className="bg-neutral-50 px-3 py-2 border-b border-neutral-200">
                                    <Label className="text-xs font-medium text-neutral-600">Generated System Prompt Preview</Label>
                                  </div>
                                  <div className="p-3 max-h-64 overflow-y-auto">
                                    <pre className="text-xs text-neutral-700 whitespace-pre-wrap font-mono">
                                      {generatedPrompt.content}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <div>
                      <Label>Prohibitions</Label>
                      <p className="text-xs text-medical-gray mb-2">
                        Things the agent must never do
                      </p>
                      <textarea
                        value={(formData.metadata?.safety_compliance?.prohibitions || []).join('\n')}
                        onChange={(e) => {
                          const prohibitions = e.target.value.split('\n').filter((p: any) => p.trim());
                          setFormData(prev => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              safety_compliance: {
                                ...(prev.metadata?.safety_compliance || {}),
                                prohibitions
                              }
                            }
                          }));
                        }}
                        placeholder="One prohibition per line, e.g.:\nNever diagnose medical conditions\nNo controlled substance advice"
                        className="w-full min-h-[100px] p-3 border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-market-purple text-sm font-mono"
                      />
                    </div>

                    <div>
                      <Label>Mandatory Protections</Label>
                      <p className="text-xs text-medical-gray mb-2">
                        Safety guardrails that must always be active
                      </p>
                      <textarea
                        value={(formData.metadata?.safety_compliance?.mandatory_protections || []).join('\n')}
                        onChange={(e) => {
                          const mandatory_protections = e.target.value.split('\n').filter((p: any) => p.trim());
                          setFormData(prev => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              safety_compliance: {
                                ...(prev.metadata?.safety_compliance || {}),
                                mandatory_protections
                              }
                            }
                          }));
                        }}
                        placeholder="One protection per line, e.g.:\nPatient privacy protection\nData security measures"
                        className="w-full min-h-[100px] p-3 border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-market-purple text-sm font-mono"
                      />
                    </div>

                    <div>
                      <Label>Regulatory Standards</Label>
                      <p className="text-xs text-medical-gray mb-2">
                        Compliance frameworks (e.g., HIPAA, FDA 21 CFR Part 11)
                      </p>
                      <textarea
                        value={(formData.metadata?.safety_compliance?.regulatory_standards || []).join('\n')}
                        onChange={(e) => {
                          const regulatory_standards = e.target.value.split('\n').filter((p: any) => p.trim());
                          setFormData(prev => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              safety_compliance: {
                                ...(prev.metadata?.safety_compliance || {}),
                                regulatory_standards
                              }
                            }
                          }));
                        }}
                        placeholder="One standard per line, e.g.:\nHIPAA\nFDA 21 CFR Part 11\nICH-GCP"
                        className="w-full min-h-[100px] p-3 border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-market-purple text-sm font-mono"
                      />
                    </div>

                    <div className="border-t border-neutral-200 pt-4">
                      <h4 className="font-medium text-deep-charcoal mb-3">Confidence Thresholds</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="lowConfidence">Low Confidence</Label>
                          <Input
                            type="number"
                            id="lowConfidence"
                            min="0"
                            max="1"
                            step="0.05"
                            value={formData.metadata?.escalation_config?.uncertainty_handling?.low_confidence_threshold || 0.70}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setFormData(prev => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  escalation_config: {
                                    ...(prev.metadata?.escalation_config || {}),
                                    uncertainty_handling: {
                                      ...(prev.metadata?.escalation_config?.uncertainty_handling || {}),
                                      low_confidence_threshold: value
                                    }
                                  }
                                }
                              }));
                            }}
                          />
                          <p className="text-xs text-medical-gray mt-1">Below this: escalate</p>
                        </div>

                        <div>
                          <Label htmlFor="mediumConfidence">Medium Confidence</Label>
                          <Input
                            type="number"
                            id="mediumConfidence"
                            min="0"
                            max="1"
                            step="0.05"
                            value={formData.metadata?.escalation_config?.uncertainty_handling?.medium_confidence_threshold || 0.85}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setFormData(prev => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  escalation_config: {
                                    ...(prev.metadata?.escalation_config || {}),
                                    uncertainty_handling: {
                                      ...(prev.metadata?.escalation_config?.uncertainty_handling || {}),
                                      medium_confidence_threshold: value
                                    }
                                  }
                                }
                              }));
                            }}
                          />
                          <p className="text-xs text-medical-gray mt-1">Use CoT reasoning</p>
                        </div>

                        <div>
                          <Label htmlFor="highConfidence">High Confidence</Label>
                          <Input
                            type="number"
                            id="highConfidence"
                            min="0"
                            max="1"
                            step="0.05"
                            value={formData.metadata?.escalation_config?.uncertainty_handling?.high_confidence_threshold || 0.95}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setFormData(prev => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  escalation_config: {
                                    ...(prev.metadata?.escalation_config || {}),
                                    uncertainty_handling: {
                                      ...(prev.metadata?.escalation_config?.uncertainty_handling || {}),
                                      high_confidence_threshold: value
                                    }
                                  }
                                }
                              }));
                            }}
                          />
                          <p className="text-xs text-medical-gray mt-1">Direct response OK</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Generate Tab */}
              {activeTab === 'generate' && (
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold text-deep-charcoal flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-market-purple" />
                      Generate System Prompt
                    </h3>
                    <p className="text-sm text-medical-gray mt-1">
                      Compile all agent attributes into a comprehensive system prompt using template-based or AI-optimized generation.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-r from-market-purple/5 to-innovation-orange/5 border border-market-purple/20 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-market-purple/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Zap className="h-6 w-6 text-market-purple" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-deep-charcoal mb-2">Generate Complete System Prompt</h3>
                          <p className="text-sm text-medical-gray mb-4">
                            Compile all agent attributes into a comprehensive system prompt. Choose between fast template-based generation or AI-optimized generation.
                          </p>

                          {/* Mode Selection */}
                          <div className="mb-4 space-y-3">
                            <label className="flex items-start gap-3 p-3 border-2 border-neutral-200 rounded-lg cursor-pointer hover:border-market-purple/30 transition-colors">
                              <input
                                type="radio"
                                name="promptMode"
                                value="template"
                                checked={promptGenerationMode === 'template'}
                                onChange={(e) => setPromptGenerationMode(e.target.value as 'template' | 'ai')}
                                className="mt-1 w-4 h-4 text-market-purple"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-deep-charcoal">Template-Based</span>
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Fast • Free</span>
                                </div>
                                <p className="text-xs text-medical-gray mt-1">
                                  Instant generation using structured templates. Predictable, consistent, and auditable. Best for compliance-heavy agents.
                                </p>
                              </div>
                            </label>

                            <label className="flex items-start gap-3 p-3 border-2 border-neutral-200 rounded-lg cursor-pointer hover:border-market-purple/30 transition-colors">
                              <input
                                type="radio"
                                name="promptMode"
                                value="ai"
                                checked={promptGenerationMode === 'ai'}
                                onChange={(e) => setPromptGenerationMode(e.target.value as 'template' | 'ai')}
                                className="mt-1 w-4 h-4 text-market-purple"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-deep-charcoal">AI-Optimized</span>
                                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Smart • $0.02-0.05</span>
                                </div>
                                <p className="text-xs text-medical-gray mt-1">
                                  LLM-generated prompt with natural language optimization. Context-aware, removes redundancy, adapts tone. Powered by GPT-4.
                                </p>
                              </div>
                            </label>
                          </div>

                          {/* Generate Button */}
                          <Button
                            type="button"
                            onClick={generateSystemPromptHybrid}
                            disabled={isGeneratingCompletePrompt}
                            className="bg-market-purple text-white hover:bg-market-purple/90 flex items-center gap-2 w-full justify-center"
                          >
                            {isGeneratingCompletePrompt ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Zap className="h-4 w-4" />
                                Generate {promptGenerationMode === 'ai' ? 'AI-Optimized' : 'Template-Based'} Prompt
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
        </div>
          </>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-neutral-200 bg-background-gray flex-shrink-0">
          <div className="flex items-center gap-3">
            <p className="text-sm text-medical-gray">
              * Required fields
            </p>
            {editingAgent && (isSuperAdmin() || isAdmin() || (editingAgent as unknown).is_user_copy || editingAgent.is_custom) && (
              <Button
                variant="outline"
                onClick={handleDelete}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Agent
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-market-purple hover:bg-market-purple/90">
              <Save className="mr-2 h-4 w-4" />
              {editingAgent ? 'Update Agent' : 'Create Agent'}
            </Button>
          </div>
        </div>
      </div>

      {/* Icon Selection Modal */}
      <IconSelectionModal
        isOpen={showIconModal}
        onClose={() => setShowIconModal(false)}
        onSelect={(icon) => {
          // Use icon.icon for avatars (Supabase Storage URL), fallback to file_url
          setFormData(prev => ({ ...prev, avatar: icon.icon || icon.file_url }));
        }}
        selectedIcon={formData.avatar}
        category="avatar"
      />

      {/* Prompt Icon Selection Modal */}
      <IconSelectionModal
        isOpen={showPromptIconModal}
        onClose={() => {
          setShowPromptIconModal(false);
          setEditingPromptId(null);
        }}
        onSelect={(icon) => {
          if (editingPromptId) {
            setFormData(prev => ({
              ...prev,
              promptStarters: prev.promptStarters.map((p: any) =>
                p.id === editingPromptId ? { ...p, iconUrl: icon.file_url, icon: icon.name } : p
              )
            }));
            setShowPromptIconModal(false);
            setEditingPromptId(null);
          }
        }}
        selectedIcon={editingPromptId ? formData.promptStarters.find((p: any) => p.id === editingPromptId)?.iconUrl : undefined}
        category="prompt"
      />
    </div>
  );
}