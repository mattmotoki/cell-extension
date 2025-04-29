/**
 * src/platforms/mobile/components/Footer.tsx - Mobile Platform Footer
 * 
 * Mobile-specific implementation of the Footer component that uses the shared
 * cross-platform Footer component with React Native.
 * 
 * This component serves as a thin wrapper around the shared component,
 * providing any mobile-specific customizations if needed.
 */

import React from 'react';
import SharedFooter from '@shared/components/Footer';
import { StyleSheet } from 'react-native';

// For mobile, we might want to add some additional styling or behavior
const MobileFooter: React.FC = () => {
  return (
    <SharedFooter style={styles.mobileFooter} />
  );
};

const styles = StyleSheet.create({
  mobileFooter: {
    // Mobile-specific styling overrides
    paddingBottom: 10, // Add extra padding for mobile devices
  }
});

export default MobileFooter; 