'use client';

import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

interface VitalPageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  badge?: string;
  showBackButton?: boolean;
  backHref?: string;
  actions?: ReactNode;
  className?: string;
}

export function VitalPageLayout({
  children,
  title,
  description,
  badge,
  showBackButton = false,
  backHref = '/dashboard',
  actions,
  className = ''
}: VitalPageLayoutProps) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* VITAL v3.0 Background Pattern */}
      <div className="absolute inset-0 bg-grid-black/[0.02] bg-grid-16 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,transparent_20%,black)]" />
      
      <div className="relative z-10">
        {/* Page Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                {showBackButton && (
                  <Button variant="ghost" size="sm" asChild className="mb-2">
                    <Link href={backHref}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Link>
                  </Button>
                )}
                
                <div className="flex items-center gap-3">
                  {badge && (
                    <Badge variant="outline" className="border-primary/30 bg-primary/5">
                      {badge}
                    </Badge>
                  )}
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {title}
                  </h1>
                </div>
                
                {description && (
                  <p className="text-lg text-muted-foreground max-w-3xl">
                    {description}
                  </p>
                )}
              </div>
              
              {actions && (
                <div className="flex items-center gap-2">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="container py-8">
          {children}
        </div>
      </div>
    </div>
  );
}

interface VitalCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  headerActions?: ReactNode;
}

export function VitalCard({ 
  children, 
  title, 
  description, 
  className = '',
  headerActions 
}: VitalCardProps) {
  return (
    <Card className={`hover:shadow-xl transition-all hover:-translate-y-1 ${className}`}>
      {(title || description || headerActions) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle className="text-xl">{title}</CardTitle>}
              {description && <CardDescription className="mt-1">{description}</CardDescription>}
            </div>
            {headerActions && (
              <div className="flex items-center gap-2">
                {headerActions}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

interface VitalStatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
}

export function VitalStatsCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  className = '' 
}: VitalStatsCardProps) {
  return (
    <Card className={`relative overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 ${className}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-16 -mt-16" />
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1">
                <span className={`text-sm font-medium ${trend.positive ? 'text-success' : 'text-destructive'}`}>
                  {trend.positive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-sm text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="text-primary/20">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
