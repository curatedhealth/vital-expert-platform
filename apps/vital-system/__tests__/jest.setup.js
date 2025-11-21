// Jest DOM matchers
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

// Mock Next.js navigation (App Router)
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn(),
        list: jest.fn(),
        getPublicUrl: jest.fn(),
      })),
    },
  })),
}));

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    form: ({ children, ...props }) => <form {...props}>{children}</form>,
    input: ({ children, ...props }) => <input {...props}>{children}</input>,
    textarea: ({ children, ...props }) => <textarea {...props}>{children}</textarea>,
    select: ({ children, ...props }) => <select {...props}>{children}</select>,
    img: ({ children, ...props }) => <img {...props}>{children}</img>,
    svg: ({ children, ...props }) => <svg {...props}>{children}</svg>,
    path: ({ children, ...props }) => <path {...props}>{children}</path>,
    circle: ({ children, ...props }) => <circle {...props}>{children}</circle>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
  useMotionValue: jest.fn(),
  useTransform: jest.fn(),
  useSpring: jest.fn(),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => {
  const mockIcon = ({ className, ...props }) => (
    <svg className={className} {...props} data-testid="lucide-icon">
      <title>Mock Icon</title>
    </svg>
  );

  return new Proxy({}, {
    get: () => mockIcon,
  });
});

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.fetch for API testing
global.fetch = jest.fn();

// Healthcare-specific test utilities
global.testUtils = {
  // Mock medical data generators
  generateMockPatientData: () => ({
    id: 'patient-123',
    name: 'Test Patient',
    age: 45,
    medicalRecordNumber: 'MRN-123456',
    // Add more mock data as needed
  }),

  // Mock clinical validation responses
  mockClinicalValidation: (isValid = true) => ({
    isValid,
    confidence: isValid ? 0.95 : 0.45,
    validationFramework: 'PHARMA',
    timestamp: new Date().toISOString(),
  }),

  // Mock HIPAA compliance data
  mockHIPAACompliantData: () => ({
    encryptedPHI: true,
    auditTrail: true,
    accessControls: true,
    dataMinimization: true,
  }),
};

// Set up console warnings/errors as test failures for healthcare safety
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  originalConsoleError(...args);
  throw new Error(`Console error: ${args.join(' ')}`);
};

console.warn = (...args) => {
  // Only fail on specific warnings that indicate healthcare safety issues
  const warningMessage = args.join(' ');
  if (
    warningMessage.includes('deprecated') ||
    warningMessage.includes('unsafe') ||
    warningMessage.includes('security')
  ) {
    originalConsoleWarn(...args);
    throw new Error(`Console warning (healthcare safety): ${warningMessage}`);
  }
  originalConsoleWarn(...args);
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});