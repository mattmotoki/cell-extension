/**
 * src/shared/components/GameSettingsPanel.tsx - Cross-Platform Game Configuration Panel
 * 
 * Shared implementation of the game settings panel using Tamagui Sheet and Select.
 * Provides a slide-in interface for adjusting game settings across platforms.
 * Allows players to configure board size, scoring mechanism, AI difficulty, and player mode.
 * 
 * Relationships:
 * - Dispatches setting updates to settingsSlice.ts
 * - Interacts with resetGame action when settings change
 * 
 * Revision Log:
 * - Refactored to use Tamagui Sheet and Select, removing custom Picker and platform-specific logic.
 */

import React from 'react';
import { 
  YStack, 
  Text, 
  ScrollView, 
  Button,
  Sheet,
  Select,
  Adapt,
  H4, // Using H4 for section titles
  Paragraph, // For descriptive text if needed
  Separator, // To visually separate sections
} from 'tamagui';

// Import GameSettings and related types from the core module
import {
  GameSettings,
  PlayerMode,
  FirstPlayer,
  ScoringMechanism,
  AIDifficulty,
  BoardSizeOption 
} from '@core';

// Props definition
interface GameSettingsPanelProps {
  settings: GameSettings;
  onChange: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  isPanelOpen: boolean;
  onClose: () => void;
  // Removed optional style prop as it's no longer needed
}

const GameSettingsPanel: React.FC<GameSettingsPanelProps> = ({ 
  settings, 
  onChange, 
  isPanelOpen, 
  onClose,
}) => {

  // Helper to handle change events for any Select component
  // Tamagui Select returns the value directly, so no complex casting needed
  const handleChange = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    onChange(key, value);
  };

  // Use Sheet for both web and mobile platforms
  return (
    <Sheet
      open={isPanelOpen}
      onOpenChange={(open: boolean) => {
        if (!open) onClose();
      }}
      snapPointsMode="percent"
      snapPoints={[90]} // Use percentage for responsiveness
      dismissOnSnapToBottom
      modal // Handles modal behavior like background dimming and Esc key close
      animation="quick"
    >
      <Sheet.Overlay animation="quick" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
      <Sheet.Frame padding="$4" flex={1} borderTopLeftRadius="$6" borderTopRightRadius="$6"> 
        {/* Added border radius for a softer look */}
        <Sheet.Handle /> 
        <SettingsPanelContent 
          settings={settings} 
          handleChange={handleChange} 
          onClose={onClose} 
        />
      </Sheet.Frame>
    </Sheet>
  );
};

// Extracted common content component
interface SettingsPanelContentProps {
  settings: GameSettings;
  handleChange: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  onClose: () => void;
}

const SettingsPanelContent: React.FC<SettingsPanelContentProps> = ({ 
  settings, 
  handleChange, 
  onClose 
}) => {

  // Reusable component for Select dropdowns
  const SettingSelect = <K extends keyof GameSettings>({ 
    settingKey, 
    label, 
    items, 
    enabled = true 
  }: { 
    settingKey: K; 
    label: string; 
    items: { label: string; value: GameSettings[K] }[];
    enabled?: boolean;
  }) => (
    <YStack gap="$2">
      <H4>{label}</H4>
      <Select 
        id={settingKey} 
        value={settings[settingKey]} 
        onValueChange={(val: GameSettings[K]) => handleChange(settingKey, val)}
        disablePreventBodyScroll // Good practice for Select within Sheet/ScrollView
      >
        <Select.Trigger 
          width="100%" 
          iconAfter={<Select.Icon />} 
          disabled={!enabled}
        >
          <Select.Value placeholder={`Select ${label}...`} />
        </Select.Trigger>

        <Adapt when="sm" platform="touch">
          <Sheet native modal dismissOnSnapToBottom snapPointsMode="fit">
            <Sheet.Frame>
              <Sheet.ScrollView>
                <Adapt.Contents />
              </Sheet.ScrollView>
            </Sheet.Frame>
            <Sheet.Overlay />
          </Sheet>
        </Adapt>

        <Select.Content zIndex={200000}> 
          <Select.ScrollUpButton />
          <Select.Viewport minWidth={200}>
            <Select.Group>
              <Select.Label>{label}</Select.Label>
              {items.map((item, index) => (
                <Select.Item 
                  index={index} 
                  key={item.value} 
                  value={item.value}
                >
                  <Select.ItemText>{item.label}</Select.ItemText>
                  <Select.ItemIndicator marginLeft="auto">
                    {/* Optional: Add a checkmark or similar indicator */}
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Viewport>
          <Select.ScrollDownButton />
        </Select.Content>
      </Select>
    </YStack>
  );

  return (
    <YStack flex={1} gap="$4"> 
      {/* Use YStack for consistent spacing */}
      <ScrollView flex={1}>
        <YStack gap="$5" paddingBottom="$4"> 
          {/* Add vertical spacing between settings */}
          
          {/* Player Mode Setting */}
          <SettingSelect<"playerMode">
            settingKey="playerMode"
            label="Player Mode"
            items={[
              { label: 'AI Player', value: 'ai' },
              { label: 'Two Player', value: 'user' },
            ]}
          />

          <Separator /> 

          {/* First Player Setting */}
          <SettingSelect<"firstPlayer">
            settingKey="firstPlayer"
            label="First Player"
            items={[
              { label: 'Human (Player 1)', value: 'human' },
              { label: 'AI (Player 2)', value: 'ai' },
            ]}
          />

          <Separator />

          {/* Scoring Mechanism Setting */}
          <SettingSelect<"scoringMechanism">
            settingKey="scoringMechanism"
            label="Scoring Mechanism"
            items={[
              { label: 'Cell-Multiplication', value: 'cell-multiplication' },
              { label: 'Cell-Connection', value: 'cell-connection' },
              { label: 'Cell-Extension', value: 'cell-extension' },
            ]}
          />
          
          <Separator />

          {/* AI Difficulty Setting */}
          <SettingSelect<"aiDifficulty">
            settingKey="aiDifficulty"
            label="AI Difficulty"
            items={[
              { label: 'Easy', value: 'easy' },
              { label: 'Medium', value: 'medium' },
              { label: 'Hard', value: 'hard' },
            ]}
            enabled={settings.playerMode === 'ai'}
          />
          
          <Separator />

          {/* Board Size Setting */}
          <SettingSelect<"boardSize">
            settingKey="boardSize"
            label="Board Size"
            items={[
              { label: '4x4', value: '4' },
              { label: '6x6', value: '6' },
              { label: '10x10', value: '10' },
              { label: '16x16', value: '16' },
            ]}
          />
        </YStack>
      </ScrollView>
      
      {/* Close Button */}
      <YStack paddingVertical="$4" alignItems="center"> 
        {/* Removed marginTop="auto", rely on ScrollView and flex layout */}
        <Button
          size="$4" // Use Tamagui size prop
          width="90%" 
          theme="active" // Example theme application
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close game settings menu"
        >
          Close Menu
        </Button>
      </YStack>
    </YStack> // Changed from Fragment to YStack
  );
};

export default GameSettingsPanel;