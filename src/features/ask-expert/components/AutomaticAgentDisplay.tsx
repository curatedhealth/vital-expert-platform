'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, User, Star, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  domain: string;
  tier: string;
  capabilities: string[];
  description: string;
  confidence?: number;
  reasoning?: string;
  alternatives?: Agent[];
}

interface AutomaticAgentDisplayProps {
  selectedAgent: Agent | null;
  isLoading?: boolean;
  onAgentOverride?: (agent: Agent) => void;
}

export function AutomaticAgentDisplay({ 
  selectedAgent, 
  isLoading = false,
  onAgentOverride 
}: AutomaticAgentDisplayProps) {
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'tier_1': return 'bg-gold-100 text-gold-800 border-gold-200';
      case 'tier_2': return 'bg-silver-100 text-silver-800 border-silver-200';
      case 'tier_3': return 'bg-bronze-100 text-bronze-800 border-bronze-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'tier_1': return 'Senior Expert';
      case 'tier_2': return 'Mid-level Expert';
      case 'tier_3': return 'Junior Expert';
      default: return tier;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Selecting best agent for your query...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedAgent) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No agent selected yet</p>
            <p className="text-xs">Agent will be selected when you submit a query</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selected Agent */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Selected Agent</span>
            </CardTitle>
            {selectedAgent.confidence && (
              <Badge 
                variant="outline" 
                className={`text-xs ${getConfidenceColor(selectedAgent.confidence)}`}
              >
                {getConfidenceLabel(selectedAgent.confidence)}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Agent Info */}
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-lg">{selectedAgent.name}</h4>
              <p className="text-sm text-muted-foreground">{selectedAgent.description}</p>
            </div>

            <div className="flex items-center space-x-2">
              <Badge className={`text-xs ${getTierColor(selectedAgent.tier)}`}>
                {getTierLabel(selectedAgent.tier)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {selectedAgent.domain.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            {/* Capabilities */}
            <div>
              <h5 className="text-sm font-medium mb-2">Key Capabilities:</h5>
              <div className="flex flex-wrap gap-1">
                {selectedAgent.capabilities.slice(0, 6).map((capability, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {capability}
                  </Badge>
                ))}
                {selectedAgent.capabilities.length > 6 && (
                  <Badge variant="secondary" className="text-xs">
                    +{selectedAgent.capabilities.length - 6} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Confidence Score */}
            {selectedAgent.confidence && (
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Confidence: {(selectedAgent.confidence * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2 border-t">
            {selectedAgent.reasoning && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReasoning(!showReasoning)}
                className="text-xs"
              >
                {showReasoning ? 'Hide' : 'Show'} Reasoning
              </Button>
            )}
            {selectedAgent.alternatives && selectedAgent.alternatives.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAlternatives(!showAlternatives)}
                className="text-xs"
              >
                {showAlternatives ? 'Hide' : 'Show'} Alternatives
              </Button>
            )}
            {onAgentOverride && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAgentOverride(selectedAgent)}
                className="text-xs"
              >
                Override Selection
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reasoning */}
      {showReasoning && selectedAgent.reasoning && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Selection Reasoning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {selectedAgent.reasoning}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Alternatives */}
      {showAlternatives && selectedAgent.alternatives && selectedAgent.alternatives.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Alternative Agents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedAgent.alternatives.map((agent, index) => (
              <div key={agent.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-sm">{agent.name}</h5>
                  <Badge variant="outline" className="text-xs">
                    {agent.domain.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {agent.description}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge className={`text-xs ${getTierColor(agent.tier)}`}>
                    {getTierLabel(agent.tier)}
                  </Badge>
                  {agent.confidence && (
                    <span className="text-xs text-muted-foreground">
                      {(agent.confidence * 100).toFixed(0)}% confidence
                    </span>
                  )}
                </div>
                {onAgentOverride && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAgentOverride(agent)}
                    className="mt-2 text-xs"
                  >
                    Select This Agent
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Auto-Selection Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">Automatic Selection</p>
              <p className="text-blue-700 text-xs">
                This agent was automatically selected based on your query analysis, 
                domain relevance, and expertise matching.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
