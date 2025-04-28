/**
 * src/platforms/web/components/GameSettingsPanel.tsx - Game Configuration Panel
 * 
 * React component that provides an interface for adjusting game settings.
 * This slide-out panel allows players to configure various aspects of the
 * game including board size, scoring mechanism, AI difficulty, and player mode.
 * 
 * Key features:
 * - Slide-out panel with toggle visibility
 * - Control inputs for all customizable game settings
 * - Real-time setting changes with immediate game reset
 * - Responsive layout for different screen sizes
 * 
 * Technical approach:
 * - Functional component with controlled inputs
 * - Settings receive and propagate changes to Redux store
 * - CSS transitions for smooth panel animation
 * - Dropdown selects and radio groups for various settings
 * 
 * Relationships:
 * - Receives current settings and callbacks from App.tsx
 * - Dispatches setting updates to settingsSlice.ts
 * - Interacts with resetGame action when settings change
 * - Connected to Redux through parent component
 * 
 * Revision Log:
 *  
 */

import React from 'react';
// Import GameSettings and related types from the core module
import {
    GameSettings,
    PlayerMode,
    FirstPlayer,
    ScoringMechanism,
    AIDifficulty,
    BoardSizeOption // Use the correct name for the option type
} from '@core';

// Remove local type definitions - use imported ones
// type PlayerMode = 'ai' | 'user';
// type FirstPlayer = 'human' | 'ai';
// type ScoringMechanism = 'cell-multiplication' | 'cell-connection' | 'cell-extension';
// type AiDifficulty = 'easy' | 'hard';
// type BoardSize = '4' | '6' | '10' | '16'; // Renamed to BoardSizeOption

// Remove local interface definition
// interface GameSettings {
//   playerMode: PlayerMode;
//   firstPlayer: FirstPlayer;
//   scoringMechanism: ScoringMechanism;
//   aiDifficulty: AiDifficulty;
//   boardSize: BoardSize;
// }

// Props now use the imported GameSettings type
interface GameSettingsPanelProps {
  settings: GameSettings;
  onChange: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  isPanelOpen: boolean;
  onClose: () => void;
}

const GameSettingsPanel: React.FC<GameSettingsPanelProps> = ({ settings, onChange, isPanelOpen, onClose }) => {
  // Helper to handle change events for any select element
  const handleChange = <K extends keyof GameSettings>(key: K, value: string) => {
    // Type assertion might still be needed depending on how K and value interact
    // but the core types are now consistent.
    onChange(key, value as GameSettings[K]);
  };

  const panelClasses = `game-settings-panel ${isPanelOpen ? 'active' : ''}`;

  return (
    <div className={panelClasses} id="game-settings-panel">
      <ul className="game-settings-list">
        {/* Player Mode Setting */}
        <li className="game-settings-item">
          <span className="game-settings-item-label">Player Mode</span>
          <select 
            id="player-mode"
            value={settings.playerMode}
            onChange={(e) => handleChange('playerMode', e.target.value)}
          >
            <option value="ai">AI Player</option>
            <option value="user">Two Player</option>
          </select>
        </li>
        {/* First Player Setting */}
        <li className="game-settings-item">
          <span className="game-settings-item-label">First Player</span>
          <select 
            id="first-player"
            value={settings.firstPlayer}
            onChange={(e) => handleChange('firstPlayer', e.target.value)}
          >
            <option value="human">Human (Player 1)</option>
            <option value="ai">AI (Player 2)</option>
          </select>
        </li>
        {/* Scoring Mechanism Setting */}
        <li className="game-settings-item">
          <span className="game-settings-item-label">Scoring Mechanism</span>
          <select 
            id="scoring-mechanism" 
            title="Select a scoring mechanism"
            value={settings.scoringMechanism}
            onChange={(e) => handleChange('scoringMechanism', e.target.value)}
          >
            <option value="cell-multiplication" title="Product of the size of the cells">Cell-Multiplication</option>
            <option value="cell-connection" title="Product of the number of directed edges (connections)">Cell-Connection</option>
            <option value="cell-extension" title="Product of the number of undirected edges (extensions)">Cell-Extension</option>
          </select>
        </li>
        {/* AI Difficulty Setting */}
        <li className="game-settings-item">
          <span className="game-settings-item-label">AI Difficulty</span>
          <select 
            id="ai-difficulty" 
            title="Select AI Difficulty"
            value={settings.aiDifficulty}
            onChange={(e) => handleChange('aiDifficulty', e.target.value)}
            // Disable if not in AI mode?
            disabled={settings.playerMode !== 'ai'} 
          >
            <option value="easy">Easy</option>
            <option value="hard">Hard</option>
          </select>
        </li>
        {/* Board Size Setting - Use BoardSizeOption type values */}
        <li className="game-settings-item">
          <span className="game-settings-item-label">Board Size</span>
          <select 
            id="board-size" 
            title="Select a board size"
            value={settings.boardSize} // Uses BoardSizeOption
            onChange={(e) => handleChange('boardSize', e.target.value)}
          >
            <option value="4">4x4</option>
            <option value="6">6x6</option>
            <option value="10">10x10</option>
            <option value="16">16x16</option>
          </select>
        </li>
      </ul>
      {/* Close Button */}
      <div className="game-settings-close">
        <button id="game-settings-close-btn" onClick={onClose}>Close Menu</button>
      </div>
    </div>
  );
};

export default GameSettingsPanel; 