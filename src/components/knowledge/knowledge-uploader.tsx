'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AgentAvatar } from '@/components/ui/agent-avatar';
import { useChatStore } from '@/lib/stores/chat-store';
import {
  Upload,
  FileText,
  X,
  AlertCircle,
  CheckCircle,
  Globe,
  User,
  Brain,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  domain: string;
  isGlobal: boolean;
  agentId?: string;
}

interface KnowledgeUploaderProps {
  onUploadComplete: (files: any[]) => void;
}

export function KnowledgeUploader({ onUploadComplete }: KnowledgeUploaderProps) {
  const { agents } = useChatStore();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSettings, setUploadSettings] = useState({
    domain: 'digital-health',
    isGlobal: true,
    agentId: '',
  });
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

  const domains = [
    { value: 'digital-health', label: 'Digital Health' },
    { value: 'clinical-research', label: 'Clinical Research' },
    { value: 'market-access', label: 'Market Access' },
    { value: 'regulatory', label: 'Regulatory' },
    { value: 'quality-assurance', label: 'Quality Assurance' },
    { value: 'health-economics', label: 'Health Economics' },
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
          agentId: uploadSettings.agentId,
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
      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, progress, status, error } : f
      ));
    };

    try {
      updateProgress(0, 'uploading');

      const formData = new FormData();
      formData.append('files', file.file);
      formData.append('domain', file.domain);
      formData.append('isGlobal', file.isGlobal.toString());
      if (file.agentId) {
        formData.append('agentId', file.agentId);
      }

      // Simulate upload progress
      updateProgress(25, 'uploading');

      const response = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body: formData,
      });

      updateProgress(75, 'uploading');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      updateProgress(100, 'processing');

      // Wait a bit to show processing state
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (result.success && result.totalProcessed > 0) {
        updateProgress(100, 'completed');
        return {
          name: file.file.name,
          type: file.file.type,
          size: file.file.size,
          domain: file.domain,
          isGlobal: file.isGlobal,
          agentId: file.agentId,
        };
      } else {
        throw new Error(result.details || 'Processing failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      updateProgress(0, 'error', errorMessage);
      return null;
    }
  };

  const uploadFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    const uploadPromises = pendingFiles.map(uploadFile);
    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(result => result !== null);

    if (successfulUploads.length > 0) {
      onUploadComplete(successfulUploads);
    }
  };

  const clearCompletedFiles = () => {
    setFiles(prev => prev.filter(f => f.status !== 'completed'));
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

  const getAgentsWithAccess = () => {
    if (uploadSettings.isGlobal) {
      // Global knowledge is accessible to all agents
      return agents;
    } else {
      // Agent-specific knowledge is only accessible to agents with matching knowledge domains
      // or all agents if no domain filtering is set up yet
      return agents.filter(agent => {
        if (!agent.knowledgeDomains || agent.knowledgeDomains.length === 0) {
          // If agent has no knowledge domain restrictions, they can access all knowledge
          return true;
        }
        // Agent can access if their knowledge domains include the selected domain
        return agent.knowledgeDomains.includes(uploadSettings.domain);
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Settings */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="domain">Knowledge Domain</Label>
              <select
                id="domain"
                value={uploadSettings.domain}
                onChange={(e) => setUploadSettings(prev => ({ ...prev, domain: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                {domains.map(domain => (
                  <option key={domain.value} value={domain.value}>
                    {domain.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="scope">Access Scope</Label>
              <select
                id="scope"
                value={uploadSettings.isGlobal ? 'global' : 'agent'}
                onChange={(e) => setUploadSettings(prev => ({
                  ...prev,
                  isGlobal: e.target.value === 'global'
                }))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="global">Global (All Agents)</option>
                <option value="agent">Agent-Specific</option>
              </select>
            </div>

            {!uploadSettings.isGlobal && (
              <div>
                <Label htmlFor="agentId">Target Agent</Label>
                <Input
                  id="agentId"
                  placeholder="Enter agent ID"
                  value={uploadSettings.agentId}
                  onChange={(e) => setUploadSettings(prev => ({ ...prev, agentId: e.target.value }))}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Agent Access Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-trust-blue" />
            Agent Access Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const agentsWithAccess = getAgentsWithAccess();
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-deep-charcoal font-medium">
                      {uploadSettings.isGlobal
                        ? 'All agents will have access to this knowledge'
                        : `Agents with "${domains.find(d => d.value === uploadSettings.domain)?.label}" domain access`
                      }
                    </p>
                    <p className="text-xs text-medical-gray mt-1">
                      {agentsWithAccess.length} agent{agentsWithAccess.length !== 1 ? 's' : ''} will be able to access this knowledge
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {agentsWithAccess.length} / {agents.length} agents
                  </Badge>
                </div>

                {agentsWithAccess.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {agentsWithAccess.map((agent) => (
                      <div key={agent.id} className="flex items-center gap-3 p-3 border rounded-lg bg-background-gray/30">
                        <AgentAvatar
                          avatar={agent.avatar}
                          name={agent.name}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-deep-charcoal truncate">
                            {agent.name}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {agent.knowledgeDomains && agent.knowledgeDomains.length > 0 ? (
                              agent.knowledgeDomains.slice(0, 2).map((domain) => {
                                const domainInfo = domains.find(d => d.value === domain);
                                return (
                                  <Badge
                                    key={domain}
                                    variant="outline"
                                    className={cn(
                                      "text-xs px-1 py-0",
                                      domain === uploadSettings.domain ? "bg-trust-blue/10 text-trust-blue border-trust-blue" : ""
                                    )}
                                  >
                                    {domainInfo?.label.substring(0, 8) || domain}
                                  </Badge>
                                );
                              })
                            ) : (
                              <Badge variant="outline" className="text-xs px-1 py-0 text-medical-gray">
                                All domains
                              </Badge>
                            )}
                            {agent.knowledgeDomains && agent.knowledgeDomains.length > 2 && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                +{agent.knowledgeDomains.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-medical-gray">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No agents have access to this knowledge domain</p>
                    <p className="text-xs mt-1">Consider changing the domain or making it global</p>
                  </div>
                )}
              </div>
            );
          })()}
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
                  disabled={!files.some(f => f.status === 'completed')}
                >
                  Clear Completed
                </Button>
                <Button
                  size="sm"
                  onClick={uploadFiles}
                  disabled={!files.some(f => f.status === 'pending')}
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
                            {domains.find(d => d.value === file.domain)?.label}
                          </Badge>
                          <Badge variant={file.isGlobal ? 'default' : 'secondary'} className="text-xs">
                            {file.isGlobal ? (
                              <><Globe className="h-3 w-3 mr-1" />Global</>
                            ) : (
                              <><User className="h-3 w-3 mr-1" />Agent-Specific</>
                            )}
                          </Badge>
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