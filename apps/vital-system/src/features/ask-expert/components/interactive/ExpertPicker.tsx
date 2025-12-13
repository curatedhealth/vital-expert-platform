'use client';

/**
 * VITAL Platform - ExpertPicker Component
 *
 * Mode 1 expert selection interface - manual grid-based selection.
 * User browses and selects an expert from categorized cards.
 *
 * Features:
 * - Expert cards with avatar, name, expertise, level badge
 * - Grouped by expertise level (L1-L4)
 * - User guide with collapsible instructions
 * - Hover preview with selection indicator
 *
 * Design System: VITAL Brand v6.0 - Blue theme for interactive modes
 * Updated: December 12, 2025 - Simplified UI, removed header/search/filters
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  ChevronRight,
  ChevronDown,
  X,
  BookOpen,
  Lightbulb,
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
// FALLBACK MOCK EXPERTS (Used when API returns empty data)
// =============================================================================

const FALLBACK_EXPERTS: Expert[] = [
  {
    id: 'fallback-1',
    name: 'Regulatory Strategy Advisor',
    slug: 'regulatory-strategy-advisor',
    tagline: 'FDA & EMA regulatory pathway expertise',
    description: 'Expert in navigating complex regulatory landscapes for pharmaceutical and medical device approvals.',
    level: 'L2',
    tier: 2,
    domain: 'Regulatory Affairs',
    department: 'Regulatory Affairs',
    function: 'Medical Affairs',
    capabilities: ['FDA submissions', 'EMA compliance', 'Regulatory strategy'],
    expertise: ['Drug approval pathways', 'Clinical trial regulations'],
    status: 'active',
  },
  {
    id: 'fallback-2',
    name: 'Clinical Research Expert',
    slug: 'clinical-research-expert',
    tagline: 'Clinical trial design and execution',
    description: 'Specialist in designing and managing clinical trials across all phases.',
    level: 'L2',
    tier: 2,
    domain: 'Clinical Operations',
    department: 'Clinical Operations',
    function: 'Medical Affairs',
    capabilities: ['Protocol design', 'Trial management', 'Data analysis'],
    expertise: ['Phase I-IV trials', 'GCP compliance'],
    status: 'active',
  },
  {
    id: 'fallback-3',
    name: 'Market Access Strategist',
    slug: 'market-access-strategist',
    tagline: 'Payer strategy and reimbursement',
    description: 'Expert in developing market access strategies and securing reimbursement.',
    level: 'L2',
    tier: 2,
    domain: 'Market Access',
    department: 'Market Access',
    function: 'Commercial',
    capabilities: ['HEOR analysis', 'Payer negotiations', 'Pricing strategy'],
    expertise: ['Value dossiers', 'HTA submissions'],
    status: 'active',
  },
  {
    id: 'fallback-4',
    name: 'Medical Science Liaison',
    slug: 'medical-science-liaison',
    tagline: 'Scientific exchange and KOL engagement',
    description: 'Field-based medical expert fostering scientific relationships with healthcare professionals.',
    level: 'L3',
    tier: 3,
    domain: 'Medical Affairs',
    department: 'Medical Affairs',
    function: 'Medical Affairs',
    capabilities: ['KOL engagement', 'Scientific presentations', 'Medical education'],
    expertise: ['Disease area expertise', 'Clinical data communication'],
    status: 'active',
  },
  {
    id: 'fallback-5',
    name: 'Pharmacovigilance Specialist',
    slug: 'pharmacovigilance-specialist',
    tagline: 'Drug safety and adverse event monitoring',
    description: 'Expert in monitoring and reporting drug safety throughout the product lifecycle.',
    level: 'L3',
    tier: 3,
    domain: 'Drug Safety',
    department: 'Pharmacovigilance',
    function: 'Medical Affairs',
    capabilities: ['Safety signal detection', 'ICSR processing', 'Risk management'],
    expertise: ['MedWatch reporting', 'PSUR preparation'],
    status: 'active',
  },
  {
    id: 'fallback-6',
    name: 'HEOR Analyst',
    slug: 'heor-analyst',
    tagline: 'Health economics and outcomes research',
    description: 'Specialist in demonstrating value through economic modeling and real-world evidence.',
    level: 'L3',
    tier: 3,
    domain: 'Health Economics',
    department: 'HEOR',
    function: 'Commercial',
    capabilities: ['Cost-effectiveness analysis', 'Budget impact modeling', 'RWE studies'],
    expertise: ['Markov modeling', 'QALYs/DALYs'],
    status: 'active',
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function ExpertPicker({
  tenantId,
  onSelect,
  onModeSwitch,
  className,
}: ExpertPickerProps) {
  // =========================================================================
  // STATE
  // =========================================================================

  const [experts, setExperts] = useState<Expert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredExpert, setHoveredExpert] = useState<Expert | null>(null);
  const [showGuide, setShowGuide] = useState(true);

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

        // Use fallback experts if API returns empty
        if (transformedExperts.length === 0) {
          console.log('[ExpertPicker] API returned empty, using fallback experts');
          setExperts(FALLBACK_EXPERTS);
        } else {
          setExperts(transformedExperts);
        }
      } catch (err) {
        console.error('[ExpertPicker] Fetch error, using fallback experts:', err);
        // On error, still show fallback experts for UI demonstration
        setExperts(FALLBACK_EXPERTS);
        setError(null); // Clear error since we have fallback data
      } finally {
        setIsLoading(false);
      }
    }

    fetchExperts();
  }, [tenantId]);

  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================

  // All active experts (no filtering since search/category UI removed)
  const filteredExperts = useMemo(() => experts, [experts]);

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

  const handleExpertClick = useCallback((expert: Expert) => {
    onSelect(expert);
  }, [onSelect]);

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* User Guide Section - Collapsible */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 via-blue-50/50 to-white border-b">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-100">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-800">How Expert Chat Works</h2>
                </div>
                <button
                  onClick={() => setShowGuide(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors"
                  aria-label="Dismiss guide"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1 */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/70 border border-blue-100">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Browse Experts</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Search or filter by category to find the right specialist
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/70 border border-blue-100">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Select an Expert</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Click on a card to choose that expert for your conversation
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/70 border border-blue-100">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Start Chatting</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Use suggested prompts or ask your own questions
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                Tip: Not sure which expert to pick? Try &quot;Let AI Choose&quot; for automatic matching.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show collapsed guide toggle when hidden */}
      {!showGuide && (
        <button
          onClick={() => setShowGuide(true)}
          className="flex items-center gap-2 px-6 py-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 border-b transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Show user guide</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      )}


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
            <p className="text-slate-600">No experts available</p>
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
