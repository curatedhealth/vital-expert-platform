/**
 * Jest Setup for Agent Creator Tests
 * Simplified mocks for UI components and icons
 */

import React from 'react';

// Mock @vital/ui components
jest.mock('@vital/ui', () => ({
  Badge: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'badge', ...props }, children),
  Button: ({ children, ...props }: any) => React.createElement('button', props, children),
  Card: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'card', ...props }, children),
  CardContent: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'card-content', ...props }, children),
  CardHeader: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'card-header', ...props }, children),
  CardTitle: ({ children, ...props }: any) => React.createElement('h3', { 'data-testid': 'card-title', ...props }, children),
  Input: (props: any) => React.createElement('input', props),
  Label: ({ children, ...props }: any) => React.createElement('label', props, children),
}));

// Mock lucide-react icons (simpler)
jest.mock('lucide-react', () => ({
  Plus: () => React.createElement('span', { 'data-testid': 'plus-icon' }, '+'),
  X: () => React.createElement('span', { 'data-testid': 'x-icon' }, 'x'),
  Brain: () => React.createElement('span', { 'data-testid': 'brain-icon' }, 'brain'),
  Zap: () => React.createElement('span', { 'data-testid': 'zap-icon' }, 'zap'),
  CheckCircle: () => React.createElement('span', { 'data-testid': 'check-icon' }, 'check'),
  Wrench: () => React.createElement('span', { 'data-testid': 'wrench-icon' }, 'wrench'),
}));

export {};
