/**
 * src/platforms/web/styles/index.ts
 * 
 * Export platform-specific styles for web implementation.
 * This provides a structured way to import all necessary styles.
 */

// Import theme from shared styles
import theme from '@shared/styles/theme';

// Re-export the theme 
export { theme };

// Import global CSS - side effect only, doesn't export anything
import './global.css';

/**
 * Function to apply theme values to CSS variables
 * This can be called on app initialization to ensure CSS variables 
 * match the current theme in shared/styles/theme
 */
export function applyThemeToCSS(): void {
  const { colors, typography, layout } = theme;
  
  // Set CSS variables based on theme tokens
  document.documentElement.style.setProperty('--primary-color', colors.primary);
  document.documentElement.style.setProperty('--secondary-color', colors.secondary);
  document.documentElement.style.setProperty('--success-color', colors.success);
  document.documentElement.style.setProperty('--info-color', colors.info);
  document.documentElement.style.setProperty('--light-color', colors.light);
  document.documentElement.style.setProperty('--dark-color', colors.dark);
  
  // Background colors
  document.documentElement.style.setProperty('--bg-color', colors.background.primary);
  document.documentElement.style.setProperty('--card-bg', colors.background.card);
  document.documentElement.style.setProperty('--board-bg', colors.background.board);
  document.documentElement.style.setProperty('--input-bg', colors.background.input);
  document.documentElement.style.setProperty('--navbar-bg', colors.background.navbar);
  
  // Text colors
  document.documentElement.style.setProperty('--text-color', colors.text.primary);
  document.documentElement.style.setProperty('--border-color', colors.border);
  
  // Typography
  document.documentElement.style.setProperty('--font-main', typography.fontFamily.main);
  document.documentElement.style.setProperty('--font-size-large', typography.fontSize.large.vh);
  document.documentElement.style.setProperty('--font-size-medium', typography.fontSize.medium.vh);
  document.documentElement.style.setProperty('--font-size-small', typography.fontSize.small.vh);
  document.documentElement.style.setProperty('--font-size-xs', typography.fontSize.xs.vh);
  
  // Layout
  document.documentElement.style.setProperty('--navbar-height', layout.sizing.navbar.height);
  document.documentElement.style.setProperty('--score-chart-height', layout.sizing.scoreChart.height);
  document.documentElement.style.setProperty('--game-controls-height', layout.sizing.gameControls.height);
  document.documentElement.style.setProperty('--board-height', layout.sizing.board.height);
  document.documentElement.style.setProperty('--scores-ui-height', layout.sizing.scores.height);
  document.documentElement.style.setProperty('--footer-height', layout.sizing.footer.height);
} 