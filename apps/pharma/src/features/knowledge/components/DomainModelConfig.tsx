/**
 * Domain Model Configuration Component  
 * Displays recommended embedding and chat models for a domain
 */

import { Label } from '@/components/ui/label';

interface DomainModelConfigProps {
  domain: any;
}

export function DomainModelConfig({ domain }: DomainModelConfigProps) {
  const embeddingModel = domain.recommended_models?.embedding;
  const chatModel = domain.recommended_models?.chat;

  if (!embeddingModel && !chatModel) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Embedding Models */}
      {embeddingModel && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Embedding Models</Label>
          <div className="space-y-1 pl-4">
            <div className="text-sm">
              <span className="font-semibold">Primary:</span>{' '}
              <code className="bg-muted px-2 py-0.5 rounded">
                {embeddingModel.primary}
              </code>
            </div>
            {embeddingModel.specialized && (
              <div className="text-sm">
                <span className="font-semibold">Specialized:</span>{' '}
                <code className="bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded">
                  {embeddingModel.specialized}
                </code>
              </div>
            )}
            {embeddingModel.alternatives && embeddingModel.alternatives.length > 0 && (
              <div className="text-sm">
                <span className="font-semibold">Alternatives:</span>{' '}
                {embeddingModel.alternatives.map((alt: string, i: number) => (
                  <code key={i} className="bg-muted px-2 py-0.5 rounded ml-1">
                    {alt}
                  </code>
                ))}
              </div>
            )}
            {embeddingModel.rationale && (
              <p className="text-xs text-muted-foreground italic">
                {embeddingModel.rationale}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Chat Models */}
      {chatModel && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Chat Models</Label>
          <div className="space-y-1 pl-4">
            <div className="text-sm">
              <span className="font-semibold">Primary:</span>{' '}
              <code className="bg-muted px-2 py-0.5 rounded">
                {chatModel.primary}
              </code>
            </div>
            {chatModel.specialized && (
              <div className="text-sm">
                <span className="font-semibold">Specialized:</span>{' '}
                <code className="bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded">
                  {chatModel.specialized}
                </code>
              </div>
            )}
            {chatModel.alternatives && chatModel.alternatives.length > 0 && (
              <div className="text-sm">
                <span className="font-semibold">Alternatives:</span>{' '}
                {chatModel.alternatives.map((alt: string, i: number) => (
                  <code key={i} className="bg-muted px-2 py-0.5 rounded ml-1">
                    {alt}
                  </code>
                ))}
              </div>
            )}
            {chatModel.rationale && (
              <p className="text-xs text-muted-foreground italic">
                {chatModel.rationale}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

