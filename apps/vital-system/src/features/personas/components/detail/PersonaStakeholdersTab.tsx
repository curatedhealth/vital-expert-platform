'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, Badge, Button } from '@vital/ui';
import { Users, Shield, Link2 } from 'lucide-react';

interface InternalStakeholder {
  id?: string;
  stakeholder_name?: string;
  stakeholder_role?: string;
  relationship_type?: string;
  influence_level?: string;
  personas?: {
    slug?: string;
  };
}

interface ExternalStakeholder {
  id?: string;
  stakeholder_name?: string;
  stakeholder_type?: string;
  relationship_importance?: string;
  interaction_mode?: string;
}

interface PersonaStakeholdersTabProps {
  internalStakeholders: InternalStakeholder[];
  externalStakeholders: ExternalStakeholder[];
}

/**
 * Tab content showing persona's internal and external stakeholders
 * VITAL Brand Guidelines v6.0 compliant
 */
export function PersonaStakeholdersTab({ internalStakeholders, externalStakeholders }: PersonaStakeholdersTabProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Internal Stakeholders */}
      <Card className="border border-stone-200 shadow-sm bg-white">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-purple-600" />
            <div>
              <h3 className="text-lg font-bold text-stone-800">Internal Stakeholders</h3>
              <p className="text-sm text-stone-500">Influencers and collaborators</p>
            </div>
          </div>

          {internalStakeholders.length === 0 && (
            <p className="text-sm text-stone-500">No internal stakeholders captured.</p>
          )}

          <div className="space-y-3">
            {internalStakeholders.map((stakeholder, index) => {
              const relatedPersona = stakeholder.personas;
              return (
                <div
                  key={stakeholder.id || index}
                  className="p-3 bg-purple-50 rounded-lg border border-purple-200 transition-all duration-150 hover:border-purple-400"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-stone-800 mb-1">
                        {stakeholder.stakeholder_name || stakeholder.stakeholder_role}
                      </p>
                      {stakeholder.stakeholder_role && (
                        <p className="text-xs text-stone-500 mb-1">Role: {stakeholder.stakeholder_role}</p>
                      )}
                      {stakeholder.relationship_type && (
                        <p className="text-xs text-stone-500 mb-1">Relationship: {stakeholder.relationship_type}</p>
                      )}
                      {stakeholder.influence_level && (
                        <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                          Influence: {stakeholder.influence_level}
                        </Badge>
                      )}
                    </div>
                    {relatedPersona && relatedPersona.slug && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/optimize/personas/${relatedPersona.slug}`)}
                        className="ml-2 text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                      >
                        <Link2 className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* External Stakeholders */}
      <Card className="border border-stone-200 shadow-sm bg-white">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-emerald-600" />
            <div>
              <h3 className="text-lg font-bold text-stone-800">External Stakeholders</h3>
              <p className="text-sm text-stone-500">Outside relationships</p>
            </div>
          </div>

          {externalStakeholders.length === 0 && (
            <p className="text-sm text-stone-500">No external stakeholders captured.</p>
          )}

          <div className="space-y-3">
            {externalStakeholders.map((stakeholder, index) => (
              <div
                key={stakeholder.id || index}
                className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 transition-all duration-150 hover:border-emerald-400"
              >
                <p className="text-sm font-semibold text-stone-800 mb-1">
                  {stakeholder.stakeholder_name}
                </p>
                {stakeholder.stakeholder_type && (
                  <p className="text-xs text-stone-500 mb-1">Type: {stakeholder.stakeholder_type}</p>
                )}
                {stakeholder.relationship_importance && (
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                    {stakeholder.relationship_importance}
                  </Badge>
                )}
                {stakeholder.interaction_mode && (
                  <p className="text-xs text-stone-500 mt-1">Interaction: {stakeholder.interaction_mode}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
