'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KnowledgeUploader } from '@/components/knowledge/knowledge-uploader';
import { KnowledgeViewer } from '@/components/knowledge/knowledge-viewer';
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-deep-charcoal mb-2">
            Knowledge Management
          </h1>
          <p className="text-medical-gray">
            Upload and manage global knowledge that will be available to all AI agents
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-medical-gray">Total Documents</p>
                <p className="text-2xl font-bold text-deep-charcoal">{totalDocuments}</p>
              </div>
              <FileText className="h-8 w-8 text-trust-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-medical-gray">Processed</p>
                <p className="text-2xl font-bold text-deep-charcoal">{completedDocuments}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-clinical-green" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-medical-gray">Knowledge Chunks</p>
                <p className="text-2xl font-bold text-deep-charcoal">{totalChunks.toLocaleString()}</p>
              </div>
              <Database className="h-8 w-8 text-progress-teal" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-medical-gray">Total Size</p>
                <p className="text-2xl font-bold text-deep-charcoal">{formatFileSize(totalSize)}</p>
              </div>
              <Globe className="h-8 w-8 text-market-purple" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload Knowledge</TabsTrigger>
          <TabsTrigger value="manage">Manage Documents</TabsTrigger>
          <TabsTrigger value="search">Search & Browse</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medical-gray" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Domains</option>
                  <option value="digital-health">Digital Health</option>
                  <option value="clinical-research">Clinical Research</option>
                  <option value="market-access">Market Access</option>
                  <option value="regulatory">Regulatory</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-progress-teal border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-medical-gray">Loading documents...</span>
                </div>
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertCircle className="h-12 w-12 text-clinical-red mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-deep-charcoal mb-2">Failed to Load Documents</h3>
                  <p className="text-medical-gray mb-4">{error}</p>
                  <Button
                    onClick={fetchDocuments}
                    variant="outline"
                    className="mx-auto"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : filteredDocuments.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 text-medical-gray mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-deep-charcoal mb-2">No Documents Found</h3>
                  <p className="text-medical-gray mb-4">
                    {searchQuery || selectedDomain !== 'all'
                      ? 'No documents match your current filters.'
                      : 'Upload your first document to get started.'}
                  </p>
                  {(searchQuery || selectedDomain !== 'all') && (
                    <Button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedDomain('all');
                      }}
                      variant="outline"
                      className="mx-auto"
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredDocuments.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-trust-blue" />
                          <h3 className="font-medium text-deep-charcoal">{doc.name}</h3>
                          <Badge variant={doc.isGlobal ? 'default' : 'secondary'}>
                            {doc.isGlobal ? 'Global' : 'Agent-Specific'}
                          </Badge>
                          <Badge
                            variant={
                              doc.status === 'completed' ? 'default' :
                              doc.status === 'processing' ? 'secondary' : 'destructive'
                            }
                          >
                            {doc.status}
                          </Badge>
                        </div>

                        {doc.summary && (
                          <p className="text-sm text-medical-gray mb-2">{doc.summary}</p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-medical-gray">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>{doc.chunks} chunks</span>
                          <span>{formatDate(doc.uploadedAt)}</span>
                          <span className="capitalize">{doc.domain.replace('-', ' ')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {doc.status === 'processing' && (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-progress-teal border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-medical-gray">Processing...</span>
                          </div>
                        )}
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-clinical-red" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}