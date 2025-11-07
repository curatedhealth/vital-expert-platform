'use client';

import { useState, useCallback, useEffect } from 'react';
import { Upload, Plus, Download, Trash2, ExternalLink, FileText, Database, Play, CheckCircle, AlertCircle, Loader2, List, Search, X, Check } from 'lucide-react';
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
    timeout: 45,
    max_retries: 3,
    delay_between_requests: 1,
  },
  processing_settings: {
    chunk_size: 1000,
    chunk_overlap: 200,
    min_word_count: 100,
    max_content_length: 50000,
  },
  upload_settings: {
    enable_supabase: true,
    enable_pinecone: true,
    batch_size: 10,
    skip_duplicates: true,
  },
  embedding_model: 'sentence-transformers/all-MiniLM-L6-v2',
};

const EMBEDDING_MODELS = [
  { 
    value: 'sentence-transformers/all-MiniLM-L6-v2', 
    label: 'all-MiniLM-L6-v2 (Fast, Default)',
    description: '384 dims, ~14K sentences/sec'
  },
  { 
    value: 'sentence-transformers/all-mpnet-base-v2', 
    label: 'all-mpnet-base-v2 (High Quality)',
    description: '768 dims, best quality'
  },
  { 
    value: 'sentence-transformers/multi-qa-mpnet-base-dot-v1', 
    label: 'multi-qa-mpnet (Q&A Optimized)',
    description: '768 dims, perfect for Ask Expert'
  },
  { 
    value: 'pritamdeka/BioBERT-mnli-snli-scinli-scitail-mednli-stsb', 
    label: 'BioBERT (Medical)',
    description: 'Medical/healthcare content'
  },
];

// 30 Healthcare Knowledge Domains from Supabase
const KNOWLEDGE_DOMAINS = [
  // Tier 1: Core Domains (15)
  { value: 'regulatory_affairs', label: 'Regulatory Affairs', tier: 1, color: '#DC2626' },
  { value: 'clinical_development', label: 'Clinical Development', tier: 1, color: '#2563EB' },
  { value: 'pharmacovigilance', label: 'Pharmacovigilance', tier: 1, color: '#DC2626' },
  { value: 'quality_assurance', label: 'Quality Assurance', tier: 1, color: '#059669' },
  { value: 'medical_affairs', label: 'Medical Affairs', tier: 1, color: '#7C3AED' },
  { value: 'drug_safety', label: 'Drug Safety', tier: 1, color: '#DC2626' },
  { value: 'clinical_operations', label: 'Clinical Operations', tier: 1, color: '#0891B2' },
  { value: 'medical_writing', label: 'Medical Writing', tier: 1, color: '#4F46E5' },
  { value: 'biostatistics', label: 'Biostatistics', tier: 1, color: '#7C3AED' },
  { value: 'data_management', label: 'Data Management', tier: 1, color: '#0891B2' },
  { value: 'translational_medicine', label: 'Translational Medicine', tier: 1, color: '#7C3AED' },
  { value: 'market_access', label: 'Market Access', tier: 1, color: '#059669' },
  { value: 'labeling_advertising', label: 'Labeling & Advertising', tier: 1, color: '#D97706' },
  { value: 'post_market_surveillance', label: 'Post-Market Surveillance', tier: 1, color: '#DC2626' },
  { value: 'patient_engagement', label: 'Patient Engagement', tier: 1, color: '#EC4899' },
  
  // Tier 2: Specialized Domains (10)
  { value: 'scientific_publications', label: 'Scientific Publications', tier: 2, color: '#4F46E5' },
  { value: 'nonclinical_sciences', label: 'Nonclinical Sciences', tier: 2, color: '#7C3AED' },
  { value: 'risk_management', label: 'Risk Management', tier: 2, color: '#DC2626' },
  { value: 'submissions_and_filings', label: 'Submissions & Filings', tier: 2, color: '#DC2626' },
  { value: 'health_economics', label: 'Health Economics', tier: 2, color: '#059669' },
  { value: 'medical_devices', label: 'Medical Devices', tier: 2, color: '#D97706' },
  { value: 'bioinformatics', label: 'Bioinformatics', tier: 2, color: '#7C3AED' },
  { value: 'companion_diagnostics', label: 'Companion Diagnostics', tier: 2, color: '#4F46E5' },
  { value: 'regulatory_intelligence', label: 'Regulatory Intelligence', tier: 2, color: '#0891B2' },
  { value: 'lifecycle_management', label: 'Lifecycle Management', tier: 2, color: '#059669' },
  
  // Tier 3: Emerging Domains (5)
  { value: 'digital_health', label: 'Digital Health', tier: 3, color: '#10B981' },
  { value: 'precision_medicine', label: 'Precision Medicine', tier: 3, color: '#7C3AED' },
  { value: 'ai_ml_healthcare', label: 'AI/ML in Healthcare', tier: 3, color: '#6366F1' },
  { value: 'telemedicine', label: 'Telemedicine', tier: 3, color: '#0891B2' },
  { value: 'sustainability', label: 'Sustainability', tier: 3, color: '#059669' },
];

