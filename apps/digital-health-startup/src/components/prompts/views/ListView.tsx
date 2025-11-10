'use client';

import { Copy, Star, Eye, ChevronRight } from 'lucide-react';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import type { Prompt } from '@/types/prompts';

interface ListViewProps {
  prompts: Prompt[];
  onCopy: (prompt: Prompt) => void;
  onFavorite?: (prompt: Prompt) => void;
  onView?: (prompt: Prompt) => void;
}

export default function ListView({
  prompts,
  onCopy,
  onFavorite,
  onView,
}: ListViewProps) {
  if (prompts.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
        <p className="text-lg font-medium text-gray-400 mb-2">No prompts found</p>
        <p className="text-sm text-gray-400">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {prompts.map((prompt) => (
        <div
          key={prompt.id}
          className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start gap-4">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">
                    {prompt.display_name}
                  </h3>
                  {prompt.metadata?.unique_id && (
                    <div className="text-xs text-gray-500 font-mono mb-2">
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

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {prompt.description}
              </p>

              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-2">
                {prompt.suite && (
                  <Badge variant="outline" className="text-xs">
                    {prompt.suite}
                  </Badge>
                )}

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

                {/* Tags */}
                {prompt.metadata?.tags && prompt.metadata.tags.length > 0 && (
                  <>
                    <span className="text-gray-300">|</span>
                    {prompt.metadata.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {prompt.metadata.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{prompt.metadata.tags.length - 3} more
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopy(prompt)}
                className="whitespace-nowrap"
              >
                <Copy className="h-3 w-3 mr-1.5" />
                Copy
              </Button>

              {onView && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(prompt)}
                >
                  <Eye className="h-3 w-3 mr-1.5" />
                  View
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
