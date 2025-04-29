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
 * - Uses Redux store (now accessed via @core) for state management
 * - Imports UI components from @web/components/
 * - Calls getAIMove from @core/ai when it's the AI's turn
 * - Dispatches game actions (placeMove, resetGame, etc.) from @core
 * 
 * Effect hooks:
 * - AI turn detection and move calculation
 * - Game over notification
 * 
 * Revision Log:
 *  
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '@web/components/Navbar';
import GameSettingsPanel from '@web/components/GameSettingsPanel';
import ScoreDisplay from '@web/components/ScoreDisplay';
import GameBoard from '@web/components/GameBoard';
import ScoreChart from '@web/components/ScoreChart';
import GameControls from '@web/components/GameControls';
import Footer from '@web/components/Footer';

// Import necessary types, hooks, actions, and functions from the restructured @core module
import {
  RootState,           // Root state type from the core
  AppDispatch,         // Dispatch type from the core store
  GameSettings,        // Settings type definition
  Coordinates,         // Coordinate type definition
  GameState,           // Game state type definition
  placeMove,           // Game action from game slice
  undoMove,            // Game action from game slice
  resetGame,           // Game action from game slice
  setProgress,         // Game action from game slice
  updateSetting,       // Settings action from settings slice
  getAIMove,           // AI move calculation function from AI engine
  getAvailableCells,   // Game utility function 
  selectCanUndo        // Game selector
} from '@core'; // Use the main core index export

function App() {
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const aiCalculationInProgress = useRef(false);

  // Use the AppDispatch type from the core store
  const dispatch = useDispatch<AppDispatch>();

  // Use RootState type for useSelector and select game/settings state
  const gameState = useSelector((state: RootState) => state.game);
  const settings = useSelector((state: RootState) => state.settings);
  // Use the selector for undo state
  const isUndoDisabled = !useSelector(selectCanUndo);

  const toggleSettingsPanel = useCallback(() => {
    setIsSettingsPanelOpen(prev => !prev);
  }, []);

  const handleSettingChange = useCallback(<K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    // Dispatch updateSetting action (imported from @core)
    dispatch(updateSetting({ key, value }));
    const nextSettings = { ...settings, [key]: value };
    // Reset game if relevant settings change
    if (['boardSize', 'firstPlayer', 'scoringMechanism', 'aiDifficulty', 'playerMode'].includes(key as string)) {
        dispatch(resetGame(nextSettings)); 
    }
  }, [dispatch, settings]);

  const handleResetClick = useCallback(() => {
      dispatch(resetGame(settings)); 
      setIsSettingsPanelOpen(false);
  }, [dispatch, settings]);

  const handleUndoClick = useCallback(() => {
      dispatch(undoMove());
  }, [dispatch]);

  // AI move calculation function
  const calculateAIMove = useCallback((currentGameState: GameState, currentSettings: GameSettings) => {
    if (aiCalculationInProgress.current) {
      return;
    }
    
    aiCalculationInProgress.current = true;
    console.log("[AI Effect] Starting AI calculation...");
    
    // Dispatch setProgress action (imported from @core)
    dispatch(setProgress('waiting')); 
    
    setTimeout(() => {
      try {
        console.time("AI Move Calculation");
        // Call getAIMove (imported from @core/ai, re-exported via @core)
        const aiMove = getAIMove(currentGameState, currentSettings);
        console.timeEnd("AI Move Calculation");
        console.log("[AI Effect] AI Move calculation complete:", aiMove);
        
        if (aiMove && typeof aiMove.gridX === 'number' && typeof aiMove.gridY === 'number') {
          // Set the game state back to 'playing' before placing the move
          console.log("[AI Effect] Setting game back to 'playing' state before placing AI move");
          dispatch(setProgress('playing'));
          
          // Dispatch placeMove action (imported from @core/game, re-exported via @core)
          dispatch(placeMove({ coords: aiMove, settings: currentSettings }));
        } else {
          console.warn("[AI Effect] AI returned invalid move:", aiMove);
          // Call getAvailableCells (imported from @core/game, re-exported via @core)
          const availableCells = getAvailableCells(currentGameState.boardState);
          if (availableCells.length === 0) {
            console.log("[AI Effect] No available cells, setting game to 'over'");
            dispatch(setProgress('over')); // Dispatch setProgress action
          } else {
            console.log("[AI Effect] Setting game back to 'playing' state");
            dispatch(setProgress('playing')); // Dispatch setProgress action
          }
        }
      } catch (error) {
        console.error("[AI Effect] Error during AI calculation:", error);
        if (error instanceof Error) {
          console.error("[AI Effect] Error details:", error.message);
          console.error("[AI Effect] Stack trace:", error.stack);
        }
        // Ensure progress is reset if AI errors out
        dispatch(setProgress('playing'));
      } finally {
        aiCalculationInProgress.current = false;
      }
    }, 500); // Simulate AI thinking delay
  // Pass gameState and settings as dependencies if they are used directly inside
  // }, [dispatch, gameState, settings]); 
  // Keep only dispatch if gameState/settings are passed as args
  }, [dispatch]); 

  // AI turn detection effect
  useEffect(() => {
    const isAITurn = settings.playerMode === 'ai' && 
                     gameState.currentPlayer === 1 && 
                     gameState.progress === 'playing';
                     
    if (isAITurn && !aiCalculationInProgress.current) { // Prevent starting if already running
      console.log("[AI Effect] AI's turn detected, triggering calculation");
      // Pass the *current* state and settings to the calculation function
      // Avoid listing gameState/settings in dependency array if passed as args
      calculateAIMove(gameState, settings);
    }
    
  // Dependency array: only re-run if these specific values change
  }, [gameState.currentPlayer, gameState.progress, settings.playerMode, calculateAIMove, gameState, settings]); 

  // Game over effect
  useEffect(() => {
      if (gameState.progress === 'over') {
          setTimeout(() => {
              const winnerText = gameState.scores[0] > gameState.scores[1] 
                  ? 'Player 1 Wins!' 
                  : (gameState.scores[1] > gameState.scores[0] ? 'Player 2 Wins!' : 'Draw!');
              alert(`Game Over! ${winnerText} (${gameState.scores[0]} - ${gameState.scores[1]})`);
          }, 500); // Delay alert slightly
      }
  }, [gameState.progress, gameState.scores]);

  // Effect to transition from 'pregame' to 'playing' on component mount or game reset
  useEffect(() => {
      if (gameState.progress === 'pregame') {
          console.log("[Game Init] Changing state from 'pregame' to 'playing'");
          dispatch(setProgress('playing'));
      }
  }, [gameState.progress, dispatch]);

  return (
    <div className={`game-container ${gameState.progress === 'waiting' ? 'waiting' : ''}`}>
      <Navbar
        onMenuToggle={toggleSettingsPanel}
        isPanelOpen={isSettingsPanelOpen}
      />
      <GameSettingsPanel
        settings={settings} // Pass settings state
        onChange={handleSettingChange} // Pass settings change handler
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
          onUndo={handleUndoClick} // Pass undo handler
          onReset={handleResetClick} // Pass reset handler
          isUndoDisabled={isUndoDisabled} // Pass undo disabled state from selector
        />
      </div>
      <Footer />
    </div>
  );
}

export default App;