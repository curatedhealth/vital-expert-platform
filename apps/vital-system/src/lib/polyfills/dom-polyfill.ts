/**
 * Minimal DOM polyfill for server environments.
 * Prevents SSR-only bundles from crashing when they access `document` or `window`.
 */

if (typeof document === 'undefined') {
  const noop = () => {};

  const fakeClassList = {
    add: noop,
    remove: noop,
    toggle: noop,
    contains: () => false,
  };

  const fakeElement = () => ({
    style: {},
    classList: fakeClassList,
    setAttribute: noop,
    removeAttribute: noop,
    appendChild: noop,
    removeChild: noop,
    addEventListener: noop,
    removeEventListener: noop,
    querySelector: () => null,
    querySelectorAll: () => [],
    focus: noop,
    blur: noop,
    textContent: '',
  });

  const fakeDocument: any = {
    createElement: fakeElement,
    createElementNS: fakeElement,
    createTextNode: (text: string) => ({
      textContent: text,
      nodeValue: text,
      data: text,
    }),
    getElementById: () => null,
    getElementsByClassName: () => [],
    getElementsByTagName: () => [],
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => false,
    readyState: 'complete',
    body: {
      appendChild: noop,
      removeChild: noop,
      classList: fakeClassList,
    },
    documentElement: {
      style: {},
      classList: fakeClassList,
    },
    defaultView: globalThis,
  };

  const fakeWindow: any = (globalThis as any).window || {};
  fakeWindow.document = fakeDocument;
  fakeWindow.addEventListener = fakeWindow.addEventListener || noop;
  fakeWindow.removeEventListener = fakeWindow.removeEventListener || noop;

  (globalThis as any).document = fakeDocument;
  (globalThis as any).window = fakeWindow;

  const navValue = { userAgent: 'node' };

  const setNavigator = () => {
    const tryDefine = (descriptor: PropertyDescriptor) => {
      try {
        Object.defineProperty(globalThis, 'navigator', descriptor);
        return true;
      } catch {
        return false;
      }
    };

    try {
      if (typeof (globalThis as any).navigator === 'undefined' || (globalThis as any).navigator === null) {
        (globalThis as any).navigator = navValue;
      }
    } catch {
      const desc = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
      if (!desc || desc.configurable) {
        if (!tryDefine({ value: navValue, configurable: true, writable: true })) {
          tryDefine({
            configurable: true,
            get: () => navValue,
          });
        }
      }
    }
  };

  setNavigator();
  if (typeof fakeWindow.navigator === 'undefined') {
    fakeWindow.navigator = (globalThis as any).navigator || navValue;
  }

  class FakeMutationObserver {
    constructor(_callback: MutationCallback) {}
    observe() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }

  (globalThis as any).MutationObserver =
    (globalThis as any).MutationObserver || FakeMutationObserver;
  fakeWindow.MutationObserver =
    fakeWindow.MutationObserver || FakeMutationObserver;
}

export {};
