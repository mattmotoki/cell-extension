/**
 * src/shared/components/GameControls.tsx - Cross-Platform Game Control Buttons
 * 
 * Shared implementation of game controls using React Native components.
 * Provides buttons for undo and reset game actions with visual feedback for 
 * disabled states. Designed to work across web and mobile platforms.
 * 
 * Relationships:
 * - Receives callback handlers from App.tsx
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@shared/styles/theme';

interface GameControlsProps {
  onUndo: () => void; // Function to handle undo action
  onReset: () => void; // Function to handle reset action
  isUndoDisabled: boolean; // State for disabling undo button
  style?: object; // Optional additional styles
}

const GameControls: React.FC<GameControlsProps> = ({ onUndo, onReset, isUndoDisabled, style }) => {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
      {/* Undo Button */}
      <TouchableOpacity 
        style={[
          styles.button, 
          { backgroundColor: theme.colors.primary }, 
          isUndoDisabled && styles.buttonDisabled
        ]}
        onPress={onUndo}
        disabled={isUndoDisabled}
        activeOpacity={isUndoDisabled ? 1 : 0.7}
        accessibilityRole="button"
        accessibilityLabel={isUndoDisabled ? "No moves to undo" : "Undo last move"}
        accessibilityState={{ disabled: isUndoDisabled }}
      >
        {/* We could use a proper icon library here, but for simplicity 
            we'll just use a Text component with a symbol */}
        <Text style={[styles.iconText, { color: theme.colors.light }]}>⟲</Text>
        <Text style={[styles.buttonText, { color: theme.colors.light }]}>Undo</Text>
      </TouchableOpacity>
      
      {/* Reset Button */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={onReset}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Start a new game with current settings"
      >
        <Text style={[styles.iconText, { color: theme.colors.light }]}>⟳</Text>
        <Text style={[styles.buttonText, { color: theme.colors.light }]}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 0,
    paddingHorizontal: '5%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 100,
    flex: 1,
    marginHorizontal: '5%',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  iconText: {
    fontSize: 18,
    marginRight: 8,
  }
});

export default GameControls; 