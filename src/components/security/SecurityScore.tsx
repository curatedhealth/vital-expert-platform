'use client';

import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  TrendingUp
} from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SecurityScoreProps {
  score: number;
  className?: string;
}

interface SecurityMetric {
  name: string;
  value: number;
  weight: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  description: string;
}

export function SecurityScore({ score, className = '' }: SecurityScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'warning';
    return 'critical';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (score >= 70) return <Shield className="h-5 w-5 text-yellow-500" />;
    if (score >= 50) return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Warning';
    return 'Critical';
  };

  // Mock security metrics - in a real implementation, these would come from props or API
  const securityMetrics: SecurityMetric[] = [
    {
      name: 'Authentication Security',
      value: 95,
      weight: 25,
      status: 'excellent',
      description: 'Strong authentication mechanisms in place'
    },
    {
      name: 'Access Control',
      value: 88,
      weight: 20,
      status: 'good',
      description: 'RBAC and RLS policies properly configured'
    },
    {
      name: 'Data Protection',
      value: 92,
      weight: 20,
      status: 'excellent',
      description: 'Encryption and data security measures active'
    },
    {
      name: 'Network Security',
      value: 85,
      weight: 15,
      status: 'good',
      description: 'Rate limiting and DDoS protection enabled'
    },
    {
      name: 'Monitoring & Logging',
      value: 90,
      weight: 10,
      status: 'excellent',
      description: 'Comprehensive audit logging and monitoring'
    },
    {
      name: 'Compliance',
      value: 87,
      weight: 10,
      status: 'good',
      description: 'HIPAA and security compliance maintained'
    }
  ];

  const getMetricStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'good': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Score */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          {getScoreIcon(score)}
          <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
          <span className="text-2xl text-muted-foreground">/100</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <Badge 
            variant={getScoreStatus(score) === 'excellent' ? 'default' : 
                    getScoreStatus(score) === 'good' ? 'secondary' : 'destructive'}
            className="text-sm"
          >
            {getScoreLabel(score)}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Security Posture
          </span>
        </div>
        <div className="mt-4">
          <Progress value={score} className="h-2" />
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm text-muted-foreground">Security Components</h4>
        {securityMetrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getMetricStatusIcon(metric.status)}
                <span className="text-sm font-medium">{metric.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({metric.weight}%)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{metric.value}/100</span>
                <div className={`w-2 h-2 rounded-full ${getMetricStatusColor(metric.status)}`}></div>
              </div>
            </div>
            <div className="space-y-1">
              <Progress value={metric.value} className="h-1" />
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-muted-foreground">Recommendations</h4>
        <div className="space-y-2">
          {score < 90 && (
            <div className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <TrendingUp className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Improve Security Score
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Focus on areas with lower scores to reach 90+ security rating
                </p>
              </div>
            </div>
          )}
          
          {score >= 90 && (
            <div className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Excellent Security Posture
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Maintain current security measures and continue monitoring
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
