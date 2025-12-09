'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils';
import { 
  FileText, 
  Book, 
  Globe, 
  Database, 
  Filter,
  ChevronDown,
  ExternalLink,
  Search
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { ScrollArea } from '../../ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '../../ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

type SourceType = 'pubmed' | 'clinical_trial' | 'fda' | 'web' | 'rag' | 'document';

interface EvidenceSource {
  id: string;
  title: string;
  type: SourceType;
  url?: string;
  excerpt: string;
  confidence: number;
  relevanceScore: number;
  metadata?: {
    authors?: string[];
    year?: number;
    journal?: string;
  };
}

interface VitalEvidencePanelProps {
  sources: EvidenceSource[];
  title?: string;
  maxHeight?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  onSourceClick?: (source: EvidenceSource) => void;
  className?: string;
}

const sourceIcons: Record<SourceType, React.ComponentType<{ className?: string }>> = {
  pubmed: Book,
  clinical_trial: FileText,
  fda: FileText,
  web: Globe,
  rag: Database,
  document: FileText,
};

const sourceLabels: Record<SourceType, string> = {
  pubmed: 'PubMed',
  clinical_trial: 'Clinical Trial',
  fda: 'FDA',
  web: 'Web',
  rag: 'Knowledge Base',
  document: 'Document',
};

/**
 * VitalEvidencePanel - Evidence sources panel component
 * 
 * Displays a filterable, searchable list of evidence sources
 * with relevance scores and quick access to source details.
 */
export function VitalEvidencePanel({
  sources,
  title = "Evidence Sources",
  maxHeight = 400,
  showSearch = true,
  showFilters = true,
  onSourceClick,
  className
}: VitalEvidencePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Set<SourceType>>(new Set());
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  
  // Get unique source types
  const availableTypes = Array.from(new Set(sources.map(s => s.type)));
  
  // Filter sources
  const filteredSources = sources.filter(source => {
    const matchesSearch = searchQuery === '' || 
      source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedTypes.size === 0 || selectedTypes.has(source.type);
    
    return matchesSearch && matchesType;
  });
  
  // Sort by relevance
  const sortedSources = [...filteredSources].sort(
    (a, b) => b.relevanceScore - a.relevanceScore
  );
  
  const toggleType = (type: SourceType) => {
    const newSelected = new Set(selectedTypes);
    if (newSelected.has(type)) {
      newSelected.delete(type);
    } else {
      newSelected.add(type);
    }
    setSelectedTypes(newSelected);
  };
  
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedSources);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSources(newExpanded);
  };
  
  return (
    <div className={cn("border rounded-lg bg-background", className)}>
      {/* Header */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm">{title}</h3>
          <Badge variant="secondary" className="text-xs">
            {filteredSources.length} sources
          </Badge>
        </div>
        
        {/* Search and Filters */}
        {(showSearch || showFilters) && (
          <div className="flex gap-2">
            {showSearch && (
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-sm"
                />
              </div>
            )}
            
            {showFilters && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Filter className="h-4 w-4 mr-1" />
                    {selectedTypes.size > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1">
                        {selectedTypes.size}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {availableTypes.map((type) => {
                    const Icon = sourceIcons[type];
                    return (
                      <DropdownMenuCheckboxItem
                        key={type}
                        checked={selectedTypes.has(type)}
                        onCheckedChange={() => toggleType(type)}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {sourceLabels[type]}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>
      
      {/* Sources List */}
      <ScrollArea style={{ maxHeight }}>
        <div className="p-2 space-y-2">
          {sortedSources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No sources found
            </div>
          ) : (
            sortedSources.map((source) => {
              const Icon = sourceIcons[source.type];
              const isExpanded = expandedSources.has(source.id);
              
              return (
                <Collapsible
                  key={source.id}
                  open={isExpanded}
                  onOpenChange={() => toggleExpanded(source.id)}
                >
                  <div className="border rounded-lg overflow-hidden">
                    <CollapsibleTrigger className="w-full p-3 text-left hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded bg-muted shrink-0">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {sourceLabels[source.type]}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                source.confidence >= 0.8 && "border-green-500 text-green-700",
                                source.confidence >= 0.5 && source.confidence < 0.8 && "border-yellow-500 text-yellow-700",
                                source.confidence < 0.5 && "border-red-500 text-red-700"
                              )}
                            >
                              {Math.round(source.confidence * 100)}%
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm line-clamp-1 mt-0.5">
                            {source.title}
                          </h4>
                        </div>
                        
                        <ChevronDown className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                          isExpanded && "rotate-180"
                        )} />
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-3 pb-3 pt-0 space-y-2">
                        {source.metadata?.authors && (
                          <p className="text-xs text-muted-foreground">
                            {source.metadata.authors.slice(0, 3).join(', ')}
                            {source.metadata.authors.length > 3 && ' et al.'}
                            {source.metadata.year && ` (${source.metadata.year})`}
                          </p>
                        )}
                        
                        <p className="text-sm text-muted-foreground">
                          {source.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-muted-foreground">
                            Relevance: {Math.round(source.relevanceScore * 100)}%
                          </span>
                          
                          <div className="flex gap-2">
                            {source.url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                asChild
                              >
                                <a 
                                  href={source.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View source
                                </a>
                              </Button>
                            )}
                            {onSourceClick && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => onSourceClick(source)}
                              >
                                Details
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default VitalEvidencePanel;
