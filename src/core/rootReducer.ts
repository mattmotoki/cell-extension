/**
 * src/core/rootReducer.ts
 * 
 * Combines all core reducers into the root reducer.
 */
import { combineReducers } from '@reduxjs/toolkit';
import gameReducer from './game/gameSlice';
import settingsReducer from './settingsSlice';
import aiReducer from './ai/aiSlice'; // Import AI reducer
import scoringReducer from './scoring/scoringSlice'; // Import Scoring reducer

const rootReducer = combineReducers({
  game: gameReducer,
  settings: settingsReducer,
  ai: aiReducer, // Add AI reducer to the root
  scoring: scoringReducer, // Add Scoring reducer to the root (even if empty for now)
});

// Export the RootState type derived from the rootReducer
export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer; 