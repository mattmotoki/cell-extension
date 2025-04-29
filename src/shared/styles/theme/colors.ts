/**
 * src/shared/styles/theme/colors.ts
 * 
 * Defines the color palette for the application.
 * All color values are centralized here for consistency across platforms.
 */

// Primary colors
export const primary = '#6c84ff';
export const secondary = '#8293a7';
export const success = '#3cbb62';
export const info = '#17a2b8';

// Base colors
export const light = '#f8f9fa';
export const dark = '#121212';

// Dark theme colors (currently the default)
export const background = {
  primary: '#444444',
  card: 'rgba(40, 40, 40, 0.8)',
  board: '#1e1e1e',
  input: '#2a2a2a',
  navbar: 'rgba(30, 30, 30, 0.9)',
};

export const text = {
  primary: '#f0f0f0',
  secondary: '#8293a7',
};

export const border = '#444444';

// Hover/active state colors
export const states = {
  primaryHover: '#3a5eff',
  shadow: 'rgba(0, 0, 0, 0.2)',
  textShadow: 'rgba(0, 0, 0, 0.3)',
};

// Player colors
export const players = {
  player1: '#00FF00', // Green
  player2: '#1E90FF', // Blue
};

// Export all colors as a single object for easier theme consumption
const colors = {
  primary,
  secondary,
  success,
  info,
  light,
  dark,
  background,
  text,
  border,
  states,
  players,
};

export default colors; 