export function KnowledgePipelineConfig() {
  const [config, setConfig] = useState<PipelineConfig>(DEFAULT_CONFIG);
  const [newSource, setNewSource] = useState<Partial<Source>>({
    url: '',
    domain: 'uncategorized',
    category: 'general',
    tags: [],
    priority: 'medium',
    description: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [uploadStatus, setUploadStatus] = useState<string>('');
  
  // Pipeline execution state
  const [isRunning, setIsRunning] = useState(false);
  const [isDryRun, setIsDryRun] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<any>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  // Queue management state
  const [queueSources, setQueueSources] = useState<QueueSource[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [currentView, setCurrentView] = useState<'config' | 'queue' | 'search'>('config');

  // Domain selection state
  const [availableDomains, setAvailableDomains] = useState<any[]>([]);
  const [selectedDomainIds, setSelectedDomainIds] = useState<string[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(true);

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
          .order('priority', { ascending: true });
        
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
      // Try to find existing queue item to preserve status
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
        
        // Handle different JSON formats
        if (Array.isArray(data)) {
          // Direct array of items: [{url: "...", ...}, ...]
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
          // Structured format: {sources: [{url: "...", ...}]}
          sourcesToAdd = data.sources;
        } else if (data.url) {
          // Single object: {url: "...", ...}
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
        // Parse CSV
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
        // Parse markdown - extract URLs
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
      
      // Reset file input to allow re-uploading the same file
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

    // Reset form
    setNewSource({
      url: '',
      domain: 'uncategorized',
      category: 'general',
      tags: [],
      priority: 'medium',
      description: '',
    });
    setTagInput('');
  };

  // Remove source
  const handleRemoveSource = (index: number) => {
    setConfig(prev => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index),
    }));
  };

  // Add tag
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    setNewSource(prev => ({
      ...prev,
      tags: [...(prev.tags || []), tagInput.trim()],
    }));
    setTagInput('');
  };

  // Remove tag
  const handleRemoveTag = (tag: string) => {
    setNewSource(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tag),
    }));
  };

  // Export configuration
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-pipeline-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export as CSV
  const handleExportCSV = () => {
    const headers = ['url', 'domain', 'category', 'tags', 'priority', 'css_selector', 'description'];
    const rows = config.sources.map(source => [
      source.url,
      source.domain,
      source.category,
      source.tags.join('|'),
      source.priority,
      source.css_selector || '',
      source.description,
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-pipeline-sources-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Group sources by domain
  const sourcesByDomain = config.sources.reduce((acc, source) => {
    if (!acc[source.domain]) {
      acc[source.domain] = [];
    }
    acc[source.domain].push(source);
    return acc;
  }, {} as Record<string, Source[]>);

  // Run pipeline
  const handleRunPipeline = async () => {
    if (config.sources.length === 0) {
      setPipelineError('No sources configured. Please add sources before running the pipeline.');
      return;
    }

    setIsRunning(true);
    setPipelineError(null);
    setPipelineResult(null);

    try {
      const response = await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config,
          dryRun: isDryRun,
          embeddingModel: config.embedding_model,
        }),
      });

      const result = await response.json();
      
      console.log('Pipeline API response:', { 
        ok: response.ok, 
        status: response.status,
        result 
      });

      if (!response.ok) {
        const errorMessage = result.error || result.details || 'Pipeline execution failed';
        const errorDetails = result.stderr || result.stdout || '';
        const fullError = errorDetails ? `${errorMessage}\n\nDetails:\n${errorDetails}` : errorMessage;
        throw new Error(fullError);
      }

      setPipelineResult(result);
    } catch (error: any) {
      console.error('Pipeline error:', error);
      setPipelineError(error.message || 'An unexpected error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  // Run single source from queue
  const handleRunSingleSource = useCallback(async (sourceId: string) => {
    console.log(`▶️ Starting single source: ${sourceId}`);
    
    const sourceIndex = queueSources.findIndex(s => s.id === sourceId);
    if (sourceIndex === -1) {
      console.error(`❌ Source not found in queue: ${sourceId}`);
      return;
    }

    const source = config.sources[sourceIndex];
    if (!source) {
      console.error(`❌ Source not found in config at index ${sourceIndex}`);
      return;
    }

    console.log(`  URL: ${source.url}`);
    console.log(`  Dry run: ${isDryRun}`);

    // Update status to processing
    setQueueSources(prev => prev.map(s => 
      s.id === sourceId ? { ...s, status: 'processing' as const, progress: 0 } : s
    ));

    const startTime = Date.now();

    try {
      console.log(`  📡 Calling API: /api/pipeline/run-single`);
      
      const response = await fetch('/api/pipeline/run-single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source,
          dryRun: isDryRun,
          embeddingModel: config.embedding_model,
          domainIds: selectedDomainIds, // Add selected domains
        }),
      });

      const result = await response.json();
      const duration = Date.now() - startTime;

      console.log(`  📊 API Response (${duration}ms):`, result);

      if (result.success) {
        console.log(`  ✅ Success! Words: ${result.wordCount || 0}`);
        setQueueSources(prev => prev.map(s =>
          s.id === sourceId
            ? {
                ...s,
                status: 'success' as const,
                result: {
                  wordCount: result.wordCount || 0,
                  duration,
                },
              }
            : s
        ));
      } else {
        // Extract detailed error information
        const errorMessage = result.error || 'Unknown error';
        const errorDetails = result.details || result.errors || '';
        const fullError = errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage;
        
        console.error(`  ❌ Failed:`, fullError);
        console.error(`  📄 Full result:`, result);
        
        // If we have stdout/stderr, log it for debugging
        if (result.stdout) {
          console.log(`  📝 Python stdout:`, result.stdout);
        }
        if (result.stderr) {
          console.error(`  ⚠️ Python stderr:`, result.stderr);
        }
        
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
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`  ❌ Network error:`, error);
      setQueueSources(prev => prev.map(s =>
        s.id === sourceId
          ? {
              ...s,
              status: 'failed' as const,
              result: {
                wordCount: 0,
                duration,
                error: error.message || 'Network error',
              },
            }
          : s
      ));
    }
  }, [queueSources, config.sources, isDryRun, config.embedding_model, selectedDomainIds]);

  // Run all pending sources
  const handleRunAllSources = useCallback(async () => {
    if (isProcessingQueue) return; // Prevent multiple runs
    
    setIsProcessingQueue(true);
    const pendingSources = queueSources.filter(s => s.status === 'pending');

    console.log(`🚀 Running all pending sources: ${pendingSources.length} sources`);

    for (const source of pendingSources) {
      console.log(`  Processing: ${source.title}`);
      await handleRunSingleSource(source.id);
    }

    console.log(`✅ Completed processing all sources`);
    setIsProcessingQueue(false);
  }, [queueSources, isProcessingQueue, handleRunSingleSource]);

  // Retry failed source
  const handleRetrySource = useCallback((sourceId: string) => {
    setQueueSources(prev => prev.map(s =>
      s.id === sourceId ? { ...s, status: 'pending' as const, result: undefined } : s
    ));
    handleRunSingleSource(sourceId);
  }, [handleRunSingleSource]);

  // Clear queue
  const handleClearQueue = useCallback(() => {
    setQueueSources([]);
    setConfig(prev => ({ ...prev, sources: [] }));
  }, []);

  // Handle adding imported sources from search
  const handleAddImportedSources = useCallback((importedSources: Source[]) => {
    console.log(`✅ Adding ${importedSources.length} imported sources to config`);
    
    setConfig(prev => ({
      ...prev,
      sources: [...prev.sources, ...importedSources]
    }));
    
    // Switch to queue view to see the newly added sources
    setCurrentView('queue');
  }, []);

  // Calculate overall progress
  const overallProgress = queueSources.length > 0
    ? ((queueSources.filter(s => s.status === 'success' || s.status === 'failed').length) / queueSources.length) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Pipeline Configuration</h1>
          <p className="text-gray-600 mt-2">
            Configure sources for automated content scraping and knowledge base upload
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{config.sources.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(sourcesByDomain).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Queue Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {queueSources.filter(s => s.status === 'success').length}/{queueSources.length}
            </div>
            <p className="text-xs text-gray-500">Processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Words</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(queueSources.reduce((sum, s) => sum + (s.result?.wordCount || 0), 0) / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-gray-500">Extracted</p>
          </CardContent>
        </Card>
      </div>

      {/* View Tabs */}
      <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as 'config' | 'queue' | 'search')}>
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="config">
            <FileText className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="queue">
            <List className="h-4 w-4 mr-2" />
            Queue ({queueSources.length})
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Search & Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6 mt-6">
          {/* Upload File */}
          <Card>
        <CardHeader>
          <CardTitle>Import Sources</CardTitle>
          <CardDescription>
            Upload a JSON, CSV, or Markdown file containing source URLs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label
              htmlFor="file-upload"
              className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <Upload className="h-5 w-5" />
              <span>Choose File</span>
              <Input
                id="file-upload"
                type="file"
                accept=".json,.csv,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
            </Label>
            {uploadStatus && (
              <div className="text-sm font-medium">{uploadStatus}</div>
            )}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p className="font-semibold mb-2">Supported formats:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>JSON:</strong> Full configuration with metadata</li>
              <li><strong>CSV:</strong> Columns: url, domain, category, tags, priority, css_selector, description</li>
              <li><strong>Markdown:</strong> Extracts all URLs from the document</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Run Pipeline */}
      <Card className="border-2 border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-blue-600" />
            Run Knowledge Pipeline
          </CardTitle>
          <CardDescription>
            Execute the scraping and ingestion pipeline with your configured sources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="dry-run"
                  checked={isDryRun}
                  onCheckedChange={setIsDryRun}
                  disabled={isRunning}
                />
                <Label htmlFor="dry-run" className="cursor-pointer">
                  Dry Run (No uploads)
                </Label>
              </div>
              <Badge variant="outline">
                {config.sources.length} source{config.sources.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            <Button
              onClick={handleRunPipeline}
              disabled={isRunning || config.sources.length === 0}
              size="lg"
              className="min-w-[200px]"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Pipeline
                </>
              )}
            </Button>
          </div>

          {/* Error Display */}
          {pipelineError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Pipeline Error</AlertTitle>
              <AlertDescription className="mt-2">
                {pipelineError}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {pipelineResult && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Pipeline Completed Successfully!</AlertTitle>
              <AlertDescription className="mt-2 text-green-700">
                <div className="space-y-2">
                  <p><strong>Sources Processed:</strong> {pipelineResult.sourcesProcessed}</p>
                  <p><strong>Mode:</strong> {pipelineResult.dryRun ? 'Dry Run (No uploads)' : 'Full Execution'}</p>
                  <p><strong>Timestamp:</strong> {new Date(pipelineResult.timestamp).toLocaleString()}</p>
                  {pipelineResult.output && (
                    <details className="mt-4">
                      <summary className="cursor-pointer font-medium text-green-800 hover:text-green-900">
                        View Output Log
                      </summary>
                      <pre className="mt-2 p-3 bg-white rounded text-xs overflow-auto max-h-60 text-gray-800">
                        {pipelineResult.output}
                      </pre>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Info Message */}
          {!isRunning && !pipelineResult && !pipelineError && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ready to Run</AlertTitle>
              <AlertDescription>
                The pipeline will scrape all configured sources, process the content, and upload to Supabase and Pinecone.
                {isDryRun && (
                  <span className="block mt-2 text-orange-600 font-medium">
                    ⚠️ Dry Run Mode: Content will be scraped but NOT uploaded to the database.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Add Source Manually */}
      <Card>
        <CardHeader>
          <CardTitle>Add Source Manually</CardTitle>
          <CardDescription>
            Add individual URLs with metadata
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                placeholder="https://example.com/article"
                value={newSource.url || ''}
                onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Domain *</Label>
              <Select
                value={newSource.domain || 'regulatory_affairs'}
                onValueChange={(value) => setNewSource(prev => ({ ...prev, domain: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent className="max-h-[400px]">
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Tier 1 - Core Domains</div>
                  {KNOWLEDGE_DOMAINS.filter(d => d.tier === 1).map((domain) => (
                    <SelectItem key={domain.value} value={domain.value}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: domain.color }}></div>
                        <span>{domain.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 mt-2">Tier 2 - Specialized</div>
                  {KNOWLEDGE_DOMAINS.filter(d => d.tier === 2).map((domain) => (
                    <SelectItem key={domain.value} value={domain.value}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: domain.color }}></div>
                        <span>{domain.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 mt-2">Tier 3 - Emerging</div>
                  {KNOWLEDGE_DOMAINS.filter(d => d.tier === 3).map((domain) => (
                    <SelectItem key={domain.value} value={domain.value}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: domain.color }}></div>
                        <span>{domain.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Choose from 30 healthcare domains</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="fda_guidelines, clinical_trials..."
                value={newSource.category || ''}
                onChange={(e) => setNewSource(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newSource.priority || 'medium'}
                onValueChange={(value) => setNewSource(prev => ({ ...prev, priority: value as any }))}
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

            <div className="space-y-2">
              <Label htmlFor="css_selector">CSS Selector (Optional)</Label>
              <Input
                id="css_selector"
                placeholder=".article-content, #main, etc."
                value={newSource.css_selector || ''}
                onChange={(e) => setNewSource(prev => ({ ...prev, css_selector: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(newSource.tags || []).map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the content source"
              value={newSource.description || ''}
              onChange={(e) => setNewSource(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Advanced Metadata Form */}
          <AdvancedMetadataForm
            source={newSource}
            onUpdate={(field, value) => setNewSource(prev => ({ ...prev, [field]: value }))}
          />

          <Button onClick={handleAddSource} disabled={!newSource.url}>
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        </CardContent>
      </Card>

      {/* Pipeline Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Settings</CardTitle>
          <CardDescription>
            Configure embedding model and processing options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="embedding-model">Embedding Model</Label>
            <Select
              value={config.embedding_model}
              onValueChange={(value) => setConfig(prev => ({ ...prev, embedding_model: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMBEDDING_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{model.label}</span>
                      <span className="text-xs text-gray-500">{model.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-lg">
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
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Chunk Size</Label>
              <Input
                type="number"
                value={config.processing_settings.chunk_size}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  processing_settings: {
                    ...prev.processing_settings,
                    chunk_size: parseInt(e.target.value),
                  },
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Chunk Overlap</Label>
              <Input
                type="number"
                value={config.processing_settings.chunk_overlap}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  processing_settings: {
                    ...prev.processing_settings,
                    chunk_overlap: parseInt(e.target.value),
                  },
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources List */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Sources ({config.sources.length})</CardTitle>
          <CardDescription>
            Review and manage your source URLs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {config.sources.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No sources configured yet</p>
              <p className="text-sm mt-2">Upload a file or add sources manually</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(sourcesByDomain).map(([domain, sources]) => (
                <div key={domain} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 capitalize">
                    {domain} <Badge variant="outline" className="ml-2">{sources.length}</Badge>
                  </h3>
                  <div className="space-y-2">
                    {sources.map((source, idx) => {
                      const globalIndex = config.sources.indexOf(source);
                      return (
                        <div
                          key={globalIndex}
                          className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-blue-600 hover:underline truncate flex items-center gap-1"
                              >
                                {source.url}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                              <Badge
                                variant={
                                  source.priority === 'high' ? 'destructive' :
                                  source.priority === 'medium' ? 'default' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {source.priority}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2 items-center text-xs text-gray-600">
                              <span className="font-medium">{source.category}</span>
                              {source.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            {source.description && (
                              <p className="text-xs text-gray-500 mt-1">{source.description}</p>
                            )}
                            {source.css_selector && (
                              <p className="text-xs text-gray-400 mt-1 font-mono">
                                Selector: {source.css_selector}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSource(globalIndex)}
                            className="ml-2"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Command Line Preview */}
      {config.sources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Command Line Preview</CardTitle>
            <CardDescription>
              Run this command after exporting the configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <div className="space-y-2">
                <div># Export the configuration first</div>
                <div># Then run the pipeline:</div>
                <div className="mt-2">
                  python scripts/knowledge-pipeline.py \<br />
                  &nbsp;&nbsp;--config knowledge-pipeline-config-{new Date().toISOString().split('T')[0]}.json \<br />
                  &nbsp;&nbsp;--embedding-model {config.embedding_model} \<br />
                  &nbsp;&nbsp;--output-dir ./knowledge
                </div>
                <div className="mt-4 text-gray-500"># Dry run (test without uploading)</div>
                <div>
                  python scripts/knowledge-pipeline.py \<br />
                  &nbsp;&nbsp;--config your-config.json \<br />
                  &nbsp;&nbsp;--dry-run
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
        </TabsContent>

        <TabsContent value="queue" className="space-y-6 mt-6">
          <KnowledgePipelineQueue
            sources={queueSources}
            onRunAll={handleRunAllSources}
            onRunSingle={handleRunSingleSource}
            onRetry={handleRetrySource}
            onClear={handleClearQueue}
            isProcessing={isProcessingQueue}
            overallProgress={overallProgress}
          />
        </TabsContent>

        <TabsContent value="search" className="space-y-6 mt-6">
          <KnowledgeSearchImport onAddToQueue={handleAddImportedSources} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

