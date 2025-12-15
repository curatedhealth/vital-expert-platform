'use client';

/**
 * VITAL Platform - Ask Panel Mode Selector
 *
 * THE 6 PANEL TYPE MATRIX
 *
 * Structured: Sequential moderated discussion - perfect for regulatory reviews
 * Open: Free-form brainstorming (parallel) - great for innovation
 * Socratic: Dialectical questioning - deep assumption testing
 * Adversarial: Pro/con debate format - go/no-go decisions
 * Delphi: Iterative consensus with voting - complex decisions
 * Hybrid: Human-AI collaborative panels - high-stakes decisions
 */

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users,
  MessageSquare,
  Swords,
  Target,
  Vote,
  Brain,
  Sparkles,
  ArrowRight,
  Bookmark,
  Loader2,
  Trash2,
  Play,
  Star,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';

// Custom User Panel type
type UserPanel = {
  id: string;
  name: string;
  description?: string;
  category: string;
  base_panel_slug?: string;
  mode: string;
  framework: string;
  selected_agents: string[];
  custom_settings?: Record<string, any>;
  metadata?: Record<string, any>;
  icon?: string;
  tags?: string[];
  is_favorite?: boolean;
  created_at: string;
  last_used_at?: string;
};

type PanelTypeConfig = {
  type: 'structured' | 'open' | 'socratic' | 'adversarial' | 'delphi' | 'hybrid';
  title: string;
  nickname: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  bestFor: string;
  color: string;
  bgGradient: string;
};

const PANEL_TYPES: PanelTypeConfig[] = [
  {
    type: 'structured',
    title: 'Structured Panel',
    nickname: 'Moderated Discussion',
    description: 'Sequential moderated discussion with cross-examination and synthesis phases.',
    icon: <Users className="h-5 w-5" />,
    features: [
      'Sequential expert responses',
      'Moderator-guided discussion',
      'Cross-examination phase',
    ],
    bestFor: 'Regulatory reviews, compliance assessments',
    color: 'purple',
    bgGradient: 'from-purple-500/10 via-purple-400/5 to-transparent',
  },
  {
    type: 'open',
    title: 'Open Panel',
    nickname: 'Brainstorming',
    description: 'Free-form parallel brainstorming with theme identification and idea synthesis.',
    icon: <Sparkles className="h-5 w-5" />,
    features: [
      'Parallel expert execution',
      'Theme identification',
      'Idea synthesis',
    ],
    bestFor: 'Innovation, creative problem solving',
    color: 'violet',
    bgGradient: 'from-violet-500/10 via-violet-400/5 to-transparent',
  },
  {
    type: 'socratic',
    title: 'Socratic Panel',
    nickname: 'Deep Inquiry',
    description: 'Dialectical questioning with probing questions, defense, and revision cycles.',
    icon: <Brain className="h-5 w-5" />,
    features: [
      'Initial positions stated',
      'Probing questions asked',
      'Defense and revision cycles',
    ],
    bestFor: 'Assumption testing, deep analysis',
    color: 'fuchsia',
    bgGradient: 'from-fuchsia-500/10 via-fuchsia-400/5 to-transparent',
  },
  {
    type: 'adversarial',
    title: 'Adversarial Panel',
    nickname: 'Pro/Con Debate',
    description: 'Pro/con debate format with rebuttals and judge-synthesized conclusions.',
    icon: <Swords className="h-5 w-5" />,
    features: [
      'Pro and con positions',
      'Rebuttal rounds',
      'Judge synthesis',
    ],
    bestFor: 'Go/no-go decisions, risk assessment',
    color: 'pink',
    bgGradient: 'from-pink-500/10 via-pink-400/5 to-transparent',
  },
  {
    type: 'delphi',
    title: 'Delphi Panel',
    nickname: 'Consensus Building',
    description: 'Iterative consensus building with anonymous voting and multi-round convergence.',
    icon: <Vote className="h-5 w-5" />,
    features: [
      'Anonymous expert voting',
      'Multi-round convergence',
      'Statistical consensus',
    ],
    bestFor: 'Complex decisions requiring agreement',
    color: 'indigo',
    bgGradient: 'from-indigo-500/10 via-indigo-400/5 to-transparent',
  },
  {
    type: 'hybrid',
    title: 'Hybrid Panel',
    nickname: 'Human-AI Collaboration',
    description: 'Human-AI collaborative panels with feedback integration and checkpoint reviews.',
    icon: <Target className="h-5 w-5" />,
    features: [
      'Human feedback integration',
      'Checkpoint reviews',
      'Collaborative refinement',
    ],
    bestFor: 'High-stakes decisions needing validation',
    color: 'cyan',
    bgGradient: 'from-cyan-500/10 via-cyan-400/5 to-transparent',
  },
];

