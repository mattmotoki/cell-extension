/**
 * src/shared/styles/theme/components/buttons.ts
 * 
 * Defines button styling for use across platforms.
 * Includes base button styles and variations.
 */

import colors from '../colors';
import typography from '../typography';

// Base button styles that apply to all buttons
export const baseButton = {
  backgroundColor: colors.primary,
  color: colors.text.primary,
  borderRadius: '6px',
  padding: '0.6em 1em',
  fontSize: typography.fontSize.medium,
  fontWeight: typography.fontWeight.semiBold,
  border: 'none',
  
  // Interactive states
  hover: {
    backgroundColor: colors.states.primaryHover,
    transform: 'translateY(-1px)',
    boxShadow: `0 2px 5px ${colors.states.shadow}`,
  },
  
  active: {
    transform: 'translateY(1px)',
    boxShadow: 'none',
  },
  
  // Transition properties
  transition: {
    backgroundColor: '0.3s',
    transform: '0.2s',
  },
};

// Button variants
export const buttonVariants = {
  primary: {
    ...baseButton,
  },
  
  secondary: {
    ...baseButton,
    backgroundColor: colors.secondary,
    hover: {
      ...baseButton.hover,
      backgroundColor: '#6b7a8e', // Darker version of secondary
    },
  },
  
  success: {
    ...baseButton,
    backgroundColor: colors.success,
    hover: {
      ...baseButton.hover,
      backgroundColor: '#2da652', // Darker version of success
    },
  },
  
  transparent: {
    ...baseButton,
    backgroundColor: 'transparent',
    border: `1px solid ${colors.primary}`,
    color: colors.primary,
    hover: {
      ...baseButton.hover,
      backgroundColor: 'rgba(108, 132, 255, 0.1)', // Semi-transparent primary
    },
  },
  
  // Disabled state
  disabled: {
    ...baseButton,
    backgroundColor: '#575757',
    color: '#a0a0a0',
    cursor: 'not-allowed',
    hover: {
      transform: 'none',
      boxShadow: 'none',
      backgroundColor: '#575757',
    },
    active: {
      transform: 'none',
      boxShadow: 'none',
    },
  },
};

// Button sizes
export const buttonSizes = {
  small: {
    padding: '0.4em 0.8em',
    fontSize: typography.fontSize.small,
  },
  
  medium: {
    padding: '0.6em 1em',
    fontSize: typography.fontSize.medium,
  },
  
  large: {
    padding: '0.8em 1.5em',
    fontSize: typography.fontSize.large,
  },
};

// Icon button styles
export const iconButton = {
  icon: {
    marginRight: '0.5em',
  },
};

// Export all button styles
const buttons = {
  base: baseButton,
  variants: buttonVariants,
  sizes: buttonSizes,
  icon: iconButton,
};

export default buttons; 