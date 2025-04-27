import { configureStore } from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from '@core';

// This creates a mock store with the same structure as your real store
// but allows you to customize the state for testing purposes

export const createMockStore = (initialState: Partial<RootState> = {}) => {
  // Create a default state structure 
  const defaultState: Partial<RootState> = {
    game: {
      boardState: Array(5).fill(Array(5).fill(null)),
      moveHistory: [],
      currentPlayer: 0,
      scores: [0, 0],
      progress: 'playing',
    },
    settings: {
      boardSize: 5,
      playerMode: 'human',
      firstPlayer: 0,
      scoringMechanism: 'cell-extension',
      aiDifficulty: 'medium',
    }
  };

  // Merge the provided initialState with defaultState
  const preloadedState = {
    ...defaultState,
    ...initialState,
    // Deep merge game and settings if provided
    game: initialState.game ? { ...defaultState.game, ...initialState.game } : defaultState.game,
    settings: initialState.settings ? { ...defaultState.settings, ...initialState.settings } : defaultState.settings,
  };

  // Configure the mock store
  return configureStore({
    reducer: {
      game: (state = preloadedState.game, action) => {
        // This is a simplified mock reducer for testing
        // For action-specific tests, you would need to add more logic here
        // or use the actual reducer
        return state;
      },
      settings: (state = preloadedState.settings, action) => {
        // Similar mock reducer for settings
        return state;
      }
    },
    preloadedState: preloadedState as any,
  });
};

// Helper type for inferring the store type
export type MockStore = ReturnType<typeof createMockStore>;
export type MockDispatch = MockStore['dispatch']; 