'use client';

import {
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  User,
  Tag,
  Globe,
  Shield,
  Star,
  Building2,
  BookOpen,
  CalendarIcon,
  FileType,
  BarChart3,
} from 'lucide-react';
import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Input } from '@vital/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@vital/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@vital/ui';

interface DocumentMetadata {
  id: string;
  title: string;
  file_name: string;
  clean_file_name?: string;
  domain: string;
  domain_id?: string;
  source_name?: string;
  source_url?: string;
  year?: number;
  publication_date?: string;
  author?: string;
  organization?: string;
  document_type?: string;
  language?: string;
  file_type?: string;
  file_size: number;
  page_count?: number;
  chunk_count: number;
  status: 'processing' | 'completed' | 'failed';
  tags?: string[];
  summary?: string;
  keywords?: string[];
  access_policy?: string;
  rag_priority_weight?: number;
  regulatory_body?: string;
  therapeutic_area?: string;
  geographic_scope?: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  metadata?: Record<string, any>;
}

function DocumentsLibraryContent() {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [domains, setDomains] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'source' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch domains
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const res = await fetch('/api/knowledge-domains');
        if (!res.ok) return;
        const body = await res.json();
        if (Array.isArray(body.domains) && body.domains.length > 0) {
          setDomains(
            body.domains
              .filter((d: any) => d.slug && d.name)
              .map((d: any) => ({
                id: d.slug,
                name: d.name,
              })),
          );
        }
      } catch (err) {
        console.error('Error fetching domains:', err);
      }
    };

    fetchDomains();
  }, []);

  // Fetch documents with comprehensive metadata
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedDomain && selectedDomain !== 'all') {
        params.append('domain', selectedDomain);
      }

      const response = await fetch(`/api/knowledge/documents?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || 'Failed to fetch documents');
      }

      const data = await response.json();
      
      if (data.success) {
        // Transform and enrich documents with metadata
        const enrichedDocuments = (data.documents || []).map((doc: any) => {
          // Extract metadata from JSONB field
          const metadata = doc.metadata || {};
          
          // Extract clean file name (without extension)
          const cleanFileName = doc.file_name
            ? doc.file_name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
            : doc.title;

          // Extract year from date or filename
          const extractYear = (): number | undefined => {
            if (doc.created_at) {
              const year = new Date(doc.created_at).getFullYear();
              if (year > 1900 && year <= new Date().getFullYear() + 1) return year;
            }
            // Try to extract from filename (common patterns)
            const yearMatch = doc.file_name?.match(/\b(19|20)\d{2}\b/);
            if (yearMatch) return parseInt(yearMatch[0]);
            return undefined;
          };

          // Extract source name from various places
          const extractSourceName = (): string | undefined => {
            // Check metadata first
            if (metadata.source_name || metadata.source) return metadata.source_name || metadata.source;
            if (metadata.publisher || metadata.organization) return metadata.publisher || metadata.organization;
            
            // Try to infer from filename (common patterns)
            const filename = doc.file_name?.toLowerCase() || '';
            const sourcePatterns: Record<string, string> = {
              'fda': 'FDA',
              'ema': 'EMA',
              'who': 'WHO',
              'nih': 'NIH',
              'nature': 'Nature',
              'science': 'Science',
              'mckinsey': 'McKinsey',
              'deloitte': 'Deloitte',
              'bcg': 'BCG',
              'pwc': 'PwC',
              'gsk': 'GSK',
              'pfizer': 'Pfizer',
              'novartis': 'Novartis',
            };

            for (const [pattern, name] of Object.entries(sourcePatterns)) {
              if (filename.includes(pattern)) return name;
            }

            return undefined;
          };

          return {
            id: doc.id,
            title: doc.title || doc.file_name || 'Untitled Document',
            file_name: doc.file_name,
            clean_file_name: cleanFileName,
            domain: doc.domain || doc.domain_id,
            domain_id: doc.domain_id || doc.domain,
            source_name: extractSourceName(),
            source_url: metadata.source_url || metadata.url || doc.upload_url,
            year: extractYear(),
            publication_date: metadata.publication_date || metadata.date || metadata.published_at,
            author: metadata.author || metadata.authors?.[0],
            organization: metadata.organization || metadata.publisher,
            document_type: metadata.document_type || metadata.type || inferDocumentType(doc.file_name, doc.title),
            language: metadata.language || 'en',
            file_type: doc.file_type,
            file_size: doc.file_size || 0,
            page_count: metadata.page_count || metadata.pages,
            chunk_count: doc.chunk_count || 0,
            status: doc.status || 'pending',
            tags: doc.tags || [],
            summary: metadata.summary || metadata.abstract || doc.summary,
            keywords: metadata.keywords || metadata.tags || doc.tags || [],
            access_policy: doc.access_policy || metadata.access_policy,
            rag_priority_weight: doc.rag_priority_weight || metadata.priority_weight,
            regulatory_body: metadata.regulatory_body || metadata.authority,
            therapeutic_area: metadata.therapeutic_area || metadata.indication,
            geographic_scope: metadata.geographic_scope || metadata.region,
            uploaded_by: doc.user_id || metadata.uploaded_by,
            created_at: doc.created_at,
            updated_at: doc.updated_at,
            processed_at: doc.processed_at,
            metadata: metadata,
          } as DocumentMetadata;
        });

        setDocuments(enrichedDocuments);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [selectedDomain]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Helper function to infer document type
  const inferDocumentType = (fileName?: string, title?: string): string => {
    const text = `${fileName || ''} ${title || ''}`.toLowerCase();
    
    if (text.match(/\b(guidance|guideline)\b/)) return 'Regulatory Guidance';
    if (text.match(/\b(research|study|paper|publication)\b/)) return 'Research Paper';
    if (text.match(/\b(protocol)\b/)) return 'Clinical Protocol';
    if (text.match(/\b(report|analysis)\b/)) return 'Market Research Report';
    if (text.match(/\b(regulation|regulatory)\b/)) return 'Government Regulation';
    if (text.match(/\b(template)\b/)) return 'Template';
    if (text.match(/\b(standard)\b/)) return 'Industry Standard';
    
    return 'Document';
  };

  // Get unique values for filters
  const uniqueSources = Array.from(new Set(documents.map(d => d.source_name).filter(Boolean))) as string[];
  const uniqueYears = Array.from(new Set(documents.map(d => d.year).filter(Boolean))).sort((a, b) => b! - a!);
  const uniqueTypes = Array.from(new Set(documents.map(d => d.document_type).filter(Boolean))) as string[];

  // Filter documents
  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = searchQuery === '' || 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.clean_file_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.source_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.author?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDomain = selectedDomain === 'all' || doc.domain === selectedDomain || doc.domain_id === selectedDomain;
      const matchesSource = selectedSource === 'all' || doc.source_name === selectedSource;
      const matchesYear = selectedYear === 'all' || doc.year?.toString() === selectedYear;
      const matchesType = selectedType === 'all' || doc.document_type === selectedType;

      return matchesSearch && matchesDomain && matchesSource && matchesYear && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'name':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        case 'source':
          comparison = (a.source_name || '').localeCompare(b.source_name || '');
          break;
        case 'size':
          comparison = a.file_size - b.file_size;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documents Library</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive view of all knowledge documents with detailed metadata
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Domain Filter */}
            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger>
                <SelectValue placeholder="All Domains" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                {domains.map((domain) => (
                  <SelectItem key={domain.id} value={domain.id}>
                    {domain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Source Filter */}
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger>
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {uniqueSources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year Filter */}
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {uniqueYears.map((year) => (
                  <SelectItem key={year} value={year!.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-4 mt-4">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="source">Source</SelectItem>
                <SelectItem value="size">File Size</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Documents ({filteredDocuments.length})</span>
            <Badge variant="outline">
              {filteredDocuments.length} of {documents.length} shown
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <span>Loading documents...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No documents found matching your filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Document</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>File Info</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Metadata</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{doc.title}</div>
                            {doc.clean_file_name && doc.clean_file_name !== doc.title && (
                              <div className="text-xs text-muted-foreground">
                                {doc.clean_file_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {doc.domain?.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {doc.source_name ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{doc.source_name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {doc.year ? (
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                            <span>{doc.year}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {doc.document_type ? (
                          <Badge variant="secondary" className="text-xs">
                            {doc.document_type}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1">
                            <FileType className="h-3 w-3" />
                            <span>{doc.file_type || '—'}</span>
                          </div>
                          <div>{formatFileSize(doc.file_size)}</div>
                          {doc.page_count && (
                            <div>{doc.page_count} pages</div>
                          )}
                          {doc.chunk_count > 0 && (
                            <div className="text-muted-foreground">{doc.chunk_count} chunks</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            doc.status === 'completed' ? 'default' :
                            doc.status === 'processing' ? 'secondary' : 'destructive'
                          }
                        >
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {doc.access_policy && (
                            <Badge variant="outline" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              {doc.access_policy.replace('_', ' ')}
                            </Badge>
                          )}
                          {doc.rag_priority_weight && (
                            <Badge variant="outline" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              {doc.rag_priority_weight}
                            </Badge>
                          )}
                          {doc.regulatory_body && (
                            <Badge variant="outline" className="text-xs">
                              {doc.regulatory_body}
                            </Badge>
                          )}
                          {doc.tags && doc.tags.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {doc.tags.length}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DocumentsLibraryPage() {
  return (
    <Suspense fallback={<div className="p-6 animate-pulse">Loading documents library...</div>}>
      <DocumentsLibraryContent />
    </Suspense>
  );
}
