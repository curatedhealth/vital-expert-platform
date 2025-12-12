/**
 * AssetOverviewStats - Shared stats cards component for asset overview pages
 *
 * Used by: Tools, Skills, Prompts, Workflows pages
 */
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

export interface StatCardConfig {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'purple' | 'cyan' | 'orange';
}

export interface AssetOverviewStatsProps {
  stats: StatCardConfig[];
  columns?: number;
}

const VARIANT_STYLES: Record<string, { card: string; title: string; value: string }> = {
  default: {
    card: '',
    title: 'text-gray-600',
    value: 'text-gray-900 dark:text-gray-100',
  },
  success: {
    card: 'border-2 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800',
    title: 'text-green-800 dark:text-green-300',
    value: 'text-green-600 dark:text-green-400',
  },
  warning: {
    card: 'border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800',
    title: 'text-yellow-800 dark:text-yellow-300',
    value: 'text-yellow-600 dark:text-yellow-400',
  },
  info: {
    card: 'border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800',
    title: 'text-blue-800 dark:text-blue-300',
    value: 'text-blue-600 dark:text-blue-400',
  },
  purple: {
    card: '',
    title: 'text-purple-800 dark:text-purple-300',
    value: 'text-purple-600 dark:text-purple-400',
  },
  cyan: {
    card: '',
    title: 'text-cyan-800 dark:text-cyan-300',
    value: 'text-cyan-600 dark:text-cyan-400',
  },
  orange: {
    card: '',
    title: 'text-orange-800 dark:text-orange-300',
    value: 'text-orange-600 dark:text-orange-400',
  },
};

export function AssetOverviewStats({ stats, columns = 6 }: AssetOverviewStatsProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  }[columns] || 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6';

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {stats.map((stat, index) => {
        const variant = stat.variant || 'default';
        const styles = VARIANT_STYLES[variant];
        const Icon = stat.icon;

        return (
          <Card key={index} className={styles.card}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-xs font-medium flex items-center gap-1 ${styles.title}`}>
                {Icon && <Icon className="h-3 w-3" />}
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${styles.value}`}>{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default AssetOverviewStats;
