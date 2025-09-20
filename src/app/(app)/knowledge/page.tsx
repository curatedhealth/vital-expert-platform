'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { KnowledgeUploader } from '@/components/knowledge/knowledge-uploader';
import { KnowledgeViewer } from '@/components/knowledge/knowledge-viewer';
import { KnowledgeAnalyticsDashboard } from '@/components/knowledge/knowledge-analytics-dashboard';
import {
  Upload,
  Database,
  FileText,
  Trash2,
  Search,
  Filter,
  Download,
  Globe,
  Brain,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Grid3X3,
  List,
  Eye,
  Edit,
  Copy,
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  status: 'processing' | 'completed' | 'failed';
  domain: string;
  isGlobal: boolean;
  agentId?: string;
  chunks: number;
  summary?: string;
}

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Handle URL parameters for tab navigation and filtering
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'analytics';
  const categoryFilter = searchParams.get('category');
  const agentFilter = searchParams.get('agent');

  // Fetch documents from the database
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
        throw new Error(`Failed to fetch documents: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setDocuments(data.documents || []);
      } else {
        throw new Error(data.error || 'Failed to fetch documents');
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [selectedDomain]);

  // Fetch documents on component mount and when domain changes
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUploadComplete = useCallback((newDocs: any[]) => {
    console.log('Upload completed, refreshing documents list...');
    // Refresh the documents list to show newly uploaded documents
    fetchDocuments();
  }, [fetchDocuments]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = selectedDomain === 'all' || doc.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  const totalDocuments = documents.length;
  const completedDocuments = documents.filter(d => d.status === 'completed').length;
  const totalChunks = documents.reduce((sum, doc) => sum + doc.chunks, 0);
  const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);

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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">


      {/* Main Content */}
      {activeTab === 'upload' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Knowledge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <KnowledgeUploader onUploadComplete={handleUploadComplete} />
          </CardContent>
        </Card>
      ) : activeTab === 'manage' ? (
        <div className="space-y-6">
          {/* Header with Actions */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Documents</h3>
              <p className="text-sm text-muted-foreground">
                Manage your knowledge documents and their settings.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-md border">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-l-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 max-w-sm">
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
            <div className="flex items-center gap-2">
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Domains</option>
                <option value="digital-health">Digital Health</option>
                <option value="clinical-research">Clinical Research</option>
                <option value="market-access">Market Access</option>
                <option value="regulatory">Regulatory</option>
              </select>
            </div>
          </div>

          {/* Table View */}
          {viewMode === 'table' ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Chunks</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                            <span>Loading documents...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                            <span>Failed to load documents: {error}</span>
                            <Button variant="outline" size="sm" onClick={fetchDocuments}>
                              Try Again
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredDocuments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <span>No documents found</span>
                            {(searchQuery || selectedDomain !== 'all') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSearchQuery('');
                                  setSelectedDomain('all');
                                }}
                              >
                                Clear Filters
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDocuments.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              {doc.name}
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
                          <TableCell className="capitalize">
                            {doc.domain.replace('-', ' ')}
                          </TableCell>
                          <TableCell>{formatFileSize(doc.size)}</TableCell>
                          <TableCell>{doc.chunks}</TableCell>
                          <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <div className="col-span-full flex items-center justify-center py-8">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span>Loading documents...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-2">Failed to Load Documents</h3>
                      <p className="text-muted-foreground mb-4">{error}</p>
                      <Button variant="outline" onClick={fetchDocuments}>
                        Try Again
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-2">No Documents Found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchQuery || selectedDomain !== 'all'
                          ? 'No documents match your current filters.'
                          : 'Upload your first document to get started.'}
                      </p>
                      {(searchQuery || selectedDomain !== 'all') && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedDomain('all');
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <h3 className="font-medium truncate">{doc.name}</h3>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              doc.status === 'completed' ? 'default' :
                              doc.status === 'processing' ? 'secondary' : 'destructive'
                            }
                          >
                            {doc.status}
                          </Badge>
                          <Badge variant={doc.isGlobal ? 'default' : 'secondary'}>
                            {doc.isGlobal ? 'Global' : 'Agent'}
                          </Badge>
                        </div>

                        {doc.summary && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {doc.summary}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>{doc.chunks} chunks</span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="capitalize">{doc.domain.replace('-', ' ')}</span>
                          <span>{formatDate(doc.uploadedAt)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      ) : activeTab === 'search' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Knowledge Base
            </CardTitle>
          </CardHeader>
          <CardContent>
            <KnowledgeViewer />
          </CardContent>
        </Card>
      ) : (
        <KnowledgeAnalyticsDashboard
          categoryFilter={categoryFilter || undefined}
          agentFilter={agentFilter || undefined}
        />
      )}
    </div>
  );
}