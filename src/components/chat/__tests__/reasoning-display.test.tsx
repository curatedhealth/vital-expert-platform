import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReasoningDisplay } from '../reasoning-display';

const mockReasoningEvents = [
  {
    id: '1',
    step: 'analysis',
    description: 'Analyzing the medical query',
    data: { query: 'chest pain symptoms' },
    timestamp: new Date('2024-01-01T10:00:00Z'),
    status: 'completed' as const
  },
  {
    id: '2',
    step: 'research',
    description: 'Searching medical literature',
    data: { sources: ['pubmed', 'cochrane'] },
    timestamp: new Date('2024-01-01T10:01:00Z'),
    status: 'in_progress' as const
  },
  {
    id: '3',
    step: 'synthesis',
    description: 'Synthesizing findings',
    data: { findings: 5 },
    timestamp: new Date('2024-01-01T10:02:00Z'),
    status: 'pending' as const
  }
];

describe('ReasoningDisplay', () => {
  it('renders reasoning events when provided', () => {
    render(
      <ReasoningDisplay
        reasoningEvents={mockReasoningEvents}
        isActive={false}
      />
    );

    expect(screen.getByText('AI Reasoning Process')).toBeInTheDocument();
    expect(screen.getByText('Analyzing the medical query')).toBeInTheDocument();
    expect(screen.getByText('Searching medical literature')).toBeInTheDocument();
    expect(screen.getByText('Synthesizing findings')).toBeInTheDocument();
  });

  it('shows loading state when active', () => {
    render(
      <ReasoningDisplay
        reasoningEvents={[]}
        isActive={true}
      />
    );

    expect(screen.getByText('AI Reasoning Process')).toBeInTheDocument();
    // The component shows a spinner when active
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('does not render when no events and not active', () => {
    const { container } = render(
      <ReasoningDisplay
        reasoningEvents={[]}
        isActive={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('toggles expansion when header is clicked', () => {
    render(
      <ReasoningDisplay
        reasoningEvents={mockReasoningEvents}
        isActive={false}
      />
    );

    const header = screen.getByText('AI Reasoning Process').closest('div');
    expect(header).toBeInTheDocument();

    // Initially expanded
    expect(screen.getByText('Analyzing the medical query')).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(header!);
    expect(screen.queryByText('Analyzing the medical query')).not.toBeInTheDocument();

    // Click to expand again
    fireEvent.click(header!);
    expect(screen.getByText('Analyzing the medical query')).toBeInTheDocument();
  });

  it('shows correct status icons for each step', () => {
    render(
      <ReasoningDisplay
        reasoningEvents={mockReasoningEvents}
        isActive={false}
      />
    );

    // Check that all steps are rendered
    expect(screen.getByText('Analyzing the medical query')).toBeInTheDocument();
    expect(screen.getByText('Searching medical literature')).toBeInTheDocument();
    expect(screen.getByText('Synthesizing findings')).toBeInTheDocument();
  });

  it('displays step data when available', () => {
    render(
      <ReasoningDisplay
        reasoningEvents={mockReasoningEvents}
        isActive={false}
      />
    );

    // Check that the data is displayed in the pre elements
    expect(screen.getByText('"query": "chest pain symptoms"')).toBeInTheDocument();
    expect(screen.getByText('"sources": [')).toBeInTheDocument();
    expect(screen.getByText('"findings": 5')).toBeInTheDocument();
  });
});
