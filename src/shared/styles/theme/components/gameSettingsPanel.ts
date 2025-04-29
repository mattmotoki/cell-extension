/**
 * src/shared/styles/theme/components/gameSettingsPanel.ts
 * 
 * Defines styling for the GameSettingsPanel component.
 * Includes styling for the panel itself, settings controls, and animations.
 */

import colors from '../colors';
import typography from '../typography';
import layout from './layout';

// Panel container styling
export const panel = {
  base: {
    position: 'absolute',
    top: layout.sizing.navbar.height,
    left: 0,
    width: '100%',
    height: `calc(100% - ${layout.sizing.navbar.height})`,
    backgroundColor: colors.background.card,
    zIndex: layout.zIndex.settingsPanel,
    boxShadow: `0 6px 12px ${colors.states.shadow}`,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  
  // Animation properties
  animation: {
    duration: '0.3s',
    timingFunction: 'ease',
    properties: ['opacity', 'transform'],
  },
};

// Setting item styling
export const settingItem = {
  container: {
    padding: layout.padding.md,
    marginBottom: layout.spacing.md,
    borderBottom: `1px solid ${colors.border}`,
  },
  
  label: {
    fontSize: typography.fontSize.medium.vh,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: layout.spacing.sm,
    textShadow: `0 1px 2px ${colors.states.textShadow}`,
  },
  
  // Dropdown/picker styling
  picker: {
    container: {
      backgroundColor: colors.background.input,
      borderRadius: layout.borderRadius.medium,
      padding: layout.padding.xs,
      marginTop: layout.spacing.xs,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: colors.border,
    },
    
    control: {
      height: '50px',
      width: '100%',
      color: colors.text.primary,
      fontSize: typography.fontSize.medium.vh,
    },
    
    item: {
      fontSize: typography.fontSize.medium.vh,
      color: colors.text.primary,
      padding: layout.padding.xs,
    },
  },
};

// Close button styling
export const closeButton = {
  container: {
    padding: layout.padding.md,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: layout.padding.lg,
  },
  
  button: {
    width: '80%',
    backgroundColor: 'transparent',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: colors.primary,
    borderRadius: layout.borderRadius.small,
    padding: layout.padding.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  text: {
    color: colors.primary,
    fontSize: typography.fontSize.medium.vh,
    fontWeight: typography.fontWeight.bold,
    textShadow: `0 1px 2px ${colors.states.textShadow}`,
  },
};

// Export all gameSettingsPanel styles
const gameSettingsPanelStyles = {
  panel,
  settingItem,
  closeButton,
};

export default gameSettingsPanelStyles; 