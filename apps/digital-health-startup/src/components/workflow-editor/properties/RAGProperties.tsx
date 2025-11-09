'use client';

import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface RAGPropertiesProps {
  data: any;
  onUpdate: (key: string, value: any) => void;
}

export function RAGProperties({ data, onUpdate }: RAGPropertiesProps) {
  const rag = data.rags?.[0];
  
  if (!rag) {
    return (
      <div className="text-sm text-muted-foreground p-4 text-center">
        No RAG source configured. Drag a RAG from the Library to configure.
      </div>
    );
  }

  return (
    <>
      <Separator />
      <div className="space-y-2">
        <Label>Configured RAG Source</Label>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm font-medium">{rag.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{rag.source_type}</p>
            {rag.domain && (
              <Badge variant="outline" className="text-xs mt-2">
                {rag.domain}
              </Badge>
            )}
            {rag.description && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{rag.description}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

