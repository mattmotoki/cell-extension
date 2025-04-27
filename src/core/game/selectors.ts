/**
 * src/core/game/selectors.ts
 * 
 * Selectors for accessing the game state slice.
 */
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../rootReducer'; // Adjust path as necessary
import { GameState } from '../types';

// Select the game slice from the root state
const selectGameSlice = (state: RootState) => state.game;

// Selectors for specific game state properties
export const selectBoardState = createSelector(
    [selectGameSlice],
    (gameState: GameState) => gameState.boardState
);

export const selectScores = createSelector(
    [selectGameSlice],
    (gameState: GameState) => gameState.scores
);

export const selectCurrentPlayer = createSelector(
    [selectGameSlice],
    (gameState: GameState) => gameState.currentPlayer
);

export const selectGameProgress = createSelector(
    [selectGameSlice],
    (gameState: GameState) => gameState.progress
);

export const selectScoreHistory1 = createSelector(
    [selectGameSlice],
    (gameState: GameState) => gameState.scoreHistory1
);

export const selectScoreHistory2 = createSelector(
    [selectGameSlice],
    (gameState: GameState) => gameState.scoreHistory2
);

export const selectGameHistory = createSelector(
    [selectGameSlice],
    (gameState: GameState) => gameState.history
);

export const selectIsGameOver = createSelector(
    [selectGameProgress],
    (progress) => progress === 'over'
);

export const selectCanUndo = createSelector(
    [selectGameHistory, selectGameProgress],
    (history, progress) => history.length > 1 && (progress === 'playing' || progress === 'over')
);

// Add more selectors as needed 