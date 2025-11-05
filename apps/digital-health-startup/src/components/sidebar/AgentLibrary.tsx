'use client';

import React, { useState } from 'react';

interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  specialty: string;
  icon: string;
  category: 'clinical' | 'regulatory' | 'research' | 'safety' | 'analytics';
  isActive: boolean;
}

// Healthcare AI Agents from the ComplianceAwareOrchestrator
const healthcareAgents: Agent[] = [
  {
    id: 'digital-therapeutics-expert',
    name: 'Digital Therapeutics Expert',
    type: 'digital-therapeutics-expert',
    description: 'Specializes in digital health solutions and therapeutic applications',
    specialty: 'Digital Health',
    icon: '📱',
    category: 'clinical',
    isActive: true
  },
  {
    id: 'fda-regulatory-strategist',
    name: 'FDA Regulatory Strategist',
    type: 'fda-regulatory-strategist',
    description: 'Expert in FDA regulations, submissions, and compliance pathways',
    specialty: 'Regulatory Affairs',
    icon: '📋',
    category: 'regulatory',
    isActive: true
  },
  {
    id: 'clinical-trial-designer',
    name: 'Clinical Trial Designer',
    type: 'clinical-trial-designer',
    description: 'Designs and optimizes clinical trial protocols and methodologies',
    specialty: 'Clinical Research',
    icon: '🧪',
    category: 'research',
    isActive: true
  },
  {
    id: 'medical-safety-officer',
    name: 'Medical Safety Officer',
    type: 'medical-safety-officer',
    description: 'Monitors safety signals and adverse events in clinical development',
    specialty: 'Safety Monitoring',
    icon: '🛡️',
    category: 'safety',
    isActive: true
  },
  {
    id: 'ai-ml-clinical-specialist',
    name: 'AI/ML Clinical Specialist',
    type: 'ai-ml-clinical-specialist',
    description: 'Applies AI/ML techniques to clinical data and research',
    specialty: 'Clinical AI',
    icon: '🧠',
    category: 'analytics',
    isActive: true
  },
  {
    id: 'health-economics-analyst',
    name: 'Health Economics Analyst',
    type: 'health-economics-analyst',
    description: 'Analyzes cost-effectiveness and health economic outcomes',
    specialty: 'Health Economics',
    icon: '📊',
    category: 'analytics',
    isActive: true
  },
  {
    id: 'biomedical-informatics-specialist',
    name: 'Biomedical Informatics Specialist',
    type: 'biomedical-informatics-specialist',
    description: 'Manages and analyzes biomedical data and information systems',
    specialty: 'Bioinformatics',
    icon: '🔬',
    category: 'research',
    isActive: true
  },
  {
    id: 'market-access-strategist',
    name: 'Market Access Strategist',
    type: 'market-access-strategist',
    description: 'Develops strategies for market access and commercialization',
    specialty: 'Market Access',
    icon: '🎯',
    category: 'regulatory',
    isActive: true
  }
];

const categoryColors: Record<string, string> = {
  clinical: 'bg-blue-100 text-blue-800',
  regulatory: 'bg-green-100 text-green-800',
  research: 'bg-purple-100 text-purple-800',
  safety: 'bg-red-100 text-red-800',
  analytics: 'bg-orange-100 text-orange-800'
};

export function AgentLibrary() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = healthcareAgents.filter((agent) => {
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

    // This would integrate with the chat system to start a conversation with the selected agent
    // };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-border">
        <input
          type="text"
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
      </div>

      {/* Category Filter */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-xs rounded-full transition-colors capitalize ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto">
        {filteredAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <div className="text-2xl mb-2">🔍</div>
            <p className="text-sm text-center">No agents found</p>
            <p className="text-xs text-center mt-1">Try adjusting your search</p>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {filteredAgents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleAgentSelect(agent)}
                className="w-full text-left p-3 rounded-lg transition-colors hover:bg-muted/50 group"
              >
                <div className="flex items-start gap-3">
                  {/* Agent Icon */}
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-lg">
                    {agent.icon}
                  </div>

                  {/* Agent Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {agent.name}
                      </h4>
                      {agent.isActive && (
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${categoryColors[agent.category]}`}>
                        {agent.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {agent.specialty}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {agent.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          <span className="font-medium">{filteredAgents.length}</span> of{' '}
          <span className="font-medium">{healthcareAgents.length}</span> agents available
        </div>
      </div>
    </div>
  );
}