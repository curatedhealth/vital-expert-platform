'use client';

import {
  Search,
  Users,
  Plus,
  X,
  Sparkles,
  Brain,
  Swords,
  Vote,
  Target
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Badge } from '@/lib/shared/components/ui/badge';
import { Skeleton } from '@/lib/shared/components/ui/skeleton';
import { cn } from '@/lib/shared/utils';

import { __usePanelStore as usePanelStore } from '../services/panel-store';
import { useRecentPanels } from '@/hooks/usePanelAPI';
import { formatPanelStatus, getPanelStatusColor, getTimeSince } from '@/lib/api/panel-client';

// 6 main panel types
const PANEL_TYPES = [
  { type: 'structured', name: 'Structured', icon: Users, color: 'text-purple-600' },
  { type: 'open', name: 'Open', icon: Sparkles, color: 'text-violet-600' },
  { type: 'socratic', name: 'Socratic', icon: Brain, color: 'text-fuchsia-600' },
  { type: 'adversarial', name: 'Adversarial', icon: Swords, color: 'text-pink-600' },
  { type: 'delphi', name: 'Delphi', icon: Vote, color: 'text-indigo-600' },
  { type: 'hybrid', name: 'Hybrid', icon: Target, color: 'text-cyan-600' },
];

interface PanelSidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function PanelSidebar({
  className,
  isCollapsed = false,
  onToggleCollapse
}: PanelSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const { panels, currentPanel, selectPanel } = usePanelStore();

  // Fetch real panels from backend
  const { data: recentPanelsData, isLoading: panelsLoading } = useRecentPanels();

  // Merge local panels with backend panels (backend takes precedence)
  const allPanels = recentPanelsData?.panels || panels;

  // Filter panels based on search
  const filteredPanels = allPanels.filter((panel: any) =>
    panel.query?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    panel.metadata?.domain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Collapsed state
  if (isCollapsed) {
    return (
      <div className={cn(
        'w-12 border-r border-slate-200 bg-slate-50 flex flex-col items-center py-4 gap-4',
        className
      )}>
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
          title="Expand sidebar"
        >
          <Users className="w-5 h-5 text-slate-600" />
        </button>
        <button
          className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          title="New panel"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn(
      'w-80 border-r border-slate-200 bg-white flex flex-col h-full',
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Panels
          </h2>
          <div className="flex items-center gap-1">
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded hover:bg-slate-100 transition-colors"
                title="Collapse sidebar"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search panels..."
            className={cn(
              'w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg',
              'focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
            )}
          />
        </div>
      </div>

      {/* New Panel Button */}
      <div className="p-3 border-b border-slate-100">
        <button
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
            'bg-purple-600 text-white font-medium text-sm',
            'hover:bg-purple-700 transition-colors'
          )}
        >
          <Plus className="w-4 h-4" />
          New Advisory Panel
        </button>
      </div>

      {/* Panel List */}
      <div className="flex-1 overflow-auto">
        {/* Panel Types */}
        <div className="p-3">
          <h3 className="px-2 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
            Panel Types
          </h3>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {PANEL_TYPES.map((panel) => {
              const Icon = panel.icon;
              return (
                <button
                  key={panel.type}
                  onClick={() => router.push(`/ask-panel/interactive?type=${panel.type}`)}
                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-stone-50 border border-transparent hover:border-slate-200 transition-all text-left"
                >
                  <Icon className={cn('w-4 h-4', panel.color)} />
                  <span className="text-xs font-medium text-slate-700">{panel.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Panels */}
        <div className="p-3 border-t border-slate-100">
          <h3 className="px-2 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
            Recent Panels
          </h3>

          {panelsLoading ? (
            <div className="space-y-2 mt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-lg">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          ) : filteredPanels.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No panels yet</p>
              <p className="text-xs text-slate-400">Create your first panel</p>
            </div>
          ) : (
            <div className="space-y-1 mt-2">
              {filteredPanels.map((panel: any) => {
                const isActive = currentPanel?.id === panel.id;
                const agentsCount = panel.agents?.length || 0;

                return (
                  <div
                    key={panel.id}
                    className={cn(
                      'p-3 rounded-lg cursor-pointer transition-all',
                      isActive
                        ? 'bg-purple-50 border border-purple-200'
                        : 'hover:bg-stone-50 border border-transparent'
                    )}
                    onClick={() => selectPanel(panel.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm truncate',
                          isActive ? 'font-semibold text-purple-900' : 'font-medium text-slate-900'
                        )}>
                          {panel.query || panel.name || 'Untitled Panel'}
                        </p>
                        {panel.configuration?.domain && (
                          <p className="text-xs text-slate-500 capitalize mt-0.5">
                            {panel.configuration.domain.replace(/-/g, ' ')}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                        {getTimeSince(panel.updated_at || panel.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Users className="w-3 h-3" />
                        <span>{agentsCount} experts</span>
                      </div>
                      <Badge
                        className={cn('text-xs', getPanelStatusColor(panel.status))}
                      >
                        {formatPanelStatus(panel.status)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer stats */}
      <div className="p-3 border-t border-slate-100 text-xs text-slate-400 text-center">
        {filteredPanels.length} panel{filteredPanels.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
