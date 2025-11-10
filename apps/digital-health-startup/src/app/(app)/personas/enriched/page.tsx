'use client';

/**
 * Enriched Personas Showcase Page
 * Displays three enriched Medical Affairs personas
 */

import React, { useState } from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import { Button } from '@vital/ui';
import { EnrichedPersonaCard } from '@/components/personas/EnrichedPersonaCard';
import Link from 'next/link';

const ENRICHED_PERSONAS = [
  {
    unique_id: 'ma_persona_p001',
    name: 'Dr. Kavita Singh',
    code: 'P001',
    tier: '1',
    priority: 8.9,
    industry: 'Pharmaceuticals',
  },
  {
    unique_id: 'ma_persona_p002',
    name: 'Dr. Cameron Park',
    code: 'P002',
    tier: '1',
    priority: 8.6,
    industry: 'Pharmaceuticals',
  },
  {
    unique_id: 'ma_persona_pada11',
    name: 'Dr. David Wang',
    code: 'PADA11',
    tier: '1',
    priority: 8.3,
    industry: 'Pharmaceuticals',
  },
];

export default function EnrichedPersonasPage() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/personas">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Personas
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Enriched Medical Affairs Personas</h1>
        </div>
        <p className="text-gray-600 mt-2">
          Three exemplar personas enriched with strategic pillars, JTBDs, and pain points
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-medium">Total Personas</div>
          <div className="text-3xl font-bold text-blue-900 mt-1">3</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600 font-medium">Pain Points</div>
          <div className="text-3xl font-bold text-green-900 mt-1">70</div>
          <div className="text-xs text-green-600 mt-1">Across all personas</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-600 font-medium">SP Mappings</div>
          <div className="text-3xl font-bold text-purple-900 mt-1">21</div>
          <div className="text-xs text-purple-600 mt-1">All 7 strategic pillars</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-sm text-orange-600 font-medium">JTBD Mappings</div>
          <div className="text-3xl font-bold text-orange-900 mt-1">28</div>
          <div className="text-xs text-orange-600 mt-1">Primary & secondary</div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <h3 className="font-semibold text-blue-900 mb-2">About This Enrichment</h3>
        <p className="text-sm text-blue-700">
          These three personas represent different levels in Medical Affairs:
        </p>
        <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4">
          <li>• <strong>P001 - Dr. Kavita Singh</strong>: VP/CMO level with strategic oversight across all pillars</li>
          <li>• <strong>P002 - Dr. Cameron Park</strong>: Medical Director focused on tactical execution in therapeutic areas</li>
          <li>• <strong>PADA11 - Dr. David Wang</strong>: Senior MSL with field medical responsibilities and HCP engagement</li>
        </ul>
      </div>

      {/* Persona Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ENRICHED_PERSONAS.map((persona) => (
          <EnrichedPersonaCard
            key={persona.unique_id}
            personaUniqueId={persona.unique_id}
            personaName={persona.name}
            personaCode={persona.code}
            personaTier={persona.tier}
            personaPriority={persona.priority}
            personaIndustry={persona.industry}
            onViewDetails={() => {
              // Navigate to detail view or show modal
              window.location.href = `/personas/${persona.unique_id}`;
            }}
          />
        ))}
      </div>

      {/* Comparison Section */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Comparative Analysis</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Strategic Focus */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-3">Strategic Focus</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Kavita Singh:</span>
                <p className="text-gray-600">All 7 pillars primary - Global strategy</p>
              </div>
              <div>
                <span className="font-medium">Cameron Park:</span>
                <p className="text-gray-600">5 primary pillars - TA execution</p>
              </div>
              <div>
                <span className="font-medium">David Wang:</span>
                <p className="text-gray-600">4 primary pillars - Field medical</p>
              </div>
            </div>
          </div>

          {/* JTBD Ownership */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-3">JTBD Ownership</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Kavita Singh:</span>
                <p className="text-gray-600">10 primary - Broadest ownership</p>
              </div>
              <div>
                <span className="font-medium">Cameron Park:</span>
                <p className="text-gray-600">6 primary - Tactical focus</p>
              </div>
              <div>
                <span className="font-medium">David Wang:</span>
                <p className="text-gray-600">4 primary - Field execution</p>
              </div>
            </div>
          </div>

          {/* Pain Point Distribution */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-3">Pain Points</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Kavita Singh:</span>
                <p className="text-gray-600">26 total - Strategic challenges</p>
              </div>
              <div>
                <span className="font-medium">Cameron Park:</span>
                <p className="text-gray-600">21 total - TA execution</p>
              </div>
              <div>
                <span className="font-medium">David Wang:</span>
                <p className="text-gray-600">23 total - Field operations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-semibold text-lg mb-2">Explore Further</h3>
        <p className="text-gray-700 mb-4">
          Click "View Details" on any persona card to see:
        </p>
        <ul className="text-sm text-gray-700 space-y-1 ml-4">
          <li>• Complete pain points breakdown by strategic pillar</li>
          <li>• Primary and secondary JTBD mappings with responsibility levels</li>
          <li>• Strategic pillar priority scores and engagement metadata</li>
          <li>• Cross-functional collaboration patterns</li>
        </ul>
      </div>
    </div>
  );
}
