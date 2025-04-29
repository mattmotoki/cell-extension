/**
 * src/shared/components/GameSettingsPanel.tsx - Cross-Platform Game Configuration Panel
 * 
 * Shared implementation of the game settings panel using Tamagui components.
 * Provides a slide-in interface for adjusting game settings across platforms.
 * Allows players to configure board size, scoring mechanism, AI difficulty, and player mode.
 * 
 * Relationships:
 * - Dispatches setting updates to settingsSlice.ts
 * - Interacts with resetGame action when settings change
 */

import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { 
  YStack, 
  Text, 
  ScrollView, 
  Button,
  AnimatePresence,
  View,
  Sheet,
  useTheme
} from 'tamagui';
import { Picker } from '@shared/components/Picker';

// Import GameSettings and related types from the core module
import {
  GameSettings,
  PlayerMode,
  FirstPlayer,
  ScoringMechanism,
  AIDifficulty,
  BoardSizeOption 
} from '@core';

// Import shared layout values
import layout from '@shared/styles/theme/components/layout';
import colors from '@shared/styles/theme/colors';
import typography from '@shared/styles/theme/typography';

// Define solid background color for the panel (fully opaque)
const PANEL_BG_COLOR = '#1e1e1e'; // Removing transparency from navbar bg color

// Props definition
interface GameSettingsPanelProps {
  settings: GameSettings;
  onChange: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  isPanelOpen: boolean;
  onClose: () => void;
  style?: object; // Optional additional styles
}

