'use client';

import { useState, useMemo } from 'react';
import { cn } from '../lib/utils';
import {
  Search,
  Clock,
  DollarSign,
  Users,
  Star,
  ChevronRight,
  Zap,
  Brain,
  FileText,
  BarChart3,
  Shield,
  Lightbulb,
  Target,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export type MissionCategory = 'understand' | 'evaluate' | 'decide' | 'create' | 'monitor';
export type MissionComplexity = 'simple' | 'moderate' | 'complex' | 'advanced';

export interface MissionTemplate {
  id: string;
  name: string;
  description: string;
  category: MissionCategory;
  complexity: MissionComplexity;
  estimatedTime: string;
  estimatedCost: {
    min: number;
    max: number;
  };
  requiredAgents: number;
  tags?: string[];
  popularity?: number;
  isNew?: boolean;
  icon?: string;
}

export interface VitalMissionTemplateSelectorProps {
  /** Available mission templates */
  templates: MissionTemplate[];
  /** Currently selected template ID */
  selectedId?: string;
  /** Default category tab */
  defaultCategory?: MissionCategory;
  /** Whether to show cost estimates */
  showCost?: boolean;
  /** Whether to show complexity badges */
  showComplexity?: boolean;
  /** Callback when template selected */
  onSelect: (template: MissionTemplate) => void;
  /** Callback when custom mission requested */
  onCustomMission?: () => void;
  /** Custom class name */
  className?: string;
}

const categoryConfig: Record<MissionCategory, { icon: typeof Compass; label: string; color: string }> = {
  understand: { icon: Lightbulb, label: 'Understand', color: 'text-blue-600' },
  evaluate: { icon: BarChart3, label: 'Evaluate', color: 'text-amber-600' },
  decide: { icon: Target, label: 'Decide', color: 'text-green-600' },
  create: { icon: FileText, label: 'Create', color: 'text-purple-600' },
  monitor: { icon: Shield, label: 'Monitor', color: 'text-cyan-600' },
};

const complexityColors: Record<MissionComplexity, string> = {
  simple: 'bg-green-100 text-green-700',
  moderate: 'bg-amber-100 text-amber-700',
  complex: 'bg-orange-100 text-orange-700',
  advanced: 'bg-red-100 text-red-700',
};

/**
 * VitalMissionTemplateSelector - Mission Discovery
 * 
 * Visual browser for the 24 JTBD (Jobs To Be Done) missions.
 * Features: Categorized Tabs (UNDERSTAND, EVALUATE, DECIDE), Cost/Time estimates.
 * 
 * @example
 * ```tsx
 * <VitalMissionTemplateSelector
 *   templates={missionTemplates}
 *   defaultCategory="understand"
 *   onSelect={(template) => startMission(template)}
 *   onCustomMission={() => showCustomMissionForm()}
 * />
 * ```
 */
export function VitalMissionTemplateSelector({
  templates,
  selectedId,
  defaultCategory = 'understand',
  showCost = true,
  showComplexity = true,
  onSelect,
  onCustomMission,
  className,
}: VitalMissionTemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<MissionCategory | 'all'>(defaultCategory);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let result = templates;

    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter(t => t.category === activeCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return result;
  }, [templates, activeCategory, searchQuery]);

  // Group templates by category
  const templatesByCategory = useMemo(() => {
    return templates.reduce((acc, template) => {
      if (!acc[template.category]) acc[template.category] = [];
      acc[template.category].push(template);
      return acc;
    }, {} as Record<MissionCategory, MissionTemplate[]>);
  }, [templates]);

  const renderTemplate = (template: MissionTemplate) => {
    const categoryConf = categoryConfig[template.category];
    const CategoryIcon = categoryConf.icon;
    const isSelected = template.id === selectedId;

    return (
      <Card
        key={template.id}
        className={cn(
          'cursor-pointer transition-all hover:shadow-md',
          isSelected && 'ring-2 ring-primary'
        )}
        onClick={() => onSelect(template)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={cn('p-2 rounded-lg bg-muted', categoryConf.color)}>
                <CategoryIcon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  {template.name}
                  {template.isNew && (
                    <Badge className="text-[10px]">New</Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className={cn('text-[10px]', categoryConf.color)}
                  >
                    {categoryConf.label}
                  </Badge>
                  {showComplexity && (
                    <Badge className={cn('text-[10px]', complexityColors[template.complexity])}>
                      {template.complexity}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {template.popularity && template.popularity > 80 && (
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-2">
          <CardDescription className="text-xs line-clamp-2">
            {template.description}
          </CardDescription>

          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {template.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
              {template.tags.length > 3 && (
                <Badge variant="secondary" className="text-[10px]">
                  +{template.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-2 border-t bg-muted/30">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {template.estimatedTime}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {template.requiredAgents} agents
              </span>
            </div>
            {showCost && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                ${template.estimatedCost.min}-{template.estimatedCost.max}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search missions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as MissionCategory | 'all')}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="all" className="text-xs">
            All
            <Badge variant="secondary" className="ml-1 text-[10px]">
              {templates.length}
            </Badge>
          </TabsTrigger>
          {Object.entries(categoryConfig).map(([category, config]) => (
            <TabsTrigger key={category} value={category} className="text-xs gap-1">
              <config.icon className={cn('h-3 w-3', config.color)} />
              {config.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-4">
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-4">
              {filteredTemplates.map(renderTemplate)}

              {filteredTemplates.length === 0 && (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No missions found</p>
                  <p className="text-xs">Try adjusting your search or category</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Custom Mission Option */}
      {onCustomMission && (
        <div className="border-t pt-4">
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={onCustomMission}
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Create Custom Mission</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Can't find what you need? Create a custom mission tailored to your specific requirements.
          </p>
        </div>
      )}
    </div>
  );
}

export default VitalMissionTemplateSelector;
