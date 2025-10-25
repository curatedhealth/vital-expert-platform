/**
 * RAG Knowledge Base Selector Component
 * Allows selecting and assigning RAG databases to agents
 */

'use client';

import { Search, Database, Brain, FileText, Layers, CheckCircle, Circle } from 'lucide-react';
import React, { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui';

interface RagKnowledgeBase {
  id: string;
  name: string;
  display_name: string;
  description: string;
  purpose_description: string;
  rag_type: 'global' | 'agent_specific';
  knowledge_domains: string[];
  document_count: number;
  total_chunks?: number;
  quality_score?: number;
  is_assigned?: boolean;
  assignment_priority?: number;
}

interface RagKnowledgeBaseSelectorProps {
  availableRagDatabases: RagKnowledgeBase[];
  onAssignRag: (ragId: string, priority: number) => void;
  agentName: string;
}

export const RagKnowledgeBaseSelector: React.FC<RagKnowledgeBaseSelectorProps> = ({
  availableRagDatabases,
  onAssignRag,
  agentName
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'global' | 'agent_specific'>('all');
  const [filterDomain, setFilterDomain] = useState<string>('all');
  const [selectedRag, setSelectedRag] = useState<string[]>([]);
  const [assignmentPriority, setAssignmentPriority] = useState<number>(50);

  // Get unique knowledge domains for filtering
  const uniqueDomains = Array.from(
    new Set(
      availableRagDatabases.flatMap(rag => rag.knowledge_domains)
    )
  ).sort();

  // Filter RAG databases based on search and filters
  const filteredRag = availableRagDatabases.filter(rag => {
    const matchesSearch = rag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rag.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rag.purpose_description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || rag.rag_type === filterType;
    const matchesDomain = filterDomain === 'all' || rag.knowledge_domains.includes(filterDomain);
    return matchesSearch && matchesType && matchesDomain;
  });

  const handleToggleSelect = (ragId: string) => {
    setSelectedRag(prev =>
      prev.includes(ragId)
        ? prev.filter(id => id !== ragId)
        : [...prev, ragId]
    );
  };

  const handleAssignSelected = () => {
    selectedRag.forEach(ragId => {
      onAssignRag(ragId, assignmentPriority);
    });
    setSelectedRag([]);
  };

  const renderQualityBadge = (score: number | undefined) => {
    if (!score) return null;

    const percentage = Math.round(score * 100);
    let variant: 'default' | 'secondary' | 'destructive' = 'secondary';

    if (percentage >= 90) variant = 'default';
    else if (percentage >= 75) variant = 'secondary';
    else variant = 'destructive';

    return (
      <Badge variant={variant} className="text-xs">
        {percentage}% Quality
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Assign RAG Knowledge Bases to {agentName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Select global or agent-specific RAG databases to enhance your agent's knowledge capabilities.
            Each RAG database provides specialized knowledge for different domains and use cases.
          </p>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search RAG databases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={(value: unknown) => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="global">Global RAG</SelectItem>
                <SelectItem value="agent_specific">Agent-Specific</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDomain} onValueChange={setFilterDomain}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                {allDomains.map(domain => (
                  <SelectItem key={domain} value={domain}>
                    {domain.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Priority:</span>
              <Input
                type="number"
                min="1"
                max="100"
                value={assignmentPriority}
                onChange={(e) => setAssignmentPriority(parseInt(e.target.value) || 50)}
                className="w-20"
              />
            </div>
          </div>

          {/* Selection Actions */}
          {selectedRag.length > 0 && (
            <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg mb-4">
              <span className="text-sm font-medium">
                {selectedRag.length} RAG database{selectedRag.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRag([])}
                >
                  Clear Selection
                </Button>
                <Button
                  size="sm"
                  onClick={handleAssignSelected}
                  className="flex items-center gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  Assign Selected
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RAG Database Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRagDatabases.map((rag) => (
          <Card
            key={rag.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedRag.includes(rag.id)
                ? 'ring-2 ring-primary bg-primary/5'
                : ''
            } ${
              rag.is_assigned
                ? 'opacity-60 bg-muted/30'
                : ''
            }`}
            onClick={() => !rag.is_assigned && handleToggleSelection(rag.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedRag.includes(rag.id) ? (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-base">{rag.display_name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {rag.is_assigned && (
                    <Badge variant="outline" className="text-xs">
                      Assigned
                    </Badge>
                  )}
                  <Badge
                    variant={rag.rag_type === 'global' ? 'secondary' : 'default'}
                    className="text-xs"
                  >
                    {rag.rag_type === 'global' ? 'Global' : 'Agent'}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Description */}
              <p className="text-sm text-muted-foreground mb-3">
                {rag.description}
              </p>

              {/* Purpose */}
              <div className="mb-3">
                <h4 className="font-medium text-xs text-foreground mb-1">Best Used For:</h4>
                <p className="text-xs text-muted-foreground italic">
                  {rag.purpose_description}
                </p>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>{rag.document_count.toLocaleString()} docs</span>
                </div>
                {rag.total_chunks && (
                  <div className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    <span>{rag.total_chunks.toLocaleString()} chunks</span>
                  </div>
                )}
              </div>

              {/* Quality Score */}
              {rag.quality_score && (
                <div className="mb-3">
                  {getQualityBadge(rag.quality_score)}
                </div>
              )}

              {/* Knowledge Domains */}
              <div>
                <h4 className="font-medium text-xs text-foreground mb-1">Knowledge Domains:</h4>
                <div className="flex flex-wrap gap-1">
                  {rag.knowledge_domains.slice(0, 3).map((domain) => (
                    <Badge key={domain} variant="outline" className="text-xs">
                      {domain.replace('_', ' ')}
                    </Badge>
                  ))}
                  {rag.knowledge_domains.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{rag.knowledge_domains.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Assignment Info */}
              {rag.is_assigned && rag.assignment_priority && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Current Priority:</span>
                    <span className="font-medium">{rag.assignment_priority}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredRagDatabases.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No RAG Databases Found</h3>
            <p className="text-muted-foreground text-center">
              No RAG databases match your current search and filter criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};