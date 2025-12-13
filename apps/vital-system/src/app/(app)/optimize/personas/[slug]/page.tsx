'use client';

/**
 * Persona Detail Page - VITAL Brand Guidelines v6.0
 *
 * Refactored to use extracted components and hooks
 * Reduced from 643 lines to ~100 lines
 */

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, Button } from '@vital/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { ArrowLeft, UserCircle, Loader2 } from 'lucide-react';

// Feature imports
import { usePersonaDetail } from '@/features/personas/hooks';
import {
  PersonaSummaryCard,
  PersonaJTBDTab,
  PersonaPainTab,
  PersonaGoalsTab,
  PersonaStakeholdersTab,
} from '@/features/personas/components/detail';

export default function PersonaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { persona, loading, error, reload } = usePersonaDetail(slug);

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-stone-600">Loading persona details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            <Card className="border-rose-200 bg-rose-50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-rose-800">
                    <span className="font-semibold">Error:</span>
                    <span>{error}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={reload}
                      className="border-stone-300 hover:border-purple-400 hover:text-purple-600 transition-colors duration-150"
                    >
                      Retry
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/optimize/personas')}
                      className="border-stone-300 hover:border-purple-400 hover:text-purple-600 transition-colors duration-150"
                    >
                      Back to Personas
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!persona) {
    return null;
  }

  // Extract related data from persona
  const painPoints = (persona as any).pain_points || [];
  const goals = (persona as any).goals || [];
  const challenges = (persona as any).challenges || [];
  const jtbds = (persona as any).jtbds || [];
  const motivations = (persona as any).motivations || [];
  const values = (persona as any).values || [];
  const personalityTraits = (persona as any).personality_traits || [];
  const internalStakeholders = (persona as any).internal_stakeholders || [];
  const externalStakeholders = (persona as any).external_stakeholders || [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
      {/* Action Bar */}
      <div className="flex items-center justify-end gap-2 px-6 py-3 border-b bg-white/50 backdrop-blur-sm">
        <Button
          variant="outline"
          onClick={() => router.push('/optimize/personas')}
          className="border-stone-300 text-stone-700 hover:border-purple-400 hover:text-purple-600 transition-colors duration-150"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Personas
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sticky Summary Sidebar */}
            <div className="lg:col-span-1">
              <PersonaSummaryCard persona={persona} />
            </div>

            {/* Main Tabs Content */}
            <div className="lg:col-span-2 space-y-4">
              <Tabs defaultValue="jobs">
                <TabsList className="mb-4">
                  <TabsTrigger value="jobs">Jobs to be Done</TabsTrigger>
                  <TabsTrigger value="pain">Pain & Challenges</TabsTrigger>
                  <TabsTrigger value="goals">Goals & Motivation</TabsTrigger>
                  <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
                </TabsList>

                <TabsContent value="jobs">
                  <PersonaJTBDTab jtbds={jtbds} />
                </TabsContent>

                <TabsContent value="pain">
                  <PersonaPainTab painPoints={painPoints} challenges={challenges} />
                </TabsContent>

                <TabsContent value="goals">
                  <PersonaGoalsTab
                    goals={goals}
                    motivations={motivations}
                    values={values}
                    personalityTraits={personalityTraits}
                  />
                </TabsContent>

                <TabsContent value="stakeholders">
                  <PersonaStakeholdersTab
                    internalStakeholders={internalStakeholders}
                    externalStakeholders={externalStakeholders}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
