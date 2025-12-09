'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  Link2,
  ExternalLink,
  Search,
  Filter,
  Download,
  Copy,
  CheckCircle2,
  Clock,
  AlertCircle,
  Star,
  StarOff,
  Trash2,
  Edit3,
  Eye,
  BarChart3,
  TrendingUp,
  Calendar,
  User,
  Building2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Citation Types
type CitationSource =
  | 'pubmed'
  | 'clinical-trial'
  | 'fda-approval'
  | 'knowledge-base'
  | 'ema'
  | 'who'
  | 'manual'
  | 'web';

type CitationStatus = 'active' | 'archived' | 'pending' | 'flagged';

type CitationFormat = 'apa' | 'mla' | 'chicago' | 'vancouver' | 'bibtex';

interface Citation {
  id: string;
  title: string;
  authors: string[];
  source: CitationSource;
  sourceId?: string; // PMID, NCT ID, etc.
  url?: string;
  doi?: string;
  publicationDate?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  abstract?: string;
  status: CitationStatus;
  isVerified: boolean;
  isFavorite: boolean;
  usageCount: number;
  lastUsed?: string;
  addedAt: string;
  addedBy: string;
  linkedDocuments: string[];
  linkedEntities: string[];
  tags: string[];
  notes?: string;
}

interface CitationStats {
  total: number;
  bySource: Record<CitationSource, number>;
  byStatus: Record<CitationStatus, number>;
  verified: number;
  recentlyAdded: number;
  mostUsed: Citation[];
}

// Source icons and colors
const sourceConfig: Record<
  CitationSource,
  { icon: React.ReactNode; color: string; label: string }
> = {
  pubmed: {
    icon: <BookOpen className="h-4 w-4" />,
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    label: 'PubMed',
  },
  'clinical-trial': {
    icon: <FileText className="h-4 w-4" />,
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    label: 'Clinical Trial',
  },
  'fda-approval': {
    icon: <Building2 className="h-4 w-4" />,
    color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    label: 'FDA Approval',
  },
  'knowledge-base': {
    icon: <FileText className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    label: 'Knowledge Base',
  },
  ema: {
    icon: <Building2 className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    label: 'EMA',
  },
  who: {
    icon: <Building2 className="h-4 w-4" />,
    color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    label: 'WHO',
  },
  manual: {
    icon: <Edit3 className="h-4 w-4" />,
    color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    label: 'Manual Entry',
  },
  web: {
    icon: <ExternalLink className="h-4 w-4" />,
    color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
    label: 'Web Source',
  },
};

// Format citation helper
function formatCitation(citation: Citation, format: CitationFormat): string {
  const authors = citation.authors.length > 0 ? citation.authors : ['Unknown'];
  const year = citation.publicationDate
    ? new Date(citation.publicationDate).getFullYear()
    : 'n.d.';

  switch (format) {
    case 'apa':
      const apaAuthors =
        authors.length > 1 ? `${authors[0]}, et al.` : authors[0];
      return `${apaAuthors} (${year}). ${citation.title}. ${citation.journal || 'Unknown'}${citation.volume ? `, ${citation.volume}` : ''}${citation.pages ? `, ${citation.pages}` : ''}.${citation.doi ? ` https://doi.org/${citation.doi}` : ''}`;

    case 'mla':
      const mlaAuthors = authors.join(', ');
      return `${mlaAuthors}. "${citation.title}." ${citation.journal || 'Unknown'}, ${year}${citation.pages ? `, pp. ${citation.pages}` : ''}.`;

    case 'chicago':
      return `${authors.join(', ')}. "${citation.title}." ${citation.journal || 'Unknown'}${citation.volume ? ` ${citation.volume}` : ''}${citation.issue ? `, no. ${citation.issue}` : ''} (${year})${citation.pages ? `: ${citation.pages}` : ''}.`;

    case 'vancouver':
      const vanAuthors = authors.slice(0, 6).join(', ');
      return `${vanAuthors}${authors.length > 6 ? ' et al.' : ''}. ${citation.title}. ${citation.journal || 'Unknown'}. ${year}${citation.volume ? `;${citation.volume}` : ''}${citation.issue ? `(${citation.issue})` : ''}${citation.pages ? `:${citation.pages}` : ''}.`;

    case 'bibtex':
      const key = `${authors[0]?.split(' ')[0]?.toLowerCase() || 'unknown'}${year}`;
      return `@article{${key},
  author = {${authors.join(' and ')}},
  title = {${citation.title}},
  journal = {${citation.journal || 'Unknown'}},
  year = {${year}},
  ${citation.volume ? `volume = {${citation.volume}},` : ''}
  ${citation.pages ? `pages = {${citation.pages}},` : ''}
  ${citation.doi ? `doi = {${citation.doi}},` : ''}
}`;

    default:
      return citation.title;
  }
}

