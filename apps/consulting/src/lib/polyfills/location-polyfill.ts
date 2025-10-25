/**
 * Location Polyfill for Server-Side Rendering
 * Provides a mock location object when running on the server
 */

if (typeof window === 'undefined') {
  // Server-side polyfill for location
  (global as any).location = {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    reload: () => {},
    replace: () => {},
    assign: () => {},
    toString: () => 'http://localhost:3000'
  };

  // Also provide window.location for compatibility
  (global as any).window = (global as any).window || {};
  (global as any).window.location = (global as any).location;
}

export {};
