// Ensure React development mode is active for `act()` support in React 19
// Must run before any React imports
if (process.env.NODE_ENV !== 'development') {
  process.env.NODE_ENV = 'development';
}

import '@testing-library/jest-dom';

// Mock window.matchMedia for jsdom (used by useReducedMotion hook)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