// Citation Card Component
function CitationCard({
  citation,
  onToggleFavorite,
  onToggleVerify,
  onArchive,
  onCopy,
  onView,
}: {
  citation: Citation;
  onToggleFavorite: (id: string) => void;
  onToggleVerify: (id: string) => void;
  onArchive: (id: string) => void;
  onCopy: (citation: Citation, format: CitationFormat) => void;
  onView: (citation: Citation) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const source = sourceConfig[citation.source];

  return (
    <Card className={`transition-all ${citation.isFavorite ? 'ring-1 ring-amber-400' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Source Icon */}
          <div className={`p-2 rounded-lg shrink-0 ${source.color}`}>{source.icon}</div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title Row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2">{citation.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {citation.authors.slice(0, 3).join(', ')}
                  {citation.authors.length > 3 && ' et al.'}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => onToggleFavorite(citation.id)}
                >
                  {citation.isFavorite ? (
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  ) : (
                    <StarOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(citation)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCopy(citation, 'apa')}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy APA
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCopy(citation, 'bibtex')}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy BibTeX
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onToggleVerify(citation.id)}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {citation.isVerified ? 'Unverify' : 'Mark Verified'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onArchive(citation.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={source.color}>
                {source.label}
              </Badge>
              {citation.sourceId && (
                <Badge variant="outline" className="font-mono text-xs">
                  {citation.sourceId}
                </Badge>
              )}
              {citation.isVerified && (
                <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
              {citation.publicationDate && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(citation.publicationDate).getFullYear()}
                </Badge>
              )}
            </div>

            {/* Expandable Details */}
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Hide details
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-3 w-3 mr-1" />
                    Show details
                  </>
                )}
              </Button>

              {expanded && (
                <div className="mt-2 space-y-2 text-xs">
                  {citation.journal && (
                    <p>
                      <span className="font-medium">Journal:</span> {citation.journal}
                      {citation.volume && `, Vol. ${citation.volume}`}
                      {citation.issue && `, Issue ${citation.issue}`}
                      {citation.pages && `, pp. ${citation.pages}`}
                    </p>
                  )}
                  {citation.doi && (
                    <p>
                      <span className="font-medium">DOI:</span>{' '}
                      <a
                        href={`https://doi.org/${citation.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {citation.doi}
                      </a>
                    </p>
                  )}
                  {citation.url && (
                    <p>
                      <span className="font-medium">URL:</span>{' '}
                      <a
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate block"
                      >
                        {citation.url}
                      </a>
                    </p>
                  )}
                  {citation.abstract && (
                    <div className="p-2 bg-muted/50 rounded text-muted-foreground">
                      <p className="font-medium mb-1">Abstract:</p>
                      <p className="line-clamp-3">{citation.abstract}</p>
                    </div>
                  )}
                  {citation.linkedDocuments.length > 0 && (
                    <p>
                      <span className="font-medium">Linked Documents:</span>{' '}
                      {citation.linkedDocuments.length} document(s)
                    </p>
                  )}
                  {citation.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {citation.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Usage Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Used {citation.usageCount}x
                </span>
                {citation.lastUsed && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last: {new Date(citation.lastUsed).toLocaleDateString()}
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {citation.addedBy}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Citation Management Dashboard
export function CitationManagementDashboard() {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<CitationSource | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<CitationStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'usage' | 'title'>('recent');
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Calculate stats
  const stats: CitationStats = {
    total: citations.length,
    bySource: citations.reduce(
      (acc, c) => ({ ...acc, [c.source]: (acc[c.source] || 0) + 1 }),
      {} as Record<CitationSource, number>
    ),
    byStatus: citations.reduce(
      (acc, c) => ({ ...acc, [c.status]: (acc[c.status] || 0) + 1 }),
      {} as Record<CitationStatus, number>
    ),
    verified: citations.filter((c) => c.isVerified).length,
    recentlyAdded: citations.filter(
      (c) => new Date(c.addedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
    mostUsed: [...citations].sort((a, b) => b.usageCount - a.usageCount).slice(0, 5),
  };

  // Fetch citations
  const fetchCitations = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/knowledge/citations');
      // const data = await response.json();
      // setCitations(data.citations);

      // Mock data
      const mockCitations: Citation[] = [
        {
          id: '1',
          title: 'Adalimumab for the treatment of moderate to severe rheumatoid arthritis',
          authors: ['Smith J', 'Johnson M', 'Williams K', 'Brown R'],
          source: 'pubmed',
          sourceId: 'PMID:12345678',
          doi: '10.1000/example.123',
          publicationDate: '2023-06-15',
          journal: 'The Lancet Rheumatology',
          volume: '15',
          issue: '3',
          pages: '234-245',
          abstract: 'This randomized controlled trial evaluated the efficacy and safety of adalimumab...',
          status: 'active',
          isVerified: true,
          isFavorite: true,
          usageCount: 45,
          lastUsed: '2024-01-20',
          addedAt: '2024-01-10',
          addedBy: 'Dr. Smith',
          linkedDocuments: ['doc-1', 'doc-3'],
          linkedEntities: ['adalimumab', 'rheumatoid-arthritis'],
          tags: ['rheumatology', 'biologics', 'RCT'],
        },
        {
          id: '2',
          title: 'A Study of Tofacitinib in Patients With Psoriatic Arthritis',
          authors: ['Anderson P', 'Davis L'],
          source: 'clinical-trial',
          sourceId: 'NCT04123456',
          url: 'https://clinicaltrials.gov/study/NCT04123456',
          publicationDate: '2024-01-01',
          status: 'active',
          isVerified: false,
          isFavorite: false,
          usageCount: 12,
          lastUsed: '2024-01-18',
          addedAt: '2024-01-05',
          addedBy: 'Dr. Anderson',
          linkedDocuments: ['doc-2'],
          linkedEntities: ['tofacitinib'],
          tags: ['phase-3', 'psoriatic-arthritis'],
        },
        {
          id: '3',
          title: 'FDA Approval of Secukinumab for Ankylosing Spondylitis',
          authors: ['FDA'],
          source: 'fda-approval',
          sourceId: 'NDA-761024',
          url: 'https://www.accessdata.fda.gov/drugsatfda_docs/appletter/2023/761024Orig1s000ltr.pdf',
          publicationDate: '2023-12-10',
          status: 'active',
          isVerified: true,
          isFavorite: false,
          usageCount: 28,
          addedAt: '2023-12-15',
          addedBy: 'Regulatory Team',
          linkedDocuments: ['doc-4', 'doc-5'],
          linkedEntities: ['secukinumab'],
          tags: ['FDA', 'approval', 'biologics'],
        },
        {
          id: '4',
          title: 'Internal Clinical Protocol for RA Treatment Guidelines',
          authors: ['Medical Affairs Team'],
          source: 'knowledge-base',
          publicationDate: '2024-01-08',
          status: 'active',
          isVerified: true,
          isFavorite: true,
          usageCount: 67,
          lastUsed: '2024-01-22',
          addedAt: '2024-01-08',
          addedBy: 'Medical Affairs',
          linkedDocuments: ['doc-1'],
          linkedEntities: [],
          tags: ['internal', 'guidelines', 'protocol'],
        },
      ];

      setCitations(mockCitations);
    } catch (error) {
      console.error('Failed to fetch citations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCitations();
  }, [fetchCitations]);

  // Handlers
  const handleToggleFavorite = (id: string) => {
    setCitations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    );
  };

  const handleToggleVerify = (id: string) => {
    setCitations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isVerified: !c.isVerified } : c))
    );
  };

  const handleArchive = (id: string) => {
    setCitations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'archived' as CitationStatus } : c))
    );
  };

  const handleCopy = async (citation: Citation, format: CitationFormat) => {
    const formatted = formatCitation(citation, format);
    await navigator.clipboard.writeText(formatted);
    setCopiedId(citation.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleView = (citation: Citation) => {
    setSelectedCitation(citation);
  };

  const handleExportAll = async (format: CitationFormat) => {
    const exported = citations
      .filter((c) => c.status === 'active')
      .map((c) => formatCitation(c, format))
      .join('\n\n');
    await navigator.clipboard.writeText(exported);
  };

  // Filter and sort
  const filteredCitations = citations.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.authors.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.sourceId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = filterSource === 'all' || c.source === filterSource;
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesSource && matchesStatus;
  });

  const sortedCitations = [...filteredCitations].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    if (sortBy === 'usage') return b.usageCount - a.usageCount;
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Citations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.verified}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.recentlyAdded}</p>
                <p className="text-xs text-muted-foreground">Added This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {citations.reduce((sum, c) => sum + c.usageCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Uses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Source Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Citations by Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.bySource).map(([source, count]) => (
              <div
                key={source}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${sourceConfig[source as CitationSource].color}`}
              >
                {sourceConfig[source as CitationSource].icon}
                <span className="text-sm font-medium">{sourceConfig[source as CitationSource].label}</span>
                <Badge variant="secondary" className="ml-1">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search citations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-[250px]"
                />
              </div>

              {/* Source Filter */}
              <Select
                value={filterSource}
                onValueChange={(v) => setFilterSource(v as CitationSource | 'all')}
              >
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {Object.entries(sourceConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {config.icon}
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={filterStatus}
                onValueChange={(v) => setFilterStatus(v as CitationStatus | 'all')}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="usage">Most Used</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={fetchCitations}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExportAll('apa')}>
                    Export APA
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportAll('mla')}>
                    Export MLA
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportAll('bibtex')}>
                    Export BibTeX
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportAll('vancouver')}>
                    Export Vancouver
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Citations List */}
      <div className="space-y-3">
        {sortedCitations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="font-medium">No citations found</p>
              <p className="text-sm text-muted-foreground">
                Add citations from external sources or knowledge base documents
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedCitations.map((citation) => (
            <CitationCard
              key={citation.id}
              citation={citation}
              onToggleFavorite={handleToggleFavorite}
              onToggleVerify={handleToggleVerify}
              onArchive={handleArchive}
              onCopy={handleCopy}
              onView={handleView}
            />
          ))
        )}
      </div>

      {/* Copy Success Toast */}
      {copiedId && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Citation copied to clipboard
        </div>
      )}
    </div>
  );
}

export default CitationManagementDashboard;
