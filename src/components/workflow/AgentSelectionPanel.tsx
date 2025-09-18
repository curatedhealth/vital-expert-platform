'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  Bot,
  Zap,
  BarChart3,
  DollarSign,
  CheckCircle,
  AlertCircle,
  User,
  Crown,
  Award,
  TrendingUp
} from 'lucide-react';
import {
  AgentSelectionPanelProps,
  AgentSelectionStrategy
} from '@/types/workflow-enhanced';
import { Agent } from '@/lib/agents/agent-service';

interface AgentRecommendation {
  agent: Agent;
  score: number;
  reasons: string[];
  matchPercentage: number;
}

export const AgentSelectionPanel: React.FC<AgentSelectionPanelProps> = ({
  step,
  availableAgents,
  onSelectAgent,
  onSetStrategy
}) => {
  const [recommendations, setRecommendations] = useState<AgentRecommendation[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<AgentSelectionStrategy['strategy']>('automatic');

  useEffect(() => {
    if (step) {
      setSelectedStrategy(step.agent_selection?.strategy || 'automatic');
      generateRecommendations();
    }
  }, [step, availableAgents]);

  const generateRecommendations = () => {
    if (!step || !availableAgents.length) return;

    const requiredCapabilities = step.required_capabilities || [];
    const agentScores = availableAgents.map(agent => {
      let score = 0;
      const reasons: string[] = [];
      let matchPercentage = 0;

      // Capability matching (40% weight)
      if (requiredCapabilities.length > 0) {
        const agentCaps = agent.capabilities as string[] || [];
        const matches = requiredCapabilities.filter(required =>
          agentCaps.some(cap => cap.toLowerCase().includes(required.toLowerCase()))
        );
        matchPercentage = (matches.length / requiredCapabilities.length) * 100;
        const capabilityScore = matches.length / requiredCapabilities.length;
        score += capabilityScore * 0.4;

        if (capabilityScore > 0.8) {
          reasons.push('Excellent capability match');
        } else if (capabilityScore > 0.5) {
          reasons.push('Good capability match');
        } else if (capabilityScore > 0) {
          reasons.push('Partial capability match');
        }
      } else {
        matchPercentage = 100;
        score += 0.4;
        reasons.push('No specific capabilities required');
      }

      // Tier scoring (30% weight)
      const tierScore = (4 - (agent.tier || 3)) / 3;
      score += tierScore * 0.3;
      if (agent.tier === 1) {
        reasons.push('Premium tier agent');
      } else if (agent.tier === 2) {
        reasons.push('Professional tier agent');
      }

      // Specialization bonus (20% weight)
      const specializations = agent.specializations as string[] || [];
      const stepKeywords = [
        step.step_name.toLowerCase(),
        step.step_description.toLowerCase()
      ].join(' ');

      let specializationScore = 0;
      specializations.forEach(spec => {
        if (stepKeywords.includes(spec.toLowerCase())) {
          specializationScore += 0.2;
          reasons.push(`Specialized in ${spec}`);
        }
      });
      score += Math.min(specializationScore, 0.2);

      // Status and availability (10% weight)
      if (agent.status === 'active') {
        score += 0.1;
        reasons.push('Currently active');
      }

      return {
        agent,
        score: Math.min(score, 1),
        reasons,
        matchPercentage: Math.round(matchPercentage)
      };
    });

    // Sort by score and take top 5
    const sortedRecommendations = agentScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    setRecommendations(sortedRecommendations);
  };

  if (!step) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Users className="w-8 h-8 mb-2 text-gray-300" />
        <p className="text-sm">Select a step to configure agent selection</p>
      </div>
    );
  }

  const handleStrategyChange = (strategy: AgentSelectionStrategy['strategy']) => {
    setSelectedStrategy(strategy);
    onSetStrategy(strategy);
  };

  const getAgentIcon = (agent: Agent) => {
    const name = agent.name || 'Agent';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getTierIcon = (tier: number) => {
    switch (tier) {
      case 1:
        return <Crown className="w-4 h-4 text-purple-500" />;
      case 2:
        return <Award className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-green-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const selectedAgent = availableAgents.find(a => a.id === step.agent_id);

  return (
    <div className="space-y-6">
      {/* Selection Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <Bot className="w-4 h-4 mr-2" />
            Selection Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedStrategy} onValueChange={handleStrategyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="automatic">
                <div className="flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Automatic Selection
                </div>
              </SelectItem>
              <SelectItem value="manual">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Manual Selection
                </div>
              </SelectItem>
              <SelectItem value="capability_based">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Capability Based
                </div>
              </SelectItem>
              <SelectItem value="load_balanced">
                <div className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Load Balanced
                </div>
              </SelectItem>
              <SelectItem value="consensus">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Consensus (Multiple Agents)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="mt-2 text-xs text-gray-500">
            {selectedStrategy === 'automatic' && 'AI-powered selection based on capabilities, performance, and load'}
            {selectedStrategy === 'manual' && 'Manually select a specific agent for this step'}
            {selectedStrategy === 'capability_based' && 'Select agent based on required capabilities only'}
            {selectedStrategy === 'load_balanced' && 'Select least loaded agent with matching capabilities'}
            {selectedStrategy === 'consensus' && 'Use multiple agents and combine their outputs'}
          </div>
        </CardContent>
      </Card>

      {/* Current Selection */}
      {selectedAgent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Currently Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-indigo-100 text-indigo-700">
                  {getAgentIcon(selectedAgent)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{selectedAgent.name}</span>
                  {getTierIcon(selectedAgent.tier || 3)}
                </div>
                <p className="text-xs text-gray-600">{selectedAgent.description}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {selectedAgent.model}
                  </Badge>
                  <Badge
                    variant={selectedAgent.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {selectedAgent.status}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectAgent('')}
              >
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agent Recommendations */}
      {selectedStrategy === 'manual' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Recommended Agents
              </span>
              <Badge variant="outline" className="text-xs">
                {recommendations.length} agents
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <Card
                key={recommendation.agent.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  recommendation.agent.id === step.agent_id ? 'ring-2 ring-indigo-500' : ''
                }`}
                onClick={() => onSelectAgent(recommendation.agent.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <Avatar className="mt-1">
                      <AvatarFallback className="bg-gray-100 text-gray-700 text-xs">
                        {getAgentIcon(recommendation.agent)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      {/* Agent Header */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm truncate">
                            {recommendation.agent.name}
                          </span>
                          {getTierIcon(recommendation.agent.tier || 3)}
                          {index === 0 && (
                            <Badge className="text-xs bg-green-100 text-green-800">
                              Best Match
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className={`text-sm font-medium ${getScoreColor(recommendation.score)}`}>
                            {Math.round(recommendation.score * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* Agent Description */}
                      <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                        {recommendation.agent.description}
                      </p>

                      {/* Match Details */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Capability Match:</span>
                          <span className="font-medium">{recommendation.matchPercentage}%</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {recommendation.reasons.slice(0, 2).map((reason, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                          {recommendation.reasons.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{recommendation.reasons.length - 2} more
                            </Badge>
                          )}
                        </div>

                        {/* Agent Capabilities */}
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">Capabilities:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(recommendation.agent.capabilities as string[] || [])
                              .slice(0, 3)
                              .map((cap, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {cap.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                            {(recommendation.agent.capabilities as string[] || []).length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{(recommendation.agent.capabilities as string[]).length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {recommendations.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <AlertCircle className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                <p className="text-xs">No agent recommendations available</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Strategy-specific Settings */}
      {selectedStrategy === 'consensus' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Consensus Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Number of Agents</Label>
              <Select defaultValue="3">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 agents</SelectItem>
                  <SelectItem value="3">3 agents</SelectItem>
                  <SelectItem value="5">5 agents</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Selection Method</Label>
              <Select defaultValue="top_scored">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top_scored">Top Scored</SelectItem>
                  <SelectItem value="diverse">Diverse Specializations</SelectItem>
                  <SelectItem value="tiered">Different Tiers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Voting Method</Label>
              <Select defaultValue="weighted">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="majority">Majority Vote</SelectItem>
                  <SelectItem value="weighted">Weighted by Score</SelectItem>
                  <SelectItem value="unanimous">Unanimous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">92%</div>
              <div className="text-xs text-gray-500">Avg Success Rate</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">4.2m</div>
              <div className="text-xs text-gray-500">Avg Duration</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Cost Efficiency:</span>
              <span className="font-medium flex items-center">
                <DollarSign className="w-3 h-3 mr-1" />
                $0.15/step
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Load Status:</span>
              <Badge variant="outline" className="text-xs">
                Light Load
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};