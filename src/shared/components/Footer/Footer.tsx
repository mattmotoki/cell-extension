/**
 * src/shared/components/Footer/Footer.tsx - Cross-Platform Footer Component
 * 
 * A shared React Native component that renders the application footer with
 * version information, copyright notice, and displays the current scoring mechanism.
 * Can be used across web and mobile platforms without modification.
 * 
 * Uses:
 * - React Native components for cross-platform compatibility
 * - Shared theme tokens for consistent styling
 * - Redux for accessing app state
 * 
 * Note: Requires react-native-web to be installed for web platforms
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import theme from '@shared/styles/theme';
import type { RootState } from '@core';

interface FooterProps {
  // Optional additional styles
  style?: object;
}

const Footer: React.FC<FooterProps> = ({ style }) => {
  // Get scoring mechanism from Redux store
  const scoringMechanism = useSelector((state: RootState) => state.settings.scoringMechanism);
  
  // Format the scoring mechanism for display
  const scoringDescription = scoringMechanism.replace('cell-','').replace('-', ' ');
  
  const currentYear = new Date().getFullYear();
  
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>© {currentYear} Cellmata</Text>
      <Text style={styles.divider}> • </Text>
      <Text style={styles.text}>Scoring: {scoringDescription}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: theme.layout.sizing.footer.height,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.layout.padding.md,
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  text: {
    fontSize: parseInt(theme.typography.fontSize.xs.px), // Convert from string to number
    fontFamily: theme.typography.fontFamily.main,
    color: theme.colors.text.secondary,
    marginHorizontal: parseInt(theme.layout.spacing.sm),
  },
  divider: {
    fontSize: parseInt(theme.typography.fontSize.xs.px),
    color: theme.colors.text.secondary,
  }
});

export default Footer; 