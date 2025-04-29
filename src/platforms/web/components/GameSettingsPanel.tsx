/**
 * src/platforms/web/components/GameSettingsPanel.tsx - Game Configuration Panel
 * 
 * Web implementation of the GameSettingsPanel component that uses the shared
 * cross-platform component with Tamagui components.
 * 
 * Since we're now using Tamagui for cross-platform UI development,
 * this is simply a pass-through to maintain API consistency.
 * 
 * Relationships:
 * - Dispatches setting updates to settingsSlice.ts
 * - Interacts with resetGame action when settings change
 */

import React from 'react';
import SharedGameSettingsPanel from '@shared/components/GameSettingsPanel';
import { GameSettings } from '@core';

// Props definition using the imported GameSettings type
interface GameSettingsPanelProps {
  settings: GameSettings;
  onChange: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  isPanelOpen: boolean;
  onClose: () => void;
}

const GameSettingsPanel: React.FC<GameSettingsPanelProps> = (props) => {
  return <SharedGameSettingsPanel {...props} />;
};

export default GameSettingsPanel; 