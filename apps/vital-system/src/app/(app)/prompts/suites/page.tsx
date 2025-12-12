/**
 * Prompt Suites Page - Lists all PRISM Suites
 *
 * Hierarchy: Prompts Library -> [Suites] -> Sub-Suites -> Prompts
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { VitalBreadcrumb } from '@/components/shared/VitalBreadcrumb';
import { Loader2, ArrowRight, FolderOpen } from 'lucide-react';
import { PRISM_SUITES, type SuiteConfig } from '@/features/prompts/components';

interface SuiteStats {
  promptCount: number;
  subSuiteCount: number;
  validatedCount: number;
}

export default function PromptSuitesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [suiteStats, setSuiteStats] = useState<Record<string, SuiteStats>>({});

  useEffect(() => {
    loadSuiteStats();
  }, []);

  const loadSuiteStats = async () => {
    try {
      setLoading(true);

      // Load prompts to calculate stats per suite
      const response = await fetch('/api/prompts-crud?showAll=true');
      if (!response.ok) throw new Error('Failed to fetch prompts');
      const data = await response.json();
      const prompts = data.prompts || [];

      // Load sub-suites
      let subSuites: { suiteCode?: string }[] = [];
      try {
        const prismResponse = await fetch('/api/prism');
        if (prismResponse.ok) {
          const prismData = await prismResponse.json();
          subSuites = prismData.subSuites || [];
        }
      } catch {
        // Sub-suites optional
      }

      // Calculate stats per suite
      const stats: Record<string, SuiteStats> = {};

      PRISM_SUITES.forEach((suite) => {
        const suitePrompts = prompts.filter((p: { suite?: string }) => {
          const promptSuite = p.suite || '';
          return (
            promptSuite === suite.name ||
            promptSuite === suite.code ||
            promptSuite.replace('™', '') === suite.code
          );
        });

        const suiteSubSuites = subSuites.filter((ss) => {
          const ssCode = ss.suiteCode || '';
          return ssCode === suite.code || ssCode === suite.name;
        });

        stats[suite.code] = {
          promptCount: suitePrompts.length,
          subSuiteCount: suiteSubSuites.length,
          validatedCount: suitePrompts.filter((p: { expert_validated?: boolean }) => p.expert_validated).length,
        };
      });

      setSuiteStats(stats);
    } catch (error) {
      console.error('Error loading suite stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuiteClick = (suite: SuiteConfig) => {
    router.push(`/prompts/suites/${suite.code}`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader icon={FolderOpen} title="PRISM™ Suites" description="Loading suites..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const totalPrompts = Object.values(suiteStats).reduce((sum, s) => sum + s.promptCount, 0);
  const totalSubSuites = Object.values(suiteStats).reduce((sum, s) => sum + s.subSuiteCount, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Breadcrumb */}
      <div className="px-6 pt-4">
        <VitalBreadcrumb
          showHome
          items={[
            { label: 'Prompts', href: '/prompts' },
            { label: 'Suites' },
          ]}
        />
      </div>

      {/* Page Header */}
      <div className="px-6 py-4 border-b">
        <PageHeader
          icon={FolderOpen}
          title="PRISM™ Prompt Suites"
          description={`${PRISM_SUITES.length} domain suites containing ${totalPrompts} prompts across ${totalSubSuites} sub-suites`}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Suites Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRISM_SUITES.map((suite) => {
              const stats = suiteStats[suite.code] || { promptCount: 0, subSuiteCount: 0, validatedCount: 0 };
              const Icon = suite.icon;

              return (
                <Card
                  key={suite.code}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 ${suite.borderColor}`}
                  onClick={() => handleSuiteClick(suite)}
                >
                  <CardHeader className={`${suite.bgColor} rounded-t-lg`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl bg-white/80 dark:bg-black/20`}>
                          <Icon className={`h-8 w-8 ${suite.textColor}`} />
                        </div>
                        <div>
                          <CardTitle className={`text-xl ${suite.textColor}`}>
                            {suite.name}
                          </CardTitle>
                          <CardDescription className="text-neutral-600 dark:text-neutral-400">
                            {suite.fullName}
                          </CardDescription>
                        </div>
                      </div>
                      <ArrowRight className={`h-5 w-5 ${suite.textColor} opacity-60`} />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      {suite.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={suite.bgColor}>
                          {stats.promptCount} prompts
                        </Badge>
                      </div>
                      {stats.subSuiteCount > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {stats.subSuiteCount} sub-suites
                        </div>
                      )}
                      {stats.validatedCount > 0 && (
                        <div className="text-xs text-green-600">
                          {stats.validatedCount} validated
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Back to Library */}
          <div className="mt-8 text-center">
            <Button variant="outline" onClick={() => router.push('/prompts')}>
              ← Back to Prompts Library
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
