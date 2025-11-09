'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Upload, Plus, Download, Trash2, ExternalLink, FileText, Database, Play, 
  CheckCircle, AlertCircle, Loader2, List, Search, X, Check, Sparkles,
  TrendingUp, Clock, Target, Zap, BarChart3, Settings, Globe, Filter,
  ArrowRight, Pause, RefreshCw, Eye, EyeOff, ChevronDown, ChevronUp,
  Copy, CheckCheck, AlertTriangle, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import AdvancedMetadataForm from '@/components/admin/AdvancedMetadataForm';
import KnowledgePipelineQueue, { QueueSource } from '@/components/admin/KnowledgePipelineQueue';
import KnowledgeSearchImport from '@/components/admin/KnowledgeSearchImport';

interface Source {
  // Core fields
  url: string;
  domain: string;
  category: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  css_selector?: string;
  description: string;
  
  // Advanced metadata fields
  firm?: string;
  report_type?: string;
  publication_date?: string;
  publication_year?: number;
  publication_month?: string;
  edition?: string;
  authors?: string[];
  abstract?: string;
  pdf_link?: string;
  direct_download?: boolean;
  page_count?: number;
  industry_sectors?: string[];
  practice_areas?: string[];
  target_audience?: string[];
  seniority_level?: string;
  geographic_scope?: string;
  temporal_coverage?: string;
  use_case_category?: string;
  is_time_sensitive?: boolean;
  quality_score?: number;
  credibility_score?: number;
  citation_count?: number;
  rag_priority_weight?: number;
  peer_reviewed?: boolean;
  editorial_review_status?: string;
  compliance_tags?: string[];
  has_executive_summary?: boolean;
  has_table_of_contents?: boolean;
  has_appendices?: boolean;
  has_data_tables?: boolean;
  has_charts_graphs?: boolean;
  section_count?: number;
  chunk_strategy?: string;
  context_window_tokens?: number;
  summarization_available?: boolean;
  citation_format?: string;
}

interface PipelineConfig {
  sources: Source[];
  output_settings: {
    create_subdirectories: boolean;
    include_metadata: boolean;
    markdown_format: boolean;
  };
  scraping_settings: {
    timeout: number;
    max_retries: number;
    delay_between_requests: number;
  };
  processing_settings: {
    chunk_size: number;
    chunk_overlap: number;
    min_word_count: number;
    max_content_length: number;
  };
  upload_settings: {
    enable_supabase: boolean;
    enable_pinecone: boolean;
    batch_size: number;
    skip_duplicates: boolean;
  };
  embedding_model?: string;
}

const DEFAULT_CONFIG: PipelineConfig = {
  sources: [],
  output_settings: {
    create_subdirectories: true,
    include_metadata: true,
    markdown_format: true,
  },
  scraping_settings: {
    timeout: 60,
    max_retries: 3,
    delay_between_requests: 1,
  },
  processing_settings: {
    chunk_size: 1000,
    chunk_overlap: 200,
    min_word_count: 100,
    max_content_length: 1000000,
  },
  upload_settings: {
    enable_supabase: true,
    enable_pinecone: true,
    batch_size: 100,
    skip_duplicates: true,
  },
  embedding_model: 'text-embedding-3-large', // Use OpenAI to match Pinecone index (3072 dims)
};

