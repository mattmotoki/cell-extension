/**
 * src/platforms/mobile/components/GameControls.tsx - Mobile Game Controls
 * 
 * Mobile-specific implementation of the GameControls component that uses the shared
 * cross-platform component with React Native.
 * 
 * This component serves as a thin wrapper around the shared component,
 * providing any mobile-specific customizations if needed.
 */

import React from 'react';
import SharedGameControls from '@shared/components/GameControls';
import { StyleSheet } from 'react-native';

interface GameControlsProps {
  onUndo: () => void;
  onReset: () => void;
  isUndoDisabled: boolean;
}

const MobileGameControls: React.FC<GameControlsProps> = (props) => {
  return (
    <SharedGameControls 
      {...props} 
      style={styles.mobileControls} 
    />
  );
};

const styles = StyleSheet.create({
  mobileControls: {
    // Mobile-specific styling overrides
    paddingBottom: 10, // Extra padding for mobile devices
  }
});

export default MobileGameControls; 