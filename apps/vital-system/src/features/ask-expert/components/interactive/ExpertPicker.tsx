'use client';

/**
 * VITAL Platform - ExpertPicker Component
 *
 * Mode 1 expert selection interface - manual grid-based selection.
 * User browses and selects an expert from categorized cards.
 *
 * Features:
 * - Category-based filtering (by department/function)
 * - Search functionality
 * - Expert cards with avatar, name, expertise, level badge
 * - Hover preview with detailed capabilities
 * - Keyboard navigation support
 *
 * Design System: VITAL Brand v6.0 - Blue theme for interactive modes
 * Phase 2 Implementation - December 11, 2025
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Sparkles,
  Users,
  ChevronRight,
  Filter,
  X,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export interface Expert {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  avatar?: string;
  level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  tier?: number;
  domain?: string;
  department?: string;
  function?: string;
  capabilities?: string[];
  expertise?: string[];
  promptStarters?: string[];
  status: 'active' | 'inactive';
}

export interface ExpertPickerProps {
  /** Tenant ID for filtering experts */
  tenantId: string;
  /** Called when an expert is selected */
  onSelect: (expert: Expert) => void;
  /** Called to switch to Mode 2 */
  onModeSwitch?: () => void;
  /** Pre-selected category filter */
  initialCategory?: string;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// LEVEL BADGE CONFIG
// =============================================================================