export default function KnowledgePipelineConfig() {
  // Configuration state
  const [config, setConfig] = useState<PipelineConfig>(DEFAULT_CONFIG);
  const [newSource, setNewSource] = useState<Partial<Source>>({
    priority: 'medium',
    tags: [],
  });

  // UI state
  const [uploadStatus, setUploadStatus] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isDryRun, setIsDryRun] = useState(true);
  const [pipelineResult, setPipelineResult] = useState<any>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState('sources');

  // Queue management state
  const [queueSources, setQueueSources] = useState<QueueSource[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [currentView, setCurrentView] = useState<'config' | 'queue' | 'search'>('config');

  // Domain selection state
  const [availableDomains, setAvailableDomains] = useState<any[]>([]);
  const [selectedDomainIds, setSelectedDomainIds] = useState<string[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(true);

  // Real-time streaming state
  const [streamingLogs, setStreamingLogs] = useState<string[]>([]);
  const [processingStats, setProcessingStats] = useState({
    processed: 0,
    successful: 0,
    failed: 0,
    totalWords: 0,
    totalChunks: 0,
    estimatedTime: 0,
  });

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [streamingLogs]);

  // Fetch available domains on mount
  useEffect(() => {
    async function fetchDomains() {
      try {
        const { createClient } = await import('@vital/sdk/client');
        const supabase = createClient();
        
        const { data, error } = await supabase
          .from('knowledge_domains_new')
          .select('*')
          .eq('is_active', true)
          .order('tier', { ascending: true })
          .order('priority', { ascending: true});
        
        if (error) throw error;
        
        setAvailableDomains(data || []);
        // Set default domain if none selected
        if (data && data.length > 0 && selectedDomainIds.length === 0) {
          const defaultDomain = data.find(d => d.slug === 'digital_health') || data[0];
          setSelectedDomainIds([defaultDomain.domain_id]);
        }
      } catch (error) {
        console.error('Failed to fetch domains:', error);
      } finally {
        setLoadingDomains(false);
      }
    }
    
    fetchDomains();
  }, []);

  // Sync sources to queue when config changes
  useEffect(() => {
    const newQueue: QueueSource[] = config.sources.map((source, index) => {
      const existing = queueSources.find(q => q.url === source.url);
      
      return {
        id: existing?.id || `source-${Date.now()}-${index}`,
        url: source.url,
        title: source.description || source.firm || new URL(source.url).hostname,
        firm: source.firm,
        type: source.url.endsWith('.pdf') ? 'pdf' : 'html',
        estimatedSize: source.page_count ? `${source.page_count} pages` : undefined,
        status: existing?.status || 'pending',
        progress: existing?.progress,
        result: existing?.result,
      };
    });
    
    setQueueSources(newQueue);
  }, [config.sources]);

  // Add streaming log
  const addLog = useCallback((message: string) => {
    setStreamingLogs(prev => [...prev.slice(-99), message]); // Keep last 100 logs
  }, []);

  // Update processing stats
  const updateStats = useCallback((updates: Partial<typeof processingStats>) => {
    setProcessingStats(prev => ({ ...prev, ...updates }));
  }, []);

  // Handle single source execution with streaming
  const handleRunSingleSource = useCallback(async (sourceId: string) => {
    console.log(`▶️ Starting single source: ${sourceId}`);
    
    setQueueSources(prev => prev.map(s =>
      s.id === sourceId
        ? { ...s, status: 'processing' as const, progress: 0 }
        : s
    ));

    const source = config.sources.find((_, idx) => 
      queueSources[idx]?.id === sourceId
    );

    if (!source) {
      console.error('Source not found');
      return;
    }

    addLog(`🚀 Starting: ${source.url}`);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/pipeline/run-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          dryRun: isDryRun,
          embeddingModel: config.embedding_model,
          domainIds: selectedDomainIds,
        }),
      });

      const result = await response.json();
      const duration = Date.now() - startTime;

      console.log(`  📊 API Response (${duration}ms):`, result);

      if (result.success) {
        console.log(`  ✅ Success! Words: ${result.wordCount || 0}`);
        addLog(`✅ Completed: ${source.url} (${result.wordCount || 0} words, ${(duration / 1000).toFixed(1)}s)`);
        
        setQueueSources(prev => prev.map(s =>
          s.id === sourceId
            ? {
                ...s,
                status: 'success' as const,
                progress: 100,
                result: {
                  wordCount: result.wordCount || 0,
                  duration,
                },
              }
            : s
        ));

        updateStats({
          processed: processingStats.processed + 1,
          successful: processingStats.successful + 1,
          totalWords: processingStats.totalWords + (result.wordCount || 0),
        });
      } else {
        // Extract just the error part, not the entire stdout
        const errorMessage = result.error || 'Unknown error';
        const errorDetails = result.errors || '';
        
        // Try to extract the actual error from stdout/stderr if available
        let actualError = errorMessage;
        if (result.stdout && result.stdout.includes('ERROR')) {
          const errorLines = result.stdout.split('\n').filter(line => line.includes('ERROR') || line.includes('❌'));
          if (errorLines.length > 0) {
            actualError = errorLines.slice(0, 3).join('\n'); // First 3 error lines only
          }
        }
        
        const fullError = errorDetails ? `${actualError}: ${errorDetails}` : actualError;
        
        console.error(`  ❌ Failed:`, fullError);
        addLog(`❌ Failed: ${source.url} - ${actualError}`);
        
        setQueueSources(prev => prev.map(s =>
          s.id === sourceId
            ? {
                ...s,
                status: 'failed' as const,
                result: {
                  wordCount: 0,
                  duration,
                  error: fullError,
                },
              }
            : s
        ));

        updateStats({
          processed: processingStats.processed + 1,
          failed: processingStats.failed + 1,
        });
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`  ❌ Network error:`, error.message);
      addLog(`❌ Error: ${source.url} - ${error.message}`);
      
      setQueueSources(prev => prev.map(s =>
        s.id === sourceId
          ? {
              ...s,
              status: 'failed' as const,
              result: {
                wordCount: 0,
                duration,
                error: error.message,
              },
            }
          : s
      ));

      updateStats({
        processed: processingStats.processed + 1,
        failed: processingStats.failed + 1,
      });
    }
  }, [queueSources, config.sources, isDryRun, config.embedding_model, selectedDomainIds, addLog, updateStats, processingStats]);

  // Handle running all pending sources
  const handleRunAllSources = useCallback(async () => {
    if (isProcessingQueue) return;
    
    setIsProcessingQueue(true);
    setStreamingLogs([]);
    setProcessingStats({
      processed: 0,
      successful: 0,
      failed: 0,
      totalWords: 0,
      totalChunks: 0,
      estimatedTime: 0,
    });

    const pendingSources = queueSources.filter(s => s.status === 'pending');
    addLog(`🚀 Starting batch processing: ${pendingSources.length} sources`);

    for (const source of pendingSources) {
      await handleRunSingleSource(source.id);
    }

    addLog(`✅ Batch processing complete!`);
    setIsProcessingQueue(false);
  }, [queueSources, isProcessingQueue, handleRunSingleSource, addLog]);

  // Handle file upload (JSON, CSV, MD)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('📁 Processing file...');

    try {
      const text = await file.text();
      
      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text);
        let sourcesToAdd: Source[] = [];
        
        if (Array.isArray(data)) {
          sourcesToAdd = data.map(item => ({
            url: item.url || item.pdf_link || '',
            domain: item.domain || 'uncategorized',
            category: item.category || item.firm || 'general',
            tags: item.tags || item.topics || [],
            priority: item.priority || 'medium',
            css_selector: item.css_selector,
            description: item.description || item.title || '',
          })).filter(s => s.url);
        } else if (data.sources && Array.isArray(data.sources)) {
          sourcesToAdd = data.sources;
        } else if (data.url) {
          sourcesToAdd = [{
            url: data.url,
            domain: data.domain || 'uncategorized',
            category: data.category || 'general',
            tags: data.tags || [],
            priority: data.priority || 'medium',
            css_selector: data.css_selector,
            description: data.description || '',
          }];
        }
        
        if (sourcesToAdd.length > 0) {
          setConfig(prev => ({
            ...prev,
            sources: [...prev.sources, ...sourcesToAdd],
          }));
          setUploadStatus(`✅ Added ${sourcesToAdd.length} sources from JSON`);
        } else {
          setUploadStatus('❌ Error: No valid sources found in JSON file');
        }
      } else if (file.name.endsWith('.csv')) {
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        const sources: Source[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const source: any = {};
          
          headers.forEach((header, idx) => {
            if (header === 'tags') {
              source[header] = values[idx] ? values[idx].split('|') : [];
            } else {
              source[header] = values[idx] || '';
            }
          });
          
          if (source.url) {
            sources.push({
              url: source.url,
              domain: source.domain || 'uncategorized',
              category: source.category || 'general',
              tags: source.tags || [],
              priority: source.priority || 'medium',
              css_selector: source.css_selector,
              description: source.description || '',
            });
          }
        }
        
        setConfig(prev => ({
          ...prev,
          sources: [...prev.sources, ...sources],
        }));
        setUploadStatus(`✅ Added ${sources.length} sources from CSV`);
      } else if (file.name.endsWith('.md')) {
        const urlRegex = /https?:\/\/[^\s\)]+/g;
        const urls = text.match(urlRegex) || [];
        const sources: Source[] = urls.map(url => ({
          url,
          domain: 'uncategorized',
          category: 'general',
          tags: [],
          priority: 'medium',
          description: '',
        }));
        
        setConfig(prev => ({
          ...prev,
          sources: [...prev.sources, ...sources],
        }));
        setUploadStatus(`✅ Added ${sources.length} URLs from Markdown`);
      }
      
      event.target.value = '';
      setTimeout(() => setUploadStatus(''), 5000);
    } catch (error) {
      console.error('File upload error:', error);
      setUploadStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      event.target.value = '';
      setTimeout(() => setUploadStatus(''), 5000);
    }
  };

  // Add new source manually
  const handleAddSource = () => {
    if (!newSource.url) return;

    const source: Source = {
      url: newSource.url,
      domain: newSource.domain || 'uncategorized',
      category: newSource.category || 'general',
      tags: newSource.tags || [],
      priority: newSource.priority || 'medium',
      css_selector: newSource.css_selector,
      description: newSource.description || '',
    };

    setConfig(prev => ({
      ...prev,
      sources: [...prev.sources, source],
    }));

    setNewSource({
      priority: 'medium',
      tags: [],
    });
  };

  // Remove source
  const handleRemoveSource = (index: number) => {
    setConfig(prev => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index),
    }));
  };

  // Download config
  const handleDownloadConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `knowledge-pipeline-config-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Knowledge Pipeline</h1>
                <p className="text-muted-foreground">
                  Intelligent content ingestion with real-time processing
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={isDryRun ? "secondary" : "default"} className="text-sm">
              {isDryRun ? 'Dry Run Mode' : 'Live Mode'}
            </Badge>
            <Switch
              checked={!isDryRun}
              onCheckedChange={(checked) => setIsDryRun(!checked)}
            />
          </div>
        </div>

        {/* Stats Overview */}
        {isProcessingQueue && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Processed</p>
                    <p className="text-2xl font-bold">{processingStats.processed}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Successful</p>
                    <p className="text-2xl font-bold text-green-600">{processingStats.successful}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{processingStats.failed}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Words</p>
                    <p className="text-2xl font-bold">{processingStats.totalWords.toLocaleString()}</p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Chunks</p>
                    <p className="text-2xl font-bold">{processingStats.totalChunks}</p>
                  </div>
                  <Database className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Sources
              {config.sources.length > 0 && (
                <Badge variant="secondary" className="ml-1">{config.sources.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search & Import
            </TabsTrigger>
            <TabsTrigger value="processing" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Processing
              {isProcessingQueue && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Sources Tab */}
          <TabsContent value="sources" className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Sources
                </CardTitle>
                <CardDescription>
                  Import sources from files or add them manually
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept=".json,.csv,.md"
                    onChange={handleFileUpload}
                    id="file-upload"
                    className="hidden"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" asChild className="cursor-pointer">
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                      </span>
                    </Button>
                  </label>
                  <Button variant="outline" onClick={handleDownloadConfig}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Config
                  </Button>
                  {uploadStatus && (
                    <span className="text-sm text-muted-foreground">{uploadStatus}</span>
                  )}
                </div>

                <Separator />

                {/* Manual Add Form */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="url">Source URL *</Label>
                      <Input
                        id="url"
                        placeholder="https://example.com/article"
                        value={newSource.url || ''}
                        onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        placeholder="Brief description"
                        value={newSource.description || ''}
                        onChange={(e) => setNewSource(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="domain">Domain</Label>
                      <Input
                        id="domain"
                        placeholder="e.g., healthcare"
                        value={newSource.domain || ''}
                        onChange={(e) => setNewSource(prev => ({ ...prev, domain: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        placeholder="e.g., research"
                        value={newSource.category || ''}
                        onChange={(e) => setNewSource(prev => ({ ...prev, category: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newSource.priority}
                        onValueChange={(value: any) => setNewSource(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleAddSource} disabled={!newSource.url}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Source
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sources List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Source Queue</CardTitle>
                    <CardDescription>
                      {config.sources.length} source{config.sources.length !== 1 ? 's' : ''} ready to process
                    </CardDescription>
                  </div>
                  {config.sources.length > 0 && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => setConfig(prev => ({ ...prev, sources: [] }))}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {config.sources.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sources added yet</p>
                    <p className="text-sm">Upload a file or add sources manually</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {config.sources.map((source, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-shrink-0 mt-1">
                            {source.url.endsWith('.pdf') ? (
                              <FileText className="h-5 w-5 text-red-500" />
                            ) : (
                              <Globe className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1 flex-1">
                                <p className="font-medium text-sm truncate">{source.description || source.url}</p>
                                <p className="text-xs text-muted-foreground truncate">{source.url}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {source.domain || 'uncategorized'}
                              </Badge>
                              {source.priority && (
                                <Badge 
                                  variant={
                                    source.priority === 'high' ? 'destructive' :
                                    source.priority === 'medium' ? 'default' : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {source.priority}
                                </Badge>
                              )}
                              {source.tags && source.tags.map((tag, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(source.url, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Open in new tab</TooltipContent>
                            </Tooltip>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSource(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search & Import Tab */}
          <TabsContent value="search" className="space-y-6">
            <KnowledgeSearchImport 
              onAddToQueue={(sources: Source[]) => {
                setConfig(prev => ({
                  ...prev,
                  sources: [...prev.sources, ...sources],
                }));
                setActiveTab('sources');
              }}
            />
          </TabsContent>

          {/* Processing Tab */}
          <TabsContent value="processing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Processing Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Processing Controls
                  </CardTitle>
                  <CardDescription>
                    Execute your pipeline and monitor progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Domain Selection */}
                  <div className="space-y-2">
                    <Label>RAG Knowledge Domains</Label>
                    <div className="text-sm text-muted-foreground mb-2">
                      Select which knowledge domains this content belongs to
                    </div>
                    {loadingDomains ? (
                      <div className="flex items-center gap-2 p-3 border rounded-lg">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading domains...</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[48px]">
                          {selectedDomainIds.length === 0 ? (
                            <span className="text-sm text-muted-foreground">No domains selected</span>
                          ) : (
                            selectedDomainIds.map(domainId => {
                              const domain = availableDomains.find(d => d.domain_id === domainId);
                              return domain ? (
                                <Badge key={domainId} variant="secondary" className="flex items-center gap-1">
                                  {domain.domain_name}
                                  <button
                                    onClick={() => setSelectedDomainIds(prev => prev.filter(id => id !== domainId))}
                                    className="ml-1 hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ) : null;
                            })
                          )}
                        </div>
                        <ScrollArea className="h-[200px]">
                          <div className="grid grid-cols-2 gap-2 p-2 border rounded-lg">
                            {availableDomains.map(domain => {
                              const isSelected = selectedDomainIds.includes(domain.domain_id);
                              return (
                                <button
                                  key={domain.domain_id}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedDomainIds(prev => prev.filter(id => id !== domain.domain_id));
                                    } else {
                                      setSelectedDomainIds(prev => [...prev, domain.domain_id]);
                                    }
                                  }}
                                  className={`
                                    p-2 text-left text-sm rounded border transition-colors
                                    ${isSelected 
                                      ? 'border-primary bg-primary/10 text-primary' 
                                      : 'border-border hover:border-primary/50 hover:bg-accent'
                                    }
                                  `}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{domain.domain_name}</span>
                                    {isSelected && <Check className="h-4 w-4" />}
                                  </div>
                                  {domain.tier && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Tier {domain.tier}
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      onClick={handleRunAllSources}
                      disabled={config.sources.length === 0 || isProcessingQueue}
                      className="w-full"
                      size="lg"
                    >
                      {isProcessingQueue ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Run All Sources ({config.sources.length})
                        </>
                      )}
                    </Button>

                    {isProcessingQueue && (
                      <Button
                        variant="outline"
                        onClick={() => setIsProcessingQueue(false)}
                        className="w-full"
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Pause Processing
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Real-time Logs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Processing Logs
                  </CardTitle>
                  <CardDescription>
                    Real-time updates from the pipeline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-slate-950 text-slate-50 font-mono text-sm">
                    {streamingLogs.length === 0 ? (
                      <div className="text-center text-slate-400 py-8">
                        <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No logs yet. Start processing to see updates.</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {streamingLogs.map((log, idx) => (
                          <div key={idx} className="text-xs leading-relaxed">
                            {log}
                          </div>
                        ))}
                        <div ref={logsEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Queue Status */}
            <Card>
              <CardHeader>
                <CardTitle>Queue Status</CardTitle>
                <CardDescription>
                  Track the progress of each source
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KnowledgePipelineQueue 
                  sources={queueSources}
                  onRunSingle={handleRunSingleSource}
                  onRunAll={handleRunAllSources}
                  onRetry={handleRunSingleSource}
                  onClear={() => setConfig(prev => ({ ...prev, sources: [] }))}
                  isProcessing={isProcessingQueue}
                  overallProgress={config.sources.length > 0 
                    ? (queueSources.filter(s => s.status === 'success' || s.status === 'failed').length / queueSources.length) * 100
                    : 0
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scraping Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Scraping Settings</CardTitle>
                  <CardDescription>
                    Configure how content is extracted
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeout">Timeout (seconds)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={config.scraping_settings.timeout}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        scraping_settings: {
                          ...prev.scraping_settings,
                          timeout: parseInt(e.target.value) || 60,
                        },
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_retries">Max Retries</Label>
                    <Input
                      id="max_retries"
                      type="number"
                      value={config.scraping_settings.max_retries}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        scraping_settings: {
                          ...prev.scraping_settings,
                          max_retries: parseInt(e.target.value) || 3,
                        },
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="delay">Delay Between Requests (seconds)</Label>
                    <Input
                      id="delay"
                      type="number"
                      value={config.scraping_settings.delay_between_requests}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        scraping_settings: {
                          ...prev.scraping_settings,
                          delay_between_requests: parseInt(e.target.value) || 1,
                        },
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Processing Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Processing Settings</CardTitle>
                  <CardDescription>
                    Configure content chunking and processing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="chunk_size">Chunk Size (characters)</Label>
                    <Input
                      id="chunk_size"
                      type="number"
                      value={config.processing_settings.chunk_size}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        processing_settings: {
                          ...prev.processing_settings,
                          chunk_size: parseInt(e.target.value) || 1000,
                        },
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chunk_overlap">Chunk Overlap (characters)</Label>
                    <Input
                      id="chunk_overlap"
                      type="number"
                      value={config.processing_settings.chunk_overlap}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        processing_settings: {
                          ...prev.processing_settings,
                          chunk_overlap: parseInt(e.target.value) || 200,
                        },
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min_word_count">Minimum Word Count</Label>
                    <Input
                      id="min_word_count"
                      type="number"
                      value={config.processing_settings.min_word_count}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        processing_settings: {
                          ...prev.processing_settings,
                          min_word_count: parseInt(e.target.value) || 100,
                        },
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="embedding_model">Embedding Model</Label>
                    <Select
                      value={config.embedding_model}
                      onValueChange={(value) => setConfig(prev => ({
                        ...prev,
                        embedding_model: value,
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sentence-transformers/all-MiniLM-L6-v2">
                          MiniLM-L6-v2 (Fast)
                        </SelectItem>
                        <SelectItem value="text-embedding-3-small">
                          OpenAI Small
                        </SelectItem>
                        <SelectItem value="text-embedding-3-large">
                          OpenAI Large
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Settings</CardTitle>
                  <CardDescription>
                    Configure where processed content is stored
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Supabase</Label>
                      <p className="text-sm text-muted-foreground">
                        Store documents in Supabase
                      </p>
                    </div>
                    <Switch
                      checked={config.upload_settings.enable_supabase}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        upload_settings: {
                          ...prev.upload_settings,
                          enable_supabase: checked,
                        },
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Pinecone</Label>
                      <p className="text-sm text-muted-foreground">
                        Upload vectors to Pinecone
                      </p>
                    </div>
                    <Switch
                      checked={config.upload_settings.enable_pinecone}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        upload_settings: {
                          ...prev.upload_settings,
                          enable_pinecone: checked,
                        },
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Skip Duplicates</Label>
                      <p className="text-sm text-muted-foreground">
                        Avoid re-processing existing content
                      </p>
                    </div>
                    <Switch
                      checked={config.upload_settings.skip_duplicates}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        upload_settings: {
                          ...prev.upload_settings,
                          skip_duplicates: checked,
                        },
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="batch_size">Batch Size</Label>
                    <Input
                      id="batch_size"
                      type="number"
                      value={config.upload_settings.batch_size}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        upload_settings: {
                          ...prev.upload_settings,
                          batch_size: parseInt(e.target.value) || 100,
                        },
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Output Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Output Settings</CardTitle>
                  <CardDescription>
                    Configure file export options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Create Subdirectories</Label>
                      <p className="text-sm text-muted-foreground">
                        Organize output by domain
                      </p>
                    </div>
                    <Switch
                      checked={config.output_settings.create_subdirectories}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        output_settings: {
                          ...prev.output_settings,
                          create_subdirectories: checked,
                        },
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Include Metadata</Label>
                      <p className="text-sm text-muted-foreground">
                        Save metadata files
                      </p>
                    </div>
                    <Switch
                      checked={config.output_settings.include_metadata}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        output_settings: {
                          ...prev.output_settings,
                          include_metadata: checked,
                        },
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Markdown Format</Label>
                      <p className="text-sm text-muted-foreground">
                        Export as Markdown
                      </p>
                    </div>
                    <Switch
                      checked={config.output_settings.markdown_format}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        output_settings: {
                          ...prev.output_settings,
                          markdown_format: checked,
                        },
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
