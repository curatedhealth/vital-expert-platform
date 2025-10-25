/**
 * Artifact Manager Component
 * Handles file generation, preview, and export for AI-generated content
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Eye,
  Share2,
  Copy,
  Check,
  Code,
  FileSpreadsheet,
  FileImage,
  File,
  X,
  ChevronDown,
  ChevronUp,
  Folder,
  Plus
} from 'lucide-react';
import React, { useState, useCallback } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog';
import { Progress } from '@/shared/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/services/utils';
import type { Artifact, ArtifactType, ExportFormat } from '@/types/chat.types';

interface ArtifactManagerProps {
  artifacts: Artifact[];
  className?: string;
  onPreview?: (artifact: Artifact) => void;
  onExport?: (artifact: Artifact, format: ExportFormat) => void;
  onShare?: (artifact: Artifact) => void;
  isGenerating?: boolean;
  generationProgress?: number;
}

const ARTIFACT_CONFIG: Record<ArtifactType, any> = {
  'clinical-protocol': {
    icon: FileText,
    label: 'Clinical Protocol',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    exportFormats: ['pdf', 'docx', 'md']
  },
  'regulatory-document': {
    icon: FileText,
    label: 'Regulatory Document',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    exportFormats: ['pdf', 'docx']
  },
  'research-proposal': {
    icon: FileText,
    label: 'Research Proposal',
    color: 'bg-green-100 text-green-800 border-green-300',
    exportFormats: ['pdf', 'docx', 'latex']
  },
  'data-analysis': {
    icon: FileSpreadsheet,
    label: 'Data Analysis',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    exportFormats: ['xlsx', 'csv', 'json']
  },
  'code-snippet': {
    icon: Code,
    label: 'Code',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    exportFormats: ['txt', 'js', 'py', 'r']
  },
  'visualization': {
    icon: FileImage,
    label: 'Visualization',
    color: 'bg-pink-100 text-pink-800 border-pink-300',
    exportFormats: ['png', 'svg', 'pdf']
  },
  'report': {
    icon: FileText,
    label: 'Report',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    exportFormats: ['pdf', 'docx', 'html']
  }
} as const;

const EXPORT_FORMATS: Record<ExportFormat, any> = {
  'pdf': { label: 'PDF', icon: FileText },
  'docx': { label: 'Word', icon: FileText },
  'xlsx': { label: 'Excel', icon: FileSpreadsheet },
  'csv': { label: 'CSV', icon: FileSpreadsheet },
  'json': { label: 'JSON', icon: Code },
  'md': { label: 'Markdown', icon: FileText },
  'latex': { label: 'LaTeX', icon: FileText },
  'txt': { label: 'Text', icon: File },
  'js': { label: 'JavaScript', icon: Code },
  'py': { label: 'Python', icon: Code },
  'r': { label: 'R Script', icon: Code },
  'png': { label: 'PNG', icon: FileImage },
  'svg': { label: 'SVG', icon: FileImage },
  'html': { label: 'HTML', icon: Code }
} as const;

const ArtifactItem: React.FC<{
  artifact: Artifact;
  onPreview?: (artifact: Artifact) => void;
  onExport?: (artifact: Artifact, format: ExportFormat) => void;
  onShare?: (artifact: Artifact) => void;
}> = ({ artifact, onPreview, onExport, onShare }) => {
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  // eslint-disable-next-line security/detect-object-injection
  const config = ARTIFACT_CONFIG[artifact.type];
  const ArtifactIcon = config.icon;

  const handleCopy = () => {
    if (artifact.content) {
      navigator.clipboard.writeText(artifact.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = (format: ExportFormat) => {
    onExport?.(artifact, format);
    setShowExportOptions(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // eslint-disable-next-line security/detect-object-injection
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              config.color.replace('text-', 'bg-').replace('border-', '').replace('100', '50')
            )}>
              <ArtifactIcon className="h-5 w-5" />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <h4 className="font-medium text-sm line-clamp-1">
                  {artifact.title}
                </h4>
                {artifact.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {artifact.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPreview?.(artifact)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Preview</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="h-8 w-8 p-0"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {copied ? 'Copied!' : 'Copy content'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onShare?.(artifact)}
                        className="h-8 w-8 p-0"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Share</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={cn("text-xs", config.color)}>
                <ArtifactIcon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>

              {artifact.generatedBy && (
                <Badge variant="secondary" className="text-xs">
                  {artifact.generatedBy}
                </Badge>
              )}

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{formatSize(artifact.size || 0)}</span>
                <span>•</span>
                <span>{formatDate(artifact.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="h-7 text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Export
                {showExportOptions ? (
                  <ChevronUp className="h-3 w-3 ml-1" />
                ) : (
                  <ChevronDown className="h-3 w-3 ml-1" />
                )}
              </Button>

              {artifact.confidence && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Quality:</span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(artifact.confidence * 100)}%
                  </Badge>
                </div>
              )}
            </div>

            {showExportOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t pt-2 mt-2"
              >
                <div className="flex items-center gap-1 flex-wrap">
                  {config.exportFormats.map((format) => {
                    // eslint-disable-next-line security/detect-object-injection

                    return (
                      <Button
                        key={format}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExport(format)}
                        className="h-6 text-xs"
                      >
                        <formatConfig.icon className="h-3 w-3 mr-1" />
                        {formatConfig.label}
                      </Button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ArtifactManager: React.FC<ArtifactManagerProps> = ({
  artifacts,
  className,
  onPreview,
  onExport,
  onShare,
  isGenerating = false,
  generationProgress = 0
}) => {
  const [previewArtifact, setPreviewArtifact] = useState<Artifact | null>(null);

  const handlePreview = useCallback((artifact: Artifact) => {
    setPreviewArtifact(artifact);
    onPreview?.(artifact);
  }, [onPreview]);

  if (!artifacts || (artifacts.length === 0 && !isGenerating)) {
    return null;
  }

  const groupedArtifacts = artifacts.reduce((acc, artifact) => {
    // eslint-disable-next-line security/detect-object-injection
    if (!acc[artifact.type]) {
      // eslint-disable-next-line security/detect-object-injection
      acc[artifact.type] = [];
    }
    // eslint-disable-next-line security/detect-object-injection
    acc[artifact.type].push(artifact);
    return acc;
  }, {} as Record<ArtifactType, Artifact[]>);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">
            Generated Artifacts ({artifacts.length})
          </h3>
        </div>

        {isGenerating && (
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Plus className="h-4 w-4 text-blue-600" />
            </motion.div>
            <span className="text-xs text-muted-foreground">Generating...</span>
          </div>
        )}
      </div>

      {isGenerating && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Generating artifact</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(generationProgress)}%
                </span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {Object.entries(artifactsByType).map(([type, typeArtifacts]) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-2"
            >
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {/* eslint-disable-next-line security/detect-object-injection */}
                {ArtifactTypeConfig[type as ArtifactType].label}s ({typeArtifacts.length})
              </h4>
              <div className="space-y-2">
                {typeArtifacts.map((artifact) => (
                  <ArtifactItem
                    key={artifact.id}
                    artifact={artifact}
                    onPreview={handlePreview}
                    onExport={onExport}
                    onShare={onShare}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewArtifact} onOpenChange={() => setPreviewArtifact(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                {previewArtifact && (
                  <>
                    {/* eslint-disable-next-line security/detect-object-injection */}
                    {React.createElement(ArtifactTypeConfig[previewArtifact.type].icon, {
                      className: "h-5 w-5"
                    })}
                    {previewArtifact.title}
                  </>
                )}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewArtifact(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {previewArtifact && (
            <div className="flex-1 overflow-auto">
              <div className="p-4 bg-muted/30 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {previewArtifact.content}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};