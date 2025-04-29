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
    boxShadow: `0 4px 8px ${colors.states.shadow}`,
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
  },
  
  label: {
    fontSize: typography.fontSize.medium.vh,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: layout.spacing.sm,
  },
  
  // Dropdown/picker styling
  picker: {
    container: {
      backgroundColor: colors.background.input,
      borderRadius: layout.borderRadius.medium,
      padding: layout.padding.xs,
      marginTop: layout.spacing.xs,
    },
    
    control: {
      height: '50px',
      width: '100%',
      color: colors.text.primary,
    },
    
    item: {
      fontSize: typography.fontSize.small.vh,
      color: colors.text.primary,
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
  },
  
  button: {
    width: '80%',
    backgroundColor: 'transparent',
    borderWidth: '1px',
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
    fontWeight: typography.fontWeight.medium,
  },
};

// Export all gameSettingsPanel styles
const gameSettingsPanelStyles = {
  panel,
  settingItem,
  closeButton,
};

export default gameSettingsPanelStyles; 