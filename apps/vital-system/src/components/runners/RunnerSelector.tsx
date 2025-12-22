// PRODUCTION_TAG: PRODUCTION_READY
// LAST_VERIFIED: 2025-12-19
// PURPOSE: UI component for selecting VITAL runners (88 task + 8 family runners)

'use client';

import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/shared/utils';
import {
  useTaskRunners,
  useFamilyRunners,
  useRunnerCategories,
  useRunnerSearch,
} from '@/hooks/useRunnerAPI';
import {
  FAMILY_TYPES,
  RUNNER_CATEGORIES,
  type RunnerInfo,
  type RunnerCategory,
  type FamilyType,
} from '@/types/runners';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2,
  Cpu,
  Workflow,
  Brain,
  Search,
  Zap,
  CheckCircle2,
} from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

interface RunnerSelectorProps {
  /** Callback when a runner is selected */
  onSelect: (runner: RunnerInfo) => void;
  /** Currently selected runner ID */
  selectedRunnerId?: string;
  /** Filter to show only specific runner types */
  runnerType?: 'task' | 'family' | 'all';
  /** Additional CSS classes */
  className?: string;
  /** Tenant ID for API calls */
  tenantId?: string;
  /** Whether to show search input */
  showSearch?: boolean;
  /** Maximum height for the runner list */
  maxHeight?: string;
}

// =============================================================================
// AI Intervention Colors
// =============================================================================

const INTERVENTION_COLORS: Record<string, string> = {
  ASSIST: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  AUGMENT: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  AUTOMATE: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  ORCHESTRATE: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  REDESIGN: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

// =============================================================================
// Category Icons (using first letter as fallback)
// =============================================================================

const CATEGORY_ICONS: Record<string, string> = {
  UNDERSTAND: 'U',
  EVALUATE: 'E',
  DECIDE: 'D',
  INVESTIGATE: 'I',
  WATCH: 'W',
  SOLVE: 'S',
  PREPARE: 'P',
  CREATE: 'C',
  REFINE: 'R',
  VALIDATE: 'V',
  SYNTHESIZE: 'Y',
  PLAN: 'P',
  PREDICT: 'F',
  ENGAGE: 'G',
  ALIGN: 'A',
  INFLUENCE: 'N',
  ADAPT: 'A',
  DISCOVER: 'D',
  DESIGN: 'X',
  GOVERN: 'G',
  SECURE: 'S',
  EXECUTE: 'X',
};

// =============================================================================
// Main Component
// =============================================================================

export function RunnerSelector({
  onSelect,
  selectedRunnerId,
  runnerType = 'all',
  className,
  tenantId = 'default',
  showSearch = true,
  maxHeight = '400px',
}: RunnerSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'task' | 'family'>(
    runnerType === 'family' ? 'family' : 'task'
  );

  // Data fetching
  const { data: taskRunners, isLoading: taskLoading } = useTaskRunners(
    selectedCategory as RunnerCategory | undefined,
    tenantId
  );
  const { data: familyRunners, isLoading: familyLoading } = useFamilyRunners(tenantId);
  const { data: categories } = useRunnerCategories(tenantId);

  // Search filtering
  const filteredTaskRunners = useMemo(() => {
    if (!taskRunners?.runners) return [];
    if (!searchQuery.trim()) return taskRunners.runners;

    const lowerQuery = searchQuery.toLowerCase();
    return taskRunners.runners.filter(
      (runner) =>
        runner.name.toLowerCase().includes(lowerQuery) ||
        runner.runner_id.toLowerCase().includes(lowerQuery) ||
        runner.description?.toLowerCase().includes(lowerQuery)
    );
  }, [taskRunners, searchQuery]);

  const filteredFamilyRunners = useMemo(() => {
    if (!familyRunners?.runners) return [];
    if (!searchQuery.trim()) return familyRunners.runners;

    const lowerQuery = searchQuery.toLowerCase();
    return familyRunners.runners.filter(
      (runner) =>
        runner.name.toLowerCase().includes(lowerQuery) ||
        runner.runner_id.toLowerCase().includes(lowerQuery) ||
        runner.description?.toLowerCase().includes(lowerQuery)
    );
  }, [familyRunners, searchQuery]);

  const handleSelect = useCallback(
    (runner: RunnerInfo) => {
      onSelect(runner);
    },
    [onSelect]
  );

  const isLoading = taskLoading || familyLoading;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Input */}
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search runners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Tab Selection (when showing all types) */}
      {runnerType === 'all' && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'task' | 'family')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="task" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Task Runners ({taskRunners?.total || 88})
            </TabsTrigger>
            <TabsTrigger value="family" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              Family Runners ({familyRunners?.total || 8})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="task" className="space-y-3 mt-4">
            <TaskRunnerList
              runners={filteredTaskRunners}
              isLoading={taskLoading}
              selectedRunnerId={selectedRunnerId}
              onSelect={handleSelect}
              categories={categories || RUNNER_CATEGORIES as unknown as string[]}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              maxHeight={maxHeight}
            />
          </TabsContent>

          <TabsContent value="family" className="mt-4">
            <FamilyRunnerList
              runners={filteredFamilyRunners}
              isLoading={familyLoading}
              selectedRunnerId={selectedRunnerId}
              onSelect={handleSelect}
              maxHeight={maxHeight}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Task Runners Only */}
      {runnerType === 'task' && (
        <TaskRunnerList
          runners={filteredTaskRunners}
          isLoading={taskLoading}
          selectedRunnerId={selectedRunnerId}
          onSelect={handleSelect}
          categories={categories || RUNNER_CATEGORIES as unknown as string[]}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          maxHeight={maxHeight}
        />
      )}

      {/* Family Runners Only */}
      {runnerType === 'family' && (
        <FamilyRunnerList
          runners={filteredFamilyRunners}
          isLoading={familyLoading}
          selectedRunnerId={selectedRunnerId}
          onSelect={handleSelect}
          maxHeight={maxHeight}
        />
      )}
    </div>
  );
}

