/**
 * Unit Tests for CapabilitiesTab Component
 * Sprint 2 - Agent Creator Refactoring
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import './setup'; // Import test setup and mocks - will resolve to setup.tsx
import { CapabilitiesTab } from '../CapabilitiesTab';
import type { AgentFormData } from '../types';

describe('CapabilitiesTab', () => {
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
    capabilities: ['Regulatory Guidance', 'Clinical Research'],
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

  const mockPredefinedCapabilities = [
    'Regulatory Guidance',
    'Clinical Research',
    'Market Access',
    'Technical Architecture',
  ];

  const mockSetNewCapability = jest.fn();
  const mockSetFormData = jest.fn();
  const mockHandleCapabilityAdd = jest.fn();
  const mockHandleCapabilityRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the CapabilitiesTab component', () => {
      render(
        <CapabilitiesTab
          formData={mockFormData}
          newCapability=""
          predefinedCapabilities={mockPredefinedCapabilities}
          setNewCapability={mockSetNewCapability}
          setFormData={mockSetFormData}
          handleCapabilityAdd={mockHandleCapabilityAdd}
          handleCapabilityRemove={mockHandleCapabilityRemove}
        />
      );

      expect(screen.getByText('Capabilities')).toBeInTheDocument();
    });

    it('should render the capability input field', () => {
      render(
        <CapabilitiesTab
          formData={mockFormData}
          newCapability=""
          predefinedCapabilities={mockPredefinedCapabilities}
          setNewCapability={mockSetNewCapability}
          setFormData={mockSetFormData}
          handleCapabilityAdd={mockHandleCapabilityAdd}
          handleCapabilityRemove={mockHandleCapabilityRemove}
        />
      );

      const input = screen.getByPlaceholderText('Enter a capability');
      expect(input).toBeInTheDocument();
    });

    it('should render predefined capability buttons', () => {
      render(
        <CapabilitiesTab
          formData={mockFormData}
          newCapability=""
          predefinedCapabilities={mockPredefinedCapabilities}
          setNewCapability={mockSetNewCapability}
          setFormData={mockSetFormData}
          handleCapabilityAdd={mockHandleCapabilityAdd}
          handleCapabilityRemove={mockHandleCapabilityRemove}
        />
      );

      mockPredefinedCapabilities.forEach((capability) => {
        expect(screen.getByText(capability)).toBeInTheDocument();
      });
    });

    it('should render selected capabilities', () => {
      render(
        <CapabilitiesTab
          formData={mockFormData}
          newCapability=""
          predefinedCapabilities={mockPredefinedCapabilities}
          setNewCapability={mockSetNewCapability}
          setFormData={mockSetFormData}
          handleCapabilityAdd={mockHandleCapabilityAdd}
          handleCapabilityRemove={mockHandleCapabilityRemove}
        />
      );

      // Check for selected capabilities
      const selectedSection = screen.getByText('Selected Capabilities');
      expect(selectedSection).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call setNewCapability when typing in input', () => {
      render(
        <CapabilitiesTab
          formData={mockFormData}
          newCapability=""
          predefinedCapabilities={mockPredefinedCapabilities}
          setNewCapability={mockSetNewCapability}
          setFormData={mockSetFormData}
          handleCapabilityAdd={mockHandleCapabilityAdd}
          handleCapabilityRemove={mockHandleCapabilityRemove}
        />
      );

      const input = screen.getByPlaceholderText('Enter a capability');
      fireEvent.change(input, { target: { value: 'Custom Capability' } });

      expect(mockSetNewCapability).toHaveBeenCalledWith('Custom Capability');
    });

    it('should call handleCapabilityAdd when clicking add button', () => {
      render(
        <CapabilitiesTab
          formData={mockFormData}
          newCapability="Custom Capability"
          predefinedCapabilities={mockPredefinedCapabilities}
          setNewCapability={mockSetNewCapability}
          setFormData={mockSetFormData}
          handleCapabilityAdd={mockHandleCapabilityAdd}
          handleCapabilityRemove={mockHandleCapabilityRemove}
        />
      );

      const addButton = screen.getAllByRole('button')[0]; // First button is the + button
      fireEvent.click(addButton);

      expect(mockHandleCapabilityAdd).toHaveBeenCalledWith('Custom Capability');
    });

    it('should call handleCapabilityAdd when pressing Enter in input', () => {
      render(
        <CapabilitiesTab
          formData={mockFormData}
          newCapability="Custom Capability"
          predefinedCapabilities={mockPredefinedCapabilities}
          setNewCapability={mockSetNewCapability}
          setFormData={mockSetFormData}
          handleCapabilityAdd={mockHandleCapabilityAdd}
          handleCapabilityRemove={mockHandleCapabilityRemove}
        />
      );

      const input = screen.getByPlaceholderText('Enter a capability');
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      expect(mockHandleCapabilityAdd).toHaveBeenCalledWith('Custom Capability');
    });

    it('should call handleCapabilityAdd when clicking predefined capability', () => {
      render(
        <CapabilitiesTab
          formData={mockFormData}
          newCapability=""
          predefinedCapabilities={mockPredefinedCapabilities}
          setNewCapability={mockSetNewCapability}
          setFormData={mockSetFormData}
          handleCapabilityAdd={mockHandleCapabilityAdd}
          handleCapabilityRemove={mockHandleCapabilityRemove}
        />
      );

      const marketAccessButton = screen.getByText('Market Access');
      fireEvent.click(marketAccessButton);

      expect(mockHandleCapabilityAdd).toHaveBeenCalledWith('Market Access');
    });

    it('should disable add button when newCapability is empty', () => {
      render(
        <CapabilitiesTab
          formData={mockFormData}
          newCapability=""
          predefinedCapabilities={mockPredefinedCapabilities}
          setNewCapability={mockSetNewCapability}
          setFormData={mockSetFormData}
          handleCapabilityAdd={mockHandleCapabilityAdd}
          handleCapabilityRemove={mockHandleCapabilityRemove}
        />
      );

      const addButton = screen.getAllByRole('button')[0];
      expect(addButton).toBeDisabled();
    });

    it('should disable predefined capability button if already selected', () => {
      render(
        <CapabilitiesTab
          formData={mockFormData}
          newCapability=""
          predefinedCapabilities={mockPredefinedCapabilities}
          setNewCapability={mockSetNewCapability}
          setFormData={mockSetFormData}
          handleCapabilityAdd={mockHandleCapabilityAdd}
          handleCapabilityRemove={mockHandleCapabilityRemove}
        />
      );

      // 'Regulatory Guidance' is already in mockFormData.capabilities
      const regulatoryButton = screen.getByText('Regulatory Guidance');
      expect(regulatoryButton).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should render correctly with no selected capabilities', () => {
      const emptyFormData = { ...mockFormData, capabilities: [] };

      render(
        <CapabilitiesTab
          formData={emptyFormData}
          newCapability=""
          predefinedCapabilities={mockPredefinedCapabilities}
          setNewCapability={mockSetNewCapability}
          setFormData={mockSetFormData}
          handleCapabilityAdd={mockHandleCapabilityAdd}
          handleCapabilityRemove={mockHandleCapabilityRemove}
        />
      );

      expect(screen.getByText('Selected Capabilities')).toBeInTheDocument();
    });

    it('should render correctly with empty predefined capabilities', () => {
      render(
        <CapabilitiesTab
          formData={mockFormData}
          newCapability=""
          predefinedCapabilities={[]}
          setNewCapability={mockSetNewCapability}
          setFormData={mockSetFormData}
          handleCapabilityAdd={mockHandleCapabilityAdd}
          handleCapabilityRemove={mockHandleCapabilityRemove}
        />
      );

      expect(screen.getByText('Predefined Capabilities')).toBeInTheDocument();
    });

    it('should handle many selected capabilities', () => {
      const manyCapabilities = Array.from({ length: 20 }, (_, i) => `Capability ${i + 1}`);
      const formDataWithMany = { ...mockFormData, capabilities: manyCapabilities };

      render(
        <CapabilitiesTab
          formData={formDataWithMany}
          newCapability=""
          predefinedCapabilities={mockPredefinedCapabilities}
          setNewCapability={mockSetNewCapability}
          setFormData={mockSetFormData}
          handleCapabilityAdd={mockHandleCapabilityAdd}
          handleCapabilityRemove={mockHandleCapabilityRemove}
        />
      );

      expect(screen.getByText('Capability 1')).toBeInTheDocument();
      expect(screen.getByText('Capability 20')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for input field', () => {
      render(
        <CapabilitiesTab
          formData={mockFormData}
          newCapability=""
          predefinedCapabilities={mockPredefinedCapabilities}
          setNewCapability={mockSetNewCapability}
          setFormData={mockSetFormData}
          handleCapabilityAdd={mockHandleCapabilityAdd}
          handleCapabilityRemove={mockHandleCapabilityRemove}
        />
      );

      expect(screen.getByText('Add Capability')).toBeInTheDocument();
    });

    it('should have proper button types', () => {
      render(
        <CapabilitiesTab
          formData={mockFormData}
          newCapability="Test"
          predefinedCapabilities={mockPredefinedCapabilities}
          setNewCapability={mockSetNewCapability}
          setFormData={mockSetFormData}
          handleCapabilityAdd={mockHandleCapabilityAdd}
          handleCapabilityRemove={mockHandleCapabilityRemove}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });
});

