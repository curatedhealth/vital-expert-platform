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
  chatModel: string;
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
  const [selectedTier, setSelectedTier] = useState<number>(1); // Default to Tier 1
  const [uploadSettings, setUploadSettings] = useState({
    domain: 'digital_health',
    isGlobal: true,
    selectedAgents: [] as string[],
    embeddingModel: 'text-embedding-3-large', // Default embedding model
    chatModel: 'gpt-4-turbo-preview', // Default chat model
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

  // Get domains filtered by selected tier
  const filteredDomains = domains.filter((d: any) => d.tier === selectedTier);

  // Get current domain's information
  const currentDomain = domains.find((d: any) => d.slug === uploadSettings.domain);

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

  // Load knowledge domains from database
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const { data, error } = await supabase
          .from('knowledge_domains')
          .select('*')
          .eq('is_active', true)
          .order('priority');

        if (error) throw error;

        if (data && data.length > 0) {
          setDomains(data);
          // Only set default domain on first load
          if (!domainInitialized) {
            const tier1Domains = data.filter((d: any) => d.tier === 1);
            if (tier1Domains.length > 0) {
              setUploadSettings(prev => ({
                ...prev,
                domain: tier1Domains[0].slug
              }));
            }
            setDomainInitialized(true);
          }
        }
      } catch (err) {
        console.error('Error fetching knowledge domains:', err);
      }
    };

    fetchDomains();
  }, [supabase, domainInitialized]);

  // Update domain when tier changes
  useEffect(() => {
    if (domains.length > 0 && domainInitialized) {
      const tierDomains = domains.filter((d: any) => d.tier === selectedTier);
      if (tierDomains.length > 0) {
        // Check if current domain is in the selected tier
        const currentDomainInTier = tierDomains.find((d: any) => d.slug === uploadSettings.domain);
        if (!currentDomainInTier) {
          // Set to first domain of the new tier
          setUploadSettings(prev => ({
            ...prev,
            domain: tierDomains[0].slug
          }));
        }
      }
    }
  }, [selectedTier, domains, domainInitialized, uploadSettings.domain]);

  // Update recommended models when domain changes
  useEffect(() => {
    if (currentDomain?.recommended_models) {
      const models = currentDomain.recommended_models as any;
      setUploadSettings(prev => ({
        ...prev,
        embeddingModel: models.embedding?.primary || 'text-embedding-3-large',
        chatModel: models.chat?.primary || 'gpt-4-turbo-preview',
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
          chatModel: uploadSettings.chatModel,
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
      formData.append('domain', file.domain);
      formData.append('isGlobal', file.isGlobal.toString());
      formData.append('embeddingModel', file.embeddingModel);
      formData.append('chatModel', file.chatModel);
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
          chatModel: file.chatModel,
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
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tier">Domain Tier</Label>
              <select
                id="tier"
                value={selectedTier}
                onChange={(e) => setSelectedTier(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value={1}>Tier 1: Core ({domains.filter((d: any) => d.tier === 1).length})</option>
                <option value={2}>Tier 2: Specialized ({domains.filter((d: any) => d.tier === 2).length})</option>
                <option value={3}>Tier 3: Emerging ({domains.filter((d: any) => d.tier === 3).length})</option>
              </select>
            </div>

            <div>
              <Label htmlFor="domain">Knowledge Domain</Label>
              <select
                id="domain"
                value={uploadSettings.domain}
                onChange={(e) => setUploadSettings(prev => ({ ...prev, domain: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                {filteredDomains.length > 0 ? (
                  filteredDomains.map((domain: any) => (
                    <option key={domain.id} value={domain.slug}>
                      {domain.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No domains available</option>
                )}
              </select>
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
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="global">Global (All Agents)</option>
                <option value="agent">Agent-Specific</option>
              </select>
            </div>
          </div>

          {/* Model Selection Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <optgroup label="Primary (Recommended)">
                  <option value={recommendedModels.embedding.primary}>
                    ⭐ {recommendedModels.embedding.primary}
                  </option>
                </optgroup>
                {recommendedModels.embedding.specialized && (
                  <optgroup label="Specialized">
                    <option value={recommendedModels.embedding.specialized}>
                      🎯 {recommendedModels.embedding.specialized}
                    </option>
                  </optgroup>
                )}
                {recommendedModels.embedding.alternatives && recommendedModels.embedding.alternatives.length > 0 && (
                  <optgroup label="Alternatives">
                    {recommendedModels.embedding.alternatives.map((model: string) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {recommendedModels.embedding.rationale && (
                <p className="text-xs text-muted-foreground mt-1">
                  💡 {recommendedModels.embedding.rationale}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="chat-model" className="flex items-center gap-2">
                Chat Model
                <span className="text-xs text-muted-foreground font-normal">
                  (Recommended for {currentDomain?.name || 'this domain'})
                </span>
              </Label>
              <select
                id="chat-model"
                value={uploadSettings.chatModel}
                onChange={(e) => setUploadSettings(prev => ({ ...prev, chatModel: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <optgroup label="Primary (Recommended)">
                  <option value={recommendedModels.chat.primary}>
                    ⭐ {recommendedModels.chat.primary}
                  </option>
                </optgroup>
                {recommendedModels.chat.specialized && (
                  <optgroup label="Specialized">
                    <option value={recommendedModels.chat.specialized}>
                      🎯 {recommendedModels.chat.specialized}
                    </option>
                  </optgroup>
                )}
                {recommendedModels.chat.alternatives && recommendedModels.chat.alternatives.length > 0 && (
                  <optgroup label="Alternatives">
                    {recommendedModels.chat.alternatives.map((model: string) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {recommendedModels.chat.rationale && (
                <p className="text-xs text-muted-foreground mt-1">
                  💡 {recommendedModels.chat.rationale}
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
            : 'border-gray-300 hover:border-progress-teal hover:bg-progress-teal/5'
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
                            {domains.find((d: any) => d.value === file.domain)?.label}
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