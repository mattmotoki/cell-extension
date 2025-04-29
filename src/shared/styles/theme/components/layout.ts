/**
 * src/shared/styles/theme/components/layout.ts
 * 
 * Defines layout-related constants and measurements for use across platforms.
 * Includes spacing, sizes, and responsive breakpoints.
 */

// Layout constants from CSS variables
export const sizing = {
  navbar: {
    height: '8vh',
  },
  scoreChart: {
    height: '25vh',
  },
  gameControls: {
    height: '6vh',
  },
  board: {
    height: '50vh',
  },
  scores: {
    height: '6vh',
  },
  footer: {
    height: '5vh',
  },
};

// Container aspect ratio
export const containerAspectRatio = {
  width: 9,
  height: 16, // Portrait-focused layout with 9:16 aspect ratio
};

// Spacing units for consistent margins/padding
export const spacing = {
  xs: '0.3em',
  sm: '0.5em',
  md: '1em',
  lg: '1.5em',
  xl: '2em',
  xxl: '3em',
};

// Padding percentages
export const padding = {
  xs: '2%',
  sm: '3%',
  md: '5%',
  lg: '8%',
  xl: '10%',
};

// Border radius
export const borderRadius = {
  small: '4px',
  medium: '6px',
  large: '12px',
  full: '9999px',
};

// Z-index values
export const zIndex = {
  base: 1,
  navbar: 100,
  settingsPanel: 99,
  settingsMenu: 101,
  modal: 200,
};

// Responsive breakpoints (for platforms that use media queries)
export const breakpoints = {
  xs: '320px',
  sm: '480px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
};

// Shadows
export const shadows = {
  small: '0 2px 5px rgba(0, 0, 0, 0.2)',
  medium: '0 4px 8px rgba(0, 0, 0, 0.2)',
  large: '0 0 20px rgba(0, 0, 0, 0.5)',
};

// Export all layout values
const layout = {
  sizing,
  containerAspectRatio,
  spacing,
  padding,
  borderRadius,
  zIndex,
  breakpoints,
  shadows,
};

export default layout; 