'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, Eye, X, Check, Loader2,
  FileSpreadsheet, FileCode, FileImage, Sparkles,
  ChevronDown, Settings
} from 'lucide-react';
import { useState, useCallback } from 'react';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@vital/ui';
import { Progress } from '@vital/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { cn } from '@vital/ui/lib/utils';

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  exportFormats: string[];
  estimatedTime: string;
}

const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'regulatory-submission',
    name: 'Regulatory Submission Summary',
    description: 'FDA 510(k), IND, or CE Mark submission document',
    icon: <FileText className="h-5 w-5" />,
    category: 'Regulatory',
    exportFormats: ['pdf', 'docx'],
    estimatedTime: '2-3 min'
  },
  {
    id: 'clinical-protocol',
    name: 'Clinical Trial Protocol',
    description: 'Structured clinical study protocol document',
    icon: <FileText className="h-5 w-5" />,
    category: 'Clinical',
    exportFormats: ['pdf', 'docx'],
    estimatedTime: '3-4 min'
  },
  {
    id: 'market-analysis',
    name: 'Market Analysis Report',
    description: 'Competitive landscape and market opportunity analysis',
    icon: <FileSpreadsheet className="h-5 w-5" />,
    category: 'Commercial',
    exportFormats: ['pdf', 'docx', 'xlsx'],
    estimatedTime: '2-3 min'
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment Matrix',
    description: 'ISO 14971 compliant risk management document',
    icon: <FileText className="h-5 w-5" />,
    category: 'Quality',
    exportFormats: ['pdf', 'xlsx'],
    estimatedTime: '1-2 min'
  },
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    description: 'High-level overview for stakeholders',
    icon: <FileText className="h-5 w-5" />,
    category: 'General',
    exportFormats: ['pdf', 'docx', 'md'],
    estimatedTime: '1-2 min'
  },
  {
    id: 'technical-spec',
    name: 'Technical Specification',
    description: 'Detailed technical requirements document',
    icon: <FileCode className="h-5 w-5" />,
    category: 'Technical',
    exportFormats: ['pdf', 'docx', 'md'],
    estimatedTime: '2-3 min'
  },
];

const EXPORT_FORMATS = [
  { id: 'pdf', name: 'PDF', icon: <FileText className="h-4 w-4" /> },
  { id: 'docx', name: 'Word', icon: <FileText className="h-4 w-4" /> },
  { id: 'xlsx', name: 'Excel', icon: <FileSpreadsheet className="h-4 w-4" /> },
  { id: 'md', name: 'Markdown', icon: <FileCode className="h-4 w-4" /> },
];

interface InlineDocumentGeneratorProps {
  conversationId: string;
  conversationContext: string;
  onGenerate?: (templateId: string, format: string) => Promise<void>;
  onClose?: () => void;
  className?: string;
}

export function InlineDocumentGenerator({
  conversationId,
  conversationContext,
  onGenerate,
  onClose,
  className
}: InlineDocumentGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [generatedDocument, setGeneratedDocument] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'select' | 'preview'>('select');

  const handleTemplateSelect = useCallback((template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setSelectedFormat(template.exportFormats[0]);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!selectedTemplate || !onGenerate) return;

    setIsGenerating(true);
    setProgress(0);
    setCurrentStep('Analyzing conversation context...');

    try {
      // Simulate generation steps
      const steps = [
        { step: 'Analyzing conversation context...', progress: 10 },
        { step: 'Extracting key information...', progress: 25 },
        { step: 'Structuring document...', progress: 40 },
        { step: 'Generating content...', progress: 60 },
        { step: 'Formatting and styling...', progress: 80 },
        { step: 'Finalizing document...', progress: 95 },
      ];

      for (const { step, progress } of steps) {
        setCurrentStep(step);
        setProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      await onGenerate(selectedTemplate.id, selectedFormat);

      setProgress(100);
      setCurrentStep('Complete!');
      setGeneratedDocument({
        title: selectedTemplate.name,
        format: selectedFormat,
        size: '156 KB',
        pages: 12,
        createdAt: new Date()
      });
      setActiveTab('preview');
    } catch (error) {
      console.error('Document generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTemplate, selectedFormat, onGenerate]);

  const filteredTemplates = DOCUMENT_TEMPLATES;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn("bg-white border border-gray-200 rounded-lg shadow-lg", className)}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Generate Document</h3>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="w-full border-b rounded-none">
            <TabsTrigger value="select" className="flex-1">Select Template</TabsTrigger>
            <TabsTrigger value="preview" disabled={!generatedDocument} className="flex-1">
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="select" className="p-4 space-y-4">
            {/* Template Selection */}
            <div>
              <h4 className="text-sm font-medium mb-3">Choose a template:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md hover:border-vital-primary-300",
                      selectedTemplate?.id === template.id && "ring-2 ring-vital-primary-500 bg-vital-primary-100/50 border-vital-primary-500 border-2"
                    )}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-vital-primary-100 rounded-lg text-vital-primary-600">
                          {template.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm mb-1">{template.name}</h5>
                          <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              ~{template.estimatedTime}
                            </span>
                          </div>
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <Check className="h-4 w-4 text-vital-primary-600 flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            {selectedTemplate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <h4 className="text-sm font-medium">Export format:</h4>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPORT_FORMATS.filter(format =>
                      selectedTemplate.exportFormats.includes(format.id)
                    ).map((format) => (
                      <SelectItem key={format.id} value={format.id}>
                        <div className="flex items-center gap-2">
                          {format.icon}
                          <span>{format.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}

            {/* Generation Progress */}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">{currentStep}</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-blue-700">
                  This usually takes {selectedTemplate?.estimatedTime}. Please wait...
                </p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-600">
                Document will be generated based on this conversation
              </p>
              <div className="flex gap-2">
                {onClose && (
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedTemplate || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Document
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="p-4 space-y-4">
            {generatedDocument && (
              <>
                {/* Document Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      {generatedDocument.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Format:</span>
                        <span className="ml-2 font-medium">{generatedDocument.format.toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Size:</span>
                        <span className="ml-2 font-medium">{generatedDocument.size}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Pages:</span>
                        <span className="ml-2 font-medium">{generatedDocument.pages}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Created:</span>
                        <span className="ml-2 font-medium">
                          {generatedDocument.createdAt.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <FileText className="h-16 w-16 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Document preview will appear here</p>
                        <p className="text-xs mt-1">In production, this would show a rendered preview</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab('select')}>
                    Generate Another
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Full
                    </Button>
                    <Button>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </AnimatePresence>
  );
}
