'use client';

import { useState } from 'react';
import { Copy, Star, Eye, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import type { Prompt } from '@/types/prompts';
import type { SortOption } from '@/types/prompts';

interface TableViewProps {
  prompts: Prompt[];
  onCopy: (prompt: Prompt) => void;
  onFavorite?: (prompt: Prompt) => void;
  onView?: (prompt: Prompt) => void;
}

export default function TableView({
  prompts,
  onCopy,
  onFavorite,
  onView,
}: TableViewProps) {
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: SortOption) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const sortedPrompts = [...prompts].sort((a, b) => {
    let aVal: any, bVal: any;

    switch (sortBy) {
      case 'name':
        aVal = a.display_name.toLowerCase();
        bVal = b.display_name.toLowerCase();
        break;
      case 'created_at':
        aVal = new Date(a.created_at || 0).getTime();
        bVal = new Date(b.created_at || 0).getTime();
        break;
      case 'updated_at':
        aVal = new Date(a.updated_at || 0).getTime();
        bVal = new Date(b.updated_at || 0).getTime();
        break;
      case 'complexity':
        const complexityOrder = { basic: 1, moderate: 2, complex: 3, expert: 4 };
        aVal = complexityOrder[a.complexity_level as keyof typeof complexityOrder] || 0;
        bVal = complexityOrder[b.complexity_level as keyof typeof complexityOrder] || 0;
        break;
      case 'pattern':
        aVal = a.metadata?.pattern || '';
        bVal = b.metadata?.pattern || '';
        break;
      default:
        return 0;
    }

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });

  const SortIcon = ({ column }: { column: SortOption }) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-blue-600" />
    ) : (
      <ArrowDown className="h-3 w-3 text-blue-600" />
    );
  };

  if (prompts.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
        <p className="text-lg font-medium text-gray-400 mb-2">No prompts found</p>
        <p className="text-sm text-gray-400">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {onFavorite && (
                <th className="px-4 py-3 text-left w-10">
                  <Star className="h-4 w-4 text-gray-400" />
                </th>
              )}

              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wide hover:text-blue-600"
                >
                  Name
                  <SortIcon column="name" />
                </button>
              </th>

              <th className="px-4 py-3 text-left">
                <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Suite
                </div>
              </th>

              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('pattern')}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wide hover:text-blue-600"
                >
                  Pattern
                  <SortIcon column="pattern" />
                </button>
              </th>

              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('complexity')}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wide hover:text-blue-600"
                >
                  Complexity
                  <SortIcon column="complexity" />
                </button>
              </th>

              <th className="px-4 py-3 text-left">
                <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Tags
                </div>
              </th>

              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('created_at')}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wide hover:text-blue-600"
                >
                  Created
                  <SortIcon column="created_at" />
                </button>
              </th>

              <th className="px-4 py-3 text-right w-32">
                <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Actions
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {sortedPrompts.map((prompt) => (
              <tr key={prompt.id} className="hover:bg-gray-50 transition-colors">
                {onFavorite && (
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onFavorite(prompt)}
                      className="hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          prompt.is_favorite
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  </td>
                )}

                <td className="px-4 py-3">
                  <div className="max-w-xs">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {prompt.display_name}
                    </div>
                    {prompt.metadata?.unique_id && (
                      <div className="text-xs text-gray-500 font-mono truncate">
                        {prompt.metadata.unique_id}
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3">
                  {prompt.suite ? (
                    <Badge variant="outline" className="text-xs">
                      {prompt.suite}
                    </Badge>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>

                <td className="px-4 py-3">
                  {prompt.metadata?.pattern ? (
                    <Badge variant="outline" className="text-xs">
                      {prompt.metadata.pattern}
                    </Badge>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>

                <td className="px-4 py-3">
                  {prompt.complexity_level ? (
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
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>

                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {prompt.metadata?.tags && prompt.metadata.tags.length > 0 ? (
                      <>
                        {prompt.metadata.tags.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {prompt.metadata.tags.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{prompt.metadata.tags.length - 2}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="text-xs text-gray-600">
                    {prompt.created_at
                      ? new Date(prompt.created_at).toLocaleDateString()
                      : '—'}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCopy(prompt)}
                      className="h-7 px-2"
                      title="Copy prompt"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>

                    {onView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(prompt)}
                        className="h-7 px-2"
                        title="View details"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t">
        <div className="text-xs text-gray-600">
          Showing {prompts.length} prompt{prompts.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
