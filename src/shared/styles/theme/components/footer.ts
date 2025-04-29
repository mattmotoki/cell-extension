/**
 * src/shared/styles/theme/components/footer.ts
 * 
 * Defines styling for the Footer component.
 * Includes dimensions, spacing, and typography for the application footer.
 */

import colors from '../colors';
import typography from '../typography';
import layout from './layout';

// Base footer styling
export const footer = {
  container: {
    width: '100%',
    height: layout.sizing.footer.height,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: layout.padding.md,
  },
  
  // Text styling
  text: {
    fontSize: typography.fontSize.xs.vh,
    fontFamily: typography.fontFamily.main,
    color: colors.text.secondary,
    marginHorizontal: layout.spacing.sm,
  },
  
  // Divider between text elements
  divider: {
    fontSize: typography.fontSize.xs.vh,
    color: colors.text.secondary,
  },
  
  // For mobile platforms
  mobileOverrides: {
    paddingBottom: 10, // Additional padding for mobile devices
  }
};

// Export all footer styles
const footerStyles = {
  footer,
};

export default footerStyles; 