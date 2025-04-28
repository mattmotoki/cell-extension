/**
 * src/shared/styles/theme/index.ts
 * 
 * Main theme export file that consolidates all theme components
 * into a unified theme object for cross-platform consumption.
 */

import colors from './colors';
import typography from './typography';
import buttons from './components/buttons';
import layout from './components/layout';
import inputs from './components/inputs';

/**
 * The theme object containing all styling information for the application.
 * This is the main export used by platform-specific style implementations.
 */
const theme = {
  colors,
  typography,
  buttons,
  layout,
  inputs,
};

// Primary theme export
export default theme;

// Named exports for more granular imports when needed
export {
  colors,
  typography,
  buttons,
  layout,
  inputs,
};

// Type definition for the theme (useful for TypeScript)
export type Theme = typeof theme; 