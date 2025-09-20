'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChatStore } from '@/lib/stores/chat-store';
import { useAgentsStore } from '@/lib/stores/agents-store';
import { AgentService, type AgentWithCategories } from '@/lib/agents/agent-service';
import { AgentAvatar } from '@/components/ui/agent-avatar';
import { IconSelectionModal } from '@/components/ui/icon-selection-modal';
import { supabase } from '@/lib/supabase/client';
import type {
  MedicalCapability,
  MedicalCompetency,
  HealthcareBusinessFunction,
  HealthcareRole,
  PHARMAProtocol,
  VERIFYProtocol,
  SystemPromptGenerationRequest,
  SystemPromptGenerationResponse
} from '@/types/healthcare-compliance';
import { promptGenerationService } from '@/lib/services/prompt-generation-service';
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
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AgentCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingAgent?: AgentWithCategories | null;
}

const modelOptions = [
  { id: 'gpt-4', name: 'GPT-4', description: 'Most capable, best for complex reasoning' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient for most tasks' },
  { id: 'claude-3', name: 'Claude 3', description: 'Excellent for analysis and writing' },
  { id: 'claude-2', name: 'Claude 2', description: 'Good balance of capability and speed' },
];

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

interface PromptStarter {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: string; // Icon name/id from the database
  iconUrl?: string; // Full URL to the icon
}

const knowledgeDomains = [
  { value: 'digital-health', label: 'Digital Health' },
  { value: 'clinical-research', label: 'Clinical Research' },
  { value: 'market-access', label: 'Market Access' },
  { value: 'regulatory', label: 'Regulatory' },
  { value: 'quality-assurance', label: 'Quality Assurance' },
  { value: 'health-economics', label: 'Health Economics' },
];

const staticBusinessFunctions = [
  { value: 'regulatory-affairs', label: 'Regulatory Affairs' },
  { value: 'clinical-development', label: 'Clinical Development' },
  { value: 'market-access', label: 'Market Access' },
  { value: 'information-technology', label: 'Information Technology' },
  { value: 'business-development', label: 'Business Development' },
  { value: 'medical-affairs', label: 'Medical Affairs' },
  { value: 'human-resources', label: 'Human Resources' },
  { value: 'quality-assurance', label: 'Quality Assurance' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'finance', label: 'Finance' },
  { value: 'legal', label: 'Legal' },
  { value: 'marketing', label: 'Marketing' },
];

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
    competencySelection: {} as Record<string, string[]>,
  });

  const [newCapability, setNewCapability] = useState('');
  const [newKnowledgeUrl, setNewKnowledgeUrl] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isProcessingKnowledge, setIsProcessingKnowledge] = useState(false);
  const [knowledgeProcessingStatus, setKnowledgeProcessingStatus] = useState<string | null>(null);

  // Medical Capability State
  const [medicalCapabilities, setMedicalCapabilities] = useState<MedicalCapability[]>([]);
  const [competencies, setCompetencies] = useState<Record<string, MedicalCompetency[]>>({});
  const [businessFunctions, setBusinessFunctions] = useState<HealthcareBusinessFunction[]>([]);
  const [healthcareRoles, setHealthcareRoles] = useState<HealthcareRole[]>([]);
  const [loadingMedicalData, setLoadingMedicalData] = useState(true);

  // Dynamic Prompt Generation State
  const [generatedPrompt, setGeneratedPrompt] = useState<SystemPromptGenerationResponse | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [showPromptPreview, setShowPromptPreview] = useState(false);

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
        }, {} as Record<string, Icon>);

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

      // Debug logging
      console.log('Setting form data for editing agent:', {
        display_name: editingAgent.display_name,
        name: editingAgent.name,
        description: editingAgent.description,
        system_prompt: editingAgent.system_prompt
      });

      setFormData({
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
        tools: [],
        knowledgeDomains: knowledgeDomains,
        businessFunction: editingAgent.business_function || '',
        role: editingAgent.role || '',
        promptStarters: defaultPromptStarters,
        // Medical Compliance Fields (with safe property access)
        medicalSpecialty: (editingAgent as any)?.medical_specialty || '',
        clinicalValidationStatus: ((editingAgent as any)?.clinical_validation_status as "pending" | "validated" | "expired" | "under_review") || 'pending',
        hipaaCompliant: (editingAgent as any)?.hipaa_compliant || false,
        pharmaEnabled: (editingAgent as any)?.pharma_enabled || false,
        verifyEnabled: (editingAgent as any)?.verify_enabled || false,
        fdaSamdClass: (editingAgent as any)?.fda_samd_class || '',
        accuracyThreshold: (editingAgent as any)?.medical_accuracy_score || 0.95,
        citationRequired: true,
        selectedMedicalCapabilities: [] as string[], // TODO: Load from agent capabilities
        competencySelection: {} as Record<string, string[]>, // TODO: Load from agent competencies
      });
    }
  }, [editingAgent, availableIcons]);

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
      if (!isOpen) return;

      setLoadingMedicalData(true);
      try {
        // Load medical capabilities from Supabase
        const { data: capabilities, error: capError } = await supabase
          .from('capabilities')
          .select(`
            *,
            competencies (*)
          `)
          .eq('medical_domain', 'NOT NULL')
          .eq('status', 'active');

        if (capError) throw capError;

        // Load business functions
        const { data: functions, error: funcError } = await supabase
          .from('business_functions')
          .select('*');

        if (funcError) throw funcError;

        // Load healthcare roles
        const { data: roles, error: rolesError } = await supabase
          .from('roles')
          .select('*');

        if (rolesError) throw rolesError;

        // Set state
        setMedicalCapabilities(capabilities || []);
        setBusinessFunctions(functions || []);
        setHealthcareRoles(roles || []);

        // Organize competencies by capability
        const competencyMap: Record<string, MedicalCompetency[]> = {};
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
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }));
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
      const currentCompetencySelection = prev.competencySelection || {};
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
      const selectedBusinessFunction = businessFunctions.find(bf => bf.name === formData.businessFunction);
      const selectedRole = healthcareRoles.find(role => role.name === formData.role);

      if (!selectedBusinessFunction || !selectedRole) {
        throw new Error('Selected business function or role not found');
      }

      const generationRequest: SystemPromptGenerationRequest = {
        agentId: '', // We'll set this when saving
        selectedCapabilities: formData.selectedMedicalCapabilities,
        competencySelection: formData.competencySelection,
        mode: 'standalone' as any, // Default mode
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

  const processKnowledgeSources = async () => {
    console.log('Processing knowledge sources:', {
      urlCount: formData.knowledgeUrls.length,
      fileCount: formData.knowledgeFiles.length
    });

    if (formData.knowledgeUrls.length === 0 && formData.knowledgeFiles.length === 0) {
      setKnowledgeProcessingStatus('No knowledge sources to process');
      return;
    }

    setIsProcessingKnowledge(true);
    setKnowledgeProcessingStatus('Processing knowledge sources...');

    try {
      let urlResults: any = { totalProcessed: 0, totalFailed: 0, results: [] };
      let fileResults: any = { totalProcessed: 0, totalFailed: 0, results: [] };

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
        console.log('Processing files:', formData.knowledgeFiles.length);
        const fileFormData = new FormData();
        formData.knowledgeFiles.forEach(file => {
          console.log('Adding file to FormData:', file.name, file.size);
          fileFormData.append('files', file);
        });
        fileFormData.append('domain', 'digital-health');
        fileFormData.append('isGlobal', 'false');
        if (editingAgent?.id) {
          fileFormData.append('agentId', editingAgent.id);
        }

        console.log('Sending file upload request...');
        const fileResponse = await fetch('/api/knowledge/upload', {
          method: 'POST',
          body: fileFormData,
        });

        console.log('File upload response status:', fileResponse.status);
        if (fileResponse.ok) {
          fileResults = await fileResponse.json();
          console.log('File upload results:', fileResults);
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

    const isUserAgent = (editingAgent as any).is_user_copy || editingAgent.is_custom;

    if (!isUserAgent) {
      alert('You can only delete your own agents.');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${editingAgent.display_name}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      console.log('=== DELETING USER AGENT ===');
      console.log('- Agent ID:', editingAgent.id);
      console.log('- Agent name:', editingAgent.display_name);

      // If it's a localStorage-only agent, just remove it from localStorage
      const isLocalStorageOnly = (editingAgent as any).is_user_copy && editingAgent.is_custom;

      if (isLocalStorageOnly) {
        // Remove from localStorage
        const saved = localStorage.getItem('user-chat-agents');
        if (saved) {
          const userAgents = JSON.parse(saved);
          const filteredAgents = userAgents.filter((agent: any) => agent.id !== editingAgent.id);
          localStorage.setItem('user-chat-agents', JSON.stringify(filteredAgents));
        }
        console.log('✅ Removed agent from localStorage');
      } else {
        // Delete from database
        await deleteAgent(editingAgent.id);
        console.log('✅ Deleted agent from database');
      }

      // Close modal and refresh
      onClose();
      onSave(); // This triggers a refresh

    } catch (error) {
      console.error('❌ Failed to delete agent:', error);
      alert('Failed to delete agent. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description || !formData.systemPrompt) {
      alert('Please fill in all required fields');
      return;
    }

    // Find the selected business function and role for foreign key references
    const selectedBusinessFunction = businessFunctions.find(bf => bf.name === formData.businessFunction);
    const selectedRole = healthcareRoles.find(role => role.name === formData.role);

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
      business_function: selectedBusinessFunction?.id || null, // Use UUID from business_functions table
      role: selectedRole?.id || null, // Use UUID from roles table
      // Medical Compliance Fields
      medical_specialty: formData.medicalSpecialty,
      clinical_validation_status: formData.clinicalValidationStatus,
      hipaa_compliant: formData.hipaaCompliant,
      pharma_enabled: formData.pharmaEnabled,
      verify_enabled: formData.verifyEnabled,
      fda_samd_class: formData.fdaSamdClass,
      medical_accuracy_score: formData.accuracyThreshold,
      citation_accuracy: formData.citationRequired ? 1.0 : 0.0,
      // Required fields for agents-store
      status: 'active' as const,
      tier: 1,
      priority: 1,
      implementation_phase: 1,
      is_custom: true,
      is_public: false,
    };

    console.log('=== AGENT SAVE DEBUG START ===');
    console.log('Current timestamp:', new Date().toISOString());
    console.log('Editing agent:', editingAgent);
    console.log('Agent data being sent:', agentData);
    console.log('Agent data fields:', Object.keys(agentData));
    console.log('Form data:', formData);
    console.log('=== END DEBUG INITIAL DATA ===');

    try {
      if (editingAgent) {
        // Check if this is a user copy from localStorage that doesn't exist in DB yet
        const isUserCopyFromLocalStorage = (editingAgent as any).is_user_copy && editingAgent.is_custom;

        if (isUserCopyFromLocalStorage) {
          console.log('=== CREATING USER COPY IN DATABASE ===');
          console.log('- This is a user copy from localStorage that needs to be created in DB');

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

          console.log('Creating new user copy with data:', userCopyData);
          await createUserCopy(userCopyData as any);
        } else {
          // Update existing agent - Only send updateable fields
          const updates = {
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
            business_function: selectedBusinessFunction?.id || null,
            role: selectedRole?.id || null,
            // Medical Compliance Fields
            medical_specialty: formData.medicalSpecialty,
            clinical_validation_status: formData.clinicalValidationStatus,
            hipaa_compliant: formData.hipaaCompliant,
            pharma_enabled: formData.pharmaEnabled,
            verify_enabled: formData.verifyEnabled,
            fda_samd_class: formData.fdaSamdClass,
            medical_accuracy_score: formData.accuracyThreshold,
            citation_accuracy: formData.citationRequired ? 1.0 : 0.0,
          };

          console.log('=== CALLING UPDATE AGENT ===');
          console.log('- Agent ID:', editingAgent.id);
          console.log('- Update data:', updates);

          try {
            const updateResult = await updateAgent(editingAgent.id, updates);
            console.log('updateAgent result:', updateResult);
            console.log('=== UPDATE AGENT COMPLETED SUCCESSFULLY ===');
          } catch (updateError) {
            console.error('=== UPDATE AGENT ERROR ===');
            console.error('Update error:', updateError);

            // Provide more specific error message
            const errorMessage = (updateError as Error)?.message || 'Failed to update agent';
            throw new Error(`Failed to save agent: ${errorMessage}`);
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
          businessFunction: selectedBusinessFunction?.name || '', // Use name for chat store
          role: selectedRole?.name || '', // Use name for chat store
        };
        console.log('Calling createCustomAgent with chat store data:', chatStoreAgentData);
        createCustomAgent(chatStoreAgentData);
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="businessFunction">Business Function</Label>
                      <select
                        id="businessFunction"
                        value={formData.businessFunction}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessFunction: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Business Function</option>
                        {loadingMedicalData ? (
                          <option disabled>Loading...</option>
                        ) : (
                          businessFunctions.length > 0 ? (
                            businessFunctions.map(bf => (
                              <option key={bf.id} value={bf.name}>
                                {bf.name} - {bf.department}
                              </option>
                            ))
                          ) : (
                            staticBusinessFunctions.map(bf => (
                              <option key={bf.value} value={bf.value}>
                                {bf.label}
                              </option>
                            ))
                          )
                        )}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <select
                        id="role"
                        value={formData.role}
                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Role</option>
                        {loadingMedicalData ? (
                          <option disabled>Loading...</option>
                        ) : (
                          healthcareRoles.length > 0 ? (
                            healthcareRoles.map(role => (
                              <option key={role.id} value={role.name}>
                                {role.clinical_title || role.name} - {role.seniority_level}
                              </option>
                            ))
                          ) : (
                            roles.map(role => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))
                          )
                        )}
                      </select>
                    </div>
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

              {/* Capabilities */}
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

              {/* Prompt Starters */}
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

              {/* Knowledge Base / RAG */}
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

              {/* Tools & Integrations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Tools & Integrations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Available Tools</Label>
                    <p className="text-xs text-medical-gray mb-3">
                      Select tools and integrations this agent can use
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {availableTools.map((tool) => (
                        <Button
                          key={tool}
                          type="button"
                          variant={formData.tools.includes(tool) ? "default" : "outline"}
                          size="sm"
                          className="h-auto py-2 px-3 text-xs justify-start"
                          onClick={() => handleToolToggle(tool)}
                        >
                          <div className="flex items-center gap-2">
                            {formData.tools.includes(tool) && (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            {tool}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Selected Tools</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tools.map((tool) => (
                        <Badge
                          key={tool}
                          variant="secondary"
                          className="text-xs bg-progress-teal/10 text-progress-teal"
                        >
                          {tool}
                        </Badge>
                      ))}
                      {formData.tools.length === 0 && (
                        <p className="text-xs text-medical-gray italic">No tools selected</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Settings */}
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
                      <Label htmlFor="model">AI Model</Label>
                      <select
                        id="model"
                        value={formData.model}
                        onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-market-purple"
                      >
                        {modelOptions.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name} - {model.description}
                          </option>
                        ))}
                      </select>
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
                                        checked={((formData.competencySelection || {})[capability.id] || []).includes(competency.id)}
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
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-background-gray flex-shrink-0">
          <div className="flex items-center gap-3">
            <p className="text-sm text-medical-gray">
              * Required fields
            </p>
            {editingAgent && ((editingAgent as any).is_user_copy || editingAgent.is_custom) && (
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