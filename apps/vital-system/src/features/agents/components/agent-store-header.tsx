/**
 * Agent Store Header v2.0
 * Premium hero section with animated background, search, and quick stats
 */

'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AGENT_LEVEL_COLORS,
  type AgentLevel,
} from '../constants/design-tokens-enhanced';
import { useAgentStore } from '../stores/agent-store';
import {
  Search,
  X,
  Sparkles,
  Crown,
  Star,
  Shield,
  Wrench,
  Cog,
  Filter,
  LayoutGrid,
  List,
  Kanban,
  Plus,
  RefreshCw,
  TrendingUp,
  Users,
  Zap,
  ChevronDown,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface AgentStoreHeaderProps {
  onSearch?: (query: string) => void;
  onViewModeChange?: (mode: 'grid' | 'list' | 'kanban') => void;
  onFilterClick?: () => void;
  onCreateClick?: () => void;
  onRefresh?: () => void;
  viewMode?: 'grid' | 'list' | 'kanban';
  isLoading?: boolean;
  className?: string;
}

interface LevelStatsProps {
  level: AgentLevel;
  count: number;
  onClick?: () => void;
  isActive?: boolean;
}

// ============================================================================
// LEVEL ICONS
// ============================================================================

const LEVEL_ICONS: Record<AgentLevel, React.ComponentType<{ className?: string }>> = {
  1: Crown,
  2: Star,
  3: Shield,
  4: Wrench,
  5: Cog,
};

// ============================================================================
// ANIMATED BACKGROUND
// ============================================================================

const AnimatedBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {/* Animated orbs */}
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-20 -right-20 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
        }}
      />
      
      <motion.div
        animate={{
          x: [0, -20, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
        }}
      />
      
      <motion.div
        animate={{
          x: [0, 15, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
        }}
      />
      
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
};

// ============================================================================
// LEVEL STAT CARD
// ============================================================================

const LevelStatCard: React.FC<LevelStatsProps> = ({
  level,
  count,
  onClick,
  isActive = false,
}) => {
  const config = AGENT_LEVEL_COLORS[level];
  const Icon = LEVEL_ICONS[level];
  
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-3 px-4 py-3 rounded-xl',
        'border transition-all duration-300',
        'backdrop-blur-sm',
        isActive
          ? 'border-primary bg-primary/10 shadow-lg'
          : 'border-border/50 bg-card/50 hover:bg-card hover:border-border'
      )}
      style={{
        boxShadow: isActive ? `0 4px 20px ${config.shadowColor}` : undefined,
      }}
    >
      {/* Icon with gradient background */}
      <div
        className="flex items-center justify-center w-10 h-10 rounded-lg"
        style={{ background: config.gradient }}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      
      {/* Stats */}
      <div className="text-left">
        <p className="text-2xl font-bold">{count}</p>
        <p className="text-xs text-muted-foreground font-medium">
          L{level} {config.name}
        </p>
      </div>
      
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="levelIndicator"
          className="absolute inset-0 rounded-xl border-2 border-primary"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  );
};

// ============================================================================
// SEARCH BAR - Enhanced
// ============================================================================

