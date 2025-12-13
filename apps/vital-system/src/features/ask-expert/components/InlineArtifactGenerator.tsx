'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  FileText,
  Download,
  Share2,
  Eye,
  FileCheck,
  FileCode,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Label } from '@vital/ui';
import { Progress } from '@vital/ui';
import { Textarea } from '@vital/ui';
import { cn } from '@vital/ui/lib/utils';

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  category: string;
  estimatedTime: string;
  requiredFields: string[];
  popular?: boolean;
}

const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'clinical-protocol',
    name: 'Clinical Trial Protocol',
    description: 'Comprehensive study protocol with all ICH-GCP sections',
    icon: <FileCheck className="h-5 w-5" />,
    category: 'Clinical',
    estimatedTime: '2-3 min',
    requiredFields: ['Study Title', 'Indication', 'Phase'],
    popular: true,
  },
  {
    id: '510k-checklist',
    name: '510(k) Submission Checklist',
    description: 'Complete FDA 510(k) submission requirements',
    icon: <FileText className="h-5 w-5" />,
    category: 'Regulatory',
    estimatedTime: '1-2 min',
    requiredFields: ['Device Name', 'Classification'],
    popular: true,
  },
  {
    id: 'risk-analysis',
    name: 'ISO 14971 Risk Analysis',
    description: 'Medical device risk management documentation',
    icon: <FileSpreadsheet className="h-5 w-5" />,
    category: 'Quality',
    estimatedTime: '3-4 min',
    requiredFields: ['Device Description', 'Intended Use'],
  },
  {
    id: 'gap-analysis',
    name: 'Regulatory Gap Analysis',
    description: 'Compare current state vs regulatory requirements',
    icon: <FileCode className="h-5 w-5" />,
    category: 'Regulatory',
    estimatedTime: '2-3 min',
    requiredFields: ['Product Type', 'Target Market'],
  },
];

interface GeneratedArtifact {
  id: string;
  template: string;
  title: string;
  createdAt: Date;
}

export interface InlineArtifactGeneratorProps {
  conversationContext?: string;
  onGenerate?: (templateId: string, inputs: Record<string, string>) => Promise<void> | void;
  onClose?: () => void;
  className?: string;
  conversationId?: string;
}

