'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit3,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Tag,
  FileText,
  Clock,
  User,
  Pill,
  Activity,
  Building2,
  Beaker,
  Target,
  Link2,
  Trash2,
  Plus,
  Save,
  Undo,
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

// Entity types common in medical/pharmaceutical domain
type EntityType =
  | 'medication'
  | 'diagnosis'
  | 'procedure'
  | 'organization'
  | 'person'
  | 'condition'
  | 'biomarker'
  | 'gene'
  | 'protein'
  | 'trial'
  | 'unknown';

type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'corrected';

interface ExtractedEntity {
  id: string;
  text: string;
  type: EntityType;
  confidence: number;
  sourceText: string;
  documentId: string;
  documentName: string;
  chunkId: string;
  position: { start: number; end: number };
  status: VerificationStatus;
  correctedType?: EntityType;
  correctedText?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  linkedEntityId?: string; // Link to master entity in knowledge graph
  metadata?: Record<string, any>;
}

interface DocumentEntityGroup {
  documentId: string;
  documentName: string;
  entities: ExtractedEntity[];
  totalEntities: number;
  pendingCount: number;
  verifiedCount: number;
  rejectedCount: number;
}

// Entity type icon mapping
const entityTypeIcons: Record<EntityType, React.ReactNode> = {
  medication: <Pill className="h-4 w-4" />,
  diagnosis: <Activity className="h-4 w-4" />,
  procedure: <Target className="h-4 w-4" />,
  organization: <Building2 className="h-4 w-4" />,
  person: <User className="h-4 w-4" />,
  condition: <AlertCircle className="h-4 w-4" />,
  biomarker: <Beaker className="h-4 w-4" />,
  gene: <Tag className="h-4 w-4" />,
  protein: <Tag className="h-4 w-4" />,
  trial: <FileText className="h-4 w-4" />,
  unknown: <Tag className="h-4 w-4" />,
};

// Entity type colors
const entityTypeColors: Record<EntityType, string> = {
  medication: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  diagnosis: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  procedure: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  organization: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  person: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  condition: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  biomarker: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
  gene: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  protein: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  trial: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
  unknown: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

// Status colors
const statusColors: Record<VerificationStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  verified: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  corrected: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
};

// Status icons
const statusIcons: Record<VerificationStatus, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  verified: <CheckCircle2 className="h-3 w-3" />,
  rejected: <XCircle className="h-3 w-3" />,
  corrected: <Edit3 className="h-3 w-3" />,
};

// Individual entity card with inline editing
function EntityCard({
  entity,
  onVerify,
  onReject,
  onCorrect,
  onLink,
  onUndo,
}: {
  entity: ExtractedEntity;
  onVerify: (id: string) => void;
  onReject: (id: string) => void;
  onCorrect: (id: string, type: EntityType, text: string) => void;
  onLink: (id: string) => void;
  onUndo: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedType, setEditedType] = useState<EntityType>(entity.type);
  const [editedText, setEditedText] = useState(entity.text);

  const handleSaveCorrection = () => {
    onCorrect(entity.id, editedType, editedText);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedType(entity.type);
    setEditedText(entity.text);
    setIsEditing(false);
  };

  const confidenceColor =
    entity.confidence >= 0.9
      ? 'text-green-600'
      : entity.confidence >= 0.7
        ? 'text-amber-600'
        : 'text-red-600';

  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        entity.status === 'pending'
          ? 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/20'
          : entity.status === 'verified'
            ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20'
            : entity.status === 'rejected'
              ? 'border-red-200 bg-red-50/50 dark:bg-red-950/20'
              : 'border-blue-200 bg-blue-50/50 dark:bg-blue-950/20'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Entity Icon */}
        <div className={`p-2 rounded-md ${entityTypeColors[entity.correctedType || entity.type]}`}>
          {entityTypeIcons[entity.correctedType || entity.type]}
        </div>

        {/* Entity Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                placeholder="Entity text"
                className="h-8"
              />
              <Select
                value={editedType}
                onValueChange={(v) => setEditedType(v as EntityType)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(entityTypeIcons).map((type) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        {entityTypeIcons[type as EntityType]}
                        <span className="capitalize">{type}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveCorrection}>
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">
                    {entity.correctedText || entity.text}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${entityTypeColors[entity.correctedType || entity.type]}`}
                  >
                    {entity.correctedType || entity.type}
                  </Badge>
                  {entity.correctedType && (
                    <Badge variant="outline" className="text-xs line-through opacity-50">
                      {entity.type}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className={`text-xs ${statusColors[entity.status]}`}>
                    {statusIcons[entity.status]}
                    <span className="ml-1 capitalize">{entity.status}</span>
                  </Badge>
                </div>
              </div>

              {/* Source Context */}
              <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/50 p-2 rounded">
                ...{entity.sourceText}...
              </p>

              {/* Confidence & Metadata */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className={confidenceColor}>
                  Confidence: {Math.round(entity.confidence * 100)}%
                </span>
                <span>Chunk: {entity.chunkId.slice(0, 8)}</span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        {!isEditing && entity.status === 'pending' && (
          <div className="flex flex-col gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-green-600 hover:bg-green-100"
              onClick={() => onVerify(entity.id)}
              title="Verify"
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-100"
              onClick={() => setIsEditing(true)}
              title="Edit"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-red-600 hover:bg-red-100"
              onClick={() => onReject(entity.id)}
              title="Reject"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )}
        {!isEditing && entity.status !== 'pending' && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground"
            onClick={() => onUndo(entity.id)}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Linked Entity Indicator */}
      {entity.linkedEntityId && (
        <div className="mt-2 pt-2 border-t border-dashed flex items-center gap-2 text-xs text-muted-foreground">
          <Link2 className="h-3 w-3" />
          <span>Linked to: {entity.linkedEntityId}</span>
        </div>
      )}
    </div>
  );
}

