/**
 * src/core/game/index.ts
 * 
 * Public exports for the core game module.
 */

// Export actions and reducer from the slice
export { default as gameReducer } from './gameSlice';
export * from './gameSlice'; // Export actions like placeMove, undoMove, etc.

// Export selectors
export * from './selectors';

// Export utility functions
export * from './utils';