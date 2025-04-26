/**
 * src/App.tsx - Main Application Component
 * 
 * The top-level React component that orchestrates the Cell Extension game.
 * Manages game state through Redux, coordinates user interactions, and triggers
 * AI moves when appropriate. Serves as the central hub that integrates all 
 * game components and manages game flow.
 * 
 * Key responsibilities:
 * - Rendering the game's UI components (board, controls, settings panel)
 * - Managing game state transitions (player turns, game over)
 * - Triggering AI move calculation when it's the AI's turn
 * - Handling user actions like reset, undo, and settings changes
 * 
 * Relationships:
 * - Uses Redux store (gameSlice, settingsSlice) for state management
 * - Imports UI components from platforms/web/components/
 * - Calls getAIMove from core/ai/aiLogic.ts when it's the AI's turn
 * - Dispatches game actions (placeMove, resetGame, etc.) to update state
 * 
 * Effect hooks:
 * - AI turn detection and move calculation
 * - Game over notification
 * 
 * Revision Log:
 *  
 * Note: This revision log should be updated whenever this file is modified. 
 * Do not use dates in the revision log.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import '../styles.css';
import Navbar from '@web/components/Navbar';
import GameSettingsPanel from '@web/components/GameSettingsPanel';
import ScoreDisplay from '@web/components/ScoreDisplay';
import GameBoard from '@web/components/GameBoard';
import ScoreChart from '@web/components/ScoreChart';
import GameControls from '@web/components/GameControls';
import { RootState, AppDispatch } from '@core/store';
import { GameSettings, Coordinates, GameState } from '@core/types';
import { placeMove, undoMove, resetGame, setProgress } from '@core/game/gameSlice';
import { updateSetting } from '@core/settingsSlice';
import { getAIMove } from '@core/ai';
import { getAvailableCells } from '@core/game';

function App() {
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  // Add a ref to track if AI calculation is in progress to prevent redundant calls
  const aiCalculationInProgress = useRef(false);

  const dispatch = useDispatch<AppDispatch>();

  const gameState = useSelector((state: RootState) => state.game);
  const settings = useSelector((state: RootState) => state.settings);

  const toggleSettingsPanel = useCallback(() => {
    setIsSettingsPanelOpen(prev => !prev);
  }, []);

  const handleSettingChange = useCallback(<K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    dispatch(updateSetting({ key, value }));
    const nextSettings = { ...settings, [key]: value };
    if (key === 'boardSize' || key === 'firstPlayer' || key === 'scoringMechanism' || key === 'aiDifficulty' || key === 'playerMode') {
        // console.log(`${String(key)} changed, dispatching resetGame...`);
        dispatch(resetGame(nextSettings));
    }
  }, [dispatch, settings]);

  const handleResetClick = useCallback(() => {
      // console.log('Reset button clicked');
      dispatch(resetGame(settings));
      setIsSettingsPanelOpen(false);
  }, [dispatch, settings]);

  const handleUndoClick = useCallback(() => {
      dispatch(undoMove());
  }, [dispatch]);

  const isUndoDisabled = gameState.history.length === 0 || (gameState.progress !== 'playing' && gameState.progress !== 'over');

  // AI move calculation function - extracted to prevent re-creation on every render
  const calculateAIMove = useCallback((currentGameState: GameState, currentSettings: GameSettings) => {
    if (aiCalculationInProgress.current) {
      // console.log("[AI Effect] AI calculation already in progress, skipping");
      return;
    }
    
    aiCalculationInProgress.current = true;
    console.log("[AI Effect] Starting AI calculation...");
    
    // Set game to waiting state
    dispatch(setProgress('waiting'));
    
    // Use setTimeout to avoid blocking the UI
    setTimeout(() => {
      try {
        // console.log("[AI Effect] Calculating AI move...");
        console.time("AI Move Calculation");
        const aiMove = getAIMove(currentGameState, currentSettings);
        console.timeEnd("AI Move Calculation");
        console.log("[AI Effect] AI Move calculation complete:", aiMove);
        
        // Process the AI move
        if (aiMove && typeof aiMove.gridX === 'number' && typeof aiMove.gridY === 'number') {
          // console.log(`[AI Effect] Valid move found at (${aiMove.gridX}, ${aiMove.gridY}), dispatching...`);
          dispatch(placeMove({ coords: aiMove, settings: currentSettings }));
        } else {
          console.warn("[AI Effect] AI returned invalid move:", aiMove);
          // Check if game should end
          const availableCells = getAvailableCells(currentGameState.boardState);
          if (availableCells.length === 0) {
            console.log("[AI Effect] No available cells, setting game to 'over'");
            dispatch(setProgress('over'));
          } else {
            console.log("[AI Effect] Setting game back to 'playing' state");
            dispatch(setProgress('playing'));
          }
        }
      } catch (error) {
        console.error("[AI Effect] Error during AI calculation:", error);
        if (error instanceof Error) {
          console.error("[AI Effect] Error details:", error.message);
          console.error("[AI Effect] Stack trace:", error.stack);
        }
        dispatch(setProgress('playing'));
      } finally {
        aiCalculationInProgress.current = false;
      }
    }, 500); // 500ms delay
  }, [dispatch]);

  // AI turn detection effect
  useEffect(() => {
    // Only trigger if it's the AI's turn and the game is in 'playing' state
    const isAITurn = settings.playerMode === 'ai' && 
                     gameState.currentPlayer === 1 && 
                     gameState.progress === 'playing';
                     
    // console.log("[AI Effect] Checking AI turn conditions:", {
    //   playerMode: settings.playerMode,
    //   currentPlayer: gameState.currentPlayer,
    //   progress: gameState.progress,
    //   isAITurn
    // });
    
    if (isAITurn) {
      console.log("[AI Effect] AI's turn detected, triggering calculation");
      calculateAIMove(gameState as GameState, settings);
    }
    
    // No cleanup needed since we're managing the calculation state via ref
  }, [gameState.currentPlayer, gameState.progress, gameState, settings, calculateAIMove]);

  useEffect(() => {
      if (gameState.progress === 'over') {
          setTimeout(() => {
              const winner = gameState.scores[0] > gameState.scores[1] ? 'Player 1' : (gameState.scores[1] > gameState.scores[0] ? 'Player 2' : 'Draw');
              alert(`Game Over! Winner: ${winner} (${gameState.scores[0]} - ${gameState.scores[1]})`);
          }, 500);
      }
  }, [gameState.progress, gameState.scores]);

  const scoringDescription = settings.scoringMechanism.replace('cell-','').replace('-', ' ');

  return (
    <div className={`game-container ${gameState.progress === 'waiting' ? 'waiting' : ''}`}>
      <Navbar
        onMenuToggle={toggleSettingsPanel}
        isPanelOpen={isSettingsPanelOpen}
      />
      <GameSettingsPanel
        settings={settings}
        onChange={handleSettingChange}
        isPanelOpen={isSettingsPanelOpen}
        onClose={toggleSettingsPanel}
      />
      <div id="game">
        <div className="board-group">
          <ScoreDisplay />
          <GameBoard />
        </div>
        <ScoreChart />
        <GameControls
          onUndo={handleUndoClick}
          onReset={handleResetClick}
          isUndoDisabled={isUndoDisabled}
        />
      </div>
    </div>
  );
}

export default App;