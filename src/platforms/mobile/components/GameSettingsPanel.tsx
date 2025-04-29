/**
 * src/platforms/mobile/components/GameSettingsPanel.tsx - Mobile Game Settings Panel
 * 
 * Mobile-specific implementation of the GameSettingsPanel component that uses the shared
 * cross-platform component with React Native.
 * 
 * This component serves as a thin wrapper around the shared component,
 * providing any mobile-specific customizations if needed.
 */

import React from 'react';
import SharedGameSettingsPanel from '@shared/components/GameSettingsPanel';
import { StyleSheet } from 'react-native';
import { GameSettings } from '@core';

interface GameSettingsPanelProps {
  settings: GameSettings;
  onChange: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  isPanelOpen: boolean;
  onClose: () => void;
}

const MobileGameSettingsPanel: React.FC<GameSettingsPanelProps> = (props) => {
  return (
    <SharedGameSettingsPanel 
      {...props} 
      style={styles.mobilePanel} 
    />
  );
};

const styles = StyleSheet.create({
  mobilePanel: {
    // Mobile-specific styling overrides
    paddingTop: 10, // Extra padding for mobile devices
  }
});

export default MobileGameSettingsPanel; 