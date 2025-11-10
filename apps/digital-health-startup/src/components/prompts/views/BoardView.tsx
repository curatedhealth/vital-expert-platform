'use client';

import { Copy, Star, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import type { Prompt } from '@/types/prompts';

interface BoardViewProps {
  prompts: Prompt[];
  onCopy: (prompt: Prompt) => void;
  onFavorite?: (prompt: Prompt) => void;
  onView?: (prompt: Prompt) => void;
}

export default function BoardView({
  prompts,
  onCopy,
  onFavorite,
  onView,
}: BoardViewProps) {
  if (prompts.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
        <p className="text-lg font-medium text-gray-400 mb-2">No prompts found</p>
        <p className="text-sm text-gray-400">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {prompts.map((prompt) => (
        <Card
          key={prompt.id}
          className="group hover:shadow-xl transition-all duration-200 flex flex-col h-full"
        >
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-medium line-clamp-2 mb-1">
                  {prompt.display_name}
                </CardTitle>
                {prompt.metadata?.unique_id && (
                  <div className="text-xs text-gray-500 font-mono truncate">
                    {prompt.metadata.unique_id}
                  </div>
                )}
              </div>
              {onFavorite && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 flex-shrink-0"
                  onClick={() => onFavorite(prompt)}
                >
                  <Star
                    className={`h-4 w-4 ${
                      prompt.is_favorite
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-400'
                    }`}
                  />
                </Button>
              )}
            </div>

            <CardDescription className="text-xs line-clamp-3">
              {prompt.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0 flex-1 flex flex-col justify-between">
            {/* Metadata Badges */}
            <div className="space-y-2 mb-4">
              <div className="flex flex-wrap gap-1">
                {prompt.metadata?.pattern && (
                  <Badge variant="outline" className="text-xs">
                    {prompt.metadata.pattern}
                  </Badge>
                )}
                {prompt.category && (
                  <Badge variant="secondary" className="text-xs">
                    {prompt.category}
                  </Badge>
                )}
                {prompt.complexity_level && (
                  <Badge
                    variant="default"
                    className={`text-xs ${
                      prompt.complexity_level === 'expert'
                        ? 'bg-red-500'
                        : prompt.complexity_level === 'complex'
                        ? 'bg-orange-500'
                        : prompt.complexity_level === 'moderate'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                  >
                    {prompt.complexity_level}
                  </Badge>
                )}
                {prompt.metadata?.source === 'dh_prompt' && (
                  <Badge variant="default" className="text-xs bg-emerald-500">
                    Workflow
                  </Badge>
                )}
              </div>

              {/* Tags */}
              {prompt.metadata?.tags && prompt.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {prompt.metadata.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {prompt.metadata.tags.length > 3 && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      +{prompt.metadata.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopy(prompt)}
                className="flex-1 text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
              {onView && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(prompt)}
                  className="text-xs"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
