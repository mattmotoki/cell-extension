/**
 * src/platforms/mobile/App.tsx - Mobile Entry Point
 * 
 * Main entry point for the mobile application, using shared components
 * and Tamagui for styling.
 * 
 * Relationships:
 * - Uses shared GameSettingsPanel from @shared/components
 * - Uses Redux store and game state from core
 */

import React, { useState } from 'react';
import { SafeAreaView, StatusBar, View } from 'react-native';
import { YStack, Text, TamaguiProvider, Button } from 'tamagui';
import config from '../../../tamagui.config';
import { GameSettings } from '@core';
import GameSettingsPanel from '@shared/components/GameSettingsPanel';

// Default game settings
const defaultSettings: GameSettings = {
  boardSize: '6',
  playerMode: 'ai',
  firstPlayer: 'human',
  scoringMechanism: 'cell-extension',
  aiDifficulty: 'easy',
};

const App = () => {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSettingsChange = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <TamaguiProvider config={config}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <YStack flex={1} backgroundColor="$background" padding="$4" alignItems="center" justifyContent="center">
          <Text color="$color" fontSize="$6" fontWeight="bold" marginBottom="$6">
            Cell Extension Game
          </Text>
          
          <Button 
            onPress={() => setIsSettingsOpen(true)}
            theme="active"
            size="$4"
            marginBottom="$6"
          >
            Open Settings
          </Button>
          
          <GameSettingsPanel
            settings={settings}
            onChange={handleSettingsChange}
            isPanelOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        </YStack>
      </SafeAreaView>
    </TamaguiProvider>
  );
};

export default App; 