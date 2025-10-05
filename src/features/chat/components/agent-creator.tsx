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
  Cpu
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import { AgentAvatar } from '@/components/ui/agent-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconSelectionModal } from '@/components/ui/icon-selection-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BUSINESS_FUNCTIONS, DEPARTMENTS_BY_FUNCTION, ROLES_BY_DEPARTMENT } from '@/config/organizational-structure';
import { AgentService, type AgentWithCategories } from '@/features/agents/services/agent-service';
import { TOOL_STATUS } from '@/features/chat/tools/tool-registry';
import { promptGenerationService } from '@/lib/services/prompt-generation-service';
import { useAgentsStore } from '@/lib/stores/agents-store';
import { useChatStore } from '@/lib/stores/chat-store';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type {
  MedicalCapability,
  MedicalCompetency,
  HealthcareBusinessFunction,
  HealthcareRole,
  SystemPromptGenerationRequest,
  SystemPromptGenerationResponse
} from '@/types/healthcare-compliance';

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

const knowledgeDomains = [
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
  const [agentService] = useState(() => new AgentService());
  const [iconService] = useState(() => new IconService());
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
  });

  const [newCapability, setNewCapability] = useState('');
  const [newKnowledgeUrl, setNewKnowledgeUrl] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isProcessingKnowledge, setIsProcessingKnowledge] = useState(false);
  const [knowledgeProcessingStatus, setKnowledgeProcessingStatus] = useState<string | null>(null);

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
  const [activeTab, setActiveTab] = useState<'basic' | 'organization' | 'capabilities' | 'prompts' | 'knowledge' | 'tools' | 'models'>('basic');

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

  // Load available tools from tool registry (not database)
  useEffect(() => {
    try {
      setLoadingTools(true);

      // Import tool registry and get available tools
      import('@/features/chat/tools/tool-registry').then(({ listAvailableTools, TOOL_STATUS }) => {
        const toolNames = listAvailableTools();
        const tools = toolNames.map((name, index) => ({
          id: `tool_${index}`,
          name: name,
          description: `LangChain tool: ${name}`,
          type: 'langchain',
          category: 'tool',
          api_endpoint: null,
          configuration: {},
          authentication_required: false,
          rate_limit: null,
          cost_model: null,
          documentation_url: null,
          is_active: TOOL_STATUS[name] === 'available',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        setAvailableToolsFromDB(tools);
        console.log(`✅ Loaded ${tools.length} tools from registry`);
        setLoadingTools(false);
      });
    } catch (error) {
      console.error('❌ Exception loading tools:', error);
      setAvailableToolsFromDB([]);
      setLoadingTools(false);
    }
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
        const matchedFunction = businessFunctions.find(f =>
          (f.department_name || f.name) === editingAgent.business_function
        );
        if (matchedFunction) {
          businessFunctionValue = matchedFunction.id;
        }
      }

      if (!departmentValue && editingAgent.department && departments.length > 0) {
        const matchedDept = departments.find(d =>
          d.department_name === editingAgent.department
        );
        if (matchedDept) {
          departmentValue = matchedDept.id;
        }
      }

      if (!roleValue && editingAgent.role && healthcareRoles.length > 0) {
        const matchedRole = healthcareRoles.find(r =>
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
        resolvedRoleId: roleValue
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
      }));
    }
  }, [editingAgent, availableIcons, businessFunctions]);

  // Load agent's tools when editing (tools are stored in agents.tools JSON column)
  useEffect(() => {
    if (!editingAgent) {
      return;
    }

    // Tools are already in the agent object as a JSON array
    const agentTools = (editingAgent as any).tools || [];
    console.log(`🔧 Loaded ${agentTools.length} tools for ${editingAgent.display_name}:`, agentTools);

    setFormData(prev => ({
      ...prev,
      tools: agentTools
    }));
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
          console.error('[Agent Creator] Supabase error:', capError);
          // Don't throw - continue loading organizational data even if capabilities fail
          console.warn('[Agent Creator] Continuing without capabilities...');
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
          setBusinessFunctions(functions);
        }

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
    if (!formData.businessFunction) {
      setAvailableDepartments([]);
      return;
    }

    // If database has data, use it
    if (businessFunctions.length > 0 && Object.keys(departmentsByFunction).length > 0) {
      // formData.businessFunction now stores the function ID (UUID)
      const deptsForFunction = departmentsByFunction[formData.businessFunction] || [];

      setAvailableDepartments(deptsForFunction);

      console.log('[Agent Creator] Filtered departments for function ID', formData.businessFunction, ':', deptsForFunction.length, 'departments');

      // If current department is not in available departments, reset it
      const deptIds = deptsForFunction.map(d => d.id);
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
      let filteredRoles = healthcareRoles.filter(role =>
        role.function_id === formData.businessFunction
      );

      // Further filter by department if selected
      if (formData.department) {
        filteredRoles = filteredRoles.filter(role =>
          role.department_id === formData.department
        );
      }

      setAvailableRoles(filteredRoles);

      console.log('[Agent Creator] Filtered roles:', filteredRoles.length, 'for function:', formData.businessFunction, 'dept:', formData.department);

      // If current role is not in available roles, reset it
      const roleIds = filteredRoles.map(r => r.id);
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
      capabilities: prev.capabilities.filter(c => c !== capability)
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
      knowledgeUrls: prev.knowledgeUrls.filter(u => u !== url)
    }));
  };

  const handleToolToggle = (tool: string) => {
    console.log('🔧 Tool toggle clicked:', tool);
    console.log('🔧 Current tools before toggle:', formData.tools);

    setFormData(prev => {
      const newTools = prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
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
        ? prev.knowledgeDomains.filter(d => d !== domain)
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
    const selectedModel = modelOptions.find(m => m.id === modelId);
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
      requiresCodeGeneration: formData.capabilities.some(c =>
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

    const isUserAgent = (editingAgent as unknown).is_user_copy || editingAgent.is_custom;

    if (!isUserAgent) {
      alert('You can only delete your own agents.');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${editingAgent.display_name}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      // If it's a localStorage-only agent, just remove it from localStorage
      const isLocalStorageOnly = (editingAgent as unknown).is_user_copy && editingAgent.is_custom;

      if (isLocalStorageOnly) {
        // Remove from localStorage
        const saved = localStorage.getItem('user-chat-agents');
        if (saved) {
          const userAgents = JSON.parse(saved);
          const filteredAgents = userAgents.filter((agent: unknown) => agent.id !== editingAgent.id);
          localStorage.setItem('user-chat-agents', JSON.stringify(filteredAgents));
        }
      } else {
        // Delete from database
        await deleteAgent(editingAgent.id);
      }

      // Close modal and refresh
      onClose();
      onSave(); // This triggers a refresh

    } catch (error) {
      console.error('❌ Failed to delete agent:', error);
      alert('Failed to delete agent. Please try again.');
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
      function_id: formData.businessFunction || null, // Store UUID
      business_function: null, // Deprecated field
      role: formData.role || null,
      department: formData.department || null,
      // Medical Compliance Fields
      medical_specialty: formData.medicalSpecialty,
      validation_status: formData.clinicalValidationStatus,
      hipaa_compliant: formData.hipaaCompliant,
      pharma_enabled: formData.pharmaEnabled,
      verify_enabled: formData.verifyEnabled,
      accuracy_score: formData.accuracyThreshold,
      // Required fields for agents-store
      status: 'active' as const,
      tier: 1,
      priority: 1,
      implementation_phase: 1,
      is_custom: true,
      is_public: false,
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
            business_function: selectedBusinessFunction?.name || '',
            role: selectedRole?.name || '',
            is_custom: true,
            is_public: false,
            status: 'active' as const,
            tier: 1,
            priority: 1,
            implementation_phase: 1,
          };
          await createUserCopy(userCopyData as unknown);
        } else {
          // Look up names from UUIDs for display
          const selectedFunction = businessFunctions.find(f => f.id === formData.businessFunction);
          const selectedDept = availableDepartments.find(d => d.id === formData.department);
          const selectedRole = availableRoles.find(r => r.id === formData.role);

          console.log('[Agent Creator] Save - Looking up names from UUIDs:');
          console.log('  Business Function UUID:', formData.businessFunction);
          console.log('  Found function:', selectedFunction);
          console.log('  Department UUID:', formData.department);
          console.log('  Found dept:', selectedDept);
          console.log('  Role UUID:', formData.role);
          console.log('  Found role:', selectedRole);

          // Update existing agent - Only send updateable fields
          const updates = {
            display_name: formData.name,
            description: formData.description,
            system_prompt: formData.systemPrompt,
            model: formData.model,
            avatar: formData.avatar,
            // Don't update color - keep existing value
            capabilities: formData.capabilities,
            rag_enabled: formData.ragEnabled,
            temperature: formData.temperature,
            max_tokens: formData.maxTokens,
            knowledge_domains: formData.knowledgeDomains,
            // Store NAMES for display (backwards compatibility)
            business_function: selectedFunction?.department_name || selectedFunction?.name || formData.businessFunction || null,
            department: selectedDept?.department_name || formData.department || null,
            role: selectedRole?.role_name || selectedRole?.name || formData.role || null,
            // Store UUIDs for relationships
            function_id: formData.businessFunction || null,
            department_id: formData.department || null,
            role_id: formData.role || null,
            // Medical Compliance Fields
            medical_specialty: formData.medicalSpecialty,
            validation_status: formData.clinicalValidationStatus,
            hipaa_compliant: formData.hipaaCompliant,
            pharma_enabled: formData.pharmaEnabled,
            verify_enabled: formData.verifyEnabled,
            accuracy_score: formData.accuracyThreshold,
          };

          console.log('[Agent Creator] Save - Updates object:', {
            business_function: updates.business_function,
            department: updates.department,
            role: updates.role,
            function_id: updates.function_id,
            department_id: updates.department_id,
            role_id: updates.role_id
          });

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
          console.log('🔧 Selected tools in formData:', formData.tools);
          await syncAgentTools(editingAgent.id, formData.tools);
          console.log('✅ Agent tools synced successfully');
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
          businessFunction: selectedBusinessFunction?.department_name || selectedBusinessFunction?.name || '',
          role: selectedRole?.role_name || selectedRole?.name || '',
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
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
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 px-6 bg-white">
          <nav className="flex gap-6" aria-label="Form sections">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={cn(
                "py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2",
                activeTab === 'basic'
                  ? "border-market-purple text-market-purple"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <User className="h-4 w-4" />
              Basic Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('organization')}
              className={cn(
                "py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2",
                activeTab === 'organization'
                  ? "border-market-purple text-market-purple"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Building2 className="h-4 w-4" />
              Organization
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('capabilities')}
              className={cn(
                "py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2",
                activeTab === 'capabilities'
                  ? "border-market-purple text-market-purple"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Zap className="h-4 w-4" />
              Capabilities
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('prompts')}
              className={cn(
                "py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2",
                activeTab === 'prompts'
                  ? "border-market-purple text-market-purple"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <MessageSquare className="h-4 w-4" />
              Prompt Starters
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('knowledge')}
              className={cn(
                "py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2",
                activeTab === 'knowledge'
                  ? "border-market-purple text-market-purple"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <BookOpen className="h-4 w-4" />
              Knowledge
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tools')}
              className={cn(
                "py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2",
                activeTab === 'tools'
                  ? "border-market-purple text-market-purple"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Wrench className="h-4 w-4" />
              Tools
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('models')}
              className={cn(
                "py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2",
                activeTab === 'models'
                  ? "border-market-purple text-market-purple"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Cpu className="h-4 w-4" />
              Models
            </button>
          </nav>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className={cn(
            "grid gap-6 p-6",
            editingAgent ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"
          )}>
            {/* Templates - Only show when creating new agent */}
            {!editingAgent && (
              <div className="lg:col-span-1">
              <h3 className="font-semibold text-deep-charcoal mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Quick Start Templates
              </h3>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-4 text-medical-gray">Loading templates...</div>
                ) : (
                  agentTemplates.map((template) => {
                    // Parse capabilities for display
                    let capabilities: string[] = [];
                    try {
                      capabilities = typeof template.capabilities === 'string'
                        ? JSON.parse(template.capabilities)
                        : template.capabilities || [];
                    } catch (e) {
                      capabilities = [];
                    }

                    return (
                      <Card
                        key={template.name}
                        className={cn(
                          'cursor-pointer transition-all hover:shadow-md',
                          selectedTemplate === template.name && 'ring-2 ring-market-purple'
                        )}
                        onClick={() => applyTemplate(template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Show SVG avatar or fallback */}
                            {template.avatar && template.avatar.startsWith('/avatars/') ? (
                              <img
                                src={template.avatar}
                                alt={template.display_name || template.name}
                                className="w-6 h-6 rounded"
                              />
                            ) : (
                              <span className="text-xl">{template.avatar || '🤖'}</span>
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-deep-charcoal">
                                {template.display_name || template.name}
                              </h4>
                              <p className="text-xs text-medical-gray mb-2">
                                {template.description}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {capabilities.slice(0, 3).map((cap) => (
                                  <Badge
                                    key={cap}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {cap}
                                  </Badge>
                                ))}
                                {capabilities.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{capabilities.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
              </div>
            )}

            {/* Form */}
            <div className={cn(
              "space-y-6",
              !editingAgent && "lg:col-span-2"
            )}>
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
                        <div className="flex items-center justify-center w-16 h-16 border-2 border-gray-200 rounded-lg bg-gray-50">
                          <AgentAvatar
                            avatar={formData.avatar}
                            name="Selected Avatar"
                            size="lg"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowIconModal(true)}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Choose Icon
                        </Button>
                      </div>
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
                    <Label htmlFor="systemPrompt">System Prompt *</Label>
                    <textarea
                      id="systemPrompt"
                      value={formData.systemPrompt}
                      onChange={(e) => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
                      placeholder="Define the agent's role, expertise, and behavior..."
                      className="w-full min-h-[120px] p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-market-purple"
                      required
                    />
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-progress-teal"
                    >
                      <option value="">Select Business Function</option>
                      {businessFunctions.map(bf => (
                        <option key={bf.id} value={bf.id}>
                          {bf.department_name || bf.name}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">
                        {!formData.businessFunction
                          ? 'Select Business Function first'
                          : availableDepartments.length === 0
                          ? 'Not available'
                          : 'Select Department...'}
                      </option>
                      {availableDepartments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.department_name}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      ) : (
                        // Database data available
                        healthcareRoles.length > 0 && availableRoles.length > 0 ? (
                          availableRoles.map(role => (
                            <option key={role.id} value={role.id}>
                              {role.role_name || role.name}
                              {role.seniority_level ? ` - ${role.seniority_level}` : ''}
                            </option>
                          ))
                        ) : formData.businessFunction && formData.department ? (
                          // Static data - show roles for selected department
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
                        ) : null
                      )}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Capabilities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Add Capability</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newCapability}
                        onChange={(e) => setNewCapability(e.target.value)}
                        placeholder="Enter a capability"
                        onKeyPress={(e) => e.key === 'Enter' && handleCapabilityAdd(newCapability)}
                      />
                      <Button
                        type="button"
                        onClick={() => handleCapabilityAdd(newCapability)}
                        disabled={!newCapability}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Predefined Capabilities</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {predefinedCapabilities.map((capability) => (
                        <Button
                          key={capability}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-auto py-1 px-2 text-xs"
                          onClick={() => handleCapabilityAdd(capability)}
                          disabled={formData.capabilities.includes(capability)}
                        >
                          {capability}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Selected Capabilities</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.capabilities.map((capability) => (
                        <Badge
                          key={capability}
                          variant="secondary"
                          className="text-xs"
                        >
                          {capability}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1 hover:bg-transparent"
                            onClick={() => handleCapabilityRemove(capability)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              )}

              {/* Prompt Starters */}
              {activeTab === 'prompts' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Prompt Starters
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
                        <Card key={prompt.id} className="relative border border-gray-200">
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
                                className="w-full min-h-[60px] p-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-market-purple text-sm"
                                rows={2}
                              />
                            </div>

                            <div>
                              <Label>Icon</Label>
                              <div className="flex items-center gap-3 mt-2">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center border">
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
                                    <MessageSquare className="w-5 h-5 text-gray-400" />
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
              <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Knowledge Base (RAG)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="ragEnabled"
                      checked={formData.ragEnabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, ragEnabled: e.target.checked }))}
                      className="w-4 h-4 text-market-purple bg-gray-100 border-gray-300 rounded focus:ring-market-purple"
                    />
                    <Label htmlFor="ragEnabled" className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Enable Knowledge Base Integration
                    </Label>
                  </div>

                  {formData.ragEnabled && (
                    <>

                      <div>
                        <Label>Add Knowledge Source URL</Label>
                        <div className="flex gap-2">
                          <Input
                            value={newKnowledgeUrl}
                            onChange={(e) => setNewKnowledgeUrl(e.target.value)}
                            placeholder="https://example.com/documentation"
                            onKeyPress={(e) => e.key === 'Enter' && handleKnowledgeUrlAdd(newKnowledgeUrl)}
                          />
                          <Button
                            type="button"
                            onClick={() => handleKnowledgeUrlAdd(newKnowledgeUrl)}
                            disabled={!newKnowledgeUrl}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-medical-gray mt-1">
                          Add URLs to documentation, research papers, PDFs, or knowledge sources for RAG processing
                        </p>
                      </div>

                      <div>
                        <Label>Upload Files</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <input
                            type="file"
                            id="fileUpload"
                            multiple
                            accept=".pdf,.txt,.doc,.docx,.md"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <label htmlFor="fileUpload" className="cursor-pointer">
                            <div className="flex flex-col items-center gap-2">
                              <Plus className="h-8 w-8 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                Click to upload files or drag and drop
                              </span>
                              <span className="text-xs text-gray-500">
                                PDF, TXT, DOC, DOCX, MD files supported
                              </span>
                            </div>
                          </label>
                        </div>

                        {formData.knowledgeFiles.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {formData.knowledgeFiles.map((file, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-background-gray rounded">
                                <span className="text-sm flex-1 truncate">{file.name}</span>
                                <span className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-1"
                                  onClick={() => handleFileRemove(file)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label>Knowledge Sources</Label>
                        <div className="space-y-2 mt-2">
                          {formData.knowledgeUrls.map((url, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-background-gray rounded">
                              <span className="text-sm flex-1 truncate">{url}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1"
                                onClick={() => handleKnowledgeUrlRemove(url)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          {formData.knowledgeUrls.length === 0 && (
                            <p className="text-xs text-medical-gray italic">No knowledge sources added yet</p>
                          )}
                        </div>

                        {/* Process Knowledge Sources */}
                        {(formData.knowledgeUrls.length > 0 || formData.knowledgeFiles.length > 0) && (
                          <div className="mt-4">
                            <Button
                              type="button"
                              onClick={processKnowledgeSources}
                              disabled={isProcessingKnowledge}
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              {isProcessingKnowledge ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-progress-teal border-t-transparent rounded-full animate-spin mr-2" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Brain className="h-4 w-4 mr-2" />
                                  Process Knowledge Sources into RAG
                                </>
                              )}
                            </Button>

                            {knowledgeProcessingStatus && (
                              <div className={`mt-2 p-2 rounded text-xs ${
                                knowledgeProcessingStatus.includes('Successfully')
                                  ? 'bg-green-50 text-green-700 border border-green-200'
                                  : knowledgeProcessingStatus.includes('Error') || knowledgeProcessingStatus.includes('Failed')
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}>
                                {knowledgeProcessingStatus}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Knowledge Domains */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Knowledge Domains Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Knowledge Domain Access</Label>
                    <p className="text-xs text-medical-gray mb-3">
                      Select which knowledge domains this agent can access. Agents will only see knowledge from their assigned domains.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {knowledgeDomains.map((domain) => (
                        <Button
                          key={domain.value}
                          type="button"
                          variant={formData.knowledgeDomains.includes(domain.value) ? "default" : "outline"}
                          size="sm"
                          className="h-auto py-2 px-3 text-xs justify-start"
                          onClick={() => handleKnowledgeDomainToggle(domain.value)}
                        >
                          <div className="flex items-center gap-2">
                            {formData.knowledgeDomains.includes(domain.value) && (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            {domain.label}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Selected Knowledge Domains</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.knowledgeDomains.map((domain) => {
                        const domainInfo = knowledgeDomains.find(d => d.value === domain);
                        return (
                          <Badge
                            key={domain}
                            variant="secondary"
                            className="text-xs bg-trust-blue/10 text-trust-blue"
                          >
                            {domainInfo?.label || domain}
                          </Badge>
                        );
                      })}
                      {formData.knowledgeDomains.length === 0 && (
                        <p className="text-xs text-medical-gray italic">No knowledge domains selected - agent will have access to all knowledge</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              </>
              )}

              {/* Tools & Integrations */}
              {activeTab === 'tools' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Tools & Integrations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Available Tools</Label>
                    <p className="text-xs text-medical-gray mb-3">
                      Select tools and integrations this agent can use
                    </p>
                    {loadingTools ? (
                      <div className="text-sm text-medical-gray py-4">Loading tools...</div>
                    ) : availableToolsFromDB.length === 0 ? (
                      <div className="text-sm text-medical-gray py-4">No tools available. Add tools to the database first.</div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                        {availableToolsFromDB.map((tool) => {
                          const isSelected = formData.tools.includes(tool.name);
                          return (
                            <button
                              key={tool.id}
                              type="button"
                              onClick={() => handleToolToggle(tool.name)}
                              className={cn(
                                "flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all",
                                isSelected
                                  ? "border-progress-teal bg-progress-teal/5"
                                  : "border-gray-200 hover:border-gray-300 bg-white"
                              )}
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                {isSelected ? (
                                  <CheckCircle className="h-5 w-5 text-progress-teal" />
                                ) : (
                                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-medium text-sm text-deep-charcoal">{tool.name}</h4>
                                  {tool.category && (
                                    <Badge variant="outline" className="text-xs">
                                      {tool.category}
                                    </Badge>
                                  )}
                                  {TOOL_STATUS[tool.name] === 'available' ? (
                                    <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
                                      ✓ Available
                                    </Badge>
                                  ) : TOOL_STATUS[tool.name] === 'coming_soon' ? (
                                    <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50">
                                      🚧 Coming Soon
                                    </Badge>
                                  ) : null}
                                </div>
                                {tool.description && (
                                  <p className="text-xs text-medical-gray mt-1">{tool.description}</p>
                                )}
                                {tool.authentication_required && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs text-amber-600">🔒 Authentication required</span>
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Selected Tools ({formData.tools.length})</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tools.length > 0 ? (
                        formData.tools.map((toolName) => {
                          // Tools are stored by name, not ID
                          const tool = availableToolsFromDB.find(t => t.name === toolName);
                          return (
                            <Badge
                              key={toolName}
                              variant="secondary"
                              className="text-xs bg-progress-teal/10 text-progress-teal"
                            >
                              {toolName}
                            </Badge>
                          );
                        })
                      ) : (
                        <p className="text-xs text-medical-gray italic">No tools selected</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              )}

              {/* Advanced Settings */}
              {activeTab === 'models' && (
              <>
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
                      </Label>
                      <select
                        id="model"
                        value={formData.model}
                        onChange={(e) => {
                          const selectedModel = modelOptions.find(m => m.id === e.target.value);
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
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-market-purple disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingModels ? (
                          <option>Loading available models...</option>
                        ) : (
                          modelOptions.map((model) => (
                            <option key={model.id} value={model.id}>
                              {model.name} - {model.description}
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
                            <span className="text-sm font-medium text-gray-700">Model Fitness Score</span>
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
                                <span className="text-xs text-gray-600 w-24">{label}:</span>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
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
                                <span className="text-xs text-gray-500 w-8 text-right">{score}</span>
                              </div>
                            ))}
                          </div>

                          {/* Reasoning */}
                          <p className="text-xs text-gray-600 mt-2 italic">{modelFitnessScore.reasoning}</p>

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
                            <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                              <p className="text-xs font-semibold text-gray-700 mb-1">💡 Better Alternatives:</p>
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
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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

              {/* Medical Compliance & Capabilities */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Medical Compliance & Capabilities
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
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-market-purple"
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
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-market-purple"
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
                        className="rounded border-gray-300 text-market-purple focus:ring-market-purple"
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
                        className="rounded border-gray-300 text-market-purple focus:ring-market-purple"
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
                        className="rounded border-gray-300 text-market-purple focus:ring-market-purple"
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
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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
                          <div key={capability.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <input
                                  type="checkbox"
                                  id={`capability-${capability.id}`}
                                  checked={(formData.selectedMedicalCapabilities || []).includes(capability.id)}
                                  onChange={() => handleMedicalCapabilityToggle(capability.id)}
                                  className="mt-1 rounded border-gray-300 text-market-purple focus:ring-market-purple"
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
                              <div className="mt-4 pl-6 border-l-2 border-gray-100">
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
                                        className="mt-1 rounded border-gray-300 text-market-purple focus:ring-market-purple"
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
                          const capability = medicalCapabilities.find(c => c.id === capabilityId);
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
                  <div className="border-t border-gray-200 pt-6">
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
                            <Zap className="h-4 w-4" />
                            Generate Smart Prompt
                          </>
                        )}
                      </Button>
                    </div>

                    {generatedPrompt && (
                      <div className="space-y-3">
                        {/* Prompt Metadata */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg">
                          <div>
                            <Label className="text-xs font-medium text-gray-600">Token Count</Label>
                            <p className="text-sm font-medium">{generatedPrompt.metadata.tokenCount}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-600">Capabilities</Label>
                            <p className="text-sm font-medium">{generatedPrompt.metadata.capabilities.length}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-600">Compliance Level</Label>
                            <p className="text-sm font-medium">{generatedPrompt.metadata.complianceLevel}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-600">Validation Required</Label>
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
                          <div className="border border-gray-200 rounded-lg">
                            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                              <Label className="text-xs font-medium text-gray-600">Generated System Prompt Preview</Label>
                            </div>
                            <div className="p-3 max-h-64 overflow-y-auto">
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
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
              </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-background-gray flex-shrink-0">
          <div className="flex items-center gap-3">
            <p className="text-sm text-medical-gray">
              * Required fields
            </p>
            {editingAgent && ((editingAgent as unknown).is_user_copy || editingAgent.is_custom) && (
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
          setFormData(prev => ({ ...prev, avatar: icon.file_url }));
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
              promptStarters: prev.promptStarters.map(p =>
                p.id === editingPromptId ? { ...p, iconUrl: icon.file_url, icon: icon.name } : p
              )
            }));
            setShowPromptIconModal(false);
            setEditingPromptId(null);
          }
        }}
        selectedIcon={editingPromptId ? formData.promptStarters.find(p => p.id === editingPromptId)?.iconUrl : undefined}
        category="prompt"
      />
    </div>
  );
}