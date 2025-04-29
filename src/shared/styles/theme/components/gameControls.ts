/**
 * src/shared/styles/theme/components/gameControls.ts
 * 
 * Defines styling for the GameControls component.
 * Includes dimensions, colors, and interaction states for control buttons.
 */

import colors from '../colors';
import typography from '../typography';
import layout from './layout';

// Base game controls container styling
export const container = {
  height: layout.sizing.gameControls.height,
  width: '100%',
  padding: 0,
  paddingHorizontal: layout.padding.md,
  backgroundColor: colors.background.primary,
};

// Button styling
export const button = {
  base: {
    backgroundColor: colors.primary,
    color: colors.light,
    borderRadius: layout.borderRadius.medium,
    padding: '0.6em 1em',
    fontSize: typography.fontSize.medium.vh,
    fontWeight: typography.fontWeight.semiBold,
    flex: 1,
    marginHorizontal: layout.padding.xs,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Interaction states
  states: {
    active: {
      transform: 'translateY(1px)',
      boxShadow: 'none',
    },
    
    disabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
  
  // Icon styling within button
  icon: {
    marginRight: '0.5em',
    fontSize: typography.fontSize.large.vh,
    color: colors.light,
    fontWeight: typography.fontWeight.normal,
  },
  
  // Text label within button
  text: {
    color: colors.light,
    fontWeight: typography.fontWeight.semiBold,
  },
};

// Export all game controls styles
const gameControlsStyles = {
  container,
  button,
};

export default gameControlsStyles; 