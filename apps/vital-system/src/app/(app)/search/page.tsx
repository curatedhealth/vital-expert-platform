'use client';

/**
 * VITAL Search Page (/search)
 *
 * Unified search and discovery across all VITAL assets:
 * - Agents
 * - Knowledge
 * - Workflows
 * - Tools
 *
 * Provides quick access to platform capabilities.
 */

import { useState, useMemo, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Brain,
  BookOpen,
  Workflow,
  Wrench,
  MessageSquare,
  Users,
  ArrowRight,
  Sparkles,
  Loader2,
  Filter,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTenant } from '@/contexts/tenant-context';
import { useAgentsStore } from '@/lib/stores/agents-store';

// ============================================================================
// Types
// ============================================================================

interface SearchCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  description: string;
  color: string;
}

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  gradient: string;
}

// ============================================================================
// Constants
// ============================================================================

const SEARCH_CATEGORIES: SearchCategory[] = [
  {
    id: 'agents',
    label: 'Agents',
    icon: Brain,
    href: '/agents',
    description: 'AI expert agents for consultation',
    color: 'text-purple-600 bg-purple-50',
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    icon: BookOpen,
    href: '/knowledge',
    description: 'Domain knowledge and documents',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    id: 'workflows',
    label: 'Workflows',
    icon: Workflow,
    href: '/workflows',
    description: 'Automated AI workflows',
    color: 'text-green-600 bg-green-50',
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: Wrench,
    href: '/discover/tools',
    description: 'Available tools and integrations',
    color: 'text-orange-600 bg-orange-50',
  },
];

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'ask-expert',
    label: 'Ask an Expert',
    description: 'Start a 1:1 consultation with an AI expert',
    icon: MessageSquare,
    href: '/ask?mode=auto',
    gradient: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'ask-panel',
    label: 'Ask a Panel',
    description: 'Get multi-expert perspectives',
    icon: Users,
    href: '/ask-panel',
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'browse-agents',
    label: 'Browse Agents',
    description: 'Explore all available AI experts',
    icon: Brain,
    href: '/agents',
    gradient: 'from-emerald-500 to-teal-600',
  },
];

// ============================================================================
// Loading Component
// ============================================================================

function SearchLoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// ============================================================================
// Search Results Component
// ============================================================================

interface SearchResultsProps {
  query: string;
  category: string | null;
}

function SearchResults({ query, category }: SearchResultsProps) {
  const { agents } = useAgentsStore();
  const router = useRouter();

  // Filter agents based on search query
  const filteredAgents = useMemo(() => {
    if (!query || query.length < 2) return [];

    const searchLower = query.toLowerCase();
    return agents
      .filter((agent: any) => {
        const name = (agent.display_name || agent.name || '').toLowerCase();
        const desc = (agent.description || '').toLowerCase();
        const dept = (agent.department || '').toLowerCase();
        const func = (agent.business_function || '').toLowerCase();

        return name.includes(searchLower) ||
               desc.includes(searchLower) ||
               dept.includes(searchLower) ||
               func.includes(searchLower);
      })
      .slice(0, 8); // Limit to 8 results
  }, [agents, query]);

  if (!query || query.length < 2) {
    return null;
  }

  if (filteredAgents.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium">No results found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try different keywords or browse categories below
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Found {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
        </h3>
        <Link
          href={`/agents?search=${encodeURIComponent(query)}`}
          className="text-sm text-primary hover:underline"
        >
          View all in Agents
        </Link>
      </div>

      <div className="grid gap-3">
        {filteredAgents.map((agent: any) => (
          <div
            key={agent.id}
            onClick={() => router.push(`/ask?agentId=${agent.id}`)}
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg border cursor-pointer",
              "bg-card hover:bg-accent/50 transition-colors"
            )}
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              {agent.avatar ? (
                <img src={agent.avatar} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <Brain className="h-5 w-5 text-purple-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{agent.display_name || agent.name}</h4>
              <p className="text-sm text-muted-foreground truncate">{agent.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Content
// ============================================================================

function SearchContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/agents?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, router]);

  const handleCategoryClick = useCallback((category: SearchCategory) => {
    if (searchQuery.trim()) {
      router.push(`${category.href}?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(category.href);
    }
  }, [searchQuery, router]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-3">What can we help you find?</h1>
          <p className="text-muted-foreground text-lg">
            Search across agents, knowledge, workflows, and more
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for agents, knowledge, workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 h-14 text-lg rounded-xl border-2 focus:border-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </form>

        {/* Search Results */}
        <SearchResults query={searchQuery} category={selectedCategory} />

        {/* Categories */}
        {(!searchQuery || searchQuery.length < 2) && (
          <>
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Browse by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {SEARCH_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category)}
                      className={cn(
                        "flex flex-col items-center gap-3 p-6 rounded-xl border-2",
                        "hover:border-primary/50 hover:shadow-md transition-all",
                        "bg-card text-center"
                      )}
                    >
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", category.color)}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-medium">{category.label}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.id}
                      href={action.href}
                      className={cn(
                        "group relative flex flex-col gap-3 p-6 rounded-xl",
                        "bg-gradient-to-br text-white",
                        action.gradient,
                        "hover:shadow-lg hover:scale-[1.02] transition-all"
                      )}
                    >
                      <Icon className="h-8 w-8" />
                      <div>
                        <h3 className="font-semibold text-lg">{action.label}</h3>
                        <p className="text-sm text-white/80">{action.description}</p>
                      </div>
                      <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Page Export
// ============================================================================

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoadingState />}>
      <SearchContent />
    </Suspense>
  );
}
