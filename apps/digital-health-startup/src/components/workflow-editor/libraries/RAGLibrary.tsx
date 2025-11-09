'use client';

import { useState, useEffect } from 'react';
import { Database } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface RAGSource {
  id: string;
  unique_id: string;
  name: string;
  source_type: string;
  domain?: string;
  description?: string;
}

interface RAGLibraryProps {
  onDragStart: (event: React.DragEvent, rag: RAGSource) => void;
  className?: string;
}

export function RAGLibrary({ onDragStart, className }: RAGLibraryProps) {
  const [rags, setRags] = useState<RAGSource[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  useEffect(() => {
    const fetchRAGs = async () => {
      try {
        const response = await fetch('/api/workflows/rags');
        if (response.ok) {
          const { rags } = await response.json();
          setRags(rags || []);
          
          // Extract unique domains
          const uniqueDomains = Array.from(
            new Set(rags.map((r: RAGSource) => r.domain).filter(Boolean))
          ) as string[];
          setDomains(uniqueDomains);
        }
      } catch (error) {
        console.error('Error fetching RAGs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRAGs();
  }, []);

  const filteredRAGs = rags.filter((rag) => {
    const matchesSearch = rag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rag.source_type?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = !selectedDomain || rag.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">Loading RAG sources...</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Search */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search RAG sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Domain Filter */}
      {domains.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-1">
            <Button
              variant={selectedDomain === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDomain(null)}
              className="text-xs h-7"
            >
              All ({rags.length})
            </Button>
            {domains.map((domain) => {
              const count = rags.filter((r) => r.domain === domain).length;
              return (
                <Button
                  key={domain}
                  variant={selectedDomain === domain ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDomain(domain)}
                  className="text-xs h-7"
                >
                  {domain} ({count})
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* RAG List */}
      <ScrollArea className="h-[calc(100vh-380px)]">
        <div className="p-4 space-y-2">
          <p className="text-xs text-muted-foreground mb-3">
            {filteredRAGs.length} RAG source{filteredRAGs.length !== 1 ? 's' : ''} available
          </p>
          {filteredRAGs.map((rag) => (
            <div
              key={rag.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-background cursor-move hover:bg-accent hover:border-accent-foreground transition-all"
              draggable
              onDragStart={(e) => onDragStart(e, rag)}
            >
              <div className="p-2 rounded-md bg-cyan-100 text-cyan-600">
                <Database className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{rag.name}</p>
                <p className="text-xs text-muted-foreground">{rag.source_type}</p>
                {rag.domain && (
                  <Badge variant="outline" className="text-xs mt-1">
                    {rag.domain}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

