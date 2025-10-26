'use client';

import {
  Upload,
  CheckCircle,
  AlertCircle,
  Info,
  FileJson,
  Users,
  Zap,
  MessageSquare,
  Download,
  Eye,
  Play,
  RefreshCw
} from 'lucide-react';
import React, { useState, useCallback } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui';
import { Checkbox } from '@vital/ui';
import { Label } from '@vital/ui';
import { Progress } from '@vital/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { Textarea } from '@vital/ui';

interface UploadResult {
  success: boolean;
  message: string;
  results: {
    total: number;
    processed: number;
    created: number;
    updated: number;
    skipped: number;
    errors: Array<{ agent?: string; capability?: string; prompt?: string; error: string }>;
    warnings: Array<{ agent?: string; capability?: string; prompt?: string; warning: string }>;
  };
}

interface UploadOptions {
  validate_only: boolean;
  skip_duplicates: boolean;
  update_existing: boolean;
  create_categories: boolean;
  link_capabilities: boolean;
  validate_templates: boolean;
}

type UploadType = 'agents' | 'capabilities' | 'prompts';

export default function BatchUploadPanel() {
  const [activeTab, setActiveTab] = useState<UploadType>('agents');
  const [uploadData, setUploadData] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<UploadResult | null>(null);
  const [options, setOptions] = useState<UploadOptions>({
    validate_only: false,
    skip_duplicates: true,
    update_existing: false,
    create_categories: true,
    link_capabilities: true,
    validate_templates: true
  });

  // Sample data for each type
  const sampleData = {
    agents: {
      agents: [{
        name: "sample-agent",
        display_name: "Sample Agent",
        description: "A sample agent for testing",
        model: "gpt-4",
        system_prompt: "You are a helpful assistant specialized in medical device development.",
        tier: 1,
        priority: 100,
        implementation_phase: 1,
        domain_expertise: "medical",
        medical_specialty: "General",
        hipaa_compliant: true,
        is_custom: true
      }]
    },
    capabilities: {
      capabilities: [{
        name: "sample-capability",
        display_name: "Sample Capability",
        description: "A sample capability for testing",
        category: "medical",
        domain: "medical",
        complexity_level: "intermediate",
        quality_metrics: {
          accuracy_target: "95%",
          time_target: "30 minutes",
          compliance_requirements: ["FDA", "HIPAA"]
        }
      }]
    },
    prompts: {
      prompts: [{
        name: "sample-prompt",
        display_name: "Sample Prompt",
        description: "A sample prompt for testing",
        domain: "medical",
        complexity_level: "moderate",
        system_prompt: "You are an expert assistant.",
        user_prompt_template: "Please help with: {task}",
        input_schema: { task: "string" },
        output_schema: { response: "string" },
        success_criteria: { description: "Task completed successfully" },
        model_requirements: { model: "gpt-4", temperature: 0.7, max_tokens: 2000 }
      }]
    }
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          setUploadData(JSON.stringify(parsed, null, 2));
        } catch (error) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const handleUpload = useCallback(async (validateOnly = false) => {
    if (!uploadData.trim()) {
      alert('Please provide data to upload');
      return;
    }

    try {
      const data = JSON.parse(uploadData);
      setIsUploading(true);
      setResults(null);

      const uploadOptions = { ...options, validate_only: validateOnly };

      const response = await fetch(`/api/batch/${activeTab}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          options: uploadOptions
        }),
      });

      const result = await response.json();
      setResults(result);

    } catch (error) {
      console.error('Upload error:', error);
      setResults({
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed',
        results: {
          total: 0,
          processed: 0,
          created: 0,
          updated: 0,
          skipped: 0,
          errors: [],
          warnings: []
        }
      });
    } finally {
      setIsUploading(false);
    }
  }, [uploadData, activeTab, options]);

  const downloadSample = useCallback((type: UploadType) => {
    // eslint-disable-next-line security/detect-object-injection
    const data = sampleData[type];
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_sample.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const loadSample = useCallback((type: UploadType) => {
    // eslint-disable-next-line security/detect-object-injection
    setUploadData(JSON.stringify(sampleData[type], null, 2));
  }, []);

  const getTabIcon = (type: UploadType) => {
    switch (type) {
      case 'agents': return <Users className="w-4 h-4" />;
      case 'capabilities': return <Zap className="w-4 h-4" />;
      case 'prompts': return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getResultColor = (success: boolean) => {
    return success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Batch Upload</h1>
          <p className="text-muted-foreground">
            Upload agents, capabilities, and prompts in bulk to your VITAL Path platform
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          Admin Only
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UploadType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agents" className="flex items-center gap-2">
            {getTabIcon('agents')}
            Agents
          </TabsTrigger>
          <TabsTrigger value="capabilities" className="flex items-center gap-2">
            {getTabIcon('capabilities')}
            Capabilities
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            {getTabIcon('prompts')}
            Prompts
          </TabsTrigger>
        </TabsList>

        {(['agents', 'capabilities', 'prompts'] as UploadType[]).map((type) => (
          <TabsContent key={type} value={type}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getTabIcon(type)}
                  Upload {type.charAt(0).toUpperCase() + type.slice(1)}
                </CardTitle>
                <CardDescription>
                  Bulk upload {type} using JSON format. You can validate first before actual upload.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload and Sample Actions */}
                <div className="flex flex-wrap gap-3">
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button variant="outline" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload JSON File
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => downloadSample(type)}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Sample
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => loadSample(type)}
                    className="flex items-center gap-2"
                  >
                    <FileJson className="w-4 h-4" />
                    Load Sample Data
                  </Button>
                </div>

                {/* Upload Options */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`skip-duplicates-${type}`}
                      checked={options.skip_duplicates}
                      onCheckedChange={(checked) =>
                        setOptions(prev => ({ ...prev, skip_duplicates: checked as boolean }))
                      }
                    />
                    <Label htmlFor={`skip-duplicates-${type}`} className="text-sm">
                      Skip Duplicates
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`update-existing-${type}`}
                      checked={options.update_existing}
                      onCheckedChange={(checked) =>
                        setOptions(prev => ({ ...prev, update_existing: checked as boolean }))
                      }
                    />
                    <Label htmlFor={`update-existing-${type}`} className="text-sm">
                      Update Existing
                    </Label>
                  </div>

                  {type === 'capabilities' && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="create-categories"
                        checked={options.create_categories}
                        onCheckedChange={(checked) =>
                          setOptions(prev => ({ ...prev, create_categories: checked as boolean }))
                        }
                      />
                      <Label htmlFor="create-categories" className="text-sm">
                        Create Categories
                      </Label>
                    </div>
                  )}

                  {type === 'prompts' && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="link-capabilities"
                          checked={options.link_capabilities}
                          onCheckedChange={(checked) =>
                            setOptions(prev => ({ ...prev, link_capabilities: checked as boolean }))
                          }
                        />
                        <Label htmlFor="link-capabilities" className="text-sm">
                          Link Capabilities
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="validate-templates"
                          checked={options.validate_templates}
                          onCheckedChange={(checked) =>
                            setOptions(prev => ({ ...prev, validate_templates: checked as boolean }))
                          }
                        />
                        <Label htmlFor="validate-templates" className="text-sm">
                          Validate Templates
                        </Label>
                      </div>
                    </>
                  )}
                </div>

                {/* JSON Data Input */}
                <div className="space-y-2">
                  <Label htmlFor={`data-${type}`}>JSON Data</Label>
                  <Textarea
                    id={`data-${type}`}
                    placeholder={`Paste your ${type} JSON data here...`}
                    value={uploadData}
                    onChange={(e) => setUploadData(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleUpload(true)}
                    disabled={isUploading || !uploadData.trim()}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isUploading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    Validate Only
                  </Button>

                  <Button
                    onClick={() => handleUpload(false)}
                    disabled={isUploading || !uploadData.trim()}
                    className="flex items-center gap-2"
                  >
                    {isUploading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Upload {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                </div>

                {/* Progress Bar */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Processing...</span>
                    </div>
                    <Progress value={undefined} className="w-full" />
                  </div>
                )}

                {/* Results */}
                {results && (
                  <Card className={`border-2 ${getResultColor(results.success)}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {results.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        {results.message}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{results.results.total}</div>
                          <div className="text-sm text-muted-foreground">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{results.results.created}</div>
                          <div className="text-sm text-muted-foreground">Created</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{results.results.updated}</div>
                          <div className="text-sm text-muted-foreground">Updated</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-600">{results.results.skipped}</div>
                          <div className="text-sm text-muted-foreground">Skipped</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{results.results.errors.length}</div>
                          <div className="text-sm text-muted-foreground">Errors</div>
                        </div>
                      </div>

                      {/* Errors */}
                      {results.results.errors.length > 0 && (
                        <Alert className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Errors ({results.results.errors.length})</AlertTitle>
                          <AlertDescription>
                            <div className="mt-2 space-y-1">
                              {results.results.errors.map((error, index) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium">
                                    {error.agent || error.capability || error.prompt}:
                                  </span>{' '}
                                  {error.error}
                                </div>
                              ))}
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Warnings */}
                      {results.results.warnings.length > 0 && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertTitle>Warnings ({results.results.warnings.length})</AlertTitle>
                          <AlertDescription>
                            <div className="mt-2 space-y-1">
                              {results.results.warnings.map((warning, index) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium">
                                    {warning.agent || warning.capability || warning.prompt}:
                                  </span>{' '}
                                  {warning.warning}
                                </div>
                              ))}
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
