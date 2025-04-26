/**
 * src/core/game/gameSlice.ts - Redux Game State Management
 * 
 * Implements the Redux slice that manages the game's state using Redux Toolkit.
 * This is the central state management module for the game, handling all game
 * state transitions, move processing, history tracking, and score calculation.
 * 
 * Key responsibilities:
 * - Defining the game state structure and initial state
 * - Processing player and AI moves with validation
 * - Handling game state transitions (playing, waiting, over)
 * - Managing game history for undo functionality
 * - Calculating and updating scores based on moves
 * 
 * State structure:
 * - boardState: Current board configuration with occupied cells
 * - scores: Current scores for both players
 * - currentPlayer: Which player's turn it is (0 or 1)
 * - progress: Game state (playing, waiting, over)
 * - scoreHistory: History of scores for charting
 * - history: Stack of previous game states for undo
 * 
 * Relationships:
 * - Used by App.tsx to read game state and dispatch actions
 * - Imports GameBoardLogic.ts for core game operations
 * - Coordinates with aiLogic.ts for AI move processing
 * - Referenced by UI components for rendering current state
 * 
 * Revision Log:
 *  
 * Note: This revision log should be updated whenever this file is modified. 
 * Do not use dates in the revision log.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
    BoardState, 
    GameState, 
    PlayerIndex, 
    GameProgress, 
    HistoryEntry, 
    GameSettings, 
    Coordinates,
    ScoringMechanismId
} from '../types';
import {
    createInitialBoardState,
    placeCell,
    calculateScore,
    getAvailableCells,
    isGameOver
} from './GameBoardLogic';

// Helper to create history entry
function createHistoryEntry(gameState: GameState): HistoryEntry {
    return {
        boardState: JSON.parse(JSON.stringify(gameState.boardState)), // Deep copy
        scores: [...gameState.scores],
        currentPlayer: gameState.currentPlayer,
        progress: gameState.progress, 
    };
}

const getInitialState = (settings: GameSettings): GameState => {
    const boardSizeNum = parseInt(settings.boardSize, 10);
    const initialBoardState = createInitialBoardState(boardSizeNum, boardSizeNum);
    const initialPlayer = settings.firstPlayer === 'human' ? 0 : 1;
    const initialScores: [number, number] = [0, 0];
    const initialProgress: GameProgress = 'playing';

    const initialHistoryEntry: HistoryEntry = {
        boardState: JSON.parse(JSON.stringify(initialBoardState)),
        scores: [...initialScores],
        currentPlayer: initialPlayer,
        progress: initialProgress,
    };

    return {
        boardState: initialBoardState,
        scores: initialScores,
        currentPlayer: initialPlayer,
        progress: initialProgress,
        scoreHistory1: [initialScores[0]],
        scoreHistory2: [initialScores[1]],
        scoringMechanism: settings.scoringMechanism,
        history: [initialHistoryEntry], // Start history with the initial state
    };
};

// Default settings for initial state if none provided via RESET
const defaultSettings: GameSettings = {
  playerMode: 'ai',
  firstPlayer: 'human',
  scoringMechanism: 'cell-multiplication',
  aiDifficulty: 'easy',
  boardSize: '6',
};

const initialState: GameState = getInitialState(defaultSettings);

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        placeMove: (state, action: PayloadAction<{ coords: Coordinates, settings: GameSettings }>) => {
            const { coords, settings } = action.payload;
            const { gridX, gridY } = coords;
            
            // Determine player making the move based on progress (handle AI)
            const playerMakingMove = state.progress === 'waiting' ? 1 : state.currentPlayer;
            
            // Allow move if playing OR if waiting (AI is dispatching its calculated move)
            if (state.progress !== 'playing' && state.progress !== 'waiting') { 
                console.warn(`Cannot place move: game progress is ${state.progress}`);
                return; // Exit reducer if move is not allowed
            }
            
            console.log(`Reducer: Placing move for player ${playerMakingMove} at (${gridX}, ${gridY}) (Progress: ${state.progress})`);
            
            const newBoardState = placeCell(state.boardState, playerMakingMove, gridX, gridY);

            if (!newBoardState) {
                console.warn(`Reducer: Invalid move attempted at (${gridX}, ${gridY}) for player ${playerMakingMove}`);
                // If AI move failed validation, reset progress to playing
                if (state.progress === 'waiting') {
                    state.progress = 'playing';
                }
                return; // Exit reducer on invalid move
            }

            // --- Valid Move --- 
            // Save current state to history before updating
            const historyEntry = createHistoryEntry(state);
            state.history.push(historyEntry);

            // Update board state
            state.boardState = newBoardState;

            // Calculate and update scores
            const score1 = calculateScore(state.boardState, 0, state.scoringMechanism);
            const score2 = calculateScore(state.boardState, 1, state.scoringMechanism);
            state.scores = [score1, score2];
            state.scoreHistory1.push(score1);
            state.scoreHistory2.push(score2);
            console.log(`Reducer: New scores: ${state.scores[0]} - ${state.scores[1]}`);

            // Update current player
            state.currentPlayer = (playerMakingMove + 1) % 2 as PlayerIndex;

            // Update game progress
            const gameOver = isGameOver(state.boardState);
            state.progress = gameOver ? 'over' : 'playing';
            console.log(`Reducer: State after move: nextPlayer=${state.currentPlayer}, gameOver=${gameOver}, newProgress=${state.progress}`);
        },
        undoMove: (state) => {
            if (state.history.length === 0) return; // Cannot undo initial state (or empty history)

            const previousHistoryEntry = state.history.pop(); // Remove last entry
            
            if (previousHistoryEntry) {
                // Restore state from the popped history entry
                state.boardState = previousHistoryEntry.boardState; // Already deep copied
                state.scores = previousHistoryEntry.scores;
                state.currentPlayer = previousHistoryEntry.currentPlayer;
                state.progress = previousHistoryEntry.progress; // Restore progress
                
                // Recalculate score histories (simpler than storing in history)
                state.scoreHistory1 = [0]; 
                state.scoreHistory2 = [0];
                state.history.forEach(entry => {
                    state.scoreHistory1.push(entry.scores[0]);
                    state.scoreHistory2.push(entry.scores[1]);
                });
                // Add score from the restored state
                 state.scoreHistory1.push(state.scores[0]); 
                 state.scoreHistory2.push(state.scores[1]);
            } else {
                 console.warn("Undo called with empty history?");
            }
        },
        resetGame: (state, action: PayloadAction<GameSettings>) => {
            const settings = action.payload;
            // Use getInitialState to derive the new state based on settings
            const newState = getInitialState(settings);
            // Return the new state object entirely here
            return newState;
        },
        setProgress: (state, action: PayloadAction<GameProgress>) => {
            const newProgress = action.payload;
            // Prevent setting progress if game is over
            if (state.progress !== 'over') {
                state.progress = newProgress;
            } else {
                console.log(`DEBUG: Progress update rejected - game is already over`);
            }
        },
    }
});

export const {
    placeMove,
    undoMove,
    resetGame,
    setProgress
} = gameSlice.actions;

export default gameSlice.reducer; 