const colorClasses = {
  purple: {
    icon: 'text-purple-600',
    iconBg: 'bg-purple-500/10',
    border: 'hover:border-purple-500/50',
    badge: 'border-purple-500/30 text-purple-600',
  },
  violet: {
    icon: 'text-violet-600',
    iconBg: 'bg-violet-500/10',
    border: 'hover:border-violet-500/50',
    badge: 'border-violet-500/30 text-violet-600',
  },
  fuchsia: {
    icon: 'text-fuchsia-600',
    iconBg: 'bg-fuchsia-500/10',
    border: 'hover:border-fuchsia-500/50',
    badge: 'border-fuchsia-500/30 text-fuchsia-600',
  },
  pink: {
    icon: 'text-pink-600',
    iconBg: 'bg-pink-500/10',
    border: 'hover:border-pink-500/50',
    badge: 'border-pink-500/30 text-pink-600',
  },
  indigo: {
    icon: 'text-indigo-600',
    iconBg: 'bg-indigo-500/10',
    border: 'hover:border-indigo-500/50',
    badge: 'border-indigo-500/30 text-indigo-600',
  },
  cyan: {
    icon: 'text-cyan-600',
    iconBg: 'bg-cyan-500/10',
    border: 'hover:border-cyan-500/50',
    badge: 'border-cyan-500/30 text-cyan-600',
  },
};

function PanelTypeCard({ config }: { config: PanelTypeConfig }) {
  const router = useRouter();
  const colors = colorClasses[config.color as keyof typeof colorClasses];

  return (
    <button
      type="button"
      onClick={() => router.push(`/ask-panel/interactive?type=${config.type}`)}
      className={`
        relative overflow-hidden p-5 rounded-2xl border bg-card text-left
        transition-all duration-300 ease-out
        hover:shadow-xl hover:scale-[1.02] ${colors.border}
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
        group cursor-pointer h-full
      `}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-50 group-hover:opacity-100 transition-opacity`} />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center ${colors.icon}`}>
            {config.icon}
          </div>
          <Badge variant="outline" className={`text-xs ${colors.badge}`}>
            {config.type}
          </Badge>
        </div>

        {/* Title & Nickname */}
        <h3 className="text-lg font-semibold mb-0.5">{config.title}</h3>
        <p className="text-sm font-medium text-muted-foreground mb-2">"{config.nickname}"</p>
        <p className="text-sm text-muted-foreground/80 mb-3 flex-1">{config.description}</p>

        {/* Features */}
        <div className="space-y-1 mb-3">
          {config.features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={colors.icon}>•</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Best For */}
        <div className="pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Best for:</span> {config.bestFor}
          </p>
        </div>

        {/* Hover indicator */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight className={`h-5 w-5 ${colors.icon}`} />
        </div>
      </div>
    </button>
  );
}

// Get panel type icon by slug
function getPanelIcon(panelType?: string) {
  const iconMap: Record<string, React.ReactNode> = {
    structured: <Users className="h-4 w-4" />,
    open: <Sparkles className="h-4 w-4" />,
    socratic: <Brain className="h-4 w-4" />,
    adversarial: <Swords className="h-4 w-4" />,
    delphi: <Vote className="h-4 w-4" />,
    hybrid: <Target className="h-4 w-4" />,
  };
  return iconMap[panelType || 'structured'] || <Users className="h-4 w-4" />;
}