const SearchBar: React.FC<{
  onSearch?: (query: string) => void;
  className?: string;
}> = ({ onSearch, className }) => {
  const [query, setQuery] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  // Keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };
  
  const handleClear = () => {
    setQuery('');
    onSearch?.('');
    inputRef.current?.focus();
  };
  
  return (
    <div className={cn('relative', className)}>
      <motion.div
        animate={{
          boxShadow: isFocused
            ? '0 0 0 3px rgba(139, 92, 246, 0.2), 0 4px 20px rgba(0, 0, 0, 0.1)'
            : '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
        className={cn(
          'relative flex items-center rounded-xl',
          'bg-card border transition-all duration-300',
          isFocused ? 'border-primary' : 'border-border/50'
        )}
      >
        <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
        
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search agents by name, function, department..."
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'pl-12 pr-24 py-6 text-base',
            'bg-transparent border-none focus-visible:ring-0',
            'placeholder:text-muted-foreground/60'
          )}
        />
        
        <div className="absolute right-3 flex items-center gap-2">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 w-7 p-0 rounded-md hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded-md border bg-muted px-2 text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// VIEW MODE TOGGLE
// ============================================================================

const ViewModeToggle: React.FC<{
  mode: 'grid' | 'list' | 'kanban';
  onChange: (mode: 'grid' | 'list' | 'kanban') => void;
}> = ({ mode, onChange }) => {
  const modes = [
    { id: 'grid' as const, icon: LayoutGrid, label: 'Grid' },
    { id: 'list' as const, icon: List, label: 'List' },
    { id: 'kanban' as const, icon: Kanban, label: 'Kanban' },
  ];
  
  return (
    <div className="flex items-center p-1 rounded-lg bg-muted/50 border border-border/50">
      {modes.map(({ id, icon: Icon, label }) => (
        <motion.button
          key={id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(id)}
          className={cn(
            'relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium',
            'transition-colors duration-200',
            mode === id
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {mode === id && (
            <motion.div
              layoutId="viewModeIndicator"
              className="absolute inset-0 bg-background rounded-md shadow-sm"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <Icon className="relative z-10 h-4 w-4" />
          <span className="relative z-10 hidden md:inline">{label}</span>
        </motion.button>
      ))}
    </div>
  );
};

// ============================================================================
// MAIN HEADER COMPONENT
// ============================================================================

export const AgentStoreHeader: React.FC<AgentStoreHeaderProps> = ({
  onSearch,
  onViewModeChange,
  onFilterClick,
  onCreateClick,
  onRefresh,
  viewMode = 'grid',
  isLoading = false,
  className,
}) => {
  const agents = useAgentStore((state) => state.agents);
  const filteredAgents = useAgentStore((state) => state.filteredAgents);
  const filters = useAgentStore((state) => state.filters);
  const updateFilters = useAgentStore((state) => state.updateFilters);
  
  // Calculate level counts
  const levelCounts = React.useMemo(() => {
    const counts: Record<AgentLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    agents.forEach((agent) => {
      const level = agent.agent_levels?.level_number as AgentLevel;
      if (level && counts[level] !== undefined) {
        counts[level]++;
      }
    });
    return counts;
  }, [agents]);
  
  // Handle level filter
  const handleLevelClick = (level: AgentLevel) => {
    const currentLevels = filters.levels || [];
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter((l) => l !== level)
      : [...currentLevels, level];
    updateFilters({ levels: newLevels.length > 0 ? newLevels : undefined });
  };
  
  // Count active filters
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.levels?.length) count += filters.levels.length;
    if (filters.functions?.length) count += filters.functions.length;
    if (filters.departments?.length) count += filters.departments.length;
    if (filters.status && filters.status !== 'all') count++;
    return count;
  }, [filters]);
  
  return (
    <header className={cn('relative overflow-hidden', className)}>
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Top Section: Title + Actions */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          {/* Title & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Agent Store
                </h1>
                <p className="text-muted-foreground">
                  Discover and deploy {agents.length} AI expert agents
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">
                {agents.filter(a => a.status === 'active').length} Active
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-600">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">
                {agents.filter(a => a.agent_levels?.can_spawn_lower_levels).length} Can Spawn
              </span>
            </div>
          </motion.div>
        </div>
        
        {/* Level Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8"
        >
          {([1, 2, 3, 4, 5] as AgentLevel[]).map((level) => (
            <LevelStatCard
              key={level}
              level={level}
              count={levelCounts[level]}
              onClick={() => handleLevelClick(level)}
              isActive={filters.levels?.includes(level)}
            />
          ))}
        </motion.div>
        
        {/* Search & Controls Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col md:flex-row gap-4"
        >
          {/* Search */}
          <SearchBar onSearch={onSearch} className="flex-1" />
          
          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Filter Button */}
            <Button
              variant="outline"
              onClick={onFilterClick}
              className={cn(
                'relative gap-2 rounded-xl h-12 px-4',
                'border-border/50 hover:border-border',
                activeFilterCount > 0 && 'border-primary'
              )}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 px-1.5 text-[10px] bg-primary text-primary-foreground"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            
            {/* View Mode */}
            {onViewModeChange && (
              <ViewModeToggle
                mode={viewMode}
                onChange={onViewModeChange}
              />
            )}
            
            {/* Refresh */}
            {onRefresh && (
              <Button
                variant="outline"
                size="icon"
                onClick={onRefresh}
                disabled={isLoading}
                className="h-12 w-12 rounded-xl border-border/50"
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </Button>
            )}
            
            {/* Create Agent */}
            {onCreateClick && (
              <Button
                onClick={onCreateClick}
                className="gap-2 rounded-xl h-12 px-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create Agent</span>
              </Button>
            )}
          </div>
        </motion.div>
        
        {/* Results Count */}
        {filters.search && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4"
          >
            <p className="text-sm text-muted-foreground">
              Found <span className="font-semibold text-foreground">{filteredAgents.length}</span> agents
              {filteredAgents.length !== agents.length && (
                <> out of {agents.length}</>
              )}
            </p>
          </motion.div>
        )}
      </div>
    </header>
  );
};

AgentStoreHeader.displayName = 'AgentStoreHeader';

// ============================================================================
// EXPORTS
// ============================================================================

export default AgentStoreHeader;






