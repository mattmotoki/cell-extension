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
 * - Imports utils.ts for core game operations
 * - Coordinates with AI logic for AI move processing
 * - Referenced by UI components for rendering current state
 * 
 * Revision Log:
 *  
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
    ScoringMechanism
} from '../types';
import {
    createInitialBoardState,
    placeCell,
    calculateScore,
    isGameOver
} from './utils';

// Helper to create history entry
function createHistoryEntry(gameState: GameState): HistoryEntry {
    const deepCopiedBoardState: BoardState = {
        ...gameState.boardState,
        occupiedCells: [
            { ...gameState.boardState.occupiedCells[0] }, 
            { ...gameState.boardState.occupiedCells[1] }
        ]
    };
    return {
        boardState: deepCopiedBoardState,
        scores: [...gameState.scores],
        currentPlayer: gameState.currentPlayer,
        progress: gameState.progress, 
    };
}

const getInitialState = (settings: GameSettings): GameState => {
    const boardSizeNum = parseInt(settings.boardSize, 10);
    const validBoardSize = [4, 6, 10, 16].includes(boardSizeNum) ? boardSizeNum : 6;
    
    const initialBoardState = createInitialBoardState(validBoardSize, validBoardSize);
    const initialPlayer: PlayerIndex = settings.firstPlayer === 'human' ? 0 : 1;
    const initialScores: [number, number] = [0, 0];
    const initialProgress: GameProgress = 'pregame';

    const initialHistoryEntry: HistoryEntry = {
        boardState: initialBoardState,
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
        history: [initialHistoryEntry],
    };
};

// Default settings for initial state if none provided via RESET
const defaultSettings: GameSettings = {
  playerMode: 'ai',
  firstPlayer: 'human',
  scoringMechanism: 'cell-multiplication',
  aiDifficulty: 'medium',
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
            
            const playerMakingMove = state.currentPlayer;
            
            if (state.progress !== 'playing') { 
                console.warn(`Cannot place move: game progress is ${state.progress}`);
                return;
            }
            
            console.log(`Reducer: Placing move for player ${playerMakingMove} at (${gridX}, ${gridY})`);
            
            const newBoardState = placeCell(state.boardState, playerMakingMove, gridX, gridY);

            if (!newBoardState) {
                console.warn(`Reducer: Invalid move attempted at (${gridX}, ${gridY}) for player ${playerMakingMove}`);
                return; 
            }

            const historyEntry = createHistoryEntry(state);
            state.history.push(historyEntry);

            state.boardState = newBoardState;

            const score1 = calculateScore(state.boardState, 0, state.scoringMechanism);
            const score2 = calculateScore(state.boardState, 1, state.scoringMechanism);
            state.scores = [score1, score2];
            state.scoreHistory1.push(score1);
            state.scoreHistory2.push(score2);
            console.log(`Reducer: New scores: ${state.scores[0]} - ${state.scores[1]}`);

            state.currentPlayer = (playerMakingMove + 1) % 2 as PlayerIndex;

            const gameOver = isGameOver(state.boardState);
            state.progress = gameOver ? 'over' : 'playing';
            console.log(`Reducer: State after move: nextPlayer=${state.currentPlayer}, gameOver=${gameOver}, newProgress=${state.progress}`);
        },
        undoMove: (state) => {
            if (state.history.length <= 1) { 
                console.warn("Cannot undo: No moves in history.");
                return; 
            }

            const previousHistoryEntry = state.history.pop(); 
            
            if (previousHistoryEntry) {
                state.boardState = previousHistoryEntry.boardState;
                state.scores = previousHistoryEntry.scores;
                state.currentPlayer = previousHistoryEntry.currentPlayer;
                state.progress = previousHistoryEntry.progress; 
                
                state.scoreHistory1.pop();
                state.scoreHistory2.pop();

                 console.log(`Reducer: Undid move. Current player: ${state.currentPlayer}, Progress: ${state.progress}`);
            } else {
                 console.error("Undo failed: History was unexpectedly empty after length check.");
            }
        },
        resetGame: (state, action: PayloadAction<GameSettings>) => {
            const settings = action.payload;
            console.log("Reducer: Resetting game with settings:", settings);
            const newState = getInitialState(settings);
            return newState;
        },
        setProgress: (state, action: PayloadAction<GameProgress>) => {
            const newProgress = action.payload;
            if (state.progress !== 'over' || newProgress === 'over') {
                 console.log(`Reducer: Setting progress to ${newProgress}`);
                state.progress = newProgress;
            } else {
                console.warn(`Reducer: Progress update to ${newProgress} rejected - game is already over.`);
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