export function InlineArtifactGenerator({
  conversationContext,
  onGenerate,
  onClose,
  className,
}: InlineArtifactGeneratorProps) {
  const prefersReducedMotion = useReducedMotion();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedDoc, setGeneratedDoc] = useState<GeneratedArtifact | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const selectedTemplate = useMemo(
    () => DOCUMENT_TEMPLATES.find((template) => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId]
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  const resetGenerator = useCallback(() => {
    setInputs({});
    setProgress(0);
    setGeneratedDoc(null);
    setIsGenerating(false);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    if (isGenerating) {
      return;
    }
    resetGenerator();
    setSelectedTemplateId('');
    onClose?.();
  }, [isGenerating, onClose, resetGenerator]);

  const handleTemplateSelect = useCallback((templateId: string) => {
    if (isGenerating) {
      return;
    }
    resetGenerator();
    setSelectedTemplateId(templateId);
  }, [isGenerating, resetGenerator]);

  const handleFieldChange = useCallback((field: string, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!selectedTemplate || isGenerating) {
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setError(null);

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    intervalRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 90;
        }
        return prev + 10;
      });
    }, prefersReducedMotion ? 450 : 300);

    try {
      if (onGenerate) {
        await onGenerate(selectedTemplate.id, inputs);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1800));
      }

      setProgress(100);
      setGeneratedDoc({
        id: `doc-${Date.now()}`,
        template: selectedTemplate.id,
        title: inputs['title']?.trim() || selectedTemplate.name,
        createdAt: new Date(),
      });
    } catch (generationError) {
      console.error('[InlineArtifactGenerator] Failed to generate document', generationError);
      setError('Unable to generate the document. Please try again.');
    } finally {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsGenerating(false);
    }
  }, [inputs, isGenerating, onGenerate, prefersReducedMotion, selectedTemplate]);

  const handleShare = useCallback(async () => {
    if (!generatedDoc) {
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: generatedDoc.title,
          text: 'Generated by VITAL Expert',
          url: typeof window !== 'undefined' ? window.location.href : '',
        });
        return;
      }
      await navigator.clipboard.writeText(`${generatedDoc.title} — generated by VITAL Expert`);
    } catch (shareError) {
      console.error('[InlineArtifactGenerator] Share failed', shareError);
    }
  }, [generatedDoc]);

  const isGenerateDisabled = useMemo(() => {
    if (!selectedTemplate) {
      return true;
    }
    return !selectedTemplate.requiredFields.every((field) => inputs[field]?.trim());
  }, [inputs, selectedTemplate]);

  const conversationPreview = useMemo(() => {
    if (!conversationContext) {
      return '';
    }
    return conversationContext.trim();
  }, [conversationContext]);

  return (
    <AnimatePresence>
      <motion.div
        key="inline-artifact-generator"
        initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.98 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        className={cn('w-full', className)}
      >
        <Card className="border-2 border-purple-200/80 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-purple-900">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Generate Document
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-7 w-7 p-0"
                aria-label="Close document generator"
                disabled={isGenerating}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            {!generatedDoc ? (
              <>
                {!selectedTemplate ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Choose a document template to generate from this conversation.
                    </p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {DOCUMENT_TEMPLATES.map((template) => (
                        <motion.div
                          key={template.id}
                          whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
                          whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
                        >
                          <Card
                            role="button"
                            tabIndex={0}
                            className={cn(
                              'cursor-pointer border border-purple-100 transition-colors hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400',
                              selectedTemplateId === template.id && 'ring-2 ring-purple-400'
                            )}
                            onClick={() => handleTemplateSelect(template.id)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                handleTemplateSelect(template.id);
                              }
                            }}
                          >
                            <CardContent className="p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                  {template.icon}
                                </div>
                                {template.popular && (
                                  <Badge variant="secondary" className="text-xs">
                                    Popular
                                  </Badge>
                                )}
                              </div>

                              <div>
                                <h4 className="font-medium text-sm text-neutral-900">{template.name}</h4>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {template.description}
                                </p>
                              </div>

                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                  <Sparkles className="h-3 w-3 text-purple-500" />
                                  {template.category}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {template.estimatedTime}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                        {selectedTemplate.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-purple-900">
                          {selectedTemplate.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {selectedTemplate.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTemplateId('')}
                        className="h-7 text-xs"
                        disabled={isGenerating}
                      >
                        Change
                      </Button>
                    </div>

                    {conversationPreview && (
                      <div className="p-3 bg-muted/40 rounded-lg border border-muted-foreground/10">
                        <Label className="text-xs font-medium flex items-center gap-1 mb-2 text-muted-foreground">
                          <Sparkles className="h-3 w-3" />
                          Using conversation context
                        </Label>
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {conversationPreview}
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      {selectedTemplate.requiredFields.map((field) => (
                        <div key={field} className="space-y-1.5">
                          <Label htmlFor={field} className="text-sm font-medium text-neutral-700">
                            {field} <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id={field}
                            placeholder={`Enter ${field.toLowerCase()}...`}
                            value={inputs[field] || ''}
                            onChange={(event) => handleFieldChange(field, event.target.value)}
                            className="min-h-[60px] text-sm"
                            disabled={isGenerating}
                          />
                        </div>
                      ))}
                    </div>

                    {isGenerating && (
                      <div className="space-y-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm text-purple-700">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-2 text-purple-800">
                            <LoaderIndicator />
                            Generating document...
                          </span>
                          <span className="font-medium text-purple-900">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        onClick={handleGenerate}
                        disabled={isGenerateDisabled || isGenerating}
                        className="flex-1"
                      >
                        {isGenerating ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Generating…
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Document
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedTemplateId('')}
                        disabled={isGenerating}
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-green-900">
                      Document generated successfully!
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {generatedDoc.title}
                    </p>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <Button className="w-full" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Document
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="sm:col-span-2"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    resetGenerator();
                    setSelectedTemplateId('');
                  }}
                  className="w-full text-purple-700 hover:text-purple-800"
                >
                  Generate Another
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

function LoaderIndicator() {
  return (
    <span className="inline-flex items-center justify-center">
      <Clock className="h-4 w-4 animate-spin" />
    </span>
  );
}

export type InlineDocumentGeneratorProps = InlineArtifactGeneratorProps;
export { InlineArtifactGenerator as InlineDocumentGenerator };

