import React, { useState, useEffect } from 'react';
import { Plus, X, Zap, Brain, CheckCircle, AlertCircle, Database, Cloud } from 'lucide-react';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Input } from '@vital/ui';
import { Label } from '@vital/ui';
import { cn } from '@/lib/utils';

import type { AgentFormData } from './types';

interface DomainContentStatus {
  domain_id: string;
  status: 'active' | 'inactive' | 'partial';
  supabase: { has_content: boolean; chunk_count: number };
  pinecone: { has_content: boolean };
}

interface KnowledgeTabProps {
  formData: AgentFormData;
  newKnowledgeUrl: string;
  isProcessingKnowledge: boolean;
  knowledgeProcessingStatus: string | null;
  knowledgeDomains: Array<{
    value: string;
    label: string;
    tier: number;
    recommended_embedding?: string;
    recommended_chat?: string;
    color?: string;
  }>;
  loadingDomains: boolean;
  setNewKnowledgeUrl: (value: string) => void;
  setFormData: React.Dispatch<React.SetStateAction<AgentFormData>>;
  handleKnowledgeUrlAdd: (url: string) => void;
  handleKnowledgeUrlRemove: (url: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileRemove: (file: File) => void;
  processKnowledgeSources: () => void;
  handleKnowledgeDomainToggle: (domain: string) => void;
}

export function KnowledgeTab({
  formData,
  newKnowledgeUrl,
  isProcessingKnowledge,
  knowledgeProcessingStatus,
  knowledgeDomains,
  loadingDomains,
  setNewKnowledgeUrl,
  setFormData,
  handleKnowledgeUrlAdd,
  handleKnowledgeUrlRemove,
  handleFileUpload,
  handleFileRemove,
  processKnowledgeSources,
  handleKnowledgeDomainToggle,
}: KnowledgeTabProps) {
  const [domainContentStatus, setDomainContentStatus] = useState<Record<string, DomainContentStatus>>({});
  const [loadingStatus, setLoadingStatus] = useState<Record<string, boolean>>({});

  // Fetch content status for each domain
  useEffect(() => {
    const fetchDomainStatuses = async () => {
      for (const domain of knowledgeDomains) {
        try {
          setLoadingStatus(prev => ({ ...prev, [domain.value]: true }));
          const response = await fetch(`/api/knowledge-domains/${domain.value}/content-status`);
          if (response.ok) {
            const status: DomainContentStatus = await response.json();
            setDomainContentStatus(prev => ({ ...prev, [domain.value]: status }));
          } else {
            // Domain not found or error - mark as inactive
            setDomainContentStatus(prev => ({
              ...prev,
              [domain.value]: {
                domain_id: domain.value,
                status: 'inactive',
                supabase: { has_content: false, chunk_count: 0 },
                pinecone: { has_content: false },
              },
            }));
          }
        } catch (error) {
          console.error(`Failed to fetch status for domain ${domain.value}:`, error);
          // Mark as inactive on error
          setDomainContentStatus(prev => ({
            ...prev,
            [domain.value]: {
              domain_id: domain.value,
              status: 'inactive',
              supabase: { has_content: false, chunk_count: 0 },
              pinecone: { has_content: false },
            },
          }));
        } finally {
          setLoadingStatus(prev => ({ ...prev, [domain.value]: false }));
        }
      }
    };

    if (knowledgeDomains.length > 0) {
      fetchDomainStatuses();
    }
  }, [knowledgeDomains]);

  const getDomainStatus = (domainValue: string): DomainContentStatus | null => {
    return domainContentStatus[domainValue] || null;
  };

  const isDomainActive = (domainValue: string): boolean => {
    const status = getDomainStatus(domainValue);
    return status?.status === 'active' || false;
  };

  const handleDomainToggleWithCheck = (domain: string) => {
    // Only allow toggling if domain is active (has content)
    const status = getDomainStatus(domain);
    if (status && status.status !== 'active') {
      // Show warning - domain has no content yet
      const domainInfo = knowledgeDomains.find(d => d.value === domain);
      alert(`Domain "${domainInfo?.label || domain}" has no content yet.\n\nPlease upload documents to this domain first before assigning it to an agent.`);
      return;
    }
    handleKnowledgeDomainToggle(domain);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-4 w-4 flex-shrink-0" />
            <span>Knowledge Base (RAG)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="ragEnabled"
              checked={formData.ragEnabled}
              onChange={(e) => setFormData((prev) => ({ ...prev, ragEnabled: e.target.checked }))}
              className="w-4 h-4 text-market-purple bg-gray-100 border-gray-300 rounded focus:ring-market-purple"
            />
            <Label htmlFor="ragEnabled" className="flex items-center gap-2">
              <Zap className="h-4 w-4 flex-shrink-0" />
              <span>Enable Knowledge Base Integration</span>
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
                  Add URLs to documentation, research papers, PDFs, or knowledge sources for RAG
                  processing
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
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-background-gray rounded"
                      >
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
                      <div
                        className={`mt-2 p-2 rounded text-xs ${
                          knowledgeProcessingStatus.includes('Successfully')
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : knowledgeProcessingStatus.includes('Error') ||
                              knowledgeProcessingStatus.includes('Failed')
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
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
            <Brain className="h-4 w-4 flex-shrink-0" />
            <span>Knowledge Domains Access</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>
              Knowledge Domain Access{' '}
              {loadingDomains && <span className="ml-2 text-xs text-medical-gray">(Loading...)</span>}
            </Label>
            <p className="text-xs text-medical-gray mb-3">
              Select which knowledge domains this agent can access. Agents will only see knowledge from
              their assigned domains.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {knowledgeDomains.map((domain) => {
                const getTierBadgeColor = (tier: number) => {
                  switch (tier) {
                    case 1:
                      return 'bg-blue-500/10 text-blue-700 border-blue-300';
                    case 2:
                      return 'bg-purple-500/10 text-purple-700 border-purple-300';
                    case 3:
                      return 'bg-green-500/10 text-green-700 border-green-300';
                    default:
                      return 'bg-gray-500/10 text-gray-700 border-gray-300';
                  }
                };

                const status = getDomainStatus(domain.value);
                const isLoading = loadingStatus[domain.value];
                const isActive = isDomainActive(domain.value);
                const isSelected = formData.knowledgeDomains.includes(domain.value);
                const isDisabled = !isActive && !isLoading;

                return (
                  <Button
                    key={domain.value}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      "h-auto py-2 px-3 text-xs justify-start relative",
                      isDisabled && "opacity-50 cursor-not-allowed",
                      isLoading && "opacity-70"
                    )}
                    onClick={() => !isDisabled && handleDomainToggleWithCheck(domain.value)}
                    disabled={isDisabled || isLoading}
                    title={
                      isDisabled
                        ? 'Domain has no content yet. Upload documents to this domain first.'
                        : isLoading
                        ? 'Checking content status...'
                        : status?.status === 'partial'
                        ? 'Domain has content in one source only. Full sync recommended.'
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-2 w-full">
                      {isSelected && (
                        <CheckCircle className="h-3 w-3 flex-shrink-0" />
                      )}
                      {!isSelected && isDisabled && (
                        <AlertCircle className="h-3 w-3 flex-shrink-0 text-gray-400" />
                      )}
                      {isLoading && (
                        <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin flex-shrink-0" />
                      )}
                      <span className="flex-1 text-left">{domain.label}</span>
                      
                      {/* Content Status Indicators */}
                      {status && !isLoading && (
                        <div className="flex items-center gap-1 ml-auto">
                          {status.supabase.has_content ? (
                            <Database className="h-3 w-3 text-green-600" title={`Supabase: ${status.supabase.chunk_count} chunks`} />
                          ) : (
                            <Database className="h-3 w-3 text-gray-300" title="No Supabase content" />
                          )}
                          {status.pinecone.has_content ? (
                            <Cloud className="h-3 w-3 text-green-600" title="Pinecone: Has content" />
                          ) : (
                            <Cloud className="h-3 w-3 text-gray-300" title="No Pinecone content" />
                          )}
                        </div>
                      )}
                      
                      {domain.tier && (
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] px-1 py-0 h-4 ml-auto',
                            getTierBadgeColor(domain.tier)
                          )}
                        >
                          T{domain.tier}
                        </Badge>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
            
            {/* Status Legend */}
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Database className="h-3 w-3 text-green-600" />
                  <span>Supabase content</span>
                </div>
                <div className="flex items-center gap-1">
                  <Cloud className="h-3 w-3 text-green-600" />
                  <span>Pinecone namespace</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-gray-400" />
                  <span>Inactive (no content)</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Only domains with content in both Supabase and Pinecone can be assigned. Upload documents first to activate domains.
              </p>
            </div>
          </div>

          <div>
            <Label>Selected Knowledge Domains</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.knowledgeDomains.map((domain) => {
                const domainInfo = knowledgeDomains.find((d: any) => d.value === domain);
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
                <p className="text-xs text-medical-gray italic">
                  No knowledge domains selected - agent will have access to all knowledge
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

