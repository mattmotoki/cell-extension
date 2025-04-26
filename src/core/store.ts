/**
 * src/core/store.ts - Redux Store Configuration
 * 
 * Configures and exports the central Redux store using Redux Toolkit.
 * Combines game and settings reducers into the main application state.
 */

import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './game/gameSlice'; // Assuming gameSlice is in core/game/
import settingsReducer from './settingsSlice'; // Import settings reducer

export const store = configureStore({
    reducer: {
        game: gameReducer,
        settings: settingsReducer, // Add settings reducer
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 