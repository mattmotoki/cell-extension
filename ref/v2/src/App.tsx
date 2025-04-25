import React, { useState, useEffect, useCallback } from 'react'; // Import useState, useEffect, useCallback
import '../styles.css';
import Navbar from './components/Navbar';
import GameSettingsPanel from './components/GameSettingsPanel';
import ScoreDisplay from './components/ScoreDisplay'; // Import ScoreDisplay
import GameBoard from './components/GameBoard'; // Import GameBoard
import ScoreChart from './components/ScoreChart'; // Import ScoreChart
import GameControls from './components/GameControls'; // Import GameControls
import { useGameLogic } from './hooks/useGameLogic'; // Import the custom hook
import { GameSettings, Coordinates } from './types'; // Import necessary types

// Define types for settings
// type PlayerMode = 'ai' | 'user'; // Removed
// type FirstPlayer = 'human' | 'ai'; // Removed
// type ScoringMechanism = 'cell-multiplication' | 'cell-connection' | 'cell-extension'; // Removed
// type AiDifficulty = 'easy' | 'hard'; // Removed
// type BoardSize = '4' | '6' | '10' | '16'; // Removed

// interface GameSettings { // Removed
//   playerMode: PlayerMode; // Removed
//   firstPlayer: FirstPlayer; // Removed
//   scoringMechanism: ScoringMechanism; // Removed
//   aiDifficulty: AiDifficulty; // Removed
//   boardSize: BoardSize; // Removed
// } // Removed

function App() {
  // State for game settings UI
  const [settings, setSettings] = useState<GameSettings>({
    playerMode: 'ai',
    firstPlayer: 'human',
    scoringMechanism: 'cell-multiplication',
    aiDifficulty: 'easy',
    boardSize: '6',
  });

  // State for settings panel visibility
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);

  // Use the game logic hook, initialized with current settings
  const {
    gameState,
    placePlayerMove,
    undoMove,
    resetGame,
  } = useGameLogic(settings);

  // Function to toggle settings panel
  const toggleSettingsPanel = useCallback(() => {
    setIsSettingsPanelOpen(prev => !prev);
  }, []);

  // Handler for settings changes from the UI panel
  const handleSettingChange = useCallback(<K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings, [key]: value };
      // Reset the game logic whenever a setting that affects it changes
      if (key === 'boardSize' || key === 'firstPlayer' || key === 'scoringMechanism' || key === 'aiDifficulty') { // Reset on most changes
          console.log(`${key} changed, resetting game...`);
          resetGame(newSettings); 
      }
      // Player mode change might also need a reset or different handling
      if (key === 'playerMode') {
         resetGame(newSettings);
      }
      return newSettings;
    });
  }, [resetGame]);

  // Handler for board clicks, passed to GameBoard
  const handleBoardClick = useCallback((coords: Coordinates) => {
    // Basic turn validation (can be enhanced in useGameLogic or here)
    if (gameState.progress === 'playing') {
        if (settings.playerMode === 'user' || gameState.currentPlayer === 0) {
             placePlayerMove(coords);
        } else {
            console.log("Not human player's turn (in AI mode).");
        }
    } else {
        console.log("Cannot place move, game state is:", gameState.progress);
    }
  }, [gameState.progress, gameState.currentPlayer, settings.playerMode, placePlayerMove]);

  // Reset game handler for the button
  const handleResetClick = useCallback(() => {
      console.log('Reset button clicked');
      resetGame(settings); // Reset with current UI settings
      setIsSettingsPanelOpen(false); // Close panel on reset
  }, [resetGame, settings]);
  
  // Determine if undo should be disabled
  // Cannot undo initial state (history length 1) or when not playing/over
  const isUndoDisabled = gameState.history.length <= 1 || (gameState.progress !== 'playing' && gameState.progress !== 'over'); 

  // --- UI Update Logic (e.g., for winner message) ---
  useEffect(() => {
      if (gameState.progress === 'over') {
          // Use a timeout like the original code?
          setTimeout(() => {
              // Adapt or reuse displayWinnerMessage utility
              // displayWinnerMessage(gameState.scores, settings.playerMode);
              const winner = gameState.scores[0] > gameState.scores[1] ? 'Player 1' : (gameState.scores[1] > gameState.scores[0] ? 'Player 2' : 'Draw');
              alert(`Game Over! Winner: ${winner} (${gameState.scores[0]} - ${gameState.scores[1]})`);
          }, 500); // Adjust delay as needed
      }
  }, [gameState.progress, gameState.scores, settings.playerMode]);

  // --- Get scoring description --- (Adapt uiUtils or reimplement)
  // const scoringDescription = getScoringDescription(settings.scoringMechanism);
  const scoringDescription = settings.scoringMechanism.replace('cell-','').replace('-', ' '); // Simple version

  return (
    <div className={`game-container ${gameState.progress === 'waiting' ? 'waiting' : ''}`}> {/* Add waiting class */} 
      <Navbar 
        onMenuToggle={toggleSettingsPanel} 
        isPanelOpen={isSettingsPanelOpen} 
      />
      <GameSettingsPanel 
        settings={settings} // Pass UI settings state
        onChange={handleSettingChange}
        isPanelOpen={isSettingsPanelOpen}
        onClose={toggleSettingsPanel} 
      />

      <div id="game">
        <div className="board-group">
          <ScoreDisplay 
             scores={gameState.scores}
             currentPlayer={gameState.currentPlayer}
             scoringMechanism={gameState.scoringMechanism}
             // Pass components if needed by ScoreBreakdown later
             boardState={gameState.boardState} // Pass board state for component calculation
             scoringDescription={scoringDescription}
             playerColors={["#00FF00", "#1E90FF"]} // Pass player colors
          />
          <GameBoard 
             boardState={gameState.boardState}
             currentPlayer={gameState.currentPlayer}
             onCellClick={handleBoardClick} // Pass down click handler
             playerColors={["#00FF00", "#1E90FF"]} // Example colors, pass from config/state if needed
          />
        </div>

        <ScoreChart 
            scoreHistory1={gameState.scoreHistory1}
            scoreHistory2={gameState.scoreHistory2}
            currentPlayer={gameState.currentPlayer}
            playerColors={["#00FF00", "#1E90FF"]}
        />

        <GameControls 
          onUndo={undoMove} // Use undoMove from hook
          onReset={handleResetClick} // Use wrapper reset handler
          isUndoDisabled={isUndoDisabled} // Use calculated undo state
        />
      </div>
    </div>
  );
}

export default App;