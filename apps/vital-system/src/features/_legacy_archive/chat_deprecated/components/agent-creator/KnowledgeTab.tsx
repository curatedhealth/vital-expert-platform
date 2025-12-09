import React from 'react';
import { Plus, X, Zap, Brain, CheckCircle } from 'lucide-react';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Input } from '@vital/ui';
import { Label } from '@vital/ui';
import { cn } from '@/lib/utils';

import type { AgentFormData } from './types';

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
              className="w-4 h-4 text-market-purple bg-neutral-100 border-neutral-300 rounded focus:ring-market-purple"
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
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center">
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
                      <Plus className="h-8 w-8 text-neutral-400" />
                      <span className="text-sm text-neutral-600">
                        Click to upload files or drag and drop
                      </span>
                      <span className="text-xs text-neutral-500">
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
                        <span className="text-xs text-neutral-500">
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
                      return 'bg-neutral-500/10 text-neutral-700 border-neutral-300';
                  }
                };

                return (
                  <Button
                    key={domain.value}
                    type="button"
                    variant={formData.knowledgeDomains.includes(domain.value) ? 'default' : 'outline'}
                    size="sm"
                    className="h-auto py-2 px-3 text-xs justify-start"
                    onClick={() => handleKnowledgeDomainToggle(domain.value)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {formData.knowledgeDomains.includes(domain.value) && (
                        <CheckCircle className="h-3 w-3 flex-shrink-0" />
                      )}
                      <span className="flex-1 text-left">{domain.label}</span>
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