// Custom Panel Card Component
function CustomPanelCard({ panel, onDelete, onUse }: { panel: UserPanel; onDelete: (id: string) => void; onUse: (panel: UserPanel) => void }) {
  const panelType = panel.metadata?.panel_type || panel.base_panel_slug?.replace('_panel', '') || 'structured';

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {getPanelIcon(panelType)}
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{panel.name}</CardTitle>
              <CardDescription className="text-xs">
                {panel.selected_agents?.length || 0} experts
              </CardDescription>
            </div>
          </div>
          {panel.is_favorite && (
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {panel.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{panel.description}</p>
        )}
        <div className="flex flex-wrap gap-1 mb-3">
          <Badge variant="outline" className="text-xs">{panelType}</Badge>
          {panel.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={() => onUse(panel)}
          >
            <Play className="w-3 h-3 mr-1" />
            Use
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(panel.id)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AskPanelPage() {
  const router = useRouter();
  const [customPanels, setCustomPanels] = useState<UserPanel[]>([]);
  const [loadingPanels, setLoadingPanels] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch panels from database (both user_panels and panels table)
  useEffect(() => {
    async function fetchAllPanels() {
      try {
        // Fetch from panels table (includes saved custom panels)
        const panelsResponse = await fetch('/api/panels');
        const panelsData = await panelsResponse.json();

        // Also try user_panels for user-specific panels
        const userPanelsResponse = await fetch('/api/user-panels');
        const userPanelsData = await userPanelsResponse.json();

        const allPanels: UserPanel[] = [];

        // Add panels from panels table (exclude the 6 base templates)
        const baseTemplateSlugs = ['structured_panel', 'open_panel', 'socratic_panel', 'devils_advocate_panel', 'expert_panel', 'structured_ask_expert_panel'];
        if (panelsData.success && panelsData.data?.panels) {
          panelsData.data.panels.forEach((panel: any) => {
            // Include panels that are custom (not base templates) OR have workflow_definition
            const isCustom = !baseTemplateSlugs.includes(panel.slug) || panel.metadata?.workflow_definition;
            if (isCustom) {
              allPanels.push({
                id: panel.id,
                name: panel.name,
                description: panel.description,
                category: panel.category || 'panel',
                base_panel_slug: panel.slug,
                mode: panel.mode,
                framework: panel.framework,
                selected_agents: panel.metadata?.selected_agents || panel.suggested_agents || [],
                custom_settings: panel.default_settings,
                metadata: panel.metadata,
                icon: panel.metadata?.icon,
                tags: panel.metadata?.tags || [],
                is_favorite: panel.metadata?.is_favorite,
                created_at: panel.created_at,
                last_used_at: panel.metadata?.last_used_at,
              });
            }
          });
        }

        // Add user_panels
        if (userPanelsData.success && userPanelsData.panels) {
          userPanelsData.panels.forEach((panel: any) => {
            // Avoid duplicates
            if (!allPanels.find(p => p.id === panel.id)) {
              allPanels.push(panel);
            }
          });
        }

        setCustomPanels(allPanels);
      } catch (err) {
        console.error('Failed to fetch panels:', err);
      } finally {
        setLoadingPanels(false);
      }
    }
    fetchAllPanels();
  }, []);

  // Delete a custom panel
  const handleDeletePanel = async (panelId: string) => {
    if (!confirm('Are you sure you want to delete this panel?')) return;

    setDeletingId(panelId);
    try {
      const response = await fetch(`/api/user-panels/${panelId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCustomPanels((prev) => prev.filter((p) => p.id !== panelId));
      }
    } catch (err) {
      console.error('Failed to delete panel:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Use a custom panel (navigate to interactive chat with preselected agents)
  const handleUsePanel = (panel: UserPanel) => {
    const panelType = panel.metadata?.panel_type || panel.base_panel_slug?.replace('_panel', '') || 'structured';
    // Store selected agents in sessionStorage for the interactive page to pick up
    sessionStorage.setItem('preselectedAgents', JSON.stringify(panel.selected_agents));
    sessionStorage.setItem('preselectedPanelName', panel.name);
    // Navigate to interactive chat experience (like Ask Expert)
    router.push(`/ask-panel/interactive?type=${panelType}&panelId=${panel.id}`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page Header */}
      <PageHeader
        icon={Users}
        title="Ask Panel"
        description="Multi-expert advisory board consultations with advanced consensus analysis"
      />

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Panel Types Grid - 2x3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PANEL_TYPES.map((config) => (
              <PanelTypeCard key={config.type} config={config} />
            ))}
          </div>

          {/* Custom Panels Section */}
          {(customPanels.length > 0 || loadingPanels) && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">Your Custom Panels</CardTitle>
                      <CardDescription>
                        {customPanels.length} saved panel{customPanels.length !== 1 ? 's' : ''} with pre-configured experts
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingPanels ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading your panels...</span>
                  </div>
                ) : customPanels.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No custom panels yet</p>
                    <p className="text-sm">Create one by selecting agents and clicking "Save Panel"</p>
                  </div>
                ) : (
                  <ScrollArea className="h-auto max-h-[300px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
                      {customPanels.map((panel) => (
                        <CustomPanelCard
                          key={panel.id}
                          panel={panel}
                          onDelete={handleDeletePanel}
                          onUse={handleUsePanel}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Links */}
          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Quick Links</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button
                type="button"
                onClick={() => router.push('/ask-panel/history')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Panel History
              </button>
              <span className="text-muted-foreground/30">•</span>
              <button
                type="button"
                onClick={() => router.push('/ask-panel/templates')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Panel Templates
              </button>
              <span className="text-muted-foreground/30">•</span>
              <button
                type="button"
                onClick={() => router.push('/agents')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Browse Experts
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-muted/50 rounded-xl p-6 border">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              How Ask Panel Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">1. Choose Panel Type</p>
                <p>Select the discussion format that best fits your decision-making needs.</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">2. Select Experts</p>
                <p>Pick from 200+ specialized AI agents to form your advisory board.</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">3. Get Consensus</p>
                <p>Receive structured analysis with agreement points, divergences, and recommendations.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
