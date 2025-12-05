'use client';

import {
  Upload,
  FileText,
  X,
  AlertCircle,
  CheckCircle,
  Globe,
  User,
} from 'lucide-react';
import React, { useState, useCallback, useRef, useEffect } from 'react';

import { AgentAvatar } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent } from '@vital/ui';
import { Checkbox } from '@vital/ui';
import { Label } from '@vital/ui';
import { Progress } from '@vital/ui';
import { ScrollArea } from '@vital/ui';
import { Separator } from '@vital/ui';
import type { KnowledgeDomain } from '@/lib/services/model-selector';
import { AVAILABLE_EMBEDDING_MODELS } from '@/lib/services/model-selector';
import { useAgentsStore } from '@/lib/stores/agents-store';
import { createClient } from '@vital/sdk/client';
import { cn } from '@vital/ui/lib/utils';

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  domain: string;
  isGlobal: boolean;
  selectedAgents: string[];
  embeddingModel: string;
  // chatModel: string; // Not needed - selected per query/conversation
  duplicate?: boolean;
}

interface KnowledgeUploaderProps {
  onUploadComplete: (files: unknown[]) => void;
}

export function KnowledgeUploader({ onUploadComplete }: KnowledgeUploaderProps) {
  const { agents, loadAgents } = useAgentsStore();
  const supabase = createClient();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [domains, setDomains] = useState<KnowledgeDomain[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number | 'all'>(1); // Default to Tier 1, 'all' to show all
  const [selectedFunction, setSelectedFunction] = useState<string>('all');
  const [selectedMaturity, setSelectedMaturity] = useState<string>('all');
  const [selectedAccessPolicy, setSelectedAccessPolicy] = useState<string>('all');
  const [selectedDomainScope, setSelectedDomainScope] = useState<string>('all');
  const [uploadSettings, setUploadSettings] = useState({
    domain: 'digital_health',
    isGlobal: true,
    selectedAgents: [] as string[],
    embeddingModel: 'text-embedding-3-large', // Default embedding model
    // chatModel: 'gpt-4-turbo-preview', // Not needed - selected per query/conversation
  });
  const [domainInitialized, setDomainInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    // eslint-disable-next-line security/detect-object-injection
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get unique values for filters
  const uniqueFunctions = Array.from(new Set(domains.map((d: any) => d.function_name || d.function_id).filter(Boolean)));

  // Get domains filtered by all selected filters
  const filteredDomains = domains.filter((d: any) => {
    // Filter by tier (only if not 'all')
    if (selectedTier !== 'all' && d.tier !== selectedTier) return false;
    
    // Filter by function
    if (selectedFunction !== 'all' && 
        d.function_name !== selectedFunction && 
        d.function_id !== selectedFunction) {
      return false;
    }
    
    // Filter by maturity level
    if (selectedMaturity !== 'all' && d.maturity_level !== selectedMaturity) {
      return false;
    }
    
    // Filter by access policy
    if (selectedAccessPolicy !== 'all' && d.access_policy !== selectedAccessPolicy) {
      return false;
    }
    
    // Filter by domain scope
    if (selectedDomainScope !== 'all' && d.domain_scope !== selectedDomainScope) {
      return false;
    }
    
    return true;
  });

  // Get current domain's information (using domain_id)
  const currentDomain = domains.find((d: any) => d.domain_id === uploadSettings.domain || d.slug === uploadSettings.domain);

  // Get recommended models for current domain
  const getRecommendedModels = () => {
    if (!currentDomain?.recommended_models) {
      return {
        embedding: {
          primary: 'text-embedding-3-large',
          alternatives: ['text-embedding-ada-002'],
        },
        chat: {
          primary: 'gpt-4-turbo-preview',
          alternatives: ['gpt-3.5-turbo'],
        },
      };
    }
    return currentDomain.recommended_models;
  };

  const recommendedModels = getRecommendedModels();

  // Get tier labels
  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1:
        return 'TIER 1: CORE';
      case 2:
        return 'TIER 2: SPECIALIZED';
      case 3:
        return 'TIER 3: EMERGING';
      default:
        return `TIER ${tier}`;
    }
  };

  // Load knowledge domains from database (using new architecture)
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        // Fetch from knowledge_domains_new (new architecture)
        const { data, error } = await supabase
          .from('knowledge_domains_new')
          .select('domain_id, domain_name, domain_scope, tier, priority, access_policy, rag_priority_weight, embedding_model, maturity_level, function_id, function_name, parent_domain_id, slug, name, is_active')
          .eq('is_active', true)
          .order('tier', { ascending: true })
          .order('priority', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // Map to compatible format
          const mappedDomains = data.map((d: any) => ({
            ...d,
            id: d.domain_id,
            slug: d.domain_id, // Use domain_id as slug for compatibility
            name: d.domain_name || d.name || d.domain_id,
            value: d.domain_id,
            label: d.domain_name || d.name || d.domain_id,
          }));
          
          setDomains(mappedDomains);
          // Only set default domain on first load (use first domain from any tier)
          if (!domainInitialized) {
            if (mappedDomains.length > 0) {
              setUploadSettings(prev => ({
                ...prev,
                domain: mappedDomains[0].domain_id
              }));
            }
            setDomainInitialized(true);
          }
        }
      } catch (err) {
        console.error('Error fetching knowledge domains:', err);
        // Fallback to old table if new one doesn't exist
        try {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('knowledge_domains')
            .select('*')
            .eq('is_active', true)
            .order('priority');

          if (!fallbackError && fallbackData && fallbackData.length > 0) {
            // Map old format to new format for consistency
            const mappedFallback = fallbackData.map((d: any) => ({
              ...d,
              domain_id: d.slug || d.id,
              domain_name: d.name,
              id: d.id || d.slug,
              slug: d.slug,
              name: d.name,
              value: d.slug,
              label: d.name,
            }));
            setDomains(mappedFallback);
            if (!domainInitialized) {
              if (mappedFallback.length > 0) {
                setUploadSettings(prev => ({
                  ...prev,
                  domain: mappedFallback[0].domain_id || mappedFallback[0].slug
                }));
              }
              setDomainInitialized(true);
            }
          }
        } catch (fallbackErr) {
          console.error('Error with fallback domains:', fallbackErr);
        }
      }
    };

    fetchDomains();
  }, [supabase, domainInitialized]);

  // Update domain when tier/filters change (only if selected domain is no longer in filtered list)
  useEffect(() => {
    if (domains.length > 0 && domainInitialized) {
      // Check if current domain is still in filtered list
      const currentDomainStillAvailable = filteredDomains.some((d: any) => 
        (d.domain_id === uploadSettings.domain || d.slug === uploadSettings.domain) ||
        (d.id === uploadSettings.domain)
      );
      
      // If current domain is not in filtered list, select first available domain
      if (!currentDomainStillAvailable && filteredDomains.length > 0) {
        setUploadSettings(prev => ({
          ...prev,
          domain: filteredDomains[0].domain_id || filteredDomains[0].slug || filteredDomains[0].id
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTier, selectedFunction, selectedMaturity, selectedAccessPolicy, selectedDomainScope]);

  // Update recommended models when domain changes
  useEffect(() => {
    if (currentDomain?.recommended_models) {
      const models = currentDomain.recommended_models as any;
      setUploadSettings(prev => ({
        ...prev,
        embeddingModel: models.embedding?.primary || 'text-embedding-3-large',
        // chatModel: models.chat?.primary || 'gpt-4-turbo-preview', // Not needed
      }));
    }
  }, [uploadSettings.domain, currentDomain]);

  // Load agents on component mount
  useEffect(() => {
    if (agents.length === 0) {
      loadAgents();
    }
  }, [agents.length, loadAgents]);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please upload PDF, Word, Excel, or text files.`;
    }
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return 'File size must be less than 50MB.';
    }
    return null;
  };

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: UploadFile[] = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (!error) {
        validFiles.push({
          file,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          progress: 0,
          status: 'pending',
          domain: uploadSettings.domain,
          isGlobal: uploadSettings.isGlobal,
          selectedAgents: [...uploadSettings.selectedAgents],
          embeddingModel: uploadSettings.embeddingModel,
          // chatModel: uploadSettings.chatModel, // Not needed
        });
      }
    });

    setFiles(prev => [...prev, ...validFiles]);
  }, [uploadSettings]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  };

  const uploadFile = async (file: UploadFile) => {
    const updateProgress = (progress: number, status: UploadFile['status'], error?: string) => {
      setFiles(prev => prev.map((f: any) =>
        f.id === file.id ? { ...f, progress, status, error } : f
      ));
    };

    try {
      updateProgress(0, 'uploading');

      const formData = new FormData();
      formData.append('files', file.file);
      formData.append('domain', file.domain); // Legacy field for backward compatibility
      formData.append('domain_id', file.domain); // New field: use domain_id
      formData.append('isGlobal', file.isGlobal.toString());
      formData.append('embeddingModel', file.embeddingModel);
      // Chat model is not needed during upload - it's selected per conversation/query
      // formData.append('chatModel', file.chatModel);
      
      // Get domain metadata to include new architecture fields
      const domainInfo = domains.find((d: any) => (d.domain_id || d.slug) === file.domain);
      if (domainInfo) {
        if (domainInfo.access_policy) {
          formData.append('access_policy', domainInfo.access_policy);
        }
        if (domainInfo.rag_priority_weight !== undefined) {
          formData.append('rag_priority_weight', domainInfo.rag_priority_weight.toString());
        }
        if (domainInfo.domain_scope) {
          formData.append('domain_scope', domainInfo.domain_scope);
        }
      }
      
      if (file.selectedAgents.length > 0) {
        formData.append('selectedAgents', JSON.stringify(file.selectedAgents));
      }

      // Simulate upload progress
      updateProgress(25, 'uploading');

      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

      let response;
      try {
        console.log('📤 Starting upload for:', file.file.name, {
          size: file.file.size,
          type: file.file.type,
          domain: file.domain,
          embeddingModel: file.embeddingModel,
          // chatModel: file.chatModel, // Not needed
        });

        response = await fetch('/api/knowledge/upload', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log('✅ Fetch completed:', response.status, response.statusText);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error('❌ Fetch error:', fetchError);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Upload timed out. The file might be too large or processing is taking too long.');
        }
        throw fetchError;
      }

      updateProgress(75, 'uploading');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      updateProgress(100, 'processing');

      // Wait a bit to show processing state
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if file was processed or is a duplicate
      const fileResult = result.results?.[0];

      if (fileResult?.status === 'duplicate') {
        // File is a duplicate - show as completed with info
        updateProgress(100, 'completed');
        return {
          name: file.file.name,
          type: file.file.type,
          size: file.file.size,
          domain: file.domain,
          isGlobal: file.isGlobal,
          selectedAgents: file.selectedAgents,
          duplicate: true,
        };
      } else if (result.success && result.totalProcessed > 0) {
        updateProgress(100, 'completed');
        return {
          name: file.file.name,
          type: file.file.type,
          size: file.file.size,
          domain: file.domain,
          isGlobal: file.isGlobal,
          selectedAgents: file.selectedAgents,
        };
      } else {
        const errorMsg = fileResult?.error || result.message || 'Processing failed';
        throw new Error(errorMsg);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      updateProgress(0, 'error', errorMessage);
      return null;
    }
  };

  const uploadFiles = async () => {
    const pendingFiles = files.filter((f: any) => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    const uploadPromises = pendingFiles.map(uploadFile);
    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter((result: any) => result !== null);

    if (successfulUploads.length > 0) {
      onUploadComplete(successfulUploads);
    }
  };

  const clearCompletedFiles = () => {
    setFiles(prev => prev.filter((f: any) => f.status !== 'completed'));
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-clinical-green" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-clinical-red" />;
      case 'uploading':
      case 'processing':
        return <div className="w-4 h-4 border-2 border-progress-teal border-t-transparent rounded-full animate-spin" />;
      default:
        return <FileText className="h-4 w-4 text-medical-gray" />;
    }
  };

  const getStatusText = (status: UploadFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Settings */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Domain Filters */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Domain Filters</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <Label htmlFor="tier" className="text-xs">Domain Tier</Label>
                <select
                  id="tier"
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-md text-sm"
                >
                  <option value="all">All Tiers ({domains.length})</option>
                  <option value={1}>Tier 1: Core ({domains.filter((d: any) => d.tier === 1).length})</option>
                  <option value={2}>Tier 2: Specialized ({domains.filter((d: any) => d.tier === 2).length})</option>
                  <option value={3}>Tier 3: Emerging ({domains.filter((d: any) => d.tier === 3).length})</option>
                </select>
              </div>

              {uniqueFunctions.length > 0 && (
                <div>
                  <Label htmlFor="function-filter" className="text-xs">Function</Label>
                  <select
                    id="function-filter"
                    value={selectedFunction}
                    onChange={(e) => setSelectedFunction(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-md text-sm"
                  >
                    <option value="all">All Functions</option>
                    {uniqueFunctions.map((func: string) => (
                      <option key={func} value={func}>{func}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <Label htmlFor="maturity-filter" className="text-xs">Maturity Level</Label>
                <select
                  id="maturity-filter"
                  value={selectedMaturity}
                  onChange={(e) => setSelectedMaturity(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-md text-sm"
                >
                  <option value="all">All Maturity</option>
                  <option value="Established">Established</option>
                  <option value="Specialized">Specialized</option>
                  <option value="Emerging">Emerging</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div>
                <Label htmlFor="access-policy-filter" className="text-xs">Access Policy</Label>
                <select
                  id="access-policy-filter"
                  value={selectedAccessPolicy}
                  onChange={(e) => setSelectedAccessPolicy(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-md text-sm"
                >
                  <option value="all">All Policies</option>
                  <option value="public">Public</option>
                  <option value="enterprise_confidential">Enterprise Confidential</option>
                  <option value="team_confidential">Team Confidential</option>
                  <option value="personal_draft">Personal Draft</option>
                </select>
              </div>

              <div>
                <Label htmlFor="scope-filter" className="text-xs">Domain Scope</Label>
                <select
                  id="scope-filter"
                  value={selectedDomainScope}
                  onChange={(e) => setSelectedDomainScope(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-md text-sm"
                >
                  <option value="all">All Scopes</option>
                  <option value="global">Global</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="user">User</option>
                </select>
              </div>
            </div>

            {(selectedFunction !== 'all' || selectedMaturity !== 'all' || selectedAccessPolicy !== 'all' || selectedDomainScope !== 'all') && (
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFunction('all');
                    setSelectedMaturity('all');
                    setSelectedAccessPolicy('all');
                    setSelectedDomainScope('all');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Domain Selection & Upload Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
            <div>
              <Label htmlFor="domain">Knowledge Domain *</Label>
              <select
                id="domain"
                value={uploadSettings.domain}
                onChange={(e) => setUploadSettings(prev => ({ ...prev, domain: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-md"
              >
                {filteredDomains.length > 0 ? (
                  filteredDomains.map((domain: any) => (
                    <option key={domain.domain_id || domain.id} value={domain.domain_id || domain.slug}>
                      {domain.domain_name || domain.name || domain.domain_id || domain.slug}
                    </option>
                  ))
                ) : (
                  <option disabled>
                    No domains match filters 
                    {selectedTier !== 'all' && ` (${domains.filter((d: any) => d.tier === selectedTier).length} in tier ${selectedTier})`}
                    {selectedTier === 'all' && ` (${domains.length} total domains)`}
                  </option>
                )}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Showing {filteredDomains.length} domain{filteredDomains.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div>
              <Label htmlFor="scope">Access Scope</Label>
              <select
                id="scope"
                value={uploadSettings.isGlobal ? 'global' : 'agent'}
                onChange={(e) => {
                  const isGlobal = e.target.value === 'global';
                  setUploadSettings(prev => ({
                    ...prev,
                    isGlobal,
                    selectedAgents: isGlobal ? [] : prev.selectedAgents
                  }));
                }}
                className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-md"
              >
                <option value="global">Global (All Agents)</option>
                <option value="agent">Agent-Specific</option>
              </select>
            </div>
          </div>

          {/* Model Selection Section */}
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div>
              <Label htmlFor="embedding-model" className="flex items-center gap-2">
                Embedding Model
                <span className="text-xs text-muted-foreground font-normal">
                  (Recommended for {currentDomain?.name || 'this domain'})
                </span>
              </Label>
              <select
                id="embedding-model"
                value={uploadSettings.embeddingModel}
                onChange={(e) => setUploadSettings(prev => ({ ...prev, embeddingModel: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-md"
              >
                {/* Recommended Models Section */}
                {recommendedModels.embedding.primary && (
                  <optgroup label={`⭐ Recommended for ${currentDomain?.name || 'this domain'}`}>
                    <option value={recommendedModels.embedding.primary}>
                      {recommendedModels.embedding.primary} - {AVAILABLE_EMBEDDING_MODELS[recommendedModels.embedding.primary as keyof typeof AVAILABLE_EMBEDDING_MODELS]?.provider || 'OpenAI'}
                    </option>
                  </optgroup>
                )}
                {recommendedModels.embedding.specialized && (
                  <optgroup label="🎯 Specialized (Domain-Specific)">
                    <option value={recommendedModels.embedding.specialized}>
                      {recommendedModels.embedding.specialized} - {AVAILABLE_EMBEDDING_MODELS[recommendedModels.embedding.specialized as keyof typeof AVAILABLE_EMBEDDING_MODELS]?.provider || 'Unknown'}
                    </option>
                  </optgroup>
                )}
                {recommendedModels.embedding.alternatives && recommendedModels.embedding.alternatives.length > 0 && (
                  <optgroup label="Alternatives (Recommended)">
                    {recommendedModels.embedding.alternatives.map((model: string) => (
                      <option key={model} value={model}>
                        {model} - {AVAILABLE_EMBEDDING_MODELS[model as keyof typeof AVAILABLE_EMBEDDING_MODELS]?.provider || 'Unknown'}
                      </option>
                    ))}
                  </optgroup>
                )}
                
                {/* OpenAI Models */}
                <optgroup label="OpenAI Models">
                  {Object.entries(AVAILABLE_EMBEDDING_MODELS)
                    .filter(([_, model]) => model.provider === 'OpenAI')
                    .map(([key, model]) => (
                      <option key={key} value={key} disabled={recommendedModels.embedding.primary === key || recommendedModels.embedding.alternatives?.includes(key)}>
                        {model.name} ({key}){recommendedModels.embedding.primary === key ? ' ⭐ Recommended' : ''}
                      </option>
                    ))}
                </optgroup>
                
                {/* HuggingFace Models */}
                <optgroup label="HuggingFace Models (Free)">
                  {Object.entries(AVAILABLE_EMBEDDING_MODELS)
                    .filter(([_, model]) => model.provider === 'HuggingFace')
                    .map(([key, model]) => (
                      <option key={key} value={key} disabled={recommendedModels.embedding.primary === key || recommendedModels.embedding.specialized === key || recommendedModels.embedding.alternatives?.includes(key)}>
                        {model.name} ({key}){recommendedModels.embedding.specialized === key ? ' 🎯 Recommended' : ''}
                      </option>
                    ))}
                </optgroup>
              </select>
              {recommendedModels.embedding.rationale && (
                <p className="text-xs text-muted-foreground mt-1">
                  💡 {recommendedModels.embedding.rationale}
                </p>
              )}
            </div>

          </div>

          <div className="mt-4">
            {!uploadSettings.isGlobal && (
              <div>
                <Label className="mb-4 text-sm font-medium">Target Agents</Label>
                <ScrollArea className="h-72 w-full rounded-md border mt-2">
                  <div className="p-4">
                    {agents.length > 0 ? (
                      agents.map((agent, index) => (
                        <React.Fragment key={agent.id}>
                          <div className="flex items-center space-x-3 py-2">
                            <Checkbox
                              id={`agent-${agent.id}`}
                              checked={uploadSettings.selectedAgents.includes(agent.id)}
                              onCheckedChange={(checked) => {
                                setUploadSettings(prev => ({
                                  ...prev,
                                  selectedAgents: checked
                                    ? [...prev.selectedAgents, agent.id]
                                    : prev.selectedAgents.filter(id => id !== agent.id)
                                }));
                              }}
                            />
                            <div className="flex items-center space-x-3 flex-1">
                              <AgentAvatar
                                avatar={agent.avatar}
                                name={agent.display_name}
                                size="sm"
                              />
                              <Label
                                htmlFor={`agent-${agent.id}`}
                                className="text-sm font-medium cursor-pointer flex-1"
                              >
                                {agent.display_name}
                              </Label>
                            </div>
                          </div>
                          {index < agents.length - 1 && <Separator className="my-1" />}
                        </React.Fragment>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No agents available</p>
                    )}
                  </div>
                </ScrollArea>
                {uploadSettings.selectedAgents.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {uploadSettings.selectedAgents.length} agent(s) selected
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Drop Zone */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          dragActive
            ? 'border-progress-teal bg-progress-teal/5'
            : 'border-neutral-300 hover:border-progress-teal hover:bg-progress-teal/5'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-trust-blue to-progress-teal rounded-lg flex items-center justify-center mx-auto">
            <Upload className="h-8 w-8 text-white" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-deep-charcoal mb-2">
              Upload Knowledge Documents
            </h3>
            <p className="text-medical-gray mb-4">
              Drag and drop files here or click to browse
            </p>
            <p className="text-sm text-medical-gray">
              Supported formats: PDF, Word, Excel, CSV, TXT (max 50MB each)
            </p>
          </div>

          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-progress-teal hover:bg-progress-teal/90"
          >
            <Upload className="mr-2 h-4 w-4" />
            Choose Files
          </Button>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-deep-charcoal">
                Files ({files.length})
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCompletedFiles}
                  disabled={!files.some((f: any) => f.status === 'completed')}
                >
                  Clear Completed
                </Button>
                <Button
                  size="sm"
                  onClick={uploadFiles}
                  disabled={!files.some((f: any) => f.status === 'pending')}
                  className="bg-progress-teal hover:bg-progress-teal/90"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload All
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(file.status)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-deep-charcoal truncate">
                          {file.file.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-medical-gray">
                            {formatFileSize(file.file.size)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {domains.find((d: any) => (d.domain_id || d.slug || d.value) === file.domain)?.domain_name || 
                             domains.find((d: any) => (d.domain_id || d.slug || d.value) === file.domain)?.name ||
                             domains.find((d: any) => (d.domain_id || d.slug || d.value) === file.domain)?.label ||
                             file.domain}
                          </Badge>
                          <Badge variant={file.isGlobal ? 'default' : 'secondary'} className="text-xs">
                            {file.isGlobal ? (
                              <><Globe className="h-3 w-3 mr-1" />Global</>
                            ) : (
                              <><User className="h-3 w-3 mr-1" />
                                {file.selectedAgents.length > 0
                                  ? `${file.selectedAgents.length} agent${file.selectedAgents.length > 1 ? 's' : ''}`
                                  : 'Agent-Specific'
                                }</>
                            )}
                          </Badge>
                          {!file.isGlobal && file.selectedAgents.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {file.selectedAgents.slice(0, 3).map((agentId) => {
                                const agent = agents.find((a: any) => a.id === agentId);
                                return agent ? (
                                  <Badge key={agentId} variant="outline" className="text-xs">
                                    {agent.display_name}
                                  </Badge>
                                ) : null;
                              })}
                              {file.selectedAgents.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{file.selectedAgents.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-medical-gray">
                        {getStatusText(file.status)}
                      </span>
                      {file.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {(file.status === 'uploading' || file.status === 'processing') && (
                    <Progress value={file.progress} className="h-1" />
                  )}

                  {file.error && (
                    <p className="text-xs text-clinical-red mt-2">{file.error}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}