const LEVEL_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  L1: { label: 'Master', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  L2: { label: 'Expert', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  L3: { label: 'Specialist', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  L4: { label: 'Worker', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  L5: { label: 'Tool', color: 'text-slate-700', bgColor: 'bg-slate-100' },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function ExpertPicker({
  tenantId,
  onSelect,
  onModeSwitch,
  initialCategory,
  className,
}: ExpertPickerProps) {
  // =========================================================================
  // STATE
  // =========================================================================

  const [experts, setExperts] = useState<Expert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  const [hoveredExpert, setHoveredExpert] = useState<Expert | null>(null);

  // =========================================================================
  // DATA FETCHING
  // =========================================================================

  useEffect(() => {
    async function fetchExperts() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/agents?tenant_id=${tenantId}&status=active`);
        if (!response.ok) {
          throw new Error('Failed to fetch experts');
        }
        const data = await response.json();

        // Transform API response to Expert format
        const transformedExperts: Expert[] = (data.agents || data || []).map((agent: any) => ({
          id: agent.id,
          name: agent.name || agent.display_name,
          slug: agent.slug,
          tagline: agent.tagline,
          description: agent.description,
          avatar: agent.avatar || agent.icon,
          level: agent.level || mapTierToLevel(agent.tier),
          tier: agent.tier,
          domain: agent.domain || agent.knowledge_domains?.[0],
          department: agent.department_name || agent.department,
          function: agent.function_name || agent.function,
          capabilities: agent.capabilities || [],
          expertise: agent.expertise_areas || agent.knowledge_domains || [],
          promptStarters: agent.prompt_starters || [],
          status: agent.status || 'active',
        }));

        setExperts(transformedExperts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load experts');
      } finally {
        setIsLoading(false);
      }
    }

    fetchExperts();
  }, [tenantId]);

  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================

  // Extract unique categories (departments/functions)
  const categories = useMemo(() => {
    const depts = new Set<string>();
    experts.forEach(e => {
      if (e.department) depts.add(e.department);
      if (e.function) depts.add(e.function);
    });
    return Array.from(depts).sort();
  }, [experts]);

  // Filter experts by search and category
  const filteredExperts = useMemo(() => {
    return experts.filter(expert => {
      // Category filter
      if (selectedCategory) {
        const matchesCategory =
          expert.department === selectedCategory ||
          expert.function === selectedCategory;
        if (!matchesCategory) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          expert.name,
          expert.tagline,
          expert.description,
          expert.domain,
          ...(expert.capabilities || []),
          ...(expert.expertise || []),
        ].filter(Boolean).join(' ').toLowerCase();

        if (!searchableText.includes(query)) return false;
      }

      return true;
    });
  }, [experts, selectedCategory, searchQuery]);

  // Group experts by level for display
  const groupedExperts = useMemo(() => {
    const groups: Record<string, Expert[]> = {
      L1: [],
      L2: [],
      L3: [],
      L4: [],
      L5: [],
    };

    filteredExperts.forEach(expert => {
      if (groups[expert.level]) {
        groups[expert.level].push(expert);
      }
    });

    return groups;
  }, [filteredExperts]);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleCategorySelect = useCallback((category: string | null) => {
    setSelectedCategory(prev => prev === category ? null : category);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleExpertClick = useCallback((expert: Expert) => {
    onSelect(expert);
  }, [onSelect]);

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Choose Your Expert
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Select a specialist to start your conversation
            </p>
          </div>

          {/* Mode Switch Button */}
          {onModeSwitch && (
            <Button
              variant="outline"
              onClick={onModeSwitch}
              className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Sparkles className="h-4 w-4" />
              Let AI Choose
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search experts by name, expertise, or capability..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategorySelect(null)}
              className={cn(
                'h-7 text-xs',
                selectedCategory === null && 'bg-blue-600 hover:bg-blue-700'
              )}
            >
              <Users className="h-3 w-3 mr-1" />
              All Experts
            </Button>
            {categories.slice(0, 8).map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategorySelect(category)}
                className={cn(
                  'h-7 text-xs',
                  selectedCategory === category && 'bg-blue-600 hover:bg-blue-700'
                )}
              >
                {category}
              </Button>
            ))}
            {categories.length > 8 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500">
                <Filter className="h-3 w-3 mr-1" />
                +{categories.length - 8} more
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Expert Grid */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <ExpertGridSkeleton />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : filteredExperts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No experts found</p>
            {searchQuery && (
              <Button
                variant="link"
                onClick={() => setSearchQuery('')}
                className="mt-2 text-blue-600"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Group by level */}
            {(['L2', 'L3', 'L1', 'L4'] as const).map(level => {
              const expertsInLevel = groupedExperts[level];
              if (expertsInLevel.length === 0) return null;

              return (
                <div key={level}>
                  <h2 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                    <Badge className={cn('text-xs', LEVEL_CONFIG[level].bgColor, LEVEL_CONFIG[level].color)}>
                      {LEVEL_CONFIG[level].label}
                    </Badge>
                    <span>{expertsInLevel.length} experts</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {expertsInLevel.map(expert => (
                      <ExpertCard
                        key={expert.id}
                        expert={expert}
                        isHovered={hoveredExpert?.id === expert.id}
                        onHover={setHoveredExpert}
                        onClick={handleExpertClick}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface ExpertCardProps {
  expert: Expert;
  isHovered: boolean;
  onHover: (expert: Expert | null) => void;
  onClick: (expert: Expert) => void;
}

function ExpertCard({ expert, isHovered, onHover, onClick }: ExpertCardProps) {
  const levelConfig = LEVEL_CONFIG[expert.level] || LEVEL_CONFIG.L3;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => onHover(expert)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(expert)}
      className={cn(
        'w-full text-left p-4 rounded-xl border-2 bg-white',
        'transition-all duration-200',
        'hover:border-blue-400 hover:shadow-lg',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        isHovered ? 'border-blue-300 shadow-md' : 'border-slate-200'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          {expert.avatar ? (
            <img
              src={expert.avatar}
              alt={expert.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
              {expert.name.charAt(0)}
            </div>
          )}
          {/* Level indicator dot */}
          <div className={cn(
            'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white',
            levelConfig.bgColor
          )} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 truncate">
              {expert.name}
            </h3>
          </div>

          {expert.tagline && (
            <p className="text-sm text-slate-600 line-clamp-2 mb-2">
              {expert.tagline}
            </p>
          )}

          {/* Expertise tags */}
          {expert.expertise && expert.expertise.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {expert.expertise.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                >
                  {skill}
                </span>
              ))}
              {expert.expertise.length > 3 && (
                <span className="text-xs text-slate-400">
                  +{expert.expertise.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Hover chevron */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
            >
              <ChevronRight className="h-5 w-5 text-blue-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}

function ExpertGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl border-2 border-slate-200">
          <div className="flex items-start gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function mapTierToLevel(tier?: number): Expert['level'] {
  switch (tier) {
    case 1: return 'L1';
    case 2: return 'L2';
    case 3: return 'L3';
    case 4: return 'L4';
    case 5: return 'L5';
    default: return 'L3';
  }
}

export default ExpertPicker;
