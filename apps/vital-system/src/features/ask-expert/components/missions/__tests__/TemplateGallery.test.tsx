import React from 'react';
import { render, screen } from '@testing-library/react';
import { TemplateGallery } from '../TemplateGallery';

jest.mock(
  '@vital/ui/components/missions',
  () => ({
    TemplateCard: ({ title, name, template }: { title?: string; name?: string; template?: { name?: string } }) => (
      <div>{title || name || template?.name}</div>
    ),
  }),
  { virtual: true }
);

const templates = [
  {
    id: 'evaluation_rubric',
    name: 'Evaluation: Rubric Scoring',
    family: 'EVALUATION',
    category: 'Analysis',
    description: 'Score alternatives against a rubric',
    complexity: 'medium',
    estimatedDurationMin: 30,
    estimatedDurationMax: 60,
    estimatedCostMin: 2,
    estimatedCostMax: 6,
    tags: ['evaluation'],
  },
  {
    id: 'solution_design',
    name: 'Problem Solving: Solution Design',
    family: 'PROBLEM_SOLVING',
    category: 'Problem Solving',
    description: 'Generate and score options then build a plan',
    complexity: 'medium',
    estimatedDurationMin: 30,
    estimatedDurationMax: 75,
    estimatedCostMin: 2.5,
    estimatedCostMax: 6.5,
    tags: ['problem-solving'],
  },
  {
    id: 'communication_campaign',
    name: 'Communication: Campaign Plan',
    family: 'COMMUNICATION',
    category: 'Engagement',
    description: 'Segment audiences and plan channels',
    complexity: 'medium',
    estimatedDurationMin: 30,
    estimatedDurationMax: 75,
    estimatedCostMin: 2.5,
    estimatedCostMax: 6.5,
    tags: ['communication'],
  },
  {
    id: 'generic_mission',
    name: 'Generic Mission',
    family: 'GENERIC',
    category: 'General',
    description: 'Fallback generic mission',
    complexity: 'low',
    estimatedDurationMin: 15,
    estimatedDurationMax: 45,
    estimatedCostMin: 0.75,
    estimatedCostMax: 2.5,
    tags: ['generic'],
  },
] as const;

describe('TemplateGallery', () => {
  it('renders new templates without crashing', () => {
    render(
      <TemplateGallery
        templates={templates as any}
        onSelect={() => {}}
        showSearch={false}
        showCategories={false}
        showFilters={false}
      />
    );

    expect(screen.getByText('Evaluation: Rubric Scoring')).toBeInTheDocument();
    expect(screen.getByText('Problem Solving: Solution Design')).toBeInTheDocument();
    expect(screen.getByText('Communication: Campaign Plan')).toBeInTheDocument();
    expect(screen.getByText('Generic Mission')).toBeInTheDocument();
  });
});