// =============================================================================
// Task Runner List
// =============================================================================

interface TaskRunnerListProps {
  runners: RunnerInfo[];
  isLoading: boolean;
  selectedRunnerId?: string;
  onSelect: (runner: RunnerInfo) => void;
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  maxHeight: string;
}

function TaskRunnerList({
  runners,
  isLoading,
  selectedRunnerId,
  onSelect,
  categories,
  selectedCategory,
  onCategoryChange,
  maxHeight,
}: TaskRunnerListProps) {
  return (
    <>
      {/* Category Filter */}
      <Select
        value={selectedCategory || ''}
        onValueChange={(v) => onCategoryChange(v || null)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by category..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Categories (22)</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Runner List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : runners.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No runners found
        </div>
      ) : (
        <ScrollArea style={{ maxHeight }} className="pr-4">
          <div className="space-y-2">
            {runners.map((runner) => (
              <TaskRunnerCard
                key={runner.runner_id}
                runner={runner}
                isSelected={runner.runner_id === selectedRunnerId}
                onClick={() => onSelect(runner)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </>
  );
}

// =============================================================================
// Task Runner Card
// =============================================================================

interface RunnerCardProps {
  runner: RunnerInfo;
  isSelected: boolean;
  onClick: () => void;
}

function TaskRunnerCard({ runner, isSelected, onClick }: RunnerCardProps) {
  const categoryIcon = runner.category ? CATEGORY_ICONS[runner.category] || runner.category[0] : '?';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-3 rounded-lg border text-left transition-all',
        'hover:border-primary/50 hover:bg-accent/50',
        isSelected && 'border-primary bg-primary/10 ring-1 ring-primary'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Category Icon */}
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
            'bg-gradient-to-br from-slate-500 to-slate-600 text-white'
          )}
        >
          {categoryIcon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{runner.name}</span>
            {isSelected && <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />}
          </div>

          {runner.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {runner.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {runner.category && (
              <Badge variant="secondary" className="text-[10px]">
                {runner.category}
              </Badge>
            )}
            {runner.ai_intervention && (
              <Badge
                className={cn(
                  'text-[10px]',
                  INTERVENTION_COLORS[runner.ai_intervention] || 'bg-gray-100 text-gray-700'
                )}
              >
                {runner.ai_intervention}
              </Badge>
            )}
            {runner.service_layers && runner.service_layers.length > 0 && (
              <span className="text-[10px] text-muted-foreground">
                {runner.service_layers.join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// =============================================================================
// Family Runner List
// =============================================================================

interface FamilyRunnerListProps {
  runners: RunnerInfo[];
  isLoading: boolean;
  selectedRunnerId?: string;
  onSelect: (runner: RunnerInfo) => void;
  maxHeight: string;
}

function FamilyRunnerList({
  runners,
  isLoading,
  selectedRunnerId,
  onSelect,
  maxHeight,
}: FamilyRunnerListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (runners.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No family runners found
      </div>
    );
  }

  return (
    <ScrollArea style={{ maxHeight }} className="pr-4">
      <div className="space-y-2">
        {runners.map((runner) => {
          const familyInfo = FAMILY_TYPES.find(
            (f) => f.id === runner.family || f.id === runner.runner_id.replace('_runner', '').toUpperCase()
          );

          return (
            <FamilyRunnerCard
              key={runner.runner_id}
              runner={runner}
              familyInfo={familyInfo}
              isSelected={runner.runner_id === selectedRunnerId}
              onClick={() => onSelect(runner)}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
}

// =============================================================================
// Family Runner Card
// =============================================================================

interface FamilyRunnerCardProps {
  runner: RunnerInfo;
  familyInfo?: typeof FAMILY_TYPES[number];
  isSelected: boolean;
  onClick: () => void;
}

function FamilyRunnerCard({ runner, familyInfo, isSelected, onClick }: FamilyRunnerCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-lg border text-left transition-all',
        'hover:border-primary/50 hover:bg-accent/50',
        isSelected && 'border-primary bg-primary/10 ring-1 ring-primary'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0">
          <Brain className="h-5 w-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{runner.name}</span>
            {isSelected && <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />}
          </div>

          {familyInfo && (
            <div className="flex items-center gap-2 mt-1">
              <Zap className="h-3 w-3 text-amber-500" />
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                {familyInfo.pattern}
              </span>
            </div>
          )}

          {(runner.description || familyInfo?.description) && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {runner.description || familyInfo?.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-3">
            <Badge
              className={cn(
                'text-[10px]',
                INTERVENTION_COLORS.AUTOMATE
              )}
            >
              AUTOMATE
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              L3 Workflow
            </Badge>
          </div>
        </div>
      </div>
    </button>
  );
}

// =============================================================================
// Exports
// =============================================================================

export default RunnerSelector;
