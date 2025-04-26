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
 * Note: This revision log should be updated whenever this file is modified. 
 * Do not use dates in the revision log.
 */

import React from 'react';

// Import the GameSettings type from App.tsx or define it here
// Assuming it might be better to define shared types in a separate file later
type PlayerMode = 'ai' | 'user';
type FirstPlayer = 'human' | 'ai';
type ScoringMechanism = 'cell-multiplication' | 'cell-connection' | 'cell-extension';
type AiDifficulty = 'easy' | 'hard';
type BoardSize = '4' | '6' | '10' | '16';

interface GameSettings {
  playerMode: PlayerMode;
  firstPlayer: FirstPlayer;
  scoringMechanism: ScoringMechanism;
  aiDifficulty: AiDifficulty;
  boardSize: BoardSize;
}

// Update props to include panel visibility and close handler
interface GameSettingsPanelProps {
  settings: GameSettings;
  onChange: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  isPanelOpen: boolean;
  onClose: () => void;
}

const GameSettingsPanel: React.FC<GameSettingsPanelProps> = ({ settings, onChange, isPanelOpen, onClose }) => {
  // Helper to handle change events for any select element
  const handleChange = <K extends keyof GameSettings>(key: K, value: string) => {
    // Type assertion needed here as value comes from select event
    onChange(key, value as GameSettings[K]);
  };

  // Add the 'active' class to the panel div if it's open
  const panelClasses = `game-settings-panel ${isPanelOpen ? 'active' : ''}`;

  return (
    <div className={panelClasses} id="game-settings-panel">
      <ul className="game-settings-list">
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
        <li className="game-settings-item">
          <span className="game-settings-item-label">AI Difficulty</span>
          <select 
            id="ai-difficulty" 
            title="Select AI Difficulty"
            value={settings.aiDifficulty}
            onChange={(e) => handleChange('aiDifficulty', e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="hard">Hard</option>
          </select>
        </li>
        <li className="game-settings-item">
          <span className="game-settings-item-label">Board Size</span>
          <select 
            id="board-size" 
            title="Select a board size"
            value={settings.boardSize}
            onChange={(e) => handleChange('boardSize', e.target.value)}
          >
            <option value="4">4x4</option>
            <option value="6">6x6</option>
            <option value="10">10x10</option>
            <option value="16">16x16</option>
          </select>
        </li>
      </ul>
      {/* Add onClick handler to the close button */}
      <div className="game-settings-close">
        <button id="game-settings-close-btn" onClick={onClose}>Close Menu</button>
      </div>
    </div>
  );
};

export default GameSettingsPanel; 