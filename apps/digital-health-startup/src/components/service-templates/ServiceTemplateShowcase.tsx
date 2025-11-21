'use client';

/**
 * Service Template Showcase Component
 * Featured service templates display for dashboard or landing pages
 */

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ServiceTemplateCardCompact } from './ServiceTemplateCard';
import { SERVICE_TEMPLATES } from '@/lib/service-templates/template-definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ServiceTemplateShowcaseProps {
  /** Number of templates to display */
  count?: number;
  /** Show only specific category */
  category?: string;
  /** Show header */
  showHeader?: boolean;
  /** Custom title */
  title?: string;
  /** Custom description */
  description?: string;
}

/**
 * Service Template Showcase
 * Displays featured service templates with call-to-action
 */
export function ServiceTemplateShowcase({
  count = 6,
  category,
  showHeader = true,
  title = 'Service Templates',
  description = 'Pre-configured AI services ready to deploy instantly',
}: ServiceTemplateShowcaseProps) {
  // Filter templates
  const filteredTemplates = category
    ? SERVICE_TEMPLATES.filter((t) => t.category === category)
    : SERVICE_TEMPLATES;

  // Get featured templates (prioritize those with badges)
  const featuredTemplates = filteredTemplates
    .sort((a, b) => {
      // Prioritize templates with badges
      if (a.visual.badge && !b.visual.badge) return -1;
      if (!a.visual.badge && b.visual.badge) return 1;
      return 0;
    })
    .slice(0, count);

  return (
    <Card className="overflow-hidden">
      {showHeader && (
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription className="mt-1">{description}</CardDescription>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/service-templates" className="gap-2">
                <span>Browse All</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-6">
        <div className="space-y-3">
          {featuredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ServiceTemplateCardCompact template={template} />
            </motion.div>
          ))}
        </div>

        {filteredTemplates.length > count && (
          <div className="mt-6 pt-6 border-t text-center">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/service-templates">
                <span>View {filteredTemplates.length - count} More Templates</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Service Template Categories Overview
 * Shows templates grouped by category
 */
export function ServiceTemplateCategoriesOverview() {
  const categories = [
    { id: 'advisory', name: 'Advisory Services', color: 'from-blue-500 to-indigo-600' },
    { id: 'workflow', name: 'Workflows', color: 'from-purple-500 to-pink-600' },
    { id: 'analysis', name: 'Analysis', color: 'from-violet-500 to-purple-600' },
    { id: 'research', name: 'Research', color: 'from-cyan-500 to-blue-600' },
    { id: 'compliance', name: 'Compliance', color: 'from-green-500 to-emerald-600' },
    { id: 'innovation', name: 'Innovation', color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Service Templates</h2>
          <p className="text-muted-foreground mt-1">
            Choose from {SERVICE_TEMPLATES.length} pre-configured services
          </p>
        </div>
        <Button asChild>
          <Link href="/service-templates" className="gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Browse All</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const categoryTemplates = SERVICE_TEMPLATES.filter((t) => t.category === category.id);
          if (categoryTemplates.length === 0) return null;

          const Icon = categoryTemplates[0].icon;

          return (
            <Link key={category.id} href={`/service-templates?category=${category.id}`}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${category.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {categoryTemplates.length} {categoryTemplates.length === 1 ? 'template' : 'templates'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {categoryTemplates.slice(0, 3).map((template) => (
                      <li key={template.id} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="truncate">{template.name}</span>
                      </li>
                    ))}
                    {categoryTemplates.length > 3 && (
                      <li className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>+{categoryTemplates.length - 3} more</span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
