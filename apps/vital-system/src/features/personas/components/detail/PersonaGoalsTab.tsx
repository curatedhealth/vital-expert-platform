'use client';

import React from 'react';
import { Card, CardContent, Badge } from '@vital/ui';
import { TrendingUp, Sparkles, Heart, Brain } from 'lucide-react';

interface Goal {
  id?: string;
  goal_text?: string;
  goal_type?: string;
  goal_category?: string;
  priority?: string;
}

interface Motivation {
  id?: string;
  motivation_text?: string;
  motivation_category?: string;
}

interface Value {
  id?: string;
  value_name?: string;
  value_description?: string;
}

interface PersonalityTrait {
  id?: string;
  trait_name?: string;
  trait_description?: string;
  strength?: string;
}

interface PersonaGoalsTabProps {
  goals: Goal[];
  motivations: Motivation[];
  values: Value[];
  personalityTraits: PersonalityTrait[];
}

/**
 * Tab content showing persona's goals, motivations, values, and personality traits
 * VITAL Brand Guidelines v6.0 compliant
 */
export function PersonaGoalsTab({ goals, motivations, values, personalityTraits }: PersonaGoalsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Goals */}
      <Card className="border border-stone-200 shadow-sm bg-white">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <div>
              <h3 className="text-lg font-bold text-stone-800">Goals</h3>
              <p className="text-sm text-stone-500">Desired outcomes and priorities</p>
            </div>
          </div>

          {goals.length === 0 && (
            <p className="text-sm text-stone-500">No goals captured.</p>
          )}

          <div className="space-y-3">
            {goals.map((goal, idx) => (
              <div
                key={goal.id || idx}
                className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 transition-all duration-150 hover:border-emerald-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-stone-800">{goal.goal_text}</p>
                  {goal.goal_type && (
                    <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                      {goal.goal_type}
                    </Badge>
                  )}
                </div>
                {goal.goal_category && (
                  <p className="text-xs text-stone-500 mt-1">Category: {goal.goal_category}</p>
                )}
                {goal.priority && (
                  <p className="text-xs text-stone-500">Priority: {goal.priority}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Motivations, Values, Personality */}
      <div className="space-y-4">
        {/* Motivations */}
        {motivations.length > 0 && (
          <Card className="border border-stone-200 shadow-sm bg-white">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-bold text-stone-800">Motivations</h3>
              </div>
              <div className="space-y-2">
                {motivations.map((motivation, idx) => (
                  <div
                    key={motivation.id || idx}
                    className="rounded-lg bg-purple-50 border border-purple-100 p-3 transition-all duration-150 hover:border-purple-300"
                  >
                    <p className="text-sm font-semibold text-stone-800">{motivation.motivation_text}</p>
                    {motivation.motivation_category && (
                      <p className="text-xs text-stone-500">Category: {motivation.motivation_category}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Values */}
        {values.length > 0 && (
          <Card className="border border-stone-200 shadow-sm bg-white">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-pink-600" />
                <h3 className="text-lg font-bold text-stone-800">Values</h3>
              </div>
              <div className="space-y-2">
                {values.map((value, idx) => (
                  <div
                    key={value.id || idx}
                    className="rounded-lg bg-pink-50 border border-pink-100 p-3 transition-all duration-150 hover:border-pink-300"
                  >
                    <p className="text-sm font-semibold text-stone-800">{value.value_name}</p>
                    {value.value_description && (
                      <p className="text-xs text-stone-600">{value.value_description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personality Traits */}
        {personalityTraits.length > 0 && (
          <Card className="border border-stone-200 shadow-sm bg-white">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-bold text-stone-800">Personality</h3>
              </div>
              <div className="space-y-2">
                {personalityTraits.map((trait, idx) => (
                  <div
                    key={trait.id || idx}
                    className="rounded-lg bg-purple-50 border border-purple-100 p-3 flex items-center justify-between transition-all duration-150 hover:border-purple-300"
                  >
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{trait.trait_name}</p>
                      {trait.trait_description && (
                        <p className="text-xs text-stone-600">{trait.trait_description}</p>
                      )}
                    </div>
                    {trait.strength && (
                      <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                        {trait.strength}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
