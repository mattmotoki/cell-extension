/**
 * src/platforms/web/components/GameControls.tsx - Game Control Buttons
 * 
 * React component providing game control actions (reset and undo). Offers buttons 
 * with visual feedback for disabled states that allow players to start a new game 
 * or revert previous moves.
 * 
 * Relationships:
 * - Receives callback handlers from App.tsx
 * 
 * Revision Log:
 *  
 */

import React from 'react';

interface GameControlsProps {
  onUndo: () => void; // Function to handle undo click
  onReset: () => void; // Function to handle reset click
  isUndoDisabled: boolean; // State for disabling undo button
}

const GameControls: React.FC<GameControlsProps> = ({ onUndo, onReset, isUndoDisabled }) => {
  return (
    <div id="game-controls">
      <button 
        id="undo-button" 
        onClick={onUndo} 
        disabled={isUndoDisabled}
        title={isUndoDisabled ? "No moves to undo" : "Undo last move"}
      >
        <span className="button-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="0.5">
            <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
            <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
          </svg>
        </span>
        Undo
      </button>
      <button 
        id="reset-button" 
        onClick={onReset}
        title="Start a new game with current settings"
      >
        <span className="button-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="0.5">
            <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
          </svg>
        </span> 
        Reset
      </button>                
    </div>
  );
};

export default GameControls; 