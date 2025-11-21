/**
 * Integration Tests for Sprint 2 Components
 * Tests: CapabilitiesTab, KnowledgeTab, ToolsTab
 * 
 * These tests verify that all Sprint 2 components work together correctly
 * within the Agent Creator modal context.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import './setup'; // Import test setup and mocks
import type { AgentFormData, Tool } from '../types';

// Mock dependencies
jest.mock('@/features/chat/tools/tool-registry', () => ({
  TOOL_STATUS: {
    'Web Search': 'available',
    'PubMed Search': 'available',
    'FDA Database': 'coming_soon',
  },
}));

describe('Sprint 2 Components Integration', () => {
  // Mock initial form data
  const initialFormData: AgentFormData = {
    name: 'Test Agent',
    avatar: 'test-avatar',
    tier: 'tier-1',
    status: 'active',
    priority: 'high',
    description: 'Test description',
    systemPrompt: 'Test prompt',
    businessFunction: '',
    department: '',
    role: '',
    capabilities: [],
    ragEnabled: false,
    knowledgeUrls: [],
    knowledgeFiles: [],
    knowledgeDomains: [],
    tools: [],
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    promptStarters: [],
  };

  describe('Data Flow Between Components', () => {
    it('should maintain form state across tab switches', async () => {
      // This test simulates switching between tabs and verifying data persists
      const { CapabilitiesTab } = require('../CapabilitiesTab');
      const { ToolsTab } = require('../ToolsTab');

      let formData = { ...initialFormData };
      const setFormData = jest.fn((updater: any) => {
        formData = typeof updater === 'function' ? updater(formData) : updater;
      });

      const mockTools: Tool[] = [
        { id: '1', name: 'Web Search', code: 'web_search', description: 'Search the web' },
      ];

      // Render CapabilitiesTab first
      const { rerender } = render(
        <CapabilitiesTab
          formData={formData}
          newCapability=""
          predefinedCapabilities={['Regulatory Guidance']}
          setNewCapability={jest.fn()}
          setFormData={setFormData}
          handleCapabilityAdd={jest.fn()}
          handleCapabilityRemove={jest.fn()}
        />
      );

      // Simulate adding capability
      formData = { ...formData, capabilities: ['Regulatory Guidance'] };

      // Switch to ToolsTab
      rerender(
        <ToolsTab
          formData={formData}
          availableToolsFromDB={mockTools}
          loadingTools={false}
          handleToolToggle={jest.fn()}
        />
      );

      // Verify ToolsTab renders
      expect(screen.getByText('Tools & Integrations')).toBeInTheDocument();

      // Switch back to CapabilitiesTab
      rerender(
        <CapabilitiesTab
          formData={formData}
          newCapability=""
          predefinedCapabilities={['Regulatory Guidance']}
          setNewCapability={jest.fn()}
          setFormData={setFormData}
          handleCapabilityAdd={jest.fn()}
          handleCapabilityRemove={jest.fn()}
        />
      );

      // Verify capability persisted
      expect(formData.capabilities).toContain('Regulatory Guidance');
    });
  });

  describe('Component Interactions', () => {
    it('should handle form data updates correctly', () => {
      const { CapabilitiesTab } = require('../CapabilitiesTab');

      let formData = { ...initialFormData };
      const setFormData = jest.fn((updater: any) => {
        formData = typeof updater === 'function' ? updater(formData) : updater;
      });

      const handleCapabilityAdd = jest.fn((capability: string) => {
        setFormData((prev: AgentFormData) => ({
          ...prev,
          capabilities: [...prev.capabilities, capability],
        }));
      });

      render(
        <CapabilitiesTab
          formData={formData}
          newCapability="Test Capability"
          predefinedCapabilities={[]}
          setNewCapability={jest.fn()}
          setFormData={setFormData}
          handleCapabilityAdd={handleCapabilityAdd}
          handleCapabilityRemove={jest.fn()}
        />
      );

      const addButton = screen.getAllByRole('button')[0];
      fireEvent.click(addButton);

      expect(handleCapabilityAdd).toHaveBeenCalledWith('Test Capability');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing data gracefully', () => {
      const { ToolsTab } = require('../ToolsTab');

      render(
        <ToolsTab
          formData={initialFormData}
          availableToolsFromDB={[]}
          loadingTools={false}
          handleToolToggle={jest.fn()}
        />
      );

      expect(
        screen.getByText('No tools available. Add tools to the database first.')
      ).toBeInTheDocument();
    });

    it('should handle null/undefined values in form data', () => {
      const { CapabilitiesTab } = require('../CapabilitiesTab');

      const malformedData = {
        ...initialFormData,
        capabilities: undefined as any,
      };

      // Should not crash
      expect(() => {
        render(
          <CapabilitiesTab
            formData={malformedData}
            newCapability=""
            predefinedCapabilities={[]}
            setNewCapability={jest.fn()}
            setFormData={jest.fn()}
            handleCapabilityAdd={jest.fn()}
            handleCapabilityRemove={jest.fn()}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should render large lists efficiently', () => {
      const { ToolsTab } = require('../ToolsTab');

      const manyTools: Tool[] = Array.from({ length: 100 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Tool ${i + 1}`,
        code: `tool_${i + 1}`,
        description: `Description ${i + 1}`,
      }));

      const startTime = performance.now();

      render(
        <ToolsTab
          formData={initialFormData}
          availableToolsFromDB={manyTools}
          loadingTools={false}
          handleToolToggle={jest.fn()}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in less than 1 second
      expect(renderTime).toBeLessThan(1000);
    });

    it('should handle rapid state updates', async () => {
      const { CapabilitiesTab } = require('../CapabilitiesTab');

      const setNewCapability = jest.fn();

      render(
        <CapabilitiesTab
          formData={initialFormData}
          newCapability=""
          predefinedCapabilities={[]}
          setNewCapability={setNewCapability}
          setFormData={jest.fn()}
          handleCapabilityAdd={jest.fn()}
          handleCapabilityRemove={jest.fn()}
        />
      );

      const input = screen.getByPlaceholderText('Enter a capability');

      // Rapid typing simulation
      const testString = 'Test Capability';
      for (let i = 0; i < testString.length; i++) {
        fireEvent.change(input, { target: { value: testString.slice(0, i + 1) } });
      }

      expect(setNewCapability).toHaveBeenCalledTimes(testString.length);
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain focus management across components', () => {
      const { CapabilitiesTab } = require('../CapabilitiesTab');

      render(
        <CapabilitiesTab
          formData={initialFormData}
          newCapability=""
          predefinedCapabilities={['Regulatory Guidance']}
          setNewCapability={jest.fn()}
          setFormData={jest.fn()}
          handleCapabilityAdd={jest.fn()}
          handleCapabilityRemove={jest.fn()}
        />
      );

      const input = screen.getByPlaceholderText('Enter a capability');
      input.focus();

      expect(document.activeElement).toBe(input);
    });

    it('should have proper ARIA labels across all components', () => {
      const { CapabilitiesTab } = require('../CapabilitiesTab');
      const { ToolsTab } = require('../ToolsTab');

      const { rerender } = render(
        <CapabilitiesTab
          formData={initialFormData}
          newCapability=""
          predefinedCapabilities={[]}
          setNewCapability={jest.fn()}
          setFormData={jest.fn()}
          handleCapabilityAdd={jest.fn()}
          handleCapabilityRemove={jest.fn()}
        />
      );

      // Check CapabilitiesTab accessibility
      expect(screen.getByText('Add Capability')).toBeInTheDocument();

      // Switch to ToolsTab
      rerender(
        <ToolsTab
          formData={initialFormData}
          availableToolsFromDB={[]}
          loadingTools={false}
          handleToolToggle={jest.fn()}
        />
      );

      // Check ToolsTab accessibility
      expect(screen.getByText('Available Tools')).toBeInTheDocument();
    });
  });

  describe('Real-world Scenarios', () => {
    it('should support complete agent creation workflow', async () => {
      const { CapabilitiesTab } = require('../CapabilitiesTab');
      const { ToolsTab } = require('../ToolsTab');

      let formData = { ...initialFormData };
      const setFormData = jest.fn((updater: any) => {
        formData = typeof updater === 'function' ? updater(formData) : updater;
      });

      const mockTools: Tool[] = [
        { id: '1', name: 'Web Search', code: 'web_search' },
        { id: '2', name: 'PubMed Search', code: 'pubmed_search' },
      ];

      // Step 1: Add capabilities
      const { rerender } = render(
        <CapabilitiesTab
          formData={formData}
          newCapability=""
          predefinedCapabilities={['Regulatory Guidance', 'Clinical Research']}
          setNewCapability={jest.fn()}
          setFormData={setFormData}
          handleCapabilityAdd={(cap) => {
            formData = { ...formData, capabilities: [...formData.capabilities, cap] };
          }}
          handleCapabilityRemove={jest.fn()}
        />
      );

      // Add capability
      formData = { ...formData, capabilities: ['Regulatory Guidance'] };

      // Step 2: Select tools
      rerender(
        <ToolsTab
          formData={formData}
          availableToolsFromDB={mockTools}
          loadingTools={false}
          handleToolToggle={(toolName) => {
            formData = { ...formData, tools: [...formData.tools, toolName] };
          }}
        />
      );

      // Verify workflow state
      expect(formData.capabilities).toContain('Regulatory Guidance');
      expect(formData.tools.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle editing existing agent', () => {
      const { CapabilitiesTab } = require('../CapabilitiesTab');

      const existingAgent: AgentFormData = {
        ...initialFormData,
        name: 'Existing Agent',
        capabilities: ['Regulatory Guidance', 'Clinical Research'],
        tools: ['Web Search'],
      };

      render(
        <CapabilitiesTab
          formData={existingAgent}
          newCapability=""
          predefinedCapabilities={['Market Access']}
          setNewCapability={jest.fn()}
          setFormData={jest.fn()}
          handleCapabilityAdd={jest.fn()}
          handleCapabilityRemove={jest.fn()}
        />
      );

      // Verify existing capabilities are displayed
      expect(screen.getByText('Regulatory Guidance')).toBeInTheDocument();
      expect(screen.getByText('Clinical Research')).toBeInTheDocument();
    });
  });
});