// Document group with collapsible entities
function DocumentEntityGroupCard({
  group,
  onVerify,
  onReject,
  onCorrect,
  onLink,
  onUndo,
  onVerifyAll,
}: {
  group: DocumentEntityGroup;
  onVerify: (id: string) => void;
  onReject: (id: string) => void;
  onCorrect: (id: string, type: EntityType, text: string) => void;
  onLink: (id: string) => void;
  onUndo: (id: string) => void;
  onVerifyAll: (documentId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const progress = ((group.verifiedCount + group.rejectedCount) / group.totalEntities) * 100;

  return (
    <Card>
      <CardHeader className="py-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-sm font-medium">{group.documentName}</CardTitle>
              <CardDescription className="text-xs">
                {group.totalEntities} entities extracted
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress badges */}
            <div className="flex items-center gap-2">
              {group.pendingCount > 0 && (
                <Badge variant="outline" className={statusColors.pending}>
                  {group.pendingCount} pending
                </Badge>
              )}
              {group.verifiedCount > 0 && (
                <Badge variant="outline" className={statusColors.verified}>
                  {group.verifiedCount} verified
                </Badge>
              )}
              {group.rejectedCount > 0 && (
                <Badge variant="outline" className={statusColors.rejected}>
                  {group.rejectedCount} rejected
                </Badge>
              )}
            </div>
            {/* Progress bar */}
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-12 text-right">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-3">
          {/* Quick actions */}
          {group.pendingCount > 0 && (
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">
                {group.pendingCount} entities awaiting verification
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onVerifyAll(group.documentId);
                }}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Verify All High Confidence
              </Button>
            </div>
          )}

          {/* Entity list */}
          <div className="space-y-2">
            {group.entities.map((entity) => (
              <EntityCard
                key={entity.id}
                entity={entity}
                onVerify={onVerify}
                onReject={onReject}
                onCorrect={onCorrect}
                onLink={onLink}
                onUndo={onUndo}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Main Entity Verification Workflow Component
export function EntityVerificationWorkflow() {
  const [entities, setEntities] = useState<ExtractedEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<EntityType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<VerificationStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'date' | 'type'>('confidence');

  // Fetch entities (mock data for now)
  const fetchEntities = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/knowledge/entities');
      // const data = await response.json();
      // setEntities(data.entities);

      // Mock data for demonstration
      const mockEntities: ExtractedEntity[] = [
        {
          id: '1',
          text: 'Adalimumab',
          type: 'medication',
          confidence: 0.95,
          sourceText: 'The patient was prescribed Adalimumab 40mg subcutaneously every two weeks...',
          documentId: 'doc-1',
          documentName: 'Clinical Protocol v2.1.pdf',
          chunkId: 'chunk-001',
          position: { start: 45, end: 55 },
          status: 'pending',
        },
        {
          id: '2',
          text: 'Rheumatoid Arthritis',
          type: 'condition',
          confidence: 0.88,
          sourceText: '...diagnosed with moderate to severe Rheumatoid Arthritis according to ACR criteria...',
          documentId: 'doc-1',
          documentName: 'Clinical Protocol v2.1.pdf',
          chunkId: 'chunk-002',
          position: { start: 120, end: 140 },
          status: 'pending',
        },
        {
          id: '3',
          text: 'TNF-alpha',
          type: 'biomarker',
          confidence: 0.92,
          sourceText: '...targeting TNF-alpha inhibition as primary mechanism of action...',
          documentId: 'doc-1',
          documentName: 'Clinical Protocol v2.1.pdf',
          chunkId: 'chunk-003',
          position: { start: 200, end: 209 },
          status: 'verified',
          verifiedBy: 'Dr. Smith',
          verifiedAt: '2024-01-15T10:30:00Z',
        },
        {
          id: '4',
          text: 'Pfizer Inc.',
          type: 'organization',
          confidence: 0.99,
          sourceText: 'Study sponsored by Pfizer Inc. in collaboration with...',
          documentId: 'doc-2',
          documentName: 'Investigator Brochure.pdf',
          chunkId: 'chunk-010',
          position: { start: 50, end: 61 },
          status: 'pending',
        },
        {
          id: '5',
          text: 'IL-6',
          type: 'biomarker',
          confidence: 0.65,
          sourceText: '...monitoring IL-6 levels and other inflammatory markers...',
          documentId: 'doc-2',
          documentName: 'Investigator Brochure.pdf',
          chunkId: 'chunk-011',
          position: { start: 180, end: 184 },
          status: 'pending',
        },
        {
          id: '6',
          text: 'DAS28-CRP',
          type: 'procedure',
          confidence: 0.78,
          sourceText: 'Disease activity measured using DAS28-CRP score at baseline and week 12',
          documentId: 'doc-2',
          documentName: 'Investigator Brochure.pdf',
          chunkId: 'chunk-012',
          position: { start: 250, end: 259 },
          status: 'corrected',
          correctedType: 'biomarker',
          verifiedBy: 'Dr. Jones',
          verifiedAt: '2024-01-16T14:00:00Z',
        },
      ];

      setEntities(mockEntities);
    } catch (error) {
      console.error('Failed to fetch entities:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  // Action handlers
  const handleVerify = (id: string) => {
    setEntities((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: 'verified' as VerificationStatus, verifiedAt: new Date().toISOString() }
          : e
      )
    );
  };

  const handleReject = (id: string) => {
    setEntities((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'rejected' as VerificationStatus } : e))
    );
  };

  const handleCorrect = (id: string, type: EntityType, text: string) => {
    setEntities((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: 'corrected' as VerificationStatus,
              correctedType: type,
              correctedText: text,
              verifiedAt: new Date().toISOString(),
            }
          : e
      )
    );
  };

  const handleLink = (id: string) => {
    // TODO: Open entity linking modal
    console.log('Link entity:', id);
  };

  const handleUndo = (id: string) => {
    setEntities((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: 'pending' as VerificationStatus,
              correctedType: undefined,
              correctedText: undefined,
              verifiedAt: undefined,
              verifiedBy: undefined,
            }
          : e
      )
    );
  };

  const handleVerifyAllHighConfidence = (documentId: string) => {
    setEntities((prev) =>
      prev.map((e) =>
        e.documentId === documentId && e.status === 'pending' && e.confidence >= 0.9
          ? { ...e, status: 'verified' as VerificationStatus, verifiedAt: new Date().toISOString() }
          : e
      )
    );
  };

  // Filter and group entities
  const filteredEntities = entities.filter((e) => {
    const matchesSearch =
      !searchQuery ||
      e.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.sourceText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || e.type === filterType;
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Sort entities
  const sortedEntities = [...filteredEntities].sort((a, b) => {
    if (sortBy === 'confidence') return b.confidence - a.confidence;
    if (sortBy === 'type') return a.type.localeCompare(b.type);
    return 0;
  });

  // Group by document
  const groupedByDocument = sortedEntities.reduce<Record<string, DocumentEntityGroup>>(
    (acc, entity) => {
      if (!acc[entity.documentId]) {
        acc[entity.documentId] = {
          documentId: entity.documentId,
          documentName: entity.documentName,
          entities: [],
          totalEntities: 0,
          pendingCount: 0,
          verifiedCount: 0,
          rejectedCount: 0,
        };
      }
      acc[entity.documentId].entities.push(entity);
      acc[entity.documentId].totalEntities++;
      if (entity.status === 'pending') acc[entity.documentId].pendingCount++;
      if (entity.status === 'verified' || entity.status === 'corrected')
        acc[entity.documentId].verifiedCount++;
      if (entity.status === 'rejected') acc[entity.documentId].rejectedCount++;
      return acc;
    },
    {}
  );

  // Statistics
  const stats = {
    total: entities.length,
    pending: entities.filter((e) => e.status === 'pending').length,
    verified: entities.filter((e) => e.status === 'verified' || e.status === 'corrected').length,
    rejected: entities.filter((e) => e.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Tag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Entities</p>
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
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
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
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type filter */}
            <Select value={filterType} onValueChange={(v) => setFilterType(v as EntityType | 'all')}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.keys(entityTypeIcons).map((type) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      {entityTypeIcons[type as EntityType]}
                      <span className="capitalize">{type}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status filter */}
            <Select
              value={filterStatus}
              onValueChange={(v) => setFilterStatus(v as VerificationStatus | 'all')}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="corrected">Corrected</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh */}
            <Button variant="outline" onClick={fetchEntities}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Entity Groups */}
      <div className="space-y-4">
        {Object.values(groupedByDocument).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="font-medium">No entities found</p>
              <p className="text-sm text-muted-foreground">
                Upload documents to extract and verify entities
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.values(groupedByDocument).map((group) => (
            <DocumentEntityGroupCard
              key={group.documentId}
              group={group}
              onVerify={handleVerify}
              onReject={handleReject}
              onCorrect={handleCorrect}
              onLink={handleLink}
              onUndo={handleUndo}
              onVerifyAll={handleVerifyAllHighConfidence}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default EntityVerificationWorkflow;
