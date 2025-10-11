'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  description?: string;
  className?: string;
}

export function MetricsCard({
  title,
  value,
  icon,
  trend = 0,
  description,
  className = ''
}: MetricsCardProps) {
  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (trend > 0) return 'text-green-500';
    if (trend < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const formatTrend = () => {
    if (trend === 0) return 'No change';
    const sign = trend > 0 ? '+' : '';
    return `${sign}${trend}`;
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend !== undefined && (
          <div className="flex items-center mt-2">
            <Badge 
              variant="outline" 
              className={`text-xs ${getTrendColor()}`}
            >
              {getTrendIcon()}
              <span className="ml-1">{formatTrend()}</span>
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
