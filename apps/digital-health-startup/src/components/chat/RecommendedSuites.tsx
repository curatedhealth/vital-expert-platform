'use client';

import React, { useState, useEffect } from 'react';
import {
  BookMarked,
  ChevronRight,
  TrendingUp,
  Star,
  X,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@vital/ui';

interface RecommendedSuite {
  suite: string;
  subsuite: string;
  templateCount: number;
  successRate: number;
  description?: string;
  trending?: boolean;
  popularWithAgent?: boolean;
}

interface RecommendedSuitesProps {
  agentId?: string;
  agentName?: string;
  domain?: string;
  currentPrompt?: string;
  onSelectTemplate?: (suiteSubsuite: string) => void;
}

export function RecommendedSuites({
  agentId,
  agentName,
  domain,
  currentPrompt,
  onSelectTemplate,
}: RecommendedSuitesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suites, setSuites] = useState<RecommendedSuite[]>([]);
  const [loading, setLoading] = useState(false);
  const [buttonLabel, setButtonLabel] = useState('Browse PRISM Templates');

  // Load recommended suites when opened or when agent changes
  useEffect(() => {
    if (isOpen) {
      loadRecommendedSuites();
    }
  }, [isOpen, agentId, domain]);

  // Update button label based on agent
  useEffect(() => {
    if (agentName) {
      setButtonLabel(`${agentName} Templates`);
    } else if (domain) {
      setButtonLabel(`${domain.replace('_', ' ')} Templates`);
    } else {
      setButtonLabel('Browse PRISM Templates');
    }
  }, [agentName, domain]);

  const loadRecommendedSuites = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (agentId) params.append('agent_id', agentId);
      if (domain) params.append('domain', domain);
      if (currentPrompt) params.append('query', currentPrompt);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AI_ENGINE_URL || 'http://localhost:8000'}/api/prompts/recommended-suites?${params}`
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSuites(data.suites || []);
      }
    } catch (error) {
      console.error('Failed to load recommended suites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuite = (suite: RecommendedSuite) => {
    const fullPath = `${suite.suite}/${suite.subsuite}`;
    if (onSelectTemplate) {
      onSelectTemplate(fullPath);
    }
    // Optionally navigate to prompts library filtered by suite/subsuite
    window.open(`/prompts?suite=${suite.suite}&subsuite=${suite.subsuite}`, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors group"
        title={`View recommended ${agentName ? agentName + ' ' : ''}PRISM templates`}
      >
        <BookMarked className="w-4 h-4 text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300" />
        {agentName && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-blue-600" />
              Recommended PRISM Templates
              {agentName && (
                <Badge variant="outline" className="ml-2">
                  {agentName}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {agentName
                ? `Templates frequently used with ${agentName}`
                : 'Explore professional prompt templates from the PRISM library'}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Loading recommended templates...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {suites.length === 0 ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  <BookMarked className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No recommended templates found</p>
                  <p className="text-xs mt-1">Try selecting an agent or entering a prompt</p>
                </div>
              ) : (
                suites.map((suite, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSuite(suite)}
                    className="w-full group p-4 text-left border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl transition-all hover:shadow-lg bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        {/* Suite/Subsuite Names */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="default" className="bg-blue-600 text-white text-sm font-semibold">
                            {suite.suite}
                          </Badge>
                          {suite.subsuite && (
                            <ChevronRight className="h-3 w-3 text-gray-400" />
                          )}
                          {suite.subsuite && (
                            <Badge variant="outline" className="border-blue-400 text-blue-700 dark:text-blue-300 text-sm">
                              {suite.subsuite}
                            </Badge>
                          )}
                        </div>

                        {/* Badges for trending/popular */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {suite.trending && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Trending
                            </Badge>
                          )}
                          {suite.popularWithAgent && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Star className="h-3 w-3" />
                              Popular with this agent
                            </Badge>
                          )}
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {suite.templateCount} templates
                          </span>
                          {suite.successRate > 0 && (
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                              {Math.round(suite.successRate)}% success rate
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {suite.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {suite.description}
                          </p>
                        )}
                      </div>

                      {/* Arrow Icon */}
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Based on {agentName ? 'agent usage patterns' : 'your domain'} and success rates
            </p>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default RecommendedSuites;

