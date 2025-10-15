import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolSelector } from '../tool-selector';

const mockTools = [
  {
    id: 'web-search',
    name: 'Web Search',
    description: 'Search the internet for current information',
    icon: '🌐',
    category: 'research' as const,
    enabled: true,
    metadata: {
      requiresAuth: false,
      cacheEnabled: true,
      cacheDuration: 5
    }
  },
  {
    id: 'pubmed-search',
    name: 'PubMed Search',
    description: 'Search medical literature database',
    icon: '📚',
    category: 'research' as const,
    enabled: true,
    metadata: {
      requiresAuth: false,
      cacheEnabled: true,
      cacheDuration: 10
    }
  },
  {
    id: 'fda-database',
    name: 'FDA Database',
    description: 'Search FDA drug approvals and safety data',
    icon: '🏛️',
    category: 'regulatory' as const,
    enabled: true,
    metadata: {
      requiresAuth: false,
      cacheEnabled: true,
      cacheDuration: 15
    }
  }
];

describe('ToolSelector', () => {
  const mockOnToolToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders available tools grouped by category', () => {
    render(
      <ToolSelector
        availableTools={mockTools}
        selectedTools={[]}
        onToolToggle={mockOnToolToggle}
        disabled={false}
      />
    );

    expect(screen.getByText('Available Tools')).toBeInTheDocument();
    expect(screen.getByText('Web Search')).toBeInTheDocument();
    expect(screen.getByText('PubMed Search')).toBeInTheDocument();
    expect(screen.getByText('FDA Database')).toBeInTheDocument();
  });

  it('shows selected tools count', () => {
    render(
      <ToolSelector
        availableTools={mockTools}
        selectedTools={['web-search', 'pubmed-search']}
        onToolToggle={mockOnToolToggle}
        disabled={false}
      />
    );

    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });

  it('calls onToolToggle when tool is clicked', () => {
    render(
      <ToolSelector
        availableTools={mockTools}
        selectedTools={[]}
        onToolToggle={mockOnToolToggle}
        disabled={false}
      />
    );

    fireEvent.click(screen.getByText('Web Search'));
    expect(mockOnToolToggle).toHaveBeenCalledWith('web-search');
  });

  it('shows tools as checked when selected', () => {
    render(
      <ToolSelector
        availableTools={mockTools}
        selectedTools={['web-search']}
        onToolToggle={mockOnToolToggle}
        disabled={false}
      />
    );

    const webSearchCheckbox = screen.getByRole('checkbox', { name: /web search/i });
    expect(webSearchCheckbox).toBeChecked();
  });

  it('disables tools when disabled prop is true', () => {
    render(
      <ToolSelector
        availableTools={mockTools}
        selectedTools={[]}
        onToolToggle={mockOnToolToggle}
        disabled={true}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeDisabled();
    });
  });

  it('groups tools by category', () => {
    render(
      <ToolSelector
        availableTools={mockTools}
        selectedTools={[]}
        onToolToggle={mockOnToolToggle}
        disabled={false}
      />
    );

    expect(screen.getByText('research')).toBeInTheDocument();
    expect(screen.getByText('regulatory')).toBeInTheDocument();
  });
});