const GameSettingsPanel: React.FC<GameSettingsPanelProps> = ({ 
  settings, 
  onChange, 
  isPanelOpen, 
  onClose,
  style 
}) => {
  const theme = useTheme();
  // Track whether the panel is fully invisible
  const [isFullyInvisible, setIsFullyInvisible] = useState(!isPanelOpen);

  // Helper to handle change events for any picker
  const handleChange = <K extends keyof GameSettings>(key: K, value: any) => {
    onChange(key, value as GameSettings[K]);
  };

  // Update visibility based on isPanelOpen prop
  useEffect(() => {
    if (!isPanelOpen) {
      const timer = setTimeout(() => {
        setIsFullyInvisible(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsFullyInvisible(false);
    }
  }, [isPanelOpen]);

  // Add keyboard event listener for Escape key (web platform only)
  useEffect(() => {
    // Only add keyboard listener for web platform
    if (Platform.OS === 'web' && isPanelOpen) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      
      // Clean up event listener
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isPanelOpen, onClose]);

  // Don't render at all if closed and fully invisible
  if (!isPanelOpen && isFullyInvisible) {
    return null;
  }

  // Use Sheet for mobile platforms for a native feel
  if (Platform.OS !== 'web') {
    return (
      <Sheet
        open={isPanelOpen}
        onOpenChange={(open: boolean) => {
          if (!open) onClose();
        }}
        snapPoints={[95]}
        dismissOnSnapToBottom
        position={isPanelOpen ? 95 : 0}
        modal
      >
        <Sheet.Overlay />
        <Sheet.Frame backgroundColor={PANEL_BG_COLOR}>
          <YStack padding="$4" flex={1}>
            <SettingsPanelContent 
              settings={settings} 
              handleChange={handleChange} 
              onClose={onClose} 
            />
          </YStack>
        </Sheet.Frame>
      </Sheet>
    );
  }

  // Web version uses AnimatePresence for smooth transitions
  return (
    <AnimatePresence>
      {isPanelOpen && (
        <YStack
          position="absolute"
          top={layout.sizing.navbar.height}
          left={0}
          width="100%"
          height={`calc(100vh - ${layout.sizing.navbar.height})`} // Calculate height using shared layout value
          zIndex={layout.zIndex.settingsPanel} // Use shared zIndex
          backgroundColor={PANEL_BG_COLOR} // Use fully opaque background color
          animation="quick"
          enterStyle={{ opacity: 0, y: 20 }}
          exitStyle={{ opacity: 0, y: 20 }}
          {...style}
        >
          <SettingsPanelContent 
            settings={settings} 
            handleChange={handleChange} 
            onClose={onClose} 
          />
        </YStack>
      )}
    </AnimatePresence>
  );
};

// Extracted common content component
interface SettingsPanelContentProps {
  settings: GameSettings;
  handleChange: <K extends keyof GameSettings>(key: K, value: any) => void;
  onClose: () => void;
}

const SettingsPanelContent: React.FC<SettingsPanelContentProps> = ({ 
  settings, 
  handleChange, 
  onClose 
}) => {
  const theme = useTheme();

  return (
    <>
      <ScrollView flex={1}>
        {/* Player Mode Setting */}
        <YStack padding="$4" marginBottom="$2">
          <Text fontSize="$5" fontWeight="700" marginBottom="$2" color="$color">
            Player Mode
          </Text>
          <View
            borderRadius="$2"
            marginTop="$2"
            overflow="hidden"
            backgroundColor="$background"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <Picker
              selectedValue={settings.playerMode}
              onValueChange={(value) => handleChange('playerMode', value)}
              style={{ width: '100%', height: 50 }}
              dropdownIconColor={theme.color?.toString()}
            >
              <Picker.Item label="AI Player" value="ai" />
              <Picker.Item label="Two Player" value="user" />
            </Picker>
          </View>
        </YStack>
        
        {/* First Player Setting */}
        <YStack padding="$4" marginBottom="$2">
          <Text fontSize="$5" fontWeight="700" marginBottom="$2" color="$color">
            First Player
          </Text>
          <View
            borderRadius="$2"
            marginTop="$2"
            overflow="hidden"
            backgroundColor="$background"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <Picker
              selectedValue={settings.firstPlayer}
              onValueChange={(value) => handleChange('firstPlayer', value)}
              style={{ width: '100%', height: 50 }}
              dropdownIconColor={theme.color?.toString()}
            >
              <Picker.Item label="Human (Player 1)" value="human" />
              <Picker.Item label="AI (Player 2)" value="ai" />
            </Picker>
          </View>
        </YStack>
        
        {/* Scoring Mechanism Setting */}
        <YStack padding="$4" marginBottom="$2">
          <Text fontSize="$5" fontWeight="700" marginBottom="$2" color="$color">
            Scoring Mechanism
          </Text>
          <View
            borderRadius="$2"
            marginTop="$2"
            overflow="hidden"
            backgroundColor="$background"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <Picker
              selectedValue={settings.scoringMechanism}
              onValueChange={(value) => handleChange('scoringMechanism', value)}
              style={{ width: '100%', height: 50 }}
              dropdownIconColor={theme.color?.toString()}
            >
              <Picker.Item label="Cell-Multiplication" value="cell-multiplication" />
              <Picker.Item label="Cell-Connection" value="cell-connection" />
              <Picker.Item label="Cell-Extension" value="cell-extension" />
            </Picker>
          </View>
        </YStack>
        
        {/* AI Difficulty Setting */}
        <YStack padding="$4" marginBottom="$2">
          <Text fontSize="$5" fontWeight="700" marginBottom="$2" color="$color">
            AI Difficulty
          </Text>
          <View
            borderRadius="$2"
            marginTop="$2"
            overflow="hidden"
            backgroundColor="$background"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <Picker
              selectedValue={settings.aiDifficulty}
              onValueChange={(value) => handleChange('aiDifficulty', value)}
              style={{ width: '100%', height: 50 }}
              enabled={settings.playerMode === 'ai'}
              dropdownIconColor={theme.color?.toString()}
            >
              <Picker.Item label="Easy" value="easy" />
              <Picker.Item label="Hard" value="hard" />
            </Picker>
          </View>
        </YStack>
        
        {/* Board Size Setting */}
        <YStack padding="$4" marginBottom="$2">
          <Text fontSize="$5" fontWeight="700" marginBottom="$2" color="$color">
            Board Size
          </Text>
          <View
            borderRadius="$2"
            marginTop="$2"
            overflow="hidden"
            backgroundColor="$background"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <Picker
              selectedValue={settings.boardSize}
              onValueChange={(value) => handleChange('boardSize', value)}
              style={{ width: '100%', height: 50 }}
              dropdownIconColor={theme.color?.toString()}
            >
              <Picker.Item label="4x4" value="4" />
              <Picker.Item label="6x6" value="6" />
              <Picker.Item label="10x10" value="10" />
              <Picker.Item label="16x16" value="16" />
            </Picker>
          </View>
        </YStack>
      </ScrollView>
      
      {/* Close Button */}
      <YStack padding="$4" alignItems="center" justifyContent="center" marginTop="auto" marginBottom="$4">
        <Button
          width="80%" 
          borderWidth={1}
          borderColor={theme.color}
          borderRadius="$2"
          padding="$3"
          alignItems="center"
          justifyContent="center"
          backgroundColor="transparent"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close game settings menu"
        >
          <Text color={theme.color} fontSize="$5" fontWeight="700">
            Close Menu
          </Text>
        </Button>
      </YStack>
    </>
  );
};

export default GameSettingsPanel;