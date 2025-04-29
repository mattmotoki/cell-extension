/**
 * src/shared/styles/theme/typography.ts
 * 
 * Defines typography settings for the application.
 * Includes font families, sizes, weights, and line heights.
 */

// Font families
export const fontFamily = {
  main: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

// Font sizes - uses vh units by default for responsive sizing
// For platforms that don't support vh units, use the pixel alternatives
export const fontSize = {
  xs: {
    vh: '1.2vh',
    px: '12px',
  },
  small: {
    vh: '1.5vh',
    px: '15px',
  },
  medium: {
    vh: '1.8vh',
    px: '18px',
  },
  large: {
    vh: '2.2vh',
    px: '22px',
  },
  xlarge: {
    vh: '2.4vh', // From navbar-title
    px: '24px',
  },
};

// Font weights
export const fontWeight = {
  normal: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
};

// Line heights
export const lineHeight = {
  normal: 1.6,
  tight: 1.2,
  loose: 2,
};

// Letter spacing
export const letterSpacing = {
  normal: '0',
  wide: '0.03em', // From navbar-title
};

// Text transforms
export const textTransform = {
  none: 'none',
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  capitalize: 'capitalize',
};

// Export all typography settings as a single object
const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textTransform,
};

export default typography; 