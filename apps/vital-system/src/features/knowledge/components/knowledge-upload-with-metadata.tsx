'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  X,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Edit2,
  FileCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

// Import existing metadata services
import { SmartMetadataExtractor } from '@/lib/services/metadata/smart-metadata-extractor';
import { defaultFileRenamer } from '@/lib/services/metadata/file-renamer';

interface ExtractedMetadata {
  title?: string;
  clean_title?: string;
  source_name?: string;
  year?: number;
  document_type?: string;
  regulatory_body?: string;
  therapeutic_area?: string;
  author?: string;
  organization?: string;
  keywords?: string[];
  summary?: string;
  confidence?: {
    source?: number;
    year?: number;
    type?: number;
    [key: string]: number | undefined;
  };
}

interface EnhancedUploadFile {
  file: File;
  id: string;
  status: 'extracting' | 'ready' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  // Extracted metadata
  metadata: ExtractedMetadata;
  suggestedFilename: string;
  // User-editable fields
  editedMetadata: ExtractedMetadata;
  useAIExtraction: boolean;
  isExpanded: boolean;
}

interface KnowledgeUploadWithMetadataProps {
  onUploadComplete: (files: unknown[]) => void;
  defaultDomain?: string;
}

export function KnowledgeUploadWithMetadata({
  onUploadComplete,
  defaultDomain = 'regulatory_affairs'
}: KnowledgeUploadWithMetadataProps) {
  const [files, setFiles] = useState<EnhancedUploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [useAIGlobally, setUseAIGlobally] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
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
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-muted-foreground';
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getConfidenceLabel = (confidence?: number) => {
    if (!confidence) return 'Unknown';
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  };

  // Extract metadata from file
  const extractMetadata = async (file: File, useAI: boolean = false): Promise<ExtractedMetadata> => {
    const extractor = new SmartMetadataExtractor({ useAI });

    // Extract from filename first
    const filenameMeta = await extractor.extractFromFilename(file.name);

    // For text-based files, also extract from content
    let contentMeta: ExtractedMetadata = {};
    if (file.type === 'text/plain' || file.type === 'text/csv') {
      try {
        const content = await file.text();
        contentMeta = await extractor.extractFromContent(content.substring(0, 10000), file.name);
      } catch (err) {
        console.warn('Could not read file content for extraction:', err);
      }
    }

    // Merge metadata (content takes precedence for higher confidence)
    return extractor.mergeMetadata(filenameMeta, contentMeta);
  };

  // Generate suggested filename
  const generateSuggestedFilename = (metadata: ExtractedMetadata, originalFilename: string): string => {
    const extension = originalFilename.split('.').pop()?.toLowerCase() || '';
    return defaultFileRenamer.generateFilename({
      source_name: metadata.source_name,
      document_type: metadata.document_type,
      year: metadata.year,
      clean_title: metadata.clean_title || metadata.title,
      extension,
    }, originalFilename);
  };

  // Add files with metadata extraction
  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    setIsExtracting(true);

    const processedFiles: EnhancedUploadFile[] = [];

    for (const file of fileArray) {
      // Validate file
      if (!acceptedTypes.includes(file.type)) {
        console.warn(`Unsupported file type: ${file.type}`);
        continue;
      }
      if (file.size > 50 * 1024 * 1024) {
        console.warn('File too large:', file.name);
        continue;
      }

      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

      // Create initial file entry
      const initialFile: EnhancedUploadFile = {
        file,
        id,
        status: 'extracting',
        progress: 0,
        metadata: {},
        suggestedFilename: file.name,
        editedMetadata: {},
        useAIExtraction: useAIGlobally,
        isExpanded: true, // Expand first to show extracted metadata
      };

      processedFiles.push(initialFile);
    }

    // Add files immediately with extracting status
    setFiles(prev => [...prev, ...processedFiles]);

    // Extract metadata for each file
    for (const fileEntry of processedFiles) {
      try {
        const metadata = await extractMetadata(fileEntry.file, fileEntry.useAIExtraction);
        const suggestedFilename = generateSuggestedFilename(metadata, fileEntry.file.name);

        setFiles(prev => prev.map(f =>
          f.id === fileEntry.id
            ? {
                ...f,
                status: 'ready',
                metadata,
                editedMetadata: { ...metadata },
                suggestedFilename,
              }
            : f
        ));
      } catch (err) {
        console.error('Metadata extraction failed:', err);
        setFiles(prev => prev.map(f =>
          f.id === fileEntry.id
            ? {
                ...f,
                status: 'ready',
                metadata: { title: fileEntry.file.name },
                editedMetadata: { title: fileEntry.file.name },
              }
            : f
        ));
      }
    }

    setIsExtracting(false);
  }, [useAIGlobally]);

  // Re-extract metadata with AI
  const reExtractWithAI = async (fileId: string) => {
    const fileEntry = files.find(f => f.id === fileId);
    if (!fileEntry) return;

    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, status: 'extracting', useAIExtraction: true } : f
    ));

    try {
      const metadata = await extractMetadata(fileEntry.file, true);
      const suggestedFilename = generateSuggestedFilename(metadata, fileEntry.file.name);

      setFiles(prev => prev.map(f =>
        f.id === fileId
          ? {
              ...f,
              status: 'ready',
              metadata,
              editedMetadata: { ...metadata },
              suggestedFilename,
            }
          : f
      ));
    } catch (err) {
      console.error('AI extraction failed:', err);
      setFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: 'ready' } : f
      ));
    }
  };

  // Update edited metadata
  const updateMetadata = (fileId: string, field: keyof ExtractedMetadata, value: any) => {
    setFiles(prev => prev.map(f => {
      if (f.id !== fileId) return f;
      const newEditedMetadata = { ...f.editedMetadata, [field]: value };
      const newSuggestedFilename = generateSuggestedFilename(newEditedMetadata, f.file.name);
      return { ...f, editedMetadata: newEditedMetadata, suggestedFilename: newSuggestedFilename };
    }));
  };

  // Toggle file expansion
  const toggleExpand = (fileId: string) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, isExpanded: !f.isExpanded } : f
    ));
  };

  // Remove file
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  // Upload files
  const uploadFiles = async () => {
    const readyFiles = files.filter(f => f.status === 'ready');
    if (readyFiles.length === 0) return;

    for (const fileEntry of readyFiles) {
      setFiles(prev => prev.map(f =>
        f.id === fileEntry.id ? { ...f, status: 'uploading', progress: 0 } : f
      ));

      try {
        const formData = new FormData();
        formData.append('files', fileEntry.file);
        formData.append('domain', defaultDomain);

        // Add extracted metadata
        formData.append('metadata', JSON.stringify(fileEntry.editedMetadata));
        formData.append('suggestedFilename', fileEntry.suggestedFilename);

        setFiles(prev => prev.map(f =>
          f.id === fileEntry.id ? { ...f, progress: 25 } : f
        ));

        const response = await fetch('/api/knowledge/upload', {
          method: 'POST',
          body: formData,
        });

        setFiles(prev => prev.map(f =>
          f.id === fileEntry.id ? { ...f, progress: 75 } : f
        ));

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        setFiles(prev => prev.map(f =>
          f.id === fileEntry.id ? { ...f, status: 'completed', progress: 100 } : f
        ));

      } catch (err) {
        setFiles(prev => prev.map(f =>
          f.id === fileEntry.id ? { ...f, status: 'error', error: 'Upload failed' } : f
        ));
      }
    }

    const completedFiles = files.filter(f => f.status === 'completed');
    if (completedFiles.length > 0) {
      onUploadComplete(completedFiles.map(f => ({
        name: f.suggestedFilename,
        originalName: f.file.name,
        metadata: f.editedMetadata,
      })));
    }
  };

  // Drag handlers
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

  const getStatusIcon = (status: EnhancedUploadFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'extracting':
        return <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />;
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <FileCheck className="h-5 w-5 text-green-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Toggle */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <div>
            <p className="font-medium">AI-Powered Metadata Extraction</p>
            <p className="text-sm text-muted-foreground">
              Use GPT-4o-mini to extract metadata from document content
            </p>
          </div>
        </div>
        <Button
          variant={useAIGlobally ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUseAIGlobally(!useAIGlobally)}
          className={useAIGlobally ? 'bg-purple-600 hover:bg-purple-700' : ''}
        >
          {useAIGlobally ? 'AI Enabled' : 'Enable AI'}
        </Button>
      </div>

      {/* Drop Zone */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200',
          dragActive
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
            : 'border-muted-foreground/25 hover:border-purple-400 hover:bg-muted/50'
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
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
            <Upload className="h-8 w-8 text-white" />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              Upload with Smart Metadata Extraction
            </h3>
            <p className="text-muted-foreground mb-2">
              Drop files here or click to browse. Metadata will be automatically extracted.
            </p>
            <p className="text-sm text-muted-foreground">
              Supported: PDF, Word, Excel, CSV, TXT (max 50MB)
            </p>
          </div>

          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Upload className="mr-2 h-4 w-4" />
            Choose Files
          </Button>
        </div>
      </div>

      {/* File List with Metadata */}
      <AnimatePresence mode="popLayout">
        {files.map((fileEntry) => (
          <motion.div
            key={fileEntry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="overflow-hidden">
              <Collapsible open={fileEntry.isExpanded} onOpenChange={() => toggleExpand(fileEntry.id)}>
                {/* Header */}
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(fileEntry.status)}
                        <div>
                          <CardTitle className="text-sm font-medium">
                            {fileEntry.file.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {formatFileSize(fileEntry.file.size)}
                            {fileEntry.metadata.source_name && (
                              <> • Source: <span className="font-medium">{fileEntry.metadata.source_name}</span></>
                            )}
                            {fileEntry.metadata.year && (
                              <> • Year: <span className="font-medium">{fileEntry.metadata.year}</span></>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {fileEntry.status === 'ready' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(fileEntry.id);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        {fileEntry.isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    {(fileEntry.status === 'uploading' || fileEntry.status === 'processing') && (
                      <Progress value={fileEntry.progress} className="h-1 mt-2" />
                    )}
                  </CardHeader>
                </CollapsibleTrigger>

                {/* Metadata Editor */}
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4">
                    {fileEntry.status === 'extracting' ? (
                      <div className="flex items-center justify-center py-8 gap-3 text-muted-foreground">
                        <Sparkles className="h-5 w-5 animate-pulse text-purple-600" />
                        <span>Extracting metadata...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Suggested Filename */}
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileCheck className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium">Suggested Filename</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              Auto-generated
                            </Badge>
                          </div>
                          <p className="text-sm mt-1 font-mono text-green-700 dark:text-green-400 break-all">
                            {fileEntry.suggestedFilename}
                          </p>
                        </div>

                        {/* Metadata Fields Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {/* Source */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <Label className="text-xs">Source</Label>
                              <Badge
                                variant="outline"
                                className={cn('text-xs', getConfidenceColor(fileEntry.metadata.confidence?.source))}
                              >
                                {getConfidenceLabel(fileEntry.metadata.confidence?.source)}
                              </Badge>
                            </div>
                            <Input
                              value={fileEntry.editedMetadata.source_name || ''}
                              onChange={(e) => updateMetadata(fileEntry.id, 'source_name', e.target.value)}
                              placeholder="e.g., FDA, EMA, WHO"
                              className="h-8 text-sm"
                            />
                          </div>

                          {/* Document Type */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <Label className="text-xs">Document Type</Label>
                              <Badge
                                variant="outline"
                                className={cn('text-xs', getConfidenceColor(fileEntry.metadata.confidence?.type))}
                              >
                                {getConfidenceLabel(fileEntry.metadata.confidence?.type)}
                              </Badge>
                            </div>
                            <Input
                              value={fileEntry.editedMetadata.document_type || ''}
                              onChange={(e) => updateMetadata(fileEntry.id, 'document_type', e.target.value)}
                              placeholder="e.g., Regulatory Guidance"
                              className="h-8 text-sm"
                            />
                          </div>

                          {/* Year */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <Label className="text-xs">Year</Label>
                              <Badge
                                variant="outline"
                                className={cn('text-xs', getConfidenceColor(fileEntry.metadata.confidence?.year))}
                              >
                                {getConfidenceLabel(fileEntry.metadata.confidence?.year)}
                              </Badge>
                            </div>
                            <Input
                              type="number"
                              value={fileEntry.editedMetadata.year || ''}
                              onChange={(e) => updateMetadata(fileEntry.id, 'year', parseInt(e.target.value) || undefined)}
                              placeholder="e.g., 2024"
                              className="h-8 text-sm"
                            />
                          </div>

                          {/* Therapeutic Area */}
                          <div>
                            <Label className="text-xs mb-1 block">Therapeutic Area</Label>
                            <Input
                              value={fileEntry.editedMetadata.therapeutic_area || ''}
                              onChange={(e) => updateMetadata(fileEntry.id, 'therapeutic_area', e.target.value)}
                              placeholder="e.g., Oncology"
                              className="h-8 text-sm"
                            />
                          </div>

                          {/* Regulatory Body */}
                          <div>
                            <Label className="text-xs mb-1 block">Regulatory Body</Label>
                            <Input
                              value={fileEntry.editedMetadata.regulatory_body || ''}
                              onChange={(e) => updateMetadata(fileEntry.id, 'regulatory_body', e.target.value)}
                              placeholder="e.g., FDA, EMA"
                              className="h-8 text-sm"
                            />
                          </div>

                          {/* Author/Organization */}
                          <div>
                            <Label className="text-xs mb-1 block">Author/Organization</Label>
                            <Input
                              value={fileEntry.editedMetadata.author || fileEntry.editedMetadata.organization || ''}
                              onChange={(e) => updateMetadata(fileEntry.id, 'author', e.target.value)}
                              placeholder="e.g., FDA CDER"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>

                        {/* Title */}
                        <div>
                          <Label className="text-xs mb-1 block">Clean Title</Label>
                          <Input
                            value={fileEntry.editedMetadata.clean_title || fileEntry.editedMetadata.title || ''}
                            onChange={(e) => updateMetadata(fileEntry.id, 'clean_title', e.target.value)}
                            placeholder="Document title"
                            className="text-sm"
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => reExtractWithAI(fileEntry.id)}
                            disabled={fileEntry.status === 'extracting'}
                            className="gap-2"
                          >
                            {fileEntry.status === 'extracting' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                            Re-extract with AI
                          </Button>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Edit2 className="h-3 w-3" />
                            <span>Edit fields above to refine metadata</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground">
            {files.filter(f => f.status === 'ready').length} file(s) ready to upload
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setFiles([])}
            >
              Clear All
            </Button>
            <Button
              onClick={uploadFiles}
              disabled={!files.some(f => f.status === 'ready')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload {files.filter(f => f.status === 'ready').length} File(s)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
