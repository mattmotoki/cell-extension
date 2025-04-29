/**
 * src/shared/components/Navbar.tsx - Cross-platform Navigation Bar
 * 
 * Shared implementation of the Navbar component using React Native components.
 * This component displays the game title and provides a responsive toggle button
 * for the settings panel, with visual feedback for active states.
 * 
 * Relationships:
 * - Controls visibility of GameSettingsPanel
 */

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@shared/styles/theme';

interface NavbarProps {
  onMenuToggle: () => void;
  isPanelOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, isPanelOpen }) => {
  const theme = useTheme();
  
  return (
    <View style={[styles.navbar, { backgroundColor: theme.colors.background }]}>
      <View style={styles.logoContainer}>
        <Image 
          source={Platform.OS === 'web' ? '/favicons/favicon-32x32.png' : require('@assets/favicon-32x32.png')} 
          style={styles.logo}
          accessibilityLabel="Cell Extension Logo"
        />
        <Text style={[styles.title, { color: theme.colors.primary }]}>Cellmata</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.menuButton} 
        onPress={onMenuToggle}
        accessibilityRole="button"
        accessibilityLabel="Toggle game settings"
      >
        <View style={[
          styles.menuLine, 
          { backgroundColor: theme.colors.primary },
          isPanelOpen && styles.menuLineActive1
        ]} />
        <View style={[
          styles.menuLine, 
          { backgroundColor: theme.colors.primary },
          isPanelOpen && styles.menuLineActive2
        ]} />
        <View style={[
          styles.menuLine, 
          { backgroundColor: theme.colors.primary },
          isPanelOpen && styles.menuLineActive3
        ]} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '5%',
    paddingHorizontal: 16,
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  logo: {
    height: '60%',
    aspectRatio: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuButton: {
    width: 30,
    height: 24,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 4,
  },
  menuLine: {
    width: '100%',
    height: 2,
    borderRadius: 1,
  },
  menuLineActive1: {
    transform: [{ rotate: '45deg' }, { translateY: 10 }],
  },
  menuLineActive2: {
    opacity: 0,
  },
  menuLineActive3: {
    transform: [{ rotate: '-45deg' }, { translateY: -10 }],
  },
});

export default Navbar; 