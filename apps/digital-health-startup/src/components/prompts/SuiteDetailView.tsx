'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Folder, FileText, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui';
import { Button } from '@vital/ui';
import { Badge } from '@vital/ui';
import type { PromptSuite, PromptSubsuite } from '@/types/prompts';

interface SuiteDetailViewProps {
  suite: PromptSuite;
  onBack: () => void;
  onSubsuiteClick: (subsuite: PromptSubsuite) => void;
  onViewAllPrompts: () => void;
}

export default function SuiteDetailView({
  suite,
  onBack,
  onSubsuiteClick,
  onViewAllPrompts,
}: SuiteDetailViewProps) {
  const [subsuites, setSubsuites] = useState<PromptSubsuite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (suite.metadata?.uniqueId) {
      fetchSubsuites();
    } else {
      setLoading(false);
    }
  }, [suite]);

  const fetchSubsuites = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/prompts/suites/${suite.metadata?.uniqueId}/subsuites`);
      const data = await response.json();

      if (data.success) {
        setSubsuites(data.subsuites);
      }
    } catch (error) {
      console.error('Error fetching subsuites:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      {/* Suite Header */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${suite.color.replace('bg-', 'from-')} to-gray-800 p-8 text-white shadow-2xl`}>
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Badge variant="secondary" className="mb-3 bg-white/20 text-white border-white/30">
                {suite.function.replace(/_/g, ' ')}
              </Badge>
              <h1 className="text-4xl font-bold mb-3">{suite.name}</h1>
              <p className="text-xl text-white/90 mb-6 max-w-2xl">
                {suite.description}
              </p>

              {/* Key Areas */}
              {suite.metadata?.key_areas && suite.metadata.key_areas.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-white/80 mb-2">Key Areas</h3>
                  <ul className="space-y-1">
                    {suite.metadata.key_areas.slice(0, 3).map((area, idx) => (
                      <li key={idx} className="text-white/90 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                onClick={onViewAllPrompts}
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                View All {suite.statistics.totalPrompts} Prompts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Statistics Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 min-w-[280px]">
              <h3 className="text-sm font-semibold text-white/80 mb-4">Suite Statistics</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">{suite.statistics.totalPrompts}</div>
                  <div className="text-sm text-white/70">Total Prompts</div>
                </div>

                <div className="h-px bg-white/20"></div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xl font-bold">{suite.statistics.legacyPrompts}</div>
                    <div className="text-xs text-white/70">Legacy</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold">{suite.statistics.workflowPrompts}</div>
                    <div className="text-xs text-white/70">Workflow</div>
                  </div>
                </div>

                <div className="h-px bg-white/20"></div>

                <div>
                  <div className="text-2xl font-bold">{suite.statistics.subsuites}</div>
                  <div className="text-sm text-white/70">Sub-Suites</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Suites Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sub-Suites</h2>
            <p className="text-gray-600 mt-1">
              {subsuites.length > 0
                ? `Browse ${subsuites.length} specialized collections within ${suite.name}`
                : `Organize prompts by categories within ${suite.name}`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading sub-suites...</p>
            </div>
          </div>
        ) : subsuites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subsuites.map((subsuite) => (
              <Card
                key={subsuite.id}
                className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-400"
                onClick={() => onSubsuiteClick(subsuite)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <Folder className="h-5 w-5 text-gray-600" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>

                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {subsuite.name}
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {subsuite.description || subsuite.metadata?.full_expansion || 'Specialized prompt collection'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Prompt Count */}
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      <strong className="text-gray-900">{subsuite.statistics.promptCount}</strong> prompts
                    </span>
                  </div>

                  {/* Tags */}
                  {subsuite.tags && subsuite.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {subsuite.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {subsuite.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{subsuite.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Key Activities */}
                  {subsuite.metadata?.key_activities && subsuite.metadata.key_activities.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="text-xs text-gray-500 mb-1">Key Activities</div>
                      <ul className="space-y-1">
                        {subsuite.metadata.key_activities.slice(0, 2).map((activity, idx) => (
                          <li key={idx} className="text-xs text-gray-700 flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center text-gray-400">
              <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No Sub-Suites Yet</p>
              <p className="text-sm">
                This suite doesn't have sub-suites defined. View all prompts directly.
              </p>
              <Button
                onClick={onViewAllPrompts}
                variant="outline"
                className="mt-4"
              >
                View All Prompts
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
