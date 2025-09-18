'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChatStore } from '@/lib/stores/chat-store';
import { AgentService, type AgentWithCategories } from '@/lib/agents/agent-service';
import { AgentAvatar } from '@/components/ui/agent-avatar';
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
} from 'lucide-react';
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

// Fallback avatar options for custom agents
const avatarOptions = ['🤖', '👨‍⚕️', '👩‍⚕️', '🧬', '🔬', '💊', '🏥', '📊', '⚗️', '🩺', '🧠', '💡'];

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

const knowledgeDomains = [
  { value: 'digital-health', label: 'Digital Health' },
  { value: 'clinical-research', label: 'Clinical Research' },
  { value: 'market-access', label: 'Market Access' },
  { value: 'regulatory', label: 'Regulatory' },
  { value: 'quality-assurance', label: 'Quality Assurance' },
  { value: 'health-economics', label: 'Health Economics' },
];

const businessFunctions = [
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
  { value: 'regulatory-specialist', label: 'Regulatory Specialist' },
  { value: 'clinical-research-associate', label: 'Clinical Research Associate' },
  { value: 'market-access-manager', label: 'Market Access Manager' },
  { value: 'technical-architect', label: 'Technical Architect' },
  { value: 'strategic-business-lead', label: 'Strategic Business Lead' },
  { value: 'medical-science-liaison', label: 'Medical Science Liaison' },
  { value: 'hr-business-partner', label: 'HR Business Partner' },
  { value: 'project-manager', label: 'Project Manager' },
  { value: 'data-analyst', label: 'Data Analyst' },
  { value: 'quality-manager', label: 'Quality Manager' },
  { value: 'compliance-officer', label: 'Compliance Officer' },
  { value: 'product-manager', label: 'Product Manager' },
];

export function AgentCreator({ isOpen, onClose, onSave, editingAgent }: AgentCreatorProps) {
  const { createCustomAgent, updateAgent } = useChatStore();
  const [agentService] = useState(() => new AgentService());
  const [agentTemplates, setAgentTemplates] = useState<AgentWithCategories[]>([]);
  const [availableAvatars, setAvailableAvatars] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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
  });

  const [newCapability, setNewCapability] = useState('');
  const [newKnowledgeUrl, setNewKnowledgeUrl] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isProcessingKnowledge, setIsProcessingKnowledge] = useState(false);
  const [knowledgeProcessingStatus, setKnowledgeProcessingStatus] = useState<string | null>(null);

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

      setFormData({
        name: editingAgent.display_name || editingAgent.name,
        description: editingAgent.description || '',
        systemPrompt: editingAgent.system_prompt || '',
        model: editingAgent.model || 'gpt-4',
        avatar: editingAgent.avatar || '🤖',
        capabilities: capabilities,
        ragEnabled: editingAgent.rag_enabled ?? true,
        temperature: editingAgent.temperature || 0.7,
        maxTokens: editingAgent.max_tokens || 2000,
        knowledgeUrls: [],
        knowledgeFiles: [] as File[],
        tools: Array.isArray(editingAgent.tools) ? editingAgent.tools.filter((t): t is string => typeof t === 'string') : [],
        knowledgeDomains: knowledgeDomains,
        businessFunction: '',
        role: '',
      });
    }
  }, [editingAgent]);

  // Load agent templates and available avatars from database
  useEffect(() => {
    const loadData = async () => {
      try {
        const agents = await agentService.getActiveAgents();

        // Use first few agents as templates
        setAgentTemplates(agents.slice(0, 6));

        // Extract unique avatars from all agents for avatar selection
        const uniqueAvatars = [...new Set(agents.map(agent => agent.avatar).filter(Boolean))];
        setAvailableAvatars(uniqueAvatars);
      } catch (error) {
        console.error('Failed to load agent data:', error);
        // Fallback to hardcoded avatars if database fails
        setAvailableAvatars(avatarOptions);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [agentService]);

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

  const handleSave = () => {
    if (!formData.name || !formData.description || !formData.systemPrompt) {
      alert('Please fill in all required fields');
      return;
    }

    const agentData = {
      name: formData.name,
      description: formData.description,
      systemPrompt: formData.systemPrompt,
      model: formData.model,
      avatar: formData.avatar,
      color: 'text-market-purple',
      capabilities: formData.capabilities,
      ragEnabled: formData.ragEnabled,
      temperature: formData.temperature,
      maxTokens: formData.maxTokens,
      knowledgeUrls: formData.knowledgeUrls,
      tools: formData.tools,
      knowledgeDomains: formData.knowledgeDomains,
      businessFunction: formData.businessFunction,
      role: formData.role,
    };

    if (editingAgent) {
      // Update existing agent
      updateAgent(editingAgent.id, agentData);
    } else {
      // Create new agent
      createCustomAgent(agentData);
    }

    onSave();
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
                      />
                    </div>
                    <div>
                      <Label htmlFor="avatar">Avatar</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {availableAvatars.map((avatar, index) => (
                          <Button
                            key={avatar || `avatar-${index}`}
                            type="button"
                            variant={formData.avatar === avatar ? "default" : "outline"}
                            size="sm"
                            className="h-10 w-10 p-1"
                            onClick={() => setFormData(prev => ({ ...prev, avatar: avatar }))}
                          >
                            <AgentAvatar
                              avatar={avatar}
                              name={`Avatar ${index + 1}`}
                              size="sm"
                            />
                          </Button>
                        ))}
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
                        {businessFunctions.map(bf => (
                          <option key={bf.value} value={bf.value}>
                            {bf.label}
                          </option>
                        ))}
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
                        {roles.map(role => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
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
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-background-gray flex-shrink-0">
          <p className="text-sm text-medical-gray">
            * Required fields
          </p>
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
    </div>
  );
}