/**
 * Unit Tests for ToolsTab Component
 * Sprint 2 - Agent Creator Refactoring
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import './setup'; // Import test setup and mocks
import { ToolsTab } from '../ToolsTab';
import type { AgentFormData, Tool } from '../types';

// Mock the tool registry
jest.mock('@/features/chat/tools/tool-registry', () => ({
  TOOL_STATUS: {
    'Web Search': 'available',
    'PubMed Search': 'available',
    'FDA Database': 'coming_soon',
    'Clinical Trials': 'available',
  },
}));

describe('ToolsTab', () => {
  // Mock data
  const mockFormData: AgentFormData = {
    name: 'Test Agent',
    avatar: 'test-avatar',
    tier: 'tier-1',
    status: 'active',
    priority: 'high',
    description: 'Test description',
    systemPrompt: 'Test prompt',
    businessFunction: 'clinical-ops',
    department: 'cardiology',
    role: 'cardiologist',
    capabilities: [],
    ragEnabled: false,
    knowledgeUrls: [],
    knowledgeFiles: [],
    knowledgeDomains: [],
    tools: ['Web Search', 'PubMed Search'],
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    promptStarters: [],
  };

  const mockTools: Tool[] = [
    {
      id: '1',
      name: 'Web Search',
      code: 'web_search',
      description: 'Search the web for information',
      category: 'Search',
      authentication_required: false,
    },
    {
      id: '2',
      name: 'PubMed Search',
      code: 'pubmed_search',
      description: 'Search medical literature on PubMed',
      category: 'Medical',
      authentication_required: false,
    },
    {
      id: '3',
      name: 'FDA Database',
      code: 'fda_database',
      description: 'Access FDA drug and device databases',
      category: 'Regulatory',
      authentication_required: true,
    },
    {
      id: '4',
      name: 'Clinical Trials',
      code: 'clinical_trials',
      description: 'Search clinical trial databases',
      category: 'Research',
      authentication_required: false,
    },
  ];

  const mockHandleToolToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the ToolsTab component', () => {
      render(
        <ToolsTab
          formData={mockFormData}
          availableToolsFromDB={mockTools}
          loadingTools={false}
          handleToolToggle={mockHandleToolToggle}
        />
      );

      expect(screen.getByText('Tools & Integrations')).toBeInTheDocument();
    });

    it('should render loading state', () => {
      render(
        <ToolsTab
          formData={mockFormData}
          availableToolsFromDB={[]}
          loadingTools={true}
          handleToolToggle={mockHandleToolToggle}
        />
      );

      expect(screen.getByText('Loading tools...')).toBeInTheDocument();
    });

    it('should render empty state when no tools available', () => {
      render(
        <ToolsTab
          formData={mockFormData}
          availableToolsFromDB={[]}
          loadingTools={false}
          handleToolToggle={mockHandleToolToggle}
        />
      );

      expect(
        screen.getByText('No tools available. Add tools to the database first.')
      ).toBeInTheDocument();
    });

    it('should render all available tools', () => {
      render(
        <ToolsTab
          formData={mockFormData}
          availableToolsFromDB={mockTools}
          loadingTools={false}
          handleToolToggle={mockHandleToolToggle}
        />
      );

      mockTools.forEach((tool) => {
        expect(screen.getByText(tool.name)).toBeInTheDocument();
        if (tool.description) {
          expect(screen.getByText(tool.description)).toBeInTheDocument();
        }
      });
    });

    it('should render tool categories', () => {
      render(
        <ToolsTab
          formData={mockFormData}
          availableToolsFromDB={mockTools}
          loadingTools={false}
          handleToolToggle={mockHandleToolToggle}
        />
      );

      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('Medical')).toBeInTheDocument();
      expect(screen.getByText('Regulatory')).toBeInTheDocument();
    });

    it('should render status badges correctly', () => {
      render(
        <ToolsTab
          formData={mockFormData}
          availableToolsFromDB={mockTools}
          loadingTools={false}
          handleToolToggle={mockHandleToolToggle}
        />
      );

      const availableBadges = screen.getAllByText('✓ Available');
      expect(availableBadges.length).toBeGreaterThan(0);

      expect(screen.getByText('🚧 Coming Soon')).toBeInTheDocument();
    });

    it('should render authentication indicators', () => {
      render(
        <ToolsTab
          formData={mockFormData}
          availableToolsFromDB={mockTools}
          loadingTools={false}
          handleToolToggle={mockHandleToolToggle}
        />
      );

      expect(screen.getByText('🔒 Authentication required')).toBeInTheDocument();
    });

    it('should render selected tools count', () => {
      render(
        <ToolsTab
          formData={mockFormData}
          availableToolsFromDB={mockTools}
          loadingTools={false}
          handleToolToggle={mockHandleToolToggle}
        />
      );

      expect(screen.getByText('Selected Tools (2)')).toBeInTheDocument();
    });

    it('should render selected tools badges', () => {
      render(
        <ToolsTab
          formData={mockFormData}
          availableToolsFromDB={mockTools}
          loadingTools={false}
          handleToolToggle={mockHandleToolToggle}
        />
      );

      // Check for selected tool badges
      const badges = screen.getAllByText(/Web Search|PubMed Search/);
      expect(badges.length).toBeGreaterThanOrEqual(2);
    });

    it('should show message when no tools selected', () => {
      const formDataNoTools = { ...mockFormData, tools: [] };

      render(
        <ToolsTab
          formData={formDataNoTools}
          availableToolsFromDB={mockTools}
          loadingTools={false}
          handleToolToggle={mockHandleToolToggle}
        />
      );

      expect(screen.getByText('No tools selected')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call handleToolToggle when clicking a tool', () => {
      render(
        <ToolsTab
          formData={mockFormData}
          availableToolsFromDB={mockTools}
          loadingTools={false}
          handleToolToggle={mockHandleToolToggle}
        />
      );

      const clinicalTrialsTool = screen.getByText('Clinical Trials');
      fireEvent.click(clinicalTrialsTool.closest('button')!);

      expect(mockHandleToolToggle).toHaveBeenCalledWith('Clinical Trials');
    });

    it('should visually indicate selected tools', () => {
      render(
        <ToolsTab
          formData={mockFormData}
          availableToolsFromDB={mockTools}
          loadingTools={false}
          handleToolToggle={mockHandleToolToggle}
        />
      );

      const webSearchButton = screen.getByText('Web Search').closest('button');
      expect(webSearchButton).toHaveClass('border-progress-teal');
    });

    it('should allow clicking multiple tools', () => {
      render(
        <ToolsTab
          formData={mockFormData}
          availableToolsFromDB={mockTools}
          loadingTools={false}
          handleToolToggle={mockHandleToolToggle}
        />
      );

      const tool1 = screen.getByText('Web Search').closest('button')!;
      const tool2 = screen.getByText('Clinical Trials').closest('button')!;

      fireEvent.click(tool1);
      fireEvent.click(tool2);

      expect(mockHandleToolToggle).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle tool with no description', () => {
      const toolsNoDesc: Tool[] = [
        {
          id: '1',
          name: 'Test Tool',
          code: 'test_tool',
          category: 'Test',
        },
      ];

      render(
        <ToolsTab
          formData={mockFormData}
          availableToolsFromDB={toolsNoDesc}
          loadingTools={false}
          handleToolToggle={mockHandleToolToggle}
        />
      );

      expect(screen.getByText('Test Tool')).toBeInTheDocument();
    });

    it('should handle tool with no category', () => {
      const toolsNoCat: Tool[] = [
        {
          id: '1',
          name: 'Test Tool',
          code: 'test_tool',
          description: 'Test description',
        },
      ];

      render(
        <ToolsTab
          formData={mockFormData}
          availableToolsFromDB={toolsNoCat}
          loadingTools={false}
          handleToolToggle={mockHandleToolToggle}
        />
      );

      expect(screen.getByText('Test Tool')).toBeInTheDocument();
    });

    it('should handle many tools (scrollable)', () => {
      const manyTools: Tool[] = Array.from({ length: 50 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Tool ${i + 1}`,
        code: `tool_${i + 1}`,
        description: `Description ${i + 1}`,
        category: 'Test',
      }));

      render(
        <ToolsTab
          formData={mockFormData}
          availableToolsFromDB={manyTools}
          loadingTools={false}
          handleToolToggle={mockHandleToolToggle}
        />
      );

      expect(screen.getByText('Tool 1')).toBeInTheDocument();
      expect(screen.getByText('Tool 50')).toBeInTheDocument();
    });

    it('should handle all tools selected', () => {
      const allSelected = mockTools.map((tool) => tool.name);
      const formDataAllSelected = { ...mockFormData, tools: allSelected };

      render(
        <ToolsTab
          formData={formDataAllSelected}
          availableToolsFromDB={mockTools}
          loadingTools={false}
          handleToolToggle={mockHandleToolToggle}
        />
      );

      expect(screen.getByText(`Selected Tools (${mockTools.length})`)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button types', () => {
      render(
        <ToolsTab
          formData={mockFormData}
          availableToolsFromDB={mockTools}
          loadingTools={false}
          handleToolToggle={mockHandleToolToggle}
        />
      );

      const toolButtons = screen.getAllByRole('button');
      toolButtons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('should have proper labels', () => {
      render(
        <ToolsTab
          formData={mockFormData}
          availableToolsFromDB={mockTools}
          loadingTools={false}
          handleToolToggle={mockHandleToolToggle}
        />
      );

      expect(screen.getByText('Available Tools')).toBeInTheDocument();
      expect(screen.getByText(/Selected Tools/)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle rapid clicks', () => {
      render(
        <ToolsTab
          formData={mockFormData}
          availableToolsFromDB={mockTools}
          loadingTools={false}
          handleToolToggle={mockHandleToolToggle}
        />
      );

      const tool = screen.getByText('Clinical Trials').closest('button')!;

      // Click rapidly
      fireEvent.click(tool);
      fireEvent.click(tool);
      fireEvent.click(tool);

      expect(mockHandleToolToggle).toHaveBeenCalledTimes(3);
    });
  });
});

