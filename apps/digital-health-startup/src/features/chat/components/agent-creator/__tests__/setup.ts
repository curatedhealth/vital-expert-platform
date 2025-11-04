/**
 * Jest Setup for Agent Creator Tests
 * Mocks for external dependencies
 */

// Mock @vital/ui/lib/utils
jest.mock('@vital/ui/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

// Mock @/lib/utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

// Mock @vital/ui components
jest.mock('@vital/ui', () => ({
  Badge: ({ children, ...props }: any) => <div data-testid="badge" {...props}>{children}</div>,
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 data-testid="card-title" {...props}>{children}</h3>,
  Input: (props: any) => <input {...props} />,
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Plus: () => <span data-testid="plus-icon">+</span>,
  X: () => <span data-testid="x-icon">×</span>,
  Brain: () => <span data-testid="brain-icon">🧠</span>,
  Zap: () => <span data-testid="zap-icon">⚡</span>,
  CheckCircle: () => <span data-testid="check-icon">✓</span>,
  Wrench: () => <span data-testid="wrench-icon">🔧</span>,
}));

export {};

