/**
 * src/core/scoring/index.ts
 * 
 * Public exports for the core scoring module.
 */

// Export the scoring algorithm functions
export * from './algorithms';

// Export reducer and actions if the slice manages state
export { default as scoringReducer } from './scoringSlice';
export * from './scoringSlice'; // Export actions if any

// Export selectors if the slice manages state
export * from './selectors'; // Export selectors if any