'use client';

import { AlertTriangle, CheckCircle, Info, TrendingUp } from 'lucide-react';
import React from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: 'clinical' | 'regulatory' | 'commercial' | 'operational' | 'financial' | 'reputational';
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  probabilityScore: number; // 0-1
  impactScore: number; // 0-1
  riskScore: number; // probability × impact
  mitigationStrategies: string[];
  detectedBy?: string;
  confidence: number;
}

export interface RiskMatrixCell {
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  risks: Risk[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface RiskMatrixData {
  matrix: RiskMatrixCell[][];
  allRisks: Risk[];
  summary: {
    totalRisks: number;
    criticalRisks: number;
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
  };
  recommendations: string[];
}

interface RiskMatrixProps {
  data: RiskMatrixData;
  onRiskClick?: (risk: Risk) => void;
}

const SEVERITY_COLORS = {
  low: 'bg-green-100 border-green-300 hover:bg-green-200',
  medium: 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200',
  high: 'bg-orange-100 border-orange-300 hover:bg-orange-200',
  critical: 'bg-red-100 border-red-300 hover:bg-red-200',
};

const SEVERITY_TEXT_COLORS = {
  low: 'text-green-800',
  medium: 'text-yellow-800',
  high: 'text-orange-800',
  critical: 'text-red-800',
};

const CATEGORY_COLORS = {
  clinical: 'bg-blue-100 text-blue-800 border-blue-300',
  regulatory: 'bg-purple-100 text-purple-800 border-purple-300',
  commercial: 'bg-green-100 text-green-800 border-green-300',
  operational: 'bg-orange-100 text-orange-800 border-orange-300',
  financial: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  reputational: 'bg-red-100 text-red-800 border-red-300',
};

export function RiskMatrix({ data, onRiskClick }: RiskMatrixProps) {
  const { matrix, allRisks, summary, recommendations } = data;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{summary.totalRisks}</div>
              <div className="text-sm text-muted-foreground">Total Risks</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-800">{summary.criticalRisks}</div>
              <div className="text-sm text-red-700">Critical</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-800">{summary.highRisks}</div>
              <div className="text-sm text-orange-700">High</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-800">{summary.mediumRisks}</div>
              <div className="text-sm text-yellow-700">Medium</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-300 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-800">{summary.lowRisks}</div>
              <div className="text-sm text-green-700">Low</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3x3 Risk Matrix Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment Matrix</CardTitle>
          <CardDescription>
            Probability (Y-axis) × Impact (X-axis) - Click cells to view risks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Header Row */}
            <div className="grid grid-cols-4 gap-2">
              <div className="text-sm font-semibold text-center">Probability \ Impact</div>
              <div className="text-sm font-semibold text-center">Low</div>
              <div className="text-sm font-semibold text-center">Medium</div>
              <div className="text-sm font-semibold text-center">High</div>
            </div>

            {/* Matrix Rows (High to Low probability) */}
            {['high', 'medium', 'low'].map((probability, rowIndex) => (
              <div key={probability} className="grid grid-cols-4 gap-2">
                <div className="text-sm font-semibold text-center flex items-center justify-center">
                  {probability.charAt(0).toUpperCase() + probability.slice(1)}
                </div>
                {['low', 'medium', 'high'].map((impact, colIndex) => {
                  const cell = matrix[2 - rowIndex][colIndex];
                  const handleClick = () => {
                    if (cell.risks.length > 0 && onRiskClick) {
                      onRiskClick(cell.risks[0]);
                    }
                  };
                  const handleKeyDown = (e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleClick();
                    }
                  };
                  return (
                    <div
                      key={`${probability}-${impact}`}
                      className={`
                        min-h-[100px] p-3 rounded-lg border-2 cursor-pointer transition-colors
                        ${SEVERITY_COLORS[cell.severity]}
                      `}
                      onClick={handleClick}
                      onKeyDown={handleKeyDown}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="space-y-1">
                        <div className={`text-xs font-semibold ${SEVERITY_TEXT_COLORS[cell.severity]}`}>
                          {cell.risks.length} {cell.risks.length === 1 ? 'Risk' : 'Risks'}
                        </div>
                        {cell.risks.slice(0, 2).map((risk) => (
                          <div key={risk.id} className="text-xs truncate" title={risk.title}>
                            • {risk.title}
                          </div>
                        ))}
                        {cell.risks.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{cell.risks.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Risk List */}
      <Card>
        <CardHeader>
          <CardTitle>Identified Risks</CardTitle>
          <CardDescription>
            {allRisks.length} risks identified and assessed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allRisks
              .sort((a, b) => b.riskScore - a.riskScore)
              .map((risk) => {
                const handleRiskClick = () => onRiskClick?.(risk);
                const handleRiskKeyDown = (e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRiskClick();
                  }
                };
                return (
                <div
                  key={risk.id}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md
                    ${SEVERITY_COLORS[
                      risk.riskScore >= 0.7 ? 'critical' :
                      risk.riskScore >= 0.5 ? 'high' :
                      risk.riskScore >= 0.3 ? 'medium' : 'low'
                    ]}
                  `}
                  onClick={handleRiskClick}
                  onKeyDown={handleRiskKeyDown}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-5 w-5 ${
                          risk.riskScore >= 0.7 ? 'text-red-600' :
                          risk.riskScore >= 0.5 ? 'text-orange-600' :
                          risk.riskScore >= 0.3 ? 'text-yellow-600' : 'text-green-600'
                        }`} />
                        <h4 className="font-semibold">{risk.title}</h4>
                        <Badge className={CATEGORY_COLORS[risk.category]}>
                          {risk.category}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">{risk.description}</p>

                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="font-semibold">Probability:</span>{' '}
                          {risk.probability} ({Math.round(risk.probabilityScore * 100)}%)
                        </div>
                        <div>
                          <span className="font-semibold">Impact:</span>{' '}
                          {risk.impact} ({Math.round(risk.impactScore * 100)}%)
                        </div>
                        <div>
                          <span className="font-semibold">Risk Score:</span>{' '}
                          {(risk.riskScore * 100).toFixed(0)}%
                        </div>
                        <div>
                          <span className="font-semibold">Confidence:</span>{' '}
                          {Math.round(risk.confidence * 100)}%
                        </div>
                      </div>

                      {risk.detectedBy && (
                        <div className="text-xs text-muted-foreground">
                          <Info className="inline h-3 w-3 mr-1" />
                          Detected by: {risk.detectedBy}
                        </div>
                      )}

                      {risk.mitigationStrategies.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="text-sm font-semibold flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Mitigation Strategies:
                          </div>
                          <ul className="text-sm space-y-1 ml-5">
                            {risk.mitigationStrategies.map((strategy, idx) => (
                              <li key={idx} className="list-disc">{strategy}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-blue-300 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Key Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((recommendation, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default RiskMatrix;
