'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TemplateGallery } from '@/features/ask-expert/components/missions/TemplateGallery';
import { DEFAULT_MISSION_TEMPLATES } from '@/features/ask-expert/types/mission-runners';
import type { TemplateCardData } from '@/features/ask-expert/components/missions/TemplateCard';

function mapTemplates(): TemplateCardData[] {
  return (DEFAULT_MISSION_TEMPLATES || [])
    .filter((t) => t && t.id && t.name)
    .map((t) => ({
      id: t.id!,
      name: t.name!,
      description: t.description || 'Mission template',
      family: t.family || 'GENERIC',
      category: t.category || 'General',
      complexity: t.complexity || 'medium',
      estimatedDurationMin: t.estimatedDurationMin || 0,
      estimatedDurationMax: t.estimatedDurationMax || 0,
      estimatedCostMin: t.estimatedCostMin || 0,
      estimatedCostMax: t.estimatedCostMax || 0,
      tags: t.tags || [],
      popularityScore: (t as any).popularityScore,
    }));
}

export default function MissionsPage() {
  const router = useRouter();
  const templates = useMemo(mapTemplates, []);

  const handleSelect = (templateId: string) => {
    router.push(`/ask-expert/autonomous?templateId=${templateId}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-stone-50">
      <div className="max-w-7xl mx-auto w-full px-6 py-8 space-y-6">
        <Card className="border border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-stone-900">Mission Templates</CardTitle>
            <CardDescription className="text-stone-600">
              Browse production-ready mission templates across families. Select a template to launch an autonomous or
              guided run.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TemplateGallery
              templates={templates}
              onSelect={handleSelect}
              showCategories
              showFilters
              showSearch
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
