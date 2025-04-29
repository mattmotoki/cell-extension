/**
 * src/shared/styles/theme/components/navbar.ts
 * 
 * Defines styling for the Navbar component.
 * Includes dimensions, colors, and animation properties for the navigation bar
 * and its hamburger menu button.
 */

import colors from '../colors';
import typography from '../typography';
import layout from './layout';

// Base navbar styling
export const navbar = {
  container: {
    height: layout.sizing.navbar.height,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: '5%',
    zIndex: layout.zIndex.navbar,
  },
  
  // Logo and title area
  logo: {
    width: '1.5rem',
    height: '1.5rem',
  },
  
  logoContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '0.75rem',
  },
  
  title: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
    fontSize: typography.fontSize.xlarge.vh,
    letterSpacing: typography.letterSpacing.wide,
    textShadow: `0 1px 3px ${colors.states.textShadow}`,
  },
};

// Hamburger menu button styling
export const menuButton = {
  container: {
    width: '24px',
    height: '18px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    cursor: 'pointer',
    zIndex: layout.zIndex.settingsMenu,
  },
  
  line: {
    height: '2px',
    width: '100%',
    backgroundColor: colors.primary,
    transition: 'all 0.3s',
  },
  
  // Active state animations for the hamburger menu
  activeState: {
    line1: {
      transform: 'translateY(8px) rotate(45deg)',
    },
    line2: {
      opacity: 0,
    },
    line3: {
      transform: 'translateY(-8px) rotate(-45deg)',
    },
  },
};

// Export all navbar styles
const navbarStyles = {
  navbar,
  menuButton,
};

export default navbarStyles; 