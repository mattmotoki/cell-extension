/**
 * src/core/ai/index.ts
 * 
 * Public exports for the core AI module.
 */

// Export reducer and actions from the slice
export { default as aiReducer } from './aiSlice';
export * from './aiSlice'; // Export actions like setAIThinking

// Export AI engine functions (move calculation, evaluation)
export * from './engine';

// Export AI selectors
export * from './selectors';