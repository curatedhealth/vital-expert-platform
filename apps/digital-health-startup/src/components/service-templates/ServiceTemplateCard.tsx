'use client';

/**
 * Service Template Card Component
 * Visual card for displaying service templates with Ask Expert-inspired design
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Clock, Zap } from 'lucide-react';
import { ServiceTemplateConfig } from '@/types/service-templates';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ServiceTemplateCardProps {
  template: ServiceTemplateConfig;
  className?: string;
  onSelect?: (template: ServiceTemplateConfig) => void;
}

/**
 * Service Template Card
 * Displays a service template with visual hierarchy and interaction affordances
 */
export function ServiceTemplateCard({ template, className, onSelect }: ServiceTemplateCardProps) {
  const router = useRouter();
  const Icon = template.icon;

  const handleSelect = () => {
    if (onSelect) {
      onSelect(template);
    } else if (template.route) {
      router.push(template.route);
    }
  };

  const complexityColor = {
    low: 'text-green-600 bg-green-50 border-green-200',
    medium: 'text-amber-600 bg-amber-50 border-amber-200',
    high: 'text-red-600 bg-red-50 border-red-200',
  };

  const tierBadgeColor = {
    expert: 'bg-purple-500',
    advanced: 'bg-blue-500',
    standard: 'bg-slate-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn('h-full', className)}
    >
      <Card className="h-full flex flex-col overflow-hidden border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer group">
        {/* Header with gradient background */}
        <CardHeader className={cn('pb-4 bg-gradient-to-br', template.visual.gradient, 'text-white relative overflow-hidden')}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }} />
          </div>

          <div className="relative z-10">
            {/* Icon and badges */}
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-2 items-end">
                {template.visual.badge && (
                  <Badge className={cn('text-xs font-semibold', template.visual.badgeColor)}>
                    {template.visual.badge}
                  </Badge>
                )}
                <Badge className={cn('text-xs font-semibold', tierBadgeColor[template.tier])}>
                  {template.tier.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Title */}
            <CardTitle className="text-xl font-bold mb-2 text-white">
              {template.name}
            </CardTitle>

            {/* Description */}
            <CardDescription className="text-white/90 text-sm line-clamp-2">
              {template.description}
            </CardDescription>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="flex-1 pt-6 pb-4">
          {/* Metadata */}
          <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{template.timeToValue}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              <Badge variant="outline" className={cn('text-xs', complexityColor[template.complexity])}>
                {template.complexity}
              </Badge>
            </div>
          </div>

          {/* Capabilities */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2 text-foreground">Key Capabilities</h4>
            <ul className="space-y-1.5">
              {template.capabilities.slice(0, 4).map((capability, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  <span className="line-clamp-1">{capability}</span>
                </li>
              ))}
            </ul>
            {template.capabilities.length > 4 && (
              <p className="text-xs text-muted-foreground mt-2">
                +{template.capabilities.length - 4} more capabilities
              </p>
            )}
          </div>

          {/* Use cases preview */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-foreground">Common Use Cases</h4>
            <div className="flex flex-wrap gap-2">
              {template.useCases.slice(0, 3).map((useCase, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {useCase.icon && <span className="mr-1">{useCase.icon}</span>}
                  {useCase.title}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="pt-4 border-t">
          <Button
            onClick={handleSelect}
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            variant="outline"
          >
            <span>Get Started</span>
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

/**
 * Compact Service Template Card
 * Smaller version for sidebar or condensed views
 */
export function ServiceTemplateCardCompact({ template, className, onSelect }: ServiceTemplateCardProps) {
  const router = useRouter();
  const Icon = template.icon;

  const handleSelect = () => {
    if (onSelect) {
      onSelect(template);
    } else if (template.route) {
      router.push(template.route);
    }
  };

  return (
    <motion.div
      whileHover={{ x: 4 }}
      className={cn('cursor-pointer', className)}
      onClick={handleSelect}
    >
      <div className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 hover:bg-accent/50 transition-all group">
        <div className={cn('p-2 rounded-md bg-gradient-to-br', template.visual.gradient, 'text-white')}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {template.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {template.category} • {template.timeToValue}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </motion.div>
  );
}
