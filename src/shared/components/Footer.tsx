/**
 * src/shared/components/Footer.tsx - Cross-Platform Footer Component
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
import { useTheme } from '@shared/styles/theme';
import type { RootState } from '@core';

interface FooterProps {
  // Optional additional styles
  style?: object;
}

const Footer: React.FC<FooterProps> = ({ style }) => {
  // Get scoring mechanism from Redux store
  const scoringMechanism = useSelector((state: RootState) => state.settings.scoringMechanism);
  const theme = useTheme();
  
  // Format the scoring mechanism for display
  const scoringDescription = scoringMechanism.replace('cell-','').replace('-', ' ');
  
  const currentYear = new Date().getFullYear();
  
  return (
    <View style={[styles.container, { 
      backgroundColor: theme.colors.background,
      borderTopColor: theme.colors.divider
    }, style]}>
      <Text style={[styles.text, { color: theme.colors.textSecondary }]}>© {currentYear} Cellmata</Text>
      <Text style={[styles.divider, { color: theme.colors.textSecondary }]}> • </Text>
      <Text style={[styles.text, { color: theme.colors.textSecondary }]}>Scoring: {scoringDescription}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  text: {
    fontSize: 12,
    marginHorizontal: 8,
  },
  divider: {
    fontSize: 12,
  }
});

export default Footer; 