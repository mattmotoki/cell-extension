/**
 * src/shared/styles/theme/index.ts
 * 
 * Main theme export file that consolidates all theme components
 * into a unified theme object for cross-platform consumption.
 */

import { useContext, createContext } from 'react';
import colors from './colors';
import typography from './typography';
import buttons from './components/buttons';
import layout from './components/layout';
import inputs from './components/inputs';
import navbar from './components/navbar';
import footer from './components/footer';
import gameControls from './components/gameControls';

// Theme interface defining all available theme properties
export interface ThemeInterface {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surfacePrimary: string;
    surfaceSecondary: string;
    textPrimary: string;
    textSecondary: string;
    textInverse: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    divider: string;
    light: string; // White color for light text/elements
    dark: string;  // Dark color for dark text/elements
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    pill: number;
  };
  typography: {
    fontFamily: string;
    fontSizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    fontWeights: {
      normal: string;
      medium: string;
      bold: string;
    };
  };
}

// Light theme
export const lightTheme: ThemeInterface = {
  colors: {
    primary: '#6c84ff',
    secondary: '#8293a7',
    background: '#F0F2F5',
    surfacePrimary: '#FFFFFF',
    surfaceSecondary: '#F7F7F7',
    textPrimary: '#222222',
    textSecondary: '#6F6F6F',
    textInverse: '#FFFFFF',
    accent: '#FF9F1C',
    success: '#3cbb62',
    warning: '#FFB81C',
    error: '#E63946',
    divider: '#E0E0E0',
    light: '#f8f9fa', // From colors.light
    dark: '#121212',  // From colors.dark
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    pill: 9999,
  },
  typography: {
    fontFamily: 'System',
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      bold: '700',
    }
  }
};

// Dark theme (default)
export const darkTheme: ThemeInterface = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#6c84ff',
    secondary: '#8293a7',
    background: '#444444',
    surfacePrimary: '#1e1e1e',
    surfaceSecondary: '#2a2a2a',
    textPrimary: '#f0f0f0',
    textSecondary: '#8293a7',
    textInverse: '#222222',
    divider: '#444444',
    light: '#f8f9fa', // Keep light as white in both themes
    dark: '#121212',  // Keep dark as black in both themes
  },
};

// Create React context for the theme
const ThemeContext = createContext<ThemeInterface>(darkTheme);

// Theme provider interface
export interface ThemeProviderProps {
  theme: ThemeInterface;
  children: React.ReactNode;
}

// Hook to access the current theme
export const useTheme = (): ThemeInterface => {
  return useContext(ThemeContext);
};

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
  navbar,
  footer,
  gameControls,
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
  navbar,
  footer,
  gameControls,
  ThemeContext
};

// Type definition for the theme (useful for TypeScript)
export type Theme = typeof theme; 