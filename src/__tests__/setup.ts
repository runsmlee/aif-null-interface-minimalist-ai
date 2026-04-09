// Ensure React development mode is active for `act()` support in React 19
// Must run before any React imports
if (process.env.NODE_ENV !== 'development') {
  process.env.NODE_ENV = 'development';
}

import '@testing-library/jest-dom';
